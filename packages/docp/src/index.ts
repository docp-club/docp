import vfs from 'vinyl-fs';
import watch from 'node-watch';
import path from 'path';
import inquirer from 'inquirer';
import { PassThrough } from 'stream';
import fse from 'fs-extra';
import fs2 from './fs2';
import parsingSummary from './parsing-summary';
import parsing from './parsing';
import rendering from './rendering';
import output from './output';
import startServer from './server';
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
  newConfig.templatePath = path.resolve(__dirname, '../template/', theme);
  newConfig.rootDir = rootDir;
  newConfig.outDir = outDir;
  newConfig.outputConfigFile();
  printLog.success('init done!');
}

export function parse(inputPath: string, summaryPath?: string): PassThrough {
  const source = vfs.src(inputPath);
  let result = source.pipe(filters()).pipe(parsingSummary(summaryPath)).pipe(parsing());
  const { plugins, afterParsing, afterRendering } = docpConfig;
  plugins?.forEach(plugin => {
    const { module, options } = plugin;
    result = result.pipe(module(options));
  });
  afterParsing.forEach(item => {
    result = result.pipe(item());
  });
  result = result.pipe(rendering());
  afterRendering.forEach(item => {
    result = result.pipe(item());
  });
  return result;
}

export function serve(): void {
  // start server
  startServer();
  // first build
  const summaryPath = path.resolve('./', docpConfig.rootDir, docpConfig.summary)
  const summary = fse.pathExistsSync(summaryPath) ? summaryPath : undefined;
  parse(docpConfig.filePath, summary).pipe(output(docpConfig.virtualDir)).pipe(printURL());
  // watch
  watch(docpConfig.fileDir, (evt, path) => {
    if (path.split('.').pop() !== 'md') {
      return;
    }
    if (evt === 'remove') {
      printLog.warn(path + ' removed');
      return;
    }
    // summary????????????????????????
    path.indexOf(docpConfig.summary) > -1 ?
      parse(docpConfig.filePath, summary).pipe(output(docpConfig.virtualDir)) :
      parse(path).pipe(output(docpConfig.virtualDir));
  });
}

export function build(): PassThrough {
  const outputDir = path.resolve(docpConfig.outDir);
  if (fse.pathExistsSync(outputDir)) {
    fse.removeSync(outputDir);
  }
  const summaryPath = path.resolve('./', docpConfig.rootDir, docpConfig.summary)
  const summary = fse.pathExistsSync(summaryPath) ? summaryPath : undefined;
  let result = parse(docpConfig.filePath, summary).pipe(output(docpConfig.outputPath))
  docpConfig.afterDest?.forEach(item => {
    result = result.pipe(item());
  })
  return result;
}