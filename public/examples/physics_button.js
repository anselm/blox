export let mything = {

	scene: 0,

	physics: 0,

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

		// a ground mesh with physics
		{
			name:"ground",
			mesh: {
				art:"box",
				position:{x:0,y:-10,z:0},
				scale:{x:20,y:0.1,z:20},
				color:0xff00ff,
			},
			physical: {
				mass:0
			},
		},

		// a falling mesh with physics
		{
			name:"falling",
			mesh:{
				art:"box",
				position:{x:10,y:0,z:0},
				scale:{x:3,y:2,z:1},
				color:0xff0000,
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
				position:{x:0,y:0,z:0},
				scale:{x:0.1,y:5,z:5},
				color:0xff0000,
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
				position:{x:2,y:0,z:0},
				scale:{x:1,y:1,z:1},
				color:0x00ff00,
			},
			physical: {
				mass:100,
				joint:1,
				force:{x:100,y:0,z:0},
			},
		}
	]
}

