// let video;
// let poseNet;
// let pose;
// let skeleton;

// //var time;

// function setup() {
//   createCanvas(640, 480);
//   // var vid2 = getVideoFromFile();

//   webout = createCapture(VIDEO);
//   webout.size(640, 480)

//   var options = {
//     imageScaleFactor: 0.3,
//     outputStride: 16,
//     flipHorizontal: false,
//     minConfidence: 0.5,
//     maxPoseDetections: 5,
//     scoreThreshold: 0.5,
//     nmsRadius: 20,
//     detectionType: 'multiple',
//     multiplier: 0.75,
//    };

//   poseNet = ml5.poseNet(webout, options, modelLoaded);
//   poseNet.on('pose', getPoses);
  
//   poseNet = ml5.poseNet(myVideo, options, modelLoaded);
//   poseNet.on('pose', getPoses);
// }
// function draw() {
//   image(myVideo, 0, 0);

//   if (pose) {
//     for (let i = 5; i < pose.keypoints.length; i++) {
//       let x = pose.keypoints[i].position.x;
//       let y = pose.keypoints[i].position.y;
//       fill(0,255,0);
//       ellipse(x,y,8,8);
      
//     }
    
//     for (let i = 0; i < skeleton.length; i++) {
//       let a = skeleton[i][0];
//       let b = skeleton[i][1];
//       strokeWeight(2);
//       stroke(255);
//       line(a.position.x, a.position.y,b.position.x,b.position.y);
//     }
//   }
// }

// function getVideoFromFile(video) {
//   return document.getElementById('input').files[0]; // change the tag for the video
// }

// function getPoses(poses) {
//   console.log(poses);
//   if (poses.length > 0) {
//     pose = poses[0].pose;
//     skeleton = poses[0].skeleton;
//   }
// }


// function modelLoaded() {
//   console.log('Drawing model..');
// }




// fs.readFile(__dirname + '/assets/frames/my_frame_1521406229879_1920x1080_1.jpg', function(err, image){
//   socket.emit('image', { image: true, buffer: image });
//   });

// function something() {
//   try {
//     var process = new ffmpeg(__dirname + '/assets/sample.mp4'); // use your own video file here
//     process.then(function (video) {
//       // Callback mode
//       video.fnExtractFrameToJPG(__dirname + '/assets/frames/', {
//         frame_rate: 1,
//         number: null, //capture total frame
//         file_name: 'my_frame_%t_%s'
//       }, function (error, files) {
//         if (!error)
//           console.log('Frames: ' + files);
//       });
//     }, function (err) {
//       console.log('Error: ' + err);
//     });
//   } catch (e) {
//     console.log(e);
//   }
// }



// function drawKeypoints()  {
//   // Loop through all the poses detected
//   for (let i = 0; i < poses.length; i++) {
//     // For each pose detected, loop through all the keypoints
//     let pose = poses[i].pose;
//     for (let j = 0; j < pose.keypoints.length; j++) {
//       // A keypoint is an object describing a body part (like rightArm or leftShoulder)
//       let keypoint = pose.keypoints[j];
//       // Only draw an ellipse is the pose probability is bigger than 0.2
//       if (keypoint.score > 0.2) {
//         fill(255, 0, 0);
//         noStroke();
//         ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
//       }
//     }
//   }
// }

// function drawSkeleton() {
//   // Loop through all the skeletons detected
//   for (let i = 0; i < poses.length; i++) {
//     let skeleton = poses[i].skeleton;
//     // For every skeleton, loop through all body connections
//     for (let j = 0; j < skeleton.length; j++) {
//       let partA = skeleton[j][0];
//       let partB = skeleton[j][1];
//       stroke(255, 0, 0);
//       line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
//     }
//   }
// }

// function accuracyTrack() {
//     //pose.keypoints.[i].score;
//   }
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
  console.log(poses.length);
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}

function modelLoaded() {
  console.log('Drawing model..');
}

function processVideo(othervideo) {
  // cv2.VideoCapture("")
  // returns keypoints of other video
}

function draw() {
  image(myVideo, 0, 0);

  if (pose) {
    for (let i = 5; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0,255,0);
      ellipse(x,y,8,8);
      
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
  
  // for (var i = 0; i < vec.length; ++i) {
    // let final = Array(52);
    // var norm;
    // keypoints = vec[i].pose.keypoints;
    
    // keypoints.sort(function (a,b) {
    //   a = a.part.toLowerCase();
    //   b = b.part.toLowerCase();
    //   return (a < b) ? -1 : (a > b) ? 1 : 0;
    // })
    // let arr = Array(34);
    // for (let j = 0; j < keypoints.length; ++j) {
    //   arr[j] = keypoints[j].position.x;
    //   arr[j+1] = keypoints[j].position.y;
    // }
    // norm = math.norm(arr);
    // var confidencesum = 0;
    // for (let j = 0; j < keypoints.length; ++j) {
    //   final[j] = keypoints[j].position.x / norm;
    //   final[j+1] = keypoints[j].position.y / norm;
    //   final[34 + j] = keypoints[j].score;
    //   confidencesum += keypoints[j].score;
    // }
    // final[51] = confidencesum;
  // }

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