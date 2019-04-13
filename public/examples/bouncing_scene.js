export let mything = {

	scene: 0,

	group: [

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

		{
			name:"mylight",
			light:{
				position:{x:-30,y:40,z:-50},
				color:0xFFFFFF,
			}
		},

		// a test of a mesh that flies around in a circle
		{
			name:"buzz",
			mesh:{
				art:"art/eyeball",
				position:{x:0,y:3,z:0},
				scale:{x:1,y:1,z:1},
				color:0xff0000,
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
				position:{x:0,y:3,z:0},
	 			scale:{x:1,y:1,z:1},
				color:0xff0000,
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

