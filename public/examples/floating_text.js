export let scene = {

	scene: 0,

	group: [

		{
			name:"sky",
			sky:{
				art:"art/eso0932a.jpg"
			}
		},

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

		// text floating
		{
			name:"mytext",
			text:{
				color:0x00FFFF,
				scale:{x:10,y:10,z:1},
				say:"hello"
			}
		},

		// text panel
		{
			name:"mytext",
			textPanel:{
				color:0x00FFFF,
				scale:{x:10,y:10,z:1},
				say:"I have eaten the plums that were in the icebox and which you were probably saving for breakfast. Forgive me they were delicious, so sweet, and so cold"
			}
		}

	]
}