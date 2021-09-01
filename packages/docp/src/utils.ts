import colors from 'colors';

export const printLog = {
  info: (msg: string): void => {
    const color = colors.cyan;
    const tag = '[info]';
    console.log(tag, color(msg));
  },
  success: (msg: string): void => {
    const color = colors.green;
    const tag = '[success]';
    console.log(tag, color(msg));
  },
  warn: (msg: string): void => {
    const color = colors.yellow;
    const tag = '[warinig]';
    console.log(tag, color(msg));
  },
  error: (msg: string): void => {
    const color = colors.red;
    const tag = '[error]';
    console.log(tag, color(msg));
  }
};

export const parseInfoString = (infostring: string) => {
  const args = infostring.split('--');
  let codeType = '';
  let execType = '';
  let showExecCode = false;
  args.forEach((item, index) => {
    if (index === 0) {
      codeType = item.toLowerCase().trim();
      return;
    }
    // 可执行
    if (item.startsWith('exec')) {
      execType = (item.split('=')[1] || 'javascript').trim();
      return;
    }
    // 可展示代码块
    if (item.startsWith('show')) {
      showExecCode = item.split('=')[1] === 'false' ? false : true;
      return;
    }
  });
  return {
    codeType,
    execType,
    showExecCode
  };
};

export const wrapCodeBlock = (execBlock, codeBlock, showExecCode): string => {
  let result = `<div class="docp-block">
    <div class="docp-exec-block">${execBlock}</div>
      {{codeBlock}}
    </div>
  `;
  const codeBlockString = showExecCode ? `<div class="docp-code-block">${codeBlock}</div>` : '';
  result = result.replace('{{codeBlock}}', codeBlockString);
  return result;
};