
///
/// This is an instance of a blox and demonstrates the kinds of things an artist can express
///

/// you can use variables and math

let player_height = 2 * 1.0 - 0.1

/// you can declare things and reference them over and over

let useful_place = {x:0,y:0,z:0}

///
/// The name of this blox is defined here as well as its properties
///

export let cherry_blossoms = {

	// a name is ripped from the declaration above - but can also be set here
	name:"really_my_cherry_blossoms",

	// decorate the blox with a scene behavior - this is mandatory if you are doing a 3d engine view
	scene: 0,

	// an optional light
	mylight: {
		light:{
			position:{x:-30,y:40,z:-50},
			color:0xFFFFFF,
		}
	},

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Stars, Trees, Ground and falling blossoms
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	"myskybox":	{
		sky:{
			art:"./art/eso0932a.jpg",
			visible:false
		},
		on_behavior_added: function(args) {
			// hack - only show if not in xr mode
			console.log("detect xr")
			if(!window.webkit && args.blox.mesh) args.blox.mesh.visible = args.blox.mesh.material.visible = true
			return true
		},
	},

	"myground":	{
		mesh:{
			art:"sphere",
			position:useful_place,
			scale:{x:300,y:0.1,z:300},
			color:0xccffee,
			//texture:"./art/carnations.jpg"
			visible:false
		},
		on_behavior_added: function(args) {
			// hack - only show if not in xr mode
			console.log("detect xr")
			if(!window.webkit && args.blox.mesh) args.blox.mesh.visible = args.blox.mesh.material.visible = true
			return true
		},
	},

	// a tree
	tree: {
		mesh:{
			art:"./art/cherry_tree",
			provenance:"https://sketchfab.com/3d-models/cherry-tree-2dc7230267bd4de781db5f22c35d5876",
			position:{x:0,y:15,z:0},
			scale:{x:5,y:5,z:5},
			color:0xffffff,
		},
	},

	"mypetal": {

		// a piece of art - it also sets some globals on blox such as blox.mesh blox.position blox.quaternion
		heart: {
			art:"ignore", // TODO this is a bit inelegant
			color:0xffffff,
			position:{x:0,y:20,z:0},
			scale:{x:5,y:5,z:5},
			doublesided:1,
			transparent:1
		},

		// a behavior that does tumbling
		actionTumble: {
			// set in a tumble motion
			tumble:1,
		},

		// a behavior that does a lifespan with reset - when done it calls on_reset() on this entire blox
		actionLifespan: {
			// limit lifespan; will re-run this entire action rule once this expires
			lifespan:{min:100, max:150},

			// randomize the color
			color_gradient:{min:0x00ff0000,max:0x00ff0000,end:0x00000000}, // minimum color, maximum color, end color

			// randomize the scale
			scale_range:{min:1,max:1,end:0},
		},

		// a behavior with a variety of simple physics
		actionKinetic: {
			// sets a position - overriding what was set in the mesh above if any
			position:{x:0,y:10,z:0},

			// sets a starting velocity and direction
			velocity:{x:0,y:10,z:0},

			// global friction acting against velocity - by default it is 0.9
			// friction:0.9

			// adds a force; forces can have properties that allow them to dampen over time or be one frame events 
			force:{name:"gravity",x:0,y:-1,z:0,friction:0,impulse:false},

			// adjust the position - make it randomized over an area
			disperse:{radius:{x:20,y:0,z:20}},

			// set the velocity (would override above) - make it focused within a nozzle area and direction
			//nozzle:{axis1:-50,axis2:50,spin1:0,spin2:360},

			// this may be obsolete TODO remove
			//speed:{min:0.4,max:0.5,end:-1}, // minimum start speed, maximum start speed, ending speed if any }

		},

	},

	// an emitter is a behavior that subclasses a mesh
	// it can make a bunch of children from a reference object and it puts the children inside itself
	// as a scripting hack I am looking for anything that starts with the word "flower" - these are all prefixed with that word
	"emitterofpetals": {
		emitter:{
			art:"sphere",
			color:0xFFFF00,
			visible:false,
			target:"mypetal",
			name:"petals",
			radius:10,
			count:15
		}
	},

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// controls - vr controls to control a fox, and ar controls to place objects
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	"foxy": {
		mesh:{
			provenance:[
				"https://sketchfab.com/3d-models/low-poly-fox-by-pixelmannen-animated-371dea88d7e04a76af5763f2a36866bc",
			],
			art:"./art/pixelmannen_low_poly_fox",
			position:{x:0,y:0,z:-7},
 			scale:{x:1,y:1,z:1},
			color:0xff0000,
		},
		actionKinetic:{},
		walk:{}, // walking behavior relies on actionKinetic
		collide: {
			gaze: true,
			click: true,
			proximity:1,
			layer:3, // do not test for collisions at all unless both parties are in this layer (layer is a bitmask)
			filter:0
		},
	},

}
