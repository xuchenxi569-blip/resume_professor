/** 岗位/公司抽取共用工具（content scripts） */

function rpCleanText(s) {
  return String(s || "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+/g, " ")
    .trim();
}

function rpTextOf() {
  for (var i = 0; i < arguments.length; i++) {
    var el = document.querySelector(arguments[i]);
    if (!el) continue;
    var t = rpCleanText(el.innerText || el.textContent || "");
    if (t) return t;
  }
  return "";
}

/** 取元素自身可见短文本，避免父容器把岗位+公司拼在一起 */
function rpDirectText(el) {
  if (!el) return "";
  var a = el.tagName === "A" ? el : el.querySelector("a");
  if (a) {
    var at = rpCleanText(a.innerText || a.textContent || "");
    if (
      at &&
      at.length <= 60 &&
      !rpIsUselessCompanyLabel(at) &&
      !/基本信息/.test(at)
    ) {
      return at;
    }
  }
  var clone = el.cloneNode(true);
  var remove = clone.querySelectorAll("script,style,svg,img,button");
  for (var i = 0; i < remove.length; i++) remove[i].remove();
  var t = rpCleanText(clone.innerText || clone.textContent || "");
  if (!t) return "";
  var lines = t.split(/[\n|/]+/).map(rpCleanText).filter(Boolean);
  for (var j = 0; j < lines.length; j++) {
    var line = lines[j];
    if (rpIsUselessCompanyLabel(line) || /基本信息/.test(line)) continue;
    if (line.length > 60) continue;
    return line;
  }
  return lines[0] && lines[0].length <= 60 ? lines[0] : "";
}

function rpTextOfDirect() {
  for (var i = 0; i < arguments.length; i++) {
    var el = document.querySelector(arguments[i]);
    var t = rpDirectText(el);
    if (t) return t;
  }
  return "";
}

/** 像岗位名，不像公司名 */
function rpLooksLikeJobTitle(s) {
  s = rpCleanText(s);
  if (!s || s.length > 40) return false;
  if (/(有限公司|股份公司|集团|科技有限|银行|证券|医院|大学|研究所)$/.test(s)) {
    return false;
  }
  if (
    /(经理|工程师|专员|助理|总监|主管|实习生|顾问|设计师|运营|开发|架构师|分析师|科学家|研究员|策划|编辑|客服|销售|产品经理|项目经理|算法|前端|后端|测试|运维|HRBP|招聘专员|岗位|职位)/i.test(
      s
    )
  ) {
    return true;
  }
  return false;
}

/**
 * UI 标签 / 侧栏元信息，不是公司名。
 * 例：侧栏标题「公司基本信息」被截成「公司」；融资「D轮及以上」、规模「10000人以上」。
 */
function rpIsUselessCompanyLabel(s) {
  s = rpCleanText(s);
  if (!s) return true;
  if (s.length <= 2 && /^(公司|企业|单位|雇主|机构)$/.test(s)) return true;
  if (
    /^(公司基本信息|企业信息|公司介绍|公司详情|基本信息|职位描述|岗位职责|任职要求|职位福利|工作地址|查看全部职位|立即沟通|感兴趣|在线简历|沟通)$/.test(
      s
    )
  ) {
    return true;
  }
  if (/基本信息$/.test(s) && s.length <= 12) return true;
  if (/^(查看|更多|全部)/.test(s) && s.length <= 10) return true;
  // 融资 / 规模 / 行业短标签
  if (
    /^([A-D]轮|天使轮|未融资|已上市|不需要融资)/.test(s) ||
    /^\d[\d,]*人/.test(s) ||
    /人(以上|以下|以内)$/.test(s)
  ) {
    return true;
  }
  if (
    s.length <= 8 &&
    /^(互联网|计算机|电子商务|金融|教育|医疗|游戏|广告|咨询|制造业|房地产)$/.test(s)
  ) {
    return true;
  }
  return false;
}

/**
 * Boss/猎聘标题常见：岗位_公司_城市 · BOSS直聘
 * 旧逻辑取分隔符前段 → 把岗位当成公司。这里取更像公司的后段。
 */
function rpGuessCompanyFromTitle(title) {
  if (!title) return "";
  var t = String(title)
    .replace(
      /\s*[-–—|·]\s*(BOSS直聘|Boss直聘|猎聘网|猎聘|LinkedIn|拉勾网|拉勾|智联招聘|前程无忧|无忧).*$/i,
      ""
    )
    .replace(/【[^】]*】/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/（[^）]*）/g, " ")
    .trim();

  var parts = t
    .split(/[_|·]/)
    .map(function (p) {
      return rpCleanText(p.replace(/招聘$/, ""));
    })
    .filter(Boolean);

  var cityRe =
    /^(北京|上海|广州|深圳|杭州|成都|武汉|南京|苏州|西安|长沙|重庆|天津|青岛|大连|厦门|远程|全国)/;

  for (var i = 1; i < parts.length; i++) {
    var p = parts[i];
    if (!p || cityRe.test(p)) continue;
    if (rpLooksLikeJobTitle(p) || rpIsUselessCompanyLabel(p)) continue;
    if (p.length >= 2 && p.length <= 40) return p.slice(0, 40);
  }

  var m = t.match(/^(.{2,40}?)(?:招聘|诚聘)/);
  if (m) {
    var c = rpCleanText(m[1]);
    if (c && !rpLooksLikeJobTitle(c) && !rpIsUselessCompanyLabel(c)) {
      return c.slice(0, 40);
    }
  }
  return "";
}

/**
 * 从多个候选里挑公司名：丢掉空值、UI 标签、与岗位相同、像岗位标题的文本。
 */
function rpPickCompany(role, candidates) {
  role = rpCleanText(role);
  var titleGuess = rpGuessCompanyFromTitle(document.title || "");
  var list = (candidates || []).concat(titleGuess ? [titleGuess] : []);

  for (var i = 0; i < list.length; i++) {
    var c = rpCleanText(list[i]);
    if (!c) continue;
    if (rpIsUselessCompanyLabel(c)) continue;
    if (role && c === role) continue;
    if (
      role &&
      (c.indexOf(role) === 0 || role.indexOf(c) === 0) &&
      c.length <= role.length + 2
    ) {
      continue;
    }
    if (rpLooksLikeJobTitle(c)) continue;
    return c.slice(0, 60);
  }
  return "";
}

/** 抽取结果后处理：公司字段被岗位名 / UI 标签污染时纠正 */
function rpSanitizeExtract(data) {
  data = data || {};
  var role = rpCleanText(data.targetRole);
  var company = rpCleanText(data.companyName);

  if (
    !company ||
    company === role ||
    rpLooksLikeJobTitle(company) ||
    rpIsUselessCompanyLabel(company)
  ) {
    company = rpPickCompany(role, [company]);
  }

  if (role && company && role === company) {
    company = rpGuessCompanyFromTitle(document.title || "") || "";
    if (company === role || rpIsUselessCompanyLabel(company)) company = "";
  }

  data.targetRole = role;
  data.companyName = company;
  data.industry = rpCleanText(data.industry);
  if (rpIsUselessCompanyLabel(data.industry)) data.industry = "";
  data.jdText = String(data.jdText || "")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return data;
}
