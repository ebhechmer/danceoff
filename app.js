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
            document.body.appendChild(video); // Make sure the video is added to the document
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

let net;
async function loadPoseNet() {
    net = await posenet.load();
    const video = await loadVideo();
    detectPose(video);
}

function drawPose(pose) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 640;
    canvas.height = 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pose.keypoints.forEach(keypoint => {
        if (keypoint.score > 0.5) {
            ctx.beginPath();
            ctx.arc(keypoint.position.x, keypoint.position.y, 10, 0, 2 * Math.PI);
            ctx.fillStyle = 'aqua';
            ctx.fill();
        }
    });
}

async function detectPose(video) {
    const pose = await net.estimateSinglePose(video, {
        flipHorizontal: false
    });
    drawPose(pose);
    requestAnimationFrame(() => detectPose(video));
}

loadPoseNet();
