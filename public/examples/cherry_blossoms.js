
///
/// This artist created scene demonstrates high level declarations of simple behaviors with 'packages' and particle effects.
///
/// A cherry tree is defined in a separate package that is stored in a blox folder as blox/cherry_tree.js.
/// That description loads up a gltf of a Cherry Tree from SketchFab.
/// [ from the artist https://sketchfab.com/3d-models/cherry-tree-2dc7230267bd4de781db5f22c35d5876 ].
/// There is also a simple particle effects engine attached.
///

export let cherry_blossoms = {

	scene: 0,

	group: [

		{
			name:"camera",
			camera:{
				position:{x:20,y:5,z:50},
				lookat:{x:0,y:10,z:0},
			},
			orbit:{
				lookat:{x:0,y:10,z:0},
			}
		},

		// a light
		{
			name:"mylight",
			light:{
				position:{x:-30,y:40,z:-50},
				color:0xFFFFFF,
			}
		},

		// a skybox
		{
			name:"sky",
			sky:{
				art:"../art/eso0932a.jpg"
			}
		},

		// some ground
		{
			name:"ground",
			mesh:{
				art:"sphere",
				position:{x:0,y:-8,z:0},
				scale:{x:300,y:1,z:300},
				color:0x270212,
			}
		},

		{
			name:"tree",
			load:"../blox/cherry_tree.js", // loading a package and then changing it
			mesh:{
				scale:{x:5,y:5,z:5},
			},
		},

		// a tree
		{
			name:"tree",
			mesh:{
				art:"../art/cherry_tree",
				position:{x:-30,y:10,z:-15},
				scale:{x:5,y:5,z:5},
				color:0xff0000,
			},
		},

		// a tree
		{
			name:"tree",
			mesh:{
				art:"../art/cherry_tree",
				position:{x:30,y:10,z:40},
				scale:{x:5,y:5,z:5},
				color:0xff0000,
			},
		},

		// a mesh and a simple particle effects engine
		{
			name:"hearts",

			// add any kind of object to this clump as a prototype of what to re-use, will find it and use it
			heart: {
				art:"ignore",
				color:0xffffff,
				position:{x:0,y:10,z:0},
				scale:{x:1,y:1,z:1},
				doublesided:1
			},

			// a particle field finds any mesh nearby and assumes that is the base of the effect
			particles: {
				gradient:{min:0x00ff0000,max:0x00ff0000,end:0x00000000}, // minimum color, maximum color, end color
				size:{min:1,max:1,end:0}, // minimum size, maximum size, ending size
				speed:{min:0.4,max:0.5,end:-1}, // minimum start speed, maximum start speed, ending speed if any }
				radius:30, // starting radius
				nozzle:{axis1:-50,axis2:50,spin1:0,spin2:360},
				gravity:{x:0,y:-8,z:0},
				friction:{x:0.95,y:0.95,z:0.95},
				longevity:{min:100,max:310}, // minimum and maximum lifespan
				quantity:5000,
				rate:0.1
			},

		},

	]
}

