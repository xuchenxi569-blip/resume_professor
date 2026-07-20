(function () {
  "use strict";

  var statusEl = document.getElementById("status");
  var form = document.getElementById("form");
  var countEl = document.getElementById("count");
  var successBanner = document.getElementById("successBanner");
  var successTitle = document.getElementById("successTitle");
  var successDesc = document.getElementById("successDesc");
  var fields = {
    targetRole: document.getElementById("targetRole"),
    companyName: document.getElementById("companyName"),
    industry: document.getElementById("industry"),
    companyType: document.getElementById("companyType"),
    jdText: document.getElementById("jdText"),
    note: document.getElementById("note"),
  };

  function setStatus(text, kind) {
    statusEl.hidden = false;
    statusEl.textContent = text;
    statusEl.classList.remove("is-error", "is-success");
    if (kind === "error") statusEl.classList.add("is-error");
    if (kind === "success") statusEl.classList.add("is-success");
  }

  function lastErrorMessage() {
    return (
      (chrome.runtime.lastError && chrome.runtime.lastError.message) || ""
    );
  }

  function openApp() {
    chrome.tabs.create({ url: "http://localhost:3000" });
  }

  function showSuccess(res, data) {
    var title = res.updated ? "已更新岗位" : "保存成功";
    var name =
      (data.companyName && data.targetRole
        ? data.companyName + " · " + data.targetRole
        : data.targetRole) || "岗位";
    form.hidden = true;
    successBanner.hidden = false;
    successTitle.textContent = "✓ " + title;
    successDesc.textContent =
      "「" +
      name +
      "」已写入岗位库（共 " +
      res.total +
      " 条）。打开简历专家即可同步使用。";
    setStatus(title + " · 共 " + res.total + " 条", "success");
    refreshCount();

    chrome.runtime.sendMessage({
      type: RP_MSG.SHOW_TOAST,
      payload: {
        message: title + "：「" + name + "」",
        kind: "success",
      },
    });
  }

  function fill(draft) {
    if (!draft) return;
    successBanner.hidden = true;
    fields.targetRole.value = draft.targetRole || "";
    fields.companyName.value = draft.companyName || "";
    fields.industry.value = draft.industry || "";
    fields.companyType.value = draft.companyType || "";
    fields.jdText.value = draft.jdText || "";
    fields.note.value = draft.pageUrl || draft.note || "";
    form.hidden = false;
    var conf = draft.confidence ? "（置信度：" + draft.confidence + "）" : "";
    var fromSel = draft.site === "selection" ? " · 来自选中文本" : "";
    setStatus("已提取，请确认后保存" + conf + fromSel);
  }

  function readForm() {
    return {
      targetRole: fields.targetRole.value.trim(),
      companyName: fields.companyName.value.trim(),
      industry: fields.industry.value.trim(),
      companyType: fields.companyType.value.trim(),
      jdText: fields.jdText.value.trim(),
      pageUrl: fields.note.value.trim(),
      note: fields.note.value.trim(),
    };
  }

  function refreshCount() {
    chrome.runtime.sendMessage({ type: RP_MSG.GET_ROLES }, function (res) {
      if (chrome.runtime.lastError) return;
      var n = res && res.payload ? res.payload.length : 0;
      countEl.textContent = "库中 " + n + " 条";
    });
  }

  function getDraft() {
    return new Promise(function (resolve) {
      chrome.runtime.sendMessage({ type: RP_MSG.GET_DRAFT }, function (res) {
        if (chrome.runtime.lastError || !res || !res.ok) {
          resolve(null);
          return;
        }
        resolve(res.payload || null);
      });
    });
  }

  function extractTab(tabId) {
    return new Promise(function (resolve) {
      chrome.tabs.sendMessage(tabId, { type: RP_MSG.EXTRACT }, function (res) {
        if (chrome.runtime.lastError || !res || !res.ok) {
          resolve(null);
          return;
        }
        resolve(res.payload || null);
      });
    });
  }

  function pickDraft(pageData, sessionDraft) {
    var sel =
      sessionDraft &&
      sessionDraft.site === "selection" &&
      (sessionDraft.jdText || "").trim().length > 20
        ? sessionDraft
        : null;

    var selFresh =
      sel &&
      typeof sel.savedAt === "number" &&
      Date.now() - sel.savedAt < 2 * 60 * 1000;

    if (selFresh) return sel;

    if (pageData && ((pageData.jdText || "").trim() || pageData.targetRole)) {
      return pageData;
    }
    if (
      sessionDraft &&
      ((sessionDraft.jdText || "").trim() || sessionDraft.targetRole)
    ) {
      return sessionDraft;
    }
    return null;
  }

  function showEmpty(fallbackUrl) {
    successBanner.hidden = true;
    form.hidden = false;
    fields.note.value = fallbackUrl || fields.note.value || "";
    setStatus("未能自动识别，请粘贴 JD 后保存", "error");
  }

  function loadForm(preferReselect) {
    successBanner.hidden = true;
    setStatus("正在从当前页提取…");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var tab = tabs && tabs[0];
      if (!tab || !tab.id) {
        getDraft().then(function (draft) {
          if (draft) fill(draft);
          else showEmpty();
        });
        return;
      }

      Promise.all([
        preferReselect ? Promise.resolve(null) : getDraft(),
        extractTab(tab.id),
      ]).then(function (pair) {
        var sessionDraft = pair[0];
        var pageData = pair[1];

        if (preferReselect) {
          if (pageData) {
            fill(pageData);
            chrome.runtime.sendMessage({
              type: RP_MSG.SAVE_DRAFT,
              payload: pageData,
            });
          } else {
            showEmpty(tab.url);
          }
          return;
        }

        var chosen = pickDraft(pageData, sessionDraft);
        if (chosen) {
          fill(chosen);
          if (chosen.site !== "selection" && pageData) {
            chrome.runtime.sendMessage({
              type: RP_MSG.SAVE_DRAFT,
              payload: pageData,
            });
          }
        } else {
          showEmpty(tab.url);
        }
      });
    });
  }

  document.getElementById("btnExtract").addEventListener("click", function () {
    loadForm(true);
  });

  document.getElementById("btnOpenApp").addEventListener("click", openApp);
  document
    .getElementById("btnOpenAppSuccess")
    .addEventListener("click", openApp);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = readForm();
    if (!data.targetRole || !data.jdText) {
      setStatus("请至少填写岗位名称与 JD", "error");
      return;
    }
    var btn = document.getElementById("btnSave");
    btn.disabled = true;
    btn.textContent = "保存中…";
    chrome.runtime.sendMessage(
      { type: "RP_EXT_SAVE_ITEM", payload: data },
      function (res) {
        btn.disabled = false;
        btn.textContent = "保存到岗位库";
        var err = lastErrorMessage();
        if (err || !res || !res.ok) {
          setStatus((res && res.error) || err || "保存失败", "error");
          return;
        }
        showSuccess(res, data);
      }
    );
  });

  refreshCount();
  loadForm(false);
})();
