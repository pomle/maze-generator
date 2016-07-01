'use strict';

class PathMaker
{
    constructor(maze, start)
    {
        const visited = new Set;
        const stack = [];
        let cell = maze.randCell();

        function getNeighbour(cell) {
            const pos = cell.pos;
            const neighbors = [
                maze.getCell({x: pos.x + 1, y: pos.y}),
                maze.getCell({x: pos.x - 1, y: pos.y}),
                maze.getCell({x: pos.x, y: pos.y + 1}),
                maze.getCell({x: pos.x, y: pos.y - 1}),
            ].filter(cell => {
                if (cell && !visited.has(cell)) {
                    return true;
                }
                return false;
            });

            if (neighbors.length > 0) {
                const ret = neighbors[Math.random() * neighbors.length | 0];
                ret.pointTo(cell);
                return ret;
            } else {
                return false;
            }
        }

        return function* generator() {
            while (visited.size < maze.cells.length) {
                cell = getNeighbour(cell);
                if (cell) {
                    visited.add(cell);
                    stack.push(cell);
                    yield cell;
                } else {
                    cell = stack.pop();
                }
            }
            return;
        }();
    }
}

class Maze
{
    constructor(size)
    {
        const cells = [];
        for (let i = 0, l = size.x * size.y; i !== l; ++i) {
            const cell = new Cell(i % size.x, i / size.x | 0);
            cells.push(cell);
        }
        this.cells = cells;
        this.size = size;
    }
    getCell(pos)
    {
        if (pos.x < 0 || pos.x >= this.size.x || pos.y < 0 || pos.y >= this.size.y) {
            return false;
        }
        return this.cells[pos.y * this.size.x + pos.x];
    }
    randCell()
    {
        const index = this.randIndex();
        const y = index / this.size.x | 0;
        const x = index - y * this.size.x;
        return this.getCell({x, y});
    }
    randIndex()
    {
        return Math.random() * this.cells.length | 0;
    }
}

class Cell
{
    constructor(x, y)
    {
        this.pos = new Vec(x, y);
        this.dir = new Vec(0, 0);
    }
    pointTo(cell)
    {
        this.dir.copy(cell.pos).sub(this.pos);
    }
}

class Vec
{
    constructor(x, y)
    {
        this.x = x || 0;
        this.y = y || 0;
    }
    copy(vec)
    {
        this.x = vec.x;
        this.y = vec.y;
        return this;
    }
    sub(vec)
    {
        this.x -= vec.x;
        this.y -= vec.y;
        return this;
    }
}

class Painter
{
    constructor(canvas)
    {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.blockSize = 32;
    }
    drawMaze(maze)
    {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const ctx = this.ctx;
        ctx.fillStyle = '#FFF';
        ctx.fillRect(0, 0, w, h);
        maze.cells.forEach(cell => {
            this.drawCell(cell);
        });
    }
    drawCell(cell)
    {
        const B = this.blockSize;
        const Bh = B/2;

        const x1 = cell.pos.x * B;
        const x2 = (cell.pos.x + cell.dir.x) * B;
        const y1 = cell.pos.y * B;
        const y2 = (cell.pos.y + cell.dir.y) * B;

        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(Bh + Math.min(x1, x2) - Bh, Bh + Math.min(y1, y2) - Bh,
                          Math.abs(x1 - x2) + Bh, Math.abs(y1 - y2) + Bh);
    }
}

const maze = new Maze({x: 32, y: 24});
const generator = new PathMaker(maze);
const painter = new Painter(document.getElementById('maze'));

painter.drawMaze(maze);

let speed = 1/25;
function paint() {
    const res = generator.next();
    if (!res.done) {
        setTimeout(paint, speed * 1000);
        painter.drawCell(res.value);
    }
}
paint();




