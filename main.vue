<script setup lang="ts">
/// <reference types="types-mediawiki" />
import { CdxIcon } from "@wikimedia/codex";
import { cdxIconBrowser } from "@wikimedia/codex-icons";
import { ref } from "vue";

import type * as mwApi from "types-mediawiki-api";


import WikiWindowView from "./WikiWindowView.vue";
import WikiWindowMeta from "./WikiWindowMeta.vue";
import WikiWindowEdit from "./WikiWindowEdit.vue";
import WikiWindowDiff from "./WikiWindowDiff.vue";
import { h, shallowReactive, type Ref, type VNode, type ComponentPublicInstance, type DefineComponent } from "vue";
import type { EmitsOptions, EmitsToProps, ExtractPropTypes, ShortEmitsToObject } from "vue";
import type { ExtractPublicPropTypes } from "vue";
import { Action } from "./actions";
import { emit } from "./events";
import WikiWindow from "./WikiWindow.vue";


type IWikiWindowMeta = InstanceType<typeof WikiWindowMeta>;
type IWikiWindowView = InstanceType<typeof WikiWindowView>;
type IWikiWindow = IWikiWindowMeta | IWikiWindowView;




enum WWState {
    initial = 0,
    select = 1,
    select_input = 2
}


const STATE_COUNT = Object.keys(WWState).filter((key) => isNaN(Number(key))).length;

const state = ref(WWState.initial);
$(document).on("click", "a[href]", (jqe) => {
    const href = jqe.currentTarget.href
    switch (state.value) {
        case WWState.initial:
            break;
        case WWState.select:
            // jQuery's currentTarget is a[href]
            // but the DOM Event's is the document
            resolveLink(href);
            console.log("resolved")
            jqe.originalEvent.preventDefault();
            break;
        case WWState.select_input:
            metaWindow.value?.update(extractTitleFromLink(href));
            jqe.originalEvent.preventDefault();
            break;

    }
});

$(window).on("beforeunload", (jqe) => {
    if (allWindows.length === 0) {
        return;
    }
    jqe.originalEvent.preventDefault();
    (jqe.originalEvent as BeforeUnloadEvent).returnValue = 'Are you sure';
    return '';
})


function extractTitleFromLink(href: string) {
    const url = new URL(href, host);
    const path = url.pathname;
    let title: string;
    if (path.startsWith(articlePathWithout$1)) {
        title = decodeURIComponent(path.substring(articlePathWithout$1.length));
    } else if (path.startsWith(indexPHP)) {
        title = decodeURIComponent(url.searchParams.get("title") ?? "");
    }
    return title;
}

function resolveTitleAction(title: string, action: Action) {
    switch (action) {
        case Action.Edit:
            addWindow(new WikiWindowEditData(title));
            break;
        case Action.History:
            // pushWindowToTop(new WikiWindowViewData(resolveTitleAction(title, Action.History)));
            break;
        case Action.View:
        default:
            addWindow(new WikiWindowViewData(`${articlePathWithout$1}${encodeURI(title)}`));
    }
}

/**
 * 根据一个链接打开一个窗口。
 * 
 * 如果是锚点，则返回false
 * @param href 
 */
function resolveLink(href: string) {
    if (href.startsWith("#")) {
        return false;
    }
    const url = new URL(href, host);
    const path = url.pathname;
    let title: string;
    if (path.startsWith(articlePathWithout$1)) {
        title = decodeURIComponent(path.substring(articlePathWithout$1.length));
    } else if (path.startsWith(indexPHP)) {
        title = decodeURIComponent(url.searchParams.get("title") ?? "");
    }
    
        // curid oldid特判
    const sp = url.searchParams;
    if (sp.get("curid")) {
        addWindow(new WikiWindowDiffData(sp.get('diff'), sp.get("oldid")));
        return;
    }
    if (title.length === 0) {
        return false;
    }
    const titleObj = new mw.Title(title);
    if (titleObj.getNamespaceId() === -1) { // Special
        resolveSpecialPage(titleObj, url);
    } else {
        const actionParam = url.searchParams.get("action");
        switch (actionParam) {
            case "edit":
                addWindow(new WikiWindowEditData(title));
                break;
            case "diff":
                addWindow(new WikiWindowDiffData(
                    url.searchParams.get('to'),
                    url.searchParams.get('from')
                ));
                break;
            case "history":
                resolveLink(url.href);
                break;
            case "view":
            default:
                addWindow(new WikiWindowViewData(href));
        }
    }

}

