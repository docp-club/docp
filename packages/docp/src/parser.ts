/**
 * input markdown files
 * output
 *  1. has exec code, return code files as Vinyl
 *  2. has summary, return summary as DOM
 *  3. return html files as Vinyl which compiled from markdown
 */
import through2 from 'through2';
import Vinyl from 'vinyl';
import marked from 'marked';
import { printLog, parseInfoString, wrapCodeBlock } from './utils';
import { PassThrough } from 'stream';
import docpConfig from './docp-config';

export default function (): PassThrough {
  return through2.obj(async function (file: Vinyl, enc: string, callback: () => void) {
    printLog.success(`compiling ${file.path} `);

    if (file.stem === docpConfig.summary) {
      const result = marked(file.contents?.toString() || '', docpConfig.marked);
      const parseResult: ParseResult = { file, type: 'summary', value: result, args: { ...docpConfig.args } };
      this.push(parseResult);
      return callback();
    }

    const renderer = new marked.Renderer();
    // 所有代码块
    const codes: Code[] = [];
    // 可执行代码块
    const execCodes: Executable[] = [];
    const primaryRenderCode = renderer.code.bind(renderer);
    const newRenderCode = () => {
      let index = 0;
      return (codeString: string, infostring = 'markup', escaped: string): string => {
        index++;
        const { codeType, execType, showExecCode } = parseInfoString(infostring);
        // 渲染代码块
        let result = primaryRenderCode(codeString, codeType, escaped);
        // 添加line-numbers
        result = result.replace('<pre>', `<pre class="line-numbers language-${codeType}">`);
        const hasPlugin = docpConfig.plugins.find(plugin => plugin.type === execType) !== undefined;
        if (hasPlugin) {
          const containerId = file.stem + '_' + index;
          const container = `<div id="${containerId}"></div>`;
          // TODO docpConfig.showExecCode优先级
          result = wrapCodeBlock(container, result, showExecCode || docpConfig.showExecCode);
          const code: Executable = {
            containerId: containerId,
            execType: execType,
            codeString: codeString.replace(/\$CONTAINER_ID/g, `'${containerId}'`), // 替换占位符$CONTAINER_ID
          };
          execCodes.push(code);
        }
        codes.push({
          infostring: infostring,
          codeString: result
        });
        return result;
      };
    };
    renderer.code = newRenderCode();
    const options = Object.assign({}, docpConfig.marked, { renderer: renderer });
    const contents = file.contents?.toString() || '';
    const htmlString = marked(contents, options);
    const parseResult: ParseResult = { file, type: 'content', value: htmlString, codes, execCodes, args: { ...docpConfig.args } };
    this.push(parseResult);
    callback();
  });
}