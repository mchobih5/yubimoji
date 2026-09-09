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

// ===== 文字数選択 =====
function selectLength(len) {
  currentLength = len;

  [3, 4, 5, 6].forEach(n => {
    const btn = document.getElementById("len" + n);
    if (btn) btn.style.background = "";
  });

  document.getElementById("len" + len).style.background = "#87CEFA";
}

// ===== 表示スピード選択 =====
function selectSpeed(speed) {
  displayInterval = speed;

  document.getElementById("spd1200").style.background = "";
  document.getElementById("spd800").style.background = "";
  document.getElementById("spd500").style.background = "";

  document.getElementById("spd" + speed).style.background = "#87CEFA";
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
  updateScore();

  document.getElementById("start-screen").style.display = "none";
  document.getElementById("quiz-screen").style.display = "block";

  setTimeout(() => {
    nextQuiz();
  }, 500);
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
function showImagesSequentially(charImages, showChoice = true) {
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

  if (showChoice) {
    const choiceTimer = setTimeout(() => {
      showChoices(current.choices);
    }, time + 300);

    timers.push(choiceTimer);
  } else {
    const enableTimer = setTimeout(() => {
      document.getElementById("replayBtn").disabled = false;
    }, time);

    timers.push(enableTimer);
  }
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

  // 画像を消す
  document.getElementById("image-area").innerHTML = "";

  // もう一度同じ問題を再生
  showImagesSequentially(current.images, false);
}

// ===== 正誤判定 =====
function check(answer, button) {
  const result = document.getElementById("result");

  const isCorrect = (answer === current.text);

  button.style.backgroundColor = isCorrect ? "#66aaff" : "#f88";
  button.style.color = "#fff";

  total++;

  // クリックされたボタンだけ残す
  const choicesArea = document.getElementById("choices");
  choicesArea.innerHTML = "";
  choicesArea.appendChild(button);

  if (isCorrect) {
    correct++;
    result.textContent = "⭕ 正解！";

  } else {
    result.textContent = "❌ ちがうよ";
    //document.getElementById("replayBtn").style.display = "inline-block";
  }

  updateScore();
  document.getElementById("replayBtn").disabled = true; // 追加
}

// ===== スコア更新 =====
function updateScore() {
  document.getElementById("score").textContent =
  `${currentLevel}：${correct} / ${total}`;
}

// ===== クイズ終了 =====
function endQuiz() {
  const rate = total === 0 ? 0 : Math.round((correct / total) * 100);

  alert(`お疲れさまでした！\n\n正解数: ${correct} / ${total}\n正答率: ${rate}%`);

  // リセット
  total = 0;
  correct = 0;
  updateScore();

  // 初期画面に戻る
  document.getElementById("quiz-screen").style.display = "none";
  document.getElementById("start-screen").style.display = "block";
}
