import Player from './player.js';
import Obstacle from './obstacle.js';
import Jump from './jump.js';
import Boost from './boost.js';
import Coin from './coin.js';
import Bot from './bot.js';


export default class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gameWidth = this.canvas.width;
        this.gameHeight = this.canvas.height;
        this.player = null;
        this.bots = [];
        this.gameSpeed = 2;
        this.difficulty_level = 2;
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
        // Add the theme music
        this.themeMusic = new Audio('./assets/sounds/theme.mp3');
        this.themeMusic.loop = true;  // Loop the music
        this.themeMusic.volume = 0.5; // Set the volume (optional)
        // Add the game over sound
        this.gameOverSound = new Audio('./assets/sounds/game_over.mp3');
        this.gameOverSound.volume = 0.7; // Set the volume (optional)
    }

    startGame(dinoName) {
        document.getElementById('character-selection').style.display = 'none';
        this.player = new Player(dinoName, this.dinos[dinoName].color, this.gameHeight, this.gameSpeed, this.gameWidth); //Build the player object
        this.gameSpeed = 0;
        this.obstacles = [];
        this.boosts = [];
        this.jumps = [];
        this.coins = [];
        this.isGameRunning = true;
        this.coinCount = 0;
        this.bots = this.createBots(dinoName);
        this.gameLoop();
        // Play the "321go.mp3" file for 6 seconds
        const countdownAudio = new Audio('./assets/sounds/321go.mp3');
        countdownAudio.volume = 0.3;

        countdownAudio.play();
        
        // Wait for 6 seconds before starting the game
        setTimeout(() => {
            // Start the game after 6 seconds
            this.gameSpeed = 2;
            this.bots.stalled = false;
            this.spawnObjects();
            this.increaseDifficulty();  // Start increasing game speed
            

            // Start playing the theme music when the game starts
            this.themeMusic.play();
        }, 3000);
    }

    stopGame() {
        this.isGameRunning = false;

        document.getElementById('start_over').style.display = 'flex';
        document.getElementById('coin-count').innerHTML = this.coinCount;
        document.getElementById('difficulty').innerHTML = this.difficulty_level;
        // Stop the theme music when the game is over
        this.themeMusic.pause();
        this.themeMusic.currentTime = 0;  // Reset the music to the beginning
        this.gameOverSound.play();
    }
    

    createBots(chosenDino) {
        const numBots = 1; // Number of bots
        const dinoNames = ['Nitro', 'Comet', 'Fuego', 'Bash']; // Array of dino names
        const index = dinoNames.indexOf(chosenDino);
        dinoNames.splice(index, 1);
    
        return Array.from({ length: numBots }, () => {
            const randomDinoName = dinoNames[Math.floor(Math.random() * dinoNames.length)]; // Pick a random dino name
            return new Bot(randomDinoName, this.gameWidth, this.gameHeight, this.gameSpeed); // Pass random dino name to BotRacer
        });
    }
    
    spawnObjects() {
        if (Math.random() < 0.5) this.obstacles.push(new Obstacle(this.gameWidth, this.gameHeight, this.gameSpeed));
        if (Math.random() < 0.06) this.jumps.push(new Jump(this.gameWidth, this.gameHeight, this.gameSpeed));
        if (Math.random() < 0.05) this.boosts.push(new Boost(this.gameWidth, this.gameHeight, this.gameSpeed));
        if (Math.random() < 0.15) this.coins.push(new Coin(this.gameWidth, this.gameHeight, this.gameSpeed));

        if (this.isGameRunning) setTimeout(() => this.spawnObjects(), 1000);
    }

    // Increase difficulty over time
    increaseDifficulty() {
        setInterval(() => {
            if (this.isGameRunning) {
                this.difficulty_level += 0.5;
                this.gameSpeed += 0.5;  // Increment game speed every few seconds
                this.updateSpeeds();  // Update background and object speeds
            }
        }, 5000); // Increase game speed every 5 seconds
    }

    updateSpeeds() {
        this.backgroundSpeed = this.gameSpeed * 1.5; // Adjust background speed
        this.updateObjectSpeeds(); // Update speeds for all game objects
    }

    drawDifficulty() {
        const text = `Difficulty: ${this.difficulty_level}`;
        const fontSize = 20;
        const padding = 10;
        const boxWidth = 180;
        const boxHeight = 40;
        const x = 20;  // Position near the left edge
        const y = 10;  // Position near the top edge
    
        // Set up text style
        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.fillStyle = 'black';
    
        // Draw rounded white box
        this.ctx.beginPath();
        this.ctx.moveTo(x + 10, y); // Start at top-left corner with rounding
        this.ctx.lineTo(x + boxWidth - 10, y); // Top line
        this.ctx.quadraticCurveTo(x + boxWidth, y, x + boxWidth, y + 10); // Top-right corner
        this.ctx.lineTo(x + boxWidth, y + boxHeight - 10); // Right side
        this.ctx.quadraticCurveTo(x + boxWidth, y + boxHeight, x + boxWidth - 10, y + boxHeight); // Bottom-right corner
        this.ctx.lineTo(x + 10, y + boxHeight); // Bottom line
        this.ctx.quadraticCurveTo(x, y + boxHeight, x, y + boxHeight - 10); // Bottom-left corner
        this.ctx.lineTo(x, y + 10); // Left side
        this.ctx.quadraticCurveTo(x, y, x + 10, y); // Top-left corner
        this.ctx.closePath();
    
        this.ctx.fillStyle = 'white'; // White background for the box
        this.ctx.fill();
    
        // Draw difficulty level text inside the box
        this.ctx.fillStyle = 'black'; // Set text color to black
        this.ctx.fillText(text, x + padding, y + 27); // Position text inside the box
    }
    

    updateObjectSpeeds() {
        this.obstacles.forEach(obstacle => obstacle.speed = this.gameSpeed);
        this.boosts.forEach(boost => boost.speed = this.gameSpeed);
        this.jumps.forEach(jump => jump.speed = this.gameSpeed);
        this.coins.forEach(coin => coin.speed = this.gameSpeed);
        this.bots.forEach(bot => bot.speed = this.gameSpeed);
    }

    // Helper function for rectangular collision
    detectRectangularCollision(obj1, obj2, paddingX = 0, paddingY = 0) {
        return (
            obj1.x < obj2.x + obj2.width - paddingX &&
            obj1.x + obj1.width - paddingX > obj2.x &&
            obj1.y < obj2.y + obj2.height - paddingY &&
            obj1.y + obj1.height - paddingY > obj2.y
        );
    }

    // Main collision detection function
    detectCollision(player, item) {
        if (item instanceof Obstacle) {
            // Smaller hitbox for obstacles (with optional padding)
            const paddingX = player.width * 0.25;  // Reduce hitbox size by 25% horizontally
            const paddingY = player.height * 0.25; // Reduce hitbox size by 25% vertically
            return this.detectRectangularCollision(player, item, paddingX, paddingY);
        } else {
            // Standard hitbox for other items (no padding)
            return this.detectRectangularCollision(player, item);
        }
    }

    drawBackground() {
        // Only move the background if the gameSpeed is greater than 0
        if (this.gameSpeed > 0) {
            this.bgX -= this.backgroundSpeed;
        }
    
        // Reset the background position when it moves off-screen
        if (this.bgX <= -this.gameWidth * 4) {
            this.bgX = 0;
        }
    
        // Calculate the number of tiles needed to cover the screen
        const numTiles = Math.ceil(this.gameWidth / this.backgroundImage.width) + 4;
    
        // Draw the background tiles
        for (let i = 0; i < numTiles; i++) {
            this.ctx.drawImage(this.backgroundImage, this.bgX + i * this.backgroundImage.width, 0, this.backgroundImage.width, this.gameHeight);
        }
    }

    drawCoinTally() {
        const text = `Pickles: ${this.coinCount}`;
        const fontSize = 20;
        const padding = 10;
        const boxWidth = 150;
        const boxHeight = 40;
        const x = this.gameWidth - boxWidth - 20;
        const y = 10;
    
        // Set up text style
        this.ctx.font = `${fontSize}px Arial`;
        this.ctx.fillStyle = 'black';
    
        // Draw rounded white box
        this.ctx.beginPath();
        this.ctx.moveTo(x + 10, y); // Start at top-left corner with rounding
        this.ctx.lineTo(x + boxWidth - 10, y); // Top line
        this.ctx.quadraticCurveTo(x + boxWidth, y, x + boxWidth, y + 10); // Top-right corner
        this.ctx.lineTo(x + boxWidth, y + boxHeight - 10); // Right side
        this.ctx.quadraticCurveTo(x + boxWidth, y + boxHeight, x + boxWidth - 10, y + boxHeight); // Bottom-right corner
        this.ctx.lineTo(x + 10, y + boxHeight); // Bottom line
        this.ctx.quadraticCurveTo(x, y + boxHeight, x, y + boxHeight - 10); // Bottom-left corner
        this.ctx.lineTo(x, y + 10); // Left side
        this.ctx.quadraticCurveTo(x, y, x + 10, y); // Top-left corner
        this.ctx.closePath();
    
        this.ctx.fillStyle = 'white'; // White background for the box
        this.ctx.fill();
    
        // Draw coin count text inside the box
        this.ctx.fillStyle = 'black'; // Set text color to black
        this.ctx.fillText(text, x + padding, y + 27); // Position text inside the box
    }

    updateObjects(objects) {
        objects.forEach((obj, index) => {
            obj.update();
            obj.draw(this.ctx);

            // Boost
            if (obj instanceof Boost && this.detectCollision(this.player, obj)) {
                this.player.boosted = true;
                const originalSpeed = this.gameSpeed;
                this.gameSpeed *= 4;
                this.updateSpeeds();

                setTimeout(() => {
                    this.gameSpeed = originalSpeed;
                    this.updateSpeeds();
                }, 1000);
                objects.splice(index, 1);
            }
            
            // Coin
            if (obj instanceof Coin && this.detectCollision(this.player, obj)) {
                this.coinCount++;
                // Play the coin sound
                obj.playCoinSound();
                objects.splice(index, 1);
            }

            // Jump
            if (obj instanceof Jump && this.detectCollision(this.player, obj)) {
                objects.splice(index, 1);
            }

            // Obstacle
            if (obj instanceof Obstacle && this.detectCollision(this.player, obj)) {
                this.isGameRunning = false;
            }

            // Bot
            if (obj instanceof Bot) {
                if (this.detectCollision(this.player, obj)) {
                    console.log("You hit a bot.");
                }

                this.coins.forEach((coin, coinIndex) => {
                    if (this.detectCollision(obj, coin)) {
                        this.coins.splice(coinIndex, 1);  // Remove the coin from the game
                    }
                });

                this.obstacles.forEach((obstacle, obstacleIndex) => {
                    if (this.detectCollision(obj, obstacle)) {
                        obj.stall(); // Stall the bot when it hits an obstacle
                        this.obstacles.splice(obstacleIndex, 1);
                    }
                });
            }

            if (obj.x + obj.width < 0) {
                if (!(obj instanceof Bot)) {
                    objects.splice(index, 1);
                }   
            }
        });
    }

    gameLoop() {
        if (!this.isGameRunning) {
            this.stopGame(); // Stop game if it's not running
            return;
        }

        this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);

        this.drawBackground();
        this.updateObjects(this.bots);
        this.player.update();
        this.player.draw(this.ctx);
        this.drawCoinTally();
        this.drawDifficulty();
        this.updateObjects(this.obstacles);
        this.updateObjects(this.boosts);
        this.updateObjects(this.jumps);
        this.updateObjects(this.coins);

        requestAnimationFrame(this.gameLoop.bind(this));
    }
}