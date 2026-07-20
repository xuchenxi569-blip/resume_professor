/** LinkedIn Jobs 适配器 */
var LinkedInAdapter = {
  id: "linkedin",
  match: function (url) {
    return /linkedin\.com\/jobs/i.test(url);
  },
  extract: function () {
    var targetRole =
      rpTextOf(
        ".job-details-jobs-unified-top-card__job-title a",
        ".job-details-jobs-unified-top-card__job-title",
        "h1.t-24",
        "h1"
      ) || "";
    targetRole = rpCleanText(targetRole.split(/\n/)[0]);

    var companyCandidates = [
      rpTextOfDirect(
        ".job-details-jobs-unified-top-card__company-name a"
      ),
      rpTextOfDirect(".job-details-jobs-unified-top-card__company-name"),
      rpTextOfDirect("a[data-control-name='jobdetails_topcard_orgname']"),
      rpTextOfDirect(".jobs-unified-top-card__company-name a"),
      rpTextOfDirect(".jobs-unified-top-card__company-name"),
    ];

    var companyName = rpPickCompany(targetRole, companyCandidates);

    var jdEl =
      document.querySelector("#job-details") ||
      document.querySelector(".jobs-description__content") ||
      document.querySelector(".jobs-box__html-content") ||
      document.querySelector("[class*='jobs-description']");

    var jdText = jdEl
      ? (jdEl.innerText || jdEl.textContent || "").trim()
      : "";

    return rpSanitizeExtract({
      site: "linkedin",
      targetRole: targetRole,
      companyName: companyName,
      industry: "",
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
