
let collidants = []
let latches = []

export class BehaviorCollide {
	constructor(args) {
		let props = args.description
		let blox = args.blox
		if(!props.hasOwnProperty("layer")) props.layer = 1
		if(!props.hasOwnProperty("filter")) props.filter = 1
		if(!props.hasOwnProperty("proximity")) props.proximity = 1
		collidants.push({props:props,blox:blox})
		latches = new Array(collidants.length * collidants.length) // TODO needs to persist existing data
	}
	on_tick(args) {
		// test everybody
		for(let i = 0; i < collidants.length; i++) {
			for(let j = i+1; j < collidants.length; j++) {
				let a = collidants[i]
				let b = collidants[j]
				// TODO it is fragile code wise to look specifically for a mesh - should use blox.findByProperty("isObject3D")
				if(!a.blox.mesh || !b.blox.mesh) continue
				// Each object can set filters on what it will respond to
				let msga = a.props.filter & b.props.layer
				let msgb = b.props.filter & a.props.layer
				if(!msga && !msgb) continue
				let dist = a.blox.mesh.position.distanceTo( b.blox.mesh.position )
				let near = a.props.proximity + b.props.proximity
				let latch = collidants.length*j+i
				let latched = latches[latch]
				if(dist < near) {
					// May only report if filters also succeed
					if(msga) {
						a.blox.on_event({name:"on_overlap",blox:a.blox,other:b.blox})
					}
					if(msgb) {
						b.blox.on_event({name:"on_overlap",blox:b.blox,other:a.blox})
					}
					if(!latched) {
						latches[latch] = true
						if(msga) {
							a.blox.on_event({name:"on_enter",blox:a.blox,other:b.blox})
						}
						if(msgb) {
							b.blox.on_event({name:"on_enter",blox:b.blox,other:a.blox})
						}
					}
				} else if(dist > near + 1 && latched) { // TODO change this latch to be programmable
					latches[latch] = false
					if(msga) {
						a.blox.on_event({name:"on_exit",blox:a.blox,other:b.blox})
					}
					if(msgb) {
						b.blox.on_event({name:"on_exit",blox:b.blox,other:a.blox})
					}
				}
			}
		}
		return true // allow event to be passed onwards
	}
}

