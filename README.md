# EXAMPLE

https://anselm.github.io/threejsfx/

# USAGE

Install your own node server such as

  npm install http-server -g

And then run this...

  http-server -c 0

The script that drives this has a couple of simple examples.

# ABOUT

See my longer thoughts at:

[https://medium.com/@anselm/laundry-list-of-ux-patterns-in-vr-ar-24dae1e56c0a]

I'm interested in a rich 3d world of working virtual objects that you can interact with. I imagine a scenario where you can move your virtual fingers around and toggle, move, adjust and do other operations to objects that can respond intelligently and in a fashion similar to the real world. Ideally you would have a compositional work environment that isn't fully pre-programmed but rather something that you yourself have put together as suits your own personal needs. Just like a real desktop, workbench or traditional desktop operating system display - except in virtual reality.

This of course is a multi-stage goal; at first I just want to do the simplest possible thing - like have a single button that you can click that turns on a single virtual light.

I see that broader goal as needing these kinds of questions answered and this piece of code is a testbed for those ideas:

1. Components? What is a good way to express and share a concept of a 3d behavior or object. For example you may have invented a nice VR piano, or some other kind of instrument, and you want to be able to share that entire 'thing' with other things and perhaps even plug them into each other and send messages between them.

2. Grammars? What is a good way to share and publish a document centric or text based representation of an object? I'm especially interested and have a preference for a javascript based description because it can be easily inhaled by modern browsers. But I'm also interested in the most utterly succinct expression of an object.

3. What _ARE_ some useful components in 3d? I've been collecting a list of examples of 3d interfaces and widgets with an eye towards reproducing some of those in a family of components that could all work together.

4. Below the level of entire objects with fancy behaviors, there's a world of simpler basic animations and effects that we somewhat take for granted. We're pretty used to bouncing, color changing, animated effects in 2D (CSS has many of these). And VRML used to have these kinds of effects too. Also we often see them in TV shows and in other media. How can we make it very easy for people to express these kinds of effects? How can other objects be easily decorated with these small effects?

Overall I see a "vocabulary". We have "nouns" (objects that you can see) and "verbs" (actions that act on those objects). As this matures I imagine that there will also be other kinds of glue and wires that relate things to each other. For example a piano may send notes to an audio box to make sound.

# USE CASES - ongoing

- [x] Invent some kind of component model; ECS like, below threejs, allow behaviors to decorate generic neutral nodes
- [x] Invent a user friendly declarative file format that can fully describe a scene, camera, controls, lights etc
- [x] Make an example document that can load up various objects, scene, lights, cameras, gltfs as a nice scene graph

- [x] Attach kinematic behaviors, bounce, stare, a line etcetera, continue to build out tweening and other behaviors
- [x] Attach physics behaviors
- [x] Attach physics based joints and constraint behaviors; test basic button like functionality

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

- [ ] Some bare bones particle effects
- [ ] Refine and test a collision and event and scripting system to propagate events and actions
- [ ] Audio

- [ ] A mouse or other user input representation
- [ ] Leap motion fingers
- [ ] ARKit augmented reality style pose tracking with a 6dof puck as the hmd

- [ ] Invent css like kinematic behaviors; shrink, grow, spin, stretch, wobble, pulse colors
- [ ] Invent more behaviors, stick to wall, stick to floor, billboard, eyelevel, always be visible, always be readable etc

- [ ] Multiple instancing in the grammar for ease of use - extend the grammar
- [ ] Constructive solid geometry
- [ ] A property sheet editor
- [ ] Networking / Multiplayer with session management and login

