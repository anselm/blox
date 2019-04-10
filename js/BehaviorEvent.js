
///
/// BehaviorEvent
///
/// This is an idea to let users decorate objects with event handlers
/// Exploring various strategies to pipe useful events to 'user land'
///

export class BehaviorEvent {
	constructor(props,blob) {
		// Listen to events on the parent scope and pipe them all directly to userland
		if(blob) blob._listen("",(e) => {
			if(!props)return
			e.parent = blob
			e.behavior = this
			props(e)
		})
	}
}