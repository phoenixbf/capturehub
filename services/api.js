const Core = require('./core');

const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI    = require("swagger-ui-express");

const swoptions = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "CaptureHub API"
		}
	},

	apis: [__filename],

	swaggerOptions: {
		tryItOutEnabled: false
		//supportedSubmitMethods: []
	}
};

let API = {};

API.BASE = "/api/";

API.init = (app)=>{

	/**
	 * @swagger
	 * /api/session:
	 *   post:
	 *     summary: Request a new session
	 *     description: Request a new session, providing attributes (fields) and optional group
	 *     requestBody:
	 *       description: fields in the form of strings array, and an optional group ID
	 *       content:
	 *         application/json:
	 *           example:
	 *             fields: ["x","y","z"]
	 *             groupid: "experiment01"
	*/
	app.post(API.BASE+"session/", (req, res) => {
		let r = Core.requestNewSession(req.body);
		res.send(r);
	});

	/**
	 * @swagger
	 * /api/session:
	 *   put:
	 *     summary: Update existing session
	 *     description: Append new data chunk to an existing session
	 *     requestBody:
	 *       description: request body contains session ID and data in the form of comma-separated values and newlines for multiple rows.
	 *       content:
	 *         application/json:
	 *           example:
	 *             id: "mysessionid"
	 *             data: "100,23,7\n70,25,9"
	*/
	app.put(API.BASE+"session/", (req, res) => {
		let r = Core.updateSession(req.body);

		res.send(r);
	});

	/**
	 * @swagger
	 * /api/sessions/{ID}:
	 *   get:
	 *     summary: Retrieve a session
	 *     description: get CSV file providing session ID and optional groupid, in the form sessionid@groupid
	 *     responses:
	 *       '200':
	 *         description: Successful operation
	*/
	app.get(API.BASE+"sessions/:id", (req, res) => {
		let sesid = req.params.id;

		sesid = sesid.split("@");

		let fpath = Core.getFullPathCSV(sesid[0], sesid[1]);
		res.sendFile(fpath);
	});

	// API docs endpoint
	const swaggerSpec = swaggerJSDoc(swoptions);
	app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
};

module.exports = API;