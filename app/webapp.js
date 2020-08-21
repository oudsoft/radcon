require('dotenv').config();
const os = require('os');
const fs = require('fs');
const path = require("path");
const express = require('express');
const bodyParser = require('body-parser');
const serveIndex = require('serve-index');
const webApp = express();

webApp.use(express.json({limit: '50mb'}));
webApp.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
//webApp.use(bodyParser.json({ limit: "50MB", type:'application/json'}));
//webApp.use(express.urlencoded({limit: '50mb'}));

const bushPath = '/mnt/e/Final Release/Revise';

const geegee = require('./geegee.js');
const apiproxy = require('./apiproxy.js');
const orthancproxy = require('./orthancproxy.js');
const bushIndex = serveIndex(bushPath);

const uploader = require('./uploader.js')(webApp);
const notificator = require('./notification.js')(webApp);

webApp.use('/geegee', geegee);
webApp.use('/apiproxy', apiproxy);
webApp.use('/orthancproxy', orthancproxy);
webApp.use('/bush', bushIndex);

webApp.get('/', (req, res) => {
	const hostname = req.headers.host;
	const rootname = req.originalUrl.split('/')[1];
	let url = '/' + rootname + '/index.html';
	res.redirect(url);
});

webApp.get('/bush/(:collection)/(:allabum)/(:filename)', (req, res) => {
	const hostname = req.headers.host;
	const rootname = req.originalUrl.split('/')[1];
	//console.log(req.originalUrl);
	//console.log(req.params.collection);
	res.status(200).sendFile(bushPath + '/' + req.params.collection + '/' + req.params.allabum + '/' + req.params.filename);
});

module.exports = ( /* httpsServer*/ httpServer ) => {
	const uploader = require('./uploader.js')(webApp);
	return {webApp};
}
