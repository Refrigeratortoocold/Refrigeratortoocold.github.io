// ---------------- CONFIG: edit here ----------------
const AI_API_ENDPOINT = 'https://your-vercel-or-netlify-site.example.com/api/ask'; // <-- 部署后替换
const GITHUB_USER = 'refirgeratortoocold';

const CONFIG = {
  avatarFallback: '',
  projects: [
    { title:"Eco Mini Farm (原型)", desc:"温室废热回收 + Arduino自动化的家庭迷你农场", link:"#"},
    { title:"Programming Toolkit", desc:"竞赛题库与本地测试脚本", link:"#"}
  ],
  // 我把你记忆里的关键信息做成了精选奖项（可继续扩展）
  awards: [
    { year: "2025", title: "IMO 马来西亚国家选拔 — 第二轮入围" , detail: "进入 IMO 国家选拔第二轮" },
    { year: "2025", title: "Monash EROHSS（参与）", detail: "参与 Monash 大学工程研究机会" },
    { year: "2025", title: "大学奖学金/offer", detail: "Xiamen / Monash / UCSI / Taylor（学费/录取优惠）" },
    { year: "2024", title: "华罗庚杯 — 团体亚军", detail: "校队在华罗庚杯中取得团体亚军" },
    { year: "2024", title: "编程选拔 — 铜牌", detail: "地区编程选拔获得铜牌" }
  ],
  // 比赛（示例）：显示名称 + 官网（用于卡片上的「官网」按钮）
  competitions: [
    { id:'imo', name:'International Mathematical Olympiad (IMO)', url:'https://www.imo-official.org/'},
    { id:'kangaroo', name:'Math Kangaroo (Kangourou)', url:'https://mathkangaroo.org/mks/'},
    { id:'aksf', name:'Kangourou sans Frontières', url:'https://www.aksf.org/'},
    { id:'erohss', name:'Monash EROHSS', url:'https://research.monash.edu/en/activities/engineering-research-opportunities-for-high-school-students-erohs'},
    { id:'hluogeng', name:'华罗庚杯（示例）', url:'https://www.hkhcm.org/'}
  ]
};
// ---------------- End CONFIG ----------------

// DOM fill
document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('year').textContent = new Date().getFullYear();

  // avatar fallback generator (SVG initials)
  const av = document.getElementById('avatarImg');
  av.onerror = ()=>{ av.src = generateInitialsSVG('SJ'); };
  if(!av.src) av.src = generateInitialsSVG('SJ');

  // fill projects
  const pg = document.getElementById('projectsGrid');
  CONFIG.projects.forEach(p=>{
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `<h3>${p.title}</h3><p>${p.desc}</p><div class="meta"><a class="ghost-btn" href="${p.link}" target="_blank">查看</a></div>`;
    pg.appendChild(card);
  });

  // fill awards timeline
  const tl = document.getElementById('timeline');
  CONFIG.awards.forEach(e=>{
    const el = document.createElement('div'); el.className='event';
    el.innerHTML = `<div class="dot"></div><div class="ev-body"><div class="ev-year">${e.year}</div><div style="font-weight:700;margin-top:4px">${e.title}</div><div style="color:rgba(255,255,255,0.65);margin-top:6px;font-size:13px">${e.detail}</div></div>`;
    tl.appendChild(el);
  });

  // fill gallery (placeholder images)
  const gallery = document.getElementById('galleryGrid');
  for(let i=1;i<=4;i++){
    const g = document.createElement('div'); g.className='gallery-card';
    g.innerHTML = `<div style="text-align:center;padding:18px"><div style="font-weight:800">科幻图 ${i}</div><div style="color:rgba(255,255,255,0.55)">占位图片 / 可替换为 AI 生成图</div></div>`;
    gallery.appendChild(g);
  }

  // build competition cards area inside projects (append)
  CONFIG.competitions.forEach(c=>{
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `<h3>${c.name}</h3><p class="meta">官方链接 / 快速查询</p>
      <div style="display:flex;gap:8px;margin-top:8px">
        <a class="ghost-btn" href="${c.url}" target="_blank">官网</a>
        <button class="ghost-btn" data-comp="${c.id}" onclick="askAboutCompetition('${c.id}')">问 AI</button>
      </div>`;
    pg.appendChild(card);
  });

  // assistant UI wiring
  document.getElementById('openAssistant').addEventListener('click', ()=>{ openAssistant() });
  document.getElementById('closeAssistant').addEventListener('click', ()=>{ closeAssistant() });
  document.getElementById('assistantSend').addEventListener('click', ()=>{ handleSend(); });
  document.getElementById('assistantInput').addEventListener('keydown', (e)=>{ if(e.key === 'Enter') handleSend(); });

  // theme toggle
  document.getElementById('themeToggle').addEventListener('click', ()=> document.documentElement.classList.toggle('light-mode'));
});

// generate initials SVG (data URI)
function generateInitialsSVG(initials='SJ'){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><defs><linearGradient id='g' x1='0' x2='1'><stop offset='0' stop-color='#5eead4'/><stop offset='1' stop-color='#7c5cff'/></linearGradient></defs><rect width='100%' height='100%' rx='30' fill='url(#g)' /><text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle' font-size='220' font-family='Inter,Segoe UI,Arial' fill='#021018' font-weight='800'>${initials}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// ---------------- AI assistant (simple client) ----------------
async function askAI(query, context=''){
  appendMessage('user', query);
  appendMessage('ai', '思考中…'); // placeholder; will replace
  try{
    const res = await fetch(AI_API_ENDPOINT, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ query, context })
    });
    if(!res.ok) throw new Error('AI 服务返回错误');
    const data = await res.json();
    // replace last AI placeholder
    replaceLastAiMessage(data.answer || data.text || '没有结果。');
  }catch(err){
    replaceLastAiMessage('抱歉，AI 服务出错：' + (err.message||'未知错误'));
  }
}

function appendMessage(who, text){
  const box = document.getElementById('assistantMessages');
  // remove any "thinking" placeholder if necessary
  if(who === 'ai'){
    const el = document.createElement('div'); el.className='msg ai'; el.textContent = text;
    box.appendChild(el);
  }else{
    const el = document.createElement('div'); el.className='msg user'; el.textContent = text;
    box.appendChild(el);
  }
  box.scrollTop = box.scrollHeight;
}

function replaceLastAiMessage(text){
  const box = document.getElementById('assistantMessages');
  const nodes = box.querySelectorAll('.msg.ai');
  if(nodes.length){
    nodes[nodes.length - 1].textContent = text;
  }else{
    appendMessage('ai', text);
  }
  box.scrollTop = box.scrollHeight;
}

function openAssistant(){ document.getElementById('assistantModal').hidden = false; }
function closeAssistant(){ document.getElementById('assistantModal').hidden = true; }

function handleSend(){
  const input = document.getElementById('assistantInput');
  const q = input.value.trim();
  if(!q) return;
  input.value = '';
  askAI(q);
}

// when user clicks "问 AI" on a competition card
function askAboutCompetition(compId){
  const comp = CONFIG.competitions.find(c=>c.id===compId);
  if(!comp) return;
  openAssistant();
  document.getElementById('assistantInput').value = `请简单介绍一下 ${comp.name} 的参赛对象、报名流程与官网在哪里查看。`;
  // auto-send
  setTimeout(()=> handleSend(), 220);
}
