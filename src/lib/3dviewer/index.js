/* ========================================
 *  company : Dilusense
 *   author : Kuangch
 *     date : 2019/04/10
 * ======================================== */
import Detector from './lib/Detector'
import Context from './Context'
import TextureControl from './TextureControl'
import OMLoader from './OMLoader'
import ViewerControl from './ViewerControl'

let renderAnimateIDs = [];

let context
let oMLoader
let viewerControl
let textureControl

/**
 * 3d 模型显示类
 * @constructor
 */
function ThreeViewer() {
    context = new Context()
    oMLoader = new OMLoader()
    viewerControl = new ViewerControl(context)
}

/**
 * 销毁 context
 */
ThreeViewer.prototype.destroy = function (){

    // 移除obj
    for(let key in context.meshs){
        this.removeObj(context.key2url(key))
    }

    // 停止渲染
    stopMeshRender();

    // 清空node节点
    context.settings.container && (context.settings.container.innerHTML = "");

    // 清空 context
    context.reset()
}

/**
 * 初始化 context
 * @param settings
 */
ThreeViewer.prototype.init = function (settings) {

    let _this = this

    if (!Detector.webgl) Detector.addGetWebGLMessage();

    _this.destroy()

    // 初始化渲染上下文对象
    context.init(settings)

    textureControl = new TextureControl(context,function () {
        // 如果初始化传入了模型，加载它
        if(context.settings.mesh && context.settings.mesh instanceof Array){

            for(let i in context.settings.mesh){
                _this.addObj(context.settings.mesh[i].obj, context.settings.mesh[i].mtl, {
                    isBasic: i==0,
                    success:i==0 ? context.settings.success : undefined
                })
            }

        }else {
            if(context.settings.success){
                context.settings.success()
            }
        }
    })

}

/* ---------------------------
 改变模型纹理，网格状态
 -------------------------- */
ThreeViewer.prototype.toggleWire = function () {
    context.settings.showWire = !context.settings.showWire;

    changeObjsStatus(context.meshs)
}

ThreeViewer.prototype.toggleTexture = function () {
    context.settings.showTexture = !context.settings.showTexture;
    context.configPLight()

    changeObjsStatus(context.meshs)
}

function changeObjsStatus (meshs) {
    for(let mesh in meshs){
        textureControl.mixinTexture(meshs[mesh])
    }
}

/* ---------------------------
 更换模型纹理
 -------------------------- */
ThreeViewer.prototype.changeTexture = function (objUrl, mtlUrl) {

    let key = Buffer.from(objUrl).toString('base64')

    //模型存在
    if (key in context.meshs && context.meshs[key].obj){

        oMLoader.loadMTL(mtlUrl, function (textureMat) {
            context.meshs[key].textureMat = textureMat
            // 切换纹理需要重新创建渲染材质
            textureControl.mixinTexture(context.meshs[key])
        })
        return
    }

    console.log(`模型 ${objUrl} 不存在`)
}

/* ------------------------
相机位置调整
------------------------ */
ThreeViewer.prototype.toFront = function () {

    viewerControl.bestLook()
}

/* ------------------------
自动旋转
------------------------ */
ThreeViewer.prototype.toggleRotate = function () {
    context.settings.rotate = !context.settings.rotate;
}

ThreeViewer.prototype.addObj = function (url,mtlurl,options={isBasic:false}) {

    let key = context.url2key(url)

    let basicMesh = context.getBasicMesh()
    if(options.isBasic && basicMesh && basicMesh.key !== key )
        throw new Error(`已有基础模型: ${context.key2url(basicMesh.key)},不能再次添加基础模型: ${context.key2url(key)}`)

    //已经成功加载过的模型
    if (key in context.meshs && context.meshs[key].obj){

        //被隐藏，重新显示
        if (context.meshs[key].hide){
            console.log(`模型 ${url} 已成功加载过，使用内存数据`)
            context.meshs[key].hide = false
            // 重新载入需要重新读取模型展示状态
            textureControl.mixinTexture(context.meshs[key])
            context.scene.add(context.meshs[key].obj)
            return
        }else{
            console.log(`模型 ${url} 已在渲染，无需重复添加`)
            return
        }
    }

    // 加载完成前就分配缓存对象空间，便于后续管理去重
    context.meshs[key] = {isBasic : options.isBasic}

    // 没加载过或者被销毁
    oMLoader.loadOM(url, mtlurl, function (mesh) {

        // 加载失败
        if (!mesh.obj) {
            delete context.meshs[key]
            return
        }

        // 贴纹理
        textureControl.mixinTexture(mesh)

        // 缓存到渲染列表
        mesh.isBasic = options.isBasic
        context.meshs[context.url2key(url)] = mesh

        // 添加到渲染列表
        context.scene.add(mesh.obj);

        // 是基础模型,或者只有一个模型调整相机视角
        (options.isBasic || context.meshKeys().length === 1) && (viewerControl.bestPosition(), viewerControl.bestLook());

        // 没有开始渲染调用渲染函数开始渲染
        !renderAnimateIDs.length && animate(context.settings);

        console.log(`模型: ${url} 加载成功`)
        options.success && options.success.call && options.success()
    });
}

ThreeViewer.prototype.removeObj = function (url){
    let key = context.url2key(url)
    if(key in context.meshs){
        context.scene.remove(context.meshs[key].obj)
        context.meshs[key].hide = true
        console.log(`已移除模型: ${url}`)
    }else{
        console.log(`渲染列表无此模型: ${url}，无需删除`)
    }
}

/* ------------------------
渲染相关
 ------------------------*/
function animate() {

    let renderAnimateID = setInterval(function () {
        render();
    }, 1000 / 50);
    renderAnimateIDs.push(renderAnimateID);
}

function render() {
    if (context.settings.rotate) {
        viewerControl.rotateLeft();
    }
    context.controls.update(); //for cameras

    context.renderer.render(context.scene, context.camera);

}

/**
 * 停止渲染
 */
function stopMeshRender() {
    try {
        let len = renderAnimateIDs.length;
        for (let i = 0; i < len; i++) {
            let animateID = renderAnimateIDs.shift();
            try {
                clearInterval(animateID);
                window.console.log('cancelRequestAnimationFrame success id: ' + animateID);
            } catch (e) {
                renderAnimateIDs.push(animateID);
                window.console.log('cancelRequestAnimationFrame failed')
            }
        }
    } catch (e) {
        window.console.log(e)
    }

    window.console.log('still run: ' + renderAnimateIDs);
}

export default ThreeViewer
