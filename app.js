// Define variables at the top level of your script to ensure they are accessible throughout.
let net;
let score = 0; // Initialize score
let previousKeypointY;
let jumpThreshold = 50; // Adjust this value based on your testing

const canvas = document.getElementById('canvas'); // Ensure this line runs after the DOM is fully loaded
const ctx = canvas.getContext('2d');

async function setupCamera() {
    console.log('Setting up camera...');
    const video = document.createElement('video');
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', ''); // This is often required for inline playback on mobile browsers.
    const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
            facingMode: 'user'
        }
    }).catch(e => {
        console.error('Error accessing camera:', e);
    });

    if (stream) {
        video.srcObject = stream;
        console.log('Camera setup complete.');
    } else {
        console.log('Failed to get camera stream.');
    }

    return new Promise(resolve => {
        video.onloadedmetadata = () => {
            console.log('Video metadata loaded.');
            video.width = 640; // Match canvas width
            video.height = 480; // Match canvas height
            const videoContainer = document.getElementById('video-container');
            videoContainer.appendChild(video); // Append the video to the #video-container div
            video.style.display = 'block'; // Ensure video is visible
            resolve(video);
        };
    });
}


async function loadVideo() {
    const video = await setupCamera();
    video.play();
    return video;
}

async function loadPoseNet() {
    net = await posenet.load();
    const video = await loadVideo();
    detectPose(video);
}

function drawSegment([ay, ax], [by, bx], color, scale, ctx) {
    ctx.beginPath();
    ctx.moveTo(ax * scale, ay * scale);
    ctx.lineTo(bx * scale, by * scale);
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.stroke();
}

function drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {
    const adjacentKeyPoints = posenet.getAdjacentKeyPoints(keypoints, minConfidence);

    adjacentKeyPoints.forEach((keypoints) => {
        drawSegment(
            [keypoints[0].position.y, keypoints[0].position.x],
            [keypoints[1].position.y, keypoints[1].position.x],
            'aqua',
            scale,
            ctx
        );
    });
}

function drawPose(pose) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const scale = 1; // Update this scale factor based on your canvas size

    // Set the size of the canvas to match the #video-container dimensions.
    const videoContainer = document.getElementById('video-container');
    const computedStyle = getComputedStyle(videoContainer);
    
    canvas.width = parseInt(computedStyle.width, 10);
    canvas.height = parseInt(computedStyle.height, 10);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pose.keypoints.forEach(keypoint => {
        if (keypoint.score > 0.5) {
            ctx.beginPath();
            ctx.arc(keypoint.position.x * scale, keypoint.position.y * scale, 5, 0, 2 * Math.PI);
            ctx.fillStyle = 'aqua';
            ctx.fill();
        }
    });

    drawSkeleton(pose.keypoints, 0.5, ctx, scale);
}

async function detectPose(video) {
    const pose = await net.estimateSinglePose(video, {
        flipHorizontal: false
    });

    const leftHip = pose.keypoints.find(keypoint => keypoint.part === 'leftHip');
    const rightHip = pose.keypoints.find(keypoint => keypoint.part === 'rightHip');

    // Calculate the average y position of the hips
    const currentKeypointY = (leftHip.position.y + rightHip.position.y) / 2;

    if (previousKeypointY && Math.abs(previousKeypointY - currentKeypointY) > jumpThreshold) {
        score++; // Increment score when a jump is detected
        console.log('Jump detected');
        updateScoreDisplay();
    }

    previousKeypointY = currentKeypointY;

    drawPose(pose);

    requestAnimationFrame(() => detectPose(video));
}


function updateScoreDisplay() {
    const scoreElement = document.getElementById('score');
    scoreElement.textContent = score;
}

let baselinePose = null; // Object to store the baseline positions of keypoints

function setBaselinePose(pose) {
    baselinePose = pose.keypoints.reduce((acc, keypoint) => {
        if (['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 'leftAnkle', 'rightAnkle'].includes(keypoint.part)) {
            acc[keypoint.part] = keypoint.position;
        }
        return acc;
    }, {});
}
function hasFullBodyJumped(currentPose) {
    if (!baselinePose) return false;

    // Calculate the average movement of selected keypoints to determine if there's an overall upward movement
    let totalMovement = 0;
    let count = 0;

    ['leftShoulder', 'rightShoulder', 'leftHip', 'rightHip', 'leftAnkle', 'rightAnkle'].forEach(part => {
        if (baselinePose[part] && currentPose[part]) {
            const movement = baselinePose[part].y - currentPose[part].y; // Positive if moved up
            totalMovement += movement;
            count++;
        }
    });

    if (count === 0) return false; // No valid comparison points

    const averageMovement = totalMovement / count;
    return averageMovement > someThreshold; // Determine your threshold for what constitutes a jump
}

document.addEventListener('DOMContentLoaded', (event) => {
    loadPoseNet();
    updateScoreDisplay();
    console.log(baselinePose)
});