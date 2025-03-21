let mic, pitchModel;
let ball;
let obstacles = [];
let currentPitch = 0;
let micLevel = 0;
let gameOver = false;
let micStarted = false;

function setup() {
    createCanvas(600, 400);

    // Show message to start the mic
    textAlign(CENTER);
    textSize(20);
    fill(255);
    text("Click to Start Microphone", width / 2, height / 2);
}

function mousePressed() {
    if (!micStarted) {
        getAudioContext().resume().then(() => {
            console.log("🔊 Audio Context Resumed!");
            startMic();
            micStarted = true;
        });
    }
}
function startMic() {
    mic = new p5.AudioIn();
    mic.start(() => {
        console.log("🎤 Microphone started!");
        startPitchDetection();
    });

    ball = new Ball();
}

function startPitchDetection() {
    let audioContext = getAudioContext();
    pitchModel = ml5.pitchDetection(
        "https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/crepe/",
        audioContext,
        mic.stream,
        modelReady
    );
}

function modelReady() {
    console.log("✅ Pitch model ready!");
    detectPitch();
}

function detectPitch() {
    pitchModel.getPitch((err, frequency) => {
        if (err) {
            console.error("⚠️ Pitch Detection Error:", err);
        } else {
            currentPitch = frequency || 0;
        }
        detectPitch(); // Keep detecting pitch
    });
}
function draw() {
    background(0);

    if (!micStarted) {
        fill(255);
        textSize(20);
        textAlign(CENTER);
        text("Click Anywhere to Enable Microphone", width / 2, height / 2);
        return;
    }

    // Get raw mic input
    micLevel = mic.getLevel();
    let volHistory = mic.getSources(); // Check if mic sources exist

    // Debugging output
    console.log("🎙️ Mic Level:", micLevel, "🎵 Detected Pitch:", currentPitch);
    console.log("🔎 Mic Sources:", volHistory);

    // Display mic info on screen
    fill(255);
    textSize(16);
    textAlign(LEFT);
    text("Mic Level: " + micLevel.toFixed(5), 20, 30);
    text("Detected Pitch: " + (currentPitch ? currentPitch.toFixed(2) + " Hz" : "No pitch detected"), 20, 50);

    if (!gameOver) {
        if (currentPitch > 100) {
            ball.moveUp();
        } else {
            ball.moveDown();
        }

        ball.show();
        handleObstacles();
    } else {
        textSize(32);
        fill(255, 0, 0);
        text("Game Over", width / 2 - 80, height / 2);
    }
}
class Ball {
    constructor() {
        this.x = 50;
        this.y = height / 2;
        this.r = 20;
    }

    moveUp() {
        this.y -= 5;
    }

    moveDown() {
        this.y += 2;
    }

    show() {
        fill(0, 255, 0);
        ellipse(this.x, this.y, this.r * 2);
    }
}

function handleObstacles() {
    if (frameCount % 90 === 0) {
        obstacles.push(new Obstacle());
    }

    for (let obs of obstacles) {
        obs.move();
        obs.show();

        if (ballCollides(obs)) {
            gameOver = true;
        }
    }
}

class Obstacle {
    constructor() {
        this.x = width;
        this.y = random(height - 100);
        this.w = 30;
        this.h = 100;
    }

    move() {
        this.x -= 3;
    }

    show() {
        fill(255, 0, 0);
        rect(this.x, this.y, this.w, this.h);
    }
}

function ballCollides(obs) {
    return ball.x + ball.r > obs.x &&
           ball.x - ball.r < obs.x + obs.w &&
           ball.y + ball.r > obs.y &&
           ball.y - ball.r < obs.y + obs.h;
}
