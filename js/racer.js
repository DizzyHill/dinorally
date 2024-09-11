// player.js
import { Tween, Easing } from 'https://unpkg.com/@tweenjs/tween.js@23.1.3/dist/tween.esm.js';

export default class Racer {
  constructor(dinoName, gameHeight, gameSpeed, gameWidth, isBot = false) {
    this.width = 100;
    this.height = 75;
    if (dinoName === 'Bash') {
        this.height = 120;
        this.width = 100;
        this.color = 'red';
    }
    if (dinoName === 'Comet') {
        this.height = 110;
        this.width = 124.4;
        this.color = 'blue';
    }
    if (dinoName === 'Fuego') {
        this.height = 100;
        this.width = 112.2;
        this.color = 'green';
    }
    if (dinoName === 'Nitro') {
        this.height = 100;
        this.width = 144;
        this.color = 'yellow';
    }
    this.isBot = isBot;
    this.x = 50;
    this.y = gameHeight / 2 - this.height / 2;
    this.dy = 0;
    this.dx = 0;
    this.acceleration = 1.5;  // How fast the player accelerates
    this.friction = 0.1;      // How quickly the player decelerates when the key is released
    this.maxSpeed = 4;        // Maximum speed the player can reach
    this.baseSpeed = gameSpeed; 
    this.speed = gameSpeed;
    this.raceStarted = false;
    this.boosted = false;
    this.isMoving = false;
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

    this.shadowBaseWidth = this.width * 0.8;  // Base size of the shadow
    this.shadowBaseHeight = this.height * 0.2; // Base height of the shadow

    // Array to store frames
    this.frames = [];

    // Load the frames
    for (let i = 1; i <= 4; i++) {
        const img = new Image();
        img.src = `./assets/racers/${dinoName}/${dinoName}_${i}.png`;
        this.frames.push(img);
    }

    // Frame control variables
    this.currentFrame = 0;      // Start with the first frame
    this.frameInterval = 100;   // Adjust the interval (in ms) for frame switching
    this.lastFrameTime = Date.now(); // Track time to switch frames
  }
  // Update frame logic based on whether the race has started
  
  animateFrames() {
    const now = Date.now();

    if (!this.raceStarted) {
      // Before the race starts, keep showing the first frame
      this.currentFrame = 0;
    } else {
      // After the race starts, loop through frames 1, 2, and 3 (0-indexed as 1, 2, 3)
      if (now - this.lastFrameTime > this.frameInterval) {
          // Cycle through frames 1 to 3
          this.currentFrame = (this.currentFrame + 1) % 3 + 1; // +1 to skip the first frame (index 0)
          this.lastFrameTime = now;
      }
    }
  }

  botAI() {
    // Add simple AI behavior for bots
    // Example: Move forward with a small chance of jumping
    this.x += this.speed;

    // Random jump logic for bots
    if (Math.random() < 0.01) {
        this.jump();
    }
  }


  // Draw the shadow beneath the player
  drawShadow(ctx) {
    // Determine if the player is jumping
    const shadowY = this.isJumping ? this.shadowFixedY : (this.y + this.height);
    
    let shadowScale = 1;
    if (this.isJumping) {
      // Scale the shadow based on the player's jump height
      shadowScale = 1 - Math.abs(this.y - this.gameHeight / 2) / 200; // Adjust shadow scale based on player's height (adjust the divisor for smoother scale)
      
      // Clamp shadowScale between 0.5 and 1 to ensure it doesn't shrink too much
      shadowScale = Math.max(0.5, Math.min(1, shadowScale));
    }

    // Calculate the shadow's width and height based on the scale
    const shadowWidth = this.shadowBaseWidth * shadowScale;
    const shadowHeight = this.shadowBaseHeight * shadowScale;
    
    // Create a radial gradient for dithering the shadow edges
    const gradient = ctx.createRadialGradient(
      this.x + this.width / 2,  // X position of shadow center
      shadowY,                  // Y position of shadow
      shadowWidth / 4,          // Inner radius (darker part)
      this.x + this.width / 2,  // X position of shadow center
      shadowY,                  // Y position of shadow
      shadowWidth / 2           // Outer radius (lighter, more transparent part)
    );

    // Define gradient color stops to create the dithering effect
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');  // Darker center
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');    // Fully transparent edges

    // Draw the shadow directly underneath the player
    ctx.beginPath();
    ctx.ellipse(
      this.x + this.width / 2,    // Shadow is centered horizontally with the player
      shadowY,                    // Shadow Y position (fixed when jumping)
      shadowWidth / 2,
      shadowHeight / 2,
      0,
      0,
      2 * Math.PI
    );
    ctx.fillStyle = gradient;  // Semi-transparent black shadow
    ctx.fill();
  }

