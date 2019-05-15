

export let  my_example = {

	name:"myscene",

	scene: 0,

	mylight: {
		light:{
			style:"point",
			intensity:1,
			position:{x:10,y:10,z:0},
			color:0xFFFFFF,
			debug:1
		}
	},

	// a tree
	mygroup: {
		name: "mygroup",
		group: 1,
		mytree: {
			name:"mytree",
			mesh:{
				art:"./art/cherry_tree",
				provenance:"https://sketchfab.com/3d-models/cherry-tree-2dc7230267bd4de781db5f22c35d5876",
				position:{x:0,y:15,z:0},
				scale:{x:5,y:5,z:5},
				color:0xffffff,
			},
		},
	},

	// some ground that is hidden in xr mode
	"myground":	{
		mesh:{
			art:"sphere",
			position:{x:0,y:-2,z:0},
			scale:{x:300,y:0.1,z:300},
			color:0xccffee,
			visible:false
		},
		on_behavior_added: function(args) {
			// hack - only show if not in xr mode
			if(!window.webkit && args.blox.mesh) args.blox.mesh.visible = args.blox.mesh.material.visible = true
			return true
		},
	},

	// a geo anchor at your current position
	"geoanchor2":{
		name:"geoanchor2",
		mesh: {
			art:"./art/eyeball",
			scale:{x:0.1,y:0.1,z:0.1},
			position:{x:-3,y:0,z:-3}
		},
		anchor:{
			cartographic: {}
		}
	},

	// another geo anchor at a fixed position
	"geoanchor":{
		name:"geoanchor",
		mesh: {
			color:0x00ff00,
			art:"box",
			position:{x:3,y:0,z:3}
		},
		anchor:{
			cartographic: {
				latitude:45.55775003153071,
				longitude:-122.67367301097079,
				altitude:62
			}
		}
	},

	// an object that goes back and forth between these two anchors
	"bettybumblesphere":{
		mesh:"sphere",
		actionTarget:{},
		actionKinetic:{},
		action:[
			{ time: 5, actionTarget:{ target:"geoanchor" } },
			{ time: 10, actionTarget:{ target:"geoanchor2" } },
		]
	},

}
