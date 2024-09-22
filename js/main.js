import Game from './game.js';  // Assuming all your JS files are in the same folder


document.addEventListener('DOMContentLoaded', () => {
  const game = new Game('gameCanvas');  // Initialize the game with the canvas element
  const startButtons = document.querySelectorAll('.start-game');
  
  // Listen for the character selection button click
  startButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const dinoName = e.target.getAttribute('data-dinoName');
      console.log("Selected dino: ", dinoName);
      game.startGame(dinoName);  // Start the game with the selected dino character
    });
  });
  
  // Mobile control buttons
  const upButton = document.getElementById('up-button');
  const downButton = document.getElementById('down-button');
  const jumpButton = document.getElementById('jump-button');
  const fireButton = document.getElementById('fire-button');

  // Touch controls
  if ('ontouchstart' in window) {
    // Up button
    upButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (game.player) {
        game.player.isMoving = true;
        game.player.moveUp();
      }
    });

    upButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (game.player) {
        game.player.dy = 0;
        game.player.isMoving = false;
      }
    });

    // Down button
    downButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (game.player) {
        game.player.isMoving = true;
        game.player.moveDown();
      }
    });

    downButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (game.player) {
        game.player.dy = 0;
        game.player.isMoving = false;
      }
    });

    // Jump button
    jumpButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (game.player) {
        game.player.jump();
      }
    });

    // Fire button
    fireButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (game.player) {
        game.fireProjectile(game.player);
      }
    });
  }

  // Add keyboard controls for player movement
  window.addEventListener('keydown', (e) => {
    e.preventDefault();
    if (!game.player) return;
        
    game.player.isMoving = true;
    
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        game.player.moveUp();
      break;
      case 'ArrowDown':
      case 's':
      case 'S':
        game.player.moveDown();
      break;
      case 'ArrowLeft':
      case 'a':
        // game.player.moveLeft();
      break;
      case 'ArrowRight':
      case 'd':
      case 'D':
      case 'Shift':
        game.player.accelerate(true, game.difficulty_level);
        // game.player.moveRight();
      break;
      case ' ':
        game.player.jump();  // Call jump method for smooth jump
      break;
      case 'e':
      case 'E':
      case 'f':
      case 'F':
        game.fireProjectile(game.player);
      break;
    }
  });
  
  // Reset player's velocity when the keys are released
  window.addEventListener('keyup', (e) => {
    if (game.player) {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        game.player.dy = 0;
        break;
        case 'ArrowDown':
        case 's':
        game.player.dy = 0;
        break;
        case 'ArrowLeft':
        case 'a':
        // game.player.dx = 0;
        break;
        case 'ArrowRight':
        case 'd':
        case 'D':
        case 'Shift':
        // game.player.dx = 0;
        game.player.accelerate(false, game.difficulty_level);
        break;
      }
      game.player.isMoving = game.player.dy !== 0 || game.player.dx !== 0;
    }
  });

  // Add this function to resize the canvas
  function resizeCanvas() {
    const canvas = game.canvas;
    const container = document.getElementById('main');

    let scale = Math.min(
        container.clientWidth / canvas.width,
        container.clientHeight / canvas.height
    );

    canvas.style.width = `${canvas.width * scale}px`;
    canvas.style.height = `${canvas.height * scale}px`;
  }

  // Call resizeCanvas when the page loads and on resize
  window.addEventListener('load', resizeCanvas);
  window.addEventListener('resize', resizeCanvas);
});