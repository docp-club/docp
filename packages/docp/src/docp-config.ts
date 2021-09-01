import path from 'path';
import fse from 'fs-extra';
import beautify from 'js-beautify';
import { obj2str } from 'obj2str';
import fs from 'fs';

const configFileName = 'docp.config.js';

export class DocpConfig implements IDocpConfig {
  private _template: DocpTemplate | null = null

  rootDir = ''
  outDir = 'docsite'
  // 命令行指定file
  file = ''
  theme = this.themeList[0]
  // 不要对外暴露，不可改
  summary = 'summary'
  port = 3000
  configPath = ''
  args: IDocpArgs = {}
  showExecCode = false
  marked: MarkedOption = {
    breaks: true,
    gfm: true
  }
  virtualDir = '/memfs'

  // 可执行代码的编译模块
  plugins: DocpPlugin[] = []

  get template(): DocpTemplate {
    if (this._template) {
      return this._template;
    }
    const highlightParser = require('./parser/highlight-parser');
    const menuParser = require('./parser/menu-parser');
    const defaultPath = path.resolve(__dirname, '../template/' + this.theme + '/index.html');
    this._template = {
      path: defaultPath,
      value: fs.readFileSync(defaultPath).toString(),
      parsers: [menuParser, highlightParser]
    };
    return this._template;
  }

  set template(value: string | DocpTemplate) {
    if (typeof value === 'string') {
      this._template = {
        path: value,
        value: fs.readFileSync(value).toString(),
        parsers: []
      };
    } else if (value.toString() === '[object Object]') {
      const { path = '', parsers = [] } = value;
      this._template = {
        path: path,
        value: fs.readFileSync(path).toString(),
        parsers: parsers
      };
    }
  }
  get filePath(): string {
    if (this.file) {
      return path.resolve(process.cwd(), this.file);
    }
    if (this.rootDir?.endsWith('.md')) {
      return path.resolve(this.rootDir);
    }
    if (this.rootDir) {
      return path.resolve(this.rootDir, '*.md');
    }
    return path.resolve(process.cwd(), '*.md');
  }

  get fileDir(): string {
    if (this.file) {
      return path.resolve(process.cwd(), this.file);
    }
    if (this.rootDir) {
      return path.resolve(this.rootDir);
    }
    return process.cwd();
  }
  get outputPath(): string {
    return path.resolve(process.cwd(), this.outDir);
  }

  get configFileDir(): string {
    return path.resolve(process.cwd(), this.configPath, configFileName);
  }

  get hasConfigFile(): boolean {
    return fse.pathExistsSync(this.configFileDir);
  }

  get themeList(): string[] {
    // themes should end with '-theme'
    return fse.readdirSync(path.resolve(__dirname, '../template')).filter(item => item.endsWith('-theme'));
  }

  concatConfigs(newConfig: IDocpConfig): void {
    Object.keys(newConfig).forEach(key => {
      this[key] = newConfig[key];
    });
  }

  outputConfigFile(): void {
    // 自定义template会导致theme失效
    const result = `module.exports = {
        rootDir: '${this.rootDir}',
        outDir: '${this.outDir}',
        theme: '${this.theme}',
        plugins: {},
        args: ${obj2str(this.args)}
      }`;
    fse.outputFileSync(this.configFileDir, beautify.js(result, { 'indent_size': 2 }));
  }

}

export default new DocpConfig();