
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

    var lineMat=new THREE.LineBasicMaterial({color:0x00ffff,transparent:true,opacity: 0.6});
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

        /*=======audio=========*/
        var audio = document.createElement("audio");
        audio.id = "frequencyAudio";
        audio.hidden= "hidden";
        audio.loop=false;
        viewport.appendChild(audio);
    }

    var unSpreadContainer = document.getElementById("unSpreadContainer");

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
                        spreadContainer.style.display = "none";
                        unSpreadContainer.style.display = "none";
                        if(children.link) {
                            //scope.createIframe(children.uuid,children.link);
                            showIframe(children.link);
                        }
                        if(children.image) {

                            $('#popUpBoxContent').css('display','block');
                            $('#popBoxImgFrame').css('display','block');

                            var popBoxImg = document.getElementById("popBoxImg");

                            if(children.image.image_pc && children.image.image_mobile){
                                if(isMobile) popBoxImg.src = children.image.image_mobile.image;
                                else popBoxImg.src = children.image.image_pc.image;
                            }
                            else if(children.image.image_pc) popBoxImg.src = children.image.image_pc.image;
                            else popBoxImg.src = children.image.image_mobile.image;
                            popBox.imgstyle(popBoxImg.src);

                            $('.maskdiv').show();
                            cancelAnimationFrame(rAF);
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
                            else {
                                showIframe(children.frequency);
                            }
                        }
                        if(children.show3D) {
                            showIframe(children.show3D);
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

            function showIframe(para){
                var link = para;
                var linkValue= link.value;
                var linkType = link.linkType;
                if (linkValue.indexOf("http") >= 0) {
                    if(linkType==true) window.location.href=linkValue;
                    else document.getElementById('popBoxIframe').src = linkValue;
                }
                else {
                    if(linkType==true) window.location.href="http://"+linkValue;
                    else document.getElementById('popBoxIframe').src = "http://" + linkValue;
                }

                sMusic.pause();
                $('.maskdiv').show();
                $('#popUpBoxContent').css('display','block');
                $('#popBoxIframe').css('display','block');
                cancelAnimationFrame(rAF)
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

    this.removeLabelPerameter = function(obj){

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
        var leftOffset1=0;
        var topOffset0=-parseInt(children0.offsetHeight/2);
        var topOffset1=-13;
        v0.project(camera);
        v1.project(camera);
        if (v0.x > v1.x ) leftOffset1 = -leftSl1;
        //if (children.type=="w"){
        //        topOffset =-13;
        //}
        //if (v0.y < v1.y) topOffset1 = -parseInt(children1.offsetHeight);
        if(labelGlobal.lineOpen==false){
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

        }else if(control instanceof  THREE.OrbitControls || control instanceof THREE.VControls){
            co=control.target;
        }
        var vcc=new THREE.Vector3(ca.x-co.x,ca.y-co.y,ca.z-co.z);
        var normal=new THREE.Vector3().copy(obj.normal);

        if(!VR && Label){

            if(mul(normal,vcc)>=0){
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

        // rays

        //var direction = obj.parent.position.clone();
        //
        //var startPoint = camera.position.clone();
        ////
        //var directionVector = direction.sub( startPoint );
        //
        //var ray = new THREE.Raycaster(startPoint, directionVector.clone(). normalize());
        //
        //scene.updateMatrixWorld(); // required, since you haven't rendered ye
        //
        //var rayIntersects = ray.intersectObjects(allobj, true);
        //if (rayIntersects[0] && rayIntersects[0].distance < directionVector.length()) {
        //    console.log(rayIntersects[0]);
        //}


        var left0 = ( point2d0.x + 1) / 2 * viewport.offsetWidth;
        var top0 = ( -point2d0.y + 1) / 2 * viewport.offsetHeight;
        //children.style.webkitTransform = "translate("+left+"px,"+top+"px)";
        var left0_0=left0+leftOffset0;
        var top0_0=top0+topOffset0;
        children0.style.webkitTransform = "translate("+left0_0+"px,"+top0_0+"px)";
        //children0.style.left = left0 + leftOffset0 + "px";
        //children0.style.top = top0 + topOffset0 + "px";

        var left1 = ( point2d1.x + 1) / 2 * viewport.offsetWidth+leftOffset1;
        var top1 = ( -point2d1.y + 1) / 2 * viewport.offsetHeight+topOffset1;

        if(labelGlobal.lineOpen==false){
            obj.parent.children[1].visible = false;
            children1.style.left = left0 + leftOffset1 + "px";
            children1.style.top = top0 + topOffset1 + "px";
        }
        else{
            obj.parent.children[1].visible = true;
            children1.style.webkitTransform = "translate("+left1+"px,"+top1+"px)";
            //children1.style.left = left1  + "px";
            //children1.style.top = top1  + "px";
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

           //camera.position.x=  label.cameraPosition.PX;
           //camera.position.y=  label.cameraPosition.PY;
           //camera.position.z=  label.cameraPosition.PZ;
           //controls.target.x=  label.cameraPosition.TX;
           //controls.target.y=  label.cameraPosition.TY;
           //controls.target.z=  label.cameraPosition.TZ;
           //controls.update();
        }
    };
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
