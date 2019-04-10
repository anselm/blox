export class BehaviorTick {
	constructor(props,blob) {
		this.props = props
	}
	tick(interval,parent) {
		this.props(interval,parent)
	}
}