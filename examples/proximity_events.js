

export let mything = {

	scene: 0,

	children: [

		{
			name:"mylight",
			// a behavior on the blob; in this case a 3js light - maps to a class named BehaviorLight
			light:{
				// a property of the behavior - simply used by the behavior at will or thrown away
				position:{x:-30,y:40,z:-50},
				color:0xFFFFFF,
			}
		},

		{
			name:"sky",
			sky:{
				art:"art/eso0932a.jpg"
			}
		},

		{
			name:"ground",
			mesh:{
				art:"sphere",
				position:{x:0,y:-1,z:0},
				scale:{x:300,y:-1,z:300},
				color:0x278212,
			}
		},

		{
			name:"flower",
			event: function(e) {
				// This is an exploration of an idea of decorating an object with a *generic* event handling capability
				// On the plus side it consolidates events and code into a single method and then multiple listeners can listen into events
				// On the minus side it is a bit more complex for novice users than directly attaching object.on_collision() type methods
				console.log("got event")
				console.log(e)
				if(e.name == "on_overlap") {
					// we could handle overlaps here
				}
				if(e.name == "on_tick") {
					// we could do tick events here in general
				}
				if(e.name == "behavior_initialization" && e.props) {
					let random_art = [
						"art/flowers/animium_3d_model_flower_3d_model",
						"art/flowers/blujay_margarita_flower",
						"art/flowers/rufusrockwell_lupine_plant",
						"art/flowers/rufusrockwell_snap_dragon",
						"art/flowers/tojamerlin_white_flower",
					]
					e.props.art = random_art[ Math.floor(Math.random()*random_art.length) ]
				}
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
				// TODO one idea is to have event listeners directly and explicitly hammered into various useful points
				// I feel this is "ok" but maybe a bit over-specialized and it hides an ability to generally route and ship events around
				// basically, it is a bit nicer for the user bit it is a bit over-constrained for the system as a whole
				//on_construction: function(e) { console.log("do something useful ") }
			},
			// This is another way of thinking about some events, in this case simply decorating the object with a tick behavior
			tick: function(interval,parent) {
				if(!parent.mesh) return
				parent.mesh.rotateY(0.01)
			},
			// This is a similar to above way of thinking about events, in this case decorating the object with a special behavior and handler
			collide: {
				gaze: true,
				click: true,
				proximity: 1, // TODO this should be computed from the primitive, things should have collision hulls
				layer:1, // do not test for collisions at all unless both parties are in this layer (layer is a bitmask)
				filter:2, // do not send me any messages unless the other party is in this layer also (layer is a bitmask)
				on_enter: 0,
				on_exit: 0,
				on_overlap: function(interval,parent,target) {
					if(!parent.mesh) return
					if(parent.mesh.position.y < 3) parent.mesh.position.y += 0.1
				}
			},
		},

		// a separate entity that makes many first class copies of some other entity already described earlier
		// note that the behavior packaged up here cannot easily be inside of a target entity because it would lead to a replication cascade
		{
			name:"emitter",
			emitter:{
				target:"flower",
				radius:10,
				number:50
			}
		},

		{
			name:"party",
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
			walk:{},
			collide: {
				gaze: true,
				click: true,
				proximity:1,
				layer:3, // do not test for collisions at all unless both parties are in this layer (layer is a bitmask)
			}

		},
	]
}
