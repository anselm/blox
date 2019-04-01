# EXAMPLE

https://anselm.github.io/threejsfx/

# USAGE

Install your own node server such as

  npm install http-server -g

And then run this...

  http-server -c 0

The script that drives this has a couple of simple examples.

# ABOUT

I'm interested in a rich 3d world of working virtual objects that you can interact with. I imagine a scenario where you can move your virtual fingers around and toggle, move, adjust and do other operations to objects that can respond intelligently and in a fashion similar to the real world. Ideally you would have a compositional work environment that isn't fully pre-programmed but rather something that you yourself have put together as suits your own personal needs. Just like a real desktop, workbench or traditional desktop operating system display - except in virtual reality.

This of course is a multi-stage goal; at first I just want to do the simplest possible thing - like have a single button that you can click that turns on a single virtual light.

I see that broader goal as needing these kinds of questions answered and this piece of code is a testbed for those ideas:

	1) Components? What is a good way to express and share a concept of a 3d behavior or object. For example you may have invented a nice VR piano, or some other kind of instrument, and you want to be able to share that entire 'thing' with other things and perhaps even plug them into each other and send messages between them.

	2) Grammars? What is a good way to share and publish a document centric or text based representation of an object? I'm especially interested and have a preference for a javascript based description because it can be easily inhaled by modern browsers. But I'm also interested in the most utterly succinct expression of an object.

	3) What _ARE_ some useful components in 3d? I've been collecting a list of examples of 3d interfaces and widgets with an eye towards reproducing some of those in a family of components that could all work together.

	https://medium.com/@anselm/laundry-list-of-ux-patterns-in-vr-ar-24dae1e56c0a

	4) Below the level of entire objects with fancy behaviors, there's a world of simpler basic animations and effects that we somewhat take for granted. We're pretty used to bouncing, color changing, animated effects in 2D (CSS has many of these). And VRML used to have these kinds of effects too. Also we often see them in TV shows and in other media. How can we make it very easy for people to express these kinds of effects? How can other objects be easily decorated with these small effects?

Overall I see a "vocabulary". We have "nouns" (objects that you can see) and "verbs" (actions that act on those objects). As this matures I imagine that there will also be other kinds of glue and wires that relate things to each other. For example a piano may send notes to an audio box to make sound.

# VERBS

Here are some kinds of simple things that people might want to be able to easily express:

	* have something bounce
	* have something fly around in a kind of annoying way nearby
	- have something shrink to nothing
	- have something show up or go away
	- have something maybe spin a bit
	- or change color
	- or stretch
	- have something look at something arbitrary
	- stick to a wall
	- stick to floor
	- eyelevel
	- hover
	- billboard
	- have something do something when hover, gaze or touch event occurs


# CORE PROPS

At the end of the day these behaviors are competing over changing core properties of an object... such as:

	- position
	- orientation
	- scale
	- color
	- geometry
	- material
	- visibility / transparency

# SEMANTIC PROPS

Also one can imagine meta-properties that are somewhat adjacent to core properties:

	- target [ floor, wall, another object, in front of user, eye level etc... as updated by a component ]
	- velocity
	- facing [ face user, face target ]
	- size [ always visible, always be small, always be largish, be larger than something else ]

At a low level a behavior is just acting on some properties over time in simple ways with simple rules:

	- change a value to a new value
	- set velocity of a value change
	- ease in, ease out ( acceleration curves of various flavors )
	- bounce or oscillate
	- establish a point in space that we want the object to rotate to (forward vector + upright vector)
	- establish a point in space that we want the object to translate to

But I think I want behaviors to understand what they are acting on since an [R,G,B] is different from an [X,Y,Z].

# TODO

	- introduce fingers and or a mouse or leap motion

	- button limiter constraints so that the button triggers after a certain depth

	- kinetic mode for fingers so that they can pass through a button

	- research an elegant way to express a trigger

 	- an actual mouse or something a control

 	- scripting wires to other objects

 	- a piano? with hinges?

	- macros or references so i can build things faster, prototypes

	- property sheets for editors

	- should have some error checking, and or force in instances of required things like position where they do not exist

	- it might be nice to lookup things more easily, like to find the scene or the like in a namespace search?

	- the grammar conflates the name of the object with the type - can I support a richer concept??
			position: [3,3,3] versus
			position: new THREE.Vector3(3,3,3)
			position-THREE.Vector3: [3,3,3] 
			builder: { class:THREE.Vector3, args:[x,x,x] }

	- introduce csg
	- introduce audio

# SCRIPTING - tbd

A topic of research is what is a good way to allow a higher level glue scripting that relies on this framework?

	// making
	let blob = world.find("mywall")
	blob.mybutton = new BehaviorButton(arguments,blob)

	// events?
	blob.onCollide = function(results) {
		console.log("tree was hit")
	}

	// how about timer based triggers?

# CARDS - tbd

I want to put some special focus into small card layouts for presentation

# COLLISION - tbd

	- gaze
	- proximity
	- buttons have an outer contact and an inner fully pressed mode

# EVENTS - tbd

	- TBD
