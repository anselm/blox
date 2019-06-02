// dynamic import support for firefox
import {importModule} from '../lib/importModule.js'

// Basic
import {BehaviorRenderer} from './BehaviorRenderer.js'
import {BehaviorScene} from './BehaviorScene.js'
import {BehaviorCamera} from './BehaviorCamera.js'
import {BehaviorLight} from './BehaviorLight.js'
import {BehaviorGroup} from './BehaviorGroup.js'
import {BehaviorMesh} from './BehaviorMesh.js'
import {BehaviorPortal} from './BehaviorPortal.js'

// Some graphics
import {BehaviorSky} from './BehaviorSky.js'
import {BehaviorHeart} from './BehaviorHeart.js' // TODO this may go away - it's an idea
import {BehaviorText} from './BehaviorText.js'
import {BehaviorTextPanel} from './BehaviorTextPanel.js'

// Motion - kinetic physics without collision
import {BehaviorAction,
		BehaviorActionKinetic,
		BehaviorActionTarget,
		BehaviorActionLifespan,
		BehaviorActionTumble
	} from './BehaviorAction.js'

// More motion effects; may merge some of these with above
import {BehaviorLine,
		BehaviorBounce,
		BehaviorOscillate,
		BehaviorWander,
		BehaviorStare
	} from './BehaviorBounce.js'

// Collision support for the kinetics system
import {BehaviorCollide} from './BehaviorCollide.js'

// Constraint based physics with its own collision support
import {BehaviorPhysics, BehaviorPhysical} from './BehaviorPhysics.js'

// A helper class to manufacture instances
import {BehaviorEmitter} from './BehaviorEmitter.js'

// Helpers to navigate the scene
import {BehaviorOrbit} from './BehaviorOrbit.js'
import {BehaviorWalk} from './BehaviorWalk.js'

// Particles - not really used yet - may remove
import {BehaviorProton} from './BehaviorProton.js'

// some ux
import {BehaviorPlacementUX} from './BehaviorPlacementUX.js'

// webxr support
import {BehaviorAnchor} from './BehaviorAnchor.js'

// webxr
import {BehaviorXRWorldInfo} from "./BehaviorXRWorldInfo.js"

//
// This is a list of blox in a single flat namespace
// TODO at some point refine this to support returning all the blox with the same name
// Also support indexing by other properties for fast lookup, basically be a lightweight database
//

let UUID = 0
let global_blox_namespace = {}

///
/// BehaviorChildren
///
/// Manages children related to a blox
///

export class BehaviorChildren {

	///
	/// props = a json ARRAY describing a set of children
	/// blox = the current scope as is normally passed to all behaviors on construction
	///

	constructor(args) {
		let description = args.description
		let blox = args.blox
		if(!blox) {
			console.error("Error: must have a parent blox")
			return
		}
		// hack; normally these fields are set after but I set it early so that children can rely on children.blox.query()
		this.blox = blox
		blox.children = blox.behaviors.children = this
		// this behavior manages a set of children - set that up
		this.children = []
		// load each one from the property definition and save it
		this.on_reset(args)
	}

	///
	/// Pass a bunch of children
	///
	on_reset(args) {
		let description = args.description // TODO fails to deal with appending
		if(!description) return true
		if(description.constructor != Array) {
			// TODO later support loading children off disk
			console.error("Error: args must be an array")
			return true
		}
		for(let i = 0; i < description.length; i++) {
			this.push(description[i])
		}
		return true
	}

	///
	/// Manufacture a new blox from a description
	///
	/// description = a json HASH describing a set of behaviors OR a string indicating a document to load 
	///

	push(description) {
		let child = new Blox({description:description,parent:this.blox})
		this.children.push(child)
		console.log("A blox named " + this.blox.name + " added a child blox named " + child.name)
		return child
	}

	///
	/// Forward events to child blox unless one of them terminates the activity
	///

	on_event(args) {
		this.children.forEach((child) => {
			// set the blox to current scope always
			args.blox = child
			if(!child.on_event(args)) {
				return false
			}
		})
		return true
	}

}

///
/// Load - is reserved but I have to catch this by hand below because of problems with async/await
///

class BehaviorLoad {

}

///
/// Functions - Event Chain Behavior
///
/// Basically a blox might have some naked functions that a user defined such as on_tick(e) - I want to stash them here.
/// I prefer it if anything a user makes is scoped as a method on a child behavior
/// In that way the user function is consistently getting parent via reference - ie on_tick(e) { this.blox.do_something() }
/// And now any user land function can recover scope by looking at this.blox rather than having it passed in the event.
///

