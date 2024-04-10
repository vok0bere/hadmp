const { Server } = require("socket.io");
const express = require('express');
const path = require('path');
const _ = require('lodash');
const { GRID_SIZE, FPS, COLOURS } = require('./game/settings')

// Files //
const Snake = require('./game/snake');
const Apple = require('./game/apple');

// Funkce ke spuštění serveru ?? //
const app = express();
const server = require('http').createServer(app);
const io = new Server(server, {
    // Optimize WebSocket handshake by enabling compression
    perMessageDeflate: {
        zlibDeflateOptions: {
            // See zlib defaults.
            chunkSize: 1024,
            memLevel: 7,
            level: 3
        },
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        // Other options settable:
        clientNoContextTakeover: true, // Defaults to negotiated value.
        serverNoContextTakeover: true, // Defaults to negotiated value.
        serverMaxWindowBits: 10, // Defaults to negotiated value.
        // Below options specified as default values.
        concurrencyLimit: 10, // Limits zlib concurrency for perf.
        threshold: 1024 // Size (in bytes) below which messages
        // should not be compressed.
    }
});

// Middleware //
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/howler', express.static(path.join(__dirname, 'node_modules/howler/dist')))
app.use('/javascript', express.static(path.join(__dirname, 'public/javascript')))
app.use('/styles', express.static(path.join(__dirname, 'public/styles')))
app.use('/images', express.static(path.join(__dirname, 'public/img')))


// GAME defaults //
let genId = 0;
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

            player.on('collision', () => {
                io.to(player.s_id).emit('playSound', 'collision');
            })

            player.on('eat', () => {
                io.to(player.s_id).emit('playSound', 'eat');
            })

            player.on('win', () => {
                io.to(player.s_id).emit('playSound', 'win');
            })

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
for (let i = 0; i < 4; i++) {
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
server.listen(port, '192.168.22.177', () => console.log(`app running on ${port}`));

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
            tail: p.tail,
            color: p.color,
        })),
        apples: apples.map((a) => ({
            x: a.x,
            y: a.y
        }))
    });
}, 1000 / FPS);