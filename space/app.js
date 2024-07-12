// Get the screen dimensions
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

// Create the PIXI application
const app = new PIXI.Application({
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: 0x000000,
  resizeTo: window,
  autoDensity: true,
});

document.body.appendChild(app.view);

// Constants
const ROCKET_SCALE = 0.05;
const UFO_SCALE = 0.1;
const BULLET_SCALE = 0.02;
const INITIAL_GAME_SPEED = 1000;
const SCORE_INCREMENT = 100;
const UFO_FALL_SPEED = 1;
const BULLET_RISE_SPEED = 5;
const SHOOT_COOLDOWN = 500;

// Create the rocket
const rocket = PIXI.Sprite.from('assets/rocket.png');
rocket.scale.set(ROCKET_SCALE);
rocket.x = WIDTH / 2;
rocket.y = HEIGHT - 80;
app.stage.addChild(rocket);

// Create the score text
const scoreText = new PIXI.Text('Score: 0', { fontSize: 24, fill: 0xffffff });
scoreText.x = 10;
scoreText.y = 10;
app.stage.addChild(scoreText);

// Create the legend text
const legendText = new PIXI.Text('Use arrow keys to move, space to shoot', { fontSize: 18, fill: 0xffffff });
legendText.x = 10;
legendText.y = 40;
app.stage.addChild(legendText);

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
let leftButton, rightButton, shootButton;

if (isMobile) {
  createMobileControls();
}

function createMobileControls() {
  leftButton = createButton('<', 10, HEIGHT - 50, leftKeyPressed, leftKeyReleased);
  rightButton = createButton('>', WIDTH - 50, HEIGHT - 50, rightKeyPressed, rightKeyReleased);
  shootButton = createButton('Shoot', WIDTH / 2 - 30, HEIGHT - 50, spaceKeyPressed);
}

function createButton(text, x, y, pointerdown, pointerup) {
  const button = new PIXI.Text(text, { fontSize: 36, fill: 0xffffff });
  button.x = x;
  button.y = y;
  button.interactive = true;
  button.on('pointerdown', pointerdown);
  if (pointerup) {
    button.on('pointerup', pointerup);
    button.on('pointerupoutside', pointerup);
  }
  app.stage.addChild(button);
  return button;
}

// Game variables
let score = 0;
let ufoList = [];
let gameIntervalId;
let gameOverText;
let lastShootTime = 0;

// Keyboard event listeners
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  Space: false,
};

function onKeyDown(e) {
  if (keys.hasOwnProperty(e.code)) keys[e.code] = true;
}

function onKeyUp(e) {
  if (keys.hasOwnProperty(e.code)) keys[e.code] = false;
}

function startGame() {
  score = 0;
  GAME_SPEED = INITIAL_GAME_SPEED;
  app.ticker.add(gameLoop);
  spawnUfo();
}

function gameLoop(delta) {
  if (keys.ArrowLeft && rocket.x > 0) rocket.x -= 5 * delta;
  if (keys.ArrowRight && rocket.x < WIDTH - rocket.width) rocket.x += 5 * delta;
  if (keys.Space) spaceKeyPressed();

  for (let ufo of ufoList) {
    ufo.y += UFO_FALL_SPEED * delta;
    if (ufo.y > HEIGHT) {
      app.stage.removeChild(ufo);
      ufoList = ufoList.filter((u) => u !== ufo);
    }
    if (checkCollision(ufo, rocket)) {
      endGame();
    }
  }
}

function spaceKeyPressed() {
  const now = Date.now();
  if (now - lastShootTime < SHOOT_COOLDOWN) return;
  lastShootTime = now;

  const bullet = PIXI.Sprite.from('assets/bullet.png');
  bullet.scale.set(BULLET_SCALE);
  bullet.x = rocket.x + rocket.width / 2 - bullet.width / 2;
  bullet.y = rocket.y;
  app.stage.addChild(bullet);

  app.ticker.add(() => {
    bullet.y -= BULLET_RISE_SPEED;
    if (bullet.y < -25) {
      app.stage.removeChild(bullet);
    }
    for (const ufo of ufoList) {
      if (checkCollision(bullet, ufo)) {
        app.stage.removeChild(bullet);
        app.stage.removeChild(ufo);
        ufoList = ufoList.filter((u) => u !== ufo);
        score += SCORE_INCREMENT;
        scoreText.text = `Score: ${score}`;
        increaseDifficulty();
        return;
      }
    }
  });
}

function increaseDifficulty() {
  if (score % SCORE_INCREMENT === 0 && GAME_SPEED > 200) {
    GAME_SPEED -= 50;
    clearInterval(gameIntervalId);
    spawnUfo();
  }
}

function spawnUfo() {
  gameIntervalId = setInterval(() => {
    const ufo = PIXI.Sprite.from(`assets/ufo${Math.floor(Math.random() * 2) + 1}.png`);
    ufo.scale.set(UFO_SCALE);
    ufo.x = Math.random() * WIDTH;
    ufo.y = -25;
    app.stage.addChild(ufo);
    ufoList.push(ufo);
  }, GAME_SPEED);
}

function checkCollision(obj1, obj2) {
  const bounds1 = obj1.getBounds();
  const bounds2 = obj2.getBounds();
  return bounds1.x < bounds2.x + bounds2.width &&
    bounds1.x + bounds1.width > bounds2.x &&
    bounds1.y < bounds2.y + bounds2.height &&
    bounds1.y + bounds1.height > bounds2.y;
}

function endGame() {
  clearInterval(gameIntervalId);
  app.ticker.stop();
  gameOverText = new PIXI.Text('GAME OVER', { fontSize: 48, fill: 0xff0000 });
  gameOverText.x = WIDTH / 2 - gameOverText.width / 2;
  gameOverText.y = HEIGHT / 2 - gameOverText.height / 2;
  app.stage.addChild(gameOverText);
  setTimeout(() => {
    createButton('Restart', WIDTH / 2 - 30, HEIGHT / 2 + 50, restartGame);
  }, 1000);
}

function restartGame() {
  app.stage.removeChild(gameOverText);
  score = 0;
  scoreText.text = `Score: ${score}`;
  ufoList.forEach(ufo => app.stage.removeChild(ufo));
  ufoList = [];
  app.ticker.start();
  startGame();
}

function leftKeyPressed() {
  keys.ArrowLeft = true;
}

function leftKeyReleased() {
  keys.ArrowLeft = false;
}

function rightKeyPressed() {
  keys.ArrowRight = true;
}

function rightKeyReleased() {
  keys.ArrowRight = false;
}

startGame();
