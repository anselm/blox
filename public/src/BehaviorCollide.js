
let collidants = []

export class BehaviorCollide {
	constructor(args) {
		let props = args.description
		let blox = args.blox
		if(!props.layer) props.layer = 1
		if(!props.filter) props.filter = 1
		if(!props.proximity) props.proximity = 1
		collidants.push({props:props,blox:blox})
	}
	on_tick(args) {
		// test everybody
		for(let i = 0; i < collidants.length; i++) {
			for(let j = i+1; j < collidants.length; j++) {
				let a = collidants[i]
				let b = collidants[j]
				// TODO it is fragile code wise to look specifically for a mesh - should use blox.findByProperty("isObject3D")
				if(!a.blox.mesh || !b.blox.mesh) continue
				// May only collide if layer masks overlap
				if(!(a.props.layer & b.props.layer)) continue
				let dist = a.blox.mesh.position.distanceTo( b.blox.mesh.position )
				let near = a.props.proximity + b.props.proximity
				if(dist < near) {
					// May only report if filters also succeed
					if((a.props.filter & b.props.layer)) {
						a.blox.on_event({name:"on_overlap",blox:a.blox,other:b.blox})
					}
					if((b.props.filter & a.props.layer)) {
						b.blox.on_event({name:"on_overlap",blox:b.blox,other:a.blox})
					}
				}
				if(dist < near && !a.latched) {
					a.latched = true
					a.blox.on_event({name:"on_enter",blox:a.blox,other:b.blox})
					b.blox.on_event({name:"on_enter",blox:b.blox,other:a.blox})
				} else if(dist >= 2) a.latched = false
			}
		}
	}
}

