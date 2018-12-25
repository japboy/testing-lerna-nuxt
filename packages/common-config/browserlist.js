/**
 * Browserslist 一休用 ターゲット・クエリ・プリセット
 *
 * @see https://www.ikyu.com/help/ex/security.htm
 * @see https://github.com/browserslist/browserslist#queries
 */
module.exports.targets = {
  /**
   * デスクトップ
   *
   * - Internet Explorer 11.x
   * - Microsoft Edge
   * - Google Chrome (最新版)
   * - Mozilla Firefox (最新版)
   * - Safari (最新版)
   *
   * ※「Internet Explorer」の後継ブラウザ「Microsoft Edge」がご利用になれる場合はこちらへの移行を推奨しております。
   */
  desktop: [
    'Chrome >= 70',
    'Edge >= 16',
    'Explorer >= 11',
    'Firefox >= 63',
    'Safari >= 11',
  ],
  /**
   * モバイル
   *
   * - iOS:9以降
   * - Android:5以降
   *
   * ※ Android をご利用の場合は「Google Chrome」をご利用ください。
   */
  mobile: [
    'ChromeAndroid >= 70',
    'FirefoxAndroid >= 63',
    'iOS >= 9',
  ],
};
