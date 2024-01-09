const Core = require('./core');

let API = {};

API.init = (app)=>{

// Request new session
app.post("/session/", (req, res) => {
	let r = Core.requestNewSession(req.body);
	res.send(r);
});

// Record chunk
app.put("/session/", (req, res) => {
	let r = Core.updateSession(req.body);

	res.send(r);
});

};

module.exports = API;