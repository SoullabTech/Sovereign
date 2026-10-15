#!/usr/bin/env node
'use strict';
/**
 * Controlled beta invitation provisioning. NOT a public API.
 * CLI: node scripts/beta/provisionInvitedWriters.cjs preview <roster.json>
 * CLI: node scripts/beta/provisionInvitedWriters.cjs apply <roster.json> <private-output.json>
 * roster.json = [{"name":"...","email":"..."}] of founder-approved adults.
 *
 * Never prints addresses, invitation URLs, reset tokens or database credentials.
 * "apply" requires isolated DB identity and explicit operator release flag.
 */
const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const [,, mode, rosterFile, outputFile] = process.argv;
if (!['preview','apply'].includes(mode) || !rosterFile || (mode === 'apply' && !outputFile)) {
 console.error('Usage: provisionInvitedWriters.cjs preview <roster> OR apply <roster> <private-output>');
 process.exit(2);
}
const roster = JSON.parse(fs.readFileSync(rosterFile,'utf8'));
if (!Array.isArray(roster) || roster.length<1 || roster.length>5) throw Error('ROSTER_BOUND_1_TO_5');
const seen = new Set();
for (const p of roster) {
 if(!p || typeof p.name!=='string' || typeof p.email!=='string'
    || p.name.trim().length<3 || p.name.length>150
    || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)
    || p.email.length>254) throw Error('INVALID_ROSTER_ENTRY');
 const email=p.email.trim().toLowerCase();
 if(seen.has(email)) throw Error('DUPLICATE_ROSTER_EMAIL');
 seen.add(email);
}
if (mode === 'preview') {
 console.log(JSON.stringify({status:'ROSTER_SHAPE_VALID',count:roster.length,mode:'preview',databaseTouched:false,emailsDisplayed:false}));
 process.exit(0);
}
if (process.env.WS_BETA_PROVISIONING_APPROVED !== 'founder-approved-private-roster-v1') throw Error('REQUIRE_EXPLICIT_APPROVAL_FLAG');
if (!process.env.DATABASE_URL) throw Error('DATABASE_URL_REQUIRED');
const dbName=new URL(process.env.DATABASE_URL).pathname.substring(1);
if (dbName!=='ws_member_beta_20261015') throw Error('REFUSE_UNRECOGNIZED_BETA_DB');
if(fs.existsSync(outputFile) || fs.existsSync(outputFile+'.pending')) throw Error('REFUSE_EXISTING_INVITE_OUTPUT');
const outDir=path.dirname(outputFile);
if((fs.statSync(outDir).mode & 0o077)!==0) throw Error('PRIVATE_OUTPUT_DIRECTORY_REQUIRED');

(async()=>{
 const db=new Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:7000});
 await db.connect();
 let open=false;
 try {
  const identity=(await db.query('SELECT current_database() AS db, (SELECT count(*)::int FROM schema_migrations) AS migrations')).rows[0];
  if(identity.db!=='ws_member_beta_20261015'||identity.migrations<575) throw Error('DATABASE_IDENTITY_OR_SCHEMA_REFUSED');
  await db.query('BEGIN');open=true;
  await db.query("SELECT pg_advisory_xact_lock(hashtext('soullab_writer_beta_invites_20261015'))");
  const inventory=(await db.query("SELECT (SELECT count(*)::int FROM members) AS members,(SELECT count(*)::int FROM auth_sessions) AS sessions")).rows[0];
  if(inventory.members!==0||inventory.sessions!==0) throw Error('REFUSE_NONEMPTY_UNAPPROVED_BETA_DB');
  const issue=[];
  for (const raw of roster) {
   const memberId=crypto.randomUUID(), email=raw.email.trim().toLowerCase(),name=raw.name.trim();
   const username='beta-'+memberId.replace(/-/g,'').slice(0,20);
   const passwordHash=await bcrypt.hash(crypto.randomBytes(32).toString('hex'),12);
   const invitation=crypto.randomBytes(32).toString('hex');
   const tokenHash=crypto.createHash('sha256').update(invitation).digest('hex');
   await db.query("INSERT INTO members(id,username,password_hash,name,email,passkey,onboarded,onboarding_step) VALUES($1,$2,$3,$4,$5,$6,TRUE,'complete')",
     [memberId,username,passwordHash,name,email,'SOULLAB-BETA-'+memberId]);
   await db.query("INSERT INTO ops_contacts(name,email,contact_type,pipeline_stage,source,member_id) VALUES($1,$2,'beta_tester','active','approved-writer-beta-invitation',$3)",
     [name,email,memberId]);
   await db.query("INSERT INTO password_reset_tokens(member_id,token,expires_at) VALUES($1,$2,NOW()+INTERVAL '72 hours')",
     [memberId,tokenHash]);
   issue.push({memberId,name,email,setupUrl:'https://beta.soullab.life/writers-studio/invite?token='+invitation});
  }
  const payload={source:'writer-beta-private-invitation-v1',createdAt:new Date().toISOString(),count:issue.length,
    memberIds:issue.map(x=>x.memberId),invites:issue,
    secretMaterial:'INVITATION_LINKS_PRIVATE_DO_NOT_LOG_OR_COPY_TO_REPORT'};
  // Write and fsync the private link custody BEFORE committing member rows.
  // Publishing the final filename happens only after the database commit.
  // On a crash after COMMIT, the private .pending file preserves recovery
  // material instead of leaving uncontactable accounts with lost links.
  const pendingFile=outputFile+'.pending';
  const fd=fs.openSync(pendingFile,'wx',0o600);
  try {
    fs.writeFileSync(fd,JSON.stringify(payload,null,2)+'\n');
    fs.fsyncSync(fd);
  } finally {fs.closeSync(fd);}
  await db.query('COMMIT');open=false;
  fs.renameSync(pendingFile,outputFile);
  const directoryFd=fs.openSync(outDir,'r');
  try {fs.fsyncSync(directoryFd);} finally {fs.closeSync(directoryFd);}
  console.log(JSON.stringify({status:'INVITATIONS_CREATED_PRIVATELY',count:issue.length,
    persistedRosterFile:outputFile,rawSecretsPrinted:false,emailsSent:false}));
 }catch(e){
   if(open) {
     await db.query('ROLLBACK').catch(()=>undefined);
     try {fs.unlinkSync(outputFile+'.pending');} catch {}
   }
   throw e;
 }
 finally{await db.end()}
})().catch(e=>{console.error('PROVISIONING_REFUSED',String(e.message).replace(/postgresql:\/\/[^\s]+/g,'[redacted]'));process.exitCode=1});
