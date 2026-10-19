'use strict';
// Read only the active owner's selected conversation, newest bounded window first.
function recentConversationTurns(db, owner, session) {
 return db.prepare('SELECT id,role,content FROM conversation_turns WHERE user_id=? AND session_id=? ORDER BY created_at DESC,rowid DESC LIMIT 500')
  .all(owner,session).reverse();
}
function modelConversationContext(turns) {
 return turns.slice(-12).map(t=>({role:t.role,content:t.content.slice(0,4000)}));
}
module.exports={recentConversationTurns,modelConversationContext};
