import Vue from 'vue';
import iView from 'iview';
import {router} from './router/index';
import {appRouter} from './router/router';
import store from './store';
import App from './app.vue';
import '@/locale';
import 'iview/dist/styles/iview.css';
import VueI18n from 'vue-i18n';
import util from './libs/util';
import axios from 'axios';
import VueAxios from 'vue-axios';
import global from './config/Global.vue';
// Use highlight
import VueHighlightJS from 'vue-highlight.js/';
import 'highlight.js/styles/agate.css';
Vue.use(VueHighlightJS);

Vue.prototype.Global = global;
Vue.use(VueAxios, axios);

Vue.use(VueI18n);
Vue.use(iView);

// axios with cookie request
axios.defaults.withCredentials = true;
// axios timeout time in milliseconds
axios.defaults.timeout = 60 * 1500;

// Vue.directive('highlight', function (el) {
//     let blocks = el.querySelectorAll('pre code');
//     blocks.forEach((block) => {
//         hljs.highlightBlock(block);
//     });
// });

new Vue({
    el: '#app',
    router: router,
    store: store,
    render: h => h(App),
    data: {
        currentPageName: ''
    },
    mounted () {
        this.currentPageName = this.$route.name;
        // Display a list of open pages
        this.$store.commit('setOpenedList');
        this.$store.commit('initCachepage');
        // Permission menu filtering
        this.$store.commit('updateMenulist');
        // iview-admin checks for updates
        util.checkUpdate(this);
    },
    created () {
        let tagsList = [];
        appRouter.map((item) => {
            if (item.children.length <= 1) {
                tagsList.push(item.children[0]);
            } else {
                tagsList.push(...item.children);
            }
        });
        this.$store.commit('setTagsList', tagsList);
    }
});
