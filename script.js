// Theme: init & toggle with persistence
(function(){
  const root=document.documentElement;
  const btnInit=()=>document.getElementById('themeToggle');
  function applyTheme(t){
    root.setAttribute('data-theme', t==='dark'?'dark':'light');
    localStorage.setItem('theme', t);
    const b=btnInit();
    if(b){ b.setAttribute('aria-pressed', String(t==='dark')); b.textContent = t==='dark' ? '☀️ Light' : '🌙 Dark'; }
  }
  const saved=localStorage.getItem('theme');
  const prefers=window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved ? saved : (prefers ? 'dark' : 'light'));
  window.addEventListener('DOMContentLoaded', ()=>{
    const btn=btnInit();
    btn && btn.addEventListener('click', ()=>{
      const cur=root.getAttribute('data-theme')==='dark'?'light':'dark';
      applyTheme(cur);
    });
  });
})();

// Nav: scrollspy + compact + smooth anchors
const nav = document.querySelector('.nav');
function setNavH(){ if(nav) document.documentElement.style.setProperty('--navH', nav.offsetHeight+'px'); }
setNavH();
window.addEventListener('resize', setNavH);
const navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
const sections = navLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
const spy = new IntersectionObserver((entries)=>{
  const visible = entries.filter(e=>e.isIntersecting).sort((a,b)=> b.intersectionRatio - a.intersectionRatio)[0];
  if(visible){
    const id = '#'+visible.target.id;
    navLinks.forEach(a=> a.classList.toggle('active', a.getAttribute('href')===id));
  }
},{rootMargin:'-40% 0px -55% 0px',threshold:[0,.25,.6,1]});
sections.forEach(s=> spy.observe(s));
function syncNav(){ const y = window.scrollY; if(!nav) return; nav.classList.toggle('compact', y>24); setNavH(); }
window.addEventListener('scroll', syncNav, {passive:true});
syncNav();

// Smooth anchor scroll
navLinks.forEach(a=>{
  a.addEventListener('click', e=>{
    const id=a.getAttribute('href');
    const el=document.querySelector(id);
    if(el){ e.preventDefault(); el.scrollIntoView({behavior:'smooth'}); }
  });
});

// Contrast boost over Tech section
const tech = document.getElementById('skills');
const contrastObs = new IntersectionObserver((entries)=>{
  entries.forEach(e=> nav && nav.classList.toggle('solid', e.isIntersecting));
},{rootMargin:'-5% 0px -90% 0px', threshold:[0.01,0.2]});
tech && contrastObs.observe(tech);

// 年份
document.getElementById('y').textContent = new Date().getFullYear();

// Projects rail — arrows, wheel, keyboard, snap
const pTrack = document.getElementById('pTrack');
const pPrev = document.getElementById('pPrev');
const pNext = document.getElementById('pNext');
function pUpdate(){
  if(!pTrack||!pPrev||!pNext) return;
  const max = pTrack.scrollWidth - pTrack.clientWidth - 2;
  pPrev.disabled = pTrack.scrollLeft <= 2;
  pNext.disabled = pTrack.scrollLeft >= max;
}
function pStep(dir){
  const w = pTrack.clientWidth * 0.92;
  pTrack.scrollBy({left: dir * w, behavior:'smooth'});
  setTimeout(pUpdate, 300);
}
pPrev && pPrev.addEventListener('click', ()=> pStep(-1));
pNext && pNext.addEventListener('click', ()=> pStep(1));
pTrack && pTrack.addEventListener('scroll', pUpdate, {passive:true});
// wheel to horizontal
pTrack && pTrack.addEventListener('wheel', (e)=>{
  if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){
    e.preventDefault();
    pTrack.scrollBy({left:e.deltaY, behavior:'smooth'});
  }
}, {passive:false});
// keyboard
if(pTrack){
  pTrack.setAttribute('tabindex','0');
  pTrack.addEventListener('keydown', (e)=>{
    if(e.key==='ArrowRight') pStep(1);
    if(e.key==='ArrowLeft') pStep(-1);
  });
}
pUpdate();

// Testimonials 横向滚动增强（如有）
const tTrack = document.querySelector('.carousel .track');
tTrack && tTrack.addEventListener('wheel',(e)=>{
  if(Math.abs(e.deltaY)>0){ e.preventDefault(); tTrack.scrollBy({left:e.deltaY,behavior:'smooth'});} 
},{passive:false});

