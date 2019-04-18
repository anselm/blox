# BLOX INTRODUCTION

Blox is a document driven framework that lets you tell 3d stories.

You can make a text file that describes 3d objects, their relationships to each other, what they do over time, and play it back as an interactive 3d experience that anybody can enjoy.

It's designed to run anywhere, on desktop browsers, in VR for the Oculus and the Rift and on mobile augmented reality such as WebXR-iOS.

# EXAMPLES

You can see examples of both scenes and source descriptions at [https://anselm.github.io/blox/public]

# TRY IT YOURSELF

Fetch from github and run any small http server in home folder and visit the URL such as http://localhost:3000

  npm install http-server -g
  cd public
  http-server -c 0

# CORE CONCEPTS

You describe a scene by arranging a series of blox. A typical scene is something like this (the actual grammar is a bit different but this is what is going on conceptually):

	[scene itself]
		[the player]
		[a light]
		[a bunny]
		[a tree]
			[a bird in the tree]

Once you've defined your scene you can decorate each of those blox with unique and responsive behaviors. You can make the bunny run around the tree, or respond to the player, and you can set basic rules such as "the bunny should stay on the ground".

An important aspect of what blox does is it helps you think of a story in a story appropriate grammar; you can issue high level directives, like a film director, telling an object to "go to the nearest tree" or "run away from the player". At the same time these directives are formal and efficient, and this tool is intended for high quality interactive experience design and development.

I wrote this framework because I want to be able to tell stories that have progression over time. As a veteran game developer I also wanted something that was near optimal, that could be used as a framework for an industrial strength commercial video game - but that was also accessible to creatives and designers who themselves are not technical.

# TECHNICAL CONCEPTS

There are the concepts this library is built around:

1) BLOX. The system as a whole is built out of blocks - hence the name. A block just a bucket which contains different behaviors. For example you might have a block that has a visible mesh, and an animation behavior, and a light, and a few other things. A blox is a very general concept, but the idea is that for each separate concept in your project you have one blox. It may be worth noting that at this level the system doesn't even know that it is a 3d rendering engine. (For the technically minded the concept of a blox corresponds to an entity in an entity component system.)

2) BEHAVIOURS. Each blox can contain arbitrary behaviors. An example behavior could be "show a red cube" or "stare at the player". Behaviors are where all the magic happens. The expectation is that you can use a rich library of existing behaviors, or you can write your own. The design principle at work is that if you're doing any fancy code logic that is reusable then what you should do is write a behavior so that non-programmers can use your work. Behaviors expose variables and properties so that novices can adjust or tweak your behavior. Good examples of a behavior are BehaviorMesh (which loads gltfs) and BehaviorParticles (which implements a very simple particle effects engine). By convention behaviors are kept in a folder called 'behaviors' (see the list of behaviors for more). (For the technically minded a behavior is the same as a component in an entity component system.)

3) EVENTS. There are many built in events that you can listen to such as when an object is about to be created, or has been created, or is attached to the scene graph. Normally every single behavior in a blox gets a copy of the event that is sent to that blox. If you want to do some quick and dirty scripting however you can decorate a blox itself with raw event handlers. This can be convenient dealing with routing events around dynamically. Good examples of events are "on_load" and "on_tick" (see the list of events for more).

4) SCENE-GRAPH. Blox may have children, and blox form the scene-graph of your application. They're not quite the same as ordinary scene-graph primitives however because they can aggregate arbitrary unrelated behaviors inside themselves. You'll typically start out by declaring a 'scene' blox. That scene will contain children blox that describe lights, camera and action. 

5) QUERIES. There'll often be a need to find what is nearby, or to find a parent, or a specific behavior. A query engine is built in for generalized queries both within a current blox or generally through the scenegraph. An example of a query is blox.query({property:isObject3d}) or blox.query({instance:BehaviorAudio}).

6) DOCUMENT MODEL. The main way you author stories is by editing a text file. You describe your story, the assets, which behaviors you want, and then you pass that single document to a new blox and it produces that experience for you. It starts up the renderer, sets up your scene and starts running the events (see the examples and example documents for more).

7) PACKAGES. You can dynamically load or reference 'packages' which are any collection of blox that you like to re-use over and over. There's really no difference between a package and the starting document that bootstraps your project. By convention packages are kept in a folder called 'blox' (see the example packages for more).

