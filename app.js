
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
///
/// Declarative collection of objects
///
/// The root is an object, and it contains some behaviors, notably a scene
/// Then it also has children with other behaviors such as 3d objects
///
//////////////////////////////////////////////////////////////////////////////////////////////////////////////


let my_scene = {

	// a renderer - it will not be active until a scene and camera and children show up
	renderer: 0,

	// a scene - has a listener that watches for any children being attached
	scene: 0,

	// a camera  with no args - because it is here it has to manually attach to the scene; it could also be in children below
	camera: 0,

	// an orbit control - needs the camera and the renderer domElement - it could also search for them dynamically but does not
	orbit: 0,

	// a collection of children <- TODO this could become a behavior too
	children: [
		// an example blob - only one light is allowed since this is a hash - TODO it is possible to generalize
		{
			// a behavior on the blob; in this case a 3js light - maps to a class named BehaviorLight
			light:{
				// a property of the behavior - simply used by the behavior at will or thrown away
				color:0xFFFFFF,
				position:{x:-15,y:15,z:15},
			}
		},
/*
		// here is another example blob - includes one mesh - only one is allowed since this is a hash...
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
		{
			name:"line",
			line:{first:"eye",second:"buzz"}
		},
*/
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
		{
			name:"ball0",
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

// Build the graph, the renderer behavior kickstarts 3js and the render loop

let world = new Blob(my_scene)

