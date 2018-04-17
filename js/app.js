/* 


----------STILL TO DO----------

- Get rid of maximum score and replace with a high score which is given.
- Redo the instruction note and make it look nice.
- Revamp the game UI.
- Change the modal at the end of the game.




*/

// Prevent the browser window from moving whilst user is pressing the arrow buttons.

window.addEventListener("keydown", function(e) {
    // space and arrow keys
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
}, false);



//Initial variables for the canvas.
var colW = 101;
var rowH = 83;


//get life count, score count and star count from HTML
var lifeCount = document.getElementById("life-count");
var numLife = Number(lifeCount.textContent);
var scoreCount = document.getElementById("score-count");
var numScore = Number(scoreCount.textContent);
var starCount = document.getElementById("star-count");
var numStar = Number(starCount.textContent);


//audio source: http://opengameart.org/content/rpg-sound-pack
var scoreUpSound = new Audio("sounds/coin.wav");
var collisionSound = new Audio("sounds/collision.wav");


//set global variable - winGame, loseGame, to conveniently track game result
//the inital value for both are "false"
var winGame = false;
var loseGame = false;


//Enemy=====================================================================
//Constructor function for Enemies(our player must avoid these enemies)
var Enemy = function(x, y, speed) {
    // Variables applied to each of our instances
    // The image/sprite for our enemies
    this.sprite = 'images/enemy-bug.png';

    //set the initial location(take params)
    this.x = x;
    this.y = y;

    // Set the initial speed
    this.speed = speed;
};

//------------------------------------------------------
//Enemy's prototypes
//------------------------------------------------------

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // Update location
    // Multiply any movement by the dt parameter
    // to ensure the game runs at the same speed for all computers.
    this.x += dt * this.speed;
    resetEnemies();
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//Player==========================================================
//player's contructor funciton
var Player = function() {
    // The image/sprite for our player
    this.sprite = 'images/char-boy.png';
    //set the initial location
    this.x = colW*2;
    this.y = rowH*5-25;
};

//--------------------------------------
//Player's prototypes
//--------------------------------------
//reset player's location
Player.prototype.reset = function() {
    this.x = colW*2;
    this.y = rowH*5-25;
};

//set the condition and consequences to win the game
Player.prototype.checkWin = function() {
    if (numScore >= 1000) {
        //change to win status
        winGame = true;
    }
};

//condition and setting if get score
Player.prototype.getScore = function() {
    //reach the water(get score), score up and back to start place
    if(this.y < rowH-25) {
        //coin collect sound
        scoreUpSound.play();
        //check win;
        this.checkWin();
        //score up
        if(!winGame) {
            numScore += 50;
            scoreCount.textContent = numScore.toString();

            //check win;
            this.checkWin();
            if(winGame) {
                stopGame();
            }
        }
        //player back to start place
        this.reset();
    }
};

//update player
Player.prototype.update = function() {
    //check if get score
    this.getScore();
    //handle collision
    this.checkCollision();
};

//set collision condition and consequences
Player.prototype.checkCollision = function(){
    for (var i = 0; i < allEnemies.length; i++) {
        if(this.y === allEnemies[i].y && this.x >= allEnemies[i].x - 50 && this.x < allEnemies[i].x + 50) {
            //collision sound
            collisionSound.play();
            //player go back to original start place
            this.reset();
            //lose one life
            numLife -= 1;
            lifeCount.textContent = numLife.toString();
            //check if loose all the life
            if(numLife <= 0) {
                loseGame = true;
                stopGame();
            }
        }
    }
};

