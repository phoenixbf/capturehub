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
	 *     description: ...
	*/
	app.post(API.BASE+"session/", (req, res) => {
		let r = Core.requestNewSession(req.body);
		res.send(r);
	});

	/**
	 * @swagger
	 * /api/session:
	 *   put:
	 *     summary: Update existing session with new data chunk
	 *     description: ...
	*/
	app.put(API.BASE+"session/", (req, res) => {
		let r = Core.updateSession(req.body);

		res.send(r);
	});

	/**
	 * @swagger
	 * /api/session:
	 *   get:
	 *     summary: Retrieve session CSV given ID
	 *     description: ...
	*/
	app.get(API.BASE+"sessions/:id", (req, res) => {
		let sesid = req.params.id;

		sesid = sesid.split("@");

		let fpath = Core.getFullPathCSV(sesid[0], sesid[1]);
		res.sendFile(fpath);
	});

	const swaggerSpec = swaggerJSDoc(swoptions);
	app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
};

module.exports = API;