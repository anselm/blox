
///
/// Associates keyboard control with a mesh
///

export class BehaviorWalk {

	constructor(args) {
		document.addEventListener("keydown", this.onKeyDown.bind(this), false)

		// kind of a hack - look for the camera
		this.camera = args.blox.parent.renderer.camera // query({property:"isPerspectiveCamera"})
		this.mesh = args.blox.query({instance:THREE.Object3D})
	}

	onKeyDown(event) {
		let blox = this.blox
		if(!blox || !blox.actionKinetic) {
			console.error("Needs BehaviorAction")
			return
		}
	    switch(event.key) {
	    	case 'w': // up
	    		blox.on_event({name:"on_move",forward_impulse:{x:0,y:0,z:1}}) // TODO support blox.on_move
	    		break
	    	case 's': // down
	    		blox.on_event({name:"on_move",forward_impulse:{x:0,y:0,z:-1}})
	    		break
	    	case 'a': // left
	    		blox.on_event({name:"on_move",rotation:{x:0,y:100*Math.PI/180.0,z:0}})
	    		break
	    	case 'd': // right
	    		blox.on_event({name:"on_move",rotation:{x:0,y:-100*Math.PI/180.0,z:0}})
	    		break
	    	case 32: // space
	    		blox.on_event({name:"on_move",reset:1})
	    		break
	    }
	}

	on_tick(args) {

		// hack if in xr mode just get out
		let xrmode = typeof window.webkit !== 'undefined'
		if(xrmode) return true

		if(!this.camera || !this.mesh) {
			console.error("Needs its own camera and mesh for now")
		}

		//this.material.visible = false
		//this.visible = false
		// find a position behind the object
		let v = new THREE.Vector3(0,3,-10)
		v.applyMatrix4(this.mesh.matrixWorld)
		this.camera.position.set(v.x,v.y,v.z)
		// look at the target
		this.camera.lookAt(this.mesh.position)
		return true // allow event to be passed onwards
	}
}

