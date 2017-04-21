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
            oldIndex = 0,
            newIndex = 0,
            rotateYDeg = 0,
            swiftDeg = 0,
            panUpDownDeg = 0,
            translateZ = opts.containerWidth / (2 * Math.tan(pi)),
            keyframes = "@keyframes scroll{0% {transform: translateZ( -" + translateZ + "px) rotateY(0deg);}\n" +
            "100%{transform: translateZ( -" + translateZ + "px) rotateY(360deg);}}";

        $father.height(opts.containerHeight)
            .width(opts.containerWidth)
            .css({ 'perspective': opts.perspective + 'px', 'perspectiveOrigin': opts.rotateX + ' ' + opts.rotateY });
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
        // mousewheel 
        if (!opts.autoPlay && !opts.swiftMove && !opts.clickFront && opts.mousewheel) {
            // 鼠标滚轮滚动时间
            $children.on("mousewheel DOMMouseScroll", function(e) {
                var delta = (e.originalEvent.wheelDelta && (e.originalEvent.wheelDelta > 0 ? 1 : -1)) || // chrome & ie
                    (e.originalEvent.detail && (e.originalEvent.detail > 0 ? -1 : 1)); // firefox

                if (delta > 0) {
                    // 向上滚
                    rotateYDeg += deg;
                    $children.css({
                        "transition": "transform 1s",
                        "transform": " translateZ( -" + translateZ + "px) rotateY(" + rotateYDeg + "deg)"
                    });
                } else if (delta < 0) {
                    // 向下滚
                    rotateYDeg -= deg;
                    $children.css({
                        "transition": "transform 1s",
                        "transform": " translateZ( -" + translateZ + "px) rotateY(" + rotateYDeg + "deg)"
                    });
                }
            });

        }
        // 单击块 当前块置前
        if (!opts.autoPlay && !opts.swiftMove && opts.clickFront) {
            var clickFront = function(e) {
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
                oldIndex = index;
                newIndex += moveIndex;
                rotateYDeg = swiftDeg + newIndex * deg * (-1);
                //根据位置newIndex进行css3动画
                $children.css({
                    "transition": "transform " + Math.abs(moveIndex) + "s",
                    "transform": " translateZ( -" + translateZ + "px) rotateY(" + rotateYDeg + "deg)"
                });
                //判断是否存在a 动画延迟完实现
                if ($this.find('a').length) {
                    setTimeout(function() {
                        location.href = $this.find('a')[0].href;
                    }, Math.abs(moveIndex) * 1000)
                }
            };
            $children.on("click", ".animation-child", clickFront);
        };
        // 算法获取当前对面屏幕位置居高rotateX("+opts.rotateX+") 
        var getRealRotateX = function(deg) {
            var x = Math.abs(deg % 360 / 360);
            // 判断位置变化量
            if (x === 0.5) {
                return -1;
            } else {
                return (1 - 2 * x);
            }
        };
        // Hammer 
        if (opts.swiftMove) {
            // pan设置左右触屏滚动
            new Hammer($father[0]).on("panstart", function(ev) {
                ev.preventDefault();
            }).on("panmove", function(ev) {
                var floor = Math.floor((ev.deltaX) / 225),
                    floor1 = floor * 45,
                    x = swiftDeg + rotateYDeg + floor1;
                $children.css({
                    "transition": "transform " + Math.abs(Math.floor(floor)) + "s",
                    "transform": " translateZ( -" + translateZ + "px) rotateY(" + x + "deg)"
                });
            }).on("panend", function(ev) {
                swiftDeg = swiftDeg + Math.floor((ev.deltaX) / 225) * 45;
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
