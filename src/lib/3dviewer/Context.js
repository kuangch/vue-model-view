/* ========================================
 *  company : Dilusense
 *   author : Kuangch
 *     date : 2019/4/25
 * ======================================== */
import TrackballControls from './lib/TrackballControls'
let THREE = require('three');

/**
 * 模型加载相关上下文对象
 * @constructor
 */
function Context() {
    this.camera = null
    this.scene = null
    this.renderer = null
    this.controls = null
    this.pointLight = null
    this.meshs = {}
    this.settings = {
        showTexture: true,
        showWire: true,
        rotate: true,
    }
}

/**
 * 模型显示区域大小变化，重新配置鼠标控制，相机视角，调整画布大小
 */
Context.prototype.containerSizeChange = function () {
    if(!this.renderer || !this.settings.container){
        return;
    }
    // 画布
    this.renderer.setSize(this.settings.container.clientWidth, this.settings.container.clientHeight);

    // 相机
    this.camera.aspect = this.settings.container.clientWidth / this.settings.container.clientHeight;

    // 鼠标控制
    this.controls.handleResize()

}


// 上下文初始化
Context.prototype.init = function (customSettings) {

    // 扩展用户配置
    Object.assign(this.settings, customSettings);

    // 渲染器
    this.renderer = new THREE.WebGLRenderer({alpha: true});
    this.renderer.setSize(this.settings.container.clientWidth, this.settings.container.clientHeight);

    // 场景（世界）
    this.scene = new THREE.Scene();

    // 相机
    this.camera = new THREE.PerspectiveCamera(45, this.settings.container.clientWidth / this.settings.container.clientHeight, 1, 2000 * 300);

    // 鼠标控制
    this.controls = new TrackballControls(this.camera, this.settings.container);
    this.controls.panSpeed = 0.2;
    this.controls.noPan = false;
    this.controls.dynamicDampingFactor = 0.3;

    // 环境光
    let ambientLight = new THREE.AmbientLight(0xdddddd, 0.4);
    this.scene.add(ambientLight);

    // 点光源
    this.pointLight = new THREE.PointLight();
    this.camera.add(this.pointLight);
    this.scene.add(this.camera);
    this.configPLight()

    // 画布容器
    this.settings.container.innerHTML = "";
    this.settings.container.appendChild(this.renderer.domElement);
}

/**
 * 获取基 mesh
 * @returns {*}
 */
Context.prototype.getBasicMesh = function(){

    let mesh
    // 选择基 mesh
    for (let m in this.meshs) {
        if (this.meshs[m].isBasic) {
            mesh = this.meshs[m]
            mesh.key = m
            break
        }
    }
    return mesh
}

/**
 * 获取基础模型
 * @returns {*}
 */
Context.prototype.getBasicMesh = function(){

    let mesh
    // 选择基 mesh
    for (let m in this.meshs) {
        if (this.meshs[m].isBasic) {
            mesh = this.meshs[m]
            mesh.key = m
            break
        }
    }
    return mesh
}

/**
 * url 转成 base64编码的字符串便于作为key
 * @param url
 */
Context.prototype.url2key = function (url) {
    return Buffer.from(url).toString('base64')
}

/**
 * base64编码的字符串 转成 url
 * @param str
 */
Context.prototype.key2url = function (str) {
    return new Buffer(str, 'base64').toString()
}

/**
 * url 获取所有mesh的keys
 */
Context.prototype.meshKeys = function () {
    return Object.getOwnPropertyNames(this.meshs)
}

/**
 *  上下文销毁重置
 */
Context.prototype.reset = function() {
    Context.call(this)
}

/**
 * 自定义支持多纹理处理的 traverse方法
 * @param realMesh  THREE mesh对象
 * @param cb 回调返回所有纹理对象
 */
Context.prototype.traverseSupportMultiTexture  = function (realMesh,cb) {
    realMesh && realMesh.traverse(function (object) {
        if (object instanceof THREE.Mesh) {
            if (object.material instanceof Array){
                // obj 中定义了多纹理
                for (let m in object.material) {
                    if (object.material[m]) cb(object.material[m])
                }
            }else{
                // obj 中定义了一个纹理
                if (object.material) cb(object.material)
            }
        }
    });
}
/**
 * 点光源光照配置(显示纹理和不显示纹理,并且所有的obj中有有纹理的obj)
 */
Context.prototype.configPLight = function() {
    let _this = this

    // 获取是否真正有纹理（解决因为纹理图片加载未完成导致的实际无纹理问题）
    let hasTextureImg = false
    for(let mesh in this.meshs){
        _this.traverseSupportMultiTexture(_this.meshs[mesh].obj,function (material) {
            if(material.map) hasTextureImg = true
        })
    }

    this.pointLight.color.set(this.settings.showTexture && hasTextureImg ? 0xffffff : 0x888888);
    this.pointLight.intensity = 0.6;
}

export default Context