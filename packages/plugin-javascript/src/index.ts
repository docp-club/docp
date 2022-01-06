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
      const iframe = parse(`<iframe width="100%" height="100%" frameborder="0" srcdoc="${escapeValue}"></iframe>`);
      // fix node-html-parser 解析iframe丢失闭合标签
      // @ts-ignore: Unreachable code error
      iframe.childNodes[0]._rawText = iframe.childNodes[0]._rawText + '</iframe>'
      wrapper?.appendChild(iframe);
    });
    file.doc = document.outerHTML;
    this.push(file);
    callback();
  });
}