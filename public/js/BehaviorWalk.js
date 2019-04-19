
///
/// Associates keyboard control with a mesh
///
/// Typically I expect the user to add a camera nearby
///

export class BehaviorWalk {

	constructor(args) {
		let props = args.description
		let blox = args.blox

		this.parentBehavior = blox.query({property:"isObject3D"})
		if(!this.parentBehavior) {
			console.error("There needs to be some mesh associated with this behavior")
			return
		}

		this.camera = blox.query({property:"isPerspectiveCamera"})
		if(!this.camera) {
			console.error("No camera found")
		}

		this.props = props
		this.blox = blox
		this.forward = new THREE.Vector3(0,0,1)
		this.backward = new THREE.Vector3(0,0,-1)
		this.left = new THREE.Euler(0,10*Math.PI/180.0,0)
		this.right = new THREE.Euler(0,-10*Math.PI/180.0,0)
		document.addEventListener("keydown", this.onKeyDown.bind(this), false)
	}

	onKeyDown(event) {
		let blox = this.blox
		if(!blox || !blox.intent) {
			console.error("Needs a mesh")
			return
		}
		let mesh = this.parentBehavior
	    switch(event.key) {
	    	case 'w': // up
	    		blox.intent.on_impulse({linear:this.forward,angular:0})
	    		break
	    	case 's': // down
	    		blox.intent.on_impulse({linear:this.backward,angular:0})
	    		break
	    	case 'a': // left
	    		blox.intent.on_impulse({linear:0,angular:this.left})
	    		break
	    	case 'd': // right
	    		blox.intent.on_impulse({linear:0,angular:this.right})
	    		break
	    	case 32: // space
	    		blox.intent.on_reset({})
	    		break
	    }
	}

	on_tick(args) {

		if(!this.camera) return

		let xrmode = typeof window.webkit !== 'undefined'

// TODO TESTING XR - IMPROVE
		// if in vr mode then move camera to us
		if(!xrmode) {
			let mesh = this.parentBehavior
//			this.material.visible = false
//			this.visible = false
			// find a position behind the object
			let v = new THREE.Vector3(0,3,-10)
			v.applyMatrix4(mesh.matrixWorld)
			this.camera.position.set(v.x,v.y,v.z)
			// look at the target
			this.camera.lookAt(mesh.position)
		} else {
			// move this to the camera TODO TBD
		}
	}
}

