/**
 * Created by Administrator on 2016/9/23.
 */
(function(dom,editor){
    var keyAnimationObj=function(container){
        this.isPlay={};
        this.currentFrame={
            "default" : 0,
        };
        this.allTime={
            "default" : 2.0,
        };
        this.keyLength={
            "default" : 100,
        };
        this.startFrameNum = {
            "default" : 0,
        };
        this.endFrameNum = {
            "default" : 100,
        };
    };

    keyAnimationObj.prototype={

        toJSON:function(){

            var data='[';
            var animations=THREE.AnimationHandler.animations;
            var al=animations.length;
            for(var i=0;i<al;i++){
                data+=animations[i].toJSON();
                if(i!=al-1)data+=",";
            }
            data+=']';
            return data;
        },
        JSONLoad:function(animationData,scene){
            //debugger;
            var scope=this;
            var datas=animationData;
            var l=datas.length;
            for(var i=0;i<l;i++){
                var data=datas[i];
                if(!data.signals)data.signals={};
                var hierarchy=data.hierarchy;
                var hl=hierarchy.length
                for(var j =0;j<hl;j++){
                    var newKeys = [];
                    var keys=hierarchy[j].keys;
                    var kl=keys.length;
                    for(var m=0;m<kl;m++){
                        if(!keys[m]) continue;
                        var index= keys[m].index;
                        var w=  keys[m].rot._w;
                        var x=  keys[m].rot._x;
                        var y=  keys[m].rot._y;
                        var z=  keys[m].rot._z;
                        keys[m].rot=new THREE.Quaternion(x,y, z,w);
                        newKeys[index] = keys[m];
                        //console.log(newKeys[index].pos)
                        //if(m==index) continue;
                        //keys[index]=keys[m];
                        //keys[m]=undefined;
                        //delete keys[m];
                    }
                    hierarchy[j].keys = [];
                    for(var a=0;a<newKeys.length;a++){
                        if(newKeys[a])
                            hierarchy[j].keys[a] = newKeys[a];
                    }
                }
                var root=scene.getObjectByUuid(data.root);
                scope.currentFrame[root.uuid] = parseInt(data.frameNum.start);
                scope.startFrameNum[root.uuid] = parseInt(data.frameNum.start);
                scope.endFrameNum[root.uuid] = parseInt(data.frameNum.end);
                scope.keyLength[root.uuid] = parseInt(data.frameNum.end)-parseInt(data.frameNum.start);
                scope.allTime[root.uuid] = data.length;

                scope.addFrame(root,data);

            }


        },
        getAnimationsFromObj:function(objects){
            var animations = [];
            var allAnimations = THREE.AnimationHandler.animations;
            var l =allAnimations.length;
            for(var i in objects){
                for(var j=0;j<l;j++){
                    if(allAnimations[j].root===objects[i]){
                        animations.push(allAnimations[j]);
                    }
                }
            }

            return animations;
        },
        createData:function(root){

            var hierarchys=[];
            var index=this.currentFrame[root.uuid];
            var allTime= this.allTime[root.uuid];
            var keys=[];
            var hierarchy= {
                "parent" : 0, //root
                "keys"   : keys
            };
            hierarchys.push(hierarchy);
            var frameNum = {
                "start" : 0,
                "end"   : 100
            };
            return {
                "name"      : root.name+"-animation",
                "fps"       : 25,
                "length"    : this.allTime[root.uuid],
                "hierarchy" : hierarchys,
                "signals"   :{},
                "frameNum"  : frameNum
            };
        },


        addFrame:function(object,data){
            var scope=this;

            var keyLength=this.keyLength[object.uuid];

            var needCreate=true;
            var  Animations=THREE.AnimationHandler.animations;
            var l=Animations.length;
            for(var Ai=0;Ai<l;Ai++){
                if(Animations[Ai].root== object){
                    needCreate=false;
                    break;
                }
            }
            if(needCreate){
                var _data=data?data:scope.createData(object);

                var animation= new THREE.Animation( object,_data);
                animation.loop=true;
                animation.play();

            }

            var index=this.currentFrame[object.uuid];
            var allTime= this.allTime[object.uuid];
            var keyLengthAdd=keyLength+1;
            var time=(allTime/keyLengthAdd)*index;
            var positon=[object.position.x,object.position.y,object.position.z];
            var quaternion=new THREE.Quaternion().copy(object.quaternion);
            var scale=[object.scale.x,object.scale.y,object.scale.z];

            var color=[];
            var map=[];
            var opacity = [];
            object.traverse(function(child){
                if(child instanceof THREE.Mesh){
                    if(child.material instanceof THREE.ShaderMaterial){
                        var opa = child.material.uniforms.opacity.value;
                        opacity.push(opa);
                    }else {
                        var col = [child.material.color.b, child.material.color.g, child.material.color.r];
                        color.push(col);
                        if (child.material.map) {
                            var mapOffset = [Number(child.material.map.offset.x), Number(child.material.map.offset.y)];
                            map.push(mapOffset);
                        }
                        var opa = child.material.opacity;
                        opacity.push(opa);
                    }
                }
            });

            if(Animations[Ai].data.hierarchy[0].keys[this.currentFrame[object.uuid]])return;
            Animations[Ai].data.hierarchy[0].keys[this.currentFrame]={
                "index":index,
                "time":time,
                "pos" :positon,
                "rot" :quaternion,
                "scl" :scale,
                "color" :color,
                "map" :map,
                "opacity" :opacity
            };
            Animations[Ai].reset();
            Animations[Ai].currentTime=time;
            this.update(0,Animations[Ai]);

        },
        update:function(delta,animations){

            var allTime;
            var keyLength;


            var al=animations.length;
            for(var i =0;i<al;i++){
                keyLength=this.keyLength[animations[i].root.uuid]+1;
                allTime= this.allTime[animations[i].root.uuid];
                var time=(allTime/keyLength)*delta;

                var curentTime=(this.currentFrame[animations[i].root.uuid]-delta)*(allTime/keyLength);

                var signals=animations[i].data.signals[this.currentFrame[animations[i].root.uuid]];
                try{
                    var eControl=animations[i].data.eControl[this.currentFrame[animations[i].root.uuid]];
                    for(var j in eControl){
                        editor.isMouseTrigger[j]=eControl[j];
                    }

                }catch(e){}

                if(signals){
                    if(signals.stopSignal){
                        this.stopAnimation([animations[i].root]);
                    }

                    //ÐÅºÅÊÂ¼þ
                    if(signals.signal){
                        if(!animations[i].root.event) return;

                        var children = animations[i].root.event.animationEvent;

                        for(var j in children){
                            if (children[j].isSignal == true) {
                                var delta = parseInt(children[j].name.replace(/[^0-9]/, ""));

                                if (this.currentFrame[animations[i].root.uuid] == delta) {
                                    var next = children[j].next;
                                    for(var n in next){
                                        //this.currentFrame[next[n].objId]=0;
                                        eventTrigger(eventObj[next[n].objId].event[next[n].eventType][next[n].saveName]);
                                    }

                                }
                            }
                        }
                    }
                }



                animations[i].resetBlendWeights();
                animations[i].update(time,curentTime);
            }

        },
        playAnimation:function(obj){
            var time;
            var scope=this;
            if(obj){
                time=scope.allTime[obj.uuid]*1000/(this.keyLength[obj.uuid]+1)
                var newObj={};
                newObj[obj.uuid]=obj;

                var num=0;
                var animation=scope.getAnimationsFromObj(newObj);

                var callBack=function(_num,_animation,_obj){
                    return function(){
                        if(_num<1){
                            scope.currentFrame[_obj.uuid]++;
                            //scope.currentFrame[_obj.uuid]%=(scope.keyLength+1);
                            if(scope.currentFrame[_obj.uuid]>scope.endFrameNum[_obj.uuid]) {
                                scope.currentFrame[_obj.uuid] = 0
                            }
                        }
                        scope.update(1,_animation);
                    }
                };
                scope.isPlay[obj.uuid]=setInterval(callBack(num,animation,obj),time);
                num++;

            }

        },
        stopAnimation:function(obj){
            if(obj) {
                for (var i in obj) {
                    if (typeof obj[i] != 'object')continue

                    clearInterval(this.isPlay[obj[i].uuid]);
                    delete this.isPlay[obj[i].uuid];
                }
            }

        },

    };
    editor.animationNew = new keyAnimationObj(dom);
}(document.body,editor));


