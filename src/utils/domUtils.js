/* eslint-disable max-len */
/* eslint-disable vars-on-top */
/* eslint-disable no-cond-assign */
/* eslint-disable no-empty */
/* eslint-disable no-console */
/* eslint-disable no-irregular-whitespace */
import browser from './browser.js'
import utils from './utils.js'
import dtd from './dtd.js'

function getDomNode(node, start, ltr, startFromChild, fn, guard) {
    let tmpNode = startFromChild && node[start],
        parent
    !tmpNode && (tmpNode = node[ltr])
    // eslint-disable-next-line no-cond-assign
    while (!tmpNode && (parent = (parent || node).parentNode)) {
        if (parent.tagName == 'BODY' || (guard && !guard(parent))) {
            return null
        }
        tmpNode = parent[ltr]
    }
    if (tmpNode && fn && !fn(tmpNode)) {
        return getDomNode(tmpNode, start, ltr, false, fn)
    }
    return tmpNode
}
let attrFix = {
        tabindex: 'tabIndex',
        readonly: 'readOnly',
    },
    styleBlock = utils.listToMap([
        '-webkit-box',
        '-moz-box',
        'block',
        'list-item',
        'table',
        'table-row-group',
        'table-header-group',
        'table-footer-group',
        'table-row',
        'table-column-group',
        'table-column',
        'table-cell',
        'table-caption',
    ])
