export let cherry_blossoms = {

	renderer: 0,

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
			}
		},

		// text panel
		{
			name:"mytext",
			textPanel:{
				color:0x00FFFF,
				scale:{x:10,y:10,z:1},
				say:"I’m Nobody! Who are you? Are you — Nobody — Too? Then there’s a pair of us! Don’t tell! They’d banish us — you know! How dreary — to be — Somebody! How public — like a Frog — To tell one’s name — the livelong June — To an admiring Bog!"
			}
		}

	]
}