import Mark from "./Mark.js";

class Core {
    constructor({
        bot = false,
        canvas,
        cols = 3,
        rows = 3,
        bgColor = "#fff",
        lineColor = "#000",
        lineWidth = 2,
        hoverColor = "#f00",
        highlightColor = "#ff0",
        markColors = ["#f00", "#00f"],
        markThickness = "auto",
    }) {
        this.canvas = canvas;
        this.bot = bot;
        this.configs = {
            cols,
            rows,
            bgColor,
            lineColor,
            lineWidth,
            hoverColor,
            highlightColor,
            markColors,
            markThickness,
        };

        this.init();
    }

    init() {
        // Set canvas size
        const setCanvasSize = () => {
            const parentStyle = window.getComputedStyle(this.canvas.parentNode);
            const parentPaddingLeft = parseInt(parentStyle.paddingLeft);
            const parentPaddingRight = parseInt(parentStyle.paddingRight);
            const parentPaddingTop = parseInt(parentStyle.paddingTop);
            const parentPaddingBottom = parseInt(parentStyle.paddingBottom);

            this.canvas.width =
                this.canvas.parentNode.clientWidth -
                parentPaddingLeft -
                parentPaddingRight;
            this.canvas.height =
                this.canvas.parentNode.clientHeight -
                parentPaddingTop -
                parentPaddingBottom;
        };
        setCanvasSize();

        this.c = this.canvas.getContext("2d");

        // Set board properties
        const setBoardProperties = () => {
            this.board = {
                width: this.canvas.width,
                height: this.canvas.height,
                cellWidth: this.canvas.width / this.configs.cols,
                cellHeight: this.canvas.height / this.configs.rows,
                cells: [],
            };
            this.marks = ["X", "O"];
            this.currentMark = 1;
            if (this.configs.markThickness === "auto") {
                this.markLineWidth =
                    Math.min(this.board.cellWidth, this.board.cellHeight) / 10;
            } else {
                this.markLineWidth = this.configs.markThickness;
            }
            this.winPoint = this.configs.cols > 3 ? 5 : 3;
            this.winnerListener = () => {};
        };
        setBoardProperties();

        // Initialize cells
        const initCells = () => {
            for (let i = 0; i < this.configs.rows; i++) {
                this.board.cells.push([]);
                for (let j = 0; j < this.configs.cols; j++) {
                    this.board.cells[i].push({
                        x: j * this.board.cellWidth,
                        y: i * this.board.cellHeight,
                        player: null,
                        hover: false,
                        selected: false,
                    });
                }
            }
            this.totalCells = this.configs.cols * this.configs.rows;
            this.totalMarked = 0;
        };
        initCells();

        // Initialize bot
        this.botMove = () => {
            let botIndex = { col: -1, row: -1 };

            // Check if bot can win
            this.forEachCell(({ cell, col, row }) => {
                if (!cell.player) {
                    cell.player = this.getOMark(cell);
                    let { win } = this.checkWin({ col, row });
                    if (win) {
                        botIndex = { col, row };
                        return;
                    }
                    cell.player = null;
                }
            });

            // Check if player can win and block
            const turnBack = (playerSimulateMarks) => {
                playerSimulateMarks.forEach((cell) => {
                    cell.player = null;
                });
            };
            if (botIndex.col === -1) {
                let playerSimulateMarks = [];
                this.forEachCell(({ cell, col, row }) => {
                    if (!cell.player) {
                        cell.player = this.getXMark(cell);
                        playerSimulateMarks.push(cell);
                        let { win } = this.checkWin({
                            col,
                            row,
                        });
                        if (win) {
                            botIndex = { col, row };
                            turnBack(playerSimulateMarks);
                            return;
                        }
                        cell.player = null;
                    }
                });
            }

            // Check to block player's potential strike
            if (botIndex.col === -1) {
                let playerSimulateMarks = [];
                this.forEachCell(({ cell, col, row }) => {
                    if (!cell.player) {
                        cell.player = this.getXMark(cell);
                        playerSimulateMarks.push(cell);
                        let { bestStrike } = this.checkWin({
                            col,
                            row,
                        });
                        if (
                            (this.winPoint - bestStrike === 1 &&
                                this.winPoint === 3) ||
                            (this.winPoint - bestStrike === 1 &&
                                this.winPoint === 5)
                        ) {
                            botIndex = { col, row };
                            turnBack(playerSimulateMarks);
                            return;
                        }
                        cell.player = null;
                    }
                });
            }

            // Best move
            if (botIndex.col === -1) {
                while (true) {
                    // Find the best cell to get the best strike
                    let bestStrike = 0;
                    let bestCell = null;
                    this.forEachCell(({ cell, col, row }) => {
                        if (!cell.player) {
                            cell.player = this.getOMark(cell);
                            let { bestStrike: tempBestStrike } = this.checkWin({
                                col,
                                row,
                            });
                            if (tempBestStrike > bestStrike) {
                                bestStrike = tempBestStrike;
                                bestCell = { col, row };
                            }
                            cell.player = null;
                        }
                    });
                    if (bestStrike > 0) {
                        botIndex = bestCell;
                        break;
                    }
                }
            }

            return botIndex;
        };

        // Mouse position
        this.mouse = {
            x: 0,
            y: 0,
        };
        this.windownMouse = {
            x: 0,
            y: 0,
        };

        // Game Pause
        this.state = "Playing";
        this.paused = false;
        this.pause = (state) => {
            if (state) this.state = state;
            this.paused = !this.paused;
        };

        // Add event listeners
        this.handleMouseMove = (e) => {
            this.mouse.x = e.clientX - this.canvas.getBoundingClientRect().left;
            this.mouse.y = e.clientY - this.canvas.getBoundingClientRect().top;
        };
        this.canvas.addEventListener("mousemove", this.handleMouseMove);

        this.trackWindowMouse = (e) => {
            this.windownMouse.x = e.clientX;
            this.windownMouse.y = e.clientY;
        };
        window.addEventListener("mousemove", this.trackWindowMouse);

        this.handleWin = (markedCell) => {
            if (markedCell) {
                let { win, winner, cells, draw } = this.checkWin({
                    col: markedCell.col,
                    row: markedCell.row,
                });
                if (win) {
                    this.selectCells(cells);
                    this.pause(`Player ${winner} wins`);
                    if (this.bot) {
                        this.winner = winner === "X" ? "Player" : "Bot";
                    } else {
                        this.winner = winner;
                    }
                } else if (draw) {
                    this.pause("Draw");
                    this.winner = "Draw";
                }
                if (win || draw) this.winnerListener(this.winner);
            }
        };
        this.handleClick = (e) => {
            if (this.paused || this.botTurn) return;
            let markedCell = this.markDown();
            this.handleWin(markedCell);
            if (this.bot && !this.paused && markedCell) {
                this.borTurn = true;
                markedCell = this.botMarkDown();
                this.handleWin(markedCell);
                this.botTurn = false;
            }
        };
        this.canvas.addEventListener("click", this.handleClick);

        // Layers
        this.layers = {
            background: () => {
                this.c.fillStyle = this.configs.bgColor;
                this.c.fillRect(0, 0, this.board.width, this.board.height);
            },
            grid: () => {
                this.c.strokeStyle = this.configs.lineColor;
                this.c.lineWidth = this.configs.lineWidth;
                this.c.beginPath();
                for (let i = 1; i < this.configs.cols; i++) {
                    this.c.moveTo(i * this.board.cellWidth, 0);
                    this.c.lineTo(i * this.board.cellWidth, this.board.height);
                }
                for (let i = 1; i < this.configs.rows; i++) {
                    this.c.moveTo(0, i * this.board.cellHeight);
                    this.c.lineTo(this.board.width, i * this.board.cellHeight);
                }
                this.c.stroke();
            },
            hoverCells: () => {
                this.c.fillStyle = this.configs.hoverColor;
                this.forEachCell(({ cell }) => {
                    if (cell.hover) {
                        this.c.fillRect(
                            cell.x,
                            cell.y,
                            this.board.cellWidth,
                            this.board.cellHeight
                        );
                    }
                });
            },
            selectedCells: () => {
                this.c.fillStyle = this.configs.highlightColor;
                this.forEachCell(({ cell }) => {
                    if (cell.selected) {
                        this.c.fillRect(
                            cell.x,
                            cell.y,
                            this.board.cellWidth,
                            this.board.cellHeight
                        );
                    }
                });
            },
            marks: () => {
                this.forEachCell(({ cell }) => {
                    if (cell.player) {
                        cell.player.ctx = this.c;
                        cell.player.render();
                    }
                });
            },
        };

        // Utility functions
        this.forEachCell = (callback = () => {}) => {
            for (let i = 0; i < this.configs.rows; i++) {
                for (let j = 0; j < this.configs.cols; j++) {
                    callback({
                        cell: this.board.cells[i][j],
                        col: j,
                        row: i,
                    });
                }
            }
        };

        this.isMouseOverCanvas = () => {
            return (
                this.windownMouse.x >
                    this.canvas.getBoundingClientRect().left &&
                this.windownMouse.x <
                    this.canvas.getBoundingClientRect().right &&
                this.windownMouse.y > this.canvas.getBoundingClientRect().top &&
                this.windownMouse.y < this.canvas.getBoundingClientRect().bottom
            );
        };

        this.isUnderMouse = (cell) => {
            if (this.paused) return false;
            return (
                this.mouse.x > cell.x &&
                this.mouse.x < cell.x + this.board.cellWidth &&
                this.mouse.y > cell.y &&
                this.mouse.y < cell.y + this.board.cellHeight &&
                this.isMouseOverCanvas()
            );
        };

        this.getNextMark = (cell) => {
            this.currentMark = (this.currentMark + 1) % this.marks.length;
            return new Mark(
                cell.x,
                cell.y,
                this.board.cellWidth,
                this.board.cellHeight
            )
                .of({
                    type: this.marks[this.currentMark],
                    color: this.configs.markColors[this.currentMark],
                    lineWidth: this.markLineWidth,
                })
                .scale(0.8);
        };

        this.getOMark = (cell) => {
            return new Mark(
                cell.x,
                cell.y,
                this.board.cellWidth,
                this.board.cellHeight
            )
                .of({
                    type: this.marks[1],
                    color: this.configs.markColors[1],
                    lineWidth: this.markLineWidth,
                })
                .scale(0.8);
        };

        this.getXMark = (cell) => {
            return new Mark(
                cell.x,
                cell.y,
                this.board.cellWidth,
                this.board.cellHeight
            )
                .of({
                    type: this.marks[0],
                    color: this.configs.markColors[0],
                    lineWidth: this.markLineWidth,
                })
                .scale(0.8);
        };

        this.markDown = () => {
            let markedCell = null;
            this.forEachCell(({ cell, col, row }) => {
                if (this.isUnderMouse(cell) && !cell.player) {
                    cell.player = this.getNextMark(cell);
                    markedCell = { col, row };
                    this.totalMarked++;
                    return;
                }
            });
            return markedCell;
        };

        this.botMarkDown = () => {
            let { col, row } = this.botMove();
            this.board.cells[row][col].player = this.getNextMark(
                this.board.cells[row][col]
            );
            this.totalMarked++;
            return { col, row };
        };

        this.getCell = ({ col, row }) => {
            if (
                col < 0 ||
                col >= this.configs.cols ||
                row < 0 ||
                row >= this.configs.rows
            )
                return null;
            return this.board.cells[row][col];
        };

        this.getHoverCell = () => {
            let hoverCell = null;
            this.forEachCell(({ cell }) => {
                if (cell.hover) {
                    hoverCell = cell;
                }
            });
            return hoverCell;
        };

        this.selectCells = (cells) => {
            cells.forEach((cell) => {
                cell.selected = true;
            });
        };

        const getStrike = ({ col, row, direction }) => {
            let currentCell = this.getCell({ col, row });
            if (!currentCell.player) return { point: 0, cells: [] };
            let point = 1;
            let cells = [currentCell];
            let dcol, drow;
            switch (direction) {
                case "horizontal":
                    dcol = [-1, 1];
                    drow = [0, 0];
                    break;
                case "vertical":
                    dcol = [0, 0];
                    drow = [-1, 1];
                    break;
                case "diagonal":
                    dcol = [-1, 1];
                    drow = [-1, 1];
                    break;
                case "anti-diagonal":
                    dcol = [-1, 1];
                    drow = [1, -1];
                    break;
                default:
                    return { point, cells };
            }
            let tcol = col;
            let trow = row;
            // left
            while (true) {
                tcol += dcol[0];
                trow += drow[0];
                if (
                    tcol < 0 ||
                    tcol >= this.configs.cols ||
                    trow < 0 ||
                    trow >= this.configs.rows
                )
                    break;
                let tempCell = this.getCell({ col: tcol, row: trow });
                if (
                    !tempCell.player ||
                    tempCell.player.type !== currentCell.player.type
                )
                    break;
                point++;
                cells.push(tempCell);
            }
            tcol = col;
            trow = row;
            // right
            while (true) {
                tcol += dcol[1];
                trow += drow[1];
                if (
                    tcol < 0 ||
                    tcol >= this.configs.cols ||
                    trow < 0 ||
                    trow >= this.configs.rows
                )
                    break;
                let tempCell = this.getCell({ col: tcol, row: trow });
                if (
                    !tempCell.player ||
                    tempCell.player.type !== currentCell.player.type
                )
                    break;
                point++;
                cells.push(tempCell);
            }
            return { point, cells };
        };
        this.checkWin = ({ col, row }) => {
            let winStrike = [];
            let winner = null;
            let h_strike = getStrike({ col, row, direction: "horizontal" });
            let v_strike = getStrike({ col, row, direction: "vertical" });
            let d_strike = getStrike({ col, row, direction: "diagonal" });
            let ad_strike = getStrike({ col, row, direction: "anti-diagonal" });
            if (h_strike.point >= this.winPoint)
                winStrike = [...winStrike, ...h_strike.cells];
            if (v_strike.point >= this.winPoint)
                winStrike = [...winStrike, ...v_strike.cells];
            if (d_strike.point >= this.winPoint)
                winStrike = [...winStrike, ...d_strike.cells];
            if (ad_strike.point >= this.winPoint)
                winStrike = [...winStrike, ...ad_strike.cells];
            let win = winStrike.length > 0;
            let bestStrike = Math.max(
                h_strike.point,
                v_strike.point,
                d_strike.point,
                ad_strike.point
            );
            if (win) {
                winner = winStrike[0].player.type;
            } else {
                if (this.totalMarked === this.totalCells)
                    return { win: false, winner: null, cells: [], draw: true, bestStrike };
            }
            
            return { win, winner, cells: winStrike, draw: false, bestStrike };
        };
    }

    update() {
        // Update hover cells
        this.forEachCell(({ cell }) => {
            cell.hover = this.isUnderMouse(cell);
        });
    }

    render() {
        // Clear canvas
        this.c.clearRect(0, 0, this.board.width, this.board.height);

        // Draw layers
        this.layers.background();
        this.layers.hoverCells();
        this.layers.selectedCells();
        this.layers.grid();
        this.layers.marks();
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    listenForWinner(callback = () => {}) {
        this.winnerListener = (winner) => {
            callback(winner);
            this.winner = null;
        };
    }

    destroy() {
        // Removes all event listeners
        this.canvas.removeEventListener("mousemove", this.handleMouseMove);
        this.canvas.removeEventListener("click", this.handleClick);
        window.removeEventListener("mousemove", this.trackWindowMouse);
    }
}

export default Core;
