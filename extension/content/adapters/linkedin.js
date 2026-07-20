/** LinkedIn Jobs 适配器 */
var LinkedInAdapter = {
  id: "linkedin",
  match: function (url) {
    return /linkedin\.com\/jobs/i.test(url);
  },
  extract: function () {
    var targetRole =
      textOfLi(
        ".job-details-jobs-unified-top-card__job-title",
        "h1.t-24",
        "h1",
        "[class*='job-title']"
      ) || "";

    var companyName =
      textOfLi(
        ".job-details-jobs-unified-top-card__company-name a",
        ".job-details-jobs-unified-top-card__company-name",
        "[class*='company-name']"
      ) || "";

    var jdEl =
      document.querySelector("#job-details") ||
      document.querySelector(".jobs-description__content") ||
      document.querySelector(".jobs-box__html-content") ||
      document.querySelector("[class*='jobs-description']");

    var jdText = jdEl
      ? (jdEl.innerText || jdEl.textContent || "").trim()
      : "";

    return {
      site: "linkedin",
      targetRole: cleanLi(targetRole),
      companyName: cleanLi(companyName),
      industry: "",
      companyType: "",
      jdText: cleanLi(jdText),
      pageUrl: location.href.split("?")[0],
      confidence: targetRole && jdText.length > 80 ? "high" : "low",
    };
  },
};

function textOfLi() {
  for (var i = 0; i < arguments.length; i++) {
    var el = document.querySelector(arguments[i]);
    if (el) {
      var t = (el.innerText || el.textContent || "").trim();
      if (t) return t;
    }
  }
  return "";
}

function cleanLi(s) {
  return String(s || "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
