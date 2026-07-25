const COLS = 10;
const ROWS = 20;
const CELL = 30;

const COLORS = {
  I: "#4dd8e8",
  O: "#f2d94e",
  T: "#b46df0",
  S: "#5ee87a",
  Z: "#f2564e",
  J: "#4e79f2",
  L: "#f2954e",
};

const SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

const boardCanvas = document.getElementById("board");
const ctx = boardCanvas.getContext("2d");
const nextCanvas = document.getElementById("next");
const nextCtx = nextCanvas.getContext("2d");
const holdCanvas = document.getElementById("hold");
const holdCtx = holdCanvas.getContext("2d");
const scoreEl = document.getElementById("score");
const linesEl = document.getElementById("lines");
const levelEl = document.getElementById("level");
const overlay = document.getElementById("overlay");
const overlayText = document.getElementById("overlay-text");

let board, bag, current, next, held, canHold, score, lines, level, dropInterval, dropTimer;
let paused, gameOver, lastTime;

function createBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function refillBag() {
  const pieces = Object.keys(SHAPES);
  for (let i = pieces.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pieces[i], pieces[j]] = [pieces[j], pieces[i]];
  }
  return pieces;
}

function nextFromBag() {
  if (bag.length === 0) bag = refillBag();
  return bag.pop();
}

function spawnPiece(type) {
  const matrix = SHAPES[type].map((row) => row.slice());
  return {
    type,
    matrix,
    row: 0,
    col: Math.floor((COLS - matrix.length) / 2),
  };
}

function rotateMatrix(matrix) {
  const n = matrix.length;
  const result = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      result[c][n - 1 - r] = matrix[r][c];
    }
  }
  return result;
}

function collides(matrix, row, col) {
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (!matrix[r][c]) continue;
      const boardRow = row + r;
      const boardCol = col + c;
      if (boardCol < 0 || boardCol >= COLS || boardRow >= ROWS) return true;
      if (boardRow >= 0 && board[boardRow][boardCol]) return true;
    }
  }
  return false;
}

function merge() {
  const { matrix, row, col, type } = current;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] && row + r >= 0) {
        board[row + r][col + c] = type;
      }
    }
  }
}

function clearLines() {
  let cleared = 0;
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r].every((cell) => cell)) {
      board.splice(r, 1);
      board.unshift(Array(COLS).fill(null));
      cleared++;
      r++;
    }
  }
  if (cleared > 0) {
    const points = [0, 100, 300, 500, 800][cleared] * level;
    score += points;
    lines += cleared;
    const newLevel = Math.floor(lines / 10) + 1;
    if (newLevel !== level) {
      level = newLevel;
      dropInterval = Math.max(100, 1000 - (level - 1) * 80);
    }
    updateStats();
  }
}

function updateStats() {
  scoreEl.textContent = score;
  linesEl.textContent = lines;
  levelEl.textContent = level;
}

function spawnNext() {
  current = next;
  current.row = 0;
  current.col = Math.floor((COLS - current.matrix.length) / 2);
  next = spawnPiece(nextFromBag());
  canHold = true;
  if (collides(current.matrix, current.row, current.col)) {
    endGame();
  }
  drawNext();
}

function holdPiece() {
  if (paused || gameOver || !canHold) return;
  canHold = false;
  const currentType = current.type;
  if (held === null) {
    held = currentType;
    spawnNext();
  } else {
    const swapped = spawnPiece(held);
    held = currentType;
    current = swapped;
    if (collides(current.matrix, current.row, current.col)) {
      endGame();
    }
  }
  drawHold();
  draw();
}

function ghostRow() {
  let row = current.row;
  while (!collides(current.matrix, row + 1, current.col)) {
    row++;
  }
  return row;
}

function move(dx) {
  if (paused || gameOver) return;
  if (!collides(current.matrix, current.row, current.col + dx)) {
    current.col += dx;
    draw();
  }
}

function softDrop() {
  if (paused || gameOver) return;
  if (!collides(current.matrix, current.row + 1, current.col)) {
    current.row++;
    score += 1;
    updateStats();
    draw();
  } else {
    lockPiece();
  }
  dropTimer = 0;
}

