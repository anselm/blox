
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// 3js boilerplate + startup
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

let render_callback = 0

function threedee(USE_PHYSICS=1) {

	if ( WEBGL.isWebGLAvailable() === false ) {
		document.body.appendChild( WEBGL.getWebGLErrorMessage() );
		return
	}

	let scene = 0

	if(USE_PHYSICS) {
		Physijs.scripts.worker = '/js/physijs_worker.js'
		Physijs.scripts.ammo = '/js/ammo.js'
		scene = new Physijs.Scene
	} else {
		scene = new THREE.Scene()
		scene.simulate = function() {}
	}

	// Renderer

	let renderer = new THREE.WebGLRenderer({antialias:true})
	renderer.setClearColor("#000000")
	renderer.setSize( window.innerWidth, window.innerHeight )
	document.body.appendChild( renderer.domElement )

	// A camera

	let camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000 )
	camera.position.set( 30, 30, 30 )
	camera.lookAt(0,0,0)
	scene.add(camera)


	// some controls
	let controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.minDistance = 10;
	controls.maxDistance = 500;

	// update

	function render() {
		scene.simulate()
		if(render_callback) render_callback()
		requestAnimationFrame( render )
		renderer.render(scene, camera)
	}

	render();

	return scene
}

let scene = threedee()

// hack
let loader = new THREE.TextureLoader();


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// Behaviors and effects
///
/// Here are some behaviors - this maps 1-to-1 with a loaded document format for simplicity
///
/// I invent a poor mans ECS so that I have a single consistent flat namespace
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

class ComponentPhysical {

	constructor(obj,args) {
		switch(args) {
			case "ground": this.ground(); break
			default: this.box(); break
		}
	}

	ground() {
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
		scene.add( ground )
	}

	box() {
		let box_material = Physijs.createMaterial(
			new THREE.MeshLambertMaterial({ map: loader.load( 'art/wood.jpg' ) }),
			0.3, // high friction
			0.01 // low restitution
		)
		let box = new Physijs.BoxMesh(
			new THREE.CubeGeometry( 2, 1, 1 ),
			box_material
		)
		box.position.set( Math.random() * 15 - 7.5, 25, Math.random() * 15 - 7.5 )
		box.rotation.set( Math.random() * Math.PI,Math.random() * Math.PI,Math.random() * Math.PI )
		box.castShadow = true
		scene.add( box )
	}

}

class ComponentKinematic {
	constructor(obj,args) {
		let geometry = new THREE.BoxGeometry( 1, 1, 1 );
		let material = new THREE.MeshBasicMaterial( { color: "#433F81" } );
		obj.mesh = new THREE.Mesh( geometry, material );
		scene.add( obj.mesh )
	}
}


class ComponentArt {

	constructor(obj,args) {
		obj.mesh = this.loadGLTF(args+"/scene.gltf")
		scene.add( obj.mesh )
	}

	loadGLTF(url,size=3){

		// a parent that is a bounding sphere for ray intersection tests
		let geometry = new THREE.SphereGeometry( size, 32, 32 )
		var material = new THREE.MeshBasicMaterial( {color: 0x00ff00 } )
		var group = new THREE.Mesh( geometry, material )

		// load callback
		let callback = (gltf) => {

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

			group.add(gltf.scene)

			// turn the parent material invisible
			material.visible = false
		}

		// load

		let loader = new THREE.GLTFLoader()
		loader.load(url, callback )
		return group
	}

}

class ComponentLight extends THREE.DirectionalLight {
	constructor(obj,args) {
		super(args)
		this.position.set( 20, 40, 15 )
		this.target.position.copy( scene.position )
		this.castShadow = true
		scene.add(this)
	}
}

class ComponentLine extends THREE.Line2 {
	constructor(obj,args) {
		let geometry = new THREE.LineGeometry()
		let matLine = new THREE.LineMaterial( {
			color: 0xffffff,
			linewidth: 5, // in pixels
			vertexColors: THREE.VertexColors,
			dashed: false
		} );
		matLine.resolution.set( window.innerWidth, window.innerHeight )
		let line = super(geometry,matLine)
		scene.add(line)
		this.myGeometry = geometry
		this.args = args
	}

	tick(interval,obj,objects) {

		let first = objects[this.args.source]
		let second = objects[this.args.target]
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
		let line = this
		line.computeLineDistances()
		geometry.verticesNeedUpdate = true;
	}


}

