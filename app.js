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
    constructor(sequence) {
        this.sub = [];
        this.sequence = [];
        this.completed = 1;
        this.checked = 0;
        this.red = new Button('red');
        this.blue = new Button('blue');
        this.green = new Button('green');
        this.yellow = new Button('yellow');
        this.status = document.getElementById("status");
        this.body = document.querySelector("body");
    }

    start(rounds) {
        //get list from API
        this.sequence = list.slice(0, rounds);
        this.addButtonListeners();
        this.playRound(1);
    }

    playRound(round) {
        for (let i = 0; i <= round; i++) {
            this.sub = this.sequence.slice(0, round);
            console.log(this.sub);
            parseColorSequence(this.sub, SHORT);
        }
    }

    checkInput(alias) {
        if (this.sequence[this.checked] != alias) {
            this.lose();
            return false;
        }
        this.checked++;
        if (this.checked == this.sub.length) {
            this.completed++;
            this.checked = 0;
            this.playRound(this.completed);
            return true;
        }
        if (this.checked == this.sequence.length) {
            this.win();
        }
    }

    lose() {
        playSound('lose');
        this.body.style.background = 'hotpink';
        this.status.innerHTML = "Incorrect. You Lose!"
    }

    win() {
        playSound('win');
        this.body.style.background = 'lightblue';
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
const SHORT = 120;
const MID = 400;
const LONG = 4000;

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
    });
    node.element.addEventListener("mousedown", async function() {
        node.light();
        node.sound();
        game.checkInput(node.alias)
        await pause(SHORT);
    });
    node.element.addEventListener("mouseup", function() {
        node.dim();
    });
}



async function parseColorSequence(sequence, wait) {
    for (let i = 0; i < sequence.length; i++) {

        switch (sequence[i]) {
            case 'R':
                game.red.light();
                game.red.drawBorder();
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
        case 'lose':
            var sound = new Audio(`./sounds/${effect}.wav`);
            sound.play();
            break;
        case 'win':
            var sound = new Audio(`./sounds/${effect}.mp3`);
            sound.play();
            break;
        case 'wrong':
            var sound = new Audio(`./sounds/${effect}.wav`);
            sound.play();
            break;
        case 'nextRound':
            var sound = new Audio(`./sounds/${effect}.wav`);
            sound.play();
            break;
    }
}



function pause(t) {
    return new Promise((resolve) => setTimeout(resolve, t));
}