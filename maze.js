const canvas = document.querySelector("canvas");
let c = canvas.getContext("2d");

let current;

class Maze {
    constructor(size, rows, columns){
        this.size = size;
        this.rows = rows;
        this.cols = columns;
        this.grid = []; //actual 2d array with cells
        this.stack = []; //track which cell is already visited, L.I.F.O approach
    }

    setup(){
        for(let r = 0; r < this.rows; r++){
            let row = [];
            for(let c = 0; c < this.cols; c++){
                let cell = new Cell(this.size, this.grid, this.rows, this.cols, r, c); //r is rowNUm and c is colNum
                row.push(cell);
            }
            this.grid.push(row);
        }
        current = this.grid[0][0];//start point
    }

    draw(){
        canvas.width = this.size;
        canvas.height = this.size;
        // canvas.style.background = "white"

        this.grid.forEach((row) => {
            row.forEach((cell) => {
                cell.show();
            })
        })

        this.generateMaze()

        //creates a loop for animation when each of cells state is updating
        requestAnimationFrame(() => {
            this.draw()
        })
    }

    //breadth-first search (BFS) algorithm for finding the shortest path in a graph
    findShortestPath(start, end) {
        const visited = new Set();
        const queue = [];
        const pathMap = new Map(); // To store the parent cell for each cell in the path

        queue.push(start);
        visited.add(start);

        while (queue.length > 0) {
            const currentCell = queue.shift();

            if (currentCell === end) {
                // Reconstruct the path from end to start
                // const path = this.reconstructPath(pathMap, start, end);
                return this.reconstructPath(pathMap, start, end);
            }

            const neighbors = currentCell.getValidNeighbours();

            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    queue.push(neighbor);
                    visited.add(neighbor);
                    pathMap.set(neighbor, currentCell);
                }
            }
        }

        // If no path is found
        return null;
    }

    reconstructPath(pathMap, start, end) {
        const path = [];
        let currentCell = end;

        while (currentCell !== start) {
            path.unshift({ colNum: currentCell.colNum, rowNum: currentCell.rowNum });
            currentCell = pathMap.get(currentCell);
            currentCell.color = "blue";
        }

        path.unshift({ colNum: start.colNum, rowNum: start.rowNum });
        return path;
    }

    //mark current cell as visited + get neighbours of current cell
    //depth-first search (DFS) algorithm
    generateMaze(){
        current.visited = true
        let next = current.getRandomNeighbour()
        if(next){
            next.visited = true
            this.stack.push(current)
            current.color = "green"
            current.removeWalls(current, next)
            current = next
        } else if(this.stack.length > 0){ //if no neighbours return back through the stack
            current.color = "white" //set backtracking color
            // let cell = this.stack.pop()
            current = this.stack.pop()
        }
    }
}

class Cell{
    constructor(parentSize, parentGrid, rows, cols, rowNum, colNum){
        this.parentGrid = parentGrid;
        this.rows = rows;
        this.cols = cols;
        this.rowNum = rowNum;
        this.colNum = colNum;
        this.size = parentSize / rows;
        this.walls = {
            topWall: true,
            bottomWall: true,
            leftWall: true,
            rightWall: true
        }
        this.visited = false;
        this.neighbours = [];
        this.color = "black"
    }

    setNeighbours(){
        this.neighbours = [] //clear everytime before pushing new neighbours
        let x = this.colNum;
        let y = this.rowNum;

        let leftNeighbour = this.colNum !== 0 ? this.parentGrid[y][x-1] : undefined;
        let rightNeighbour = this.colNum !== this.cols - 1 ? this.parentGrid[y][x+1] : undefined;
        let topNeighbour = this.rowNum !== 0 ? this.parentGrid[y-1][x] : undefined;
        let bottomNeighbour = this.rowNum !== this.rows - 1 ? this.parentGrid[y+1][x] : undefined;

        if(leftNeighbour && !leftNeighbour.visited) this.neighbours.push(leftNeighbour)
        if(rightNeighbour && !rightNeighbour.visited) this.neighbours.push(rightNeighbour)
        if(topNeighbour && !topNeighbour.visited) this.neighbours.push(topNeighbour)
        if(bottomNeighbour && !bottomNeighbour.visited) this.neighbours.push(bottomNeighbour)


    }

    getValidNeighbours() {
        const neighbours = [];
        const x = this.colNum;
        const y = this.rowNum;

        // Check if the neighbor exists and has no wall
        if (x < this.cols - 1 && !this.walls.rightWall) {
            neighbours.push(this.parentGrid[y][x + 1]);
        }

        if (x > 0 && !this.walls.leftWall) {
            neighbours.push(this.parentGrid[y][x - 1]);
        }

        if (y < this.rows - 1 && !this.walls.bottomWall) {
            neighbours.push(this.parentGrid[y + 1][x]);
        }

        if (y > 0 && !this.walls.topWall) {
            neighbours.push(this.parentGrid[y - 1][x]);
        }

        return neighbours;
    }

