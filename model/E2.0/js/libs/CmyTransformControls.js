/**
 * Created by Administrator on 2016/9/27.
 */

( function () {
    var MyGizmoMaterial = function (parameters) {

        THREE.MeshBasicMaterial.call(this);

        this.depthTest = false;
        this.depthWrite = false;
        this.side = THREE.DoubleSide;
        this.transparent = true;

        this.setValues(parameters);

        this.oldColor = this.color.clone();
        this.oldOpacity = this.opacity;

        this.highlight = function (highlighted) {

            if (highlighted) {

                this.color.setRGB(1, 1, 0);
                this.opacity = 1;

            } else {

                this.color.copy(this.oldColor);
                this.opacity = this.oldOpacity;

            }

        };

    };

    MyGizmoMaterial.prototype = Object.create(THREE.MeshBasicMaterial.prototype);
    MyGizmoMaterial.prototype.constructor = MyGizmoMaterial;

    var MyGizmoLineMaterial = function (parameters) {

        THREE.LineBasicMaterial.call(this);

        this.depthTest = false;
        this.depthWrite = false;
        this.transparent = true;
        this.linewidth = 1;

        this.setValues(parameters);

        this.oldColor = this.color.clone();
        this.oldOpacity = this.opacity;

        this.highlight = function (highlighted) {

            if (highlighted) {

                this.color.setRGB(1, 1, 0);
                this.opacity = 1;

            } else {

                this.color.copy(this.oldColor);
                this.opacity = this.oldOpacity;

            }

        };

    };

    MyGizmoLineMaterial.prototype = Object.create(THREE.LineBasicMaterial.prototype);
    MyGizmoLineMaterial.prototype.constructor = MyGizmoLineMaterial;

    var MyPickerMaterial = new MyGizmoMaterial({visible: false, transparent: false});

    THREE.MyTransformGizmo = function () {
        var scope = this;
        this.init = function () {

            THREE.Object3D.call(this);

            this.handles = new THREE.Object3D();
            this.pickers = new THREE.Object3D();
            this.planes = new THREE.Object3D();

            this.add(this.handles);
            this.add(this.pickers);
            this.add(this.planes);
            //// PLANES

            var planeGeometry = new THREE.PlaneBufferGeometry(10, 10, 2, 2);
            var planeMaterial = new THREE.MeshBasicMaterial({visible: false, side: THREE.DoubleSide});


            var planes = {
                "XY": new THREE.Mesh(planeGeometry, planeMaterial),
                "YZ": new THREE.Mesh(planeGeometry, planeMaterial),
                "XZ": new THREE.Mesh(planeGeometry, planeMaterial),
                "XYZE": new THREE.Mesh(planeGeometry, planeMaterial)
            };

            this.activePlane = planes["XYZE"];

            planes["YZ"].rotation.set(0, Math.PI / 2, 0);
            planes["XZ"].rotation.set(-Math.PI / 2, 0, 0);

            for (var i in planes) {

                planes[i].name = i;
                this.planes.add(planes[i]);
                this.planes[i] = planes[i];

            }

            //// HANDLES AND PICKERS
            var setupGizmos = function (gizmoMap, parent) {

                for (var name in gizmoMap) {

                    for (i = gizmoMap[name].length; i--;) {

                        var object = gizmoMap[name][i][0];
                        var position = gizmoMap[name][i][1];
                        var rotation = gizmoMap[name][i][2];

                        object.name = name;

                        if (position) object.position.set(position[0], position[1], position[2]);
                        if (rotation) object.rotation.set(rotation[0], rotation[1], rotation[2]);

                        parent.add(object);

                    }

                }

            };

            setupGizmos(this.handleGizmos, this.handles);
            setupGizmos(this.pickerGizmos, this.pickers);

            // reset Transformations

            this.traverse(function (child) {

                if (child instanceof THREE.Mesh) {

                    child.updateMatrix();

                    var tempGeometry = child.geometry.clone();
                    tempGeometry.applyMatrix(child.matrix);
                    child.geometry = tempGeometry;

                    child.position.set(0, 0, 0);
                    child.rotation.set(0, 0, 0);
                    child.scale.set(1, 1, 1);

                }

            });

        };

        this.highlight = function (axis) {

            this.traverse(function (child) {

                if (child.material && child.material.highlight) {

                    if (child.name === axis) {

                        child.material.highlight(true);

                    } else {

                        child.material.highlight(false);

                    }

                }

            });

        };

    };
    THREE.MyTransformGizmo.prototype = Object.create(THREE.Object3D.prototype);
    THREE.MyTransformGizmo.prototype.constructor = THREE.MyTransformGizmo;
    THREE.MyTransformGizmo.prototype.update = function (rotation, eye) {

        var vec1 = new THREE.Vector3(0, 0, 0);
        var vec2 = new THREE.Vector3(0, 1, 0);
        var lookAtMatrix = new THREE.Matrix4();

        this.traverse(function (child) {

            if (child.name.search("E") !== -1) {

                child.quaternion.setFromRotationMatrix(lookAtMatrix.lookAt(eye, vec1, vec2));

            } else if (child.name.search("X") !== -1 || child.name.search("Y") !== -1 || child.name.search("Z") !== -1) {

                child.quaternion.setFromEuler(rotation);

            }

        });

    };
    THREE.MyTransformGizmoTranslate = function () {

        THREE.MyTransformGizmo.call(this);

        var arrowGeometry = new THREE.Geometry();
        var mesh = new THREE.Mesh(new THREE.CylinderGeometry(0, 0.05, 0.2, 12, 1, false));
        mesh.position.y = 0.5;
        mesh.updateMatrix();


        arrowGeometry.merge(mesh.geometry, mesh.matrix);

        var lineXGeometry = new THREE.BufferGeometry();
        lineXGeometry.addAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0], 3));

        var lineYGeometry = new THREE.BufferGeometry();
        lineYGeometry.addAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 1, 0], 3));

        var lineZGeometry = new THREE.BufferGeometry();
        lineZGeometry.addAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 1], 3));

        this.handleGizmos = {

            X: [
                [new THREE.Mesh(arrowGeometry, new MyGizmoMaterial({color: 0xff0000})), [0.5, 0, 0], [0, 0, -Math.PI / 2]],
                [new THREE.Line(lineXGeometry, new MyGizmoLineMaterial({color: 0xff0000}))]
            ],

            Y: [
                [new THREE.Mesh(arrowGeometry, new MyGizmoMaterial({color: 0x00ff00})), [0, 0.5, 0]],
                [new THREE.Line(lineYGeometry, new MyGizmoLineMaterial({color: 0x00ff00}))]
            ],

            Z: [
                [new THREE.Mesh(arrowGeometry, new MyGizmoMaterial({color: 0x0000ff})), [0, 0, 0.5], [Math.PI / 2, 0, 0]],
                [new THREE.Line(lineZGeometry, new MyGizmoLineMaterial({color: 0x0000ff}))]
            ],

            XYZ: [
                [new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), new MyGizmoMaterial({
                    color: 0xffffff,
                    opacity: 0.25
                })), [0, 0, 0], [0, 0, 0]]
            ],

            XY: [
                [new THREE.Mesh(new THREE.PlaneBufferGeometry(0.29, 0.29), new MyGizmoMaterial({
                    color: 0xffff00,
                    opacity: 0.25
                })), [0.15, 0.15, 0]]
            ],

            YZ: [
                [new THREE.Mesh(new THREE.PlaneBufferGeometry(0.29, 0.29), new MyGizmoMaterial({
                    color: 0x00ffff,
                    opacity: 0.25
                })), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
            ],

            XZ: [
                [new THREE.Mesh(new THREE.PlaneBufferGeometry(0.29, 0.29), new MyGizmoMaterial({
                    color: 0xff00ff,
                    opacity: 0.25
                })), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]
            ]

        };
        this.pickerGizmos = {

            X: [
                [new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0, 1, 4, 1, false), MyPickerMaterial), [0.6, 0, 0], [0, 0, -Math.PI / 2]]
            ],

            Y: [
                [new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0, 1, 4, 1, false), MyPickerMaterial), [0, 0.6, 0]]
            ],

            Z: [
                [new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0, 1, 4, 1, false), MyPickerMaterial), [0, 0, 0.6], [Math.PI / 2, 0, 0]]
            ],

            XYZ: [
                [new THREE.Mesh(new THREE.OctahedronGeometry(0.05, 0), MyPickerMaterial)]
            ],

            XY: [
                [new THREE.Mesh(new THREE.PlaneBufferGeometry(0.3, 0.3), MyPickerMaterial), [0.15, 0.15, 0]]
            ],

            YZ: [
                [new THREE.Mesh(new THREE.PlaneBufferGeometry(0.3, 0.3), MyPickerMaterial), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
            ],

            XZ: [
                [new THREE.Mesh(new THREE.PlaneBufferGeometry(0.3, 0.3), MyPickerMaterial), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]
            ]

        };


        this.setActivePlane = function (axis, eye) {

            var tempMatrix = new THREE.Matrix4();
            eye.applyMatrix4(tempMatrix.getInverse(tempMatrix.extractRotation(this.planes["XY"].matrixWorld)));

            if (axis === "X") {

                this.activePlane = this.planes["XY"];

                if (Math.abs(eye.y) > Math.abs(eye.z)) this.activePlane = this.planes["XZ"];

            }

            if (axis === "Y") {

                this.activePlane = this.planes["XY"];

                if (Math.abs(eye.x) > Math.abs(eye.z)) this.activePlane = this.planes["YZ"];

            }

            if (axis === "Z") {

                this.activePlane = this.planes["XZ"];

                if (Math.abs(eye.x) > Math.abs(eye.y)) this.activePlane = this.planes["YZ"];

            }

            if (axis === "XYZ") this.activePlane = this.planes["XYZE"];

            if (axis === "XY") this.activePlane = this.planes["XY"];

            if (axis === "YZ") this.activePlane = this.planes["YZ"];

            if (axis === "XZ") this.activePlane = this.planes["XZ"];

        };

        this.init();

    };
    THREE.MyTransformGizmoTranslate.prototype = Object.create(THREE.MyTransformGizmo.prototype);
    THREE.MyTransformGizmoTranslate.prototype.constructor = THREE.MyTransformGizmoTranslate;

    THREE.MyTransformGizmoRotate = function () {

        THREE.MyTransformGizmo.call( this );

        var CircleGeometry = function ( radius, facing, arc ) {

            var geometry = new THREE.BufferGeometry();
            var vertices = [];
            arc = arc ? arc : 1;

            for ( var i = 0; i <= 64 * arc; ++ i ) {

                if ( facing === 'x' ) vertices.push( 0, Math.cos( i / 32 * Math.PI ) * radius, Math.sin( i / 32 * Math.PI ) * radius );
                if ( facing === 'y' ) vertices.push( Math.cos( i / 32 * Math.PI ) * radius, 0, Math.sin( i / 32 * Math.PI ) * radius );
                if ( facing === 'z' ) vertices.push( Math.sin( i / 32 * Math.PI ) * radius, Math.cos( i / 32 * Math.PI ) * radius, 0 );

            }

            geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
            return geometry;

        };

        this.handleGizmos = {

            X: [
                [ new THREE.Line( new CircleGeometry( 1, 'x', 0.5 ), new MyGizmoLineMaterial( { color: 0xff0000 } ) ) ]
            ],

            Y: [
                [ new THREE.Line( new CircleGeometry( 1, 'y', 0.5 ), new MyGizmoLineMaterial( { color: 0x00ff00 } ) ) ]
            ],

            Z: [
                [ new THREE.Line( new CircleGeometry( 1, 'z', 0.5 ), new MyGizmoLineMaterial( { color: 0x0000ff } ) ) ]
            ],

            E: [
                [ new THREE.Line( new CircleGeometry( 1.25, 'z', 1 ), new MyGizmoLineMaterial( { color: 0xcccc00 } ) ) ]
            ],

            XYZE: [
                [ new THREE.Line( new CircleGeometry( 1, 'z', 1 ), new MyGizmoLineMaterial( { color: 0x787878 } ) ) ]
            ]

        };

        this.pickerGizmos = {

            X: [
                [ new THREE.Mesh( new THREE.TorusGeometry( 1, 0.12, 4, 12, Math.PI ), MyPickerMaterial ), [ 0, 0, 0 ], [ 0, - Math.PI / 2, - Math.PI / 2 ] ]
            ],

            Y: [
                [ new THREE.Mesh( new THREE.TorusGeometry( 1, 0.12, 4, 12, Math.PI ), MyPickerMaterial ), [ 0, 0, 0 ], [ Math.PI / 2, 0, 0 ] ]
            ],

            Z: [
                [ new THREE.Mesh( new THREE.TorusGeometry( 1, 0.12, 4, 12, Math.PI ), MyPickerMaterial ), [ 0, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
            ],

            E: [
                [ new THREE.Mesh( new THREE.TorusGeometry( 1.25, 0.12, 2, 24 ), MyPickerMaterial ) ]
            ],

            XYZE: [
                [ new THREE.Mesh( new THREE.Geometry() ) ]// TODO
            ]

        };

        this.setActivePlane = function ( axis ) {

            if ( axis === "E" ) this.activePlane = this.planes[ "XYZE" ];

            if ( axis === "X" ) this.activePlane = this.planes[ "YZ" ];

            if ( axis === "Y" ) this.activePlane = this.planes[ "XZ" ];

            if ( axis === "Z" ) this.activePlane = this.planes[ "XY" ];

        };

        this.update = function ( rotation, eye2 ) {

            THREE.MyTransformGizmo.prototype.update.apply( this, arguments );

            var group = {

                handles: this[ "handles" ],
                pickers: this[ "pickers" ],

            };

            var tempMatrix = new THREE.Matrix4();
            var worldRotation = new THREE.Euler( 0, 0, 1 );
            var tempQuaternion = new THREE.Quaternion();
            var unitX = new THREE.Vector3( 1, 0, 0 );
            var unitY = new THREE.Vector3( 0, 1, 0 );
            var unitZ = new THREE.Vector3( 0, 0, 1 );
            var quaternionX = new THREE.Quaternion();
            var quaternionY = new THREE.Quaternion();
            var quaternionZ = new THREE.Quaternion();
            var eye = eye2.clone();

            worldRotation.copy( this.planes[ "XY" ].rotation );
            tempQuaternion.setFromEuler( worldRotation );

            tempMatrix.makeRotationFromQuaternion( tempQuaternion ).getInverse( tempMatrix );
            eye.applyMatrix4( tempMatrix );

            this.traverse( function( child ) {

                tempQuaternion.setFromEuler( worldRotation );

                if ( child.name === "X" ) {

                    quaternionX.setFromAxisAngle( unitX, Math.atan2( - eye.y, eye.z ) );
                    tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
                    child.quaternion.copy( tempQuaternion );

                }

                if ( child.name === "Y" ) {

                    quaternionY.setFromAxisAngle( unitY, Math.atan2( eye.x, eye.z ) );
                    tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY );
                    child.quaternion.copy( tempQuaternion );

                }

                if ( child.name === "Z" ) {

                    quaternionZ.setFromAxisAngle( unitZ, Math.atan2( eye.y, eye.x ) );
                    tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ );
                    child.quaternion.copy( tempQuaternion );

                }

            } );

        };

        this.init();

    };
    THREE.MyTransformGizmoRotate.prototype = Object.create( THREE.MyTransformGizmo.prototype );
    THREE.MyTransformGizmoRotate.prototype.constructor = THREE.MyTransformGizmoRotate;

    THREE.MyTransformGizmoScale = function () {

        THREE.MyTransformGizmo.call( this );

        var arrowGeometry = new THREE.Geometry();
        var mesh = new THREE.Mesh( new THREE.BoxGeometry( 0.125, 0.125, 0.125 ) );
        mesh.position.y = 0.5;
        mesh.updateMatrix();

        arrowGeometry.merge( mesh.geometry, mesh.matrix );

        var lineXGeometry = new THREE.BufferGeometry();
        lineXGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0,  1, 0, 0 ], 3 ) );

        var lineYGeometry = new THREE.BufferGeometry();
        lineYGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0,  0, 1, 0 ], 3 ) );

        var lineZGeometry = new THREE.BufferGeometry();
        lineZGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( [ 0, 0, 0,  0, 0, 1 ], 3 ) );

        this.handleGizmos = {

            X: [
                [ new THREE.Mesh( arrowGeometry, new MyGizmoMaterial( { color: 0xff0000 } ) ), [ 0.5, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ],
                [ new THREE.Line( lineXGeometry, new MyGizmoLineMaterial( { color: 0xff0000 } ) ) ]
            ],

            Y: [
                [ new THREE.Mesh( arrowGeometry, new MyGizmoMaterial( { color: 0x00ff00 } ) ), [ 0, 0.5, 0 ] ],
                [ new THREE.Line( lineYGeometry, new MyGizmoLineMaterial( { color: 0x00ff00 } ) ) ]
            ],

            Z: [
                [ new THREE.Mesh( arrowGeometry, new MyGizmoMaterial( { color: 0x0000ff } ) ), [ 0, 0, 0.5 ], [ Math.PI / 2, 0, 0 ] ],
                [ new THREE.Line( lineZGeometry, new MyGizmoLineMaterial( { color: 0x0000ff } ) ) ]
            ],

            XYZ: [
                [ new THREE.Mesh( new THREE.BoxGeometry( 0.125, 0.125, 0.125 ), new MyGizmoMaterial( { color: 0xffffff, opacity: 0.25 } ) ) ]
            ]

        };

        this.pickerGizmos = {

            X: [
                [ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), MyPickerMaterial ), [ 0.6, 0, 0 ], [ 0, 0, - Math.PI / 2 ] ]
            ],

            Y: [
                [ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), MyPickerMaterial ), [ 0, 0.6, 0 ] ]
            ],

            Z: [
                [ new THREE.Mesh( new THREE.CylinderGeometry( 0.2, 0, 1, 4, 1, false ), MyPickerMaterial ), [ 0, 0, 0.6 ], [ Math.PI / 2, 0, 0 ] ]
            ],

            XYZ: [
                [ new THREE.Mesh( new THREE.BoxGeometry( 0.4, 0.4, 0.4 ), MyPickerMaterial ) ]
            ]

        };

        this.setActivePlane = function ( axis, eye ) {

            var tempMatrix = new THREE.Matrix4();
            eye.applyMatrix4( tempMatrix.getInverse( tempMatrix.extractRotation( this.planes[ "XY" ].matrixWorld ) ) );

            if ( axis === "X" ) {

                this.activePlane = this.planes[ "XY" ];
                if ( Math.abs( eye.y ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "XZ" ];

            }

            if ( axis === "Y" ) {

                this.activePlane = this.planes[ "XY" ];
                if ( Math.abs( eye.x ) > Math.abs( eye.z ) ) this.activePlane = this.planes[ "YZ" ];

            }

            if ( axis === "Z" ) {

                this.activePlane = this.planes[ "XZ" ];
                if ( Math.abs( eye.x ) > Math.abs( eye.y ) ) this.activePlane = this.planes[ "YZ" ];

            }

            if ( axis === "XYZ" ) this.activePlane = this.planes[ "XYZE" ];

        };

        this.init();

    };

    THREE.MyTransformGizmoScale.prototype = Object.create( THREE.MyTransformGizmo.prototype );
    THREE.MyTransformGizmoScale.prototype.constructor = THREE.MyTransformGizmoScale;


    THREE.MyTransformControls = function (camera, domElement) {

        THREE.Object3D.call(this);
        var interObj;
        var scope=this;
        var _mode = "translate";
        var _gizmo = {
            "translate": new THREE.MyTransformGizmoTranslate(),
            "rotate": new THREE.MyTransformGizmoRotate(),
            "scale": new THREE.MyTransformGizmoScale(),
            "translateAxis": new THREE.MyTransformGizmoTranslate(),
            "rotateAxis": new THREE.MyTransformGizmoRotate()
        };
        for (var type in _gizmo) {
            var gizmoObj = _gizmo[type];
            gizmoObj.visible = ( type === _mode );
            this.add(gizmoObj);
        }



        var _dragging = false;

        var point = new THREE.Vector3();

        var offsetRotation=new THREE.Euler();
        //鼠标点击时的点所在的位置
        var offset = new THREE.Vector3();
        var tempMatrix=new THREE.Matrix4();
        var tempVector=new THREE.Vector3();
        var tempVector2=new THREE.Vector3();

        var oldPosition=new THREE.Vector3();
        var oldScale=new THREE.Vector3();
        var oldRotationMatrix = new THREE.Matrix4();

        var position=new THREE.Vector3();
        var rotation=new THREE.Euler();
        var scale=new THREE.Vector3();
        var eye = new THREE.Vector3();

        var rotationMatrix=new THREE.Matrix4();

        var parentRotationMatrix=new THREE.Matrix4();
        var parentScale = new THREE.Vector3();

        var camPosition=new THREE.Vector3();

        var unitX = new THREE.Vector3( 1, 0, 0 );
        var unitY = new THREE.Vector3( 0, 1, 0 );
        var unitZ = new THREE.Vector3( 0, 0, 1 );

        var quaternionXYZ = new THREE.Quaternion();
        var quaternionX = new THREE.Quaternion();
        var quaternionY = new THREE.Quaternion();
        var quaternionZ = new THREE.Quaternion();
        var quaternionE = new THREE.Quaternion();
        var tempQuaternion = new THREE.Quaternion();

        var oldAxisRotation = {};
        var oldPoint;

        //intersectObjects(pointer, objects)使用的参数
        var pointerVector=new THREE.Vector3();
        var ray = new THREE.Raycaster();

        var changeEvent = { type: "change" };
        var mouseDownEvent = { type: "mouseDown" };
        var mouseUpEvent = { type: "mouseUp", mode: _mode };
        var objectChangeEvent = { type: "objectChange" };

        this.hasIntersect=false;
        this.object = undefined;
        this.axis = null;
        this.space = "world";
        this.setObject=function(obj){
            interObj=obj;
        };
        this.attach = function (object) {

            this.object = object;
            this.visible = true;
            this.update();

        };
        this.detach = function () {

            this.object = undefined;
            this.visible = false;
            //this.axis = null;

        };

        this.setMode = function (mode) {

            _mode = mode ? mode : _mode;

            if ( _mode === "scale" || _mode === "translateAxis" || _mode === "rotateAxis") scope.space = "local";
            else scope.space = "world";


            for (var type in _gizmo) _gizmo[type].visible = ( type === _mode );

            this.update();
            scope.dispatchEvent(changeEvent);

        };
        this.update = function () {

            if (scope.object === undefined) return;
            for (var i in scope.object) {
                scope.object[i].updateMatrixWorld();
            }

            position.copy( scope.object[i].getWorldPosition());
            rotation.copy(scope.object[i].getWorldRotation() );
            rotationMatrix.makeRotationFromEuler(rotation);
            camera.updateMatrixWorld();
            camPosition.setFromMatrixPosition(camera.matrixWorld);

            scale = position.distanceTo(camPosition) / 20;

            this.position.copy(position);
            this.scale.set(scale, scale, scale);

            eye.copy(camPosition).sub(position).normalize();

            if (scope.space === "world") {

                _gizmo[_mode].update(new THREE.Euler(), eye);

            }else if ( scope.space === "local" ) {

                _gizmo[ _mode ].update( rotation, eye );

            }
            _gizmo[ _mode ].highlight( scope.axis );

        };

        domElement.addEventListener("mousemove", onPointerHover);
        domElement.addEventListener( "mousedown", onPointerDown, false );
        domElement.addEventListener( "mousemove", onPointerMove, false );
        domElement.addEventListener( "mouseup", onPointerUp, false );
        this.dispose = function () {
            domElement.removeEventListener("mousemove", onPointerHover);
            domElement.removeEventListener( "touchstart", onPointerDown );
        };

        function onPointerHover(event) {

            if (scope.object === undefined || _dragging === true || ( event.button !== undefined && event.button !== 0 )) return;

            var pointer = event.changedTouches ? event.changedTouches[0] : event;

            var intersect = intersectObjects(pointer, _gizmo[_mode].pickers.children);

            var _axis = null;

            if (intersect) {

                _axis = intersect.object.name;

                event.preventDefault();

            }

            if (scope.axis !== _axis) {

                scope.axis = _axis;

                scope.update();
                scope.dispatchEvent(changeEvent);

            }

        }
        var isDragObjMove = false, isDragObjRotate=false;
        var maxPos1 = 0,maxPos2 = 0,minPos1 = 0,minPos2 = 0,minAngle = 0,maxAngle = 0;
        function onPointerDown( event ) {

            if ( scope.object === undefined || _dragging === true || ( event.button !== undefined && event.button !== 0 ) ) return;

            var pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;

            if ( pointer.button === 0 || pointer.button === undefined ) {

                var intersect0;
                if(interObj) intersect0 = intersectObjects( pointer, [interObj] );

                var intersect = intersectObjects( pointer, _gizmo[ _mode ].pickers.children );
                if( intersect0 ){
                    //event.preventDefault();
                    //event.stopPropagation();

                    if(intersect0.object.event){
                        scope.dispatchEvent( mouseDownEvent );
                        var moveEvent = intersect0.object.event.moveEvent;
                        for (var j in moveEvent) {
                            if (moveEvent[j].switch == "open") {
                                event.preventDefault();
                                event.stopPropagation();

                                scope.setMode("translate");
                                scope.space = "world";
                                scope.axis = moveEvent[j].selectType;
                                isDragObjMove = true;
                                maxPos1 = moveEvent[j].maxPos1;
                                maxPos2 = moveEvent[j].maxPos2;
                                minPos1 = moveEvent[j].minPos1;
                                minPos2 = moveEvent[j].minPos2;
                            }

                        }

                        var rotateEvent = intersect0.object.event.rotateEvent;
                        for (var k in rotateEvent) {
                            if (rotateEvent[k].switch == "open") {
                                event.preventDefault();
                                event.stopPropagation();

                                scope.setMode("rotate");
                                scope.space = "world";
                                scope.axis = rotateEvent[k].selectType;
                                isDragObjRotate = true;
                                minAngle = rotateEvent[k].minAngle;
                                maxAngle = rotateEvent[k].maxAngle;
                            }

                        }

                        scope.update();
                        //eye.copy( camPosition ).sub( position ).normalize();
                        //_gizmo[ _mode ].setActivePlane( scope.axis, eye );
                        oldPosition.copy( scope.position );
                        oldScale.copy( scope.scale );
                        oldRotationMatrix.extractRotation( scope.matrix );
                        rotationMatrix.extractRotation( scope.matrixWorld );
                        offset.copy( intersect0.point );
                    }
                }

                if ( intersect ) {
                    scope.hasIntersect=true;
                    event.preventDefault();
                    event.stopPropagation();
                    scope.dispatchEvent( mouseDownEvent );
                    scope.axis = intersect.object.name;
                    scope.update();

                    eye.copy( camPosition ).sub( position ).normalize();

                    _gizmo[ _mode ].setActivePlane( scope.axis, eye );

                    var planeIntersect = intersectObjects( pointer, [ _gizmo[ _mode ].activePlane ] );
                    if ( planeIntersect ) {

                        oldPosition.copy( scope.position );
                        oldScale.copy( scope.scale );
                        oldRotationMatrix.extractRotation( scope.matrix );

                        rotationMatrix.extractRotation( scope.matrixWorld );

                        //     parentRotationMatrix.extractRotation( scope.object.parent.matrixWorld );

                        offset.copy( planeIntersect.point );

                    }

                }

            }

            _dragging = true;

        }
        function onPointerMove( event ) {
            if ( scope.object === undefined || scope.axis === null || _dragging === false || ( event.button !== undefined && event.button !== 0 ) ) return;
            var pointer = event.changedTouches ? event.changedTouches[ 0 ] : event;

            var intersect0 = intersectObjects( pointer, [interObj] );
            //var planeIntersect = intersectObjects( pointer, [ _gizmo[ _mode ].activePlane ] );

            //if ( planeIntersect === false ) return;
            if(intersect0 === false ) return;
            if(intersect0)

            event.preventDefault();
            event.stopPropagation();
            point.copy( intersect0.point );

            if ( _mode === "translate" || _mode === "translateAxis") {

                point.sub( offset );

                if ( scope.space === "local" ) {
                    if (scope.axis.search( "XYZ" ) !== - 1) return;
                    for(var i in scope.object){
                        if ( scope.axis.search( "X" ) === - 1 ) point.x = 0;
                        if ( scope.axis.search( "Y" ) === - 1 ) point.y = 0;
                        if ( scope.axis.search( "Z" ) === - 1 ) point.z = 0;
                        //console.log(scope.object[i]);
                        tempVector.copy(point);

                        tempVector.applyMatrix4(  new THREE.Matrix4().extractRotation(scope.object[i].matrixWorld ) );
                        scope.object[i].position.add( tempVector );
                        if (_mode === "translateAxis"){
                            scope.object[i].traverse(function(child) {
                                if (child instanceof THREE.Mesh) {
                                    var array = scope.object[i].geometry.attributes.position.array;
                                    for (var m = 0,len= array.length;m < len; m += 3) {
                                        array[m] -= tempVector.x;
                                        array[m + 1] -= tempVector.y;
                                        array[m + 2] -= tempVector.z;
                                        scope.object[i].geometry.attributes.position.needsUpdate = true;
                                    }
                                    scope.object[i].geometry.computeBoundingSphere();
                                    scope.object[i].geometry.computeBoundingBox();
                                }
                            });

                        }
                    }

                }

                if ( scope.space === "world" || scope.axis.search( "XYZ" ) !== - 1 ) {

                    if ( scope.axis.search( "X" ) === - 1 ) point.x = 0;
                    if ( scope.axis.search( "Y" ) === - 1 ) point.y = 0;
                    if ( scope.axis.search( "Z" ) === - 1 ) point.z = 0;


                    for(var i in scope.object){
                        tempVector.copy(point);

                        parentScale= scope.object[i].parent.getWorldScale();
                        parentRotationMatrix = tempMatrix.extractRotation(scope.object[i].parent.matrixWorld);
                        tempVector.multiply(parentScale);
                        tempVector.applyMatrix4( tempMatrix.getInverse( parentRotationMatrix ) );
                        // tempVector.projectOnVector(new THREE.Vector3(0,1,0));
                        var isDragMove = true;
                        if(isDragObjMove == true) {
                            if (parseInt(maxPos1) == parseInt(minPos1) && parseInt(maxPos2) == parseInt(minPos2)) return;
                            if (scope.axis == "XY") {
                                if (scope.object[i].position.x > parseInt(maxPos1)) {
                                    scope.object[i].position.x = parseInt(maxPos1);
                                    isDragMove = false;
                                }
                                else isDragMove = true;
                                if (scope.object[i].position.x < parseInt(minPos1)) {
                                    scope.object[i].position.x = parseInt(minPos1);
                                    isDragMove = false;
                                }
                                else isDragMove = true;

                                if (scope.object[i].position.y > parseInt(maxPos2)) {
                                    scope.object[i].position.y = parseInt(maxPos2);
                                    isDragMove = false;
                                }
                                else isDragMove = true;
                                if (scope.object[i].position.y < parseInt(minPos2)) {
                                    scope.object[i].position.y = parseInt(minPos2);
                                    isDragMove = false;
                                }
                                else isDragMove = true;
                            }
                            if (scope.axis == "XZ") {
                                if (scope.object[i].position.x > parseInt(maxPos1)) {
                                    scope.object[i].position.x = parseInt(maxPos1);
                                    isDragMove = false;
                                }
                                else isDragMove = true;
                                if (scope.object[i].position.x < parseInt(minPos1)) {
                                    scope.object[i].position.x = parseInt(minPos1);
                                    isDragMove = false;
                                }
                                else isDragMove = true;

                                if (scope.object[i].position.z > parseInt(maxPos2)) {
                                    scope.object[i].position.z = parseInt(maxPos2);
                                    isDragMove = false;
                                }
                                else isDragMove = true;
                                if (scope.object[i].position.z < parseInt(minPos2)) {
                                    scope.object[i].position.z = parseInt(minPos2);
                                    isDragMove = false;
                                }
                                else isDragMove = true;
                            }
                            if (scope.axis == "YZ") {
                                if (scope.object[i].position.y > parseInt(maxPos1)) {
                                    scope.object[i].position.y = parseInt(maxPos1);
                                    isDragMove = false;
                                }
                                else isDragMove = true;
                                if (scope.object[i].position.y < parseInt(minPos1)) {
                                    scope.object[i].position.y = parseInt(minPos1);
                                    isDragMove = false;
                                }
                                else isDragMove = true;

                                if (scope.object[i].position.z > parseInt(maxPos2)) {
                                    scope.object[i].position.z = parseInt(maxPos2);
                                    isDragMove = false;
                                }
                                else isDragMove = true;
                                if (scope.object[i].position.z < parseInt(minPos2)) {
                                    scope.object[i].position.z = parseInt(minPos2);
                                    isDragMove = false;
                                }
                                else isDragMove = true;
                            }
                        }
                        if(isDragMove==false) return;
                        scope.object[i].position.add( tempVector );
                    }


                }

            }
            else if ( _mode === "scale" ) {

                point.sub( offset );
                //point.multiply( parentScale );

                if ( scope.space === "local" ) {

                    if ( scope.axis === "XYZ" ) {

                        scale = 1 + ( ( point.y ) / 50 );

                        for(var i in scope.object){
                            point.multiply(scope.object[i].parent.getWorldScale());
                            scope.object[i].scale.x*= scale;
                            scope.object[i].scale.y*= scale;
                            scope.object[i].scale.z*= scale;
                        }


                    } else {
                        for(var i in scope.object){
                            point.multiply(scope.object[i].parent.getWorldScale());
                            point.applyMatrix4( tempMatrix.extractRotation(scope.object[i].matrixWorld) );
                            scaleX = 1 + ( ( point.x ) / 50 );
                            scaleY = 1 + ( ( point.y ) / 50 );
                            scaleZ = 1 + ( ( point.z ) / 50 );
                            if ( scope.axis === "X" )   scope.object[i].scale.x*= scaleX;
                            if ( scope.axis === "Y" )   scope.object[i].scale.y*= scaleY;
                            if ( scope.axis === "Z" )   scope.object[i].scale.z*= scaleZ;
                        }

                    }

                }

            }
            else if ( _mode === "rotate" || _mode === "rotateAxis") {
                var worldPosition
                if ( scope.space === "local" ) {
                    for(var i in scope.object){
                        worldPosition=scope.object[i].getWorldPosition()
                        tempVector.copy(point);
                        tempVector2.copy(offset);
                        tempVector.sub(worldPosition);
                        tempVector2.sub(worldPosition);
                        tempVector.applyMatrix4( tempMatrix.getInverse(new THREE.Matrix4().extractRotation(scope.object[i].matrixWorld )) );
                        tempVector2.applyMatrix4( tempMatrix.getInverse(new THREE.Matrix4().extractRotation(scope.object[i].matrixWorld )) );

                        rotation.set( Math.atan2( tempVector.z, tempVector.y ), Math.atan2( tempVector.x, tempVector.z ), Math.atan2( tempVector.y, tempVector.x ) );
                        offsetRotation.set( Math.atan2( tempVector2.z, tempVector2.y ), Math.atan2( tempVector2.x, tempVector2.z ), Math.atan2( tempVector2.y, tempVector2.x ) );
                        quaternionXYZ.setFromRotationMatrix(tempMatrix.extractRotation(scope.object[i].matrixWorld) );

                        quaternionX.setFromAxisAngle( unitX, rotation.x - offsetRotation.x );
                        quaternionY.setFromAxisAngle( unitY, rotation.y - offsetRotation.y );
                        quaternionZ.setFromAxisAngle( unitZ, rotation.z - offsetRotation.z );

                        if ( scope.axis === "X" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionX );
                        if ( scope.axis === "Y" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionY );
                        if ( scope.axis === "Z" ) quaternionXYZ.multiplyQuaternions( quaternionXYZ, quaternionZ );

                        if (_mode === "rotate") scope.object[i].quaternion.copy( quaternionXYZ );
                        if (_mode === "rotateAxis") {

                            scope.object[i].quaternion.copy( quaternionXYZ );
                            if ( scope.axis === "X" ) quaternionX._x = -quaternionX._x;
                            if ( scope.axis === "Y" ) quaternionY._y = -quaternionY._y;
                            if ( scope.axis === "Z" ) quaternionZ._z = -quaternionZ._z;
                            scope.object[i].traverse(function(child) {
                                if (child instanceof THREE.Mesh) {
                                    var array = scope.object[i].geometry.attributes.position.array;
                                    for (var m = 0,len= array.length;m < len; m += 3) {
                                        var vector = new THREE.Vector3(array[m], array[m + 1], array[m + 2]);
                                        if (scope.axis === "X") vector.applyQuaternion(quaternionX);
                                        if (scope.axis === "Y") vector.applyQuaternion(quaternionY);
                                        if (scope.axis === "Z") vector.applyQuaternion(quaternionZ);
                                        array[m] = vector.x;
                                        array[m + 1] = vector.y;
                                        array[m + 2] = vector.z;
                                        scope.object[i].geometry.attributes.position.needsUpdate = true;
                                    }
                                }
                            });

                        }
                    }
                }
                else if ( scope.space === "world" ) {
                    worldPosition=scope.getWorldPosition();
                    point.sub(worldPosition);
                    offset.sub(worldPosition);
                    for(var i in scope.object){

                        rotation.set( Math.atan2( point.z, point.y ), Math.atan2( point.x, point.z ), Math.atan2( point.y, point.x ) );
                        offsetRotation.set( Math.atan2( offset.z, offset.y ), Math.atan2( offset.x, offset.z ), Math.atan2( offset.y, offset.x ) );
                        quaternionX.setFromAxisAngle( unitX, rotation.x - offsetRotation.x );
                        quaternionY.setFromAxisAngle( unitY, rotation.y - offsetRotation.y );
                        quaternionZ.setFromAxisAngle( unitZ, rotation.z - offsetRotation.z );

                        tempQuaternion.setFromRotationMatrix( tempMatrix.getInverse(tempMatrix.extractRotation(scope.object[i].parent.matrixWorld )) );
                        quaternionXYZ.setFromRotationMatrix(tempMatrix.extractRotation(scope.object[i].matrixWorld ));

                        if ( scope.axis === "X" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionX );
                        if ( scope.axis === "Y" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionY );
                        if ( scope.axis === "Z" ) tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionZ );
                        tempQuaternion.multiplyQuaternions( tempQuaternion, quaternionXYZ );

                        var euler=new THREE.Euler().setFromQuaternion(tempQuaternion);

                        var isDragRotate = true;

                        if(isDragObjRotate == true) {
                            var minEuler = parseInt(minAngle) * Math.PI / 180;
                            var maxEuler = parseInt(maxAngle) * Math.PI / 180;

                            if (scope.axis === "X") {
                                var quater = tempQuaternion;
                                if (euler.x < minEuler) quater = new THREE.Quaternion().setFromAxisAngle(unitX, minEuler);
                                if (euler.x > maxEuler) quater = new THREE.Quaternion().setFromAxisAngle(unitX, maxEuler);
                                tempQuaternion.x = quater.x;
                            }
                            if (scope.axis === "Y") {
                                var quater = tempQuaternion;
                                if (euler.y < minEuler) quater = new THREE.Quaternion().setFromAxisAngle(unitY, minEuler);
                                if (euler.y > maxEuler) quater = new THREE.Quaternion().setFromAxisAngle(unitY, maxEuler);
                                tempQuaternion.y = quater.y;
                            }
                            if (scope.axis === "Z") {
                                var quater = tempQuaternion;
                                if (euler.z < minEuler) quater = new THREE.Quaternion().setFromAxisAngle(unitZ, minEuler);
                                if (euler.z > maxEuler) quater = new THREE.Quaternion().setFromAxisAngle(unitZ, maxEuler);
                                tempQuaternion.z = quater.z;
                            }
                        }
                        if(isDragRotate==false) return;
                        scope.object[i].quaternion.copy( tempQuaternion );
                    }

                }

            }

            offset.copy(intersect0.point);
            scope.update();
            scope.dispatchEvent( changeEvent );
            scope.dispatchEvent( objectChangeEvent );

        }
        function onPointerUp( event ) {

            if ( event.button !== undefined && event.button !== 0 ) return;

            if ( _dragging && ( scope.axis !== null ) ) {

                mouseUpEvent.mode = _mode;
                scope.dispatchEvent( mouseUpEvent )

            }

            _dragging = false;
            scope.hasIntersect=false;
            onPointerHover( event );

        }
        function intersectObjects(pointer, objects) {

            var rect = domElement.getBoundingClientRect();
            var x = ( pointer.clientX - rect.left ) / rect.width;
            var y = ( pointer.clientY - rect.top ) / rect.height;

            pointerVector.set(( x * 2 ) - 1, -( y * 2 ) + 1);
            ray.setFromCamera(pointerVector, camera);

            var intersections = ray.intersectObjects(objects, true);
            return intersections[0] ? intersections[0] : false;

        }
    }
    THREE.MyTransformControls.prototype = Object.create(THREE.Object3D.prototype);
    THREE.MyTransformControls.prototype.constructor = THREE.MyTransformControls;

}());