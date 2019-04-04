# EXAMPLE

https://anselm.github.io/threejsfx/

# USAGE

Install and run any small http server and then visit the URL such as http://localhost:3000

  npm install http-server -g
  http-server -c 0

# USE CASE 1: TELLING STORIES

One use case is to allow 'storytellers' to easily tell 'stories'.

A storyteller is a person or group of people who may be novice designers, artists, writers. They may have very little technical expertise.

I imagine a storyteller needs to be able to use a 3d editor with property sheets similar to Unity3D, or at the very least edit a text file that describes their story, and beyond this have some ability to use a computer, to load, refresh, interact with a fairly modern circa 2019 graphics enabled 3d desktop, mobile phone and interactive HMD. They'll probably be leveraging tools like Glitch as well.

A story for our purposes is an immersive 3d 'thing' that has actions and behaviors that change over time. This can be games, narratives, vignettes, experiences, emotionally saturated fables, dreams, fantasies, visual ideas - anything they think is important and has meaning. We are surrounded by stories, from the people we see on the bus, to the music we listen to, to advertising, to our own experiences.

# USE CASE 2: COLLECTIONS OF WIDGETS

Another use case is that I want to build up a collection of reusable behaviors that are more complex that boxes, spheres or gltfs. My own interest is in being able to define objects with behaviors, that can be shared between applications, over a network or between programmers. In particular I would like to have collections of 3d clickable buttons, virtual pianos, cards with text layouts in 3d and other fancy interactions. I've been collecting examples of the kinds of widgets I'd like to be able to have here: [https://medium.com/@anselm/laundry-list-of-ux-patterns-in-vr-ar-24dae1e56c0a]

# USE CASE 3: SEMANTIC BEHAVIORS

Another use case is that I want to formally collect a world of basic animations, effects, policies or 'intent' that we somewhat take for granted but which do not actually exist in any 3d toolkit right now. We're pretty used to bouncing, color changing, animated effects in 2D (CSS has many of these). And intuitively we have a human conception of 'stand near that other thing'. Older tools such as VRML used to have some of these behaviors but no tool today seems to collect them. We often see effects like this laboriously programmed into in video games, TV shows and in other media and I'd like to collect these kinds of rules as a library.

In a full 3d "vocabulary" we have "nouns" (objects that you can see) and "verbs" (actions that act on those objects). Most users, storytellers or otherwise, will want to be able to easily decorate objects with reasonably intelligent animations or behaviors that we normally take for granted and are otherwise tedious to implement.

# ARCHITECTURE: COMPONENT MODEL

This app is based around a minimalist (100 lines of code) "Entity Component System". The ECS philosophy allows multiple independant programmers to decorate an object (such as a 3d scene graph object) with their own behaviors without having to think very much about the system as a whole or each others work. Internally the scene, all objects and all behaviors are all represented as decorations on bare objects, and all the objects are arranged to form the scene graph that threejs renders. The approach is lower level than AFrame, and the ECS model is independent of threejs.

# ARCHITECTURE: DOCUMENT DRIVEN

A document driven approach acts as the glue between three parties 1) a storyteller, 2) a programmer, and 3) a player. A storyteller describes a scenario using an text editor or a fancy property sheet editor in an authoring tool. A programmer writes code to implement new behaviors if needed. The playback engine loads up the document, instances the behaviors, and produces and animates the story for the player.

A storyteller scripts entire stories in a declarative format - 3d scenes and scenarios, with 3d objects, proximity based events, triggers and behaviors. A storyteller can make high level statements about characters and actors in their stories. They can place them based on semantic rules, having that placement be reasonably intelligent such as "be on the ground!" or "be near this telephone pole" and express high level intention on actor behavior such as "go stand near that other actor" or "bounce for a moment" or "look at the telephone".

Note that we will also expose programmatic or procedural behavior to the storytellers.

# COMPONENT LIST

Foundations

- [x] Formalize a description of each kind of object (a class or prototypical abstraction)
- [x] Formalize a document model that captures the description of each kind of object (a concrete documentation format)
- [x] Formalize an in-code component model that lets me load up a document into memory. It probably needs an ECS philosophy.
- [x] Demonstrate decorating an object with multiple components or behaviors that can run and act on it simultaneously
- [x] Demostrate loading a document into memory and producing an entire 3d scene with behaviors from that document
- [x] Support WebXR for Mozilla WebXR iOS
- [ ] Support WebVR for HMD's like Oculus Rift etcetera
- [x] Support Desktop flat panel display

