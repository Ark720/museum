function onWindowResize() {
    var node = document.getElementById("viewport");
    width = parseInt(node.style.width) || parseInt(node.clientWidth);
    height = parseInt(node.style.height) || parseInt(node.clientHeight);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    if(enablebg) cameraBG.updateProjectionMatrix();
    renderer.setSize(width, height);
    effect.setSize(width, height);

}
function test() {

    var docElm = document.getElementById("viewport");
    var width = parseInt(docElm.style.width);
    if (width == window.screen.width) {
        docElm.style.width = "";
        docElm.style.height = '';
        document.getElementById("nofull").style.display = 'none';
        document.getElementById("fullbut").style.display = 'block';
    } else {
        docElm.style.width = window.screen.width + 'px';
        docElm.style.height = window.screen.height + 'px';
        document.getElementById("nofull").style.display = 'block';
        document.getElementById("fullbut").style.display = 'none';
    }
    onWindowResize();
}
function resetP(a) {
    //a.preventDefault();



    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(allobj);
    if (intersects.length && intersects[0].object.name!='skybox') {
        var point= intersects[0].point;
        new TWEEN.Tween(controls.center).to({
            x:point.x,y:point.y,z:point.z
        }, 500).start();
        new TWEEN.Tween(controls.object.scale).to({
            x:0.3,y:0.3
        }, 500).start();
    }else{
        new TWEEN.Tween(camera.position).to({
            x: resetPosition.x,
            y: resetPosition.y,
            z: resetPosition.z
        }, 1000).start();
        new TWEEN.Tween(controls.center).to({
            x: resetControls.x,
            y: resetControls.y,
            z: resetControls.z
        }, 1000).start();
        new TWEEN.Tween(controls.object.scale).to({
            x:1,
            y:1
        }, 1000).start();
    }
}
function unique(arr) {
    var result = [], hash = {};
    for (var i = 0, elem; (elem = arr[i]) != null; i++) {
        if (!hash[elem]) {
            result.push(elem);
            hash[elem] = true;
        }
    }
    return result;
}
var imgLoader= new THREE.ImageLoader(this.manager);
function updateHighMaterial(mtl,material,uuid){
    try{
        var src=mtl.image.src;
        if(src.indexOf("128_")>0){
            var src = src.replace("128_","");
            //mtl.image.src=src;
            imgLoader.load(src,function(img){
                mtl.image=img;
                mtl.needsUpdate=true;
                allmtl[uuid] = material;
            })
        }
    }catch(e){}
}
function complete() {
    if (cplSky && files == 0) {
        dataBaseO.images=[];
        var loader = new THREE.ObjectLoader();
        loader.parse(scenedata,function(data){
            $("#loading").hide();
            initcontrols();
            scenedata=null;
            setScene(data);
            data=null;
            scene.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    if(draMesh[child.geometry.uuid]){
                        child.geometry.attributes=draMesh[child.geometry.uuid].attributes;
                        child.geometry.index=draMesh[child.geometry.uuid].index;
                        delete draMesh[child.geometry.uuid];
                    }
                }
            });
            loaded=100;
            window.parent.postMessage(loaded, "*");
            initLabelGlobal();
            initLabel();
            init3dLabel();
            initRuler();
            if(_waterMaterial)initWaterShader(dataBaseO.waterMaterial);
            if(_matcap)initMatcap();
            try{
                initAxisPointer();
            }catch(e){}
            if(!!animationData){
                if(!!animationData[0]){
                    initEvent();
                    editor.animationNew.JSONLoad(animationData,scene);
                }
            }
            for (var i in traceCamera) {
                if(traceCamera.hasOwnProperty(i)) traceCameraObject[i] = scene.getObjectByUuid(i);
            }
            var container = document.getElementById("viewport");
            container.addEventListener('mousedown', onDocumentMouseDown, false);
            $("#viewport").css("background","");

            onWindowResize();
            if(_mirror)initMirror();
            if(enablebg){
                animate1()
            }else{
                animate2();
            }
            //时间触发
            if(dataBaseO.logicEvent && dataBaseO.logicEvent.logicTime){
                var children = dataBaseO.logicEvent.logicTime.children;
                for(var k in children) {
                    if(children[k]) {
                        var next = children[k].next;
                        for (var i in next) {
                            if (next[i].switch == "close") return;
                            var animations = editor.animationNew.getAnimationsFromObj([eventObj[next[i].objId]]);

                            if (animations.length) {
                                var hierarchy = animations[0].data.hierarchy;
                                for (var j = 0, len = hierarchy.length; j < len; j++) {
                                    var keys = hierarchy[j].keys;
                                    if (editor.animationNew.currentFrame[next[i].objId] >= keys.length - 1) {
                                        editor.animationNew.currentFrame[next[i].objId] = editor.animationNew.startFrameNum[next[i].objId];
                                    }
                                }
                                editor.animationNew.playAnimation(eventObj[next[i].objId]);
                            }
                        }
                    }
                }
            }
            scene.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    allobj.push(child);
                    all3d.children.push(child);
                    if (child.material) {
                        if(child.material.lightMap){
                            updateHighMaterial(child.material.lightMap,child.material,child.uuid);
                            var geometry0=new THREE.Geometry().fromBufferGeometry( child.geometry);
                            geometry0.computeFaceNormals();
                            geometry0.mergeVertices();
                            geometry0.computeVertexNormals();
                            geometry0.faceVertexUvs[1]=geometry0.faceVertexUvs[0];
                            child.geometry=new THREE.BufferGeometry().fromGeometry(geometry0);
                        }
                        allmtl[child.uuid] = child.material;
                    }
                    if(  child.material.map ){
                        updateHighMaterial(child.material.map,child.material,child.uuid);
                    }
                    if(  child.material.specularMap ){
                        updateHighMaterial(child.material.specularMap,child.material,child.uuid);
                    }
                    if(  child.material.bumpMap ){
                        updateHighMaterial(child.material.bumpMap,child.material,child.uuid);
                    }
                    if(  child.material.emissiveMap ){
                        updateHighMaterial(child.material.emissiveMap,child.material,child.uuid);
                    }
                    if(  child.material.normalMap ){
                        updateHighMaterial(child.material.normalMap,child.material,child.uuid);
                    }
                    if(  child.material.alphaMap ){
                        updateHighMaterial(child.material.alphaMap,child.material,child.uuid);
                    }
                    if(  child.material.roughnessMap ){
                        updateHighMaterial(child.material.roughnessMap,child.material,child.uuid);
                    }
                    if(  child.material.metalnessMap ){
                        updateHighMaterial(child.material.metalnessMap,child.material,child.uuid);
                    }
                    if(  child.material.displacementMap ){
                        updateHighMaterial(child.material.displacementMap,child.material,child.uuid);
                    }
                    if(  child.material.aoMap ){
                        updateHighMaterial(child.material.aoMap,child.material,child.uuid);
                    }
                    if(  child.material.envMap ){
                        updateHighMaterial(child.material.envMap,child.material,child.uuid);
                    }

                    if (child.geometry.link !== undefined) {
                        HotSpots.push(child);
                    }
                    for (var i in dataBaseO.Raymesh) {
                        if (dataBaseO.Raymesh[i] == child.uuid){
                            Raymesh.push(child);
                            return
                        }
                    }
                }
            });
            rulerShow();

        });


        $("#viewport").addClass('blur');
        $("#viewport").css('filter','');


    }

}
function onDocumentMouseDown(a) {
    var pointer = a.changedTouches ? a.changedTouches[ 0 ] : a;
    if(window.devicePixelRatio){
        mouse.x = (a.clientX/el.width)*2*window.devicePixelRatio-1;
        mouse.y = -(a.clientY/el.height)*2*window.devicePixelRatio+1;
    }else {
        mouse.x = a.clientX / el.width * 2 - 1;
        mouse.y = 2 * -(a.clientY / el.height) + 1;
    }
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(allobj);
    if (intersects.length && intersects[0].object.link) {
        if (dataBaseO.controls.type=="2") controls.enabled = false;
        var link = intersects[0].object.geometry.link || intersects[0].object.link;
        var linkValue= link.value;
        var linkType = link.linkType;

        if (linkValue.indexOf("http") >= 0) {
            if(!!linkType){
                window.location.href=linkValue;
            }else{
                document.getElementById('popBoxIframe').src = linkValue;
            }
        } else {
            if(linkType==true){
                window.location.href="http://"+linkValue;
            }else{
                document.getElementById('popBoxIframe').src = "http://" + linkValue;
            }
        }
        if(!linkType){
            sMusic.pause();
            $('.maskdiv').show();
            //sIframeContent.show();
            //$(".iframe_close").show();

            $('#popUpBoxContent').css('display','block');
            $('#popBoxIframe').css('display','block');

            cancelAnimationFrame(rAF)
        }
        if (Intersected) {
            Intersected.material.emissive.setHex(Intersected.currentHex)
        }
    }
    if (intersects.length && intersects[0].object.image) {
        var obj = intersects[0].object;
        $('#popUpBoxContent').css('display','block');
        $('#popBoxImgFrame').css('display','block');
        popBox.imgstyle(obj.image.image);
        document.getElementById("popBoxImg").src = obj.image.image;
        $('.maskdiv').show();
        cancelAnimationFrame(rAF);
    }
    if ( pointer.button === 0) {
        if (intersects.length && !!animationData[0]) {
            var select = intersects[0].object;
            if (select.event) {
                var mouseEvent = select.event.mouseEvent;
                for (var i in mouseEvent) {
                    if (mouseEvent[i].selectType == "mouseDown") {
                        eventTrigger(mouseEvent[i]);
                    }

                }
            }else if (select.parent.event) {
                var mouseEvent = select.parent.event.mouseEvent;
                for (var i in mouseEvent) {
                    if (mouseEvent[i].selectType == "mouseDown") {
                        //debugger;
                        eventTrigger(mouseEvent[i]);
                    }

                }
            }

            var selected = {};
            selected[select.uuid]=select;

            //transformControls.attach(selected);
            //transformControls.setObject(select);
        }
    }
}
function mobile() {
    if (mobileDevice) {
        setTimeout(function(){
            onWindowResize();
        },500);
    }
}
var setScene = function (scene1) {
    while (scene1.children.length > 0) {
        if (scene1.children[0].children.length == 0) {
            scene1.children.remove(scene1.children[0]);
        } else {
            if (scene1.children[0] instanceof THREE.LightObject) {
                scene1.children[0].children[0].visible = false;
            }
            scene1.children[0].traverse(function(child){
                if (child.uuid == undefined || child.uuid == "") {
                    child.parent.remove(child);
                }
            });
            scene.add(scene1.children[0]);
        }
    }
    if (dataBaseO.controls.type == 1 || dataBaseO.controls.type == 4) {
        center_loader(scene, dataBaseO);
        if (!enablebg) {
            allobj.push(skybox);
        }
        // if (dataBaseO.controls.type == 1) {
        //setTimeout(function () {
        resetPosition.copy(camera.position);
        //resetControls.copy(controls.center);
        resetControls.copy(controls.target);
        resetUp.copy(camera.up);
        if (mobileDevice) {
            //touch.on("#viewport","doubletap",resetP)
            $("#viewport").on("doubletap", resetP);
        } else {
            $("#viewport").bind("dblclick", resetP);
        }
        //}, 1000)
        // }
    }

};
var init = function () {
    var container = document.getElementById("viewport");
    width = window.innerWidth;
    height = window.innerHeight;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 100000);
    camera.position.z = 1000;
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, premultipliedAlpha: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(width, height);
    renderer.setClearColor(0x555555);
    el=renderer.domElement;
    container.appendChild(renderer.domElement);
    //controls = new THREE.OrbitControls(camera, container);
    effect = new THREE.VREffect(renderer);
    effect.setSize(width, height);
    raycaster = new THREE.Raycaster();
    var canvas = renderer.domElement;
    try{
        transformControls=new THREE.MyTransformControls(camera,canvas);
    }catch(e){}
    popBox = new popUpBox();

};
var initcontrols = function () {
    var atr1 = JSON.parse(dataBaseO.controls.atr1);
    var atr2 = JSON.parse(dataBaseO.controls.atr2);
    var atr3 = JSON.parse(dataBaseO.controls.atr3);
    switch (dataBaseO.controls.type) {
        case '1':
            if ( !!dataBaseO.sidebar.GyroBarShow && mobileDevice && $("#Gyro>div").hasClass('Gyro') ) {
                controls = new THREE.VControls(camera,  document.getElementById("viewport"));
            }else{
                controls = new THREE.OrbitControls(camera,  document.getElementById("viewport"));
            }
            if (enablebg) {
                if(!!dataBaseO.sidebar.RotateBarShow){
                    controls.autoRotate = true;
                }else{
                    controls.autoRotate = false;
                }
                controls.autoRotateSpeed = 0.1;
            }
            controls.addEventListener("change",function (e) {
                scene.traverse(function(group){
                    if(group.name === "lineGroup"){
                        group.traverse(function (child) {
                            if(child.name === "lineFont"){
                                child.lookAt(camera.position);
                            }
                        })
                    }
                })
            })
            /*camera-gai*/

            try{
                controls.maxDistance = dataBaseO.controls.limit.pan.maxDistance;
                controls.minDistance = dataBaseO.controls.limit.pan.minDistance;
            }catch(e){
                controls.maxDistance = 5000;
                controls.minDistance = 0;
            }

            //controls.maxDistance = 5000;

            controls.enableDamping = true;
            controls.dampingFactor = 0.1;
            if (atr1[1]) {
                camera.fov = atr1[0];
                camera.updateProjectionMatrix();
            }
            //if (atr2[1]) {
            //    controls.maxPolarAngle = Math.PI - (atr2[0] * Math.PI / 200);
            //}
            if (atr3[1]) {
                controls.rotateSpeed = atr3[0] / 250;
            }

            try{
                if(dataBaseO.controls.limit.top.on)controls.maxPolarAngle  =dataBaseO.controls.limit.top.value /180*Math.PI;
                if(dataBaseO.controls.limit.bottom.on)controls.minPolarAngle  =dataBaseO.controls.limit.bottom.value /180*Math.PI;
                if(dataBaseO.controls.limit.left.on)controls.maxAzimuthAngle=dataBaseO.controls.limit.left.value == 0? Infinity:dataBaseO.controls.limit.left.value/180*Math.PI;
                if(dataBaseO.controls.limit.right.on)controls.minAzimuthAngle=dataBaseO.controls.limit.right.value==180?-Infinity:-dataBaseO.controls.limit.right.value/180*Math.PI;
            }catch(e){

            }
            break;
        case '2':
            //controls.dispose();
            camera.position.set(0, 0, 0);
            controls = new THREE.PointerLockControls(camera, document.getElementById("viewport"), mobileDevice);
            controls.enabled = true;
            controls.getObject().position.x = dataBaseO.controls.position.x;
            controls.getObject().position.y = dataBaseO.controls.position.y;
            controls.getObject().position.z = dataBaseO.controls.position.z;
            controls.getObject().rotation.x = dataBaseO.controls.rotation._x;
            controls.getObject().rotation.y = dataBaseO.controls.rotation._y;
            controls.getObject().rotation.z = dataBaseO.controls.rotation._z;
            scene.add(controls.getObject());
            if (!enablebg) {
                sceneGlobal.add(controls.getObject());
            }

            // controls.movementSpeed=4;
            if (atr1[1]) {
                camera.fov = atr1[0];
                camera.updateProjectionMatrix();
            }
            if (atr2[1]) {
                controls.speed = atr2[0] / 50;
            }
            if (atr3[1]) {
                controls.height = atr3[0] * 2.5;
            }

            break;
        case '3':
            //controls.dispose();
            controls = new THREE.FlyControls(camera, document.getElementById("viewport"));
            controls.movementSpeed = 1000;
            controls.rollSpeed = Math.PI / 24;
            controls.autoForward = false;
            controls.dragToLook = false;
            if (atr1[1]) {
                camera.fov = atr1[0];
            }
            if (atr2[1]) {
            }
            if (atr3[1]) {
                controls.rollSpeed = atr3[0] / 50 + 0.2;
            }

            break;
        case '4':
            controls = new THREE.TrackballControls(camera,  document.getElementById("viewport"));
            /*camera-gai*/
            try{
                controls.maxDistance = dataBaseO.controls.limit.pan.maxDistance;
                controls.minDistance = dataBaseO.controls.limit.pan.minDistance;
            }catch(e){
                controls.maxDistance = 5000;
                controls.minDistance = 0;
            }
            if (atr1[1]) {
                camera.fov = atr1[0];
                camera.updateProjectionMatrix();
            }
            if (atr3[1]) {
                controls.rotateSpeed = atr3[0] / 100;
            }

            controls.autoRotate = dataBaseO.controls.autoRotate;
            controls.autoRotateSpeed = dataBaseO.controls.autoRotateSpeed;
            controls.polarToggle = dataBaseO.controls.limit.polarToggle;
            controls.azimuthToggle = dataBaseO.controls.limit.azimuthToggle;
            break;
        default :
            break;
    }
};
var initBackground = function () {
    var fogcolor = parseInt(dataBaseO.background.fogColor.substr(0), 16);
    scene.fog = new THREE.FogExp2(fogcolor, dataBaseO.background.fogInten );
    var light = new THREE.AmbientLight();
    light.color.setHex("0x" + dataBaseO.AmbientLight.color);
    light.intensity = dataBaseO.AmbientLight.intensity;
    scene.add(light);
};

