const fs         = require('fs');
const path       = require('path');
const makeDir    = require('make-dir');
const fg         = require('fast-glob');
const { nanoid } = require('nanoid');

let Core = {};

Core.CSV_SEP = ",";
Core.DIR_PUBLIC = path.join(__dirname,"/../public/");

Core.conf = {};


Core.init = ()=>{

    Core.dirRecords = path.join(__dirname,"/../records/");

    let configpath = path.join(__dirname,"/../config.json");
    console.log(configpath);

	if (fs.existsSync(configpath)){
		Core.conf = JSON.parse( fs.readFileSync(configpath, 'utf8') );
		console.log("Found custom config " + configpath);

        if (Core.conf.recordsfolder) Core.dirRecords = Core.conf.recordsfolder;
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

Core.getFullPathCSV = (sesid, gid)=>{
    if (gid){
        let fname = gid+"/"+sesid+".csv";
        fname = path.join(Core.dirRecords, fname);
        return fname;
    }

    let fname = sesid+".csv";
    fname = path.join(Core.dirRecords, fname);
    return fname;
};

Core.requestNewSession = (o)=>{
    let res = {};

    let fields  = o.fields;
    if (!fields){
        
        return;
    }

    let sesid = Core.generateSessionID();
    console.log("New session ID: "+sesid);

    if (o.actor) sesid += "@"+o.actor;

    let groupid = o.groupid;
    let fname = Core.getFullPathCSV(sesid,groupid);

    if (groupid){
        let dirgroup = path.join(Core.dirRecords,groupid);
        if (!fs.existsSync(dirgroup)) makeDir.sync(dirgroup);

        res.groupid = groupid;
    }

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
    if (!o.id) return false;

    let data = o.data + "\n";
    if (!data) return false;

    let fname = Core.getFullPathCSV(o.id, o.groupid);
    if (!fs.existsSync(fname)) return false;

    fs.appendFile(fname, data, 'utf8', err => {
        if (err) throw err;
        
        console.log("Chunk added in CSV:"+fname);
    });

    return true;
};

module.exports = Core;