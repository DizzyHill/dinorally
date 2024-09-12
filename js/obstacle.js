import Collidable from './collidable.js';

export default class Obstacle extends Collidable {
  constructor(x, y, speed, currentLane) {
    super(x, y, 50, 50, speed, currentLane); // Adjust width and height as needed
    this.image = new Image();
    this.obstacleImages = [
        './assets/obstacles/DR_VG_boulder(250x300).png',
        './assets/obstacles/DR_VG_tire(250x350).png'    // Add more images here
    ];

    // Randomly select one image from the array
    const randomImageIndex = Math.floor(Math.random() * this.obstacleImages.length);
    this.image.src = this.obstacleImages[randomImageIndex];
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}