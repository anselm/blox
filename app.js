
class BehaviorScene {

	constructor(props,blob) {

		if ( WEBGL.isWebGLAvailable() === false ) {
			document.body.appendChild( WEBGL.getWebGLErrorMessage() );
			return
		}

		// renderer
		let renderer = this.renderer = new THREE.WebGLRenderer({antialias:true})
		renderer.setClearColor("#000000")
		renderer.setSize( window.innerWidth, window.innerHeight )
		document.body.appendChild( renderer.domElement )

		// scene
		let scene = this.scene = new THREE.Scene()

		// camera
		// TODO move out?
		let camera = this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000 )
		camera.position.set( 30, 30, 30 )
		camera.lookAt(0,0,0)
		scene.add(camera)

		// some controls
		// TODO move out?
		let controls = this.controls = new THREE.OrbitControls( camera, renderer.domElement )
		controls.minDistance = 10
		controls.maxDistance = 500

		// update
		let render = () => {
			blob._tick_children()
			requestAnimationFrame( render )
			renderer.render(scene, camera)
		}

		render()

		// observe when a child blob is added to this blob, and search it for threejs related objects to stuff into scene
		// TODO meshes and other objects could perhaps derive a base class to do this or just remember to do the work themselves
		blob._observe_attach(childBlob => {
			Object.entries(childBlob).forEach(([key,value])=>{
				if(value instanceof THREE.Object3D) {
					console.log("found a " + key + " adding to scene ")
					this.scene.add(value)
				}
			})
		})
	}
}

/*


https://github.com/kripken/ammo.js/blob/master/examples/webgl_demo_terrain/index.html


				switch ( objectType ) {
					case 1:
						// Sphere
						var radius = 1 + Math.random() * objectSize;
						threeObject = new THREE.Mesh( new THREE.SphereGeometry( radius, 20, 20 ), createObjectMaterial() );
						shape = new Ammo.btSphereShape( radius );
						shape.setMargin( margin );
						break;
					case 2:
						// Box
						var sx = 1 + Math.random() * objectSize;
						var sy = 1 + Math.random() * objectSize;
						var sz = 1 + Math.random() * objectSize;
						threeObject = new THREE.Mesh( new THREE.BoxGeometry( sx, sy, sz, 1, 1, 1 ), createObjectMaterial() );
						shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
						shape.setMargin( margin );
						break;
					case 3:
						// Cylinder
						var radius = 1 + Math.random() * objectSize;
						var height = 1 + Math.random() * objectSize;
						threeObject = new THREE.Mesh( new THREE.CylinderGeometry( radius, radius, height, 20, 1 ), createObjectMaterial() );
						shape = new Ammo.btCylinderShape( new Ammo.btVector3( radius, height * 0.5, radius ) );
						shape.setMargin( margin );
						break;
					default:
						// Cone
						var radius = 1 + Math.random() * objectSize;
						var height = 2 + Math.random() * objectSize;
						threeObject = new THREE.Mesh( new THREE.CylinderGeometry( 0, radius, height, 20, 2 ), createObjectMaterial() );
						shape = new Ammo.btConeShape( radius, height );
						break;
				}

*/

///
/// For now I just combine physics and meshes, might be better to leave them distinct
/// TODO it could search the parent for a mesh, and or let a region be specified...
///

let globalDynamics = 0

