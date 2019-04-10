export class BehaviorEmitter {
	constructor(props,blob) {
		if(!props || !props.target) {
			console.error("You have to specify a target")
			return
		}
		let target = blob._findChildByName(props.target)
		if(!target) {
			console.error("Target is not found")
			return
		}
		let count = props.count || 10
		for(let i = 0; i < count; i++) {
			// randomly place - TODO parameterize
			let x = Math.random()*10 - 5
			let y = 0
			let z = Math.random()*10 - 5
			let position = {x:x,y:y,z:z}
			target._details.mesh.position = position
			let fresh_copy = target._copy()
		}
	}
}