// fs-extra can`t fit memfs
import fs2 from './fs2';
import through2 from 'through2';
import mustache from 'mustache';
import { PassThrough } from 'stream';
import docpConfig from './docp-config';

export = function (destPath: string): PassThrough {
  const list: ParseResult[] = [];
  let summary = '';
  return through2.obj(function (parseResult: ParseResult, enc, callback) {
    const { type, value } = parseResult;
    if (type === 'summary') {
      summary = value;
    } else {
      list.push(parseResult);
    }
    callback();
  }, function (callback) { // flush function
    const templateValue = docpConfig.template.value;
    fs2.mkdirSync(destPath, { recursive: true });
    for (let i = 0; i < list.length; i++) {
      const result = list[i];
      result.value = mustache.render(templateValue, { menu: summary, content: result.value, ...result.args });
      const htmlPath = destPath + '/' + result.file.stem + '.html';
      fs2.writeFileSync(htmlPath, result.value);
      this.push(result);
    }
    callback();
  });
}