#!/usr/bin/env node
var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');

// This line is from the Node.js HTTPS documentation.
var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

// Create a service (the app object is just a callback).
var app = express();

app.use(express.static(__dirname));
// Create an HTTP service.
http.createServer(app).listen(8000);
// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(4443);
