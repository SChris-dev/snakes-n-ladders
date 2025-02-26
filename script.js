const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 500;
canvas.height = 500;

const boardSize = 10;
const cellSize = canvas.width / boardSize;

const snakes = {
    17: 7,
    54: 34,
    62: 19,
    98: 79
};

const ladders = {
    3: 22,
    6: 25,
    20: 38,
    36: 57,
    63: 81,
    68: 85
};

let player = { position: 1, x: 0, y: 0 };
let diceRoll = 1;

function rollDice() {
    diceRoll = Math.floor(Math.random() * 6) + 1;
    movePlayer(diceRoll);
}

function movePlayer(steps) {
    let newPosition = player.position + steps;
    if (newPosition > 100) return;

    if (snakes[newPosition]) newPosition = snakes[newPosition];
    if (ladders[newPosition]) newPosition = ladders[newPosition];

    player.position = newPosition;
    updatePlayerCoordinates();
    drawBoard();
    drawPlayer();

    if (player.position === 100) alert("You win!");
}

function updatePlayerCoordinates() {
    let row = Math.floor((player.position - 1) / boardSize);
    let col = (player.position - 1) % boardSize;
    if (row % 2 === 1) col = boardSize - 1 - col;
    player.x = col * cellSize;
    player.y = (boardSize - 1 - row) * cellSize;
}

function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            let number = i * boardSize + (i % 2 === 0 ? j + 1 : boardSize - j);
            ctx.fillStyle = "#eee";
            ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
            ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
            ctx.fillStyle = "black";
            ctx.fillText(number, j * cellSize + 15, i * cellSize + 25);
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(player.x + cellSize / 2, player.y + cellSize / 2, 10, 0, Math.PI * 2);
    ctx.fill();
}

document.getElementById("rollButton").addEventListener("click", rollDice);

drawBoard();
drawPlayer();
