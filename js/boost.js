export default class Boost {
  constructor(gameWidth, gameHeight, gameSpeed) {
      this.width = 60;
      this.height = 40;
      this.x = gameWidth;
      this.y = gameHeight / 2 + Math.random() * (gameHeight / 2 - this.height);
      this.speed = gameSpeed;
      this.image = new Image();
      this.image.src = './assets/DR_VG_Chevron(300x200).png';
      this.boostSound = new Audio('./assets/sounds/powerup.mp3');
      this.boostSound.volume = 0.5;  // Set volume (optional)
  }

  draw(ctx) {
    if (this.image.complete) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = 'yellow';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  update() {
      this.x -= this.speed;
  }

  playBoostSound() {
    this.boostSound.play();
  }
}