class BehaviorPhysical extends THREE.Mesh {
	constructor(props,blob) {

		let geometry = 0
		let size = 4
		let scale = new THREE.Vector3(10,1,10)

// TODO separate?
		switch(props.shape) {
			case "sphere":
				geometry = new THREE.SphereGeometry( size, 16, 16 )
				break
			default:
				size = 5
				geometry = new THREE.BoxGeometry(scale.x,scale.y,scale.z)
				break
		}

		// TODO right now color is a top level field - should it just be a property?
		let color = blob.color ? blob.color : 0x00ffff

		// instance this mesh
		let material = new THREE.MeshPhongMaterial( {color: color } )
		super(geometry,material)
		// build the ground

		let mass = 0
		let shape = 0
		let transform = 0

		switch(props.shape) {
			case "sphere":
				mass = 1
				shape = this.shape = new Ammo.btSphereShape(size)
				transform = this.transform = new Ammo.btTransform()
				transform.setIdentity()
				transform.setOrigin(new Ammo.btVector3(0, 20, 0))
				break
			default:
				mass = 0
				shape = this.shape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x/2,scale.y/2,scale.z/2))
				transform = this.transform = new Ammo.btTransform()
				transform.setIdentity()
				transform.setOrigin(new Ammo.btVector3(0,0,0))
				break
		}

		let isDynamic = (mass !== 0)
		let localInertia  = new Ammo.btVector3(0, 0, 0)
		if (isDynamic) {
			shape.calculateLocalInertia(mass, localInertia)
		}

		let myMotionState = new Ammo.btDefaultMotionState(transform)
		let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, shape, localInertia)

		this.body = new Ammo.btRigidBody(rbInfo)
		this.trans = new Ammo.btTransform()

		this.body.setRestitution(1.1)

		globalDynamics(this.body) // TODO hack
	}

	tick(interval,blob) {
		let ms = this.body.getMotionState()
		if (ms) {
			ms.getWorldTransform(this.trans)
			var p = this.trans.getOrigin();
			var q = this.trans.getRotation();
			this.position.set( p.x(), p.y(), p.z() );
			this.quaternion.set( q.x(), q.y(), q.z(), q.w() );
		}
	}
}

///
/// A physics capability
/// TODO right now this is treated as just another object in a scene....
/// I feel like it should get some special precedence or be implicitly added if not present?
///

class BehaviorPhysics {

	constructor(props,blob) {

		this.collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration()
		this.dispatcher              = new Ammo.btCollisionDispatcher(this.collisionConfiguration)
		this.overlappingPairCache    = new Ammo.btDbvtBroadphase()
		this.solver                  = new Ammo.btSequentialImpulseConstraintSolver()
		this.dynamicsWorld           = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.overlappingPairCache, this.solver, this.collisionConfiguration)

		this.dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0))

		this.bodies = []

		globalDynamics = this.add.bind(this)
	}

	add(body) {
		this.dynamicsWorld.addRigidBody(body)
		this.bodies.push(body)
	}

	tick() {
		this.dynamicsWorld.stepSimulation(1/60, 10)
	}

	destroy() {
	    Ammo.destroy(this.dynamicsWorld)
	    Ammo.destroy(this.solver)
	    Ammo.destroy(this.overlappingPairCache)
	    Ammo.destroy(this.dispatcher)
	    Ammo.destroy(this.collisionConfiguration)
	}
}

/* Physjii - disabled

class BehaviorPhysical {

	constructor(props) {
		switch(props) {
			case "ground": this.ground(props); break
			default: this.box(props); break
		}
	}

	ground(props) {
		let loader = new THREE.TextureLoader();
		let ground_material = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ map: loader.load( 'art/rocks.jpg' ) }),
			0.3, // high friction
			0.01 // low restitution
		)
		ground_material.map.wrapS = ground_material.map.wrapT = THREE.RepeatWrapping
		ground_material.map.repeat.set( 3, 3 )
		let ground = new Physijs.BoxMesh(
			new THREE.BoxGeometry(100, 1, 100),
			ground_material,
			0
		)
		ground.receiveShadow = true
	}

	box(props) {
		let loader = new THREE.TextureLoader();
		let box_material = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ map: loader.load( 'art/wood.jpg' ) }),
			0.3, // high friction
			0.01 // low restitution
		)
		let box = new Physijs.BoxMesh(
			new THREE.CubeGeometry( 2, 1, 1 ),
			box_material
		)
		box.position.set(0,20,0)
		box.castShadow = true
	}

}
*/

class BehaviorMesh extends THREE.Mesh {

