// player.js
export default class Player {
  constructor(dinoName, color, gameHeight, gameSpeed, gameWidth) {
        this.width = 100;
        this.height = 75;
        if (dinoName === 'Bash') {
            this.height = 100;
            this.width = 80.5;
        }
        if (dinoName === 'Comet') {
            this.height = 100;
            this.width = 113.1;
        }
        if (dinoName === 'Fuego') {
            this.height = 100;
            this.width = 112.2;
        }
        if (dinoName === 'Nitro') {
            this.height = 100;
            this.width = 144;
        }
        this.x = 50;
        this.y = gameHeight / 2 - this.height / 2;
        this.dy = 0;
        this.dx = 0;
        this.color = color;
        this.baseSpeed = gameSpeed; 
        this.speed = gameSpeed;
        this.boosted = false;
        this.isJumping = false;
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.boundaryRight = this.gameWidth - this.width;
        this.boundaryLeft = 0;
        this.boundaryTop = this.gameHeight * 0.55 - this.height;
        this.boundaryBottom = this.gameHeight - this.height;
        this.oscillationAmplitude = 0.03; // Vertical oscillation amplitude
        this.oscillationFrequency = 0.05; // Vertical oscillation frequency
        this.oscillationPhase = 0; // Initial phase for oscillation

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

    // // Visualize the hitbox around the player
    // ctx.strokeStyle = 'red'; // Color of the hitbox line
    // ctx.lineWidth = 2; // Thickness of the hitbox line

    // // Draw the original full player hitbox
    // ctx.strokeRect(this.x, this.y, this.width, this.height);

    // // Optional: Draw a reduced hitbox for more precise collision detection
    // const paddingX = this.width * 0.25;
    // const paddingY = this.height * 0.25;
    // ctx.strokeStyle = 'green'; // Different color for the reduced hitbox
    // ctx.strokeRect(
    //     this.x + paddingX / 2, // Apply horizontal padding
    //     this.y + paddingY / 2, // Apply vertical padding
    //     this.width - paddingX,  // Adjust width for padding
    //     this.height - paddingY  // Adjust height for padding
    // );
  }

  update() {
    // Apply vertical oscillation to simulate running effect
    this.oscillationPhase += this.oscillationFrequency;
    this.y += Math.sin(this.oscillationPhase) * this.oscillationAmplitude;
    this.x += this.dx;
    this.y += this.dy;

    // Block Player from going to the top part of the screen 
    if (!this.isJumping && this.y < this.boundaryTop) this.y = this.boundaryTop;
    // Block Player from going past the bottom part of the screen
    if (this.y > this.boundaryBottom) this.y = this.boundaryBottom;
    // Block Player from going past the left part of the screen
    if (this.x < this.boundaryLeft) {
        this.x = this.boundaryLeft;
    }
    // Block Player from going past the right part of the screen
    if (this.x > this.boundaryRight) {
        this.x = this.boundaryRight;
    }
  }
}