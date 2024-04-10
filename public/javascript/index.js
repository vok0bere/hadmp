const BG = "#b0db43"
const APPLE = "#db2763"
const SNAKE = "#0e131f"
const MY_SNAKE = "#7CD1D4"
const DEFAULT = "#464e32";

bg_music = new Howl({ src: '/audio/bg.mp3', volume: 0.3, loop: true })

function music() {
    if (!bg_music.playing()) {
        bg_music.play();
        document.getElementById('music').style.animation = "dance 2s linear infinite"
    } else {
        bg_music.pause();
        document.getElementById('music').style.animation = ""
    }
};

const socket = io()

canvas = document.getElementById('canvas')
const score = document.getElementById('score');
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.canvas.width = this.canvas.height;
        this.ctx = this.canvas.getContext('2d');
        const size = 350;
        this.canvas.style.width = size + "px";
        this.canvas.style.height = size + "px";
        const scale = window.devicePixelRatio;
        this.canvas.width = Math.floor(size * scale);
        this.canvas.height = Math.floor(size * scale);
        this.ctx.scale(scale, scale);
        this.gridSize = 35;
        this.cellSize = this.canvas.style.width.replace("px", "") / this.gridSize;
    }
    draw(players, apples) {
        const ctx = this.ctx;
        const cellSize = this.cellSize;

        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        score.innerHTML = "";

        players.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x * cellSize, p.y * cellSize, cellSize, cellSize)
            p.tail.forEach((t) => {
                ctx.fillRect(t.x * cellSize, t.y * cellSize, cellSize, cellSize);
            });

            const tag = document.createElement('span');
            tag.innerText = `${p.nickname}: ${p.points} ☆\n`;
            tag.classList.add('font');
            tag.style.color = p.color;
            score.appendChild(tag)

        });
        apples.forEach((a) => {
            ctx.fillStyle = APPLE;
            ctx.fillRect(a.x * cellSize, a.y * cellSize, cellSize, cellSize);
        });
    }
}


let playerId;
let nickname;

const joinGame = document.getElementById('joinGame');
const leaveGame = document.getElementById('leaveGame');
joinGame.addEventListener('click', () => {
    nickname = document.getElementById('nickname').value.trim()
    color = document.getElementById('color').value !== DEFAULT ? document.getElementById('color').value : "random";
    if (nickname && nickname !== '') {
        socket.emit('joinGame', { nickname, color }, (session) => {
            playerId = session.id;
        })
        joinGame.disabled = true;
        leaveGame.disabled = false;
    } else { alert("Chyba ve jméně") }
})
leaveGame.addEventListener('click', () => {
    socket.emit('leaveGame');
    leaveGame.disabled = true;
    joinGame.disabled = false;
    document.getElementById(playerId).remove();
})

socket.on('tooManyPlayers', () => {
    alert('Momentálně příliš mnoho hráčů!');
    leaveGame.disabled = true;
    joinGame.disabled = false;
})

socket.on('playSound', (sound) => {
    let soundPath;
    let volume;
    switch (sound) {
        case 'collision':
            soundPath = '/audio/oof.mp3';
            volume = 3.0;
            break;
        case 'eat':
            soundPath = '/audio/yummy.mp3';
            break;
        case 'win':
            soundPath = '/audio/tadaa.mp3';
            break;
    }
    const soundEffect = new Howl({ src: [soundPath], volume: [typeof volume !== "undefined" ? volume : 1.0] });
    soundEffect.play();
})

let game = new Game(canvas)

const body = document.getElementById('main');
const mc = new Hammer.Manager(body);
const Swipe = new Hammer.Swipe();
mc.add(Swipe);
mc.on("swipe", (e) => {
    dir = e.offsetDirection;
    switch (dir) {
        case 2:
            socket.emit('click', 37); break;
        case 4:
            socket.emit('click', 39); break;
        case 8:
            socket.emit('click', 38); break;
        case 16:
            socket.emit('click', 40); break;
    }
})

document.onkeydown = (e) => {
    socket.emit('click', e.keyCode);
}

socket.on('state', (data) => {
    game.draw(data.players, data.apples);
})