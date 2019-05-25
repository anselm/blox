

export let gateway_test = {

	// decorate the blox with a scene behavior - this is mandatory if you are doing a 3d engine view
	scene: 0,

	// an optional light
	mylight: {
		light:{
			position:{x:-30,y:40,z:-50},
			color:0xFFFFFF,
		}
	},

	"myskybox":	{
		sky:{
			art:"./art/eso0932a.jpg",
			xr:false,
		},
	},

	"myground":	{
		mesh:{
			art:"sphere",
			scale:{x:300,y:0.1,z:300},
			color:0xccffee,
			xr:false
		},
	},

	"test1":	{
		mesh:{
			art:"./art/world_space_map_crystal",
			position:{x:10,y:3,z:0},
		},
	},

	"test2":	{
		mesh:{
			art:"./art/world_space_map_crystal",
			position:{x:0,y:3,z:0},
		},
	},

	"test3":	{
		mesh:{
			art:"./art/heart_in_glass",
			position:{x:-8,y:4,z:0},
		},
	},

	"test4":	{
		mesh:{
			art:"./art/world_space_map_crystal",
			position:{x:-5,y:3,z:3},
		},
	},

	"test5":	{
		mesh:{
			art:"./art/world_space_map_crystal",
			position:{x:5,y:4,z:3},
		},
	},

	"test6":	{
		mesh:{
			art:"./art/world_space_map_crystal",
			position:{x:3,y:3,z:-3},
		},
	},

/*
	"myportal":	{
		mesh:{
			art:"sphere",
			color:0xccffee,
		},
	},
*/
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// controls - vr controls to control a fox, and ar controls to place objects
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	"player": {
		camera:{
			position:{x:0,y:2,z:-32},
			lookat:{x:0,y:2,z:0},
		},
		actionKinetic:{},
		walk:{}
	},

	"player_hand":{
		group:{},
		"right_hand":{
			mesh:{
				position:{x:-1,y:0,z:0},
				orientation:{x:-90,y:90,z:-20},
				art:"./art/hand_low_poly",
			}
		},
		actionTarget:{
			target:"player",
			lookat:"player",
			infrontof:-8,
			height:0
		},
		actionKinetic:{},
		collide: {
			gaze: true,
			click: true,
			proximity:1,
			layer:3, // do not test for collisions at all unless both parties are in this layer (layer is a bitmask)
			filter:0
		},
	},

	on_loaded: function(args) {
	}
}
