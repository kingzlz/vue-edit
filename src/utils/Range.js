/* eslint-disable no-cond-assign */
/* eslint-disable no-var */
/* eslint-disable block-scoped-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-redeclare */
/* eslint-disable no-console */
/* eslint-disable no-useless-escape */
/* eslint-disable no-constant-condition */
/* eslint-disable no-irregular-whitespace */
import browser from './browser.js'
import utils from './utils.js'
import dtd from './dtd.js'
import domUtils from './domUtils.js'

let fillCharReg = new RegExp(domUtils.fillChar, 'g')

let guid = 0,
    fillChar = domUtils.fillChar,
    fillData

function updateCollapse(range) {
    range.collapsed = range.startContainer
        && range.endContainer
        && range.startContainer === range.endContainer
        && range.startOffset == range.endOffset
}

function selectOneNode(rng) {
    return (
        !rng.collapsed
        && rng.startContainer.nodeType == 1
        && rng.startContainer === rng.endContainer
        && rng.endOffset - rng.startOffset == 1
    )
}

function setEndPoint(toStart, node, offset, range) {
    if (
        node.nodeType == 1
        && (dtd.$empty[node.tagName] || dtd.$nonChild[node.tagName])
    ) {
        offset = domUtils.getNodeIndex(node) + (toStart ? 0 : 1)
        node = node.parentNode
    }
    if (toStart) {
        range.startContainer = node
        range.startOffset = offset
        if (!range.endContainer) {
            range.collapse(true)
        }
    } else {
        range.endContainer = node
        range.endOffset = offset
        if (!range.startContainer) {
            range.collapse(false)
        }
    }
    updateCollapse(range)
    return range
}

function execContentsAction(range, action) {
    // è°æ´è¾¹ç
    // range.includeBookmark();
    let start = range.startContainer,
        end = range.endContainer,
        startOffset = range.startOffset,
        endOffset = range.endOffset,
        doc = document,
        frag = doc.createDocumentFragment(),
        tmpStart,
        tmpEnd
    if (start.nodeType == 1) {
        start = start.childNodes[startOffset]
            || (tmpStart = start.appendChild(doc.createTextNode('')))
    }
    if (end.nodeType == 1) {
        end = end.childNodes[endOffset]
            || (tmpEnd = end.appendChild(doc.createTextNode('')))
    }
    if (start === end && start.nodeType == 3) {
        frag.appendChild(
            doc.createTextNode(
                start.substringData(startOffset, endOffset - startOffset),
            ),
        )
        // is not clone
        if (action) {
            start.deleteData(startOffset, endOffset - startOffset)
            range.collapse(true)
        }
        return frag
    }
    let current,
        currentLevel,
        clone = frag,
        startParents = domUtils.findParents(start, true),
        endParents = domUtils.findParents(end, true)
    // eslint-disable-next-line no-var
    for (var i = 0; startParents[i] == endParents[i];) {
        i++
    }
    // eslint-disable-next-line no-var
    for (var j = i, si;
        // eslint-disable-next-line no-cond-assign
        (si = startParents[j]); j++) {
        current = si.nextSibling
        if (si == start) {
            if (!tmpStart) {
                if (range.startContainer.nodeType == 3) {
                    clone.appendChild(
                        doc.createTextNode(start.nodeValue.slice(startOffset)),
                    )
                    // is not clone
                    if (action) {
                        start.deleteData(
                            startOffset,
                            start.nodeValue.length - startOffset,
                        )
                    }
                } else {
                    clone.appendChild(!action ? start.cloneNode(true) : start)
                }
            }
        } else {
            currentLevel = si.cloneNode(false)
            clone.appendChild(currentLevel)
        }
        while (current) {
            if (current === end || current === endParents[j]) {
                break
            }
            si = current.nextSibling
            clone.appendChild(!action ? current.cloneNode(true) : current)
            current = si
        }
        clone = currentLevel
    }
    clone = frag
    if (!startParents[i]) {
        clone.appendChild(startParents[i - 1].cloneNode(false))
        clone = clone.firstChild
    }
    // eslint-disable-next-line no-redeclare
    for (var j = i, ei;
        (ei = endParents[j]); j++) {
        current = ei.previousSibling
        if (ei == end) {
            if (!tmpEnd && range.endContainer.nodeType == 3) {
                clone.appendChild(
                    doc.createTextNode(end.substringData(0, endOffset)),
                )
                // is not clone
                if (action) {
                    end.deleteData(0, endOffset)
                }
            }
        } else {
            currentLevel = ei.cloneNode(false)
            clone.appendChild(currentLevel)
        }
        // å¦æä¸¤ç«¯åçº§ï¼å³è¾¹ç¬¬ä¸æ¬¡å·²ç»è¢«å¼å§åäº
        if (j != i || !startParents[i]) {
            while (current) {
                if (current === start) {
                    break
                }
                ei = current.previousSibling
                clone.insertBefore(
                    !action ? current.cloneNode(true) : current,
                    clone.firstChild,
                )
                current = ei
            }
        }
        clone = currentLevel
    }
    if (action) {
        range
        .setStartBefore(
            !endParents[i]
                ? endParents[i - 1]
                : !startParents[i] ? startParents[i - 1] : endParents[i],
        )
        .collapse(true)
    }
    tmpStart && domUtils.remove(tmpStart)
    tmpEnd && domUtils.remove(tmpEnd)
    return frag
}
// eslint-disable-next-line import/no-mutable-exports
let Range = (function () {
    let me = window
    // eslint-disable-next-line no-multi-assign
    me.startContainer = me.startOffset = me.endContainer = me.endOffset = null
    me.collapsed = true
})

