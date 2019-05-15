
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

	"infobox":{
		mesh:"./art/hornet",
		actionTarget:{
			target:"foxy",
			lookat:"foxy",
			infrontof:4,
			height:2
		},
		actionKinetic:{},
	},


}
