
///
/// Associates keyboard control with a mesh
///

export class BehaviorWalk {

	constructor(args) {
		document.addEventListener("keydown", this.onKeyDown.bind(this), false)
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

		// position camera behind the subject - TODO this could be a separate feature or behavior

		let camera = document.blox_renderer.camera
		let mesh = this.blox.mesh
		if(!camera || !mesh) {
			console.error("Needs its own camera and mesh for now")
		}

		// find a position behind the object
		let v = new THREE.Vector3(0,3,-10)
		v.applyMatrix4(mesh.matrixWorld)
		camera.matrixAutoUpdate = true
		camera.position.set(v.x,v.y,v.z)
		camera.lookAt(mesh.position)
		return true
	}
}

