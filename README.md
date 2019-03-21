# EXAMPLE

https://anselm.github.io/threejsfx/

# USAGE

Install your own node server such as

  npm install http-server -g

And then run this...

  http-server -c 0

The script that drives this has a couple of simple examples.

# ABOUT

This is an in-code exploration of how to easily express a bunch of simple kinds of animations or behaviors on top of 3d objects in 3js. I've jammed in physics as well, but I can see use cases for a non physics based kind of approach.

We're pretty used to bouncing, color changing, animated effects in 2D (CSS has many of these). And VRML used to have these kinds of effects too. Also we often see them in TV shows and in other media. How can we make it very easy for people to express these kinds of effects?

Here's the kinds of things that people might want to be able to easily express:

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

At the end of the day these behaviors are competing over changing core properties of an object... such as:

	- position
	- orientation
	- scale
	- color
	- geometry
	- material
	- visibility / transparency

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

So... I think the best pattern is to have high level behaviors we can expose as property sheets.
These behaviors won't necessarily all be able to always collaborate with each other.... but many will...
Also I think we can introduce a concept of game like systems behaviors like "black holes" or "wind mills"

TBD
	? How about collisions? on focus, on hover, collisions between things, proximity?



