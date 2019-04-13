# ABOUT

Blox is a pattern library for 3d experience creators. It lets you succinctly describe virtual reality and augmented reality experiences, games and stories. It leverages open web standards, ThreeJS and WebXR and introduces an ECS component philosophy to encourage re-use of behaviors. It works on desktop browsers, WebXR iOS, Vive, Oculus and Rift.

The intended audience is:

1) Novices that want to make high quality high performance interactive stories in 3d.

2) Storytellers who want to work faster and more accurately with a domain appropriate vocabulary, expressing semantic intent such as "be on the floor" or "tagalong with player" rather than "place a green cube at 0,0,0".

3) Designers who want a pattern library of 3d UX widgets. See https://medium.com/@anselm/laundry-list-of-ux-patterns-in-vr-ar-24dae1e56c0a

4) Veteran programmers who want a multi-collaborator foundation to be able to effectively organize, manage and build robust web, mobile and mixed-reality 3d applications.

# ONLINE EXAMPLES

https://anselm.github.io/blox/public

# TRY IT YOURSELF

Fetch from github and run any small http server in home folder and visit the URL such as http://localhost:3000

  npm install http-server -g
  cd public
  http-server -c 0

# MAKING YOUR OWN EXAMPLE SCENE

<html>
<body>
<script>
let myscene = {
	scene: 0,
	children: [
		{
			name:"mylight",
			light:0
		},
		{
			name:"mycamera",
			camera:0,
			orbit:0
		},
		{
			name:"mymex",
			mesh:{
				art:"box",
				position:{x:0,y:0,z:0},
				color:"red"
			}
		}
	]
}
let blox = new Blox(myscene)
</script>
</body>
</html>

# USER CONCEPTS

There are two core concepts 'blox' and 'behaviors'. A 'blox' is nothing more than a bucket and contains children behaviors. Behaviors define all the fun stuff, lights, camera and action. There is a special behavior called 'children' that lets a blox contain children blox. You can build a hierarchy of blox that corresponds exactly to what game developers call a scene graph.

You start out by declaring a scene blox (and any lights, camera and action). By convention a blox encapsulates one of your concepts, so if the concept of a light is important to you, then you put one light behavior in one blox. However you can if you wish group multiple lights in one blox.

The system is designed to be document driven, you describe what you want in a text file and then pass it to Blox() for instantiation. Often mostly reasonable default assumptions are made if not specified. A working scene may be as simple as this:

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

# ARCHITECTURE

	* Javascript based
	* DAG; blox are arranged in a directed acyclic graph
	* ECS pattern; blox are decorated with behaviors that do not need to be aware of each other
	* Minimalist; behaviord are described in naked classes that embody pure functionality without requiring inheritance
	* Clonable; blox can be cloned, added or deleted from the graph easily with a well defined API
	* Packages; blox can be grouped and loaded or cloned as a group or loaded deactivated
	* Events; blox can message component behaviors and each other
	* Scriptable; blox and their behaviors can be produced from a vanilla json based document
	* Scriptable code; ordinary javascript can be used lightweight work and handle events

# API

	blox.new                          Pass a string, another object or a filename to instance a parent blox and children bloxs
	blox.constructor                  Same as blox.new but callable from a live instance

	blox.parent                       Get the parent of a blox if any
	blox.children                     Get the children of a blox if any

		.add
		.remove
		.query({name:x,all:true,behavior:y,flat:true})

	blox.behaviors <- see if i can avoid building an array of; makes it easier to still add behaviors by hand
	blox.getByBehavior                Search a global flat namespace for first instance of a blox by behavior
	blox.getAllByBehavior
	blox.addBehaviorIfMissing		  Make sure certain behaviors exist
	blox.addBehavior
	blox.addBehaviors
	blox.removeBehavior
	blox.getBehaviors
	blox.getBehaviorByName
	blox.getBehaviorByProperty

	blox.sendEvent                    Send an event to all local behaviors that are capable of handling it

	* Note that behaviors are hashed and show up in blox as immediate properties; so a BehaviorMesh can be referenced as simply blox.mesh
	* Note that behaviors share the namespace with these reserved method names
	* Duplicate behaviors in one blox get a number added to them as in blox.mesh, blox.mesh1, blox.mesh2 starting from index 0

# CONVENTIONAL METHODS AND EVENTS ON BEHAVIORS

    events[]                          accumulation of events from the previous round
    event                             listen to all events
	tick                              used to update state
	ready                             sent when a blox is fully initialized
	activate                          sent to let an object activate or not
	deactivate
	lifespan                          it may be desirous to have duration be deeply featured as an event
	collide                           it may make sense to mark objects with their collision status as well

    * Send an event by using blox.sendEvent('tick',{...arguments})
	* Note that events can have any name but share a namespace with custom behavior properties
	* Note that if an object doesn't have an event handler, it can still look at accumulated events in events[]

