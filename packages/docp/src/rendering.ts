// fs-extra can`t fit memfs
import through2 from 'through2';
import mustache from 'mustache';
import { PassThrough } from 'stream';

export = function (): PassThrough {
  return through2.obj(function (file, enc, callback) {
    const { docpConfig } = file
    const templateValue = docpConfig.template;
    file.doc = mustache.render(templateValue, { menu: file.summary, content: file.doc, ...docpConfig });
    if (file.basename === '26.md') {
      debugger
    }
    this.push(file)
    callback();
  });
}