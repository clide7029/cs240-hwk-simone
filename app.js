const axios = require("./node_modules/axios");

class Button {
    constructor(color) {
        this.color = color;
        this.alias = color[0].toUpperCase();
        this.element = document.getElementById(`${color}Sq`);
    }

    light() {
        this.element.className = `light${this.color}`;
    }
    dim() {
        this.element.className = `${this.color}`;
    }
    drawBorder() {
        this.element.classList.add("hover");
    }
    removeBorder() {
        this.element.classList.remove("hover");
    }
    sound() {
        let noise = new Audio(`./sounds/${this.color}.wav`);
        noise.play();
    }
}

const list = ['R', 'G', "B", "Y", 'R', 'G', "B", "Y", 'R', 'G', "B", "Y"];

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

    async getSequence(rounds) {
        // let HEAD = {
        //     headers: {
        //         httpHeader: 'v',
        //     },
        // };
        try {
            let startResponse = await axios.get(this.url + "?cmd=start");
            let roundResponse = await axios.get(this.url + `?cmd=getSolution&rounds=${rounds}`);
            this.startSequence = startResponse.data.sequence;
            this.roundSequence = roundResponse.data.key;
            console.dir(this.roundSequence);
            console.dir(this.startSequence);
        } catch (error) {
            console.log(error);
        }
    }

    async start(rounds) {
        //get list from API
        // this.sequence = list.slice(0, rounds);
        await this.getSequence(rounds);
        this.completed = 1;
        this.sub = [];
        this.checked = 0;
        this.addButtonListeners();

        console.dir(this.startSequence);
        parseColorSequence(this.startSequence, T_GREET);
        await pause(T_START);
        this.playRound(1);
    }

    playRound(round) {
        for (let i = 0; i <= round; i++) {
            this.sub = this.roundSequence.slice(0, i);
            console.dir(this.sub);
            parseColorSequence(this.sub, T_BUTTON);
        }
    }

    async nextRound(round) {
        this.status.innerHTML = "Good job! Prepare for next round.";
        playSound('nextRound');
        await pause(T_ROUND);
        this.status.innerHTML = `Round ${round} of ${this.roundSequence.length}`;
        await pause(T_ROUND);
        this.playRound(round)
    }

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

    lose() {
        playSound('lose');
        this.body.style.background = 'hotpink';
        this.status.innerHTML = "Incorrect. You Lose!"
    }

    win() {
        playSound('win');
        this.body.style.background = 'deepskyblue';
        this.status.innerHTML = "Congratulations! You Win!";
    }

    addButtonListeners() {
        addListeners(this.red);
        addListeners(this.blue);
        addListeners(this.green);
        addListeners(this.yellow);
    }
}

var game = new Game();
const T_GREET = 120;
const T_START = 4000;
const T_BUTTON = 400;
const T_ROUND = 800;

play = document.getElementById("play");
play.addEventListener("click", function() {
    let rounds = document.getElementById("rounds").value;
    game.start(rounds);

});

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
        await pause(T_BUTTON);
    });
}



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
    }
}

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



function pause(t) {
    return new Promise((resolve) => setTimeout(resolve, t));
}