/**
 * å é¤fillData
 * @param doc
 * @param excludeNode
 */
function removeFillData(doc, excludeNode) {
    try {
        if (fillData && domUtils.inDoc(fillData, doc)) {
            if (!fillData.nodeValue.replace(fillCharReg, '').length) {
                let tmpNode = fillData.parentNode
                domUtils.remove(fillData)
                while (
                    tmpNode
                    && domUtils.isEmptyInlineElement(tmpNode)
                    // safariçcontainsæbug
                    && (!tmpNode.contains(excludeNode))
                ) {
                    fillData = tmpNode.parentNode
                    domUtils.remove(tmpNode)
                    tmpNode = fillData
                }
            } else {
                fillData.nodeValue = fillData.nodeValue.replace(fillCharReg, '')
            }
        }
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e)
    }
}

/**
 * @param node
 * @param dir
 */
function mergeSibling(node, dir) {
    let tmpNode
    node = node[dir]
    while (node && domUtils.isFillChar(node)) {
        tmpNode = node[dir]
        domUtils.remove(node)
        node = tmpNode
    }
}

Range.prototype = {
    /**
     * å°å½åéåºçåå®¹æåå°ä¸ä¸ªDocumentFragmenté
     * @method extractContents
     * @remind æ§è¡è¯¥æä½åï¼ éåºå°åæé­åç¶æ
     * @warning æ§è¡è¯¥æä½åï¼ åæ¥éåºæéä¸­çåå®¹å°ä»domæ ä¸å¥ç¦»åºæ¥
     * @return { DocumentFragment } è¿ååå«ææååå®¹çDocumentFragmentå¯¹è±¡
     * @example
     * ```html
     * <body>
     *      <!-- ä¸­æ¬å·è¡¨ç¤ºéåº -->
     *      <b>x<i>x[x</i>xx]x</b>
     *
     *      <script>
     *          //rangeæ¯å·²éä¸­çéåº
     *          var fragment = range.extractContents(),
     *              node = document.createElement( "div" );
     *
     *          node.appendChild( fragment );
     *
     *          //ç«çº¿è¡¨ç¤ºé­ååçéåºä½ç½®
     *
     *          //output: <b>x<i>x</i>|x</b>
     *          console.log( document.body.innerHTML );
     *          //output: <i>x</i>xx
     *          console.log( node.innerHTML );
     *
     *          //æ­¤æ¶ï¼ rangeçåé¡¹å±æ§ä¸º
     *          //output: B
     *          console.log( range.startContainer.tagName );
     *          //output: 2
     *          console.log( range.startOffset );
     *          //output: B
     *          console.log( range.endContainer.tagName );
     *          //output: 2
     *          console.log( range.endOffset );
     *          //output: true
     *          console.log( range.collapsed );
     *
     *      </script>
     * </body>
     */
    extractContents() {
        return this.collapsed ? null : execContentsAction(this, 2)
    },

    /**
     * è®¾ç½®Rangeçå¼å§å®¹å¨èç¹ååç§»é
     * @method  setStart
     * @remind å¦æç»å®çèç¹æ¯åç´ èç¹ï¼é£ä¹offsetæçæ¯å¶å­åç´ ä¸­ç´¢å¼ä¸ºoffsetçåç´ ï¼
     *          å¦ææ¯ææ¬èç¹ï¼é£ä¹offsetæçæ¯å¶ææ¬åå®¹çç¬¬offsetä¸ªå­ç¬¦
     * @remind å¦ææä¾çå®¹å¨èç¹æ¯ä¸ä¸ªä¸è½åå«å­åç´ çèç¹ï¼ åè¯¥éåºçå¼å§å®¹å¨å°è¢«è®¾ç½®
     *          ä¸ºè¯¥èç¹çç¶èç¹ï¼ æ­¤æ¶ï¼ å¶è·ç¦»å¼å§å®¹å¨çåç§»éä¹åæäºè¯¥èç¹å¨å¶ç¶èç¹
     *          ä¸­çç´¢å¼
     * @param { Node } node å°è¢«è®¾ä¸ºå½åéåºå¼å§è¾¹çå®¹å¨çèç¹å¯¹è±¡
     * @param { int } offset éåºçå¼å§ä½ç½®åç§»é
     * @return { UE.dom.Range } å½årangeå¯¹è±¡
     * @example
     * ```html
     * <!-- éåº -->
     * <b>xxx<i>x<span>xx</span>xx<em>xx</em>xxx</i>[xxx]</b>
     *
     * <script>
     *
     *     //æ§è¡æä½
     *     range.setStart( document.getElementsByTagName("i")[0], 1 );
     *
     *     //æ­¤æ¶ï¼ éåºåæäº
     *     //<b>xxx<i>x[<span>xx</span>xx<em>xx</em>xxx</i>xxx]</b>
     *
     * </script>
     * ```
     * @example
     * ```html
     * <!-- éåº -->
     * <b>xxx<img>[xx]x</b>
     *
     * <script>
     *
     *     //æ§è¡æä½
     *     range.setStart( document.getElementsByTagName("img")[0], 3 );
     *
     *     //æ­¤æ¶ï¼ éåºåæäº
     *     //<b>xxx[<img>xx]x</b>
     *
     * </script>
     * ```
     */
    setStart(node, offset) {
        return setEndPoint(true, node, offset, this)
    },

    /**
     * è®¾ç½®Rangeçç»æå®¹å¨ååç§»é
     * @method  setEnd
     * @param { Node } node ä½ä¸ºå½åéåºç»æè¾¹çå®¹å¨çèç¹å¯¹è±¡
     * @param { int } offset ç»æè¾¹ççåç§»é
     * @see UE.dom.Range:setStart(Node,int)
     * @return { UE.dom.Range } å½årangeå¯¹è±¡
     */
    setEnd(node, offset) {
        return setEndPoint(false, node, offset, this)
    },

    setStartAfter(node) {
        return this.setStart(node.parentNode, domUtils.getNodeIndex(node) + 1)
    },

    setStartBefore(node) {
        return this.setStart(node.parentNode, domUtils.getNodeIndex(node))
    },

    setEndAfter(node) {
        return this.setEnd(node.parentNode, domUtils.getNodeIndex(node) + 1)
    },

    setEndBefore(node) {
        return this.setEnd(node.parentNode, domUtils.getNodeIndex(node))
    },

    cloneRange() {
        let me = this
        return new Range(me.document)
        .setStart(me.startContainer, me.startOffset)
        .setEnd(me.endContainer, me.endOffset)
    },

    collapse(toStart) {
        let me = this
        if (toStart) {
            me.endContainer = me.startContainer
            me.endOffset = me.startOffset
        } else {
            me.startContainer = me.endContainer
            me.startOffset = me.endOffset
        }
        me.collapsed = true
        return me
    },

    shrinkBoundary(ignoreEnd) {
        let me = this,
            child,
            collapsed = me.collapsed

        function check(node) {
            return (
                node.nodeType == 1
                && !domUtils.isBookmarkNode(node)
                && !dtd.$empty[node.tagName]
                && !dtd.$nonChild[node.tagName]
            )
        }
        while (
            me.startContainer.nodeType == 1 // æ¯element
            && (child = me.startContainer.childNodes[me.startOffset]) // å­èç¹ä¹æ¯element
            && check(child)
        ) {
            me.setStart(child, 0)
        }
        if (collapsed) {
            return me.collapse(true)
        }
        if (!ignoreEnd) {
            while (
                me.endContainer.nodeType == 1 // æ¯element
                && me.endOffset > 0
                // å¦ææ¯ç©ºåç´ å°±éåº endOffset=0é£ä¹endOffst-1ä¸ºè´å¼ï¼childNodes[endOffset]æ¥é
                && (child = me.endContainer.childNodes[me.endOffset - 1]) // å­èç¹ä¹æ¯element
                && check(child)
            ) {
                me.setEnd(child, child.childNodes.length)
            }
        }
        return me
    },

    trimBoundary(ignoreEnd) {
        this.txtToElmBoundary()
        let start = this.startContainer,
            offset = this.startOffset,
            collapsed = this.collapsed,
            end = this.endContainer
        if (start.nodeType == 3) {
            if (offset == 0) {
                this.setStartBefore(start)
            } else if (offset >= start.nodeValue.length) {
                this.setStartAfter(start)
            } else {
                let textNode = domUtils.split(start, offset)
                // è·æ°ç»æè¾¹ç
                if (start === end) {
                    this.setEnd(textNode, this.endOffset - offset)
                } else if (start.parentNode === end) {
                    this.endOffset += 1
                }
                this.setStartBefore(textNode)
            }
            if (collapsed) {
                return this.collapse(true)
            }
        }
        if (!ignoreEnd) {
            offset = this.endOffset
            end = this.endContainer
            if (end.nodeType == 3) {
                if (offset == 0) {
                    this.setEndBefore(end)
                } else {
                    offset < end.nodeValue.length && domUtils.split(end, offset)
                    this.setEndAfter(end)
                }
            }
        }
        return this
    },

    /**
     * å¦æéåºå¨ææ¬çè¾¹çä¸ï¼å°±æ©å±éåºå°ææ¬çç¶èç¹ä¸, å¦æå½åéåºæ¯é­åçï¼ åä»ä¹ä¹ä¸å
     * @method txtToElmBoundary
     * @remind è¯¥æä½ä¸ä¼ä¿®æ¹domèç¹
     * @return { UE.dom.Range } å½årangeå¯¹è±¡
     */

    /**
     * å¦æéåºå¨ææ¬çè¾¹çä¸ï¼å°±æ©å±éåºå°ææ¬çç¶èç¹ä¸, å¦æå½åéåºæ¯é­åçï¼ åæ ¹æ®åæ°é¡¹
     * ignoreCollapsed çå¼å³å®æ¯å¦æ§è¡è¯¥è°æ´
     * @method txtToElmBoundary
     * @param { Boolean } ignoreCollapsed æ¯å¦å¿½ç¥éåºçé­åç¶æï¼ å¦æè¯¥åæ°åå¼ä¸ºtrueï¼ å
     *                      ä¸è®ºéåºæ¯å¦é­åï¼ é½ä¼æ§è¡è¯¥æä½ï¼ åä¹ï¼ åä¸ä¼å¯¹é­åçéåºæ§è¡è¯¥æä½
     * @return { UE.dom.Range } å½årangeå¯¹è±¡
     */
    txtToElmBoundary(ignoreCollapsed) {
        function adjust(r, c) {
            let container = r[c + 'Container'],
                offset = r[c + 'Offset']
            if (container.nodeType == 3) {
                if (!offset) {
                    r[
                    'set'
                        + c.replace(/(\w)/, (a) => a.toUpperCase())
                        + 'Before'
                    ](container)
                } else if (offset >= container.nodeValue.length) {
                    r[
                    'set'
                        + c.replace(/(\w)/, (a) => a.toUpperCase())
                        + 'After'
                    ](container)
                }
            }
        }

        if (ignoreCollapsed || !this.collapsed) {
            adjust(this, 'start')
            adjust(this, 'end')
        }
        return this
    },

    /**
     * å¨å½åéåºçå¼å§ä½ç½®åæå¥èç¹ï¼æ°æå¥çèç¹ä¼è¢«è¯¥rangeåå«
     * @method  insertNode
     * @param { Node } node éè¦æå¥çèç¹
     * @remind æå¥çèç¹å¯ä»¥æ¯ä¸ä¸ªDocumentFragmentä¾æ¬¡æå¥å¤ä¸ªèç¹
     * @return { UE.dom.Range } å½årangeå¯¹è±¡
     */
    insertNode(node) {
        let first = node,
            length = 1
        if (node.nodeType == 11) {
            first = node.firstChild
            length = node.childNodes.length
        }
        this.trimBoundary(true)
        let start = this.startContainer,
            offset = this.startOffset
        let nextNode = start.childNodes[offset]
        if (nextNode) {
            start.insertBefore(node, nextNode)
        } else {
            start.appendChild(node)
        }
        if (first.parentNode === this.endContainer) {
            this.endOffset += length
        }
        return this.setStartBefore(first)
    },

    createBookmark(serialize, same) {
        let endNode,
            startNode = document.createElement('span')
        startNode.style.cssText = 'display:none;line-height:0px;'
        startNode.appendChild(document.createTextNode('\u200D'))
        startNode.id = '_baidu_bookmark_start_' + (same ? '' : guid++)

        if (!this.collapsed) {
            endNode = startNode.cloneNode(true)
            endNode.id = '_baidu_bookmark_end_' + (same ? '' : guid++)
        }
        this.insertNode(startNode)
        if (endNode) {
            this.collapse().insertNode(endNode).setEndBefore(endNode)
        }
        this.setStartAfter(startNode)
        return {
            start: serialize ? startNode.id : startNode,
            end: endNode ? (serialize ? endNode.id : endNode) : null,
            id: serialize,
        }
    },

    moveToBookmark(bookmark) {
        let start = bookmark.id
                ? document.getElementById(bookmark.start)
                : bookmark.start,
            end = bookmark.end && bookmark.id
                ? document.getElementById(bookmark.end)
                : bookmark.end
        this.setStartBefore(start)
        domUtils.remove(start)
        if (end) {
            this.setEndBefore(end)
            domUtils.remove(end)
        } else {
            this.collapse(true)
        }
        return this
    },
    enlarge(toBlock, stopFn) {
        let isBody = domUtils.isBody,
            pre,
            node,
            tmp = document.createTextNode('')
        if (toBlock) {
            node = this.startContainer
            if (node.nodeType == 1) {
                if (node.childNodes[this.startOffset]) {
                    // eslint-disable-next-line no-multi-assign
                    pre = node = node.childNodes[this.startOffset]
                } else {
                    node.appendChild(tmp)
                    // eslint-disable-next-line no-multi-assign
                    pre = node = tmp
                }
            } else {
                pre = node
            }
            while (1) {
                if (domUtils.isBlockElm(node)) {
                    node = pre
                    while ((pre = node.previousSibling) && !domUtils.isBlockElm(pre)) {
                        node = pre
                    }
                    this.setStartBefore(node)
                    break
                }
                pre = node
                node = node.parentNode
            }
            node = this.endContainer
            if (node.nodeType == 1) {
                if ((pre = node.childNodes[this.endOffset])) {
                    node.insertBefore(tmp, pre)
                } else {
                    node.appendChild(tmp)
                }
                // eslint-disable-next-line no-multi-assign
                pre = node = tmp
            } else {
                pre = node
            }
            while (1) {
                if (domUtils.isBlockElm(node)) {
                    node = pre
                    while ((pre = node.nextSibling) && !domUtils.isBlockElm(pre)) {
                        node = pre
                    }
                    this.setEndAfter(node)
                    break
                }
                pre = node
                node = node.parentNode
            }
            if (tmp.parentNode === this.endContainer) {
                this.endOffset--
            }
            domUtils.remove(tmp)
        }

        // æ©å±è¾¹çå°æå¤§
        if (!this.collapsed) {
            while (this.startOffset == 0) {
                if (stopFn && stopFn(this.startContainer)) {
                    break
                }
                if (isBody(this.startContainer)) {
                    break
                }
                this.setStartBefore(this.startContainer)
            }
            while (
                this.endOffset
                == (this.endContainer.nodeType == 1
                    ? this.endContainer.childNodes.length
                    : this.endContainer.nodeValue.length)
            ) {
                if (stopFn && stopFn(this.endContainer)) {
                    break
                }
                if (isBody(this.endContainer)) {
                    break
                }
                this.setEndAfter(this.endContainer)
            }
        }
        return this
    },

    adjustmentBoundary() {
        if (!this.collapsed) {
            while (
                !domUtils.isBody(this.startContainer)
                && this.startOffset
                == this.startContainer[
                this.startContainer.nodeType == 3 ? 'nodeValue' : 'childNodes'
                ].length
                && this.startContainer[
                this.startContainer.nodeType == 3 ? 'nodeValue' : 'childNodes'
                ].length
            ) {
                this.setStartAfter(this.startContainer)
            }
            while (
                !domUtils.isBody(this.endContainer)
                && !this.endOffset
                && this.endContainer[
                this.endContainer.nodeType == 3 ? 'nodeValue' : 'childNodes'
                ].length
            ) {
                this.setEndBefore(this.endContainer)
            }
        }
        return this
    },
    applyInlineStyle(tagName, attrs, list) {
        if (this.collapsed) return this
        this.trimBoundary()
        .enlarge(false, (node) => node.nodeType == 1 && domUtils.isBlockElm(node))
        .adjustmentBoundary()
        let bookmark = this.createBookmark(),
            end = bookmark.end,
            filterFn = function (node) {
                return node.nodeType == 1
                    ? node.tagName.toLowerCase() != 'br'
                    : !domUtils.isWhitespace(node)
            },
            current = domUtils.getNextDomNode(bookmark.start, false, filterFn),
            node,
            pre,
            range = this.cloneRange()
        while (
            current
            // eslint-disable-next-line no-bitwise
            && domUtils.getPosition(current, end) & domUtils.POSITION_PRECEDING
        ) {
            if (current.nodeType == 3 || dtd[tagName][current.tagName]) {
                range.setStartBefore(current)
                node = current
                while (
                    node
                    && (node.nodeType == 3 || dtd[tagName][node.tagName])
                    && node !== end
                ) {
                    pre = node
                    node = domUtils.getNextDomNode(
                        node,
                        node.nodeType == 1,
                        null,
                        (parent) => dtd[tagName][parent.tagName],
                    )
                }
                var frag = range.setEndAfter(pre).extractContents(),
                    elm
                if (list && list.length > 0) {
                    var level, top
                    // eslint-disable-next-line no-multi-assign
                    top = level = list[0].cloneNode(false)
                    for (var i = 1, ci;
                        (ci = list[i++]);) {
                        level.appendChild(ci.cloneNode(false))
                        level = level.firstChild
                    }
                    elm = level
                } else {
                    elm = document.createElement(tagName)
                }
                if (attrs) {
                    domUtils.setAttributes(elm, attrs)
                }
                elm.appendChild(frag)
                // éå¯¹åµå¥spançå¨å±æ ·å¼æå®ï¼åå®¹éå¤ç
                if (elm.tagName == 'SPAN' && attrs && attrs.style) {
                    utils.each(elm.getElementsByTagName('span'), (s) => {
                        s.style.cssText = s.style.cssText + ';' + attrs.style
                    })
                }
                range.insertNode(list ? top : elm)
                // å¤çä¸æ»çº¿å¨aä¸çæåµ
                var aNode
                if (
                    tagName == 'span'
                    && attrs.style
                    && /text\-decoration/.test(attrs.style)
                    && (aNode = domUtils.findParentByTagName(elm, 'a', true))
                ) {
                    domUtils.setAttributes(aNode, attrs)
                    domUtils.remove(elm, true)
                    elm = aNode
                } else {
                    domUtils.mergeSibling(elm)
                    domUtils.clearEmptySibling(elm)
                }
                // å»é¤å­èç¹ç¸åç
                domUtils.mergeChild(elm, attrs)
                current = domUtils.getNextDomNode(elm, false, filterFn)
                domUtils.mergeToParent(elm)
                if (node === end) {
                    break
                }
            } else {
                current = domUtils.getNextDomNode(current, true, filterFn)
            }
        }
        return this.moveToBookmark(bookmark)
    },
    removeInlineStyle(tagNames, className) {
        if (this.collapsed) return this
        tagNames = utils.isArray(tagNames) ? tagNames : [tagNames]
        this.shrinkBoundary().adjustmentBoundary()
        let start = this.startContainer,
            end = this.endContainer
        while (1) {
            if (start.nodeType == 1) {
                if (utils.indexOf(tagNames, start.tagName.toLowerCase()) > -1) {
                    break
                }
                if (start.tagName.toLowerCase() == 'body') {
                    start = null
                    break
                }
            }
            start = start.parentNode
        }
        while (1) {
            if (end.nodeType == 1) {
                if (utils.indexOf(tagNames, end.tagName.toLowerCase()) > -1) {
                    break
                }
                if (end.tagName.toLowerCase() == 'body') {
                    end = null
                    break
                }
            }
            end = end.parentNode
        }
        let bookmark = this.createBookmark(),
            frag,
            tmpRange
        if (start) {
            tmpRange = this.cloneRange()
            .setEndBefore(bookmark.start)
            .setStartBefore(start)
            frag = tmpRange.extractContents()
            tmpRange.insertNode(frag)
            domUtils.clearEmptySibling(start, true)
            start.parentNode.insertBefore(bookmark.start, start)
        }
        if (end) {
            tmpRange = this.cloneRange()
            .setStartAfter(bookmark.end)
            .setEndAfter(end)
            frag = tmpRange.extractContents()
            tmpRange.insertNode(frag)
            domUtils.clearEmptySibling(end, false, true)
            end.parentNode.insertBefore(bookmark.end, end.nextSibling)
        }
        let current = domUtils.getNextDomNode(bookmark.start, false, (
                node,
            ) => node.nodeType == 1),
            next
        while (current && current !== bookmark.end) {
            next = domUtils.getNextDomNode(current, true, (node) => node.nodeType == 1)
            if (utils.indexOf(tagNames, current.tagName.toLowerCase()) > -1 && current.className
                === className) {
                domUtils.remove(current, true)
            }
            current = next
        }
        return this.moveToBookmark(bookmark)
    },
    getClosedNode() {
        let node
        if (!this.collapsed) {
            let range = this.cloneRange().adjustmentBoundary().shrinkBoundary()
            if (selectOneNode(range)) {
                let child = range.startContainer.childNodes[range.startOffset]
                if (
                    child
                    && child.nodeType == 1
                    && (dtd.$empty[child.tagName] || dtd.$nonChild[child.tagName])
                ) {
                    node = child
                }
            }
        }
        return node
    },
    select: browser.ie
        ? function (noFillData, textRange) {
            let nativeRange
            if (!this.collapsed) this.shrinkBoundary()
            let node = this.getClosedNode()
            if (node && !textRange) {
                try {
                    nativeRange = document.body.createControlRange()
                    nativeRange.addElement(node)
                    nativeRange.select()
                } catch (e) {
                    console.error(e)
                }
                return this
            }
            let bookmark = this.createBookmark(),
                start = bookmark.start,
                end
            nativeRange = document.body.createTextRange()
            nativeRange.moveToElementText(start)
            nativeRange.moveStart('character', 1)
            if (!this.collapsed) {
                let nativeRangeEnd = document.body.createTextRange()
                end = bookmark.end
                nativeRangeEnd.moveToElementText(end)
                nativeRange.setEndPoint('EndToEnd', nativeRangeEnd)
            } else if (!noFillData && this.startContainer.nodeType != 3) {
                // ä½¿ç¨<span>|x<span>åºå®ä½åæ 
                var tmpText = document.createTextNode(fillChar),
                    tmp = document.createElement('span')
                tmp.appendChild(document.createTextNode(fillChar))
                start.parentNode.insertBefore(tmp, start)
                start.parentNode.insertBefore(tmpText, start)
                // å½ç¹b,i,uæ¶ï¼ä¸è½æ¸é¤iä¸è¾¹çb
                removeFillData(document, tmpText)
                fillData = tmpText
                mergeSibling(tmp, 'previousSibling')
                mergeSibling(start, 'nextSibling')
                nativeRange.moveStart('character', -1)
                nativeRange.collapse(true)
            }
            this.moveToBookmark(bookmark)
            tmp && domUtils.remove(tmp)
            // IEå¨éèç¶æä¸ä¸æ¯ærangeæä½ï¼catchä¸ä¸
            try {
                nativeRange.select()
            } catch (e) {
                console.error(e)
            }
            return this
        } : function (notInsertFillData) {
            function checkOffset(rng) {
                function check(node, offset, dir) {
                    if (node.nodeType == 3 && node.nodeValue.length < offset) {
                        rng[dir + 'Offset'] = node.nodeValue.length
                    }
                }
                check(rng.startContainer, rng.startOffset, 'start')
                check(rng.endContainer, rng.endOffset, 'end')
            }
            let win = window,
                sel = win.getSelection(),
                txtNode
            // FFä¸å³é­èªå¨é¿é«æ¶æ»å¨æ¡å¨å³é­dialogæ¶ä¼è·³
            // ffä¸å¦æä¸body.focuså°ä¸è½å®ä½é­ååæ å°ç¼è¾å¨å
            browser.gecko ? document.body.focus() : win.focus()
            if (sel) {
                sel.removeAllRanges()
                // trace:870 chrome/safariåè¾¹æ¯brå¯¹äºé­åå¾rangeä¸è½å®ä½ æä»¥å»æäºå¤æ­
                // this.startContainer.nodeType != 3 &&!
                // ((child = this.startContainer.childNodes[this.startOffset]) && child.nodeType == 1 && child.tagName == 'BR'
                if (this.collapsed && !notInsertFillData) {
                    var start = this.startContainer,
                        child = start
                    if (start.nodeType == 1) {
                        child = start.childNodes[this.startOffset]
                    }
                    if (
                        !(start.nodeType == 3 && this.startOffset)
                        && (child
                            ? !child.previousSibling
                            || child.previousSibling.nodeType != 3
                            : !start.lastChild || start.lastChild.nodeType != 3)
                    ) {
                        txtNode = document.createTextNode(fillChar)
                        // è·çåè¾¹èµ°
                        this.insertNode(txtNode)
                        removeFillData(document, txtNode)
                        mergeSibling(txtNode, 'previousSibling')
                        mergeSibling(txtNode, 'nextSibling')
                        fillData = txtNode
                        this.setStart(txtNode, browser.webkit ? 1 : 0).collapse(true)
                    }
                }
                let nativeRange = document.createRange()
                if (
                    this.collapsed
                    && browser.opera
                    && this.startContainer.nodeType == 1
                ) {
                    var child = this.startContainer.childNodes[this.startOffset]
                    if (!child) {
                        // å¾åé æ¢
                        child = this.startContainer.lastChild
                        if (child && domUtils.isBr(child)) {
                            this.setStartBefore(child).collapse(true)
                        }
                    } else {
                        // ååé æ¢
                        while (child && domUtils.isBlockElm(child)) {
                            if (child.nodeType == 1 && child.childNodes[0]) {
                                child = child.childNodes[0]
                            } else {
                                break
                            }
                        }
                        child && this.setStartBefore(child).collapse(true)
                    }
                }
                // æ¯createAddressæåä¸ä½ç®çä¸åï¼ç°å¨è¿éè¿è¡å¾®è°
                checkOffset(this)
                nativeRange.setStart(this.startContainer, this.startOffset)
                nativeRange.setEnd(this.endContainer, this.endOffset)
                sel.addRange(nativeRange)
            }
            return this
        },
}

export default Range