var initTraceCamera = function () {
    var d = dataBaseO.traceCamera;
    for (var i in  d) {
        traceCamera[i] = d[i];
    }
};
var initLabelGlobal = function(){
    try{
        labelGlobal.lineOpen = dataBaseO.labelGlobal.lineOpen;
        labelGlobal.lineLength = dataBaseO.labelGlobal.lineLength;
        labelGlobal.textDisplay = dataBaseO.labelGlobal.textDisplay;
        labelGlobal.profileStyle = dataBaseO.labelGlobal.profileStyle;
    }catch(e){};
};
var initLabel = function () {
    var object = scene;
    labelObject1 = new labelObject(controls, camera, mobileDevice);

    object.traverse(function (child) {
        try {
            if (dataBaseO.labels.hasOwnProperty(child.uuid)) {
                child.renderOrder = 1;
                var i = child.uuid;
                //child.visible=false;
                var title = dataBaseO.labels[i].title;
                var iconType = dataBaseO.labels[i].iconType;
                var isText = dataBaseO.labels[i].isText;
                if(isText==true) labelText.push(child);

                var cameraPosition = dataBaseO.labels[i].cameraPosition;
                var normalO = dataBaseO.labels[i].normal;
                var normal = new THREE.Vector3(normalO.x, normalO.y, normalO.z);

                labelObject1.createLabel(undefined, child.parent.getWorldPosition(), child, normal);

                var parameters = {
                    obj: child,
                    title: title,
                    iconType: iconType,
                    isText: isText,
                    cameraPosition: cameraPosition,
                    normal: normal
                };

                if (!!dataBaseO.labels[i].link) parameters.link = dataBaseO.labels[i].link;
                if (!!dataBaseO.labels[i].image) parameters.image = dataBaseO.labels[i].image;
                if (!!dataBaseO.labels[i].text) {
                    parameters.text = dataBaseO.labels[i].text;
                    currentLabelNum = labelText.length-1;
                }
                if (!!dataBaseO.labels[i].frequency) parameters.frequency = dataBaseO.labels[i].frequency;
                if (!!dataBaseO.labels[i].show3D) parameters.show3D = dataBaseO.labels[i].show3D;

                var obj = child.parent.children;
                obj.remove(obj[2]);

                labelObject1.updateLabelsAtt(parameters);
                labelObject1.updateNowPosition(child.parent);
                //console.log(child)
                child.visible = false;
            }
        } catch (e) {};
    }, true);
};
this.init3dLabel = function(){
    var object = scene;
    label3DObject = new labelObject3D(controls, camera, mobileDevice);

    object.traverse(function (child) {
        try{
            if (dataBaseO.labels3d.hasOwnProperty(child.uuid)) {
                child.renderOrder = 1;
                var i = child.uuid;
                var title = dataBaseO.labels3d[i].title;
                var iconType = dataBaseO.labels3d[i].iconType;
                var cameraPosition = dataBaseO.labels3d[i].cameraPosition;
                var normalO = dataBaseO.labels3d[i].normal;
                var normal = new THREE.Vector3(normalO.x, normalO.y, normalO.z);

                label3DObject.createLabel(undefined, child.parent.getWorldPosition(), child, normal);
                var parameters = {
                    obj: child,
                    title: title,
                    iconType: iconType,
                    cameraPosition: cameraPosition,
                    normal: normal
                };
                if(!!dataBaseO.labels3d[i].link) parameters.link = dataBaseO.labels3d[i].link;
                if(!!dataBaseO.labels3d[i].image) parameters.image = dataBaseO.labels3d[i].image;
                label3DObject.updateLabelsAtt(parameters);

            }
        }catch(e){}
    }, true)
};

