let player;
let food = [];
let numberOfFood = 50;
let score = 0;
let gameOver = false;
let enemy;
let enemyActive = false;
let nextLevel = false;
let currentLevel = 1;
let hasWon = false;
let debugMode = false;

let myFont;
let myFont2;

let lastSoundPlayTime = 0;
const soundCooldown = 320;
let leafSound;
let meteorSound;
let fruitSound;
let lionSound;
let fishSound;
let orcaSound;
let mouseSound;
let carSound;
let wormSound;
let windowSound;
let dustSound;
let dogSound;
let coinSound;
let catSound;
let sockSound;
let brickSound;

let gameState = "START";
let playerName = "";
let highScores = [];
let startButton;
let nameInput;
let nameButton;

// html elements (ui)
let uiTrigger = document.getElementById("touch-ui-trigger");
let ui = document.getElementById("touch-ui");
let uiUp = document.getElementById("touch-ui-up");
let uiDown = document.getElementById("touch-ui-down");
let uiLeft = document.getElementById("touch-ui-left");
let uiRight = document.getElementById("touch-ui-right");

function addEventListeners(element, direction) {
  const startMove = (e) => {
    e.preventDefault();
    player[`moving${direction}`] = true;
  };

  const stopMove = (e) => {
    e.preventDefault();
    player[`moving${direction}`] = false;
  };

  // Touch events
  element.addEventListener("touchstart", startMove, { passive: false });
  element.addEventListener("touchend", stopMove, { passive: false });
  element.addEventListener("touchcancel", stopMove, { passive: false });

  // Mouse events
  element.addEventListener("mousedown", startMove);
  element.addEventListener("mouseup", stopMove);
  element.addEventListener("mouseleave", stopMove);
}

addEventListeners(uiUp, "Up");
addEventListeners(uiDown, "Down");
addEventListeners(uiLeft, "Left");
addEventListeners(uiRight, "Right");

uiTrigger.addEventListener("click", () => {
  ui.classList.toggle("active");
});

