
///
/// BehaviorMotion
///
/// Simplest motion support with some minimal fake "inverse kinematics" so that things can have a sense of heft and be directed
/// Includes some simple collision
/// Includes semantic concepts of destination
/// Currently conflates a concept of sequencing events over time
///
/// Rudiments of motion:
///
///			- position
///			- quaternion
///			- velocity - objects visually exhibit a linear and angular velocity [ there is no explicit acceleration property ]
///			- angular velocity
///			- forces - objects have forces being applied to them constantly over every frame that are applied to their velocity
///			- friction - objects have a friction that dampens velocity over time
///			- mass - objects have a mass that forces are divided by over time
///			- impulses - objects can accept impulses that immediately are applied to the velocity
///			- inverse kinematics - objects can be asked to go to a place and apply forces to get there at a speed
///			- speed - affect inverse kinematics
///			- helpers - radial explosions, wind, gravity and other kinds of forces can be easily declared over objects
///
/// Collision (TBD):
///			- collision -> crude sphere proximity as a default - not using real physics engine
///
/// Semantics:
///			- expressions of target destinations as abstractions (go to the tree)
///			- modifiers of destination (be at eye level)
///
/// Examples:
///			* drive a player avatar around easily
///			- make a bunch of 3d letters explode
///			- make a camera go to a place and look at the player
///			- make an object go to a place that is abstract
///			- walk a path of breadcrumbs - each collision event sets the next goal
///			- choreograph a story over time with delays easily with deferred event sequencing and proximity collisions
///			- apply the same choreography to many objects
///


// TODO I'd like to start importing 3js now instead of just assuming it is around
// import * as THREE from 'three';


export class BehaviorIntent {

	constructor(args) {
		// pass to ourselves as a reset message for convenience so event handlers can easily invoke changes
		this.blox = args.blox
		this.on_reset(args)
	}

	on_reset(args) {
		if(args.description instanceof Array) {
			this.sequence_counter = 0
			this.sequence_latch = 0
			this.sequence = args.description
			return
		}
		this.on_do(args)
	}

