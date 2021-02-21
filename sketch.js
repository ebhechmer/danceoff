let video;
let poseNet;
let pose;
let skeleton;

//var time;

function setup(VIDEO, anothervideo) {
  createCanvas(640, 480);
  var myVideo = getWebcamVideo(VIDEO);
  var vid2 = getVideoFromFile(anothervideo);

  var video = document.querySelector("#videoElement");

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(function (stream) {
        video.srcObject = stream;
      })
      .catch(function (err0r) {
        console.log("Something went wrong!");
      });
  }

  var options = {
    imageScaleFactor: 0.3,
    outputStride: 16,
    flipHorizontal: false,
    minConfidence: 0.5,
    maxPoseDetections: 5,
    scoreThreshold: 0.5,
    nmsRadius: 20,
    detectionType: 'multiple',
    multiplier: 0.75,
   };

  poseNet = ml5.poseNet(vid2, options, modelLoaded);
  poseNet.load()
  poseNet.on('pose', getPoses);
  
  poseNet = ml5.poseNet(myVideo, options, modelLoaded);
  poseNet.on('pose', getPoses);
}

function getWebcamVideo(video) {
  myVideo = createCapture(VIDEO);
  myVideo.hide();
  return myVideo;
}

function getVideoFromFile(video) {
  return document.getElementById('input').files[0]; // change the tag for the video
}

function getPoses(poses) {
  console.log(poses);
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}


function modelLoaded() {
  console.log('Drawing model..');
}

function draw(myVideo) {
  image(myVideo, 0, 0);

  if (pose) {
    //time = 0;
    for (let i = 5; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0,255,0);
      ellipse(x,y,8,8);
      //time ++;
      //console.log(time);
      
    }
    
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(255);
      line(a.position.x, a.position.y,b.position.x,b.position.y);
    }
  }
}

function accuracyTrack() {

  }
