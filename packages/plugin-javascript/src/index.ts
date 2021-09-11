import through2 from 'through2';
import { parse } from 'node-html-parser';
import { escapeEntity } from './utils';

export = function (options) {
  return through2.obj(function (file, enc, callback) {
    const { doc, execCodes = [] } = file;
    if (execCodes.length === 0) {
      this.push(file);
      return callback();
    }
    const document = parse(doc);
    execCodes.filter((code: Executable) => code.execType === 'javascript').forEach(code => {
      const wrapper = document.querySelector('#' + code.containerId);
      const escapeValue = escapeEntity(code.codeString);
      // TODO resizeIframe not defined
      const iframe = parse(`<iframe frameborder="0" onload="resizeIframe(this)" srcdoc="${escapeValue}"></iframe>`);
      wrapper.appendChild(iframe);
    });
    file.doc = document.outerHTML;
    this.push(file);
    callback();
  });
}