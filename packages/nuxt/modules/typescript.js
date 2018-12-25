/* @see https://github.com/nuxt-community/typescript-template/blob/master/template/modules/typescript.js */

import path from 'path';

import {
  createTSUseEntries,
  createForkTsCheckerPlugin,
} from '@testing/common-config/webpack';

const configFile = path.resolve(__dirname, '..', '..', '..', 'tsconfig.json');
const reportFiles = [
  '**/*.{ts,tsx,vue}',
  '!**/*.stories.ts',
];

export default function typescript() {
  /* eslint-disable no-param-reassign, no-restricted-syntax */

  // Add .ts extension for store, middleware and more
  this.nuxt.options.extensions.push('ts');

  // Extend build
  this.extendBuild((config) => {
    const tsUseEntries = createTSUseEntries(configFile, reportFiles);

    // Add loaders
    config.module.rules.push({
      test: /((client|server)\.js)|(\.tsx?)$/,
      use: tsUseEntries,
      exclude: [
        /node_modules/,
        /vendor/,
        /\.nuxt/,
      ],
    });

    // IMPORTANT
    // @see https://github.com/nuxt-community/typescript-template/issues
    // @see https://github.com/Ataww/typescript-template/blob/master/template/modules/typescript.js
    for (let rule of config.module.rules) {
      if (rule.loader === "vue-loader") {
        // add this line
        rule.options.loaders = rule.options.loaders || {};
        rule.options.loaders.ts = tsUseEntries;
      }
    }

    // Add Fork TS Checker Webpack Plugin
    config.plugins = [
      ...config.plugins,
      createForkTsCheckerPlugin(configFile, reportFiles),
    ];

    // Add .ts extension in webpack resolve
    if (config.resolve.extensions.indexOf('.ts') === -1) {
      config.resolve.extensions.push('.ts');
    }
  });

  /* eslint-enable */
}