8) FRAMEWORK. With all these pieces together this library defines a framework or general philosophy for building user experiences. The framework is intended to be used by different participants in different ways. From a designer perspective you use it to arrange your story in a story appropriate grammar, at the right level of semantic expression as suits storytelling. From a programmer perspective you define new behaviors that designers can leverage. From an asset creator perspective there are conventions for asset management. From a player perspective the framework loads and presents the experience to the player.

# FILE FORMAT

The system is designed to be document driven, you describe what you want in a text file and then pass it to Blox() for instantiation. Often mostly reasonable default assumptions are made if not specified. A working scene may be as simple as this:


```
<html>
<body>
<script>

/// this is a scene blox decorated with a scene behavior and having some children blox
export let myscene = {
	name: "myscene",
	scene: 0,

	// here are some children blox
	children: [

		// this is a light
		{
			name:"mylight",
			light:0
		},

		// this is a camera, it's optional to declare a camera
		{
			name:"mycamera",
			camera:0,
			orbit:0
		},

		// this is a reference to a separate blox stored on disk
		"./blox/cherry_tree.js",

		// this is a piece of art placed on the ground loaded off disk as a gltf
		// it listens to the on_tick method and rotates a bit every frame
		// it listens to collision events and moves the art to viewer eye level
		{
			name:"./art/hornet",
			mesh:{
				art:"box",
				position:"ground",
				color:"green"
			},
			on_visible:"./scripts/visible_handler.js",
			on_load:function(e) { console.log("just woke up") },
			on_tick:function(e) { e.blox.mesh.rotate.y+=0.1 },
			on_overlap:function(e) { e.blox.position.slerp("eyelevel") }
		}
	]
}

// this kicks the whole system into starting up; a scene node force launches a renderer and a display
let blox = new Blox(myscene)

</script>
</body>
</html>
```

# CORE BEHAVIORS

	[x] Renderer
	[x] Scene
	[x] Camera
	[x] Light
	[ ] Sound
	[x] Sky
	[ ] Pano
	[x] Heart
	[x] Mesh
	[x] Text
	[ ] TextPanel

# SIMPLE PHYSICS

	[ ] Forces -> maybe separate from mesh; maybe add gravity/mass also as a built in
	[ ] Lifespan -> may be useful enough to be deeply imnplicit?
	[x] Collide -> can I support AABB

# CONSTRAINT BASED PHYSICS

	[x] Physics Object
	[x] Physics Joint
	[x] Physics Hinge

# NAVIGATION AND INPUT

	[x] Walk
	[ ] Orbit
	[ ] Hand 6dof puck
	[ ] gaze
	[ ] mouse
	[ ] leap motion

# SEMANTIC

	[x] Bounce
	[ ] Tween
	[x] Line
	[x] Wander
	[x] Stare
	[ ] Follow
	[ ] Goto
	[ ] EyeLevel
	[ ] Floor
	[ ] Wall
	[ ] Billboard
	[ ] Tagalong
	[ ] Sizeable
	[ ] Wobble
	[ ] Shrink
	[ ] Grow
	[ ] Fade
	[ ] Rotate
	[ ] Hide
	[ ] Between
	[ ] Timer
	[ ] Latch Timer

# PARTICLE EFFECTS

	[x] Emitter <- Rename as duplicate or clone?
	[x] Particles
	[ ] Proton

# WIDGETS

	[ ] button
	[ ] dial
	[ ] lever
	[ ] slider
	[ ] carousel
	[ ] globe
	[ ] terrain
	[ ] deck of cards
	[ ] chessboard
	[ ] piano
	[ ] wires

	[ ] networking
	[ ] multiplayer session management

# CORE EVENTS

	[x] on_tick
	[x] on_behavior_will_add
	[x] on_behavior_added
	[x] on_overlap
	[x] on_entered
	[x] on_exited
	[x] on_event (generic catch all)
	[ ] on_ready
	[ ] on_activate
	[ ] on_deactivate
	[ ] on_lifespan
	[ ] on_loaded

	* Note that events can have any name but share a namespace with custom behaviors names, the convention is on_*

# INTERNAL API

	blox.new                          Pass a string, another object or a filename to instance a parent blox and children bloxs
	blox.constructor                  Same as blox.new but callable from a live instance
	blox.parent                       Get the parent of a blox if any
	blox.group                        Get the children of a blox if any
	blox.behaviors
	blox.functions
	blox.query                        Fancy query support for finding children blox or behaviors
	blox.on_event                     A generic event publishing mechanism

	* Note that behaviors show up in blox as immediate properties; so a BehaviorMesh can be referenced as simply blox.mesh
	* Note that only one of a kind of behavior is allowed in one Blox at a time

