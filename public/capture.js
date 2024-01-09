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

    CaptureHub._bStarted = false;
    CaptureHub._id = undefined;
    CaptureHub._bSendingChunk = false;
    
    //CaptureHub._frame = {};

    window.setInterval(CaptureHub._mark, CaptureHub.T_INT);

    CaptureHub._resetDataChunk();
    CaptureHub._bRec = true;
};

CaptureHub.setHubServer = (addr)=>{
    CaptureHub._addr = addr;
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
    });
};

CaptureHub._mark = ()=>{
    if (!CaptureHub._bRec) return;
    if (!CaptureHub.onFrame) return;

    let S = CaptureHub.onFrame();

    if (!CaptureHub._bStarted){
        let fields = [];
        for (let a in S) fields.push(a);

        CaptureHub.requestNewSession(fields);
        CaptureHub._bStarted = true;
        return;
    }

    if (!CaptureHub._id) return;

    let row = [];
    for (let a in S) row.push(S[a]);

    let srow = row.join(",");

    CaptureHub._chunk.push(srow);
    CaptureHub._rcount++;

    if (CaptureHub._rcount >= CaptureHub.CHUNK_SIZE) CaptureHub._sendDataChunk();
};

CaptureHub.requestNewSession = (fields, groupid)=>{
    fetch(CaptureHub._addr+"api/session", {
        method: "POST",
        body: JSON.stringify({
            fields: fields,
            groupid: groupid
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
};

CaptureHub.stop = ()=>{
    CaptureHub._sendDataChunk();
    
    CaptureHub._bRec = false;
    CaptureHub._bStarted = false;

    console.log("STOP");
}


window.addEventListener( 'load', ()=>{
    CaptureHub.init();
});