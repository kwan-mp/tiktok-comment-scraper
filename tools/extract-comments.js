// TikTok comment extractor — browser console script.
//
// The backend in this repo (backend/script2.py) sends a request to
// TikTok's private comment API with hardcoded, long-expired signing
// tokens (msToken/X-Bogus/_signature). That approach no longer works:
// TikTok now validates those tokens against a live, non-automated
// browser session, so neither replaying the request with plain HTTP
// libraries nor driving a headless/automated browser (e.g. Playwright)
// gets past it.
//
// This script instead runs inside your own, already-authenticated
// browser tab. It doesn't forge any request itself — it just listens
// for the comment data TikTok's own page code fetches when you open
// the comments panel, and collects it as you scroll.
//
// Usage:
//   1. Open the TikTok video in your normal browser.
//   2. Open DevTools (F12) -> Console tab.
//   3. Paste this whole script and press Enter.
//      (Do this BEFORE opening the comments panel, so the first
//      request isn't missed.)
//   4. Now click to open the comments panel on the page.
//   5. Scroll the comment list yourself, or let the script's
//      best-effort auto-scroll do it.
//   6. Whenever you're satisfied you've seen everything, run:
//         saveComments()
//      This downloads comments.json and copies the same JSON to your
//      clipboard. You can call it again later to get an updated file.
//
// Output per comment: { username, nickname, comment, likes, date, isCreator }

(() => {
  const results = [];
  const seen = new Set();
  let firstRawText = null;

  const pathMatch = location.pathname.match(/^\/@([^/]+)/);
  const authorHandle = pathMatch ? pathMatch[1].toLowerCase() : null;

  const collect = (data) => {
    (data.comments || []).forEach(cm => {
      if (cm.cid && seen.has(cm.cid)) return;
      if (cm.cid) seen.add(cm.cid);
      const text = cm.text || (cm.share_info && cm.share_info.desc) || '';
      const uniqueId = (cm.user && cm.user.unique_id) || '';
      const username = uniqueId ? '@' + uniqueId : '';
      const nickname = (cm.user && cm.user.nickname) || '';
      const likes = cm.digg_count || 0;
      const date = cm.create_time ? new Date(cm.create_time * 1000).toISOString() : '';
      const hasCreatorLabel = cm.label_type === 1 ||
        (Array.isArray(cm.label_list) && cm.label_list.some(l => l.type === 1));
      const isCreator = hasCreatorLabel || (authorHandle && uniqueId.toLowerCase() === authorHandle);
      if (text) results.push({ username, nickname, comment: text, likes, date, isCreator });
      if (!firstRawText && cm.text) firstRawText = cm.text;
    });
  };

  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);
    try {
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      if (url.includes('/api/comment/list/')) {
        response.clone().json().then(collect).catch(() => {});
      }
    } catch (e) {}
    return response;
  };

  const OrigXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function () {
    const xhr = new OrigXHR();
    const open = xhr.open;
    xhr.open = function (method, url, ...rest) {
      this._url = url;
      return open.call(this, method, url, ...rest);
    };
    xhr.addEventListener('load', function () {
      if (this._url && this._url.includes('/api/comment/list/')) {
        try { collect(JSON.parse(this.responseText)); } catch (e) {}
      }
    });
    return xhr;
  };

  function saveComments() {
    console.log('%cบันทึกแล้ว! พบคอมเมนต์ทั้งหมด ' + results.length + ' รายการ', 'color:lime;font-size:14px;font-weight:bold');
    console.log(results);

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'comments.json';
    a.click();

    navigator.clipboard.writeText(JSON.stringify(results, null, 2))
      .then(() => console.log('%cคัดลอกไปคลิปบอร์ดด้วยแล้ว', 'color:cyan'))
      .catch(() => {});
  }
  window.saveComments = saveComments;

  console.log('%cพร้อมดักฟังแล้ว — ไปกดเปิดคอมเมนต์ในหน้าเว็บได้เลย', 'color:orange;font-size:14px;font-weight:bold');
  console.log('%cเมื่อไหร่ก็ได้ที่คิดว่าเลื่อนดูครบแล้ว ให้พิมพ์ saveComments() แล้ว Enter เพื่อบันทึกไฟล์', 'color:orange;font-weight:bold');

  function findScrollableAncestorForText(sampleText) {
    if (!sampleText) return null;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent && node.textContent.includes(sampleText)) {
        let el = node.parentElement;
        while (el) {
          if (el.scrollHeight > el.clientHeight + 50) return el;
          el = el.parentElement;
        }
      }
    }
    return null;
  }

  (async () => {
    let waited = 0;
    while (results.length === 0 && waited < 60000) {
      await new Promise(r => setTimeout(r, 500));
      waited += 500;
    }
    if (results.length === 0) return;

    for (let i = 0; i < 60; i++) {
      const container = findScrollableAncestorForText((firstRawText || '').slice(0, 12));
      if (container) container.scrollTop = container.scrollHeight;
      await new Promise(r => setTimeout(r, 1500));
    }
  })();
})();
