# Witty · 独立桌面版（P0–P4）

这是把 Harness 插件包装成可独立启动的桌面程序：Electron 主进程启动一个本地服务，复用插件原有的接口与校验逻辑，渲染进程直接加载现有 React 界面。已完成本地数据与迁移、系统加密 Key、自带主题与首启向导。

## 运行

```powershell
cd desktop
pnpm install      # 安装 React 与 Electron（Electron 会下载约 110MB 的运行时）
pnpm build        # 从 ../src 生成 renderer/app.bundle.js
pnpm start        # 打开桌面窗口
```

要求：Node.js 20+、Windows 10/11。

如果 Electron 二进制下载失败，可先设置镜像再安装：

```powershell
$env:ELECTRON_MIRROR='https://npmmirror.com/mirrors/electron/'
pnpm install
```

如果安装后出现 `Ignored build scripts: electron`，补跑一次：

```powershell
pnpm rebuild electron
```

> 从本仓库的 DSH 会话里启动时，环境变量 `ELECTRON_RUN_AS_NODE=1` 会让 Electron 退化成普通 Node。
> 启动前先执行 `$env:ELECTRON_RUN_AS_NODE=$null`；普通命令行窗口一般不会有这个变量。

## 数据位置

- 默认：`%APPDATA%\my-writing\data`
  - `storages/typing_practice_favorites/`：收藏夹
  - `storages/typing_practice_essay/`：作文练习记录
  - `storages/typing_practice_essay_archive/`：作文档案与题目历史
  - `essay_archive/`：作文档案文件（JSON + SVG）
- 便携版用 `--data-dir` 把数据放在 `release\data`（`release\data\data\storages` 是收藏与作文记录），日志在 `release\data\logs`；启动脚本已移除，直接双击 `win-unpacked\Witty.exe` 或桌面快捷方式即可。
- 覆盖（任意模式）：设置 `MY_WRITING_DATA_DIR` 指向任意目录。

## 从旧版迁移（P1）

设置面板新增“从旧版导入”：

1. 点 **扫描旧数据**：读取 `%USERPROFILE%\.dsh\storages\typing_practice_*`（若存在）以及程序附近各项目里的 `essay_archive/`。
2. 确认数量后点 **导入旧数据**：以合并方式写入（同 id 跳过/de-dupe），**不会覆盖**现有收藏和档案；导入前自动把当前数据备份到 `backups/<时间戳>/`。
3. 导入完成后界面自动刷新。

扫描逻辑对旧格式是宽容的：存储域文档、单条 JSON、数组或 `{rows}` 包装都能识别；作文档案按 `id + date + topic_prompt + user_essay/ai_feedback` 识别，题目历史按 `topic_prompt` 识别。

## P0–P3 已实现

- Electron 主进程 + 本地 HTTP 服务（127.0.0.1、随机端口、启动令牌）
- `ctx` 兼容层：`webServer` / `storageDomain` / `connection` / `logger` / `effect`
- 复用 `../index.js` 的全部接口：翻译、查词、出题、精读、作文、收藏、导出/导入
- 自己的 JSON 数据层（原子写入），不再依赖 Harness 存储接缝
- 数据导出/导入、旧版数据扫描与合并迁移（含迁移前备份）
- API Key 存入 Windows 系统加密存储（Electron `safeStorage`/DPAPI）：渲染进程拿不到明文，主进程按请求注入；旧的 localStorage Key 首次启动自动迁移
- 设置面板提供“测试连接”，调用 `/user/balance` 显示余额；Key 无效/过期会明确提示
- 自带深色玻璃主题与本地默认壁纸，不再请求 Harness 的 `/dsh-liquid-glass` 静态资源
- 首启向导：欢迎 → 填写 Key → 保存并测试 → 开始使用（可跳过）
- 设置“关于”：版本号、数据目录、打开数据目录
- 启动自检：无 Key 时弹出设置面板与友好提示；保存 Key 后状态徽标自动刷新
- UI 升级阶段 4：按钮/卡片 hover 上浮与阴影加深、按压缩放、收藏/记录/档案列表交错入场、双主题对比度修正、backdrop-filter 收敛到顶层

## 打包（P4）

```powershell
cd desktop
pnpm install
pnpm dist
```

