# BLOX INTRODUCTION

Blox lets you tell stories in 3d.

You edit an ordinary text file to describe 3d objects, their relationships to each other, what they do over time, and then players can play it back as an interactive 3d experience using blox.

Blox focuses on the simplest possible grammar to fully capture high level storytelling concepts. It is built on top of ThreeJS and designed to run anywhere, on desktop browsers, in VR for the Oculus and the Rift and on mobile augmented reality such as WebXR-iOS.

# EXAMPLES

Click [here for a link to a rollup example](https://anselm.github.io/blox/public) . You can also run the [WebXR-iOS viewer on the iPhone](https://itunes.apple.com/us/app/webxr-viewer/id1295998056?mt=8) and if you have an iPhone 8 or higher you can see the augmented reality version of the same example. Or you can also build the [WebXR-iOS version from scratch](https://github.com/mozilla-mobile/webxr-ios). Note that this is all early work and subject to arbitrary changes. It's not stable by any means yet. Also note - VR support for the Rift and Oculus is not up to date (I've been focusing on desktop and XR).

# TRY IT YOURSELF

Fetch from github and run any small http server in home folder and visit the URL such as http://localhost:3000

  npm install http-server -g
  cd public
  http-server -c 0

# USER CONCEPTS

You describe a 3d story by arranging a series of blox in a text file. A typical description is something like this:

	{
		tree: { position: {x:0, y:0, z:0 }, art:"art/tree" },
		light: { color: "yellow" },
		player: { controls: 1, art:"art/fox" },
		bunny: { follow: "player", walks: 1, art:"art/bunny" },
		flowers: { art: "art/lower" },
		clone: { obj:"flowers", copies: 10, placement: {10,0,10} },
		bee: { visit: "flowers*", art: "art/bee" },
		bird: { near: "tree", flies: 1, avoid: "bee", art: "art/bird" }
	}

You may decorate each blox with behaviors that for example can make the bunny follow you, or that give your player the power to walk around or other rich behaviors not shown here. You can be very specific, such as saying exactly where something is in XYZ, but you can also just say that something is "near" something else or attached to something else - or above something else.

It's so important to have a story appropriate grammar, one that focuses on the "verbs" or relationships between things, not just the things themselves. Interactive stories can be harder to create than say filming a movie or writing a book because most behavior is emergent, rather than being forced. You need to be able to focus on, setup and balance the preconditions just right to naturally produce the outcomes you want. Setting up the actors, events and triggers and wiring these all together to lead the player through a narrative arc or experience is itself a significant amount of work. Also, since these documents can be very large it's important that they be clear, terse, searchable and easy for multiple people to collaborate on.

Often a designer works with technical team members who provide heavy lifting. Any framework that you're using as a designer also has to be logical for them as well - in order for them to provide you with new verbs and powers. In a sense the engine is the shared language between design, engineering and production. A big part of the focus of this engine is having an architecture that is clean and consistent from bottom to top - that isn't just nice for designers but also nice for developers and that plays back well.

# TECHNICAL CONCEPTS

A typical video game engine today is built out of a number of well defined and well understood pieces. At a "designer level" theres a game grammar, some kind of high level authoring tool, some kind of file format and lightweight scripting. Often we want bi-directional editing; being able to edit in a text file or in a nice graphical user interface. And we have a strong desire for a very formal model of what each object is and what the properties of those objects can be. At an "engineering level" there are strong concepts of being able to walk the multiple "live" state graphs of the active scene. Being able to search and query, do collision detection, formally route events between objects and some kind of scene-graph to organize objects within. At an even lower level there is a formal concept of an object itself; often based on either an idea of classes or prototypical instances, there's a component model for objects and behaviors, there's some kind of heavyweight scripting for describing built in behaviors. And at the very bottom there's some kind of 3d engine, a way to load assets and a way to do 3d math, object placement, physics, animation and user input.

This framework mirrors those common patterns. These are the concepts this library is built around:

1) BLOX. The system as a whole is built out of blocks - hence the name. Your game grammar or game vocabulary is formed out of the arrangement of blox into a scene, and each blox embodies multiple individual behaviors that work together to enact the experience you are creating. A blox by itself is just an empty bucket and the contents determine the behavior. For example you might have a block that has a visible mesh, and an animation behavior, and a light, and a few other things. A blox is a very general concept, but the idea is that for each distinct concept in your project you have one blox to represent it.

2) BEHAVIOURS. Each blox can contain arbitrary behaviors. An example behavior could be "show a red cube" or "stare at the player". Behaviors are where all the magic happens. The expectation is that you can use a rich library of existing behaviors, or you can write your own. The design principle at work is that if you're doing any fancy code logic that is reusable then what you should do is write a behavior so that non-programmers can use your work. Behaviors expose variables and properties so that novices can adjust or tweak your behavior. Good examples of a behavior are BehaviorMesh (which loads gltfs) and BehaviorParticles (which implements a very simple particle effects engine). By convention behaviors are kept in a folder called 'behaviors' (see the list of behaviors for more). (For the technically minded a behavior is the same as a component in an entity component system.)

