import './style.css'
import logo from './static/logo.svg'
import { version } from '../package.json'

import { calculateGpaAndRank } from './utils/calculator'
import { getCurrentDateTime } from './utils/time'
import type { IGradeRecord } from './utils/types'

const DEFAULT_TEXT = '点击上传成绩册（可多选 .xls / .xlsx）'
const LOADING_TEXT = '计算中，请稍候…'

document.querySelector<HTMLDivElement>('#root')!.innerHTML = `
  <main class="container">
    <h1 class="title">
      <img src="${logo}" alt="logo" />
      <span>GPAHelper <em>for Fdy</em></span>
      <span class="version">v${version}</span>
    </h1>

    <div class="upload-block" id="upload" role="button" tabindex="0" aria-label="上传成绩册">
      <span class="spinner" hidden></span>
      <span class="text">${DEFAULT_TEXT}</span>
    </div>

    <div class="demonstration">
      <section class="card">
        <h2>使用帮助</h2>
        <p class="notice">
          本工具提供给清华大学辅导员计算同学成绩使用，基于浏览器本地计算，
          <strong>不会保存上传的同学成绩</strong>，请放心使用！
        </p>
      </section>

      <section class="card">
        <h2>功能介绍</h2>
        <ul>
          <li>上传从信息门户导出的同学成绩（“所有成绩查询”或“近期成绩查询”，支持 .xls / .xlsx），
            工具会计算同学们的<strong>必修限选 GPA 和全部课程 GPA</strong>（保留 6 位小数），
            并给出相应的年级排名和班级排名，生成表格下载到本地。</li>
          <li><strong>年级排名</strong>指该同学在同时上传的若干文件所包含的同学中处在多少名。
            如需计算多个班级的排名，请从“所有成绩查询”中导出这些班级的成绩册一起上传，
            或是从“近期成绩查询”中导出整个年级的成绩册。</li>
          <li>排名按<strong>未四舍五入的精确成绩</strong>计算：GPA 完全相同者并列同一名次；
            若 GPA 保留 6 位小数后显示值相同但精确值不同，名次以精确成绩为准，并会在结果表的“备注”列中说明。</li>
          <li>导出的成绩册文件至少需要包含【姓名】【学号】【教学班级】【成绩】【绩点成绩】【学分】【课程属性】七列。</li>
          <li>源代码地址：<a href="https://github.com/xiaoshecode/fdygpahelper" target="_blank" rel="noreferrer">github.com/xiaoshecode/fdygpahelper</a></li>
        </ul>
      </section>

      <section class="card">
        <h2>更新日志</h2>
        <ul>
          <li>2026.09.24: 0.3.0 精简升级——去除 React / antd，改为纯 TypeScript 实现，页面加载更快；
            支持上传 .xlsx 文件；排名改用未四舍五入的精确成绩，GPA 完全相同者并列同一名次，
            仅显示值相同的情况在“备注”列说明；部署仅保留 GitHub Actions</li>
          <li>2025.09.16: <a href="https://github.com/xiaoshecode" target="_blank" rel="noreferrer">xiaoshe</a>
            copy from <a href="https://github.com/PowerfooI" target="_blank" rel="noreferrer">powerfooi</a>，继续维护</li>
          <li>2024.09.08: 去除后端 Python 部分，全部计算均在浏览器上完成；矫正“已修”学分的计算；网站迁移到 GitHub Pages</li>
          <li>2023.09.24: 修复非整数学分课程在计算时被忽略的问题，例如体疗目前为 0.8 学分</li>
          <li>2023.03.11: GPA 相同时设置为相同名次，新增两列“全部课程学分”和“必修限选学分”，
            <strong>仅包含参与计算 GPA 的学分，如记 P/F 的课程不在其中</strong></li>
          <li>2022.09.30: GPA 计算结果保留小数位从 3 位改为 6 位</li>
          <li>2022.01.20: 美化用户界面，支持多文件上传</li>
          <li>2021.01.23: 部署 GPA 计算工具在线版，支持单个文件上传</li>
        </ul>
      </section>

      <section class="card">
        <h2>联系方式</h2>
        <ul>
          <li>邮箱：<code>shejp20@gmail.com</code></li>
          <li>感谢原作者 <a href="https://github.com/PowerfooI" target="_blank" rel="noreferrer">powerfooi</a> 的贡献与支持</li>
        </ul>
      </section>
    </div>
  </main>
`

const upload = document.getElementById('upload')!
const spinner = upload.querySelector<HTMLElement>('.spinner')!
const text = upload.querySelector<HTMLElement>('.text')!

function setLoading(loading: boolean) {
  upload.classList.toggle('loading', loading)
  spinner.hidden = !loading
  text.textContent = loading ? LOADING_TEXT : DEFAULT_TEXT
}

async function handleFiles(files: File[]) {
  setLoading(true)
  try {
    // xlsx 库体积较大，用户上传时才按需加载
    const { readExcelFile, generateExcel } = await import('./utils/files')
    const records: IGradeRecord[] = []
    for (const file of files) {
      records.push(...(await readExcelFile(file)))
    }
    const ranked = calculateGpaAndRank(records)
    generateExcel(ranked, `GPA及排名_${getCurrentDateTime()}.xlsx`)
  } catch (err) {
    console.error(err)
    alert('解析文件失败，请确认上传的是信息门户导出的成绩册。')
  } finally {
    setLoading(false)
  }
}

function openFilePicker() {
  if (upload.classList.contains('loading')) return
  const input = document.createElement('input')
  input.type = 'file'
  input.multiple = true
  input.accept = '.xls,.xlsx'
  input.onchange = () => {
    const files = Array.from(input.files ?? [])
    if (files.length > 0) handleFiles(files)
    input.remove()
  }
  input.click()
}

upload.addEventListener('click', openFilePicker)
upload.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    openFilePicker()
  }
})
