import Collidable from './collidable.js';

export default class Projectile extends Collidable {
  constructor(x, y, speed, lane) {
    super(x, y, 30, 30, speed, lane); // Adjust width and height as needed
    this.image = new Image();
    this.image.src = './assets/projectiles/fireball_1.png';
    
    // Array to store frames
    this.frames = [];

    // Load the frames
    for (let i = 1; i <= 4; i++) {
        const img = new Image();
        img.src = `./assets/racers/${dinoName}/${dinoName}_${i}.png`;
        this.frames.push(img);
    }

    // Frame control variables
    this.currentFrame = 0;      // Start with the first frame
    this.frameInterval = 100;   // Adjust the interval (in ms) for frame switching
    this.lastFrameTime = Date.now(); // Track time to switch frames
  }
  animateFrames() {
    const now = Date.now();

    if (!this.raceStarted) {
      // Before the race starts, keep showing the first frame
      this.currentFrame = 0;
    } else {
      // After the race starts, loop through frames 1, 2, and 3 (0-indexed as 1, 2, 3)
      if (now - this.lastFrameTime > this.frameInterval) {
          // Cycle through frames 1 to 3
          this.currentFrame = (this.currentFrame + 1) % 3 + 1; // +1 to skip the first frame (index 0)
          this.lastFrameTime = now;
      }
    }
  }

  update() {
    this.x += this.speed;
  }

  draw(ctx) {
    ctx.fillStyle = 'orange'; // Adjust color as needed
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  isOffScreen() {
    return this.x > this.gameWidth;
  }
}