	constructor(props,blob) {

		let size = 3

		// TODO have a separate function that produces an object from a string
		//let geometry = THREE_produceGeometry(props)

		let is_gltf = 0
		let geometry = 0
		switch(props) {
			case "box":
				geometry = new THREE.BoxGeometry(size,size,size)
				break
			case "sphere":
				geometry = new THREE.SphereGeometry( size, 16, 16 )
				break
			default:
				is_gltf = 1
				geometry = new THREE.SphereGeometry( size, 16, 16 )
				break
		}

		// TODO right now color is a top level field - should it just be a property?
		let color = blob.color ? blob.color : 0x00ff00

		// instance this mesh
		let material = new THREE.MeshPhongMaterial( {color: color } )
		super(geometry,material)

		// was a simple geometry
		if(!is_gltf) {
			return
		}

		// load the gltf
		let url = props + "/scene.gltf"
		let loader = new THREE.GLTFLoader()

		loader.load(url, (gltf) => {

			if(!gltf || !gltf.scene) {
				return // oh well it tried - doesn't matter if fails
			}

			// start animations
	        if(gltf.animations && gltf.animations.length){
	            let mixer = new THREE.AnimationMixer(gltf.scene)
	            for(let animation of gltf.animations){
	                mixer.clipAction(animation).play()
	            }
	        }

			// center on self
			let bbox = new THREE.Box3().setFromObject(gltf.scene)
		    const scale = size / bbox.getSize(new THREE.Vector3()).length() * 2;
		    const offset = bbox.getCenter(new THREE.Vector3()).multiplyScalar(scale);
		    gltf.scene.scale.set(scale, scale, scale);
		    gltf.scene.position.sub(offset);

			this.add(gltf.scene)

			// turn the top level material invisible to reveal the gltf only
			material.visible = false
		})
	}

}

class BehaviorLight extends THREE.DirectionalLight {
	constructor(props,blob) {

		// instance directional light
		super(props)

		this.position.set(-20,10,-20)
		this.target.position.set(0,0,0)
		this.castShadow = true

		//  debug - tack in some more light
		var light = new THREE.PointLight( 0xff0000, 1, 100 );
		this.add( light )

		// debug - make a visible representation
		let geometry = new THREE.SphereGeometry( 3, 16, 16 )
		let material = new THREE.MeshBasicMaterial( {color: 0xffff00 } )
		let mesh = new THREE.Mesh(geometry,material)
		this.add(mesh)
	}
}

class BehaviorLine extends THREE.Line2 {

	constructor(props) {
		let geometry = new THREE.LineGeometry()
		let matLine = new THREE.LineMaterial( {
			color: 0xffffff,
			linewidth: 5, // in pixels
			vertexColors: THREE.VertexColors,
			dashed: false
		} );
		matLine.resolution.set( window.innerWidth, window.innerHeight )
		super(geometry,matLine)
		this.myGeometry = geometry
		this.props = props
	}

	tick(interval,blob) {

		let first = blob.find(this.props.source)
		let second = blob.find(this.props.target)
		if(!first || !second) return
		let a = first.mesh.position
		let b = second.mesh.position

		let geometry = this.myGeometry
		let positions = [];
		let colors = [];
		//let points = hilbert3D( new THREE.Vector3( 0, 0, 0 ), 20.0, 1, 0, 1, 2, 3, 4, 5, 6, 7 );
		let points = [ a, b ]
		let spline = new THREE.CatmullRomCurve3( points );
		let divisions = Math.round( 12 * points.length );
		let color = new THREE.Color();
		for ( let i = 0, l = divisions; i < l; i ++ ) {
			let point = spline.getPoint( i / l );
			positions.push( point.x, point.y, point.z );
			color.setHSL( i / l, 1.0, 0.5 );
			colors.push( color.r, color.g, color.b );
		}
		geometry.setPositions( positions );
		geometry.setColors( colors );

		this.computeLineDistances()
		geometry.verticesNeedUpdate = true;
	}

}

// TODO it might be nicer to be able to not have to declare these separately when they're the same type
class BehaviorPosition extends THREE.Vector3 {
	constructor(props) {
		super()
		this.set(props.x,props.y,props.z)
	}
}

class BehaviorForce extends THREE.Vector3 {
	constructor(props) {
		super()
		this.set(props.x,props.y,props.z)
	}
}

class BehaviorThrust extends THREE.Vector3 {
	constructor(props) {
		super()
		this.set(props.x,props.y,props.z)
	}
}

class BehaviorBounce {
	constructor(props) {
		this.props = props
		// TODO it does expect properties to exist... maybe it should force requirements to exist if not present
		// TODO so maybe it should also add itself to the blob? can it add duplicate named entries?
		// blob.register(this)
	}
	tick(interval,blob) {
		if(!blob.thrust || !blob.force || !blob.position) {
			console.error("missing props")
			// TODO add? - or pull inside self?
			return
		}
		// TODO right now thrust,force,position are properties at a higher level, should they be inside bounce?
		blob.force.add(blob.thrust)
		blob.position.add(blob.force)
		if(blob.position.y < 2) {
			blob.position.y = 2
			blob.force.y = 0.5
		}
	}
}

