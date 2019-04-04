
///
/// A json graph with some objects in it.
/// In this example I exported it as a module
///
/// The root is an object, and it will be instanced as decorated with a couple of behaviors, notably a renderer and a scene
/// Then it also has children with other behaviors such as 3d objects
///

// This will get instanced as the root of the scene
export let mything = {

	// a renderer behavior - TODO arguably this should be outside the graph...
	renderer: 0,

	// a scene behavior - has a listener that watches for any children being attached
	scene: 0,

	// a collection of children (itself a behavior)
	children: [

		// a skybox
		{
			name:"sky",
			sky:{
				art:"/art/eso0932a.jpg"
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

		// a test of a mesh that flies around in a circle
		{
			name:"buzz",
			mesh:{
				art:"art/eyeball",
				color:0xff0000,
				scale:{x:1,y:1,z:1},
				position:{x:0,y:3,z:0},
			},
			oscillate:{
				force:{x:0,y:0.5,z:0},
				thrust:{x:0,y:-0.05,z:0},
				limit:10,
			},
		},
		// another mesh that stares at buzz
		{
			name:"eye",
			mesh:{
				art:"art/eyeball",
				color:0xff0000,
	 			scale:{x:1,y:1,z:1},
				position:{x:0,y:3,z:0},
			},
			stare: "buzz",
			bounce: {
				force:{x:0,y:0.5,z:0},
				thrust:{x:0,y:-0.05,z:0},
				limit:-1 // TODO most things could have a count or -1
			},
		},

		// a smart line
		{
			name:"line",
			line:{first:"eye",second:"buzz"},
		},
	]
}

