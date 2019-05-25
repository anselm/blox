
///
/// Associates keyboard control with a mesh
///

export class BehaviorWalk {

	constructor(args) {

		let xrmode = typeof window.webkit !== 'undefined'
		if(xrmode) return 


		document.addEventListener("keydown", this.onKeyDown.bind(this), false)

		// attach to camera
		this.camera = args.blox.query("camera")
		if(!this.camera || !this.camera.camera) alert("no cam")
		this.orbit = new THREE.OrbitControls(this.camera.camera)

		// attach to blox position
		// TODO maybe I need a group above the actual real target
//		this.orbit.target = args.blox.position
//		this.orbit.maxDistance = 20
	}

	onKeyDown(event) {
		let blox = this.blox
		if(!blox || !blox.actionKinetic) {
			console.error("Needs BehaviorAction")
			return
		}
	    switch(event.key) {
	    	case 's': // up
	    		blox.on_event({name:"on_move",forward_impulse:{x:0,y:0,z:1}}) // TODO support blox.on_move
	    		break
	    	case 'w': // down
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

		this.orbit.update()

		// position camera behind the subject - TODO this could be a separate feature or behavior

		let mesh = this.blox.mesh

		return true
	}
}

