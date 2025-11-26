<script setup lang="ts">
import { ref, effect, computed, watch } from 'vue'

import WikiWindow from './WikiWindow.vue';
import type { MenuItemData } from "@wikimedia/codex"
import { CdxSelect, CdxTextInput, CdxButton } from '@wikimedia/codex'

// 不得不用这个，我不知道为什么外面props变化检测不到
import { listen } from "./events";

listen('metaInput', (data) => {
    console.log(data);
    realTitle.value = data.value;
});

const emit = defineEmits<{
    go: [{
        action: Action;
        title: string;
    }];
    close: [];
    minimize: [];
}>();

enum Action {
    Edit = 0,
    View = 1,
    History = 2
}

const menuItems: MenuItemData[] = [
    { value: "Edit" },
    { value: "View" },
    { value: "History" }
]

const menuItem = ref('Edit');

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
    <wiki-window title="Meta Window" @close="$emit('close')" @minimize="$emit('minimize')">
    <div class="ww-wrapper">
        <cdx-text-input label="Title" placeholder="Title" v-model:model-value="realTitle"></cdx-text-input>
        <cdx-select :menu-items="menuItems" v-model:selected="menuItem"></cdx-select>
        <cdx-button weight="primary" @click="go">Go!</cdx-button>
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
</style>