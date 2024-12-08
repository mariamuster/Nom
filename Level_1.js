let player;
let food = [];
let numberOfFood = 50;
let score = 0;
let gameOver = false;
let enemy;
let enemyActive = false;
let nextLevel = false;
let currentLevel = 1;
let hasWon = false; // New variable to track win state
let debugMode = false;

let myFont;
function preload() {
  myFont = loadFont("assets/LomoWallChartLTStd-50.otf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  initializeGame();
}

function initializeGame() {
  player = new Player(70, currentLevel);
  food = [];
  enemy = new Enemy(-200, height / 2, 100, currentLevel);
  enemyActive = false;
  score = 0;
  gameOver = false;
  nextLevel = false;
  for (let i = 1; i < numberOfFood; i++) {
    spawnFood();
  }
}
function drawHitboxes() {
  noFill();
  noStroke();
  rect(
    player.hitbox.x,
    player.hitbox.y,
    player.hitbox.width,
    player.hitbox.height
  );
  for (let f of food) {
    rect(f.hitbox.x, f.hitbox.y, f.hitbox.width, f.hitbox.height);
  }
  if (enemyActive) {
    rect(
      enemy.hitbox.x,
      enemy.hitbox.y,
      enemy.hitbox.width,
      enemy.hitbox.height
    );
  }
}

function draw() {
  if (!gameOver && !nextLevel && !hasWon) {
    drawLevel();

    for (let i = food.length - 1; i >= 0; i--) {
      food[i].show();
      food[i].move();
      if (food[i].checkCollision()) {
        food.splice(i, 1);
        score++;
        spawnFood();
        powerUp();
        checkEnemySpawn();
      }
      if (food[i].x > width) {
        food.splice(i, 1);
        spawnFood();
      }
      if (enemyActive && food[i].enemyCollision()) {
        food.splice(i, 1);
      }
    }

    player.show();
    player.move();

    if (enemyActive) {
      enemy.show();
      enemy.move();
      if (enemy.checkCollision()) {
        gameOver = true;
      }
    }

    // Display score
    fill(getScoreColor());
    textSize(40);
    textFont(myFont);
    textAlign(LEFT, TOP);
    text(`Score: ${score}`, 10, 10);
  } else if (gameOver) {
    showGameOverScreen();
  } else if (nextLevel) {
    showNextLevelScreen();
  } else if (hasWon) {
    // Check for win state
    showWinScreen(); // Call win screen function
  }

  if (debugMode) {
    drawHitboxes();
  }
}

function drawLevel() {
  switch (currentLevel) {
    case 1:
      background(255, 200, 228);

      break;
    case 2:
      background(0, 160, 20);

      break;
    case 3:
      background(0, 95, 228);
      break;
    case 4:
      background(0, 255, 156);
      break;

    case 4:
      background(0, 255, 156);
      break;

    case 5:
      background(150, 229, 85);
      break;
  }
}

function getScoreColor() {
  switch (currentLevel) {
    case 1:
      return color(0, 0, 255);

    case 2:
      return color(255, 255, 0);

    case 3:
      return color(255);

    case 4:
      return color(255, 0, 0);

    case 5:
      return color(255, 0, 255);
  }
}

function showGameOverScreen() {
  background(0, 0, 139);
  fill(255, 0, 0);
  textSize(50);
  textFont(myFont);
  textAlign(CENTER, CENTER);
  text("GAME OVER", width / 2, height / 2);
  textSize(20);
  text(`Final Score: ${score}`, width / 2, height / 2 + 60);

  fill(0, 255, 0);
  textSize(30);
  text("RESTART", width / 2, height / 2 + 200);
}

function showNextLevelScreen() {
  background(255, 255, 129);
  fill(0, 0, 255);
  textSize(50);
  textFont(myFont);
  textAlign(CENTER, CENTER);
  text("NEXT LEVEL", width / 2, height / 2);
  textSize(20);
  text(`Score: ${score}`, width / 2, height / 2 + 60);

  fill(0, 0, 255);
  textSize(30);
  text("CONTINUE", width / 2, height / 2 + 200);
}

//wann Enemy
function checkEnemySpawn() {
  if (score >= 15 && !enemyActive) {
    enemyActive = true;
    enemy.x = -200;
  }
}

function mousePressed() {
  if (gameOver) {
    let restartButton = new Hitbox(width / 2 - 50, height / 2 + 185, 100, 30);
    if (restartButton.intersects(new Hitbox(mouseX, mouseY, 1, 1))) {
      currentLevel = 1;
      initializeGame();
    }
  } else if (nextLevel) {
    let continueButton = new Hitbox(width / 2 - 50, height / 2 + 185, 100, 30);
    if (continueButton.intersects(new Hitbox(mouseX, mouseY, 1, 1))) {
      nextLevel = false;
      currentLevel++;
      if (currentLevel > 5) {
        currentLevel = 1;
      }
      initializeGame();
    }
  }
}

function spawnFood() {
  let x = random(-width, 0);
  let y = random(height);
  food.push(new Food(x, y, 10, currentLevel));
}

//Powerup
function powerUp() {
  player.size += 4;
  checkNextLevel();
}

function checkNextLevel() {
  let playerArea = PI * sq(player.size / 2);
  let screenArea = width * height;

  if (playerArea / screenArea > 0.7) {
    if (currentLevel >= 5) {
      hasWon = true; // Set win state if level is 4 or higher
    } else {
      nextLevel = true; // Proceed to next level
    }
  }
}

function showWinScreen() {
  background(255, 0, 255); // Set background color for win screen
  fill(255, 255, 0); // Set text color to white
  textSize(50);
  textFont(myFont);
  textAlign(CENTER, CENTER);
  text("YOU WIN!", width / 2, height / 2); // Display win message
}

function checkCollision(object1, object2) {
  return object1.hitbox.intersects(object2.hitbox);
}

class Player {
  constructor(size, level) {
    this.x = width / 2;
    this.y = height - height / 7;
    this.size = size;
    this.level = level;
    this.hitbox = new Hitbox(this.x, this.y, this.size, this.size);
    this.updateHitbox();
  }

  updateHitbox() {
    let hitboxWidth, hitboxHeight;

    switch (this.level) {
      case 1: // Dino
        hitboxWidth = this.size; // Adjust width for dino
        hitboxHeight = this.size; // Adjust height for dino

        break;
      case 2: // Giraffe
        hitboxWidth = this.size * 1.5; // Adjust width for giraffe
        hitboxHeight = this.size * 1.5; // Adjust height for giraffe

        break;
      case 3:
        // Seal
        hitboxWidth = this.size * 0.8; // Width for seal
        hitboxHeight = this.size * 0.6; // Height for seal
        break;
      case 4:
        // Cat
        hitboxWidth = this.size * 1.5; // Width for cat
        hitboxHeight = this.size * 1.5; // Height for cat
        break;
      case 5:
        // Bird
        hitboxWidth = this.size * 4;
        hitboxHeight = this.size * 10;
        break;

      default:
        hitboxWidth = this.size;
        hitboxHeight = this.size;
    }

    // Center the hitbox around the player's position
    this.hitbox.x = this.x - hitboxWidth / 2;
    this.hitbox.y = this.y - hitboxHeight / 2;
    this.hitbox.width = hitboxWidth;
    this.hitbox.height = hitboxHeight;
  }

  show() {
    push();
    translate(this.x, this.y);
    scale(this.size / 100);

    switch (this.level) {
      case 1:
        this.drawDino();
        break;
      case 2:
        this.drawGiraffe();
        break;
      case 3:
        this.drawSeal();
        break;
      case 4:
        this.drawCat();
        break;
      case 5:
        this.drawBird();
        break;
    }

    pop();
  }

  drawSeal() {
    fill(255, 255, 255);
    stroke(2);
    ellipse(0, 0, 100);
    ellipse(50, 0, 15);
    ellipse(-50, 0, 15);
    fill(29);
    stroke(6);
    ellipse(-25, 20, 15);
    ellipse(25, 20, 15);
    triangle(10, 30, -10, 30, 0, 40);
    line(-25, 35, -60, 35);
    line(20, 35, 55, 35);
    line(20, 35, 55, 60);
    line(-25, 35, -60, 60);
  }

  drawCat() {
    scale(0.4);
    fill(255, 155, 0);
    stroke(0);
    strokeWeight(4);
    ellipse(0, 0, 40, 50);
    triangle(-240, -50, -240, -250, -150, -180);
    triangle(120, -180, 210, -250, 240, -50);
    ellipse(0, 0, 500, 450);
    fill(0, 150, 0);
    ellipse(-150, -10, 100, 60);
    ellipse(140, -10, 100, 60);
    fill(0);
    ellipse(140, -10, 20, 60);
    ellipse(-150, -10, 20, 60);
    stroke(0);
    strokeWeight(4);
    line(-80, 70, -400, 70);
    line(-80, 90, -400, 160);
    line(100, 70, 400, 70);
    line(100, 90, 400, 160);
    noFill();
    stroke(0);
    strokeWeight(4);
    arc(40, 120, 80, 80, 0, PI + QUARTER_PI);
    arc(-30, 120, 80, 80, -PI + QUARTER_PI * 3, HALF_PI + QUARTER_PI * 2);
    fill(255, 165, 255);
    triangle(-50, 60, 5, 100, 60, 60);
  }

  drawDino() {
    scale(0.5);
    translate(-200, -200);
    //Krone
    noStroke(0);
    fill(0, 165, 45);
    ellipse(100, 220, 100);
    ellipse(90, 160, 100);
    ellipse(110, 100, 100);
    ellipse(200, 70, 120);
    ellipse(300, 220, 100);
    ellipse(310, 160, 100);
    ellipse(290, 100, 100);
    ellipse(200, 170, 250, 220);
    //Kopf
    stroke(1);
    fill(0, 124, 78);
    ellipse(200, 200, 200, 180);
    //Schnauze
    fill(0, 165, 45);
    ellipse(200, 260, 100, 80);
    //Augen, Nase
    fill(0);
    ellipse(140, 210, 20);
    ellipse(260, 210, 20);
    ellipse(235, 250, 10);
    ellipse(165, 250, 10);

    //Mund
    noFill();
    strokeWeight(2);
    arc(200, 260, 80, 50, 0, PI);
    //Horn
    fill(255);
    noStroke();
    triangle(170, 235, 200, 160, 230, 235);
    triangle(120, 160, 110, 110, 160, 130);
    triangle(280, 160, 290, 110, 240, 130);
  }

  drawGiraffe() {
    translate(-200, -200);
    noStroke();
    fill(189, 108, 0);
    //Horn
    ellipse(170, 90, 25);
    ellipse(220, 90, 25);
    rect(162, 90, 15, 50);
    rect(212, 90, 15, 50);
    //Ohr
    ellipse(280, 150, 80, 50);
    ellipse(120, 150, 80, 50);
    fill(255, 176, 49);
    //Kopf
    ellipse(200, 200, 150, 100);
    triangle(135, 220, 200, 300, 265, 220);
    fill(224, 130, 6);
    triangle(155, 150, 200, 290, 245, 150);
    quad(130, 180, 168, 135, 270, 180, 232, 135);
    ellipse(200, 150, 80, 50);
    //Nase
    fill(189, 108, 0);
    ellipse(200, 275, 70, 60);
    //Augen, Nase
    fill(0);
    ellipse(142, 195, 35);
    ellipse(257, 195, 35);
    ellipse(210, 265, 10, 15);
    ellipse(190, 265, 10, 15);
    fill(255);
    ellipse(138, 185, 5);
    ellipse(252, 185, 5);
    //Mund
    stroke(0);
    strokeWeight(2);
    noFill(0);
    arc(200, 285, 30, 20, 0, PI);
    //Wimpern
    line(110, 190, 140, 180);
    line(110, 195, 140, 180);
    line(290, 190, 260, 180);
    line(290, 195, 260, 180);
  }

  drawBird() {
    translate(-120, -120);
    scale(0.6);
    noStroke();
    fill(0, 150, 255);
    rect(90, 100, 226, 200, 90, 90, 80, 80); //Kopf
    fill(223, 217, 207);
    quad(265, 200, 300, 200, 220, 250, 185, 250); //Braue
    quad(105, 200, 140, 200, 220, 250, 185, 250); //Braue
    fill(255, 162, 1);
    quad(200, 220, 230, 250, 200, 270, 170, 250); //Schnabel

    fill(0);
    ellipse(140, 225, 40); //Auge s
    ellipse(270, 225, 40); //Auge s
    fill(255);

    ellipse(142, 223, 20); //Auge w
    ellipse(268, 223, 20); //Auge w
  }

  move() {
    if (keyIsDown(UP_ARROW)) {
      this.y -= 5;
    }
    if (keyIsDown(DOWN_ARROW)) {
      this.y += 5;
    }
    if (keyIsDown(RIGHT_ARROW)) {
      this.x += 5;
    }
    if (keyIsDown(LEFT_ARROW)) {
      this.x -= 5;
    }
    this.x = constrain(this.x, this.size / 2, width - this.size / 2);
    this.y = constrain(this.y, this.size / 2, height - this.size / 2);
    this.updateHitbox();
  }
}

class Food {
  constructor(x, y, size, level) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.level = level;
    this.updateHitbox();
  }

  updateHitbox() {
    let hitboxSize = this.size * 2;
    let offsetX = 0;
    let offsetY = 0;

    // Leaf
    if (this.level === 1) {
      offsetX = this.size * 7.8;
      offsetY = this.size * 8;
      // Friut
    } else if (this.level === 2) {
      hitboxSize = this.size * 2;
      offsetX = this.size * 3.8;
      offsetY = this.size * 4;
    }
    // Fish
    else if (this.level === 3) {
      offsetX = 0;
      offsetY = 0;
    }
    // Mouse
    else if (this.level === 4) {
      offsetX = this.size * 8;
      offsetY = this.size * 3;
    }
    // Worm
    else if (this.level === 5) {
      offsetX = this.size * 7;
      offsetY = this.size * 7;
    }

    this.hitbox = new Hitbox(
      this.x - hitboxSize / 2 + offsetX,
      this.y - hitboxSize / 2 + offsetY,
      hitboxSize,
      hitboxSize
    );
  }

  show() {
    push();
    translate(this.x, this.y);
    scale(0.4);

    switch (this.level) {
      case 1:
        this.drawLeaf();
        break;
      case 2:
        this.drawFruit();
        break;
      case 3:
        this.drawFish();
        break;
      case 4:
        this.drawMouse();
        break;
      case 5:
        this.drawWorm();
        break;
    }

    pop();
  }

  drawFish() {
    fill(255, 165, 0);
    ellipse(0, 0, 130, 80);
    quad(-50, -55, 30, -45, 30, -30, -40, -30);
    triangle(-85, -50, -55, 0, -85, 60);
    push();
    fill(0);
    ellipse(40, 0, 20);
    pop();
    fill(255);
    ellipse(42, 0, 10);
  }

  drawMouse() {
    fill(100);
    arc(200, 100, 80, 60, PI, 0);
    ellipse(210, 60, 30, 40);
    fill(255);
    ellipse(220, 90, 13);
    fill(0);
    ellipse(220, 90, 10);
    stroke(0);
    line(100, 90, 160, 99);
  }

  drawLeaf() {
    noStroke();
    fill(177, 127, 74);
    ellipse(200, 200, 30, 50);
    stroke(0);
    line(200, 150, 200, 225);
    line(200, 200, 190, 215);
    line(200, 190, 187, 206);
    line(200, 180, 186, 198);
    line(200, 200, 210, 215);
    line(200, 190, 214, 206);
    line(200, 180, 214, 198);
  }

  drawFruit() {
    fill(255, 100, 255);
    noStroke();
    ellipse(100, 100, 40, 50);
    fill(202, 158, 103);
    ellipse(90, 90, 7);
    ellipse(97, 100, 7);
    ellipse(107, 87, 7);
    ellipse(103, 115, 7);
    ellipse(109, 103, 7);
    ellipse(94, 112, 7);
  }

  drawWorm() {
    scale(0.6);
    noStroke();
    fill(255, 154, 139);
    ellipse(310, 290, 55); //Kopf
    noFill();
    strokeWeight(40);
    stroke(255, 154, 139);
    arc(170, 300, 80, 130, PI, 0); //Mitte
    line(210, 300, 300, 300); //Rechts
    line(80, 300, 130, 300); //Links
    fill(0);
    noStroke();
    ellipse(307, 285, 13); //AugeLi
    ellipse(327, 285, 13); //AugeRe
    noFill();
    stroke(255, 0, 0);
    strokeWeight(6);
    arc(320, 300, 22, 15, 0, PI); //Mund
    strokeWeight(8);
    stroke(0, 188, 96);
    line(100, 285, 100, 315); //Streifen
    line(80, 285, 80, 315); //Streifen
    line(240, 285, 240, 315); //Streifen
    line(260, 285, 260, 315); //Streifen
    line(280, 285, 280, 315); //Streifen
    line(230, 285, 200, 315); //Streifen
    line(221, 268, 192, 285); //Streifen
    line(210, 242, 185, 265); //Streifen
    line(170, 220, 170, 252); //Streifen
    line(132, 240, 155, 265); //Streifen
    line(120, 268, 148, 285); //Streifen
    line(115, 282, 138, 315); //Streifen
  }

  move() {
    this.x += 2;
    this.updateHitbox();
  }

  checkCollision() {
    return checkCollision(this, player);
  }

  enemyCollision() {
    return checkCollision(this, enemy);
  }
}
class Enemy {
  constructor(x, y, size, level) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.level = level;
    this.updateHitbox();
  }

  updateHitbox() {
    let hitboxWidth = this.size;
    let hitboxHeight = this.size;
    let offsetX = 0;
    let offsetY = 0;

    // METEOR
    if (this.level === 1) {
      offsetY = -this.size * 0.8;
      offsetX = this.size * 4;
      //LION
    } else if (this.level === 2) {
      offsetY = -this.size;
      offsetX = this.size * 4;
      //ORCA
    } else if (this.level === 3) {
      hitboxWidth *= 4;
      hitboxHeight *= 0.9;
      //CAR
    } else if (this.level === 4) {
      hitboxWidth *= 2;
      hitboxHeight *= 0.8;
      offsetY = -this.size * 0.8;
      offsetX = this.size * 4;
      //WINDOW
    } else if (this.level === 5) {
      hitboxHeight = this.size * 2.3;
      hitboxWidth = this.size * 1.5;
      offsetY = -this.size / 1.6;
      offsetX = this.size;
    }

    this.hitbox = new Hitbox(
      this.x - hitboxWidth / 2 + offsetX,
      this.y - hitboxHeight / 2 + offsetY,
      hitboxWidth,
      hitboxHeight
    );
  }

  show() {
    push();
    translate(this.x, this.y);

    switch (this.level) {
      case 1:
        this.drawMeteor();
        break;
      case 2:
        this.drawLion();
        break;
      case 3:
        this.drawOrca();
        break;
      case 4:
        this.drawCar();
        break;
      case 5:
        this.drawWindow();
        break;
    }

    pop();
  }

  drawOrca() {
    scale(2);
    noStroke();
    fill(0);
    ellipse(0, 0, 200, 60);
    arc(-25, -25, 40, 80, 0 - HALF_PI, HALF_PI);
    arc(-107, 0, 20, 60, 0 - HALF_PI, HALF_PI);
    push();
    fill(255);
    ellipse(60, -10, 30, 15);
    arc(0, 0, 200, 60, 0, PI);
    pop();
    ellipse(68, -7, 5, 5);
    ellipse(20, 30, 20, 40);
  }

  drawCar() {
    translate(this.x, -300);
    scale(0.8);
    noStroke();
    fill(255, 0, 0);
    quad(130, 120, 280, 120, 310, 200, 100, 200);
    quad(310, 200, 360, 205, 360, 270, 310, 270);
    rect(50, 200, 260, 70);
    fill(0);
    ellipse(130, 270, 70);
    ellipse(280, 270, 70);
    fill(255);
    quad(210, 130, 270, 130, 295, 195, 210, 195);
    quad(140, 130, 200, 130, 200, 195, 115, 195);
  }

  drawMeteor() {
    translate(this.x, -400);
    scale(2);
    noStroke();
    fill(200, 0, 0);
    triangle(30, 210, 170, 200, 196, 235);
    triangle(10, 190, 170, 180, 170, 210);
    triangle(50, 160, 200, 165, 170, 190);
    ellipse(200, 200, 70);
    fill(255, 158, 0);
    ellipse(200, 200, 60);
    triangle(30, 190, 175, 185, 175, 205);
    triangle(50, 210, 175, 205, 196, 230);
    triangle(70, 162, 200, 170, 180, 190);
    fill(0);
    ellipse(200, 200, 50);
  }

  drawLion() {
    translate(this.x, -300);
    fill(104, 60, 17);
    triangle(215, 155, 185, 155, 200, 100);
    triangle(185, 155, 155, 175, 140, 110);
    triangle(210, 155, 240, 175, 240, 110);
    triangle(155, 175, 145, 210, 100, 160);
    triangle(235, 165, 260, 210, 290, 160);
    triangle(145, 200, 145, 230, 90, 210);
    triangle(255, 200, 245, 240, 320, 210);
    triangle(145, 230, 155, 250, 100, 270);
    triangle(255, 230, 240, 250, 290, 270);
    triangle(155, 250, 185, 260, 140, 310);
    triangle(245, 250, 210, 260, 270, 310);
    triangle(225, 250, 175, 260, 200, 330);

    fill(249, 178, 51);
    ellipse(140, 190, 40, 40);
    ellipse(260, 190, 40, 40);
    ellipse(200, 210, 120, 120);
    fill(255);
    ellipse(230, 210, 27);
    ellipse(170, 210, 27);
    ellipse(200, 250, 50, 40);
    fill(0);
    ellipse(230, 210, 20);
    ellipse(170, 210, 20);
    triangle(215, 230, 185, 230, 200, 240);
    noFill();
    arc(210, 245, 20, 20, 0, PI + QUARTER_PI);
    arc(190, 245, 20, 20, -PI + QUARTER_PI * 3, HALF_PI + QUARTER_PI * 2);
  }
  drawWindow() {
    translate(0, -200);
    scale(0.8);
    noStroke(0);
    fill(31, 4, 0);
    rect(20, 20, 230, 300); //Rahmen aussen
    fill(0, 215, 255);
    stroke(51, 24, 0);
    rect(40, 40, 190, 260); //Himmel
    noStroke();
    fill(255);
    ellipse(100, 80, 60); //Wolke
    ellipse(130, 90, 40); //Wolke
    ellipse(112, 100, 50); //Wolke
    ellipse(85, 92, 40); //Wolke
    ellipse(120, 75, 40); //Wolke

    noFill();
    stroke(51, 24, 0);
    strokeWeight(12);
    line(135, 39, 135, 302); //Kreuz
    line(39, 180, 232, 180); //Kreuz
  }

  move() {
    this.x += 7;
    this.hitbox.x += 7;
    this.updateHitbox();
  }

  checkCollision() {
    return checkCollision(this, player);
  }
}

class Hitbox {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  intersects(other) {
    return !(
      this.x + this.width < other.x ||
      other.x + other.width < this.x ||
      this.y + this.height < other.y ||
      other.y + other.height < this.y
    );
  }
}

function drawHitboxes() {
  noFill();
  stroke(255, 0, 0); // Red color for hitboxes
  strokeWeight(2); // Thicker lines for visibility
  rect(
    player.hitbox.x,
    player.hitbox.y,
    player.hitbox.width,
    player.hitbox.height
  );
  for (let f of food) {
    rect(f.hitbox.x, f.hitbox.y, f.hitbox.width, f.hitbox.height);
  }
  if (enemyActive) {
    rect(
      enemy.hitbox.x,
      enemy.hitbox.y,
      enemy.hitbox.width,
      enemy.hitbox.height
    );
  }
}
