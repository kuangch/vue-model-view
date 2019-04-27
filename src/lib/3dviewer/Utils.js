/* ========================================
 *  company : Dilusense
 *   author : Kuangch
 *     date : 2019/4/27
 * ======================================== */

function callFunc(func) {
    func && func.call && func.call()
}

export default {
    callFunc
}