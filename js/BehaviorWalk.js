
///
/// Navigating a point of view
///
///		- keyboard to move and rotate
///		- you could attach camera to this (we need to make sure that concepts like camera can be found in general)
///		- or this can talk to the camera and just move it (although in xr mode it doesn't have to do it)
///
///		- later - a physics based 'chaser' (can't really force or limit movement physically)
///		- later - nav meshes
///		- later - teleport
///

export class BehaviorWalk {

	constructor(props,blob) {
		this.props = props
		this.blob = blob
		this.forward = new THREE.Vector3(0,0,0.1)
		this.backward = new THREE.Vector3(0,0,-0.1)
		this.left = new THREE.Euler(0,10*Math.PI/180.0,0)
		this.right = new THREE.Euler(0,-10*Math.PI/180.0,0)
		document.addEventListener("keydown", this.onKeyDown.bind(this), false)
	}

	onKeyDown(event) {
		if(!this.blob || !this.blob.mesh) {
			console.error("Needs a mesh")
			return
		}
		let mesh = this.blob.mesh
	    switch(event.key) {
	    	case 'w': // up
	    		mesh.physicsForce(this.forward,0)
	    		break
	    	case 's': // down
	    		mesh.physicsForce(this.backward,0)
	    		break
	    	case 'a': // left
	    		mesh.physicsForce(0,this.left)
	    		break
	    	case 'd': // right
	    		mesh.physicsForce(0,this.right)
	    		break
	    	case 32: // space
	    		mesh.physicsReset()
	    		break
	    }
	}
}


