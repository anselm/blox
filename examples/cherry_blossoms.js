
export let cherry_blossoms = {

	renderer: 0,

	scene: 0,

	children: [

		// a skybox
		{
			name:"sky",
			sky:{
				art:"art/eso0932a.jpg"
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

		// a camera blob with a camera behavior and an orbit control behavior
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
			// a behavior on the blob; in this case a 3js light - maps to a class named BehaviorLight
			light:{
				// a property of the behavior - simply used by the behavior at will or thrown away
				color:0xFFFFFF,
				position:{x:-30,y:40,z:-50},
			}
		},

		{
			name:"tree1",
			mesh:{
				art:"art/cherry_tree",
				color:0xff0000,
				scale:{x:5,y:5,z:5},
				position:{x:20,y:10,z:10},
			},
		},

		{
			name:"tree2",
			mesh:{
				art:"art/cherry_tree",
				color:0xff0000,
				scale:{x:5,y:5,z:5},
				position:{x:-30,y:10,z:-15},
			},
		},

		{
			name:"tree3",
			mesh:{
				art:"art/cherry_tree",
				color:0xff0000,
				scale:{x:5,y:5,z:5},
				position:{x:30,y:10,z:40},
			},
		},


		// an idea of a particle effects engine for simple particles - triggered by proximity
		{
			name:"tree4",
			mesh:{
				art:"art/cherry_tree",
				color:0xff0000,
				scale:{x:5,y:5,z:5},
				position:{x:0,y:10,z:0},
			},
			// todo - maybe all meshes could be groups for consistency so that particles could be groups too
			// anyway this particle would act on the mesh/group above
			particles: {
				active:0,
				color:{min:0x00ff0000,max:0x00ff0000,end:0x00000000}, // minimum color, maximum color, end color
				size:{min:1,max:1,end:0}, // minimum size, maximum size, ending size
				speed:{min:0.4,max:0.5,end:-1}, // minimum start speed, maximum start speed, ending speed if any }
				radius:1, // starting radius
				nozzle:{axis1:-50,axis2:50,spin1:0,spin2:360},
				gravity:{x:0,y:-8,z:0},
				friction:{x:0.95,y:0.95,z:0.95},
				longevity:{min:100,max:110}, // minimum and maximum lifespan
				quantity:1000,
				rate:0.1,
				billboard:1,
				effect:"waft" // most effects are simple but some might require some special hints
			},

			// test idea - watch for proximity events on self, and broadcast
			// this could be a brute force observer for now, later a broadphase system
			// on criteria being met (gazed at, proximity collision, even a mouse pick - it would fire)
			//		i think i will have a mini grammar, events are always going to use that grammar
			//			"thingname.behaviorname.methodname arguments"
			//		this lets me send messages to the world as "* arguments" -> which goes to a special listener
			//		and to an object "buzz.mesh.activate 1" -> make the buzz object mesh visible
			//		and to self "self.effect.activate 1" -> start own effect behavior
			//		and to custom behaviors "self.mybehavior.dosomething args"
			//
			// i may as well allow code too - i could even allow eval i guess...
//			proximity: {
//				radius:10,
//				event: function(event) { event.blob.effect.activate(1) } // { event.blob, event.other, event.args }
//			}

		},
	]
}

