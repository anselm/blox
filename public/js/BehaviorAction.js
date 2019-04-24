
// TODO I'd like to start importing 3js now instead of just assuming it is around
// import * as THREE from 'three';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
///	Decorates a blox with
///
///		position		alredy set from the mesh, can be changed here
///		velocity 		linear velocity in meters per second
///		linear			linear friction
///		impulse 		a convenience concept - linear impulse will be applied to velocity and cleared
///		forward_impulse	convenience
///
///		orientation		already set from the mesh can be changed here
///		rotation		rotational velcoity
///		angular			rotational friction
///
///		forces			a bucket of forces that are applied every frame and die off as per frictive forces
///		mass			used to divide the impact of an impulse
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

///		- a few other simple behaviors are tacked on here as well for convenience
///		- since this copies to the mesh it should be last in any sequence of behaviors that use the state here
///		- i decided to inject state into the parent blox so multiple behaviors can use it

export class BehaviorActionKinetic {

	constructor(args) {
		this.on_move({blox:args.blox})
	}

	on_move(args) {

		let blox = args.blox

		if(!blox.mesh || !blox.position || !blox.quaternion) {
			console.error("blox has no mesh")
			return
		}

		if(!blox.velocity || args.hasOwnProperty("reset")) {

			// position, velocity, and linear friction
			blox.velocity = new THREE.Vector3(0,0,0)
			blox.linear = 0.9
			blox.impulse = new THREE.Vector3(0,0,0) // impulse is just kept as a bridge between modules

			// orientation, rotation and angular friction
			blox.rotation = new THREE.Quaternion()
			blox.angular = 0.9

			// general kinetic forces
			blox.forces = {}
			blox.mass = 1.0
		}

		if(args.hasOwnProperty("position")) {
			if(typeof args.position === "string") {
				let obj = blox ? blox.query(args.position) : 0
				if(obj) {
					// set position and orientation from an object
					blox.position.copy(obj.mesh.position)
					blox.quaternion.copy(obj.mesh.quaternion)
				} else {
					console.error("Starting position object not found " + args.origin)
				}
			} else if(typeof args.position === "object" && args.position.hasOwnProperty("x")) {
				// set position from xyz
				blox.position.set(args.position.x,args.position.y,args.position.z)	
			} else {
				console.error("Bad arguments for position")
			}
		}

		if(args.hasOwnProperty("velocity")) {
			// linear velocity to be at
			if(typeof args.velocity === "object" && args.velocity.hasOwnProperty("x")) {
				blox.velocity.set(args.velocity.x,args.velocity.y,args.velocity.z)
			} else {
				blox.velocity.set(0,0,0)
			}
		}

		if(args.hasOwnProperty("linear")) {
			// linear friction multiplied against velocity
			blox.linear = parseFloat(args.linear)
		}

		if(args.impulse) {
			// convenience utility - absolute impulse
			blox.impulse.set(args.impulse.x,args.impulse.y,args.impulse.z)
		}

		if(args.forward_impulse) {
			// convenient utility - hit with an immediate impulse - TODO maybe remove
			blox.impulse.set(args.forward_impulse.x,args.forward_impulse.y,args.forward_impulse.z)
			blox.impulse.applyQuaternion( blox.quaternion )
		}

		if(args.hasOwnProperty("orientation")) {
			// orientation to be at
			let value = args.orientation
			let euler = new THREE.Euler(value.x * Math.PI/180.0, value.y * Math.PI/180.0, value.z * Math.PI/180.0 )
			blox.quaternion.setFromEuler(euler)
		}

		if(args.hasOwnProperty("rotation")) {
			// angular velocity to be at - TODO currently is hammering the orientation... not the right thing
			if(typeof args.rotation === "object" && args.rotation.hasOwnProperty("x")) {
				let value = args.rotation
				let e = new THREE.Euler(value.x * Math.PI/180.0, value.y * Math.PI/180.0, value.z * Math.PI/180.0 )
				let q = new THREE.Quaternion()
				q.setFromEuler(e)
				blox.quaternion.multiply(q)
			} else {
				args.rotation = 0
			}
		}

		if(args.hasOwnProperty("angular")) {
			// angular friction to be multiplied against rotation
			blox.angular = parseFloat(args.angular)
		}


		if(args.hasOwnProperty("gravity")) {
			// convenience concept
			blox.forces["gravity"] = new THREE.Vector3(args.gravity.x,args.gravity.y,args.gravity.z)
		}

		if(args.hasOwnProperty("mass")) {
			// mass to divide impulses by
			blox.mass = parseFloat(args.mass)
		}

	}

