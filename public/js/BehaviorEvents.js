
///
/// BehaviorEvents
///
/// This is an idea to let users decorate objects with event handlers
/// Exploring various strategies to pipe useful events to 'user land'
///

export class BehaviorEvents {
	constructor(props,blox) {
		this.on_event = (args) => {
			if(!props)return
			args.blox = blox
			args.behavior = this
			props(args)
		}
	}
}