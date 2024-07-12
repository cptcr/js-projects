const app = new PIXI.Application();

const ufoList = [];
let score = 0;
let scoreText;
let gameOverText;
let gameSpeed = 1000; // initial game speed

document.body.appendChild(app.view);

const rocket = PIXI.Sprite.from('assets/rocket.png');
rocket.scale.x = 0.05;
rocket.scale.y = 0.05;
rocket.x = 350;
rocket.y = 520;

app.stage.addChild(rocket);

scoreText = new PIXI.Text('Score: 0', { fontSize: 24, fill: 0xffffff });
scoreText.x = 10;
scoreText.y = 10;
app.stage.addChild(scoreText);

gameInterval(function() {
    const ufo = PIXI.Sprite.from('assets/ufo' + `${random(1, 2)}` + '.png');
    ufo.scale.x = 0.1;
    ufo.scale.y = 0.1;
    ufo.x = random(0, 700);
    ufo.y = -25;
    
    app.stage.addChild(ufo);

    ufoList.push(ufo);
    
    flyDown(ufo, 1);

    waitForCollision(ufo, rocket).then(function () {
        app.stage.removeChild(rocket);
        stopGame();
        showGameOverScreen();
    });

    // increase game speed every 100 points
    if (score % 100 === 0 && score > 0) {
        gameSpeed -= 50; // decrease game speed by 50ms
        if (gameSpeed < 200) { // don't make it too fast
            gameSpeed = 200;
        }
    }
}, gameSpeed);

function leftKeyPressed() {
    rocket.x = rocket.x - 5;
}

function rightKeyPressed() {
    rocket.x = rocket.x + 5;
}

function spaceKeyPressed() {
    const bul = PIXI.Sprite.from('assets/bullet.png');
    bul.x = rocket.x + 13;
    bul.y = 500;
    bul.scale.x = 0.02;
    bul.scale.y = 0.02;

    flyUp(bul, 5);

    app.stage.addChild(bul);

    waitForCollision(bul, ufoList).then(function([bul, ufo]) {
        app.stage.removeChild(bul)
        app.stage.removeChild(ufo)
        score += 100;
        scoreText.text = `Score: ${score}`;
        if (score % 100 === 0) {
            blinkScore();
        }
    })
}

function blinkScore() {
    if (score % 100 === 0 && score < 10000) {
        scoreText.tint = 0xffff00; // yellow
        setTimeout(function() {
            scoreText.tint = 0xffffff; // white
        }, 500);
    } else if (score % 10000 === 0 && score < 100000) {
        scoreText.tint = 0xff00ff; // magenta
        setTimeout(function() {
            scoreText.tint = 0xffffff; // white
        }, 500);
    } else if (score % 100000 === 0 && score < 1000000) {
        scoreText.tint = 0x00ffff; // cyan
        setTimeout(function() {
            scoreText.tint = 0xffffff; // white
        }, 500);
    } else if (score % 1000000 === 0) {
        scoreText.tint = 0xff0000; // red
        setTimeout(function() {
            scoreText.tint = 0xffffff; // white
        }, 500);
    }
}

function showGameOverScreen() {
    gameOverText = new PIXI.Text('GAME LOST', { fontSize: 48, fill: 0xff0000 });
    gameOverText.x = app.screen.width / 2 - gameOverText.width / 2;
    gameOverText.y = app.screen.height / 2 - gameOverText.height / 2;
    app.stage.addChild(gameOverText);
    blinkGameOverText();
}

function blinkGameOverText() {
    gameOverText.alpha = 0.5;
    setTimeout(function() {
        gameOverText.alpha = 1;
    }, 500);
    setTimeout(blinkGameOverText, 1000);
}