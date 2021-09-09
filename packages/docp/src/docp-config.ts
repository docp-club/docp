import path from 'path';
import fse from 'fs-extra';
import beautify from 'js-beautify';
import { obj2str } from 'obj2str';
import fs from 'fs';


class DocpConfig implements IDocpConfig {
  private _template: string | null = null
  // TODO 自定义parsers覆盖（而不是拼接）内置parser
  private _parsers: DocpParser = {
    beforeDest: [require('./parser/highlight-parser'), require('./parser/menu-parser')]
  }

  rootDir = ''
  outDir = 'docsite'
  // 命令行指定file
  file = ''
  theme = this.themeList[0]
  // 不要对外暴露，不可改
  summary = 'summary'
  port = 3000
  configFile = 'docp.config.js'
  args: IDocpArgs = {}
  showExecCode = false
  marked: MarkedOption = {
    breaks: true,
    gfm: true
  }
  virtualDir = '/memfs'

  // 可执行代码的编译模块
  plugins: DocpPlugin[] = []

  // 自定义解析模块
  set parsers(value: Function[] | DocpParser) {
    if (value.toString() === '[object Object]') {
      this._parsers = value as DocpParser
    } else {
      this._parsers.beforeDest = value as Function[]
    }
  }

  get parsers(): DocpParser {
    return this._parsers;
  }

  templatePath: string = ''

  get template(): string {
    if (!this._template) {
      this._template = fs.readFileSync(this.templatePath).toString()
    }
    return this._template
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
    return path.resolve(process.cwd(), this.configFile);
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

export = new DocpConfig();