const fs         = require('fs');
const path       = require('path');
const makeDir    = require('make-dir');
const fg         = require('fast-glob');
const { nanoid } = require('nanoid');

let Core = {};

Core.CSV_SEP = ",";
Core.conf = {};


Core.init = ()=>{

    Core.dirRecords = path.join(__dirname,"/../records/");

    let configpath = path.join(__dirname,"/../config.json");
    console.log(configpath);

	if (fs.existsSync(configpath)){
		Core.conf = JSON.parse( fs.readFileSync(configpath, 'utf8') );
		console.log("Found custom config " + configpath);

        if (Core.conf && Core.conf.recordsfolder) Core.dirRecords = Core.conf.recordsfolder;
    }

    if (!fs.existsSync(Core.dirRecords)) makeDir.sync(Core.dirRecords);
};

Core.generateYMD = ()=>{
    let today = new Date();
    let dd   = String( today.getDate() );
    let mm   = String( today.getMonth()+1 ); 
    let yyyy = String( today.getFullYear() );
    if(dd<10) dd = '0'+dd;
    if(mm<10) mm = '0'+mm;

    return yyyy+"-"+mm+"-"+dd;
};

Core.generateSessionID = ()=>{
    let sesid = nanoid(10);
    sesid = Core.generateYMD() + "_" + sesid;
    
    return sesid;
};

Core.requestNewSession = (o)=>{
    let res = {};

    let fields  = o.fields;
    if (!fields){
        
        return;
    }

    let sesid = Core.generateSessionID();
    console.log("New session ID: "+sesid);

    let fname = "";

    let groupid = o.groupid;
    if (groupid){
        let dirgroup = path.join(Core.dirRecords,groupid);
        if (!fs.existsSync(dirgroup)) makeDir.sync(dirgroup);

        fname = groupid+"/"+sesid+".csv";
        res.groupid = groupid;
    }
    else {
        fname = sesid+".csv";
    }

    fname = path.join(Core.dirRecords, fname);
    console.log(fname)

    if (fs.existsSync(fname)){
        return;
    }

    let strhead = fields.join(Core.CSV_SEP) + "\n";

    fs.writeFile(fname, strhead, 'utf8', err => {
        if (err) throw err;
        
        console.log("CSV created: "+fname);
    });

    res.id = sesid;
    return res;
};

Core.updateSession = (o)=>{
    if (!o.id) return;

    let data = o.data;
};

module.exports = Core;