//axios package
const axios = require("./node_modules/axios");

/* 
Button Object
@param color of the button
 */
class Button {
    constructor(color) {
        this.color = color;
        this.alias = color[0].toUpperCase();
        this.element = document.getElementById(`${color}Sq`);
    }

    //lights up the button
    light() {
        this.element.className = `light${this.color}`;
    }

    //turns off button light
    dim() {
        this.element.className = `${this.color}`;
    }

    //draws border around button to indicate mouse is hovering
    drawBorder() {
        this.element.classList.add("hover");
    }

    //remove the button border
    removeBorder() {
        this.element.classList.remove("hover");
    }

    //play the sound specific to this button
    sound() {
        let noise = new Audio(`./sounds/${this.color}.wav`);
        noise.play();
    }
}

/* 
Game Object
 */
class Game {
    constructor() {
        this.red = new Button('red');
        this.blue = new Button('blue');
        this.green = new Button('green');
        this.yellow = new Button('yellow');
        this.status = document.getElementById("status");
        this.body = document.querySelector("body");
        this.url = 'http://cs.pugetsound.edu/~dchiu/cs240/api/simone/';
    }

    /* 
    Query API for start and solution sequences
    @param rounds number of rounds to play
     */
    async getSequence(rounds) {
        try {
            let startResponse = await axios.get(this.url + "?cmd=start");
            let roundResponse = await axios.get(this.url + `?cmd=getSolution&rounds=${rounds}`);
            this.startSequence = startResponse.data.sequence;
            this.roundSequence = roundResponse.data.key;
        } catch (error) {
            console.log(error);
            return false;
        }
        return true;
    }

    /* 
    start game
    @param rounds number of rounds to play
     */
    async start(rounds) {
        this.sub = [];
        this.checked = 0;
        this.completed = 1;
        let flag = await this.getSequence(rounds);
        if (flag) {
            this.addButtonListeners();
            parseColorSequence(this.startSequence, T_BLINK);
            await pause(T_START);
            this.playRound(this.completed);
        }
    }

    /* 
    play the specified ran by incrementing through
    @param round which round to play
     */
    async playRound(round) {
        for (let i = 0; i <= round; i++) {
            this.sub = this.roundSequence.slice(0, i);
            parseColorSequence(this.sub, T_BUTTON);
        }
    }

    /* 
    checks user input matches sequence
    @param rounds number of rounds to play
     */
    checkInput(alias) {
            if (this.roundSequence[this.checked] != alias) {
                this.lose();
                return false;
            }
            this.checked++;
            this.status.innerHTML = `So far so good! ${this.sub.length - this.checked} more to go!`;

            if (this.checked == this.roundSequence.length) {
                this.win();
                return false;
            }

            if (this.checked == this.sub.length) {
                this.completed++;
                this.checked = 0;
                this.nextRound(this.completed);
            }
            return true;

        }
        /* 
        move to the next round
        @param round the round
        */
    async nextRound(round) {
        this.status.innerHTML = "Good job! Prepare for next round.";
        playSound('nextRound');
        await pause(T_ROUND);
        this.status.innerHTML = `Round ${round} of ${this.roundSequence.length}`;
        await pause(T_ROUND);
        this.playRound(round)
    }

    //lose the game
    lose() {
        playSound('wrong');
        playSound('lose');
        this.body.style.background = 'hotpink';
        this.status.innerHTML = "Incorrect. You Lose!"
    }

    //win the game
    win() {
        playSound('win');
        this.body.style.background = 'deepskyblue';
        this.status.innerHTML = "Congratulations! You Win!";
    }

    //adds all listeners to the buttons
    addButtonListeners() {
        addListeners(this.red);
        addListeners(this.blue);
        addListeners(this.green);
        addListeners(this.yellow);
    }
}


// delay constants
const T_BLINK = 120;
const T_START = 4000;
const T_BUTTON = 400;
const T_ROUND = 800;


//start game
var game = new Game();
play = document.getElementById("play");
play.addEventListener("click", function() {
    let rounds = document.getElementById("rounds").value;
    if (rounds < 1 || isNaN(rounds)) {
        rounds = 10;
    }

    game.start(rounds);

});

/* 
dynamically add all listeners to a button object
@param node the button to add listeners to
 */
function addListeners(node) {
    node.element.addEventListener("mouseover", function() {
        node.drawBorder();
    });
    node.element.addEventListener("mouseout", function() {
        node.removeBorder();
        if (node.element.classList.contains(`light${node.color}`)) {
            node.dim();
        }
    });
    node.element.addEventListener("mousedown", function() {
        node.light();
    });
    node.element.addEventListener("mouseup", async function() {
        node.dim();
        node.sound();
        game.checkInput(node.alias);
    });
}

/* 
plays given color sequence
@param sequence of colors to play
@param wait time to wait between pushing buttons
 */
async function parseColorSequence(sequence, wait) {
    for (let i = 0; i < sequence.length; i++) {
        switch (sequence[i]) {
            case 'R':
                game.red.light();
                game.red.sound();
                await pause(wait);
                game.red.dim();
                break;
            case 'B':
                game.blue.light();
                game.blue.sound();
                await pause(wait);
                game.blue.dim();
                break;
            case 'G':
                game.green.light();
                game.green.sound();
                await pause(wait);
                game.green.dim();
                break;
            case 'Y':
                game.yellow.light();
                game.yellow.sound();
                await pause(wait);
                game.yellow.dim();
                break;
        }
        await pause(wait);
    }
}

/* 
plays sound 
@param effect which sound to play
 */
function playSound(effect) {

    switch (effect) {
        case 'win':
            var sound = new Audio(`./sounds/${effect}.mp3`);
            sound.play();
            break;
        default:
            var sound = new Audio(`./sounds/${effect}.wav`);
            sound.play();
            break;
    }
}

/* 
delay program
@param t specified time to wait in ms
 */
function pause(t) {
    return new Promise(function(resolve) {
        return setTimeout(resolve, t);
    });
}