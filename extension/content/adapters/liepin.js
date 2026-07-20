/** 猎聘适配器 */
var LiepinAdapter = {
  id: "liepin",
  match: function (url) {
    return /liepin\.com/i.test(url);
  },
  extract: function () {
    var targetRole =
      rpTextOf(
        ".job-title",
        ".name-box .name",
        "h1.title",
        ".job-apply-title",
        "h1"
      ) || "";
    targetRole = rpCleanText(targetRole.split(/\n/)[0]);

    var companyCandidates = [
      rpTextOfDirect(".company-name a"),
      rpTextOfDirect(".company-name"),
      rpTextOfDirect(".company-info .name a"),
      rpTextOfDirect(".company-info .name"),
      rpTextOfDirect(".title-box .company-name"),
      rpTextOfDirect("a[href*='/company/']"),
      rpTextOfDirect("a[data-tlg-elm*='company']"),
    ];

    var companyName = rpPickCompany(targetRole, companyCandidates);

    var jdText =
      rpTextOf(
        ".job-intro-container",
        ".job-description",
        ".content-word",
        "[class*='job-description']"
      ) || "";

    if (!jdText || jdText.length < 40) {
      var main = document.querySelector("main, .job-detail, #job-view-root");
      if (main) jdText = (main.innerText || "").trim().slice(0, 8000);
    }

    var industry = rpTextOf(".company-other", "[class*='industry']") || "";

    return rpSanitizeExtract({
      site: "liepin",
      targetRole: targetRole,
      companyName: companyName,
      industry: industry.slice(0, 80),
      companyType: "",
      jdText: jdText,
      pageUrl: location.href.split("?")[0],
      confidence:
        targetRole && companyName && jdText.length > 80
          ? "high"
          : targetRole && jdText.length > 80
            ? "medium"
            : "low",
    });
  },
};
