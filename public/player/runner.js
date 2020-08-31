/* runner.js */
/*
  Extension
*/
File.prototype.toObject = function () {
  return Object({
  lastModified: parseInt(this.lastModified),
  lastModifiedDate: String(this.lastModifiedDate),
  name: String(this.name),
  size: parseInt(this.size),
  type: String(this.type)
  })
}

FileList.prototype.toArray = function () {
  return Array.from(this).map(function (file) {
  return file.toObject()
  })
}
/*********************************************/
document.getElementById("OpenLocalFile-Cmd").addEventListener('click', () => {
	doTestSubscribe();
});

var localClipFile = document.getElementById("LocalClipFile");
var fileList = document.getElementById("filelist");
var playClipCommand = document.getElementById("PlayClipCommand");
var stopClipCommand = document.getElementById("StopClipCommand");

playClipCommand.disabled = true;
stopClipCommand.disabled = true;

var localStream = undefined;
var displayMediaStreamConstraints = undefined;

var currentLocalStream = localStream;

var _next = 0;
var files;
var len;

const clipURL = window.URL;

function next(n){
  var fileURL = clipURL.createObjectURL(files[n]);
  doPlayExternalVideo(fileURL);
  fileList.selectedIndex = n;
  playClipCommand.disabled = true;
  stopClipCommand.disabled = false;
}

localClipFile.addEventListener('change', function() {
  files = localClipFile.files;
  let filesArray = files.toArray();
  //console.log(files);
  fileList.innerHTML = '';
  filesArray.forEach((item) => {
    let clipOption = document.createElement('option');
    clipOption.textContent = item.name;
    clipOption.value = item.name;
    fileList.appendChild(clipOption);
  });
  len = files.length;
  /*
  if(len){
    next(_next);
  }
  */
  playClipCommand.disabled = false;
});
/*
fileList.addEventListener('change', function() {
  let playIndex = fileList.selectedIndex;
  next(playIndex);
});
*/
document.addEventListener("SwithBackMain", function(e) {
  _next += 1;
  next(_next);
  console.log(len, _next);
  if((len-1) == _next){
    _next=-1;
  }
});

function doPlayClip() {
  if (displayMediaStreamConstraints){
    let playIndex = fileList.selectedIndex;
    if (playIndex < 0){
      playIndex = 0;
    }
    next(playIndex);
  } else {
    displayMediaStreamConstraints = {video: {width: 1280, height: 720}};
    let playIndex = fileList.selectedIndex;
    if (playIndex < 0){
      playIndex = 0;
    }
    next(playIndex);
  }
}

function doStopClip() {
  if (srcMedia){
    srcMedia.src = '';
  }
  playClipCommand.disabled = false;
  stopClipCommand.disabled = true;
  if (localStream)	{
    /*clear localstream */
    localStream.getTracks().forEach((track) => {
      localStream.removeTrack(track);
    });
    localStream = currentLocalStream;
    localVideo.srcObject = localStream;
    doReMixStream();
    setTimeout(() => {
      doUpdateStream(mixedStream, null);
    }, 2500);
  }
}

function doRemoveClipFromMain() {
  doStopClip();
  srcMedia = null;
  localClipFile.files = null;
}

/*********************************************/
let srcMedia = null;
function doPlayExternalVideo(URL) {
  srcMedia = document.createElement("video");
  srcMedia.controls = true;
  srcMedia.autoplay = true;
  srcMedia.crossorigin = "anonymous";
  srcMedia.src = URL;
  srcMedia.onended = e => {
    let event = new CustomEvent("SwithBackMain", { "detail": {}});
    document.dispatchEvent(event);
    if (localStream)	{
      localStream.onended = null;
    }
  };
  srcMedia.addEventListener('StopPlayClip', function() {
    console.log('test');
    srcMedia.src = '';
    srcMedia.stop();
    srcMedia = null;
  });

  let webmstream = null;
  srcMedia.oncanplay = async function() {
    webmstream = srcMedia.captureStream();
    //console.log(webmstream);
    //console.log(webmstream.getTracks());
    localStream = webmstream;
    localVideo.srcObject = localStream;
    if (mixedStream){
      doReMixStream();
      setTimeout(() => {
        doUpdateStream(mixedStream, function(){
          /* send callback to client come back to room, if he/she is watching youtube */
          if (ws.readyState === 1) {
            //console.log(ws.isAlive);
            ws.send(JSON.stringify({
              channel: "chat",
              type: "message",
              message: {msgtype: 'callback', msg: 'Come back, Please.', timestamp: new Date(), clientname: myname, fromId: screenno, toId: 'all', roomName: roomname, rootname: rootname},
              name: myname,
              sender: 'master',
              sendto: 'all',
              roomName: roomname,
              rootname: rootname
            }));
          } else {
            alert('Websocket Connection loss.!!');
          }
        });
      }, 2500);
    }
  }
}
