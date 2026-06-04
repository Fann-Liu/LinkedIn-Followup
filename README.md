# Nordic Ophthalmic MedTech LinkedIn Monitor

一个本地静态看板，用来沉淀北欧眼科医疗技术公司及其 CEO/Founder 的 LinkedIn 账号，并用公开帖子或公开 Updates 做佐证。

默认搜索范围从最小细分开始：

- 地域：北欧，优先 Finland、Sweden、Denmark、Norway、Iceland
- 行业：眼科医疗技术
- 包含：眼科设备、眼底影像、眼底相机、OCT、眼科筛查硬件、和具体眼科设备绑定的 AI
- 排除：泛医疗器械、非眼科设备、纯 SaaS、药物、生物技术、体外诊断/检测类公司

## 文件结构

```text
linkedin-meddev-monitor/
  index.html              页面入口
  assets/
    app.js                页面交互、排序、筛选
    styles.css            页面样式
  config/
    site.config.js        默认排序、筛选项、时区和数据文件配置
  data/
    accounts.js           账号池数据
    runs.js               每次运行记录
  scripts/
    validate-data.js      数据格式校验
```

## 使用方式

直接打开 `index.html` 即可查看。页面默认按 `updatedAt` 倒序排列，最新更新的账号在最上面。页面时间固定按 UTC+8 显示，不跟随浏览器所在时区漂移。

也可以放到 GitHub Pages。这个项目没有构建步骤，上传整个文件夹即可。

## 数据维护规则

自动化每天只更新：

- `data/accounts.js`
- `data/runs.js`

不要把账号数据重新嵌入 `index.html`。
时间必须在运行时生成，不要手工猜测或硬编码测试时间。

新增账号字段必须包含：

- `name`
- `type`
- `region`
- `priority`
- `priorityText`
- `tags`
- `accountUrl`
- `postUrl`
- `leaderName`
- `leaderRole`
- `leaderLinkedInUrl`
- `evidenceTitle`
- `evidence`
- `why`
- `follow`
- `discoveredAt`
- `updatedAt`

每次运行前先移除旧的 `本次新增` 标签，再只给本轮新增账号加上 `本次新增`。

每条线索必须同时包含：

- 公司 LinkedIn 链接
- CEO 或 Founder 的 LinkedIn 链接
- 相关公开帖子/动态/Updates 证据

如果找不到 CEO/Founder LinkedIn，不要收录该条线索。

时间字段请使用带时区的 ISO 字符串，例如：

```text
2026-06-03T10:15:00+08:00
```

运行记录必须包含 `runAt`，例如：

```json
{
  "date": "2026-06-03",
  "runAt": "2026-06-03T17:46:20+08:00",
  "type": "daily",
  "added": 5,
  "updated": 0,
  "summary": "新增 5 个账号。"
}
```

## 校验

```bash
npm run validate
```

校验会检查账号字段、时间字段、重复账号、链接格式和运行记录格式。
