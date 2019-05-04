'use strict';
const _ = require('lodash');
const appRoot = require('app-root-path');
const moment = require('moment');
const PdfPrinter = require('pdfmake');
const app = require(appRoot + '/server/server');

// PDF standard fonts
const PDF_FONTS = {
  Courier: {
    normal: 'Courier',
    bold: 'Courier-Bold',
    italics: 'Courier-Oblique',
    bolditalics: 'Courier-BoldOblique'
  },
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  },
  Times: {
    normal: 'Times-Roman',
    bold: 'Times-Bold',
    italics: 'Times-Italic',
    bolditalics: 'Times-BoldItalic'
  },
  Symbol: {
    normal: 'Symbol'
  },
  ZapfDingbats: {
    normal: 'ZapfDingbats'
  }
};

/*
 * @param {Object} - JSON object of company information.
 * @param {string} - base64 encoded string of company logo imaage
 * @param {Object} - document information
 * @param {Object} - Client instance
 * @returns {Object} - PDF document definition.
 */
function getPdfDocDefinitionTemplate(companyInfo, logoImg, docInfo, client) {
  let docDefinition = {
    footer: function(curPage, pageCount) {
      return [{
        columns: [
          { width: '*', text: '' },
          {
            width: 'auto',
            text: 'Page ' + curPage + ' of ' + pageCount,
            style: 'courier'
          },
          { width: '*', text: '' }
        ]
      }];
    },
    content: [],
    styles: {
      courier: {
        font: 'Courier'
      },
      times: {
        font: 'Times'
      },
      header: {
        font: 'Helvetica',
        fontSize: 15,
        bold: true
      },
      title: {
        fontSize: 20,
        bold: true
      },
      tableHeader: {
        bold: true,
        fontSize: 10,
        fillColor: '#008AE6',
        color: 'white'
      },
      innerTableHeader: {
        bold: true,
        fillColor: '#008AE6',
        color: 'white'
      }
    },
    defaultStyle: {
      font: 'Helvetica',
      fontSize: 8
    }
  };

  // add title elements
  docDefinition.content.push({
    columns: [
      logoImg ? { width: 50, image: logoImg } : 'Company Logo Image Here',
      {
        width: '*',
        text: _.get(companyInfo, 'name', 'Company Name Here'),
        margin: [10, 10, 0, 0],
        style: 'header'
      },
      { width: 'auto', text: docInfo.title.toUpperCase(), style: 'title' }
    ]
  });

  // add company info
  let companyInfoTable = {
    table: {
      widths: ['*', 80, 60],
      body: [
        [_.get(companyInfo, 'addressStreet', 'Street Address Here'),
         { text: 'Date', bold: true, alignment: 'right' }, docInfo.date],
        [_.get(companyInfo, 'addressCity', 'City Here') + ', ' + _.get(companyInfo, 'addressState', 'State Here') + ' ' + _.get(companyInfo, 'addressZip', 'Zip Here'),
         { text: _.capitalize(docInfo.title) + ' #', bold: true, alignment: 'right' }, docInfo.number]
      ]
    },
    layout: 'noBorders'
  };
  // last row depends on 'client' argument
  if (client) {
    companyInfoTable.table.body.push([_.get(companyInfo, 'phone', '') + '\t' + _.get(companyInfo, 'email', ''),
        { text: 'Customer ID', bold: true, alignment: 'right' }, client.id]);
  } else {
    companyInfoTable.table.body.push([_.get(companyInfo, 'phone', '') + '\t' + _.get(companyInfo, 'email', ''), '', '']);
  }

  docDefinition.content.push(companyInfoTable);
  // add client info
  if (client) {
    docDefinition.content.push({
      table: {
        widths: ['auto', '*'],
        body: [
          [{ text: 'Bill To:', bold: true, alignment: 'right', color: 'gray' }, client.name],
          ['', _.get(client, 'addressStreet', 'Client Street Address Here')],
          ['', _.get(client, 'addressCity', 'Client City Here') + ', ' + _.get(client, 'addressState', 'Client State Here') + ' ' + _.get(client, 'addressZip', 'Client Zip Here')],
          ['', _.get(client, 'phone', 'Client Phone Here')]
        ]
      },
      layout: 'noBorders',
      margin: 10
    });
  } else {
    docDefinition.content.push('\n');  // for spacing
  }
  return docDefinition;
}

/*
 * @param {string} - amount
 * @returns {string} - formatted for currency
 */
