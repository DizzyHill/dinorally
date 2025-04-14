export default class GameCanvas {
  constructor(ctx, gameSpeed) {
    this.gameSpeed = gameSpeed;
    this.ctx = ctx;
    this.gameWidth = ctx.canvas.width;
    this.gameHeight = ctx.canvas.height;
    this.backgroundImage = new Image();
    this.backgroundImage.src = './assets/VG_BackGround_2.png'; // Replace with your background image path
    this.bgX = 0;
    this.backgroundSpeed = 3;
    this.coinCount = 0;
    // Add the theme music
    this.themeMusic = new Audio('./assets/sounds/theme.mp3');
    this.themeMusic.loop = true;  // Loop the music
    this.themeMusic.volume = 0.5; // Set the volume (optional)
    // Add the game over sound
    this.gameOverSound = new Audio('./assets/sounds/game_over.mp3');
    this.gameOverSound.volume = 0.7; // Set the volume (optional)
  }

  drawBackground() {
    // Only move the background if the gameSpeed is greater than 0
    if (this.gameSpeed > 0) {
        this.bgX -= this.backgroundSpeed;
    }

    // Reset the background position when it moves off-screen
    if (this.bgX <= -this.gameWidth * 4) {
        this.bgX = 0;
    }

    // Calculate the number of tiles needed to cover the screen
    const numTiles = Math.ceil(this.gameWidth / this.backgroundImage.width) + 4;

    // Draw the background tiles
    for (let i = 0; i < numTiles; i++) {
        this.ctx.drawImage(this.backgroundImage, this.bgX + i * this.backgroundImage.width, 0, this.backgroundImage.width, this.gameHeight);
    }
}

drawCoinTally() {
    const text = `Pickles: ${this.coinCount}`;
    const fontSize = 20;
    const padding = 10;
    const boxWidth = 150;
    const boxHeight = 40;
    const x = this.gameWidth - boxWidth - 20;
    const y = 10;

    // Set up text style
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.fillStyle = 'black';

    // Draw rounded white box
    this.ctx.beginPath();
    this.ctx.moveTo(x + 10, y); // Start at top-left corner with rounding
    this.ctx.lineTo(x + boxWidth - 10, y); // Top line
    this.ctx.quadraticCurveTo(x + boxWidth, y, x + boxWidth, y + 10); // Top-right corner
    this.ctx.lineTo(x + boxWidth, y + boxHeight - 10); // Right side
    this.ctx.quadraticCurveTo(x + boxWidth, y + boxHeight, x + boxWidth - 10, y + boxHeight); // Bottom-right corner
    this.ctx.lineTo(x + 10, y + boxHeight); // Bottom line
    this.ctx.quadraticCurveTo(x, y + boxHeight, x, y + boxHeight - 10); // Bottom-left corner
    this.ctx.lineTo(x, y + 10); // Left side
    this.ctx.quadraticCurveTo(x, y, x + 10, y); // Top-left corner
    this.ctx.closePath();

    this.ctx.fillStyle = 'white'; // White background for the box
    this.ctx.fill();

    // Draw coin count text inside the box
    this.ctx.fillStyle = 'black'; // Set text color to black
    this.ctx.fillText(text, x + padding, y + 27); // Position text inside the box
}

drawDifficulty() {
    const text = `Difficulty: ${this.difficulty_level}`;
    const fontSize = 20;
    const padding = 10;
    const boxWidth = 180;
    const boxHeight = 40;
    const x = 20;  // Position near the left edge
    const y = 10;  // Position near the top edge

    // Set up text style
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.fillStyle = 'black';

    // Draw rounded white box
    this.ctx.beginPath();
    this.ctx.moveTo(x + 10, y); // Start at top-left corner with rounding
    this.ctx.lineTo(x + boxWidth - 10, y); // Top line
    this.ctx.quadraticCurveTo(x + boxWidth, y, x + boxWidth, y + 10); // Top-right corner
    this.ctx.lineTo(x + boxWidth, y + boxHeight - 10); // Right side
    this.ctx.quadraticCurveTo(x + boxWidth, y + boxHeight, x + boxWidth - 10, y + boxHeight); // Bottom-right corner
    this.ctx.lineTo(x + 10, y + boxHeight); // Bottom line
    this.ctx.quadraticCurveTo(x, y + boxHeight, x, y + boxHeight - 10); // Bottom-left corner
    this.ctx.lineTo(x, y + 10); // Left side
    this.ctx.quadraticCurveTo(x, y, x + 10, y); // Top-left corner
    this.ctx.closePath();

    this.ctx.fillStyle = 'white'; // White background for the box
    this.ctx.fill();

    // Draw difficulty level text inside the box
    this.ctx.fillStyle = 'black'; // Set text color to black
    this.ctx.fillText(text, x + padding, y + 27); // Position text inside the box
  }
}