// ===== Projects modal (Show all) =====
function updateShowAllBtn(isOpen){
  const btn = document.getElementById('showAll');
  if(!btn) return;
  btn.setAttribute('aria-expanded', String(!!isOpen));
  const lab = btn.querySelector('.label');
  if(lab) lab.textContent = isOpen ? 'Close' : 'Show all';
}
let currentFilter = 'all';
let lastActive = null;
let untrapFocus = null;
function trapFocus(modal){
  const focusables = Array.from(modal.querySelectorAll('a[href],button,textarea,input,select,[tabindex]:not([tabindex="-1"])')).filter(el=>!el.hasAttribute('disabled'));
  function handler(e){
    if(e.key!=='Tab' || focusables.length===0) return;
    const first = focusables[0];
    const last  = focusables[focusables.length-1];
    if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  }
  modal.addEventListener('keydown', handler);
  return ()=> modal.removeEventListener('keydown', handler);
}
const projects = [
  {title:'Stock Prediction Web App', cat:'ml', stack:'React · Flask · TensorFlow · AWS · CI/CD', bullets:['Real-time LSTM predictions with feature engineering.','Accuracy +18%; CI/CD cut deploy time −40%.','Live charts & monitoring with rollback.'], kpis:['+18% acc','−40% deploy','Live charts']},
  {title:'Temperature Prediction', cat:'ml', stack:'LSTM vs GRU · Transformer baseline · MAE', bullets:['Addressed long-term dependencies with a Transformer variant.','MAE-focused tuning and robust validation.'], kpis:['Sequence modeling','MAE optimized']},
  {title:'Motion Pedestrian Count', cat:'cv', stack:'OpenCV · GMM background model · Haar Cascade', bullets:['Extracted motion objects; detected & tracked pedestrians.','Estimated proximity and daily density metrics.'], kpis:['OpenCV + GMM','Density metrics']},
  {title:'Social Media User Verification', cat:'nlp', stack:'NLP · 20k profiles · Classification & Clustering', bullets:['End-to-end NLP pipeline from cleaning to modeling.','Fake profile detection ~92% accuracy.'], kpis:['~92% acc','20k samples']},
  {title:'Sports Event Simulation', cat:'sim', stack:'Attributes · Weather · Scheduling · Rankings', bullets:['Simulated events using athlete attributes, venues, weather and timing.','Generated daily scores, team rankings and awards standings.'], kpis:['Simulation','Rankings']},
  {title:'Web Apps Collection', cat:'web', stack:'Small UIs · Full-stack demos', bullets:['Photo Sharing · Calories · Automating Emails','Flatemate’s Bill · Instant Dictionary'], kpis:['React/Flask','UX practice']},
];

// number badge on button
const allCountEl = document.getElementById('allCount');
if(allCountEl) allCountEl.textContent = String(projects.length);
updateShowAllBtn(false);

function renderProjects(target, filter='all'){
  const el = target || document.getElementById('projectsGrid');
  if(!el) return;
  const list = projects.filter(p=> filter==='all' ? true : p.cat===filter);
  el.innerHTML = list.map(p=>`
    <article class="p-card">
      <h4 class="p-title">${p.title}</h4>
      <p class="p-stack">${p.stack}</p>
      <ul>${p.bullets.map(b=>'<li>'+b+'</li>').join('')}</ul>
      <div class="pkpis">${(p.kpis||[]).map(k=>'<span class="pkpi">'+k+'</span>').join('')}</div>
    </article>
  `).join('');
}

function openProjects(){
  const modal = document.getElementById('projectsModal');
  const grid = document.getElementById('projectsGrid');
  if(!modal) return;
  renderProjects(grid, currentFilter);
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  // filter chips
  modal.querySelectorAll('.fchip').forEach(btn=>{
    btn.onclick = ()=>{
      modal.querySelectorAll('.fchip').forEach(b=>{b.classList.toggle('active', b===btn); b.setAttribute('aria-selected', String(b===btn));});
      currentFilter = btn.getAttribute('data-filter') || 'all';
      renderProjects(grid, currentFilter);
    };
  });
  // focus trap
  lastActive = document.activeElement;
  untrapFocus = trapFocus(modal);
  const closeBtn = document.getElementById('projectsClose');
  closeBtn && closeBtn.focus();
  updateShowAllBtn(true);
}

function closeProjects(){
  const modal = document.getElementById('projectsModal');
  if(!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
  if(untrapFocus){ untrapFocus(); untrapFocus=null; }
  if(lastActive){ lastActive.focus(); lastActive=null; }
  updateShowAllBtn(false);
}

const showAllBtn = document.getElementById('showAll');
showAllBtn && showAllBtn.addEventListener('click', ()=>{
  const m=document.getElementById('projectsModal');
  m && m.classList.contains('open') ? closeProjects() : openProjects();
});

document.addEventListener('click', (e)=>{ if(e.target.matches('#projectsClose,[data-close]')) closeProjects(); });
window.addEventListener('keydown', (e)=>{
  const m=document.getElementById('projectsModal');
  if(e.key==='Escape' && m && m.classList.contains('open')){ closeProjects(); return; }
  const tag=(e.target && e.target.tagName||'').toLowerCase();
  if((e.key==='g' || e.key==='G') && !e.ctrlKey && !e.metaKey && !e.altKey && tag!=='input' && tag!=='textarea' && !e.target.isContentEditable){
    m && m.classList.contains('open') ? closeProjects() : openProjects();
  }
});

// Status "Last updated"
(function(){
  const el = document.getElementById('statusUpdated');
  if(el){
    const fmt = new Intl.DateTimeFormat('en',{year:'numeric',month:'short'});
    el.textContent = fmt.format(new Date());
  }
})();
