<template>

    <div style="width: 100%;height: 100%; position: relative;">
        <div :id="options.objUrl" ref="container" class="container" :style="{background: backgroundColor}">
        </div>
        <i v-if="isLoadSuccess && options.resetButton" class="iconfont icon-zhongzhi to-front" @click="toFront"></i>
    </div>

</template>

<script>
    var MeshViewer = require('./meshviewer')
    export default {
        name: "model-view",
        data(){
            return{
                isLoadSuccess:false
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
            }

        },

        methods:{
            showModel: function(options){
                this.isLoadSuccess = false
                let _THIS = this;
                MeshViewer.loadModel({
                    'format': 'obj',
                    'container': _THIS.$refs.container,
                    'meshFile': options.objUrl || '',
                    'mtlFile': options.mtlUrl || '',
                    'showTexture': false,
                    'showWireframe': false,
                    'startRenderCb':_THIS.startRenderCb
                })
            },

            toFront: function(){
                try{
                    MeshViewer.showFront()
                }catch(e){
                    window.console.log(e)
                }
            },

            resetView: function(){
                this.isLoadSuccess = false
                MeshViewer.stopMeshRender();
                this.$refs.container.innerHTML = '';
            },

            startRenderCb: function(){
                this.isLoadSuccess = true
            }
        },

        mounted(){
            window.console.log('ModelView mounted')
            window.console.log(this.options.objUrl)
            this.showModel(this.options)
        },

        beforeDestroy(){
            window.console.log( 'ModelView beforeDestroy')
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

<style scoped>
    @import "fonts/iconfont.css";
    .container{
        width: 100%;
        height: 100%;
        background: gainsboro;
    }
    .to-front{
        font-size: 1.2vw !important;
        cursor: pointer;
        color: #555;
        position: absolute;
        right: 0.5vw;
        bottom: 0.5vw;
    }
    .to-front:hover{
        color: #222;
    }

</style>
