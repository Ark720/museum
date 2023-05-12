function center_loader(scene,dataBaseO){
    function cameraposition(){
        if(allobj.length==0)return;
        for(var i=0;i<allobj.length;i++){
            boxHelper[i] = new THREE.BoundingBoxHelper(allobj[i], 0xff3456);//创建BoundingBoxHelper
            boxHelper[i].update(allobj[i]);
            var Max_x = boxHelper[i].box.max.x ; //长
            var Max_y = boxHelper[i].box.max.z ;//宽
            var Max_z = boxHelper[i].box.max.y ;//高
            var Min_x = boxHelper[i].box.min.x ;
            var Min_y = boxHelper[i].box.min.z ;
            var Min_z = boxHelper[i].box.min.y ;
            var real_max_x=real_max_x||0;
            real_max_x=Math.max(real_max_x, Max_x);
            var real_max_y=real_max_y||0;
            real_max_y=Math.max(real_max_y, Max_y);
            var real_max_z=real_max_z||0;
            real_max_z=Math.max(real_max_z, Max_z);
            var real_min_x=real_min_x||0;
            real_min_x=Math.max(real_min_x, Min_x);
            var real_min_y=real_min_y||0;
            real_min_y=Math.max(real_min_y, Min_y);
            var real_min_z=real_min_z||0;
            real_min_z=Math.max(real_min_z, Min_z);
            var center=center||new THREE.Vector3();
            center.x=(center.x+boxHelper[i].position.x);
            center.y=(center.y+boxHelper[i].position.y);
            center.z=(center.z+boxHelper[i].position.z);
        }
        var object_size=Math.max(Math.max( real_max_x-real_min_x,  real_max_y-real_min_y),real_max_x);
        var object_center=new THREE.Vector3( center.x/allobj.length, center.y/allobj.length, center.z/allobj.length);
        camera.position.x=object_size;
        camera.position.y=object_size*3;
        camera.position.z=object_size*30;
        if(dataBaseO.controls.target==undefined&&dataBaseO.camera.position==undefined){
            controls.target.set( center.x/allobj.length, center.y/allobj.length*2/3, center.z/allobj.length);
            var twb1= new TWEEN.Tween(camera.position).to({
                x:object_size,
                y:object_size*3,
                z:object_size*6
            }, 1500).start();
        }
    }
    cameraposition();
    if(dataBaseO.controls.position!==undefined&&dataBaseO.controls.target!==undefined&&dataBaseO.camera.rotation!==undefined&&dataBaseO.camera.position!==undefined){
        var p=dataBaseO.controls.position;
        controls.position0.set(p.x,p.y,p.z);
        p=dataBaseO.controls.target;
        controls.target.set(p.x,p.y,p.z);
        p=dataBaseO.camera.rotation;
        camera.rotation.set(p.x,p.y,p.z);
        p=dataBaseO.camera.position;
        camera.position.set(p.x,p.y,p.z);
        /* var twb= new TWEEN.Tween(camera.position).to({
         x:dataBaseO.camera.position.x,
         y:dataBaseO.camera.position.y,
         z:dataBaseO.camera.position.z
         }, 1500).start();*/
    }
}
function centerObject(object) {
    var maxX, maxY, maxZ, minX, minY, minZ;
    object.traverse(function (child) {
        if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
            var center = child.geometry.center();
            var x = child.geometry.boundingBox.max.x - center.x;
            var y = child.geometry.boundingBox.max.y - center.y;
            var z = child.geometry.boundingBox.max.z - center.z;
            maxX = maxX == undefined ? x : Math.max(maxX, x);
            maxY = maxY == undefined ? y : Math.max(maxY, y);
            maxZ = maxZ == undefined ? z : Math.max(maxZ, z);
            x = child.geometry.boundingBox.min.x - center.x;
            y = child.geometry.boundingBox.min.y - center.y;
            z = child.geometry.boundingBox.min.z - center.z;
            minX = minX == undefined ? x : Math.min(minX, x);
            minY = minY == undefined ? y : Math.min(minY, y);
            minZ = minZ == undefined ? z : Math.min(minZ, z);
            child.position.x = -center.x;
            child.position.y = -center.y;
            child.position.z = -center.z;
        }
    });
}
function updateCenter(center,obj){
    var tempVector = new THREE.Vector3();
    tempVector.x=center.x;
    tempVector.y=center.y;
    tempVector.z=center.z;
    tempVector.applyMatrix4(  new THREE.Matrix4().extractRotation(obj.matrixWorld ) );
    obj.traverse(function(child) {
        if (child instanceof THREE.Line || child instanceof THREE.Mesh) {

            var array = child.geometry.vertices;
            for (var m = 0, len = array.length; m < len; m++) {
                array[m].x -= tempVector.x;
                array[m].y -= tempVector.y;
                array[m].z -= tempVector.z;
                child.geometry.vertices.needsUpdate = true;
            }
            child.geometry.computeBoundingSphere();
            child.geometry.computeBoundingBox();
        }
    });

}

