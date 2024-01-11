let CaptureHub = {};
window.CaptureHub = CaptureHub;

CaptureHub.T_INT      = 400; //400;
CaptureHub.CHUNK_SIZE = 30

CaptureHub._addr = undefined;

CaptureHub.onFrame = undefined;

CaptureHub.init = ()=>{
    let path = window.location.href.split('?')[0];
    var i = path.lastIndexOf('/');
    if (i !== -1) path = path.substring( 0, i+1 );

    CaptureHub._addr = path;
    console.log(CaptureHub._addr);

    CaptureHub._id  = undefined;
    CaptureHub._gid = undefined;
    
    CaptureHub._bFirstRow = true;
    CaptureHub._bSendingChunk = false;

    CaptureHub._resetDataChunk();
    CaptureHub._bRec = true;

    CaptureHub._uf = undefined;
};

CaptureHub.start = ()=>{
    if (CaptureHub._uf) return CaptureHub;

    CaptureHub._uf = window.setInterval(CaptureHub._tick, CaptureHub.T_INT);
    return CaptureHub;
};

CaptureHub.setOnFrame = (of)=>{
    CaptureHub.onFrame = of;
    return CaptureHub;
};

CaptureHub.setGroupID = (gid)=>{
    CaptureHub._gid = gid;
    return CaptureHub;
};

CaptureHub.setHubServer = (addr)=>{
    CaptureHub._addr = addr;
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

CaptureHub.frame = (S)=>{
    if (!S) return CaptureHub;

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

CaptureHub.requestNewSession = (fields)=>{
    let gid = CaptureHub._gid;
    console.log(gid)

    fetch(CaptureHub._addr+"api/session", {
        method: "POST",
        body: JSON.stringify({
            fields: fields,
            groupid: CaptureHub._gid
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then((response) => response.json())
    .then((json) => {
        console.log(json)

        CaptureHub._id  = json.id;
        CaptureHub._gid = json.groupid;
    });

    return CaptureHub;
};

CaptureHub.stop = ()=>{
    CaptureHub._sendDataChunk();
    
    CaptureHub._bRec = false;
    CaptureHub._bFirstRow = true;
    CaptureHub._uf = undefined;

    console.log("STOP");
    return CaptureHub;
}


CaptureHub.init();