export class BehaviorEmitter {
	constructor(args) {
		let props = this.props = args.description
		let blox = args.blox
		if(!props || !props.target) {
			console.error("You have to specify a target")
			return
		}
	}
	on_tick() {
		if(this.alreadyran) return
		this.alreadyran = 1
		// wait till scene is fully loaded before querying for things
		// also there's a potential race condition since blox load their behaviors asynchronously
		let props = this.props
		let blox = this.blox
		let target = blox.query(props.target)
		if(!target || !target.parent) {
			console.error("Target is not found "  + props.target )
			return
		}
		let count = props.count || 10
		for(let i = 0; i < count; i++) {
			// randomize name
			target.description.name = props.name + i
			// copy
			let fresh = target.parent.group.push(target.description)
		}
	}
}