产物在 `Writing.0.00\release\`：

- `witty-1.0.0-setup.exe`（NSIS 安装版，每用户安装，免管理员）
- `witty-1.0.0-portable.exe`（便携版）
- `win-unpacked\Witty.exe`（免安装目录）

说明：

- 当前未做代码签名，Windows 可能提示“未知发布者”；正式分发建议购买代码签名证书。
- 离线环境无法下载 NSIS 时，用 win-unpacked + 启动脚本打成免安装 zip；本次产物为 release\Witty-1.0.0-免安装.zip。
- 自动更新检查使用环境变量 `TP_UPDATE_REPO=owner/repo` 指向 GitHub Releases；未设置时设置面板会提示“未配置更新源”。
- 打包时如遇 Electron/NSIS 缓存目录权限问题，可把 `TEMP`、`ELECTRON_CACHE`、`ELECTRON_BUILDER_CACHE` 指到工作区目录。

## 0.2.1：直接启动 + 数据目录参数 + 快捷方式图标

0.2.0 的桌面快捷方式指向 `启动Witty.cmd`，双击会闪一个控制台窗口；它的图标指向 `win-unpacked\Witty.exe`，但快捷方式是在该 exe 生成之前创建的，资源管理器把“取不到图标”的白纸图标记进了缓存，之后一直不更新。

0.2.1 的改动：

1. 主进程新增 `--data-dir <path>`（也接受 `--data-dir=<path>`），优先级高于环境变量 `MY_WRITING_DATA_DIR`；相对路径按工作目录解析，目录不存在会自动创建，创建失败则退回 Electron 默认的 `%APPDATA%\Witty`。
2. 快捷方式改为直接指向 `win-unpacked\Witty.exe`，数据目录作为参数传入：

   ```text
   Witty.exe --data-dir "<仓库>\release\data"
   ```

   这样既没有 `.cmd` 的黑窗，数据也仍然留在 `release\data`（`release\data\data\storages` 下是收藏与作文记录）。
3. 新增 `desktop/make-shortcut.ps1`：删除同名旧快捷方式后重建，`IconLocation` 指向 exe 自带的 kitten 图标，并刷新一次图标缓存。
4. **设置面板 Key 行**：`显示/隐藏` 按钮原本用 `top:50% + translateY(-50%)` 居中，但 `motion.js` 里 `.tp-shell button { transform: translate3d(0,0,0) }` 优先级更高，把位移覆盖掉，按钮因此压到输入框右下角。改为 `inset-block: 0 + margin: auto 0` 居中，不再依赖 `transform`，同时鼠标悬停的 2px 上浮也不会破坏对齐。
5. **作文看板“开始练习”**：它原先复用页面级主操作按钮的蓝→绿渐变，压在浅色玻璃卡片上像一块深色疙瘩。改为跟随卡片色调的浅色胶囊：底色 `color-mix(brand 12%, card-bg)`、品牌色文字、999px 圆角，悬停才填充品牌色（深色主题下自动用 `--tp-on-brand` 的深色字）。

重建快捷方式：

```powershell
powershell -ExecutionPolicy Bypass -File desktop\make-shortcut.ps1
# 可选：指定其它 exe / 数据目录 / 名称
#   -Exe <path> -DataDir <path> -Name Witty
```

验收结果（2026-11-13，Electron 33.4.11 / Windows 10.0.26320）：

| 项目 | 结果 |
| --- | --- |
| 版本号 | `Witty.exe` 文件/产品版本 0.2.1；`app.asar` 内 `package.json` 也是 0.2.1 |
| `--data-dir` | 启动日志出现 `[app] data dir override`，数据落在 `<dir>\data`，三个存储域全部打开 |
| 桌面快捷方式 | 目标为 `win-unpacked\Witty.exe`，参数 `--data-dir "<release>\data"`，`IconLocation` 为 exe,0 |
| 图标 | 经 `IShellItemImageFactory` 取 48×48，得到 kitten 图标（不再是白纸） |
| 黑窗 | 快捷方式直指 GUI 子系统 exe，没有 `.cmd` 中转，不再闪控制台 |
| 打包产物 | `witty-1.0.0-setup.exe`、`witty-1.0.0-portable.exe`、`Witty-1.0.0-免安装.zip` + `.sha256` |
| 设置 Key 行 | `显示` 按钮与输入框垂直中心偏差 0px，完整落在输入框高度带内，右侧间距 5px |
| 开始练习按钮 | 圆角 999px、无渐变（`background-image: none`）、底色为卡片色 + 12% 品牌色，文字为品牌深蓝 |

`release\启动 Witty.cmd` 已删除：快捷方式直接指向 `win-unpacked\Witty.exe`，参数为 `--no-sandbox --data-dir "<release>\data"`。`--no-sandbox` 必须在命令行上（程序内追加太晚），否则 Chromium 沙箱初始化失败会静默退出。

## 已知限制（后续阶段处理）

- 自动更新需要设置 `TP_UPDATE_REPO` 指向 Releases；未配置时设置面板会提示
- 内嵌朗文/牛津词典未接入（P3 前先走外部浏览器）
- 界面语言固定中文（后续可加切换）

## 结构

```
desktop/
├─ main.cjs              Electron 主进程
├─ build.mjs             从 ../src 生成 renderer/app.bundle.js
├─ smoke.mjs             不启动 Electron 的 Host/接口冒烟测试
├─ host/
│  ├─ context.cjs        ctx 兼容层
│  ├─ server.cjs         本地 HTTP 服务与静态资源
│  └─ storage-domain.cjs JSON 数据层
└─ renderer/
   ├─ index.html
   ├─ theme.css
   ├─ boot-guard.js
   ├─ app.bundle.js      （生成物）
   └─ vendor/            React 18 UMD
```

自测：`node smoke.mjs`。
