const { defaultAlias } = require('./alias');

module.exports = {
  resolve: {
    // JS の import と CSS の @import で有効。CSS の url() では接頭辞に ~ を付けて使用。
    alias: defaultAlias,
    extensions: [
      '.js',
      '.ts', // TypeScript 拡張子を追加
    ],
  },
};
