'use strict';
const $=s=>document.querySelector(s);
const e=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function article(x){return `<a class="article-card" href="${e(x.url)}"><div class="image"><img src="${e(x.image)}" alt="" loading="lazy"></div><div class="article-body"><h3>${e(x.title)}</h3><span class="read">記事を読む <span aria-hidden="true">›</span></span></div></a>`}
function project(x){return `<a class="project-card" href="${e(x.url)}"><div class="image"><img src="${e(x.image)}" alt="" loading="lazy"></div><div class="project-body"><h3>${e(x.title)}</h3><span class="read">詳しく見る <span aria-hidden="true">›</span></span></div></a>`}
function member(x){return `<a class="member-card" href="${e(x.url)}"><div class="image"><img src="${e(x.image)}" alt="" loading="lazy"></div><div><h3>${e(x.title)}</h3><p>${e(x.school)}</p></div></a>`}
fetch('data.json').then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{
$('#logo').src=data.logo;$('#footer-logo').src=data.logo;
const generalArticles=[...data.tab_student,...data['tab_active-report']];
const renderArticles=key=>{$('#article-grid').innerHTML=(key==='tab_for_students'?generalArticles:(data[key]||[])).map(article).join('')};renderArticles('tab_for_students');
const buttons=[...document.querySelectorAll('[data-article]')];buttons.forEach(button=>button.onclick=()=>{buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));$('#article-select').value='tab_for_students';renderArticles(button.dataset.article)});
$('#article-select').onchange=event=>{buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.article==='tab_for_students')));renderArticles(event.target.value)};
const projectButtons=[...document.querySelectorAll('[data-project]')];
const renderProjects=key=>{$('#project-grid').innerHTML=(data[key]||[]).map(project).join('');projectButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.project===key)))};projectButtons.forEach(button=>button.onclick=()=>renderProjects(button.dataset.project));renderProjects('tab_planning');
const renderMembers=()=>{$('#member-grid').innerHTML=(data[$('#member-select').value]||[]).map(member).join('')};$('#member-select').onchange=renderMembers;renderMembers();

const interviewItems=data.interview_gallery;
function interviewCard(x,copy){return `<a class="interview-card" href="${e(x.url)}" ${copy?'tabindex="-1"':''}><div class="interview-image"><img src="${e(x.image)}" alt="" loading="lazy"></div><h3>${e(x.title)}</h3><span class="interview-arrow" aria-hidden="true">↗</span></a>`}
$('#interview-rows').innerHTML=[interviewItems.slice(0,3),interviewItems.slice(3)].filter(row=>row.length).map((row,i)=>`<div class="interview-row ${i?'reverse':''}"><div class="interview-track"><div class="interview-set">${row.map(x=>interviewCard(x,false)).join('')}</div><div class="interview-set clone" aria-hidden="true">${row.map(x=>interviewCard(x,true)).join('')}</div></div></div>`).join('');
const interviewObserver=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('is-outside',!entry.isIntersecting)),{threshold:0.05});interviewObserver.observe($('#interviews'));
const pauseButton=$('#interview-pause');pauseButton.onclick=()=>{const paused=pauseButton.getAttribute('aria-pressed')!=='true';pauseButton.setAttribute('aria-pressed',String(paused));pauseButton.setAttribute('aria-label',paused?'インタビューの自動スクロールを再生':'インタビューの自動スクロールを一時停止');pauseButton.querySelector('.pause-text').textContent=paused?'再生':'一時停止';pauseButton.querySelector('.pause-symbol').textContent=paused?'▶':'Ⅱ';$('#interviews').classList.toggle('is-paused',paused)};

const items=[...new Map(Object.entries(data).filter(([k,v])=>k.startsWith('tab_')||k==='popular').flatMap(([k,v])=>v).map(x=>[x.url,x])).values()];
function search(){const q=$('#search-input').value.trim().toLowerCase();const results=q?items.filter(x=>(x.title+' '+x.category+' '+x.school).toLowerCase().includes(q)):[];$('#search-count').textContent=q?(results.length?results.length+'件':'見つかりませんでした。別のキーワードをお試しください。'):'';$('#search-results').innerHTML=results.map(x=>`<a class="search-result" href="${e(x.url)}">${e(x.title)} <span aria-hidden="true">›</span></a>`).join('')}
$('#search-input').addEventListener('input',search);$('#search-open').onclick=()=>{$('#search-dialog').showModal();$('#search-input').focus();search()};
}).catch(()=>{$('#article-grid').innerHTML='<p>読み込めませんでした。ページを再読み込みしてください。</p>'});
const menu=$('#menu-button');function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','メニューを開く');$('#mobile-nav').hidden=true}menu.onclick=()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'メニューを閉じる':'メニューを開く');$('#mobile-nav').hidden=!open};$('#mobile-nav').querySelectorAll('a').forEach(a=>a.onclick=closeMenu);document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu()});

// Progressive, motion-aware feedback for arrival, scrolling, and filtering.
(()=>{
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const candidates='.section-head,.category-bar,.article-card,.project-card,.member-card';
 const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-revealed');revealObserver.unobserve(entry.target)}}),{threshold:0.08,rootMargin:'0px 0px -28px 0px'});
 function register(){if(preference.matches)return;document.querySelectorAll(candidates).forEach(el=>{if(el.dataset.motionReady)return;el.dataset.motionReady='true';const index=[...el.parentElement.children].indexOf(el);el.style.setProperty('--reveal-delay',`${Math.max(0,index%3)*65}ms`);el.classList.add('motion-reveal');revealObserver.observe(el)})}
 register();
 const contentObserver=new MutationObserver(()=>register());['article-grid','project-grid','member-grid'].forEach(id=>{const el=document.getElementById(id);if(el)contentObserver.observe(el,{childList:true})});
 document.addEventListener('focusin',event=>{const card=event.target.closest('.motion-reveal');if(card){card.classList.add('is-revealed');revealObserver.unobserve(card)}});
 preference.addEventListener('change',()=>{if(preference.matches){document.querySelectorAll('.motion-reveal').forEach(el=>el.classList.add('is-revealed'));revealObserver.disconnect()}else register()});
 const navigation=[...document.querySelectorAll('header nav a[href^="#"]')];
 function setCurrent(id){navigation.forEach(link=>{if(link.getAttribute('href')==='#'+id)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')})}
 const sectionObserver=new IntersectionObserver(entries=>{const current=entries.find(entry=>entry.isIntersecting);if(current)setCurrent(current.target.id)},{rootMargin:'-20% 0px -60% 0px',threshold:0});
 document.querySelectorAll('#interviews,#articles,#projects,#members').forEach(section=>sectionObserver.observe(section));
 let queued=false;function updateHeader(){document.querySelector('header').classList.toggle('is-scrolled',scrollY>70);if(scrollY<document.querySelector('.hero').offsetHeight*.5)setCurrent('');queued=false}
 addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(updateHeader)}},{passive:true});updateHeader();
})();
