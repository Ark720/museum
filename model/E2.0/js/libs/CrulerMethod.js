
function createSprite(group,str) {
    //文字
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var textWidth = context.measureText(str).width*20/12;
    var width = textWidth;
    canvas.height = 32;
    var i = 0;
    while (width>=2){
        i++;
        width /= 2;
    }
    width = Math.pow(2,i+1);
    canvas.width = width;
    context.font = "normal 20px Arial";
    context.fillStyle = "#fff";
    context.fillText(str, 0, 20);
    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var color = group.children[0].material.color
    var material = new THREE.MeshBasicMaterial( {map: texture,color:color} );
    material.transparent = true;
    //
    var sprite = new THREE.Mesh(
        new THREE.PlaneGeometry(canvas.width, canvas.height),
        material
    );

    sprite.name = "lineFont";
    sprite.content = str;
    sprite.textWidth = textWidth;
    sprite.scale.set(.1,.1,.1);

    if(group.children[0].name === "x"){
        sprite.scale.x /= group.scale.x;
        group.scale.y=1;
        group.scale.z=1;

        sprite.position.y += 32/2*sprite.scale.y;
        sprite.position.x += (width/2-textWidth/2)*sprite.scale.x;
    }else if(group.children[0].name === "y"){
        sprite.scale.y/= group.scale.y;
        group.scale.x=1;
        group.scale.z=1;

        sprite.position.x += (width/2*sprite.scale.x);
    }else if(group.children[0].name === "z"){
        sprite.scale.x/= group.scale.z;
        group.scale.y=1;
        group.scale.x=1
        sprite.rotation.y = -Math.PI/2;
        sprite.position.y += 32/2*sprite.scale.y;
        sprite.position.z += (width/2-textWidth/2)*sprite.scale.x;
    }
    return sprite;
}

function createLine(v1,v2,v3,v4,v5,v6,color,name) {
    //线条
    var geometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial({color: color});
    geometry.vertices.push(v1);
    geometry.vertices.push(v2);
    var line1 = new THREE.Line(geometry, material, THREE.LineSegments);
    line1.name = name;

    var geometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial({color: color});
    geometry.vertices.push(v3);
    geometry.vertices.push(v4);
    var line2 = new THREE.Line(geometry, material, THREE.LineSegments);

    var geometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial({color: color});
    geometry.vertices.push(v5);
    geometry.vertices.push(v6);
    var line3 = new THREE.Line(geometry, material, THREE.LineSegments);

    var group = new THREE.Group();
    group.v1 = v1.clone();
    group.v2 = v2.clone();
    group.v3 = v3.clone();
    group.v4 = v4.clone();
    group.v5 = v5.clone();
    group.v6 = v6.clone();
    group.add(line1);
    group.add(line2);
    group.add(line3);
    group.name = "lineGroup";

    //更换中心点
    var center = new THREE.Vector3().set((v1.x+v2.x)/2,(v1.y+v2.y)/2,(v1.z+v2.z)/2);
    centerObject(group,true);
    updateCenter(center,group);
    group.position.copy(center);

    //箭头
    var length = v1.clone().sub(v2).length();
    var rectShape = new THREE.Shape();
    rectShape.moveTo( 0.5,0 );
    rectShape.lineTo( -0.5, 0 );
    rectShape.lineTo( 0, 1 );
    var rectGeom = new THREE.ShapeGeometry( rectShape );
    var triangle = new THREE.Mesh( rectGeom, new THREE.MeshBasicMaterial( { color: color,side:THREE.DoubleSide } ) ) ;
    if(name === "y") {
        triangle.position.y += length / 2 - 1;
    }else if(name === "x"){
        triangle.rotation.z = -Math.PI/2;
        triangle.rotation.x = -Math.PI/2;
        triangle.position.x += length / 2 - 1;
    }else if(name === "z"){
        triangle.rotation.x = Math.PI/2;
        triangle.position.z += length / 2 - 1;
    }
    triangle.name = "triangle";
    group.add(triangle)

    var length = v1.clone().sub(v2).length();
    var rectShape = new THREE.Shape();
    rectShape.moveTo( 0.5,0 );
    rectShape.lineTo( -0.5, 0 );
    rectShape.lineTo( 0, -1 );
    var rectGeom = new THREE.ShapeGeometry( rectShape );
    var triangle = new THREE.Mesh( rectGeom, new THREE.MeshBasicMaterial( { color: color,side:THREE.DoubleSide } ) ) ;
    if(name === "y") {
        triangle.position.y -= length / 2 - 1;
    }else if(name === "x"){
        triangle.rotation.z = -Math.PI/2;
        triangle.rotation.x = -Math.PI/2;
        triangle.position.x -= length / 2 - 1;
    }else if(name === "z"){
        triangle.rotation.x = Math.PI/2;
        triangle.position.z -= length / 2 - 1;
    }
    triangle.name = "triangle";
    group.add(triangle);

    return group;
}