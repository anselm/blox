
let collidants = []

export class BehaviorSense {
	constructor(props,blob) {
		collidants.push({props:props,blob:blob})
	}
	tick(interval,blob) {
		// test everybody
		for(let i = 0; i < collidants.length; i++) {
			for(let j = i+1; j < collidants.length; j++) {
				let a = collidants[i]
				let b = collidants[j]
				if(!a.blob.mesh || !b.blob.mesh) continue
				let dist = a.blob.mesh.position.distanceTo( b.blob.mesh.position )
				if(dist < 2 && !a.latched) {
					a.latched = true
					if(a.props.action) a.props.action(interval,a.blob,b.blob)
					if(b.props.action) b.props.action(interval,b.blob,a.blob)
				} else if(dist >= 2) a.latched = false
			}
		}
	}
}

