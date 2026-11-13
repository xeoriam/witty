# Witty

英语学习工具：逐句打字 + 翻译、点词查义、阅读出题、AI 精读、作文训练与收藏夹。

同一套前端代码有两种形态：

| | 桌面版 | 插件版 |
| --- | --- | --- |
| 形态 | 独立 Windows 程序（Electron 33） | DeepSeek Harness 插件 |
| 前置 | Windows 10/11 | 已安装 DSH，并在「设置 → 模型」接入 DeepSeek |
| API Key | 应用内填写，系统加密存储（DPAPI） | 配在 Harness 的模型设置里 |
| 额外能力 | 设置面板（导出/导入/旧数据迁移/检查更新）、权威词典数据、系统语音发音、浅色/深色主题 | — |

学习功能两边一致。

## 目录结构

```
.
├── package.json / cordis.patch.yml / icon.svg   # 插件清单与 bundle 行
├── index.js            # 宿主侧：路由、存储域、DeepSeek 调用、出题与作文校验
├── client.js           # 客户端 bundle（由 src/ 构建，勿手改）
├── build.mjs           # 插件构建脚本
├── src/                # 前端源码（两种形态共用）
│   ├── entry.js        # 插件入口：注册侧栏与主区域
│   ├── shell.js        # 外壳：Tab、收藏抽屉、背景
│   ├── typing/         # 打字、翻译、取词、导入、出题、精读
│   ├── essay/          # 作文看板、评分、范文、档案
│   ├── favorites/      # 收藏夹
│   └── styles.js / locales.js / shared.js
├── locale/             # 插件标题与描述
├── vendor/             # mammoth（DOCX 解析，BSD-2-Clause）
├── INSTALL.md          # 插件安装说明
├── USAGE.md            # 使用指南
└── desktop/            # 桌面版（Electron 主进程 + 渲染层构建）
    ├── main.cjs / preload.cjs
    ├── host/           # 本地 HTTP 服务、JSON 存储、密钥、旧数据迁移
    ├── build.mjs       # 把 src/ 打成 renderer/app.bundle.js
    ├── renderer/       # index.html、theme.css、boot-guard.js、静态资源
    └── package.json    # electron-builder 配置（NSIS + portable）
```

## 插件版

安装：

```bash
# 在 DSH 的 Plugin Manager 里选择「安装本地插件」指向本目录
# 或让 DSH 助手执行：plugin_manager install_bundle，target 为本目录绝对路径
```

构建（改完 `src/` 后）：

```bash
node build.mjs
```

需要 Node 18+；`mammoth` 已内联进 `client.js`，无需 `npm install`。

详见 [INSTALL.md](./INSTALL.md) 与 [USAGE.md](./USAGE.md)。

## 桌面版

```bash
cd desktop
pnpm install
pnpm build      # 生成 renderer/app.bundle.js
pnpm start      # 开发运行
pnpm dist       # 打包 NSIS 安装包 + portable
```

数据目录：`%APPDATA%\Witty`（可用 `--data-dir` 或 `MY_WRITING_DATA_DIR` 覆盖）。API Key 用 `safeStorage`（Windows 即 DPAPI）加密存放在 `secrets/deepseek.key`。

## 数据与隐私

- 仓库内**不包含**任何 API Key、收藏、作文档案或运行日志；`.gitignore` 已排除 `runtime/`、`data/`、`.cache/` 与证书私钥。
- 收藏与练习记录：`<DSH_HOME>\storages\typing_practice_*`
- 作文档案：插件安装目录下 `essay_archive\`

## 发布

`client.js` 属于构建产物但随仓库提交，方便直接安装。安装包与免安装包体积较大，放在 GitHub Releases 里（单个资源上限 2 GB）。

## 第三方组件

- [mammoth](https://github.com/mwilliamson/mammoth.js) 1.13.0 — BSD-2-Clause，见 `vendor/LICENSE.mammoth`
- Electron / Chromium — 许可见发行包内 `LICENSES.chromium.html`
