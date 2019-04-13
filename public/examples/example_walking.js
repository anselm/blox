
export let mything = {

	scene: 0,

	group: [

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
			name:"ground",
			mesh:{
				art:"sphere",
				position:{x:0,y:-8,z:0},
				scale:{x:300,y:1,z:300},
				color:0x270212,
			}
		},

		{
			name:"thing",
			mesh:{
				art:"sphere",
				position:{x:2,y:2,z:2},
				scale:{x:1,y:1,z:1},
				color:0x27ff12,
			}
		},

		{
			name:"thing",
			mesh:{
				art:"sphere",
				position:{x:-2,y:2,z:-2},
				scale:{x:1,y:1,z:1},
				color:0xff0212,
			}
		},

		{
			name:"party",
			mesh:{
				art:"art/eyeball",
				position:{x:0,y:3,z:0},
	 			scale:{x:1,y:1,z:1},
				color:0xff0000,
			},
			camera:{},
			walk:{},
		},
	]
}
