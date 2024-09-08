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
        this.gameWidth = this.canvas.width;
        this.gameHeight = this.canvas.height;
        this.player = null;
        this.bots = [];
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
        this.gameSpeed = 2;
        this.obstacles = [];
        this.boosts = [];
        this.jumps = [];
        this.coins = [];
        this.isGameRunning = true;
        this.coinCount = 0;
        this.bots = this.createBots(dinoName);
        this.spawnObjects();
        this.increaseDifficulty();  // Start increasing game speed
        this.gameLoop();
        // Start playing the theme music when the game starts
        this.themeMusic.play();
    }

    stopGame() {
        this.isGameRunning = false;

        document.getElementById('start_over').style.display = 'flex';
        document.getElementById('coin-count').innerHTML = this.coinCount;
        document.getElementById('difficulty').innerHTML = this.gameSpeed;
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
        if (Math.random() < 0.3) this.obstacles.push(new Obstacle(this.gameWidth, this.gameHeight, this.gameSpeed));
        if (Math.random() < 0.06) this.jumps.push(new Jump(this.gameWidth, this.gameHeight, this.gameSpeed));
        if (Math.random() < 0.05) this.boosts.push(new Boost(this.gameWidth, this.gameHeight, this.gameSpeed));
        if (Math.random() < 0.15) this.coins.push(new Coin(this.gameWidth, this.gameHeight, this.gameSpeed));

        if (this.isGameRunning) setTimeout(() => this.spawnObjects(), 1000);
    }

    // Increase difficulty over time
    increaseDifficulty() {
        setInterval(() => {
            if (this.isGameRunning) {
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
        this.ctx.fillStyle = 'black';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Difficulty: ${this.gameSpeed.toFixed(1)}`, 20, 30); // Display game speed
    }

    updateObjectSpeeds() {
        this.obstacles.forEach(obstacle => obstacle.speed = this.gameSpeed);
        this.boosts.forEach(boost => boost.speed = this.gameSpeed);
        this.jumps.forEach(jump => jump.speed = this.gameSpeed);
        this.coins.forEach(coin => coin.speed = this.gameSpeed);
        this.bots.forEach(bot => bot.speed = this.gameSpeed);
    }

    detectCollision(player, item) {
        if (item instanceof Obstacle) {
            return (
                player.x < item.x + item.width &&
                player.x + player.width * 0.5 > item.x &&
                player.y < item.y + item.height &&
                player.y + player.height * 0.5 > item.y
            );
        } else {
            return (
                player.x < item.x + item.width &&
                player.x + player.width > item.x &&
                player.y < item.y + item.height &&
                player.y + player.height > item.y
            );
        }
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

                this.obstacles.forEach(obstacle => {
                    if (this.detectCollision(obj, obstacle)) {
                        obj.stalled = true;  // Stall the bot when it hits an obstacle
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