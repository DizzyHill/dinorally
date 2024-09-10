// player.js
import { Tween, Easing } from 'https://unpkg.com/@tweenjs/tween.js@23.1.3/dist/tween.esm.js';

export default class Player {
  constructor(dinoName, color, gameHeight, gameSpeed, gameWidth) {
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
        this.x = 50;
        this.y = gameHeight / 2 - this.height / 2;
        this.dy = 0;
        this.dx = 0;
        this.acceleration = 1.5;  // How fast the player accelerates
        this.friction = 0.1;      // How quickly the player decelerates when the key is released
        this.maxSpeed = 4;        // Maximum speed the player can reach
        this.color = color;
        this.baseSpeed = gameSpeed; 
        this.speed = gameSpeed;
        this.raceStarted = gameSpeed > 0;
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
        this.image = new Image();
        this.image.src = `./assets/${dinoName}.png`;

        // document.addEventListener('keydown', (event) => {
        //     if (event.key === ' ') {
        //         if (!this.isJumping) {
        //         this.jump();
        //         }
        //     }
        // });
  }

  draw(ctx) {
    if (this.image.complete) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    // Visualize the hitbox around the player
    ctx.strokeStyle = 'red'; // Color of the hitbox line
    ctx.lineWidth = 2; // Thickness of the hitbox line

    // Draw the original full player hitbox
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Optional: Draw a reduced hitbox for more precise collision detection
    const paddingX = this.width * 0.25;
    const paddingY = this.height * 0.25;
    ctx.strokeStyle = 'green'; // Different color for the reduced hitbox
    ctx.strokeRect(
        this.x + paddingX / 2, // Apply horizontal padding
        this.y + paddingY / 2, // Apply vertical padding
        this.width - paddingX,  // Adjust width for padding
        this.height - paddingY  // Adjust height for padding
    );
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
    console.log("Player Stalled");
    this.stalled = true;
    this.dx = 0;
    setTimeout(() => {
        console.log("Player Unstalled");
        this.stalled = false;  // Recover after being stalled
        this.dx = Math.random() * 2 + 1;  // Assign a new speed after stalling
    }, delay); // Stall for 1 second by default
  }

  jump() {
    if (!this.isJumping) {  // Ensure jump happens only once per press
        console.log("Jumping");
        this.isJumping = true;  // Set jumping flag
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