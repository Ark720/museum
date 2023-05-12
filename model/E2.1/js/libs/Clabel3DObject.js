/**
 * Created by Administrator on 2017/8/14.
 */
var labelObject3D = function(controls,camera,isMobile){
    var scope = this;
    var control = controls;
    var viewport = document.getElementById("viewport");

    var map1 = new THREE.TextureLoader().load("E2.0/image/gif/icontype1.png");
    var map2 = new THREE.TextureLoader().load("E2.0/image/gif/icontype2.png");
    var map3 = new THREE.TextureLoader().load("E2.0/image/gif/icontype3.png");
    var map4 = new THREE.TextureLoader().load("E2.0/image/gif/icontype4.png");

    var updateCV = function () {
        control = controls;
        viewport = document.getElementById("viewport");
    };
    var bubbleSort = function(array){
        /*给每个未确定的位置做循环*/
        for(var unfix=array.length-1; unfix>0; unfix--){
            /*给进度做个记录，比到未确定位置*/
            for(var i=0; i<unfix;i++){
                if(array[i]>array[i+1]){
                    var temp = array[i];
                    array.splice(i,1,array[i+1]);
                    array.splice(i+1,1,temp);
                }
            }
        }
    };
    var changeLabelTitle = function(){
        var numArr=[],num = 1;
        var labels=editor.labels3d;
        for(var i in labels){
            var children = labels[i].children[0];
            var title = children.title;
            var nu = title.slice(title.length-1);
            if(Number(nu)) numArr.push(Number(nu));
        }

        bubbleSort(numArr);
        if(numArr.length>0) num = numArr[numArr.length-1]+1;
        return num;
    };
    this.createLabel = function (mesh, point, hasLabel, normal,iconType) {
        updateCV();
        var labelObject3D;
        var plane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 100), new THREE.MeshBasicMaterial({
            color: 0x123456,
            side: 2,
            visible: false
        }));
        var label;
        var line;

        var createSprite1 = function () {
            var plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 1), new THREE.MeshBasicMaterial({
                map:map1,side:2, transparent: true}));
            return plane;
        };
        var createLine = function () {
            var geo = new THREE.Geometry();
            geo.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.00000001, 0.00000001, 0.00000001));
            var mat = new THREE.LineBasicMaterial({color: 0x00FFFF});
            var line = new THREE.Line(geo, mat);
            return line;
        };

        var upFun = function (e) {
            viewport.removeEventListener("mouseup", upFun, false);
            //scope.updateNowPosition(labelObject3D);
            control.enabled = true;
            labelObject3D.remove(plane);
            labels3d[label.uuid] = labelObject3D;

            plane.material.dispose();
            plane.geometry.dispose();

        };
        if (hasLabel == undefined) {
            labelObject3D=new THREE.Object3D();

            label=createSprite1(hasLabel);
            line=createLine(hasLabel);
            labelObject3D.add(label,line,plane);


            var titleNum = changeLabelTitle();
            label.title = "标签"+titleNum;

            //labelObject3D.position.copy(point);
            var offsetP=mesh.getWorldPosition();
            var offsetR=mesh.getWorldRotation();
            point.sub(offsetP);

            var matrix=new THREE.Matrix4();
            var matrixWorld=matrix.copy(mesh.matrixWorld);
            matrixWorld.elements[12]=  matrixWorld.elements[13]=  matrixWorld.elements[14]=0;

            var realyMatrix=matrix.getInverse(matrixWorld);

            //  var m=new THREE.Matrix4().getInverse(new THREE.Matrix4().extractRotation(mesh.matrixWorld));
            point.applyMatrix4(realyMatrix);
            labelObject3D.position.copy(point);

            var distance = point.distanceTo(camera.position);
            label.scale.set(10,10,1);
            labelObject3D.position.z+=distance/100;
            labelObject3D.children[0].position.copy(mesh.position);

            scene.add(labelObject3D);


        }
        else {
            labelObject3D = hasLabel.parent;
            label = hasLabel;
            switch (iconType){
                case '2':
                    hasLabel.material.map=map2;
                    break;
                case '3':
                    hasLabel.material.map=map3;
                    break;
                case '4':
                    hasLabel.material.map=map4;
                    break;
                default :
                    hasLabel.material.map=map1;
            }
            hasLabel.iconType=iconType;
            //hasLabel.material.map=map1;
            /* var annie = new TextureAnimator( hasLabel.material.map, 1, 25, 25, 55 ); // texture, #horiz, #vert, #total, duration.
             gifAnimate[0]=annie;*/
            line = hasLabel.parent.children[1];
        }

        label.cameraPosition = undefined;
        label.normal = normal;
        label.iconType = "1";



        plane.lookAt(normal);
        plane.rotation.y += 90 * Math.PI / 180;
        plane.position.copy(line.geometry.vertices[0]);
        control.enabled = false
        viewport.addEventListener("mouseup", upFun, false);
        if (hasLabel !== undefined)upFun();

    };

    this.updateLabelsAtt = function (parameters) {
        var obj = parameters.obj;
        if (parameters.normal !== undefined) {
            obj.normal = parameters.normal;
        }
        if (parameters.iconType !== undefined){
            obj.iconType = parameters.iconType;
            switch (parameters.iconType){
                case '2':
                    obj.material.map=map2;
                    break;
                case '3':
                    obj.material.map=map3;
                    break;
                case '4':
                    obj.material.map=map4;
                    break;
                default :
                    obj.material.map=map1;
            }
        }
        if (parameters.title !== undefined) {
            obj.title = parameters.title;

        }
        if (parameters.image !== undefined) obj.image = parameters.image;
        if (parameters.link !== undefined) obj.link = parameters.link;
        //if (parameters.linkType !== undefined) obj.linkType = parameters.linkType;
        if (parameters.cameraPosition !== undefined) obj.cameraPosition = parameters.cameraPosition;
    };
};