
THREE.Animation = function ( root, data ) {

	this.root = root;
	this.data = THREE.AnimationHandler.init( data );
	this.hierarchy = THREE.AnimationHandler.parse( root );

	this.currentTime = 0;
	this.timeScale = 1;

	this.isPlaying = false;
	this.loop = true;
	this.weight = 0;

//	this.allowUpdate=true;
	this.interpolationType = THREE.AnimationHandler.LINEAR;

};

THREE.Animation.prototype = {

	constructor: THREE.Animation,

	keyTypes:  [ "pos", "rot", "scl","color","map","opacity" ],

	play: function ( startTime, weight ) {

		this.currentTime = startTime !== undefined ? startTime : 0;
		this.weight = weight !== undefined ? weight : 1;

		this.isPlaying = true;

		this.reset();

		THREE.AnimationHandler.play( this );

	},

	stop: function() {

		this.isPlaying = false;

		THREE.AnimationHandler.stop( this );

	},

	reset: function () {

		for ( var h = 0, hl = this.hierarchy.length; h < hl; h ++ ) {

			var object = this.hierarchy[ h ];

			if ( object.animationCache === undefined ) {

				object.animationCache = {
					animations: {},
					blending: {
						positionWeight: 0.0,
						quaternionWeight: 0.0,
						scaleWeight: 0.0,
						colorWeight: 0.0,
						mapWeight: 0.0,
						opacityWeight: 0.0
					}
				};

			}

			var name = this.data.name;
			var animations = object.animationCache.animations;
			var animationCache = animations[ name ];

			if ( animationCache === undefined ) {

				animationCache = {
					prevKey: { pos: 0, rot: 0, scl: 0,color: 0 ,map: 0 ,opacity: 0 },
					nextKey: { pos: 0, rot: 0, scl: 0,color: 0 ,map: 0 ,opacity: 0 },
					originalMatrix: object.matrix
				};

				animations[ name ] = animationCache;

			}

			// Get keys to match our current time

			for ( var t = 0,len=this.keyTypes.length; t < len; t ++ ) {

				var type = this.keyTypes[ t ];

				var preI=0;
				var length=this.data.hierarchy[ h ].keys.length;
				var prevKey = this.data.hierarchy[ h ].keys[ preI ];
				while(prevKey==undefined&&preI<length){
					preI++;
					prevKey=this.data.hierarchy[ h ].keys[ preI ];

				}

				var nextKey;
				while(nextKey==undefined&&preI<length){

					preI++;
					nextKey = this.getNextKeyWith( type, h,preI );

				}
				if(prevKey==undefined){

					THREE.AnimationHandler.animations.remove(this);
					return;
				}
				if(nextKey==undefined){
					nextKey=prevKey;
				}



				while ( nextKey.time < this.currentTime && nextKey.index > prevKey.index ) {

					prevKey = nextKey;
					var nextKeyI= nextKey.index + 1;
					nextKey = this.getNextKeyWith( type, h, nextKeyI );
					while(nextKey==undefined){
						nextKeyI++;
						nextKey = this.getNextKeyWith( type, h,nextKeyI );
					}



				}

				while ( prevKey.time > this.currentTime && nextKey.index > prevKey.index ) {
					nextKey=prevKey;
					var preKeyI=length-1;
					prevKey= this.getNextKeyWith( type, h,preKeyI );
					while(nextKey==undefined){
						preKeyI--;
						prevKey = this.getNextKeyWith( type, h,preKeyI );
					}




				}


				animationCache.prevKey[ type ] = prevKey;
				animationCache.nextKey[ type ] = nextKey;

			}

		}

	},

	resetBlendWeights: function () {

		for ( var h = 0, hl = this.hierarchy.length; h < hl; h ++ ) {

			var object = this.hierarchy[ h ];
			var animationCache = object.animationCache;

			if ( animationCache !== undefined ) {

				var blending = animationCache.blending;

				blending.positionWeight = 0.0;
				blending.quaternionWeight = 0.0;
				blending.scaleWeight = 0.0;
				blending.colorWeight = 0.0;
				blending.mapWeight = 0.0;
				blending.opacityWeight = 0.0;

			}

		}

	},

	update: ( function() {
		var scope=this;
		var points = [];
		var target = new THREE.Vector3();
		var newVector = new THREE.Vector3();
		var newQuat = new THREE.Quaternion();

		// Catmull-Rom spline

		var interpolateCatmullRom = function ( points, scale ) {

			var c = [], v3 = [],
			point, intPoint, weight, w2, w3,
			pa, pb, pc, pd;

			point = ( points.length - 1 ) * scale;
			intPoint = Math.floor( point );
			weight = point - intPoint;

			c[ 0 ] = intPoint === 0 ? intPoint : intPoint - 1;
			c[ 1 ] = intPoint;
			c[ 2 ] = intPoint > points.length - 2 ? intPoint : intPoint + 1;
			c[ 3 ] = intPoint > points.length - 3 ? intPoint : intPoint + 2;

			pa = points[ c[ 0 ] ];
			pb = points[ c[ 1 ] ];
			pc = points[ c[ 2 ] ];
			pd = points[ c[ 3 ] ];

			w2 = weight * weight;
			w3 = weight * w2;

			v3[ 0 ] = interpolate( pa[ 0 ], pb[ 0 ], pc[ 0 ], pd[ 0 ], weight, w2, w3 );
			v3[ 1 ] = interpolate( pa[ 1 ], pb[ 1 ], pc[ 1 ], pd[ 1 ], weight, w2, w3 );
			v3[ 2 ] = interpolate( pa[ 2 ], pb[ 2 ], pc[ 2 ], pd[ 2 ], weight, w2, w3 );

			return v3;

		};

		var interpolate = function ( p0, p1, p2, p3, t, t2, t3 ) {

			var v0 = ( p2 - p0 ) * 0.5,
				v1 = ( p3 - p1 ) * 0.5;

			return ( 2 * ( p1 - p2 ) + v0 + v1 ) * t3 + ( - 3 * ( p1 - p2 ) - 2 * v0 - v1 ) * t2 + v0 * t + p1;

		};

		return function ( delta,currentTime ) {
			//debugger;
			if(currentTime!=undefined)this.currentTime=currentTime
			if ( this.isPlaying === false ) return;


			function accAdd(num1,num2){
				var r1,r2,m;
				try{
					r1 = num1.toString().split('.')[1].length;
				}catch(e){
					r1 = 0;
				}
				try{
					r2=num2.toString().split(".")[1].length;
				}catch(e){
					r2=0;
				}
				m=Math.pow(10,Math.max(r1,r2));
				// return (num1*m+num2*m)/m;
				return Math.round(num1*m+num2*m)/m;
			}


			var sun=accAdd(
				this.currentTime,
				delta * this.timeScale
			);

			//if(sun<0)sun=0;
			this.currentTime = sun;

			if ( this.weight === 0 )
				return;

			//

			var duration = this.data.length;


			if( duration+0.00001>=this.currentTime &&this.currentTime>= duration-0.00001){
				this.currentTime=duration;
			}


			if ( this.currentTime >= duration|| this.currentTime < 0 ) {

				if ( this.loop ) {

					this.currentTime %= duration;

					if ( this.currentTime < 0 )
						this.currentTime += duration;

					this.reset();

				} else {

					this.stop();

				}

			}

			for ( var h = 0, hl = this.hierarchy.length; h < hl; h ++ ) {

				var object = this.hierarchy[ h ];
				var animationCache = object.animationCache.animations[ this.data.name ];
				var blending = object.animationCache.blending;

				// loop through pos/rot/scl

				for ( var t = 0,len=this.keyTypes.length; t < len; t ++ ) {

					// get keys

					var type    = this.keyTypes[ t ];
					var prevKey = animationCache.prevKey[ type ];
					var nextKey = animationCache.nextKey[ type ];

					if ( ( this.timeScale > 0 && nextKey.time <= this.currentTime ) ||
						( this.timeScale > 0 && prevKey.time >= this.currentTime ) ) {




					    var keyCurrent=0;
						var keyLength= this.data.hierarchy[ h ].keys.length;
					    prevKey = this.data.hierarchy[ h ].keys[ keyCurrent ];

						while(prevKey==undefined&&keyCurrent<keyLength){

							keyCurrent++;
					    	prevKey=this.data.hierarchy[ h ].keys[ keyCurrent];

					    }
						keyCurrent++;
					    nextKey = this.getNextKeyWith( type, h, keyCurrent);

					     while(nextKey==undefined&&keyCurrent<keyLength){

							 keyCurrent++;
					     	 nextKey = this.getNextKeyWith( type, h,keyCurrent );

					     }

						if(prevKey==undefined){

							THREE.AnimationHandler.animations.remove(this);
							return;
						}
						if(nextKey==undefined){
							nextKey=prevKey;
						}



						while ( nextKey.time < this.currentTime && nextKey.index > prevKey.index ) {

							prevKey = nextKey;
							var nextKeyI= nextKey.index + 1;

							nextKey = this.getNextKeyWith( type, h, nextKeyI );
							while(nextKey==undefined){
								nextKeyI++;
								nextKey = this.getNextKeyWith( type, h,nextKeyI );
							}

						}

						while ( prevKey.time >= this.currentTime && nextKey.index > prevKey.index ) {
							nextKey=prevKey;
							var preKeyI=keyLength-1;
							prevKey= this.getNextKeyWith( type, h,preKeyI );
							while(nextKey==undefined){
								preKeyI--;
								prevKey = this.getNextKeyWith( type, h,preKeyI );
							}

						}
						animationCache.prevKey[ type ] = prevKey;
						animationCache.nextKey[ type ] = nextKey;

					}

					 if(nextKey.time== prevKey.time){
					 	return
					 }
					var scale = ( this.currentTime - prevKey.time ) / ( nextKey.time - prevKey.time );

					var prevXYZ = prevKey[ type ];
					var nextXYZ = nextKey[ type ];

					if ( scale < 0 ) scale = 0;
					if ( scale > 1 ) scale = 1;

					// interpolate

					if(!prevXYZ || !nextXYZ) continue;
					if ( type === "pos" ) {

						//if(!prevXYZ || !nextXYZ) return;
						if ( this.interpolationType === THREE.AnimationHandler.LINEAR ) {

							newVector.x = prevXYZ[ 0 ] + ( nextXYZ[ 0 ] - prevXYZ[ 0 ] ) * scale;
							newVector.y = prevXYZ[ 1 ] + ( nextXYZ[ 1 ] - prevXYZ[ 1 ] ) * scale;
							newVector.z = prevXYZ[ 2 ] + ( nextXYZ[ 2 ] - prevXYZ[ 2 ] ) * scale;

							// blend

							var proportionalWeight = this.weight / ( this.weight + blending.positionWeight );
							object.position.lerp( newVector, proportionalWeight );
							blending.positionWeight += this.weight;

						} else if ( this.interpolationType === THREE.AnimationHandler.CATMULLROM ||
									this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD ) {

							points[ 0 ] = this.getPrevKeyWith( "pos", h, prevKey.index - 1 )[ "pos" ];
							points[ 1 ] = prevXYZ;
							points[ 2 ] = nextXYZ;
							points[ 3 ] = this.getNextKeyWith( "pos", h, nextKey.index + 1 )[ "pos" ];

							scale = scale * 0.33 + 0.33;

							var currentPoint = interpolateCatmullRom( points, scale );
							var proportionalWeight = this.weight / ( this.weight + blending.positionWeight );
							blending.positionWeight += this.weight;

							// blend

							var vector = object.position;

							vector.x = vector.x + ( currentPoint[ 0 ] - vector.x ) * proportionalWeight;
							vector.y = vector.y + ( currentPoint[ 1 ] - vector.y ) * proportionalWeight;
							vector.z = vector.z + ( currentPoint[ 2 ] - vector.z ) * proportionalWeight;

							if ( this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD ) {

								var forwardPoint = interpolateCatmullRom( points, scale * 1.01 );

								target.set( forwardPoint[ 0 ], forwardPoint[ 1 ], forwardPoint[ 2 ] );
								target.sub( vector );
								target.y = 0;
								target.normalize();

								var angle = Math.atan2( target.x, target.z );
								object.rotation.set( 0, angle, 0 );

							}

						}

					} else if ( type === "rot" ) {
						//if(!prevXYZ || !nextXYZ) return;
						THREE.Quaternion.slerp( prevXYZ, nextXYZ, newQuat, scale );

						// Avoid paying the cost of an additional slerp if we don't have to
						if ( blending.quaternionWeight === 0 ) {

							object.quaternion.copy( newQuat );
							blending.quaternionWeight = this.weight;

						} else {

							var proportionalWeight = this.weight / ( this.weight + blending.quaternionWeight );
							THREE.Quaternion.slerp( object.quaternion, newQuat, object.quaternion, proportionalWeight );
							blending.quaternionWeight += this.weight;

						}

					} else if ( type === "scl" ) {
						//if(!prevXYZ || !nextXYZ) return;
						newVector.x = prevXYZ[ 0 ] + ( nextXYZ[ 0 ] - prevXYZ[ 0 ] ) * scale;
						newVector.y = prevXYZ[ 1 ] + ( nextXYZ[ 1 ] - prevXYZ[ 1 ] ) * scale;
						newVector.z = prevXYZ[ 2 ] + ( nextXYZ[ 2 ] - prevXYZ[ 2 ] ) * scale;

						var proportionalWeight = this.weight / ( this.weight + blending.scaleWeight );
						object.scale.lerp( newVector, proportionalWeight );
						blending.scaleWeight += this.weight;

					}else if ( type === "color" ) {
						//if(!prevXYZ || !nextXYZ) return;
						var num = 0;
						var proportionalWeight = this.weight / ( this.weight + blending.colorWeight );
						object.traverse(function(child){
							if(child instanceof THREE.Mesh){
								if(child.material instanceof THREE.ShaderMaterial) return;
								var color = new THREE.Color();
								color.b = prevXYZ[num][0] + ( nextXYZ[num][0] - prevXYZ[num][0] ) * scale;
								color.g = prevXYZ[num][1] + ( nextXYZ[num][1] - prevXYZ[num][1] ) * scale;
								color.r = prevXYZ[num][2] + ( nextXYZ[num][2] - prevXYZ[num][2] ) * scale;
								child.material.color.lerp( color, proportionalWeight );
								num++;
							}
						});

						blending.colorWeight += this.weight;
					} else if ( type === "map" ) {
						//if(!prevXYZ || !nextXYZ) return;
						var num = 0;
						var proportionalWeight = this.weight / ( this.weight + blending.mapWeight );
						object.traverse(function(child){
							if(child instanceof THREE.Mesh){
								if(child.material.map == null) return;

								var offset = new THREE.Vector2();
								offset.x = prevXYZ[num][0] + ( nextXYZ[num][0] - prevXYZ[num][0] ) * scale;
								offset.y = prevXYZ[num][1] + ( nextXYZ[num][1] - prevXYZ[num][1] ) * scale;
								child.material.map.offset.copy(offset);
								//child.material.map.offset.lerp( offset, proportionalWeight );
								num++;
							}
						});

						blending.mapWeight = this.weight;
					}
					else if ( type === "opacity" ) {

						//if(!prevXYZ || !nextXYZ) return;
						var num = 0;
						var proportionalWeight = this.weight / ( this.weight + blending.opacityWeight );
						object.traverse(function(child){
							if(child instanceof THREE.Mesh){
								if(child.material.opacity == undefined) return;

								var opacity = prevXYZ[num] + ( nextXYZ[num] - prevXYZ[num] ) * scale;

								child.material.opacity = opacity;

								num++;
							}
						});

						blending.opacityWeight = this.weight;
					}

				}

			}

			return true;

		};

	} )(),

	getNextKeyWith: function ( type, h, key ) {

		var keys = this.data.hierarchy[ h ].keys;


		if ( this.interpolationType === THREE.AnimationHandler.CATMULLROM ||
			 this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD ) {

			key = key < keys.length - 1 ? key : keys.length - 1;

		} else {

			key = key % keys.length;

		}

		for ( ; key < keys.length; key ++ ) {
			if ( keys[ key ]!==undefined){
				if ( keys[ key ][ type ] !== undefined ) {

					return keys[ key ];

				}
			}


		}

		return this.data.hierarchy[ h ].keys[ 0 ];

	},

	getPrevKeyWith: function ( type, h, key ) {

		var keys = this.data.hierarchy[ h ].keys;

		if ( this.interpolationType === THREE.AnimationHandler.CATMULLROM ||
			this.interpolationType === THREE.AnimationHandler.CATMULLROM_FORWARD ) {

			key = key > 0 ? key : 0;

		} else {

			key = key >= 0 ? key : key + keys.length;

		}


		for ( ; key >= 0; key -- ) {

			if ( keys[ key ][ type ] !== undefined ) {

				return keys[ key ];

			}

		}

		return this.data.hierarchy[ h ].keys[ keys.length - 1 ];

	},

	toJSON:function(){
		var data=this.data;
		data.root=this.root.uuid;
		var dataStr=JSON.stringify(data);
		var deleteNull=dataStr.replace(/null,/g,"");
        delete data['root'];
		return deleteNull;
	}

};
