let mic, fft;
let ball;
let obstacles = [];
let speed = 2;
let gameOver = false;

function setup() {
    createCanvas(600, 400);
    mic = new p5.AudioIn();
    mic.start();
    
    fft = new p5.FFT();
    fft.setInput(mic);

    ball = new Ball();
}

function draw() {
    background(0);

    if (!gameOver) {
        let spectrum = fft.analyze();
        let pitch = fft.getCentroid();  // Gets the spectral centroid (approximate pitch)
        
        if (pitch > 500) {  // Adjust sensitivity
            ball.moveUp();
        } else {
            ball.moveDown();
        }

        ball.show();
        handleObstacles();
    } else {
        textSize(32);
        fill(255, 0, 0);
        text('Game Over', width / 2 - 80, height / 2);
    }
}

class Ball {
    constructor() {
        this.x = 50;
        this.y = height / 2;
        this.r = 20;
    }

    moveUp() {
        this.y -= 5; // Move up with high pitch
    }

    moveDown() {
        this.y += 2; // Gravity effect
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
        this.x -= speed;
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