var initEvent=function(){
    var eventData=dataBaseO.events;
    editor.isMouseTrigger={};
    var lib = {};
    for(var i in eventData){
        eventObj[i] = {};
        lib[i]={};
        lib[i].animationEvent = eventData[i].animationEvent;
        lib[i].mouseEvent = eventData[i].mouseEvent;
        lib[i].moveEvent = eventData[i].moveEvent;
        lib[i].rotateEvent = eventData[i].rotateEvent;

        scene.traverse(function(child){
            if(child.uuid == i){
                for(var m in lib[i]){
                    for(var n in lib[i][m]){

                        lib[i][m][n].objUuid = i;
                        lib[i][m][n].type = m;
                        lib[i][m][n].name = n;

                        if(m=="mouseEvent") editor.isMouseTrigger[i] = false;

                    }
                }
                child.event = lib[i];
                eventObj[i] = child;
            }
        })
    }

};
var initAxisPointer = function(){
    var axisPointer = dataBaseO.axisPointer;
    for(var i in axisPointer){
        var object = scene.getObjectByUuid(i);
        var tempVector = new THREE.Vector3();
        tempVector.x=axisPointer[i].x;
        tempVector.y=axisPointer[i].y;
        tempVector.z=axisPointer[i].z;
        tempVector.applyMatrix4(  new THREE.Matrix4().extractRotation(object.matrixWorld ) );
        //object.position.add( tempVector );
        object.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                var array = child.geometry.attributes.position.array;
                for(var m= 0,len=array.length;m<len;m+=3){
                    array[m]-=tempVector.x;
                    array[m+1]-=tempVector.y;
                    array[m+2]-=tempVector.z;
                    child.geometry.attributes.position.needsUpdate = true;
                }
                child.geometry.computeBoundingSphere();
                child.geometry.computeBoundingBox();
            }
        });


    }
};
//标尺
var initRuler=function () {
    for(var i in dataBaseO.lineGroup){
        if(i === "remove") break;
        var color = new THREE.Color().setHex("0x"+dataBaseO.lineGroup[i].color);
        var v1 = new THREE.Vector3(dataBaseO.lineGroup[i].v1.x,dataBaseO.lineGroup[i].v1.y,dataBaseO.lineGroup[i].v1.z);
        var v2 = new THREE.Vector3(dataBaseO.lineGroup[i].v2.x,dataBaseO.lineGroup[i].v2.y,dataBaseO.lineGroup[i].v2.z);
        var v3 = new THREE.Vector3(dataBaseO.lineGroup[i].v3.x,dataBaseO.lineGroup[i].v3.y,dataBaseO.lineGroup[i].v3.z);
        var v4 = new THREE.Vector3(dataBaseO.lineGroup[i].v4.x,dataBaseO.lineGroup[i].v4.y,dataBaseO.lineGroup[i].v4.z);
        var v5 = new THREE.Vector3(dataBaseO.lineGroup[i].v5.x,dataBaseO.lineGroup[i].v5.y,dataBaseO.lineGroup[i].v5.z);
        var v6 = new THREE.Vector3(dataBaseO.lineGroup[i].v6.x,dataBaseO.lineGroup[i].v6.y,dataBaseO.lineGroup[i].v6.z);
        var position = new THREE.Vector3(dataBaseO.lineGroup[i].position.x,dataBaseO.lineGroup[i].position.y,dataBaseO.lineGroup[i].position.z);
        var scale = new THREE.Vector3(dataBaseO.lineGroup[i].scale.x,dataBaseO.lineGroup[i].scale.y,dataBaseO.lineGroup[i].scale.z);
        var rotation = new THREE.Euler(dataBaseO.lineGroup[i].rotation._x,dataBaseO.lineGroup[i].rotation._y,dataBaseO.lineGroup[i].rotation._z);
        var content = dataBaseO.lineGroup[i].content;
        var name = dataBaseO.lineGroup[i].name;
        var px = dataBaseO.lineGroup[i].px;

        var group = createLine(v1,v2,v3,v4,v5,v6,color,name);
        group.position.copy(position);
        group.scale.copy(scale);
        group.rotation.copy(rotation);
        group.visible = false;
        scene.add(group);

        if(content){
            var sprite = createSprite(group,content,px);
            group.add(sprite);
        }
    }
};
var rulerShow=function () {
    var object = scene;
    object.traverse(function (child) {
        if(child.name === "lineGroup"){
            child.visible = true;
            child.traverse(function (c_child) {
                if(c_child.name === "lineFont" || c_child.name === "triangle"){
                    c_child.visible = false;
                }else if(c_child instanceof THREE.Line){
                    c_child.visible = true;
                }
            })
            lineAnimate(child.children[0],child.children[0].geometry.vertices[0],child.children[0].geometry.vertices[1]);
            lineAnimate(child.children[1],child.children[1].geometry.vertices[0],child.children[1].geometry.vertices[1]);
            lineAnimate(child.children[2],child.children[2].geometry.vertices[0],child.children[2].geometry.vertices[1]);
            function lineAnimate(mesh,vertices1,vertices2){
                var point1 = new THREE.Vector3().copy(vertices1);
                var point2 = new THREE.Vector3().copy(vertices2);
                var center = new THREE.Vector3((point1.x+point2.x)/2,(point1.y+point2.y)/2,(point1.z+point2.z)/2);
                mesh.geometry.vertices[0].copy(center);
                mesh.geometry.vertices[1].copy(center);
                mesh.geometry.verticesNeedUpdate = true;
                new TWEEN.Tween(mesh.geometry.vertices[0]).to({
                    x:point1.x,
                    y:point1.y,
                    z:point1.z,
                },500).onUpdate(function(){
                    mesh.geometry.verticesNeedUpdate = true
                }).onComplete(function(){
                    child.traverse(function (c_child) {
                        if(c_child.name === "lineFont" || c_child.name === "triangle"){
                            c_child.visible = true;
                        }
                    })
                }).start();
                new TWEEN.Tween(mesh.geometry.vertices[1]).to({
                    x:point2.x,
                    y:point2.y,
                    z:point2.z,
                },500).onUpdate(function(){
                    mesh.geometry.verticesNeedUpdate = true
                }).onComplete(function(){
                    child.traverse(function (c_child) {
                        if(c_child.name === "lineFont" || c_child.name === "triangle"){
                            c_child.visible = true;
                        }
                    })
                }).start();
            }
        }
    })
};
var rulerHide=function () {
    var object = scene;
    object.traverse(function (child) {
        if(child.name === "lineGroup"){
            child.traverse(function (c_child) {
                if(c_child.name === "lineFont" || c_child.name === "triangle"){
                    c_child.visible = false;
                }
            })
            lineAnimate(child.children[0],child.children[0].geometry.vertices[0],child.children[0].geometry.vertices[1]);
            lineAnimate(child.children[1],child.children[1].geometry.vertices[0],child.children[1].geometry.vertices[1]);
            lineAnimate(child.children[2],child.children[2].geometry.vertices[0],child.children[2].geometry.vertices[1]);
            function lineAnimate(mesh,vertices1,vertices2){
                var point1 = new THREE.Vector3().copy(vertices1);
                var point2 = new THREE.Vector3().copy(vertices2);
                var center = new THREE.Vector3((point1.x+point2.x)/2,(point1.y+point2.y)/2,(point1.z+point2.z)/2);
                mesh.geometry.verticesNeedUpdate = true;
                new TWEEN.Tween(mesh.geometry.vertices[0]).to({
                    x:center.x,
                    y:center.y,
                    z:center.z,
                },500).onUpdate(function(){
                    mesh.geometry.verticesNeedUpdate = true
                }).onComplete(function(){
                    mesh.visible = false;
                    mesh.geometry.vertices[0].copy(point1);
                }).start();
                new TWEEN.Tween(mesh.geometry.vertices[1]).to({
                    x:center.x,
                    y:center.y,
                    z:center.z,
                },500).onUpdate(function(){
                    mesh.geometry.verticesNeedUpdate = true
                }).onComplete(function(){
                    mesh.visible = false;
                    mesh.geometry.vertices[1].copy(point2);
                }).start();
            }
        }
    })
};
var initMatcap=function(){
    try {
        var object = scene;
        object.traverse(function (child) {

            if (dataBaseO.matcap.hasOwnProperty(child.uuid)) {
                var mat = new THREE.ShaderMaterial({
                    uniforms: {
                        tMatCap: {type: 't',value: null},
                        tNormal: {type: 't',value: null},
                        noise: {type: 'f', value:0. },
                        repeat: {type: 'v2', value: new THREE.Vector2( 1, 1) },
                        useNormal: {type: 'f', value: 0. },
                        normalScale: {type: 'f', value: 1 },
                        normalRepeat: {type: 'f', value: 1 },
                        opacity: {type: 'f', value: 1.0 }
                    },
                    vertexShader:THREE.MatcapShader.vertexShader,
                    fragmentShader:THREE.MatcapShader.fragmentShader,
                    shading: THREE.SmoothShading,
                    side: THREE.DoubleSide
                });
                new THREE.TextureLoader().load(dataBaseO.matcap[child.uuid].tMatCap ,function(t){
                    mat.uniforms.tMatCap.value=t;
                    mat.uniforms.tMatCap.value.wrapS = mat.uniforms.tMatCap.value.wrapT = THREE.ClampToEdgeWrapping;
                });
                if(dataBaseO.matcap[child.uuid].tNormal){

                    new THREE.TextureLoader().load( dataBaseO.matcap[child.uuid].tNormal ,function(t){
                        mat.uniforms.tNormal.value=t;
                        mat.uniforms.tNormal.value.wrapS = mat.uniforms.tNormal.value.wrapT = THREE.RepeatWrapping;
                        mat.uniforms.useNormal.value=dataBaseO.matcap[child.uuid].useNormal;
                        mat.uniforms.normalScale.value=dataBaseO.matcap[child.uuid].normalScale;
                        mat.uniforms.repeat.value.x=dataBaseO.matcap[child.uuid].repeat.x;
                        mat.uniforms.repeat.value.y=dataBaseO.matcap[child.uuid].repeat.y;
                    });
                }
                mat.uniforms.noise.value=dataBaseO.matcap[child.uuid].noise;
                mat.uniforms.opacity.value=dataBaseO.matcap[child.uuid].opacity;
                if(mat.uniforms.opacity.value<1) mat.transparent=true;
                child.material=mat;
                child.material.needsUpdate=true;
            }
        }, true);
    } catch (e) {

    }
};
//var boxHelper = [];
var camera;
var Label= true;
var alabel = {};
var labels3d = {};
var label3DObject;
var allobj = [];
var all3d = new THREE.Object3D();
var DistanceMax = dataBaseO.controls.DistanceMax;
var HotSpots = [], VR = false;
var rotate = false;
var talkLabel = [];
var talkLabelshow = true;
var talkLabelnum = [];
var parts = [];
var hotlabel = {}, skybox = {};
var materials = {}, skyboxArr;
var envValue = [], fogColor = [];
var fogValue = [], skyboxId = [];
var skyboxName = [];
var boxId = [], hotListId = {};
var url = [], arrNum;
var rotatinCamer = new THREE.Vector3();
var camerVNuB = [], camera2, cameraBG;
var scene, Label = true, sceneGlobal, sceneBG;
var allmtl = {};
var effect;
var Raymesh = [];
var raycaster;
var floorRay = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(0, -1, 0));
var time = Date.now();
var resetPosition = new THREE.Vector3();
var resetControls = new THREE.Vector3();
var resetUp = new THREE.Vector3();
var renderer, controls;
var width, height;
var composer;
var renderPassBG, renderPassGlobal, renderPass,ShaderPass,
    darknight, whitecurtain, restoring, pixel, luminous;
