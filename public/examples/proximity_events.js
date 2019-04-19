

export let myscene = {

	name:"myscene",

	// scene behavior needs to be declared before other elements
	scene: 0,

	// a test of a naked child
	"mysky": {
		sky:{
			art:"./art/eso0932a.jpg"
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
			position:{x:0,y:-1,z:0},
			scale:{x:300,y:-1,z:300},
			color:0x278212,
		}
	},

	// a child blox
	"myflower":{
		// a typical behavior for a mesh
		// randomize art - a bit nicer if this is declared before the mesh to be invoked
		on_behavior_will_add: function(args) {
			// is it a mesh being added?
			if(!args.description.art) return
			// change the art if so
			let random_art = [
				"art/flowers/animium_3d_model_flower_3d_model",
				"art/flowers/blujay_margarita_flower",
				"art/flowers/rufusrockwell_lupine_plant",
				"art/flowers/rufusrockwell_snap_dragon",
				"art/flowers/tojamerlin_white_flower",
			]
			args.description.art = random_art[ Math.floor(Math.random()*random_art.length) ]
		},
		// animate art
		on_tick: function(args) {
			if(!args.blox || !args.blox.mesh) return
			args.blox.mesh.rotateY(0.01)
		},
		mesh:{
			// TODO I should show provenance on screen
			provenance:[
				"https://sketchfab.com/3d-models/flower-3d-model-8792070e9ee942078c26ca44a670a902",
				"https://sketchfab.com/3d-models/margarita-flower-58ce34c65642408cb92eab784af2bd6c",
				"https://sketchfab.com/3d-models/lupine-plant-bf30f1110c174d4baedda0ed63778439",
				"https://sketchfab.com/3d-models/snapdragon-b4a95a86f35d48fd9a5020372d44539f",
				"https://sketchfab.com/3d-models/white-flower-9e025b18a39741a4a38b197cee3cdcac",
			],
			art:"art/flowers/tojamerlin_white_flower",
			// TODO I could use a particle effects engine, or I could just randomly emit a pile of these, with random positions?
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
			on_enter: 0,
			on_exit: 0,
			on_overlap: function(args) { // TODO could pull this out to general scope
				if(!args || !args.blox || !args.blox.mesh) return
				if(args.blox.mesh.position.y < 3) args.blox.mesh.position.y += 0.1
			}
		},
	},

	// a separate entity that makes many first class copies of some other entity already described earlier
	// note that the behavior packaged up here cannot easily be inside of a target entity because it would lead to a replication cascade
	"myemitter": {
		emitter:{
			target:"myflower",
			radius:10,
			number:50
		}
	},

	"myparty": {
		mesh:{
			provenance:[
				"https://sketchfab.com/3d-models/low-poly-fox-by-pixelmannen-animated-371dea88d7e04a76af5763f2a36866bc",
			],
			art:"art/pixelmannen_low_poly_fox",
			position:{x:0,y:0,z:-7},
 			scale:{x:1,y:1,z:1},
			color:0xff0000,
		},
		camera:{},
		intent:{},
		walk:{},
		collide: {
			gaze: true,
			click: true,
			proximity:1,
			layer:3, // do not test for collisions at all unless both parties are in this layer (layer is a bitmask)
		},

	},

	on_blox_added: function(args) {
		console.error("yay on blox1 is called")
		console.log("this is an event that is called back to indicate the current scope is done loading")
	},

	on_loaded: function(args) {
		console.error("yay on loaded2 is called")
		console.log("this is an event that is called back to indicate the current scope is done loading")
	},

	on_tick: function(args) {

		// this is a test of manually sequencing events by scripting...
		// another way which I haven't tried is to build a behavior that accepts a list of events to publish
		switch(Math.floor(args.interval)) {
			case 5:
				// TODO all naked handlers here should be scoped to a temporary behavior so that this is a behavior
				{
					// find a description of an existing thing - this is an easier way than below
					//let description = blox.query(props.target).description

					// make something by hand by brute force - this is pretty inelegant... but whatever
					let description = {
						mesh:{
							art:"art/eyeball",
							position:{x:0,y:5,z:0},
						}
					}

					// go ahead and actually brute force inject this into the parent scene... also a bit manual and ugly
					let fresh = args.blox.group.push(description)

				}
				break
			case 10:
				// make it go somewhere
				break
			case 15:
				break
			case 20:
				break
		}
	}
}
