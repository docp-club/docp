import http from 'http';
import url from 'url';
import path from 'path';
import mime from 'mime';
import docpConfig from './docp-config';
import { printLog } from './utils';
import fs2 from './fs2';
import { Server } from 'ws';
export = function (): void {
  const injectHTML = Buffer.from(`<script>
    (function() {
      var protocol = location.protocol === 'http:' ? 'ws://' : 'wss://';
      var address = protocol + location.host;
      var socket = new WebSocket(address);
      var timer = setInterval(() => {
        socket.send(new Date())
      }, 2000)
      socket.onmessage = function(msg) {
        if (msg.data == 'reload') window.location.reload();
      };
      socket.onerror = function(err) {
        clearInterval(timer)
        console.log(err);
      }
      console.log('Live reload enabled.');
    })()
  </script>`);

  const server = http.createServer(function (req: AnyObject, res) {
    const urlObj: AnyObject = url.parse(req.url);
    const urlPathname = decodeURI(urlObj.pathname);
    // 判断路径是否有后缀, 有的话则说明客户端要请求的是一个文件
    const ext = path.parse(urlPathname).ext;
    const mimeType = mime.getType(ext);
    const htmlPath = docpConfig.virtualDir + urlPathname;
    // TODO 无法适配自定义模板
    const assetPath = path.resolve(__dirname, '../' + docpConfig.templatePath + '/assets') + urlPathname;
    const filePath = fs2.existsSync(htmlPath) ? htmlPath : assetPath;
    // 读取静态文件
    try {
      let data = fs2.readFileSync(filePath);
      if (ext === '.html') {
        data = Buffer.concat([data, injectHTML]);
      }
      res.writeHead(200, { 'Content-Type': mimeType, 'Cache-Control': 'max-age=86400', 'Content-Length': data.length });
      res.write(data);
    } catch (err: any) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.write('404 - NOT FOUND \n' + 'MSG: ' + err.message);
    } finally {
      setTimeout(() => {
        res.end();
      }, 1000);
    }
  });
  server.listen(Number(docpConfig.port), '127.0.0.1', function () {
    printLog.info('server start');
  });
  const wss = new Server({ server });
  // watch parse and reload
  wss.on('connection', (ws) => {
    fs2.on('change', () => {
      ws.send('reload');
    });
  });
  wss.on('error', (err) => {
    console.log(err);
  });
}