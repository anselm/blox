
let collidants = []

export class BehaviorCollide {
	constructor(props,blob) {
		if(!props.layer) props.layer = 1
		if(!props.filter) props.filter = 1
		if(!props.proximity) props.proximity = 1
		collidants.push({props:props,blob:blob})
	}
	tick(interval,blob) {
		// test everybody
		for(let i = 0; i < collidants.length; i++) {
			for(let j = i+1; j < collidants.length; j++) {
				let a = collidants[i]
				let b = collidants[j]
				// TODO it is fragile code wise to look specifically for a mesh - should use blob.findByProperty("isObject3D")
				if(!a.blob.mesh || !b.blob.mesh) continue
				// May only collide if layer masks overlap
				if(!(a.props.layer & b.props.layer)) continue
				let dist = a.blob.mesh.position.distanceTo( b.blob.mesh.position )
				let near = a.props.proximity + b.props.proximity
				if(dist < near) {
					// May only report if filters also succeed
					if((a.props.filter & b.props.layer) && a.props.on_overlap) a.props.on_overlap(interval,a.blob,b.blob)
					if((b.props.filter & a.props.layer) && b.props.on_overlap) b.props.on_overlap(interval,b.blob,a.blob)					
				}
				if(dist < near && !a.latched) {
					a.latched = true
					if(a.props.on_enter) a.props.on_enter(interval,a.blob,b.blob)
					if(b.props.on_enter) b.props.on_enter(interval,b.blob,a.blob)
				} else if(dist >= 2) a.latched = false
			}
		}
	}
}

