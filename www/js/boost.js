import Collidable from './collidable.js';

export default class Boost extends Collidable {
  constructor(x, y, speed, currentLane, preloadedImages, boostSound) {
    super(x, y, 70, 50, speed, currentLane); // Adjust width and height as needed
    this.image = preloadedImages;
    this.boostSound = boostSound;
    this.boostSound.volume = 0.5;  // Set volume (optional)
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  playBoostSound() {
    this.boostSound.play();
  }
}