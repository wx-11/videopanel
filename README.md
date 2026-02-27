# Sora2 Manager
<img width="1902" height="1191" alt="image" src="https://github.com/user-attachments/assets/1e6f1f8f-5875-4c73-9bb0-ebd248406d56" />

一款面向生产环境的专业级 Sora 视频生成桌面管理工作站，搭配 https://github.com/TheSmallHanCat/sora2api 使用。基于 Electron + React + Tailwind CSS 构建，旨在通过自动化流水线解决 AI 视频创作中的重复劳动问题。

# 🌟 核心特性

多模态生成：支持 文生视频 (Text-to-Video) 与 图生视频 (Image-to-Video)。

自动化批量生产：

台词模式 (Script Mode)：一次性输入多行文案，配合提示词占位符“这是台词文案”，实现“一键百片”。

重复模式 (Repeat Mode)：针对同一提示词进行多次“抽卡式”生成，筛选最佳视觉效果。

工业级任务调度：

并发控制：支持自定义同时生成的任务数量，初始默认为 3。

精细化频率控制：提交间隔最低可设为 0.1s，有效规避 API 频控限制。

原生系统集成：

自动静默下载：视频生成后自动保存至系统 Downloads 文件夹，无需手动干预。

智能 UI 交互：具备防遮挡检测的增强型悬浮窗、流式日志追踪、视频鼠标悬停预览等功能。

开发者友好：

CURL 实时预览：配置参数时同步生成 curl 命令，方便在终端进行接口调试。

SSE 流解析：完美支持 Server-Sent Events，实时追踪 初始化 -> 上传 -> 生成(%) -> 后处理 全过程。

# 🛠️ 技术栈

前端: React 18, Tailwind CSS v4
后端: Electron
构建工具: Vite 6, Electron-Builder
通信: IPC, Fetch API

# 🚀 快速开始


确保你的系统中已安装 Node.js (建议 v18+)。


## 克隆仓库
```git clone [https://github.com/your-username/sora2-manager.git](https://github.com/your-username/sora2-manager.git)```

```cd sora2-manager```

## 安装项目依赖
```npm install```


## 启动开发服务器并开启 Electron 窗口
```npm run electron:dev```


## 构建并生成安装程序 (Windows 默认生成 nsis)
```npm run electron:build```


# ⚙️ 配置说明

在软件右上角的 设置 (Settings) 面板中，你可以配置：

API Endpoint: 你的Sora2API地址（如 http://localhost:8000/v1/chat/completions）。
API Key: 你的访问凭证。
并发控制: 同时发射的请求数。
提交间隔: 两次请求之间的冷却时间（非代理池建议设为6s+，若采用代理池可适当减少）。
注意！需要在sora2api中启用缓存和开启无水印模式。

## 可选：网关鉴权（内部统一密码）

如果你使用 OpenResty 反代并对 `/v1/*` 开启 Basic Auth，可以在前端启用“鉴权登录”（默认不开启，方便本地使用）：

1. 复制 `.env.example` 为 `.env`
2. 设置：`VITE_AUTH_ENABLED=true`、`VITE_AUTH_USERNAME=internal`
3. 重新构建并部署前端

注意：不要把 sora2api 的 API Key 写在前端 `.env` 里（会被打包进浏览器可见的 JS）。推荐由 OpenResty 反代注入 Bearer Key。

## Docker 部署（推荐配合 OpenResty 反代）

该项目是纯前端静态站，Docker 负责把前端构建成 `dist/` 并用 Nginx 提供静态服务。

1) 构建镜像（是否开启“访问鉴权登录”由构建参数决定）

```bash
docker build \
  --build-arg VITE_AUTH_ENABLED=true \
  --build-arg VITE_AUTH_USERNAME=internal \
  -t sora2-manager:latest .
```

2) 运行容器

```bash
docker run -d --name sora2-manager -p 8080:80 sora2-manager:latest
```

3) （可选）用 docker compose

```bash
PORT=8080 VITE_AUTH_ENABLED=true VITE_AUTH_USERNAME=internal docker compose up -d --build
```

4) OpenResty 反代建议

- 建议把 `/` 反代到前端容器（例如 `http://127.0.0.1:8080`）
- 把 `/v1/` 反代到 sora2api（另一台服务器），并只对 `/v1/*` 开启 Basic Auth；认证通过后再把 `Authorization` 覆盖为 Bearer key 转发给上游
- 流式要关缓冲：`proxy_buffering off;`，并调大超时与 `client_max_body_size`

注意：`VITE_AUTH_ENABLED` 属于 Vite 构建时变量，修改后需要重新 build 镜像/重新 build 前端。

# ⚖️ 免责声明

本程序仅作为一个 API 客户端工具。生成的视频内容版权及其合规性由 API 提供方及使用者本人负责。请在遵守当地法律法规的前提下使用。

如果这个项目对你有帮助，欢迎点一个 Star ⭐️