function preload() {
  myFont = loadFont("assets/LomoWall.otf");
  myFont2 = loadFont("assets/Lomo2.otf");
  leafSound = loadSound("sound/1Leaf.m4a", () =>
    console.log("leaf.wav loaded")
  );
  meteorSound = loadSound("sound/1Meteor.m4a", () =>
    console.log("meteor.wav loaded")
  );
  fruitSound = loadSound("sound/2Fruit.m4a", () =>
    console.log("Fruit.wav loaded")
  );
  lionSound = loadSound("sound/2Lion.m4a", () =>
    console.log("lion.wav loaded")
  );
  fishSound = loadSound("sound/3Fish.m4a", () =>
    console.log("fish.wav loaded")
  );
  orcaSound = loadSound("sound/3Orca.m4a", () =>
    console.log("orca.wav loaded")
  );
  mouseSound = loadSound("sound/4Mouse.m4a", () =>
    console.log("mouse.wav loaded")
  );
  carSound = loadSound("sound/4Car.m4a", () => console.log("car.wav loaded"));
  wormSound = loadSound("sound/5Worm.m4a", () =>
    console.log("worm.wav loaded")
  );
  windowSound = loadSound("sound/5Window.m4a", () =>
    console.log("window.wav loaded")
  );
  dustSound = loadSound("sound/6Dust.m4a", () =>
    console.log("dust.wav loaded")
  );
  dogSound = loadSound("sound/6Dog.m4a", () => console.log("dog.wav loaded"));
  coinSound = loadSound("sound/7Coin.m4a", () =>
    console.log("coin.wav loaded")
  );
  clawSound = loadSound("sound/7Claw.m4a", () =>
    console.log("claw.wav loaded")
  );
  sockSound = loadSound("sound/8Sock.m4a", () =>
    console.log("sock.wav loaded")
  );
  brickSound = loadSound("sound/8Brick.m4a", () =>
    console.log("brick.wav loaded")
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  initializeGame();

  nameInput = createInput();
  nameInput.id("name-input"); // Set the ID for CSS styling
  nameInput.position("auto", "auto");
  nameInput.size(200);

  startButton = createButton("Go!");
  startButton.id("start-button"); // Set the ID for CSS styling
  startButton.position("auto", "auto");
  startButton.mousePressed(startGame);

  nameButton = createButton("Name:");
  nameButton.id("name-button"); // Set the ID for CSS styling
  nameButton.position("auto", "auto");

  // Initially show the input
  nameInput.show();

  startButton.hide();
  nameButton.hide(); // Hide start button initially
}

function startScreen() {
  background(0, 255, 255);
  textFont(myFont);
  textAlign(CENTER, CENTER);
  textSize(150);
  fill(255, 255, 0);
  text("Nom", width / 2, height / 2);

  startButton.show();
  nameInput.show();
  nameButton.show();
}

function startGame() {
  playerName = nameInput.value();
  if (playerName.trim() === "") {
    playerName = "Player";
  }
  gameState = "PLAY";
  nameInput.hide();
  startButton.hide();
  nameButton.hide();
  uiTrigger.classList.add("active");
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

  if (lionSound && lionSound.isPlaying()) {
    lionSound.stop();
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
  switch (gameState) {
    case "START":
      startScreen();
      break;
    case "PLAY":
      if (!gameOver && !nextLevel && !hasWon) {
        drawLevel();

        for (let i = food.length - 1; i >= 0; i--) {
          food[i].show();
          food[i].move();
          if (food[i].checkCollision()) {
            food.splice(i, 1);
            score++;
            spawnFood();
            playLevelSound();
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
        player.update();

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
        showWinScreen();
      }
      break;
  }

  if (debugMode) {
    drawHitboxes();
  }
}
function draw() {
  switch (gameState) {
    case "START":
      startScreen();
      break;
    case "PLAY":
      if (!gameOver && !nextLevel && !hasWon) {
        drawLevel();

        for (let i = food.length - 1; i >= 0; i--) {
          food[i].show();
          food[i].move();
          if (food[i].checkCollision()) {
            food.splice(i, 1);
            score++;
            spawnFood();
            playLevelSound();
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
        player.update();

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
        showWinScreen();
      }
      break;
  }

  if (debugMode) {
    drawHitboxes();
  }
}

function playLevelSound() {
  if (millis() - lastSoundPlayTime > soundCooldown) {
    let currentSound;
    switch (currentLevel) {
      case 1:
        currentSound = leafSound;
        break;
      case 2:
        currentSound = fruitSound;
        break;
      case 3:
        currentSound = fishSound;
        break;
      case 4:
        currentSound = mouseSound;
        break;
      case 5:
        currentSound = wormSound;
        break;
      case 6:
        currentSound = dustSound;
        break;
      case 7:
        currentSound = coinSound;
        break;
      case 8:
        currentSound = sockSound;
        break;
    }

    if (currentSound) {
      currentSound.play();
      lastSoundPlayTime = millis();
    }
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

    case 6:
      background(150, 129, 241);
      break;

    case 7:
      background(255, 152, 123);
      break;

    case 8:
      background(215, 255, 164);
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

    case 6:
      return color(0, 255, 0);

    case 7:
      return color(0, 181, 255);

    case 8:
      return color(255, 159, 221);
  }
}

function showGameOverScreen() {
  background(0, 0, 255);
  fill(255, 0, 0);
  textSize(50);
  textFont(myFont);
  textAlign(CENTER, CENTER);
  text("GAME‡OVER", width / 2, height / 2);
  textFont(myFont2);
  textSize(30);
  text(`${playerName}: ${score}`, width / 2, height / 2 + 60);

  textFont(myFont);
  fill(0, 255, 0);
  textSize(30);
  text("RESTART", width / 2, height / 2 + 200);
}

function showNextLevelScreen() {
  background(255, 255, 0);
  fill(0, 0, 255);
  textSize(50);
  textFont(myFont);
  textAlign(CENTER, CENTER);
  text("NEXT‡LEVEL", width / 2, height / 2);
  textFont(myFont2);
  textSize(30);
  text(`Score: ${score}`, width / 2, height / 2 + 60);

  textFont(myFont);
  fill(0, 255, 0);
  textSize(30);
  text("Continue", width / 2, height / 2 + 200);
}

//wann Enemy
function checkEnemySpawn() {
  let spawnScore;
  switch (currentLevel) {
    case 1:
      spawnScore = 15;
      break;
    case 2:
      spawnScore = 8;
      break;
    case 3:
      spawnScore = 10;
      break;
    case 4:
      spawnScore = 28;
      break;
    case 5:
      spawnScore = 13;
      break;
    case 6:
      spawnScore = 18;
      break;
    case 7:
      spawnScore = 24;
      break;
    case 8:
      spawnScore = 10;
      break;
    default:
      spawnScore = 15;
  }

  if (score >= spawnScore && !enemyActive) {
    enemyActive = true;
    enemy.x = -200;
    if (currentLevel === 1 && meteorSound) meteorSound.play();
    if (currentLevel === 2 && lionSound) lionSound.play();
    if (currentLevel === 3 && orcaSound) orcaSound.play();
    if (currentLevel === 4 && carSound) carSound.play();
    if (currentLevel === 5 && windowSound) windowSound.play();
    if (currentLevel === 6 && dogSound) dogSound.play();
    if (currentLevel === 7 && clawSound) clawSound.play();
    if (currentLevel === 8 && brickSound) brickSound.play();
  }
}

function mousePressed() {
  if (gameState === "START") {
    if (
      mouseX > width / 2 - 60 &&
      mouseX < width / 2 + 60 &&
      mouseY > height / 2 + 260 &&
      mouseY < height / 2 + 300
    ) {
      uiTrigger.classList.add("active");
      startGame();
    }
  } else if (gameOver) {
    if (
      mouseX > width / 2 - 60 &&
      mouseX < width / 2 + 60 &&
      mouseY > height / 2 + 180 &&
      mouseY < height / 2 + 220
    ) {
      console.log("Restart clicked");
      currentLevel = 1;
      gameOver = false;
      gameState = "PLAY";
      initializeGame();
    }
  } else if (nextLevel) {
    if (
      mouseX > width / 2 - 60 &&
      mouseX < width / 2 + 60 &&
      mouseY > height / 2 + 180 &&
      mouseY < height / 2 + 220
    ) {
      console.log("Continue clicked, current level:", currentLevel);
      nextLevel = false;
      currentLevel++;
      console.log("New level:", currentLevel);
      if (currentLevel > 8) {
        hasWon = true;
      } else {
        initializeGame();
      }
    }
  } else if (hasWon) {
    if (
      mouseX > width / 2 - 60 &&
      mouseX < width / 2 + 60 &&
      mouseY > height / 2 + 180 &&
      mouseY < height / 2 + 220
    ) {
      hasWon = false;
      currentLevel = 1;
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
    console.log(
      "Player big enough for next level, current level:",
      currentLevel
    );
    if (currentLevel >= 8) {
      hasWon = true;
    } else {
      nextLevel = true;
    }
  }
}

function showWinScreen() {
  background(255, 0, 255);
  fill(255, 255, 0);
  textSize(50);
  textFont(myFont);
  textAlign(CENTER, CENTER);
  text("YOU‡WIN!", width / 2, height / 2);
  fill(20, 0, 255);
  textSize(20);
  textFont(myFont2);
  text("©MARIA ZIMMERMANN 2025", width / 2, height - 140);
  text("SOUND: MILO, ZILLA,", width / 2, height - 100);
  text("CARLOTTA, LIV", width / 2, height - 80);
  text("ZHdK CAS CODING FOR THE ARTS", width / 2, height - 40);
}

function checkCollision(object1, object2) {
  return object1.hitbox.intersects(object2.hitbox);
}

class Player {
  constructor(size, level) {
    this.x = width / 2;
    this.y = height - height / 5;
    this.size = size;
    this.level = level;
    this.hitbox = new Hitbox(this.x, this.y, this.size, this.size);
    this.updateHitbox();
    this.moveSpeed = 2;
    this.movingUp = false;
    this.movingDown = false;
    this.movingLeft = false;
    this.movingRight = false;
  }

  updateHitbox() {
    let hitboxWidth, hitboxHeight;

    switch (this.level) {
      case 1: // Dino
        hitboxWidth = this.size;
        hitboxHeight = this.size;
        break;
      case 2: // Giraffe
        hitboxWidth = this.size * 1.5;
        hitboxHeight = this.size * 1.5;
        break;
      case 3: // Seal
        hitboxWidth = this.size * 0.8;
        hitboxHeight = this.size * 0.8;
        break;
      case 4: // Cat
        hitboxWidth = this.size * 1.5;
        hitboxHeight = this.size * 1.5;
        break;
      case 5: // Bird
        hitboxWidth = this.size;
        hitboxHeight = this.size;
        break;
      case 6: // Hoover
        hitboxWidth = this.size / 1.5;
        hitboxHeight = this.size / 1.4;
        break;
      case 7: // Sofa
        hitboxWidth = this.size * 3;
        hitboxHeight = this.size * 1.1;
        break;
      case 8: // WM
        hitboxWidth = this.size;
        hitboxHeight = this.size * 1.4;
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
      case 6:
        this.drawHoover();
        break;
      case 7:
        this.drawSofa();
        break;
      case 8:
        this.drawWM();
        break;
    }

    pop();
  }
  drawDino() {
    scale(0.5);
    translate(-200, -200); //Krone
    noStroke(0);
    fill(0, 165, 45);
    ellipse(100, 220, 100);
    ellipse(90, 160, 100);
    ellipse(110, 100, 100);
    ellipse(200, 70, 120);
    ellipse(300, 220, 100);
    ellipse(310, 160, 100);
    ellipse(290, 100, 100);
    ellipse(200, 170, 250, 220); //Kopf
    stroke(1);
    fill(0, 124, 78);
    ellipse(200, 200, 200, 180); //Schnauze
    fill(0, 165, 45);
    ellipse(200, 260, 100, 80); //Augen, Nase
    fill(0);
    ellipse(140, 210, 20);
    ellipse(260, 210, 20);
    ellipse(235, 250, 10);
    ellipse(165, 250, 10); //Mund
    noFill();
    strokeWeight(2);
    arc(200, 260, 80, 50, 0, PI); //Horn
    fill(255);
    noStroke();
    triangle(170, 235, 200, 160, 230, 235);
    triangle(120, 160, 110, 110, 160, 130);
    triangle(280, 160, 290, 110, 240, 130);
  }
  drawGiraffe() {
    translate(-200, -200);
    noStroke();
    fill(189, 108, 0); //Horn
    ellipse(170, 90, 25);
    ellipse(220, 90, 25);
    rect(162, 90, 15, 50);
    rect(212, 90, 15, 50); //Ohr
    ellipse(280, 150, 80, 50);
    ellipse(120, 150, 80, 50);
    fill(255, 176, 49); //Kopf
    ellipse(200, 200, 150, 100);
    triangle(135, 220, 200, 300, 265, 220);
    fill(224, 130, 6);
    triangle(155, 150, 200, 290, 245, 150);
    quad(130, 180, 168, 135, 270, 180, 232, 135);
    ellipse(200, 150, 80, 50); //Nase
    fill(189, 108, 0);
    ellipse(200, 275, 70, 60); //Augen, Nase
    fill(0);
    ellipse(142, 195, 35);
    ellipse(257, 195, 35);
    ellipse(210, 265, 10, 15);
    ellipse(190, 265, 10, 15);
    fill(255);
    ellipse(138, 185, 5);
    ellipse(252, 185, 5); //Mund
    stroke(0);
    strokeWeight(2);
    noFill(0);
    arc(200, 285, 30, 20, 0, PI); //Wimpern
    line(110, 190, 140, 180);
    line(110, 195, 140, 180);
    line(290, 190, 260, 180);
    line(290, 195, 260, 180);
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

  drawHoover() {
    push();
    angleMode(RADIANS);
    translate(-210, -55);
    stroke(100);
    strokeWeight(10);
    noFill();
    line(202, 55, 85, 55);
    stroke(0);
    line(40, 55, 100, 55);
    arc(40, 80, 50, 50, HALF_PI, -TWO_PI - HALF_PI);
    line(42, 105, 173, 105);
    arc(175, 145, 80, 80, -TWO_PI - HALF_PI, HALF_PI);
    line(175, 185, 145, 185); //Kopf
    stroke(0);
    strokeWeight(1);
    fill(100);
    rect(230, 20, 10, 70);
    fill(20);
    rect(220, 20, 10, 70, 20, 0, 0, 20);
    rect(205, 30, 18, 50, 10, 0, 0, 10); //Body
    fill(200, 200, 2);
    noStroke();
    rect(50, 150, 100, 70, 0, 50, 50, 0);
    fill(0);
    ellipse(125, 185, 20);
    rect(65, 165, 20, 40);
    pop();
  }

  drawSofa() {
    translate(width / 40 - 200, -70);
    fill(0, 128, 0);
    stroke(0);
    strokeWeight(4);
    rect(32, 140, 15, 20); //Fuss
    rect(312, 140, 15, 20); //Fuss
    rect(50, 20, 130, 70, 10, 10, 0, 0); //RückenkissenL
    rect(180, 20, 130, 70, 10, 10, 0, 0); //RückenkissenR
    rect(50, 90, 130, 25, 0, 10, 0, 0); //SitzkissenL
    rect(180, 90, 130, 25, 10, 0, 0, 0); //SitzkissenR
    rect(50, 115, 260, 20); //Unten
    rect(20, 60, 40, 85, 10); //ArmlehneL
    rect(300, 60, 40, 85, 10); //ArmlehneR
  }

  drawWM() {
    scale(0.5);
    translate(-200, -190);
    fill(232, 231, 231);
    strokeWeight(1.5);
    stroke(0);
    rect(100, 50, 200, 273, 7); //Körper
    rect(245, 285, 40, 30, 5); //Filter
    fill(179, 188, 187);
    ellipse(203, 73, 20, 19); //DrehknopfA
    ellipse(285, 65, 10, 9); //Knopf
    rect(281, 74, 8, 10, 1); //Knopf
    ellipse(200, 180, 182, 180); //Trommel1
    fill(130, 137, 137);
    rect(265, 323, 25, 12, 0, 0, 2, 2); //Fuss
    rect(110, 323, 25, 12, 0, 0, 2, 2); //Fuss
    ellipse(203, 73, 15, 14); //DrehknopfI
    fill(136, 172, 145);
    rect(230, 60, 42, 25); //Anzeige
    line(100, 90, 300, 90); //OberteilQ
    line(175, 50, 175, 90); //OberteilH
    line(120, 70, 160, 70); //Fach
    fill(44, 71, 215);
    ellipse(200, 180, 140, 135); //Trommel2
    ellipse(200, 180, 120, 115); //Tromme3
    fill(0);
    ellipse(285, 65, 6, 5); //Knopf
  }
  update() {
    if (this.movingUp) this.y -= this.moveSpeed;
    if (this.movingDown) this.y += this.moveSpeed;
    if (this.movingLeft) this.x -= this.moveSpeed;
    if (this.movingRight) this.x += this.moveSpeed;
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
      offsetX = this.size * 9.1;
      offsetY = this.size * 9.5;
      // Friut
    } else if (this.level === 2) {
      hitboxSize = this.size * 2;
      offsetX = this.size * 3.8;
      offsetY = this.size * 4;
    } // Fish
    else if (this.level === 3) {
      offsetX = 0;
      offsetY = 0;
    } // Mouse
    else if (this.level === 4) {
      offsetX = this.size * 8;
      offsetY = this.size * 3;
    } // Worm
    else if (this.level === 5) {
      offsetX = this.size * 7;
      offsetY = this.size * 7;
    } // Dust
    else if (this.level === 6) {
      hitboxSize = this.size * 2;
      offsetX = this.size * 4;
      offsetY = this.size * 3;
      //Coin
    } else if (this.level === 7) {
      hitboxSize = this.size * 2.3;
      offsetX = this.size * 2.8;
      offsetY = this.size * 3;
      // Sock
    } else if (this.level === 8) {
      hitboxSize = this.size;
      offsetX = this.size * 3.5;
      offsetY = this.size * 5;
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
      case 6:
        this.drawDust();
        break;
      case 7:
        this.drawCoin();
        break;
      case 8:
        this.drawSock();
        break;
    }

    pop();
  }

  drawLeaf() {
    scale(1.2);
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
    scale(1.1);
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

  drawFish() {
    scale(0.8);
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
  drawDust() {
    scale(0.6);
    angleMode(DEGREES);
    fill(200);
    noStroke();
    quad(146, 180, 130, 120, 230, 143, 188, 170);
    quad(150, 80, 228, 102, 230, 143, 110, 130);
    stroke(0);
    strokeWeight(3);
    arc(180, 90, 60, 60, 195, 20, OPEN);
    arc(220, 120, 50, 50, 210, 60, OPEN);
    arc(215, 160, 50, 50, -50, 170, OPEN);
    arc(165, 160, 55, 55, 5, 145, OPEN);
    arc(145, 110, 60, 60, 160, 285, OPEN);
    arc(125, 150, 65, 65, 55, 300, OPEN);
  }

  drawCoin() {
    scale(0.75);
    strokeWeight(1.5);
    stroke(0);
    fill(255, 199, 56);
    ellipse(100, 100, 100); //Aussen
    fill(255, 245, 20);
    ellipse(100, 100, 80); //Innen
  }

  drawSock() {
    scale(0.5);
    noStroke();
    fill(255);
    ellipse(100, 300, 50); //Spitze
    fill(255, 0, 0);
    ellipse(180, 240, 50); //Ferse
    quad(165, 220, 200, 255, 120, 315, 85, 280); //Fuss
    rect(160, 110, 45, 130); //Knöchel
    stroke(255);
    strokeWeight(3);
    noFill();
    arc(205, 248, 50, 50, PI - QUARTER_PI, PI + HALF_PI); //Ferse
    strokeWeight(3);
    line(160, 130, 205, 130); //Streifen
    line(160, 140, 205, 140); //Streifen
    line(160, 150, 205, 150); //Streifen
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
    this.soundPlayed = false;
    this.speed = 0;

    switch (currentLevel) {
      case 1:
        this.speed = 5;
        this.baseY = 150;
        break;
      case 2:
        this.speed = 8;
        this.baseY = 500;
        break;
      case 3:
        this.speed = 6;
        this.baseY = 500;
        break;
      case 4:
        this.speed = 5;
        this.baseY = 250;
        break;
      case 5:
        this.speed = 12;
        this.baseY = 300;
        break;
      case 6:
        this.speed = 7;
        this.baseY = 200;
        break;
      case 7:
        this.speed = 8;
        this.baseY = 500;
        break;
      case 8:
        this.speed = 15;
        this.baseY = 200;
        break;
    }
    this.y = this.baseY;
    this.updateHitbox();
  }

  updateHitbox() {
    let hitboxWidth = this.size;
    let hitboxHeight = this.size;
    let offsetX = 0;
    let offsetY = 0;

    // METEOR
    if (this.level === 1) {
      hitboxHeight = this.size;
      hitboxWidth = this.size * 2;
      offsetY = -this.size + 100;
      offsetX = this.size * 3.5;
      //LION
    } else if (this.level === 2) {
      hitboxHeight = this.size;
      hitboxWidth = this.size;
      offsetY = -this.size + 15;
      offsetX = this.size * 2;
      //ORCA
    } else if (this.level === 3) {
      hitboxWidth *= 4;
      hitboxHeight *= 0.9;
      offsetY = -this.size / 8;
      offsetX = this.size - 110;
      //CAR
    } else if (this.level === 4) {
      hitboxWidth *= 2.5;
      hitboxHeight *= 1;
      offsetY = -this.size * 1.1;
      offsetX = this.size * 1.6;
      //WINDOW
    } else if (this.level === 5) {
      hitboxHeight = this.size * 2.3;
      hitboxWidth = this.size * 1.5;
      offsetY = -this.size / 1.6;
      offsetX = this.size;
      //Dog
    } else if (this.level === 6) {
      hitboxHeight = this.size * 1.8;
      hitboxWidth = this.size * 2.5;
      offsetY = -this.size / 2.5;
      offsetX = this.size * 2;
      //Claw
    } else if (this.level === 7) {
      hitboxHeight = this.size * 1.5;
      hitboxWidth = this.size * 1.2;
      offsetY = -this.size / 2;
      offsetX = this.size * 1.8;
      //Brick
    } else if (this.level === 8) {
      hitboxHeight = this.size / 1.6;
      hitboxWidth = this.size;
      offsetY = -this.size + 150;
      offsetX = this.size / 1.5;
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
      case 6:
        this.drawDog();
        break;
      case 7:
        this.drawClaw();
        break;
      case 8:
        this.drawBrick();
        break;
    }

    pop();
  }
  drawMeteor() {
    translate(0, -400);
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
    translate(0, -300);
    fill(104, 60, 17);
    strokeWeight(1.5);
    stroke(0);
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

  drawDog() {
    translate(0, -200);
    noStroke();
    fill(255);
    triangle(280, 160, 295, 140, 300, 160); //ZAHN
    triangle(300, 165, 315, 145, 315, 165); //ZAHN
    triangle(282, 117, 297, 137, 302, 117); //ZAHN
    triangle(302, 115, 315, 135, 312, 115); //ZAHN
    fill(104, 60, 49);
    rect(100, 150, 130, 60, 40, 0, 0, 0); //Bauch
    rect(100, 200, 23, 60, 5); //Bein
    rect(210, 200, 20, 60, 5); //Bein
    quad(200, 130, 305, 95, 320, 120, 210, 160); //Mund
    quad(210, 130, 320, 160, 315, 180, 210, 170); //Mund
    ellipse(308, 95, 15); //Nase
    triangle(200, 170, 200, 100, 230, 130); //Ohr
    triangle(220, 160, 220, 90, 250, 120); //Ohr
    fill(255, 255, 5);
    ellipse(250, 130, 10); //Auge
    fill(0);
    ellipse(250, 130, 5, 10); //Auge
    strokeWeight(3);
    stroke(0);
    line(245, 120, 260, 122); //Auge
    noFill();
    strokeWeight(10);
    line(380, 130, 500, 130); //Bell
    line(380, 100, 480, 50); //Bell
    line(380, 160, 480, 210); //Bell
    stroke(104, 60, 49);
    arc(110, 110, 100, 100, HALF_PI, -TWO_PI - HALF_PI); //Schwanz
  }

  drawClaw() {
    translate(0, -250);
    noFill();
    strokeWeight(12);
    stroke(0);
    arc(200, 200, 140, 140, TWO_PI + 26, -QUARTER_PI); //Schwanz
    fill(0);
    noStroke();
    ellipse(148, 210, 45); //Fudi
    ellipse(200, 240, 35); //Kopf
    quad(160, 210, 190, 250, 220, 270, 175, 270); //Vorderbeine
    quad(130, 210, 170, 210, 180, 270, 155, 250); //Hinterbeine
    ellipse(208, 247, 20); //Schnauze
    ellipse(216, 248, 8); //Nase
    triangle(180, 240, 202, 210, 200, 240); //Ohr
    triangle(240, 250, 250, 245, 245, 255); //Kralle
    triangle(240, 260, 255, 250, 245, 250); //Kralle
    triangle(240, 260, 255, 255, 245, 252); //Kralle
    fill(255);
    ellipse(208, 240, 5); //Auge w
    fill(0);
    ellipse(209, 241, 3); //Auge s
  }

  drawBrick() {
    noStroke();
    fill(187, 75, 47);
    rect(20, 20, 105, 60); //Background
    fill(135, 74, 57);
    rect(25, 25, 5); //.__.
    rect(25, 70, 5); //.__.
    rect(25, 52, 5, 15); //.__.
    rect(25, 33, 5, 15); //.__.
    rect(35, 25, 5, 15); //___
    rect(35, 42.5, 5, 15); //___
    rect(35, 60, 5, 15); //___
    rect(45, 25, 5); //.__.
    rect(45, 70, 5); //.__.
    rect(45, 52, 5, 15); //.__.
    rect(45, 33, 5, 15); //.__.
    rect(55, 42, 35, 15); //l__l
    rect(95, 25, 5); //.__.
    rect(95, 70, 5); //.__.
    rect(95, 52, 5, 15); //.__.
    rect(95, 33, 5, 15); //.__.
    rect(105, 25, 5, 15); //___
    rect(105, 42.5, 5, 15); //___
    rect(105, 60, 5, 15); //___
    rect(115, 25, 5); //.__.
    rect(115, 70, 5); //.__.
    rect(115, 52, 5, 15); //.__.
    rect(115, 33, 5, 15); //.__.
    rect(55, 25, 5, 15); //_ o
    rect(65, 25, 5, 15); //_ o
    rect(75, 25, 5, 15); //_ o
    rect(85, 25, 5, 15); //_ o
    rect(55, 60, 5, 15); //_ u
    rect(65, 60, 5, 15); //_ u
    rect(75, 60, 5, 15); //_ u
    rect(85, 60, 5, 15); //_ u
  }

  move() {
    this.x += this.speed;
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
  stroke(255, 0, 0);
  strokeWeight(1);
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
