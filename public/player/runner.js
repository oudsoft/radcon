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
var localClipFile = document.getElementById("LocalClipFile");
var fileList = document.getElementById("filelist");
var playClipCommand = document.getElementById("PlayClipCommand");
var stopClipCommand = document.getElementById("StopClipCommand");
var localVideo = document.getElementById("YourVideo");

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
  console.log(n);
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
  filesArray.forEach((item, index) => {
    let clipOption = document.createElement('option');
    clipOption.textContent = index + '. ' + item.name;
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

fileList.addEventListener('change', function() {
  let playIndex = fileList.selectedIndex;
  next(playIndex);
});

/*
document.addEventListener("SwithBackMain", function(e) {
  _next += 1;
  next(_next);
  console.log(len, _next);
  if((len-1) == _next){
    _next=-1;
  }
});
*/
function doPlayClip() {
  let playIndex = fileList.selectedIndex;
  if (playIndex < 0){
    playIndex = 0;
  }
  next(playIndex);
}

function doStopClip() {
  playClipCommand.disabled = false;
  stopClipCommand.disabled = true;
}

function doRemoveClipFromMain() {
  doStopClip();
  localClipFile.files = null;
}

/*********************************************/

function doPlayExternalVideo(URL) {
  localVideo.controls = true;
  //localVideo.autoplay = true;
  localVideo.crossorigin = "anonymous";
  localVideo.src = URL;
  localVideo.addEventListener('StopPlayClip', function() {
    console.log('test');
    localVideo.src = '';
    localVideo.stop();
  });
  localVideo.addEventListener("canplay",  function() {
    console.log('canplay');
    localVideo.play();
  });
  localVideo.addEventListener("ended",  function() {
    console.log('ended');
    localVideo.src = '';
    let playIndex = fileList.selectedIndex;
    if (playIndex < len) {
      playIndex++;
    } else {
      playIndex = 0;
    }
    fileList.selectedIndex = playIndex;
    var event = new Event('change');
    fileList.dispatchEvent(event);
  });
}
