class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.gameWidth = this.canvas.width;
        this.gameHeight = this.canvas.height;
        this.player = null;
        this.gameSpeed = 2;
        this.obstacles = [];
        this.boosts = [];
        this.jumps = [];
        this.coins = [];
        this.isGameRunning = false;
        this.coinCount = 0;
        this.dinos = {
            Nitro: { color: 'red' },
            Comet: { color: 'blue' },
            Fuego: { color: 'green' },
            Bash: { color: 'yellow' }
        };
        this.backgroundImage = new Image();
        this.backgroundImage.src = './assets/VG_BackGround_2.png'; // Replace with your background image path
        this.bgX = 0;
        this.backgroundSpeed = 3;
    }

    startGame(dinoName) {
        document.getElementById('character-selection').style.display = 'none';
        this.player = new Player(dinoName, this.dinos[dinoName].color, this.gameHeight, this.gameSpeed, this.gameWidth); //Build the player object
        this.gameSpeed = 2;
        this.obstacles = [];
        this.boosts = [];
        this.jumps = [];
        this.coins = [];
        this.isGameRunning = true;
        this.coinCount = 0;
        this.spawnObjects();
        this.increaseDifficulty();  // Start increasing game speed
        this.gameLoop();
    }
    
    // Increase difficulty over time
    increaseDifficulty() {
        setInterval(() => {
            if (this.isGameRunning) {
                this.gameSpeed += 0.5;  // Increment game speed every few seconds
                this.updateSpeeds();  // Update background and object speeds

                console.log('Game speed increased:', this.gameSpeed);
            }
        }, 5000); // Increase game speed every 5 seconds
    }

    // Update all speeds
    updateSpeeds() {
        this.backgroundSpeed = this.gameSpeed * 1.5; // Adjust background speed
        this.updateObjectSpeeds(); // Update speeds for all game objects
    }

    // Draw difficulty level on the top left
    drawDifficulty() {
        this.ctx.fillStyle = 'black';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Difficulty: ${this.gameSpeed.toFixed(1)}`, 20, 30); // Display game speed
    }

    // Update game speeds for all objects
    updateObjectSpeeds() {
        this.obstacles.forEach(obstacle => obstacle.speed = this.gameSpeed);
        this.boosts.forEach(boost => boost.speed = this.gameSpeed);
        this.jumps.forEach(jump => jump.speed = this.gameSpeed);
        this.coins.forEach(coin => coin.speed = this.gameSpeed);
    }

    spawnObjects() {
        if (Math.random() < 0.3) this.obstacles.push(new Obstacle(this.gameWidth, this.gameHeight, this.gameSpeed));
        if (Math.random() < 0.06) this.jumps.push(new Jump(this.gameWidth, this.gameHeight, this.gameSpeed));
        if (Math.random() < 0.05) this.boosts.push(new Boost(this.gameWidth, this.gameHeight, this.gameSpeed));
        if (Math.random() < 0.15) this.coins.push(new Coin(this.gameWidth, this.gameHeight, this.gameSpeed));

        if (this.isGameRunning) setTimeout(() => this.spawnObjects(), 1000);
    }

    detectCollision(player, item) {
        return (
            player.x < item.x + item.width &&
            player.x + player.width > item.x &&
            player.y < item.y + item.height &&
            player.y + player.height > item.y
        );
    }

    drawBackground() {
        this.bgX -= this.backgroundSpeed;
        if (this.bgX <= -this.gameWidth * 4) this.bgX = 0;

        const numTiles = Math.ceil(this.gameWidth / this.backgroundImage.width) + 4;

        for (let i = 0; i < numTiles; i++) {
            this.ctx.drawImage(this.backgroundImage, this.bgX + i * this.backgroundImage.width, 0, this.backgroundImage.width, this.gameHeight);
        }
    }

    drawCoinTally() {
        this.ctx.fillStyle = 'black';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Coins: ${this.coinCount}`, this.gameWidth - 120, 30);
    }

    // Helper method to update all game objects (obstacles, boosts, etc.)
    updateObjects(objects) {
        objects.forEach((obj, index) => {
            obj.update();
            obj.draw(this.ctx);
            // Handle boost collision
            if (obj instanceof Boost && this.detectCollision(this.player, obj)) {
                this.player.boosted = true; // Player gets boosted
                const originalSpeed = this.gameSpeed;
                this.gameSpeed *= 4; // Increase game speed by 4x
                this.updateSpeeds(); // Update speeds of all objects and background

                // Revert speed back to original after 1 second
                setTimeout(() => {
                    this.gameSpeed = originalSpeed;
                    this.updateSpeeds(); // Update speeds of all objects and background
                }, 1000);
                objects.splice(index, 1); // Remove the boost after collision
            }
            if (obj instanceof Coin && this.detectCollision(this.player, obj)) {
                this.coinCount++;
                objects.splice(index, 1);
            }
            if (obj instanceof Jump && this.detectCollision(this.player, obj)) {
                objects.splice(index, 1);
            }
            if (obj instanceof Obstacle && this.detectCollision(this.player, obj)) {
                this.isGameRunning = false;
                alert('Game Over! You hit an obstacle.');
                document.getElementById('start_over').style.display = 'block';
            }
            // Remove objects that have gone off-screen
            if (obj.x + obj.width < 0) {
                objects.splice(index, 1);
            }
        });
    }

    gameLoop() {
        if (!this.isGameRunning) return;

        this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);

        this.drawBackground();

        this.player.update();
        this.player.draw(this.ctx);

        this.drawCoinTally();

        // Draw difficulty level
        this.drawDifficulty();

        // Update and draw obstacles, boosts, jumps, and coins
        this.updateObjects(this.obstacles);
        this.updateObjects(this.boosts);
        this.updateObjects(this.jumps);
        this.updateObjects(this.coins);

        // Continue the game loop
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
}

