const MIN_PLAYERS = 3;
const MAX_PLAYERS = 8;
const NUMBER_MIN = 1;
const NUMBER_MAX = 100;

const TOPICS = [
  { subject: "寿司ネタの人気度", low: "あまり頼まれない渋いネタ", high: "みんなが真っ先に頼む鉄板ネタ" },
  { subject: "動物の人気度", low: "名前もあまり知られていない地味な生き物", high: "動物園で一番の人気者" },
  { subject: "コンビニスイーツの背徳感", low: "ヘルシーで罪悪感ゼロ", high: "食べた瞬間に後悔する背徳の味" },
  { subject: "カラオケで盛り上がる曲度", low: "誰も知らないマニアックな曲", high: "イントロで全員総立ち" },
  { subject: "ラーメンの背徳感", low: "あっさりヘルシー系", high: "背脂ドロドロ全部乗せ" },
  { subject: "芸能人の知名度", low: "あまり知られていない", high: "知らない人がいない国民的スター" },
  { subject: "給食で人気だったメニュー度", low: "残されがちだった", high: "おかわり争奪戦の的だった" },
  { subject: "お祭りの屋台の人気度", low: "あまり並ばない", high: "行列必至の大人気屋台" },
  { subject: "アニメ・漫画キャラの強さ", low: "モブキャラ級", high: "ラスボス級のチート" },
  { subject: "遊園地アトラクションのスリル度", low: "観覧車レベル", high: "絶叫が止まらない絶叫マシン" },
  { subject: "ペットとして人気の生き物度", low: "誰もあまり飼いたがらない", high: "犬猫並みの大人気ペット" },
  { subject: "コンビニおにぎりの具の人気度", low: "棚に残りがちな地味な具", high: "発売してすぐ売り切れる鉄板の具" },
  { subject: "甘いものの背徳度", low: "罪悪感ゼロのヘルシースイーツ", high: "カロリーお化けの背徳スイーツ" },
  { subject: "お風呂・温泉の熱さ", low: "ぬるめでずっと入っていられる", high: "一瞬で飛び出す激熱" },
  { subject: "花火大会の盛り上がり度", low: "こじんまりした地域の花火", high: "何十万人も集まる超有名花火大会" },
  { subject: "ゲームのボスの強さ", low: "初心者でも瞬殺できる", high: "何十回も挑んでやっと倒せる" },
  { subject: "お笑い芸人のツッコミの鋭さ", low: "優しく流すツッコミ", high: "一撃で場を支配するツッコミ" },
  { subject: "部活・サークルのきつさ", low: "週1でゆるく楽しむ", high: "休みなしの根性系" },
  { subject: "猫カフェの猫のモフモフ度", low: "毛が短くさっぱりした猫", high: "埋もれるレベルのモフモフ猫" },
  { subject: "お土産として喜ばれる度", low: "正直あまり喜ばれない", high: "リクエストが殺到する鉄板土産" },
  { subject: "夏フェスの人気度", low: "身内だけで盛り上がる規模", high: "チケット争奪戦必至の超人気フェス" },
  { subject: "朝ごはんの満足度", low: "何も食べずに済ます", high: "品数豊富なフルコース" },
  { subject: "動物園・水族館の看板スター度", low: "あまり注目されない", high: "グッズが売り切れる看板スター" },
  { subject: "コスプレの完成度", low: "手作り感満載", high: "本物と見間違うレベル" },
  { subject: "100円ショップの掘り出し物度", low: "よくある普通の商品", high: "SNSでバズる神アイテム" },
  { subject: "お笑い番組の腹筋崩壊度", low: "くすっと笑う程度", high: "涙が出るほど笑い転げる" },
  { subject: "都市伝説の信憑性", low: "誰も信じていない", high: "本気で信じている人が多い" },
  { subject: "幼少期の憧れの職業度", low: "あまり人気がなかった", high: "クラスの半分が憧れた職業" },
  { subject: "スイーツビュッフェの満足度", low: "すぐお腹いっぱいになる", high: "何時間でも食べていられる" },
  { subject: "旅行先としての人気度", low: "歩いて行ける近所", high: "人生をかけて行く憧れの地" },
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
