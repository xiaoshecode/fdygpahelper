# fdygpahelper 维护说明

在浏览器本地计算清华学生 GPA、年级及班级排名并导出 Excel。

- 上游：https://github.com/powerfooI/gpa-helper
- 在线文档：https://xiaoshecode.github.io/xiaoshecode/repos/fdygpahelper/
- 检查日期：2026-10-30

## 环境与使用

- Node.js 20+；安装 Yarn 1.22.22。
- yarn install --frozen-lockfile

使用/检查入口（需先满足依赖条件）：

- `yarn dev`
- `yarn typecheck`
- `yarn build`
- `node --test tests/calculator.test.mjs`

## 目录职责

- src/main.ts — 页面与上传流程
- src/utils/files.ts — Excel 读取输出
- src/utils/records.ts — 输入规范化及校验
- src/utils/calculator.ts — GPA 与排名
- tests/calculator.test.mjs — 无浏览器回归测试

## 本次整理

- 新增维护文档和在线文档入口，补全用途、目录、使用路径及验证边界。
- 修复 Excel 数字单元格造成班级字符串操作崩溃；拒绝缺列、空身份和非法学分，新增 6 项回归测试。

## 检查记录

- **仓库目录与入口盘点**（passed）：检查 Git 索引中的 16 个路径、README 和项目配置；不等于功能验收。
- **JSON/notebook parse**（passed）：2 个文件通过解析；不导入依赖、不执行应用。
- **XML parse**（passed）：1 个文件通过解析；不导入依赖、不执行应用。
- **完整构建与端到端运行**（not_run）：6 项纯计算/输入回归测试通过（测试需 Node >=22.13）。本机 npm 禁止 remote 包下载，SheetJS CDN 依赖安装失败，未完成 TypeScript 全量构建和浏览器 Excel 端到端验证。
- **Node 纯逻辑回归**（passed）：node --test tests/calculator.test.mjs：6/6 通过。

## 验证边界与待办

- 6 项纯计算/输入回归测试通过（测试需 Node >=22.13）。本机 npm 禁止 remote 包下载，SheetJS CDN 依赖安装失败，未完成 TypeScript 全量构建和浏览器 Excel 端到端验证。

## 后续维护约定

保留上游许可证与作者信息。沿用现有模块边界和格式配置；修复功能时同步最小回归验证。依赖或接口变更需写明迁移步骤，避免仅为目录美观搬动公开入口。
