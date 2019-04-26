<template>

    <div style="width: 100%;height: 100%; position: relative;" class="c">
        <div :id="options.objUrl" ref="container" class="container" :style="{background: backgroundColor}"></div>
        <img v-if="!isLoadSuccess" class="loading" :src="imageSrc" ref="loadingImg"/>
        <div class="control" v-if="isLoadSuccess && options.controller">
            <i class="iconfont icon-reset" @click="$threeViewer.toFront()"></i>
            <i class="iconfont icon-rotate-obj" :class="{'action': settings.rotate}" @click="toggleRotate()"></i>
            <i class="iconfont icon-texture" :class="{'action': settings.texture}" @click="toggleTexture()"></i>
            <i class="iconfont icon-wire-earth" :class="{'action': settings.wire}" @click="toggleWire()"></i>
        </div>
    </div>

</template>

<script>
    import ThreeViewer from './3dviewer'
    let defaultLoading = require('./assets/loading.png')

    export default {
        name: "model-view",
        created(){
            this.$threeViewer = new ThreeViewer()
        },
        data(){
            return{
                isLoadSuccess:false,
                imageSrc: this.loadingImg,
                settings:{
                    rotate: this.options.rotate,
                    texture: this.options.texture,
                    wire: this.options.wire,
                }
            }
        },

        props:{
            backgroundColor:{
                type:String,
                required: false
            },
            options:{
                type: Object,
                required: true
            },
            loadingImg:{
                type:String,
                required: false
            }
        },

        methods:{
            showModel: function(options){
                this.isLoadSuccess = false
                let _this = this;
                this.$threeViewer.init({
                    container: _this.$refs.container,
                    showTexture: _this.settings.texture,
                    showWire: _this.settings.wire,
                    rotate: _this.settings.rotate,
                    mesh:[
                        {
                            obj: options.objUrl || '',
                            mtl: options.mtlUrl || '',
                        }
                    ],
                    success: function(){
                        _this.isLoadSuccess = true
                    }
                })
            },

            toggleTexture: function () {
                this.settings.texture = !this.settings.texture
                this.$threeViewer.toggleTexture()
            },
            toggleRotate: function () {
                this.settings.rotate = !this.settings.rotate
                this.$threeViewer.toggleRotate()
            },
            toggleWire: function () {
                this.settings.wire = !this.settings.wire
                this.$threeViewer.toggleWire()
            },

            resetView: function(){
                this.isLoadSuccess = false
                this.$threeViewer.destroy();
            },
        },

        mounted(){
            let _this = this

            // 使用自带loading旋转
            function addAnim(){
                _this.$refs.loadingImg.style.cssText += 'animation: rotate 2s 0s infinite linear;'
            }

            _this.$refs.loadingImg.onerror = () => {
                _this.imageSrc = defaultLoading
                // 动画旋转
                addAnim()
            }

            if(_this.imageSrc === undefined){
                _this.imageSrc = defaultLoading
                // 动画旋转
                _this.$refs.loadingImg.style.cssText += 'animation: rotate 2s 0s infinite linear;'
                addAnim()
            }

            window.console.log(`${this.$options._componentTag} mounted`)
            this.showModel(this.options)
        },

        beforeDestroy(){
            window.console.log( `${this.$options._componentTag} beforeDestroy`)
            this.resetView()
        },

        watch:{
            'options.objUrl':{
                handler: function () {
                    let __THIS = this
                    window.console.log('ModelView objUrl changed')
                    window.console.log(__THIS.options)
                    __THIS.showModel(__THIS.options)
                },
                // deep: true,
            }
        }
    }
</script>

<style>
    @keyframes rotate {
        to{
            transform:  translate(-50%, -50%) rotate(360deg);
        }
    }
</style>

<style scoped lang="scss">
    @import "fonts/iconfont.css";

    .c{
        overflow: hidden;
    }

    .loading{
        display: inline-block;
        position: absolute;
        width: 20%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        /*animation: rotate 2s 0s infinite linear;*/
        transform-origin: 50% 50%;
    }

    .container{
        position: absolute;
        display: inline-block;
        top:0;
        left: 0;
        width: 100%;
        height: 100%;
        background: gainsboro;
    }

    .control{
        position: absolute;
        right: 0.4em;
        bottom: 1%;
        transition: opacity 300ms;
        opacity: 0;
        i{
            font-size: 1em !important;
            cursor: pointer;
            color: #555;
            margin-left: 2%;
        }
        i.action{
            color: blue;
        }
        i:hover{
            color: #222;
        }
    }
    .control:hover{
        opacity: 1;
    }
</style>
