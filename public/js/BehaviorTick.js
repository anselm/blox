
///
/// A way to expose time to user land
///

export class BehaviorTick {
	constructor(props,blox) {
		this.props = props
	}
	on_tick(args) {
		this.props(args)
	}
}