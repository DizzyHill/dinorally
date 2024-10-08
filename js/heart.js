import Collidable from './collidable.js';

export default class Heart extends Collidable {
  constructor(x, y, speed, lane, preloadedImages, coinSound) {
    // x, y, width, height, speed, currentLane
    super(x, y, 30, 30, speed, lane); // Adjust width and height as needed
    this.image = preloadedImages;
    this.collectSound = coinSound;
    this.collectSound.volume = 0.5;
    
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  playCollectSound() {
    this.collectSound.play();
  }
}