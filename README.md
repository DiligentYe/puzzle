### 拼图小游戏模块
拼图组件，可自定义开发

#### 使用方法
1. 将js文件引入页面（此时页面引入puzzle全局变量）
```
<script src="./puzzle.js"></script>
```

2. 获取拼图在页面的挂载点，然后调用init(url, root, options)方法，初始化拼图
```
 <script>
    var root = document.getElementById('puzzle');
    puzzle.init('./1.jpeg', root, {
        // 边框的宽度
        borderWidth: 2,
        // 取消计时功能
        failure: null,
        // 16方块拼图
        count: 16
    });
```

3. 提供restart(url), stop()方法，重新开始和停止拼图
```
重新开始（restart）:

puzzle.restart('./2.jpg'); // 重新开始新的一张拼图
or
puzzle.restart(); // 重新开始当前拼图

停止（stop）:
puzzle.stop(function(){
        setTimout(funtion(){
            alert('stop');
        }, 0);
    }); // 停止并调用回调函数
or
puzzle.stop(); // 停止

```

#### 对外开放接口
1. init(url, root, options): 在指定容器中生成一个拼图 
    **url**: string，图片链接(必选)
    **root**（可选）: DOM，挂载点，如果没有指定的话，默认在body最后面创建一个盒子作为root
    **options**（可选）: object，自定义配置选项（可选），具体配置项如下：
```
        1. count: number，拼图方块总个数（同时设置为最少的打乱次数）最好能被开方，默认值为9
        2. readyDelay: number，玩家准备时间，默认值为3000
        3. playDelay: number，玩家拼图时间，默认值为10000,
        4. borderColor: string，拼图边框颜色，默认值为'#999',
        5. borderWidth: number，拼图边框宽度，默认值为3,
        6. highlight（可选）: object，高亮部分样式配置，其中包括       
            1. top: number，距离元素位置顶部距离，默认值为1
            2. left: number，距离元素位置左侧距离，默认值为1,
            3. borderColor: string, 边框的颜色，默认值为'rgb(255, 68, 0)',
            4. boxShadow: object背阴部分设置，默认值为：
            {
                hz: 3,
                vt: 2,
                blur: 5,
                color: 'rgba(255, 68, 0, 0.8)'
            }
            
            如果想要自定义高亮样式，那么需要写全这些属性，否则会出错，如果想要取消高亮，传入null。

            ---在此基础上进行修改
            highlight: {
                top: 1,
                left: 1,
                borderColor: 'rgb(255, 68, 0)',
                boxShadow: {
                    hz: 1,
                    vt: 1,
                    blur: 2,
                    color: 'rgba(255, 68, 0, 0.8)'
                }
            }


        7. success（可选）: function，默认成功是调用的函数，默认值为
        
        function() {
            setTimeout(function() {
                alert('Perfact');
            }, 100); // 延时100毫秒是为了让图片先变化在弹出提示消息，可以自由设定
        },
        
        **重要：** 如果想要取消默认行为，需要传入null，成功后不做任何动作。

        8. failure(可选): 默认失败是调用的函数，默认值为
        
        function() {
            setTimeout(function() {
                alert('Handup');
            });
        } 
        
        **重要：** 如果想要取消默认行为，需要传入null，此时会取消定时行为，可以自由拼图。
```
2. restart(url): 重新生成一个拼图
    **url**: string，图片的链接地址（可选），如果没有指定的话，默认使用上一张图片

3. stop(): 终止本次拼图游戏
