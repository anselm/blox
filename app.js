
// Helper

MakeVector = function() {
	switch(arguments.length) {
	case 1:
		let arg = arguments[0]
		if(arg.length == 3) {
			return new THREE.Vector3(arg[0],arg[1],arg[2])
		} else {
			return new THREE.Vector3(arg.x,arg.y,arg.z)
		}
		break
	case 3:
		return new THREE.Vector3(arguments[0],arguments[1],arguments[2])
		break
	default:
		return new THREE.Vector3()
		break
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///
/// A scene
///

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

		//  debug - tack in some more light
		var light = new THREE.PointLight( 0xff0000, 1, 100 );
		camera.add(light)


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

class BehaviorMesh extends THREE.Mesh {

	constructor(props,blob) {

		// TODO have a separate richer function that produces fancy objects from a string

		let is_gltf = 0
		let geometry = 0
		switch(props.art) {
			case "box":
				geometry = new THREE.BoxBufferGeometry(1,1,1,16,16,16)
				break
			case "sphere":
				geometry = new THREE.SphereGeometry(1,16,16)
				break
			default:
				is_gltf = 1
				geometry = new THREE.SphereGeometry(1,16,16)
				break
		}

		// instance this mesh
		let color = props.color || 0xff00ff
		let material = new THREE.MeshPhongMaterial( {color: color } )
		super(geometry,material)

		// adjust scale and position
		if(props.scale) this.scale.set(props.scale.x,props.scale.y,props.scale.z)
		if(props.position) this.position.set(props.position.x,props.position.y,props.position.z)

		// was a simple geometry
		if(!is_gltf) {
			return
		}

		// load the gltf
		let url = props.art + "/scene.gltf"
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
			let size = this.scale.length()
		    let resize = size / bbox.getSize(new THREE.Vector3()).length() * 2
		    let offset = bbox.getCenter(new THREE.Vector3()).multiplyScalar(resize)
		    gltf.scene.scale.set(resize,resize,resize)
		    gltf.scene.position.sub(offset)

		    // add to parent
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

		// adjust scale and position
		if(props.position) this.position.set(props.position.x,props.position.y,props.position.z)

		this.target.position.set(0,0,0)
		this.castShadow = true

		// debug - make a visible representation
		let geometry = new THREE.SphereGeometry( 3, 16, 16 )
		let material = new THREE.MeshBasicMaterial( {color: 0xffff00 } )
		let mesh = new THREE.Mesh(geometry,material)
		this.add(mesh)
	}
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


class BehaviorLine extends THREE.Line2 {

	constructor(props,blob) {
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
		this.first = blob.find(props.first)
		this.second = blob.find(props.second)
	}

	tick(interval,blob) {

		if(!this.first || !this.second) return

		let a = this.first.mesh.position
		let b = this.second.mesh.position

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

class BehaviorBounce {
	constructor(props) {
		this.thrust = props.thrust ? MakeVector(props.thrust) : MakeVector()
		this.force = props.force ? MakeVector(props.force) : MakeVector()
		// TODO it does expect properties to exist... maybe it should force requirements to exist if not present
		// TODO so maybe it should also add itself to the blob? can it add duplicate named entries?
		// blob.register(this)
	}
	tick(interval,blob) {
		if(!blob.mesh) return
		this.force.add(this.thrust)
		blob.mesh.position.add(this.force)
		if(blob.mesh.position.y < 2) {
			blob.mesh.position.y = 2
			this.force.y = 0.5
		}
	}
}

class BehaviorOscillate {
	constructor() {
		this.angle = 0
	}
	tick(interval,blob) {
		if(!blob.mesh) return // TODO more error checking
		let rad = 30
		this.angle += 0.01
		blob.mesh.position.set(Math.sin(this.angle)*rad, 3, Math.cos(this.angle)*rad)
	}
}

class BehaviorWander {
	constructor(props) {
		this.thrust = props.thrust ? MakeVector(props.thrust) : MakeVector()
		this.force = props.force ? MakeVector(props.force) : MakeVector()
	}
	tick(interval,blob) {
		if(!blob.mesh) return
		// pick somewhere occasionally
		if(!this.focus || Math.random() < 0.011) {
			this.focus = new THREE.Vector3(Math.random()*20-10,Math.random()*20,Math.random()*20-10)
		}
		// accelerate towards it if far away
		this.thrust.x = ( this.focus.x - blob.mesh.position.x ) * 0.01 * interval
		this.thrust.y = ( this.focus.y - blob.mesh.position.y ) * 0.01 * interval
		this.thrust.z = ( this.focus.z - blob.mesh.position.z ) * 0.01 * interval
		this.force.add(this.thrust)
		this.mesh.position.add(this.force)
	}
}

class BehaviorStare {
	constructor(props) {
		this.props = props
	}
	tick(interval,blob) {
		let focus = blob.find(this.props)
		if(focus && focus.mesh) {
			blob.mesh.lookAt(focus.mesh.position)
		}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///
/// A physics capability
/// TODO right now this is treated as just another object in a scene....
/// I feel like it should get some special precedence or be implicitly added if not present?
///

let globalDynamics = 0
let bigworld = 0
let allbodies = 0

class BehaviorPhysics {

	constructor(props,blob) {

		Ammo()

		this.collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration()
		this.dispatcher              = new Ammo.btCollisionDispatcher(this.collisionConfiguration)
		this.overlappingPairCache    = new Ammo.btDbvtBroadphase()
		this.solver                  = new Ammo.btSequentialImpulseConstraintSolver()
		this.dynamicsWorld           = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.overlappingPairCache, this.solver, this.collisionConfiguration)

		this.dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0))

		this.bodies = []

bigworld = this.dynamicsWorld // TODO HACK
allbodies = this.bodies

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


class BehaviorPhysical {
	constructor(props,blob) {

		this.props = props

		// Force properties to exist
		let scale = blob.mesh.scale
		let position = blob.mesh.position
		let size = scale.length()

		let mass = this.mass = props.mass || 0
		let transform = this.transform = 0


		let shape = "unknown"
		if(blob.mesh.geometry instanceof THREE.BoxBufferGeometry) shape = "box"
		if(blob.mesh.geometry instanceof THREE.SphereGeometry) shape = "sphere"

		switch(shape) {
			case "sphere":
				shape = this.shape = new Ammo.btSphereShape(size/2)
				transform = this.transform = new Ammo.btTransform()
				transform.setIdentity()
				transform.setOrigin(new Ammo.btVector3(position.x,position.y,position.z))
				break
			default:
				shape = this.shape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x/2,scale.y/2,scale.z/2))
				transform = this.transform = new Ammo.btTransform()
				transform.setIdentity()
				transform.setOrigin(new Ammo.btVector3(position.x,position.y,position.z))
				break
		}

		let localInertia  = new Ammo.btVector3(0, 0, 0)
		if(mass) shape.calculateLocalInertia(mass, localInertia)
		let myMotionState = new Ammo.btDefaultMotionState(transform)
		let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, shape, localInertia)

		this.body = new Ammo.btRigidBody(rbInfo)
		this.trans = new Ammo.btTransform()

		// super bouncy for now
		this.body.setRestitution(0.9)

		// disable deactivation for now
		this.body.setActivationState(4)
		this.body.activate()

		if(this.props.launch) {
			console.log("launch")
			this.body.applyCentralForce(new Ammo.btVector3(this.props.launch.x,this.props.launch.y,this.props.launch.z))
			this.body.applyCentralImpulse(new Ammo.btVector3(this.props.launch.x,this.props.launch.y,this.props.launch.z))
		}

		globalDynamics(this.body) // TODO hack

if(!props.joint) return;
let test1 = allbodies[allbodies.length-2]
let test2 = allbodies[allbodies.length-1]
console.log(allbodies.length)

			let transforma = new Ammo.btTransform()
			transforma.setIdentity()
			//transforma.setOrigin(new Ammo.btVector3(0, 10, 0))

			let transformb = new Ammo.btTransform()
			transformb.setIdentity()
			//transformb.setOrigin(new Ammo.btVector3(0, 0, 0))

			let constraint = new Ammo.btSliderConstraint(
				test1,
				test2,
				transforma,
				transformb,
				true
			)

			constraint.setLowerLinLimit(0)
			constraint.setUpperLinLimit(2)

			// don't need to do this
			//	constraint.setLowerAngLimit(-1)
			//	constraint.setUpperAngLimit(-1)

			// motors are not supported
			//	constraint.setLinMotorVelocity( 1 )
			//	constraint.setMaxLinMotorForce( 0.0001 );
			//	constraint.setPoweredLinMotor( true );

			// try see if a persistent force will make it stay at limit


			//	constraint.setSoftnessLimLin( params.linear || 0 )
			//	constraint.setSoftnessLimAng( params.angular || 0 )

		bigworld.addConstraint( constraint );

	}

	tick(interval,blob) {

		if(this.props.force) {
//			this.body.applyCentralForce(new Ammo.btVector3(this.props.force.x,this.props.force.y,this.props.force.z))
			this.body.applyCentralImpulse(new Ammo.btVector3(this.props.force.x,this.props.force.y,this.props.force.z))
		}


		if(!blob.mesh) return
		let ms = this.body.getMotionState()
		if (ms) {
			ms.getWorldTransform(this.trans)
			var p = this.trans.getOrigin()
			var q = this.trans.getRotation()
			blob.mesh.position.set( p.x(), p.y(), p.z() )
			blob.mesh.quaternion.set( q.x(), q.y(), q.z(), q.w() )
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

let UUID = 0

class Blob {
	constructor(details={},parent=0) {
		try {
			this.children = []
			this.parent = parent
			if(!details) return
			// attach behaviors - behaviors are hashed directly into the blob class not as a .behaviors property
			this._attach_behaviors(details)
			// children blobs if any - this is a reserved term
			this._attach_children(details.children)
		} catch(e){
			console.error(e)
		}
	}
	_attach_behaviors(_behaviors={}) {
		Object.entries(_behaviors).forEach(([key,value])=>{
			if(key == "children") return
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
			if(key == "name" || key == "children" || key=="parent" || key=="find") { // TODO mark out reserved by a search instead
				console.error("Hit a reserved term " + key)
			} else {
				console.error(e)
				//console.error("Blob::load: did not find " + className + " for " + name)
				// store the value as a literal if no class contructor found
				blob[key] = props
			}
		}
	}
	_attach_children(_children=[]) {
		for(let i = 0; i < _children.length; i++) {
			let details = _children[i]
			let name = details.name || ++UUID
			let child = new Blob(details,this)
			child.name = name
			this.children.push(child)
			// tell listeners if any
			for(let i = 0; this._observe_handlers && i < this._observe_handlers.length;i++) {
				let handler = this._observe_handlers[i]
				handler(child)
			}
		}
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
		if(this.parent && this.parent.children) {
			for(let i = 0; i < this.parent.children.length; i++) {
				if(this.parent.children[i].name == name) return this.parent.children[i]
			}
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


let example_document = {
	scene: {},
	children: [
		// an example blob - only one light is allowed since this is a hash - TODO it is possible to generalize
		{
			// a behavior on the blob; in this case a 3js light - maps to a class named BehaviorLight
			light:{
				// a property of the behavior - simply used by the behavior at will or thrown away
				color:0xFFFFFF,
				position:{x:-15,y:15,z:15},
			}
		},
/*
		// here is another example blob - includes one mesh - only one is allowed since this is a hash...
		{
			name:"buzz",
			mesh:{
				art:"art/eyeball",
				color:0xff0000,
				scale:{x:1,y:1,z:1},
				position:{x:0,y:3,z:0},
			},
			oscillate:{
				force:{x:0,y:0.5,z:0},
				thrust:{x:0,y:-0.05,z:0},
			},
		},
		{
			name:"eye",
			mesh:{
				art:"art/eyeball",
				color:0xff0000,
	 			scale:{x:1,y:1,z:1},
				position:{x:0,y:3,z:0},
			},
			stare: "buzz",
			bounce: {
				force:{x:0,y:0.5,z:0},
				thrust:{x:0,y:-0.05,z:0},
			}
		},
		{
			name:"line",
			line:{first:"eye",second:"buzz"}
		},
*/
		{
			name:"ground",
			mesh: {
				art:"box",
				color:0xff00ff,
				scale:{x:20,y:0.1,z:20},
				position:{x:0,y:-10,z:0},
			},
			physics: {},
			physical: {
				mass:0
			},
		},
		{
			name:"ball0",
			mesh:{
				art:"sphere",
				color:0xff0000,
				scale:{x:3,y:3,z:3},
				position:{x:10,y:0,z:0},
			},
			physical: {
				mass:100,
				launch:{x:-1000,y:100,z:0},
			},
		},
		{
			name:"ball1",
			mesh:{
				art:"box",
				color:0xff0000,
				scale:{x:0.1,y:5,z:5},
				position:{x:0,y:0,z:0},
			},
			physical: {
				mass:0,
			},
		},
		{
			name:"ball2",
			mesh:{
				art:"box",
				color:0x00ff00,
				scale:{x:1,y:1,z:1},
				position:{x:2,y:0,z:0},
			},
			physical: {
				mass:100,
				joint:1,
				force:{x:100,y:0,z:0},
			},
		}
	]
}


// Build a root blob that manually adds a scene behavior to itself and then adds all the scene children

// let world = new Blob(0,{scene:0})
// world._attach_children(world_children)

// Or 

let world = new Blob(example_document)

/*

To improve

- separate camera and add a light to it

	- macros or references so i can build things faster, prototypes
	- property sheets for editors

	- should physics be more built in or?
	- concepts around having multiple physics objects attached to one thing; nested forces may not be right, have a force obj?
	- concepts around who should update position - shiould i mark it as dirty?

	- simplify behaviorscene by pulling work out of it and making standalone

	- should have some error checking, and or force in instances of required things like position where they do not exist

	- it might be nice to lookup things more easily, like to find the scene or the like in a namespace search?

	- should behaviors be a hash?

	- the grammar conflates the name of the object with the type - can I support a richer concept??
			position: [3,3,3] versus
			position: new THREE.Vector3(3,3,3)
			position-THREE.Vector3: [3,3,3] 
			builder: { class:THREE.Vector3, args:[x,x,x] }

	- introduce csg
	- introduce audio
	- introduce hands etc

*/

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// test scripting
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
// in this idea a top level script can ask for things

let blob = world.find("eye2")

// and here i'm attaching a behavior on the fly...
// note that the attach itself could be inside of the behavior
// and note that it might be nice to just write naked functions or behaviors at will

//blob.button = new BehaviorButton(blob,"buzz")

// this feels like a reasonable convention? and or a messaging system might work?

blob.onCollide = function(results) {
	console.log("tree was hit")
}



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
// scripts / stories / narratives and timing
///////////////////////////////////////////////////////////////////////////////////////////

	- i guess you can add an at time concept, like a behaviortimed...
	- there could be a list of scripts or you can hammer them in by hand into the obj

	"thing" : {
		time: {23,callscript}
		collision: {callscript}
	}

*/


