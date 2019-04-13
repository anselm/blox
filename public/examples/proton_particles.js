
export let ascene = {

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

		// a light
		{
			name:"mylight",
			light:{
				position:{x:-30,y:40,z:-50},
				color:0xFFFFFF,
			}
		},

		// a mesh and the proton particle effects engine

		{

			name:"tree",

			// add any kind of object to this clump as a prototype of what to re-use, will find it and use it
			heart: {
				color:0xffffff,
				position:{x:0,y:10,z:0},
				scale:{x:1,y:1,z:1},
				doublesided:1
			},

			proton: {
			}

		}
	]
}

