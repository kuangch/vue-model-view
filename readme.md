# vue-model-view

基于vue的三维模型加载组件

## 使用

安装
``` bash
npm install vue-model-view -S
```

全局应用组件
``` javascript
import ModelView = from 'vue-model-view'
Vue.use(ModelView)
```

使用组件
``` html
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
```

组件属性
```
background-color: 模型显示容器背景颜色(可选，默认值: gainsboro)
options: 模型相关选项
    * options.objUrl: 模型url
    * options.resetButton 是否显示重置按钮(false/否，true/是)
```

说明
```
model-view 组件外面的容器可以是固定宽高，也可以是百分比大小
```

## 效果
![image](https://github.com/kuangch/vue-model-view/blob/master/screen.gif)