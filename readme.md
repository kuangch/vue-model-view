# vue-model-view

基于vue的三维模型加载组件

[demo演示](https://kuangch.github.io/vue-model-view/demo/)

## 使用

安装
``` bash
npm install vue-model-view -S
```

全局应用组件
``` javascript
import ModelView from 'vue-model-view'
Vue.use(ModelView)
```

使用组件
``` html
 <template>

   <div style="width: 200px;height: 200px;">
       <model-view :loading-img="http://baidu.com/1.jpg" background-color="gainsboro" :options="model_options"/>
   </div>

 </template>

 <script>

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
            }
       }
   }
 }
 </script>
```

组件属性
```
background-color : 模型显示容器背景颜色(可选，默认值: gainsboro)
loading-img      : 模型显示容器加载完成前显示图片(可选，默认自带loading)
controller       : 是否显示控制按钮(可选，默认是，false/否，true/是)

options: 模型相关选项
    · options.objUrl       :（必选）模型文件url
    · options.mtlUrl       :（可选）纹理文件url
    · options.texture      :（可选）是否显示纹理
    · options.wire         :（可选）是否以网格展示
    · options.rotate       :（可选）是否自动旋转
```

组件方法
```
· toFront()         : 重置模型方位为正向最佳视角
· toggleTexture()   : 显示/隐藏纹理，返回值bool（调用后是否显示纹理）
· toggleRotate()    : 打开/关闭自动旋转，返回值bool（调用后是否显示自动旋转）
· toggleWire()      : 实体/网格显示模型，返回值bool（调用后是否显示网格）
```


说明
```
· model-view 组件外面的容器可以是固定宽高，也可以是百分比大小
· 给外层容器font-size设置大小可以改变控制按钮的大小

```

## 效果
![image](https://raw.githubusercontent.com/kuangch/vue-model-view/master/screen.gif)
