# FdyGPAHelper（THU GPA Helper）

提供给清华大学辅导员使用的 GPA 计算工具：上传从信息门户导出的成绩册，在**浏览器本地**计算同学们的必修限选 GPA、全部课程 GPA 以及年级/班级排名，并生成 Excel 结果表下载。无后端，成绩数据不会离开你的电脑。

> 本项目 fork 自 [PowerfooI/THU-GPA-Helper](https://github.com/PowerfooI)，由 xiaoshe 继续维护，方便修改和查看源代码。

## 功能特性

- 计算**必修限选 GPA** 和**全部课程 GPA**（结果保留 6 位小数）
- 给出**年级排名**和**班级排名**（各分"全部课程"与"必修限选"两套）
- 排名按**未四舍五入的精确成绩**计算：
  - GPA 完全相同 → 并列同一名次（如 1、1、3），备注列标注"GPA 完全相同，并列同一名次"
  - GPA 保留 6 位小数后显示值相同但精确值不同 → 名次以精确成绩为准，备注列标注"按未四舍五入的精确成绩排名"
- 支持**多文件同时上传**（.xls / .xlsx），可一次算整个年级
- 支持非整数学分（如 0.8 学分的体疗）

## 使用方法

### 方式一：线上版（推荐，无需任何配置）

直接访问 **[https://xiaoshecode.github.io/fdygpahelper/](https://xiaoshecode.github.io/fdygpahelper/)**

1. 从信息门户导出成绩册（"所有成绩查询"或"近期成绩查询"）
2. 点击页面中的上传区域，可**多选**多个班级的成绩册文件
3. 稍等片刻，浏览器会自动下载 `GPA及排名_时间戳.xlsx`

> 导出的成绩册文件至少需要包含【姓名】【学号】【教学班级】【成绩】【绩点成绩】【学分】【课程属性】七列。

### 方式二：本地版（离线使用 / 自行修改源码）

#### 第 1 步：安装 Node.js

本项目需要 **Node.js 20 或更高版本**。

- **Windows / macOS**：打开 [Node.js 官网](https://nodejs.org/)，下载 LTS（长期支持版）安装包，一路"下一步"安装即可
- **Linux**：可用系统包管理器安装，例如 Ubuntu：`sudo apt install nodejs npm`
  （或使用 [nvm](https://github.com/nvm-sh/nvm) 管理版本：`nvm install --lts`）

安装完成后，打开终端（Windows 上是 PowerShell 或 CMD），输入以下命令验证：

```shell
node -v
```

显示 `v20.x.x` 或更高版本号即为成功。

#### 第 2 步：启用 Yarn（包管理器）

Node.js 自带的 Corepack 可以一键启用 Yarn，在终端执行：

```shell
corepack enable
```

> Windows 上如果提示权限不足，请右键终端图标选择"以管理员身份运行"后再执行。

验证安装：

```shell
yarn -v
```

显示 `1.22.x` 即为成功。

> 如果 `corepack enable` 不可用，也可以直接用 npm 全局安装：`npm install -g yarn`

#### 第 3 步：获取代码

```shell
git clone https://github.com/xiaoshecode/fdygpahelper.git
cd fdygpahelper
```

> 没有安装 Git 的话，也可以在 [仓库页面](https://github.com/xiaoshecode/fdygpahelper) 点击 **Code → Download ZIP** 下载压缩包并解压，然后在终端中进入解压后的目录。

#### 第 4 步：安装依赖

```shell
yarn install
```

首次安装会从 cdn.sheetjs.com 下载 Excel 解析库的官方包，请保持网络畅通。

#### 第 5 步：启动使用

**开发模式**（改代码实时生效）：

```shell
yarn dev
```

终端会显示本地地址（默认 `http://localhost:5173/fdygpahelper/`），用浏览器打开即可，使用方法与线上版完全相同。

**构建静态文件**（用于正式部署）：

```shell
yarn build
```

构建产物在 `dist/` 目录。本地预览构建产物：

```shell
yarn preview
```

#### 第 6 步（可选）：部署到自己的服务器

`dist/` 是纯静态文件，放到任意静态服务器（Nginx、对象存储、内网服务器等）即可使用：

```nginx
# Nginx 配置示例
server {
    listen 80;
    root /var/www/fdygpahelper;   # dist/ 内容解压到这里
    index index.html;
}
```

> 如果部署在子路径下（如 `https://example.com/tools/gpa/`），请先修改 `vite.config.ts` 中的 `base` 为对应路径再构建。

#### 本仓库的自动部署

本仓库推送代码到 `master` 分支后，GitHub Actions 会自动构建并发布到 GitHub Pages（见 `.github/workflows/build.yml`），无需手动操作。

## 输出表格说明

生成的 Excel 包含以下列：

| 列名 | 说明 |
| --- | --- |
| 年级排名(全部) / 年级排名(必限) | 在本次上传的所有同学中的排名 |
| 班级排名(全部) / 班级排名(必限) | 在同一教学班级内的排名 |
| 全部课程GPA / 必修限选GPA | 保留 6 位小数 |
| 全部课程学分 / 必修限选学分 | **仅包含参与 GPA 计算的学分**，记 P/F 的课程不在其中 |
| 已修总学分数 / 已修必限学分数 | 含 P/F 课程，排除记 W、I、*、F 的课程 |
| 备注 | 并列名次或四舍五入并列的说明（无并列则为空） |

## 技术栈

纯 TypeScript + Vite 构建，无任何前端框架；Excel 解析使用 [SheetJS](https://sheetjs.com/) 官方版。

## 更新日志

- 2026.09.24: 0.3.0 精简升级——去除 React / antd，改为纯 TypeScript 实现，页面加载更快；支持上传 .xlsx 文件；排名改用未四舍五入的精确成绩，GPA 完全相同者并列同一名次，仅显示值相同的情况在"备注"列说明；部署仅保留 GitHub Actions
- 2024.09.08: 去除后端 Python 部分，全部计算均在浏览器上完成；矫正"已修"学分的计算；网站迁移到 GitHub Pages
- 2023.09.24: 修复非整数学分课程在计算时被忽略的问题，例如体疗目前为 0.8 学分
- 2023.03.11: GPA 相同时设置为相同名次，新增两列"全部课程学分"和"必修限选学分"，**仅包含参与计算 GPA 的学分，如记 P/F 的课程不在其中**
- 2022.09.30: GPA 计算结果保留小数位从 3 位改为 6 位
- 2022.01.20: 美化用户界面，支持多文件上传
- 2021.01.23: 部署 GPA 计算工具在线版，支持单个文件上传

## 致谢与联系

- 感谢原作者 [powerfooi](https://github.com/PowerfooI) 的贡献与支持
- 联系方式：shejp20@gmail.com
