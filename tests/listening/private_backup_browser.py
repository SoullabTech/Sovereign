"""LISTEN-05: real Chromium WebCrypto unit witness against transpiled production TS.
Uses localhost only; no member account, Next runtime, real keys or server storage.
"""
import asyncio, json, os, pathlib, subprocess, tempfile, functools, threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]

async def main():
    with tempfile.TemporaryDirectory(prefix='listen05-webcrypto-') as tmp:
        directory=pathlib.Path(tmp)
        node_script=r"""
          const ts=require('typescript');const fs=require('fs');const path=require('path');
          for(const base of ['portableCollections','privateBackup']){
            const source=fs.readFileSync(path.join(process.argv[1],'lib/listening',base+'.ts'),'utf8');
            let js=ts.transpileModule(source,{fileName:base+'.ts',compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
            js=js.replaceAll('./portableCollections.ts','./portableCollections.js');
            fs.writeFileSync(path.join(process.argv[2],base+'.js'),js);
          }
        """
        env={**os.environ, 'NODE_PATH':subprocess.check_output(['npm','root','-g'],text=True).strip()}
        subprocess.run(['node','-e',node_script,str(ROOT),str(directory)],env=env,check=True,timeout=15)
        (directory/'index.html').write_text('<!doctype html><meta charset="utf-8"><title>LISTEN05 local WebCrypto witness</title><script type="module">import * as b from "./privateBackup.js"; window.backupModule=b; document.body.dataset.ready="yes";</script>',encoding='utf-8')
        Handler=functools.partial(SimpleHTTPRequestHandler, directory=str(directory))
        server=ThreadingHTTPServer(('127.0.0.1',0),Handler)
        thread=threading.Thread(target=server.serve_forever, daemon=True);thread.start()
        try:
            async with async_playwright() as pw:
                browser=await pw.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
                page=await browser.new_page()
                requests=[]
                page.on('request', lambda r: requests.append(r.url))
                await page.goto(f'http://127.0.0.1:{server.server_port}/index.html')
                await page.wait_for_function('document.body.dataset.ready === "yes"',timeout=10000)
                result=await page.evaluate("""async () => {
                  const fixture=JSON.stringify({format:'SOULLAB_LISTEN_03_MEMBER_EXPORT',collections:[{id:'fake',name:'A Sound Journey',provider:null,link:null,tracks:[]}],journal:'A quiet listening reflection'});
                  const pass='long correct horse battery library example';
                  const sealed=await window.backupModule.encryptListeningExport(fixture,pass);
                  const r=await window.backupModule.decryptListeningExport(sealed,pass);
                  let rejectsWrong=false, rejectsTamper=false;
                  try{await window.backupModule.decryptListeningExport(sealed,'another safely long passphrase');}catch(e){rejectsWrong=true;}
                  const e=JSON.parse(sealed);e.ciphertext=e.ciphertext.slice(0,-4)+(e.ciphertext.endsWith('AAAA')?'BBBB':'AAAA');
                  try{await window.backupModule.decryptListeningExport(JSON.stringify(e),pass);}catch(x){rejectsTamper=true;}
                  return {secure:window.isSecureContext,crypto:!!crypto.subtle,restored:r.collections.length===1&&r.journal==='A quiet listening reflection',sealedHidden:!sealed.includes('A quiet listening reflection'),rejectsWrong,rejectsTamper};
                }""")
                external=[u for u in requests if not u.startswith(f'http://127.0.0.1:{server.server_port}/')]
                assert all(result.values()) and not external, (result,external)
                print(json.dumps({'engine':'Chromium','test':'source-derived browser WebCrypto',**result,'externalRequests':len(external),'result':'PASS'},indent=2))
                await browser.close()
        finally:
            server.shutdown();server.server_close();thread.join(timeout=3)

if __name__=='__main__':asyncio.run(main())
