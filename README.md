## a jQuery 3D img slider

## Usage
创建一个dom容器

```
<div class="css3Slider" id="css3Slider">
        <div class="animation-father">
            <figure class="animation-child">0
                <a href="javascript:;"><img src="img/img1.jpg"></a>
            </figure>
            <figure class="animation-child">1
                <a href="javascript:;"><img src="img/img2.jpg"></a>
            </figure>
            <figure class="animation-child">2
                <a href="javascript:;"><img src="img/img3.jpg"></a>
            </figure>
            <figure class="animation-child">3
                <a href="javascript:;"><img src="img/img4.jpg"></a>
            </figure>
            <figure class="animation-child">4
                <a href="javascript:;"><img src="img/img5.jpg"></a>
            </figure>
            <figure class="animation-child">5
                <a href="javascript:;"><img src="img/img6.jpg"></a>
            </figure>
            <figure class="animation-child">6
                <a href="javascript:;"><img src="img/img7.jpg"></a>
            </figure>
            <figure class="animation-child">7
                <a href="javascript:;"><img src="img/img8.jpg"></a>
            </figure>
        </div>
    </div>
```

引入需要的css js
```
<link rel="stylesheet" href="css/common.css"> //reset
<link rel="stylesheet" href="css/demo.css"> //demo.css
<script src="js/hammer.min.js"></script> //手势库插件 需要的话
<script type="text/javascript" src="js/jquery-3.1.1.min.js"></script> 
<script type="text/javascript" src="js/3dSlider.js"></script> //3d轮播图插件
```

初始化js
```
  $.fn.css3Slider = {
         containerId: 'css3Slider',
         containerWidth: '500',
         containerHeight: '300',
         perspective: '1400',
         autoPlay: false,
         hoverParse: true,
         clickFront: true,  
         swiftMove: true,   //swiftMove配置为true 需要引入hammer.min.js
         animationTime: '12',
         translateZmore: '100'
     };
```