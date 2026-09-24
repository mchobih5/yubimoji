// kana.js

// 画像ファイル拡張子
const EXT = "png";
//const EXT = "webp";

// ===============================
// かな → 画像ファイル名対応表
// ===============================
const kanaMap = {
  あ:"a", い:"i", う:"u", え:"e", お:"o",
  か:"ka", き:"ki", く:"ku", け:"ke", こ:"ko",
  さ:"sa", し:"shi", す:"su", せ:"se", そ:"so",
  た:"ta", ち:"chi", つ:"tsu", て:"te", と:"to",
  な:"na", に:"ni", ぬ:"nu", ね:"ne", の:"no",
  は:"ha", ひ:"hi", ふ:"fu", へ:"he", ほ:"ho",
  ま:"ma", み:"mi", む:"mu", め:"me", も:"mo",
  や:"ya", ゆ:"yu", よ:"yo",
  ら:"ra", り:"ri", る:"ru", れ:"re", ろ:"ro",
  わ:"wa", を:"wo", ん:"n"
};

// ===============================
// 濁音
// ===============================
const dakutenMap = {
  が:"か", ぎ:"き", ぐ:"く", げ:"け", ご:"こ",
  ざ:"さ", じ:"し", ず:"す", ぜ:"せ", ぞ:"そ",
  だ:"た", ぢ:"ち", づ:"つ", で:"て", ど:"と",
  ば:"は", び:"ひ", ぶ:"ふ", べ:"へ", ぼ:"ほ"
};

// ===============================
// 半濁音
// ===============================
const handakutenMap = {
  ぱ:"は", ぴ:"ひ", ぷ:"ふ", ぺ:"へ", ぽ:"ほ"
};

// ===============================
// 拗音と「を」
// ===============================
const smallMap = {
  ゃ:"ya",
  ゅ:"yu",
  ょ:"yo",
  っ:"tsu",

  を:"wo",

  ぁ:"a",
  ぃ:"i",
  ぅ:"u",
  ぇ:"e",
  ぉ:"o"
};

// ===============================
// 1文字 → フレーム配列
// ===============================
function getCharFrames(char) {
  // console.log(char, frames);
  // ---------- 濁音 ----------
  if (dakutenMap[char]) {
    const base = kanaMap[dakutenMap[char]];

    return [
      { src: `${base}01.${EXT}` },
      { src: `${base}01.${EXT}`, move: "right" }
    ];
  }

  // ---------- 半濁音 ----------
  if (handakutenMap[char]) {
    const base = kanaMap[handakutenMap[char]];

    return [
      { src: `${base}01.${EXT}` },
      { src: `${base}01.${EXT}`, move: "up" }
    ];
  }

  // ---------- 拗音と「を」 ----------
  if (smallMap[char]) {
    const base = smallMap[char];

    return [
      { src: `${base}01.${EXT}` },
      { src: `${base}01.${EXT}`, move: "pull" }
    ];
  }

  // ---------- 長音３フレーム ----------
  if (char === "ー") {
    return [
      `long01.${EXT}`,
      `long02.${EXT}`,
      `long03.${EXT}`
    ];
  }

  // ---------- 特殊２フレーム ----------
  if (["も"].includes(char)) {
    const base = kanaMap[char];

    return [
      `${base}01.${EXT}`,
      `${base}02.${EXT}`
    ];
  }

  // ---------- 特殊３フレーム ----------
  if (["の","り"].includes(char)) {
    const base = kanaMap[char];

    return [
      `${base}01.${EXT}`,
      `${base}02.${EXT}`,
      `${base}03.${EXT}`
    ];
  }

  // ---------- 特殊４フレーム「ん」 ----------
  if (["ん"].includes(char)) {
    // console.log("ん special");
    const base = kanaMap[char];

    return [
      `${base}01.${EXT}`,
      `${base}02.${EXT}`,
      `${base}03.${EXT}`,
      `${base}04.${EXT}`
    ];
  }

  // ---------- 通常文字 ----------
  const base = kanaMap[char];

  if (base) {
    return [`${base}01.${EXT}`];
  }

  // ---------- 不明文字 ----------
  return [];
}

// ===============================
// 単語 → 全文字フレーム配列
// ===============================
function textToImages(text) {
  return text.split("").map(char => getCharFrames(char));
}