import http from 'node:http';

const HOST='127.0.0.1';
const PORT=3843;
const ENDPOINT_REF='aether-sandbox-health-01';

const server=http.createServer((req,res)=>{
  if(req.method==='HEAD'&&req.url==='/health'){
    res.statusCode=204;
    res.setHeader('X-Aether-Endpoint-Ref',ENDPOINT_REF);
    res.setHeader('X-Aether-Environment','sandbox');
    res.setHeader('Content-Length','0');
    res.end();
    return;
  }

  res.statusCode=404;
  res.setHeader('Content-Length','0');
  res.end();
});

server.listen(PORT,HOST,()=>{
  process.stdout.write(JSON.stringify({
    endpointRef:ENDPOINT_REF,
    host:HOST,
    port:PORT,
    datastore:false,
    memberRoutes:false,
    recordSurface:false,
    healthMethod:'HEAD',
    healthPath:'/health',
  })+'\n');
});