// eslint-disable-next-line import/no-mutable-exports
let domUtils = ({
    // èç¹å¸¸é
    NODE_ELEMENT: 1,
    NODE_DOCUMENT: 9,
    NODE_TEXT: 3,
    NODE_COMMENT: 8,
    NODE_DOCUMENT_FRAGMENT: 11,

    // ä½ç½®å³ç³»
    POSITION_IDENTICAL: 0,
    POSITION_DISCONNECTED: 1,
    POSITION_FOLLOWING: 2,
    POSITION_PRECEDING: 4,
    POSITION_IS_CONTAINED: 8,
    POSITION_CONTAINS: 16,
    // ie6ä½¿ç¨å¶ä»çä¼æä¸æ®µç©ºç½åºç°
    fillChar: '\u200B',
    // -------------------------Nodeé¨å--------------------------------
    keys: {
    /* Backspace */
        8: 1,
        /* Delete */
        46: 1,
        /* Shift */
        16: 1,
        /* Ctrl */
        17: 1,
        /* Alt */
        18: 1,
        37: 1,
        38: 1,
        39: 1,
        40: 1,
        13: 1, /* enter */
    },
    /**
   * è·åèç¹Aç¸å¯¹äºèç¹Bçä½ç½®å³ç³»
   * @method getPosition
   * @param { Node } nodeA éè¦æ¥è¯¢ä½ç½®å³ç³»çèç¹A
   * @param { Node } nodeB éè¦æ¥è¯¢ä½ç½®å³ç³»çèç¹B
   * @return { Number } èç¹Aä¸èç¹Bçå³ç³»
   * @example
   * ```javascript
   * //output: 20
   * var position = UE.dom.domUtils.getPosition( document.documentElement, document.body );
   *
   * switch ( position ) {
   *
   *      //0
   *      case UE.dom.domUtils.POSITION_IDENTICAL:
   *          console.log('åç´ ç¸å');
   *          break;
   *      //1
   *      case UE.dom.domUtils.POSITION_DISCONNECTED:
   *          console.log('ä¸¤ä¸ªèç¹å¨ä¸åçææ¡£ä¸­');
   *          break;
   *      //2
   *      case UE.dom.domUtils.POSITION_FOLLOWING:
   *          console.log('èç¹Aå¨èç¹Bä¹å');
   *          break;
   *      //4
   *      case UE.dom.domUtils.POSITION_PRECEDING;
   *          console.log('èç¹Aå¨èç¹Bä¹å');
   *          break;
   *      //8
   *      case UE.dom.domUtils.POSITION_IS_CONTAINED:
   *          console.log('èç¹Aè¢«èç¹Båå«');
   *          break;
   *      case 10:
   *          console.log('èç¹Aè¢«èç¹Båå«ä¸èç¹Aå¨èç¹Bä¹å');
   *          break;
   *      //16
   *      case UE.dom.domUtils.POSITION_CONTAINS:
   *          console.log('èç¹Aåå«èç¹B');
   *          break;
   *      case 20:
   *          console.log('èç¹Aåå«èç¹Bä¸èç¹Aå¨èç¹Bä¹å');
   *          break;
   *
   * }
   * ```
   */
    getPosition(nodeA, nodeB) {
    // å¦æä¸¤ä¸ªèç¹æ¯åä¸ä¸ªèç¹
        if (nodeA === nodeB) {
            // domUtils.POSITION_IDENTICAL
            return 0
        }
        let node,
            parentsA = [nodeA],
            parentsB = [nodeB]
        node = nodeA
        while ((node = node.parentNode)) {
            // å¦ænodeBæ¯nodeAçç¥åèç¹
            if (node === nodeB) {
                // domUtils.POSITION_IS_CONTAINED + domUtils.POSITION_FOLLOWING
                return 10
            }
            parentsA.push(node)
        }
        node = nodeB
        while ((node = node.parentNode)) {
            // å¦ænodeAæ¯nodeBçç¥åèç¹
            if (node === nodeA) {
                // domUtils.POSITION_CONTAINS + domUtils.POSITION_PRECEDING
                return 20
            }
            parentsB.push(node)
        }
        parentsA.reverse()
        parentsB.reverse()
        if (parentsA[0] !== parentsB[0]) {
            // domUtils.POSITION_DISCONNECTED
            return 1
        }
        let i = -1
        while ((i++, parentsA[i] === parentsB[i])) {}
        nodeA = parentsA[i]
        nodeB = parentsB[i]
        while ((nodeA = nodeA.nextSibling)) {
            if (nodeA === nodeB) {
                // domUtils.POSITION_PRECEDING
                return 4
            }
        }
        // domUtils.POSITION_FOLLOWING
        return 2
    },

    /**
   * æ£æµèç¹nodeå¨ç¶èç¹ä¸­çç´¢å¼ä½ç½®
   * @method getNodeIndex
   * @param { Node } node éè¦æ£æµçèç¹å¯¹è±¡
   * @return { Number } è¯¥èç¹å¨ç¶èç¹ä¸­çä½ç½®
   * @see UE.dom.domUtils.getNodeIndex(Node,Boolean)
   */

    /**
   * æ£æµèç¹nodeå¨ç¶èç¹ä¸­çç´¢å¼ä½ç½®ï¼ æ ¹æ®ç»å®çmergeTextNodeåæ°å³å®æ¯å¦è¦åå¹¶å¤ä¸ªè¿ç»­çææ¬èç¹ä¸ºä¸ä¸ªèç¹
   * @method getNodeIndex
   * @param { Node } node éè¦æ£æµçèç¹å¯¹è±¡
   * @param { Boolean } mergeTextNode æ¯å¦åå¹¶å¤ä¸ªè¿ç»­çææ¬èç¹ä¸ºä¸ä¸ªèç¹
   * @return { Number } è¯¥èç¹å¨ç¶èç¹ä¸­çä½ç½®
   * @example
   * ```javascript
   *
   *      var node = document.createElement("div");
   *
   *      node.appendChild( document.createTextNode( "hello" ) );
   *      node.appendChild( document.createTextNode( "world" ) );
   *      node.appendChild( node = document.createElement( "div" ) );
   *
   *      //output: 2
   *      console.log( UE.dom.domUtils.getNodeIndex( node ) );
   *
   *      //output: 1
   *      console.log( UE.dom.domUtils.getNodeIndex( node, true ) );
   *
   * ```
   */
    getNodeIndex(node, ignoreTextNode) {
        let preNode = node,
            i = 0
        while ((preNode = preNode.previousSibling)) {
            if (ignoreTextNode && preNode.nodeType == 3) {
                if (preNode.nodeType != preNode.nextSibling.nodeType) {
                    i++
                }
                continue
            }
            i++
        }
        return i
    },

    /**
   * æ£æµèç¹nodeæ¯å¦å¨ç»å®çdocumentå¯¹è±¡ä¸
   * @method inDoc
   * @param { Node } node éè¦æ£æµçèç¹å¯¹è±¡
   * @param { DomDocument } doc éè¦æ£æµçdocumentå¯¹è±¡
   * @return { Boolean } è¯¥èç¹nodeæ¯å¦å¨ç»å®çdocumentçdomæ ä¸
   * @example
   * ```javascript
   *
   * var node = document.createElement("div");
   *
   * //output: false
   * console.log( UE.do.domUtils.inDoc( node, document ) );
   *
   * document.body.appendChild( node );
   *
   * //output: true
   * console.log( UE.do.domUtils.inDoc( node, document ) );
   *
   * ```
   */
    inDoc(node, doc) {
        return domUtils.getPosition(node, doc) == 10
    },
    /**
   * æ ¹æ®ç»å®çè¿æ»¤è§åfilterFnï¼ æ¥æ¾ç¬¦åè¯¥è¿æ»¤è§åçnodeèç¹çç¬¬ä¸ä¸ªç¥åèç¹ï¼
   * æ¥æ¾çèµ·ç¹æ¯ç»å®nodeèç¹çç¶èç¹ã
   * @method findParent
   * @param { Node } node éè¦æ¥æ¾çèç¹
   * @param { Function } filterFn èªå®ä¹çè¿æ»¤æ¹æ³ã
   * @warning æ¥æ¾çç»ç¹æ¯å°bodyèç¹ä¸ºæ­¢
   * @remind èªå®ä¹çè¿æ»¤æ¹æ³filterFnæ¥åä¸ä¸ªNodeå¯¹è±¡ä½ä¸ºåæ°ï¼ è¯¥å¯¹è±¡ä»£è¡¨å½åæ§è¡æ£æµçç¥åèç¹ã å¦æè¯¥
   *          èç¹æ»¡è¶³è¿æ»¤æ¡ä»¶ï¼ åè¦æ±è¿åtrueï¼ è¿æ¶å°ç´æ¥è¿åè¯¥èç¹ä½ä¸ºfindParent()çç»æï¼ å¦åï¼ è¯·è¿åfalseã
   * @return { Node | Null } å¦ææ¾å°ç¬¦åè¿æ»¤æ¡ä»¶çèç¹ï¼ å°±è¿åè¯¥èç¹ï¼ å¦åè¿åNULL
   * @example
   * ```javascript
   * var filterNode = UE.dom.domUtils.findParent( document.body.firstChild, function ( node ) {
   *
   *     //ç±äºæ¥æ¾çç»ç¹æ¯bodyèç¹ï¼ æä»¥æ°¸è¿ä¹ä¸ä¼å¹éå½åè¿æ»¤å¨çæ¡ä»¶ï¼ å³è¿éæ°¸è¿ä¼è¿åfalse
   *     return node.tagName === "HTML";
   *
   * } );
   *
   * //output: true
   * console.log( filterNode === null );
   * ```
   */

    /**
   * æ ¹æ®ç»å®çè¿æ»¤è§åfilterFnï¼ æ¥æ¾ç¬¦åè¯¥è¿æ»¤è§åçnodeèç¹çç¬¬ä¸ä¸ªç¥åèç¹ï¼
   * å¦æincludeSelfçå¼ä¸ºtrueï¼åæ¥æ¾çèµ·ç¹æ¯ç»å®çèç¹nodeï¼ å¦åï¼ èµ·ç¹æ¯nodeçç¶èç¹
   * @method findParent
   * @param { Node } node éè¦æ¥æ¾çèç¹
   * @param { Function } filterFn èªå®ä¹çè¿æ»¤æ¹æ³ã
   * @param { Boolean } includeSelf æ¥æ¾è¿ç¨æ¯å¦åå«èªèº«
   * @warning æ¥æ¾çç»ç¹æ¯å°bodyèç¹ä¸ºæ­¢
   * @remind èªå®ä¹çè¿æ»¤æ¹æ³filterFnæ¥åä¸ä¸ªNodeå¯¹è±¡ä½ä¸ºåæ°ï¼ è¯¥å¯¹è±¡ä»£è¡¨å½åæ§è¡æ£æµçç¥åèç¹ã å¦æè¯¥
   *          èç¹æ»¡è¶³è¿æ»¤æ¡ä»¶ï¼ åè¦æ±è¿åtrueï¼ è¿æ¶å°ç´æ¥è¿åè¯¥èç¹ä½ä¸ºfindParent()çç»æï¼ å¦åï¼ è¯·è¿åfalseã
   * @remind å¦æincludeSelfä¸ºtrueï¼ åè¿æ»¤å¨ç¬¬ä¸æ¬¡æ§è¡æ¶çåæ°ä¼æ¯èç¹æ¬èº«ã
   *          åä¹ï¼ è¿æ»¤å¨ç¬¬ä¸æ¬¡æ§è¡æ¶çåæ°å°æ¯è¯¥èç¹çç¶èç¹ã
   * @return { Node | Null } å¦ææ¾å°ç¬¦åè¿æ»¤æ¡ä»¶çèç¹ï¼ å°±è¿åè¯¥èç¹ï¼ å¦åè¿åNULL
   * @example
   * ```html
   * <body>
   *
   *      <div id="test">
   *      </div>
   *
   *      <script type="text/javascript">
   *
   *          //output: DIV, BODY
   *          var filterNode = UE.dom.domUtils.findParent( document.getElementById( "test" ), function ( node ) {
   *
   *              console.log( node.tagName );
   *              return false;
   *
   *          }, true );
   *
   *      </script>
   * </body>
   * ```
   */
    findParent(node, filterFn, includeSelf) {
        if (node && !domUtils.isBody(node)) {
            node = includeSelf ? node : node.parentNode
            while (node) {
                if (!filterFn || filterFn(node) || domUtils.isBody(node)) {
                    return filterFn && !filterFn(node) && domUtils.isBody(node)
                        ? null
                        : node
                }
                node = node.parentNode
            }
        }
        return null
    },
    /**
   * æ¥æ¾nodeçèç¹åä¸ºtagNameçç¬¬ä¸ä¸ªç¥åèç¹ï¼ æ¥æ¾çèµ·ç¹æ¯nodeèç¹çç¶èç¹ã
   * @method findParentByTagName
   * @param { Node } node éè¦æ¥æ¾çèç¹å¯¹è±¡
   * @param { Array } tagNames éè¦æ¥æ¾çç¶èç¹çåç§°æ°ç»
   * @warning æ¥æ¾çç»ç¹æ¯å°bodyèç¹ä¸ºæ­¢
   * @return { Node | NULL } å¦ææ¾å°ç¬¦åæ¡ä»¶çèç¹ï¼ åè¿åè¯¥èç¹ï¼ å¦åè¿åNULL
   * @example
   * ```javascript
   * var node = UE.dom.domUtils.findParentByTagName( document.getElementsByTagName("div")[0], [ "BODY" ] );
   * //output: BODY
   * console.log( node.tagName );
   * ```
   */

    /**
   * æ¥æ¾nodeçèç¹åä¸ºtagNameçç¥åèç¹ï¼ å¦æincludeSelfçå¼ä¸ºtrueï¼åæ¥æ¾çèµ·ç¹æ¯ç»å®çèç¹nodeï¼
   * å¦åï¼ èµ·ç¹æ¯nodeçç¶èç¹ã
   * @method findParentByTagName
   * @param { Node } node éè¦æ¥æ¾çèç¹å¯¹è±¡
   * @param { Array } tagNames éè¦æ¥æ¾çç¶èç¹çåç§°æ°ç»
   * @param { Boolean } includeSelf æ¥æ¾è¿ç¨æ¯å¦åå«nodeèç¹èªèº«
   * @warning æ¥æ¾çç»ç¹æ¯å°bodyèç¹ä¸ºæ­¢
   * @return { Node | NULL } å¦ææ¾å°ç¬¦åæ¡ä»¶çèç¹ï¼ åè¿åè¯¥èç¹ï¼ å¦åè¿åNULL
   * @example
   * ```javascript
   * var queryTarget = document.getElementsByTagName("div")[0];
   * var node = UE.dom.domUtils.findParentByTagName( queryTarget, [ "DIV" ], true );
   * //output: true
   * console.log( queryTarget === node );
   * ```
   */
    findParentByTagName(node, tagNames, includeSelf, excludeFn) {
        tagNames = utils.listToMap(utils.isArray(tagNames) ? tagNames : [tagNames])
        return domUtils.findParent(
            node,
            (node) => tagNames[node.tagName] && !(excludeFn && excludeFn(node)),
            includeSelf,
        )
    },
    /**
   * æ¥æ¾èç¹nodeçç¥åèç¹éåï¼ æ¥æ¾çèµ·ç¹æ¯ç»å®èç¹çç¶èç¹ï¼ç»æéä¸­ä¸åå«ç»å®çèç¹ã
   * @method findParents
   * @param { Node } node éè¦æ¥æ¾çèç¹å¯¹è±¡
   * @return { Array } ç»å®èç¹çç¥åèç¹æ°ç»
   * @grammar UE.dom.domUtils.findParents(node)  => Array  //è¿åä¸ä¸ªç¥åèç¹æ°ç»éåï¼ä¸åå«èªèº«
   * @grammar UE.dom.domUtils.findParents(node,includeSelf)  => Array  //è¿åä¸ä¸ªç¥åèç¹æ°ç»éåï¼includeSelfæå®æ¯å¦åå«èªèº«
   * @grammar UE.dom.domUtils.findParents(node,includeSelf,filterFn)  => Array  //è¿åä¸ä¸ªç¥åèç¹æ°ç»éåï¼filterFnæå®è¿æ»¤æ¡ä»¶ï¼è¿åtrueçnodeå°è¢«éå
   * @grammar UE.dom.domUtils.findParents(node,includeSelf,filterFn,closerFirst)  => Array  //è¿åä¸ä¸ªç¥åèç¹æ°ç»éåï¼closerFirstä¸ºtrueçè¯ï¼nodeçç´æ¥ç¶äº²èç¹æ¯æ°ç»çç¬¬0ä¸ª
   */

    /**
   * æ¥æ¾èç¹nodeçç¥åèç¹éåï¼ å¦æincludeSelfçå¼ä¸ºtrueï¼
   * åè¿åçç»æéä¸­åè®¸åºç°å½åç»å®çèç¹ï¼ å¦åï¼ è¯¥èç¹ä¸ä¼åºç°å¨å¶ç»æéä¸­ã
   * @method findParents
   * @param { Node } node éè¦æ¥æ¾çèç¹å¯¹è±¡
   * @param { Boolean } includeSelf æ¥æ¾çç»æä¸­æ¯å¦åè®¸åå«å½åæ¥æ¾çèç¹å¯¹è±¡
   * @return { Array } ç»å®èç¹çç¥åèç¹æ°ç»
   */
    findParents(node, includeSelf, filterFn, closerFirst) {
        let parents = includeSelf && ((filterFn && filterFn(node)) || !filterFn)
            ? [node]
            : []
        while ((node = domUtils.findParent(node, filterFn))) {
            parents.push(node)
        }
        return closerFirst ? parents : parents.reverse()
    },

    /**
   * å¨èç¹nodeåé¢æå¥æ°èç¹newNode
   * @method insertAfter
   * @param { Node } node ç®æ èç¹
   * @param { Node } newNode æ°æå¥çèç¹ï¼ è¯¥èç¹å°ç½®äºç®æ èç¹ä¹å
   * @return { Node } æ°æå¥çèç¹
   */
    insertAfter(node, newNode) {
        return node.nextSibling
            ? node.parentNode.insertBefore(newNode, node.nextSibling)
            : node.parentNode.appendChild(newNode)
    },

    /**
   * å é¤èç¹nodeåå¶ä¸å±çææèç¹
   * @method remove
   * @param { Node } node éè¦å é¤çèç¹å¯¹è±¡
   * @return { Node } è¿ååå é¤çèç¹å¯¹è±¡
   * @example
   * ```html
   * <div id="test">
   *     <div id="child">ä½ å¥½</div>
   * </div>
   * <script>
   *     UE.dom.domUtils.remove( document.body, false );
   *     //output: false
   *     console.log( document.getElementById( "child" ) !== null );
   * </script>
   * ```
   */

    /**
   * å é¤èç¹nodeï¼å¹¶æ ¹æ®keepChildrençå¼å³å®æ¯å¦ä¿çå­èç¹
   * @method remove
   * @param { Node } node éè¦å é¤çèç¹å¯¹è±¡
   * @param { Boolean } keepChildren æ¯å¦éè¦ä¿çå­èç¹
   * @return { Node } è¿ååå é¤çèç¹å¯¹è±¡
   * @example
   * ```html
   * <div id="test">
   *     <div id="child">ä½ å¥½</div>
   * </div>
   * <script>
   *     UE.dom.domUtils.remove( document.body, true );
   *     //output: true
   *     console.log( document.getElementById( "child" ) !== null );
   * </script>
   * ```
   */
    remove(node, keepChildren) {
        let parent = node.parentNode,
            child
        if (parent) {
            if (keepChildren && node.hasChildNodes()) {
                while ((child = node.firstChild)) {
                    parent.insertBefore(child, node)
                }
            }
            parent.removeChild(node)
        }
        return node
    },

    /**
   * åå¾nodeèç¹çä¸ä¸ä¸ªåå¼èç¹ï¼ å¦æè¯¥èç¹å¶åæ²¡æåå¼èç¹ï¼ åéå½æ¥æ¾å¶ç¶èç¹ä¹åçç¬¬ä¸ä¸ªåå¼èç¹ï¼
   * ç´å°æ¾å°æ»¡è¶³æ¡ä»¶çèç¹æèéå½å°BODYèç¹ä¹åæä¼ç»æã
   * @method getNextDomNode
   * @param { Node } node éè¦è·åå¶åçåå¼èç¹çèç¹å¯¹è±¡
   * @return { Node | NULL } å¦ææ¾æ»¡è¶³æ¡ä»¶çèç¹ï¼ åè¿åè¯¥èç¹ï¼ å¦åè¿åNULL
   * @example
   * ```html
   *     <body>
   *      <div id="test">
   *          <span></span>
   *      </div>
   *      <i>xxx</i>
   * </body>
   * <script>
   *
   *     //output: ièç¹
   *     console.log( UE.dom.domUtils.getNextDomNode( document.getElementById( "test" ) ) );
   *
   * </script>
   * ```
   * @example
   * ```html
   * <body>
   *      <div>
   *          <span></span>
   *          <i id="test">xxx</i>
   *      </div>
   *      <b>xxx</b>
   * </body>
   * <script>
   *
   *     //ç±äºidä¸ºtestçièç¹ä¹åæ²¡æåå¼èç¹ï¼ åæ¥æ¾å¶ç¶èç¹ï¼divï¼åé¢çåå¼èç¹
   *     //output: bèç¹
   *     console.log( UE.dom.domUtils.getNextDomNode( document.getElementById( "test" ) ) );
   *
   * </script>
   * ```
   */

    /**
   * åå¾nodeèç¹çä¸ä¸ä¸ªåå¼èç¹ï¼ å¦æstartFromChildçå¼ä¸ºtureï¼ååè·åå¶å­èç¹ï¼
   * å¦ææå­èç¹åç´æ¥è¿åç¬¬ä¸ä¸ªå­èç¹ï¼å¦ææ²¡æå­èç¹æèstartFromChildçå¼ä¸ºfalseï¼
   * åæ§è¡<a href="#UE.dom.domUtils.getNextDomNode(Node)">getNextDomNode(Node node)</a>çæ¥æ¾è¿ç¨ã
   * @method getNextDomNode
   * @param { Node } node éè¦è·åå¶åçåå¼èç¹çèç¹å¯¹è±¡
   * @param { Boolean } startFromChild æ¥æ¾è¿ç¨æ¯å¦ä»å¶å­èç¹å¼å§
   * @return { Node | NULL } å¦ææ¾æ»¡è¶³æ¡ä»¶çèç¹ï¼ åè¿åè¯¥èç¹ï¼ å¦åè¿åNULL
   * @see UE.dom.domUtils.getNextDomNode(Node)
   */
    getNextDomNode(node, startFromChild, filterFn, guard) {
        return getDomNode(
            node,
            'firstChild',
            'nextSibling',
            startFromChild,
            filterFn,
            guard,
        )
    },
    /**
   * æ£æµèç¹nodeæ¯å¦å±æ¯UEditorå®ä¹çbookmarkèç¹
   * @method isBookmarkNode
   * @private
   * @param { Node } node éè¦æ£æµçèç¹å¯¹è±¡
   * @return { Boolean } æ¯å¦æ¯bookmarkèç¹
   * @example
   * ```html
   * <span id="_baidu_bookmark_1"></span>
   * <script>
   *      var bookmarkNode = document.getElementById("_baidu_bookmark_1");
   *      //output: true
   *      console.log( UE.dom.domUtils.isBookmarkNode( bookmarkNode ) );
   * </script>
   * ```
   */
    isBookmarkNode(node) {
        return node.nodeType == 1 && node.id && /^_baidu_bookmark_/i.test(node.id)
    },
    /**
   * æ¸é¤nodeèç¹å·¦å³è¿ç»­ä¸ºç©ºçåå¼inlineèç¹
   * @method clearEmptySibling
   * @param { Node } node æ§è¡çèç¹å¯¹è±¡ï¼ å¦æè¯¥èç¹çå·¦å³è¿ç»­çåå¼èç¹æ¯ç©ºçinlineèç¹ï¼
   * åè¿äºåå¼èç¹å°è¢«å é¤
   * @grammar UE.dom.domUtils.clearEmptySibling(node,ignoreNext)  //ignoreNextæå®æ¯å¦å¿½ç¥å³è¾¹ç©ºèç¹
   * @grammar UE.dom.domUtils.clearEmptySibling(node,ignoreNext,ignorePre)  //ignorePreæå®æ¯å¦å¿½ç¥å·¦è¾¹ç©ºèç¹
   * @example
   * ```html
   * <body>
   *     <div></div>
   *     <span id="test"></span>
   *     <i></i>
   *     <b></b>
   *     <em>xxx</em>
   *     <span></span>
   * </body>
   * <script>
   *
   *      UE.dom.domUtils.clearEmptySibling( document.getElementById( "test" ) );
   *
   *      //output: <div></div><span id="test"></span><em>xxx</em><span></span>
   *      console.log( document.body.innerHTML );
   *
   * </script>
   * ```
   */

    /**
   * æ¸é¤nodeèç¹å·¦å³è¿ç»­ä¸ºç©ºçåå¼inlineèç¹ï¼ å¦æignoreNextçå¼ä¸ºtrueï¼
   * åå¿½ç¥å¯¹å³è¾¹åå¼èç¹çæä½ã
   * @method clearEmptySibling
   * @param { Node } node æ§è¡çèç¹å¯¹è±¡ï¼ å¦æè¯¥èç¹çå·¦å³è¿ç»­çåå¼èç¹æ¯ç©ºçinlineèç¹ï¼
   * @param { Boolean } ignoreNext æ¯å¦å¿½ç¥å¿½ç¥å¯¹å³è¾¹çåå¼èç¹çæä½
   * åè¿äºåå¼èç¹å°è¢«å é¤
   * @see UE.dom.domUtils.clearEmptySibling(Node)
   */

    /**
   * æ¸é¤nodeèç¹å·¦å³è¿ç»­ä¸ºç©ºçåå¼inlineèç¹ï¼ å¦æignoreNextçå¼ä¸ºtrueï¼
   * åå¿½ç¥å¯¹å³è¾¹åå¼èç¹çæä½ï¼ å¦æignorePreçå¼ä¸ºtrueï¼åå¿½ç¥å¯¹å·¦è¾¹åå¼èç¹çæä½ã
   * @method clearEmptySibling
   * @param { Node } node æ§è¡çèç¹å¯¹è±¡ï¼ å¦æè¯¥èç¹çå·¦å³è¿ç»­çåå¼èç¹æ¯ç©ºçinlineèç¹ï¼
   * @param { Boolean } ignoreNext æ¯å¦å¿½ç¥å¿½ç¥å¯¹å³è¾¹çåå¼èç¹çæä½
   * @param { Boolean } ignorePre æ¯å¦å¿½ç¥å¿½ç¥å¯¹å·¦è¾¹çåå¼èç¹çæä½
   * åè¿äºåå¼èç¹å°è¢«å é¤
   * @see UE.dom.domUtils.clearEmptySibling(Node)
   */
    clearEmptySibling(node, ignoreNext, ignorePre) {
        function clear(next, dir) {
            let tmpNode
            while (
                next
        && !domUtils.isBookmarkNode(next)
        && (domUtils.isEmptyInlineElement(next)
          // è¿éä¸è½æç©ºæ ¼ç®è¿æ¥ä¼å§ç©ºæ ¼å¹²æï¼åºç°æå­é´çç©ºæ ¼ä¸¢æäº
          || !new RegExp('[^\t\n\r' + domUtils.fillChar + ']').test(
              next.nodeValue,
          ))
            ) {
                tmpNode = next[dir]
                domUtils.remove(next)
                next = tmpNode
            }
        }!ignoreNext && clear(node.nextSibling, 'nextSibling')
        !ignorePre && clear(node.previousSibling, 'previousSibling')
    },
    /**
   * å°ä¸ä¸ªææ¬èç¹textNodeæåæä¸¤ä¸ªææ¬èç¹ï¼offsetæå®æåä½ç½®
   * @method split
   * @param { Node } textNode éè¦æåçææ¬èç¹å¯¹è±¡
   * @param { int } offset éè¦æåçä½ç½®ï¼ ä½ç½®è®¡ç®ä»0å¼å§
   * @return { Node } æååå½¢æçæ°èç¹
   * @example
   * ```html
   * <div id="test">abcdef</div>
   * <script>
   *      var newNode = UE.dom.domUtils.split( document.getElementById( "test" ).firstChild, 3 );
   *      //output: def
   *      console.log( newNode.nodeValue );
   * </script>
   * ```
   */
    split(node, offset) {
        let doc = node.ownerDocument
        if (browser.ie && offset == node.nodeValue.length) {
            let next = doc.createTextNode('')
            return domUtils.insertAfter(node, next)
        }
        let retval = node.splitText(offset)
        return retval
    },

    /**
   * æ£æµææ¬èç¹textNodeæ¯å¦ä¸ºç©ºèç¹ï¼åæ¬ç©ºæ ¼ãæ¢è¡ãå ä½ç¬¦ç­å­ç¬¦ï¼
   * @method  isWhitespace
   * @param { Node } node éè¦æ£æµçèç¹å¯¹è±¡
   * @return { Boolean } æ£æµçèç¹æ¯å¦ä¸ºç©º
   * @example
   * ```html
   * <div id="test">
   *
   * </div>
   * <script>
   *      //output: true
   *      console.log( UE.dom.domUtils.isWhitespace( document.getElementById("test").firstChild ) );
   * </script>
   * ```
   */
    isWhitespace(node) {
        return !new RegExp('[^ \t\n\r' + domUtils.fillChar + ']').test(
            node.nodeValue,
        )
    },
    /**
   * æ¯è¾èç¹nodeAä¸èç¹nodeBæ¯å¦å·æç¸åçæ ç­¾åãå±æ§åä»¥åå±æ§å¼
   * @method  isSameElement
   * @param { Node } nodeA éè¦æ¯è¾çèç¹
   * @param { Node } nodeB éè¦æ¯è¾çèç¹
   * @return { Boolean } ä¸¤ä¸ªèç¹æ¯å¦å·æç¸åçæ ç­¾åãå±æ§åä»¥åå±æ§å¼
   * @example
   * ```html
   * <span style="font-size:12px">ssss</span>
   * <span style="font-size:12px">bbbbb</span>
   * <span style="font-size:13px">ssss</span>
   * <span style="font-size:14px">bbbbb</span>
   *
   * <script>
   *
   *     var nodes = document.getElementsByTagName( "span" );
   *
   *     //output: true
   *     console.log( UE.dom.domUtils.isSameElement( nodes[0], nodes[1] ) );
   *
   *     //output: false
   *     console.log( UE.dom.domUtils.isSameElement( nodes[2], nodes[3] ) );
   *
   * </script>
   * ```
   */
    isSameElement(nodeA, nodeB) {
        if (nodeA.tagName != nodeB.tagName) {
            return false
        }
        let thisAttrs = nodeA.attributes,
            otherAttrs = nodeB.attributes
        if (!browser.ie && thisAttrs.length != otherAttrs.length) {
            return false
        }
        let attrA,
            attrB,
            al = 0,
            bl = 0
        // eslint-disable-next-line no-var
        for (var i = 0;
            (attrA = thisAttrs[i++]);) {
            if (attrA.nodeName == 'style') {
                if (attrA.specified) {
                    al++
                }
                if (domUtils.isSameStyle(nodeA, nodeB)) {
                    continue
                } else {
                    return false
                }
            }
            if (browser.ie) {
                if (attrA.specified) {
                    al++
                    attrB = otherAttrs.getNamedItem(attrA.nodeName)
                } else {
                    continue
                }
            } else {
                attrB = nodeB.attributes[attrA.nodeName]
            }
            if (!attrB.specified || attrA.nodeValue != attrB.nodeValue) {
                return false
            }
        }
        // æå¯è½attrBçå±æ§åå«äºattrAçå±æ§ä¹å¤è¿æèªå·±çå±æ§
        if (browser.ie) {
            // eslint-disable-next-line block-scoped-var
            for (i = 0;
                // eslint-disable-next-line block-scoped-var
                (attrB = otherAttrs[i++]);) {
                if (attrB.specified) {
                    bl++
                }
            }
            if (al != bl) {
                return false
            }
        }
        return true
    },

    /**
   * å¤æ­èç¹nodeAä¸èç¹nodeBçåç´ çstyleå±æ§æ¯å¦ä¸è´
   * @method isSameStyle
   * @param { Node } nodeA éè¦æ¯è¾çèç¹
   * @param { Node } nodeB éè¦æ¯è¾çèç¹
   * @return { Boolean } ä¸¤ä¸ªèç¹æ¯å¦å·æç¸åçstyleå±æ§å¼
   * @example
   * ```html
   * <span style="font-size:12px">ssss</span>
   * <span style="font-size:12px">bbbbb</span>
   * <span style="font-size:13px">ssss</span>
   * <span style="font-size:14px">bbbbb</span>
   *
   * <script>
   *
   *     var nodes = document.getElementsByTagName( "span" );
   *
   *     //output: true
   *     console.log( UE.dom.domUtils.isSameStyle( nodes[0], nodes[1] ) );
   *
   *     //output: false
   *     console.log( UE.dom.domUtils.isSameStyle( nodes[2], nodes[3] ) );
   *
   * </script>
   * ```
   */
    isSameStyle(nodeA, nodeB) {
        let styleA = nodeA.style.cssText
            .replace(/( ?; ?)/g, ';')
            .replace(/( ?: ?)/g, ':'),
            styleB = nodeB.style.cssText
            .replace(/( ?; ?)/g, ';')
            .replace(/( ?: ?)/g, ':')
        if (browser.opera) {
            styleA = nodeA.style
            styleB = nodeB.style
            if (styleA.length != styleB.length) return false
            for (let p in styleA) {
                if (/^(\d+|csstext)$/i.test(p)) {
                    continue
                }
                if (styleA[p] != styleB[p]) {
                    return false
                }
            }
            return true
        }
        if (!styleA || !styleB) {
            return styleA == styleB
        }
        styleA = styleA.split(';')
        styleB = styleB.split(';')
        if (styleA.length != styleB.length) {
            return false
        }
        // eslint-disable-next-line no-var
        for (var i = 0, ci;
            (ci = styleA[i++]);) {
            if (utils.indexOf(styleB, ci) == -1) {
                return false
            }
        }
        return true
    },
    /**
   * æ£æ¥èç¹nodeæ¯å¦ä¸ºblockåç´ 
   * @method isBlockElm
   * @param { Node } node éè¦æ£æµçèç¹å¯¹è±¡
   * @return { Boolean } æ¯å¦æ¯blockåç´ èç¹
   * @warning è¯¥æ¹æ³çå¤æ­è§åå¦ä¸ï¼ å¦æè¯¥åç´ åæ¬æ¯blockåç´ ï¼ åä¸è®ºè¯¥åç´ å½åçcssæ ·å¼æ¯ä»ä¹é½ä¼è¿åtrueï¼
   *          å¦åï¼æ£æµè¯¥åç´ çcssæ ·å¼ï¼ å¦æè¯¥åç´ å½åæ¯blockåç´ ï¼ åè¿åtrueã å¶ä½æåµä¸é½è¿åfalseã
   * @example
   * ```html
   * <span id="test1" style="display: block"></span>
   * <span id="test2"></span>
   * <div id="test3" style="display: inline"></div>
   *
   * <script>
   *
   *     //output: true
   *     console.log( UE.dom.domUtils.isBlockElm( document.getElementById("test1") ) );
   *
   *     //output: false
   *     console.log( UE.dom.domUtils.isBlockElm( document.getElementById("test2") ) );
   *
   *     //output: true
   *     console.log( UE.dom.domUtils.isBlockElm( document.getElementById("test3") ) );
   *
   * </script>
   * ```
   */
    isBlockElm(node) {
        return (
            node.nodeType == 1
      && (dtd.$block[node.tagName]
        || styleBlock[domUtils.getComputedStyle(node, 'display')])
      && !dtd.$nonChild[node.tagName]
        )
    },
    /**
   * æ£æµnodeèç¹æ¯å¦ä¸ºbodyèç¹
   * @method isBody
   * @param { Element } node éè¦æ£æµçdomåç´ 
   * @return { Boolean } ç»å®çåç´ æ¯å¦æ¯bodyåç´ 
   * @example
   * ```javascript
   * //output: true
   * console.log( UE.dom.domUtils.isBody( document.body ) );
   * ```
   */
    isBody(node) {
        return node && node.nodeType == 1 && node.tagName.toLowerCase() == 'body'
    },
    /**
   * æ£æ¥èç¹nodeæ¯å¦æ¯ç©ºinlineèç¹
   * @method  isEmptyInlineElement
   * @param { Node } node éè¦æ£æµçèç¹å¯¹è±¡
   * @return { Number }  å¦æç»å®çèç¹æ¯ç©ºçinlineèç¹ï¼ åè¿å1, å¦åè¿å0ã
   * @example
   * ```html
   * <b><i></i></b> => 1
   * <b><i></i><u></u></b> => 1
   * <b></b> => 1
   * <b>xx<i></i></b> => 0
   * ```
   */
    isEmptyInlineElement(node) {
        if (node.nodeType != 1 || !dtd.$removeEmpty[node.tagName]) {
            return 0
        }
        node = node.firstChild
        while (node) {
            // å¦ææ¯åå»ºçbookmarkå°±è·³è¿
            if (domUtils.isBookmarkNode(node)) {
                return 0
            }
            if (
                (node.nodeType == 1 && !domUtils.isEmptyInlineElement(node))
        || (node.nodeType == 3 && !domUtils.isWhitespace(node))
            ) {
                return 0
            }
            node = node.nextSibling
        }
        return 1
    },

    /**
   * å é¤nodeèç¹ä¸é¦å°¾ä¸¤ç«¯çç©ºç½ææ¬å­èç¹
   * @method trimWhiteTextNode
   * @param { Element } node éè¦æ§è¡å é¤æä½çåç´ å¯¹è±¡
   * @example
   * ```javascript
   *      var node = document.createElement("div");
   *
   *      node.appendChild( document.createTextNode( "" ) );
   *
   *      node.appendChild( document.createElement("div") );
   *
   *      node.appendChild( document.createTextNode( "" ) );
   *
   *      //3
   *      console.log( node.childNodes.length );
   *
   *      UE.dom.domUtils.trimWhiteTextNode( node );
   *
   *      //1
   *      console.log( node.childNodes.length );
   * ```
   */
    trimWhiteTextNode(node) {
        function remove(dir) {
            let child
            while (
                (child = node[dir])
        && child.nodeType == 3
        && domUtils.isWhitespace(child)
            ) {
                node.removeChild(child)
            }
        }
        remove('firstChild')
        remove('lastChild')
    },

    /**
   * åå¹¶nodeèç¹ä¸ç¸åçå­èç¹
   * @name mergeChild
   * @desc
   * UE.dom.domUtils.mergeChild(node,tagName) //tagNameè¦åå¹¶çå­èç¹çæ ç­¾
   * @example
   * <p><span style="font-size:12px;">xx<span style="font-size:12px;">aa</span>xx</span></p>
   * ==> UE.dom.domUtils.mergeChild(node,'span')
   * <p><span style="font-size:12px;">xxaaxx</span></p>
   */
    mergeChild(node, tagName, attrs) {
        let list = domUtils.getElementsByTagName(node, node.tagName.toLowerCase())
        // eslint-disable-next-line no-var
        for (var i = 0, ci;
            (ci = list[i++]);) {
            if (!ci.parentNode || domUtils.isBookmarkNode(ci)) {
                continue
            }
            // spanåç¬å¤ç
            if (ci.tagName.toLowerCase() == 'span') {
                if (node === ci.parentNode) {
                    domUtils.trimWhiteTextNode(node)
                    if (node.childNodes.length == 1) {
                        node.style.cssText = ci.style.cssText + ';' + node.style.cssText
                        domUtils.remove(ci, true)
                        continue
                    }
                }
                ci.style.cssText = node.style.cssText + ';' + ci.style.cssText
                if (attrs) {
                    let style = attrs.style
                    if (style) {
                        style = style.split(';')
                        // eslint-disable-next-line no-var
                        for (var j = 0, s;
                            (s = style[j++]);) {
                            ci.style[utils.cssStyleToDomStyle(s.split(':')[0])] = s.split(
                                ':',
                            )[1]
                        }
                    }
                }
                if (domUtils.isSameStyle(ci, node)) {
                    domUtils.remove(ci, true)
                }
                continue
            }
            if (domUtils.isSameElement(node, ci)) {
                domUtils.remove(ci, true)
            }
        }
    },

    /**
   * åçæ¹æ³getElementsByTagNameçå°è£
   * @method getElementsByTagName
   * @param { Node } node ç®æ èç¹å¯¹è±¡
   * @param { String } tagName éè¦æ¥æ¾çèç¹çtagNameï¼ å¤ä¸ªtagNameä»¥ç©ºæ ¼åå²
   * @return { Array } ç¬¦åæ¡ä»¶çèç¹éå
   */
    getElementsByTagName(node, name, filter) {
        if (filter && utils.isString(filter)) {
            let className = filter
            filter = function (node) {
                return domUtils.hasClass(node, className)
            }
        }
        name = utils.trim(name).replace(/[ ]{2,}/g, ' ').split(' ')
        let arr = []
        // eslint-disable-next-line no-var
        for (var n = 0, ni;
            (ni = name[n++]);) {
            let list = node.getElementsByTagName(ni)
            // eslint-disable-next-line no-var
            for (var i = 0, ci;
                (ci = list[i++]);) {
                if (!filter || filter(ci)) arr.push(ci)
            }
        }

        return arr
    },
    mergeToParent(node) {
        let parent = node.parentNode
        while (parent && dtd.$removeEmpty[parent.tagName]) {
            if ((parent.tagName == node.tagName && parent.className == node.className) || parent.tagName == 'A') {
                // éå¯¹aæ ç­¾åç¬å¤ç
                domUtils.trimWhiteTextNode(parent)
                // spanéè¦ç¹æ®å¤ç  ä¸å¤çè¿æ ·çæåµ <span stlye="color:#fff">xxx<span style="color:#ccc">xxx</span>xxx</span>
                if (
                    (parent.tagName == 'SPAN' && !domUtils.isSameStyle(parent, node))
          || (parent.tagName == 'A' && node.tagName == 'SPAN')
                ) {
                    if (parent.childNodes.length > 1 || parent !== node.parentNode) {
                        node.style.cssText = parent.style.cssText + ';' + node.style.cssText
                        parent = parent.parentNode
                        continue
                    } else {
                        parent.style.cssText += ';' + node.style.cssText
                        // trace:952 aæ ç­¾è¦ä¿æä¸åçº¿
                        if (parent.tagName == 'A') {
                            parent.style.textDecoration = 'underline'
                        }
                    }
                }
                if (parent.tagName != 'A') {
                    parent === node.parentNode && domUtils.remove(node, true)
                    break
                }
            }
            parent = parent.parentNode
        }
    },
    mergeSibling(node, ignorePre, ignoreNext) {
        function merge(rtl, start, node) {
            let next
            if (
                (next = node[rtl])
        && !domUtils.isBookmarkNode(next)
        && next.nodeType == 1
        && domUtils.isSameElement(node, next)
            ) {
                while (next.firstChild) {
                    if (start == 'firstChild') {
                        node.insertBefore(next.lastChild, node.firstChild)
                    } else {
                        node.appendChild(next.firstChild)
                    }
                }
                domUtils.remove(next)
            }
        }!ignorePre && merge('previousSibling', 'firstChild', node)
        !ignoreNext && merge('nextSibling', 'lastChild', node)
    },

    /**
   * è®¾ç½®èç¹nodeåå¶å­èç¹ä¸ä¼è¢«éä¸­
   * @method unSelectable
   * @param { Element } node éè¦æ§è¡æä½çdomåç´ 
   * @remind æ§è¡è¯¥æä½åçèç¹ï¼ å°ä¸è½è¢«é¼ æ éä¸­
   * @example
   * ```javascript
   * UE.dom.domUtils.unSelectable( document.body );
   * ```
   */
    unSelectable: browser.opera
        ? function (node) {
            // for ie9
            node.onselectstart = function () {
                return false
            }
            // eslint-disable-next-line no-multi-assign
            node.onclick = node.onkeyup = node.onkeydown = function () {
                return false
            }
            node.unselectable = 'on'
            node.setAttribute('unselectable', 'on')
            // eslint-disable-next-line no-var
            for (var i = 0, ci;
                (ci = node.all[i++]);) {
                switch (ci.tagName.toLowerCase()) {
                    case 'iframe':
                    case 'textarea':
                    case 'input':
                    case 'select':
                        break
                    default:
                        ci.unselectable = 'on'
                        node.setAttribute('unselectable', 'on')
                }
            }
        }
        : function (node) {
            // eslint-disable-next-line no-multi-assign
            node.style.MozUserSelect = node.style.webkitUserSelect = node.style.msUserSelect = node.style.KhtmlUserSelect = 'none'
        },
    /**
   * å¨docä¸åå»ºä¸ä¸ªæ ç­¾åä¸ºtagï¼å±æ§ä¸ºattrsçåç´ 
   * @method createElement
   * @param { DomDocument } doc æ°åå»ºçåç´ å±äºè¯¥documentèç¹åå»º
   * @param { String } tagName éè¦åå»ºçåç´ çæ ç­¾å
   * @param { Object } attrs æ°åå»ºçåç´ çå±æ§key-valueéå
   * @return { Element } æ°åå»ºçåç´ å¯¹è±¡
   * @example
   * ```javascript
   * var ele = UE.dom.domUtils.createElement( document, 'div', {
   *     id: 'test'
   * } );
   *
   * //output: DIV
   * console.log( ele.tagName );
   *
   * //output: test
   * console.log( ele.id );
   *
   * ```
   */
    createElement(doc, tag, attrs) {
        return domUtils.setAttributes(doc.createElement(tag), attrs)
    },
    /**
   * ä¸ºèç¹nodeæ·»å å±æ§attrsï¼attrsä¸ºå±æ§é®å¼å¯¹
   * @method setAttributes
   * @param { Element } node éè¦è®¾ç½®å±æ§çåç´ å¯¹è±¡
   * @param { Object } attrs éè¦è®¾ç½®çå±æ§å-å¼å¯¹
   * @return { Element } è®¾ç½®å±æ§çåç´ å¯¹è±¡
   * @example
   * ```html
   * <span id="test"></span>
   *
   * <script>
   *
   *     var testNode = UE.dom.domUtils.setAttributes( document.getElementById( "test" ), {
   *         id: 'demo'
   *     } );
   *
   *     //output: demo
   *     console.log( testNode.id );
   *
   * </script>
   *
   */
    setAttributes(node, attrs) {
        for (let attr in attrs) {
            if (attrs.hasOwnProperty(attr)) {
                let value = attrs[attr]
                switch (attr) {
                    case 'class':
                        // ieä¸è¦è¿æ ·èµå¼ï¼setAttributeä¸èµ·ä½ç¨
                        node.className = value
                        break
                    case 'style':
                        node.style.cssText = node.style.cssText + ';' + value
                        break
                    case 'innerHTML':
                        node[attr] = value
                        break
                    case 'value':
                        node.value = value
                        break
                    default:
                        node.setAttribute(attrFix[attr] || attr, value)
                }
            }
        }
        return node
    },

    /**
   * è·ååç´ elementç»è¿è®¡ç®åçæ ·å¼å¼
   * @method getComputedStyle
   * @param { Element } element éè¦è·åæ ·å¼çåç´ å¯¹è±¡
   * @param { String } styleName éè¦è·åçæ ·å¼å
   * @return { String } è·åå°çæ ·å¼å¼
   * @example
   * ```html
   * <style type="text/css">
   *      #test {
   *          font-size: 15px;
   *      }
   * </style>
   *
   * <span id="test"></span>
   *
   * <script>
   *     //output: 15px
   *     console.log( UE.dom.domUtils.getComputedStyle( document.getElementById( "test" ), 'font-size' ) );
   * </script>
   * ```
   */
    getComputedStyle(element, styleName) {
    // ä¸ä¸çå±æ§åç¬å¤ç
        let pros = 'width height top left'

        if (pros.indexOf(styleName) > -1) {
            return (
                element[
                'offset'
          + styleName.replace(/^\w/, (s) => s.toUpperCase())
                ] + 'px'
            )
        }
        // å¿½ç¥ææ¬èç¹
        if (element.nodeType == 3) {
            element = element.parentNode
        }
        try {
            // eslint-disable-next-line vars-on-top
            // eslint-disable-next-line no-var
            var value = domUtils.getStyle(element, styleName)
        || (window.getComputedStyle
            ? window.getComputedStyle(element, '')
            .getPropertyValue(styleName)
            : (element.currentStyle || element.style)[
            utils.cssStyleToDomStyle(styleName)
            ])
        } catch (e) {
            return ''
        }
        // eslint-disable-next-line block-scoped-var
        return utils.transUnitToPx(utils.fixColor(styleName, value))
    },
    /**
   * å¤æ­åç´ elementæ¯å¦åå«ç»å®çæ ·å¼ç±»åclassName
   * @method hasClass
   * @param { Node } ele éè¦æ£æµçåç´ 
   * @param { String } classNames éè¦æ£æµçclassNameï¼ å¤ä¸ªclassNameä¹é´ç¨ç©ºæ ¼åå²
   * @return { Boolean } åç´ æ¯å¦åå«ææç»å®çclassName
   * @example
   * ```html
   * <span id="test1" class="cls1 cls2"></span>
   *
   * <script>
   *     var test1 = document.getElementById("test1");
   *
   *     //output: false
   *     console.log( UE.dom.domUtils.hasClass( test1, "cls2 cls1 cls3" ) );
   *
   *     //output: true
   *     console.log( UE.dom.domUtils.hasClass( test1, "cls2 cls1" ) );
   * </script>
   * ```
   */

    /**
   * å¤æ­åç´ elementæ¯å¦åå«ç»å®çæ ·å¼ç±»åclassName
   * @method hasClass
   * @param { Node } ele éè¦æ£æµçåç´ 
   * @param { Array } classNames éè¦æ£æµçclassNameæ°ç»
   * @return { Boolean } åç´ æ¯å¦åå«ææç»å®çclassName
   * @example
   * ```html
   * <span id="test1" class="cls1 cls2"></span>
   *
   * <script>
   *     var test1 = document.getElementById("test1");
   *
   *     //output: false
   *     console.log( UE.dom.domUtils.hasClass( test1, [ "cls2", "cls1", "cls3" ] ) );
   *
   *     //output: true
   *     console.log( UE.dom.domUtils.hasClass( test1, [ "cls2", "cls1" ]) );
   * </script>
   * ```
   */
    hasClass(element, className) {
        if (utils.isRegExp(className)) {
            return className.test(element.className)
        }
        className = utils.trim(className).replace(/[ ]{2,}/g, ' ').split(' ')
        // eslint-disable-next-line vars-on-top
        // eslint-disable-next-line no-var
        for (var i = 0, ci, cls = element.className;
            (ci = className[i++]);) {
            if (!new RegExp('\\b' + ci + '\\b', 'i').test(cls)) {
                return false
            }
        }
        // eslint-disable-next-line block-scoped-var
        return i - 1 == className.length
    },
    /**
   * å¤æ­ç»å®èç¹æ¯å¦ä¸ºbr
   * @method isBr
   * @param { Node } node éè¦å¤æ­çèç¹å¯¹è±¡
   * @return { Boolean } ç»å®çèç¹æ¯å¦æ¯brèç¹
   */
    isBr(node) {
        return node.nodeType == 1 && node.tagName == 'BR'
    },
    /**
   * å¤æ­ç»å®çèç¹æ¯å¦æ¯ä¸ä¸ªâå¡«åâèç¹
   * @private
   * @method isFillChar
   * @param { Node } node éè¦å¤æ­çèç¹
   * @param { Boolean } isInStart æ¯å¦ä»èç¹åå®¹çå¼å§ä½ç½®å¹é
   * @returns { Boolean } èç¹æ¯å¦æ¯å¡«åèç¹
   */
    isFillChar(node, isInStart) {
        if (node.nodeType != 3) return false
        let text = node.nodeValue
        if (isInStart) {
            return new RegExp('^' + domUtils.fillChar).test(text)
        }
        return !text.replace(new RegExp(domUtils.fillChar, 'g'), '').length
    },
})

export default domUtils