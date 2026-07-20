/** Boss直聘适配器 */
var BossAdapter = {
  id: "boss",
  match: function (url) {
    return /zhipin\.com/i.test(url);
  },
  extract: function () {
    var targetRole =
      rpTextOf(
        ".job-title .job-name",
        ".job-name",
        ".info-primary .name h1",
        ".job-banner .name h1",
        ".job-banner h1",
        "h1"
      ) || "";
    targetRole = rpCleanText(targetRole.split(/\n/)[0]).replace(
      /\s*[\d]+(?:\.\d+)?\s*[-–—]\s*[\d]+(?:\.\d+)?\s*[Kk万].*$/,
      ""
    );

    var companyCandidates = [];

    // 1) 右侧「公司基本信息」卡片：跳过标题，取公司名链接/加粗名
    companyCandidates = companyCandidates.concat(bossCompanyFromSider());

    // 2) 经典详情选择器
    companyCandidates = companyCandidates.concat([
      rpTextOfDirect(".sider-company .company-name a"),
      rpTextOfDirect(".sider-company .company-name"),
      rpTextOfDirect(".info-company h3 a"),
      rpTextOfDirect(".info-company .name a"),
      rpTextOfDirect(".info-company h3"),
      rpTextOfDirect(".company-info .company-name a"),
      rpTextOfDirect(".company-info .company-name"),
      rpTextOfDirect("a[ka*='job-detail-company']"),
      rpTextOfDirect("a[href*='/gongsi/']"),
      rpTextOfDirect(".detail-company-top .company-name"),
      rpTextOfDirect(".company-card .company-name a"),
      rpTextOfDirect(".company-card .company-name"),
    ]);

    // 3) 沟通区「蚂蚁集团 · 人力」
    companyCandidates.push(bossCompanyFromBossInfo());

    // 4) 公司主页链接
    var companyLinks = document.querySelectorAll(
      "a[href*='gongsi'], a[href*='/company/'], a[ka*='company']"
    );
    for (var i = 0; i < companyLinks.length && i < 12; i++) {
      var t = rpDirectText(companyLinks[i]);
      if (t) companyCandidates.push(t);
    }

    var companyName = rpPickCompany(targetRole, companyCandidates);

    var jdText =
      rpTextOf(
        ".job-detail-section .job-sec-text",
        ".job-sec-text",
        ".job-detail .text",
        ".job-sec .text",
        "[class*='job-sec-text']"
      ) || "";

    if (!jdText || jdText.length < 40) {
      var blocks = document.querySelectorAll(
        ".job-detail-section, .job-sec, .job-detail"
      );
      var parts = [];
      blocks.forEach(function (el) {
        var tx = (el.innerText || "").trim();
        if (tx.length > 40) parts.push(tx);
      });
      jdText = parts.join("\n\n");
    }

    var industry =
      rpTextOf(
        ".sider-company .company-industry",
        ".company-info .company-industry",
        ".info-company .company-type",
        "[class*='company-industry']"
      ) || "";
    if (rpIsUselessCompanyLabel(industry)) industry = "";

    return rpSanitizeExtract({
      site: "boss",
      targetRole: targetRole,
      companyName: companyName,
      industry: industry,
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

/** 从右侧公司信息卡提取真实公司名（避开「公司基本信息」标题） */
function bossCompanyFromSider() {
  var roots = document.querySelectorAll(
    ".sider-company, .company-card, .job-sider .company-info, [class*='company-card'], [class*='sider-company']"
  );
  var out = [];
  for (var r = 0; r < roots.length; r++) {
    var root = roots[r];
    var links = root.querySelectorAll("a");
    for (var i = 0; i < links.length; i++) {
      var lt = rpDirectText(links[i]);
      if (
        lt &&
        !rpIsUselessCompanyLabel(lt) &&
        !rpLooksLikeJobTitle(lt) &&
        !/基本信息/.test(lt)
      ) {
        out.push(lt);
      }
    }
    var names = root.querySelectorAll(
      ".company-name, h3 a, h3, h4, .name a, [class*='company-name']"
    );
    for (var j = 0; j < names.length; j++) {
      var nt = rpDirectText(names[j]);
      if (
        nt &&
        !rpIsUselessCompanyLabel(nt) &&
        !rpLooksLikeJobTitle(nt) &&
        !/基本信息/.test(nt)
      ) {
        out.push(nt);
      }
    }
  }
  return out;
}

/** 从 BOSS/HR 信息提取：如「蚂蚁集团 · 人力」 */
function bossCompanyFromBossInfo() {
  var nodes = document.querySelectorAll(
    ".boss-info, .detail-figure, .job-boss, .boss-name, [class*='boss-info'], [class*='boss-name'], .job-detail .name"
  );
  for (var i = 0; i < nodes.length; i++) {
    var raw = rpCleanText(nodes[i].innerText || nodes[i].textContent || "");
    if (!raw || raw.length > 80) continue;
    var m = raw.match(
      /([^\n·•]{2,30}?)\s*[·•]\s*(人力|HR|招聘|人事|老板|经理|总监)/
    );
    if (m) {
      var c = rpCleanText(m[1]);
      if (c && !rpIsUselessCompanyLabel(c) && !rpLooksLikeJobTitle(c)) return c;
    }
  }
  // 全文再扫一遍沟通区
  var body = document.body ? document.body.innerText || "" : "";
  var m2 = body.match(
    /([^\n]{2,20}?)\s*[·•]\s*(人力|HR|招聘|人事)(?=\s|$)/
  );
  if (m2) {
    var c2 = rpCleanText(m2[1]);
    if (c2 && !rpIsUselessCompanyLabel(c2) && !rpLooksLikeJobTitle(c2)) {
      return c2;
    }
  }
  return "";
}
