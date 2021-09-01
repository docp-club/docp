import colors from 'colors';
import docpConfig from './docp-config';

export const inputRootDir = {
  type: 'input',
  name: 'rootDir',
  message: colors.white('root directory of input files:'),
  default: './'
};

export const inputOutDir = {
  type: 'input',
  name: 'outDir',
  message: colors.white('directory for output files:'),
  default: './docsite'
};

export const inputOverride = {
  type: 'confirm',
  name: 'override',
  message: colors.white('docp.config.js already exists, overwrite?'),
  default: 'N'
};

export const selectTheme = {
  type: 'list',
  name: 'theme',
  message: colors.white('Choose a theme'),
  choices: docpConfig.themeList
};
