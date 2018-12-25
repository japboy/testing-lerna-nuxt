const resolver = require('postcss-import-resolver');

const { defaultAlias } = require('./alias');
const { defaultBuildPath } = require('./defaults');

/**
 * postcss-import プラグイン
 * @see https://github.com/postcss/postcss-import
 */
module.exports.createPostCSSImportPlugin = (alias = defaultAlias) => ({
  resolve: resolver({
    alias,
  }),
});

/**
 * postcss-preset-env プラグイン
 * @see https://github.com/csstools/postcss-preset-env
 */
module.exports.createPostCSSPresetEnvPlugin = (browserslist = 'last 1 version') => ({
  // @see https://cssdb.org/
  stage: 0,
  // @see https://github.com/browserslist/browserslist#queries
  browsers: browserslist,
  features: {
    // color-mod() 関数は現状 cssdb に掲載が無いので明示的に features として追加が必要
    'color-mod-function': {},
  },
  autoprefixer: { grid: true },
  // custom-media-queries/custom-properties の preserve オプションはココで指定
  // @see https://github.com/csstools/postcss-preset-env#preserve
  preserve: false,
});

/**
 * cssnano プラグイン
 * @see http://cssnano.co/guides/optimisations/
 */
module.exports.createCSSNano = () => ({
  preset: [
    'advanced',
    {
      // @see https://github.com/ben-eb/postcss-discard-unused#fontface
      discardUnused: {
        fontFace: false, // ikyu.css の @font-face がストリップされるので無効化
      },
      normalizeUrl: false, // Akamai Image Converter 系の絶対パス URL で問題が出るので false
      // カルーセル vue コンポーネントで z-index を最適化されると表示が乱れるので無効化
      // @see https://github.com/ben-eb/gulp-cssnano/issues/14
      zindex: false,
    },
  ],
});
