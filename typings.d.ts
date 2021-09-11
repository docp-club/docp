interface MarkedOption {
  breaks?: boolean;
  gfm?: boolean;
  renderer?: Record<string, unknown>;
}

interface IDocpConfig {
  rootDir: string;
  outDir: string;
  summary: string;
  port: number;
  showExecCode: boolean;
  marked: MarkedOption;
  virtualDir: string;
  plugins: DocpPlugin[];
  templatePath: string;
  template: string;
  file: string;
  filePath: string;
  fileDir: string;
  outputPath: string;
  configFile: string;
  configFilePath: string;
  hasConfigFile: boolean;
  theme: string;
  themeList: string[];
  // 几个hooks
  afterParsing: Function[];
  afterRendering: Function[];
  afterOutput: Function[];

  [propName: string]: any;
}

interface Executable {
  containerId: string;
  execType: string;
  codeString: string;
}

interface Code {
  infostring: string
  codeString: string
}

interface AnyObject {
  [key: string]: any;
}

interface DocpPlugin {
  type: string;
  module: Function;
  options: any;
}

interface DocpTemplate {
  path?: string,
  value?: string
}