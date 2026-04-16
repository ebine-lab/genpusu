
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector('#custom-random-container');
  if (!container) return;

  const apiUrl = "/genlip/pages/14.html"; // ← 対象のURL

  try {
    const resA = await fetch(apiUrl);
    const docA = new DOMParser().parseFromString(await resA.text(), "text/html");
    const randomLinkA = docA.querySelector('a.atwiki_plugin_random');
    
    if (randomLinkA) {
      const pageIdList = JSON.parse(randomLinkA.getAttribute('data-pageid_list'));
      const wikiId = randomLinkA.getAttribute('data-wikiid');
      const randomId = pageIdList[Math.floor(Math.random() * pageIdList.length)];
      const targetUrl = `/${wikiId}/pages/${randomId}.html`;

      const resTarget = await fetch(targetUrl);
      const docTarget = new DOMParser().parseFromString(await resTarget.text(), "text/html");
      const specificDiv = docTarget.querySelector('#special-content'); // ← 抽出したいID

      if (specificDiv) {
        container.innerHTML = ""; 
        container.appendChild(specificDiv);
      } else {
        container.innerHTML = "対象のコンテンツが見つかりませんでした。";
      }
    }
  } catch (e) {
    container.innerHTML = "読み込みエラー";
  }
});