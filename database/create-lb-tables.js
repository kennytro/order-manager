'use strict';
const server = require('../server/server.js');
const ds = server.dataSources.OrderManager;
//const lbTables = ['User', 'AccessToken', 'ACL', 'RoleMapping', 'Role'];
const lbTables = ['EndUser'];
ds.automigrate(lbTables, function(er) {
  if (er) throw er;
  console.log('Loopback tables [' + lbTables + '] created in ', ds.adapter.name);
  ds.disconnect();
});

