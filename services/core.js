const fs      = require('fs');
const path    = require('path');
const makeDir = require('make-dir');
const fg      = require('fast-glob');
const nanoid  = require('nanoid');

let Core = {};

Core.init = ()=>{
    
    let configpath = path.join(__dirname,"config.json");
    console.log(configpath);
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

Core.requestNewSession = (data)=>{

};

module.exports = Core;