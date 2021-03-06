import { PassThrough } from 'stream';
import through2 from 'through2';
import docpConfig from './docp-config';

export = function (): PassThrough {
  return through2.obj(function (file, enc, callback) {
    if (file.extname !== '.md' || file.basename === docpConfig.summary) {
      return callback();
    }
    this.push(file)
    callback();
  });
}
