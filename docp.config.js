const ReactPlugin = require('./packages/plugin-react/lib/index');
const JavascriptPlugin = require('./packages/plugin-javascript/lib/index');

module.exports = {
  rootDir: './docs/zh-cn',
  outDir: './docsite',
  plugins: [{
    type: 'react',
    module: ReactPlugin,
    options: {}
  }, {
    type: 'javascript',
    module: JavascriptPlugin
  }],
  templatePath: '/Users/haibo/github/docp2/packages/docp/template/typora-theme',
  plugins: [],
  header: {
    logo: 'data:image/png;base64,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',
    navigation: [{
      value: 'Github',
      target: '_blank',
      href: 'https://github.com/Cicel/docp'
    }]
  }
}