
///
/// Associates keyboard control with a mesh
///
/// Typically I expect the user to add a camera nearby
///

export class BehaviorWalk {

	constructor(args) {
		document.addEventListener("keydown", this.onKeyDown.bind(this), false)
	}

	onKeyDown(event) {
		let blox = this.blox
		if(!blox || !blox.action) {
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

		let blox = args.blox

		if(!blox.camera || !blox.mesh) {
			console.error("Needs its own camera and mesh for now")
		}

		let xrmode = typeof window.webkit !== 'undefined'

// TODO TESTING XR - IMPROVE
		// if in vr mode then move camera to us
		if(!xrmode) {
//			this.material.visible = false
//			this.visible = false
			// find a position behind the object
			let v = new THREE.Vector3(0,3,-10)
			v.applyMatrix4(blox.mesh.matrixWorld)
			blox.camera.position.set(v.x,v.y,v.z)
			// look at the target
			blox.camera.lookAt(blox.mesh.position)
		} else {
			// move this to the camera TODO TBD
		}
	}
}

