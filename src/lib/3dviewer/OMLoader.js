/* ========================================
 *  company : Dilusense
 *   author : Kuangch
 *     date : 2019/4/25
 * ======================================== */

let THREE = require('three')
let OBJLoader = require('three-obj-loader');
require('./lib/loaders/MTLLoader');

import OBJLoaderParse from './OBJLoaderParse'

/**
 * 自定义mtl，obj文件加载类
 * 1.修改一些共有模块的某些方法，适应本项目
 * 2.未此项目定义一些通用的load相关方法
 * @constructor
 */
function OMLoader() {

    // 包装obj loader (把OBJLoader挂到THREE对象上)
    OBJLoader(THREE)

    // 用修改了一些逻辑的parse方法替换原OBJLoader的parse方法
    OBJLoaderParse(THREE)

    this.objLoader = new THREE.OBJLoader();
    let _this = this

    // 定义自定义的obj加载器
    _this.objLoader.load = function (objUrl, mtlUrl, onLoad) {
        let __this = this;

        let mesh = {}
        mesh.size = [];
        mesh.isBasic = false;

        _this.loadMTL(mtlUrl, function (textureMat) {
            let loader = new THREE.FileLoader(__this.manager);
            loader.load(objUrl, function (text) {

                mesh.obj = __this.parse(text)
                mesh.textureMat = textureMat

                onLoad(mesh);
            });
        })

        // 定义自定义的obj加载器错误处理function
        _this.objLoader.onError = function(msg){
            console.error(msg)
        }

    };

}

/**
 * 加载解析mtl文件,生成材质对象
 * @param url  mtl文件
 * @param cb  成功回调
 */
OMLoader.prototype.loadMTL = function(url, cb) {
    let mtlLoader = new THREE.MTLLoader(url.substr(0, Math.max(url.lastIndexOf("/"), url.lastIndexOf("\\")) + 1));
    mtlLoader.load(url, function (materials) {
        let textureMat = materials;
        textureMat.preload();
        cb(textureMat)
    })
}


/**
 * 加载解析obj文件,并结合mtl生成mesh
 * @param objUrl obj 文件
 * @param mtlUrl mtl 文件
 * @param onLoad 加载完成回调
 */
OMLoader.prototype.loadOM = function(objUrl, mtlUrl, onLoad) {
    this.objLoader.load(objUrl,mtlUrl,onLoad)
}

export default OMLoader