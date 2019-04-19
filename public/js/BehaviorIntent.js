
///
/// BehaviorMotion
///
/// Simplest motion support with some minimal fake "inverse kinematics" so that things can have a sense of heft and be directed
/// Includes some simple collision
/// Includes semantic concepts of destination
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
///


// TODO I'd like to start importing 3js now instead of just assuming it is around
// import * as THREE from 'three';


export class BehaviorIntent {

	constructor(args) {
		// pass to ourselves as a reset message for convenience so event handlers can easily invoke changes
		this.on_reset(args)
	}

	on_reset(args={}) {

		let props = args.description || {}
		let blox = args.blox || 0

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
		if(props.hasOwnProperty("eyelevel")) {
			this.modifier_eyelevel = props.eyelevel
		}

		// ik modifier - seek some elevation on wall
		if(props.hasOwnProperty("wall")) {
			this.modifier_eyelevel = props.wall
		}

		// ik modifier - seek some elevation above ground
		if(props.hasOwnProperty("ground")) {
			this.modifier_ground = props.eyelevel
		}

		// ik modifier - billboard to face some angle with respect to a third party such as the user
		if(props.hasOwnProperty("billboard")) {
			this.modifier_billboard = props.eyelevel
		}

		// ik modifier - be in some position relative to a user - like in front of user
		if(props.hasOwnProperty("tagalong")) {
			this.modifier_tagalong = props.eyelevel
		}

		// TODO - NEAR, ABOVE, BELOW, INSIDE, BEHIND, FACING, STARE

	}

	///
	/// notice tick event and update kinetic physics
	///

	on_tick(args={}) {

		let blox = args.blox || 0

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Get out if no kinematics at all
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////

		if(!this.any_kinematics) return

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Evaluate Destinations which will compute an inverse kinematics style set of forces to apply to the object
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////

		if(this.inverse_kinematics) {
			let destiny = 0

			if(this.destination === "string") {
				let mesh = blox ? blox.query({name:this.destination,property:isObject3D}) : 0
				if(mesh) {
					destiny = mesh.position.clone()
				}
				// TODO deal with this.facing
			} else if(this.destination) {
				destiny = new THREE.Vector3(this.destination.x,this.destination.y,this.destination.z)
				// TODO deal with this.facing
			}

			// TODO - high level goal modifiers - modulate that destination or current position by any high level modifiers

			// TODO - inverse kinematics - figure out forces to go from current position to destination at current rate of movement
		}

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Given forces being applied - compute a total impulse to add - this is ignoring the time interval at this stage
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////

		let impulse = new THREE.Vector3(0,0,0)
		Object.entries(this.forces).forEach(([name,force])=>{
			impulse.x += force.x
			impulse.y += force.y
			impulse.z += force.z
		})

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Given an impulse, it has to be divided by the mass
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////

		let mass = this.mass ? this.mass : 1

		this.velocity.x += impulse.x / mass
		this.velocity.y += impulse.y / mass
		this.velocity.z += impulse.z / mass

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Dampen velocity by a universal friction
		// Given an impulse, it has to be divided by the temporal interval and it has to be divided by the mass
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////

		let universalFriction = this.friction ? this.friction : 0.9
		let lapsedTimeSlice = 60.0/1000.0 // TODO hack - assume 60fps

		this.velocity.x -= this.velocity.x * universalFriction * lapsedTimeSlice
		this.velocity.y -= this.velocity.y * universalFriction * lapsedTimeSlice
		this.velocity.z -= this.velocity.z * universalFriction * lapsedTimeSlice

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Move the object
		// TODO In a physics engine this would have to be solved forward at a small time step to deal with collisions
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////

		this.position.x += this.velocity.x * lapsedTimeSlice
		this.position.y += this.velocity.y * lapsedTimeSlice
		this.position.z += this.velocity.z * lapsedTimeSlice

		//////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// Copy position to mesh
		//////////////////////////////////////////////////////////////////////////////////////////////////////////////

		if(this.mesh) {
			this.mesh.position.set(this.position.x,this.position.y,this.position.z)
			this.mesh.quaternion.copy(this.quaternion)
		}
	}

	///
	/// Helper function
	///
	/// Directly impact this object with an instaneous impulse from behind
	/// Disable a concept of a destination if this is active since it fights with an idea of inverse kinematics
	/// All input forces are being delivered at some standard time rate assumption like 1 meter per second
	/// The system will convert that to the real time interval above
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

	on_goto(args) {
		this.destination = args.destination || 0
		this.inverse_kinematics = this.destination ? true : false
		// don't set any_kinematics because maybe the above fails and i don't want to make an object stop moving
	}

}






