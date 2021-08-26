<template>
    <svg class="grid" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <pattern id="smallGrid" width="7.236328125" height="7.236328125" patternUnits="userSpaceOnUse">
                <path
                    d="M 7.236328125 0 L 0 0 0 7.236328125"
                    fill="none"
                    stroke="rgba(207, 207, 207, 0.3)"
                    stroke-width="1">
                </path>
            </pattern>
            <pattern id="grid" width="36.181640625" height="36.181640625" patternUnits="userSpaceOnUse">
                <rect width="36.181640625" height="36.181640625" fill="url(#smallGrid)"></rect>
                <path
                    d="M 36.181640625 0 L 0 0 0 36.181640625"
                    fill="none"
                    stroke="rgba(186, 186, 186, 0.5)"
                    stroke-width="1">
                </path>
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)"></rect>
    </svg>
</template>
<script>
import PDFJS from 'pdfjs-dist'
import { TextLayerBuilder } from 'pdfjs-dist/web/pdf_viewer.js'
import 'pdfjs-dist/web/pdf_viewer.css'

import Range from '@/utils/Range'
import domUtils from '@/utils/domUtils'

PDFJS.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.js'
let container
export default {
    name: 'Grid',
    mounted() {
        this.$nextTick(() => {
            // eslint-disable-next-line operator-linebreak
            let url =
                // '/src/assets/d2.pdf'
                'http://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'
            this.getPDF(url)
        })
        document.addEventListener('mouseup', this.getSelectText, true)
    },
    methods: {
        getText() {
            let userSelection, selectedText = ''
            if (window.getSelection) { // 现代浏览器
                userSelection = window.getSelection()
                selectedText = userSelection.toString()
            } else if (document.selection) { // 老IE浏览器
                userSelection = document.selection.createRange()
                selectedText = userSelection.text
            }
            // eslint-disable-next-line no-console
            console.log(selectedText)
        },
        async getPDF(url) {
            let pdf = await PDFJS.getDocument(url)
            container = container || document.querySelector('#container')
            for (let i = 0; i < pdf.numPages; i++) {
                try {
                    await this.rendPDF(pdf, i)
                } catch (e) {
                    // console.error(e)
                }
            }
        },
        getSelectText() {
            let getRange = () => {
                let me = window
                let range = new Range(me.document)

                let sel = window.getSelection()
                if (sel && sel.rangeCount) {
                    let firstRange = sel.getRangeAt(0)
                    let lastRange = sel.getRangeAt(sel.rangeCount - 1)

                    range.setStart(firstRange.startContainer, firstRange.startOffset)
                    range.setEnd(lastRange.endContainer, lastRange.endOffset)
                }
                return range
            }

            let range = getRange()
            // eslint-disable-next-line no-console
            console.log(range, range.startContainer.parentNode)
            // console.log(domUtils.hasClass(range.startContainer.parentNode, 'color-red'));
            // 如果选中父节点包含 color-red 的class 则移除带 color-red 的 i标签，否则则添加i标签进行选中
            if (domUtils.hasClass(range.startContainer.parentNode, 'color-red')) {
                range.removeInlineStyle('i', 'color-red')
            } else {
                range.applyInlineStyle('i', {
                    class: 'color-red',
                })
                range.select()
            }
        },
        async rendPDF(pdf, num) {
            let page = await pdf.getPage(num)
            // 设置展示比例
            let scale = 1.5
            let viewport = page.getViewport(scale)

            let pageDiv = document.createElement('div')
            pageDiv.setAttribute('id', 'page-' + (page.pageIndex + 1))
            pageDiv.setAttribute('style', 'position: relative')
            container.appendChild(pageDiv)

            let canvas = document.createElement('canvas')
            pageDiv.appendChild(canvas)
            let context = canvas.getContext('2d')
            canvas.height = viewport.height
            canvas.width = viewport.width

            let renderContext = {
                canvasContext: context,
                viewport,
            }

            await page.render(renderContext)
            // debugger
            let textContent = await page.getTextContent()
            // 创建文本图层div
            const textLayerDiv = document.createElement('div')
            textLayerDiv.setAttribute('class', 'textLayer')
            textLayerDiv.setAttribute('style', `width: ${viewport.width}px; margin: 0 auto;`)
            // 将文本图层div添加至每页pdf的div中
            pageDiv.appendChild(textLayerDiv)

            // 创建新的TextLayerBuilder实例
            let textLayer = new TextLayerBuilder({
                textLayerDiv,
                pageIndex: page.pageIndex,
                viewport,
            })

            textLayer.setTextContent(textContent)

            textLayer.render()
        },
    },
}
</script>
<style lang="scss" scoped>
.grid {
    position: absolute;
    top: 0;
    left: 0;
}
</style>