class BehaviorFunctions {

	constructor(args) {
		this.blox = args.blox
		this.chains = {}
		// I'm just going to take over this ability completely and manage it here
		this.blox.on_event = this.on_event.bind(this)
	}

	///
	/// this entire method gets injected into the parent blox
	///
	/// given an event pass it to three customers
	//		1) any matching naked functions that were scavenged during loading the blox document
	///		2) any behaviors that specifically implement the event by name
	///		3) any children blox that specifically implement the event by name
	///
	/// the construction logic already found those functions and stashed them here in 'chains'
	///

	on_event(args) {
		// set the blox to current scope regardless of what it was
		args.blox = this.blox

		if(args.name != "on_tick")
		if(this.debug)console.log("functions:: propagating " + args.name + " from " + this.blox.name )

		// look for specifically named events in local scope and call them
		if(!this._on_specific_named_event(args.name,args)) {
			return false
		}

		// also, pass any specialized events to any listeners generic on_event catch all - except on_event itself which was just done above
		if(args.name != "on_event") {
			if(!this._on_specific_named_event("on_event",args)) {
				return false
			}
		}

		return true
	}

	_on_specific_named_event(name,args) {
		// set the blox to current scope regardless of what it was
		args.blox = this.blox
		// find the chain
		let chain = this.chains[name]
		if(chain) {
			for(let i = 0; i < chain.length;i++) {
				let myhandle = chain[i]
				if(!myhandle(args)) {
					return false
				}
			}
		}
		return true
	}

	push(args) {
		let label = args.label
		let handler = args.handler
		let owner = args.owner

		// make a fresh chain system if needed
		let chain = this.chains[label]
		if(!chain) {
			// make a fresh chain
			chain = this.chains[label] = []
			// TEST: not working well... promote chains directly up to the blox scope so they are visible to userland
			if(false) {
				if(this.blox[label]) {
					console.error("Functions:: Warning: naked function name collision " + label )
				}
				this.blox[label] = this._on_specific_named_event.bind(this)
			}
		}

		// add the users function to the chain
		chain.push(handler.bind(owner))
		if(this.debug)console.log("functions:: added " + label + " to " + this.blox.name )
	}
}

///
/// A blox is a flattened namespace that holds 1) children blox, 2) behaviors and 3) functions or events
/// It's basically an ECS pattern and it doesn't know anything about the use case.
///
/// A blox can be inhaled from a text document
/// Namespace collisions *are* possible and naming conventions are used to mitigate them.
///
/// Every blox has
///		- a name, which does not need to be unique but I haven't thought much about duplicate names yet
///		- a parent, which may be 0
///		- a description which is used to produce the blox from scratch
///		- a set of behaviors... this is the main job of this class
///		- a behavior that is a collection of children blox (this could be optional but for now I hard-code it)
///		- a behavior that is a collection of function callbacks for event support (also hard coded)
///
/// Most behaviors are generic, but I make a couple for myself that are built-in effectively
///		- BehaviorLoad -> let's me work around an async issue and lets me implement packages
///		- BehaviorChildren -> manages children
///		- BehaviorFunctions -> manages events and callbacks
///
///	The document loader has a series of steps
///		- if the child property is a behavior, then it asserts the behavior exists once only
///		- if the child property is a child blox (it can tell these apart) it adds it to its own children
///		- if the child property is a naked function it adds it to its own functions
///

export class Blox {

	/// accept a hash or naked string
	///
	/// description = a JSON hash of behaviors OR a string of a filename to load
	/// parent = a parent blox if any

	constructor(args,parent=0) {

		// there's a bit of support here for passing either a hash (in memory) or just a string (to load a hash off disk)
		if(typeof args === "string") {
			this.parent = parent
			this.description = args
		} else {
			this.parent = args.parent || parent
			this.description = args.description || {}
		}

		// grant a default name that can be rewritten during construction
		this.name = "blox" + UUID++

		// all behaviors here (arguably this could also be implemented as sub behavior but simplest this way)
		this.behaviors = {}

		// all functions here (seems to make sense to organize these as a kind of sub behavior)
		this.functions = new BehaviorFunctions({blox:this})
		this.functions.blox = this

		// don't do it this way because i don't want to propagate on_event to myself
		// this.add({label:"functions"})

		// add a children behavior
		this.addCapability({label:"children"})

		// inject properties - a blox generally consists of a bucket of behaviors, go ahead and populate this blox
		this.on_behaviors({description:this.description,parent:this.parent})
	}

