"""Fixed-target local doorway into offline-isolated speech engines."""
import http.server, urllib.request, urllib.error, threading, os
TARGETS={8080:os.environ['WHISPER_TARGET'],8880:os.environ['KOKORO_TARGET']}
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args,**kwargs): return None
opener=urllib.request.build_opener(NoRedirect)
class Handler(http.server.BaseHTTPRequestHandler):
 def log_message(self,*args): pass
 def handle_request(self):
  allowed={8080:{'/health','/v1/audio/transcriptions'},8880:{'/health','/v1/audio/speech'}}
  if self.path not in allowed[self.server.server_port]:self.send_error(404);return
  length=int(self.headers.get('Content-Length','0'))
  if length<0 or length>12*1024*1024:self.send_error(413);return
  body=self.rfile.read(length) if self.command=='POST' else None
  request=urllib.request.Request(TARGETS[self.server.server_port]+self.path,data=body,method=self.command,
   headers={'Content-Type':self.headers.get('Content-Type','application/json')})
  try:
   with opener.open(request,timeout=90) as response:
    data=response.read(20*1024*1024+1)
    if len(data)>20*1024*1024:raise ValueError('oversize response')
    self.send_response(response.status);self.send_header('Content-Type',response.headers.get('Content-Type','application/octet-stream'));self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data)
  except Exception:self.send_error(503,'Local speech engine unavailable')
 do_GET=handle_request
 do_POST=handle_request
for port in TARGETS:
 server=http.server.ThreadingHTTPServer(('0.0.0.0',port),Handler)
 threading.Thread(target=server.serve_forever,daemon=True).start()
threading.Event().wait()
