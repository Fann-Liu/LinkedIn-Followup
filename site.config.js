window.MEDDEV_CONFIG = {
  title: "欧洲医疗器械 LinkedIn 账号监测",
  timezone: "Asia/Shanghai",
  timezoneLabel: "UTC+8",
  utcOffsetMinutes: 480,
  defaultSort: {
    field: "updatedAt",
    direction: "desc"
  },
  filters: [
    { label: "全部", value: "all" },
    { label: "高优先级", value: "高优先级" },
    { label: "本次新增", value: "本次新增" }
  ],
  dataFiles: {
    accounts: "data/accounts.js",
    runs: "data/runs.js"
  }
};
