<template>

  <div style="width: 200px;height: 200px;">
      <model-view ref="viewer" :loading-img="loading" background-color="transparent" :options="model_options"/>
      <div class="btn" @click="texture()">纹理</div>
      <div class="btn" @click="rotate()">旋转</div>
      <div class="btn" @click="wire()">网格</div>
  </div>

</template>

<script>
let loading = require('../assets/icon_3d.png')
export default {
  name: 'HelloWorld',
  data(){
      return {
          model_options:{
              objUrl: 'ring/ring1.obj',
              mtlUrl: 'ring/ring1.mtl',
              texture: true,
              wire: true,
              rotate: true,
              controller: true,
          },
          loading: undefined
      }
  },

  methods:{
      texture: function () {
          this.$refs.viewer.toggleTexture()
      },
      rotate: function () {
          this.$refs.viewer.toggleRotate()
      },
      wire: function () {
          this.$refs.viewer.toggleWire()
      }
  }
}
</script>

<style scoped lang="scss">
    div{
        display: inline-block;

        .btn{
            text-decoration:underline;
            color: blue;
            cursor:pointer;
            padding-left: 5px;
            padding-right: 5px;
        }
    }
</style>
