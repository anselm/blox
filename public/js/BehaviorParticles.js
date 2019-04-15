
///
/// A rudimentary particle effects engine that acts on 3d geometries
///
/// There are other engines which act on points and exploit shaders - it may be worth migrating to one of those
///
/// https://github.com/a-jie/three.proton
/// https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/
///
///

///
/// Particle state tracking
///

class Particle {

	constructor(props,parentBehaviorMesh) {

		// re-instance and then somewhat manually associate the behavior with the threejs scene graph
		// TODO it would be nicer to create full blown blobs - it is a bit of a hack to clone behaviors
		this.mesh = new parentBehaviorMesh.constructor(parentBehaviorMesh.description,0)
		parentBehaviorMesh.add(this.mesh)

		this.reset(props)
	}

	reset(props) {
		// lifespan

		let longevity = props.longevity || { min:50, max:100 }
		this.life = this.lifestart = Math.random() * (longevity.max-longevity.min) + longevity.min

		// gravity dir

		this.gravity = props.gravity || new THREE.Vector3(0,-1,0)
		this.friction = props.friction || new THREE.Vector3(0.9,0.9,0.9)

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

		// pick a tumble orientation

		this.tumbleTime = 0

		// fiddle with scale and color - TODO later get from params
		{
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
			this.mesh.on_reset({description:modifiers})
		}


		// force tick it ahead to get the properties into the next refresh
		this.on_tick({interval:0})
	}

	on_tick(args) {

		// age
		if(this.life < 0) {
			this.mesh.visible = false
			this.mesh.position.set(0,0,0)
			return
		}
		this.life--

		// dampen current velocity and add forces
		let seconds = 0.001
		this.velocity.x = this.velocity.x * this.friction.x + this.gravity.x * seconds
		this.velocity.y = this.velocity.y * this.friction.y + this.gravity.y * seconds
		this.velocity.z = this.velocity.z * this.friction.z + this.gravity.z * seconds

		// update position by velocity
		this.position.x += this.velocity.x
		this.position.y += this.velocity.y
		this.position.z += this.velocity.z

		// move
		this.mesh.visible = true
		this.mesh.position.set(this.position.x,this.position.y,this.position.z)

		// tumble

		if(--this.tumbleTime<0 || !this.tumbleAxis) {
			this.tumbleTime = Math.floor(Math.random()*50)
			this.tumbleAxis = new THREE.Vector3(Math.random()*10,Math.random()*10,Math.random*10).normalize()
		}
		this.mesh.rotateOnAxis(this.tumbleAxis,0.1)

		// TODO opacity and color change
		//var colorHSL = this.colorTween.lerp( this.age );
		//this.color = new THREE.Color().setHSL( colorHSL.x, colorHSL.y, colorHSL.z );

		this.mesh.material.opacity = 1-(this.lifestart-this.life)/this.lifestart

	}

}

///
/// A behavior that adds particles
///
///

export class BehaviorParticles {
	constructor(props,blox) {
		this.props = props
		this.particles = []
		this.rateCount = 0
		this.mesh = blox.query({property:"isObject3D"})
		if(!this.mesh) {
			console.error("Particles need to act on a 3d example object")
			return
		}
		this.mesh.material.visible = false
	}
	on_tick(args) {
		if(!this.mesh) return

		// visit all particles
		let reusable = []
		let active = 0

		for(let i = 0;i<this.particles.length;i++) {

			// get a particle
			let particle = this.particles[i]

			// ignore if aged out
			if(particle.life<0) {
				particle.mesh.visible = false
				reusable.push(particle)
				continue
			}

			// update
			particle.on_tick(args)
			active++
		}

		// accumulate rate
		this.rateCount += this.props.rate

		let count = Math.floor(this.rateCount)

		// add rate number of more particles
		for(let i = 0; i < count; i++) {
			if(reusable.length) {
				let particle = reusable.shift()
				particle.reset(this.props)
			} else {
				if(this.particles.length >= this.props.quantity) return
				let particle = new Particle(this.props,this.mesh)
				this.particles.push(particle)
			}
			this.rateCount -=1
		}
	}
}

