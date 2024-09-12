import { update as TWEENUpdate } from 'https://unpkg.com/@tweenjs/tween.js@23.1.3/dist/tween.esm.js';
import Racer from './racer.js';
import Obstacle from './obstacle.js';
import Boost from './boost.js';
import Coin from './coin.js';
import Track from './track.js';

export default class Game {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.gameWidth = this.canvas.width;
    this.gameHeight = this.canvas.height;

    this.initializeGameState();
    this.initializeAudio();
    this.initializeTrack();
  }

  initializeGameState() {
    this.player = null;
    this.racers = [];
    this.bots = [];
    this.gameSpeed = 2;
    this.difficulty_level = 2;
    this.collidables = [];
    this.isGameRunning = false;
    this.coinCount = 0;
    this.dinos = ["Nitro", "Comet", "Fuego", "Bash"];
    this.backgroundImage = new Image();
    this.backgroundImage.src = './assets/VG_BackGround_2.png';
    this.bgX = 0;
    this.backgroundSpeed = 3;
  }

  initializeAudio() {
    this.themeMusic = this.createAudio('./assets/sounds/theme.mp3', true, 0.5);
    this.gameOverSound = this.createAudio('./assets/sounds/game_over.mp3', false, 0.7);
  }

  createAudio(src, loop, volume) {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = volume;
    return audio;
  }

  initializeTrack() {
    this.topBoundary = this.gameHeight / 2;
    this.bottomBoundary = this.gameHeight;
    this.trackHeight = this.bottomBoundary - this.topBoundary;
    this.laneCount = 4;
    this.laneHeight = this.trackHeight / this.laneCount;
    this.track = new Track(this.topBoundary, this.bottomBoundary, this.gameWidth);
    this.track.createLanes(this.laneCount);
  }

  startGame(dinoName) {
    document.getElementById('character-selection').style.display = 'none';
    
    const shuffledLanes = this.shuffleArray([...this.track.lanes]);
    this.player = new Racer(dinoName, this.track, shuffledLanes[0], this.gameHeight, this.gameSpeed, this.gameWidth);
    this.player.setSpeedChangeCallback(this.handlePlayerSpeedChange.bind(this));
    this.bots = this.createBots(dinoName, shuffledLanes.slice(1));
    this.racers = [this.player, ...this.bots];
    
    this.resetGameState();
    this.playCountdown();
    this.gameLoop();

    setTimeout(() => this.startRace(), 3000);
  }

  handlePlayerSpeedChange(newSpeed) {
    this.gameSpeed = newSpeed;
    this.updateSpeeds();
  }

  resetGameState() {
    this.gameSpeed = 0;
    this.collidables = [];
    this.isGameRunning = true;
    this.coinCount = 0;
  }

  playCountdown() {
    const countdownAudio = this.createAudio('./assets/sounds/321go.mp3', false, 0.3);
    countdownAudio.play();
  }

  startRace() {
    this.themeMusic.play();
    this.gameSpeed = 2;
    this.racers.forEach(racer => racer.raceStarted = true);
    this.spawnObjects();
    this.increaseDifficulty();
  }

  stopGame() {
    this.isGameRunning = false;
    document.getElementById('start_over').style.display = 'flex';
    document.getElementById('coin-count').innerHTML = this.coinCount;
    document.getElementById('difficulty').innerHTML = this.difficulty_level;
    this.themeMusic.pause();
    this.themeMusic.currentTime = 0;
    this.gameOverSound.play();
  }

  createBots(chosenDino, availableLanes) {
    const numBots = Math.min(1, availableLanes.length);
    const dinoNames = this.dinos.filter(name => name !== chosenDino);
    
    return Array.from({ length: numBots }, (_, index) => {
      const randomDinoName = dinoNames[index % dinoNames.length];
      return new Racer(randomDinoName, this.track, availableLanes[index], this.gameHeight, this.gameSpeed, this.gameWidth, true);
    });
  }

  spawnObjects() {
    if (!this.isGameRunning) return;

    const lanes = this.shuffleArray([...this.track.lanes]);
    
    this.spawnObject(Obstacle, this.difficulty_level * 0.5, lanes[0]);
    this.spawnObject(Boost, this.difficulty_level * 0.3, lanes[1]);
    this.spawnObject(Coin, this.difficulty_level * 0.15, lanes[2]);

    setTimeout(() => this.spawnObjects(), 1000);
  }

  spawnObject(ObjectClass, probability, lane) {
    if (Math.random() < probability) {
      const object = new ObjectClass(this.gameWidth, lane.yPosition, this.gameSpeed, lane);
      this.collidables.push(object);
    }
  }

  increaseDifficulty() {
    setInterval(() => {
      if (this.isGameRunning) {
        this.difficulty_level += 0.5;
        this.gameSpeed += 0.5;
        this.racers.forEach(racer => racer.setSpeed(this.gameSpeed));
        this.updateSpeeds();
      }
    }, 5000);
  }

  updateSpeeds() {
    this.backgroundSpeed = this.gameSpeed * 1.5;
    this.updateObjectSpeeds();
  }

  updateObjectSpeeds() {
    this.collidables.forEach(obj => obj.speed = this.gameSpeed);
  }

  updateObjects() {
    this.collidables = this.collidables.filter((obj, index) => {
      obj.update();
      obj.draw(this.ctx);
      
      // Check collisions for all racers
      for (const racer of this.racers) {
        if (this.detectCollision(racer, obj)) {
          this.handleCollision(racer, obj);
          return false;
        }
      }
      
      return obj.x + obj.width >= 0;
    });
  }

  handleCollision(racer, obj) {
    if (obj instanceof Boost) {
      racer.applyBoost(obj);
      if (racer === this.player) {
        obj.boostSound.play();
      }
      this.updateSpeeds();
    } else if (obj instanceof Coin) {
      this.collectCoin(obj, racer);
    } else if (obj instanceof Obstacle) {
      if (racer === this.player) {
        this.isGameRunning = false;
      } else {
        // Handle bot collision with obstacle (e.g., slow down)
        racer.stall();
      }
    }
  }

  collectCoin(coin, racer) {
    if (racer === this.player) {
      this.coinCount++;
      coin.playCoinSound();
    } else {
      // Optionally track bot coin collection
      racer.coinCount = (racer.coinCount || 0) + 1;
    }
  }

  detectCollision(racer, item) {
    if (racer.currentLane !== item.currentLane) return false;

    const padding = item instanceof Obstacle ? { x: racer.width * 0.25, y: racer.height * 0.25 } : { x: 0, y: 0 };
    return this.detectRectangularCollision(racer, item, padding.x, padding.y);
  }

  detectRectangularCollision(obj1, obj2, paddingX = 0, paddingY = 0) {
    return (
      obj1.x < obj2.x + obj2.width - paddingX &&
      obj1.x + obj1.width - paddingX > obj2.x &&
      obj1.y < obj2.y + obj2.height - paddingY &&
      obj1.y + obj1.height - paddingY > obj2.y
    );
  }

  drawBackground() {
    if (this.gameSpeed > 0) {
      this.bgX -= this.backgroundSpeed;
      if (this.bgX <= -this.gameWidth * 4) this.bgX = 0;
    }
    
    const numTiles = Math.ceil(this.gameWidth / this.backgroundImage.width) + 4;
    
    for (let i = 0; i < numTiles; i++) {
      this.ctx.drawImage(this.backgroundImage, this.bgX + i * this.backgroundImage.width, 0, this.backgroundImage.width, this.gameHeight);
    }
  }

  drawCoinTally() {
    this.drawInfoBox(`Pickles: ${this.coinCount}`, this.gameWidth - 170, 10, 150, 40);
  }

  drawDifficulty() {
    this.drawInfoBox(`Difficulty: ${this.difficulty_level}`, 20, 10, 180, 40);
  }

  drawInfoBox(text, x, y, width, height) {
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = 'white';
    this.drawRoundedRect(x, y, width, height);
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(text, x + 10, y + 27);
  }

  drawRoundedRect(x, y, width, height) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + 10, y);
    this.ctx.lineTo(x + width - 10, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + 10);
    this.ctx.lineTo(x + width, y + height - 10);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - 10, y + height);
    this.ctx.lineTo(x + 10, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - 10);
    this.ctx.lineTo(x, y + 10);
    this.ctx.quadraticCurveTo(x, y, x + 10, y);
    this.ctx.closePath();
    this.ctx.fill();
  }

  gameLoop() {
    if (!this.isGameRunning) {
      this.stopGame();
      return;
    }
    this.ctx.clearRect(0, 0, this.gameWidth, this.gameHeight);
    this.drawBackground();
    this.track.draw(this.ctx);
    this.updateObjects();
    
    this.racers.sort((a, b) => a.y - b.y).forEach(racer => {
      racer.update();
      racer.draw(this.ctx);
    });

    this.drawCoinTally();
    this.drawDifficulty();
    
    requestAnimationFrame(this.gameLoop.bind(this));
    TWEENUpdate();
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}