Basic 3d Objects - that can be produced from a text file similar to AFrame with a similar ECS behavior decorator model

- [x] Demonstrate loading, placing, orienting and setting color and texture of a cube
- [x] Demonstrate an arbitrary 3d gltf - that is produced into the scene and is document driven from a formal schema
- [x] Demonstrate primitives, spheres, boxes, planes and the like with textures; demonstrate a photograph attached to a plane.
- [ ] Demonstrate an animated gif
- [ ] Demonstrate a movie
- [ ] Demonstrate a sound
- [ ] Demonstrate 360 images covering screen
- [ ] Demonstrate Partial Hemisphere 360 panos
- [ ] Demonstrate an idea of virtual occlusion to allow holes in walls and other similar VR effects
- [ ] Autoload from sketchfab and other sources using the Hubs proxy support
- [ ] Demonstrate text in world
- [ ] Flip book style animated image textures
- [ ] Constructive Solid Geometry

Basic Behaviors on Objects

- [ ] Hideable and showable
- [ ] Start stop video and audio
- [ ] Events that can trigger actions such as hide, show scenes, clumps of objects or individual objects based on event

Invent some kind of Smart Position / Orientation Concept

- [ ] Invent an idea of a position that can be an absolute XYZ, an LLA, a trackable object or the player or some other concept
- [ ] Dynamically Associate a scene, a clump or object with a smart place
- [ ] Add ideas of semantically meaningful locations to position, such as floors, walls etcetera
- [ ] Add ideas of semantically meaningful orientation, face player, face direction of travel
- [ ] Demonstrate be in front of player
- [ ] Demonstrate be on floor
- [ ] Demonstrate be on wall
- [ ] Demonstrate billboard
- [ ] Demonstrate be at eye level
- [ ] Demonstrate always be a reasonable size (ie; could decorate text with this so that it was always readable)
- [ ] Demonstrate smart arrow that points at something else

Events, Collision

- [ ] Refine and test a collision and event and scripting system to propagate events and actions; test proximity
- [ ] Active and inactive on most things; objects and behaviors; proximity based activity or inactivity; hiding and showing
- [ ] Multiple instancing in the grammar for ease of use - extend the grammar

Fancier Semantics - Make several small fun animated CSS like effects that can be used to draw attention to objects or to enhance realism

- [ ] Bounce
- [ ] Wobble
- [ ] Pulse colors
- [ ] Shrink
- [ ] Grow
- [ ] Rotate
- [ ] Stare (same as smart arrow)
- [ ] Draw a line between
- [ ] Leave field of view
- [ ] Leave screen
- [ ] Go near player or object
- [ ] Tweening

Basic Particle effect

- [x] 3d object fountain
- [ ] Shader 2d particles
- [ ] Perhaps even allow emitting of full objects ( like say balloons that have their own full behaviors or any other object )

Physics

- [x] Attach kinematic behaviors, bounce, stare, a line etcetera, continue to build out tweening and other behaviors
- [x] Attach physics behaviors
- [x] Attach physics based joints and constraint behaviors; test basic button like functionality
- [ ] Make a physical ground plane
- [ ] Make a basic physics falling capability
- [ ] Make a slider joint
- [ ] Make a hinge joint

Widgets

- [ ] A button - define a button as raw physics pieces; then try package up a button as a single reuable component
- [ ] A sensor that sends an event when hit - needs to support kinetic fingers, and audio etc
- [ ] A lever
- [ ] A dial
- [ ] A slider
- [ ] A carousel
- [ ] A globe
- [ ] A deck of cards
- [ ] A text string
- [ ] A nice card like layout of some information as a composable panel
- [ ] A piano key behavior
- [ ] A piano, route the events to an audio thing
- [ ] A wire to wire things together in a dataflow model visually corresponding to internal event relationships
- [ ] Pull in ATerrain and other kinds of things like that

System Services

- [ ] Flush current scene and load a new scene
- [ ] Networking / Multiplayer
- [ ] Multiplayer Session management and login
- [ ] An ability to place a thing somewhere interactively ; some kind of interactive mode - this is important
- [ ] A fancy property sheet editor

Some kind of bare bones navigation model

- [x] WebXR navigation model support; may need some thought around initial position in the scene
- [ ] Some kind of navigation model for self aside from orbit
- [ ] A mouse or other user input representation
- [ ] Leap motion fingers
- [ ] ARKit 6dof puck as a pen or hand

