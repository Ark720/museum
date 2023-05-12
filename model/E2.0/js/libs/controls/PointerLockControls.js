
THREE.PointerLockControls = function ( camera,domElement,view ) {
    this.type = 'PointerLockControls';
    this.domElement = ( domElement !== undefined ) ? domElement : document;
    this.speed = 1.0;
    this.height = 20;
    this.vertical = false;
    this.mspeed = 2;
    if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
        this.mspeed = 0.02;
    }
    this.vr = function () {
        if (window.orientation == 180 || window.orientation == 0) {
            this.vertical = true;
        }
        window.addEventListener('devicemotion', tilt, false);
        window.addEventListener('orientationchange', screenOrientation, false);
    }

    var rotatespeed = 0.005;
    var scope = this;
    var self = this;
    camera.rotation.set(0, 0, 0);
    var pitchObject = new THREE.Object3D();
    pitchObject.add(camera);

    var yawObject = new THREE.Object3D();
    yawObject.position.y = this.height;
    yawObject.add(pitchObject);

    var moveForward = false;
    var moveBackward = false;
    var moveLeft = false;
    var moveRight = false;

    var start = new THREE.Vector2();
    var end = new THREE.Vector2();
    var rdelta = new THREE.Vector2();

    this.isOnObject = false;
    var canJump = false;

    var velocity = new THREE.Vector3();

    var PI_2 = Math.PI / 2;
    var px = 0;
    var onMouseMove = function (event) {

        if (scope.enabled === false) return;

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        yawObject.rotation.y -= movementX * rotatespeed;
        pitchObject.rotation.x -= movementY * rotatespeed;

        pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));//-90<X<90

    };
    var ponTouchMove = function (event) {
        //moveForward = false;
        px = pitchObject.rotation.x;
        event.preventDefault();
        event.stopPropagation();
        end.set(event.touches[0].screenX, event.touches[0].screenY);

        rdelta.subVectors(end, start);
        yawObject.rotation.y -= rdelta.x * rotatespeed;
        pitchObject.rotation.x -= rdelta.y * rotatespeed;

        pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));//-90<X<90
        start.set(event.touches[0].screenX, event.touches[0].screenY);


    };
    var ponTouchHold=function(){
        if(!moveBackward) moveForward = true;
    }
    var ponTouchStart = function (event) {
        switch ( event.touches.length ) {

            case 2:
                event.preventDefault();
                moveBackward = false;
                moveForward = true;
                //alert("moveForward="+moveForward)
                break;
            case 3:
                event.preventDefault();
                moveBackward = true;
                moveForward = false;
                //alert("moveForward="+moveForward)
                break;
            default:
                moveBackward = false;
                moveForward = false;

        }
        start.set(event.touches[0].screenX, event.touches[0].screenY);
        document.addEventListener('touchmove', ponTouchMove, false);

    };
    var ponTouchEnd = function (event) {
        //event.preventDefault();
        moveForward = false;
        moveBackward = false;
        document.removeEventListener('touchmove', ponTouchMove, false);
        new TWEEN.Tween(pitchObject.rotation).to({
            x: 0,
            y: pitchObject.rotation.y,
            z: pitchObject.rotation.z
        }, 500).start();
    };
    var ponKeyDown = function (event) {
        //event.preventDefault();

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                moveForward = true;
                break;

            case 37: // left
            case 65: // a
                moveLeft = true;
                break;

            case 40: // down
            case 83: // s
                moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                moveRight = true;
                break;

            case 32: // space
                if (canJump === true) velocity.y += 10;
                canJump = false;
                break;

        }

    };
    var ponKeyUp = function (event) {

        switch (event.keyCode) {

            case 38: // up
            case 87: // w
                moveForward = false;
                break;

            case 37: // left
            case 65: // a
                moveLeft = false;
                break;

            case 40: // down
            case 83: // a
                moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                moveRight = false;
                break;

        }
    };
    var ponMouseDown = function (event) {
        document.addEventListener('mousemove', onMouseMove, false);

    };
    var ponMouseUP = function (event) {
        document.removeEventListener('mousemove', onMouseMove, false);
    };

    function contextmenu(event) {

        event.preventDefault();

    }

    function screenOrientation(event) {
        if (window.orientation == 180 || window.orientation == 0) {
            scope.vertical = true;
        } else {
            scope.vertical = false;
        }

    }

    function tilt(event) {
        if (scope.vertical) {
            yawObject.rotation.y += event.rotationRate.beta * rotatespeed * scope.mspeed;
            pitchObject.rotation.x -= -event.rotationRate.alpha * rotatespeed * scope.mspeed;
        } else {
            if (window.orientation == 90) {
                yawObject.rotation.y += event.rotationRate.alpha * rotatespeed * scope.mspeed;
                pitchObject.rotation.x += -event.rotationRate.beta * rotatespeed * scope.mspeed;
            } else {
                yawObject.rotation.y -= event.rotationRate.alpha * rotatespeed * scope.mspeed;
                pitchObject.rotation.x -= -event.rotationRate.beta * rotatespeed * scope.mspeed;
            }
        }
        pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));//-90<X<90
    } //tilt
    this.domElement.addEventListener('contextmenu', contextmenu, false);
    //document.addEventListener( 'mousemove', onMouseMove, false );
    //if(view){
    this.domElement.addEventListener('touchstart', ponTouchStart, false);
    //$(this.domElement).bind("press",ponTouchHold);
    document.addEventListener('touchend', ponTouchEnd, false);
    //}else{
    this.domElement.addEventListener('mousedown', ponMouseDown, false);
    document.addEventListener('mouseup', ponMouseUP, false);
    document.addEventListener('keydown', ponKeyDown, true);
    document.addEventListener('keyup', ponKeyUp, false);
    //}
    this.enabled = false;
    this.getObject = function () {

        return yawObject;

    };
    this.getDirection = function () {

        // assumes the camera itself is not rotated

        var direction = new THREE.Vector3(0, 0, -1);
        var rotation = new THREE.Euler(0, 0, 0, "YXZ");

        return function (v) {

            rotation.set(pitchObject.rotation.x, yawObject.rotation.y, 0);

            v.copy(direction).applyEuler(rotation);

            return v;

        }

    }();
    this.update = function (delta) {

        if (scope.enabled === false) return;

        delta *= 0.1;

        velocity.x += ( -velocity.x ) * 0.1 * delta;
        velocity.z += ( -velocity.z ) * 0.1 * delta;

        velocity.y -= 0.15 * delta;

        if (moveForward)velocity.z -= this.speed * delta;
        if (moveBackward) velocity.z += this.speed * delta;

        if (moveLeft) velocity.x -= this.speed * delta;
        if (moveRight) velocity.x += this.speed * delta;

        if (scope.isOnObject === true) {
            velocity.y = Math.max(0, velocity.y);
            canJump = true;
        }


        yawObject.translateX(velocity.x);
        yawObject.translateY(velocity.y);
        yawObject.translateZ(velocity.z);
        //	console.log(moveForward,yawObject.position.x);

        if (yawObject.position.y < this.height) {
            velocity.y = 0;
            yawObject.position.y = this.height;
            canJump = true;
        }

    };
    this.dispose = function () {
        this.domElement.removeEventListener('contextmenu', contextmenu, false);
        this.domElement.removeEventListener('mousedown', ponMouseDown, false);
        this.domElement.removeEventListener('touchstart', ponTouchStart, false);
        document.removeEventListener('mouseup', ponMouseUP, false);
        document.removeEventListener('keydown', ponKeyDown, true);
        document.removeEventListener('touchend', ponTouchEnd, false);
        document.removeEventListener('keyup', ponKeyUp, false);
        window.removeEventListener('devicemotion', tilt, false);
        window.removeEventListener('orientationchange', screenOrientation, false);
    };
};
var rayDirections = [];
rayDirections.push(new THREE.Vector3(0, 0, 1));
rayDirections.push(new THREE.Vector3(0, 0, -1));
rayDirections.push(new THREE.Vector3(1, 0, 0));
rayDirections.push(new THREE.Vector3(-1, 0, 0));
rayDirections.push(new THREE.Vector3(0, 1, 0));
rayDirections.push(new THREE.Vector3(0, -1, 0));
function detectCollision() {
    floorRay.ray.origin.copy(controls.getObject().position);
    var floor = floorRay.intersectObjects(Raymesh);
    controls.isOnObject = floor.length > 0 && floor[0].distance < controls.height;
    var rayCaster = new THREE.Raycaster(controls.getObject().position, rayDirections[0]);
    var intersects = rayCaster.intersectObjects(Raymesh, true);
    if ((intersects.length > 0)) {
        if (intersects[0].distance < 30 && intersects[0].distance > 0) {
            controls.getObject().position.z = intersects[0].point.z - 30;
        }
    }
    var rayCaster1 = new THREE.Raycaster(controls.getObject().position, rayDirections[1]);
    var intersects1 = rayCaster1.intersectObjects(Raymesh, true);
    if ((intersects1.length > 0)) {
        if (intersects1[0].distance < 30 && intersects1[0].distance > 0) {
            controls.getObject().position.z = intersects1[0].point.z + 30;
        }
    }
    var rayCaster2 = new THREE.Raycaster(controls.getObject().position, rayDirections[2]);
    var intersects2 = rayCaster2.intersectObjects(Raymesh, true);
    if ((intersects2.length > 0)) {
        if (intersects2[0].distance < 30 && intersects2[0].distance > 0) {
            controls.getObject().position.x = intersects2[0].point.x - 30;
        }
    }
    var rayCaster3 = new THREE.Raycaster(controls.getObject().position, rayDirections[3]);
    var intersects3 = rayCaster3.intersectObjects(Raymesh, true);
    if ((intersects3.length > 0)) {
        if (intersects3[0].distance < 30 && intersects3[0].distance > 0) {
            controls.getObject().position.x = intersects3[0].point.x + 30;

        }
    }
}
