let video;
let poseNet;
let poses = [];
let r;

function setup() {
  // Hide the video element, and just show the canvas
  const firebaseConfig = {
    apiKey: "AIzaSyDR0KgTNO7YhyN6qXcNOe56JGeuSF2M1RI",
    authDomain: "bluep1.firebaseapp.com",
    databaseURL: "https://bluep1-default-rtdb.firebaseio.com",
    projectId: "bluep1",
    storageBucket: "bluep1.appspot.com",
    messagingSenderId: "749959899898",
    appId: "1:749959899898:web:f6c8612fe95670374a3743",
    measurementId: "G-4ED58NM17B"
  };
  firebase.initializeApp(firebaseConfig);
  var personvec = readData(document.getElementById("fname").value);
  var examplevec = readData("example");
  document.getElementById("p1").innerHTML = weightedDistanceMatching(personvec, examplevec);
}

function readData(userId) {
  firebase.database().child("users").child(userId).get().then(function(snapshot) {
      if (snapshot.exists()) {
          return snapshot.val();
      } else {
          alert("We couldn't find your id!")
      }
  }).catch(function(error) {
    console.error(error);
  });
}

function draw() {
  // We can call both functions to draw all keypoints and the skeletons
  // drawKeypoints();
  // drawSkeleton();
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