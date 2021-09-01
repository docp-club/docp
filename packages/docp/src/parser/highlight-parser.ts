import through2 from 'through2';
import { PassThrough } from 'stream';

export default function (): PassThrough {
  return through2.obj(function (parseResult: ParseResult, enc, callback) {
    const { codes = [], type, args = {} } = parseResult;
    if (type !== 'content') {
      this.push(parseResult);
      return callback();
    }
    const getHighlightComponentByType = (type: string) => {
      //按需插入prim高亮组件
      const types = ['bash', 'c', 'cpp', 'csharp', 'dart', 'diff', 'docker',
        'git', 'go', 'graphql', 'java', 'json', 'jsx', 'kotlin', 'markdown',
        'nginx', 'objectivec', 'php', 'powershell', 'python', 'ruby', 'sql',
        'swift', 'typescript', 'wasm'];
      const lowerType = type.toLowerCase();
      if (lowerType === 'shell') {
        return `<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/components/prism-bash.min.js"></script>`;
      }
      if (types.indexOf(lowerType) > -1) {
        return `<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/components/prism-${lowerType}.min.js"></script>`;
      }
      return null;
    };
    if (!args.scripts) {
      args.scripts = [];
    }
    codes.forEach(code => {
      const highlight = getHighlightComponentByType(code.infostring);
      if (highlight && args.scripts.indexOf(highlight) === -1) {
        args.scripts.push(highlight);
      }
    });
    this.push(parseResult);
    callback();
  });
}