class BehaviorOscillate {
	constructor(props) {
		this.props = props
		this.angle = 0
	}
	tick(interval,blob) {
		let rad = 30
		this.angle += 0.01
		blob.position = new THREE.Vector3( Math.sin(this.angle)*rad,3,Math.cos(this.angle)*rad)
	}
}

class BehaviorWander {
	constructor(props) {
		this.props = props
	}
	tick(interval,blob) {
		if(!blob.thrust || !blob.force || !blob.position) {
			console.error("missing props")
			// TODO add? - or pull inside self?
			return
		}
		// pick somewhere occasionally
		if(!blob.focus || Math.random() < 0.011) {
			blob.focus = new THREE.Vector3(Math.random()*20-10,Math.random()*20,Math.random()*20-10)
		}
		// accelerate hard towards it if far away
		blob.thrust.x = ( blob.focus.x - blob.position.x ) * 0.01 * interval
		blob.thrust.y = ( blob.focus.y - blob.position.y ) * 0.01 * interval
		blob.thrust.z = ( blob.focus.z - blob.position.z ) * 0.01 * interval
		blob.force.add(blob.thrust)
		blob.position.add(blob.force)
	}
}

class BehaviorStare {
	constructor(props) {
		this.props = props
	}
	tick(interval,blob) {
		let focus = blob.find(this.props)
		if(focus && focus.mesh) {
			blob.focus = focus.mesh.position
		}
	}
}

