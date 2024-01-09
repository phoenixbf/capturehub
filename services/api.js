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
	 *     description: xxx.
	*/
	app.post(API.BASE+"session/", (req, res) => {
		let r = Core.requestNewSession(req.body);
		res.send(r);
	});

	// Record chunk
	app.put(API.BASE+"session/", (req, res) => {
		let r = Core.updateSession(req.body);

		res.send(r);
	});

	const swaggerSpec = swaggerJSDoc(swoptions);
	app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));
};

module.exports = API;