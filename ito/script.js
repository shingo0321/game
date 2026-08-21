const MIN_PLAYERS = 3;
const MAX_PLAYERS = 8;
const NUMBER_MIN = 1;
const NUMBER_MAX = 100;

const TOPICS = [
  { subject: "辛い食べ物", low: "全く辛くない", high: "悶絶するほど激辛" },
  { subject: "旅行先", low: "歩いて行ける近所", high: "人生をかけて行く秘境" },
  { subject: "ホラー映画の怖さ", low: "全く怖くない", high: "夜眠れなくなるほど怖い" },
  { subject: "高級な食べ物", low: "100円で買える", high: "一生に一度食べられるかどうか" },
  { subject: "運動神経が必要なスポーツ", low: "誰でもできる", high: "オリンピック選手級" },
  { subject: "朝が早い仕事", low: "昼から出勤でOK", high: "深夜から仕込み開始" },
  { subject: "人生で一度はやってみたいこと", low: "今すぐできる", high: "叶う可能性がほぼゼロ", },
  { subject: "テンションが上がる音楽", low: "子守唄", high: "フェスのラスト曲" },
  { subject: "会いたくない人に遭遇した時の気まずさ", low: "全く気まずくない", high: "回れ右して逃げたい" },
  { subject: "夏休みの宿題の終わらせ方", low: "初日に全部終わらせる", high: "最終日の夜に泣きながらやる" },
  { subject: "動物の大きさ", low: "アリ", high: "シロナガスクジラ" },
  { subject: "お酒の強さ", low: "一滴で真っ赤になる", high: "浴びるほど飲んでも平気" },
  { subject: "プレゼンの緊張度", low: "友達との雑談レベル", high: "手が震えて声も出ない" },
  { subject: "田舎度", low: "コンビニが5分おきにある", high: "隣の家まで車で30分" },
  { subject: "パーティーでの盛り上げ役度", low: "隅で静かにしている", high: "マイクを離さない主役" },
  { subject: "貯金額", low: "財布に小銭だけ", high: "一生遊んで暮らせる" },
  { subject: "筋トレのきつさ", low: "ラジオ体操", high: "フルマラソン直後の腹筋100回" },
  { subject: "SF感のある未来技術", low: "今の延長線", high: "タイムマシン級" },
  { subject: "行列に並ぶ我慢強さ", low: "3分で離脱", high: "始発から並べる" },
  { subject: "掃除・片付けの徹底度", low: "足の踏み場もない", high: "モデルルームのよう" },
  { subject: "ペットとして飼う難易度", low: "金魚", high: "ライオン" },
  { subject: "カラオケで歌う時の恥ずかしさ", low: "堂々と一曲目からエース", high: "マイクを渡されて固まる" },
  { subject: "映画のエンドロールで泣く度", low: "全く泣かない", high: "ハンカチがびしょ濡れ" },
  { subject: "スマホの画面が割れている度", low: "新品同様", high: "蜘蛛の巣状でギリギリ操作可能" },
  { subject: "遅刻の常習度", low: "毎回15分前に到着", high: "集合時間に家を出る" },
  { subject: "一目惚れのしやすさ", low: "何年も好きな人ができない", high: "毎日誰かに惚れる" },
  { subject: "計画性", low: "行き当たりばったり", high: "分単位でスケジュール管理" },
  { subject: "自炊の頻度", low: "毎食外食・コンビニ", high: "出汁から取る完全自炊" },
  { subject: "ジェットコースターの絶叫度", low: "観覧車レベル", high: "絶叫が止まらない絶叫マシン" },
  { subject: "占いを信じる度合い", low: "全く信じない", high: "毎日チェックして人生の指針にする" },
];

const state = {
  screen: "setup",
  players: [],
  nextPlayerId: 1,
  topic: null,
  assignments: [],
  revealIndex: 0,
  order: [],
  revealResultIndex: 0,
  hadInversion: false,
  firstInversionRank: null,
};

const el = (id) => document.getElementById(id);

function showScreen(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.add("hidden"));
  el(`screen-${name}`).classList.remove("hidden");
  state.screen = name;
}

// ---------- setup screen ----------

function createPlayer(name) {
  return { id: state.nextPlayerId++, name };
}

function initPlayers() {
  state.players = [
    createPlayer("プレイヤー1"),
    createPlayer("プレイヤー2"),
    createPlayer("プレイヤー3"),
  ];
}