class BehaviorUpdate {
	// TODO not totally happy with having to have an update behavior - perhaps this could be implicit
	tick(interval,blob) {
		if(blob.mesh && blob.focus) {
			blob.mesh.lookAt(blob.focus)
		}
		if(blob.mesh && blob.position) {
			blob.mesh.position.set(blob.position.x,blob.position.y,blob.position.z)
		}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// Blob acts a bucket to hold a collection of named behaviors - one behavior of a blob is typically a THREE.Mesh
///
/// Behaviors in a blob have a back reference to the blob
///
/// TODO would be nice to load hierarchies
/// TODO it would be nice to allow multiple instances of a given Behavior in some cases
/// TODO interval for timing stability at various frame rates
/// TODO remove having to pass blobs in tick
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Blob {
	constructor(parent,_behaviors={},_children={}) {
		// set parent if any - this is a reserved term
		this.parent = parent
		// attach behaviors - behaviors are hashed directly into the blob class not as a .behaviors property
		this._attach_behaviors(_behaviors)
		// children blobs if any - this is a reserved term
		this.children = {}
		this._attach_children(_children)
	}
	_attach_behaviors(_behaviors={}) {
		Object.entries(_behaviors).forEach(([key,value])=>{
			// evaluate each keypair - a keypair is either a name+class behavior, or a name + literal value
			this._attach_behavior(key,value)
		})
	}
	_attach_behavior(key,props) {
		let blob = this
		let className = "Behavior"+key.charAt(0).toUpperCase() + key.slice(1)
		// attempt to make a specified behavior for each property of each object
		try {
			// find the class
			let classRef = eval(className)
			// instance a behavior passing it the bucket itself and the properties for the field
			let behavior = new classRef(props,blob)
			// in each new behavior - keep a reference to this bucket
			behavior.blob = blob
			// in this instance - append new behavior to list of behaviors associated with this bucket
			blob[key] = behavior
		} catch(e) {
			if(key == "children" || key=="parent" || key=="find") { // TODO mark out reserved by a search instead
				console.error("Hit a reserved term " + key)
			} else {
				//console.error(e)
				//console.error("Blob::load: did not find " + className + " for " + name)
				// store the value as a literal if no class contructor found
				blob[key] = props
			}
		}
	}
	_attach_children(_children={}) {
		Object.entries(_children).forEach(([name,_child_behaviors])=>{
			let child = new Blob(this,_child_behaviors)
			this.children[name] = child
			// tell listeners if any
			for(let i = 0; this._observe_handlers && i < this._observe_handlers.length;i++) {
				let handler = this._observe_handlers[i]
				handler(child)
			}
		})
	}
	_observe_attach(handler) {
		if(!this._observe_handlers) this._observe_handlers = []
		this._observe_handlers.push(handler)
	}
	_tick_children(interval=0.01) {
		try {
			Object.entries(this.children).forEach(([name,blob])=>{
				blob._tick_children(interval)
				blob._tick_behaviors(interval)
			})
		} catch(e) {
			console.error(e)
		}
	}
	_tick_behaviors(interval) {
		Object.entries(this).forEach(([key,value])=>{
			// all properties that have tick get some cpu time
			if(!value.tick) return
			value.tick(interval,this)
		})
	}
	find(name) {
		console.log("looking for "  + name )
		if(this.parent && this.parent.children) {
			return this.parent.children[name]
		}
		return 0
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// Test Document
///
/// Here's a riff on how the behaviors that we want to play with might be stored on disk or a remote service
/// The challenge is to have a rich, easy to understand notation that also is easy to map into code
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

// TODO perhaps objects should be allowed to be duplicates? ie not use a hash inside of blob?

let example_document = {
	children: {
		"sun": {
			light:{color:0xFFFFFF}
		},
		"buzz": {
			color:0x3fc0aff, // TODO arguably color should be inside
			mesh:"art/eyeball",
			position:{x:0,y:3,z:0}, // TODO would be nicer to not have to have a class for position? or to instance the {0,0,0}?
			force:{x:0,y:0.5,z:0},
			thrust:{x:0,y:-0.05,z:0},
			thing:new THREE.Vector3(0,0,0), // this is technically supported for example - if built in memory rather than from json
			oscillate:"far",
			update:0 // TODO this is annoying
		},
		"eye": {
			mesh:"art/eyeball",
			position:{x:0,y:3,z:0},
			force:{x:0,y:0.5,z:0},
			thrust:{x:0,y:-0.05,z:0},
			stare: "buzz",
			bounce: "high",
			update:0
		},
		"wire": {
			line:{source:"eye",target:"buzz"}
		},
		"box": {
			"physics": {},
			"physical": {"shape":"box"},
		},
		"letsgetphysical": {
			"physical": {"shape":"sphere"},
		}
	}
}


// Build a root blob that manually adds a scene behavior to itself and then adds all the scene children

// let world = new Blob(0,{scene:0})
// world._attach_children(world_children)

// Or 

Ammo().then( x => {

	let world = new Blob()
	world.scene = new BehaviorScene({},world)
	world._attach_children(example_document.children)

})

// issues
// - add in all kinds of basic support to more richly define objects such as size and position
// - add in some error checking
// TODO I wouldn't mind having duplicates above - maybe children should not be a hash

//		- formally load hierarchies?
//		- not totally happy with having physics have to be buried, should just be able to attach to any blob at will
//		- i think it would be nice if there could be public resources that were easy to find, like scene or physics
//		- ammo then is weird
//		- the update behavior is weird
//		- 

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// test scripting
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
// in this idea a top level script can ask for things

let blob = world.get("eye2")

// and here i'm attaching a behavior on the fly...
// note that the attach itself could be inside of the behavior
// and note that it might be nice to just write naked functions or behaviors at will

//blob.button = new BehaviorButton(blob,"buzz")

// this feels like a reasonable convention? and or a messaging system might work?

blob.onCollide = function(results) {
	console.log("tree was hit")
}

// todo - i notice i see visual interpenetration - this should not be possible.... what is the update frequency?
// objects should be moved in lock step right?
*/

/*

///////////////////////////////////////////////////////////////////////////////////////////
// audio
///////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////
// a button
///////////////////////////////////////////////////////////////////////////////////////////

- what about leap hands? what about fancier widgets like a piano composed out of buttons?
- what about triggers - audio , scripts etc

- can scripts be first class - or how do i message some other object to do a thing? hide/show, start a story?

///////////////////////////////////////////////////////////////////////////////////////////
// a text card
///////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////
// collisions
///////////////////////////////////////////////////////////////////////////////////////////

gaze
	- may need a player concept or a camera concept or something at the Behavior level
	- look for intersections
	- send that object a message... i do want a concept of layer or filter masks


collider

Sphere( center : Vector3, radius : Float )
	- for now manually test for collisions agaist another collider
	- perhaps have built in behavior to avoid the collision
	- fire off an event

ordinary collisions

	- again, sending the object some kind of message on collision

proximity

	- brute force 

	- for gaze we do know where the user is looking - we can shoot a ray
	- if we have hands, or controllers we can have some simple sphere based collision
	- we can also have a proximity sensor attached to objects
	- 

	- using physics things can choose to avoid penetration to a degree
	- or i can probably just solve for penetration - by putting contact spheres in objects
	- 

///////////////////////////////////////////////////////////////////////////////////////////
// scripts / stories / narratives
///////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////
// timed events... what is the right way?
///////////////////////////////////////////////////////////////////////////////////////////

just use an in script approach

		attime(10, (x) => { do something })		// <- a global method

		get("thing").timer(10,{		// <- attach a timer to a thing
			this.moveto(xyz)
		})

add property sheet properties - would need to allow multiple instances of the same property!

		"nancy": { timer:[10,"myscript"] }

have a storyline Behavior

		"story": {
			timer:[
				{ time:10, target:"nancy", action:"goto", props:"bob" }
			]
		}

i think we really want triggers or events or timers or collisions to kick off small scripts...
that's more desirable


///////////////////////////////////////////////////////////////////////////////////////////
// how will we provide scripting? - one goal is make it easy to script stuff globally.
// Here are some ideas 
///////////////////////////////////////////////////////////////////////////////////////////

node("thing").position.slerp("target")   // <- i could decorate the hash with methods

slerp("thing","target") // <- naked helper methods

this.thing.position.slerp(this.target) // <- namespace noodling

node("thing").tick = function() {  // <- write your own tick handler script
	this.moveto("target")
}

*/


/*


	scene.add( new THREE.AmbientLight( 0x3D4143 ) );
	let light = new THREE.DirectionalLight( 0xffffff , 1);
	light.position.set( 20, 20, 20 );
	light.target.position.set( 0, 0, 0 );
	light.castShadow = true;
	var d = 300;
	// light.shadow.camera = new THREE.OrthographicCamera( -d, d, d, -d,  500, 1600 );
	// light.shadow.bias = 0.0001;
	// light.shadow.mapSize.width = light.shadow.mapSize.height = 1024;
	scene.add( light );
	let materialType = 'MeshPhongMaterial';
	// renderer.shadowMap.enabled = true;
	// renderer.shadowMap.type = THREE.PCFShadowMap;//THREE.BasicShadowMap;


    // physics
 	let world = new OIMO.World( {info:true, worldscale:100} );
    var collisionGroupes = {};
    var infos;

    // state
    let bodys = [];
    var meshs = [];

    // Is all the physics setting for rigidbody
    var config = [
        1, // The density of the shape.
        0.1, // The coefficient of friction of the shape.
        0.1, // The coefficient of restitution of the shape.
        1, // The bits of the collision groups to which the shape belongs.
        0xffffffff // The bits of the collision groups with which the shape collides.
    ];

    // static
    if (1) {
	    let size = new THREE.Vector3(1,1,1)
	    let pos = new THREE.Vector3(0,0,0)
		let mat = new THREE.MeshPhongMaterial( {color: 0xa0a0ff } )
		let geom = new THREE.BoxGeometry(size.x,size.y,size.z)
	    let mesh = new THREE.Mesh(geom,mat)
	    let body = {size:[size.x,size.y,size.z], pos:[pos.x,pos.y,pos.z], config:config}
	    body = world.add(body); body.mesh = mesh; scene.add(mesh)
	    bodys.push(body)
	}

    // objects
    if( 1 ) {
	    let size = new THREE.Vector3(1,1,1)
	    let pos = new THREE.Vector3(0,20,0)
		let mat = new THREE.MeshPhongMaterial( {color: 0xa0a000 } )
		let geom = new THREE.BoxGeometry(size.x,size.y,size.z)
	    let mesh = new THREE.Mesh(geom,mat)
	    let body = {type:'box', size:[size.x,size.y,size.z], pos:[pos.x,pos.y,pos.z], move:true, config:config }
	    body = world.add(body); body.mesh = mesh; scene.add(mesh)
	    bodys.push(body)
	}


    world.add({
         type:'jointPrisme',
         body1:bodys[0], 
         body2:bodys[1],
         pos1:[-5,0,0],
         pos2:[5,0,0]
    });

    function updateOimoPhysics() {
        world.step();
        bodys.forEach(body => {
            if(body.sleeping) return
            body.mesh.position.copy(body.getPosition())
            body.mesh.quaternion.copy(body.getQuaternion())
        })
    }

   world.gravity = new OIMO.Vec3(0, -1, 0);


render_callback = updateOimoPhysics
*/


// - i could bring up arpersist
// - and try simplify it so that the xrbase support is cleaner
// - then tack that into joshuas code
// - and then i could try append my new powers to arpersist - maybe rename it
// - 


