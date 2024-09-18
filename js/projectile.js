import Collidable from './collidable.js';

export default class Projectile extends Collidable {
  static explosionSound = new Audio('./assets/sounds/explosion.mp3');
  static projectileSound = new Audio('./assets/sounds/fireball.mp3');

  constructor(x, y, speed, lane, preloadedImages) {
    super(x, y, 100, 100, speed, lane); // Adjust width and height as needed
    this.preloadedImages = preloadedImages;
    this.projectileSound = Projectile.projectileSound;
    this.projectileSound.volume = 0.5;
    this.explosionSound = Projectile.explosionSound;
    this.explosionSound.volume = 0.4;
    // Array to store frames
    this.frames = [];
    // Load the frames
    for (let i = 0; i <= 3; i++) {
        const img = this.preloadedImages[i];
        this.frames.push(img);
    }

    // Frame control variables
    this.currentFrame = 0;      // Start with the first frame
    this.frameInterval = 100;   // Adjust the interval (in ms) for frame switching
    this.lastFrameTime = Date.now(); // Track time to switch frames

  }
  animateFrames() {
    const now = Date.now();

    if (now - this.lastFrameTime > this.frameInterval) {
      // Cycle through frames 1 to 3
      this.currentFrame = (this.currentFrame + 1) % 3 + 1; // +1 to skip the first frame (index 0)
      this.lastFrameTime = now;
    }
    
  }

  update() {
    // super.update(); // Call the parent class update method
    // this.animateFrames(); // Animate the frames
    this.x += this.speed;
  }

  draw(ctx) {
    // console.log(this.frames);
    // Update frames based on raceStarted status
    this.animateFrames();

    // Draw the current frame
    const frame = this.frames[this.currentFrame];

    if (frame.complete) {
      ctx.drawImage(frame, this.x, this.y, this.width, this.height);
      this.projectileSound.play();
    }
  }

  isOffScreen() {
    return this.x > this.gameWidth;
  }
}