class ComponentPosition extends THREE.Vector3 {
	constructor(obj,args) {
		super()
		this.set(args.x,args.y,args.z)
	}
}

class ComponentForce extends THREE.Vector3 {
	constructor(obj,args) {
		super()
		this.set(args.x,args.y,args.z)
	}
}

class ComponentThrust extends THREE.Vector3 {
	constructor(obj,args) {
		super()
		this.set(args.x,args.y,args.z)
	}
}

class ComponentBounce {
	constructor(obj,args) {
		this.args = args
	}
	tick(interval,obj) {
		obj.force.add(obj.thrust)
		obj.position.add(obj.force)
		if(obj.position.y < 2) {
			obj.position.y = 2
			obj.force.y = 0.5
		}
		obj.mesh.position.set(obj.position.x,obj.position.y,obj.position.z)
	}
}

class ComponentWander {
	constructor(obj,args) {
		this.args = args
	}
	tick(interval,obj) {
		// pick somewhere occasionally
		if(!obj.destination || Math.random() < 0.011) {
			obj.destination = new THREE.Vector3(Math.random()*20-10,Math.random()*20,Math.random()*20-10)
		}
		// accelerate hard towards it if far away
		obj.thrust.x = ( obj.destination.x - obj.position.x ) * 0.01 * interval
		obj.thrust.y = ( obj.destination.y - obj.position.y ) * 0.01 * interval
		obj.thrust.z = ( obj.destination.z - obj.position.z ) * 0.01 * interval
		// add forces
		obj.force.add(obj.thrust)
		obj.position.add(obj.force)
		// update
		obj.mesh.position.set(obj.position.x,obj.position.y,obj.position.z)
		obj.mesh.lookAt(obj.destination)
	}
}

class ComponentStare {
	constructor(obj,args) {
		this.args = args
	}
	tick(interval,obj,objects) {
		let focus = objects[this.args]
		obj.mesh.lookAt(focus.mesh.position)
	}
}

///
/// Manage the heck out of a collection of objects
///

class ComponentManager {
	constructor(_objects) {
		this.objects = {}
		this.load(_objects)
	}
	load(_objects) {
		// transcriptase the strand into life
		Object.entries(_objects).forEach(([name,_obj])=>{
			// visit each property of each object
			let obj = {}
			Object.entries(_obj).forEach(([key,value])=>{
				let className = "Component"+key.charAt(0).toUpperCase() + key.slice(1)
				// attempt to make a component for each property of each object
				try {
					console.log("making " + className)
					let component = eval(className)
					obj[key] = new component(obj,value)
				} catch(e) {
					console.error(e)
					console.log("did not find " + className)
					obj[key] = value
				}
			})
			this.objects[name] = obj
		})
	}
	tick(interval=0.01) {
		Object.entries(this.objects).forEach(([name,obj])=>{
			Object.entries(obj).forEach(([key,value])=>{
				if(!value.tick) return
				// TODO interval for timing stability at various frame rates
				value.tick(interval,obj,this.objects)
			})
		})
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

let my_example_document = {
	"sun": {light:{color:0xFFFFFF}},
	"flat" : {
		physical:"ground"
	},
	"boxy" : {
		physical:"box"
	},
	"buzz" : {
		art:"art/hornet",
		position:{x:0,y:10,z:0},
		force:{x:0,y:0.5,z:0},
		thrust:{x:0,y:-0.05,z:0},
		wander:"far"
	},
	"eye" : {
		art:"art/eyeball",
		position:{x:0,y:10,z:10},
		force:{x:0,y:0.5,z:0},
		thrust:{x:0,y:-0.05,z:0},
		stare: "buzz",
		bounce: "high"
	},
	"wire": {
		line:{source:"eye",target:"buzz"}
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Go!
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

let m = new ComponentManager(my_example_document)

render_callback = m.tick.bind(m)

// - timing??? how will we do it
// - cards
// - button
// - leap hands, a keyboard, a piano etc

/*

// timing - what is the approach?




// scripting - one goal is make it easy to script stuff globally. Here are some options I can support:

node("thing").position.slerp("target")   // <- i could decorate the hash with methods

slerp("thing","target")

this.thing.position.slerp(this.target)

node("thing").tick = function() {
	this.moveto("target")
}

// some lightweight interpretation could also reduce the syntax


*/

