const path = require('path');

const rootDir = __dirname;
const ancientRootDir = path.resolve(rootDir, '..', '..');

/**
 * デフォルト・エイリアス
 */
module.exports.defaultAlias = {
  // TODO: 消したい。@src は restaurant1 との後方互換のため @frontend のエイリアス。
  '@src': path.join(ancientRootDir, 'packages', 'webpages'),
  // TODO: 消したい。lerna 導入後は消極的利用に留める。
  '@frontend': path.join(ancientRootDir, 'packages', 'webpages'),
  // TODO: 消したい。使ってないし使わない方が良さそうなので消す。
  '@rsImg': path.join(ancientRootDir, 'static', 'rsImg'),

  '@common-components': path.join(ancientRootDir, 'packages', 'common-components'),
};

/**
 * エイリアスの生成
 *
 * - `~`, `@` はパッケージごとのソースコードディレクトリのルートを指したいのでそれを可能にする関数
 * - Nuxt.js では予約済みエイリアスなのでこの関数は使わない
 */
module.exports.createAlias = (srcDir) => {
  'use strict';

  return {
    ...module.exports.defaultAlias,
    '~': srcDir,
    '@': srcDir,
  };
};
