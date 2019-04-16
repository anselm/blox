
///
/// Intent
///
///		- a motion model of basic physics and momentum
///		- inverse kinematics such as goto a specific destination
///		- somne helpers such as radial explosion, shared wind, shared gravity or per object forces
///		- expressions of multi-part abstract and relational position { hover above joe, hop near the tree on the ground }
///
/// Orchestrating events over time?
////
///		- visit ten waypoints in a row
///		- explosions?
///
///

class BehaviorMotion {

	// - force being applied; i guess you can have multiple of these and they are constant; like 
	// - acc = force / mass
	// - vel = acceleration over time
}



///
/// - there are a set of forces being applied to an objevt
/// - an impulse will directly change the velocity
/// - sum up all forces
/// - acceleration = force * mass
/// - velocity += acceleration * time slice
/// - pos += vel


// - you can control your avatar and move through a field
// - things can appear or disappear
// - maybe words explode
// - i would like to choreograph a sequence
//		- move camera to a spot
//		- successive sentences
//		- 

// - i want to make something appear
// - then explode some letters
// - then move the camera around
// - then make it 


export class BehaviorIntent {

	constructor(props,blox) {
		on_reset({description:props,blox:blox})
	}

	on_reset(args) {

		let props = args.description
		let blox = args.blox

		// reset if desired
		if(!this.isInitialized || props.reset) {
			this.friction = 0.9
			this.linear = new THREE.Vector3()
			this.position = new THREE.Vector3()
			this.quaternion = new THREE.Quaternion()
			this.mesh = blox.query({property:"isObject3D"})
			this.speed = 1.0
			if(this.mesh) {
				this.position = this.mesh.position.clone()
				this.destination = this.mesh.destination.clone()
			}
			this.isInitialized = true
		}

		// hammer in a starting position in x,y,z
		if(props.position) {
			if(typeof props.position === "string") {
				let mesh = blox.query({name:props.position,property:isObject3D})
				if(mesh) {
					this.position = mesh.position.clone()
				}
			} else {
				this.position = new THREE.Vector3(props.position.x,props.position.y,props.position.z)
			}
		}

		// establish an eventual destination (could be a target named object that may be moving)
		if(props.destination) {
			this.destination = props.destination
		}

		// gravity?
		if(props.gravity) {
			this.gravity = new THREE.Vector3(props.gravity.x,props.gravity.y,props.gravity.z)
		}

		// friction?
		if(props.hasOwnProperty("friction") {
			this.friction = props.friction
		}

		// speed ratio; 1 = 1m/s - a number like 100000 would mean do the act instantly effectively
		if(props.hasOwnProperty("speed") {
			this.speed = props.speed
		}

		// seek eye level (above and beyond any specified target)
		if(props.hasOwnProperty("eyelevel") {
			this.eyelevel = props.eyelevel
		}

		// seek ground
		if(props.hasOwnProperty("ground") {
			this.eyelevel = props.eyelevel
		}

		// billboard to face user
		if(props.hasOwnProperty("billboard") {
			this.eyelevel = props.eyelevel
		}

		// be in front of user
		if(props.hasOwnProperty("tagalong") {
			this.eyelevel = props.eyelevel
		}

		// TODO - NEAR, ABOVE, BELOW, INSIDE, BEHIND, FACING, STARE

	}

	///
	/// notice tick event and update kinetic physics
	///

	on_tick(args) {

		// Find a destination to go to if any

		let destiny = 0

		if(this.destination === "string") {
			let mesh = blox.query({name:this.destination,property:isObject3D})
			if(mesh) {
				destiny = mesh.position.clone()
			}
		} else {
			this.destination = new THREE.Vector3(props.destination.x,props.destination.y,props.destination.z)
		}

		// TODO - modulate that destination by any high level rules, such as be on ground

		// TODO - figure out forces to go from current position to destination at current rate of movement

		// OLD:

		// dampen linear movement by friction
		this.linear.x = this.linear.x * this.friction
		this.linear.y = this.linear.y * this.friction
		this.linear.z = this.linear.z * this.friction

		// add force to object
		this.position.add(this.linear)

		if(this.mesh) {
			this.mesh.position.set(this.position.x,this.position.y,this.position.z)
		}
	}

	///
	/// Immediately apply a linear force to an object, or an angular force, which dampen over time
	/// TODO use time interval TODO parameterize
	/// TODO maybe I should just set a destination...
	///

	force(linear=0,angular=0) {
		this.physical = 1
		if(linear) {
			// rotate force to current heading and apply it to forces on object
			//let scratch = new THREE.Vector3(this.linear.x,this.linear.y,this.linear.z)
			let scratch = new THREE.Vector3(linear.x,linear.y,linear.z) //this.linear.x,this.linear.y,this.linear.z)
			scratch.applyQuaternion( this.quaternion )
			this.linear.add(scratch)
		}
		if(angular) {
			// get angular force as a quaternion
			let q = new THREE.Quaternion() ; q.setFromEuler(angular)
			// apply to current orientation immediately
			this.quaternion.multiply(q)
			// debug
			let e = new THREE.Euler()
			e.setFromQuaternion(this.quaternion)
			let x = e.x * 180 / Math.PI
			let y = e.y * 180 / Math.PI
			let z = e.z * 180 / Math.PI
		}
	}

}


/*

	- basic motion

		+ this implements a manual basic physics with very mediocre collision

		+ you can set mass
		+ you can add a linear impulse to your velocity
		+ you can set a linear force that is persistently applied over time; maybe even more than one force
		+ you can set the velocity
		+ you can set angular forces that is persistently applied over time
		+ you can add an angular impulse to your angular 
		+ you can set angular velocity
		+ you can set position
		+ you can set orientation
		+ these update over time

		+ you can set collision hull shape
		+ you can set collision style; either pairwise or maybe some kind of mask

		+ you can set a destination or orientation and forces will try make you go there { reverse kinematics }
		+ high level destinations could be expressed here as well - parties and modifiers such as on-ground
		+ maybe some built in powers for randomization; radial explosions and suchlike

	- physics
		- wraps these methods with real physics?
		+ you can set physics to none, or to static, kinematic, or to physical; this encapsulates ammojs if needed
		+ ammojs will not be invoked at all if the physics style is none - so 'none' is not compatible with other types

	- mesh -> remove physics from there
	- fox -> call this layer of physics instead

	- my example story
		- you can move around the world { so your physics push your body around nicely }
		- maybe you can do that with real physics engine and/or physics engine - both should be testable
		- 

how should i do waypoints over time?


*/

