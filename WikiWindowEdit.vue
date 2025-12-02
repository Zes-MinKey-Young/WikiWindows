<script setup lang="ts">
import WikiWindow from './WikiWindow.vue';
import { CdxTextArea, CdxButton, CdxCheckbox, CdxTextInput } from '@wikimedia/codex';
import type * as mwApi from "types-mediawiki-api"
import { ref } from 'vue';
import type { Ref } from 'vue';
import type { BasicEmits } from './basicEvents';

const props = defineProps<{
    title: string;
    pageTitle: Ref<string>;
    pageContent: Ref<string>;
    pageMissing: Ref<boolean>;
}>();
const emit = defineEmits<BasicEmits>();


const minorDefault = mw.user.options.get("minordefault") == "1";
const watchDefault = mw.user.options.get("watchdefault") == 1;

const text = ref(props.pageContent);
const summary = ref('Edit via WikiWindows');
const minor = ref(minorDefault);
const watch = ref(watchDefault);
function edit() {
    new mw.Api()
        .postWithEditToken({
            action: 'edit',
            title: props.pageTitle.value,
            text: text.value,
            summary: summary.value,
            minor: minor.value,
            watch: watch.value
        }).then((data) => {
            console.log(data);
            emit('close');
        }, (error) => {
            mw.notify(error, { type: 'error' });
        });
}

</script>

<template>
    <wiki-window :title @close="$emit('close')" @minimize="$emit('minimize')" @raise="$emit('raise')">
        <div class="window-content">
            <CdxTextArea style="flex: 1;" label="Text"
                :placeholder="pageMissing ? `Creating ${pageTitle.value}` : `Editing ${pageTitle.value}`" v-model="text" />
            <div class="summary">
                <span>Summary:</span>
                <cdx-text-input v-model="summary"></cdx-text-input>
                <cdx-button @click="summary = ''">Clear</cdx-button>
            </div>
            <div>
                <cdx-checkbox v-model:model-value="minor" :inline="true">Minor</cdx-checkbox>
                <cdx-checkbox v-model:model-value="watch" :inline="true">Watch</cdx-checkbox>
            </div>
            <cdx-button weight="primary" action="progressive" @click="edit">Save</cdx-button>
        </div>
    </wiki-window>
</template>

<style lang="css" scoped>
div.summary {
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
    width: 100%;
}

.cdx-text-area :v-deep(textarea) {
    height: 100%;
}
.window-content {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
}
</style>