require('dotenv').config();
const os = require('os');
const fs = require('fs');
const path = require('path');
//const http = require('http');
const https = require('https');
const express = require('express');
const app = express();

const parentDir = path.normalize(__dirname + "/..");
const grandParentDir = path.normalize(__dirname + "/../..");

const serverPort = process.env.SERVER_PORT;
//const serverPort = process.argv[3] || process.env.SERVER_PORT || 8080;
//const serverPort = process.argv[3] || process.env.SERVER_PORT || 8443;

const privateKey = fs.readFileSync(__dirname + '/ssl-cert/server.pem', 'utf8');
const certificate = fs.readFileSync(__dirname + '/ssl-cert/server.crt', 'utf8');

const credentials = { key: privateKey, cert: certificate /* , passphrase: '' */ };

const serverIP = process.env.SERVER_IP;
//const serverIP = process.argv[2] || process.env.SERVER_IP || '0.0.0.0';
console.log(serverIP);
console.log(serverPort);

//const httpServer = http.createServer(app).listen(serverPort, serverIP);
const httpsServer = https.createServer(credentials, app).listen(serverPort, serverIP);

//const {webApp} = require('./app/webapp.js')(httpServer);
const {webApp} = require('./app/webapp.js')(httpsServer);
app.use('/webapp', webApp);
webApp.use('/', express.static(__dirname + '/public'));

/*
Problem resolve
Error: listen EACCES: permission denied 0.0.0.0:443

Foremost, do not run as root. That's asking for 'it'. Don't run your node web project as root.

Instead, use PM2 and authbind to do this:

// %user% is whatever user is running your code
sudo touch /etc/authbind/byport/443
sudo chown %user% /etc/authbind/byport/443
sudo chmod 755 /etc/authbind/byport/443
Next, add this alias to your ~/.bashrc or ~/.bash_profile:

alias pm2='authbind --deep pm2'
or
authbind node server.js
*/