	///
	/// on_event will get over-written by this.functions logic - see BehaviorFunctions
	///

	on_event(args) {}

	///
	/// Fill a blox with behaviors
	/// TODO remove async when I can remove loadModule() - it seriously makes this all harder
	///

	async on_behaviors(args) {

		let parent = args.parent // TODO - if the parent changes then what?
		let behaviors = args.description // TODO - I should probably append the description

		// deal with a file off disk
		if(typeof behaviors == 'string') {
			console.log("loading a module named " + behaviors)
			let module = await importModule(behaviors)
			if(!module) {
				console.error("Cannot load module")
				return
			}
			let keys = Object.keys(module)
			if(!keys.length) {
				console.error("Blox:: module has no export")
				return
			}
			behaviors = module[keys[0]] // rewrite
			if(!behaviors.name) {
				console.log("setting the name of the behavior collection to " + keys[0])
				behaviors.name = keys[0]
			}
		}

		// any work to do?
		if(!behaviors) {
			return
		}

		// is possibly a collection?
		if(behaviors.constructor != Object) {
			console.error("Blox behaviors need to be a hash")
			return
		}

		// peek ahead at 'load' which is a reserved behavior right now due to annoying async issues TODO
		if(behaviors.load) {
			console.log("intercepting a load request for a package " + behaviors.load)
			let module = await importModule(behaviors.load)
			if(module) {
				let keys = Object.keys(module)
				if(keys.length && module[keys[0]]) {
					let behaviors_package = module[keys[0]]
					Object.entries(behaviors_package).forEach(([label,description])=>{
						this.addCapability({label:label,description:description})
					})
				}
			}
			delete behaviors.load
		}

		// inject functions early so that events fire even if in random order
		for(let label in behaviors) {
			let description = behaviors[label]
			if(typeof description !== "function") continue
			this.functions.push({label:label,handler:description,owner:this.functions})
		}

		// add the other behaviors that are not functions
		for(let label in behaviors) {
			let description = behaviors[label]
			if(typeof description === "function") continue
			this.addCapability({label:label,description:description})
		}

		// notify children of this blox that this blox is itself ready - TODO maybe not needed?
		this.on_event({ name:"on_loaded", blox:this, loaded:this} )

		// notify parent scope that this blox is now a child of it
		if(this.parent) {
			this.parent.on_event({ name:"on_blox_added", child:this })
		}
	}

	///
	/// Add a child property of some kind
	///

