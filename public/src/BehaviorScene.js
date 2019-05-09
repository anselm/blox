export class BehaviorScene extends THREE.Scene {
	constructor(args) {
		if(THREE.LoaderUtils) {
			THREE.Loader.extractUrlBase = THREE.LoaderUtils.extractUrlBase // just remove a warning
		}
		let props = args.description || {}
		let blox = args.blox
		super()
		this.blox = blox

		// this is optional - just make it less work for users to setup scenes by declaring the renderer if it is not around yet
		if(!blox.renderer) blox.addCapability({label:"renderer"})

		// also go ahead and inject a camera behavior directly on the root of the scene graph as well; TODO this is a bit more hacky
		if(blox.renderer && !blox.renderer.camera) blox.addCapability({label:"camera"})

		if(!blox.renderer) {
			console.error("renderer must be attached first")
			return
		}
		blox.renderer.set_scene(this)
	}
	on_blox_added(args) {
		let blox = args.blox
		let scene = this
		let child = args.child
		let objects = child.query({instance:THREE.Object3D,all:true})
		objects.forEach((value)=>{
			scene.add(value)
			if(value instanceof THREE.PerspectiveCamera) {
				blox.renderer.set_camera(value)
			}
		})
		return false // don't echo forwards
	}
}

