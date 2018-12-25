/**
 * 環境変数デフォルト
 */

const path = require('path');

const NODE_ENV = process.env.NODE_ENV || 'development';

const rootDir = path.resolve(__dirname, '..', '..');

/** デバッグフラグ */
module.exports.debug = ['development', 'test'].includes(NODE_ENV);

/** 環境変数 */
module.exports.env = {
  ...process.env,

  NODE_ENV,
  APP_ENV: process.env.APP_ENV || 'development',
  HMR_PROXY_HOST: process.env.HMR_PROXY_HOST || null,
  VERSION_SHA1: process.env.VERSION_SHA1 || '0000000',
};

/** デフォルト・ビルドパス */
module.exports.defaultBuildPath = path.join(rootDir, 'static', 'assets', 'v2');

/** デフォルト URL パス */
module.exports.defaultPublicPath = '/assets/v2/';
