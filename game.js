// Import p5.js and p5.sound.js before running this script
let mic, pitch, ballY;
let obstacles = [];
let threshold = 200; // Adjust sensitivity

function setup() {
    createCanvas(600, 400);
    mic = new p5.AudioIn();
    mic.start();
    pitch = new p5.FFT();
    ballY = height / 2;
}

function draw() {
    background(0);
    
    // Get frequency data
    let spectrum = pitch.analyze();
    let freq = pitch.getEnergy("treble"); // Using treble as proxy for pitch
    
    // Adjust ball position based on voice pitch
    if (freq > threshold) {
        ballY -= 3;
    } else {
        ballY += 2;
    }
    ballY = constrain(ballY, 0, height);
    
    // Draw ball
    fill(0, 255, 0);
    ellipse(100, ballY, 30, 30);
    
    // Generate obstacles
    if (frameCount % 60 === 0) {
        obstacles.push({ x: width, y: random(height - 50), w: 20, h: random(50, 150) });
    }
    
    // Move and draw obstacles
    fill(255, 0, 0);
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let obs = obstacles[i];
        obs.x -= 3;
        rect(obs.x, obs.y, obs.w, obs.h);
        
        // Collision detection
        if (collides(100, ballY, 30, obs)) {
            noLoop();
            fill(255);
            textSize(32);
            text("Game Over", width / 2 - 80, height / 2);
        }
        
        // Remove passed obstacles
        if (obs.x + obs.w < 0) {
            obstacles.splice(i, 1);
        }
    }
}

function collides(ballX, ballY, ballSize, obs) {
    return (
        ballX + ballSize / 2 > obs.x &&
        ballX - ballSize / 2 < obs.x + obs.w &&
        ballY + ballSize / 2 > obs.y &&
        ballY - ballSize / 2 < obs.y + obs.h
    );
}
