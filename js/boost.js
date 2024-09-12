import Collidable from './collidable.js';

export default class Boost extends Collidable {
  constructor(x, y, speed, currentLane) {
    super(x, y, 40, 40, speed, currentLane); // Adjust width and height as needed
    this.image = new Image();
    this.image.src = './assets/DR_VG_Chevron(300x200).png';
    this.boostSound = new Audio('./assets/sounds/powerup.mp3');
    this.boostSound.volume = 0.5;  // Set volume (optional)
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  playBoostSound() {
    this.boostSound.play();
  }
}