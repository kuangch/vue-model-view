<template>

  <div style="width: 200px;height: 200px;">
      <model-view background-color="gainsboro" :options="model_options"/>
  </div>

</template>

<script>

export default {
  name: 'HelloWorld',
  data(){
      return {
          model_options:{
              objUrl: 'model.obj',
              resetButton: true,
          }
      }
  }
}
</script>

<style scoped>
    div{
        display: inline-block;
    }
</style>
