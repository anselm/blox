
// TODO I'd like to start importing 3js now instead of just assuming it is around
// import * as THREE from 'three';

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// This class provides basic kinetic motion, velocity, forces, instant impulses, friction... but does not provide collision.
///
/// As a design principle behaviormesh has already added position and orientation into the blox as blox.position etc.
/// And this class then adds some more fields globally - so that a series of actions can work together nicely.
/// All the variables it adds to global scope effectively become reserved - it's worth re-examining that philosophy.
/// Also this class should be last in a sequence so that the on_tick() method updates the real position last from all other forces
///
///	It decorates a blox with these new variables:
///
///		velocity 		linear velocity in meters per second
///		linear			linear friction
///
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
		if(props.blox && props.blox.position && props.blox.quaternion) {
			this.original_position = props.blox.position.clone()
			this.original_quaternion = props.blox.quaternion.clone()
		} else {
			console.error("This blox needs a mesh attached to it prior to attaching this behavior")
		}

		this.on_reset(props)
	}

	on_move(props) {
		// TODO - behavior walk uses this - later just have it send impulses via reset
		this.on_reset({blox:this.blox,description:props})
		return true
	}

	on_reset(props) {

		let args = props.description || this.description
		let blox = props.blox

		if(!blox.position || !blox.quaternion) {
			console.error("blox has no position yet")
			return true
		}

		if(!blox.velocity || args.hasOwnProperty("reset")) {

			// position, velocity, and linear friction
			blox.velocity = new THREE.Vector3(0,0,0)
			blox.linear = 0.9
			blox.impulse = new THREE.Vector3(0,0,0) // impulse is just kept as a bridge between modules

			// orientation, rotation and angular friction
			blox.rotation = new THREE.Quaternion()
			blox.angular = 0.95

			// general kinetic forces
			blox.forces = {}
			blox.mass = 1.0
		}

		if(args.hasOwnProperty("position")) {
			// be instantly to be at a given xyz or another entity by name
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
			// linear velocity to be at right now instantaneously
			if(typeof args.velocity === "object" && args.velocity.hasOwnProperty("x")) {
				blox.velocity.set(args.velocity.x,args.velocity.y,args.velocity.z)
			} else {
				blox.velocity.set(0,0,0)
			}
		}

		if(args.hasOwnProperty("linear")) {
			// linear friction multiplied against velocity to use to dampen velocity in general
			blox.linear = parseFloat(args.linear)
		}

		if(args.hasOwnProperty("orientation")) {
			// orientation to be at right now instantaneously
			let value = args.orientation
			let euler = new THREE.Euler(value.x * Math.PI/180.0, value.y * Math.PI/180.0, value.z * Math.PI/180.0 )
			blox.quaternion.setFromEuler(euler)
		}

		if(args.hasOwnProperty("rotation")) {
			// angular velocity to be at
			// TODO currently is hammering the orientation... not the right thing
			// TODO actually just revise this to do this in the update loop
			// TODO I'm leaning more towards storing angular forces as euler
			if(typeof args.rotation === "object" && args.rotation.hasOwnProperty("x")) {
				let value = args.rotation
				let e = new THREE.Euler(value.x * Math.PI/180.0, value.y * Math.PI/180.0, value.z * Math.PI/180.0 )
				let q = new THREE.Quaternion()
				q.setFromEuler(e)
				blox.original_rotation_euler = e
				blox.rotation = q
			} else {
				blox.rotation = 0
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
			// convenience utility - a one frame impulse to apply to velocity on the next frame - TODO may remove... this is just an idea
			blox.impulse.set(args.impulse.x,args.impulse.y,args.impulse.z)
		}

		if(args.forward_impulse) {
			// convenient utility apply impulse forward - TODO maybe remove? again just an idea
			blox.impulse.set(args.forward_impulse.x,args.forward_impulse.y,args.forward_impulse.z)
			blox.impulse.applyQuaternion( blox.quaternion )
		}


		// disperse object over an area - set xyz to something random in area (must be applied after positioning)
		if(args.hasOwnProperty("disperse")) {

			// TODO this needs to be parameterized
			let offset = args.disperse.offset || {x:0,y:0,z:0}
			let radius = args.disperse.radius || {x:0,y:0,z:0}

			blox.position.set(
				blox.position.x + offset.x + (Math.random() - 0.5) * radius.x,
				blox.position.y + offset.y + (Math.random() - 0.5) * radius.y,
				blox.position.z + offset.z + (Math.random() - 0.5) * radius.z
				)
		}

		if(args.hasOwnProperty("nozzle")) { // TODO needs testing
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

		if(args.lookat)

		return true
	}

	on_tick(args) {

		let blox = args.blox

		if(!blox.position || !blox.quaternion) {
			console.error("blox has no position")
			return true
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

		// clear the convenience impulse
		blox.impulse.set(0,0,0)

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
			blox.quaternion.multiply(blox.rotation)

			if(blox.original_rotation_euler && blox.angular) {
				let e = blox.original_rotation_euler
				e._x = e._x * blox.angular
				e._y = e._y * blox.angular
				e._z = e._z * blox.angular
				blox.rotation.setFromEuler(e)
			}

		}

		return true
	}

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// This class adds intentional motion such as 'go to a place' or 'be at eye level'
///
/// Decorates a blox with
///
///		target 				an target position that can be alive, a reference to a position or just an xyz
///		height 				a height offset - later may support fancier offsets TODO
///		forward 			face forward along velocity vector?
///		faces 				face an absolute direction? this can be used to billboard also (if the observer is the target)
///		lookat 				look at a position? can be a live position as a reference to a position
///		infrontof			be in front of something, this can be for tagalong for now (if the observer is the target)
///
///		TODO
///				- linear tweening rather than using forces
///				- wobble and tilt for some fun stylistic powers
///				- stick to a wall or other surface
///				- behind (fairly complex because it requires knowing about the user)
///				- be near
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

		if(!blox || !blox.mesh) {
			console.error("needs a mesh")
			return true
		}

		if(args.hasOwnProperty("reset")) {

			blox.target = 0		// use physics to go to a target
			blox.height = 0		// amount to be above target
			blox.infrontof = 0	// how far to be in front of target
			blox.forward = 0	// face forward in direction of travel?
			blox.lookat = 0		// look at target?
			//blox.faces = 0		// use physics to face an absolute direction
		}

		if(args.hasOwnProperty("target")) {
			// set a target entity or point
			if(typeof args.target === "string") {
				blox.target = blox.query(args.target)
			} else if(typeof args.target === "object" && args.target.hasOwnProperty("x")) {
				blox.target = new THREE.Vector3(args.target.x,args.target.y,args.target.z)
			} else {
				blox.target = 0
			}
		}

		if(args.hasOwnProperty("height")) {
			// set height target
			blox.height = parseFloat(args.height)
		}

		if(args.hasOwnProperty("infrontof")) {
			if(!blox.target.quaternion) {
				console.log("target must be an object not a point")
				blox.infrontof = 0
			} else {
				blox.infrontof = args.infrontof
			}
		}

		if(args.hasOwnProperty("forward")) {
			// ik - turn face forward off or on
			blox.forward = args.forward
		}

		if(args.hasOwnProperty("lookat")) {
			// set a lookat target
			if(typeof args.lookat === "string") {
				blox.lookat = blox.query(args.lookat)
			} else if(typeof args.lookat === "object" && args.lookat.hasOwnProperty("x")) {
				blox.lookat = new THREE.Vector3(args.lookat.x,args.lookat.y,args.lookat.z)
			} else {
				blox.lookat = 0
			}
		}


/*
		// TODO faces is not very useful - remove? or possibly subsume into base class where position/orientation can be from some other obj
		// TODO it might be nice to have a wobble concept, to end up say akuakuing
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
*/


/*
		if(args.hasOwnProperty("ground")) {
			if(!blox.raycaster) blox.raycaster = new THREE.RayCaster()
			// start at self
			let src = new THREE.Vector3(blox.position.x,blox.position.y,blox.position.z)
			// aim down
			let dir = new THREE.Vector3(0,-1,0)
			raycaster.set(src,dir)
			// TODO need a better scene mechanism
			var intersects = raycaster.intersectObjects( blox.parent.scene.children )

// get to bottom of me

			if(intersects.length) {
				let obj = intersects[ 0 ]
				obj.material.color.set( 0xff0000 )
				if(obj.uuid == blox.mesh) continue
				// take highest
				if(obj.position.y > h) h = obj.position.y
			}
			// get bounds
			const box = new THREE.Box3().setFromObject(mesh);
const center = box.getCenter(new THREE.Vector3());

			// either be at height height above ground or at ground
			blox.height = blox.height ? blox.height + y : y
			// TODO need to add bounding box
		}
*/
		return true
	}

	on_tick(args) {

		let blox = args.blox
		if(!blox.position || !blox.quaternion || !blox.impulse) {
			console.error("This blox needs to be decorated with a Mesh and a KineticAction")
			return true
		}

		let lapsedTimeSlice = 60.0/1000.0 // TODO hack - assume 60fps - use supplied please

		if(blox.target) {

			let pos = blox.target.hasOwnProperty("x") ? blox.target : blox.target.position
			if(!pos) {
				console.error("illegal position")
				return true
			}

			// add a instantaneous impulse to pursue a target (this is before any mass considerations or timing slices)
			let vec = new THREE.Vector3(0,0,0)

			if(blox.hasOwnProperty("infrontof")) {
				// be in front of - but do not change current height whatever it is
				let dist = blox.infrontof || 2
				vec = new THREE.Vector3( 0, 0, dist )
				vec.applyQuaternion( blox.target.quaternion )
				vec.y = blox.position.y
			}

			if(blox.hasOwnProperty("height")) {
				// if height is specified then pursue that absolute height; ground is always arranged to be at 0
				vec.y = blox.height || 0
			}

			// TODO 20 is a hack, need to correctly compute force to apply - right now it overshoots!
			// the way to compute this is probably something like looking at the distance remaining and computing exact force to cover it
			// it is probably ok to accelerate hard early but as we get close to counter accelerate
			let rate = 20

			// adjust impulses to go there
			blox.impulse.x += (pos.x + vec.x - blox.position.x) / rate
			blox.impulse.y += (pos.y + vec.y - blox.position.y) / rate
			blox.impulse.z += (pos.z + vec.z - blox.position.z) / rate
		}

		if(blox.forward) {
			// orient forward
			// TODO should do it with forces not by hammering direction on the orientation
			let dir = new THREE.Vector3(blox.velocity.x,0,blox.velocity.z).normalize()
			var mx = new THREE.Matrix4().lookAt(new THREE.Vector3(),dir,new THREE.Vector3(0,1,0))
			let q = new THREE.Quaternion().setFromRotationMatrix(mx)
			blox.quaternion.rotateTowards(q,lapsedTimeSlice)
		}

		if(blox.lookat) {
			// orient to face something that may itself be moving
			let pos = blox.lookat.hasOwnProperty("x") ? blox.lookat : blox.lookat.position
			var mx = new THREE.Matrix4().lookAt(blox.position,pos,new THREE.Vector3(0,1,0))
			let quat = new THREE.Quaternion().setFromRotationMatrix(mx)
			blox.quaternion.rotateTowards(quat,lapsedTimeSlice)
		}

		return true
	}

}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// Lifespan
///
/// Also adds scale and color and alpha transparency over lifespan since these are commonly associated
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
		return true // allow event to be passed onwards
	}

	on_tick(args) {

		// count down
		if(!this.life) return true
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
		if(this.life) return true

		// try just reset all?
		args.blox.on_event({name:"on_reset"})

		// TODO introduce an idea of dying forever once lifespan is over
		return true // allow event to be passed onwards
	}

}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// tumble - a random tumble behavior
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
		return true
	}

	on_tick(args) {
		if(!this.tumble)return true
		if(--this.tumbleTime<0) {
			this.tumbleTime = Math.floor(Math.random()*50)
			this.tumbleAxis = new THREE.Vector3(Math.random()*10,Math.random()*10,Math.random*10).normalize()
		}
		args.blox.mesh.rotateOnAxis(this.tumbleAxis,0.1)
		return true
	}
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// Lightweight internal scripting over time - simply attaches behaviors to an object over time - loops right now
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class BehaviorAction {

	constructor(props) {

		let blox = props.blox

		// reset program script counters
		this.timer_offset = -1
		this.counter = 0
		this.script = 0
		this.script = props.description
	}

	///
	/// notice tick event and update
	/// 	TODO revise the scripts to declare which behavior they are leaning on
	///			and call the on_reset of those, or let blox do that work

	on_tick(args) {

		if(this.timer_offset == -1) this.timer_offset = args.interval

		for(;this.script && this.counter < this.script.length; this.counter++) {

			// get next action
			let action = this.script[this.counter]

			// is it time for the action?
			if(args.interval < this.timer_offset + action.time) return true

			// perform action
			// TODO could even add some conditionals etc (less critical)
			Object.entries(action).forEach(([label,description])=>{
				if(label == "time") return // this slot is just the time we are at - don't run it as a command
				args.blox.addCapability({label:label,description:description}) // but run everything else
			})

			// go back to start? TODO later consider just stopping
			if(this.counter >= this.script.length-1) {
				this.timer_offset = -1
				this.counter = 0
				break
			}
		}

		return true
	}

}