function formatCurrency(amountStr) {
  let amount = Number(amountStr);
  let p = amount.toFixed(2).split('.');
  return '$' + p[0].split('').reverse().reduce(function(acc, amount, i, orig) {
    return  amount === '-' ? acc : amount + (i && !(i % 3) ? ',' : '') + acc;
  }, '') + '.' + p[1];
};

module.exports = {
  /*
   * @param {Object} - Statement instance
   * @param {Object} - Client instance
   * @param {Object[]} - array of Orders.
   * @returns {Object} - PDF document
   */
  makeStatementPdf: async function(statement, client, orders) {
    const companyInfo = await app.models.CompanyInfo.getCompanyInfo();
    const companyLogo = await app.models.CompanyInfo.getLogoImageBase64(companyInfo.logoUrl);
    let docDefinition = getPdfDocDefinitionTemplate(companyInfo, companyLogo, {
      title: 'statement',
      date: moment(statement.statementDate).format('MM/DD/YYYY'),
      number: statement.id
    }, client);

    // add account summary table
    const summaryTableHeader = [
      { text: 'DATE', style: 'tableHeader' },
      { text: 'ORDER #', style: 'tableHeader' },
      { text: 'NOTE', style: 'tableHeader' },
      { text: 'AMOUNT', style: 'tableHeader' }
    ];
    docDefinition.content.push({ text: 'Account Summary', bold: true });
    let summaryTable = {
      table: {
        widths: ['auto', 'auto', '*', 'auto'],
        headerRows: 1,
        body: [summaryTableHeader]
      },
      layout: {
        fillColor: function(rowIndex, node, columnIndex) {
          return (rowIndex % 2 === 1) ? '#DCDCDC' : null;
        }
      }
    };

    // add table rows
    summaryTable.table.body = summaryTable.table.body.concat(_.map(orders, order => {
      return [
        moment(order.createdAt).format('MM/DD/YYYY'),
        order.id,
        order.note,
        { text: formatCurrency(order.totalAmount), alignment: 'right' }
      ];
    }));

    // add statement total amount
    summaryTable.table.body.push([
      { colSpan: 3, fillColor: 'white', text: 'Current Balance', bold: true, alignment: 'right' },
      '', '',
      { text: formatCurrency(statement.totalAmount), fillColor: 'white', bold: true, alignment: 'right' }
    ]);

    docDefinition.content.push(summaryTable);

    // add statement note
    docDefinition.content.push({
      margin: [0, 20, 0, 0],
      table: {
        widths: ['auto', '*'],
        body: [[{ text: 'Note: ', bold: true }, statement.note]]
      },
      layout: 'noBorders'
    });

    // finally add account activity detail
    let detailTableHeader = [
      { text: 'DATE', style: 'tableHeader' },
      { text: 'ORDER #', style: 'tableHeader' },
      { text: 'ITEMS', style: 'tableHeader' },
      { text: 'FEE', style: 'tableHeader' },
      { text: 'TOTAL', style: 'tableHeader' }
    ];
    docDefinition.content.push({ text: 'Account Activity Detail', bold: true, pageBreak: 'before' });
    let detailTable = {
      table: {
        widths: ['auto', 'auto', '*', 'auto', 'auto'],
        headerRows: 1,
        body: [detailTableHeader]
      }
    };
    // add table rows. Each row(i.e. order) has nested table containing order items
    detailTable.table.body = detailTable.table.body.concat(_.map(orders, order => {
      order = order.toJSON();
      // build inner table first.
      let innerTable = {
        table: {
          widths: ['auto', '*', 'auto', 'auto'],
          headerRows: 1,
          body: [[
            { text: 'ITEM #', style: 'innerTableHeader' },
            { text: 'DESCRIPTION', style: 'innerTableHeader' },
            { text: 'QTY', style: 'innerTableHeader' },
            { text: 'SUBTOTAL', style: 'innerTableHeader' }
          ]]
        },
        layout: {
          fillColor: function(rowIndex, node, columnIndex) {
            return (rowIndex % 2 === 1) ? '#DCDCDC' : null;
          },
          hLineWidth: function(i, node) {
            return (i === 1 || i === node.table.body.length - 1) ? 1 : 0;
          },
          vLineWidth: function() { return 0; }
        }
      };
      innerTable.table.body = innerTable.table.body.concat(_.map(order.orderItem, oItem => {
        return [
          oItem.product.id,
          oItem.product.description,
          oItem.quantity,
          { text: formatCurrency(oItem.quantity * oItem.unitPrice), alignment: 'right' }
        ];
      }));
      // add order subtotal row
      innerTable.table.body.push([
        { colSpan: 3, fillColor: 'white', text: 'Order Subtotal', bold: true, alignment: 'right' },
        '', '',
        { text: formatCurrency(order.subtotal), fillColor: 'white', bold: true, alignment: 'right' }
      ]);

      // complete outer table row
      return [
        moment(order.createdAt).format('MM/DD/YYYY'),
        order.id,
        innerTable,
        { text: formatCurrency(order.fee), alignment: 'right' },
        { text: formatCurrency(order.totalAmount), alignment: 'right' }
      ];
    }));
    docDefinition.content.push(detailTable);

    // make PDF document
    const printer = new PdfPrinter(PDF_FONTS);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.end();
    return pdfDoc;
  },
  /*
   * @param {Object} - Order instance
   * @param {Object} - Client instance
   * @param {Object[]} - array of OrderItem.
   * @returns {stream} - PDF document stream
   */
  makeOrderInvoicePdf: async function(order, client, orderItems) {
    const companyInfo = await app.models.CompanyInfo.getCompanyInfo();
    const companyLogo = await app.models.CompanyInfo.getLogoImageBase64(companyInfo.logoUrl);
    let docDefinition = getPdfDocDefinitionTemplate(companyInfo, companyLogo, {
      title: 'invoice',
      date: moment(order.createdAt).format('MM/DD/YYYY'),
      number: order.id
    }, client);

    // add order item table
    const tableHeader = [
      { text: 'ITEM #', style: 'tableHeader' },
      { text: 'DESCRIPTION', style: 'tableHeader' },
      { text: 'UNIT COST', style: 'tableHeader' },
      { text: 'QTY', style: 'tableHeader' },
      { text: 'AMOUNT', style: 'tableHeader' }
    ];
    docDefinition.content.push({ text: 'Account Summary', bold: true });
    let itemTable = {
      table: {
        widths: ['auto', '*', 'auto', 'auto', 'auto'],
        headerRows: 1,
        body: [tableHeader]
      },
      layout: {
        fillColor: function(rowIndex, node, columnIndex) {
          return (rowIndex % 2 === 1) ? '#DCDCDC' : null;
        }
      }
    };
    // add table rows
    itemTable.table.body = itemTable.table.body.concat(_.map(orderItems, oItem => {
      oItem = oItem.toJSON();
      return [
        oItem.product.id,
        oItem.product.description,
        { text: formatCurrency(oItem.unitPrice), alignment: 'right' },
        oItem.quantity,
        { text: formatCurrency(oItem.quantity * oItem.unitPrice), alignment: 'right' }
      ];
    }));
    // add summary rows
    itemTable.table.body.push([
      { colSpan: 4, fillColor: 'white', text: 'Subtotal', bold: true, alignment: 'right' },
      '', '', '',
      { text: formatCurrency(order.subtotal), fillColor: 'white', bold: true, alignment: 'right' }
    ]);
    itemTable.table.body.push([
      { colSpan: 4, fillColor: 'white', text: 'Fee', bold: true, alignment: 'right' },
      '', '', '',
      { text: formatCurrency(order.fee), fillColor: 'white', bold: true, alignment: 'right' }
    ]);
    itemTable.table.body.push([
      { colSpan: 4, fillColor: 'white', text: 'Total', bold: true, alignment: 'right' },
      '', '', '',
      { text: formatCurrency(order.totalAmount), fillColor: 'white', bold: true, alignment: 'right' }
    ]);
    docDefinition.content.push(itemTable);

    // add order note
    docDefinition.content.push({
      margin: [0, 20, 0, 0],
      table: {
        widths: ['auto', '*'],
        body: [[{ text: 'Note: ', bold: true }, order.note]]
      },
      layout: 'noBorders'
    });

    // make PDF document
    const printer = new PdfPrinter(PDF_FONTS);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.end();
    return pdfDoc;
  },
  /*
   * @param {Object[]} productList  - Array of product with 'totalOrderCount' additional property
   * @returns {Buffer}              - PDF document.
  */
  makeInventoryList: async function(productList) {
    const companyInfo = await app.models.CompanyInfo.getCompanyInfo();
    const companyLogo = await app.models.CompanyInfo.getLogoImageBase64(companyInfo.logoUrl);
    let docDefinition = getPdfDocDefinitionTemplate(companyInfo, companyLogo, {
      title: 'Inventory List',
      date: moment().format('MM/DD/YYYY'),
      number: 'N/A'
    }, null);
    docDefinition.header = { text: 'Date - Time: ' + moment().format('MM/DD/YYYY - HH:mm:ss'), alignment: 'right' };

    // add product inventory table
    const invTableHeader = [
      { text: 'No.', style: 'tableHeader' },
      { text: 'ID', style: 'tableHeader' },
      { text: 'NAME', style: 'tableHeader' },
      { text: 'DESCRIPTION', style: 'tableHeader' },
      { text: 'ORDER QTY.', style: 'tableHeader' },
      { text: 'INVENTORY QTY.', style: 'tableHeader' }
    ];
    docDefinition.content.push({ text: 'Product Inventory List', bold: true });
    let invTable = {
      table: {
        widths: ['auto', 'auto', 'auto', '*', 'auto', 'auto'],
        headerRows: 1,
        body: [invTableHeader]
      },
      layout: {
        fillColor: function(rowIndex, node, columnIndex) {
          return (rowIndex % 2 === 1) ? '#DCDCDC' : null;
        }
      }
    };
    // add table rows
    invTable.table.body = invTable.table.body.concat(_.map(productList, function(product, index) {
      return [
        index + 1,
        product.id,
        product.name,
        product.description,
        product.totalOrderCount,
        product.inventoryCount
      ];
    }));
    docDefinition.content.push(invTable);

    // make PDF document
    const printer = new PdfPrinter(PDF_FONTS);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.end();
    return pdfDoc;
  },
  makePackageDistributionList: async function(distributionList) {
    const companyInfo = await app.models.CompanyInfo.getCompanyInfo();
    const companyLogo = await app.models.CompanyInfo.getLogoImageBase64(companyInfo.logoUrl);
    let docDefinition = getPdfDocDefinitionTemplate(companyInfo, companyLogo, {
      title: 'Distribution List',
      date: moment().format('MM/DD/YYYY'),
      number: 'N/A'
    }, null);
    docDefinition.header = { text: 'Date - Time: ' + moment().format('MM/DD/YYYY - HH:mm:ss'), alignment: 'right' };

    // first, group by route. Each route has its own table.
    // add product order table
    distributionList = _.sortBy(distributionList, ['deliveryRouteId', 'clientId', 'orderId', 'productId']);
    let groupByRoute = _.groupBy(distributionList, 'deliveryRouteId');
    const routes = _.keys(groupByRoute);
    _.each(routes, function(route, index) {
      docDefinition.content.push({ text: 'Delivery Route: ' + route, bold: true, pageBreak: (index > 0) ? 'before' : undefined });
      const distTableHeader = [
        { text: 'CLIENT', style: 'tableHeader' },
        { text: 'ORDER #', style: 'tableHeader' },
        { text: 'ID', style: 'tableHeader' },
        { text: 'NAME', style: 'tableHeader' },
        { text: 'DESCRIPTION', style: 'tableHeader' },
        { text: 'ORDER QTY.', style: 'tableHeader' }
      ];
      let distTable = {
        table: {
          widths: ['auto', 'auto', 'auto', 'auto', '*', 'auto'],
          headerRows: 1,
          body: [distTableHeader]
        }
      };
      let listByRoute = groupByRoute[route];
      const itemCountByRoute = listByRoute.length;
      // second, group by client.
      let groupByClient = _.groupBy(listByRoute, 'clientId');
      const clients = _.keys(groupByClient);
      _.each(clients, function(client) {
        let listByClient = groupByClient[client];
        const itemCountByClient = listByClient.length;
        let printClientId = true;
        // finally, group by order
        let groupByOrder = _.groupBy(listByClient, 'orderId');
        const orders = _.keys(groupByOrder);
        _.each(orders, function(order) {
          let listByOrder = groupByOrder[order];
          const itemCountByOrder = listByOrder.length;
          let printOrderId = true;
          // add table row
          _.each(listByOrder, function(item) {
            let tableRow = [];
            // handle columns that span multiple rows.
            if (printClientId) {
              tableRow.push({
                rowSpan: itemCountByClient,
                text: item.clientId + ' - ' + item.clientName
              });
              printClientId = false;
            } else {
              tableRow.push('');
            }
            if (printOrderId) {
              tableRow.push({
                rowSpan: itemCountByOrder,
                text: item.orderId
              });
              printOrderId = false;
            } else {
              tableRow.push('');
            }
            // add rest column values.
            tableRow.push(item.productId, item.productName, item.productDescription, item.productOrderCount);
            distTable.table.body.push(tableRow);
          });
        });
      });

      docDefinition.content.push(distTable);
    });
    // make PDF document
    const printer = new PdfPrinter(PDF_FONTS);
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.end();
    return pdfDoc;
  }
};
