/* ========================================
 *  company : Dilusense
 *   author : Kuangch
 *     date : 2019/4/27
 * ======================================== */

/**
 * 替换掉THREE对象的 OBJLoader对象的parse方法，修改了一些逻辑（动态调整模型大小）
 * @param THREE
 */
function CustomOBJLoaderParse(THREE) {

    let maxSize = 0

    /**
     * 动态调整模型适合的大小
     */
    function bestObjSize(vertices) {

        // 模型点坐标有大于500的进行调整
        let scale = parseInt(maxSize/500)
        if (scale <= 1) return

        console.log(`模型过大,调整模型缩小${scale}倍`)
        console.time('OBJLoaderParse.js: resize obj')
        for(let i in vertices){
            vertices[i] /= scale
        }
        console.timeEnd('OBJLoaderParse.js: resize obj')
    }

    THREE.OBJLoader.prototype.parse = function parse(text, debug) {

        // 重置 max size
        maxSize = 0

        if (typeof debug === 'undefined') {
            debug = true;
        }

        if (debug) {
            console.time('OBJLoader');
        }

        let state = this._createParserState();

        if (text.indexOf('\r\n') !== -1) {

            // This is faster than String.split with regex that splits on both
            text = text.replace(/\r\n/g, '\n');
        }

        if (text.indexOf('\\\n') !== -1) {

            // join lines separated by a line continuation character (\)
            text = text.replace(/\\\n/g, '');
        }

        let lines = text.split('\n');
        let line = '',
            lineFirstChar = '',
            lineSecondChar = '';
        let lineLength = 0;
        let result = [];

        // Faster to just trim left side of the line. Use if available.
        let trimLeft = typeof ''.trimLeft === 'function';


        /**
         * -----------------------------------------------------------------------------------------
         * kuangch 001_STA
         * date: 2019.4.27
         * v的解析单独提出来进行处理
         *
         * old code:
         * state.vertices.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));
         */

        for (let i = 0, l = lines.length; i < l; i++) {

            line = lines[i];

            line = trimLeft ? line.trimLeft() : line.trim();

            lineLength = line.length;

            if (lineLength === 0) continue;

            lineFirstChar = line.charAt(0);

            // @todo invoke passed in handler if any
            if (lineFirstChar === '#') continue;

            if (lineFirstChar === 'v') {

                lineSecondChar = line.charAt(1);

                if (lineSecondChar === ' ' && (result = this.regexp.vertex_pattern.exec(line)) !== null) {

                    function getMaxSize(v) {
                        let abcV = Math.abs(v)
                        if (maxSize < abcV) maxSize = abcV
                        return v
                    }

                    state.vertices.push(getMaxSize(parseFloat(result[1])), parseFloat(result[2]), parseFloat(result[3]));

                }
            }
        }

        bestObjSize(state.vertices)
        /**
         * kuangch 001_END
         * -----------------------------------------------------------------------------------------
         */

        for (let i = 0, l = lines.length; i < l; i++) {

            line = lines[i];

            line = trimLeft ? line.trimLeft() : line.trim();

            lineLength = line.length;

            if (lineLength === 0) continue;

            lineFirstChar = line.charAt(0);

            // @todo invoke passed in handler if any
            if (lineFirstChar === '#') continue;

            if (lineFirstChar === 'v') {

                lineSecondChar = line.charAt(1);

                if (lineSecondChar === ' ') {
                    // 挪到外面单独执行
                } else if (lineSecondChar === 'n' && (result = this.regexp.normal_pattern.exec(line)) !== null) {

                    // 0                   1      2      3
                    // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

                    state.normals.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));
                } else if (lineSecondChar === 't' && (result = this.regexp.uv_pattern.exec(line)) !== null) {

                    // 0               1      2
                    // ["vt 0.1 0.2", "0.1", "0.2"]

                    state.uvs.push(parseFloat(result[1]), parseFloat(result[2]));
                } else {

                    this.onError("Unexpected vertex/normal/uv line: '" + line + "'");
                }
            } else if (lineFirstChar === "f") {

                if ((result = this.regexp.face_vertex_uv_normal.exec(line)) !== null) {

                    // f vertex/uv/normal vertex/uv/normal vertex/uv/normal
                    // 0                        1    2    3    4    5    6    7    8    9   10         11         12
                    // ["f 1/1/1 2/2/2 3/3/3", "1", "1", "1", "2", "2", "2", "3", "3", "3", undefined, undefined, undefined]

                    state.addFace(result[1], result[4], result[7], result[10], result[2], result[5], result[8], result[11], result[3], result[6], result[9], result[12]);
                } else if ((result = this.regexp.face_vertex_uv.exec(line)) !== null) {

                    // f vertex/uv vertex/uv vertex/uv
                    // 0                  1    2    3    4    5    6   7          8
                    // ["f 1/1 2/2 3/3", "1", "1", "2", "2", "3", "3", undefined, undefined]

                    state.addFace(result[1], result[3], result[5], result[7], result[2], result[4], result[6], result[8]);
                } else if ((result = this.regexp.face_vertex_normal.exec(line)) !== null) {

                    // f vertex//normal vertex//normal vertex//normal
                    // 0                     1    2    3    4    5    6   7          8
                    // ["f 1//1 2//2 3//3", "1", "1", "2", "2", "3", "3", undefined, undefined]

                    state.addFace(result[1], result[3], result[5], result[7], undefined, undefined, undefined, undefined, result[2], result[4], result[6], result[8]);
                } else if ((result = this.regexp.face_vertex.exec(line)) !== null) {

                    // f vertex vertex vertex
                    // 0            1    2    3   4
                    // ["f 1 2 3", "1", "2", "3", undefined]

                    state.addFace(result[1], result[2], result[3], result[4]);
                } else {

                    this.onError("Unexpected face line: '" + line + "'");
                }
            } else if (lineFirstChar === "l") {

                let lineParts = line.substring(1).trim().split(" ");
                let lineVertices = [],
                    lineUVs = [];

                if (line.indexOf("/") === -1) {

                    lineVertices = lineParts;
                } else {

                    for (let li = 0, llen = lineParts.length; li < llen; li++) {

                        let parts = lineParts[li].split("/");

                        if (parts[0] !== "") lineVertices.push(parts[0]);
                        if (parts[1] !== "") lineUVs.push(parts[1]);
                    }
                }
                state.addLineGeometry(lineVertices, lineUVs);
            } else if ((result = this.regexp.object_pattern.exec(line)) !== null) {

                // o object_name
                // or
                // g group_name

                // WORKAROUND: https://bugs.chromium.org/p/v8/issues/detail?id=2869
                // let name = result[ 0 ].substr( 1 ).trim();
                let name = (" " + result[0].substr(1).trim()).substr(1);

                state.startObject(name);
            } else if (this.regexp.material_use_pattern.test(line)) {

                // material

                state.object.startMaterial(line.substring(7).trim(), state.materialLibraries);
            } else if (this.regexp.material_library_pattern.test(line)) {

                // mtl file

                state.materialLibraries.push(line.substring(7).trim());
            } else if ((result = this.regexp.smoothing_pattern.exec(line)) !== null) {

                // smooth shading

                // @todo Handle files that have varying smooth values for a set of faces inside one geometry,
                // but does not define a usemtl for each face set.
                // This should be detected and a dummy material created (later MultiMaterial and geometry groups).
                // This requires some care to not create extra material on each smooth value for "normal" obj files.
                // where explicit usemtl defines geometry groups.
                // Example asset: examples/models/obj/cerberus/Cerberus.obj

                let value = result[1].trim().toLowerCase();
                state.object.smooth = value === '1' || value === 'on';

                let material = state.object.currentMaterial();
                if (material) {

                    material.smooth = state.object.smooth;
                }
            } else {

                // Handle null terminated files without exception
                if (line === '\0') continue;

                this.onError("Unexpected line: '" + line + "'");
            }
        }

        state.finalize();

        let container = new THREE.Group();
        container.materialLibraries = [].concat(state.materialLibraries);

        for (let i = 0, l = state.objects.length; i < l; i++) {

            let object = state.objects[i];
            let geometry = object.geometry;
            let materials = object.materials;
            let isLine = geometry.type === 'Line';

            // Skip o/g line declarations that did not follow with any faces
            if (geometry.vertices.length === 0) continue;

            let buffergeometry = new THREE.BufferGeometry();

            buffergeometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(geometry.vertices), 3));

            if (geometry.normals.length > 0) {

                buffergeometry.addAttribute('normal', new THREE.BufferAttribute(new Float32Array(geometry.normals), 3));
            } else {

                buffergeometry.computeVertexNormals();
            }

            if (geometry.uvs.length > 0) {

                buffergeometry.addAttribute('uv', new THREE.BufferAttribute(new Float32Array(geometry.uvs), 2));
            }

            // Create materials

            let createdMaterials = [];

            for (let mi = 0, miLen = materials.length; mi < miLen; mi++) {

                let sourceMaterial = materials[mi];
                let material = undefined;

                if (this.materials !== null) {

                    material = this.materials.create(sourceMaterial.name);

                    // mtl etc. loaders probably can't create line materials correctly, copy properties to a line material.
                    if (isLine && material && !(material instanceof THREE.LineBasicMaterial)) {

                        let materialLine = new THREE.LineBasicMaterial();
                        materialLine.copy(material);
                        material = materialLine;
                    }
                }

                if (!material) {

                    material = !isLine ? new THREE.MeshPhongMaterial() : new THREE.LineBasicMaterial();
                    material.name = sourceMaterial.name;
                }

                material.shading = sourceMaterial.smooth ? THREE.SmoothShading : THREE.FlatShading;

                createdMaterials.push(material);
            }

            // Create mesh

            let mesh;

            if (createdMaterials.length > 1) {

                for (let mi = 0, miLen = materials.length; mi < miLen; mi++) {

                    let sourceMaterial = materials[mi];
                    buffergeometry.addGroup(sourceMaterial.groupStart, sourceMaterial.groupCount, mi);
                }

                let multiMaterial = new THREE.MultiMaterial(createdMaterials);
                mesh = !isLine ? new THREE.Mesh(buffergeometry, multiMaterial) : new THREE.LineSegments(buffergeometry, multiMaterial);
            } else {

                mesh = !isLine ? new THREE.Mesh(buffergeometry, createdMaterials[0]) : new THREE.LineSegments(buffergeometry, createdMaterials[0]);
            }

            mesh.name = object.name;

            container.add(mesh);
        }

        if (debug) {
            console.timeEnd('OBJLoader');
        }

        return container;
    }
}

export default CustomOBJLoaderParse