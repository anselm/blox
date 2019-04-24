// dynamic import support for firefox
import {importModule} from '../lib/importModule.js'

// Basic
import {BehaviorRenderer} from './BehaviorRenderer.js'
import {BehaviorScene} from './BehaviorScene.js'
import {BehaviorCamera} from './BehaviorCamera.js'
import {BehaviorLight} from './BehaviorLight.js'
import {BehaviorMesh} from './BehaviorMesh.js'

// Some objects
import {BehaviorSky} from './BehaviorSky.js'
import {BehaviorHeart} from './BehaviorHeart.js'
import {BehaviorText} from './BehaviorText.js'
import {BehaviorTextPanel} from './BehaviorTextPanel.js'

// Motion and physics, some of this may merge together
import {BehaviorAction,BehaviorActionKinetic,BehaviorActionTarget} from './BehaviorAction.js'
import {BehaviorPhysics, BehaviorPhysical} from './BehaviorPhysics.js'
import {BehaviorCollide} from './BehaviorCollide.js'

// Motion models for player
import {BehaviorOrbit} from './BehaviorOrbit.js' // TODO this one really needs to be rewritten
import {BehaviorWalk} from './BehaviorWalk.js'

// Some other behaviors
import {BehaviorLine, BehaviorBounce, BehaviorOscillate, BehaviorWander, BehaviorStare } from './BehaviorBounce.js'
import {BehaviorParticles} from './BehaviorParticles.js'
import {BehaviorProton} from './BehaviorProton.js'
import {BehaviorEmitter} from './BehaviorEmitter.js'

// Intents - which are fancy behaviors - may roll back into Mesh itself

// BehaviorAudio TBD

//
// This is a list of blox in a single flat namespace
// TODO at some point refine this to support returning all the blox with the same name
// Also support indexing by other properties for fast lookup, basically be a lightweight database
//

let UUID = 0
let global_blox_namespace = {}

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

	constructor(args) {
		let description = args.description
		let blox = args.blox
		if(!blox) {
			console.error("Error: must have a parent blox")
			return
		}
		// hack; normally these fields are set after but I set it early so that children can rely on group.blox.query()
		this.blox = blox
		blox.group = blox.behaviors.group = this
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
		if(!description) return
		if(description.constructor != Array) {
			// TODO later support loading children off disk
			console.error("Error: args must be an array")
			return
		}
		for(let i = 0; i < description.length; i++) {
			this.push(description[i])
		}
	}

	///
	/// Manufacture a new blox from a description
	///
	/// description = a json HASH describing a set of behaviors OR a string indicating a document to load 
	///

	push(description) {
		let child = new Blox({description:description,parent:this.blox})
		this.children.push(child)
		console.log("Group added a child " + child.name)
		return child
	}

	///
	/// Forward events to child blox
	///

	on_event(args) {
		this.children.forEach((child) => {
			// set the blox to current scope always
			args.blox = child
			child.on_event(args)
		})
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
		this._on_specific_named_event(args.name,args)	

		// also, pass any specialized events to any listeners generic on_event catch all
		if(args.name == "on_event") return
		this._on_specific_named_event("on_event",args)	
	}

	_on_specific_named_event(name,args) {
		// set the blox to current scope regardless of what it was
		args.blox = this.blox
		// find the chain
		let chain = this.chains[name]
		if(chain) {
			for(let i = 0; i < chain.length;i++) {
				let myhandle = chain[i]
				myhandle(args) // TODO arguably 0 could mean stop propagation OR I could make users make their own chains?
			}
		}
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
///		- a behavior that is a group of children blox (this could be optional but for now I hard-code it)
///		- a behavior that is a group of function callbacks for event support (also hard coded)
///
/// Most behaviors are generic, but I make a couple for myself that are built-in effectively
///		- BehaviorLoad -> let's me work around an async issue and lets me implement packages
///		- BehaviorGroup -> manages children
///		- BehaviorFunctions -> manages events and callbacks
///
///	The document loader has a series of steps
///		- if the child property is a behavior, then it asserts the behavior exists once only
///		- if the child property is a child blox (it can tell these apart) it adds it to its own group
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

		// add children powers now - convenient to hardcode this - but see below for a nicer way
		// this.behaviors.group = new BehaviorGroup({blox:this})
		// this.behaviors.group.blox = this
		// this.functions.push({label:"on_event",handler:this.behaviors.group.on_event,owner:this.behaviors.group})

		// might as well use the local machinery to do the above work
		this.add({label:"group"})

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
			let module = await importModule(behaviors.load)
			if(module) {
				let keys = Object.keys(module)
				if(keys.length && module[keys[0]]) {
					let behaviors_package = module[keys[0]]
					Object.entries(behaviors_package).forEach(([label,description])=>{
						this.add({label:label,description:description})
					})
				}
			}
			delete behaviors.load
		}

		// add the normal behaviors
		Object.entries(behaviors).forEach(([label,description])=>{
			this.add({label:label,description:description})
		})

		// notify children of this blox that this blox is itself ready - TODO maybe not needed?
		this.on_event({ name:"on_loaded", blox:this, loaded:this} )

		// notify everybody globally that this blox is loaded
		if(this.parent) {
			this.parent.on_event({ name:"on_blox_added", child:this })
		}
	}

	///
	/// Add a child property of some kind
	///

	add(args) {

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
				// looks like you're trying to modify an existing behavior - this would be fine if you loaded a package
				console.log("editing " + className)
				classInst = previous
				isNew = false
				break
			}
		}

		// Try find a class constructor for what appears to be a behavior
		if(!classInst) {
			try {
				classRef = eval(className)
			} catch(e) {
				classRef = 0
			}
		}

		// Populate the child behavior with the passed description
		if(classRef || classInst) {

			// advise that the behavior will exist soon
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
				// I'm trying an idea of promoting all behavior functions into the functions collection
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
			// TEST - make it easier for users to make documents by declaring children directly on the parent
			description.name = label
			if(!this.behaviors.group) {
				console.error("Blox:: injecting children directly is missing a group")
			}
			let blox = this.behaviors.group.push(description)
			return blox
		}
	}

	///
	/// Moderately fancy query support for blox OR behaviors of a blox - always returning a group of behaviors
	///
	/// args may be a string, in which case a global namespace is searched for the blox.name
	/// args may be hash containing a 'property' in which case the assumption is to look for children behaviors with that field
	/// TODO extend as needed over time
	///

	query(args) {

		// as a service to users, if a query is just a single string then search a global namespace for that blox.name
		if(typeof args == 'string') {

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

