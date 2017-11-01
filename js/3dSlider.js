/*
 **auther :chenxuan
 **date : 2017-4-15
 */
(function($) {
    $.fn.css3Slider = function(options) {
        var opts = $.extend({}, $.fn.css3Slider.defaults, options),
            $father = $('#' + opts.containerId),
            $children = $father.children(),
            $grandson = $children.children(),
            length = $grandson.length,
            deg = 360 / length,
            pi = Math.PI / length,
            oldIndex = 0, //滚动前置前块的index
            clickIndexAll = 0, //记录click事件导致 $children 偏移的index
            rotateYDeg = 0, //存click事件 产生的rotateY
            swiftDeg = 0, //存pan事件 产生的rotateY
            wheelDeg = 0, ////存mousewheel事件 产生的rotateY
            panStartFalg = true, //开关防止 pan事件时候触发 click事件
            panUpDownDeg = 0,
            translateZ = opts.containerWidth / (2 * Math.tan(pi)) + opts.translateZmore,
            keyframes = "@keyframes scroll{0% {transform: translateZ( -" + translateZ + "px) rotateY(0deg);}\n" +
            "100%{transform: translateZ( -" + translateZ + "px) rotateY(360deg);}}";
        // 设置场景元素(父元素的基本属性)
        $father.css({
            'width': opts.containerWidth,
            'height': opts.containerHeight,
            'perspective': opts.perspective,
            'perspectiveOrigin': opts.rotateX + ' ' + opts.rotateY
        });
        //子元素初始z偏移
        $children.css("transform", " translateZ( -" + translateZ + "px)");
        //遍历设置孙子元素的rotateY
        $grandson.each(function(i, e) {
            e.style.transform = 'rotateY( ' + i * deg + 'deg) translateZ( ' + translateZ + 'px)';
        });
        // 动态插入keyframes
        var style = document.createElement('style');
        style.type = 'text/css';
        document.getElementsByTagName('head')[0].appendChild(style);
        this.stylesheet = document.styleSheets[document.styleSheets.length - 1];
        try {
            this.stylesheet.insertRule(keyframes, this.stylesheet.rules.length);
        } catch (e) {

        }
        // 是否自动播放
        if (opts.autoPlay) {
            if (opts.hoverParse) {
                $children.mouseover(function() {
                    $(this).css("animation-play-state", "paused");
                }).mouseout(function() {
                    $(this).css("animation-play-state", "");
                });
            }
            $children.css("animation", "scroll " + opts.animationTime + "s infinite");
        }
        // 阻止这块里面的默认拖拽事件(如图片)
        $children.on("mousedown", function(e) {
            e.preventDefault();
        });
        // 获取当前 $children rotateY 
        var getRotateYAll = function() {
            return wheelDeg + swiftDeg + rotateYDeg;
        };
        // 定义个函数计算当前置前块的真实的index 
        var countIndex = function(times) {
            oldIndex = oldIndex + times;
            if (oldIndex > 7) {
                oldIndex = oldIndex % 8;
            } else if (oldIndex < 0) {
                oldIndex = oldIndex % 8 + length;
            }
        };
        //设置$children css3动画属性
        var setChildCss3 = function(delay, y) {
            $children.css({
                "transition": "transform " + delay + "s",
                "transform": " translateZ( -" + translateZ + "px) rotateY(" + y + "deg)"
            });
        };
        // mousewheel 鼠标滚动事件
        if (!opts.autoPlay && opts.mousewheel) {
            // 鼠标滚轮滚动时间
            $children.on("mousewheel DOMMouseScroll", function(e) {
                var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) || // chrome & ie
                    (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1)); // firefox
               
                if (delta > 0) {
                    // 向上滚
                    wheelDeg += deg;
                    setChildCss3(.5, getRotateYAll());
                    countIndex(-1);
                } else if (delta < 0) {
                    // 向下滚
                    wheelDeg -= deg;
                    console.log(wheelDeg)
                    setChildCss3(.5, getRotateYAll());
                    countIndex(1);
                }
            });

        }
        // 单击块 当前块置前
        if (!opts.autoPlay && opts.clickFront) {
            var clickFront = function(e) {
                //开关 判断是否和pan事件冲突并发
                if (panStartFalg) {
                    e.preventDefault();
                    var $this = $(this),
                        index = $this.index(),
                        moveIndex;
                    // 判断位置变化量
                    switch (index - oldIndex) {
                        case 1 - length:
                            moveIndex = 1;
                            break;
                        case length - 1:
                            moveIndex = -1;
                            break;
                        default:
                            moveIndex = index - oldIndex;
                            break;
                    }
                    clickIndexAll += moveIndex;
                    oldIndex = index;
                    rotateYDeg = clickIndexAll * deg * (-1);
                    //根据位置newIndex进行css3动画
                    if (moveIndex) {
                        // 移动了进去动画
                        setChildCss3(Math.abs(moveIndex), getRotateYAll());
                    }

                    //判断是否存在a 动画延迟完实现
                    if ($this.find('a').length) {
                        setTimeout(function() {
                            location.href = $this.find('a')[0].href;
                        }, Math.abs(moveIndex) * 1000)
                    }
                }

            };

            $children.on("click", ".animation-child", clickFront);
        };
        var returnFloor = function(ev) {
            if (ev.deltaX > 0) {
                return Math.ceil((ev.deltaX) / 225);
            } else {
                return Math.floor((ev.deltaX) / 225);
            }
        };
        // Hammer 
        if (opts.swiftMove) {
            // pan设置左右触屏滚动
            new Hammer($father[0]).on("panstart", function(ev) {
                //禁止点击触发
                panStartFalg = false;
            }).on("panmove", function(ev) {
                var floor = returnFloor(ev),
                    x = getRotateYAll() + floor * 45;

                setChildCss3(Math.abs(Math.floor(floor)), x);

            }).on("panend", function(ev) {
                var floor = returnFloor(ev);
                //重学oldIndex 为什么要在定时器里？ 因为这个pan在浏览器上存在bug拖了可能没转
                //可以防止panmove拖动小距离闪动导致无动作h
                setTimeout(function() {
                    countIndex(floor * (-1));
                }, 0);
                swiftDeg += floor * 45;
                //恢复clickfront触发
                panStartFalg = true;
            });
        }
    };
    // 默认配置参数
    $.fn.css3Slider.defaults = {
        containerId: 'css3Slider',
        containerWidth: 500,
        containerHeight: 300,
        perspective: 1400,
        rotateX: "50%",
        rotateY: "50%",
        autoPlay: false,
        hoverParse: true,
        mousewheel: true,
        clickFront: true,
        swiftMove: true,
        animationTime: 12,
        translateZmore: 0
    };
})(jQuery);
