# vue-model-view

基于vue的三维模型加载组件

[demo演示](https://kuangch.github.io/vue-model-view/demo/)

## 使用

安装
``` bash
npm install vue-model-view -S
```

组件安装
``` javascript
import ModelView from 'vue-model-view'
Vue.use(ModelView)
```

组件使用
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
             success: function(){}
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
    · options.objUrl       :（必选）<string> 模型文件url
    · options.mtlUrl       :（可选）<string> 纹理文件url
    · options.texture      :（可选）<bool> 是否显示纹理
    · options.wire         :（可选）<bool> 是否以网格展示
    · options.rotate       :（可选）<bool> 是否自动旋转
    · options.success      :（可选）<Function> 模型加载成功回调
```

组件方法
```
· toFront()         : 重置模型方位为正向最佳视角
· toggleTexture()   : 显示/隐藏纹理，返回值bool（调用后是否显示纹理）
· toggleRotate()    : 打开/关闭自动旋转，返回值bool（调用后是否显示自动旋转）
· toggleWire()      : 实体/网格显示模型，返回值bool（调用后是否显示网格）

· addObj(url,mtlurl,options)    : 添加3d物体
    参数说明:
        url     : (必选)<string> 模型文件路径
        mtlurl  : (可选)<string> 纹理文件路径
        options : (可选)<object> 其他参数
            isBasic : (可选)<bool> default(false)是否是基础3d物体（基础模型居中其他模型按照相对于基础模型的控件位置放置），只能add一个基础模型
      
· removeObj(url)                : 移除模型
    参数说明:
        url     : (必选)<string> 模型文件路径
```


说明
```
· model-view 组件外面的容器可以是固定宽高，也可以是百分比大小
· 给外层容器font-size设置大小可以改变控制按钮的大小

```

## 效果
![image](https://raw.githubusercontent.com/kuangch/vue-model-view/master/screen.gif)
