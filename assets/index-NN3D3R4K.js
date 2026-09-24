(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))c(s);new MutationObserver(s=>{for(const l of s)if(l.type==="childList")for(const n of l.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&c(n)}).observe(document,{childList:!0,subtree:!0});function d(s){const l={};return s.integrity&&(l.integrity=s.integrity),s.referrerPolicy&&(l.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?l.credentials="include":s.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function c(s){if(s.ep)return;s.ep=!0;const l=d(s);fetch(s.href,l)}})();const E="modulepreload",v=function(r){return"/FdyGPAHelper/"+r},m={},k=function(o,d,c){let s=Promise.resolve();if(d&&d.length>0){let n=function(t){return Promise.all(t.map(i=>Promise.resolve(i).then(f=>({status:"fulfilled",value:f}),f=>({status:"rejected",reason:f}))))};document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),e=(a==null?void 0:a.nonce)||(a==null?void 0:a.getAttribute("nonce"));s=n(d.map(t=>{if(t=v(t),t in m)return;m[t]=!0;const i=t.endsWith(".css"),f=i?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${t}"]${f}`))return;const u=document.createElement("link");if(u.rel=i?"stylesheet":E,i||(u.as="script"),u.crossOrigin="",u.href=t,e&&u.setAttribute("nonce",e),document.head.appendChild(u),i)return new Promise((p,x)=>{u.addEventListener("load",p),u.addEventListener("error",()=>x(new Error(`Unable to preload CSS for ${t}`)))})}))}function l(n){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=n,window.dispatchEvent(a),!a.defaultPrevented)throw n}return s.then(n=>{for(const a of n||[])a.status==="rejected"&&l(a.reason);return o().catch(l)})},q="/FdyGPAHelper/assets/logo-BoJYnBxA.svg",R="0.3.0",b=["W","I","*","F"],y=["必修","限选"],w=(r,o)=>Math.abs(r-o)<1e-6;function G(r){return r.replace(/[０-９]/g,o=>String.fromCharCode(o.charCodeAt(0)-65248))}function h(r,o,d){const c=[...r].sort((n,a)=>o(a)-o(n)),s=new Set;let l=0;for(let n=0;n<c.length;n++){const a=n>0&&w(o(c[n]),o(c[n-1]));a||(l=n+1),d(c[n],l),a&&(s.add(c[n-1].id),s.add(c[n].id))}return s}function F(r){const o=new Map;for(const e of r){let t=o.get(e.学号);t||(t={id:e.学号,name:e.姓名,classNo:G(e.教学班级),courses:[],totalCredits:{required:0,all:0},credits:{required:0,all:0},gpa:{required:0,all:0},allRank:0,requiredRank:0,classAllRank:0,classRequiredRank:0},o.set(t.id,t));const i=parseFloat(e.学分),f=e.课程属性;b.includes(e.成绩)||(t.totalCredits.all+=i,y.includes(f)&&(t.totalCredits.required+=i));const u=parseFloat(e.绩点成绩);Number.isNaN(u)||t.courses.push({grade:u,credit:i,courseType:f})}for(const e of o.values()){let t=0,i=0,f=0,u=0;for(const p of e.courses)t+=p.grade*p.credit,i+=p.credit,y.includes(p.courseType)&&(f+=p.grade*p.credit,u+=p.credit);e.gpa.all=i>0?t/i:0,e.gpa.required=u>0?f/u:0,e.credits={required:u,all:i}}const d=[...o.values()],c=h(d,e=>e.gpa.all,(e,t)=>e.allRank=t),s=h(d,e=>e.gpa.required,(e,t)=>e.requiredRank=t),l=new Set,n=new Set,a=new Map;for(const e of d){const t=a.get(e.classNo)??[];t.push(e),a.set(e.classNo,t)}for(const e of a.values())h(e,t=>t.gpa.all,(t,i)=>t.classAllRank=i).forEach(t=>l.add(t)),h(e,t=>t.gpa.required,(t,i)=>t.classRequiredRank=i).forEach(t=>n.add(t));return d.sort((e,t)=>e.allRank-t.allRank).map(e=>{const t=[[c,"年级排名(全部)"],[s,"年级排名(必限)"],[l,"班级排名(全部)"],[n,"班级排名(必限)"]].filter(([i])=>i.has(e.id)).map(([,i])=>i);return{"年级排名(全部)":String(e.allRank),"年级排名(必限)":String(e.requiredRank),"班级排名(全部)":String(e.classAllRank),"班级排名(必限)":String(e.classRequiredRank),学号:e.id,姓名:e.name,班级:e.classNo,全部课程GPA:e.gpa.all.toFixed(6),全部课程学分:e.credits.all.toFixed(1),必修限选GPA:e.gpa.required.toFixed(6),必修限选学分:e.credits.required.toFixed(1),已修总学分数:e.totalCredits.all.toFixed(1),已修必限学分数:e.totalCredits.required.toFixed(1),备注:t.length>0?`存在相同 GPA 并列同一名次：${t.join("、")}`:""}})}function C(){const r=new Date,o=r.getFullYear().toString(),d=(r.getMonth()+1).toString().padStart(2,"0"),c=r.getDate().toString().padStart(2,"0"),s=r.getHours().toString().padStart(2,"0"),l=r.getMinutes().toString().padStart(2,"0"),n=r.getSeconds().toString().padStart(2,"0");return`${o}${d}${c}${s}${l}${n}`}const S="点击上传成绩册（可多选 .xls / .xlsx）",L="计算中，请稍候…";document.querySelector("#root").innerHTML=`
  <main class="container">
    <h1 class="title">
      <img src="${q}" alt="logo" />
      <span>GPAHelper <em>for Fdy</em></span>
      <span class="version">v${R}</span>
    </h1>

    <div class="upload-block" id="upload" role="button" tabindex="0" aria-label="上传成绩册">
      <span class="spinner" hidden></span>
      <span class="text">${S}</span>
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
          <li>GPA 相同的同学<strong>并列同一名次</strong>，并在结果表的“备注”列中标注提醒。</li>
          <li>导出的成绩册文件至少需要包含【姓名】【学号】【教学班级】【成绩】【绩点成绩】【学分】【课程属性】七列。</li>
          <li>源代码地址：<a href="https://github.com/xiaoshecode/FdyGPAHelper" target="_blank" rel="noreferrer">github.com/xiaoshecode/FdyGPAHelper</a></li>
        </ul>
      </section>

      <section class="card">
        <h2>更新日志</h2>
        <ul>
          <li>2026.09.24: 0.3.0 精简升级——去除 React / antd，改为纯 TypeScript 实现，页面加载更快；
            支持上传 .xlsx 文件；GPA 相同者并列同一名次并在“备注”列标注；部署仅保留 GitHub Actions</li>
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
`;const g=document.getElementById("upload"),_=g.querySelector(".spinner"),$=g.querySelector(".text");function P(r){g.classList.toggle("loading",r),_.hidden=!r,$.textContent=r?L:S}async function T(r){P(!0);try{const{readExcelFile:o,generateExcel:d}=await k(async()=>{const{readExcelFile:l,generateExcel:n}=await import("./files-BPtYSMs_.js");return{readExcelFile:l,generateExcel:n}},[]),c=[];for(const l of r)c.push(...await o(l));const s=F(c);d(s,`GPA及排名_${C()}.xlsx`)}catch(o){console.error(o),alert("解析文件失败，请确认上传的是信息门户导出的成绩册。")}finally{P(!1)}}function A(){if(g.classList.contains("loading"))return;const r=document.createElement("input");r.type="file",r.multiple=!0,r.accept=".xls,.xlsx",r.onchange=()=>{const o=Array.from(r.files??[]);o.length>0&&T(o),r.remove()},r.click()}g.addEventListener("click",A);g.addEventListener("keydown",r=>{(r.key==="Enter"||r.key===" ")&&(r.preventDefault(),A())});
