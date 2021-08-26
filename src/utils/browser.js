/* eslint-disable no-useless-escape */
/* eslint-disable no-irregular-whitespace */
// eslint-disable-next-line import/no-mutable-exports
let agent = navigator.userAgent.toLowerCase(),
    opera = window.opera,
    browser = {
    /**
     * @property {boolean} ie æ£æµå½åæµè§å¨æ¯å¦ä¸ºIE
     * @example
     * ```javascript
     * if ( UE.browser.ie ) {
     *     console.log( 'å½åæµè§å¨æ¯IE' );
     * }
     * ```
     */
        ie: /(msie\s|trident.*rv:)([\w.]+)/i.test(agent),

        /**
     * @property {boolean} opera æ£æµå½åæµè§å¨æ¯å¦ä¸ºOpera
     * @example
     * ```javascript
     * if ( UE.browser.opera ) {
     *     console.log( 'å½åæµè§å¨æ¯Opera' );
     * }
     * ```
     */
        opera: !!opera && opera.version,

        /**
     * @property {boolean} webkit æ£æµå½åæµè§å¨æ¯å¦æ¯webkitåæ ¸çæµè§å¨
     * @example
     * ```javascript
     * if ( UE.browser.webkit ) {
     *     console.log( 'å½åæµè§å¨æ¯webkitåæ ¸æµè§å¨' );
     * }
     * ```
     */
        webkit: agent.indexOf(' applewebkit/') > -1,

        /**
     * @property {boolean} mac æ£æµå½åæµè§å¨æ¯å¦æ¯è¿è¡å¨macå¹³å°ä¸
     * @example
     * ```javascript
     * if ( UE.browser.mac ) {
     *     console.log( 'å½åæµè§å¨è¿è¡å¨macå¹³å°ä¸' );
     * }
     * ```
     */
        mac: agent.indexOf('macintosh') > -1,

        /**
     * @property {boolean} quirks æ£æµå½åæµè§å¨æ¯å¦å¤äºâæªå¼æ¨¡å¼âä¸
     * @example
     * ```javascript
     * if ( UE.browser.quirks ) {
     *     console.log( 'å½åæµè§å¨è¿è¡å¤äºâæªå¼æ¨¡å¼â' );
     * }
     * ```
     */
        quirks: document.compatMode == 'BackCompat',
    }

/**
 * @property {boolean} gecko æ£æµå½åæµè§å¨åæ ¸æ¯å¦æ¯geckoåæ ¸
 * @example
 * ```javascript
 * if ( UE.browser.gecko ) {
 *     console.log( 'å½åæµè§å¨åæ ¸æ¯geckoåæ ¸' );
 * }
 * ```
 */
browser.gecko = navigator.product == 'Gecko'
  && !browser.webkit
  && !browser.opera
  && !browser.ie

let version = 0

// Internet Explorer 6.0+
if (browser.ie) {
    let v1 = agent.match(/(?:msie\s([\w.]+))/)
    let v2 = agent.match(/(?:trident.*rv:([\w.]+))/)
    if (v1 && v2 && v1[1] && v2[1]) {
        version = Math.max(v1[1] * 1, v2[1] * 1)
    } else if (v1 && v1[1]) {
        version = v1[1] * 1
    } else if (v2 && v2[1]) {
        version = v2[1] * 1
    } else {
        version = 0
    }

    browser.ie11Compat = document.documentMode == 11
    /**
   * @property { boolean } ie9Compat æ£æµæµè§å¨æ¨¡å¼æ¯å¦ä¸º IE9 å¼å®¹æ¨¡å¼
   * @warning å¦ææµè§å¨ä¸æ¯IEï¼ åè¯¥å¼ä¸ºundefined
   * @example
   * ```javascript
   * if ( UE.browser.ie9Compat ) {
   *     console.log( 'å½åæµè§å¨è¿è¡å¨IE9å¼å®¹æ¨¡å¼ä¸' );
   * }
   * ```
   */
    browser.ie9Compat = document.documentMode == 9

    /**
   * @property { boolean } ie8 æ£æµæµè§å¨æ¯å¦æ¯IE8æµè§å¨
   * @warning å¦ææµè§å¨ä¸æ¯IEï¼ åè¯¥å¼ä¸ºundefined
   * @example
   * ```javascript
   * if ( UE.browser.ie8 ) {
   *     console.log( 'å½åæµè§å¨æ¯IE8æµè§å¨' );
   * }
   * ```
   */
    browser.ie8 = !!document.documentMode

    /**
   * @property { boolean } ie8Compat æ£æµæµè§å¨æ¨¡å¼æ¯å¦ä¸º IE8 å¼å®¹æ¨¡å¼
   * @warning å¦ææµè§å¨ä¸æ¯IEï¼ åè¯¥å¼ä¸ºundefined
   * @example
   * ```javascript
   * if ( UE.browser.ie8Compat ) {
   *     console.log( 'å½åæµè§å¨è¿è¡å¨IE8å¼å®¹æ¨¡å¼ä¸' );
   * }
   * ```
   */
    browser.ie8Compat = document.documentMode == 8

    /**
   * @property { boolean } ie7Compat æ£æµæµè§å¨æ¨¡å¼æ¯å¦ä¸º IE7 å¼å®¹æ¨¡å¼
   * @warning å¦ææµè§å¨ä¸æ¯IEï¼ åè¯¥å¼ä¸ºundefined
   * @example
   * ```javascript
   * if ( UE.browser.ie7Compat ) {
   *     console.log( 'å½åæµè§å¨è¿è¡å¨IE7å¼å®¹æ¨¡å¼ä¸' );
   * }
   * ```
   */
    browser.ie7Compat = (version == 7 && !document.documentMode) || document.documentMode == 7

    /**
   * @property { boolean } ie6Compat æ£æµæµè§å¨æ¨¡å¼æ¯å¦ä¸º IE6 æ¨¡å¼ æèæªå¼æ¨¡å¼
   * @warning å¦ææµè§å¨ä¸æ¯IEï¼ åè¯¥å¼ä¸ºundefined
   * @example
   * ```javascript
   * if ( UE.browser.ie6Compat ) {
   *     console.log( 'å½åæµè§å¨è¿è¡å¨IE6æ¨¡å¼æèæªå¼æ¨¡å¼ä¸' );
   * }
   * ```
   */
    browser.ie6Compat = version < 7 || browser.quirks

    browser.ie9above = version > 8

    browser.ie9below = version < 9

    browser.ie11above = version > 10

    browser.ie11below = version < 11
}

