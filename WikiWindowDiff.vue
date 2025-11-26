<script lang="ts" setup>
import type { Ref } from 'vue';
import WikiWindow from './WikiWindow.vue';


const props = defineProps<{
    title: string,
    diffTable: Ref<string>,
    oldTitle: Ref<string>,
    parsedHTML: Ref<string>
}>();

console.log(props.diffTable);

const emit = defineEmits<{
    close: [];
    minimize: [];
}>();
</script>
<template>
    <wiki-window :title="title" @minimize="emit('minimize')" @close="emit('close')">
        <table class="diff diff-contentalign-left diff-editfont-monospace">
            <colgroup><col class="diff-marker">
				<col class="diff-content">
				<col class="diff-marker">
				<col class="diff-content">
			</colgroup>
            <tbody v-html="diffTable.value"></tbody>
        </table>
        <div class="old-title" v-html="oldTitle.value"></div>
        <div v-html="parsedHTML.value"></div>
    </wiki-window>
</template>