
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
			fade: {
				active:0, // TODO most behaviors could have 'active' on by default
			},
		},

		// a smart line
		{
			name:"line",
			line:{first:"eye",second:"buzz"},
		},

/*
		// an idea of a particle effects engine for simple particles - triggered by proximity
		{
			name:"effect",
			mesh:{
				art:"art/an_image.jpg",
				color:0xff0000,
				scale:{x:1,y:1,z:1},
				position:{x:0,y:3,z:0},
			},
			// todo - maybe all meshes could be groups for consistency so that particles could be groups too
			// anyway this particle would act on the mesh/group above
			effect: {
				active:0,
				color:{0x00ff0000,0x00ff0000,0x00000000}, // minimum color, maximum color, end color
				size:{1,1,0}, // minimum size, maximum size, ending size
				speed:{1,1,-1}, // minimum start speed, maximum start speed, ending speed if any }
				radius:1, // starting radius
				direction:{0,0,0,360,360,360}, // starting yaw1,pitch1,roll1,yaw2,pitch2,roll2 in degrees
				gravity:{x:0,y:-1,z:-1},
				longevity:{50,100}, // minimum and maximum lifespan
				quantity:1000,
				rate:10,
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
			proximity: {
				radius:10,
				event: function(event) { event.blob.effect.activate(1) } // { event.blob, event.other, event.args }
			}

		},
*/

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

