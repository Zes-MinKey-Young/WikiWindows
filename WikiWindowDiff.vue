<script lang="ts" setup>
import type { Ref } from 'vue';
import WikiWindow from './WikiWindow.vue';
import type { BasicEmits } from './basicEvents';


const props = defineProps<{
    title: string,
    diffTable: Ref<string>,
    oldTitle: Ref<string>,
    parsedHTML: Ref<string>
}>();

console.log(props.diffTable);

const emit = defineEmits<BasicEmits>();
</script>
<template>
    <wiki-window :title="title" @minimize="$emit('minimize')" @close="emit('close')" @raise="$emit('raise')">
        <div class="diff-container">
            <div class="table-wrapper">
                <table class="diff diff-contentalign-left diff-editfont-monospace">
                    <colgroup>
                        <col class="diff-marker">
                        <col class="diff-content">
                        <col class="diff-marker">
                        <col class="diff-content">
                    </colgroup>
                    <tbody v-html="diffTable.value"></tbody>
                </table>
            </div>
            <h1 class="old-title" v-html="oldTitle.value"></h1>
            <div class="pageContent" v-html="parsedHTML.value"></div>
        </div>
    </wiki-window>
</template>

<style lang="css" scoped>
.diff-container {
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 40% auto 1fr;
    max-height: calc(70vh - 4em);
}

.table-wrapper {
    overflow: auto;
    max-height: 500px;
}

.pageContent {
    padding: 0.5em;
    overflow: auto;
    min-height: 0;
    height: 100%;
}

</style>