const specialPageMap = {
    "EditPage": "edit",
    // @ts-expect-error 接受用户自定义过来的
    ...(window.wwSpecialPages ?? {})
}

function resolveSpecialPage(titleObj: mw.Title, url: URL) {
    const type = specialPageMap[titleObj.getMainText().split("/")[0]];
    switch (type) {
        case "edit":
            resolveTitleAction(titleObj.getMainText().substring(5), Action.Edit);
    }
}


function nextState() {
    state.value = (state.value + 1) % STATE_COUNT;
    switch (state.value) {
        case WWState.select_input:
            if (!metaWindow.value) {
                addWindow(metaWindow.value = new WikiWindowMetaData())
            }
    }
}

const shownContainer: Ref<HTMLDivElement | null> = ref(null);
const allWindows = shallowReactive<WikiWindowData<any>[]>([]);
const activeWindows = [];
const metaWindow = ref<WikiWindowMetaData | null>(null);
window.windows = {
    allWindows,
    activeWindows
}

const host = mw.config.get("wgServer"); // https://xx.miraheze.org/ ,etc
const indexPHP = mw.config.get("wgScript"); // /w/index.php
const articlePath = mw.config.get("wgArticlePath"); // /wiki/$1
const articlePathWithout$1 = articlePath.replace("$1", "");
const api = new mw.Api({
    "parameters": {
        "format": "json",
        "formatversion": 2
    }
});

function closeWindow(win: WikiWindowData<any>) {
    removeWindow(win);
    const index = allWindows.indexOf(win);
    if (index === -1) {
        return;
    }
    allWindows.splice(index, 1);
}

function addWindow(win: WikiWindowData<any>) {
    allWindows.push(win);
    pushWindowToTop(win);
}

function reorderWindows() {
    activeWindows.forEach(win => {
        win.ord = activeWindows.indexOf(win);
    })
}

function pushWindowToTop(win: WikiWindowData<any>) {
    if (activeWindows.includes(win)) {
        activeWindows.splice(activeWindows.indexOf(win), 1);
        activeWindows.unshift(win);
    } else {
        activeWindows.unshift(win);
        win.active.value = true;
        if (activeWindows.length > MAX_ACTIVE_WINDOW_COUNT) {
            activeWindows.pop().active.value = false;
        }
    }
    reorderWindows();
}

function removeWindow(win: WikiWindowData<any>) {
    win.active.value = false;
    const index = activeWindows.indexOf(win);
    if (index === -1) {
        return;
    }
    activeWindows.splice(index, 1);
    reorderWindows();
}

const MAX_ACTIVE_WINDOW_COUNT = 5;

/**
 * 最小化一个窗口
 * 
 * 将其放到hiddenWindows中，并生成对应的tab
 * @param comp 
 */
function hideWindow(win: WikiWindowData<any>) {
    removeWindow(win);
    console.log(win.active);
}

function showWindow(win: WikiWindowData<any>) {
    win.active.value = true;
    pushWindowToTop(win);
}

// 检查属性是否可选的工具类型
type IsPropertyOptional<T, K extends keyof T> = 
  T extends Record<K, T[K]> ? false : true;

// 示例：移除readonly属性
type Mutable<T> = {
  -readonly [P in keyof T]?: T[P]
}

class WikiWindowData<I extends abstract new (...args: any) => any> {
    component: I;
    active: Ref<boolean> = ref(true);
    props: Mutable<InstanceType<I>["$props"]> = {};
    static onMinimize(win: WikiWindowData<any>) {
        hideWindow(win);
    }
    static onClose(win: WikiWindowData<any>) {
        closeWindow(win);
    }
    
