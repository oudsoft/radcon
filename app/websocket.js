/* websocket.js */

function RadconWebSocketServer (arg) {
	const $this = this;
	this.httpsServer = arg;
	const WebSocketServer = require('ws').Server;
	const wss = new WebSocketServer({server: this.httpsServer/*, path: '/' + roomname */});
	this.socket = wss;

	wss.on('connection', async function (ws, req) {
		console.log(ws._socket.remoteAddress);
		console.log(ws._socket._peername);
		console.log(req.connection.remoteAddress);
		console.log(`WS Conn Url : ${req.url} Connected.`);
		let fullReqPaths = req.url.split('?');
		let wssPath = fullReqPaths[0];
		console.log(wssPath);
		//wssPath = wssPath.substring(1);
		wssPath = wssPath.split('/');
		console.log(wssPath);
		ws.id = wssPath[2];
		ws.send(JSON.stringify({type: 'test', message: ws.id + ', You have Connected master websocket success.'}));

		ws.on('message', function (message) {
			var data;

			//accepting only JSON messages
			try {
				data = JSON.parse(message);
			} catch (e) {
				console.log("Invalid JSON");
				data = {};
			}

			console.log(data);
		});

		ws.isAlive = true;

		ws.on('pong', () => {
			console.log('On Pong');
			ws.isAlive = true;
		});

		ws.on('close', function(ws, req) {
			console.log(`WS Conn Url : ${req.url} Close.`);
		});

	});

	setInterval(() => {
		wss.clients.forEach((ws) => {
			if (!ws.isAlive) return ws.terminate();
			ws.isAlive = false;
			console.log('Start Ping');
			ws.ping(null, false, true);
		});
	}, 85000);

}

module.exports = ( arg ) => {
	const webSocketServer = new RadconWebSocketServer(arg);
	return webSocketServer;
}
