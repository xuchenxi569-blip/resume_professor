/** 通用兜底：选中文本 / 页面正文 */
var GenericAdapter = {
  id: "generic",
  match: function () {
    return true;
  },
  extract: function (options) {
    options = options || {};
    var selection = (window.getSelection && String(window.getSelection())) || "";
    selection = selection.trim();

    var jdText = selection;
    if (!jdText || jdText.length < 40) {
      var article =
        document.querySelector("article") ||
        document.querySelector("main") ||
        document.querySelector("[role='main']") ||
        document.body;
      jdText = ((article && article.innerText) || "").trim().slice(0, 8000);
    }

    var title =
      document.querySelector("h1") &&
      (document.querySelector("h1").innerText || "").trim();

    return {
      site: "generic",
      targetRole: options.targetRole || title || "",
      companyName: options.companyName || guessCompanyFromTitle(document.title) || "",
      industry: "",
      companyType: "",
      jdText: jdText,
      pageUrl: location.href.split("?")[0],
      confidence: selection.length > 80 ? "medium" : "low",
    };
  },
};

function guessCompanyFromTitle(title) {
  if (!title) return "";
  var m = title.match(/^(.+?)[-_|·]/]//);
  return m ? m[1].trim().slice(0, 40) : "";
}
