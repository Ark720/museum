/**
 * Created by Administrator on 2017/8/14.
 */
var popUpBox = function(iType){
    var scope = this;
    var viewport = document.getElementById('viewport');
    var boxContent = new UI.Panel().setId('popUpBoxContent');
    boxContent.dom.style.display = "none";
    viewport.appendChild(boxContent.dom);

    var boxClose = new UI.createDiv('popUpBoxClose',boxContent);
    boxClose.onClick(function(e){
        e.preventDefault();
        $('#popBoxIframe').css("display",'none');
        $('#popBoxImgFrame').css("display",'none');
        $('#popUpBoxContent').css("display",'none');
    });

    var frameContent = new UI.createDiv('frameContent',boxContent);
    var iframe = document.createElement('iframe');
    iframe.className = "boxFrame";
    iframe.id = "popBoxIframe";
    iframe.width = "100%";
    iframe.height = "100%";
    iframe.frameBorder = 0;
    frameContent.dom.appendChild(iframe);
    var imgFrame = new UI.createDiv('boxFrame',frameContent).setId('popBoxImgFrame');
    var img = document.createElement('img');
    img.id = "popBoxImg";
    imgFrame.dom.appendChild(img);

    function cycleClear() {
        try {
            var el =  document.getElementById('popBoxIframe');
            if (el) {
                el.contentWindow.document.write('');
                el.contentWindow.document.clear();
                //el.src = 'about:blank';
                //window.history.back();

            }
            if(el.src!=window.location.href) window.close();
        } catch (e) {
            setTimeout(cycleClear, 100);
        }
    }
    $(boxClose.dom).click(function () {
        $('.maskdiv').toggle();

        if(iType==undefined){
            if (dataBaseO.controls.type=="2") controls.enabled = true;
        }
        else {
            if (dataBase.controls.type=="2") editor.controls.enabled = true;
        }


        var el = document.getElementById("popBoxIframe");
        if (el.src!="" && el.src!=window.location.href) {
            console.log(el.src);
            el.src = "";
            setTimeout(cycleClear, 100);
        }
        //cycleClear();
        if(enablebg){
            rAF=requestAnimationFrame(animate1);
        }else{
            rAF=requestAnimationFrame(animate2);
        }
        if(sMusic.src) sMusic.play();
    });

    this.imgstyle=function(imgsrc){
        var img=new Image();
        var popBoxImg=document.getElementById("popBoxImg");
        var popBoxImgFrame=document.getElementById("popBoxImgFrame");
        img.onload=function(){
            if(window.screen.availWidth>window.screen.availHeight){
                console.log(window.screen.availWidth)
                popBoxImg.style.width="auto";
                popBoxImg.style.height="100%";
                popBoxImg.style.top="";
                popBoxImg.style.left="50%";
                popBoxImg.style.marginTop="";
                popBoxImg.style.marginLeft=-(popBoxImg.clientHeight*img.width/img.height)/2+"px";
            }else{
                popBoxImg.style.width="100%";
                popBoxImg.style.height="auto";
                popBoxImg.style.top="50%";
                popBoxImg.style.left="0";
                popBoxImg.style.marginTop=-(popBoxImg.clientWidth*img.height/img.width)/2+"px";
                popBoxImg.style.marginLeft="";
            }
            if(mobileDevice){
                scope.touchScale(popBoxImg,popBoxImgFrame)
            }else{
                scope.mouseScale(popBoxImg,popBoxImgFrame)
            }
        };
        img.src=imgsrc;

    };
    this.touchScale = function(seletor, bg) {
        var startX, endX, scale, x1, x2, y1, y2, imgLeft, imgTop, imgWidth, imgHeight,
            one = false,
            $touch = $(seletor),
            originalWidth = $touch.width(),
            originalHeight = $touch.height(),
            baseScale = parseFloat(originalWidth/originalHeight),
            imgData = [],
            center={},
            bgTop = parseInt($(bg).css('top'));

        function siteData(name) {
            imgLeft = parseInt(name.css('left'));
            imgTop = parseInt(name.css('top'));
            imgWidth = name.width();
            imgHeight = name.height();
        }
        $(bg).on('touchstart  touchmove touchend', $(seletor).parent().selector, function(event){
            var $me = $(seletor),
                touch1 = event.originalEvent.targetTouches[0],  // 第一根手指touch事件
                touch2 = event.originalEvent.targetTouches[1],  // 第二根手指touch事件
                fingers = event.originalEvent.touches.length;   // 屏幕上手指数量
            //手指放到屏幕上的时候，还没有进行其他操作
            if (event.type == 'touchstart') {
                //control.enabled = false;
                if (fingers == 2) {
                    // 缩放图片的时候X坐标起始值
                    //startX = Math.abs(touch1.pageX - touch2.pageX);
                    startX = Math.sqrt((touch1.pageX-touch2.pageX)*(touch1.pageX-touch2.pageX)+(touch1.pageY-touch2.pageY)*(touch1.pageY-touch2.pageY));

                    center.x= (touch2.pageX-touch1.pageX)/2+touch1.pageX;
                    center.y= (touch2.pageY-touch1.pageY)/2+touch1.pageY;
                    one = false;
                }
                else if (fingers == 1) {
                    x1 = touch1.pageX;
                    y1 = touch1.pageY;
                    one = true;
                }
                siteData($me);
            }
            //手指在屏幕上滑动
            else if (event.type == 'touchmove') {

                //alert(1)
                event.stopPropagation();
                event.preventDefault();
                if (fingers == 2) {
                    var scaleSize = 1;
                    endX = Math.sqrt((touch1.pageX-touch2.pageX)*(touch1.pageX-touch2.pageX)+(touch1.pageY-touch2.pageY)*(touch1.pageY-touch2.pageY));

                    var p = (endX-startX)/10000;
                    var ns = scaleSize;
                    ns += p;
                    ns = ns < 0.1 ? 0.1 : (ns > 5 ? 5 : ns);//可以缩小到0.1,放大到5倍
                    scaleSize = ns;//更新倍率
                    var ratioL = (center.x - $me[0].offsetLeft) / $me[0].offsetWidth,
                        ratioT = (center.y - $me[0].offsetTop) / $me[0].offsetHeight,
                        w= $me[0].width*ns,
                        h=$me[0].height*ns,
                        l = Math.round(center.x - ( w * ratioL)),
                        t = Math.round(center.y - ( h * ratioT));
                    // 缩放图片的时候X坐标滑动变化值
                    //endX = Math.abs(touch1.pageX - touch2.pageX);
                    //scale = (endX - startX)*2;
                    $me.css({
                        'width' : w,
                        'height' : h,
                        'left' : l,
                        'top' : t,
                        'margin-top':0,
                        'margin-left':0
                    });

                }else if (fingers == 1) {
                    x2 = touch1.pageX;
                    y2 = touch1.pageY;
                    if (one) {
                        $me.css({
                            'left' : imgLeft + (x2 - x1),
                            'top' : imgTop + (y2 - y1)
                        });
                    }
                }
            }
            //手指移开屏幕
            else if (event.type == 'touchend') {
                //control.enabled = true;
                // 手指移开后保存图片的宽
                originalWidth = $touch.width(),
                    siteData($me);
                imgData = [[imgLeft, imgTop-bgTop, imgWidth, imgHeight],[0, 0, 640, 640]];
            }
        });
        var getData = function(){
            return imgData;
        };
        return {
            imgData : getData
        }
    };
    this.mouseScale = function(seletor, bg) {
        var startX, endX, scale, x1, x2, y1, y2, imgLeft, imgTop, imgWidth, imgHeight,
            $touch = $(seletor),
            originalWidth = $touch.width(),
            originalHeight = $touch.height(),
            imgData = [],
            bgTop = parseInt($(bg).css('top'));

        function siteData(name) {
            imgLeft = parseInt(name.css('left'));
            imgTop = parseInt(name.css('top'));
            imgWidth = name.width();
            imgHeight = name.height();
        }
        $(bg).on('mousedown', $(seletor).parent().selector, function(event){
            var $me = $(seletor);
            x1 = event.pageX;
            y1 = event.pageY;
            siteData($me);
            $(bg).on('mousemove', $(seletor).parent().selector, function(event){
                var $me = $(seletor);
                event.stopPropagation();
                event.preventDefault();
                x2 = event.pageX;
                y2 = event.pageY;
                $me.css({
                    'left' : imgLeft + (x2 - x1),
                    'top' : imgTop + (y2 - y1)
                });
            })
        });
        $(bg).on('mouseup', $(seletor).parent().selector, function(event) {
                $(bg).off('mousemove');
            }
        );
        $(bg).on('mousewheel', $(seletor).parent().selector, function(e) {
                var $me = $(seletor);
                var scaleSize = 1;
                e.preventDefault();
                var p = -(e.originalEvent.deltaY) / 1000;
                var ns = scaleSize;
                ns += p;
                ns = ns < 0.1 ? 0.1 : (ns > 5 ? 5 : ns);//可以缩小到0.1,放大到5倍
                scaleSize = ns;//更新倍率
                var ratioL = (e.originalEvent.clientX - $me[0].offsetLeft) / $me[0].offsetWidth,
                    ratioT = (e.originalEvent.clientY - $me[0].offsetTop) / $me[0].offsetHeight,
                    w= $me[0].width*ns,
                    h=$me[0].height*ns,
                    l = Math.round(e.originalEvent.clientX - ( w * ratioL)),
                    t = Math.round(e.originalEvent.clientY - ( h * ratioT));
                $me.css({
                    'width' : w,
                    'height' : h,
                    'left':l,
                    'top':t,
                    'margin-top':0,
                    'margin-left':0
                });
            }
        );

        var getData = function(){
            return imgData;
        };
        return {
            imgData : getData
        }
    };
};