	on_do(args) {

		let props = args.description || {}
		let blox = this.blox

		// sequence time? (to loop programs themselves)
		if(props.hasOwnProperty("reset")) {
			this.sequence_counter = parseInt(props.reset)
			this.sequence_latch = 0
		}

		// reset?
		if(!this.isInitialized || props.reset) {
			this.isInitialized = true
			// back reference to player if any (for destination modifiers like 'be at eye level')
			this.player = 0
			// back reference to nearest mesh if any
			this.mesh = blox ? blox.query({property:"isObject3D"}) : 0
			// position right now
			this.position = this.mesh ? this.mesh.position.clone() : new THREE.Vector3()
			// orientation right now
			this.quaternion = this.mesh ? this.mesh.quaternion.clone() : new THREE.Quaternion()
			// velocity right now - can be thought of as momentum - and is a product of forces over time / mass
			this.velocity = new THREE.Vector3()
			// angular velocity right now
			this.angular = new THREE.Quaternion()
			// keep forces in a forces bucket so that multiple forces can act on something at once
			this.forces = {}
			// universal friction applied to dampen all forces over time
			this.friction = 0.9
			// a rate concept for inverse kinematics
			this.speed = 1.0
			// mass
			this.mass = 1.0

			// don't have any particular ik destination to start with
			this.destination = 0
			this.facing = 0
			this.inverse_kinematics = false
			// don't be doing any physics at all unless there are any forces being applied
			this.any_kinematics = false
			// don't have any modifiers to start with; these are all explicit for now, I may coalese into a smarter concept
			this.modifier_eyelevel = 0
			this.modifier_ground = 0
			this.modifier_wall = 0
			this.modifier_billboard = 0
			this.modifier_tagalong = 0
		}

		// player?
		if(props.hasOwnProperty("player")) {
			this.player = blox ? blox.query(props.player) : 0
		}

		// hammer in an absolute position in x,y,z or from an existing entity (such as a previously placed breadcrumb)
		if(props.hasOwnProperty("position")) {
			if(typeof props.position === "string") {
				let mesh = blox ? blox.query({name:props.position,property:isObject3D}) : 0
				if(mesh) {
					this.position = mesh.position.clone()
				}
			} else {
				this.position = new THREE.Vector3(props.position.x,props.position.y,props.position.z)
			}
		}

		// remember an eventual destination (could be a target named object that may be moving) - resolved later on
		if(props.hasOwnProperty("destination")) {
			// TODO could verify that this is a string or a Vector3
			// TODO could consolidate with on_goto
			this.destination = props.destination
			this.any_kinematics = true
			this.inverse_kinematics = true
		}

		// remember an eventual orientation
		if(props.hasOwnProperty("facing")) {
			this.facing = props.facing
		}

		// friction? (It feels hand to have a special universal opposing force to brings things to rest)
		if(props.hasOwnProperty("friction")) {
			this.friction = props.friction
		}

		// velocity
		if(props.hasOwnProperty("velocity")) {
			this.velocity = new THREE.Vector3(props.velocity.x,props.velocity.y,props.velocity.z)
			this.any_kinematics = true
		}

		if(props.hasOwnProperty("angular")) {
			// TODO angular - convert
		}

		// gravity? (I feel it's handy to explicitly call out gravity as a special force... it's debatable however...)
		if(props.hasOwnProperty("gravity")) {
			this.forces["gravity"] = new THREE.Vector3(props.gravity.x,props.gravity.y,props.gravity.z)
			this.any_kinematics = true
		}

		// mass
		if(props.hasOwnProperty("mass")) {
			this.mass = props.mass
		}

		// inverse kinematics speed ratio; 1 = 1m/s - a number like 100000 would mean move very fast to destination
		if(props.hasOwnProperty("speed")) {
			this.speed = props.speed
		}

		// ik modifier - seek a height level based on a target or number (this is a modifier on a destination)
		if(props.hasOwnProperty("height")) {
			this.modifier_height = props.height
		}

		// ik modifier - seek some elevation on wall
		if(props.hasOwnProperty("wall")) {
			this.modifier_wall = props.wall
		}

		// ik modifier - be in some position relative to a user - like in front of user
		if(props.hasOwnProperty("tagalong")) {
			this.modifier_tagalong = props.eyelevel
		}

		// ik modifier - billboard to face some angle with respect to a third party such as the user
		if(props.hasOwnProperty("billboard")) {
			this.modifier_billboard = props.eyelevel
		}

		// TODO - NEAR, ABOVE, BELOW, INSIDE, BEHIND, FACING, STARE

	}

	///
	/// notice tick event and update kinetic physics
	///

	on_tick(args={}) {

		let blox = args.blox || 0

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Step forward in sequence
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////

		if(this.sequence) {
			// get seconds so far
			let seconds = Math.floor(args.interval)
			// has there been any significant change in time?
			if(seconds != this.sequence_latch) {
				this.sequence_latch = seconds
				// perform everything at this time; TODO could accept fractional time also
				for(let i = 0; i < this.sequence.length; i++) {
					let s = this.sequence[i]
					if(s.time == this.sequence_counter) {
						this.on_do({description:s})
					}
				}
				this.sequence_counter++
			}
		}

		this.on_kinematics(args)
	}

