// fs-extra can`t fit memfs
import fs2 from './fs2';
import through2 from 'through2';
import { PassThrough } from 'stream';
export = function (destPath: string): PassThrough {
  fs2.mkdirSync(destPath, { recursive: true });
  return through2.obj(function (file, enc, callback) {
    const htmlPath = destPath + '/' + file.stem + '.html';
    fs2.writeFileSync(htmlPath, file.doc);
    file.docPath = htmlPath;
    this.push(file)
    callback();
  });
}