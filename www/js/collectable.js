import Collidable from './collidable.js';

export default class Collectable extends Collidable {
  constructor(x, y, speed, lane, preloadedImages) {
    // x, y, width, height, speed, currentLane
    super(x, y, 30, 64.7, speed, lane); // Adjust width and height as needed
    this.image = preloadedImages;
    this.collectSound = new Audio('./assets/sounds/coin.mp3');
    this.collectSound.volume = 0.5;
    
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  playCollectSound() {
    this.collectSound.play();
  }
}