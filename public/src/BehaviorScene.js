export class BehaviorScene extends THREE.Scene {
	constructor(args) {
		if(THREE.LoaderUtils) {
			THREE.Loader.extractUrlBase = THREE.LoaderUtils.extractUrlBase // just remove a warning
		}
		let props = args.description || {}
		let blox = args.blox
		super()
		this.blox = blox

		// add a renderer behavior to the current blox if none present
		if(!blox.renderer) {
			blox.addCapability({label:"renderer"})
		}

		blox.renderer.set_scene(this)

		// add a blox containing a camera to the scene if none preseant
		if(!blox.renderer.camera) {
			let camera_blox = blox.addBlox({
				name:"camera",
				camera:{},
			})
			// since this scene is not 100% initialized, go ahead and add this by hand
			this.on_blox_added({blox:args.blox,child:camera_blox})
		}

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

