/** 猎聘适配器 */
var LiepinAdapter = {
  id: "liepin",
  match: function (url) {
    return /liepin\.com/i.test(url);
  },
  extract: function () {
    var targetRole =
      textOfLiepin(
        ".job-title",
        ".name-box .name",
        "h1.title",
        "h1",
        "[class*='job-title']"
      ) || "";

    var companyName =
      textOfLiepin(
        ".company-name",
        ".company-info .name a",
        ".company-info .name",
        "[class*='company-name']"
      ) || "";

    var jdText =
      textOfLiepin(
        ".job-intro-container",
        ".job-description",
        ".content-word",
        "[class*='job-description']",
        ".job-apply-container"
      ) || "";

    if (!jdText) {
      var main = document.querySelector("main, .job-detail, #job-view-root");
      if (main) jdText = (main.innerText || "").trim().slice(0, 8000);
    }

    var industry = textOfLiepin(".company-other", "[class*='industry']") || "";

    return {
      site: "liepin",
      targetRole: cleanLiepin(targetRole),
      companyName: cleanLiepin(companyName),
      industry: cleanLiepin(industry).slice(0, 80),
      companyType: "",
      jdText: cleanLiepin(jdText),
      pageUrl: location.href.split("?")[0],
      confidence: targetRole && jdText.length > 80 ? "high" : "medium",
    };
  },
};

function textOfLiepin() {
  for (var i = 0; i < arguments.length; i++) {
    var el = document.querySelector(arguments[i]);
    if (el) {
      var t = (el.innerText || el.textContent || "").trim();
      if (t) return t;
    }
  }
  return "";
}

function cleanLiepin(s) {
  return String(s || "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
