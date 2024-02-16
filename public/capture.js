let CaptureHub = {};
window.CaptureHub = CaptureHub;

CaptureHub.T_INT      = 400; //400;
CaptureHub.CHUNK_SIZE = 30

CaptureHub._addr = undefined;

CaptureHub.onFrame = undefined;

CaptureHub.init = ()=>{
/*
    let path = window.location.href.split('?')[0];
    var i = path.lastIndexOf('/');
    if (i !== -1) path = path.substring( 0, i+1 );
*/
    CaptureHub._addr = undefined;
    
    CaptureHub._id    = undefined;
    CaptureHub._gid   = undefined;
    CaptureHub._aname = undefined;
    
    CaptureHub._bFirstRow = true;
    CaptureHub._bSendingChunk = false;
    CaptureHub._bReqSes = false;
    
    CaptureHub._resetDataChunk();
    CaptureHub._bRec = true;
    
    CaptureHub._uf = undefined;
};

/**
 Set CaptureHub server
 @param {String} addr - address (IP or domain)
 */
CaptureHub.setHubServer = (addr)=>{
    CaptureHub._addr = addr;
    console.log("CaptureHub: " + CaptureHub._addr);
    
    return CaptureHub;
};

/**
Start recording using ticking
@param {Number} interval - Time interval (milliseconds)
*/
CaptureHub.start = (interval)=>{
    if (CaptureHub._uf) return CaptureHub;
    if (!CaptureHub._addr) return CaptureHub;

    let dt = interval? interval : CaptureHub.T_INT;

    CaptureHub._uf = window.setInterval(CaptureHub._tick, dt);
    return CaptureHub;
};


CaptureHub.requestNewSession = (fields)=>{
    let gid = CaptureHub._gid;
    //console.log(gid)

    CaptureHub._bReqSes = true;

    fetch(CaptureHub._addr+"api/session", {
        method: "POST",
        body: JSON.stringify({
            fields: fields,
            groupid: CaptureHub._gid,
            actor: CaptureHub._aname
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then((response) => response.json())
    .then((json) => {
        console.log(json)

        CaptureHub._id = json.id;
        CaptureHub._gid = json.groupid;

        CaptureHub._bReqSes = false;
    });

    return CaptureHub;
};

/**
Stop current session
*/
CaptureHub.stop = ()=>{
    CaptureHub._sendDataChunk();
    
    CaptureHub._bRec = false;
    CaptureHub._bFirstRow = true;
    CaptureHub._uf = undefined;

    console.log("STOP");
    return CaptureHub;
};

/**
Set onFrame routine
@param {Function} of - onFrame routine producing a state (object) each tick
@example
CaptureHub.setOnFrame(()=>{
    return {
        x: <my_sample_xvalue>,
        y: <my_sample_yvalue>
    }
});
*/
CaptureHub.setOnFrame = (of)=>{
    CaptureHub.onFrame = of;
    return CaptureHub;
};

/**
Set group ID
@param {String} gid - group ID (e.g.: "experiment1", "scene3")
*/
CaptureHub.setGroupID = (gid)=>{
    CaptureHub._gid = gid;
    return CaptureHub;
};

/**
Set actor name
@param {String} actor - friendly name for object we are currently tracking
*/
CaptureHub.setActorName = (aname)=>{
    CaptureHub._aname = aname;
    return CaptureHub;
};


CaptureHub._resetDataChunk = ()=>{
    CaptureHub._chunk  = [];
    CaptureHub._rcount = 0;
};

CaptureHub._sendDataChunk = ()=>{
    if (CaptureHub._bSendingChunk) return;

    CaptureHub._bSendingChunk = true;

    let sdata = CaptureHub._chunk.join("\n");

    fetch(CaptureHub._addr+"api/session", {
        method: "PUT",
        body: JSON.stringify({
            id: CaptureHub._id,
            groupid: CaptureHub._gid,
            data: sdata
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then((response) => response.json())
    .then((json) => {
        CaptureHub._resetDataChunk();
        CaptureHub._bSendingChunk = false;
        //console.log("Chunk sent: "+sdata);
        console.log("Datachunk sent");
    });
};

CaptureHub._tick = ()=>{
    if (!CaptureHub._bRec) return;
    if (!CaptureHub.onFrame) return;

    let S = CaptureHub.onFrame();

    CaptureHub.frame( S );
};

/**
Record a given frame. Should be used in event-driven scenarios (not using onFrame ticking)
@param {Object} S - State
@example
CaptureHub.frame({
    time: <myclock>, 
    x: <my_sample_xvalue>, 
    y: <my_sample_yvalue>
});
*/
CaptureHub.frame = (S)=>{
    if (!S) return CaptureHub;
    if (!CaptureHub._addr) return CaptureHub;
    if (CaptureHub._bReqSes) return CaptureHub;

    if (CaptureHub._bFirstRow){
        let fields = [];
        for (let a in S) fields.push(a);

        CaptureHub.requestNewSession(fields);
        CaptureHub._bFirstRow = false;
        return CaptureHub;
    }

    if (!CaptureHub._id){
        CaptureHub._bFirstRow = true;
        console.log("ERROR: no valid session ID");
        return CaptureHub;
    }

    let row = [];
    for (let a in S) row.push(S[a]);

    let srow = row.join(",");

    CaptureHub._chunk.push(srow);
    CaptureHub._rcount++;

    if (CaptureHub._rcount >= CaptureHub.CHUNK_SIZE) CaptureHub._sendDataChunk();
    return CaptureHub;
};

CaptureHub.init();