
///
/// This artist created scene demonstrates high level declarations of simple behaviors with 'packages' and particle effects.
///
/// A cherry tree is defined in a separate package that is stored in a blox folder as blox/cherry_tree.js.
/// That description loads up a gltf of a Cherry Tree from SketchFab.
/// [ from the artist https://sketchfab.com/3d-models/cherry-tree-2dc7230267bd4de781db5f22c35d5876 ].
/// There is also a simple particle effects engine attached.
///

export let cherry_blossoms = {

	// this one line does a remarkable amount of heavy lifting; blox itself knows nothing about 3js...
	scene: 0,

	// this camera is ignored in xr mode
	"mycamera":	{
		camera:{
			position:{x:20,y:5,z:50},
			lookat:{x:0,y:10,z:0},
		},
		// technically this orbit control is still running in xr mode - arguably i shouldn't bother doing that
		orbit:{
			lookat:{x:0,y:10,z:0},
		}
	},

	"mylight": {
		light:{
			position:{x:-30,y:40,z:-50},
			color:0xFFFFFF,
		}
	},

	"myskybox":	{
		sky:{
			art:"../art/eso0932a.jpg"
		}
	},

	"myground":	{
		mesh:{
			art:"sphere",
			position:{x:0,y:-8,z:0},
			scale:{x:300,y:1,z:300},
			color:0x270212,
		}
	},

	"mytree":{
		load:"../blox/cherry_tree.js", // test loading a package and then changing it exploiting on_reset()
		mesh:{
			scale:{x:5,y:5,z:5},
		},
	},

	// another tree - they need unique names because this is a hash, but you could use group: [] children ...
	"myothertree": {
		mesh:{
			art:"../art/cherry_tree",
			position:{x:-30,y:10,z:-15},
			scale:{x:5,y:5,z:5},
			color:0xff0000,
		},
	},

		// a tree
	"anothertree": {
		mesh:{
			art:"../art/cherry_tree",
			position:{x:30,y:10,z:40},
			scale:{x:5,y:5,z:5},
			color:0xff0000,
		},
	},

	"testparticle": {

		// a piece of art - it also sets some globals on blox such as blox.mesh blox.position blox.quaternion
		heart: {
			art:"ignore", // TODO this is a bit inelegant
			color:0xffffff,
			position:{x:0,y:10,z:0},
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
			disperse:{radius:50},

			// set the velocity (would override above) - make it focused within a nozzle area and direction
			//nozzle:{axis1:-50,axis2:50,spin1:0,spin2:360},

			// this may be obsolete TODO remove
			//speed:{min:0.4,max:0.5,end:-1}, // minimum start speed, maximum start speed, ending speed if any }

		},

	},

	// an emitter that spawns some objects
	// TODO it should emit them at a time rate instead of all at once
	"petalemitter": {
		emitter:{
			target:"testparticle",
			name:"petals",
			radius:10,
			count:15
		}
	},


}