	addCapability(args) {

		if(typeof args === "string") args = { label:args }

		let label = args.label
		let description = args.description
		let blox = this

		// ===========================================================
		// ATTACH NAME 'name' is a reserved attribute
		// Save reference to this object in a global database
		if(label == "name") {
			if(typeof description !== "string") {
				console.error("A blox name must be a string and cannot be a child behavior!")
				return
			}
			this.name = description
			global_blox_namespace[this.name] = this
			return
		}

		// ============================================================
		// ATTACH PARENT - parent is reserved - checking and reporting this explicitly although below would catch it as well
		if(label == "parent") {
			console.error("A blox may not have a behavior called parent - this is a reserved term")
			return
		}

		// ===================================================================
		// ATTACH NAKED FUNCTION
		// if the details are a function then remember it as well
		if(typeof description === "function") {
			this.functions.push({label:label,handler:description,owner:this.functions})
			return
		}

		// =====================================================================
		// ATTACH BEHAVIOR OR LITERAL
		// The name of the behavior to load
		let className = "Behavior"+label.charAt(0).toUpperCase() + label.slice(1)
		let classRef = 0
		let classInst = 0
		let isNew = true

		// TEST flatten namespaces where behaviors are visible directly on the blox for userland
		// Does the 'behavior' that you want to create already exist as a property of some kind (a behavior, function etc?)
		for(let count = 0;;count++) {
			let previous = blox[label]
			if(!previous) break
			if (typeof previous !== "object") {
				console.error("Error: your behavior collides with something already present : " + label)
				return
			}
			if(previous.constructor.name == className) {
				// looks like you're trying to modify an existing behavior - which is ok
				console.log("editing " + className)
				classInst = previous
				isNew = false
				break
			}
		}

		// Try find a class constructor for what appears to be a behavior
		if(!classInst) {
			try {
				if(className != "BehaviorChildren") {
					// not enabled yet: i would like to allow user defined behaviors to be dynamically inhaled - do i need a registry? TODO
					// let module = await importModule(behaviors)
					// let results = await import("./"+className+".js")
				}
				classRef = eval(className)
			} catch(e) {
				classRef = 0
			}
		}

		// Populate the child behavior with the passed description
		if(classRef || classInst) {

			// advise that the behavior will exist soon (TODO this is incorrectly sent when re-initialized also)
			blox.on_event({name:"on_behavior_will_add",description:description,blox:blox})

			// Instance the behavior if need be
			if(!classInst) {
				try {
					classInst = new classRef({description:description,blox:blox})
				} catch(e) {
					console.error(e)
					console.error("Blox:: could not create behavior " + className + " for " + label )
					return
				}
				// I'm trying an idea of promoting all behavior functions from source code into the functions collection
				for (let label of Object.getOwnPropertyNames(Object.getPrototypeOf(classInst))) {
					let handler = classInst[label]
					if(label.startsWith("on_") && handler instanceof Function) {
						this.functions.push({label:label,handler:handler,owner:classInst})
					}
				}
			} else {
				// A pre-defined 'package' / instance already exists, send it some more data if possible
				try {
					if(classInst.on_reset) {
						classInst.on_reset({description:description,blox:blox})
					} else {
						console.error("Blox:: behavior doesn't have an on_reset: " + className )
					}
				} catch(e) {
					console.error(e)
					console.error("Blox:: could not reset a behavior " + className)
				}
			}

			// behaviors back reference their blox
			classInst.blox = blox
			// behaviors back reference their construction document
			classInst.description = description
			// remember behavior
			if(isNew) {
				blox.behaviors[label] = classInst
				// TEST an idea of flatter namespaces - inject behavior directly into blox scope for userland
				blox[label] = classInst
				// tell local parties about the new behavior
				blox.on_event({name:"on_behavior_added",behavior:classInst,blox:blox})
			}

			// pass this back
			return classInst
		} else {
			if(!description || typeof description !== "object") {
				console.error("Unrecognized child " + description )
				return 0
			} else {
				// New feature - let you directly inject entire children blox without having to declare children[]
				description.name = label
				if(!this.behaviors.children) {
					console.error("Blox:: trying to add a child behavior but is missing having children behavior")
				}
				let blox = this.behaviors.children.push(description)
				return blox
			}
		}
	}

	///
	/// Convenience - also addCapability does the same
	///

	addBlox(description) {
		let blox = this.behaviors.children.push(description)
		return blox
	}

	///
	/// Moderately fancy query support for blox OR behaviors of a blox - always returning a children set of behaviors
	///
	/// args may be a string, in which case a global namespace is searched for the blox.name
	/// args may be hash containing a 'property' in which case the assumption is to look for children behaviors with that field
	/// TODO extend as needed over time
	///

	query(args) {

		// as a service to users, if a query is just a single string then search a global namespace for that blox.name
		if(typeof args == 'string') {

			if(args.startsWith("regex:")) {
				let regex = args.substring(6)
				let keys = Object.keys(global_blox_namespace)
				let keys2 = []
				for(let i = 0; i < keys.length; i++) {
					let key = keys[i]
					if(key.match(regex))keys2.push(key)
				}
				if(!keys2.length) return 0
				let which = Math.floor(keys2.length * Math.random() )
				return global_blox_namespace[keys2[which]]
			}

			if(args == "*") {
				let keys = Object.keys(global_blox_namespace)
				let which = Math.floor(keys.length * Math.random() )
				return global_blox_namespace[keys[which]]
			}

			return global_blox_namespace[args]
		}

		// otherwise queries should be fancier hashes describing a possibly complex query, fail if this is not the case
		if(args.constructor != Object) {
			console.error("Blox query not understood")
			return null
		}

		// some crude wildcard support; a name may be supplied to establish a parent blox to search in

		let blox = this
		if(args.name == "*") {
			let keys = Object.keys(global_blox_namespace)
			let which = Math.floor(keys.length * Math.random() )
			blox = global_blox_namespace[keys[which]]
		}
		else if(args.name) {
			blox = global_blox_namespace[args.name]
		}
		// TODO ends with * and maybe regex

		// anything?

		if(!blox) {
			return 0
		}

		// if the name was passed in a hash then the expectation is to find other sub properties... kindof a hack

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
}

