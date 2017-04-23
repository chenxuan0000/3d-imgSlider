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
            translateZ = opts.containerWidth / (2 * Math.tan(pi)),
            keyframes = "@keyframes scroll{0% {transform: translateZ( -" + translateZ + "px) rotateY(0deg);}\n" +
            "100%{transform: translateZ( -" + translateZ + "px) rotateY(360deg);}}";

        $father.height(opts.containerHeight)
            .width(opts.containerWidth)
            .css({
                'perspective': opts.perspective + 'px',
                'perspectiveOrigin': opts.rotateX + ' ' + opts.rotateY
            });
        $children.css("transform", " translateZ( -" + translateZ + "px)");
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
        } catch (e) {}
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
        // 阻止这块里面img的默认拖拽事件
        $children.on("mousedown", 'img', function(e) {
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
        // mousewheel 
        if (!opts.autoPlay && opts.mousewheel) {
            // 鼠标滚轮滚动时间
            $children.on("mousewheel DOMMouseScroll", function(e) {
                var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) || // chrome & ie
                    (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1)); // firefox
                if (delta > 0) {
                    // 向上滚
                    wheelDeg += deg;
                    $children.css({
                        "transition": "transform 1s",
                        "transform": " translateZ( -" + translateZ + "px) rotateY(" + getRotateYAll() + "deg)"
                    });
                    countIndex(-1);
                } else if (delta < 0) {
                    // 向下滚
                    wheelDeg -= deg;
                    $children.css({
                        "transition": "transform 1s",
                        "transform": " translateZ( -" + translateZ + "px) rotateY(" + getRotateYAll() + "deg)"
                    });
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
                        $children.css({
                            "transition": "transform " + Math.abs(moveIndex) + "s",
                            "transform": " translateZ( -" + translateZ + "px) rotateY(" + getRotateYAll() + "deg)"
                        });
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

        // Hammer 
        if (opts.swiftMove) {
            // pan设置左右触屏滚动
            new Hammer($father[0]).on("panstart", function(ev) {
                panStartFalg = false;
                ev.preventDefault();
            }).on("panmove", function(ev) {
                if (ev.deltaX > 0) {
                    var floor = Math.ceil((ev.deltaX) / 225);
                } else {
                    var floor = Math.floor((ev.deltaX) / 225);
                }
                var x = getRotateYAll() + floor * 45;

                $children.css({
                    "transition": "transform " + Math.abs(Math.floor(floor)) + "s",
                    "transform": " translateZ( -" + translateZ + "px) rotateY(" + x + "deg)"
                });

            }).on("panend", function(ev) {
                if (ev.deltaX > 0) {
                    var floor = Math.ceil((ev.deltaX) / 225);
                } else {
                    var floor = Math.floor((ev.deltaX) / 225);
                }
                //重学oldIndex 为什么要在定时器里？ 因为这个pan在浏览器上存在bug拖了可能没转
                //可以防止panmove拖动小距离闪动导致无动作h
                setTimeout(function() {
                    countIndex(floor * (-1));
                }, 0);
                swiftDeg += floor * 45;
                panStartFalg = true;
            });

            if (opts.swiftUpDown) {
                var upDown = function(ev) {
                    var floor = Math.floor((ev.deltaY) * (-1) / 100);
                    panUpDownDeg = panUpDownDeg + floor;
                    $children.css("transform", " translateZ( -" + translateZ + "px)");
                };
                // pan设置上下触屏翻转
                new Hammer($('body')[0]).on("panup", upDown).on("pandown", upDown);

            }

        }

    };
    // 默认配置参数
    $.fn.css3Slider.defaults = {
        containerId: 'css3Slider',
        containerWidth: '500',
        containerHeight: '300',
        perspective: '1400',
        rotateX: '50%',
        rotateY: '50%',
        autoPlay: false,
        hoverParse: true,
        mousewheel: true,
        clickFront: true,
        swiftMove: true,
        swiftUpDown: true,
        animationTime: '12',
        translateZmore: '100'
    };
})(jQuery);
