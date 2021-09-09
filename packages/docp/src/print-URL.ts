import through2 from 'through2';
import { printLog } from './utils';
import docpConfig from './docp-config';
import { PassThrough } from 'stream';

export = function (): PassThrough {
  return through2.obj(function (page, enc, callback) {
    printLog.info('page at http://127.0.0.1:' + docpConfig.port + '/' + page.file.stem + '.html');
    callback();
  });
}