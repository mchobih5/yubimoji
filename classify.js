// classify.js


// ===== 指文字数をカウント =====
// 現在は指文字数＝文字列の文字数
// （拗音・促音・長音も１文字）
// classify.js

function countYubimoji(word) {
  return word.length;
}

function classifyByLength(words) {
  const result = {
    3: [],
    4: [],
    5: [],
    6: []
  };

  words.forEach(word => {
    const len = countYubimoji(word.text);

    if (result[len]) {
      result[len].push(word);
    }
  });

  return result;
}

const wordLists = classifyByLength(allWords);
console.log(wordLists);