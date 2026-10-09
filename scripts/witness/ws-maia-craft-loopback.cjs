/**
 * Controlled Anthropic-wire stand-in for direct-Craft UI verification.
 * Fixed replies are not MAIA cognition. Refuses non-loopback service.
 */
const { createServer } = require('node:http');
const fs = require('node:fs');
const PORT = 38192;
const logFile = '/tmp/ws-maia-craft-model-stub-20261009.jsonl';
let hits = 0;
createServer((req,res)=>{
  if (req.method !== 'POST' || !/^\/v1\/messages(?:\?|$)/.test(req.url || '')) {
    res.writeHead(404); res.end(); return;
  }
  let raw = '';
  req.on('data',b=>raw+=b);
  req.on('end',()=>{
    let body;
    try { body=JSON.parse(raw); } catch { res.writeHead(400);res.end();return; }
    hits++;
    const txt=JSON.stringify(body.messages||[]);
    // Only an explicit writer proposal act earns proposal-shaped test output.
    // The system prompt mentions proposals even for a reply-only commission.
    const suggest=/Show one small, useful edit to this exact focused passage/i.test(txt);
    const answer=suggest?{
      kind:'reply_with_proposal',
      reply:'I would keep the image and make the cadence a little quieter. This is only a proposal for your consideration.',
      proposal:{replacementText:'The lantern glowed quietly.',rationale:'Editorial purpose: a quieter cadence without changing the image.'}
    }:{
      kind:'reply_only',
      reply:'The lantern gives the paragraph a gentle point of attention. What do you want the reader to notice first?'
    };
    fs.appendFileSync(logFile,JSON.stringify({hit:hits,suggest,model:body.model,tool:body.tools?.[0]?.name||null})+'\n');
    const payload={
      id:'msg_ws_direct_craft_'+hits,type:'message',role:'assistant',
      model:body.model||'claude-sonnet-4',content:[{
        type:'tool_use',id:'toolu_ws_direct_craft_'+hits,
        name:body.tools?.[0]?.name||'editorial_outcome',input:answer
      }],stop_reason:'tool_use',usage:{input_tokens:10,output_tokens:20}
    };
    res.writeHead(200,{'content-type':'application/json'});res.end(JSON.stringify(payload));
  });
}).listen(PORT,'127.0.0.1',()=>console.log('CONTROLLED_MODEL_STUB_READY on 127.0.0.1:'+PORT));
