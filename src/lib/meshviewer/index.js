/**
 * ThreeJS object viewer lib
 * -------------------------
 * Our objective is to create a JS Library for displaying OBJ files in CollectiveAccess.
 * This library must be reusable.
 */

import Detector from './Detector'
import $ from 'jquery'

var camera, scene, renderer, controls,
    boundingbox, sceneRadiusForCamera,objectCopy, rotate,
    pointLight;

var THREE = require('three');
require('./loaders/MTLLoader');
var OBJLoader = require('three-obj-loader');
OBJLoader(THREE)
var TrackballControls = require('three-trackballcontrols')

var size = new Array();

var objLoader = new THREE.OBJLoader();

var mSettings;

var renderAnimateIDs = [];

function stopMeshRender() {
    try {
        var len = renderAnimateIDs.length;
        for (var i = 0; i < len; i++) {
            var animateID = renderAnimateIDs.shift();
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

function loadModel(settings) {

    stopMeshRender();

    try {
        scene.remove(obj);
    } catch (e) {
        window.console.log(e)
    }

    settings.container.innerHTML = "";

    size_verif(settings);
}

var obj;
var textureMat;
var blankMat;
var isShowWire;
var isShoTexture;


var onLoad = function (object) {

    var xAxis = new THREE.Vector3(0, 1, 0);

    // Rotation on X Axis to reflect front face as shown in Meshlab
    object.rotateOnAxis(xAxis, 90 * Math.PI / 180);

    scene.add(object);

    boundingbox = new THREE.BoundingBoxHelper(object, 0xff0000);

    boundingbox.update();

    // Copy the object to a global variable, so that it's accessible from everyWhere in this code
    objectCopy = object;

    resetObjectPosition();

    sceneRadiusForCamera = Math.max(size.x, size.y, size.z) / 2 * (1 + Math.sqrt(5)); // golden number to beautify display

    window.console.log(sceneRadiusForCamera);

    showFront();

    animate(mSettings);
};

var onProgress = function (object) {
    var progression = (object.loaded / object.total) * 100;

    window.console.log(" total size:" + object.total + " position:" + object.loaded + " progress:" + progression);

};


function returnMtmSett() {
    return {
        wireframe: isShowWire ? true : false
        //ambient:0x262626,
        //specular:0x666666,
        //shininess:64,
    }
}

function init(settings) {
    isFistRender = true;
    mSettings = settings;
    isShowWire = settings.showWireframe;
    isShoTexture = settings.showTexture == undefined || settings.showTexture ? true : false;
    if (!Detector.webgl) Detector.addGetWebGLMessage();

    //if(!renderer)
    renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize(settings.container.clientWidth, settings.container.clientHeight);

    //if(!scene)
    scene = new THREE.Scene();
    //scene.fog = new THREE.Fog( 0x000000, 800, 2000 );

    //if(!camera)
    camera = new THREE.PerspectiveCamera(45, settings.container.clientWidth / settings.container.clientHeight, 1, 2000);

    controls = new TrackballControls(camera, settings.container);

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.2;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.3;
    //controls.minDistance = 200;
    //controls.maxDistance = 1000;

    controls.keys = [65, 83, 68]; // [ rotateKey, zoomKey, panKey ]

    var ambientLight = new THREE.AmbientLight(0xdddddd, 0.4);
    scene.add(ambientLight);

    pointLight = new THREE.PointLight();
    camera.add(pointLight);
    scene.add(camera);


    /*___________________________________________________________________________

     OBJECT LOADING
     ___________________________________________________________________________
     */
    loadMTL(settings);

    settings.container.innerHTML = "";
    settings.container.appendChild(renderer.domElement);

    camera.lookAt(new THREE.Vector3(0, -1, 0));
}

function loadMTL(settings) {
    switch (settings.format) {
        case 'obj':
            // Overwriting OBJMTLLoader to allow progression monitoring
            objLoader.load = function (url, mtlurl, onLoad) {
                var scope = this;
                var mtlLoader = new THREE.MTLLoader(url.substr(0, Math.max(url.lastIndexOf("/"), url.lastIndexOf("\\")) + 1));

                mtlLoader.load('', function (materials) {
                    blankMat = materials;
                    mtlLoader.load(mtlurl, function (materials) {
                        textureMat = materials;
                        textureMat.preload();
                        var loader = new THREE.FileLoader(scope.manager);
                        //loader.load = My_XHRLoader_load;
                        loader.load(url, function (text) {
                            obj = scope.parse(text);
                            obj.traverse(function (object) {
                                if (object instanceof THREE.Mesh) {
                                    for (var m in object.material) {
                                        if (object.material[m].name) {
                                            // var material = (settings.showTexture == undefined || settings.showTexture ? textureMat : blankMat).create(object.material.name);
                                            var material = textureMat.create(object.material[m].name);
                                            material.setValues(returnMtmSett());
                                            if (material) object.material[m] = material;

                                        }
                                    }
                                }
                            });
                            onLoad(obj);
                        });

                    });
                });

            };

            objLoader.load(settings.meshFile, settings.mtlFile, onLoad, onProgress);
            break;
    }
}

function change2grid() {

    changeObjStatus(isShoTexture ? textureMat : blankMat, {wireframe: true});
    isShowWire = true;
}

function change2entity() {

    changeObjStatus(isShoTexture ? textureMat : blankMat, {wireframe: false});
    isShowWire = false;

}

function addTexture() {

    changeObjStatus(textureMat, {wireframe: isShowWire ? true : false});
    isShoTexture = true;

    pointLight.color.set(0xffffff);
    pointLight.intensity = 0.8;
}

function removeTexture() {

    changeObjStatus(blankMat, returnMtmSett());
    isShoTexture = false;

    pointLight.color.set(0x888888);
    pointLight.intensity = 0.6;

}

function changeObjStatus(mat, settings) {

    if (obj === undefined) {
        return;
    }
    scene.remove(obj);
    obj.traverse(function (object) {
        if (object instanceof THREE.Mesh) {
            for (var m in object.material) {
                if (object.material[m].name) {
                    // var material = (settings.showTexture == undefined || settings.showTexture ? textureMat : blankMat).create(object.material.name);
                    var material = mat.create(object.material[m].name);
                    material.setValues(settings);
                    if (material) object.material[m] = material;

                }
            }
        }
    });
    scene.add(obj);

}

/*  ___________________________________________________________________________

 Object Views
 ___________________________________________________________________________
 */

function showFront() {
    if (objectCopy !== undefined) objectCopy.rotation.z = 0;
    controls.reset();
    camera.position.z = 0;
    camera.position.y = 0;
    camera.position.x = sceneRadiusForCamera;
    camera.lookAt(scene.position);
}

/*  ___________________________________________________________________________

 Object translation
 ___________________________________________________________________________
 */
function resetObjectPosition() {
    boundingbox.update();

    // If you just want the numbers
    window.console.log("box radius: " + boundingbox.geometry.boundingSphere.radius);

    size.x = boundingbox.geometry.attributes.position.array[0] - boundingbox.geometry.attributes.position.array[3];
    size.y = boundingbox.geometry.attributes.position.array[1] - boundingbox.geometry.attributes.position.array[7];
    size.z = boundingbox.geometry.attributes.position.array[2] - boundingbox.geometry.attributes.position.array[14];

    window.console.log(size);

    // Repositioning object
    objectCopy.position.x = -boundingbox.geometry.attributes.position.array[3] - size.x / 2;
    objectCopy.position.y = -boundingbox.geometry.attributes.position.array[7] - size.y / 2;
    objectCopy.position.z = -boundingbox.geometry.attributes.position.array[14] - size.z / 2;

    boundingbox.update();
    if (objectCopy !== undefined) objectCopy.rotation.z = 0;

}


/*  ___________________________________________________________________________

 Rotation (Sphere)
 ___________________________________________________________________________
 */

function rotateLeftSlow() {
    var rotSpeed = .01;

    var x = camera.position.x,
        z = camera.position.z;

    camera.position.x = x * Math.cos(rotSpeed) + z * Math.sin(rotSpeed);
    camera.position.z = z * Math.cos(rotSpeed) - x * Math.sin(rotSpeed);

    camera.lookAt(scene.position);
}

function animate() {

    var renderAnimateID = setInterval(function () {
        render();
    }, 1000 / 50);
    renderAnimateIDs.push(renderAnimateID);
}

var isFistRender = true;

function render() {
    if (rotate) {
        // objectCopy.rotation.y += 0.01;
        rotateLeftSlow();
    }
    //window.console.log(scene.position);
    //controls.target(cameraTarget);
    controls.update(); //for cameras

    if (isFistRender && mSettings.showTexture == false) {
        removeTexture();
    }

    renderer.render(scene, camera);

    if (isFistRender) {
        window.console.log("start render! ");

        if (mSettings.startRenderCb instanceof Function) {
            mSettings.startRenderCb();
        }
    }

    isFistRender = false;
}

function rotateOn() {
    rotate = true;
}

function rotateOff() {
    rotate = false;
}


function size_verif(settings) {
    var xhr = $.ajax({
        type: "HEAD",
        url: settings.meshFile,
        success: function () {
            var size = xhr.getResponseHeader('Content-Length');
            size = parseInt(size);
            window.console.log("size = " + size);

            init(settings);
        },
        error: function () {
            window.console.log("load model failed ");
            if (settings.loadFailed instanceof Function) {
                settings.loadFailed();
            }
        }
    });
}

export{
    loadModel,
    rotateOff,
    rotateOn,
    change2entity,
    change2grid,
    removeTexture,
    addTexture,
    showFront,
    stopMeshRender
}