//var Mtl = true;
var target = new THREE.Vector3();
var traceCamera = {};
var traceCameraObject = {};
var cplSky = false;
var time = Date.now();
var Raymesh = [];
var mouse = new THREE.Vector2(10000, 10000), Intersected;
var rAF;
var sceneVR,cameraVR;
var Tcursor=new THREE.TextureLoader().load("E2.0/image/but/favicon.png");
var waters={};
var labelGlobal={
    lineOpen:true,
    lineLength:30,
    textDisplay:true,
    profileStyle:"spread"
};
var labelText = [];
var currentLabelNum = 0;
var popBox;
var horizen=false;
var draMesh={};

var animate1 = function () {
    if(_waterMaterial){
        //editor.water.material.uniforms.time.value += 1.0 / 60.0;
        //editor.water.render();
        for(var i in waters){
            waters[i].material.uniforms.time.value += 1.0 / 60.0;
            waters[i].render();
        }
    }
    TWEEN.update();
    renderBg();
    rAF=requestAnimationFrame(animate1);
};
var animate2 = function () {
    if(_waterMaterial){
        //editor.water.material.uniforms.time.value += 1.0 / 60.0;
        //editor.water.render();
        for(var i in waters){
            waters[i].material.uniforms.time.value += 1.0 / 60.0;
            waters[i].render();
        }
    }
    TWEEN.update();
    renderGl();
    rAF=requestAnimationFrame(animate2);
};
var renderBg = function () {
    if (!!THREE.PointerLockControls) {
        detectCollision();
        var delta = (Date.now() - time) * 2;
        controls.update(delta);
    } else {
        controls.update(0.1);
    }
    time = Date.now();
    for (var i in alabel) {
        labelObject1.updateNowPosition(alabel[i]);
    }
    try {
        for (var i in dataBaseO.Mirror) {
            scene.getObjectByUuid(i).mirror.update();
        }
    } catch (e) {
    }

    for (var i in traceCameraObject) {
        try{
            traceCameraObject[i].position.copy(traceCamera[i]);
            traceCameraObject[i].position.unproject(camera);
        }catch(e){}
    }
    if (VR) {
        effect.render(sceneBG, cameraBG);
        renderer.autoClear = false;
        effect.render(scene, camera);
        renderer.autoClear = false;
        effect.render(sceneVR, cameraVR);
        renderer.autoClear = true;
    } else {
        renderer.render(sceneBG, cameraBG);
        renderer.autoClear = false;
        renderer.render(scene, camera);
        if (_composer) composer.render(scene, camera);
    }

};
var renderGl = function () {
    if (!!THREE.PointerLockControls) {
        detectCollision();
        var delta = (Date.now() - time) * 2;
        controls.update(delta);
    } else {
        controls.update(0.1);
    }
    time = Date.now();
    for (var i in alabel) {
        labelObject1.updateNowPosition(alabel[i]);
    }
    try {
        for (var i in dataBaseO.Mirror) {
            scene.getObjectByUuid(i).mirror.update();
        }
        if (!!dataBaseO.hotSpotLabels) {
            sceneGlobal.traverse(function (child) {
                if (!!dataBaseO.hotSpotLabels[child.uuid]) {
                    updateHotSpotPosition(child, camera);
                }
            }, true)

        }
    } catch (e) {
    }

    for (var i in traceCameraObject) {
        try{
            traceCameraObject[i].position.copy(traceCamera[i]);
            traceCameraObject[i].position.unproject(camera);
        }catch(e){}
    }
    if (VR) {
        effect.render(sceneGlobal, camera);
        renderer.autoClear = false;
        effect.render(scene, camera);
        renderer.autoClear = false;
        effect.render(sceneVR, cameraVR);
        renderer.autoClear = true;
    } else {
        renderer.render(sceneGlobal, camera);//cameraGlobal
        renderer.autoClear = false;
        renderer.render(scene, camera);
        if (_composer) composer.render(scene, camera);
    }
};

