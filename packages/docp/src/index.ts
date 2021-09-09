import vfs from 'vinyl-fs';
import watch from 'node-watch';
import path from 'path';
import inquirer from 'inquirer';
import { PassThrough } from 'stream';
import fse from 'fs-extra';
import fs2 from './fs2';
import parser from './parser';
import startServer from './server';
import dest from './dest';
import docpConfig from './docp-config';
import { inputOverride, inputRootDir, inputOutDir, selectTheme } from './prompt-action';
import { printLog } from './utils';
import filters from './filters';
import printURL from './print-URL';

// create virtual dir
fs2.mkdirSync(docpConfig.virtualDir);

export async function init(): Promise<void> {
  const newConfig = docpConfig;
  if (docpConfig.hasConfigFile) {
    const { override } = await inquirer.prompt([inputOverride]);
    if (override === false) {
      return;
    }
  }
  const { theme } = await inquirer.prompt([selectTheme]);
  const { rootDir, outDir } = await inquirer.prompt([inputRootDir, inputOutDir]);
  newConfig.templatePath = path.resolve(__dirname, '../template/', theme, 'index.html');
  newConfig.rootDir = rootDir;
  newConfig.outDir = outDir;
  newConfig.outputConfigFile();
  printLog.success('init done!');
}

export function parse(input: string, output: string): PassThrough {
  const source = vfs.src(input);
  let result = source.pipe(filters()).pipe(parser());
  const plugins = docpConfig.plugins;
  const { beforeDest, afterDest } = docpConfig.parsers;
  plugins?.forEach(plugin => {
    const { module, options } = plugin;
    result = result.pipe(module(docpConfig, options));
  });
  beforeDest?.forEach(item => {
    result = result.pipe(item(docpConfig));
  });
  result.pipe(dest(output));
  afterDest?.forEach(item => {
    result = result.pipe(item(docpConfig));
  })
  return result;
}

export function serve(): void {
  // start server
  startServer();
  // first build
  parse(docpConfig.filePath, docpConfig.virtualDir).pipe(printURL());
  // watch
  watch(docpConfig.fileDir, (evt, path) => {
    if (path.split('.').pop() !== 'md') {
      return;
    }
    if (evt === 'remove') {
      printLog.warn(path + ' removed');
      return;
    }
    // summary变更触发全量更新
    path.indexOf(docpConfig.summary) > -1 ?
      parse(docpConfig.filePath, docpConfig.virtualDir) :
      parse(path, docpConfig.virtualDir);
  });
}

export function build(finishHandler?: () => void): PassThrough {
  const outputDir = path.resolve(docpConfig.outDir);
  if (fse.pathExistsSync(outputDir)) {
    fse.removeSync(outputDir);
  }
  return parse(docpConfig.filePath, docpConfig.outputPath).on('finish', () => {
    // TODO 输出逻辑无法适配自定义theme
    fse.copySync(path.resolve(__dirname, '../' + docpConfig.templatePath + '/assets'), outputDir + '/assets');
    printLog.success('website generated at: ' + outputDir);
    if (typeof finishHandler === 'function') {
      finishHandler();
    }
  });
}