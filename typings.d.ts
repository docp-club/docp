interface MarkedOption {
  breaks?: boolean;
  gfm?: boolean;
  renderer?: Record<string, unknown>;
}

interface IDocpConfig {
  src?: string;
  dest?: string;
  args?: IDocpArgs;
}

interface ParseResult {
  file: Vinyl,
  type: string,
  value: string,
  codes?: Code[],
  execCodes?: Executable[],
  args?: AnyObject
}

declare type IDocpArgs = Record<string, string>;

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
  module: any;
  options: any;
}

interface DocpTemplate {
  path?: string,
  value?: string,
  parsers?: any[]
}