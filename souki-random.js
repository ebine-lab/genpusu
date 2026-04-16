document.addEventListener("DOMContentLoaded", async () => {
  // atwiki側に用意した表示用の空箱を取得
  const container = document.querySelector('#custom-random-container');
  if (!container) return;

  const apiUrl = "/genlip/pages/14.html"; 

  try {
    // 【第1段階】リストを持っているページ（14.html）をfetch
    const resA = await fetch(apiUrl);
    const docA = new DOMParser().parseFromString(await resA.text(), "text/html");
    
    // id="randomcard" を持つ要素を探し、その親divの中にあるランダムリンクを取得する
    const randomCardAnchor = docA.querySelector('#randomcard');
    if (!randomCardAnchor) {
      console.warn("ページ14内に #randomcard が見つかりませんでした。");
      container.innerHTML = ""; // エラーを見せないように消去
      return;
    }

    const parentDiv = randomCardAnchor.closest('div');
    const randomLinkA = parentDiv.querySelector('a.atwiki_plugin_random');
    
    if (randomLinkA) {
      // 全ページの配列とwikiIDを取得
      const pageIdListRaw = JSON.parse(randomLinkA.getAttribute('data-pageid_list'));
      const wikiId = randomLinkA.getAttribute('data-wikiid');
      
      // ★ 配列から "310" を除外する
      // （※数値の310と文字列の"310"どちらで入っていても除外できるように設定）
      const pageIdList = pageIdListRaw.filter(id => id !== 310 && id !== "310");

      if (pageIdList.length === 0) {
        container.innerHTML = ""; 
        return;
      }

      // ランダムに1件取り出し（cardpagenum）、ターゲットURLを生成
      const cardpagenum = pageIdList[Math.floor(Math.random() * pageIdList.length)];
      const targetUrl = `/${wikiId}/pages/${cardpagenum}.html`;

      // 【第2段階】選ばれたターゲットページをfetch
      const resTarget = await fetch(targetUrl);
      const docTarget = new DOMParser().parseFromString(await resTarget.text(), "text/html");
      
      // blockquote要素を抽出
      const blockquoteEl = docTarget.querySelector('blockquote'); 

      if (blockquoteEl) {
        // あれば「読み込み中...」を消して貼り付け
        container.innerHTML = ""; 
        container.appendChild(blockquoteEl);
      } else {
        // なければ何もなし（コンテナを空にする）
        container.innerHTML = ""; 
      }
    } else {
       console.warn("対象のランダムリンクプラグインが見つかりません。");
       container.innerHTML = "";
    }
  } catch (e) {
    console.error("ランダムfetch処理でエラーが発生しました:", e);
    container.innerHTML = ""; // エラー時もユーザーには何も見せない
  }
});