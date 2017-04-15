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
            translateZ = opts.containerWidth / (2 * Math.tan(pi)),
            keyframes = "@keyframes scroll{0% {transform: translateZ( -" + translateZ + "px) rotateY(0deg);}\n" +
            "100%{transform: translateZ( -" + translateZ + "px) rotateY(360deg);}}";

        $father.height(opts.containerHeight)
            .width(opts.containerWidth)
            .css('perspective', opts.perspective + 'px');
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

        // Hammer 
        if (opts.swiftMove) {
            // pan设置左右触屏滚动
            new Hammer($father[0]).on("panmove", function(ev) {
                ev.preventDefault();
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
        }

    };
    // 默认配置参数
    $.fn.css3Slider.defaults = {
        containerId: 'css3Slider',
        containerWidth: '500',
        containerHeight: '300',
        perspective: '1400',
        autoPlay: false,
        hoverParse: true,
        clickFront: true,
        swiftMove: true,
        animationTime: '12',
        translateZmore: '100'
    };
})(jQuery);
