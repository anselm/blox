
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
			xr:false
		},
	},

	"myground":	{
		mesh:{
			art:"sphere",
			position:useful_place,
			scale:{x:300,y:0.1,z:300},
			color:0xccffee,
			//texture:"./art/carnations.jpg"
			xr:false
		},
	},


	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// flower patch and bee
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// a child blox
	// as a scripting hack I am searching for anything that starts with the word "flower" for the bumblebee to visit
	"flower":{
		// a typical behavior for a mesh
		// randomize art - a bit nicer if this is declared before the mesh to be invoked
		on_behavior_will_add: function(args) {
			// is it a mesh being added?
			if(!args.description.art) return
			// change the art if so
			let provenance = [
				"https://sketchfab.com/3d-models/flower-3d-model-8792070e9ee942078c26ca44a670a902",
				"https://sketchfab.com/3d-models/margarita-flower-58ce34c65642408cb92eab784af2bd6c",
				"https://sketchfab.com/3d-models/lupine-plant-bf30f1110c174d4baedda0ed63778439",
				"https://sketchfab.com/3d-models/snapdragon-b4a95a86f35d48fd9a5020372d44539f",
				"https://sketchfab.com/3d-models/white-flower-9e025b18a39741a4a38b197cee3cdcac",
			]
			let random_art = [
				"./art/flowers/animium_3d_model_flower_3d_model",
				"./art/flowers/blujay_margarita_flower",
				"./art/flowers/rufusrockwell_lupine_plant",
				"./art/flowers/rufusrockwell_snap_dragon",
				"./art/flowers/tojamerlin_white_flower",
			]
			args.description.art = random_art[ Math.floor(Math.random()*random_art.length) ]
		},
		mesh:{
			art:"sphere",
			position:{x:0,y:0,z:0},
			scale:{x:1,y:1,z:1},
			color:0xff0212,
		},
		actionKinetic: {
			// adjust the position at startup - make it randomized over an area
			disperse:{radius:{x:20,y:0,z:20}},
		},
		// a collision behavior with specialized event support
		collide: {
			gaze: true,
			click: true,
			proximity: 1, // TODO this should be computed from the primitive, things should have collision hulls
			layer:1, // do not test for collisions at all unless both parties are in this layer (layer is a bitmask)
			filter:2, // do not send me any messages unless the other party is in this layer also (layer is a bitmask)
		},
		on_overlap: function(args) { // TODO could pull this out to general scope
			if(!args || !args.blox || !args.blox.mesh) return
			if(args.blox.mesh.position.y < 3) args.blox.mesh.position.y += 0.1
		},
		//on_enter: function() { console.log("enter") }, // TODO it would be nice to fire off messages as well
		on_exit: function(args) {
			args.blox.mesh.position.y = 0
		},
		// animate art
		on_tick: function(args) {
			args.blox.mesh.rotateY(0.01)
		},
	},

	// an emitter is a behavior that subclasses a mesh
	// it can make a bunch of children from a reference object and it puts the children inside itself
	// as a scripting hack I am looking for anything that starts with the word "flower" - these are all prefixed with that word
	"emitterofflowers": {
		emitter:{
			art:"box",
			color:0x0000FF,
			visible:false,
			target:"flower",
			name:"flowerpower",
			radius:10,
			count:15
		}
	},

	// a bee - unfortunately it targets the petals often... maybe there's a way to do wildcard search options TODO
	"bettybumblebee":{
		mesh:"./art/hornet",
		actionTarget:{},
		actionKinetic:{},
		action:[
			{ time:  6, actionTarget:{ target:"regex:flower",height:3, forward: 1} },
			{ time:  9, actionTarget:{ target:"regex:flower",height:3} },
			{ time: 12, actionTarget:{ target:"regex:flower",height:3} },
			{ time: 15, actionTarget:{ target:"tree",height:5} },
		]
	},

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

}
