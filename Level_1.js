let player;
let food = [];
let numberOfFood = 50;
let score = 0;
let gameOver = false;
let enemy;
let enemyActive = false;
let nextLevel = false;
let currentLevel = 1;

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
  stroke(255, 0, 0);
  rect(player.hitbox.x, player.hitbox.y, player.hitbox.width, player.hitbox.height);
  for (let f of food) {
    rect(f.hitbox.x, f.hitbox.y, f.hitbox.width, f.hitbox.height);
  }
  if (enemyActive) {
    rect(enemy.hitbox.x, enemy.hitbox.y, enemy.hitbox.width, enemy.hitbox.height);
  }
}


function draw() {
  if (!gameOver && !nextLevel) {
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
  }

  if (debugMode) {
    drawHitboxes();
  }
}

function drawLevel() {
  switch (currentLevel) {
    case 1:
      background(0, 95, 228);
      break;
    case 2:
      background(0, 255, 156);
      break;
    case 3:
      background(255, 200, 228);
      break;
    case 4:
      background(0, 160, 20);
      break;
  }
}

function getScoreColor() {
  switch (currentLevel) {
    case 1:
      return color(255);
    case 2:
      return color(255, 0, 0);
    case 3:
      return color(0, 0, 255);
    case 4:
      return color(255, 255, 0);
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
  if (score >= 1 && !enemyActive) {
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
      if (currentLevel > 4) {
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
  player.size += 10;
  checkNextLevel();
}

function checkNextLevel() {
  let playerArea = PI * sq(player.size / 2);
  let screenArea = width * height;
  if (playerArea / screenArea > 0.7) {
    nextLevel = true;
  }
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
    let hitboxWidth, hitboxHeight, offsetX, offsetY;
    switch (this.level) {
      case 1: // Seal
        hitboxWidth = this.size * 0.8;
        hitboxHeight = this.size * 0.6;
        offsetX = 0;
        offsetY = this.size * 0.1;
        break;
      case 2: // Cat
        hitboxWidth = this.size*1.5;
        hitboxHeight = this.size*1.5;
        offsetX = 0;
        offsetY = -this.size * 0.1;
        break;
      case 3: // Dino
        hitboxWidth = this.size/3;
        hitboxHeight = this.size*3;
        offsetX = this.size*0.3;
        offsetY = -this.size*1.3;
        break;
      case 4: // Giraffe
        hitboxWidth = this.size/3;
        hitboxHeight = this.size*3;
        offsetX = -this.size*2.5;
        offsetY = -this.size*1.3;
        break;
      default:
        hitboxWidth = this.size;
        hitboxHeight = this.size;
        offsetX = 0;
        offsetY = 0;
    }
    
    this.hitbox.x = this.x - hitboxWidth / 2 + offsetX;
    this.hitbox.y = this.y - hitboxHeight / 2 + offsetY;
    this.hitbox.width = hitboxWidth;
    this.hitbox.height = hitboxHeight;
  }

  show() {
    push();
    translate(this.x, this.y);
    scale(this.size / 100);

    switch (this.level) {
      case 1:
        this.drawSeal();
        break;
      case 2:
        this.drawCat();
        break;
      case 3:
        this.drawDino();
        break;
      case 4:
        this.drawGiraffe();
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
    noStroke();
    fill(0, 80, 0);
    ellipse(30, -270, 40, 30);
    ellipse(-120, -80, 150, 100);
    quad(30, -260, 10, -270, -70, -100, -45, -80);
    rect(-190, -70, 20, 80);
    rect(-67, -70, 20, 80);
    triangle(-300, 0, -190, -60, -180, -110);
    fill(255);
    ellipse(30, -270, 15);
    fill(0);
    ellipse(30, -270, 10);
  }

  drawGiraffe() {
    stroke(0);
    fill(254, 158, 130);
    ellipse(-260, -260, 60, 40);
    quad(-220, -250, -200, -265, -220, -273, -240, -265);
    rect(-260, -260, 30, 250);
    rect(-260, -15, 10, 100);
    rect(-240, -15, 10, 100);
    rect(-170, -15, 10, 100);
    rect(-150, -15, 10, 100);
    push();
    strokeWeight(4);
    line(-144, -30, -120, 0);
    pop();
    quad(-100, 30, -105, 10, -120, 0, -115, 20);
    rect(-250, -291, 7, 15);
    ellipse(-247, -293, 12);
    ellipse(-260, -260, 60, 40);
    ellipse(-200, -15, 120, 90);
    fill(200);
    ellipse(-260, -260, 20);
    fill(10);
    ellipse(-260, -260, 10);
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
      let hitboxSize = this.size*2;
      let offsetX = 0;
      let offsetY = 0;
  
      // Mouse
      if (this.level === 2) {
        offsetX = this.size*8; // Adjust for mouse position
        offsetY = this.size*3; // Adjust for mouse position
      // Leaf
      } else if (this.level === 3) {
        offsetX = this.size*7.8;
        offsetY = this.size*8;
      }
       // Fruit
      else if (this.level === 4) {
        hitboxSize = this.size*2;
        offsetX = this.size*3.8;
        offsetY = this.size*4;
      }
  
      this.hitbox = new Hitbox(
        this.x - hitboxSize/2 + offsetX,
        this.y - hitboxSize/2 + offsetY,
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
        this.drawFish();
        break;
      case 2:
        this.drawMouse();
        break;
      case 3:
        this.drawLeaf();
        break;
      case 4:
        this.drawFruit();
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

    // ORCA
    if (this.level === 1) {
      hitboxWidth *= 4; 
      hitboxHeight *= 0.9; 
      //CAR
    } else if (this.level === 2) {
      hitboxWidth *= 2; 
      hitboxHeight *= 0.8; 
      offsetY = -this.size * 0.8; 
      offsetX = this.size*4; 
    } else if (this.level === 3) {
      offsetY = -this.size * 0.8; 
      offsetX = this.size*4;  
      //LION    
    } else if (this.level === 4) {
      offsetY =-this.size; 
      offsetX = this.size*4;
    }

    this.hitbox = new Hitbox(
      this.x - hitboxWidth/2 + offsetX,
      this.y - hitboxHeight/2 + offsetY,
      hitboxWidth,
      hitboxHeight
    );
  }

  show() {
    push();
    translate(this.x, this.y);
    //scale(this.size / 50);

    switch (this.level) {
      case 1:
        this.drawOrca();
        break;
      case 2:
        this.drawCar();
        break;
      case 3:
        this.drawMeteor();
        break;
      case 4:
        this.drawLion();
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
    scale(0.8)
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
    return !(this.x + this.width < other.x ||
             other.x + other.width < this.x ||
             this.y + this.height < other.y ||
             other.y + other.height < this.y);
  }
}