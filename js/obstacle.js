// obstacle.js
export default class Obstacle {
  constructor(gameWidth, gameHeight, gameSpeed) {
        this.width = 50;
        this.height = 50;
        this.x = gameWidth;
        this.y = gameHeight / 2 + Math.random() * (gameHeight / 2 - this.height);
        this.boundaryRight = this.gameWidth - this.width;
        this.boundaryLeft = 0;
        this.boundaryTop = this.gameHeight * 0.55 - this.height;
        this.boundaryBottom = this.gameHeight - this.height;
        this.speed = gameSpeed;
        this.obstacleImages = [
            './assets/obstacles/DR_VG_boulder(250x300).png',
            './assets/obstacles/DR_VG_tire(250x350).png'    // Add more images here
        ];

        // Randomly select one image from the array
        const randomImageIndex = Math.floor(Math.random() * this.obstacleImages.length);
        this.image = new Image();
        this.image.src = this.obstacleImages[randomImageIndex];
  }

  draw(ctx) {
    if (this.image.complete) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
        ctx.fillStyle = 'pink';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  update() {
      this.x -= this.speed;

      // Block Player from going to the top part of the screen 
      if (!this.isJumping && this.y < this.boundaryTop) this.y = this.boundaryTop;
      // Block Player from going past the bottom part of the screen
      if (this.y > this.boundaryBottom - this.height * 2) this.y = this.boundaryBottom - this.height * 2;
      // Block Player from going past the left part of the screen
    //   if (this.x < this.boundaryLeft) {
    //       this.x = this.boundaryLeft;
    //   }
      // Block Player from going past the right part of the screen
      if (this.x > this.boundaryRight) {
          this.x = this.boundaryRight;
      }
  }
}