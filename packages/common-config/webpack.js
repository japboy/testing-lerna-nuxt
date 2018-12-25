const os = require('os');
const path = require('path');

const webpack = require('webpack');

const AssetsPlugin = require('assets-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const { defaultAlias } = require('./alias');
const {
  debug,
  env,
  defaultBuildPath,
  defaultPublicPath,
} = require('./defaults');

const rootDir = path.resolve(__dirname, '..', '..');

const now = (new Date()).toISOString();

const defaultTsconfig = path.join(rootDir, 'tsconfig.json');
const defaultReportFiles = ['**/*.{ts,tsx}'];

// FIXME: 以下エラーが解消できないので TS6200 を一時的に無視対象のエラーに設定する
// ERROR in /.../node_modules/date-fns/typings.d.ts(1,1):
// TS6200: Definitions of the following identifiers conflict with those in another file: addDays, addHours, addISOYears,...
const hotfixTypechecks = [6200];

/**
 * webpack ログ詳細度の設定値
 * @see https://webpack.js.org/configuration/stats/
 */
const webpackProductionStats = 'normal';
const webpackDevelopmentStats = {
  cached: false,
  cachedAssets: false,
  children: false,
  chunks: false,
  chunkModules: false,
  colors: true,
  modules: false,
};

/**
 * webpack デフォルト構成
 * @see https://webpack.js.org/configuration/
 */
module.exports.defaultConfiguration = {
  // @see https://webpack.js.org/concepts/mode/
  mode: env.NODE_ENV,
  // @see https://webpack.js.org/configuration/entry-context/
  entry: {},
  // @see https://webpack.js.org/configuration/output/
  output: {},
  // @see https://webpack.js.org/configuration/module/
  module: {},
  // @see https://webpack.js.org/configuration/resolve/
  resolve: {
    alias: defaultAlias,
    extensions: [
      '.js',
      '.ts',
    ],
  },
  // @see https://webpack.js.org/configuration/optimization/
  optimization: {},
  // @see https://webpack.js.org/configuration/plugins/
  plugins: [],
  // @see https://webpack.js.org/configuration/dev-server/
  devServer: {
    clientLogLevel: 'info',
    compress: true,
    headers: {
      'X-Webpack-Dev-Server': `${os.hostname()} ${os.type()} ${os.arch()}`,
    },
    historyApiFallback: false,
    host: '0.0.0.0',
    hot: true,
    https: true,
    port: 9405,
    proxy: {
      '/': {
        // python は docker-compose.yml に指定のあるコンテナ名
        target: env.HMR_PROXY_HOST ? `https://${env.HMR_PROXY_HOST}:5443` : 'https://python:5443',
        secure: false,
      },
    },
  },
  // @see https://webpack.js.org/configuration/devtool/
  devtool: 'source-map',
  // @see https://webpack.js.org/configuration/target/
  target: 'web',
  // @see https://webpack.js.org/configuration/watch/
  watch: false,
  watchOptions: {
    poll: 1000,
    ignored: /node_modules|venv/,
  },
  // @see https://webpack.js.org/configuration/externals/
  externals: {},
  // @see https://webpack.js.org/configuration/performance/
  performance: {
    hints: env.NODE_ENV === 'production' ? 'warning' : false,
  },
  // @see https://webpack.js.org/configuration/stats/
  stats: env.NODE_ENV === 'production' ? webpackProductionStats : webpackDevelopmentStats,
  // @see https://webpack.js.org/configuration/other-options/
  bail: false,
  cache: debug,
};


// webpack 共通ルール ▽▽▽
// @see https://webpack.js.org/configuration/module/#rule

/**
 * CSS ユースエントリー
 * @see https://github.com/webpack-contrib/style-loader
 * @see https://github.com/webpack-contrib/css-loader
 * @see https://github.com/postcss/postcss-loader
 */
module.exports.createCSSUseEntries = configPath => ([
  {
    loader: 'css-loader',
    options: {
      importLoaders: 1,
    },
  },
  {
    loader: 'postcss-loader',
    options: {
      config: {
        path: configPath,
      },
    },
  },
]);

/**
 * JavaScript ユースエントリー
 * @see https://github.com/babel/babel-loader
 */
module.exports.createJSUseEntries = () => ([
  {
    loader: 'babel-loader',
    options: {
      // cache-loader より高速
      // @see https://github.com/babel/babel-loader/issues/525#issuecomment-375756108
      cacheDirectory: true,
    },
  },
]);

/**
 * TypeScript ユースエントリー
 * @see https://github.com/TypeStrong/ts-loader
 */
module.exports.createTSUseEntries = (configFile = defaultTsconfig, reportFiles = defaultReportFiles, context = rootDir) => ([
  {
    loader: 'babel-loader',
    options: {
      // cache-loader より高速
      // @see https://github.com/babel/babel-loader/issues/525#issuecomment-375756108
      cacheDirectory: true,
    },
  },
  {
    loader: 'ts-loader',
    options: {
      configFile,
      reportFiles,
      context,
      transpileOnly: true,
      ignoreDiagnostics: hotfixTypechecks,
      appendTsSuffixTo: [/\.vue$/],
    },
  },
]);

/**
 * url-loader 用 test ヘルパー
 * Windows と NIX 系のパスマッチが異なるので、それの対応用。
 */
module.exports.createURLTest = (prefix) => {
  'use strict';

  const osType = os.type();
  const suffix = '.(cur|eot|gif|jpg|png|svg|ttf|woff2?)$';
  let pattern = suffix;

  if (prefix) {
    if (osType === 'Linux' || osType === 'Darwin') {
      pattern = `${prefix}\\/.+\\/.+\\${suffix}`;
    } else {
      pattern = `${prefix}\\\\.+\\\\.+\\${suffix}`;
    }
  }

  return new RegExp(pattern);
};

/**
 * URL ユースエントリーの生成
 * @see https://github.com/webpack-contrib/url-loader
 * @see https://github.com/webpack-contrib/file-loader
 */
module.exports.createURLUseEntry = (context = '', outputPath = '', publicPath = defaultPublicPath) => ({
  loader: 'url-loader',
  options: {
    // url-loader options
    limit: 8192,
    // file-loader options
    name: env.NODE_ENV === 'production'
      ? '[path][name]-[sha1:hash:hex:7].[ext]'
      : '[path][name].[ext]',
    context,
    outputPath,
    publicPath,
    emitFile: true,
  },
});


// webpack 共通プラグイン定義 ▽▽▽
// @see https://webpack.js.org/configuration/plugins/

/**
 * 環境変数埋め込み webpack プラグイン
 * @see https://webpack.js.org/plugins/environment-plugin/
 */
module.exports.createEnvironmentPlugin = () => new webpack.EnvironmentPlugin({
  APP_ENV: env.APP_ENV,
  APP_VERSION: env.VERSION_SHA1.slice(0, 7),
  NODE_ENV: env.NODE_ENV,
});

/**
 * モジュール ID ハッシュ化 (本番用) webpack プラグイン
 * @see https://webpack.js.org/plugins/hashed-module-ids-plugin/
 */
module.exports.createHashedModuleIdsPlugin = () => new webpack.HashedModuleIdsPlugin();

/**
 * Hot Module Replacement (開発用) webpack プラグイン
 * @type {webpack.HotModuleReplacementPlugin}
 * @see https://webpack.js.org/plugins/hot-module-replacement-plugin/
 */
module.exports.createHotModuleReplacementPlugin = () => new webpack.HotModuleReplacementPlugin();

/**
 * アセット manifest.json 生成プラグイン定義
 * @see https://github.com/kossnocorp/assets-webpack-plugin
 */
module.exports.createAssetManifestPlugin = (destination = defaultBuildPath, update = true) => new AssetsPlugin({
  filename: 'manifest.json',
  fullPath: true,
  path: destination,
  update,
});

/**
 * コードベースのバンドル内訳解析 (開発用) webpack プラグイン
 * @see https://github.com/th0r/webpack-bundle-analyzer
 */
module.exports.createBundleAnalyzerPlugin = () => new BundleAnalyzerPlugin({
  analyzerMode: 'static',
  reportFilename: `bundle-analyzer-report-${now}.html`,
  generateStatsFile: true,
  statsFilename: `bundle-analyzer-stats-${now}.json`,
});

/**
 * TypeScript Type check/Lint 平行処理 webpack プラグイン
 * @see https://github.com/Realytics/fork-ts-checker-webpack-plugin
 */
module.exports.createForkTsCheckerPlugin = (tsconfig = defaultTsconfig, reportFiles = defaultReportFiles) => new ForkTsCheckerWebpackPlugin({
  tsconfig,
  reportFiles,
  tslint: false, // TSLint は削除したので無効化
  ignoreDiagnostics: hotfixTypechecks,
  workers: ForkTsCheckerWebpackPlugin.TWO_CPUS_FREE,
  vue: true,
});

/**
 * CSS を JS コードベースから分離する webpack プラグイン
 * @see https://github.com/webpack-contrib/mini-css-extract-plugin
 */
const defaultCSSFilename = env.NODE_ENV === 'production' ? '[name]-[contenthash:7].css' : '[name].css';
module.exports.createMiniCssExtractPluginLoader = () => MiniCssExtractPlugin.loader;
module.exports.createMiniCssExtractPlugin = (filename = defaultCSSFilename) => new MiniCssExtractPlugin({
  filename,
});

/**
 * JS コードベースの難読化/圧縮 webpack プラグイン
 * @see https://webpack.js.org/plugins/uglifyjs-webpack-plugin/
 */
module.exports.createUglifyJSPlugin = () => new UglifyJSPlugin({
  parallel: true,
  sourceMap: true,
  uglifyOptions: {
    comments: false,
    // ascii_onlyを設定しないとwebfontのJSに埋め込まれたunicodeのエスケープ(i.e.'\ue60d')を壊すのでそれを回避する
    // @see https://github.com/mishoo/UglifyJS2#output-options
    output: {
      ascii_only: true,
    },
  },
});
