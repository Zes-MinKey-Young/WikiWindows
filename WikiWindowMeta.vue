<script setup lang="ts">
import { ref, effect, computed, watch, getCurrentInstance } from 'vue'

import WikiWindow from './WikiWindow.vue';
import type { MenuItemData } from "@wikimedia/codex"
import { CdxSelect, CdxTextInput, CdxButton } from '@wikimedia/codex'

// 不得不用这个，我不知道为什么外面props变化检测不到
import { listen } from "./events";
import type { BasicEmits } from './basicEvents';

listen('metaInput', (data) => {
    console.log(data);
    realTitle.value = data.value;
});

const emit = defineEmits<{
    go: [{
        action: Action;
        title: string;
    }];
    "update:triggerWhenSelected": [string]
} & BasicEmits>();

enum Action {
    Edit = 0,
    View = 1,
    History = 2
}

const _ = getCurrentInstance().appContext.config.globalProperties.$i18n;

const menuItems: MenuItemData[] = [
    { value: "Edit", label: _('ww:meta.actions.edit').text() },
    { value: "View", label: _('ww:meta.actions.view').text() },
    { value: "History", label: _('ww:meta.actions.history').text() }
]

const menuItem = ref('Edit');
const triggerWhenSelected = ref('View');

function go() {
    console.log(menuItem.value)
    emit("go", {
        action: Action[menuItem.value],
        title: realTitle.value
    })
}

const props = defineProps<{
    title: "Meta Window"
}>();


const realTitle = ref<string>("");

</script>
<template>
    <wiki-window :title="$i18n('ww:meta.title').text()" @close="$emit('close')" @minimize="$emit('minimize')" @raise="$emit('raise')">
    <div class="ww-wrapper">
        <cdx-text-input label="Title" :placeholder="$i18n('ww:meta.placeholder-title').text()" v-model:model-value="realTitle"></cdx-text-input>
        <cdx-select :menu-items="menuItems" v-model:selected="menuItem"></cdx-select>
        <cdx-button weight="primary" @click="go">{{ $i18n("ww:meta.go") }}</cdx-button>
        <div>
            {{ $i18n("ww:meta.normal-action") }}
            <cdx-select :menu-items="menuItems" v-model:selected="triggerWhenSelected" @update:selected="$emit('update:triggerWhenSelected', triggerWhenSelected)"></cdx-select>
        </div>
        <div class="ww-version">
            Wikiwindows v0.3.1<br>GPLv3 Licensed
            <h1>0.3.1</h1>
            <ul>
                <li>修复了编辑窗口的文本框大小异常。</li>
                <li>元窗口新增了“正常操作”选项，用于设置当用户在页面中选择了链接时，WikiWindows应该执行的操作。</li>
                <li>Fixed the textarea size in the edit window.</li>
                <li>Added a "Normal Action" option to the meta window, which allows the user to specify what action to take when a link is selected in a page.</li>
            </ul>
        </div>
    </div>
    </wiki-window>
</template>

<style scoped>
.ww-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.2em;
}

.ww-version {
    padding: 1em 2em;
    overflow-y: auto;
}
</style>