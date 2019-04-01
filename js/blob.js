
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

class Blob {
	constructor(details={},parent=0) {
		try {
			this.children = []
			this.parent = parent
			if(!details) return
			// attach behaviors - behaviors are hashed directly into the blob class not as a .behaviors property
			this._attach_behaviors(details)
			// children blobs if any - this is a reserved term
			this._attach_children(details.children)
		} catch(e){
			console.error(e)
		}
	}
	_attach_behaviors(_behaviors={}) {
		Object.entries(_behaviors).forEach(([key,value])=>{
			if(key == "children") return
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
		} catch(e) {
			if(key == "name" || key == "children" || key=="parent" || key=="find") { // TODO mark out reserved by a search instead
				console.error("Hit a reserved term " + key)
			} else {
				console.error(e)
				//console.error("Blob::load: did not find " + className + " for " + name)
				// store the value as a literal if no class contructor found
				blob[key] = props
			}
		}
	}
	_attach_children(_children=[]) {
		for(let i = 0; i < _children.length; i++) {
			let details = _children[i]
			let name = details.name || ++UUID
			let child = new Blob(details,this)
			child.name = name
			this.children.push(child)
			// tell listeners if any
			for(let i = 0; this._observe_handlers && i < this._observe_handlers.length;i++) {
				let handler = this._observe_handlers[i]
				handler(child)
			}
		}
	}
	_observe_attach(handler) {
		if(!this._observe_handlers) this._observe_handlers = []
		this._observe_handlers.push(handler)
	}
	_tick_children(interval=0.01) {
		try {
			Object.entries(this.children).forEach(([name,blob])=>{
				blob._tick_children(interval)
				blob._tick_behaviors(interval)
			})
		} catch(e) {
			console.error(e)
		}
	}
	_tick_behaviors(interval) {
		Object.entries(this).forEach(([key,value])=>{
			// all properties that have tick get some cpu time
			if(!value.tick) return
			value.tick(interval,this)
		})
	}
	find(name) {
		if(this.parent && this.parent.children) {
			for(let i = 0; i < this.parent.children.length; i++) {
				if(this.parent.children[i].name == name) return this.parent.children[i]
			}
		}
		return 0
	}
}
