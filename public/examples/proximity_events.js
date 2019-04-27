

export let myscene = {

	name:"myscene",

	// scene behavior needs to be declared before other elements
	scene: 0,

	// a test of a child directly declared rather than inside a child group
	"mysky": {
		sky:{
			art:"../art/eso0932a.jpg"
		}
	},

	"mylight": {
		light:{
			position:{x:-30,y:40,z:-50},
			color:0xFFFFFF,
		}
	},

	"myground":{
		mesh:{
			art:"sphere",
			scale:{x:10,y:0.01,z:10},
			color:0x278212,
			texture:"../art/carnations.jpg"
		}
	},

	// a tree
	"tree":{
		mesh:{
			art:"../art/cherry_tree",
			position:{x:0,y:2.9,z:0},
			scale:{x:2,y:2,z:2},
			color:0xffffff,
		},
	},

	// a child blox
	"myflower":{
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
				"../art/flowers/animium_3d_model_flower_3d_model",
				"../art/flowers/blujay_margarita_flower",
				"../art/flowers/rufusrockwell_lupine_plant",
				"../art/flowers/rufusrockwell_snap_dragon",
				"../art/flowers/tojamerlin_white_flower",
			]
			args.description.art = random_art[ Math.floor(Math.random()*random_art.length) ]
		},
		// animate art
		on_tick: function(args) {
			args.blox.mesh.rotateY(0.01)
		},
		mesh:{
			art:"sphere",
			position:{x:0,y:0,z:0},
			scale:{x:1,y:1,z:1},
			color:0xff0212,
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
		//on_exit: function() { console.log("exit") },
	},

	// a separate entity that makes many first class copies of some other entity already described earlier
	// note that the behavior packaged up here cannot easily be inside of a target entity because it would lead to a replication cascade
	"floweremitter": {
		emitter:{
			target:"myflower",
			name:"flowerpower",
			radius:10,
			count:15
		}
	},

	"foxy": {
		mesh:{
			provenance:[
				"https://sketchfab.com/3d-models/low-poly-fox-by-pixelmannen-animated-371dea88d7e04a76af5763f2a36866bc",
			],
			art:"../art/pixelmannen_low_poly_fox",
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
		},
	},

	"bettybumblebee":{
		mesh:"../art/hornet",

		actionKinetic:{},

		action:[
			{ time:  2, actionTarget:{ target:"foxy",height:1,forward:1} },
			{ time:  6, actionTarget:{ target:"*",height:1} },
			{ time:  9, actionTarget:{ target:"*",height:1} },
			{ time: 12, actionTarget:{ target:"*",height:1} },
			{ time: 15, actionTarget:{ target:"tree",height:5} },
		]
	}
}

