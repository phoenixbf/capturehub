const Core = require('./core');

const fs = require('fs');
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUI    = require("swagger-ui-express");
const { SwaggerTheme } = require('swagger-themes');

/*
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
*/
const theme = new SwaggerTheme();


const swoptions = {
	definition: require("./openapi.json"),
	supportedSubmitMethods: [],
	apis: [__filename]
};

const opts = {
	swaggerOptions: {
		//tryItOutEnabled: true
		supportedSubmitMethods: []
	},

	//explorer: true,
	//customCss: theme.getBuffer('dark')
	//customCssUrl: "./public/hub.css"
};


let API = {};

API.BASE = "/api/";

API.init = (app)=>{

	app.post(API.BASE+"session/", (req, res) => {
		let r = Core.requestNewSession(req.body);
		res.send(r);
	});

	app.put(API.BASE+"session/", (req, res) => {
		let r = Core.updateSession(req.body);

		res.send(r);
	});

	app.get(API.BASE+"sessions/:id", (req, res) => {
		let sesid = req.params.id;
		let format  = req.query.f;

		let fpath = Core.getFullPathCSV(sesid);

		if (!fs.existsSync(fpath)){
			res.send(false);
			return;
		}

		if (format === "ascii"){
			let str = fs.readFileSync(fpath, 'utf8');
			res.send(str);
			return;
		}

		if (format === "json"){
			let str = fs.readFileSync(fpath, 'utf8');
			//str = str.split("\n");
			//res.send(str);
			let json = Core.convertCSVtoJSON(str);
			res.send(json);
			return;
		}
		
		res.sendFile(fpath);
	});

	app.get(API.BASE+"sessions/:gid/:id", (req, res) => {
		let sesid = req.params.id;
		let gid   = req.params.gid;

		let fpath = Core.getFullPathCSV(sesid, gid);

		if (!fs.existsSync(fpath)) res.send(false);
		else res.sendFile(fpath);
	});

	// API docs endpoint
	const swaggerSpec = swaggerJSDoc(swoptions);
	app.use(
		"/api-docs", 
		swaggerUI.serve, 
		swaggerUI.setup(swaggerSpec, opts )
	);
/*
	app.use('*.css', (req, res, next) => {
		res.set('Content-Type', 'text/css');
		next();
	});
*/
};

module.exports = API;