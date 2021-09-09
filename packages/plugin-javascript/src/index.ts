import through2 from 'through2';
import { parse } from 'node-html-parser';
import { escapeEntity } from './utils';

export = function (docpConfig, options) {
  return through2.obj(function (parseResult: ParseResult, enc, callback) {
    const { value, execCodes = [] } = parseResult;
    if (execCodes.length === 0) {
      this.push(parseResult);
      return callback();
    }
    const document = parse(value);
    execCodes.filter((code: Executable) => code.execType === 'javascript').forEach(code => {
      const wrapper = document.querySelector('#' + code.containerId);
      const escapeValue = escapeEntity(code.codeString);
      // TODO resizeIframe not defined
      const iframe = parse(`<iframe frameborder="0" onload="resizeIframe(this)" srcdoc="${escapeValue}"></iframe>`);
      wrapper.appendChild(iframe);
    });
    const newValue = document.outerHTML;
    const newParseResult: ParseResult = { ...parseResult, type: 'content', value: newValue };
    this.push(newParseResult);
    callback();
  });
}