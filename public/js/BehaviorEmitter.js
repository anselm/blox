export class BehaviorEmitter {
	constructor(props,blox) {
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
			// copy
			let fresh = target.parent.group.add(target.description)
			// randomly place - TODO parameterize
			let x = Math.random()*10 - 5
			let y = 0
			let z = Math.random()*10 - 5
			if(fresh.mesh) fresh.mesh.position.set(x,y,z)
		}
	}
}