// Gecko.
if (browser.gecko) {
    let geckoRelease = agent.match(/rv:([\d\.]+)/)
    if (geckoRelease) {
        geckoRelease = geckoRelease[1].split('.')
        version = geckoRelease[0] * 10000
      + (geckoRelease[1] || 0) * 100
      + (geckoRelease[2] || 0) * 1
    }
}

/**
 * @property { Number } chrome æ£æµå½åæµè§å¨æ¯å¦ä¸ºChrome, å¦ææ¯ï¼åè¿åChromeçå¤§çæ¬å·
 * @warning å¦ææµè§å¨ä¸æ¯chromeï¼ åè¯¥å¼ä¸ºundefined
 * @example
 * ```javascript
 * if ( UE.browser.chrome ) {
 *     console.log( 'å½åæµè§å¨æ¯Chrome' );
 * }
 * ```
 */
if (/chrome\/(\d+\.\d)/i.test(agent)) {
    browser.chrome = +RegExp.$1
}

/**
 * @property { Number } safari æ£æµå½åæµè§å¨æ¯å¦ä¸ºSafari, å¦ææ¯ï¼åè¿åSafariçå¤§çæ¬å·
 * @warning å¦ææµè§å¨ä¸æ¯safariï¼ åè¯¥å¼ä¸ºundefined
 * @example
 * ```javascript
 * if ( UE.browser.safari ) {
 *     console.log( 'å½åæµè§å¨æ¯Safari' );
 * }
 * ```
 */
if (
    /(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(agent)
  && !/chrome/i.test(agent)
) {
    browser.safari = +(RegExp.$1 || RegExp.$2)
}

// Opera 9.50+
if (browser.opera) version = parseFloat(opera.version())

// WebKit 522+ (Safari 3+)
if (browser.webkit) version = parseFloat(agent.match(/ applewebkit\/(\d+)/)[1])

/**
 * @property { Number } version æ£æµå½åæµè§å¨çæ¬å·
 * @remind
 * <ul>
 *     <li>IEç³»åè¿åå¼ä¸º5,6,7,8,9,10ç­</li>
 *     <li>geckoç³»åä¼è¿å10900ï¼158900ç­</li>
 *     <li>webkitç³»åä¼è¿åå¶buildå· (å¦ 522ç­)</li>
 * </ul>
 * @example
 * ```javascript
 * console.log( 'å½åæµè§å¨çæ¬å·æ¯ï¼ ' + UE.browser.version );
 * ```
 */
browser.version = version

/**
 * @property { boolean } isCompatible æ£æµå½åæµè§å¨æ¯å¦è½å¤ä¸UEditorè¯å¥½å¼å®¹
 * @example
 * ```javascript
 * if ( UE.browser.isCompatible ) {
 *     console.log( 'æµè§å¨ä¸UEditorè½å¤è¯å¥½å¼å®¹' );
 * }
 * ```
 */
browser.isCompatible = !browser.mobile
  && ((browser.ie && version >= 6)
    || (browser.gecko && version >= 10801)
    || (browser.opera && version >= 9.5)
    || (browser.air && version >= 1)
    || (browser.webkit && version >= 522)
    || false)

export default browser