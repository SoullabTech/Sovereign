'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {DatabaseSync}=require('node:sqlite');
const {recentConversationTurns,modelConversationContext}=require('../apps/cabin-desktop/conversation-context.cjs');
test('long conversation uses newest exchanges without another owner or session',()=>{
 const db=new DatabaseSync(':memory:');
 try{
  db.exec('CREATE TABLE conversation_turns(id TEXT,user_id TEXT,session_id TEXT,role TEXT,content TEXT,created_at TEXT)');
  const put=db.prepare('INSERT INTO conversation_turns VALUES(?,?,?,?,?,?)');
  for(let i=0;i<520;i++)put.run(String(i),'fictional-owner','chosen',i%2?'assistant':'user','turn-'+i,String(i).padStart(6,'0'));
  put.run('foreign','other-owner','chosen','user','foreign-private','999999');
  put.run('other','fictional-owner','other-session','user','other-private','999999');
  const turns=recentConversationTurns(db,'fictional-owner','chosen');
  assert.equal(turns.length,500);assert.equal(turns[0].content,'turn-20');assert.equal(turns.at(-1).content,'turn-519');
  assert.deepEqual(modelConversationContext(turns).map(t=>t.content),Array.from({length:12},(_,i)=>'turn-'+(508+i)));
  assert.deepEqual(recentConversationTurns(db,'unknown','chosen'),[]);
 }finally{db.close();}
});
test('equal timestamps retain append order and context remains bounded',()=>{
 const db=new DatabaseSync(':memory:');
 try{
  db.exec('CREATE TABLE conversation_turns(id TEXT,user_id TEXT,session_id TEXT,role TEXT,content TEXT,created_at TEXT)');
  const put=db.prepare('INSERT INTO conversation_turns VALUES(?,?,?,?,?,?)');
  for(let i=0;i<20;i++)put.run(String(i),'owner','session',i%2?'assistant':'user','same-'+i,'same-time');
  assert.deepEqual(recentConversationTurns(db,'owner','session').map(t=>t.id),Array.from({length:20},(_,i)=>String(i)));
  const context=modelConversationContext([{id:'private-metadata',role:'user',content:'a'.repeat(5000)}]);
  assert.equal(context[0].content.length,4000);assert.deepEqual(Object.keys(context[0]),['role','content']);
  assert.deepEqual(modelConversationContext([]),[]);
 }finally{db.close();}
});
