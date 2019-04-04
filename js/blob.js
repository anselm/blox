

import {BehaviorRenderer, BehaviorScene, BehaviorCamera, BehaviorLight} from './BehaviorRenderer.js'
import {BehaviorMesh} from './BehaviorMesh.js'
import {BehaviorSky} from './BehaviorSky.js'
import {BehaviorOrbit} from './BehaviorOrbit.js'
import {BehaviorParticles} from './BehaviorParticles.js'
import {BehaviorLine, BehaviorBounce, BehaviorOscillate, BehaviorWander, BehaviorStare } from './BehaviorBounce.js'
import {BehaviorPhysics, BehaviorPhysical} from './BehaviorPhysics.js'


///
/// BlobChildren
///

let UUID = 0

export class BehaviorChildren {
	constructor(props=0,blob=0) {
		this._load_children(props,blob)
	}
	_load_children(props,blob) {
		if(!props || !blob) return
		blob.children = this // slight hack, this would normally be set when the constructor returns, set it early so that find() works earlier
		this.children = []
		for(let i = 0; i < props.length; i++) {
			let details = props[i]
			let name = details.name || ++UUID
			let child = new Blob(details,blob)
			child.name = name
			console.log("BlobChildren: adding child named " + name )
			this.children.push(child)
			// tell listeners if any
			for(let i = 0; blob._observe_handlers && i < blob._observe_handlers.length;i++) {
				let handler = blob._observe_handlers[i]
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
			blob._tick(interval)
		}
	}
}

///
/// Blob acts a bucket to hold a collection of named behaviors
///
/// Behaviors in a blob have a back reference to the blob
///
/// TODO it would be nice to allow multiple instances of a given Behavior in some cases
/// TODO interval for timing stability at various frame rates
/// TODO remove having to pass blobs in tick
///

export class Blob {
	constructor(details=0,parent=0) {
		this.parent = parent
		try {
			if(!details) details = {}
			if(typeof details == 'string') {
				// load from a file
				this._load_module(details)
			} else {
				// attach behaviors - behaviors are hashed directly into the blob class not as a .behaviors property
				this._attach_behaviors(details)
			}
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
	_attach_behavior(name,props) {
		let blob = this
		try {
			// skip past existing instances of behavior on object
			let behavior = null
			let savename = name
			for(let count = 0;;count++) {
				savename = name + (count ? count : "")
				behavior = blob[savename]
				if(!behavior) break
			}
			// instance behavior
			if(true) {
				let className = "Behavior"+name.charAt(0).toUpperCase() + name.slice(1)
				// find the class
				let classRef = eval(className)
				// instance a behavior passing it the bucket itself and the properties for the field
				let behavior = new classRef(props,blob)
				// in each new behavior - keep a reference to this bucket
				behavior.blob = blob
				// in this instance - append new behavior to list of behaviors associated with this bucket
				blob[savename] = behavior
				console.log("Blob: added new instance of behavior " + savename + " " + className )
			}
		} catch(e) {
			if(name == "name" || name=="parent") { // TODO mark out reserved by a search instead
				//console.error("Blob: hit a reserved term : " + key + "=" + props)
			} else {
				console.error(e)
				// console.error("Blob::load: did not find " + className + " for " + name)
				// store the value as a literal if no class contructor found
				blob[name] = props
			}
		}
	}
	_observe_attach(handler) {
		if(!this._observe_handlers) this._observe_handlers = []
		this._observe_handlers.push(handler)
	}
	_tick(interval) {
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
	_load_module(filename) {
		let scope = this
		import(filename).then((module) => {
			let keys = Object.keys(module)
			let json = module[keys[0]]
			console.log(json)
			scope._attach_behaviors(json)
		})
	}
}

// This is a helper to expose being able to make scenes to ordinary javascript in normal namespace
window.BlobLoadHelper = (args) => { document.body.innerHTML = ""; return new Blob(args) }

