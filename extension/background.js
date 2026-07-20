/* global chrome, RP_EXT_STORAGE_KEY, RP_MSG, RP_SOURCE */
importScripts("shared/constants.js");

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function draftToItem(draft) {
  var role = (draft.targetRole || "").trim();
  var company = (draft.companyName || "").trim();
  var name =
    company && role ? company + " · " + role : role || company || "未命名岗位";
  return {
    id: uid(),
    name: name.slice(0, 80),
    updatedAt: new Date().toISOString(),
    targetRole: role,
    industry: (draft.industry || "").trim(),
    companyType: (draft.companyType || "").trim(),
    companyName: company,
    jdText: (draft.jdText || "").trim(),
    note: (draft.pageUrl || draft.note || "").trim(),
  };
}

function urlKey(item) {
  var note = String(item.note || "")
    .replace(/\/$/, "")
    .toLowerCase()
    .trim();
  return note ? "url:" + note : null;
}

function pairKey(item) {
  var company = String(item.companyName || "")
    .toLowerCase()
    .trim();
  var role = String(item.targetRole || "")
    .toLowerCase()
    .trim();
  if (!company && !role) return null;
  return "pair:" + company + "|" + role;
}

function findExistingIndex(list, item) {
  var u = urlKey(item);
  var p = pairKey(item);
  for (var i = 0; i < list.length; i++) {
    if (u && urlKey(list[i]) === u) return i;
    if (p && pairKey(list[i]) === p) return i;
  }
  return -1;
}

async function loadExtRoles() {
  var data = await chrome.storage.local.get(RP_EXT_STORAGE_KEY);
  var list = data[RP_EXT_STORAGE_KEY];
  return Array.isArray(list) ? list : [];
}

async function saveExtRoles(items) {
  var payload = {};
  payload[RP_EXT_STORAGE_KEY] = items;
  await chrome.storage.local.set(payload);
}

async function mergeItem(item) {
  var list = await loadExtRoles();
  var idx = findExistingIndex(list, item);
  if (idx >= 0) {
    item.id = list[idx].id;
    item.note = item.note || list[idx].note || "";
    list[idx] = item;
  } else {
    list.unshift(item);
  }
  await saveExtRoles(list);
  return { item: item, total: list.length, updated: idx >= 0 };
}

async function notifyWebTabs(item) {
  try {
    var tabs = await chrome.tabs.query({
      url: ["http://localhost/*", "http://127.0.0.1/*"],
    });
    var roles = await loadExtRoles();
    for (var i = 0; i < tabs.length; i++) {
      var tab = tabs[i];
      if (!tab.id) continue;
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: RP_MSG.MERGE_ROLES,
          source: RP_SOURCE,
          payload: roles,
          latest: item,
        });
      } catch (_e) {
        /* 非简历专家页或未注入 bridge */
      }
    }
  } catch (_e) {
    /* ignore */
  }
}

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.removeAll(function () {
    chrome.contextMenus.create({
      id: "rp-save-selection",
      title: "保存选中文本到简历专家岗位库",
      contexts: ["selection"],
    });
  });
});

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
  if (info.menuItemId !== "rp-save-selection") return;
  var text = (info.selectionText || "").trim();
  if (!text) return;

  var draft = {
    site: "selection",
    targetRole: "",
    companyName: "",
    industry: "",
    companyType: "",
    jdText: text,
    pageUrl: info.pageUrl || (tab && tab.url) || "",
    confidence: "medium",
    savedAt: Date.now(),
  };

  await chrome.storage.session.set({ rpDraft: draft });

  // 尽量直接打开 popup，方便填写岗位名
  try {
    if (chrome.action && chrome.action.openPopup) {
      await chrome.action.openPopup();
    }
  } catch (_e) {
    /* 部分环境不允许程序化打开 popup */
  }
});

chrome.runtime.onMessage.addListener(function (msg, _sender, sendResponse) {
  if (!msg || !msg.type) return false;

  if (msg.type === RP_MSG.SAVE_DRAFT) {
    var draftPayload = msg.payload || null;
    if (draftPayload && typeof draftPayload === "object" && !draftPayload.savedAt) {
      draftPayload = Object.assign({}, draftPayload, { savedAt: Date.now() });
    }
    chrome.storage.session.set({ rpDraft: draftPayload }).then(function () {
      sendResponse({ ok: true });
    });
    return true;
  }

  if (msg.type === RP_MSG.GET_DRAFT) {
    chrome.storage.session.get("rpDraft").then(function (data) {
      sendResponse({ ok: true, payload: data.rpDraft || null });
    });
    return true;
  }

  if (msg.type === RP_MSG.GET_ROLES || msg.type === "RP_EXT_PULL_FOR_WEB") {
    loadExtRoles().then(function (items) {
      sendResponse({ ok: true, payload: items });
    });
    return true;
  }

  if (msg.type === "RP_EXT_SAVE_ITEM") {
    var raw = msg.payload;
    if (!raw || typeof raw !== "object") {
      sendResponse({ ok: false, error: "无效条目" });
      return true;
    }
    if (!(raw.targetRole || "").trim() || !(raw.jdText || "").trim()) {
      sendResponse({ ok: false, error: "请至少填写岗位名称与 JD" });
      return true;
    }
    var item = draftToItem(raw);
    mergeItem(item)
      .then(function (result) {
        sendResponse({
          ok: true,
          type: RP_MSG.SAVED,
          item: result.item,
          total: result.total,
          updated: result.updated,
        });
        flashBadge(result.updated ? "更" : "✓");
        return notifyWebTabs(result.item);
      })
      .catch(function (err) {
        sendResponse({
          ok: false,
          error: (err && err.message) || "保存失败",
        });
      });
    return true;
  }

  if (msg.type === RP_MSG.SHOW_TOAST) {
    var toastMsg =
      (msg.payload && msg.payload.message) || "已保存到简历专家岗位库";
    notifyActiveTabToast(toastMsg);
    sendResponse({ ok: true });
    return true;
  }

  return false;
});

function flashBadge(text) {
  try {
    chrome.action.setBadgeBackgroundColor({ color: "#1a7f4b" });
    chrome.action.setBadgeText({ text: text || "✓" });
    setTimeout(function () {
      chrome.action.setBadgeText({ text: "" });
    }, 3000);
  } catch (_e) {
    /* ignore */
  }
}

async function notifyActiveTabToast(message) {
  try {
    var tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    var tab = tabs && tabs[0];
    if (!tab || !tab.id) return;
    try {
      await chrome.tabs.sendMessage(tab.id, {
        type: RP_MSG.SHOW_TOAST,
        payload: { message: message, kind: "success" },
      });
    } catch (_e) {
      /* 当前页无 content script 时忽略 */
    }
  } catch (_e) {
    /* ignore */
  }
}
