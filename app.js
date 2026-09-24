//alert("app.js loaded");
console.log("app.js loaded");

// ===== 表示スピード設定 =====
const speedSettings = {
  beginner: 1200,      // ゆっくり
  intermediate: 800,   // 普通
  advanced: 500        // 速い
};

let currentLevel = "beginner";
let displayInterval = 1000; // 初期値（あとで上書き）

// ===== 状態管理 =====
let current;
let timers = [];
let currentLength = 3;
let currentWords = [];

// 正答率計算用状態管理
let total = 0;
let correct = 0;

// 表示回数管理用
let displayCount = 0;       // 現在の問題の表示回数
let totalDisplayCount = 0;  // 全問題の表示回数合計
let oneShotCorrect = 0;     // 1回の表示で読めて正解した問題数

// ===== 文字数選択 =====
function selectLength(len) {
  currentLength = len;

  [3, 4, 5, 6].forEach(n => {
    const btn = document.getElementById("len" + n);
    if (btn) btn.style.background = "";
  });

  document.getElementById("len" + len).style.background = "#87CEFA";

  // 文字数を選択したら、スピード選択を表示
  document.getElementById("speed-select").style.display = "block";

  // スピードをまだ選んでいない状態に戻す
  document.getElementById("start-area").style.display = "none";
}

// ===== 表示スピード選択 =====
function selectSpeed(speed) {
  displayInterval = speed;

  document.getElementById("spd1200").style.background = "";
  document.getElementById("spd800").style.background = "";
  document.getElementById("spd500").style.background = "";

  document.getElementById("spd" + speed).style.background = "#87CEFA";

  const startArea = document.getElementById("start-area");
  startArea.style.display = "block";

  // 「始める」が画面外に出ていたら、自動的に見える位置までスクロール
  requestAnimationFrame(() => {
    startArea.scrollIntoView({
      behavior: "smooth",
      block: "nearest"
    });
  });
}

function speedLabel(speed) {
  if (speed === 1200) return "ゆっくり";
  if (speed === 800) return "ふつう";
  if (speed === 500) return "はやい";
  return `${speed}ms`;
}

// ===== 回答選択肢生成 =====
function generateChoices(correctWord, wordList) {
  // 正解以外を抽出
  const others = wordList.filter(w => w.text !== correctWord);

  // シャッフル
  const shuffled = others.sort(() => 0.5 - Math.random());

  // 2つ選ぶ
  const choices = [correctWord];
  if (shuffled.length >= 2) {
    choices.push(shuffled[0].text);
    choices.push(shuffled[1].text);
  }

  // 並びもシャッフル
  return choices.sort(() => 0.5 - Math.random());
}

// ===== クイズ開始 =====
function startQuiz() {
  currentWords = wordLists[currentLength];

  if (!currentWords || currentWords.length === 0) {
    alert(`${currentLength}文字の単語が登録されていません`);
    return;
  }

  total = 0;
  correct = 0;
  totalDisplayCount = 0;
  displayCount = 0;
  oneShotCorrect = 0;
  updateScore();

  document.getElementById("start-screen").style.display = "none";
  document.getElementById("quiz-screen").style.display = "block";

  nextQuiz();
}

// ===== クイズ出題 =====
async function nextQuiz() {
  timers.forEach(t => clearTimeout(t));
  timers = [];

  document.getElementById("replayBtn").disabled = false; // 追加
  document.getElementById("result").textContent = "";
  document.getElementById("choices").innerHTML = "";
  document.getElementById("image-area").innerHTML = "";
  //document.getElementById("replayBtn").style.display = "none";

  current = currentWords[Math.floor(Math.random() * currentWords.length)];
  current.choices = generateChoices(current.text, currentWords);
  current.images = textToImages(current.text);

  // 新しい問題なので表示回数をリセット
  displayCount = 0;

  // ここで画像読み込み完了を待つ
  await preloadImages(current.images);

  // 少しだけ余裕を置く
  setTimeout(() => {
    showImagesSequentially(current.images);
  }, 100);
}

// ===== 画像の事前読み込み =====
function preloadImages(charImages) {
  const frames = charImages.flat();

  const promises = frames.map(frame => {
    const src = typeof frame === "string" ? frame : frame.src;

    return new Promise(resolve => {
      const img = new Image();

      img.onload = resolve;
      img.onerror = resolve; // 読み込み失敗でも止まらないようにする
      img.src = "images/" + src;
    });
  });

  return Promise.all(promises);
}

