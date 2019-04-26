/* ========================================
 *  company : Dilusense
 *   author : Kuangch
 *     date : 2019/4/25
 * ======================================== */
let THREE = require('three')

/**
 * 纹理显示或隐藏控制类
 * @param context 渲染上下文（Context)
 * @param success 空纹理创建成功回调
 * @constructor
 */
function TextureControl(context, success) {
    this.blankMat = null
    this.context = context

    let _this = this

    // 创建一个空纹理，创建后加载模型
    let mtlLoader = new THREE.MTLLoader();
    mtlLoader.load('',function (materials) {
        _this.blankMat = materials
        success && success.call && success()
    })
}


/**
 * 根据配置上下文load纹理
 * @param mesh
 */
TextureControl.prototype.mixinTexture = function (mesh) {

    let obj = mesh && mesh.obj
    if (!obj || mesh.hide) {
        return;
    }

    traverseObjMat(this.context,this.blankMat,mesh)

}

/**
 * 模型纹理的详细处理
 * @param context
 * @param blankMat
 * @param mesh
 */
function traverseObjMat(context,blankMat,mesh) {

    // 根据配置使用load的mtl文件对象创建渲染纹理
    function getRenderMat(oMat) {
        if (oMat && oMat.name) {
            let material = (context.settings.showTexture ? mesh.textureMat : blankMat).create(oMat.name)
            material.setValues({
                wireframe: !!context.settings.showWire
            })
            return material
        }
        return oMat
    }

    mesh.obj.traverse(function (object) {
        if (object instanceof THREE.Mesh) {
            if (object.material instanceof Array){
                // obj 中定义了多纹理
                for (let m in object.material) {
                    object.material[m] = getRenderMat(object.material[m])
                }
            }else{
                // obj 中只定义了一个纹理
                object.material = getRenderMat(object.material)
            }
        }
    });
}

export default TextureControl