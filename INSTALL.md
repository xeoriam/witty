# Witty 插件安装说明（DSH）

本包是一个 **DSH 插件（bundle）**，安装后 DSH 左侧栏会出现 **Witty** 入口。

- 包名：`@local/witty`
- 插件行 id：`witty`
- 客户端 bundle id：`@local/witty`
- 宿主路由前缀：`/plugins/witty`

> 代码基线是原「英语学习助手 / typing-practice」插件 0.2.0，只做了改名与打包，**没有增删学习功能**。
>
> 装好之后怎么用，见同目录的 **[USAGE.md](./USAGE.md)**（功能与操作指南）。

---

## 一、功能范围

安装后可用：

- **打字与阅读**：导入文章（粘贴 / `.txt` / `.docx`）→ 逐句跟打 → 每完成一句自动调用 DeepSeek 翻译 → 点击任意单词查 AI 释义。
- **阅读出题**：基于当前文章生成 5 道考研英语阅读单选题，提交后判分并给解析与原文依据。
- **AI 精读**：细分话题、重点词汇、好句与内嵌短语。
- **作文训练**：四分类看板与推荐、话题与素材、按考研标准评分、逐段批改、高分范文、作文档案、练习统计。
- **收藏夹**：词汇 / 好句、标签筛选、笔记、一键跟打。
- **自定义背景**。

---

## 二、安装前确认

1. **DSH 版本支持 bundle 插件**（本包通过 `package.json` 的 `dsh.bundle.patch` + `cordis.patch.yml` 插入插件行）。
2. **Harness 里已接入 DeepSeek**：本插件走 Harness 已注册的 DeepSeek provider，请先在「设置 → 模型」里配好。
   插件本身**不需要**填 API Key，也不会索取你的 Key。
3. 解压后目录里应当有这些内容（缺一不可）：

```
witty-plugin\
  package.json
  cordis.patch.yml
  index.js          ← 宿主侧（路由、存储、DeepSeek 调用）
  client.js         ← 客户端 bundle（由 src/ 构建而成）
  src\              ← 前端源码
  locale\           ← 插件标题与描述
  icon.svg          ← 插件图标
  vendor\           ← DOCX 解析用的 mammoth（已内嵌，无需联网安装依赖）
```

### 计费与凭据（重要）

- 本插件**不含任何 API Key、Token 或账号凭据**，也不读取环境变量里的 Key；它不会把任何人的 Key 发给别人。
- 所有 AI 请求（翻译、出题、精读、作文）都通过**使用者本机 DSH 的模型接缝** `ctx.llm` 发出，消耗的是**使用者自己在「设置 → 模型」里接入的 DeepSeek 账号余额**。
- 没接入 DeepSeek 时，插件会直接报「当前 Harness 没有已注册的 DeepSeek provider。请先在“设置 → 模型”中接入 DeepSeek。」，一个请求都不会发出。
- 模型选择：优先用该 DSH 当前选中的模型；没有则用 `deepseek-chat`，再退回 `deepseek-flash`。
- 如果使用者用的是第三方 OpenAI 兼容中转，provider id 里需要包含 `deepseek`，否则插件选不中它。

---

## 三、安装

### 方式 A：交给 DSH 助手装（最省事）

1. 把压缩包解压到任意固定目录，例如 `D:\Tools\witty-plugin`。
2. 在 DSH 里对助手说：

   > 用 plugin_manager 安装这个本地插件目录：`D:\Tools\witty-plugin`

3. 助手会调用 `install_bundle` 完成安装；返回 `application: applied` 后，左侧栏出现 **Witty**。

### 方式 B：Plugin Manager 界面

1. 打开 DSH 的 **设置 → 插件（Plugin Manager）**。
2. 选择「安装本地插件 / 从本地目录安装」，选中解压出来的 `witty-plugin` 文件夹。
3. 启用后左侧栏出现 **Witty**。

安装或替换插件包后，如果界面没变化，**重启 DSH**（新的 `client.js` 需要重新加载）。

---

## 四、安装后验证

1. 左侧栏点 **Witty**，能看到标题和「打字与阅读 / 作文训练」两个 Tab。
2. 点右上角「背景」，弹窗能打开。
3. 随便打一句并回车，右侧应出现中文翻译。
4. 若提示「DeepSeek 未就绪」，去「设置 → 模型」检查 DeepSeek provider 是否可用。

---

## 五、数据安全与隐私

**这个包里没有任何个人数据**，可以放心转发：不含作文档案、不含收藏与练习记录、不含 API Key、不含日志。

安装后运行时的数据位置：

| 数据 | 位置 |
| --- | --- |
| 收藏夹 | `<DSH_HOME>\storages\typing_practice_favorites\` |
| 作文练习记录 / 统计 | `<DSH_HOME>\storages\typing_practice_essay\` |
| 作文档案（每篇一个 JSON）与题目历史 | 插件安装目录下 `essay_archive\` |

`<DSH_HOME>` 默认是 `C:\Users\<你>\.dsh`。

关于旧数据：

- 收藏与练习统计沿用了**原来的存储域名**（`typing_practice_favorites` / `typing_practice_essay`），所以从旧插件换过来会**自动继承**。
- **作文档案不会自动迁移**：它存在旧插件目录的 `essay_archive\` 里。要延续的话，退出 DSH 后把旧目录的 `essay_archive` 整个复制到新插件目录即可（不要覆盖新目录里已有的同名文件时先备份）。
- 卸载插件不会删除 `storages`；`essay_archive` 在插件目录内，删目录即删档案，**建议先备份**。

---

## 六、和旧插件共存

本包把侧栏 id 与路由改成了 `witty` / `/plugins/witty`，因此可以和旧插件同时安装（各自一个入口）。

但两者**共用同一批存储域名**，同时启用会互相看到、互相覆盖收藏与练习记录。建议装好 Witty 后到 Plugin Manager 里**停用旧插件**。

---

## 七、常见问题

| 现象 | 处理 |
| --- | --- |
| 左侧栏没有 Witty | 确认 bundle 已启用；重启 DSH 后刷新页面 |
| 报 `Unknown client module` | `client.js` 与 `src/` 不一致，重新构建（见第八节） |
| 翻译 / 出题报错、提示未就绪 | 「设置 → 模型」里的 DeepSeek provider 不可用 |
| 上传 `.docx` 没反应 | 确认 `vendor\mammoth.browser.min.js` 存在（本包已带） |
| 作文档案是空的 | 旧档案在旧插件目录，按第五节手动复制 |

---

## 八、修改后重新构建

```bash
cd witty-plugin
node build.mjs     # 由 src/ 生成 client.js
```

需要 Node 18+。`mammoth` 已经内嵌在 `vendor/`，**不需要** `npm install`。
