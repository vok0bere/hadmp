const socket = io()

canvas = document.getElementById('canvas')
class Game {
    constructor(canvas) {
        this.canvas = canvas
        this.canvas.width = this.canvas.height;
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 50;
        this.cellSize = this.canvas.width / this.gridSize;
    }
    draw(players, apples) {
        const ctx = this.ctx;
        const cellSize = this.cellSize;

        ctx.fillStyle = "orange";
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        players.forEach(p => {
            p.id === playerId ? ctx.fillStyle = "#fff" : ctx.fillStyle = "red";
            ctx.fillRect(p.x * cellSize, p.y * cellSize, cellSize, cellSize)
            p.tail.forEach((t) => {
                ctx.fillRect(t.x * cellSize, t.y * cellSize, cellSize, cellSize);
            });
        });
        apples.forEach((a) => {
            ctx.fillStyle = "#ff0000";
            ctx.fillRect(a.x * cellSize, a.y * cellSize, cellSize, cellSize);
        });
    }
}


let playerId;
let nickname;

const joinGame = document.getElementById('joinGame')
joinGame.addEventListener('click', () => {
    socket.emit('joinGame', { nickname }, (session) => {
        playerId = session.id;
    })
})

let game = new Game(canvas)

document.onkeydown = (e) => {
    socket.emit('click', e.keyCode);
}

socket.on('state', (data) => {
    game.draw(data.players, data.apples);
})