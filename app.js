const accounts = window.MEDDEV_ACCOUNTS || [];
const runs = window.MEDDEV_RUNS || [];
const config = window.MEDDEV_CONFIG || {
  defaultSort: { field: "updatedAt", direction: "desc" },
  timezone: "Asia/Shanghai",
  timezoneLabel: "UTC+8",
  utcOffsetMinutes: 480
};

const cards = document.getElementById("cards");
const totalCount = document.getElementById("totalCount");
const searchInput = document.getElementById("searchInput");
const buttons = [...document.querySelectorAll("button[data-filter]")];
const lastRun = document.getElementById("lastRun");
const regionCount = document.getElementById("regionCount");
const runSummary = document.getElementById("runSummary");
let currentFilter = "all";

function escapeHtml(value) {
  return String(value || "").replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[char]);
}

function uniqueRegionCount(items) {
  const countries = new Set();
  items.forEach((item) => {
    const primary = String(item.region || "").split("/")[0].trim();
    if (primary) countries.add(primary);
  });
  return countries.size;
}

function sortAccounts(items) {
  const field = config.defaultSort?.field || "updatedAt";
  const direction = config.defaultSort?.direction === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    const aTime = Date.parse(a[field] || a.updatedAt || a.discoveredAt || "");
    const bTime = Date.parse(b[field] || b.updatedAt || b.discoveredAt || "");
    const safeATime = Number.isNaN(aTime) ? 0 : aTime;
    const safeBTime = Number.isNaN(bTime) ? 0 : bTime;
    if (safeATime !== safeBTime) return (safeATime - safeBTime) * direction;
    return String(a.name || "").localeCompare(String(b.name || ""));
  });
}

function formatDate(value) {
  if (!value) return "未记录";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const offsetMinutes = Number.isFinite(config.utcOffsetMinutes) ? config.utcOffsetMinutes : 480;
  const shifted = new Date(date.getTime() + offsetMinutes * 60 * 1000);
  const pad = (number) => String(number).padStart(2, "0");
  const year = shifted.getUTCFullYear();
  const month = pad(shifted.getUTCMonth() + 1);
  const day = pad(shifted.getUTCDate());
  const hour = pad(shifted.getUTCHours());
  const minute = pad(shifted.getUTCMinutes());
  return `${year}-${month}-${day} ${hour}:${minute} ${config.timezoneLabel || "UTC+8"}`;
}

function renderSummary() {
  totalCount.textContent = accounts.length;
  regionCount.textContent = uniqueRegionCount(accounts);
  const latest = runs[0];
  if (latest) {
    lastRun.textContent = formatDate(latest.runAt || latest.date);
    runSummary.textContent = latest.summary;
  }
}

function render() {
  const q = searchInput.value.trim().toLowerCase();
  const filtered = sortAccounts(accounts.filter((item) => {
    const haystack = [
      item.name, item.type, item.region, item.priorityText,
      (item.tags || []).join(" "), item.evidence, item.why, item.follow
    ].join(" ").toLowerCase();
    const bySearch = !q || haystack.includes(q);
    const byFilter = currentFilter === "all" || (item.tags || []).includes(currentFilter) || item.priorityText === currentFilter;
    return bySearch && byFilter;
  }));

  if (!filtered.length) {
    cards.innerHTML = '<div class="empty">没有匹配的账号。换个关键词或筛选条件试试。</div>';
    return;
  }

  cards.innerHTML = filtered.map((item) => {
    const tags = (item.tags || []).map((tag) => '<span class="tag">' + escapeHtml(tag) + '</span>').join('');
    return '<article class="card">' +
      '<div class="card-head">' +
        '<div>' +
          '<h2>' + escapeHtml(item.name) + '</h2>' +
          '<div class="meta">' + escapeHtml(item.type) + ' · ' + escapeHtml(item.region) + '</div>' +
        '</div>' +
        '<div class="score ' + escapeHtml(item.priority) + '">' + escapeHtml(item.priorityText) + '</div>' +
      '</div>' +
      '<div class="card-body">' +
        '<div class="tags">' + tags + '</div>' +
        '<div class="date-line">收录：' + escapeHtml(formatDate(item.discoveredAt)) + ' · 更新：' + escapeHtml(formatDate(item.updatedAt)) + '</div>' +
        '<div class="section-title">帖子佐证</div>' +
        '<p><strong>' + escapeHtml(item.evidenceTitle) + '</strong>：' + escapeHtml(item.evidence) + '</p>' +
        '<div class="section-title">为什么值得长期关注</div>' +
        '<p>' + escapeHtml(item.why) + '</p>' +
        '<div class="section-title">建议跟进方式</div>' +
        '<p>' + escapeHtml(item.follow) + '</p>' +
        '<div class="links">' +
          '<a class="link-pill" href="' + escapeHtml(item.accountUrl) + '" target="_blank" rel="noreferrer">LinkedIn 账号</a>' +
          '<a class="link-pill" href="' + escapeHtml(item.postUrl) + '" target="_blank" rel="noreferrer">相关帖子/证据</a>' +
        '</div>' +
      '</div>' +
    '</article>';
  }).join('');
}

searchInput.addEventListener("input", render);
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    buttons.forEach((b) => b.classList.toggle("active", b === button));
    render();
  });
});

renderSummary();
render();
