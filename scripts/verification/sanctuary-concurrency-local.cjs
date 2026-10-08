// Isolated local database witness; no production connections.
const { Pool } = require('pg');
const DB = 'sanctuary_protocol_verify_1008';
const pool = new Pool({ connectionString: `postgresql://soullab@localhost:5432/${DB}`, max: 3 });
(async () => {
  const a = await pool.connect(), b = await pool.connect();
  const id='11111111-1111-4111-8111-111111111111';
  const member='22222222-2222-4222-8222-222222222222';
  try {
    await a.query('INSERT INTO auth_sessions(id,member_id,session_token,expires_at) VALUES($1,$2,$3,now() + interval \'1 day\') ON CONFLICT (id) DO NOTHING',[id,member,'local-fixture']);
    await a.query('BEGIN');
    const first=await a.query('SELECT source_persistence_posture FROM auth_sessions WHERE id=$1 FOR UPDATE NOWAIT',[id]);
    console.log('default_posture='+first.rows[0].source_persistence_posture);
    await b.query('BEGIN');
    let refused=false;
    try { await b.query('SELECT id FROM auth_sessions WHERE id=$1 FOR UPDATE NOWAIT',[id]); }
    catch(e) { refused = e.code === '55P03'; }
    console.log('competing_lease_refused='+refused);
    await b.query('ROLLBACK');await a.query('COMMIT');
    await b.query("UPDATE auth_sessions SET source_persistence_posture='ordinary',source_persistence_revision=source_persistence_revision+1 WHERE id=$1",[id]);
    await a.query('BEGIN');await a.query('SELECT id FROM auth_sessions WHERE id=$1 FOR UPDATE NOWAIT',[id]);
    let acknowledged=false;
    const pending=b.query("UPDATE auth_sessions SET source_persistence_posture='sanctuary',source_persistence_revision=source_persistence_revision+1 WHERE id=$1",[id]).then(()=>acknowledged=true);
    await new Promise(resolve=>setTimeout(resolve,100));
    console.log('transition_before_write_commit='+acknowledged);
    await a.query('COMMIT');await pending;
    console.log('transition_after_write_commit='+acknowledged);
    if(!refused || first.rows[0].source_persistence_posture!=='unresolved'|| acknowledged!==true) process.exitCode=1;
  } finally {a.release();b.release();await pool.end();}
})().catch(e=>{console.error('TEST_ERROR',e.code||e.name);process.exitCode=1;});