	on_kinematics(args) {

		let blox = this.blox

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Get out if no kinematics at all
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////

		if(!this.any_kinematics) return

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Linear - Evaluate Destinations which will compute an inverse kinematics style set of forces to apply to the object
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////

		let mass = this.mass ? this.mass : 1
		let impulse = new THREE.Vector3(0,0,0)

		if(this.inverse_kinematics) {

			// Find basic destination

			let destiny = {x:0,y:0,z:0}

			if(typeof this.destination === "string") {
				let mesh = blox ? blox.query({name:this.destination,property:"isObject3D"}) : 0
				if(mesh) {
					destiny = mesh.position.clone()
					this.destination = destiny // HACK just stick with the one we found and do not refind
				}
				// TODO deal with this.facing
			} else if(this.destination) {
				destiny = new THREE.Vector3(this.destination.x,this.destination.y,this.destination.z)
				// TODO deal with this.facing
			}

			// Apply modifiers
			// TODO 0 is off right now ... improve

			if(this.modifier_height) {
				destiny.y = this.modifier_height || 0
			}

			// TODO - improve inverse kinematics - figure out forces to go from current position to destination at current rate of movement

			impulse.x += (destiny.x - this.position.x) / 20
			impulse.y += (destiny.y - this.position.y) / 20
			impulse.z += (destiny.z - this.position.z) / 20
		}

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Linear - Given forces being applied - compute a total impulse to add - this is ignoring the time interval at this stage
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////

		Object.entries(this.forces).forEach(([name,force])=>{
			impulse.x += force.x
			impulse.y += force.y
			impulse.z += force.z
		})

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Linear - Given an impulse, it has to be divided by the mass
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////

		this.velocity.x += impulse.x / mass
		this.velocity.y += impulse.y / mass
		this.velocity.z += impulse.z / mass

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Linear - Dampen velocity by a universal friction
		// Given an impulse, it has to be divided by the temporal interval and it has to be divided by the mass
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////

		let universalFriction = this.friction ? this.friction : 0.9
		let lapsedTimeSlice = 60.0/1000.0 // TODO hack - assume 60fps

		this.velocity.x -= this.velocity.x * universalFriction * lapsedTimeSlice
		this.velocity.y -= this.velocity.y * universalFriction * lapsedTimeSlice
		this.velocity.z -= this.velocity.z * universalFriction * lapsedTimeSlice

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Linear - Move the object
		// TODO In a physics engine this would have to be solved forward at a small time step to deal with collisions
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////

		this.position.x += this.velocity.x * lapsedTimeSlice
		this.position.y += this.velocity.y * lapsedTimeSlice
		this.position.z += this.velocity.z * lapsedTimeSlice

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Angular
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////

		if(this.facing) {
			let dir = new THREE.Vector3(-this.velocity.x,0,-this.velocity.z).normalize()
			var mx = new THREE.Matrix4().lookAt(dir,new THREE.Vector3(0,0,0),new THREE.Vector3(0,1,0))
			let q = new THREE.Quaternion().setFromRotationMatrix(mx)
			this.quaternion.rotateTowards(q,0.1)
		}

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Copy position to mesh
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////

		if(this.mesh) {
			this.mesh.position.set(this.position.x,this.position.y,this.position.z)
			this.mesh.quaternion.copy(this.quaternion)
		}
	}

	///
	/// Adjust velocity in m/s right now. Technically this is called an 'impulse'. It also turns off IK.
	///

	on_impulse(args) {
		let linear = args.linear || 0
		let angular = args.angular || 0

		this.any_kinematics = true
		this.inverse_kinematics = false
		this.destination = 0
		if(linear) {
			// rotate force to current heading and apply it to forces on object
			let scratch = new THREE.Vector3(linear.x,linear.y,linear.z) 
			scratch.applyQuaternion( this.quaternion )
			this.velocity.add(scratch)
		}
		if(angular) {
			// get angular force as a quaternion
			let q = new THREE.Quaternion() ; q.setFromEuler(angular)
			// apply to current orientation immediately
			this.quaternion.multiply(q)
		}
	}

	///
	/// Go to a specific target now...
	///

	on_goto(args) {
		this.destination = args.destination || 0
		if(this.destination) {
			this.any_kinematics = true
			this.inverse_kinematics = true
		} else {
			this.inverse_kinematics = false		
		}
	}

}






