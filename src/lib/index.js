/* ========================================
 *  company : Dilusense
 *   author : Kuangch
 *     date : 2018/7/20
 * ======================================== */

import plugin from './ModelView.vue'

plugin.install = function (Vue) {
    Vue.component(plugin.name, plugin)
}

// if (typeof window !== 'undefined' && window.Vue) {
//     window.Vue.use(ConvenienceImage);
// }
export default plugin