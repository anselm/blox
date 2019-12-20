
///
/// This is an instance of a blox and demonstrates the kinds of things an artist can express
///

/// you can use variables and math

let player_height = 4 * 1.0 - 0.1

/// you can declare things and reference them over and over

let useful_place = {x:0,y:0,z:0}

///
/// The name of this blox is defined here as well as its properties
/// The first one is always the "world"
/// TODO remove this requirement

export let buildings = {

	// a name is ripped from the declaration above - but can also be set here if you want instead
	name:"my buildings",

	// this one is the only mandatory object - this is only mandatory if you are doing a 3d engine view
	scene: 0,

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// a series of objects; each object is a bucket, full of kinds of things
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	myskybox:	{
		// "sky" is a reserved word - it is a blox that makes a sky
		sky:{
			art:"./art/eso0932a.jpg",
			xr:false
		},
	},

	myground:	{
		// "mesh" is a reserved word - it makes kinds of meshes
		mesh:{
			art:"sphere",
			position:useful_place,
			scale:{x:300,y:0.1,z:300},
			color:0xccffee,
			xr:false
		},
	},

	anotherlight: {
		light: {
			style:"point",
			intensity:5,
			position:{x:10,y:20,z:0},
		}
	},

	mylight: {
		light:{
			position:{x:10,y:0,z:50},
			color:0xFFFFFF,
		}
	},

	mycamera: {
		camera:{
			position:{x:10,y:0,z:50},
		},
		orbit: {
		}
	},

	myblob: {
		building: {

			// how many buildings
			quantity:3,

			// building properties - using fancy deferred numbers to allow dynamic randomization
			xoffset:"Math.floor(Math.random()*4)-2",
			yoffset:0,
			zoffset:"Math.floor(Math.random()*4)-2",
			hasroof:"Math.random()>0.5",
			width:"Math.random()*10+5",
			depth:"Math.random()*10+5",
			height:"Math.random()*10+5",
			floors:"Math.floor(Math.random()*3)+1",
			segments:"Math.floor(Math.random()*1)+2",

			// overall position of the system
			position:{x:0,y:2,z:0},
			scale:{x:1,y:1,z:1},
			color:0x00ffff,
		},
	},


}
