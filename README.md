# IJane Studio · 栀远的创作空间

React + Vite + Three.js 个人作品集，包含三维空间、11个作品案例入口和创作档案。

## EdgeOne Pages

导入本仓库，生产分支选 codex/edgeone-migration，根目录 ./，安装 npm ci --no-audit --no-fund，构建 npm run build:edgeone，输出 dist，Node 22.21.1。配置已写入 edgeone.json。当前不需要环境变量或 COS 密钥。

本地验证：npm ci，npm run test:portable，npm run build:edgeone；本地开发：npm run dev。
完整部署及验收步骤见 docs/EDGEONE.md。

主站素材随 Pages 部署。OTHERSPACE 已使用 https://szydym.com/；其他独立作品仍指向现有部署，后续逐个迁移。

## 来源与许可

基于 ITomPoland/portfolio-itom（基线 3e82d28097eba435a47ac46f9988334379a5ac79）二次创作，保留原作者 MIT LICENSE 和站内署名。
媒体来源见 docs/ASSET_SOURCES.md；代码许可不代表所有第三方媒体或品牌素材可再许可。

## 工作台

正式编辑源位于 D:/Workspace/projects/project-037-ITom网站体验分析/src/website。
本仓库为当前源文件的独立发布快照；源工作台历史构建、原始输入和旧素材未包含。
更新时先同步正式编辑源，再从发布副本推送；避免两份源码分别修改。