//draw the player on the canvas
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//use keyboard to manipulate player
//keep player inside boundary
Player.prototype.handleInput = function(key) {
    //move left - one colW per move
    if(key === "left") {
        this.x -= colW;
        console.log(this.x);
        //keep inside left boundary
        if(this.x < 0) {
            this.x += colW;
        }
    //move right - one colW per move
    } else if(key === "right") {
        this.x += colW;
        //keep inside right boundary
        if(this.x > 4*colW) {
            this.x -= colW;
        }
    //move up - one rowH per move
    } else if(key === "up") {
        this.y -= rowH;
        //keep inside upper boundary
        if(this.y < -25) {
            this.y += rowH;
        }
    //move down -  one rowH per move
    } else if(key === "down") {
        this.y += rowH;
        //keep inside lower boundary
        if(this.y > 5*rowH-25) {
            this.y -= rowH;
        }
    }
};

//Item ================================================================
// item's constructor funciton
var Item = function(x,y) {
    // The image/sprite for our player
    this.sprite = 'images/Star.png';
    //set location
    this.x = x;
    this.y = y;
};

//--------------------
//Item's prototypes
//--------------------
//draw Item on the canvas
Item.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//update Item
Item.prototype.update = function() {
    this.checkScoreBonus();
};

//set collect Item condition and consequences
Item.prototype.checkScoreBonus = function() {
    if(this.y === player.y && this.x === player.x) {
        //coin collect sound
        scoreUpSound.play();
        //star up
        numStar += 1;
        starCount.textContent = numStar.toString();
        //score up
        numScore += 100;
        scoreCount.textContent = numScore.toString();
        //item disappear
        this.x = generateRandomStarX();
        this.y = generateRandomY();

        //check win: if win the game, stop the game
        player.checkWin();
        if(winGame){
            stopGame();
        }
    }
};

//instantiate objects==========================================================

// Place all enemy objects in an array called allEnemies
var allEnemies = [];

// Place the player object in a variable called player
var player = new Player();

// Place the star object in a variable called star
var star = new Item(0, rowH*2-25);

//Assistant functions===========================================================

//---------------------------------
//RANDOM Number generator funcitons
//----------------------------------

//function to make enemys with random X coordinate(-499 to 0)
function generateRandomX() {
    //set randow X position (-700 to -101)
    var randomX = Math.floor((Math.random() * 500))-600;
    return randomX;
}

//function to make random X coordinate(choose from 5 rows) for star creation
function generateRandomStarX() {
    //set X position choice for star(on the column)
    var XArray  =[0, colW, 2*colW, 3*colW, 4*colW];
    //choose random number from 0,1,2,3,4
    var randomXIndex = Math.floor((Math.random() * 5));
    //randomly choose X from XArray
    var randomStarX = XArray[randomXIndex];
    return randomStarX;
}

//generate random Y coordinate(choose from 3 rows) for enemys and star creation
function generateRandomY() {
    //set Y position choice for enemys/star(on the rows)
    var YArray  =[rowH-25, 2*rowH-25, 3*rowH-25];
    //choose random number from 0,1,2
    var randomYIndex = Math.floor((Math.random() * 3));
    //randomly choose Y from YArray
    var randomY = YArray[randomYIndex];
    return randomY;
}

//generate random speed:choose an integer between 50,100,150,200,250,300,350,400
function generateRandomSpeed() {
    var randomSpeed = (Math.floor((Math.random() * 8) + 1)) * 50;
    return randomSpeed;
}

//-------------------------------
//functions to deal with enemies
//-------------------------------

//this function create a instance of Enemy(bug), assign it random X and Y,
//then push it into allEnemies array. Number of the bugs can be decided when called.
function makeEnemies(n){
    for (var i = 0; i < n; i++) {
        //generate random X and Y
        var randomX = generateRandomX();
        var randomY = generateRandomY();
        var randomSpeed = generateRandomSpeed();
        //create a new instance of Enemy(bug) by assign random X and Y to it
        var bug = new Enemy(randomX, randomY, randomSpeed);
        allEnemies.push(bug);
    }
    return allEnemies;
}

