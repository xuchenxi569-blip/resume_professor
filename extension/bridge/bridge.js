/**
 * 注入到 localhost 简历专家页面：
 * 把 chrome.storage 中的岗位库通过 postMessage 推给 React 合并
 */
(function () {
  "use strict";

  var pulling = false;

  function postToPage(type, payload) {
    window.postMessage(
      {
        source: RP_SOURCE,
        type: type,
        payload: payload,
      },
      "*"
    );
  }

  function pullAndNotify() {
    if (pulling) return;
    pulling = true;
    chrome.runtime.sendMessage({ type: "RP_EXT_PULL_FOR_WEB" }, function (res) {
      pulling = false;
      if (chrome.runtime.lastError || !res || !res.ok) return;
      postToPage(RP_MSG.MERGE_ROLES, res.payload || []);
    });
  }

  chrome.runtime.onMessage.addListener(function (msg) {
    if (!msg || msg.type !== RP_MSG.MERGE_ROLES) return;
    postToPage(RP_MSG.MERGE_ROLES, msg.payload || []);
  });

  window.addEventListener("message", function (event) {
    if (event.source !== window) return;
    var data = event.data;
    if (!data || data.source !== "resume-professor-web") return;

    if (data.type === RP_MSG.PING || data.type === RP_MSG.GET_ROLES) {
      if (data.type === RP_MSG.PING) {
        postToPage(RP_MSG.PONG, { version: "0.1.0" });
      }
      pullAndNotify();
    }
  });

  setTimeout(pullAndNotify, 600);
  setTimeout(pullAndNotify, 2000);
})();
