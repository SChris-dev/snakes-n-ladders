const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

canvas.width = 500;
canvas.height = 500;

const boardSize = 10;
const cellSize = canvas.width / boardSize;


const snakes = {
    99: 78,
    90: 48,
    65: 42,
    47: 25,
    33: 10,
};

const ladders = {
    5: 25,
    20: 44,
    34: 70,
    50: 90,
    75: 98
};

function drawBoard() {
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            let number = (boardSize - row - 1) * boardSize + (row % 2 === 0 ? boardSize - col : col + 1);
            ctx.fillStyle = (row + col) % 2 === 0 ? '#ddd' : '#fff';
            ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
            ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
            ctx.fillStyle = 'black';
            ctx.fillText(number, col * cellSize + 15, row * cellSize + 20);
        }
    }

    drawLadders();
    drawSnakes();
}

function drawLadders() {
    ctx.strokeStyle = 'brown';
    ctx.lineWidth = 5;

    for (let start in ladders) {
        let end = ladders[start];
        let { x: x1, y: y1 } = getCellPosition(parseInt(start));
        let { x: x2, y: y2 } = getCellPosition(end);

        ctx.beginPath();
        ctx.moveTo(x1 + cellSize / 2, y1 + cellSize / 2);
        ctx.lineTo(x2 + cellSize / 2, y2 + cellSize / 2);
        ctx.stroke();
    }
}

function drawSnakes() {
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 5;

    for (let start in snakes) {
        let end = snakes[start];
        let { x: x1, y: y1 } = getCellPosition(parseInt(start));
        let { x: x2, y: y2 } = getCellPosition(end);

        ctx.beginPath();
        ctx.moveTo(x1 + cellSize / 2, y1 + cellSize / 2);
        ctx.bezierCurveTo(x1, (y1 + y2) / 2, x2, (y1 + y2) / 2, x2 + cellSize / 2, y2 + cellSize / 2);
        ctx.stroke();
    }
}

class Player {
    constructor(name, color) {
        this.name = name;
        this.position = 1;
        this.color = color;
    }

    move(steps, callback) {
        let targetPosition = this.position + steps;

        if (targetPosition > 100) {
            let excess = targetPosition - 100;
            targetPosition = 100 - excess;
        }

        this.animateMovement(targetPosition, callback);
    }

    animateMovement(targetPosition, callback) {
        this.isMoving = true;

        const moveStep = () => {
            if (this.position < targetPosition) {
                this.position++;
            } else if (this.position > targetPosition) {
                this.position--;
            } else {
                // 🎯 STOP movement at target position
                this.isMoving = false;
                updateGame();

                // ✅ Now check for a snake/ladder AFTER moving completely
                setTimeout(() => {
                    if (ladders[this.position] || snakes[this.position]) {
                        let newPos = ladders[this.position] || snakes[this.position];

                        // 🎯 Instantly teleport instead of moving backwards
                        this.position = newPos;
                        updateGame();

                        // Small delay for smooth transition
                        setTimeout(() => {
                            if (callback) callback();
                        }, 500);
                    } else if (callback) {
                        callback();
                    }
                }, 300); // Short delay before teleporting (for smoothness)

                return;
            }

            updateGame();
            setTimeout(moveStep, 150);
            // if (this.position !== targetPosition) {
            //     this.position += step;
            //     updateGame();
            //     setTimeout(moveStep, 150);
            // } else {
            //     this.checkLadderOrSnake(ladders, snakes);
            //     updateGame();
            //     this.isMoving = false;

            //     if (callback) callback();
            // }
        };

        moveStep();
    }

    checkLadderOrSnake(ladders, snakes) {
        if (ladders[this.position]) {
            this.position = ladders[this.position];
        }
        if (snakes[this.position]) {
            this.position = snakes[this.position];
        }
    }
}


let players = [
    new Player('Player 1', 'red'),
    new Player('Player 2', 'blue')
]
let currentPlayerIndex = 0;
let playerPos = 1;

function drawPlayer(ctx, player) {
    let { x, y } = getCellPosition(player.position);
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 4, 0, 2 * Math.PI);
    ctx.fill();
}

function getCellPosition(position) {
    let row = Math.floor((position - 1) / boardSize);
    let col = (position - 1) % boardSize;

    if (row % 2 === 1) {
        col = boardSize - 1 - col;
    }

    let x = col * cellSize;
    let y = (boardSize - 1 - row) * cellSize;
    return { x, y };
}

function updateGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    drawBoard();
    
    players.forEach(player => drawPlayer(ctx, player));
}

updateGame();

function isAnyPlayerMoving() {
    return players.some(player => player.isMoving);
}

// function movePlayer() {
//     if (playerPos < 100) {
//         playerPos += Math.floor(Math.random() * 6) + 1;
//         if (playerPos > 100) playerPos = 100;
//     }

//     updateGame();
// }

const rollDiceBtn = document.getElementById('rollDiceBtn');

function rollDice() {

    rollDiceBtn.disabled = true;

    let diceRoll = Math.floor(Math.random() * 6) + 1;
    let player = players[currentPlayerIndex];

    player.move(diceRoll, () => {
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        updateTurnText();

        if (!isAnyPlayerMoving()) {
            rollDiceBtn.disabled = false;   
        }
    });
    player.checkLadderOrSnake(ladders, snakes);

    updateGame();

    if (player.position === 100) {
        console.log("🎉 You reached 100! You win! 🎉");
        alert(`🎉 Congratulations! ${player.name} won the game! 🎉`);
    }
}

function updateTurnText() {
    document.getElementById('turnIndicator').innerHTML = `${players[currentPlayerIndex].name}'s Turn!`;
}

rollDiceBtn.addEventListener('click', rollDice);


