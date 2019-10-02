'use strict';
const expect = require('chai').expect;
const rewire = require('rewire');
const Order = rewire('./order.js');

let calculateFee = Order.__get__('calculateFee');
let explainFee = Order.__get__('explainFee');
let updateOrderItemPrice = Order.__get__('updateOrderItemPrice');
let updateOrderAmount = Order.__get__('updateOrderAmount');
describe('Order test', function() {
  describe('calculateFee', function() {
    let orderClient1 = { id: 1, feeType: 'Rate', feeValue: 4, feeSchedule: 'Order' };
    let orderClient2 = { id: 1, feeType: 'Fixed', feeValue: 10, feeSchedule: 'Order' };
    let statementClient = { id: 1, feeType: 'Rate', feeValue: 4, feeSchedule: 'Statement' };

    it('should not calculate fee', function() {
      expect(calculateFee(100, statementClient)).to.equal(0, 'expect 0 fee');
    });
    it('should calculate fee using rate', function() {
      expect(calculateFee(100, orderClient1)).to.equal(4, 'expect 4');
    });
    it('should calculate fixed fee', function() {
      expect(calculateFee(100, orderClient2)).to.equal(orderClient2.feeValue, 'expect 10');
    });
  });

  describe('explainFee', function() {
    let orderClient1 = { id: 1, feeType: 'Rate', feeValue: 4, feeSchedule: 'Order' };
    let orderClient2 = { id: 1, feeType: 'Fixed', feeValue: 10, feeSchedule: 'Order' };
    let statementClient = { id: 1, feeType: 'Rate', feeValue: 4, feeSchedule: 'Statement' };
    it('should return empty explanation', function() {
      // expect(explainFee(100, 4, statementClient)).to.equal(null);
      expect(explainFee(100, 4, statementClient)).to.null;
    });
    it('should explain rate fee', function() {
      expect(explainFee(100, 4, orderClient1)).to.equal(`$100.00 x ${orderClient1.feeValue}(%) = $4.00`, 'expect rate explanation');
    });
    it('should explain fixed fee', function() {
      expect(explainFee(100, 4, orderClient2)).to.equal('Fixed amount', 'expect rate explanation');
    });
  });

  describe('updateOrderItemPrice', function() {
    let testOrder, priceMap;
    before(function() {
      priceMap = new Map([[1, 10], [2, 20], [3, 30], [4, 40]]);
    });

    beforeEach(function() {
      testOrder = {
        clientId: 1,
        orderItem: [
          { productId: 1, quantity: 1, unitPrice: 10 },
          { productId: 2, quantity: 1, unitPrice: 20 }
        ],
        subtotal: 30,
        fee: 0.9,
        feeExplanation: '$30 x 3(%) = $0.9',
        totalAmount: 30.9
      };
    });
    it('should not update with no price change', function() {
      expect(updateOrderItemPrice(testOrder.orderItem, priceMap)).to.be.empty;
    });
    it('should update one price change', function() {
      testOrder.orderItem[0].unitPrice = 20;
      let result = updateOrderItemPrice(testOrder.orderItem, priceMap);
      expect(result.length).to.equal(1);
      expect(result[0].unitPrice).to.equal(10);
    });
    it('should update all price change', function() {
      testOrder.orderItem.forEach(oi => oi.unitPrice += 5);
      let result = updateOrderItemPrice(testOrder.orderItem, priceMap);
      expect(result.length).to.equal(testOrder.orderItem.length);
      result.forEach(function(oi) {
        expect(oi.unitPrice).to.equal(priceMap.get(oi.productId));
      });
    });
    it('should not update with non-existing product', function() {
      testOrder.orderItem.push({ productId: 0, quantity: 1, unitPrice: 5 });  // non-existing product
      expect(updateOrderItemPrice(testOrder.orderItem, priceMap)).to.be.empty;
    });
  });

  describe('updateOrderAmount', function() {
    let testOrder, clientMap;
    before(function() {
      clientMap = new Map([
        [1, { id: 1, feeType: 'Rate', feeValue: 3, feeSchedule: 'Order' }],
        [2, { id: 2, feeType: 'Fixed', feeValue: 100, feeSchedule: 'Order' }],
        [3, { id: 3, feeType: 'Rate', feeValue: 4, feeSchedule: 'Statement' }]
      ]);
    });

    beforeEach(function() {
      testOrder = {
        clientId: 1,
        orderItem: [
          { productId: 1, quantity: 1, unitPrice: 10 },
          { productId: 2, quantity: 1, unitPrice: 20 }
        ],
        subtotal: 30,
        fee: calculateFee(30, clientMap.get(1)),
        feeExplanation: '$30.00 x 3(%) = $0.90',
        totalAmount: 30.9
      };
    });
    it('should not update with no price change', function() {
      const oldSubtotal = testOrder.subtotal;
      const oldFee = testOrder.fee;
      const oldFeeExplanation = testOrder.feeExplanation;
      const oldTotalAmount = testOrder.totalAmount;
      updateOrderAmount(testOrder, testOrder.orderItem, clientMap.get(1));
      expect(testOrder.subtotal).to.equal(oldSubtotal);
      expect(testOrder.fee).to.equal(oldFee);
      expect(testOrder.feeExplanation).to.equal(oldFeeExplanation);
      expect(testOrder.totalAmount).to.equal(oldTotalAmount);
    });
    it('should update with price change', function() {
      const client = clientMap.get(testOrder.clientId);
      testOrder.orderItem[0].unitPrice = 20;
      const newSubtotal = 40;
      const newFee = calculateFee(40, client);
      const newFeeExplanation = explainFee(newSubtotal, newFee, client);
      const newTotalAmount = newSubtotal + newFee;
      updateOrderAmount(testOrder, testOrder.orderItem, client);
      expect(testOrder.subtotal).to.equal(newSubtotal);
      expect(testOrder.fee).to.equal(newFee);
      expect(testOrder.feeExplanation).to.equal(newFeeExplanation);
      expect(testOrder.totalAmount).to.equal(newTotalAmount);
    });

    it('should update with price change using fixed rate', function() {
      const client = clientMap.get(2);    // Fixed fee
      testOrder.orderItem[0].unitPrice = 20;
      const newSubtotal = 40;
      const newFee = calculateFee(40, client);
      const newFeeExplanation = explainFee(newSubtotal, newFee, client);
      const newTotalAmount = newSubtotal + newFee;
      updateOrderAmount(testOrder, testOrder.orderItem, client);
      expect(testOrder.subtotal).to.equal(newSubtotal);
      expect(testOrder.fee).to.equal(newFee);
      expect(testOrder.feeExplanation).to.equal(newFeeExplanation);
      expect(testOrder.totalAmount).to.equal(newTotalAmount);
    });
    it('should not update fee with statement fee schedule', function() {
      const client = clientMap.get(3);  // Statement schedule
      testOrder.orderItem[0].unitPrice = 20;
      const newSubtotal = 40;
      const oldFee = testOrder.fee;
      const oldFeeExplanation = testOrder.feeExplanation;
      const newTotalAmount = newSubtotal + oldFee;
      updateOrderAmount(testOrder, testOrder.orderItem, client);
      expect(testOrder.subtotal).to.equal(newSubtotal);
      expect(testOrder.fee).to.equal(oldFee);
      expect(testOrder.feeExplanation).to.equal(oldFeeExplanation);
      expect(testOrder.totalAmount).to.equal(newTotalAmount);
    });
  });
});
