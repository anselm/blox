
import {BehaviorMesh} from "./BehaviorMesh.js"

export class BehaviorEmitter extends BehaviorMesh {
	constructor(args) {
		super(args)
		let props = this.props = args.description
		let blox = args.blox
		if(!props || !props.target) {
			console.error("You have to specify a target thing that you want to make copies of")
			return
		}
	}
	on_tick() {
		if(this.alreadyran) return true
		this.alreadyran = 1
		// wait till scene is fully loaded before querying for things
		// also there's a potential race condition since blox load their behaviors asynchronously
		let props = this.props
		let blox = this.blox
		let target = blox.query(props.target)
		if(!target || !target.parent) {
			console.error("Target is not found "  + props.target )
			return true
		}
		let count = props.count || 10
		for(let i = 0; i < count; i++) {
			// uniquely name with the specificied prefix - TODO could do a more global name randomization? TODO should keep a list of named objects here?
			// arguably all the named objects could be children of this object? TODO
			target.description.name = props.name + i
			// copy
			let fresh = blox.parent.children.push(target.description)
		}
		return true
	}

	///
	/// notice when any children blox show up and add to 3js
	/// TODO there's a bug where the auto detection of inherited methods is failing... so I have to duplicate this code here from Mesh

	on_blox_added(args) {
		//console.log("*******  emitter mesh named " + args.blox.name + " adding child named " + args.child.name)
		let blox = args.blox
		let child = args.child
		let mesh = this
		let children = child.query({instance:THREE.Object3D,all:true})
		children.forEach((value)=>{
			mesh.add(value)
		})
		return false // don't continue to pass this fact on
	}

}