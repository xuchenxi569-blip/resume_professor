/** 与 Web 端 src/lib/role-library.ts 对齐 */
var RP_STORAGE_KEY = "resume-professor-role-library";
var RP_EXT_STORAGE_KEY = "resume-professor-role-library-ext";

/** window.postMessage / chrome.runtime 消息类型 */
var RP_MSG = {
  PING: "RP_EXT_PING",
  PONG: "RP_EXT_PONG",
  GET_ROLES: "RP_EXT_GET_ROLES",
  ROLES: "RP_EXT_ROLES",
  MERGE_ROLES: "RP_EXT_MERGE_ROLES",
  MERGED: "RP_EXT_MERGED",
  EXTRACT: "RP_EXT_EXTRACT",
  SAVE_DRAFT: "RP_EXT_SAVE_DRAFT",
  GET_DRAFT: "RP_EXT_GET_DRAFT",
  DRAFT: "RP_EXT_DRAFT",
  SAVED: "RP_EXT_SAVED",
  SHOW_TOAST: "RP_EXT_SHOW_TOAST",
  DELETE_ROLE: "RP_EXT_DELETE_ROLE",
  REPLACE_ROLES: "RP_EXT_REPLACE_ROLES",
};

var RP_SOURCE = "resume-professor-extension";
