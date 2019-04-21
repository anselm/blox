# NOTES AND IDEAS

# - rename "on_*" to "do_*" ? as in do_reset or do_goto or do_event? just for clarity?

		i am now specially reserving the word on_* to look for events...

# - I did want to copy blox.functions.on_something handlers directly up to blox.on_something ...

		this would purely be nice for document level scripting, it makes it simpler to say "thing.do_something"

# - continue to improve semantic choreography

	This tries to strike a balance between high level story telling and simplicity in a declarative grammar.
	It will probably have a lot of verbs.
	It's currently merged with sequencing of events over time - which arguably it should be distinct from

	The approach I've been taking is to define a BehaviorIntent which accepts a single event filled with lots of hints.
	The event can be a single request or an array of requests - that get played back over time.
	These are the powers I want:

	linear kinematic
		* accelerate in general

	linear inverse kinematic
		* go to entity
		* go to xyz
		* be at a height regardless of other stuff, like a height above ground
		- go to be in front of player
		- go behind (player sets what is behind)
		- go above (look at thing and get height)
		- go below
		- go generally nearish
		- be pinned to a wall at a height at a position

	angular
		* face forward [ this is not working as well as I would like although it does work ]
		- face a certain direction
		- face a relative direction (look left) waggle
		- face player ( billboard )
		- tilt { for waddling, or cartoon effects - like tilt left or tilt right }
		- spin in general

	collision?
		- fire an event when goal is reached?

	- other ideas -> waddle, tilt, spin, follow nearest person, avoid each other

	hornet: {
		intent: { // arguably consolidate with mesh... since we really want to tell stories...
			destination:"joe"
			height:3,
			above:true,
			near:true,
		}
	}

	hornet: {
		intent: [ // it could maybe accept an array of many commands for convenience as an option - executed over time
			{ time:1, destination:"joe",height:2, wall:2, forward:1, billboard:1, behind:1, above:1, below:1, near:1 }
			{ time:2, tilt:1, face:1, }
			{ time:3, reset:1 }
		]
	}

# - choreography of groups [ LOWER PRIORITY RIGHT NOW ]

	- the easiest way to time things is just write code
	- i don't want to replace javascript, but i want to pull out or emphasize the timeline itself
	- so where appropriate a grammar can be story level?
	- i want to separate verbs from nouns, so they can be applied to anything or i can group or find similar things
	- mass or group behavior - make 50 things do one dance together
	- any reasonable separation of behavior from being overly bound to objects
	- I'd like to be able to have a sequence or program made up out of successive intentions; a choreography
	- maybe i can give these little sequences names and save them the same way i save meshes and then refer to them like macros
	- although branching and turning completeness is risky, maybe events and resets are reasonable so a thing can loop behavior

	// a live query

	group = blox.query({monsters,all})
	group.add_behavior(intent) // - if i could save behaviors for later, and then apply them by reference this is doable

# [ DONE ] Usability feature - make it so that users don't have to declare a child group at all

	at the moment the parent blox namespace is directly polluted with behaviors and functions
	it might be nice to pollute it with children blox as well because this would make it easier for users to work in text
	so instead of

			{
				name:"parentblox",
				color:0xff0000,
				on_loaded:function(e) { console.log("i was loaded") }
				group: [
					{
						name:"childblox",
						color:0x00ff00,
						on_goto:function(e) { console.log("goto something") }
					}
				],
			}

	it would become this - which could be dangerous because now behaviors and blox are colliding - but easier

		{
			name:"parentblox",
			color:0xff0000,
			on_loaded:function(e) { console.log("i was loaded") }
			childblox:{
				color:0x00ff00,
				on_goto:function(e) { console.log("goto something") }
			}
		}

	and also i would expose this now as

		parent.childblox.color etc

	at the moment if i don't find a behavior i promote the thing to be a literal, but instead i could try treat it as a blox
	still it would be nice to have both literals and behaviors - it is not clear how to have both easily...
	i can tell functions apart by the keyvalue, i can tell behaviors apart by the reserved name on the key
	i cannot tell some literals apart - unless i disallow hashes as literals, or disallow literals entirely?

# [ DONE ] event chains and gathering up of events

	there's a pretty deeply woven idea that most activity in this system is event driven, and events percolate to named handlers
	this is so that users who work directly on documents can decorate a blox or a behavior with a handler and do work
	also programmers who build behaviors can decorate behaviors with handlers

	but what if i grab every event that i see - and push them up to the blox itself as event chains?
	so they are all still called, in the right way, but now i can support buckets of them - ordinary events like on_goto()

	right now events are distributed on blox themselves

	+ basically i want the blox itself to be the thing you talk to
	+ and i want to be able to call naked functions on the blox if the child had that function
		so although normally you can do
			myblox.intent.goto("mary")
		i would like
			myblox.goto("mary")

		and the only way i can see to do that is to promote the events up to the parent blox, scavenging them from the behavior
		and since everybody has their own events i have to have event chains...
		but if i did this then now blox become more powerful and more generic; they are imbued with the derived child methods

# [DECIDED/DONE] raw event arguments versus events always being a hash of properties - decided in favor of hashes

	- there is also a bit of a question about buckets of event arguments...

		i kind of would like to be able to do 

			joe = query(find a blox named joe)
			joe.on_goto("mary")

		but unnamed arguments are a hassle because events percolate generically with rollups of args and .blox is declared
		for example what looks like a single param is actually injected with the parent scope as a hint

			joe.goto({destination:"mary",blox:blox})

		that said... i could use the "this" operator and bind the parent blox to the behavior and then have unrolled args...

			function goto(...args) {
				this typeof BehaviorIntent
				this.blox typeof Blox
			}

		which is what most programmers would expect and be happy with

		* honestly I should probably stick with hashes but ALSO set the 'this' and the parent 'blox' correctly everywhere.
			AND ALSO pass the parent blox and the behavior as arguments
			AND userland functions that are naked - declared directly in the documents - I can bind(parentbehavior) on


# - XR SUPPORT broken?
# - gltf load consolidation to avoid duplicate loads
# - move the demos apart and make as separate files with links to source ( partially done )
# - make sure all demos work again
# - documentation

	- document examples of events better; i did this a bit
	- demonstrate scene switching
	- explore an idea of loading and unloading scenes and a scene counter

# [DONE] packages

	[ kinda done? ]

	- demonstrate loading a scene off disk dynamically, and loading just a blobs contents also
		- maybe ignore the second ’scene’ if it shows up? should scene be special?

	- packages?- does not really handle children though? maybe it does?


# - other

	- make a tamagotchi as a demo

	- can i take a sentence and turn it into letters and then turn those letters into particles and then blow it up?
	- sound! can i also do sound synthesis and wire sound things together?

	- scene startup; blair says scenes should start in front of player but that fights multiplayer ideas
	- multiplayer; think harder about this

	- need a virtual hand
	- need some real world placement of objects; can i make a demo of that? pull in arpersist power?

	- demonstrate a smart card, templated, super rich and super beautiful; examine lifecards
	- make a powerpoint on this whole app

	- animate the gltfs
	- i would like an orbit camera than can attach to other kinds of cameras
	- i would like to fix up the camera so it does not flicker

# a story to try

	- the turtle story
		- a person appears on the ground, in front of you
		- can you help me find my turtle
		- you have to tap on the text box
		- here’s a picture!
		- he wandered off!
		- and then you can look around and try find it? i guess?
		- and if you tap it then you get some end sequence? 



