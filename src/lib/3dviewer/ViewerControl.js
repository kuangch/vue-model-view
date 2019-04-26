/* ========================================
 *  company : Dilusense
 *   author : Kuangch
 *     date : 2019/4/25
 * ======================================== */
let THREE = require('three')

/**
 * 视觉控制类
 * @param context 渲染上下文（Context)
 * @constructor
 */
function ViewerControl(context) {
    this.context = context
}

/**
 * 调整相机位置，视角使能以最佳位置观看
 */
ViewerControl.prototype.bestLook = function (mesh) {

    let context = this.context

    // 如果传入具体mesh则调整具体mesh的视角，否则调整基mesh的视角
    let _mesh = mesh || context.getBasicMesh() || context.meshKeys().length === 1 && context.meshs[context.meshKeys()[0]]
    if(!_mesh) return

    // 旋转角度重置
    _mesh.obj.rotation.z = 0;

    // 控制器重置
    context.controls.reset();

    // 相机位置重置
    context.camera.position.z = 0;
    context.camera.position.y = 0;

    calcSize(_mesh)

    // 计算获得相机最佳x方向位置并调整
    let sceneRadiusForCamera = Math.max(_mesh.size.x, _mesh.size.y, _mesh.size.z) / 2 * (1 + Math.sqrt(5));
    if (sceneRadiusForCamera) context.camera.position.x = sceneRadiusForCamera
    window.console.log(`sceneRadiusForCamera： ${sceneRadiusForCamera}`)

    context.camera.lookAt(_mesh.obj.position)

}

/**
 * 计算模型大小，调整模型位置，角度, 并调整为最佳观看位置
 */
ViewerControl.prototype.bestPosition = function() {

    let context = this.context
    let mesh = context.getBasicMesh()
    if(!mesh) return

    // 模型旋转90度
    let xAxis = new THREE.Vector3(0, 1, 0);
    mesh.obj.rotateOnAxis(xAxis, 90 * Math.PI / 180);

    calcSize(mesh)

    // 模型位置调整（位置调整到模型中间点）
    let boundingbox = new THREE.BoundingBoxHelper(mesh.obj, 0xff0000);
    boundingbox.update();
    mesh.obj.position.x = -boundingbox.geometry.attributes.position.array[3] - mesh.size.x / 2;
    mesh.obj.position.y = -boundingbox.geometry.attributes.position.array[7] - mesh.size.y / 2;
    mesh.obj.position.z = -boundingbox.geometry.attributes.position.array[14] - mesh.size.z / 2;
    boundingbox.update();

    // 模型旋转角度重置
    mesh.obj.rotation.z = 0;

}

/**
 * 模型旋转展示
 */
ViewerControl.prototype.rotateLeft = function (speed) {

    let context = this.context
    let rotSpeed = speed || .01;
    let x = context.camera.position.x,
        z = context.camera.position.z;

    context.camera.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
    context.camera.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);

    context.camera.lookAt(context.scene.position);
}

/**
 * 计算模型的大小
 * @param mesh
 */
function calcSize(mesh) {

    if(mesh.size.x > 0) return
    // 计算模型大小
    let boundingbox = new THREE.BoundingBoxHelper(mesh.obj, 0xff0000);
    boundingbox.update();
    window.console.log("box radius: " + boundingbox.geometry.boundingSphere.radius);

    // 大小设置给模型
    mesh.size.x = boundingbox.geometry.attributes.position.array[0] - boundingbox.geometry.attributes.position.array[3];
    mesh.size.y = boundingbox.geometry.attributes.position.array[1] - boundingbox.geometry.attributes.position.array[7];
    mesh.size.z = boundingbox.geometry.attributes.position.array[2] - boundingbox.geometry.attributes.position.array[14];
    window.console.log(mesh.size);
}

export default ViewerControl