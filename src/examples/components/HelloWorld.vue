<template>

  <div style="width: 200px;height: 200px;">
      <model-view ref="viewer" :loading-img="loading" background-color="transparent" :options="model_options"/>

      <div v-if="!loadingSuccess">加载中，请耐心等待..</div>
      <div v-if="loadingSuccess" class="btn" :class="{'action': model_options.texture}" @click="texture()">纹理</div>
      <div v-if="loadingSuccess" class="btn" :class="{'action': model_options.rotate}" @click="rotate()">旋转</div>
      <div v-if="loadingSuccess" class="btn" :class="{'action': model_options.wire}" @click="wire()">网格</div>
      <div v-if="loadingSuccess" class="btn" @click="change()">切换</div>
      <div v-if="loadingSuccess" class="btn" @click="$refs.viewer.toFront()">正面</div>
  </div>

</template>

<script>
let loading = require('../assets/icon_3d.png')
export default {
  name: 'HelloWorld',
  data(){
      return {
          model_options:{
              objUrl: 'ring/stone1.obj',
              mtlUrl: 'ring/stone1.mtl',
              texture: true,
              wire: false,
              rotate: false,
              success: this.success
          },
          loading: undefined,
          loadingSuccess: false
      }
  },

  methods:{
      texture: function () {
          this.model_options.texture = this.$refs.viewer.toggleTexture()
      },
      rotate: function () {
          this.model_options.rotate = this.$refs.viewer.toggleRotate()
      },
      wire: function () {
          this.model_options.wire = this.$refs.viewer.toggleWire()
      },
      change: function () {
          this.loadingSuccess = false
          if(this.model_options.objUrl === 'ring/ring1.obj'){
              this.model_options.mtlUrl = 'ring/stone1.mtl'
              this.model_options.objUrl = 'ring/stone1.obj'
          }else{
              this.model_options.mtlUrl = 'ring/ring1.mtl'
              this.model_options.objUrl = 'ring/ring1.obj'
          }
      },
      success: function () {
          this.loadingSuccess = true
      }
  }
}
</script>

<style scoped lang="scss">
    div{
        display: inline-block;

        .btn{
            text-decoration:underline;
            color: grey;
            cursor:pointer;
            padding-left: 5px;
            padding-right: 5px;
        }

        .btn.action{
            color: blue;
        }
    }
</style>
