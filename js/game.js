import { update as TWEENUpdate } from 'https://unpkg.com/@tweenjs/tween.js@23.1.3/dist/tween.esm.js';
import Racer from './racer.js';
import Obstacle from './obstacle.js';
import Boost from './boost.js';
import Coin from './coin.js';
import Track from './track.js';
import Collectable from './collectable.js';
import Projectile from './projectile.js';

export default class Game {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 1280;
    this.canvas.height = 720;
    this.gameWidth = this.canvas.width;
    this.gameHeight = this.canvas.height;
    this.collectableTypes = ['coin', 'powerup', 'shield']; // Add more types as needed
    this.preloadedImages = {};

    this.initializeGameState();
    this.initializeAudio();
    this.initializeTrack();
  }

  async initializeGameState() {
    this.player = null;
    this.racers = [];
    this.bots = [];
    this.gameSpeed = 5;
    this.difficulty_level = 5;
    this.collidables = [];
    this.isGameRunning = false;

    this.coinCount = 0;
    this.collectableCount = 0;

    this.dinos = ["Nitro", "Comet", "Fuego", "Bash"];
    this.backgroundImage = new Image();
    this.backgroundImage.src = './assets/VG_BackGround_2.png';
    this.bgX = 0;
    this.backgroundSpeed = 3;
    this.projectiles = [];
    await this.preloadImages();
    

  }

  initializeAudio() {
    this.themeMusic = this.createAudio('./assets/sounds/theme.mp3', true, 0.5);
    this.gameOverSound = this.createAudio('./assets/sounds/game_over.mp3', false, 0.7);
    this.coinSound = this.createAudio('./assets/sounds/coin.mp3', false, 0.5);
    this.collectableSound = this.createAudio('./assets/sounds/coin.mp3', false, 0.5);
    this.boostSound = this.createAudio('./assets/sounds/boost.mp3', false, 0.5);
    this.fireballSound = this.createAudio('./assets/sounds/fireball.mp3', false, 0.5);
    this.explosionSound = this.createAudio('./assets/sounds/explosion.mp3', false, 0.5);
    this.racerSounds = {
      // car: this.createAudio('./assets/sounds/car.mp3', false, 0.5),
      jump: this.createAudio('./assets/sounds/jump.mp3', false, 0.5),
    };
    // Add event listener for theme music loop
    this.themeMusic.addEventListener('ended', () => {
      this.themeMusic.playbackRate += 0.1; // Increase speed by 10% each loop
      this.themeMusic.play();
    });
  }

  createAudio(src, loop, volume) {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = volume;
    return audio;
  }

  initializeTrack() {
    this.topBoundary = this.gameHeight  * 0.5;
    this.bottomBoundary = this.gameHeight;
    this.trackHeight = this.bottomBoundary - this.topBoundary;
    this.laneCount = 4;
    this.laneHeight = this.trackHeight / this.laneCount;
    this.track = new Track(this.topBoundary, this.bottomBoundary, this.gameWidth);
    this.track.createLanes(this.laneCount);
  }

  async preloadImages() {
    try {
      await Promise.all([
        this.preloadObstacleImages(),
        this.preloadProjectileImages(),
        // this.preloadRacerImages(),
        this.preloadBoostImages(),
        this.preloadCoinImages(),
        this.preloadCollectableImages(),
        this.preloadExplosionImages()
      ]);
      console.log('All images preloaded successfully');
    } catch (error) {
      console.error('Failed to preload images:', error);
    }
  }

  preloadObstacleImages() {
    return new Promise((resolve, reject) => {
      const imagesToLoad = [
        './assets/obstacles/DR_VG_boulder(250x300).png',
        './assets/obstacles/DR_VG_tire(250x350).png'
      ];
      this.loadImages(imagesToLoad, 'obstacles', resolve, reject);
    });
  }

  preloadExplosionImages() {
    return new Promise((resolve, reject) => {
      const imagesToLoad = [
        './assets/fireball_explosion/explosion_1.png',
        './assets/fireball_explosion/explosion_2.png',
        './assets/fireball_explosion/explosion_3.png'
      ];
      this.loadImages(imagesToLoad, 'explosions', resolve, reject);
    });
  }

  preloadProjectileImages() {
    return new Promise((resolve, reject) => {
      const imagesToLoad = [
        './assets/projectiles/fireball_1.png',
        './assets/projectiles/fireball_2.png',
        './assets/projectiles/fireball_3.png',
        './assets/projectiles/fireball_4.png'
      ];
      this.loadImages(imagesToLoad, 'projectiles', resolve, reject);
    });
  }

  preloadRacerImages() {
    return new Promise((resolve, reject) => {
      const imagesToLoad = this.dinos.flatMap(dino => 
        [1, 2, 3, 4].map(i => `./assets/racers/${dino.toLowerCase()}/${dino.toLowerCase()}_${i}.png`)
      );
      this.loadImages(imagesToLoad, 'racers', resolve, reject);
    });
  }

  preloadBoostImages() {
    return new Promise((resolve, reject) => {
      const imagesToLoad = ['./assets/boost/speedboost.png'];
      this.loadImages(imagesToLoad, 'boosts', resolve, reject);
    });
  }

  preloadCoinImages() {
    return new Promise((resolve, reject) => {
      const imagesToLoad = ['./assets/collectables/DR_VG_pickleWeb(200x300).png'];
      this.loadImages(imagesToLoad, 'coins', resolve, reject);
    });
  }

  preloadCollectableImages() {
    return new Promise((resolve, reject) => {
      const imagesToLoad = ['./assets/collectables/hot_sauce.png'];
      this.loadImages(imagesToLoad, 'collectables', resolve, reject);
    });
  }

  loadImages(imageSources, category, resolve, reject) {
    let loadedCount = 0;
    const totalImages = imageSources.length;

    const onLoad = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        console.log(`All ${category} images loaded successfully`);
        resolve();
      }
    };

    const onError = (src) => {
      console.error(`Failed to load image: ${src}`);
      reject(new Error(`Failed to load image: ${src}`));
    };

    imageSources.forEach(src => {
      const img = new Image();
      img.onload = onLoad;
      img.onerror = () => onError(src);
      img.src = src;
      if (!this.preloadedImages[category]) {
        this.preloadedImages[category] = {};
      }
      this.preloadedImages[category][src] = img;
    });
  }

  startGame(dinoName) {
    document.getElementById('character-selection').style.display = 'none';
    // Shuffle Lanes
    const shuffledLanes = this.shuffleArray([...this.track.lanes]);
    // Create Player
    this.player = new Racer(dinoName, this.track, shuffledLanes[0], this.gameHeight, this.gameSpeed, this.gameWidth, false, 1, this.racerSounds);
    this.player.setSpeedChangeCallback(this.handlePlayerSpeedChange.bind(this));
    // Create Bots
    this.bots = this.createBots(dinoName, shuffledLanes.slice(1));
    // Combine Racers
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
    this.racers.forEach(racer => racer.raceStarted = true);
    this.gameSpeed = 7.5;
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
    const numBots = Math.min(3, availableLanes.length);
    const dinoNames = this.dinos.filter(name => name !== chosenDino);
    
    return Array.from({ length: numBots }, (_, index) => {
      const randomDinoName = dinoNames[index % dinoNames.length];
      return new Racer(randomDinoName, this.track, availableLanes[index], this.gameHeight, this.gameSpeed, this.gameWidth, true, 0, this.racerSounds);
    });
  }

  spawnObjects() {
    if (!this.isGameRunning) return;

    const lanes = this.shuffleArray([...this.track.lanes]);
    
    // Increase obstacle spawn rate based on difficulty level
    const obstacleProbability = Math.min(0.9, 0.1 + this.difficulty_level * 0.01);
    
    // Spawn obstacles in all lanes
    lanes.forEach(lane => {
      this.spawnObject(Obstacle, obstacleProbability, lane);
    });

    // Keep other object spawn rates similar
    this.spawnObject(Boost, this.difficulty_level * 0.03, lanes[1]);
    this.spawnObject(Coin, this.difficulty_level * 0.1, lanes[2]);
    this.spawnObject(Collectable, this.difficulty_level * 0.01, lanes[3]);

    // Decrease spawn interval as difficulty increases
    const spawnInterval = Math.max(200, 1000 - this.difficulty_level * 50);
    setTimeout(() => this.spawnObjects(), spawnInterval);
  }

  spawnObject(ObjectClass, probability, lane) {
    const objectName = ObjectClass.name.toLowerCase() + 's'; // Add 's' to match the preloaded image categories
    if (Math.random() < probability) {
      const randomXOffset = Math.random() * (this.gameWidth / 2);
      
      // // Debug logging
      // console.log('Object name:', objectName);
      // console.log('Preloaded images:', this.preloadedImages);
      // console.log('Image category:', this.preloadedImages[objectName]);
      
      // Check if the category exists and has at least one image
      if (this.preloadedImages[objectName] && Object.keys(this.preloadedImages[objectName]).length > 0) {
        let image, audio;
        // Handle images
        if (objectName === "obstacles") {
          // Put each of the preloaded images into an array
          const imageArray = Object.values(this.preloadedImages[objectName]);
          image = imageArray;
        } else {
          // Get the first image URL from the category
          const imageUrl = Object.keys(this.preloadedImages[objectName])[0];
          image = this.preloadedImages[objectName][imageUrl];
        }

        // Handle audio
        if (objectName === "obstacles") {
          audio = this.explosionSound;
        } else if (objectName === "collectables") {
          audio = this.collectableSound;
        } else if (objectName === "coins") {
          audio = this.coinSound;
        } else if (objectName === "boosts") {
          audio = this.boostSound;
        }

        const object = new ObjectClass(
          this.gameWidth + randomXOffset,
          lane.yPosition,
          this.gameSpeed,
          lane,
          image,
          audio
        );
        this.collidables.push(object);
      } else {
        console.error(`No preloaded images found for category: ${objectName}`);
      }
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
    }, 3500);
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

    // Update and draw projectiles
    this.projectiles = this.projectiles.filter(projectile => {
      projectile.update();
      projectile.draw(this.ctx);

      // Check collisions with racers and obstacles
      for (const racer of this.racers) {
        if (racer !== this.player && this.detectCollision(projectile, racer)) {
          racer.stall(3000);
          projectile.explosionSound.play();
          return false; // Remove the projectile
        }
      }

      for (const obstacle of this.collidables.filter(obj => obj instanceof Obstacle)) {
        if (this.detectCollision(projectile, obstacle)) {
          this.explodeObstacle(obstacle);
          projectile.explosionSound.play();
          return false; // Remove the projectile
        }
      }

      return !projectile.isOffScreen(this.gameWidth);
    });
  }

  explodeObstacle(obstacle) {
    // Remove the obstacle from collidables
    const explosionImages = Object.values(this.preloadedImages['explosions']);
    obstacle.animateExplosion(explosionImages);
    setTimeout(() => {
      this.collidables = this.collidables.filter(obj => obj !== obstacle);
    }, 300);
    // You can add explosion effects or sounds here
  }

  detectCollision(racer, item) {
    if (racer.lane !== item.lane) return false;

    const padding = item instanceof Obstacle ? { x: racer.width * 0.25, y: racer.height * 0.25 } : { x: 0, y: 0 };
    return this.detectRectangularCollision(racer, item, padding.x, 0);
    // return this.detectRectangularCollision(racer, item);
  }

  detectRectangularCollision(obj1, obj2, paddingX = 0, paddingY = 0) {
    return (
      obj1.x < obj2.x + obj2.width - paddingX &&
      obj1.x + obj1.width - paddingX > obj2.x &&
      obj1.y < obj2.y + obj2.height - paddingY &&
      obj1.y + obj1.height - paddingY > obj2.y
    );
  }

  handleCollision(racer, obj) {
    if (obj instanceof Boost) {
      racer.boost();
      if (racer === this.player) {
        obj.boostSound.play();
      }
      this.updateSpeeds();
    } else if (obj instanceof Coin) {
      this.collectCoin(obj, racer);
    } else if (obj instanceof Obstacle) {
      if (racer === this.player) {
        if (this.player.hit()) {
          this.isGameRunning = false;
        }
      } else {
        // Handle bot collision with obstacle (e.g., slow down)
        racer.stall(3000);
      }
    } else if (obj instanceof Collectable) {
      this.collectCollectable(obj, racer);
    }
  }

  collectCollectable(collectable, racer) {
    if (racer === this.player) {
      this.collectableCount++;
      racer.collectCollectable();
      collectable.playCollectSound();
    } else {
      // Optionally track bot collectable collection
      racer.collectableCount = (racer.collectableCount || 0) + 1;
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

  fireProjectile(racer) {
    if (racer.raceStarted && racer.collectableCount > 0) {
      const audio = {
        fireball: this.fireballSound,
        explosion: this.explosionSound
      };

      const projectile = new Projectile(
        racer.x + racer.width,
        racer.y + racer.height / 2,
        this.gameSpeed * 1.5,
        racer.lane,
        Object.values(this.preloadedImages["projectiles"]), 
        audio
      );
      this.projectiles.push(projectile);
      racer.collectableCount--;
    }
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

  // drawCollectableTally() {
  //   this.drawInfoBox(`Acorns: ${this.player.collectableCount}`, this.gameWidth / 2 - 75, 10, 150, 40);
  // }

  drawFireBallTally() {
    this.drawInfoBox(`Fire Balls: ${this.player.collectableCount}`, 20, 10, 180, 40);
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
    this.drawFireBallTally();
    // this.drawCollectableTally();
    requestAnimationFrame(this.gameLoop.bind(this));
    TWEENUpdate();
    // console.log(this.gameSpeed)
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}