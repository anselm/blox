
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

	// an optional camera - a default one is added if you don't add this
	mycamera: {
		camera:{
			position:{x:0,y:40,z:100},
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
			if(!window.webkit && args.blox.mesh) args.blox.mesh.material.visible = args.blox.mesh.visible = true
			return true
		},
	},

	"myground":	{
		mesh:{
			art:"sphere",
			position:useful_place,
			scale:{x:300,y:0.1,z:300},
			color:0xccffee,
			visible:false
		},
		on_behavior_added: function(args) {
			// hack - only show if not in xr mode
			console.log("detect xr")
			if(!window.webkit && args.blox.mesh) args.blox.mesh.material.visible = args.blox.mesh.visible = true
			return true
		},
	},

	// a tree
	mytree: {
		mesh:{
			art:"./art/cherry_tree",
			provenance:"https://sketchfab.com/3d-models/cherry-tree-2dc7230267bd4de781db5f22c35d5876",
			position:{x:0,y:15,z:0},
			scale:{x:5,y:5,z:5},
			color:0xffffff,
		},
	},

	anotherlight: {
		light: {
			style:"point",
			intensity:5,
			position:{x:-20,y:15,z:14},
			debug:1
		}
	},

	mybox: {
		mesh: {
			art:"box",
			position:{x:-20,y:10,z:12},
			scale:{x:4,y:4,z:4},
			orientation:{x:0,y:0,z:45},
			texture:"./art/carnations.jpg"
		},
		actionKinetic: {
			rotation:{x:0,y:0,z:1},
		},
		mychild: {
			mesh: {
				art: "box",
				position:{x:2,y:0,z:0}
			},
			actionKinetic: {},
			actionTarget: {
				lookat: {x:0,y:100,z:0}
			}
		}
	},

	// text floating
	mytext: {
		text:{
			color:0x00FFFF,
			scale:{x:10,y:10,z:1},
			position:{x:0,y:5,z:-20},
			say:"Hello World"
		}
	},

	// text panel
	mytext2: {
		textPanel:{
			color:0x00FFFF,
			scale:{x:10,y:10,z:10},
			position:{x:-10,y:5,z:-10},
			say:"I have eaten the plums that were in the icebox and which you were probably saving for breakfast. Forgive me they were delicious, so sweet, and so cold"
		}
	},

}
