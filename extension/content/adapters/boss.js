/** Boss直聘适配器 */
var BossAdapter = {
  id: "boss",
  match: function (url) {
    return /zhipin\.com/i.test(url);
  },
  extract: function () {
    var targetRole =
      textOf(
        ".job-title .job-name",
        ".job-banner .name",
        ".job-detail .name",
        "h1",
        "[class*='job-name']"
      ) || "";

    var companyName =
      textOf(
        ".company-info .company-name a",
        ".company-info .name",
        ".sider-company .company-name",
        "[class*='company-name'] a",
        "[class*='company-name']"
      ) || "";

    var jdText =
      textOf(
        ".job-detail-section .job-sec-text",
        ".job-detail .text",
        ".job-sec-text",
        "[class*='job-sec-text']",
        ".job-detail-box"
      ) || "";

    if (!jdText) {
      var blocks = document.querySelectorAll(
        ".job-detail-section, .job-sec, [class*='job-detail']"
      );
      var parts = [];
      blocks.forEach(function (el) {
        var t = (el.innerText || "").trim();
        if (t.length > 40) parts.push(t);
      });
      jdText = parts.join("\n\n");
    }

    var industry =
      textOf(".company-info .company-industry", "[class*='company-industry']") ||
      "";

    return {
      site: "boss",
      targetRole: clean(targetRole),
      companyName: clean(companyName),
      industry: clean(industry),
      companyType: "",
      jdText: clean(jdText),
      pageUrl: location.href.split("?")[0],
      confidence: targetRole && jdText.length > 80 ? "high" : "medium",
    };
  },
};

function textOf() {
  for (var i = 0; i < arguments.length; i++) {
    var el = document.querySelector(arguments[i]);
    if (el) {
      var t = (el.innerText || el.textContent || "").trim();
      if (t) return t;
    }
  }
  return "";
}

function clean(s) {
  return String(s || "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
