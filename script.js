/* ================= CONFIG ================ */
/* DEMO MODE: direct front-end call to DeepSeek (insecure for production).
   Recommended: deploy serverless proxy and toggle USE_PROXY to true. */
const USE_PROXY = false; // set true AFTER you deploy serverless proxy
const PROXY_URL = "https://your-vercel-site.vercel.app/api/ask"; // replace after deploying proxy

/* === DeepSeek key (DEMO) ===
   You provided: sk-f9818181c0bb44d58704bb285450bbe4
   Keep for quick demo only. Do NOT commit to public repo for production.
*/
const DEEPSEEK_KEY = "sk-f9818181c0bb44d58704bb285450bbe4";

/* Basic site data (editable) */
const CONFIG = {
  name: "苏佳盛 (JiaSheng)",
  school: "巴生兴华中学",
  projects: [
    {title: "Eco Mini Farm (原型)", desc: "温室废热回收 + Arduino 自动化的家庭种植原型。", link:"#"},
    {title: "Programming Toolkit", desc: "竞赛题库与本地测试工具集合。", link:"#"}
  ],
  timeline: [
    {year: "2020", text: "开始参加数学与科学竞赛，对问题求解产生浓厚兴趣。"},
    {year: "2022", text: "在区域/国家赛中取得多项名次，逐步投入算法与物联网项目。"},
    {year: "2024", text: "参与 Monash EROHSS 工程研究计划，扩展研究经验。"},
    {year: "2025", text: "IMO 国家选拔第二轮入围；获得多项大学奖学金邀请。"}
  ],
  competitions: [
    {id:"imo", name:"International Mathematical Olympiad (IMO)", site:"https://www.imo-official.org/"},
    {id:"kangaroo", name:"Math Kangaroo", site:"https://mathkangaroo.org/"},
    {id:"monash", name:"Monash EROHSS", site:"https://research.monash.edu/"}
  ]
};

/* ============= DOM & UI ================ */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  populateTimeline();
  populateCompetitions();
  populateGallery();
  wireAssistantUI();
  animateBackground();
});

/* timeline */
function populateTimeline(){
  const tl = document.getElementById("timeline");
  CONFIG.timeline.forEach(item=>{
    const el = document.createElement("div");
    el.className = "timeline-item";
    el.innerHTML = `<div class="year">${item.year}</div><div class="body">${item.text}</div>`;
    tl.appendChild(el);
  });
}

