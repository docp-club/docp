import through2 from 'through2';
import fs2 from 'docp/lib/fs2';
import docpConfig from 'docp/lib/docp-config';
import webpack from 'webpack';
import { ensureWebpackMemoryFs } from './utils';
import util from 'util';
import path from 'path';

const webpackConfig = require('../webpack.config')
const scripts = ['https://cdnjs.cloudflare.com/ajax/libs/react/17.0.0/umd/react.production.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/react-dom/17.0.0/umd/react-dom.production.min.js']

export default function (options) {
  return through2.obj(async function (parseResult, enc, callback) {
    const { file, execCodes = [], args = {} } = parseResult;
    const reactCodes = execCodes.filter(code => code.execType === 'react')
    if (execCodes.length === 0 || reactCodes.length === 0) {
      this.push(parseResult);
      return callback();
    }
    webpackConfig.entry = {};
    reactCodes.map(code => {
      const { containerId, codeString } = code;
      const filePath = path.resolve(docpConfig.virtualDir, containerId) + '.jsx'
      fs2.writeFileSync(filePath, codeString)
      webpackConfig.entry[file.stem + '|' + containerId] = filePath
    })
    const result = await build(webpackConfig)
    if (!Array.isArray(args.scripts)) {
      args.scripts = []
    }
    args.scripts.push(scripts.map(url => `<script src="${url}"></script>`).join('\n'))
    for (const i in result) {
      const output = fs2.readFileSync('/dist/' + result[i]).toString()
      args.scripts.push(`<script>${output}</script>`)
    }
    this.push(parseResult)
    callback()
  });
}

async function build(config) {
  // 判断entry是否为空
  if (Object.keys(config.entry).length === 0) {
    return [];
  }
  const ufs2 = ensureWebpackMemoryFs(fs2);
  const compiler = webpack(config);
  compiler.inputFileSystem = ufs2;
  compiler.outputFileSystem = ufs2;
  // run
  const run = util.promisify(compiler.run.bind(compiler));
  const stats = await run();
  const statsJSON = stats.toJson();
  if (statsJSON.errors.length > 0) {
    throw new Error(statsJSON.errors);
  }
  return statsJSON.assetsByChunkName;
}