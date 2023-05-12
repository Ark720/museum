THREE.MirrorMapShader = function ( camera,renderer,obj,scene) {
    this.groundMirror = new THREE.Mirror(renderer, camera, {
      clipBias: 0.01,
      textureWidth: $('#viewport').width(),
      textureHeight: $('#viewport').height()
    });
    var shader=THREE.ShaderLib['mirror'];
    var shaderuniform=THREE.UniformsUtils.clone( shader.uniforms );
    this.customMaterial = new THREE.ShaderMaterial( {
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shaderuniform } );
    this.customMaterial.uniforms.mirrorSampler.value = this.groundMirror.texture;
    this.customMaterial.uniforms.textureMatrix.value = this.groundMirror.textureMatrix;
    this.customMaterial.needsUpdate=true;
    this.angletype="floorSwitch";
    obj.material=this.customMaterial;
    obj.add(this.groundMirror);
    this.floor = new THREE.Mesh( new THREE.PlaneGeometry(1, 1), this.customMaterial);
    this.floor.name =obj.uuid+"MirrorFloor";
    this.floor.rotateX(-Math.PI/2);
    this.floor.add(this.groundMirror);
    this.floor.position.copy(obj.position);
    scene.add(this.floor);
    this.floor.visible=false;
    this.update=function(){
        this.groundMirror.render();
        this.floor.position.copy(obj.position);
    };
    this.dispose=function(){
       scene.remove(this.floor);
       obj.material=new THREE.MeshStandardMaterial({
           roughness: 0.6,
           metalness: 0.2
       });
       obj.remove(this.groundMirror);
    }
};
var initMirror = function () {
    scene.traverse(function (child) {
        try {
            if (dataBaseO.Mirror.hasOwnProperty(child.uuid)) {
                child.mirror = new THREE.MirrorMapShader(camera, renderer, child, scene);
                child.mirror.customMaterial.uniforms.mirrorColor.value = new THREE.Color().setHex(dataBaseO.Mirror[child.uuid].mirrorColor);
                var diffusetexture = dataBaseO.Mirror[child.uuid].diffuseSampler;
                var dMap = diffusetexture == null ? null : new THREE.TextureLoader().load(diffusetexture);
                if (dMap != null) {
                    dMap.wrapS = dMap.wrapT = THREE.RepeatWrapping;
                }
                child.mirror.customMaterial.uniforms.diffuseSampler.value = dMap;
                child.mirror.customMaterial.uniforms.repeatS.value = dataBaseO.Mirror[child.uuid].repeatS;
                child.mirror.customMaterial.uniforms.repeatT.value = dataBaseO.Mirror[child.uuid].repeatT;
                child.mirror.customMaterial.uniforms.alpha.value = dataBaseO.Mirror[child.uuid].alpha;
                //hild.mirror.angletype=dataBaseO.Mirror[child.uuid].angletype;
                //child.mirror.customMaterial.uniforms.rotationX.value=dataBaseO.Mirror[child.uuid].rotationX;
                //child.mirror.customMaterial.uniforms.rotationY.value=dataBaseO.Mirror[child.uuid].rotationY;
                var mirror=scene.getChildByName(child.uuid+"MirrorFloor");
                mirror.rotation.x=dataBaseO.Mirror[child.uuid].rotationX;
                mirror.rotation.y=dataBaseO.Mirror[child.uuid].rotationY;
                renderer.domElement.style.background="#ffffff"
            }
        } catch (e) {
        }
    }, true)
};