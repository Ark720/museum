
function TextureAnimator(texture, tilesHoriz, tilesVert, numTiles, tileDispDuration)
{
    this.tilesHorizontal = tilesHoriz;
    this.tilesVertical = tilesVert;
    this.numberOfTiles = numTiles;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 1 / this.tilesHorizontal, 1 / this.tilesVertical );
    this.tileDisplayDuration = tileDispDuration;
    this.currentDisplayTime = 0;
    this.currentTile = 0;

    this.update = function( milliSec )
    {
        this.currentDisplayTime += milliSec;
        while (this.currentDisplayTime > this.tileDisplayDuration)
        {
            this.currentDisplayTime -= this.tileDisplayDuration;
            this.currentTile++;
            if (this.currentTile == this.numberOfTiles)
                this.currentTile = 0;
            var currentColumn = this.currentTile % this.tilesHorizontal;
            texture.offset.x = currentColumn / this.tilesHorizontal;
            var currentRow = Math.floor( this.currentTile / this.tilesHorizontal );
            texture.offset.y = currentRow / this.tilesVertical;
        }
    };
}
var /**
 * @return {number}
 */
GetLength = function(str) {
    var realLength = 0;
    for (var i = 0; i < str.length; i++) {
        var charCode = str.charCodeAt(i);
        if (charCode >= 0 && charCode <= 128){
            realLength += 1;
        }else{
            realLength += 2;
        }
    }
    return realLength;
};
var labelObject=function(controls,camera,isMobile){
    var scope=this;
    var control=controls;
    var viewport=document.getElementById("viewport");

    var lineMat=new THREE.LineBasicMaterial({color:0x000000,transparent:true,opacity: 0.6});
    var geo=new THREE.Geometry();
    geo.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.1, 0.1, 0.1));
    var planMesh=new THREE.PlaneGeometry(100,100,100);
    var planMat=new THREE.MeshBasicMaterial({color:0x123456,side:2,visible:false});

    createUI();
    function createUI(){
        /*=======简介样式=========*/
        //展开式
        var spreadContainer = new UI.Panel();
        spreadContainer.setId('spreadContainer');
        spreadContainer.dom.style.display = "none";
        viewport.appendChild(spreadContainer.dom);
        var spread_title = new UI.createDiv('spread_title', spreadContainer,'标签');
        var spread_content = new UI.createDiv('spread_content', spreadContainer,'这家伙很懒，什么都没留下！');
        var spread_jiantou = new UI.createDiv('spread_jiantou', spreadContainer);
        var jiantou_left = new UI.createDiv('jiantou_left', spread_jiantou);
        var jiantou_right = new UI.createDiv('jiantou_right', spread_jiantou);
        jiantou_left.onClick(function(e) {
            e.preventDefault();

            var length = labelText.length;
            currentLabelNum--;
            if (currentLabelNum < 0) currentLabelNum = length - 1;

            var num = currentLabelNum;
            var obj = labelText[num];
            scope.selectedState(obj);
            scope.updateLabelsAtt({
                obj: obj,
                title: obj.title,
                text: obj.text
            });

            scope.updateLabelCamera(obj);
        });
        jiantou_right.onClick(function(e){
            e.preventDefault();

            var length = labelText.length;
            currentLabelNum++;
            if (currentLabelNum > length - 1) currentLabelNum = 0;

            var num = currentLabelNum;
            var obj = labelText[num];
            scope.selectedState(obj);
            scope.updateLabelsAtt({
                obj: obj,
                title: obj.title,
                text: obj.text
            });

            scope.updateLabelCamera(obj);
        });

        //缩略式
        var unSpreadContainer = new UI.Panel();
        unSpreadContainer.setId('unSpreadContainer');
        unSpreadContainer.setClass('unSpreadContainer_right');
        unSpreadContainer.dom.style.display = "none";
        viewport.appendChild(unSpreadContainer.dom);
        var unSpreadContent = new UI.createDiv('unSpreadContent', unSpreadContainer);
        var triangle = new UI.createDiv('triangle', unSpreadContent);

        var unSpreadText = new UI.createDiv('unSpreadText', unSpreadContainer);
        var unSpreadText_title = new UI.createDiv('unSpreadText_title', unSpreadText,'标签');
        var unSpreadText_content = new UI.createDiv('unSpreadText_content', unSpreadText,'这家伙很懒，什么都没留下！');

        /*=======弹框=========*/
        var popUpBox = new UI.Panel().setId("popUpBox");
        viewport.appendChild(popUpBox.dom);
        //alert(viewport.offsetWidth+","+viewport.offsetHeight);
        var boxClose = new UI.createDiv('boxClose',popUpBox);
        boxClose.onClick(function(e){
            e.preventDefault();
            e.stopPropagation();
            if(popUpBox.dom.childNodes[1]) popUpBox.dom.removeChild(popUpBox.dom.childNodes[1]);
            popUpBox.dom.style.display = "none";
            var el = document.getElementById("viframe");
            if (el.src!="" && el.src!=window.location.href) {
                console.log(el.src);
                el.src = "";
                setTimeout(cycleClear, 100);
            }
            rAF=requestAnimationFrame(animate1);
        });

        /*=======audio=========*/
        var audio = document.createElement("audio");
        audio.id = "frequencyAudio";
        audio.hidden= "hidden";
        audio.loop="loop";
        viewport.appendChild(audio);
    }

    var unSpreadContainer = document.getElementById("unSpreadContainer");

    var touchScale = function(seletor, bg) {
        var startX, endX, scale, x1, x2, y1, y2, imgLeft, imgTop, imgWidth, imgHeight,
            one = false,
            $touch = $(seletor),
            originalWidth = $touch.width(),
            originalHeight = $touch.height(),
            baseScale = parseFloat(originalWidth/originalHeight),
            imgData = [],
            bgTop = parseInt($(bg).css('top'));
        function siteData(name) {
            imgLeft = parseInt(name.css('left'));
            imgTop = parseInt(name.css('top'));
            imgWidth = name.width();
            imgHeight = name.height();
        }
        $(bg).on('touchstart touchmove touchend', $(seletor).parent().selector, function(event){
            var $me = $(seletor),
                touch1 = event.originalEvent.targetTouches[0],  // 第一根手指touch事件
                touch2 = event.originalEvent.targetTouches[1],  // 第二根手指touch事件
                fingers = event.originalEvent.touches.length;   // 屏幕上手指数量
            //手指放到屏幕上的时候，还没有进行其他操作
            if (event.type == 'touchstart') {
                //control.enabled = false;
                if (fingers == 2) {
                    // 缩放图片的时候X坐标起始值
                    startX = Math.abs(touch1.pageX - touch2.pageX);

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

                event.stopPropagation();
                event.preventDefault();
                control.enabled = false;
                if (fingers == 2) {
                    // 缩放图片的时候X坐标滑动变化值
                    endX = Math.abs(touch1.pageX - touch2.pageX);
                    scale = (endX - startX)*2;
                    $me.css({
                        'width' : originalWidth + scale,
                        'height' : (originalWidth + scale)/baseScale,
                        'left' : imgLeft,
                        'top' : imgTop
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
                control.enabled = true;
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

    var mul=function(v1,v2){
        var fz=v1.x*v2.x+v1.y*v2.y+v1.z*v2.z;
        var fm=Math.sqrt(v1.x*v1.x+v1.y*v1.y+v1.z*v1.z)*Math.sqrt(v2.x*v2.x+v2.y*v2.y+v2.z*v2.z);
        if(fm==0){fm=1}
        return fz/fm;
    };
    var getPoint = function(normal,v,length){
        var v2 = new THREE.Vector3();
        var fx = length * normal.x;
        var fy = length * normal.y;
        var fz = length * normal.z;
        var fm = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z);
        var endx = fx / fm,endy = fy / fm, endz = fz / fm;
        v2.x = v.x + endx;
        v2.y = v.y + endy;
        v2.z = v.z + endz;
        return v2;
    };
    this.createLabel=function(mesh,point,hasLabel,normal){
        var labelObject3D;
        var plane=new THREE.Mesh(planMesh,planMat);
        var label;
        var line;
        var spriteContent0;
        var spriteContent1;
        var createSprite=function(){
            var map = new THREE.TextureLoader().load( "E2.0/image/label.png" );
            var material = new THREE.SpriteMaterial( { map: map, color: 0xffffff, fog: true,transparent:true,opacity:0} );
            return  new THREE.Sprite(material);
        };
        var createLine=function(){
            return new THREE.Line(geo,lineMat);
        };
        var createContent0 = function () {
            var hotSpot = new UI.Panel();
            hotSpot.setClass("hotSpotContainer");
            //hotSpot.dom.style.display = "block";
            hotSpot.onClick(function(e){
                e.preventDefault();
                e.stopPropagation();
                var target = e.target;
                var id = target.id.substring(0,target.id.length-1);
                var labels=alabel;
                var audio = document.getElementById('frequencyAudio');

                if(labels.hasOwnProperty(id)){
                    var children = labels[id].children[0];
                    scope.selectedState(children);

                    scope.updateLabelsAtt({
                        obj:children,
                        title:children.title
                    });

                    currentLabelNum = scope.getLabelNum(children.uuid);
                    scope.updateLabelCamera(children);
                    audio.pause();
                    audio.style.display = 'none';

                    var spreadContainer = document.getElementById("spreadContainer");
                    var unSpreadContainer = document.getElementById("unSpreadContainer");
                    if(children.isText==false){
                        cancelAnimationFrame(rAF);
                        spreadContainer.style.display = "none";
                        unSpreadContainer.style.display = "none";
                        if(children.link) scope.createIframe(children.uuid,children.link);
                        if(children.image) {

                            //$('#popUpBox .boxClose').click();

                            var popUpBox = document.getElementById('popUpBox');
                            popUpBox.setAttribute('name',children.uuid);
                            popUpBox.style.display = "block";
                            var imageView = new UI.Panel().setClass("imageView");
                            popUpBox.appendChild(imageView.dom);
                            var image = document.createElement('img');

                            if(children.image.image_pc && children.image.image_mobile){
                                if(isMobile) image.src = children.image.image_mobile.image;
                                else image.src = children.image.image_pc.image;
                            }
                            else if(children.image.image_pc) image.src = children.image.image_pc.image;
                            else image.src = children.image.image_mobile.image;
                            image.style.position = "absolute";
                            imageView.dom.appendChild(image);

                            scope.showImageSize(children);
                            touchScale(image,imageView.dom);
                            //setTimeout(function(){
                            //    cancelAnimationFrame(rAF)
                            //},1000)
                            //cancelAnimationFrame(rAF)
                        }
                        if(children.frequency) {
                            var frequency = children.frequency;
                            var type = frequency.type;
                            if(type=="audio"){
                                if(typeof (children.frequency.file)=="string") audio.src = frequency.file;
                                else audio.src = frequency.src;
                                audio.volume = frequency.volume;
                                audio.play();
                            }
                            else scope.createIframe(children.uuid,children.frequency.video);
                        }
                        if(children.show3D){
                            scope.createIframe(children.uuid,children.show3D);

                        }

                        return;
                    }

                    var content = children.text;
                    var length = children.text.length;
                    if(length<0) content = "这家伙很懒，什么都没留下！";

                    if(labelGlobal.profileStyle=="spread") {
                        spreadContainer.style.display = "block";
                        spreadContainer.childNodes[1].innerHTML = content;
                        return;
                    }
                    spreadContainer.style.display = "none";
                    if(unSpreadContainer.style.display=="none"){
                        unSpreadContainer.style.display = "block";
                        unSpreadContainer.setAttribute('follow',id);
                    }
                    viewport.addEventListener('mousedown',mouseDown,false);
                    unSpreadContainer.childNodes[1].childNodes[1].innerHTML = content;
                }

            });
            function mouseDown(e){
                //console.log(e.target);
                var target = e.target;
                var id = target.id.substring(0,target.id.length-1);

                var followId = unSpreadContainer.getAttribute('follow');
                if(target.className=="hotSpotContainer"){
                    var children = alabel[id].children[0];
                    if(children.isText==true && id !== followId){
                        unSpreadContainer.style.display = "block";
                        unSpreadContainer.setAttribute('follow',id);
                    }
                }
                else{
                    unSpreadContainer.style.display = "none";
                    unSpreadContainer.removeAttribute('follow');
                }
                viewport.removeEventListener('mousedown',mouseDown);
            }

            return hotSpot.dom;
        };
        var createContent1=function(){
            var label2d = new UI.Panel();
            label2d.setClass("label2dContainer");
            label2d.dom.style.display = "block";
            var label2dTitle = new UI.createDiv('label2dTitle', label2d,'标签');
            return label2d.dom;
        };
        var upFun=function(){
            viewport.appendChild(spriteContent0);
            viewport.appendChild(spriteContent1);

            control.enabled=true;
            labelObject3D.remove(plane);
            alabel[label.uuid]=labelObject3D;
            plane.material.dispose();
            plane.geometry.dispose();

            scope.selectedState(label);
        };
        if(hasLabel==undefined){
            labelObject3D=new THREE.Object3D();

            label=createSprite(hasLabel);
            line=createLine(hasLabel);
            labelObject3D.add(label,line,plane);

            var matrix=new THREE.Matrix4();
            var matrixWorld=matrix.copy(mesh.matrixWorld);
            matrixWorld.elements[12]=  matrixWorld.elements[13]=  matrixWorld.elements[14]=0;
            var realyMatrix=matrix.getInverse(matrixWorld);
            point.applyMatrix4(realyMatrix);
            labelObject3D.position.copy(point);
            mesh.add(labelObject3D);
        }
        else{
            labelObject3D=hasLabel.parent;
            label=hasLabel;

            hasLabel.parent.children[1].material=lineMat;
            line=hasLabel.parent.children[1];
        }

        label.cameraPosition=undefined;
        label.normal=normal;

        label.title = "标签";
        label.iconType = "dot";
        label.isText = false;

        spriteContent0 = createContent0();
        spriteContent0.id = label.uuid + "I";
        spriteContent1 = createContent1();
        spriteContent1.id = label.uuid + "V";

        plane.lookAt(normal);
        plane.rotation.y+=90*Math.PI/180;
        plane.position.copy(line.geometry.vertices[0]);
        control.enabled=false;
        allobj.push(labelObject3D.children[0]);
        upFun();
    };

    this.cancelSelected = function(){
        var labels=alabel;
        for(var i in labels){
            var children = labels[i].children[0];
            var hotSpot = document.getElementById(i+'I');
            var judge = scope.judgeIsText(children);
            if(judge[0]==true){
                var num = judge[1];
                hotSpot.style.background = "url('c/image/labelIcon/icon_label_text.png')";
                hotSpot.style.backgroundSize = "cover";
                hotSpot.style.backgroundPositionX = -hotSpot.offsetWidth * (num-1) + "px";
            }
            else{
                hotSpot.style.background = "url('c/image/labelIcon/icon_label_"+children.iconType+".png')";
                hotSpot.style.backgroundSize = "100% 100%";
            }

        }
    };
    this.selectedState = function(label){

        scope.cancelSelected();

        var hot = document.getElementById(label.uuid+'I');
        var judge = scope.judgeIsText(label);
        if(judge[0]==true){
            var num = judge[1];
            hot.style.background = "url('c/image/labelIcon/icon_label_textSel.png')";
            hot.style.backgroundSize = "cover";
            hot.style.backgroundPositionX = -hot.offsetWidth * (num-1) + "px";
        }
        else{
            hot.style.background = "url('c/image/labelIcon/icon_label_"+label.iconType+"Sel.png')";
            hot.style.backgroundSize = "100% 100%";
        }

    };
    this.judgeIsText = function(label){
        var iconType = label.iconType;
        var type = iconType.split('text');
        var isText = false,num=undefined;
        if(type[1]){
            num = Number(type[1]);
            isText = true;
        }
        return [isText,num];
    };
    this.getLabelNum = function(objUuid){
        var num=0;
        var length = labelText.length;
        for(var i= 0;i<length;i++){
            if(labelText[i].uuid==objUuid) num=i;
        }
        return num;
    };
    this.showImageSize = function(label){
        var labelImage = label.image;
        var imageWidth,imageHeight;
        if(labelImage.image_pc && labelImage.image_mobile){
            if(isMobile){
                imageWidth = labelImage.image_mobile.width;
                imageHeight = labelImage.image_mobile.height;
            }
            else{
                imageWidth = labelImage.image_pc.width;
                imageHeight = labelImage.image_pc.height;
            }
        }
        else if(labelImage.image_pc){
            imageWidth = labelImage.image_pc.width;
            imageHeight = labelImage.image_pc.height;
        }
        else{
            imageWidth = labelImage.image_mobile.width;
            imageHeight = labelImage.image_mobile.height;
        }
        var popUpBox = document.getElementById("popUpBox");
        var borderLeft = parseInt($(popUpBox).css("border-left-width"));
        var borderRight = parseInt($(popUpBox).css("border-right-width"));
        var borderTop = parseInt($(popUpBox).css("border-top-width"));
        var borderBottom = parseInt($(popUpBox).css("border-bottom-width"));

        var popUpBoxWidth = popUpBox.offsetWidth-borderLeft-borderRight;
        var popUpBoxHeight = popUpBox.offsetHeight-borderTop-borderBottom;

        var imageScale = imageWidth / imageHeight;
        var popUpBoxScale = popUpBoxWidth / popUpBoxHeight;

        var width,height;
        if(imageWidth < popUpBoxWidth && imageHeight < popUpBoxHeight){
            width = imageWidth;
            height = imageHeight;
        }
        else{
            if(imageScale >= popUpBoxScale){
                width = popUpBoxWidth;
                height = popUpBoxWidth / imageScale;
            }
            else{
                width = popUpBoxHeight * imageScale;
                height = popUpBoxHeight;
            }
        }
        var image = popUpBox.childNodes[1].childNodes[0];

        image.style.width = width + "px";
        image.style.height = height + "px";
        image.style.left = (popUpBoxWidth - width)/2 + "px";
        image.style.top = (popUpBoxHeight - height)/2 + "px";
    };
    this.showPopUpBoxSize = function(){
        var popUpBoxWidth = 1400,popUpBoxHeight = 800;
        if(isMobile) {
            popUpBoxWidth = 800;
            popUpBoxHeight = 1200;
        }
        var viewportWidth = viewport.offsetWidth,viewportHeight = viewport.offsetHeight;
        var viewportScale = viewportWidth / viewportHeight;
        var popUpBoxScale = popUpBoxWidth / popUpBoxHeight;

        var width,height;
        if(popUpBoxWidth<viewportWidth*0.8 && popUpBoxHeight<viewportHeight*0.8){
            width = popUpBoxWidth;
            height = popUpBoxHeight;
        }
        else{
            if(popUpBoxScale >= viewportScale){
                width = viewportWidth*0.8;
                height = viewportWidth*0.8 / popUpBoxScale;
            }
            else{
                width = viewportHeight*0.8 * popUpBoxScale;
                height = viewportHeight*0.8;
            }
        }

        var popUpBox = document.getElementById("popUpBox");
        popUpBox.style.width = width + "px";
        popUpBox.style.height = height + "px";
        popUpBox.style.left = (viewportWidth - width)/2 + "px";
        popUpBox.style.top = (viewportHeight - height)/2 + "px";
    };
    this.createIframe = function(uuid,src){
        var iframeSrc = src;
        if (iframeSrc.indexOf("http") < 0) iframeSrc = "http://" + iframeSrc;

        var iframeContainer = document.getElementById('popUpBox');
        iframeContainer.setAttribute('name',uuid);
        iframeContainer.style.display = "block";
        var iframe = document.createElement('iframe');
        iframe.width = "100%";
        iframe.height = "100%";
        iframe.frameBorder = 0;
        iframe.src = iframeSrc;
        iframeContainer.appendChild(iframe);

    };
    this.removeLabelPerameter = function(obj){
        var popUpBox = document.getElementById('popUpBox');
        popUpBox.style.display = "none";

        var audio = document.getElementById('frequencyAudio');
        audio.pause();
        audio.style.display = 'none';

        if(obj.link) delete obj.link;
        if(obj.text) {
            var spreadContainer = document.getElementById("spreadContainer");
            spreadContainer.style.display = "none";
            unSpreadContainer.style.display = "none";
            delete obj.text;
        }
        if(obj.image) delete  obj.image;
        if(obj.frequency) delete obj.frequency;
        if(obj.show3D) delete obj.show3D;
    };
    this.updateTriangle = function(){
        //var unSpreadContainer = document.getElementById("unSpreadContainer");
        var triangle = unSpreadContainer.childNodes[0].childNodes[0];
        var unSpreadText = unSpreadContainer.childNodes[1];
        triangle.style.top = unSpreadText.offsetHeight + 3 +"px";
    };
    this.updateLineLength = function(obj){
        var length = labelGlobal.lineLength;
        var vt = getPoint(obj.children[0].normal,obj.children[1].geometry.vertices[0],length/5+4);
        obj.children[1].geometry.vertices[1].copy(vt);
        obj.children[1].geometry.verticesNeedUpdate = true;
    };
    this.updateNowPosition=function(objParent){

        var v0=objParent.children[1].geometry.vertices[0];
        var v1=objParent.children[1].geometry.vertices[1];
        var mat4=new THREE.Matrix4().extractRotation(objParent.matrixWorld);
        var scale=new THREE.Vector3().setFromMatrixScale( objParent.matrixWorld  );
        var point0=(new THREE.Vector3().copy(v0).multiply(scale).applyMatrix4(  mat4)).add(objParent.getWorldPosition());//.applyMatrix4(  mat4));
        var point1=(new THREE.Vector3().copy(v1).multiply(scale).applyMatrix4(  mat4)).add(objParent.getWorldPosition());//.applyMatrix4(  mat4));

        var point2d0=new THREE.Vector3().copy(point0);
        point2d0.project(camera);
        var point2d1=new THREE.Vector3().copy(point1);
        point2d1.project(camera);

        scope.updateLineLength(objParent);
        var obj=objParent.children[0];
        scope.updateLabelPosition(obj,point0,point1,point2d0,point2d1);

        var popUpBox = document.getElementById('popUpBox');
        if(popUpBox.style.display=="block"){
            var id = popUpBox.getAttribute('name');
            if(obj.uuid==id && obj.image && !isMobile) scope.showImageSize(obj);
        }
        scope.showPopUpBoxSize();

        var judge = scope.judgeIsText(obj);
        if(judge[0]==true){
            var num = judge[1];
            var target = document.getElementById(obj.uuid+"I");
            target.style.backgroundSize = "cover";
            target.style.backgroundPositionX = -target.offsetWidth * (num-1) + "px";
        }
    };
    this.updateLabelPosition=function(obj,point0,point1,point2d0,point2d1){
        scope.updateTriangle();
        scope.updateScale(obj, point1);

        var children0= document.getElementById(obj.uuid+"I");
        var children1= document.getElementById(obj.uuid+"V");
        var lineGeo=obj.parent.children[1].geometry;
        var v0=new THREE.Vector3().copy(lineGeo.vertices[0]);
        var v1=new THREE.Vector3().copy(lineGeo.vertices[1]);
        var leftSl0=parseInt(children0.offsetWidth);
        var leftSl1=parseInt(children1.offsetWidth);
        var leftOffset0=-leftSl0/2;
        var leftOffset1=-leftSl1/2;
        var topOffset0=-parseInt(children0.offsetHeight/2);
        var topOffset1=0;
        v0.project(camera);
        v1.project(camera);
        //if (v0.x > v1.x && (children.type=="w"||children.type=="t")) leftOffset = -leftSl;
        //if (children.type=="w"){
        //        topOffset =-13;
        //}
        if (v0.y < v1.y) topOffset1 = -parseInt(children1.offsetHeight);
        if(labelGlobal.lineOpen==false || labelGlobal.lineLength==0){
            topOffset1 = -parseInt(children1.offsetHeight+children0.offsetHeight);
        }
        var ca=camera.position;
        var co;
        if(!!THREE.PointerLockControls){
            var cameraP=camera.position;
            var cameraRM=new THREE.Matrix4().extractRotation(camera.matrixWorld);
            var v=new THREE.Vector3(0,-cameraP.y,-cameraP.z);
            v.applyMatrix4(cameraRM);
            v.add(cameraP);
            co=v;

        }else if(control instanceof  THREE.OrbitControls){
            co=control.target;
        }
        var vcc=new THREE.Vector3(ca.x-co.x,ca.y-co.y,ca.z-co.z);
        var normal=new THREE.Vector3().copy(obj.normal);

        if(!VR && Label){

                if(mul(normal,vcc)>0){
                    obj.parent.visible=true;
                    children0.style.display="block";
                    children1.style.display = "block";
                    if(labelGlobal.textDisplay==false) children1.style.display = "none";
                }else{
                    obj.parent.visible=false;
                    children0.style.display="none";
                    children1.style.display = "none";
                }


        }else{
            obj.parent.visible=false;
            children0.style.display="none";
            children1.style.display = "none";
        }

        var left0 = ( point2d0.x + 1) / 2 * viewport.offsetWidth;
        var top0 = ( -point2d0.y + 1) / 2 * viewport.offsetHeight;
        //children.style.webkitTransform = "translate("+left+"px,"+top+"px)";
        children0.style.left = left0 + leftOffset0 + "px";
        children0.style.top = top0 + topOffset0 + "px";

        var left1 = ( point2d1.x + 1) / 2 * viewport.offsetWidth;
        var top1 = ( -point2d1.y + 1) / 2 * viewport.offsetHeight;

        if(labelGlobal.lineOpen==false){
            obj.parent.children[1].visible = false;
            children1.style.left = left0 + leftOffset1 + "px";
            children1.style.top = top0 + topOffset1 + "px";
        }
        else{
            obj.parent.children[1].visible = true;
            children1.style.left = left1 + leftOffset1 + "px";
            children1.style.top = top1 + topOffset1 + "px";
        }

        var followId = unSpreadContainer.getAttribute('follow');
        if(obj.uuid == followId){
            var diffLeft = left0 + leftOffset0;
            var offsetLeft=0;
            if(diffLeft > (viewport.offsetWidth/2)){
                unSpreadContainer.className = "unSpreadContainer_left";
                offsetLeft = -unSpreadContainer.childNodes[1].offsetWidth - 30;
            }
            else{
                unSpreadContainer.className = "unSpreadContainer_right";
                offsetLeft = 30;
            }

            var offsetTop = -(unSpreadContainer.childNodes[1].offsetHeight+unSpreadContainer.childNodes[0].childNodes[0].offsetHeight*2);
            unSpreadContainer.style.left = left0 + offsetLeft + "px";
            unSpreadContainer.style.top = top0 + offsetTop + "px";

            var chi = document.getElementById(followId+"I");
            if(chi.style.display=="none" && unSpreadContainer.style.display=="block"){
                unSpreadContainer.style.display = "none";
                unSpreadContainer.removeAttribute('follow');
            }

        }
    };
    this.updateScale=function(obj,point){

        var distance=point.distanceTo(camera.position);
        obj.scale.x = obj.scale.y = obj.scale.z = distance / 200;

    };
    this.updateLabelCamera=function(label){

        if(label.cameraPosition){
            var op = new THREE.Vector3();
            var tp = new THREE.Vector3();
            op.x = label.cameraPosition.PX;
            op.y = label.cameraPosition.PY;
            op.z = label.cameraPosition.PZ;
            tp.x = label.cameraPosition.TX;
            tp.y = label.cameraPosition.TY;
            tp.z = label.cameraPosition.TZ;

            var tempPos=new THREE.Vector3().copy(camera.position);
            var tempTar=new THREE.Vector3().copy(controls.target);

            var objOffset=new THREE.Vector3().copy(op).sub(camera.position);
            var tarOffset=new THREE.Vector3().copy(tp).sub(controls.target);


            new TWEEN.Tween( {x:0} ).to( {
                x: 1
            },1000).onUpdate(function(scale){
                var perObjOffset=new THREE.Vector3().copy(objOffset).multiplyScalar(scale);
                var perTarOffset=new THREE.Vector3().copy(tarOffset).multiplyScalar(scale);

                camera.position.copy(new THREE.Vector3().copy(tempPos).add(perObjOffset));
                controls.update();
                controls.target.copy(new THREE.Vector3().copy(tempTar).add(perTarOffset));
                controls.update();
                //console.log(editor.camera.position);
            }).start();
        }
    };
    this.stop=function(){
        cancelAnimationFrame(rAF);
    }
    this.updateLabelsAtt=function (parameters){
        var obj = parameters.obj;
        if (parameters.normal !== undefined) {
            obj.normal = parameters.normal;
        }
        if (parameters.title !== undefined) {
            obj.title = parameters.title;

            var childT = document.getElementById(obj.uuid + "V").children[0];
            childT.innerHTML = parameters.title;
            var spreadTitle = document.getElementById("spreadContainer").childNodes[0];
            spreadTitle.innerHTML = parameters.title;
            var unSpreadTitle = unSpreadContainer.childNodes[1].childNodes[0];
            unSpreadTitle.innerHTML = parameters.title;
        }
        if (parameters.iconType !== undefined){
            obj.iconType = parameters.iconType;
            scope.selectedState(obj);
        }
        if (parameters.isText !== undefined) obj.isText = parameters.isText;
        if (parameters.cameraPosition !== undefined) obj.cameraPosition = parameters.cameraPosition;
        if (parameters.link !== undefined) obj.link = parameters.link;
        if (parameters.image !== undefined) obj.image = parameters.image;
        if (parameters.text !== undefined) {
            obj.text = parameters.text;

            if(labelGlobal.profileStyle=="spread") {
                var spreadContainer = document.getElementById("spreadContainer");
                spreadContainer.style.display = "block";
                var length = parameters.text.length;
                if(length>0) spreadContainer.childNodes[1].innerHTML = parameters.text;
                else spreadContainer.childNodes[1].innerHTML = "这家伙很懒，什么都没留下！";
            }
        }
        if (parameters.frequency !== undefined) obj.frequency = parameters.frequency;
        if (parameters.show3D !== undefined) obj.show3D = parameters.show3D;
    };
};