init();
if(enablebg){
    sceneBG = new THREE.Scene();
    cameraBG = new THREE.OrthographicCamera(-window.screen.width, window.screen.width, window.screen.height, -window.screen.height, -10000, 10000);
    var lightBGColor = parseInt(dataBaseO.background.lightBGC.substr(0), 16);
    var lightBG = new THREE.AmbientLight(lightBGColor, dataBaseO.background.lightBGI);
    sceneBG.add(lightBG);
    var CreatSkybox=function(array){
        for(var i=0;i<array.length;i++){
            skybox.material.materials[i].map.image.src =array[i];
            skybox.material.materials[i].map.needsUpdate =true;
            skybox.material.materials[i].opacity = 1;
        }
    };

    var loader = new THREE.ObjectLoader();
    loader.parse(sceneBGFile, function (d) {
        sceneBGFile=null;
        var planbox = d;
        planbox.material.depthTest = false;
        planbox.scale.set(2 *  window.screen.width, 2 * window.screen.height, 1);
        if(mobileDevice && !!planbox.userData.m_bg){
            planbox.material.map.image.src = planbox.userData.m_bg;
            planbox.material.map.needsUpdate =true;
        }
        sceneBG.add(planbox);
        mobile();
        cplSky = true;
        complete()
    });
}else{
    sceneGlobal = new THREE.Scene();
    var lightGlobalColor = parseInt(dataBaseO.background.lightGlobalC.substr(0), 16);
    var lightGlobal = new THREE.AmbientLight(lightGlobalColor, dataBaseO.background.lightGlobalI);
    sceneGlobal.add(lightGlobal);
    var initskybox = function () {
        var curArrNum;
        for (var i in dataBaseO.skyboxList) {
            curArrNum = dataBaseO.skyboxList[i].CurArrNum;
            envValue[i] = dataBaseO.skyboxList[i].envValue;
            fogColor[i] = dataBaseO.skyboxList[i].fogColor;
            fogValue[i] = dataBaseO.skyboxList[i].fogValue;
            hotListId[i] = dataBaseO.skyboxList[i].hotListId;
            skyboxId[i] = dataBaseO.skyboxList[i].skyboxId;
            skyboxName[i] = dataBaseO.skyboxList[i].skyboxName;
        }
        arrNum = curArrNum;
        if (arrNum) {
            CreatSkybox(skyboxArr[curArrNum]);
            SetSkyBox(curArrNum, skyboxId[curArrNum], envValue[curArrNum], fogColor[curArrNum], fogValue[curArrNum]);
        }
    };
    var inithotspotLabel = function () {
        sceneGlobal.traverse(function (child) {
            for (var j in dataBaseO.hotSpotLabels) {
                if (child.uuid == j) {
                    hotlabel[child.uuid] = child;
                    camerVNuB[j + "T"] = dataBaseO.hotSpotLabels[j].camerVNuB;
                    var IsLink = dataBaseO.hotSpotLabels[j].IsLink;
                    var display = dataBaseO.hotSpotLabels[j].display;
                    var startPoint = new THREE.Vector3(dataBaseO.hotSpotLabels[j].startPoint.x, dataBaseO.hotSpotLabels[j].startPoint.y, dataBaseO.hotSpotLabels[j].startPoint.z);
                    boxId = dataBaseO.hotSpotLabels[j].boxId;
                    url[j] = dataBaseO.hotSpotLabels[j].url;
                    var text = dataBaseO.hotSpotLabels[j].text;
                    var textId = dataBaseO.hotSpotLabels[j].textId;
                    var backgroundImageNum = dataBaseO.hotSpotLabels[j].backgroundImageNum;
                    createHotSpot(document.getElementById("viewport"), undefined, startPoint, camera, child, IsLink, display, text, textId, backgroundImageNum);
                }
            }
        }, true)
    };

    var loader = new THREE.ObjectLoader();
    var obj = loader.parse(sceneGlobalFile, function (object) {
        sceneGlobalFile=null;
        cplSky = true;
        skybox = object;
        skybox.material.side = 1;
        initskybox();
        inithotspotLabel();
        complete();
    });
    obj.getWorldPosition();
    sceneGlobal.add(obj);
}
if(_composer){
    renderPassBG = new THREE.RenderPass(sceneBG, cameraBG);
    renderPassGlobal = new THREE.RenderPass(sceneGlobal, camera);
    renderPass = new THREE.RenderPass(scene, camera);
    renderPass.clear = false;
    ShaderPass = new THREE.ShaderPass(THREE.CopyShader);
    darknight = new THREE.ShaderPass(THREE.VignetteShader);
    whitecurtain = new THREE.ShaderPass(THREE.VignetteShader);
    restoring = new THREE.ShaderPass(THREE.SepiaShader);
    pixel = new THREE.DotScreenPass(new THREE.Vector2(0, 0), 0.5, 0.8);
    //luminous = new THREE.BloomPass();
    luminous = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 5, 0.4, 0.85);//1.0, 9, 0.5, 512);
    initComposer();
}
if (dataBaseO.talklabels == undefined) dataBaseO.talklabels = {};
if (dataBaseO.shadow) renderer.shadowMap.enabled = true;
if (!!dataBaseO.music && dataBaseO.music.open) {
    sMusic.src = dataBaseO.music.src+"?t="+1000*Math.random();
}
initBackground();
initTraceCamera();
skyboxArr = dataBaseO.skyboxArr;
files = dataBaseO.files;

