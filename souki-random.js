document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector('#custom-random-container');
  if (!container) return;

  // 1. 現在の30分エリアを示すユニークIDを計算
  // 例: 10:00〜10:29はずっと同じID、10:30になると+1される
  const timeWindowId = Math.floor(Date.now() / (30 * 60 * 1000));

  // 2. ブラウザのキャッシュを確認
  const cachedWindowId = localStorage.getItem('atwiki_random_window');
  const cachedHtml = localStorage.getItem('atwiki_random_html');

  // キャッシュのIDが現在の30分エリアと一致していれば、それを表示して即終了（通信なし）
  if (cachedWindowId == timeWindowId && cachedHtml) {
    container.innerHTML = cachedHtml;
    return;
  }

  // --- ここから下は、30分に1回だけ実行される重い処理 ---
  const apiUrl = "/genlip/pages/14.html"; 

  try {
    const resA = await fetch(apiUrl);
    const docA = new DOMParser().parseFromString(await resA.text(), "text/html");
    
    const randomCardAnchor = docA.querySelector('#randomcard');
    if (!randomCardAnchor) {
      container.innerHTML = ""; 
      return;
    }

    const parentDiv = randomCardAnchor.closest('div');
    const randomLinkA = parentDiv.querySelector('a.atwiki_plugin_random');
    
    if (randomLinkA) {
      const pageIdListRaw = JSON.parse(randomLinkA.getAttribute('data-pageid_list'));
      const wikiId = randomLinkA.getAttribute('data-wikiid');
      
      const pageIdList = pageIdListRaw.filter(id => id !== 310 && id !== "310");
      if (pageIdList.length === 0) return;

      // 3. シード値（timeWindowId）から疑似乱数を生成する関数
      const getSeededRandom = (seed) => {
        let t = seed + 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };

      // 4. 全ユーザー共通のランダムインデックスを決定
      const randomIndex = Math.floor(getSeededRandom(timeWindowId) * pageIdList.length);
      const cardpagenum = pageIdList[randomIndex];
      const targetUrl = `/${wikiId}/pages/${cardpagenum}.html`;

      // 5. ターゲットページをfetch
      const resTarget = await fetch(targetUrl);
      const docTarget = new DOMParser().parseFromString(await resTarget.text(), "text/html");
      const blockquoteEl = docTarget.querySelector('blockquote'); 

      if (blockquoteEl) {
        // 6. 画像にターゲットURLへのリンクを注入する
        const imgEl = blockquoteEl.querySelector('img');
        if (imgEl) {
          const parentA = imgEl.closest('a');
          if (parentA) {
            // 既にリンク付き画像だった場合はhrefを書き換え
            parentA.setAttribute('href', targetUrl);
          } else {
            // リンクがない画像の場合はaタグで包む
            const aTag = document.createElement('a');
            aTag.setAttribute('href', targetUrl);
            imgEl.parentNode.insertBefore(aTag, imgEl);
            aTag.appendChild(imgEl);
          }
        }

        // 7. 完成したHTMLをキャッシュに保存して次回以降の通信をカット
        localStorage.setItem('atwiki_random_window', timeWindowId);
        localStorage.setItem('atwiki_random_html', blockquoteEl.outerHTML);

        // コンテナに表示
        container.innerHTML = ""; 
        container.appendChild(blockquoteEl);
      } else {
        container.innerHTML = ""; 
      }
    }
  } catch (e) {
    console.error("ランダム処理でエラーが発生しました:", e);
    container.innerHTML = ""; 
  }
});