3) EVENTS. There are many built in events that you can listen to such as when an object is about to be created, or has been created, or is attached to the scene graph. Normally every single behavior in a blox gets a copy of the event that is sent to that blox. If you want to do some quick and dirty scripting however you can decorate a blox itself with raw event handlers. This can be convenient dealing with routing events around dynamically. Good examples of events are "on_load" and "on_tick" (see the list of events for more).

4) SCENE-GRAPH. Blox may have children, and blox form the scene-graph of your application. They're not quite the same as ordinary scene-graph primitives however because they can aggregate arbitrary unrelated behaviors inside themselves. You'll typically start out by declaring a 'scene' blox. That scene will contain children blox that describe lights, camera and action. 

5) QUERIES. There'll often be a need to find what is nearby, or to find a parent, or a specific behavior. A query engine is built in for generalized queries both within a current blox or generally through the scenegraph. An example of a query is blox.query({property:isObject3d}) or blox.query({instance:BehaviorAudio}).

6) DOCUMENT MODEL. The main way you author stories is by editing a text file. You describe your story, the assets, which behaviors you want, and then you pass that single document to a new blox and it produces that experience for you. It starts up the renderer, sets up your scene and starts running the events (see the examples and example documents for more).

7) PACKAGES. You can dynamically load or reference 'packages' which are any collection of blox that you like to re-use over and over. There's really no difference between a package and the starting document that bootstraps your project. By convention packages are kept in a folder called 'blox' (see the example packages for more).

8) FRAMEWORK. With all these pieces together this library defines a framework or general philosophy for building user experiences. The framework is intended to be used by different participants in different ways. From a designer perspective you use it to arrange your story in a story appropriate grammar, at the right level of semantic expression as suits storytelling. From a programmer perspective you define new behaviors that designers can leverage. From an asset creator perspective there are conventions for asset management. From a player perspective the framework loads and presents the experience to the player.

# BLOX TECHNICAL CONCEPTS

A blox is intended to follow the Entity Component System model, where the base class is largely empty to start with, and all the capabilities are 'decorations' that come in later on. But, there is a tension between that idealized model and the practical day to day job of writing an application or game. When you're trying to quickly describe what you want something to do, you don't want to do a lot of fancy de-referencing. Imagine you have a blox that has a 3d model attached to it in the form of a mesh. You want to be able to cognitively say something like blox.position.x = 12 - not blox.mesh.position.x = 12 .

What I'm doing in this implementation that is slightly different is that I'm treating the blox itself as a namespace that can be overloaded with multiple kinds of named child properties. Child behaviors show up directly on the blox. So you have blox.mesh not blox.behaviors.mesh . And child functions also are promoted to the top, so that blox.on_tick() calls blox.mesh.on_tick() and blox.some_other_power.on_tick() rather than you having to call each one. Also, you can promote (by convention) any properties that you feel deserve to be in a top level namespace. Right now that means blox.position and blox.quaternion work, rather than having to dereference their parent mesh.

# CORE BEHAVIORS

	[x] Renderer
	[x] Scene
	[x] Camera
	[x] Light
	[x] Sky
	[x] Heart
	[x] Mesh
	[x] Text
	[ ] TextPanel (needs work)
	[ ] Sound
	[ ] Pano

# FORWARD KINEMATICS / SIMPLE PHYSICS

	[x] Forces -> acceleration, mass
	[x] Lifespan -> objects can have a time to live
	[x] Overlap -> just AABB right now

# INVERSE KINEMATICS / SEMANTIC INTENT

	[x] Basic forces and impulses
	[x] Bounce
	[x] Tween
	[x] Line
	[x] Wander
	[x] Stare / Lookat / Billboard
	[x] In Front Of / Tagalong / Follow
	[ ] Be at a given height EyeLevel / Floor
	[ ] Be on ground surface
	[ ] Be on wall surface
	[ ] Sizeable (Always be visible)
	[ ] Wobble
	[ ] Shrink
	[ ] Grow
	[ ] Fade
	[ ] Rotate
	[ ] Hide
	[ ] Between
	[ ] Timer
	[ ] Latch Timer

# CONSTRAINT BASED PHYSICS (AMMOJS)

	[x] Physics Object
	[x] Physics Joint
	[x] Physics Hinge
	[x] Collision

# NAVIGATION AND INPUT

	[x] Walk
	[ ] Orbit
	[ ] Hand 6dof puck
	[ ] gaze
	[ ] mouse
	[ ] leap motion

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
	[x] on_loaded
	[ ] on_activate
	[ ] on_deactivate
	[ ] on_lifespan? (it may make sense to give things innate lifespans)

	* Note that events can have any name but share a namespace with custom behaviors names, the convention is on_*

# INTERNAL API

	blox.new                          Pass a string, another object or a filename to instance a parent blox and children bloxs
	blox.constructor                  Same as blox.new but callable from a live instance
	blox.parent                       Get the parent of a blox if any
	blox.group                        Get the children of a blox if any
	blox.behaviors                    The behaviors associated with a blox
	blox.functions                    The event handlers associated with a blox
	blox.query                        Fancy query support for finding children blox or behaviors
	blox.on_event                     A generic event publishing mechanism

	* Note that behaviors show up in blox as immediate properties; so a BehaviorMesh can be referenced as simply blox.mesh
	* Note that only one of a kind of a behavior is allowed in one Blox at a time

