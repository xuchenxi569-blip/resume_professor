/** 通用兜底：选中文本 / 页面正文 */
var GenericAdapter = {
  id: "generic",
  match: function () {
    return true;
  },
  extract: function (options) {
    options = options || {};
    var selection =
      (window.getSelection && String(window.getSelection())) || "";
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

    var titleEl = document.querySelector("h1");
    var title = titleEl
      ? rpCleanText(titleEl.innerText || "").split(/\n/)[0]
      : "";

    var targetRole = rpCleanText(options.targetRole || title || "");
    var companyName = rpPickCompany(targetRole, [
      options.companyName,
      rpGuessCompanyFromTitle(document.title || ""),
    ]);

    return rpSanitizeExtract({
      site: "generic",
      targetRole: targetRole,
      companyName: companyName,
      industry: "",
      companyType: "",
      jdText: jdText,
      pageUrl: location.href.split("?")[0],
      confidence: selection.length > 80 ? "medium" : "low",
    });
  },
};
