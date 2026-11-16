// Skrip navigasi untuk file HTML offline (dijalankan di browser pembuka file).
// Tidak memakai backtick atau tanda dolar-kurung di dalamnya.

export const HTML_SCRIPT = `
(function(){
var slides=[].slice.call(document.querySelectorAll('.slide'));
var total=slides.length;
var ids=slides.map(function(s){return s.id});
var stage=document.getElementById('stage');
var counter=document.getElementById('counter');
var bar=document.getElementById('progress');
var prevB=document.getElementById('prev');
var nextB=document.getElementById('next');
var toc=document.getElementById('toc');
var links=[].slice.call(document.querySelectorAll('#toc a'));
var fsB=document.getElementById('fs');
var themeB=document.getElementById('theme');
var root=document.documentElement;
var index=0;

function pad(n){return (n<10?'0':'')+n}
function current(){var i=ids.indexOf(location.hash.slice(1));return i<0?0:i}

function render(){
  index=current();
  slides.forEach(function(s,i){s.classList.toggle('active',i===index)});
  counter.textContent=pad(index+1)+' / '+pad(total);
  bar.style.width=((index+1)/total*100)+'%';
  prevB.disabled=index===0;
  nextB.disabled=index>=total-1;
  links.forEach(function(a){
    var on=(' '+a.getAttribute('data-ids')+' ').indexOf(' '+ids[index]+' ')>=0;
    if(on)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');
  });
  stage.scrollTop=0;
}

function go(n){
  if(total===0)return;
  var c=Math.min(Math.max(n,0),total-1);
  location.replace('#'+ids[c]);
}

function openToc(){toc.classList.add('open')}
function closeToc(){toc.classList.remove('open')}
function toggleToc(){toc.classList.toggle('open')}

function toggleFs(){
  if(!root.requestFullscreen)return;
  if(document.fullscreenElement){document.exitFullscreen()}
  else{root.requestFullscreen().catch(function(){})}
}
if(!root.requestFullscreen){fsB.hidden=true}
fsB.addEventListener('click',toggleFs);
document.addEventListener('fullscreenchange',function(){
  fsB.textContent=document.fullscreenElement?'Exit fullscreen':'Fullscreen';
});

prevB.addEventListener('click',function(){go(index-1)});
nextB.addEventListener('click',function(){go(index+1)});
document.getElementById('toc-btn').addEventListener('click',toggleToc);
document.getElementById('toc-close').addEventListener('click',closeToc);
document.getElementById('toc-scrim').addEventListener('click',closeToc);
document.getElementById('edge').addEventListener('mouseenter',openToc);
toc.querySelector('nav').addEventListener('mouseleave',closeToc);
links.forEach(function(a){a.addEventListener('click',closeToc)});

[].slice.call(document.querySelectorAll('[data-gal]')).forEach(function(b){
  b.addEventListener('click',function(){
    var g=b.parentNode.nextElementSibling;
    if(g)g.scrollBy({left:Number(b.getAttribute('data-gal'))*g.clientWidth*0.9,behavior:'smooth'});
  });
});

var themes=['system','light','dark'];
var theme='system';
try{theme=localStorage.getItem('deckfolio-theme')||'system'}catch(e){}
if(themes.indexOf(theme)<0)theme='system';
function applyTheme(){
  if(theme==='system')root.removeAttribute('data-theme');else root.setAttribute('data-theme',theme);
  themeB.textContent='Theme: '+theme.charAt(0).toUpperCase()+theme.slice(1);
}
themeB.addEventListener('click',function(){
  theme=themes[(themes.indexOf(theme)+1)%themes.length];
  applyTheme();
  try{localStorage.setItem('deckfolio-theme',theme)}catch(e){}
});
applyTheme();

document.addEventListener('keydown',function(e){
  if(e.metaKey||e.ctrlKey||e.altKey)return;
  var t=e.target;
  var has=t&&t.closest;
  if(has&&t.closest('input,textarea,select,[contenteditable="true"]'))return;
  var inGal=!!(has&&t.closest('[role="region"]'));
  var k=e.key;
  if(k==='ArrowRight'){if(inGal)return;e.preventDefault();go(index+1)}
  else if(k==='ArrowLeft'){if(inGal)return;e.preventDefault();go(index-1)}
  else if(k==='PageDown'){e.preventDefault();go(index+1)}
  else if(k==='PageUp'){e.preventDefault();go(index-1)}
  else if(k===' '){if(has&&t.closest('a,button'))return;e.preventDefault();go(index+1)}
  else if(k==='Home'){e.preventDefault();go(0)}
  else if(k==='End'){e.preventDefault();go(total-1)}
  else if(k==='f'||k==='F'){toggleFs()}
  else if(k==='t'||k==='T'){toggleToc()}
  else if(k==='Escape'){closeToc()}
});

var start=null;
stage.addEventListener('touchstart',function(e){
  if(e.target.closest('[role="region"]')){start=null;return}
  var p=e.touches[0];start={x:p.clientX,y:p.clientY};
},{passive:true});
stage.addEventListener('touchend',function(e){
  var s=start;start=null;
  if(!s)return;
  var p=e.changedTouches[0];
  var dx=p.clientX-s.x,dy=p.clientY-s.y;
  if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5){go(index+(dx<0?1:-1))}
},{passive:true});

window.addEventListener('hashchange',render);
render();
})();
`;