// ===== 1文字ずつ表示 =====
function showImagesSequentially(charImages) {
  // この問題を1回表示した
  displayCount++;

  const area = document.getElementById("image-area");

  area.classList.remove("all-images");
  area.innerHTML = "";

  let time = 200;
  const gapTime = 200;
  const moveRight = 60;
  const moveUp = 50;
  const moveDown = 50;

  charImages.forEach(frames => {

    const frameTime = displayInterval / frames.length;

    frames.forEach(frame => {

      const t = setTimeout(() => {
        area.innerHTML = "";

        const i = document.createElement("img");
        i.classList.add("fade-in");

        let transforms = [];

        if (typeof frame === "string") {

          i.src = "images/" + frame;

        } else {

          i.src = "images/" + frame.src;

         if (frame.move === "right") {
           transforms.push(`translateX(${moveRight}px)`);
         }

         if (frame.move === "up") {
           transforms.push(`translateY(-${moveUp}px)`);
         }

         if (frame.move === "down") {
           transforms.push(`translateY(${moveDown}px)`);
         }

          if (frame.move === "pull") {
            transforms.push("scale(0.6)");
          }
        }

        i.style.transform = transforms.join(" ");
        area.appendChild(i);

      }, time);

      timers.push(t);
      time += frameTime;

    });
    
    // 文字が終わったタイミングで一度消す
    const gapTimer = setTimeout(() => {
      area.innerHTML = "";
    }, time);

    timers.push(gapTimer);

    // 次の文字まで少し間を空ける
    time += gapTime;
  });

  const clearTimer = setTimeout(() => {
    area.innerHTML = "";
  }, time);

  timers.push(clearTimer);

  const choiceTimer = setTimeout(() => {
    showChoices(current.choices);

    // 「もう一度表示」を再び押せるようにする
    document.getElementById("replayBtn").disabled = false;
  }, time + 300);

  timers.push(choiceTimer);
}

// 回答選択肢を表示
function showChoices(choices) {
  const container = document.getElementById("choices");
  container.innerHTML = "";

  if (!choices) {
    console.error("choices undefined");
    return;
  }

  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice;

    btn.onclick = () => {
      check(choice, btn);
    };

    container.appendChild(btn);
  });
}

// ===== もう一度指文字を表示（「もう一度表示」ボタン押下時）=====
function replay() {
  // 連打防止
  document.getElementById("replayBtn").disabled = true;

  // 今動いているタイマーを止める
  timers.forEach(t => clearTimeout(t));
  timers = [];

  // 選択肢を消す
  document.getElementById("choices").innerHTML = "";

  // 画像を消す
  document.getElementById("image-area").innerHTML = "";

  // もう一度同じ問題を再生
  // 初回出題と同じように、表示終了後に選択肢を表示
  showImagesSequentially(current.images);
}

// ===== 正誤判定 =====
function check(answer, button) {
  const result = document.getElementById("result");

  const isCorrect = (answer === current.text);

  button.style.backgroundColor = isCorrect ? "#66aaff" : "#f88";
  button.style.color = "#fff";

  total++;

  totalDisplayCount += displayCount;

  // クリックされたボタンだけ残す
  const choicesArea = document.getElementById("choices");
  choicesArea.innerHTML = "";
  choicesArea.appendChild(button);

  if (isCorrect) {
    correct++;
    if (displayCount === 1) {
      oneShotCorrect++;
    }
    result.textContent = "⭕ 正解！";

  } else {
    result.textContent = "❌ ちがうよ";
    //document.getElementById("replayBtn").style.display = "inline-block";
  }

  updateScore();
  document.getElementById("replayBtn").disabled = true; // 追加
}

// ===== 前回の成績を取得 =====
function getLastResult() {
  const saved = localStorage.getItem("lastResult");

  if (!saved) {
    return null;
  }

  return JSON.parse(saved);
}

// ===== スコア更新 =====
function updateScore() {
  document.getElementById("score").textContent =
  `${currentLevel}：${correct} / ${total}`;
}

// ===== クイズ終了 =====
function endQuiz() {
  const rate = total === 0 ? 0 : Math.round((correct / total) * 100);
  const averageDisplayCount =
    total === 0 ? 0 : (totalDisplayCount / total).toFixed(1);

  // 前回の成績を取得
  const previousResult = getLastResult();

  // 前回成績の表示
  let previousText = "";

  if (previousResult) {
    previousText =
      `\n\n前回の成績（${previousResult.length}文字・${speedLabel(previousResult.speed)}）\n` +
      `　正解数: ${previousResult.correct} / ${previousResult.total}\n` +
      `　正答率: ${previousResult.rate}%\n` +
      `　平均表示回数: ${previousResult.averageDisplayCount}回\n` +
      `　1回で読めた問題: ${previousResult.oneShotCorrect}問`;
  }

  alert(
    `お疲れさまでした！\n\n` +
    `今回の成績（${currentLength}文字・${speedLabel(displayInterval)}）\n` +
    `　正解数: ${correct} / ${total}\n` +
    `　正答率: ${rate}%\n` +
    `　平均表示回数: ${averageDisplayCount}回\n` +
    `　1回で読めた問題: ${oneShotCorrect}問` +
    previousText
  );

  // 今回の成績を保存
  const lastResult = {
    length: currentLength,
    speed: displayInterval,
    total: total,
    correct: correct,
    rate: rate,
    averageDisplayCount: Number(averageDisplayCount),
    oneShotCorrect: oneShotCorrect
  };

  localStorage.setItem("lastResult", JSON.stringify(lastResult));

  // リセット
  total = 0;
  correct = 0;
  updateScore();

  // 初期画面に戻る
  document.getElementById("quiz-screen").style.display = "none";
  document.getElementById("start-screen").style.display = "block";
}
