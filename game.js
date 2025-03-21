let mic, pitchModel;
let ball;
let obstacles = [];
let currentPitch = 0;
let micLevel = 0;
let gameOver = false;

function setup() {
    createCanvas(600, 400);
    
    // Start Microphone
    mic = new p5.AudioIn();
    mic.start(startPitchDetection);

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
    console.log("Pitch model ready!");
    detectPitch();
}

function detectPitch() {
    pitchModel.getPitch((err, frequency) => {
        if (err) {
            console.error("Pitch Detection Error:", err);
        } else {
            currentPitch = frequency || 0;
        }
        detectPitch(); // Keep detecting pitch
    });
}

function draw() {
    background(0);

    // Get microphone volume level
    micLevel = mic.getLevel();
    
    // Debugging info
    console.log("Mic Level:", micLevel, "Detected Pitch:", currentPitch);

    // Show text on screen
    fill(255);
    textSize(16);
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
