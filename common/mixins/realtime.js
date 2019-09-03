'use strict';

module.exports = function(Model, options) {
  Model.supoortRealTime = true;
  Model.socketNamespace = '/' + Model.modelName.toLowerCase();
  Model.emitEvent = function(socket, data) {
    if (socket) {
      socket.emit(Model.modelName.toLowerCase(), data);
    }
  };
};
