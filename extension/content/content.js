(function () {
  "use strict";

  var ADAPTERS = [BossAdapter, LiepinAdapter, LinkedInAdapter];

  function pickAdapter() {
    var url = location.href;
    for (var i = 0; i < ADAPTERS.length; i++) {
      if (ADAPTERS[i].match(url)) return ADAPTERS[i];
    }
    return GenericAdapter;
  }

  function extractJob() {
    var adapter = pickAdapter();
    var data = adapter.extract();
    if ((!data.jdText || data.jdText.length < 40) && adapter !== GenericAdapter) {
      var fallback = GenericAdapter.extract({
        targetRole: data.targetRole,
        companyName: data.companyName,
      });
      if (fallback.jdText.length > (data.jdText || "").length) {
        data.jdText = fallback.jdText;
        data.confidence = "medium";
      }
    }
    return data;
  }

  function looksLikeJobPage(data) {
    if (!data) return false;
    if (data.targetRole && data.jdText && data.jdText.length > 60) return true;
    if (/job|职位|岗位|招聘/i.test(document.title + location.pathname)) {
      return Boolean(data.jdText && data.jdText.length > 100);
    }
    return false;
  }

  function removeFab() {
    var el = document.getElementById("rp-ext-fab");
    if (el) el.remove();
  }

  function ensureFab() {
    if (document.getElementById("rp-ext-fab")) return;
    var btn = document.createElement("button");
    btn.id = "rp-ext-fab";
    btn.type = "button";
    btn.className = "rp-ext-fab";
    btn.title = "保存到简历专家";
    btn.innerHTML =
      '<span class="rp-ext-fab-icon" aria-hidden="true"></span><span class="rp-ext-fab-label">保存岗位</span>';
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      openSaveFlow();
    });
    document.documentElement.appendChild(btn);
  }

  function openSaveFlow() {
    var data = extractJob();
    chrome.runtime.sendMessage(
      {
        type: RP_MSG.SAVE_DRAFT,
        payload: data,
      },
      function () {
        void chrome.runtime.lastError;
        showToast("已提取岗位，请点击扩展图标确认保存");
      }
    );
  }

  function showToast(msg, kind) {
    var old = document.getElementById("rp-ext-toast");
    if (old) old.remove();
    var el = document.createElement("div");
    el.id = "rp-ext-toast";
    el.className =
      "rp-ext-toast" + (kind === "success" ? " rp-ext-toast-success" : "");
    el.textContent = msg;
    document.documentElement.appendChild(el);
    setTimeout(function () {
      el.classList.add("rp-ext-toast-out");
      setTimeout(function () {
        el.remove();
      }, 280);
    }, 2600);
  }

  chrome.runtime.onMessage.addListener(function (msg, _sender, sendResponse) {
    if (!msg || !msg.type) return false;
    if (msg.type === RP_MSG.EXTRACT) {
      try {
        sendResponse({ ok: true, payload: extractJob() });
      } catch (err) {
        sendResponse({
          ok: false,
          error: (err && err.message) || "提取失败",
        });
      }
      return false;
    }
    if (msg.type === RP_MSG.SHOW_TOAST) {
      var text =
        (msg.payload && msg.payload.message) || "已保存到简历专家岗位库";
      var kind = (msg.payload && msg.payload.kind) || "success";
      showToast(text, kind);
      sendResponse({ ok: true });
      return false;
    }
    return false;
  });

  function boot() {
    var data = extractJob();
    if (looksLikeJobPage(data)) {
      ensureFab();
    } else {
      removeFab();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // SPA 路由变化时再检测
  var lastHref = location.href;
  setInterval(function () {
    if (location.href !== lastHref) {
      lastHref = location.href;
      setTimeout(boot, 800);
    }
  }, 1000);
})();
