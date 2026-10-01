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
];
const frontier = [
  ['Imagine','What wants to become possible through you?','Enter Vision Studio →'],
  ['Make','Use AI in service of authorship, craft and something real.','Enter Writer’s Studio →'],
  ['Understand','Learn enough about the technology to participate with discernment.','Explore the Library →'],
  ['See the larger whole','Explore patterns, relationships and the field around what you are making.','Enter Living Field →'],
  ['Consciousness & AI','Question intelligence, agency, meaning, sovereignty and what remains mysterious.','Go deeper →'],
  ['Build with Kelly','If an idea feels larger than what you know how to build yet, bring it.','See the invitation ↓'],
];
function html(name){
  const workCards=works.map(w=>`<article class="workCard"><span>WORK</span><strong>${w}</strong><a>Open Writer’s Studio →</a></article>`).join('');
  const frontierCards=frontier.map(([label,line,action])=>`<a class="frontierCard"><span>${label}</span><strong>${line}</strong><small>${action}</small></a>`).join('');
  const fields=groups.map(([g,items])=>`<div class="fieldGroup"><div class="groupHead"><h4>${g}</h4><span>Move through what is here.</span></div><div class="fieldGrid">${items.map(x=>`<a class="fieldCard"><span>◎</span><strong>${x}</strong><small>A place already held in your House.</small></a>`).join('')}</div></div>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body style="margin:0">
  <main class="world"><header class="header"><a class="return">← House</a><span>ONE FIELD · MANY THREADS</span></header>
  <section class="hero"><p>YOUR WORLD</p><h1>${name}’s World</h1><h2>What you are tending, creating, remembering and becoming — in one place.</h2></section>
  <section class="orientation"><div><p>ORIENTATION</p><h3>What am I holding?</h3><span>This view gathers what is already yours. It does not create new permission, new identity, or hidden memory.</span></div><a>Arrange my House →</a></section>
  <section class="alive"><header><p>WHAT’S ALIVE</p><h3>Living work</h3></header><div class="workGrid">${workCards}</div></section>
  <section class="frontier"><header class="frontierHead"><div><p>THE FRONTIER</p><h3>AI as a medium for imagination, inquiry and creation.</h3></div><span>Not a course to complete. A place to wonder, understand, make, question, and discover what becomes possible when emerging intelligence meets your own work.</span></header><div class="frontierGrid">${frontierCards}</div>`
  + `<aside class="edges"><div><p>FROM THE EDGES</p><h4>Experiments, questions, failures and discoveries from the frontier.</h4></div><span>A living stream of what Kelly and the Soullab community are learning as we build with AI — technical, creative, philosophical and strange.</span></aside>`
  + `<aside class="buildWithKelly"><p>BUILD WITH KELLY</p><h4>Some ideas want a companion.</h4><span>If you are carrying something unusual and want help giving it form, keep it close. A direct way to bring it to Kelly is being designed. Nothing here asks you to book or buy anything.</span></aside></section>`
  + `<section class="fields"><header><p>YOUR FIELDS</p><h3>Move through your House without losing the whole.</h3></header>${fields}</section>`
  + `<footer class="footer"><span>Your World is an orientation surface, not a second owner of your life.</span><a>Return to House →</a></footer></main></body></html>`;
}

fs.writeFileSync(path.join(out,'member-world-r2-desktop.html'),html('Kelly'));
fs.writeFileSync(path.join(out,'member-world-r2-mobile.html'),html('Andrea'));
console.log('member world R2 visual HTML generated');
