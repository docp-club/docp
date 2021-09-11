import path from 'path';
import fse from 'fs-extra';
import beautify from 'js-beautify';
import fs from 'fs';


class DocpConfig implements IDocpConfig {
  private _template: string | null = null

  rootDir = ''
  outDir = 'docsite'
  // 命令行指定file
  file = ''
  theme = this.themeList[0]
  // 不要对外暴露，不可改
  summary = 'summary.md'
  port = 3000
  configFile = 'docp.config.js'
  showExecCode = false
  marked: MarkedOption = {
    breaks: true,
    gfm: true
  }
  virtualDir = '/memfs'

  // 可执行代码的编译模块
  plugins: DocpPlugin[] = []

  templatePath: string = ''

  get template(): string {
    if (!this._template) {
      const tplFile = path.resolve(this.templatePath, 'index.html');
      this._template = fs.readFileSync(tplFile).toString()
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

  get configFilePath(): string {
    return path.resolve(process.cwd(), this.configFile);
  }

  get hasConfigFile(): boolean {
    return fse.pathExistsSync(this.configFilePath);
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
        templatePath: '${this.templatePath}',
        plugins: {}
      }`;
    fse.outputFileSync(this.configFilePath, beautify.js(result, { 'indent_size': 2 }));
  }

  // TODO 自定义会覆盖
  afterParsing: Function[] = [require('./parser/highlight-parser')]

  afterRendering: Function[] = []

  afterOutput: Function[] = []

}

export = new DocpConfig();