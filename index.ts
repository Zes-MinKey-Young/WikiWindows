// import {createApp} from "vue";
import Test from "./main.vue";


const app = Vue.createApp(Test);
const $content = $(document.body);
const $el = $("<div>").appendTo($content);
app.mount($el.get(0)!)
