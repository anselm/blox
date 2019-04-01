
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// Declarative collection of objects
///
/// The root is an object, and it contains some behaviors, notably a scene
/// Then it also has children with other behaviors such as 3d objects
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////


let my_scene = {

	// a renderer behavior - it will not be active until a scene and camera and children show up
	renderer: 0,

	// a scene behavior - has a listener that watches for any children being attached
	scene: 0,

	// a collection of children (itself a behavior)
	children: [

		// a camera blob with a camera behavior and an orbit control behavior
		{
			name:"camera",
			camera:0,
			orbit:0,
		},

		// a light
		{
			name:"mylight",
			// a behavior on the blob; in this case a 3js light - maps to a class named BehaviorLight
			light:{
				// a property of the behavior - simply used by the behavior at will or thrown away
				color:0xFFFFFF,
				position:{x:-15,y:15,z:15},
			}
		},

		// a mesh
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
			},
		},

		// another mesh
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
			}
		},

		// a smart line
		{
			name:"line",
			line:{first:"eye",second:"buzz"}
		},

		// a ground mesh with physics
		{
			name:"ground",
			mesh: {
				art:"box",
				color:0xff00ff,
				scale:{x:20,y:0.1,z:20},
				position:{x:0,y:-10,z:0},
			},
			physics: {},
			physical: {
				mass:0
			},
		},

		// a falling mesh with physics
		{
			name:"falling",
			mesh:{
				art:"box",
				color:0xff0000,
				scale:{x:3,y:2,z:1},
				position:{x:10,y:0,z:0},
			},
			physical: {
				mass:100,
				launch:{x:-1000,y:100,z:0},
			},
		},

		// a mesh acting as a back plane for a physics joint - test
		{
			name:"ball1",
			mesh:{
				art:"box",
				color:0xff0000,
				scale:{x:0.1,y:5,z:5},
				position:{x:0,y:0,z:0},
			},
			physical: {
				mass:0,
			},
		},

		// a mesh acting as a selectable button on a prismatic slider - test
		{
			name:"ball2",
			mesh:{
				art:"box",
				color:0x00ff00,
				scale:{x:1,y:1,z:1},
				position:{x:2,y:0,z:0},
			},
			physical: {
				mass:100,
				joint:1,
				force:{x:100,y:0,z:0},
			},
		}
	]
}