    constructor(public title: string) {
        // @ts-expect-error
        this.props.title = title;
        // @ts-expect-error
        this.props.onMinimize = WikiWindowData.onMinimize.bind(null, this);
        // @ts-expect-error
        this.props.onClose = WikiWindowData.onClose.bind(null, this);
    }
    static getWindowFromTitleAndAction(title: string, action: Action) {
        switch (action) {
            case Action.Edit:
                return new WikiWindowEditData(title);
            case Action.View:
                return new WikiWindowViewData(host + articlePath.replace("$1", title));
            case Action.History:
                //return new WikiWindowViewData(url.href);
            default:
                return null;
        }
    }
    ord: number;
}

class WikiWindowViewData extends WikiWindowData<typeof WikiWindowView> {
    override component = WikiWindowView;
    override active = ref(true);
    constructor(url: string) {
        const urlObj = new URL(url, host);
        super(decodeURI(urlObj.pathname));
        this.props = {
            ...this.props,
            url: new URL(url, host),
            onReady: () => {
                console.log("!!!")
            }
        }
    }
}

class WikiWindowMetaData extends WikiWindowData<typeof WikiWindowMeta> {
    override component = WikiWindowMeta;
    override title: 'Meta';
    constructor() {
        super('Meta');
        this.props.onClose = () => {
            closeWindow(this);
            metaWindow.value = null;
        }
        this.props.onGo = ({action, title}) => {
            resolveTitleAction(title, action);
        }
    }
    update(title: string) {
        console.log('updated', title);
        emit('metaInput', { value: title })
    }
}

class WikiWindowEditData extends WikiWindowData<typeof WikiWindowEdit> {
    override component = WikiWindowEdit;
    override active = ref(false);
    constructor(title: string) {
        super("Edit " + title);

        this.props.pageTitle = ref(title);
        this.props.pageContent = ref("");
        this.props.pageMissing = ref(false);
        

        interface QueryResult {
            query: {
                pages: Array<{
                    revisions: Array<{
                        slots: {
                            main: {
                                content: string;
                            };
                        };
                    }>;
                    missing: boolean;
                }>
                
            };
        }


        api.get({
            action: 'query',
            prop: 'revisions',
            titles: title,
            rvprop: 'content',
            rvslots: 'main',
        } satisfies mwApi.ApiQueryRevisionsParams).then((data) => {
            console.log(data);
            const result = data as QueryResult;
            const page = result.query.pages[0];
            if (page.missing) {
                this.props.pageMissing.value = true;
            } else {
                this.props.pageContent.value = page.revisions[0].slots.main.content;
            }
            showWindow(this);
        });
    }
}


class WikiWindowDiffData extends WikiWindowData<typeof WikiWindowDiff> {
    override component = WikiWindowDiff;
    override active = ref(false);
    constructor(torev: string, fromrev: string) {
        super(`Compare ${torev} to ${fromrev}`);
        showWindow(this);
        
		const params: mwApi.ApiComparePagesParams = {
            action: "compare",
            fromrev: parseInt(fromrev),
            format: "json",
            formatversion: "2"
		};
		if (torev.match(/^[0-9]+$/)) {
			params.torev = parseInt(torev);
		} else {
			if (torev !== "cur" && torev !== "prev" && torev !== "next") {
				throw new Error("Invalid torev");
			}
			params.torelative = torev;
		}
        interface CompareResult {
            compare: {
                body: string;
                fromrevid: number;
                torevid: number;
                fromtitle: string;
                totitle: string;
            }
        }

        interface ParseResult {
            parse: {
                title: string;
                displaytitle: string;
                text: string;
            }
        }
        const diffTable = ref("");
        this.props.diffTable = diffTable;
        this.props.oldTitle = ref("");
        this.props.parsedHTML = ref("");
        api.get(params).done((result: CompareResult) => {
            diffTable.value = result.compare.body;
            api.get({
                action: "parse",
                format: "json",
                oldid: torev,
                formatversion: "2"
            }).done((result: ParseResult) => {
                // 是HTML格式的标题
                this.props.oldTitle.value = result.parse.displaytitle;
                this.props.parsedHTML.value = result.parse.text;
            });
            this.active.value = true;
        });
    }
}



</script>

