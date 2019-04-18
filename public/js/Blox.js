// dynamic import support for firefox
import {importModule} from '../lib/importModule.js'

// Basic
import {BehaviorRenderer, BehaviorScene, BehaviorCamera} from './BehaviorRenderer.js'
import {BehaviorLight} from './BehaviorLight.js'
import {BehaviorMesh} from './BehaviorMesh.js'

// Some objects
import {BehaviorSky} from './BehaviorSky.js'
import {BehaviorHeart} from './BehaviorHeart.js'
import {BehaviorText} from './BehaviorText.js'
import {BehaviorTextPanel} from './BehaviorTextPanel.js'

// Physics
import {BehaviorPhysics, BehaviorPhysical} from './BehaviorPhysics.js'

// Event handling
import {BehaviorEvents} from './BehaviorEvents.js'
import {BehaviorTick} from './BehaviorTick.js'
import {BehaviorCollide} from './BehaviorCollide.js'

// Motion models for player
import {BehaviorOrbit} from './BehaviorOrbit.js'
import {BehaviorWalk} from './BehaviorWalk.js'

// Some behaviors
import {BehaviorLine, BehaviorBounce, BehaviorOscillate, BehaviorWander, BehaviorStare } from './BehaviorBounce.js'
import {BehaviorParticles} from './BehaviorParticles.js'
import {BehaviorProton} from './BehaviorProton.js'
import {BehaviorEmitter} from './BehaviorEmitter.js'

// Intents - which are fancy behaviors - may roll back into Mesh itself
import {BehaviorIntent} from './BehaviorIntent.js'

// BehaviorAudio TBD

//
// This is a list of blox in a single flat namespace
// TODO at some point refine this to support returning all the blox with the same name
// Also support indexing by other properties for fast lookup, basically be a lightweight database
//

let UUID = 0
let global_blox_namespace = {}

///
/// blox acts a bucket to hold a collection of named behaviors
///
/// Behaviors in a blox have a back reference to the blox
///
/// TODO it would be nice to allow multiple instances of a given Behavior in some cases
/// TODO interval for timing stability at various frame rates
/// TODO remove having to pass bloxs in tick
///

export class Blox {

	///
	/// description = a JSON hash of behaviors OR a string of a filename to load
	/// parent = a parent blox if any
	///
	constructor(description={},parent=0) {
		this.load(description,parent)
	}

	async load(description={},parent=0) {
		// grant a default name that can be rewritten during construction
		this.name = "blox" + UUID++
		// save details so that the blox can be cloned on demand
		this.description = description
		// save the parent scope - 'parent' is a reserved term
		this.parent = parent
		// functions can be declared directly in descriptions as well and are called when matching events occur
		this.functions = {}
		// behaviors are hashed here AND currently attached directly as properties for user convenience
		this.behaviors = {}
		// inhale behaviors
		try {
			if(typeof description == 'string') {
				let module = await importModule(description)
				if(module) {
					let keys = Object.keys(module)
					if(keys.length && module[keys[0]]) {
						let behaviors = module[keys[0]]
						await this._attach_behaviors(behaviors)
					}
				} else {
					console.error("Cannot load module")
				}
			} else {
				let behaviors = description
				await this._attach_behaviors(behaviors)
			}
		} catch(e){
			console.error(e)
		}
	}

	async _attach_behaviors(behaviors={}) {
		if(!behaviors) return
		if(behaviors.constructor != Object) {
			console.error("Blox behaviors need to be a hash")
			return
		}
		// built in support to load a package for now TODO revisit this idea later - needs to exploit async
		if(behaviors.load) {
			let module = await importModule(behaviors.load)
			if(module) {
				let keys = Object.keys(module)
				if(keys.length && module[keys[0]]) {
					let behaviors_package = module[keys[0]]
					Object.entries(behaviors_package).forEach(([key,description])=>{
						this._attach_behavior(key,description)
					})
				}
			}
			delete behaviors.load
		}
		// add all behaviors
		Object.entries(behaviors).forEach(([key,description])=>{
			this._attach_behavior(key,description)
		})
		if(this.parent)this.parent.on_event({ name:"on_blox_added", child:this })
	}

