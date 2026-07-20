/**
 * 注入到 localhost 简历专家页面：
 * - 拉取 chrome.storage 岗位库 → postMessage 给 React
 * - 接收网页删除 / 全量替换 → 转发给 background
 */
(function () {
  "use strict";

  var pulling = false;

  function postToPage(type, payload, extra) {
    var msg = {
      source: RP_SOURCE,
      type: type,
      payload: payload,
    };
    if (extra) {
      for (var k in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, k)) {
          msg[k] = extra[k];
        }
      }
    }
    window.postMessage(msg, "*");
  }

  function pullAndNotify() {
    if (pulling) return;
    pulling = true;
    chrome.runtime.sendMessage({ type: "RP_EXT_PULL_FOR_WEB" }, function (res) {
      pulling = false;
      if (chrome.runtime.lastError || !res || !res.ok) return;
      postToPage(RP_MSG.MERGE_ROLES, res.payload || [], { mode: "pull" });
    });
  }

  chrome.runtime.onMessage.addListener(function (msg) {
    if (!msg || msg.type !== RP_MSG.MERGE_ROLES) return;
    postToPage(RP_MSG.MERGE_ROLES, msg.payload || [], {
      mode: msg.mode || "pull",
      latest: msg.latest || null,
    });
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
      return;
    }

    if (data.type === RP_MSG.DELETE_ROLE) {
      chrome.runtime.sendMessage(
        { type: RP_MSG.DELETE_ROLE, payload: data.payload },
        function () {
          void chrome.runtime.lastError;
        }
      );
      return;
    }

    if (data.type === RP_MSG.REPLACE_ROLES) {
      chrome.runtime.sendMessage(
        { type: RP_MSG.REPLACE_ROLES, payload: data.payload },
        function () {
          void chrome.runtime.lastError;
        }
      );
    }
  });

  setTimeout(pullAndNotify, 600);
  setTimeout(pullAndNotify, 2000);
})();
