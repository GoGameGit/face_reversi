let board = [];
let current = "black";
let blackImg = null;
let whiteImg = null;
let lang = 'ja'; // 初期設定

// ラベルの定義（多言語対応）
const labels = {
  ja: {
    title: "顔●○リバーシ",
    blackImg: "⚫ 黒石画像を選択:",
    whiteImg: "⚪ 白石画像を選択:",
    blackName: "⚫ プレイヤー名:",
    whiteName: "⚪ プレイヤー名:",
    blackPlaceholder: "黒プレイヤー",
    whitePlaceholder: "白プレイヤー",
    restart: "🔁 リスタート",
    turn: (b, w, name) => `黒:${b} 白:${w} - ${name}の番です`,
    win: { black: "黒の勝利", white: "白の勝利", draw: "引き分け" }
  },
  en: {
    title: "Face Reversi",
    blackImg: "⚫ Select Black Image:",
    whiteImg: "⚪ Select White Image:",
    blackName: "⚫ Player Name:",
    whiteName: "⚪ Player Name:",
    blackPlaceholder: "Black Player",
    whitePlaceholder: "White Player",
    restart: "🔁 Restart",
    turn: (b, w, name) => `Black:${b} White:${w} - ${name}'s Turn`,
    win: { black: "Black Wins", white: "White Wins", draw: "Draw" }
  }
};

function switchLanguage(language) {
  lang = language;
  document.getElementById("game-title").innerText = labels[lang].title;
  document.getElementById("page-title").innerText = labels[lang].title;
  document.querySelector('.label-black-img').innerText = labels[lang].blackImg;
  document.querySelector('.label-white-img').innerText = labels[lang].whiteImg;
  document.querySelector('.label-black-name').innerText = labels[lang].blackName;
  document.querySelector('.label-white-name').innerText = labels[lang].whiteName;
  document.getElementById("blackName").placeholder = labels[lang].blackPlaceholder;
  document.getElementById("whiteName").placeholder = labels[lang].whitePlaceholder;
  document.getElementById("restartBtn").innerText = labels[lang].restart;
  updateStatus();
}

function createBoard() {
  board = [];
  const container = document.getElementById("board");
  container.innerHTML = "";
  for (let y = 0; y < 8; y++) {
    const row = [];
    for (let x = 0; x < 8; x++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.x = x;
      cell.dataset.y = y;
      cell.addEventListener("click", handleClick);
      container.appendChild(cell);
      row.push(null);
    }
    board.push(row);
  }
  placeStone(3, 3, "white");
  placeStone(4, 4, "white");
  placeStone(3, 4, "black");
  placeStone(4, 3, "black");
  updateStatus();
}

function placeStone(x, y, color) {
  const cell = document.querySelector(`.cell[data-x='${x}'][data-y='${y}']`);
  const img = document.createElement("img");
  img.classList.add("stone", color);
  img.src =
    color === "black"
      ? blackImg || "data:image/svg+xml;base64,CjxzdmcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB3aWR0aD0nMzYnIGhlaWdodD0nMzYnPgogIDxjaXJjbGUgY3g9JzE4JyBjeT0nMTgnIHI9JzE2JyBmaWxsPSdibGFjaycgc3Ryb2tlPSdibGFjaycgc3Ryb2tlLXdpZHRoPScyJy8+Cjwvc3ZnPgo="
      : whiteImg || "data:image/svg+xml;base64,CjxzdmcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB3aWR0aD0nMzYnIGhlaWdodD0nMzYnPgogIDxjaXJjbGUgY3g9JzE4JyBjeT0nMTgnIHI9JzE2JyBmaWxsPSd3aGl0ZScgc3Ryb2tlPSd3aGl0ZScgc3Ryb2tlLXdpZHRoPScyJy8+Cjwvc3ZnPgo=";
  cell.innerHTML = "";
  cell.appendChild(img);
  board[y][x] = color;
}

function handleClick(e) {
  const x = parseInt(e.currentTarget.dataset.x);
  const y = parseInt(e.currentTarget.dataset.y);
  if (board[y][x]) return;
  const flips = getFlips(x, y, current);
  if (flips.length === 0) return;
  placeStone(x, y, current);
  flips.forEach(([fx, fy]) => placeStone(fx, fy, current));
  current = current === "black" ? "white" : "black";
  if (!hasValidMoves(current)) {
    current = current === "black" ? "white" : "black";
    if (!hasValidMoves(current)) {
      setTimeout(() => {
        const b = board.flat().filter(x => x === "black").length;
        const w = board.flat().filter(x => x === "white").length;
        const winner = b > w ? "black" : w > b ? "white" : "draw";
        const overlay = document.createElement("div");
        overlay.style = "position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:1000;flex-direction:column;color:white;font-size:2rem;cursor:pointer;";
        if ((winner === "black" && blackImg) || (winner === "white" && whiteImg)) {
          const img = document.createElement("img");
          img.src = winner === "black" ? blackImg : whiteImg;
          img.style = "border-radius:50%;width:200px;height:200px;object-fit:cover;";
          overlay.appendChild(img);
        } else {
          overlay.textContent = labels[lang].win[winner];
        }
        document.body.appendChild(overlay);
        overlay.addEventListener("click", () => {
          overlay.remove();
          restartGame();
        });
      }, 100);
      return;
    }
  }
  updateStatus();
}

function getFlips(x, y, color) {
  const opp = color === "black" ? "white" : "black";
  const flips = [];
  const dirs = [
    [1, 0],[0, 1],[-1, 0],[0, -1],
    [1, 1],[-1, -1],[1, -1],[-1, 1]
  ];
  for (let [dx, dy] of dirs) {
    const temp = [];
    let cx = x + dx, cy = y + dy;
    while (cx >= 0 && cx < 8 && cy >= 0 && cy < 8) {
      if (board[cy][cx] === opp) {
        temp.push([cx, cy]);
      } else if (board[cy][cx] === color && temp.length) {
        flips.push(...temp);
        break;
      } else break;
      cx += dx; cy += dy;
    }
  }
  return flips;
}

function hasValidMoves(color) {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (!board[y][x] && getFlips(x, y, color).length > 0) return true;
    }
  }
  return false;
}

function updateStatus() {
  const b = board.flat().filter(x => x === "black").length;
  const w = board.flat().filter(x => x === "white").length;
  const name = current === "black"
    ? document.getElementById("blackName").value || labels[lang].blackPlaceholder
    : document.getElementById("whiteName").value || labels[lang].whitePlaceholder;
  document.getElementById("status").innerText = labels[lang].turn(b, w, name);
}

function restartGame() {
  blackImg = null;
  whiteImg = null;
  current = "black";
  createBoard();
}

document.getElementById("blackImage").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => blackImg = reader.result;
    reader.readAsDataURL(file);
  }
});

document.getElementById("whiteImage").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => whiteImg = reader.result;
    reader.readAsDataURL(file);
  }
});

createBoard();
