<script lang="ts" setup>
import type { BasicEmits } from './basicEvents';

defineProps<{
    title: string;
}>();

defineEmits<BasicEmits>();

</script>

<template>
    <div class="wikiwindow">
        <div class="wikiwindow-topbar">
            <div class="wikiwindow-title" @click="$emit('raise')">{{ title }}</div>
            <div class="wikiwindow-minimize" @click="$emit('minimize')">-</div>
            <div class="wikiwindow-close"  @click="$emit('close')">X</div>
        </div>
        <slot></slot>
    </div>
</template>

<style scoped>
    .wikiwindow {
        padding: 2px;
        border: 1px solid #c8ccd1;
        width: 80vw;
        height: 70vh;
        left: 10vw;
        top: 8vh;
        display: grid;
        grid-template-columns: 100%;
        grid-template-rows: max-content 1fr;
        position: fixed;
        background-color: var(--ww-color-background);


    }
    .wikiwindow-hidden {
        display: none;
    }
    .wikiwindow-topbar {
        display: flex;
        align-items: center;
        background-color: var(--ww-color-background);
        color: var(--ww-color-text);
    }
    .wikiwindow-title {
        font-size: 1.5rem;
        margin: auto;
        word-break: break-all;
    }
    .wikiwindow-close {
        cursor: pointer;
        display: flex;
        justify-content: center;
        text-align: center;
        background-color: hsl(0 80% 50% );
        background-color: oklch(0.6 0.3 20);
        width: 1.5em;
        height: 1.5em
    }
    .wikiwindow-minimize {
        cursor: pointer;
        justify-content: center;
        text-align: center;
        background-color: hsl(0 0% 50% );
        background-color: oklch(0.6 0.0 20);
        width: 1.5em;
        height: 1.5em
    }

</style>
