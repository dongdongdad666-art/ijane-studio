# IJane 的 EdgeOne Pages 部署

GitHub 仓库：https://github.com/dongdongdad666-art/ijane-studio

## 控制台导入

| 配置 | 值 |
| --- | --- |
| 生产分支 | codex/edgeone-migration |
| 框架 | Vite |
| 根目录 | ./ |
| 安装命令 | npm ci --no-audit --no-fund |
| 构建命令 | npm run build:edgeone |
| 输出目录 | dist |
| Node.js | 22.21.1 |
| 环境变量 | 当前不需要 |

edgeone.json 已声明上述配置和静态文件优先的 SPA fallback。必须验证 /gallery、/studio、/about、/contact 刷新能够进入网页，静态文件仍返回正确文件内容。

主站图片、字体、音频及三维空间素材来自 public-ijane，随 Pages 部署，不使用 COS 密钥，也无需设置 ASSET_BASE_URL。
OTHERSPACE 的体验链接已改为 https://szydym.com/；其余十个独立作品仍指向各自现有 Vercel 地址，主站部署不会迁移那些网站。

## 本地构建和验证

```sh
npm ci --no-audit --no-fund
npm run test:portable
npm run build:edgeone
```

dist 是云端/发布副本构建输出。原工作台 npm run build 保留历史版本输出路径，独立仓库请使用 build:edgeone。
creation-archive.test.mjs 依赖工作台原始输入清单，不包含在发布副本的可移植测试中；原工作台仍保留该验收。

## 上线检查

先使用 Pages 默认域名检查开场、入口、四个房间、创作档案、作品外链和声音。默认域名的访问方式以控制台当前提示为准。
建议后续绑定 www.szydym.com；现有 szydym.com 的宇宙旅程不在本次修改范围。
GitHub 推送不代表 Pages 已完成导入、构建或域名绑定。

## 来源

基于 https://github.com/ITomPoland/portfolio-itom 的代码适配，保留 LICENSE 和页面署名。素材来源及权利边界见 ASSET_SOURCES.md；代码许可不代表全部媒体都可另行分发或再许可。
