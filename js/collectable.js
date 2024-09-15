import Collidable from './collidable.js';

export default class Collectable extends Collidable {
  constructor(x, y, speed, lane, type) {
    // x, y, width, height, speed, currentLane
    super(x, y, 30, 64.7, speed, lane); // Adjust width and height as needed
    this.type = type;
    this.image = new Image();
    this.image.src = './assets/collectables/hot_sauce.png';
    // this.image.src = `./assets/${this.type}.png`;
    this.collectSound = new Audio('./assets/sounds/coin.mp3'); // Update with your actual sound path
    this.collectSound.volume = 0.5;  // Set volume (optional)
    
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  playCollectSound() {
    this.collectSound.play();
  }
}