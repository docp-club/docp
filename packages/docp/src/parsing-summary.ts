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
import fse from 'fs-extra';
import { parse, HTMLElement } from 'node-html-parser';
import { PassThrough } from 'stream';
import docpConfig from './docp-config';

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

// watch 模式下缓存summary数据
let summary = ''
export = function (summaryPath: string | undefined): PassThrough {
  if (summaryPath) {
    try {
      const file = fse.readFileSync(summaryPath).toString()
      const markedString = marked(file || '', docpConfig.marked);
      const templateDOM = parse(markedString);
      const summaryDOM: HTMLElement = templateDOM.querySelector('ul');
      if (summaryDOM) {
        traverseMenuList(summaryDOM);
      }
      summary = summaryDOM.outerHTML
    } catch(err) {
      // TODO 隐藏
      // file nor exist
      throw err
    }
  }
  return through2.obj(function (file: Vinyl, enc: string, callback) {
    file.summary = summary
    this.push(file)
    callback()
  });
}