<template>
    <div id="wikiwindows-btn" :class="'wikiwindows-state-' + WWState[state]" @click="nextState">
        <cdx-icon size="medium" :icon="cdxIconBrowser" style="margin: auto;"></cdx-icon>
    </div>
    <div class="wikiwindows-shown" ref="shownContainer">
            <template v-for="(win, index) in allWindows">
                <keep-alive>
                    <component :is="win.component" v-bind="win.props" v-show="win.active.value" :class="`wikiwindow-${activeWindows.length - win.ord}`"></component>
                </keep-alive>
            </template>
    </div>
    <div class="wikiwindows-tabs">
        <template v-for="(win, index) in allWindows"> 
            <div v-if="!win.active.value" class="wikiwindows-tab" @click="showWindow(win)">{{ win.title }}</div>
        </template>
    </div>
</template>

<style lang="css">
html {
    --ww-dark-mode-enabled: 0;
}

.skin-theme-clientpref-night {
    --ww-dark-mode-enabled: 1;
}

@media screen and (prefers-color-scheme: dark) {
    .skin-theme-clientpref-os {
        --ww-dark-mode-enabled: 1;
    }
}

/* 只是拿来调色的地方 */
.test:not(.test) {
    --ww-color-state-initial: hsl(210 50% 70%);
    --ww-color-state-initial: oklch(0.9 0.10 250);
    --ww-color-state-select: hsl(140 50% 70%);
    --ww-color-state-select: oklch(0.9 0.10 170);
    --ww-color-state-select_input: hsl(40 50% 70%);
    --ww-color-state-select_input: oklch(0.9 0.10 90);
    --ww-color-background: #ddd;
    --ww-color-text: var(--text-color, black);
}


body {
    --ww-color-oklch__l-state: calc(0.9 - var(--ww-dark-mode-enabled) * 0.57);
    --ww-color-hsl__l-state: calc(70% - var(--ww-dark-mode-enabled) * 40%);

    --ww-color-state-initial:      hsl(210 50% var(--ww-color-hsl__l-state));
    --ww-color-state-select:       hsl(140 50% var(--ww-color-hsl__l-state));
    --ww-color-state-select_input: hsl(40 50% var(--ww-color-hsl__l-state));
    --ww-color-state-initial:      oklch(var(--ww-color-oklch__l-state) 0.10 250);
    --ww-color-state-select:       oklch(var(--ww-color-oklch__l-state) 0.10 170);
    --ww-color-state-select_input: oklch(var(--ww-color-oklch__l-state) 0.10 90);
    --ww-color-background: hsl(0 0% calc(95% - 85% * var(--ww-dark-mode-enabled)));
    --ww-color-text: var(--text-color, hsl(0 0% calc(100% * var(--ww-dark-mode-enabled))));
}

</style>

<style lang="less" scoped>
#wikiwindows-btn {
    display: flex;
    position: fixed;
    right: 0;
    bottom: 50vh;
    height: max(6vh, 6vw);
    width: max(6vh, 6vw);
    border-radius: 30%;
    &.wikiwindows-state-initial {
        background-color: var(--ww-color-state-initial);
    }
    &.wikiwindows-state-select {
        background-color: var(--ww-color-state-select);
    }
    &.wikiwindows-state-select_input {
        background-color: var(--ww-color-state-select_input);
    }
}



.wikiwindows-tabs {
    display: flex;
    flex-direction: column;
    position: fixed;
    right: 0;
    top: 50vh;
    
    &> div {
        background-color: var(--ww-color-background);
        color: var(--ww-color-text);
        border: 1px solid var(--ww-color-state-initial);
        border-radius: 0.3em;
        padding: 0.3em;
        writing-mode: vertical-rl;
    }
}

.wikiwindows-shown {
    z-index: 1000;
}

.wikiwindow {
    transition: transform 0.5s ease;
}

.wikiwindow {

    &-0 {
        transform: translateY(0em);
        z-index: 0;
    }
    &-1 {
        transform: translateY(3em);
        z-index: 1;
    }
    &-2 {
        transform: translateY(6em);
        z-index: 2;
    }
    &-3 {
        transform: translateY(9em);
        z-index: 3;
    }
    &-4 {
        transform: translateY(12em);
        z-index: 4;
    }
}


</style>