function hardDrop() {
  if (paused || gameOver) return;
  let dist = 0;
  while (!collides(current.matrix, current.row + 1, current.col)) {
    current.row++;
    dist++;
  }
  score += dist * 2;
  updateStats();
  lockPiece();
  dropTimer = 0;
}

function rotate() {
  if (paused || gameOver) return;
  const rotated = rotateMatrix(current.matrix);
  const kicks = [0, -1, 1, -2, 2];
  for (const kick of kicks) {
    if (!collides(rotated, current.row, current.col + kick)) {
      current.matrix = rotated;
      current.col += kick;
      draw();
      return;
    }
  }
}

function lockPiece() {
  merge();
  clearLines();
  spawnNext();
  draw();
}

function endGame() {
  gameOver = true;
  overlayText.textContent = "GAME OVER";
  overlay.classList.remove("hidden");
}

function togglePause() {
  if (gameOver) return;
  paused = !paused;
  if (paused) {
    overlayText.textContent = "PAUSE";
    overlay.classList.remove("hidden");
  } else {
    overlay.classList.add("hidden");
  }
}

function drawCell(context, r, c, color) {
  context.fillStyle = color;
  context.fillRect(c * CELL + 1, r * CELL + 1, CELL - 2, CELL - 2);
}

function drawGhostCell(r, c, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(c * CELL + 2, r * CELL + 2, CELL - 4, CELL - 4);
}

function draw() {
  ctx.clearRect(0, 0, boardCanvas.width, boardCanvas.height);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c]) drawCell(ctx, r, c, COLORS[board[r][c]]);
    }
  }
  const { matrix, row, col, type } = current;
  const gRow = ghostRow();
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] && gRow + r >= 0) {
        drawGhostCell(gRow + r, col + c, COLORS[type]);
      }
    }
  }
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] && row + r >= 0) {
        drawCell(ctx, row + r, col + c, COLORS[type]);
      }
    }
  }
}

function drawNext() {
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  const matrix = next.matrix;
  const size = matrix.length;
  const cell = 24;
  const offset = (nextCanvas.width - size * cell) / 2;
  nextCtx.save();
  nextCtx.translate(offset, offset);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) {
        nextCtx.fillStyle = COLORS[next.type];
        nextCtx.fillRect(c * cell + 1, r * cell + 1, cell - 2, cell - 2);
      }
    }
  }
  nextCtx.restore();
}

function drawHold() {
  holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
  if (!held) return;
  const matrix = SHAPES[held];
  const size = matrix.length;
  const cell = 24;
  const offset = (holdCanvas.width - size * cell) / 2;
  holdCtx.save();
  holdCtx.translate(offset, offset);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) {
        holdCtx.fillStyle = COLORS[held];
        holdCtx.fillRect(c * cell + 1, r * cell + 1, cell - 2, cell - 2);
      }
    }
  }
  holdCtx.restore();
}

function loop(time) {
  if (!lastTime) lastTime = time;
  const delta = time - lastTime;
  lastTime = time;

  if (!paused && !gameOver) {
    dropTimer += delta;
    if (dropTimer > dropInterval) {
      dropTimer = 0;
      if (!collides(current.matrix, current.row + 1, current.col)) {
        current.row++;
      } else {
        lockPiece();
      }
      draw();
    }
  }
  requestAnimationFrame(loop);
}

function start() {
  board = createBoard();
  bag = [];
  held = null;
  canHold = true;
  score = 0;
  lines = 0;
  level = 1;
  dropInterval = 1000;
  dropTimer = 0;
  paused = false;
  gameOver = false;
  lastTime = 0;
  next = spawnPiece(nextFromBag());
  spawnNext();
  updateStats();
  drawHold();
  overlay.classList.add("hidden");
  draw();
}

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowLeft":
      e.preventDefault();
      move(-1);
      break;
    case "ArrowRight":
      e.preventDefault();
      move(1);
      break;
    case "ArrowDown":
      e.preventDefault();
      softDrop();
      break;
    case "ArrowUp":
      e.preventDefault();
      rotate();
      break;
    case " ":
      e.preventDefault();
      hardDrop();
      break;
    case "p":
    case "P":
      togglePause();
      break;
    case "c":
    case "C":
      holdPiece();
      break;
  }
});

document.getElementById("restart").addEventListener("click", start);
document.getElementById("overlay-restart").addEventListener("click", start);

requestAnimationFrame(loop);
start();
