export default class Bot {
  constructor(dinoName, gameWidth, gameHeight, gameSpeed) {
    this.width = 100;
    this.height = 75;
    if (dinoName === 'Bash') {
      this.height = 120;
      this.width = 100;
    }
    if (dinoName === 'Comet') {
        this.height = 110;
        this.width = 124.4;
    }
    if (dinoName === 'Fuego') {
        this.height = 100;
        this.width = 112.2;
    }
    if (dinoName === 'Nitro') {
        this.height = 100;
        this.width = 144;
    }
    this.x = 50 + Math.random() * 100; // Start near the player but randomize a bit
    this.y = gameHeight / 2 + this.height / 2 + Math.random() * 100 - 50; // Randomize the vertical position a bit
    this.dy = Math.random() < 0.5 ? -1 : 1; // Initial vertical movement direction
    this.dx = gameSpeed;
    this.speed = gameSpeed + Math.random(); // Bots can be slightly faster or slower than the player
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.color = 'gray'; // or any color you prefer
    this.baseSpeed = gameSpeed;
    this.raceStarted = gameSpeed > 0;
    this.isJumping = false;
    this.boosted = false;
    this.boostSpeed = Math.random() > 0.5; // Randomly boost speed
    this.boundaryRight = this.gameWidth - this.width;
    this.boundaryLeft = 0;
    this.boundaryTop = this.gameHeight * 0.55 - this.height;
    this.boundaryBottom = this.gameHeight - this.height;
    this.stalled = false;

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

    // console.log("Bot Speed:" + this.speed + "Bot pos: " + this.x);

    if (this.stalled) {
      // If the bot is stalled, it remains at its position temporarily
      // this.dx = gameSpeed;
      this.x -= this.speed;
    } else {
      if (Math.random() < 0.01) {
        this.speed += Math.random() * 2 - 1; // Adjust speed randomly (pass or fall behind)
        this.dx = this.speed;
      }
      this.x += this.dx;
    }
    
    // Add random vertical movement for more variety
    if (Math.random() < 0.01) {
      this.y += Math.random() * 10 - 5;
    }
    
    
    // Reset the bot's position if it goes off screen
    if (this.x > this.gameWidth) {
      this.x = -this.width;
    }

    // Keep the bot within the canvas boundaries
    // Block bot from going to the top part of the screen 
    if (!this.isJumping && this.y < this.boundaryTop) this.y = this.boundaryTop;
    // Block Bot from going past the bottom part of the screen
    if (this.y > this.boundaryBottom) this.y = this.boundaryBottom;

    // Block Bot from going too far past the left part of the screen
    if (this.x < this.boundaryLeft - this.width * 2) {
        this.x = this.boundaryLeft - this.width * 2;
        this.boost();
    }
    
    // Speed Bot up if they past the left part of the screen
    // if (this.x < this.boundaryLeft - this.width) {
    //   // this.dx = this.baseSpeed * 4;
    //   this.boost();
    // }

    // Block Bot from going past the right part of the screen
    // if (this.x > this.boundaryRight) {
    //     this.x = this.boundaryRight - this.width;
    //     this
    // }

    // If the bot is back on screen, reset the speed
    if (this.x > this.boundaryRight - this.width * 3) {
      // this.speed = this.baseSpeed; // Reset the speed back to the original
      this.stall(2000);
    }
  }

  boost() {
    this.boosted = true;
    setTimeout(() => {
      this.boosted = false;
    }, 1000);
  }

  stall(delay = 1000) {
    this.stalled = true;
    this.dx = 0;
    let blinkInterval = 200; // blink every 200ms
    let blinkCount = 3;
    let blinkTimeout = setInterval(() => {
      this.image.style.visibility = (blinkCount % 2 === 0) ? 'hidden' : 'visible';
      blinkCount++;
    }, blinkInterval);
    clearInterval(blinkTimeout); // stop blinking
    this.image.style.visibility = 'visible'; // make sure the bot is visible again
    setTimeout(() => {
      this.stalled = false;  // Recover after being stalled
      this.dx = Math.random() * 2 + 1;  // Assign a new speed after stalling
    }, delay); // Stall for 1 second by default
  }
  
  jump() {
    if ((!this.isJumping) && this.speed > 0) {
        let originalPosition = this.y;
        let hangTime = (this.speed * 1000) / 5;
        this.dx += hangTime / 20;
        this.dy -= 15;
        console.log(this.y);
        this.isJumping = true;
        setTimeout(() => {
            this.isJumping = false;
            this.y = originalPosition;
        }, hangTime);
    }
  }
}