class Player {
    constructor(dinoName, color, gameHeight, gameSpeed, gameWidth) {
        this.width = 100;
        this.height = 75;
        this.x = 50;
        this.y = gameHeight / 2 - this.height / 2;
        this.dy = 0;
        this.dx = 0;
        this.color = color;
        this.baseSpeed = gameSpeed; // Base speed of the player
        this.speed = gameSpeed;
        this.boosted = false;
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;

        // Load the dinosaur image based on the dinoName
        this.image = new Image();
        this.image.src = `./assets/${dinoName}.png`; // Assuming the image filenames match the dino names
    }

    draw(ctx) {
        if (this.image.complete) {
            // Draw the dinosaur image
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // Fallback: Draw a rectangle if the image is not yet loaded
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    update() {
        if (this.boosted) {
            this.speed *= 1.5;
            setTimeout(() => (this.speed = 2), 500);
            this.boosted = false;
        }

        this.x += this.dx;
        this.y += this.dy;
        if (this.y < this.gameHeight / 2 - this.height) this.y = this.gameHeight / 2 - this.height;
        if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height;
        if (this.x > this.gameWidth - this.width) {
            this.x = 50;
            alert('You finished the race! Restarting...');
        }
    }
}

class Obstacle {
    constructor(gameWidth, gameHeight, gameSpeed) {
        this.width = 40;
        this.height = 60;
        this.x = gameWidth;
        this.y = gameHeight / 2 + Math.random() * (gameHeight / 2 - this.height);
        this.speed = gameSpeed;
    }

    draw(ctx) {
        ctx.fillStyle = 'pink';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x -= this.speed;
    }
}

class Jump {
    constructor(gameWidth, gameHeight, gameSpeed) {
        this.width = 30;
        this.height = 10;
        this.x = gameWidth;
        this.y = gameHeight / 2 + Math.random() * (gameHeight / 2 - this.height);
        this.speed = gameSpeed;
    }

    draw(ctx) {
        ctx.fillStyle = 'orange';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x -= this.speed;
    }
}

class Boost {
    constructor(gameWidth, gameHeight, gameSpeed) {
        this.width = 20;
        this.height = 20;
        this.x = gameWidth;
        this.y = gameHeight / 2 + Math.random() * (gameHeight / 2 - this.height);
        this.speed = gameSpeed;
    }

    draw(ctx) {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.x -= this.speed;
    }
}

class Coin {
    constructor(gameWidth, gameHeight, gameSpeed) {
        this.width = 20;
        this.height = 20;
        this.radius = 10;
        this.x = gameWidth;
        this.y = gameHeight / 2 + Math.random
        () * (gameHeight / 2 - this.height);
        this.speed = gameSpeed;
    }

    draw(ctx) {
        ctx.fillStyle = 'gold';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); // Draw a circle
        ctx.fill();
    }

    update() {
        this.x -= this.speed;
    }
}
document.getElementById('character-selection').style.display = 'block';

// Initialize the game when a button is pressed
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game('gameCanvas');
    const startButtons = document.querySelectorAll('.start-game');

    startButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const dinoName = e.target.getAttribute('data-dinoName');
            game.startGame(dinoName);
        });
    });

    // Add keypress event listeners for player movement
    window.addEventListener('keydown', (e) => {
        if (!game.player) return;

        switch (e.key) {
            case 'ArrowUp':
                game.player.dy = -4;
                break;
            case 'ArrowDown':
                game.player.dy = 4;
                break;
            case 'ArrowLeft':
                game.player.dx = -2;
                break;
            case 'ArrowRight':
                game.player.dx = 2;
                break;
        }
    });

    window.addEventListener('keyup', (e) => {
        if (!game.player) return;

        switch (e.key) {
            case 'ArrowUp':
            case 'ArrowDown':
                game.player.dy = 0;
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
                game.player.dx = 0;
                break;
        }
    });
});