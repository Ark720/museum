var loadShaders=function(){
    this.load= function(type,obj,drawTime,texture,tname){
        switch (type){
            case "fur":
                var child=obj;
                var parent=child.parent;
                var colorLoad=function(texture){
                };
                var colorMap =new THREE.TextureLoader().load( "E2.0/image/shaders/11133-v4.jpg",colorLoad);
                colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping;
                var generateTexture=function () {
                    var canvas = document.createElement( 'canvas' );
                    canvas.width = 256;
                    canvas.height = 256;
                    var context = canvas.getContext( '2d' );
                    for ( var i = 0; i < 2000; ++i ) {
                        context.fillStyle = "rgba(255," + Math.floor( Math.random() * 255 ) + ","+ Math.floor( Math.random() * 255 ) +",1)";
                        context.fillRect( ( Math.random() * canvas.width ), ( Math.random() * canvas.height ), 15, 15 );
                    }
                    return canvas;

                };
                var texture = new THREE.Texture( generateTexture() );
                texture.needsUpdate = true;
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
                var geometry=child.geometry;
                var v=new THREE.Vector3();
                for (var i=0;i<drawTime;i++){
                    var mat=new THREE.FurMaterial({texture:texture, colorMap:colorMap, offset:i/50, globalTime:0.5, gravity:v});
                    var mesh=new THREE.Mesh(geometry.clone(),mat);
                    child.add(mesh);
                }
                child.material=mat;
                break;
            case "water":
                obj.material=editor.water.material;
                obj.add( editor.water );
                editor.water.material.uniforms.time.value += 1.0 / 60.0;
                editor.water.render();
                break;
            case "matcap":
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
                new THREE.TextureLoader().load( texture ,function(t){
                    mat.uniforms.tMatCap.value=t;
                    mat.uniforms.tMatCap.value.wrapS = mat.uniforms.tMatCap.value.wrapT = THREE.ClampToEdgeWrapping;
                });
                // mat.uniforms.repeat.value=new THREE.Vector2( 1, 1);
                mat.types="MatcapMaterial";
                mat.t_type=tname;
                obj.material=mat;
                obj.material.needsUpdate=true;
                editor.signals.selectChanged.dispatch(obj);
        }
    }
};