scenedata = sceneFile;
//      var objfiles = new Set(); //android wechat not support
var objfiles = [];
var b2Fils = {};
var len = sceneFile.geometries.length;
for (var i = len - 1; i >= 0; i--) {
    if (scenedata.geometries[i].path) {
        objfiles.push(scenedata.geometries[i].path);
        if (!b2Fils[scenedata.geometries[i].path]) {
            b2Fils[scenedata.geometries[i].path] = [];
        }
        b2Fils[scenedata.geometries[i].path].push(i);
    }
}
objfiles = unique(objfiles);
var TotalFile=objfiles.length,allloaded = {},loaded=0;
var dracoloader = new THREE.DRACOLoader();
function sum(arr) {
    var s = 0;
   for(var i in arr){
       s+=arr[i];
   }
    return s;dataBaseO.controls.type
}
function getLoaded(){
    return loaded;
}
objfiles.forEach(function (child) {

    dracoloader.load(child,function(mesh) {
        scenedata.geometries[b2Fils[child][0]].data.attributes = null;
        var uuid = mesh.url.replace(/.*\/([^\/]*)\.dom$/, "$1");
        draMesh[uuid] = mesh;
        //debugger
        files--;
        complete();

    },function (evt) {

        if (evt.lengthComputable) {
            var percentComplete = Math.round(evt.loaded * 100 / (evt.total*TotalFile));
            allloaded[evt.currentTarget.responseURL]=percentComplete;
            loaded=sum(allloaded);
            getLoaded();
            // console.log(getLoaded());

            var percentComplete = evt.loaded * 100 / (evt.total*TotalFile);
            allloaded[evt.currentTarget.responseURL]=percentComplete;
            loaded=Math.floor(sum(allloaded));
            $("#process").css("width",loaded+"%");
            window.parent.postMessage(loaded, "*");
            // console.log(loaded);
            //console.log("load:"+evt.loaded+",total:"+evt.total);
            //console.log("completed" + allloaded + '%' + evt.total);        //在控制台打印上传进度
        }
    });
    //if(child.indexOf(".dom")>0||child.indexOf(".png")>0) {
    //    var obj = new OBJImg({
    //        image: child,
    //        useWorker: true,
    //        onComplete: function (event) {
    //            var container = new THREE.Group();
    //            load(event.detail,container);
    //            centerObject(container);
    //            var temp1 = container.toJSON();
    //            var len = b2Fils[event.url].length;
    //            for (var i = 0; i < len; i++) {
    //                var idx = b2Fils[event.url][i];
    //                scenedata.geometries[idx].data.attributes = temp1.geometries[scenedata.geometries[idx].index].data.attributes;
    //            }
    //            files--;
    //            complete();
    //        },
    //        onError: function (event) {
    //            console.error(event);
    //        }
    //    });
    //}
});
var vrBut = document.getElementById('vrbut');
vrBut.addEventListener("click", function () {
    VR = true;
    $(".butList").css("display","none");
    $(".UIButtonContent").css("display","none");
    $(".zPic").css("display","none");
    $(".zou").css("display","none");
    $(".logo").css("display","none");
    $("#exitVR").css("display", "block");
    sceneVR  = new THREE.Scene();
    cameraVR = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100000);
    cameraVR.position.z = 10;
    if(enablebg){
        cameraBG = new THREE.PerspectiveCamera(45, width / height, 1, 100000);
        cameraBG.position.z = 800;
        var max = window.screen.height > window.screen.width ? window.screen.height : window.screen.width;
        sceneBG.children[1].scale.x = sceneBG.children[1].scale.y = max + 500;
        if(mobileDevice) cameraBG.position.z = 500;
        cameraBG.updateProjectionMatrix();
    }
    if (dataBaseO.controls.type=="1") {
        target = controls.target;
        controls.dispose();
        controls = new THREE.VControls(camera, document.getElementById('viewport'));
        resetP();
    }
    if (dataBaseO.controls.type=="2") {
        controls.vr();
    }
}, false);
$("#exitVR").click(function () {
    $("#butList").css("display","block");
    $(".zPic").css("display","block");
    $(".zou").css("display","block");
    $(".logo").css("display","block");
    $(".UIButtonContent").css("display","block");

    VR = false;
    renderer.autoClear = false;
    if(enablebg){
        sceneBG.children[1].scale.set(2 *  window.screen.width, 2 * window.screen.height, 1);
        cameraBG = new THREE.OrthographicCamera(-window.screen.width, window.screen.width, window.screen.height, -window.screen.height, -10000, 10000);
        cameraBG.position.z = 50;
    }
    controls.dispose();
    //controls = new THREE.OrbitControls(camera, document.getElementById("viewport"));
    //controls.target.set(target.x, target.y, target.z);
    initcontrols();
    $(this).toggle();
    resetP();
});
var MtlBut = document.getElementById('mtlbut');
function swtichMusic(){
    if ($("#mtlbut>div").hasClass('ismtl')) {
        $(".ismtl").addClass('nomtl').removeClass('ismtl');
        sMusic.pause();
    } else {
        $(".nomtl").addClass('ismtl').removeClass('nomtl');
        sMusic.play();
    }
}
function swtichOffMusic(){
    $(".ismtl").addClass('nomtl').removeClass('ismtl');
    sMusic.pause();
}
function swtichOnMusic() {
    $(".nomtl").addClass('ismtl').removeClass('nomtl');
    sMusic.play();
}
var LabelBut= document.getElementById("labelbut");
LabelBut.addEventListener("click", function () {
    if ($("#labelbut>div").hasClass('islabel')) {
        $(".islabel").addClass('nolabel').removeClass('islabel');
        Label=false;
    } else {
        $(".nolabel").addClass('islabel').removeClass('nolabel');
        Label=true;
    }
});
$("#personal").click(function () {
    $("#perspnalbut").trigger("click");
});
$("#Gyro").click(function () {
    if ($("#Gyro>div").hasClass('Gyro')) {
        $(".Gyro").addClass('noGyro').removeClass('Gyro');
    } else {
        $(".noGyro").addClass('Gyro').removeClass('noGyro');
        $(".norotate").addClass('rotate').removeClass('norotate');
    }
    if (dataBaseO.controls.type=="1") {
        controls.dispose();
        initcontrols();
        resetP();
    }
})
$("#size").click(function () {
    if ($("#size>div").hasClass('size')) {
        $(".size").addClass('nosize').removeClass('size');
        rulerShow();
    } else {
        $(".nosize").addClass('size').removeClass('nosize');
        rulerHide();
    }
})
//var initmtl = function () {
//    var baseMtl = new THREE.MeshStandardMaterial({
//        roughness: 0.6,
//        metalness: 0.2,
//        color: 0xffffff
//    });
//    scene.traverse(function (child) {
//        if (child.material) {
//            if (allmtl.hasOwnProperty(child.uuid)) {
//                if (Mtl) {
//                    child.material = baseMtl;
//                    child.material.normalMap = allmtl[child.uuid].normalMap == undefined ? null : allmtl[child.uuid].normalMap;
//                    child.material.bumpMap = allmtl[child.uuid].bumpMap == undefined ? null : allmtl[child.uuid].bumpMap;
//                    child.material.needsUpdate = true;
//                } else {
//                    child.material = allmtl[child.uuid];
//                    child.material.needsUpdate = true;
//                }
//            }
//        }
//    });
//    if ($("#mtlbut>div").hasClass('ismtl')) {
//        $(".ismtl").addClass('nomtl').removeClass('ismtl');
//        Mtl = false;
//    } else {
//        $(".nomtl").addClass('ismtl').removeClass('nomtl');
//        Mtl = true;
//    }
//};
$("#rotate").click(function () {
    if($("#Gyro>div").hasClass('Gyro')&& mobileDevice && !!dataBaseO.sidebar.GyroBarShow){
        layer.msg("请先关闭陀螺仪");
    }else{
        if ($("#rotate>div").hasClass('rotate')) {
            $(".rotate").addClass('norotate').removeClass('rotate');
            controls.autoRotate=false;
        } else {
            $(".norotate").addClass('rotate').removeClass('norotate');
            controls.autoRotate=true;

        }
    }

})
MtlBut.addEventListener('click', swtichMusic, false);

mobile();
window.addEventListener('orientationchange', mobile, false);



