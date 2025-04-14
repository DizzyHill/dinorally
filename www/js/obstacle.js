import Collidable from './collidable.js';

export default class Obstacle extends Collidable {
  constructor(x, y, speed, currentLane, preloadedImages) {
    super(x, y, 50, 50, speed, currentLane); // Adjust width and height as needed
    this.obstacleImages = preloadedImages;
    this.exploded = false;
    this.explosionFrames = [];
    this.currentFrame = 0;
    this.lastFrameTime = 0;
    this.frameInterval = 100; // Adjust the interval for faster or slower animation

    // Randomly select one image from the array
    const randomImageIndex = Math.floor(Math.random() * this.obstacleImages.length);
    this.image = this.obstacleImages[randomImageIndex];
  }

  draw(ctx) {
    if (this.exploded) {
      const currentTime = Date.now();
      if (currentTime - this.lastFrameTime > this.frameInterval) {
        this.currentFrame++;
        this.lastFrameTime = currentTime;
        
        if (this.currentFrame >= this.explosionFrames.length) {
          this.exploded = false;
          this.currentFrame = 0;
        }
      }
      
      ctx.drawImage(
        this.explosionFrames[this.currentFrame],
        this.x,
        this.y,
        this.width,
        this.height
      );
    } else {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  }

  animateExplosion(explosionImages) {
    this.explosionFrames = explosionImages;
    this.exploded = true;
    this.currentFrame = 0;
    this.lastFrameTime = Date.now();
  }
}