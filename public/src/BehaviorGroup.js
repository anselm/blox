
export class BehaviorGroup extends THREE.Group {

	constructor(args) {

		super()

		this.on_reset(args)

		let blox = args.blox
		if(blox.mesh) console.error("Warning: mesh already assigned")
		blox.mesh = this
		blox.position = this.position
		blox.quaternion = this.quaternion
	}

	on_reset(args) {		
	}

	///
	/// notice when any children blox show up and add to 3js
	///

	on_blox_added(args) {
		let blox = args.blox
		let child = args.child
		let mesh = this
		let children = child.query({instance:THREE.Object3D,all:true})
		children.forEach((value)=>{
			console.log("*******  group named " + args.blox.name + " adding child named " + args.child.name)
			mesh.add(value)
		})
		return false // don't continue to pass this fact on
	}

}
