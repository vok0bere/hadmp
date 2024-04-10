const _ = require('lodash');
const EventEmitter = require('node:events');
const { COLOURS, KEYS } = require('./settings')

let colors = {};
colors = _.assign(colors, COLOURS);
colors = Object.entries(colors).map(([key, value]) => ({
    [key]: value,
    used: false
}));

class Snake extends EventEmitter {
    constructor(options) {
        super();
        _.assign(this, options);
        if (this.color === "random") {
            function random() {
                const available = Object.values(colors).filter(i => !i.used);
                const random = available[Math.floor(Math.random() * available.length)];
                if (random) { random.used = true; return Object.values(random)[0]; };
            }
            this.color = random();
        }
        this.respawn();
    }

    changeDirection(key) {
        switch (key) {
            case KEYS.up:
                if (this.dir !== 'down')
                    this.dir = 'up'; break;
            case KEYS.right:
                if (this.dir !== 'left')
                    this.dir = 'right'; break;
            case KEYS.down:
                if (this.dir !== 'up')
                    this.dir = 'down'; break;
            case KEYS.left:
                if (this.dir !== 'right')
                    this.dir = 'left'; break;
        }
    }

    move() {
        for (let i = this.tail.length - 1; i >= 0; i--) {
            this.tail[i].x = (i === 0) ? this.x : this.tail[i - 1].x;
            this.tail[i].y = (i === 0) ? this.y : this.tail[i - 1].y;
        }

        switch (this.dir) {
            case 'right':
                this.x++; break;
            case 'left':
                this.x--; break;
            case 'up':
                this.y--; break;
            case 'down':
                this.y++; break;
        }

        // Hranice
        if (this.x > this.gridSize - 1) this.x = 0;
        if (this.x < 0) this.x = this.gridSize - 1;
        if (this.y > this.gridSize - 1) this.y = 0;
        if (this.y < 0) this.y = this.gridSize - 1;

        this._checkCollisions();
    }

    _checkCollisions() {
        this.snakes.forEach((s) => {
            if (s !== this) { //head collision
                if (s.x === this.x && s.y === this.y) {
                    if (this.tail.length < s.tail.length) {
                        this.emit('collision');
                        s.emit('win');
                        this.respawn();
                    } else if (this.tail.length === s.tail.length) {
                        s.emit('collision');
                        s.respawn();
                        this.emit('collision');
                        this.respawn();
                    } else {
                        s.emit('collision');
                        this.emit('win');
                        s.respawn();
                    }
                }
            }
            s.tail.forEach((t) => { //tail collisions
                if (t.x === this.x && t.y === this.y) {
                    if (s !== this) {
                        this.emit('collision');
                        s.emit('win');
                        this.respawn();
                        // } else if (s !== this && this.tail.length === s.tail.length) {
                        //     s.emit('collision');
                        //     s.respawn();
                        //     this.emit('collision');
                        //     this.respawn();
                    } else {
                        s.emit('collision');
                        s.respawn();
                    }
                }
            });
        });
        this.apples.forEach((a) => {
            if (a.x === this.x && a.y === this.y) {
                this.emit('eat');
                this._addPoint(1);
                this._addTail();
                a.respawn();
            }
        });
    }

    respawn() {
        this.tail = [];
        this.points = 0;
        this.x = Math.random() * this.gridSize | 0;
        this.y = Math.random() * this.gridSize | 0;
    }

    _addPoint(p) {
        this.points += p;
    }

    _addTail() {
        this.tail.push({ x: this.x, y: this.y });
    }
}

module.exports = Snake;