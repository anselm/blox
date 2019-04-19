export class BehaviorScene extends THREE.Scene {
	constructor(args) {
		THREE.Loader.extractUrlBase = THREE.LoaderUtils.extractUrlBase
		let props = args.description || {}
		let blox = args.blox
		super()
		this.renderer = blox.add({label:"renderer"})
		this.camera = blox.add({label:"camera"})
		this.renderer.reset(this,this.camera,this.camera)
	}
	on_blox_added(args) {
		let scene = this
		let child = args.child
		let objects = child.query({instance:THREE.Object3D,all:true})
		objects.forEach((value)=>{
			if(!scene) console.error("scene is bad")
			if(!scene) return
			scene.add(value)
			if(value instanceof THREE.PerspectiveCamera) {
				this.renderer.reset(this,value,value)
			}
		})
	}
}

