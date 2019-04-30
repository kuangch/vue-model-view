/* ========================================
 *  company : Dilusense
 *   author : Kuangch
 *     date : 2019/4/27
 * ======================================== */

/**
 * 替换掉THREE对象的 MTLLoader.MaterialCreator对象的 "createMaterial_" 方法，修改了一些逻辑（纹理图片加载完成前后的一些处理）
 * @param THREE
 * @param context
 */

function CustomMTLLoaderMaterialCreator(THREE,context) {

    function OldParams(material) {
        this.map =  material.map
        this.specular =  material.specular          // 镜面反射光颜色(mtl中的ks)
        this.shininess = material.shininess         // 光亮（mtl中的ns)
    }

    THREE.MTLLoader.MaterialCreator.prototype.createMaterial_ = function ( materialName ) {

        let _this = this
        let oldParams = null
        // Create material
        var mat = this.materialsInfo[ materialName ];
        var params = {

            name: materialName,
            side: this.side

        };

        for ( var prop in mat ) {

            var value = mat[ prop ];

            switch ( prop.toLowerCase() ) {

                // Ns is material specular exponent

                case 'kd':

                    // Diffuse color (color under white light) using RGB values

                    params[ 'diffuse' ] = new THREE.Color().fromArray( value );

                    break;

                case 'ka':

                    // Ambient color (color under shadow) using RGB values

                    params[ 'ambient' ] = new THREE.Color().fromArray( value );

                    break;

                case 'ks':

                    // Specular color (color when light is reflected from shiny surface) using RGB values
                    params[ 'specular' ] = new THREE.Color().fromArray( value );

                    break;

                case 'map_kd':

                    // Diffuse texture map

                    params['map'] = this.loadTexture(this.baseUrl + value, null, function (texture) {

                        //纹理图片加载成功回调
                        if(oldParams){

                            _this.materials[ materialName ].map = oldParams.map
                            _this.materials[ materialName ].specular = oldParams.specular
                            _this.materials[ materialName ].shininess = oldParams.shininess

                            // 更换了材质了需要更新
                            _this.materials[ materialName ].needsUpdate = true

                            context && context.configPLight()

                        }else{
                            oldParams = true
                        }


                    });
                    params[ 'map' ].wrapS = this.wrap;
                    params[ 'map' ].wrapT = this.wrap;

                    break;

                case 'ns':

                    // The specular exponent (defines the focus of the specular highlight)
                    // A high exponent results in a tight, concentrated highlight. Ns values normally range from 0 to 1000.

                    params['shininess'] = value;

                    break;

                case 'd':

                    // According to MTL format (http://paulbourke.net/dataformats/mtl/):
                    //   d is dissolve for current material
                    //   factor of 1.0 is fully opaque, a factor of 0 is fully dissolved (completely transparent)

                    if ( value < 1 ) {

                        params['transparent'] = true;
                        params['opacity'] = value;

                    }

                    break;

                default:
                    break;

            }

        }

        if ( params[ 'diffuse' ] ) {

            if ( !params[ 'ambient' ]) params[ 'ambient' ] = params[ 'diffuse' ];
            params[ 'color' ] = params[ 'diffuse' ];

        }

        this.materials[ materialName ] = new THREE.MeshPhongMaterial( params );

        // 纹理图片加载出来前，将一下属性值先修改和空白纹理同名属性值一致,先缓存一下解析出来的参数
        if (!oldParams){
            oldParams = new OldParams(this.materials[ materialName ])
            this.materials[ materialName ].map = null
            this.materials[ materialName ].specular = new THREE.Color(0.0667,0.0667,0.0667)
            this.materials[ materialName ].shininess = 30
        }

        return this.materials[ materialName ];

    }

}

export default CustomMTLLoaderMaterialCreator