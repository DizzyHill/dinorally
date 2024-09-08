// player.js
export default class Player {
  constructor(dinoName, color, gameHeight, gameSpeed, gameWidth) {
      this.width = 100;
      this.height = 75;
      this.x = 50;
      this.y = gameHeight / 2 - this.height / 2;
      this.dy = 0;
      this.dx = 0;
      this.color = color;
      this.baseSpeed = gameSpeed; 
      this.speed = gameSpeed;
      this.boosted = false;
      this.gameWidth = gameWidth;
      this.gameHeight = gameHeight;

      this.image = new Image();
      this.image.src = `./assets/${dinoName}.png`;
  }

  draw(ctx) {
      if (this.image.complete) {
          ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      } else {
          ctx.fillStyle = this.color;
          ctx.fillRect(this.x, this.y, this.width, this.height);
      }
  }

  update() {
      this.x += this.dx;
      this.y += this.dy;

      if (this.y < this.gameHeight / 2 - this.height) this.y = this.gameHeight / 2 - this.height;
      if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height;
      if (this.x > this.gameWidth - this.width) {
          this.x = 50;
          alert('You finished the race! Restarting...');
      }
  }
}