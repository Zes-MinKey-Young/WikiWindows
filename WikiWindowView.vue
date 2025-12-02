<script setup lang="ts">
import type { BasicEmits } from "./basicEvents";
import WikiWindow from "./WikiWindow.vue";
import { onMounted, ref } from "vue";

const props = defineProps<{
    url: URL;
}>();

defineExpose({
    title: "Test"
})

const emit = defineEmits<{
    ready: [];
} & BasicEmits>();
function ready(doc: Document, readyHandler) {
    if (doc.readyState === 'complete') {
        readyHandler()
    } else {
        doc.addEventListener('DOMContentLoaded', readyHandler)
    }
}

const iframeElement = ref<HTMLIFrameElement>(null);

function onIframeLoad() {
    console.log("load");
    const doc = iframeElement.value.contentDocument;
    ready(doc, () => {
        emit("ready");
        console.log("ready")
    })
}

</script>

<template>
    <wiki-window title="Test" @close="$emit('close')"  @minimize="$emit('minimize')" @raise="$emit('raise')">
        <iframe ref="iframeElement" :src="url.href" frameborder="0" @load="onIframeLoad"></iframe>
    </wiki-window>
</template>

<style scoped>
    iframe {
        width: 100%;
        height: 100%;
    }
</style>