    getRandomNeighbour(){
        this.setNeighbours()
        if(this.neighbours.length === 0) return undefined //if no more neighbours we do backtracking to the previous parent nodes(search for other paths)
        let randomIndex = Math.floor(Math.random() * this.neighbours.length)
        return this.neighbours[randomIndex]
    }

    drawLine(fromX, fromY, toX, toY){
        c.lineWidth = 6;
        c.strokeStyle = "red";
        c.beginPath()
        c.moveTo(fromX, fromY);
        c.lineTo(toX, toY);
        c.stroke()
    }

    drawWalls(){
        let fromX = 0;
        let fromY = 0;
        let toX = 0;
        let toY = 0;
        //canvas draws cell borders based on specific formula where
        if(this.walls.topWall){
            fromX = this.colNum * this.size;
            fromY = this.rowNum * this.size;
            toX = fromX + this.size;
            toY = fromY
            this.drawLine(fromX, fromY, toX, toY);
        }
        if(this.walls.bottomWall){
            fromX = this.colNum * this.size;
            fromY = (this.rowNum * this.size) + this.size
            toX = fromX + this.size;
            toY = fromY;
            this.drawLine(fromX, fromY, toX, toY);
        }
        if(this.walls.leftWall){
            fromX = this.colNum * this.size;
            fromY = (this.rowNum * this.size);
            toX = fromX;
            toY = fromY + this.size;
            this.drawLine(fromX, fromY, toX, toY);
        }
        if(this.walls.rightWall){
            fromX = (this.colNum * this.size) + this.size;
            fromY = (this.rowNum * this.size);
            toX = fromX;
            toY = fromY + this.size;
            this.drawLine(fromX, fromY, toX, toY);
        }
    }

    removeWalls(cellPrev, cellNext){
        let xDiff = cellNext.colNum - cellPrev.colNum
        if(xDiff === 1){
            cellPrev.walls.rightWall = false
            cellNext.walls.leftWall = false
        } else if(xDiff === -1) {
            cellNext.walls.rightWall = false
            cellPrev.walls.leftWall = false
        }
        let yDiff = cellNext.rowNum - cellPrev.rowNum
        if(yDiff === 1){
            cellPrev.walls.bottomWall = false
            cellNext.walls.topWall = false
        } else if(yDiff === -1) {
            cellNext.walls.bottomWall = false
            cellPrev.walls.topWall = false
        }
    }



    show(){
        this.drawWalls()
        c.fillStyle = this.color
        c.fillRect((this.colNum * this.size) + 1, (this.rowNum * this.size) + 1, this.size - 2, this.size - 2) //filling rectangle, so we can see what is exactly happening and see if that cell is visited or not or if that cell is being backtracked
    }
}

let maze = new Maze(600, 14, 14);
maze.setup();
maze.draw();


function SetEndPoint() {
    const msg = document.createElement("h3");
    const div = document.getElementsByClassName("content")[0];
    msg.innerHTML = "Choose end point";
    div.appendChild(msg);

    let rowIndex, colIndex;

    canvas.addEventListener("mousemove", handleCellHover);
    canvas.addEventListener("click", handleCellClick);

    function handleCellHover(event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        colIndex = Math.floor(mouseX / (maze.size / maze.cols));
        rowIndex = Math.floor(mouseY / (maze.size / maze.rows));

        maze.grid.forEach((row) => {
            row.forEach((cell) => {
                cell.color = "white";
            });
        });

        if (maze.grid[rowIndex] && maze.grid[rowIndex][colIndex]) {
            maze.grid[rowIndex][colIndex].color = "yellow";
        }

        maze.draw();
    }

    function handleCellClick() {
        canvas.removeEventListener("mousemove", handleCellHover);
        canvas.removeEventListener("click", handleCellClick);

        if (div.contains(msg)) {
            div.removeChild(msg);
        }

        if (maze.grid[rowIndex] && maze.grid[rowIndex][colIndex]) {
            const endPoint = maze.grid[rowIndex][colIndex];
            console.log("End point: ", endPoint);
            // console.log("rowNum:", endPoint.rowNum, "colNum:", endPoint.colNum);

            const path = maze.findShortestPath(current, endPoint);
            if (path) {
                path.forEach(cell => {
                    cell.color = "blue";
                });
                console.log("Shortest path: ", path);
            } else {
                console.log("No path found.");
            }
        }
    }
}

