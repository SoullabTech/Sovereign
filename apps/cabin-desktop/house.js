'use strict';
const el=id=>document.getElementById(id);
let house,busy=false;
async function api(path,data){const r=await fetch(path,data===undefined?{}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const result=await r.json();if(!r.ok)throw Error(result.error||'Your House could not be updated');return result;}
function render(){
 el('welcome').textContent=house.name?'Welcome home, '+house.name+'.':'Welcome home.';
 el('name').value=house.name||'';
 el('quiet-arrival').checked=house.preferences.passingThrough==='quiet';
 el('arrival').hidden=el('quiet-arrival').checked;
 el('writing-label').textContent=house.places.find(p=>p.id==='writing').label;
 el('writing-purpose').textContent=house.places.find(p=>p.id==='writing').purpose;
 el('writing-count').textContent=house.writingCount?house.writingCount+' saved '+(house.writingCount===1?'piece':'pieces')+' waiting for you.':'A quiet place to begin.';
 el('future-rooms').replaceChildren();
 for(const p of house.places.filter(p=>p.id!=='writing')){const li=document.createElement('li');li.append(document.createTextNode(p.label));const purpose=document.createElement('span');purpose.textContent=p.purpose;li.append(purpose);el('future-rooms').append(li);}
}
async function act(task){if(busy)return;busy=true;el('save-name').disabled=true;el('quiet-arrival').disabled=true;try{await task();}catch(e){el('status').textContent=e.message;if(house)render();}finally{busy=false;el('save-name').disabled=false;el('quiet-arrival').disabled=false;}}
el('profile-form').onsubmit=e=>{e.preventDefault();act(async()=>{house=await api('/api/house/profile',{name:el('name').value});render();el('status').textContent='Your local name is saved.';});};
el('quiet-arrival').onchange=()=>act(async()=>{house=await api('/api/house/preferences',{revision:house.preferences.revision,preferences:{...house.preferences,passingThrough:el('quiet-arrival').checked?'quiet':'shared'}});render();el('status').textContent='Your arrival preference is saved.';});
el('enter-maia').onclick=()=>sessionStorage.setItem('cabin-room-focus','maia');
el('enter-writing').onclick=()=>sessionStorage.setItem('cabin-room-focus','writing');
act(async()=>{house=await api('/api/house');render();el('status').textContent='Your House is ready.';});
