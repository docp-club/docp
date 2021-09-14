// fs-extra can`t fit memfs
import through2 from 'through2';
import fse from 'fs-extra';
import docpConfig from './docp-config';
import fs2 from './fs2';
import { PassThrough } from 'stream';
import { printLog } from './utils';
export = function (destPath: string): PassThrough {
  fs2.mkdirSync(destPath, { recursive: true });
  return through2.obj(function (file, enc, callback) {
    const htmlPath = destPath + '/' + file.stem + '.html';
    fs2.writeFileSync(htmlPath, file.doc);
    file.docPath = htmlPath;
    this.push(file)
    callback();
  }, function(callback) {
    fse.copySync(docpConfig.templatePath, destPath);
    printLog.success('website generated at: ' + destPath);
    callback()
  });
}