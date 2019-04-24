export class BehaviorEmitter {
	constructor(args) {
		let props = args.description
		let blox = args.blox
		if(!props || !props.target) {
			console.error("You have to specify a target")
			return
		}
		let target = blox.query(props.target)
		if(!target || !target.parent) {
			console.error("Target is not found")
			return
		}
		let count = props.count || 10
		for(let i = 0; i < count; i++) {
			// randomize name
			target.description.name = props.name + i
			// copy
			let fresh = target.parent.group.push(target.description)
			if(props.radius > 0) {
				let x = (Math.random()-0.5)*props.radius
				let y = 0
				let z = (Math.random()-0.5)*props.radius
				if(fresh.mesh) fresh.mesh.position.set(x,y,z)
			}
		}
		// TODO needs a concept of a rate
	}
}