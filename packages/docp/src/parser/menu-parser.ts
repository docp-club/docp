/**
 * input markdown files
 * output
 *  1. has exec code, return code files as Vinyl
 *  2. has summary, return summary as DOM
 *  3. return html files as Vinyl which compiled from markdown
 */
import through2 from 'through2';
import { parse, HTMLElement } from 'node-html-parser';
import { PassThrough } from 'stream';

export = function (docpConfig): PassThrough {
  return through2.obj(function (parseResult: ParseResult, enc, callback) {
    const { file, type, value } = parseResult;
    if (type !== 'summary') {
      this.push(parseResult);
      return callback();
    }
    const templateDOM = parse(value);
    const summary: HTMLElement = templateDOM.querySelector('ul');
    if (!summary) {
      return callback();
    }

    const traverseMenuList = (root: HTMLElement, deep = 0) => {
      if (root.nodeType !== 1) {
        return;
      }
      if (root.tagName.toLowerCase() === 'ul') {
        deep++;
      } else if (root.tagName.toLowerCase() === 'a') {
        root.classList.add('deep-' + deep);
        // 替换href中连接后缀
        const newHref = root.getAttribute('href')?.replace('.md', '.html');
        if (newHref) {
          root.setAttribute('href', newHref);
        }
      }
      for (let i = 0; i < root.childNodes.length; i++) {
        traverseMenuList(root.childNodes[i] as HTMLElement, deep);
      }
    };

    traverseMenuList(summary);
    const newResult = { file, type: 'summary', value: summary.outerHTML };
    this.push(newResult);
    callback();
  });
}