import Game from './game.js';  // Assuming all your JS files are in the same folder

document.getElementById('character-selection').style.display = 'flex';  // Show character selection menu

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
  
  // Add keyboard controls for player movement
  window.addEventListener('keydown', (e) => {
    if (!game.player) return;
        
    game.player.isMoving = true;
    
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
        game.player.moveUp();
      break;
      case 'ArrowDown':
      case 's':
        game.player.moveDown();
      break;
      case 'ArrowLeft':
      case 'a':
        // game.player.moveLeft();
      break;
      case 'ArrowRight':
      case 'd':
        game.player.accelerate(true, game.difficulty_level);
        // game.player.moveRight();
      break;
      case ' ':
        game.player.jump();  // Call jump method for smooth jump
      break;
      case 'f':
      case 'F':
        const projectile = game.player.shootProjectile();
        if (projectile) {
          projectile.x = game.player.x + game.player.width;
          projectile.y = game.player.y + game.player.height / 2;
          game.projectiles.push(projectile);
        }
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
        // game.player.dx = 0;
        game.player.accelerate(false, game.difficulty_level);
        break;
      }
      game.player.isMoving = game.player.dy !== 0 || game.player.dx !== 0;
    }
  });
});