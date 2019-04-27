export class BehaviorScene extends THREE.Scene {
	constructor(args) {
		if(THREE.LoaderUtils) {
			THREE.Loader.extractUrlBase = THREE.LoaderUtils.extractUrlBase // just remove a warning
		}
		let props = args.description || {}
		let blox = args.blox
		super()
		this.renderer = blox.add({label:"renderer"})
		this.camera = blox.add({label:"camera"}) // add a default camera - any camera the user supplies will override this one
		this.renderer.set_scene(this)
	}
	on_blox_added(args) {
		let scene = this
		let child = args.child
		let objects = child.query({instance:THREE.Object3D,all:true})
		objects.forEach((value)=>{
			scene.add(value)
			if(value instanceof THREE.PerspectiveCamera) {
				this.renderer.set_camera(value)
			}
		})
	}
}

