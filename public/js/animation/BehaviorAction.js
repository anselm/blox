
// TODO I'd like to start importing 3js now instead of just assuming it is around
// import * as THREE from 'three';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// Basic motion concepts
///
/// Since this modifies position and quaternion - it should typically be run last in a set of behaviors
/// Also since it decorates the blox with features - implicitly these become reserved words... worth revisiting the approach
///
///	Decorates a blox with
///
///		position		(alredy set can be changed here)
///		velocity 		linear velocity in meters per second
///		linear			linear friction
///
///		orientation		already set can be changed here
///		rotation		rotational velcoity
///		angular			rotational friction
///
///		forces			a bucket of forces that are applied every frame
///		mass			used to divide the impact of an impulse
///
/// Extra commands
///
///		reset 			go back to a rest state
///		disperse		an area to be distributed over (randomizes position in an area)
///		nozzle			randomizes velocity in a spray area
///		impulse 		a convenience concept - linear impulse will be applied to velocity and cleared TODO may remove
///		forward_impulse	convenience TODO may remove (is already consolidated above in forces)
///
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class BehaviorActionKinetic {

	constructor(props) {

		// remember original pose
		if(props.blox) {
			this.original_position = props.blox.position.clone()
			this.original_quaternion = props.blox.quaternion.clone()
		}

		this.on_reset(props)
	}

	on_move(props) {
		this.on_reset({blox:this.blox,description:props})
	}

	on_reset(props) {

		let args = props.description || this.description
		let blox = props.blox

		if(!blox.position || !blox.quaternion) {
			console.error("blox has no position")
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

		// move to a place
		if(args.hasOwnProperty("position")) {
			if(typeof args.position === "string") {
				let obj = blox ? blox.query(args.position) : 0
				if(obj) {
					// set position and orientation from an object
					blox.position.copy(obj.position)
					blox.quaternion.copy(obj.quaternion)
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


		if(args.hasOwnProperty("force")) {
			if(!args.force.name) console.error("forces need names")
			blox.forces[args.force.name] = args.force
		}

		if(args.hasOwnProperty("mass")) {
			// mass to divide impulses by
			blox.mass = parseFloat(args.mass)
		}

		//////////////////////////////////////////////////////////////////////////////////////////
		// bonus powers
		//////////////////////////////////////////////////////////////////////////////////////////

		if(args.impulse) {
			// convenience utility - absolute impulse -TODO may remove
			blox.impulse.set(args.impulse.x,args.impulse.y,args.impulse.z)
		}

		if(args.forward_impulse) {
			// convenient utility - hit with an immediate impulse - TODO maybe remove
			blox.impulse.set(args.forward_impulse.x,args.forward_impulse.y,args.forward_impulse.z)
			blox.impulse.applyQuaternion( blox.quaternion )
		}


		// disperse object over an area (usually applied after positioning)
		if(args.hasOwnProperty("disperse")) {

			// TODO this needs to be parameterized
			let offset = args.disperse.offset || {x:0,y:0,z:0}
			let radius = args.disperse.radius || 10

			blox.position.set(
				blox.position.x + offset.x + Math.random() * radius - radius/2,
				blox.position.y + offset.y + Math.random() * radius - radius/2,
				blox.position.z + offset.z + Math.random() * radius - radius/2
				)

		}

		if(args.hasOwnProperty("nozzle")) {
			// nozzle modifier to velocity - TBD 
			let speed = Math.random() * ( args.speed.max - args.speed.min ) + args.speed.min
			let nozzle = args.nozzle || {axis1:-10,axis2:10,spin1:0,spin2:360}
			// get vector pointing up of the speed we want
			let v = new THREE.Vector3(0,1*speed,0)
			// get angle on z to rotate that by - a small range would be a small declination
			let a = (Math.random()*(nozzle.axis2-nozzle.axis1)+nozzle.axis1)
			// rotate it by that much
			v.applyAxisAngle(new THREE.Vector3(0,0,1),a*Math.PI/180)
			// now take the result and sweep it around the vertical spin axis
			let b = (Math.random()*(nozzle.spin2-nozzle.spin1)+nozzle.spin1)
			v.applyAxisAngle(new THREE.Vector3(0,1,0),b*Math.PI/180)
			blox.velocity = v
		}

	}

	on_tick(args) {

		let blox = args.blox

		if(!blox.position || !blox.quaternion) {
			console.error("blox has no position")
			return
		}

		let lapsedTimeSlice = 60.0/1000.0 // TODO hack - assume 60fps

		let impulse = blox.impulse

		if(blox.forces) {
			// adds up linear impulses in meters per second ignoring mass and time slice
			// TODO right now forces are linear only - should be able to apply angular forces also
			// TODO support force friction
			// TODO support relative force aligned with heading
			Object.entries(blox.forces).forEach(([name,force])=>{
				impulse.x += force.x
				impulse.y += force.y
				impulse.z += force.z
				if(force.impulse) delete blox.forces[name] // hopefully this won't crash
				// TODO support force based friction that dampens out a force
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
/// Intelligent direction motion concepts
///
/// Decorates a blox with
///
///		impulse 			strike the object along current heading with an impulse TODO this is now kinda obsolete
///		target 				an target position that can be alive, a reference to a position or just an xyz
///		height 				a height offset - later may support fancier offsets TODO
///		forward 			face forward along velocity vector?
///		faces 				face an absolute direction?
///		lookat 				look at a position? can be a live position as a reference to a position
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

	constructor(props) {
		// relies on features of BehaviorActionKinetic but since that is not loaded yet... don't do any init...
		// it's worth studying if this is a good approach (implicit relationships between action behaviors) TODO
		this.on_reset(props)
	}

	on_reset(props) {

		let args = props.description || this.description
		let blox = props.blox

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
					blox.target = obj.position
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
					blox.faces = obj.quaternion
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
				blox.lookat = obj.position
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// Lifespan
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class BehaviorActionLifespan {

	constructor(props) {
		this.on_reset(props)
	}

	on_reset(props) {
		let args = props.description || this.description
		let blox = props.blox
		if(args && args.hasOwnProperty("lifespan")) {
			this.move_event = args // test idea
			if(typeof args.lifespan !== "object") {
				this.lifestart = this.life = parseInt(args.lifespan)
			} else if(args.lifespan.hasOwnProperty("min") && args.lifespan.hasOwnProperty("max")) {
				this.lifestart = this.life = Math.floor( Math.random() * (args.lifespan.max-args.lifespan.min) + args.lifespan.min )
			} else {
				this.life = 0
			}
		}
	}

	on_tick(args) {

		// count down
		if(!this.life) return
		this.life--

		let blox = args.blox

		// play with scale TODO move to a more controlled place
		let s = Math.random() + 1
		blox.mesh.scale.set(s,s,s)

		// play with color TODO parameterize and move to more controlled place
		{
			let r = Math.floor(Math.random()*100 + 135)
			let g = Math.floor(Math.random()*100 + 19)
			let b = Math.floor(Math.random()*100 + 101)
			let c = r *65536 + g * 256 + b
			blox.mesh.material.color.setHex( c )
		}
		//var colorHSL = this.colorTween.lerp( this.age );
		//this.color = new THREE.Color().setHSL( colorHSL.x, colorHSL.y, colorHSL.z );

		// play with opacity TODO make optional
		args.blox.mesh.material.opacity = 1-(this.lifestart-this.life)/this.lifestart

		// trying an idea of refiring the event that set the lifespan - ponder this approach TODO
		if(this.life) return

		// try just reset all?
		args.blox.on_event({name:"on_reset"})

		// TODO introduce an idea of dying once lifespan is over
	}

}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// tumble
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class BehaviorActionTumble {

	constructor(props) {
		this.on_reset(props)
	}

	on_reset(props) {
		let args = props.description || this.description
		let blox = props.blox
		if(args && args.hasOwnProperty("tumble")) {
			this.tumble = args.tumble
			this.tumbleTime = 0
		}
	}

	on_tick(args) {
		if(!this.tumble)return
		if(--this.tumbleTime<0) {
			this.tumbleTime = Math.floor(Math.random()*50)
			this.tumbleAxis = new THREE.Vector3(Math.random()*10,Math.random()*10,Math.random*10).normalize()
		}
		args.blox.mesh.rotateOnAxis(this.tumbleAxis,0.1)
	}
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// Hiding TODO TBD
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
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
*/

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// More IK TODO TBD
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
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

*/

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
///
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class BehaviorAction {

	constructor(props) {

		let blox = props.blox

		// reset program script counters
		this.timer_offset = -1
		this.counter = 0
		this.script = 0

		// save script if any or run one command now
		if(props.description && props.description instanceof Array) {
			this.script = props.description
		} else if(typeof props.description === "object") {
			Object.entries(props.description).forEach(([label,description])=>{
				blox.add({label:label,description:description})
			})
		}

	}

	///
	/// notice tick event and update
	/// 	TODO revise the scripts to declare which behavior they are leaning on
	///			and call the on_reset of those, or let blox do that work

	on_tick(args) {

		if(this.timer_offset == -1) this.timer_offset = args.interval

		for(;this.script && this.counter < this.script.length; this.counter++) {

			// reached next action in array?
			let action = this.script[this.counter]
			if(args.interval < this.timer_offset + action.time) return

			// perform action
			Object.entries(action).forEach(([label,description])=>{
				if(label != "time") {
					args.blox.add({label:label,description:description})
				}
			})

			// go back to start?
			if(this.counter >= this.script.length-1) {
				this.timer_offset = -1
				this.counter = 0
				break
			}
		}

	}

}