	_attach_behavior(key,description) {
		let blox = this

		// 'name' is a reserved attribute
		if(key == "name") {
			if(typeof description !== "string") {
				console.error("A blox name must be a string and cannot be a child behavior!")
				return
			}
			this.name = description
			global_blox_namespace[this.name] = this
			return
		}

		// parent is reserved - checking and reporting this explicitly although below would catch it as well
		if(key == "parent") {
			console.error("A blox may not have a behavior called parent - this is a reserved term")
			return
		}

		// if the details are a function then remember it as well
		if(typeof description === "function") {
			//console.log("Noticed a function " + key)
			this.functions[key] = description
			return
		}

		// The name of the behavior to load
		let className = "Behavior"+key.charAt(0).toUpperCase() + key.slice(1)
		let classRef = 0
		let classInst = 0

		// If a property already exists then the assumption right now is that the intention is to edit the existing property
		// behaviors exist both in blox.behaviors and directly on blox[] for convenience; here check on []
		let usename = key
		for(let count = 0;;count++) {
			usename = key + (count ? count : "")
			let previous = blox[usename]
			if(!previous) break
			if (typeof previous === "function") {
				console.error("Error: your behavior collides with an existing reserved field : " + usename)
				return
			}
			console.log(previous.constructor.name)
			if(previous.constructor.name == className) {
				// looks like this is an edit
				console.log("editing " + className)
				classInst = previous
				break
			}
		}

		// Attempt to manufacture and add behavior, else treat it as an attribute but warn for now
		try {
			// advise that the behavior will exist soon
			blox.on_event({name:"on_behavior_will_add",description:description,blox:blox})
			// make if was not found
			if(!classInst) {
				// find the class or throw an exception
				classRef = eval(className)
				// instance a behavior passing it the bucket itself and the properties for the field
				classInst = new classRef(description,blox)
			} else {
				// if there is an on reset then call that
				let args = {description:description,blox:blox}
				if(classInst.on_reset) classInst.on_reset(args)
			}
			// in each new behavior - keep a reference to this bucket explicitly rather than letting the behavior do it or not
			// TODO it's arguable if this is needed actually
			classInst.blox = blox
			// also keep a reference to the details that were used to build it
			classInst.description = description
			// directly attach fresh behavior to the blox
			blox[usename] = classInst
			// append new behavior to list of behaviors associated with this bucket
			blox.behaviors[usename] = classInst
			blox.on_event({name:"on_behavior_added",behavior:classInst,blox:blox})
			//console.log("Added " + className + " " + " to " + blox.name)
		} catch(e) {
			console.error(e)
			console.error("blox::load: did not find " + className + " for " + name)
			// store the value as a literal if no class contructor found for now - as a convenience for the user
			blox[usename] = description
		}
	}

	//
	// Moderately fancy query support
	// args may be a string, in which case a global namespace is searched for the blox.name
	// args may be hash containing a 'property' in which case the assumption is to look for children behaviors with that field
	// TODO extend as needed over time
	//

	query(args) {
		// as a service to users, if a query is just a single string then search a global namespace for that blox.name
		if(typeof args == 'string') {
			return global_blox_namespace[args]
		}
		// otherwise queries should be fancier hashes describing a possibly complex query, fail if this is not the case
		if(args.constructor != Object) {
			console.error("Blox query not understood")
			return null
		}

		// which blox?
		let blox = args.name ? global_blox_namespace[args.name] : this

		// return first or all?
		let results = args.all ? [] : 0
		// search local behaviors for a behavior with a given attribute and return said behavior
		if(args.property) {
			let keys = Object.keys(blox.behaviors)
			for(let i = 0 ; i < keys.length; i++) {
				let key = keys[i]
				let value = blox.behaviors[key]
				if(value[args.property]) {
					if(!results) return value
					results.push(value)
				}
			}
		}
		// search local behaviors for a behavior of a kind and return said behavior
		if(args.instance) {
			let keys = Object.keys(blox.behaviors)
			for(let i = 0 ; i < keys.length; i++) {
				let key = keys[i]
				let value = blox.behaviors[key]
				if(value instanceof args.instance) {
					if(!results) return value
					results.push(value)
				}
			}
		}
		return results
	}

	///
	/// forward received events to local behaviors
	///

	on_event(args) {

		// set the blox to current scope regardless of what it was
		args.blox = this

		// go out of our way to call any user supplied property that matches this - except don't call ourseeeelllvvvvveessss 
		if(args.name != "on_event" && this.functions[args.name]) {
			this.functions[args.name](args)
		}

		// look at all behaviors and call handler if found - note that user defined functions here don't get called automatically because they are not inserted automatically - behaviors can totally ignore passed properties
		Object.entries(this.behaviors).forEach(([key,behavior])=>{
			if(typeof behavior !== "object") return
			try {
				if(behavior[args.name]) {
					behavior[args.name](args)
				}
				// also call fallback if any
				if(behavior.on_event) {
					behavior.on_event(args)
				}
			} catch(e) {
				console.error("error handling event")
				console.error(e)				
			}
		})
	}

}


///
/// BehaviorGroup
///
/// Manages children related to a blox
///

export class BehaviorGroup {

	///
	/// props = a json ARRAY describing a set of children
	/// blox = the current scope as is normally passed to all behaviors on construction
	///

	constructor(array=0,blox=0) {
		if(!array || !blox) {
			console.error("Error: ust have a parent blox and be an array")
			return
		}
		if(array.constructor != Array) {
			console.error("Error: args must be an array")
			return			
		}
		// hack; normally these fields are set after but I set it early so that children can rely on group.blox.query()
		this.blox = blox
		blox.group = this
		// this behavior manages a set of children - set that up
		this.children = []
		// load each one from the property definition and save it
		for(let i = 0; i < array.length; i++) {
			this.add(array[i])
		}
	}

	///
	/// Manufacture a new blox from a description
	///
	/// description = a json HASH describing a set of behaviors OR a string indicating a document to load 
	///

	add(description) {
		let child = new Blox(description,this.blox)
		this.children.push(child)
		return child
	}

	///
	/// Forward events to all blobs
	///

	on_event(args) {
		this.children.forEach((child) => {
			// set the blox to current scope always
			args.blox = child
			child.on_event(args)
		})
	}

}
