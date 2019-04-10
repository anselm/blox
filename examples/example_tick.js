export let cherry_blossoms = {

	scene: 0,

	children: [

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
			},
			tick: function(interval,parent) {
				parent.text.rotateX(0.1)
			}
		},

	]
}