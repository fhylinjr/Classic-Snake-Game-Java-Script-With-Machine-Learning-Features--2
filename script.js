// Name any p5.js functions we use in the global so Glitch can recognize them.
/* global createCanvas, random, background, fill, color, rect, ellipse, square,
stroke, noStroke, noFill, strokeWeight, colorMode,  width, height, text, HSB,
line, mouseX, mouseY, mouseIsPressed, windowWidth, windowHeight, sqrt, round,
frameRate, gameIsOver, image, textSize, createCapture, VIDEO, rate, gameIsOver2, ml5, keyCode, UP_ARROW, DOWN_ARROW, RIGHT_ARROW, LEFT_ARROW, BACKSPACE, collideRectRect */

let backgroundColor, snake, apple, score;
let video;
let flipVideo;
let label = "waiting...";
let classifier;
let modelURL = 'https://teachablemachine.withgoogle.com/models/3PFh8TVfi/';

// Load the model
function preload(){
  classifier = ml5.imageClassifier(modelURL + 'model.json');
}

function setup() {
  // Canvas & color settings.
  width = 640;
  height = 480;
  createCanvas(width, height);
  
  // Create the video
  video = createCapture(VIDEO);
  video.hide();
  //flipVideo = ml5.flipImage(video);

  // STEP 2: Start classifying
  classifyVideo();
  
  colorMode(HSB, 360, 100, 100);
  backgroundColor = 95;
  gameIsOver = false;

  // Set frame rate. This makes the scren refresh more or less so move faster or slower.
  frameRate(5);

  // Initialize game variables.
  snake = new Snake();
  apple = new Apple();
  score = 0;
}

function draw() {
  background(backgroundColor);
  
  //Draw image
  image(video, 0, 0);
  textSize(32);
  fill(255);
  text(label, 10 , 50);

  // The snake performs the following four methods:
  snake.moveSelf();
  snake.showSelf();
  snake.checkTailCollisions();
  snake.checkCanvasCollisions();
  snake.checkAppleCollisions();

  // The apple needs fewer methods to show up on screen.
  apple.showSelf();

  // We put the score in its own function for readability.
  displayScore();
  gameOver();
  winGame();
}

// STEP 3 classify the videeo!
function classifyVideo() {
  //flipVideo = ml5.flipImage(video);
  classifier.classify(video, gotResults);
}

// STEP 4: Get the classification!
function gotResults(error, results) {
  // Something went wrong!
  if (error) {
    console.error(error);
    return;
  }
  // Store the label and classify again!
  label = results[0].label;
  controlSnake();
  classifyVideo();
}

function displayScore() {
  fill(0); //gives it color black
  noStroke(); //removes border
  text(`Score: ${score}`, 20, 20);
}

class Snake {
  constructor() {
    this.size = 10;
    this.x = width / 2;
    this.y = height - 10;
    this.direction = "N";
    this.speed = 10;
    this.tail = [new TailSegment(this.x, this.y)];
  }

  moveSelf() {
    if (this.direction === "N") {
      this.y -= this.speed;
    } else if (this.direction === "S") {
      this.y += this.speed;
    } else if (this.direction === "E") {
      this.x += this.speed;
    } else if (this.direction === "W") {
      this.x -= this.speed;
    } else {
      console.log("Error: invalid direction");
    }
    this.tail.unshift(new TailSegment(this.x, this.y));
    this.tail.pop();
  }

  showSelf() {
    stroke(240, 100, 100);
    noFill();
    rect(this.x, this.y, this.size, this.size);
    for (let i = 0; i < this.tail.length; i++) {
      this.tail[i].showSelf();
    }
  }

  checkAppleCollisions() {
    // Check if head of snake collides with apple.
    if (
      collideRectRect(
        this.x,
        this.y,
        this.size,
        this.size,
        apple.x,
        apple.y,
        apple.size,
        apple.size
      )
    ) {
      // Increment score
      score += 1;
      // Create new apple;
      apple = new Apple();

      this.extendTail();
    }
  }

  checkTailCollisions() {
    for (let i = 1; i < this.tail.length; i++) {
      if (this.x === this.tail[i].x && this.y === this.tail[i].y) {
        gameIsOver = true;
      }
    }
  }
  checkCanvasCollisions() {
    if (this.x < 1 || this.x > width - 1 || this.y < 1 || this.y > height - 1) {
      gameIsOver = true;
    }
  }

  extendTail() {
    // Increase tail
    let lastTailSegment = this.tail[this.tail.length - 1];
    this.tail.push(new TailSegment(lastTailSegment.x, lastTailSegment.y));
  }
}

class TailSegment {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = 10;
  }

  showSelf() {
    fill(0);
    rect(this.x, this.y, this.size, this.size);
  }
}

class Apple {
  constructor() {
    this.size = 10;
    this.x = (round(random(1, width - 10)) / this.size) * this.size;
    this.y = (round(random(1, height - 10)) / this.size) * this.size;
  }

  showSelf() {
    fill(0, 100, 100);
    stroke(0, 100, 100);
    rect(this.x, this.y, this.size, this.size);
  }
}

// function keyPressed() {
//   console.log("key pressed: ", keyCode);
//   if (keyCode === UP_ARROW && snake.direction != "S") {
//     snake.direction = "N";
//   } else if (keyCode === DOWN_ARROW && snake.direction != "N") {
//     snake.direction = "S";
//   } else if (keyCode === RIGHT_ARROW && snake.direction != "W") {
//     snake.direction = "E";
//   } else if (keyCode === LEFT_ARROW && snake.direction != "E") {
//     snake.direction = "W";
//   } else if (keyCode === BACKSPACE) {
//     restartGame();
//   } else {
//     console.log("wrong key");
//   }
// }

function controlSnake() {
  console.log("key pressed: ", label);
  if (label === 'Up' && snake.direction != "S") {
    snake.direction = "N";
  } else if (label === 'Down' && snake.direction != "N") {
    snake.direction = "S";
  } else if (label === 'Right' && snake.direction != "W") {
    snake.direction = "E";
  } else if (label === 'Left' && snake.direction != "E") {
    snake.direction = "W";
  } else if (keyCode === BACKSPACE) {
    restartGame();}
  // else {
  //   console.log("wrong key");
  // }
}

function restartGame() {
  // Canvas & color settings.
  background(backgroundColor);

  // Initialize game variables.
  snake = new Snake();
  apple = new Apple();
  score = 0;
  gameIsOver = false;
}

function gameOver() {
  if (gameIsOver) {
    snake.tail = snake.tail.slice(1, 1);
    snake.size = 0;
    text(
      `GAME OVER !!! Your score is ${score} Press BACKSPACE Key to Restart Game`,
      10,
      200
    );
  }
}

function winGame() {
  if (score === 30) {
    gameIsOver = false;
    text(`GAME WON !!! Press BACKSPACE Key to Restart Game`, 10, 200);
  }
}

