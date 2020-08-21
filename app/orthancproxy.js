/* orthancproxy.js */
require('dotenv').config();
const fs = require('fs');
const util = require("util");
const path = require('path');
const url = require('url');
const request = require('request-promise');
const exec = require('child_process').exec;
const express = require('express');
const app = express();

const ORTHANC_URL = 'http://' + process.env.ORTHANC_DOMAIN + ':' + process.env.ORTHANC_REST_PORT;
const userpass = process.env.ORTHANC_USER + ':' + process.env.ORTHANC_PASSWORD;
const currentDir = __dirname;
const parentDir = path.normalize(currentDir + '/..');
const usrPreviewDir = parentDir + process.env.USRPREVIEW_DIR;
const usrArchiveDir = parentDir + process.env.USRARCHIVE_DIR;

const proxyRequest = function(rqParam) {
	return new Promise(function(resolve, reject) {
		console.log('rqParam=>', rqParam);
		let orthacUrlReq = ORTHANC_URL + rqParam.uri;
		console.log('orthacUrlReq=>', orthacUrlReq);
		let rqBody = JSON.stringify(rqParam.body);
		//let rqBody = rqParam.body;
		console.log('rqBody=>', rqBody);
		request({
			/* json: true, */
			method: rqParam.method,
			url: orthacUrlReq,
			auth: {user: process.env.ORTHANC_USER, pass: process.env.ORTHANC_PASSWORD },
			headers: {
				'Content-Type': 'application/json',
				/* 'Authorization': 'Bearer Y9OoNebK+kdDnb3vHQE/jUkKHbelE23So7HZ3PacUwb4YzwJZi+0iriPjj7lRw5hYR6B8y65kqgsZS2143lHC7CTlUY7fZZfXMgAfqf5DdDlivD49f42embGQaM/pv68YH6Aq3L7lzaTjC3HdqNWaAdB04t89/1O/w1cDnyilFU=' */
			},
			body: rqBody
		}, (err, res, body) => {
			if (!err) {			
				resolve({status: {code: 200}, res: res});								
			} else {
				console.log(JSON.stringify(err));
				reject({status: {code: 500}, err: err});	
			}
		});
	});
}

const runcommand = function (command) {
	return new Promise(function(resolve, reject) {
		logger().info(new Date()  + " Command " + command);
		exec(command, (error, stdout, stderr) => {
			if(error === null) {
				logger().info(new Date()  + " Resolve " + `${stdout}`);
				resolve(`${stdout}`);
			} else {
				logger().error(new Date()  + " Reject " + `${stderr}`);
				reject(`${stderr}`);
			}
        });
	});
}

const parseStr = function (str) {
  var args = [].slice.call(arguments, 1);
  var i = 0;
  return str.replace(/%s/g, () => args[i++]);
}

const doLoadArchive = function(studyID, rootname){
	return new Promise(function(resolve, reject) {
		var archiveFileName = studyID + '.zip';
		var command = 'curl --user ' + userpass + '  ' + ORTHANC_URL + '/studies/' + studyID + '/archive > ' + usrArchiveDir + '/' + archiveFileName;
		console.log('curl command >>', command);
		runcommand(command).then((stdout) => {
			let link = '/' + rootname + process.env.USRARCHIVE_PATH + '/' + archiveFileName;
			resolve({link: link});		
		});
	});
}

const doTransferArchive = function(studyID) {
	return new Promise(function(resolve, reject) {
		let archiveFilename = studyID + '.zip';
		let archiveSrc = usrArchiveDir + '/' + archiveFilename;
		var command = 'curl --list-only --user radconnext:A4AYitoDUB -T ' + archiveSrc + ' ftp://119.59.125.63/domains/radconnext.com/private_html/rad_test/inc_files/';
		console.log('curl command >>', command);
		runcommand(command).then((stdout) => {
			let link = 'https://radconnext.com/rad_test/inc_files/' + archiveFilename;
			resolve({link: link});		
		});
	});
}

const logger = require('./logger');

app.get('/luatest', function(req, res) {
	console.log('get luatest req.query>> ', req.query)
	logger().info(new Date()  + " GET /luatest " + JSON.stringify(req.query));
	res.status(200).send(req.query);		
});

app.post('/luetest', function(req, res) {
	console.log('post luatest req.body>> ', req.body)
	logger().info(new Date()  + " POST /luatest " + JSON.stringify(req.body));
	res.status(200).send(req.body);		
});

app.post('/find', function(req, res) {
	/*
	let rqParam = {method: req.body.mothod, uri: req.body.uri, body: req.body.body};
	proxyRequest(rqParam).then((response) => {
		logger().info(new Date()  + " > " + rqParam + " > " + JSON.stringify(response));
		res.status(200).send(response);		
	}).catch((err) => {
		logger().error(new Date()  + " > " + rqParam + " > " + JSON.stringify(err));
		res.status(500).send(err);		
	})*/
	//let rqBody = JSON.stringify(req.body.body);
	let rqBody = req.body.body;
	//console.log('rqBody >>', rqBody);

	// console.log('userpass >>', userpass);
	var command = 'curl -X POST --user ' + userpass + ' -H "Content-Type: application/json" ' + ORTHANC_URL + req.body.uri + ' -d \'' + rqBody + '\'';
	console.log('curl command >>', command);

	runcommand(command).then((stdout) => {
		/*
		let studyObj = JSON.parse(stdout);
		let mainTags = Object.keys(studyObj.MainDicomTags);
		let patientMainTags = Object.keys(studyObj.PatientMainDicomTags);
		*/
		let studyObj = JSON.parse(stdout);
		//console.log('studyObj >>', studyObj);
		res.status(200).send(studyObj);		
	});
});

app.get('/preview/(:instanceID)', function(req, res) {
	const rootname = req.originalUrl.split('/')[1];	
	var instanceID = req.params.instanceID;
	var previewFileName = instanceID + '.png';
	var command = 'curl --user ' + userpass + '  ' + ORTHANC_URL + '/instances/' + instanceID + '/preview > ' + usrPreviewDir + '/' + previewFileName;
	console.log('curl command >>', command);
	runcommand(command).then((stdout) => {
		//res.redirect('/' + rootname + USRPREVIEW_PATH + '/' + previewFileName);
		let link = '/' + rootname + process.env.USRPREVIEW_PATH + '/' + previewFileName;
		res.status(200).send({preview: {link: link}});		
	});
});

app.get('/loadarchive/(:studyID)', function(req, res) {
	const rootname = req.originalUrl.split('/')[1];	
	var studyID = req.params.studyID;
	doLoadArchive(studyID).then((archive) => {
		res.status(200).send({archive: {link: archive.link}});
	});
});

app.get('/transferdicom/(:studyID)', function(req, res) {
	const rootname = req.originalUrl.split('/')[1];	
	var studyID = req.params.studyID;
	doLoadArchive(studyID, rootname).then((archive) => {
		if (archive.link) {
			doTransferArchive(studyID).then((response) => {
				res.status(200).send({local: {link: archive.link}, cloud: {link: response.link}});
			}).catch((error) => {
				res.status(500).send({error: {code: 502, detail: error}});
			});
		} else {
			res.status(500).send({error: {code: 501, detail: 'Dicom of studies ' + studyID * ' is empty.'}});
		}
	}).catch((error) => {
		res.status(500).send({error: {code: 503, detail: error}});
	});
});

module.exports = app;