  draw(ctx) {
    // Update frames based on raceStarted status
    this.animateFrames();
    // Draw the shadow first (beneath the player)
    this.drawShadow(ctx);

    // Draw the current frame
    const frame = this.frames[this.currentFrame];

    if (frame.complete) {
        ctx.drawImage(frame, this.x, this.y, this.width, this.height);
    } else {
        // Fallback in case image hasn't loaded yet
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // Visualize the hitbox around the player
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

  // update() {
  //   // console.log("gmae Speed: " + this.speed);
  //   // console.log("Player moving", this.isMoving);
  //   // Apply vertical oscillation to simulate running effect
  //   this.oscillationPhase += this.oscillationFrequency;
  //   this.y += Math.sin(this.oscillationPhase) * this.oscillationAmplitude;
  //   this.x += this.dx;
  //   this.y += this.dy;
    

  //   // Block Player from going to the top part of the screen 
  //   if (!this.isJumping && this.y < this.boundaryTop) this.y = this.boundaryTop;
  //   // Block Player from going past the bottom part of the screen
  //   if (this.y > this.boundaryBottom) this.y = this.boundaryBottom;
  //   // Block Player from going past the left part of the screen
  //   if (this.x < this.boundaryLeft) {
  //       this.x = this.boundaryLeft;
  //   }
  //   // Block Player from going past the right part of the screen
  //   if (this.x > this.boundaryRight) {
  //       this.x = this.boundaryRight;
  //   }
  // }
  update() {
    if (this.isBot) {
      this.botAI(); // Bots will have automated movement logic
    }

    if (!this.isMoving) {
        // Apply friction (deceleration) when not moving
        if (this.dx > 0) {
            this.dx = Math.max(0, this.dx - this.friction);
        } else if (this.dx < 0) {
            this.dx = Math.min(0, this.dx + this.friction);
        }

        if (this.dy > 0) {
            this.dy = Math.max(0, this.dy - this.friction);
        } else if (this.dy < 0) {
            this.dy = Math.min(0, this.dy + this.friction);
        }
    }

    // Update player position
    this.x += this.dx;
    this.y += this.dy;

    // Keep the player within the game bounds (example)
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

  moveUp() {
      if (this.dy > -this.maxSpeed) {
          this.dy -= this.acceleration;  // Accelerate upwards
      }
  }

  moveDown() {
      if (this.dy < this.maxSpeed) {
          this.dy += this.acceleration;  // Accelerate downwards
      }
  }

  moveLeft() {
      if (this.dx > -this.maxSpeed) {
          this.dx -= this.acceleration;  // Accelerate left
      }
  }

  moveRight() {
      if (this.dx < this.maxSpeed) {
          this.dx += this.acceleration;  // Accelerate right
      }
  }

  boost(boostTime = 1000) {
    this.boosted = true;
    setTimeout(() => {
      this.boosted = false;
    }, boostTime);
  }

  stall(delay = 1000) {
    console.log(this.dinoName +" Stalled");
    this.stalled = true;
    this.dx = 0;
    let blinkInterval = 200; // blink every 200ms
    let blinkCount = 3;
    let blinkTimeout = setInterval(() => {
      this.image.style.visibility = (blinkCount % 2 === 0) ? 'hidden' : 'visible';
      blinkCount++;
      console.log("Bot Blinking", this.image.style.visibility);
    }, blinkInterval);
    clearInterval(blinkTimeout); // stop blinking
    this.image.style.visibility = 'visible'; // make sure the bot is visible again
    setTimeout(() => {
      console.log(this.dinoName +" Unstalled");
      this.stalled = false;  // Recover after being stalled
      this.dx = Math.random() * 2 + 1;  // Assign a new speed after stalling
    }, delay); // Stall for 1 second by default
  }

  jump() {
    if (!this.isJumping) {  // Ensure jump happens only once per press
        console.log("Jumping");
        this.isJumping = true;  // Set jumping flag
        
        // Lock the shadow's y-position when the jump starts
        this.shadowFixedY = this.y + this.height;
        
        let originalY = this.y;
        let jumpHeight = 120;  // Adjust based on desired jump height
        let jumpDuration = 800;  // Time to complete the jump animation

        // Animate the jump up
        const upTween = new Tween(this)
            .to({ y: originalY - jumpHeight }, jumpDuration / 2)
            .easing(Easing.Quadratic.Out);
        
        // Animate the fall down
        const downTween = new Tween(this)
            .to({ y: originalY }, jumpDuration / 2)
            .easing(Easing.Quadratic.In)
            .onComplete(() => {
                this.isJumping = false;  // Reset jumping flag after landing
            });

        // Chain the tweens: jump up, then fall down
        upTween.chain(downTween);
        upTween.start();
    }
  }
}