/* competitions */
function populateCompetitions(){
  const grid = document.getElementById("compGrid");
  CONFIG.competitions.forEach(c=>{
    const card = document.createElement("div");
    card.className = "comp-card";
    card.innerHTML = `
      <div style="font-weight:800">${c.name}</div>
      <div class="meta">官方站：<a href="${c.site}" target="_blank" rel="noopener">${c.site}</a></div>
      <div style="margin-top:10px" class="comp-actions">
        <a class="btn ghost" href="${c.site}" target="_blank" rel="noopener">官网</a>
        <button class="btn ghost" onclick="askCompetition('${c.id}')">问 AI</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* gallery placeholders */
function populateGallery(){
  const g = document.getElementById("galleryGrid");
  for(let i=1;i<=4;i++){
    const it = document.createElement("div");
    it.className = "gallery-item";
    it.innerHTML = `<div><strong>Visual ${i}</strong><div style="color:var(--muted);font-size:13px;margin-top:6px">点击可替换为你的照片或 AI 生成图</div></div>`;
    g.appendChild(it);
  }
}

/* ========== ASSISTANT UI =============== */
function wireAssistantUI(){
  const btn = document.getElementById("assistantBtn");
  const panel = document.getElementById("assistantPanel");
  const close = document.getElementById("assistantClose");
  const send = document.getElementById("assistantSend");
  const input = document.getElementById("assistantInput");

  btn.addEventListener("click", ()=>{ panel.hidden = false; panel.setAttribute("aria-hidden","false"); input.focus(); });
  close.addEventListener("click", ()=>{ panel.hidden = true; panel.setAttribute("aria-hidden","true"); });
  send.addEventListener("click", handleSend);
  input.addEventListener("keydown", (e)=>{ if(e.key === "Enter") handleSend(); });
}

/* append message */
function appendMsg(role, text){
  const box = document.getElementById("assistantMessages");
  const div = document.createElement("div");
  div.className = "msg " + (role==="user" ? "user" : "ai");
  div.innerText = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

/* handle send */
async function handleSend(){
  const input = document.getElementById("assistantInput");
  const q = input.value.trim();
  if(!q) return;
  appendMsg("user", q);
  input.value = "";
  appendMsg("ai", "思考中…");

  try{
    const answer = await queryAI(q);
    // replace last AI placeholder (simple)
    const msgs = document.querySelectorAll("#assistantMessages .msg.ai");
    const last = msgs[msgs.length-1];
    if(last) last.innerText = answer;
    else appendMsg("ai", answer);
  }catch(err){
    const msgs = document.querySelectorAll("#assistantMessages .msg.ai");
    const last = msgs[msgs.length-1];
    if(last) last.innerText = "抱歉，AI 服务出错：" + (err.message||err);
    else appendMsg("ai", "抱歉，AI 服务出错：" + (err.message||err));
  }
}

/* user clicked "问 AI" on a competition card */
function askCompetition(compId){
  const comp = CONFIG.competitions.find(c=>c.id===compId);
  if(!comp) return;
  const prompt = `请用简要要点介绍“${comp.name}”：参赛对象、报名入口（官网）、比赛难度与常见流程。`;
  appendMsg("user", prompt);
  appendMsg("ai", "思考中…");
  queryAI(prompt).then(ans=>{
    const msgs = document.querySelectorAll("#assistantMessages .msg.ai");
    const last = msgs[msgs.length-1];
    if(last) last.innerText = ans;
    else appendMsg("ai", ans);
  }).catch(err=>{
    const msgs = document.querySelectorAll("#assistantMessages .msg.ai");
    const last = msgs[msgs.length-1];
    if(last) last.innerText = "出错：" + (err.message||err);
  });
}

/* ========== AI QUERY (DeepSeek) ========== */
async function queryAI(userText){
  if(USE_PROXY){
    // call serverless proxy (recommended)
    const resp = await fetch(PROXY_URL, {
      method:"POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ query: userText })
    });
    if(!resp.ok) throw new Error("代理返回错误: " + resp.status);
    const data = await resp.json();
    // deepseek proxy returns same structure; try extract
    return data.answer || extractTextFromResponse(data) || JSON.stringify(data);
  }else{
    // direct call (DEMO only)
    const endpoint = "https://api.deepseek.com/v1/chat/completions";
    const payload = {
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "你是一个简洁、准确并且偏向学术/竞赛的信息助理。回答必须给出要点并在能提供官网链接时推荐查看官网。" },
        { role: "user", content: userText }
      ],
      max_tokens: 700,
      temperature: 0.2
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if(!res.ok){
      const txt = await res.text();
      throw new Error("DeepSeek 返回错误: " + res.status + " / " + txt.slice(0,300));
    }
    const data = await res.json();
    // try common response shapes
    return extractTextFromResponse(data) || "抱歉，未获得有效回复。";
  }
}

function extractTextFromResponse(data){
  // common places: choices[0].message.content, answer, text
  try{
    if(data?.choices?.[0]?.message?.content) return data.choices[0].message.content;
    if(data?.answer) return data.answer;
    if(data?.text) return data.text;
    // sometimes deepseek returns structure with outputs
    if(Array.isArray(data?.outputs) && data.outputs[0]?.content?.[0]?.text) return data.outputs[0].content[0].text;
  }catch(e){}
  return null;
}

/* ========== small utilities ============== */
function generateInitialsSVG(initials='SJ'){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='800'><defs><linearGradient id='g' x1='0' x2='1'><stop offset='0' stop-color='#00f0ff'/><stop offset='1' stop-color='#7c5cff'/></linearGradient></defs><rect width='100%' height='100%' rx='40' fill='url(#g)' /><text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle' font-size='260' font-family='Inter,Segoe UI,Arial' fill='#021016' font-weight='800'>${initials}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

/* ========== Background animation (subtle) ========== */
function animateBackground(){
  const canvas = document.getElementById("bgCanvas");
  if(!canvas) return;
  const ctx = canvas.getContext("2d");
  function resize(){ canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; }
  window.addEventListener("resize", resize);
  resize();

  const colors = ["rgba(0,240,255,0.06)","rgba(124,92,255,0.045)","rgba(255,255,255,0.02)"];
  let t=0;
  function frame(){
    t += 0.008;
    const w=canvas.width, h=canvas.height;
    ctx.clearRect(0,0,w,h);
    for(let i=0;i<3;i++){
      ctx.beginPath();
      ctx.fillStyle = colors[i];
      const px = w * (0.5 + 0.4*Math.sin(t*(i+1)));
      const py = h * (0.5 + 0.4*Math.cos(t*(i+1)));
      const r = Math.min(w,h) * (0.6 - i*0.15);
      ctx.ellipse(px, py, r, r*0.6, 0, 0, Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  frame();
}
