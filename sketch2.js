let sketch = function(p) {
    let video2;
    let poseNet2;
    let poses2 = [];
    let api_key = "AIzaSyB_kp9fqCR_qdUVVaAPNCBWUp3YpIIAHbU";
    
    p.setup = function() {
      p.createCanvas(640, 480);
      video2 = createVideo('./shuffling.mp4');
      video2.size(640, 480);
      video2.volume(0);
      video2.loop();
      video2.hide(); // hides the html video loader
    
      // Create a new poseNet2 method with a single detection
      poseNet2 = ml5.poseNet(video2, p.modelReady);
      // This sets up an event that fills the global variable "poses2"
      // with an array every time new poses2 are detected
      poseNet2.on('pose', function(results) {
        poses2 = results;
      });
      // For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
      database = firebase.database();
      // Hide the video2 element, and just show the canvas
    }

    p.writeUserData = function(userId, poses) {
        firebase.database().ref('users/' + userId).set({
          poses: poses,
        });
      }
    
    p.modelReady = function() {
      console.log("model ready");
    }
    
    p.draw = function() {
        let img = video2.get();
      p.image(img, 0, 0);
    
      // We can call both functions to draw all keypoints and the skeletons
      p.drawKeypoints();
      p.drawSkeleton();
    }
    
    // A function to draw ellipses over the detected keypoints
    p.drawKeypoints = function ()  {
      // Loop through all the poses2 detected
      for (let i = 0; i < poses2.length; i++) {
        // For each pose detected, loop through all the keypoints
        let pose = poses2[i].pose;
        for (let j = 0; j < pose.keypoints.length; j++) {
          // A keypoint is an object describing a body part (like rightArm or leftShoulder)
          let keypoint = pose.keypoints[j];
          // Only draw an ellipse is the pose probability is bigger than 0.2
          if (keypoint.score > 0.2) {
            p.fill(255, 0, 0);
            p.noStroke();
            p.ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
          }
        }
      }
    }
    
    // A function to draw the skeletons
    p.drawSkeleton = function () {
      // Loop through all the skeletons detected
      for (let i = 0; i < poses2.length; i++) {
        let skeleton = poses2[i].skeleton;
        // For every skeleton, loop through all body connections
        for (let j = 0; j < skeleton.length; j++) {
          let partA = skeleton[j][0];
          let partB = skeleton[j][1];
          p.stroke(255, 0, 0);
          p.line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
        }
      }
    }
    
    p.L2Normalization = function (vec) {
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
    
    p.weightedDistanceMatching = function (poseVector1, poseVector2) {
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
}
let mp5 = new p5(sketch);