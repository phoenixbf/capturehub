const express = require('express');
const http    = require('http');

const API  = require('./api');
const Core = require('./core');



let PORT = 8070;

let app = express();

app.use(express.json({ limit: '50mb' }));


API.init( app );

http.createServer(app).listen(PORT, ()=>{
	console.log("CaptureHub up and running");

});