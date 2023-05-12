/**
 * Created by DELL on 2016/1/18.
 */
var pathImport= function(editor){
    var scope=this;
    this.loadFile=function(url,url1){

        var _object=new THREE.Object3D();

        var onProgress = function (xhr) {
            if (xhr.lengthComputable) {
                var percentComplete = xhr.loaded / xhr.total * 100;
                console.log(Math.round(percentComplete, 1) + '% downloaded');
            }
        };

        var onError = function (xhr) {
        };

        var loader3_init=function(object) {
          //  _object=editor.dissectionObject(object);
            _object.name=name;
            _object.component="mainObject"
            editor.allObject3D.children.push(_object);
            editor.centerObject(_object);
            editor.addObject(_object,editor.scene);
            editor.select( _object );
            editor.signals.sceneGraphChanged.dispatch();

        }

        var load_type= url.split( '.' ).pop().toLowerCase();
        var name= url.split( '/' ).pop().toLowerCase();
        switch ( load_type ) {
            case "obj":
                //var loader = new THREE.OBJMTLLoader();
                var loader = new THREE.OBJLoader();
                loader.load(url,loader3_init, onProgress, onError)
                break;
            case "json":
                var loader =new THREE.AssimpJSONLoader();
                loader.load(url,loader3_init, onProgress, onError);
                break;
        }
        return _object;
    }

}