	on_tick(args) {

		let blox = args.blox

		if(!blox.mesh || !blox.position || !blox.quaternion) {
			console.error("blox has no mesh")
			return
		}

		let lapsedTimeSlice = 60.0/1000.0 // TODO hack - assume 60fps

		let impulse = blox.impulse

		if(blox.forces) {
			// add up linear impulse in meters per second ignoring mass and time slice
			// TODO right now forces are linear only
			Object.entries(blox.forces).forEach(([name,force])=>{
				impulse.x += force.x
				impulse.y += force.y
				impulse.z += force.z
			})
		}

		if(blox.mass && (impulse.x || impulse.y || impulse.z)) {
			// add linear impulse considering mass ignoring time slice
			blox.velocity.x += impulse.x / blox.mass
			blox.velocity.y += impulse.y / blox.mass
			blox.velocity.z += impulse.z / blox.mass
		}

		if(blox.linear) {
			// dampen linear velocity by friction over time slice
			blox.velocity.x -= blox.velocity.x * blox.linear * lapsedTimeSlice
			blox.velocity.y -= blox.velocity.y * blox.linear * lapsedTimeSlice
			blox.velocity.z -= blox.velocity.z * blox.linear * lapsedTimeSlice
		}

		if(blox.velocity.x || blox.velocity.y || blox.velocity.z) {
			// translate linear position based on linear velocity over time
			blox.position.x += blox.velocity.x * lapsedTimeSlice
			blox.position.y += blox.velocity.y * lapsedTimeSlice
			blox.position.z += blox.velocity.z * lapsedTimeSlice
		}

		if(blox.quaternion && blox.rotation) {
			// rotate current orientation by angular forces
			// TODO is not considering the angular friction over time
			// TODO angular forces are not damping - TODO maybe we should do these in euler space? also could test for 0
		//	this.quaternion.multiply(blox.rotation)
		}

		// clear the convenience impulse
		blox.impulse.set(0,0,0)
	}

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// Decorates a blox with
///
///		impulse 			strike the object along current heading with an impulse
///		target 				an target position that can be alive, a reference to a mesh position or just an xyz
///		height 				a height offset - later may support fancier offsets TODO
///		forward 			face forward along velocity vector?
///		faces 				face an absolute direction?
///		lookat 				look at a position? can be a live position as a reference to a mesh position
///
///		TODO
///		tbd - tween
///		tbd - tilt
///		tbd - offset richer offset concept
///
/// TODO needs to watch for object delete events to clear these live introspections
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class BehaviorActionTarget {

	on_move(args) {

		let blox = args.blox

		if(args.hasOwnProperty("reset")) {

			// some super powers that are simple enough to put here
			blox.target = 0	 // use physics to go to a target
			blox.height = 0		// amount to be above destination

			blox.forward = 0	// face forward in direction of travel
			blox.faces = 0		// use physics to face an absolute direction
			blox.lookat = 0		// look at something
		}

		if(args.hasOwnProperty("target")) {
			// ik - try end up at this target
			if(typeof args.target === "string") {
				let obj = blox ? blox.query(args.target) : 0
				if(obj) {
					// set target from an object - NOTE this live updates because it is a reference
					blox.target_obj = obj
					blox.target = obj.mesh.position
				} else {
					console.error("Target object not found " + args.origin)
				}
			} else if(typeof args.target === "object" && args.target.hasOwnProperty("x")) {
				// set target from xyz but don't set direction facing - do that separately
				blox.target_obj = 0
				blox.target = new THREE.Vector3(args.target.x,args.target.y,args.target.z)
			} else {
				blox.target_obj = 0
				blox.target = 0
			}
		}

		if(args.hasOwnProperty("height")) {
			// ik - height displacement modifier
			blox.height = parseFloat(args.height)
		}

		if(args.hasOwnProperty("forward")) {
			// ik - turn face forward off or on
			blox.forward = args.forward
		}

		// TODO faces is not very useful
		if(args.hasOwnProperty("faces")) {
			if(typeof args.faces === "string") {
				// face the same way an object is facing
				let obj = blox ? blox.query(args.faces) : 0
				if(obj) {
					blox.faces = obj.mesh.quaternion
				}
			} else if(typeof args.faces === "object" && args.faces.hasOwnProperty("x")) {
				// faces absolute orientation
				let value = args.faces
				let euler = new THREE.Euler(value.x * Math.PI/180.0, value.y * Math.PI/180.0, value.z * Math.PI/180.0 )
				blox.faces = new THREE.Quaternion()
				blox.faces.setFromEuler(euler)
			} else {
				blox.faces = 0
			}
		}

		if(args.hasOwnProperty("lookat")) {
			// ik - set a lookat target
			if(typeof args.lookat === "string") {
				// an object to face - NOTE this live updates because it is a reference
				let obj = blox ? blox.query(args.target) : 0
				blox.lookat_obj = obj
				blox.lookat = obj.mesh.position
			} else if(typeof args.lookat === "object" && args.lookat.hasOwnProperty("x")) {
				// look at absolute position
				blox.lookat_obj = 0
				blox.lookat = new THREE.Vector3(args.lookat.x,args.lookat.y,args.lookat.z)
			} else {
				blox.lookat_obj = 0
				blox.lookat = 0
			}
		}


	}

	on_tick(args) {

		let blox = args.blox

		let lapsedTimeSlice = 60.0/1000.0 // TODO hack - assume 60fps

		if(blox.target && blox.position) {
			// add a instantaneous impulse to pursue a target (this is before any mass considerations or timing slices)
			let y = blox.height || 0 // a bit of a hack, stick in height offset modifier right now
			blox.impulse.x += (blox.target.x + 0 - blox.position.x) / 20 // TODO 20 is a hack, need to correctly compute force to apply
			blox.impulse.y += (blox.target.y + y - blox.position.y) / 20
			blox.impulse.z += (blox.target.z + 0 - blox.position.z) / 20
		}

		if(blox.forward) {
			// TODO should do it with forces not by hammering direction on the orientation
			// face forward stay upright
			let dir = new THREE.Vector3(-blox.velocity.x,0,-blox.velocity.z).normalize()
			var mx = new THREE.Matrix4().lookAt(dir,new THREE.Vector3(0,0,0),new THREE.Vector3(0,1,0))
			let q = new THREE.Quaternion().setFromRotationMatrix(mx)
			blox.quaternion.rotateTowards(q,lapsedTimeSlice)
		}

	}

}


/*
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// Set a nozzle exhaust position, velocity and direction
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class EffectNozzle {

	update(args) {

		if(!args) return

if not at time zero or if latched


		this.gravity = props.gravity || new THREE.Vector3(0,-1,0)
		this.linear = proxxx || new THREE.Vector3(0.9,0.9,0.9)

		// starting radius cloud

		let offset = props.offset || {x:0,y:0,z:0}
		let radius = props.radius || 1

		this.position = new THREE.Vector3(
			offset.x + Math.random() * radius,
			offset.y + Math.random() * radius,
			offset.z + Math.random() * radius
			)


		// starting radius cloud

		let offset = props.offset || {x:0,y:0,z:0}
		let radius = props.radius || 1

		this.position = new THREE.Vector3(
			offset.x + Math.random() * radius,
			offset.y + Math.random() * radius,
			offset.z + Math.random() * radius
			)

		// starting force direction

		let speed = Math.random() * ( props.speed.max - props.speed.min ) + props.speed.min

		let nozzle = props.nozzle || {axis1:-10,axis2:10,spin1:0,spin2:360}

		// get vector pointing up of the speed we want
		let v = new THREE.Vector3(0,1*speed,0)
		// get angle on z to rotate that by - a small range would be a small declination
		let a = (Math.random()*(nozzle.axis2-nozzle.axis1)+nozzle.axis1)
		// rotate it by that much
		v.applyAxisAngle(new THREE.Vector3(0,0,1),a*Math.PI/180)
		// now take the result and sweep it around the vertical spin axis
		let b = (Math.random()*(nozzle.spin2-nozzle.spin1)+nozzle.spin1)
		v.applyAxisAngle(new THREE.Vector3(0,1,0),b*Math.PI/180)
		this.velocity = v
	}

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// Lifespan
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class EffectLifespan {

	update(args) {

		// set new lifespan if any
		if(args && args.hasOwnProperty(args.lifespan)) {
			if(typeof args.lifespan !== "object") {
				this.life = parseInt(args.lifespan)
			} else if(args.lifespan.hasOwnProperty("min") && args.lifespan.hasOwnProperty("max")) {
				this.life = Math.random() * (args.lifespan.max-args.lifespan.min) + args.lifespan.min
			} else {
				this.life = 0
			}
		}

		// count down
		if(!this.life) return
		this.life--
		if(this.life) return
		args.blox.mesh.visible = false
		args.blox.mesh.position.set(0,0,0)
		// - reset?
	}

	update() {
		// lifespan
	}
}


	list.push(new EffectLifespan())
	element.update(args)


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
///
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class EffectPlayer {
	/// rules like "hide behind" use the player
	effect_player(args) {
		if(args) {
			// initialize
			this.player = 0
			if(args.hasOwnProperty("player")) {
				this.player = blox ? blox.query(args.player) : 0
			}
		}
		else if(this.player) {
			// update
		}
	}
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
///
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class EffectTumble {
	effect_tumble() {
		// pick a tumble orientation

		this.tumbleTime = 0

		// tumble

		if(--this.tumbleTime<0 || !this.tumbleAxis) {
			this.tumbleTime = Math.floor(Math.random()*50)
			this.tumbleAxis = new THREE.Vector3(Math.random()*10,Math.random()*10,Math.random*10).normalize()
		}
		this.mesh.rotateOnAxis(this.tumbleAxis,0.1)

	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// ik
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

		this.modifier_eyelevel = 0
		this.modifier_ground = 0
		this.modifier_wall = 0
		this.modifier_billboard = 0
		this.modifier_tagalong = 0

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


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// color
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class EffectColor {


	effect_color() {
		// fiddle with scale and color - TODO later get from params
		let r = Math.floor(Math.random()*100 + 135)
		let g = Math.floor(Math.random()*100 + 19)
		let b = Math.floor(Math.random()*100 + 101)
		let c = r *65536 + g * 256 + b
		let s = Math.random() + 1
		// build up properties to write
		let modifiers = {
			art:"ignore",
			color:c,
			scale:{ x:s, y:s, z:s },
			doublesided:1,
			transparent:1,
		}
		// modify the mesh
		this.blox.mesh.on_reset({description:modifiers})
	}

}
*/

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
///
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class BehaviorAction {

	constructor(args) {

		args.blox.add("actionTarget")		// modify forces by targets
		args.blox.add("actionKinetic")		// add up forces and apply to actual mesh position

		// save script if any
		if(args.description && args.description instanceof Array) {
			this.timer_offset = -1
			this.counter = 0
			this.script = args.description
		} else {
			// handle single arg todo
		}

	}

	///
	/// notice tick event and update
	///

	on_tick(args) {

		if(this.timer_offset == -1) this.timer_offset = args.interval

		for(;this.script && this.counter < this.script.length; this.counter++) {
			let s = this.script[this.counter]
			if(args.interval < this.timer_offset + s.time) return
			s.name = "on_move"
			args.blox.on_event(s)
			if(this.counter >= this.script.length-1) {
				this.timer_offset = -1
				this.counter = 0
				break
			}
		}

	}

}

// TODO get rid of behavior particles by adding lifespan, tumble and color and fade and nozzle to this

