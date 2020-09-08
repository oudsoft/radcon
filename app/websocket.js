/* websocket.js */
// https://www.npmjs.com/package/websocket

function RadconWebSocketServer (arg) {
	this.httpsServer = arg;
  const WebSocketServer = require('websocket').server;

  this.wsServer = new WebSocketServer({
    httpServer: this.httpsServer,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
  });

  function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
  }

  this.wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        console.log('Received Message: ' + message.utf8Data);
        connection.sendUTF(message.utf8Data);
      }
      else if (message.type === 'binary') {
        console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        connection.sendBytes(message.binaryData);
      }
    });
    connection.on('close', function(reasonCode, description) {
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
  });
}

function RadconWebSocketClient (url) {
  this.url = url;

  const WebSocketClient = require('websocket').client;

  this.client = new WebSocketClient();

  this.client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
  });

  this.client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
      console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
      console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        console.log("Received: '" + message.utf8Data + "'");
      }
    });

    function sendNumber() {
      if (connection.connected) {
        var number = Math.round(Math.random() * 0xFFFFFF);
        connection.sendUTF(number.toString());
        setTimeout(sendNumber, 100000);
      }
    }
    sendNumber();
  });

  this.client.connect(this.url, 'echo-protocol');
}

module.exports = (arg, url) => {
	const webSocketServer = new RadconWebSocketServer(arg);
  const webSocketClient = new RadconWebSocketClient(url);
	return { webSocketServer, webSocketClient };
}