function renderPlayerList() {
  const list = el("player-list");
  list.innerHTML = "";
  state.players.forEach((player, i) => {
    const row = document.createElement("div");
    row.className = "player-row";

    const input = document.createElement("input");
    input.type = "text";
    input.value = player.name;
    input.maxLength = 12;
    input.addEventListener("input", () => {
      player.name = input.value;
    });
    row.appendChild(input);

    if (state.players.length > MIN_PLAYERS) {
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "remove-player";
      removeBtn.textContent = "✕";
      removeBtn.addEventListener("click", () => {
        state.players.splice(i, 1);
        renderPlayerList();
      });
      row.appendChild(removeBtn);
    }

    list.appendChild(row);
  });

  el("add-player").disabled = state.players.length >= MAX_PLAYERS;
}

el("add-player").addEventListener("click", () => {
  if (state.players.length >= MAX_PLAYERS) return;
  state.players.push(createPlayer(`プレイヤー${state.players.length + 1}`));
  renderPlayerList();
});

document.querySelectorAll('input[name="topic-mode"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    const isCustom = document.querySelector('input[name="topic-mode"]:checked').value === "custom";
    el("custom-topic-fields").classList.toggle("hidden", !isCustom);
  });
});

function showSetupError(message) {
  const errorBox = el("setup-error");
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function hideSetupError() {
  el("setup-error").classList.add("hidden");
}

function pickTopic() {
  const mode = document.querySelector('input[name="topic-mode"]:checked').value;
  if (mode === "custom") {
    const subject = el("custom-subject").value.trim();
    const low = el("custom-low").value.trim();
    const high = el("custom-high").value.trim();
    if (!subject || !low || !high) {
      return null;
    }
    return { subject, low, high };
  }
  return TOPICS[Math.floor(Math.random() * TOPICS.length)];
}

function shuffledUniqueNumbers(count) {
  const pool = [];
  for (let n = NUMBER_MIN; n <= NUMBER_MAX; n++) pool.push(n);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

function startGame() {
  hideSetupError();

  const names = state.players.map((p) => p.name.trim());
  if (names.some((n) => n.length === 0)) {
    showSetupError("プレイヤー名を入力してください。");
    return;
  }

  const topic = pickTopic();
  if (!topic) {
    showSetupError("お題の3項目をすべて入力してください。");
    return;
  }
  state.topic = topic;

  dealNewRound();
}

function dealNewRound() {
  const numbers = shuffledUniqueNumbers(state.players.length);
  state.assignments = state.players.map((p, i) => ({
    id: p.id,
    name: p.name.trim(),
    number: numbers[i],
  }));
  state.revealIndex = 0;
  state.order = state.assignments.map((a) => ({ ...a }));
  state.revealResultIndex = 0;
  state.hadInversion = false;
  state.firstInversionRank = null;

  renderTopicInto("reveal");
  startRevealTurn();
  showScreen("reveal");
}

el("start-game").addEventListener("click", startGame);

// ---------- private reveal screen ----------

function renderTopicInto(prefix) {
  el(`${prefix}-topic-low`).textContent = `1: ${state.topic.low}`;
  el(`${prefix}-topic-high`).textContent = `100: ${state.topic.high}`;
  el(`${prefix}-topic-subject`).textContent = state.topic.subject;
}

function startRevealTurn() {
  const current = state.assignments[state.revealIndex];
  el("reveal-current-name").textContent = current.name;
  el("reveal-peek-btn").classList.remove("hidden");
  el("reveal-number-view").classList.add("hidden");
  el("reveal-number").textContent = "--";
  el("reveal-progress").textContent = `${state.revealIndex + 1} / ${state.assignments.length} 人目`;
}

el("reveal-peek-btn").addEventListener("click", () => {
  const current = state.assignments[state.revealIndex];
  el("reveal-number").textContent = current.number;
  el("reveal-peek-btn").classList.add("hidden");
  el("reveal-number-view").classList.remove("hidden");
});

el("reveal-next-btn").addEventListener("click", () => {
  state.revealIndex++;
  if (state.revealIndex >= state.assignments.length) {
    startOrderScreen();
  } else {
    startRevealTurn();
  }
});

// ---------- ordering screen ----------

function startOrderScreen() {
  renderTopicInto("order");
  renderOrderList();
  showScreen("order");
}

function renderOrderList() {
  const list = el("order-list");
  list.innerHTML = "";
  state.order.forEach((entry, i) => {
    const row = document.createElement("div");
    row.className = "order-row";

    const rank = document.createElement("div");
    rank.className = "order-rank";
    rank.textContent = i + 1;
    row.appendChild(rank);

    const name = document.createElement("div");
    name.className = "order-name";
    name.textContent = entry.name;
    row.appendChild(name);

    const upBtn = document.createElement("button");
    upBtn.type = "button";
    upBtn.className = "order-btn";
    upBtn.textContent = "▲";
    upBtn.disabled = i === 0;
    upBtn.addEventListener("click", () => {
      [state.order[i - 1], state.order[i]] = [state.order[i], state.order[i - 1]];
      renderOrderList();
    });
    row.appendChild(upBtn);

    const downBtn = document.createElement("button");
    downBtn.type = "button";
    downBtn.className = "order-btn";
    downBtn.textContent = "▼";
    downBtn.disabled = i === state.order.length - 1;
    downBtn.addEventListener("click", () => {
      [state.order[i], state.order[i + 1]] = [state.order[i + 1], state.order[i]];
      renderOrderList();
    });
    row.appendChild(downBtn);

    list.appendChild(row);
  });
}

el("confirm-order").addEventListener("click", () => {
  renderTopicInto("rr");
  renderRevealOrderList();
  showScreen("result-reveal");
});

// ---------- reveal-in-order screen ----------

function renderRevealOrderList() {
  const list = el("reveal-order-list");
  list.innerHTML = "";
  state.order.forEach((entry, i) => {
    const row = document.createElement("div");
    row.className = "reveal-card-row";
    row.id = `rc-row-${i}`;

    const name = document.createElement("div");
    name.className = "rc-name";
    name.textContent = entry.name;
    row.appendChild(name);

    const number = document.createElement("div");
    number.className = "rc-number";
    number.textContent = "?";
    number.id = `rc-number-${i}`;
    row.appendChild(number);

    list.appendChild(row);
  });
  updateRevealButtonLabel();
  highlightCurrentRow();
}

function highlightCurrentRow() {
  state.order.forEach((_, i) => {
    document.getElementById(`rc-row-${i}`).classList.remove("current");
  });
  if (state.revealResultIndex < state.order.length) {
    document.getElementById(`rc-row-${state.revealResultIndex}`).classList.add("current");
  }
}

function updateRevealButtonLabel() {
  const btn = el("reveal-next-card");
  btn.textContent = state.revealResultIndex >= state.order.length ? "結果を見る" : "めくる";
}

el("reveal-next-card").addEventListener("click", () => {
  if (state.revealResultIndex >= state.order.length) {
    showResultScreen();
    return;
  }

  const i = state.revealResultIndex;
  const entry = state.order[i];
  const row = document.getElementById(`rc-row-${i}`);
  const numberEl = document.getElementById(`rc-number-${i}`);
  numberEl.textContent = entry.number;

  const maxSoFar = i === 0 ? -Infinity : Math.max(...state.order.slice(0, i).map((e) => e.number));
  if (entry.number < maxSoFar) {
    row.classList.add("ng");
    state.hadInversion = true;
    if (state.firstInversionRank === null) state.firstInversionRank = i + 1;
  } else {
    row.classList.add("ok");
  }

  state.revealResultIndex++;
  highlightCurrentRow();
  updateRevealButtonLabel();
});

// ---------- result screen ----------

function showResultScreen() {
  const headline = el("result-headline");
  const summary = el("result-summary");

  if (state.hadInversion) {
    headline.textContent = "❌ 惜しい！";
    summary.textContent = `${state.firstInversionRank}枚目で数字の順番が逆転してしまいました。`;
  } else {
    headline.textContent = "🎉 大成功！";
    summary.textContent = "全員の数字が小さい順に並びました！";
  }

  const list = el("result-list");
  list.innerHTML = "";
  state.order.forEach((entry, i) => {
    const row = document.createElement("div");
    const maxSoFar = i === 0 ? -Infinity : Math.max(...state.order.slice(0, i).map((e) => e.number));
    const isNg = entry.number < maxSoFar;
    row.className = `reveal-card-row ${isNg ? "ng" : "ok"}`;

    const name = document.createElement("div");
    name.className = "rc-name";
    name.textContent = entry.name;
    row.appendChild(name);

    const number = document.createElement("div");
    number.className = "rc-number";
    number.textContent = entry.number;
    row.appendChild(number);

    list.appendChild(row);
  });

  showScreen("result");
}

el("replay-same").addEventListener("click", () => {
  dealNewRound();
});

el("replay-reset").addEventListener("click", () => {
  initPlayers();
  renderPlayerList();
  hideSetupError();
  showScreen("setup");
});

// ---------- init ----------

initPlayers();
renderPlayerList();
showScreen("setup");