//when a bug run out of right boundary, assign it a new X, Y, and speed.
//this function is called when update the enemy(when out of boundary, reset Enemies)
function resetEnemies(){
    allEnemies.forEach(function(bug){
        //generate random X and Y
        var randomX = generateRandomX();
        var randomY = generateRandomY();
        var randomSpeed = generateRandomSpeed();
        //when the enemy runs out of right boundary, reset enemy loc
        if(bug.x > 5 * colW) {
            bug.x = randomX;
            bug.y = randomY;
            bug.speed = randomSpeed;
        }
    });
}

//clear allEnemies Array
function clearEnemies() {
    if(allEnemies) {
        allEnemies = [];
    }
}

//--------------------------------------------------
//function to deal with keyboard movement for player
//---------------------------------------------------

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
var keyListener = function(e) {
    var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        //e.keyCode: 37/38/39/40
        //possible INPUT - allowedKeys[e.keyCode]:"left"/"up"/"right"/"down"
        player.handleInput(allowedKeys[e.keyCode]);
};

//enable keyboard manipulation for player
function enableKeys(){
    document.addEventListener('keyup', keyListener);
}

//disable keyboard manipulation for player
function disableKeys(){
    document.removeEventListener('keyup', keyListener);
}

//----------------------------------------------
//functions to start/pause/continue/stop game
//----------------------------------------------
function startGame(){
    //set player into original place
    player.reset();
    //reset life to 5
    numLife = 5;
    lifeCount.textContent = numLife.toString();
    //reset score to 0
    numScore = 0;
    scoreCount.textContent = numScore.toString();
    //reset star to 0
    numStar = 0;
    starCount.textContent = numStar.toString();

    winGame = false;
    loseGame = false;

    //enable keys to move player
    enableKeys();
    //clear the enemies
    clearEnemies();
    //create 5 enemies
    makeEnemies(5);
    //new star
    star = new Item(0, rowH*2-25);
    //change the start button context
    startButton.textContent = "restart";
    pauseButton.textContent = "pause";
}

function pauseOrContinueGame(){
    //lock pause button when the game have not started yet.
    if(startButton.textContent === "restart"){
        //"pause button" setting
        if(pauseButton.textContent === "pause") {
            //1. STORE speed
            //clear original store speedArray
            //and store all the speed for bugs in an array
            speedArray = [];
            allEnemies.forEach(function(bug){
                speedArray.push(bug.speed);
            });

            //2.stop the enemy: set the speed to 0
            allEnemies.forEach(function(bug){
                bug.speed = 0;
            });

            //3.disable the player's movement
            disableKeys();

            //4.change the button name to continue
            pauseButton.textContent = "continue";

        //"continue button" setting
        } else {
            //continue the enemy: assign the original speed
            for (var i = 0; i < allEnemies.length; i++) {
                allEnemies[i].speed = speedArray[i];
            }
            //enable the player's movement
            enableKeys();
            //change the button name to pause
            pauseButton.textContent = "pause";
        }
    }
}

function stopGame() {
    //1.stop the enemy: set the speed to 0
    allEnemies.forEach(function(bug){
        bug.speed = 0;
    });

    //2.disable the player's movement
    disableKeys();

    //3. game over notice
    //will be handled in engine.js.
    //because need to render after canvas base
}

//===============================================================================

//------------------
//START/RESTART game
//-------------------
//1.set click event to start button
var startButton = document.getElementById("start");
startButton.addEventListener("click", startGame);

//2.add key event: press "enter" key to start
document.addEventListener("keyup",function(e){
    console.log(e.keyCode);
    if(e.keyCode === 13) {
        //prevent default function for this key
        e.preventDefault();
        startGame();
    }
});

//--------------------
//PAUSE/CONTINUE game
//---------------------
//1.create a speed array to store speed info for bugs
var speedArray = [];

//2.set click event to pause button
var pauseButton = document.getElementById("pause");
pauseButton.addEventListener("click", pauseOrContinueGame);

//3.add key event: press "space" key to pause/continue
document.addEventListener("keyup",function(e){
    if(e.keyCode === 32) {
        console.log(e);
        e.preventDefault();
        pauseOrContinueGame();
    }
});
