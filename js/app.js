// Global variables
const startPositionX = 202; // Starting X coordinate for the player sprite
const startPositionY = 415; // Starting Y coordinate for the player sprite
const COLLIDED  = 50; // Collision 
const speeds = [300, 230, 400]; // Starting speeds
let score = 0; // Starting score - 0

// Common parent for Enemies and Player
class Element {
  constructor(x, y, sprite) {
    this.x = x;
    this.y = y;
    this.sprite = sprite;
  }

  // Render the game elements on the screen
  render() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  }
}

// Enemy sprite
class Enemy extends Element {
  // Pull from engine.js 
  constructor(x, y, sprite = 'images/enemy-bug.png') {
    super(x, y, sprite);
    this.x = x;
    this.y = y;
    this.sprite = sprite;
    this.speed = speeds[Math.floor(Math.random() * speeds.length)];
  }

  update(dt) {
    this.x += this.speed * dt;
    if (this.x >= 505) {
      this.x = 0;
    }
  }
}

// Player
class Player extends Element {
  // Pull from engine.js
  constructor(x, y, sprite = 'images/char-boy.png') {
    super(x, y, sprite);
    this.x = x;
    this.y = y;
    this.sprite = sprite;
  }

  // Resets the player sprite back to the initial position
  reset(x, y) {
    this.x = x;
    this.y = y;
  }

  // The player position resets when they reach the water
  update() {
    // Is the water reached?
    if (this.y <= 0) {
      this.reset(startPositionX, startPositionY); // Go back to the start
      score ++; // Score increases;
      $('#score').text(score);
    }
  }

// Keyboard controls
  handleInput(key) {
    if (key === 'left' && this.x > 0) {
      this.x -= 101;
    } else if (key === 'right' && this.x < 400) {
      this.x += 101;
    } else if (key === 'up' && this.y > 0) {
      this.y -= 93;
    } else if (key === 'down' && this.y < 400) {
      this.y += 93;
    }
  }
}

// Initiating all enemies
const allEnemies = [
  new Enemy(0, 60),
  new Enemy(202, 145),
  new Enemy(404, 230)
];

// Initiating the player
const player = new Player(startPositionX, startPositionY);

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
  const allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };
  player.handleInput(allowedKeys[e.keyCode]);
});

/**
 * 1. Checks if the player collided with an enemy
 * 2. Displays sweet alert message, depending on how many was scored.
 * 3. Resets score back to zero
 * 4. Resets player's position back to the start
 */
function checkCollisions(allEnemies, player) {
  for (enemy of allEnemies) {
    if ((player.y >= enemy.y - COLLIDED && player.y <= enemy.y + COLLIDED) && (player.x >= enemy.x - COLLIDED && player.x <= enemy.x + COLLIDED)) {
      if (score <=4) {
          swal({ title: "BANG! SMASH! WALLOP!", text: "That was terrible! You Scored: " + score, type: "error", confirmButtonText: "Play Again" });
      } else {
          swal({ title: "BANG! SMASH! WALLOP!", text: "Congrats! You Scored: " + score, type: "error", confirmButtonText: "Play Again" });
      }
      score = 0;
      $('#score').text(score);
      player.reset(startPositionX, startPositionY);
    }
  }
};
