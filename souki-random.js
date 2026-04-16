document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector('#custom-random-container');
  if (!container) {
    console.error("【デバッグ】表示先コンテナ（#custom-random-container）が現在のページに存在しません。");
    return;
  }

  // リストを取得する対象のページ
  const apiUrl = "/genlip/pages/528.html"; 
  console.log(`【デバッグ1】リスト取得開始: ${apiUrl}`);

  try {
    const resA = await fetch(apiUrl);
    if (!resA.ok) console.error(`【デバッグ】ページのfetchに失敗しました。HTTPステータス: ${resA.status}`);
    
    const docA = new DOMParser().parseFromString(await resA.text(), "text/html");
    
    const randomCardAnchor = docA.querySelector('#randomcard');
    if (!randomCardAnchor) {
      console.warn("【デバッグ2】取得したページ内に id=\"randomcard\" が見つかりませんでした。");
      return;
    }

    const parentDiv = randomCardAnchor.closest('div');
    const randomLinkA = parentDiv.querySelector('a.atwiki_plugin_random');
    
    if (randomLinkA) {
      const pageIdListRaw = JSON.parse(randomLinkA.getAttribute('data-pageid_list'));
      const wikiId = randomLinkA.getAttribute('data-wikiid');
      console.log(`【デバッグ3】取得した配列データ（総数: ${pageIdListRaw.length}）:`, pageIdListRaw);
      
      const pageIdList = pageIdListRaw.filter(id => id !== 310 && id !== "310");
      
      if (pageIdList.length === 0) {
        console.warn("【デバッグ】リストが空です。");
        return;
      }

      // ランダムに選出
      const cardpagenum = pageIdList[Math.floor(Math.random() * pageIdList.length)];
      const targetUrl = `/${wikiId}/pages/${cardpagenum}.html`;
      console.log(`【デバッグ4】抽選完了！ターゲットURL: ${targetUrl}`);

      // ターゲットページを取得
      const resTarget = await fetch(targetUrl);
      const docTarget = new DOMParser().parseFromString(await resTarget.text(), "text/html");
      
      // blockquoteを探す
      const blockquoteEl = docTarget.querySelector('blockquote'); 

      if (blockquoteEl) {
        console.log("【デバッグ5-成功】blockquoteの抽出に成功しました！", blockquoteEl);
        container.innerHTML = ""; 
        container.appendChild(blockquoteEl);
      } else {
        console.warn("【デバッグ5-失敗】ターゲットページに blockquote が存在しません。");
        // 何のタグで構成されているかを調べるため、ページの本文（#wikibody）のHTMLを少しだけ出力する
        const wikibody = docTarget.querySelector('#wikibody');
        if (wikibody) {
          console.log("【参考】ターゲットページの本文HTML（最初の500文字）:", wikibody.innerHTML.substring(0, 500));
        }
        container.innerHTML = `<span style="color:red;">対象のコンテンツが見つかりませんでした。（URL: ${targetUrl}）<br>F12のConsoleを確認してください。</span>`;
      }
    } else {
       console.warn("【デバッグ】ランダムリンクのタグ(a.atwiki_plugin_random)が見つかりません。");
    }
  } catch (e) {
    console.error("【デバッグ】処理中に予期せぬエラーが発生しました:", e);
  }
});