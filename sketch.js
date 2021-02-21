let video;
let poseNet;
let pose;
let skeleton;

var time;

function setup() {
  createCanvas(640, 480);
  myVideo = createCapture(VIDEO);
  myVideo.hide();
  poseNet = ml5.poseNet(myVideo, modelLoaded);
  poseNet.on('pose', gotPoses);

}

function gotPoses(poses) {
  console.log(poses);
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}


function modelLoaded() {
  console.log('Drawing model..');
}

function draw() {
  image(myVideo, 0, 0);

  if (pose) {
    time = 0;
    for (let i = 5; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0,255,0);
      ellipse(x,y,8,8);
      time ++;
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
