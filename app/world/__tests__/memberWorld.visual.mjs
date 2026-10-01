import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const css = fs.readFileSync(path.join(root,'app/world/world.module.css'),'utf8');
const out = path.join(root,'docs/design/contracts/screenshots');
fs.mkdirSync(out,{recursive:true});

const works = ['Elemental Alchemy','A new living work'];
const groups = [
  ['Reflect & decide',['Journal','Reflections','Decisions','Astrology','Dream']],
  ['Create & learn',['Writing','Ideas','Wisdom','Library','Vision Studio']],
  ['Practice & connect',['Relationships','Practices','Community','Co-lab','Daily Anchor']],
];function html(name){
  const workCards=works.map(w=>`<article class="workCard"><span>WORK</span><strong>${w}</strong><a>Open Writer’s Studio →</a></article>`).join('');
  const fields=groups.map(([g,items])=>`<div class="fieldGroup"><div class="groupHead"><h4>${g}</h4><span>Move through what is here.</span></div><div class="fieldGrid">${items.map(x=>`<a class="fieldCard"><span>◎</span><strong>${x}</strong><small>A place already held in your House.</small></a>`).join('')}</div></div>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body style="margin:0">
  <main class="world"><header class="header"><a class="return">← House</a><span>ONE FIELD · MANY THREADS</span></header>
  <section class="hero"><p>YOUR WORLD</p><h1>${name}’s World</h1><h2>What you are tending, creating, remembering and becoming — in one place.</h2></section>
  <section class="orientation"><div><p>ORIENTATION</p><h3>What am I holding?</h3><span>This view gathers what is already yours. It does not create new permission, new identity, or hidden memory.</span></div><a>Arrange my House →</a></section>
  <section class="alive"><header><p>WHAT’S ALIVE</p><h3>Living work</h3></header><div class="workGrid">${workCards}</div></section>  <section class="fields"><header><p>YOUR FIELDS</p><h3>Move through your House without losing the whole.</h3></header>${fields}</section>
  <footer class="footer"><span>Your World is an orientation surface, not a second owner of your life.</span><a>Return to House →</a></footer></main></body></html>`;
}

fs.writeFileSync(path.join(out,'member-world-r1-desktop.html'),html('Kelly'));
fs.writeFileSync(path.join(out,'member-world-r1-mobile.html'),html('Andrea'));
console.log('member world visual HTML generated');