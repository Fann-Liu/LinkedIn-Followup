const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const requiredAccountFields = [
  "name",
  "type",
  "region",
  "priority",
  "priorityText",
  "tags",
  "accountUrl",
  "postUrl",
  "evidenceTitle",
  "evidence",
  "why",
  "follow",
  "discoveredAt",
  "updatedAt"
];

function loadWindowFile(relativePath, key) {
  const sandbox = { window: {} };
  const absolutePath = path.join(root, relativePath);
  vm.runInNewContext(fs.readFileSync(absolutePath, "utf8"), sandbox, {
    filename: absolutePath
  });
  return sandbox.window[key];
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

const accounts = loadWindowFile("data/accounts.js", "MEDDEV_ACCOUNTS");
const runs = loadWindowFile("data/runs.js", "MEDDEV_RUNS");

assert(Array.isArray(accounts), "MEDDEV_ACCOUNTS must be an array.");
assert(Array.isArray(runs), "MEDDEV_RUNS must be an array.");

const names = new Set();
accounts.forEach((account, index) => {
  requiredAccountFields.forEach((field) => {
    assert(account[field] !== undefined && account[field] !== "", `Account ${index + 1} is missing ${field}.`);
  });
  assert(!names.has(account.name), `Duplicate account name: ${account.name}`);
  names.add(account.name);
  assert(Array.isArray(account.tags), `${account.name}: tags must be an array.`);
  assert(["high", "medium", "watch"].includes(account.priority), `${account.name}: invalid priority.`);
  assert(isUrl(account.accountUrl), `${account.name}: accountUrl is not a valid URL.`);
  assert(isUrl(account.postUrl), `${account.name}: postUrl is not a valid URL.`);
  assert(!Number.isNaN(Date.parse(account.discoveredAt)), `${account.name}: discoveredAt is not a valid date.`);
  assert(!Number.isNaN(Date.parse(account.updatedAt)), `${account.name}: updatedAt is not a valid date.`);
});

runs.forEach((run, index) => {
  assert(run.date, `Run ${index + 1} is missing date.`);
  assert(run.runAt, `Run ${index + 1} is missing runAt.`);
  assert(!Number.isNaN(Date.parse(run.runAt)), `Run ${index + 1} runAt is not a valid date.`);
  assert(typeof run.added === "number", `Run ${index + 1} added must be a number.`);
  assert(typeof run.updated === "number", `Run ${index + 1} updated must be a number.`);
  assert(run.summary, `Run ${index + 1} is missing summary.`);
});

console.log(`Validated ${accounts.length} accounts and ${runs.length} run records.`);
