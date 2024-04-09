const { Server } = require("socket.io");
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const _ = require('lodash');

// Files //
const Snake = require('./game/snake');
const Apple = require('./game/apple');

// Funkce ke spuštění serveru ?? //
const app = express();
const server = require('http').createServer(app);
const io = new Server(server);

// Middleware //
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/static', express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride('_method'));

// GAME defaults //
let genId = 0;
const GRID_SIZE = 35;
let players = []
let apples = []
let ids = []

// io //
io.on('connection', (socket) => {
    let player;
    let id = genId++;

    ids.push(socket.id);

    socket.on('joinGame', (options, callback) => {
        if (players.length <= 9) {
            player = new Snake(_.assign({
                id,
                dir: 'right',
                gridSize: GRID_SIZE,
                snakes: players,
                apples,
                s_id: socket.id,
            }, options));
            players.push(player);
            callback({ id: id });
        }
        else {
            socket.emit('tooManyPlayers');
            return;
        }
    });

    socket.on('click', (key) => {
        if (player) {
            player.changeDirection(key);
        };
    });

    socket.on('leaveGame', () => {
        _.remove(players, player)
    });

    socket.on('disconnect', () => {
        if (player) {
            _.remove(players, player);
        }
        ids = ids.filter(e => e !== socket.id);
    });
});

// foods //
for (let i = 0; i < 3; i++) {
    apples.push(new Apple({
        gridSize: GRID_SIZE,
        snakes: players,
        apples,
    }));
};

// Routing //
app.get('/', (req, res) => {
    res.render('index');
});

app.all('*', (req, res) => {
    res.redirect('/')
})

const port = process.env.port || 8080;
server.listen(port, '10.0.0.10', () => console.log(`app running on ${port}`));

// Main loop
setInterval(() => {
    players.forEach((p) => {
        p.move();
    });
    io.emit('state', {
        players: players.map((p) => ({
            x: p.x,
            y: p.y,
            id: p.id,
            nickname: p.nickname,
            points: p.points,
            tail: p.tail
        })),
        apples: apples.map((a) => ({
            x: a.x,
            y: a.y
        }))
    });
}, 100);