import fs from 'fs';
import gracefulFs from 'graceful-fs';
import { ufs } from 'unionfs';
import { vol } from 'memfs';
import { EventEmitter } from 'events';

ufs.use(vol as any).use({ ...fs });

const event = new EventEmitter();

const fs2 = gracefulFs.gracefulify(ufs);

const primaryWriteFileSync = fs2.writeFileSync;

fs2.writeFileSync = function (file, ...args) {
  primaryWriteFileSync(file, ...args);
  event.emit('change', file);
};

// alias
fs2.on = event.on.bind(event);

export = fs2;