
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// Blob acts a bucket to hold a collection of named behaviors - one behavior of a blob is typically a THREE.Mesh
///
/// Behaviors in a blob have a back reference to the blob
///
/// TODO would be nice to load hierarchies
/// TODO it would be nice to allow multiple instances of a given Behavior in some cases
/// TODO interval for timing stability at various frame rates
/// TODO remove having to pass blobs in tick
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let UUID = 0

class BehaviorChildren {
	constructor(_children,parent) {
		this.children = []
		parent.children = this // slight hack, make sure this property is set early so that subsequent children below have lineage
		for(let i = 0; i < _children.length; i++) {
			let details = _children[i]
			let name = details.name || ++UUID
			let child = new Blob(details,parent)
			child.name = name
			console.log("BlobChildren: adding child named " + name )
			this.children.push(child)
			// tell listeners if any
			for(let i = 0; parent._observe_handlers && i < parent._observe_handlers.length;i++) {
				let handler = parent._observe_handlers[i]
				handler(child)
			}
		}
	}
	find(name) {
		for(let i = 0; i < this.children.length; i++) {
			if(this.children[i].name == name) return this.children[i]
		}
		return 0
	}
	tick(interval=0.01) {
		for(let i = 0; i < this.children.length; i++) {
			let blob = this.children[i]
			blob._tick_behaviors(interval)
		}
	}
}

class Blob {
	constructor(details={},parent=0) {
		try {
			this.parent = parent
			if(!details) return
			// attach behaviors - behaviors are hashed directly into the blob class not as a .behaviors property
			this._attach_behaviors(details)
		} catch(e){
			console.error(e)
		}
	}
	_attach_behaviors(_behaviors={}) {
		Object.entries(_behaviors).forEach(([key,value])=>{
			// evaluate each keypair - a keypair is either a name+class behavior, or a name + literal value
			this._attach_behavior(key,value)
		})
	}
	_attach_behavior(key,props) {
		let blob = this
		let className = "Behavior"+key.charAt(0).toUpperCase() + key.slice(1)
		// attempt to make a specified behavior for each property of each object
		try {
			// find the class
			let classRef = eval(className)
			// instance a behavior passing it the bucket itself and the properties for the field
			let behavior = new classRef(props,blob)
			// in each new behavior - keep a reference to this bucket
			behavior.blob = blob
			// in this instance - append new behavior to list of behaviors associated with this bucket
			blob[key] = behavior
			console.log("Blob: made " + className )
		} catch(e) {
			if(key == "name" || key=="parent") { // TODO mark out reserved by a search instead
				//console.error("Blob: hit a reserved term : " + key + "=" + props)
			} else {
				console.error(e)
				// console.error("Blob::load: did not find " + className + " for " + name)
				// store the value as a literal if no class contructor found
				blob[key] = props
			}
		}
	}
	_observe_attach(handler) {
		if(!this._observe_handlers) this._observe_handlers = []
		this._observe_handlers.push(handler)
	}
	_tick_behaviors(interval) {
		// a blob has a collection of properties, some of which may be behaviors
		try {
			Object.entries(this).forEach(([key,value])=>{
				if(!value.tick) return
				value.tick(interval,this)
			})
		} catch(e) {
			console.error(e)
		}
	}
}
