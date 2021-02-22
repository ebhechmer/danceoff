
let video;
let poseNet;
let poses = [];

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function(results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();
}

function modelReady() {
  console.log('ready');
}

function draw() {
  image(video, 0, 0, width, height);

  // We can call both functions to draw all keypoints and the skeletons
  drawKeypoints();
  drawSkeleton();
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints()  {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i++) {
    // For each pose detected, loop through all the keypoints
    let pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j++) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      let keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i++) {
    let skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j++) {
      let partA = skeleton[j][0];
      let partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}

function L2Normalization(vec) {
  console.log(vec);
  let final = Array(52);
  var norm;
  keypoints = vec[0].pose.keypoints;
  
  keypoints.sort(function (a,b) {
    a = a.part.toLowerCase();
    b = b.part.toLowerCase();
    return (a < b) ? -1 : (a > b) ? 1 : 0;
  })
  let arr = Array(34);
  for (let j = 0; j < keypoints.length; ++j) {
    arr[j] = keypoints[j].position.x;
    arr[j+1] = keypoints[j].position.y;
  }
  norm = math.norm(arr);
  var confidencesum = 0;
  for (let j = 0; j < keypoints.length; ++j) {
    final[j] = keypoints[j].position.x / norm;
    final[j+1] = keypoints[j].position.y / norm;
    final[34 + j] = keypoints[j].score;
    confidencesum += keypoints[j].score;
  }
  final[51] = confidencesum;
  
  return final;
}

function weightedDistanceMatching(poseVector1, poseVector2) {
  // Weighted Matching for Pose Similarity;
  // https://medium.com/tensorflow/move-mirror-an-ai-experiment-with-pose-estimation-in-the-browser-using-tensorflow-js-2f7b769f9b23
  // L2 Normalization
  poseVector1 = L2Normalization(poseVector1);
  poseVector2 = L2Normalization(poseVector2);
  
  let vector1PoseXY = poseVector1.slice(0, 34);
  let vector1Confidences = poseVector1.slice(34, 51);
  let vector1ConfidenceSum = poseVector1.slice(51, 52);

  let vector2PoseXY = poseVector2.slice(0, 34);

  // First summation
  let summation1 = 1 / vector1ConfidenceSum;

  // Second summation
  let summation2 = 0;
  for (let i = 0; i < vector1PoseXY.length; i++) {
    let tempConf = Math.floor(i / 2);
    let tempSum = vector1Confidences[tempConf] * Math.abs(vector1PoseXY[i] - vector2PoseXY[i]);
    summation2 = summation2 + tempSum;
  }

  return summation1 * summation2;
}

// var leftBuffer;
// var rightBuffer;

// function setup() {
//     // 800 x 400 (double width to make room for each "sub-canvas")
//     createCanvas(800, 400);
//     // Create both of your off-screen graphics buffers
//     leftBuffer = createGraphics(400, 400);
//     rightBuffer = createGraphics(400, 400);
// }

// function draw() {
//     // Draw on your buffers however you like
//     drawLeftBuffer();
//     drawRightBuffer();
//     // Paint the off-screen buffers onto the main canvas
//     image(leftBuffer, 0, 0);
//     image(rightBuffer, 400, 0);
// }

// function drawLeftBuffer() {
//     leftBuffer.background(0, 0, 0);
//     leftBuffer.fill(255, 255, 255);
//     leftBuffer.textSize(32);
//     leftBuffer.text("This is the left buffer!", 50, 50);
// }

// function drawRightBuffer() {
//     rightBuffer.background(255, 100, 255);
//     rightBuffer.fill(0, 0, 0);
//     rightBuffer.textSize(32);
//     rightBuffer.text("This is the right buffer!", 50, 50);
// }