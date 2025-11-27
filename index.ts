// import {createApp} from "vue";
import Test from "./main.vue";
import "./i18n";


const app = Vue.createMwApp(Test);
const $content = $(document.body);
const $el = $("<div>").appendTo($content);
app.mount($el.get(0)!)


