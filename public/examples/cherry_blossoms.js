
///
/// This is an instance of a blox and demonstrates the kinds of things an artist can express
///

/// you can use variables and math

let player_height = 2 * 1.0 - 0.1

/// you can declare things and reference them over and over

let useful_place = {x:0,y:0,z:0}

///
/// The name of this blox is defined here as well as its properties
///

export let cherry_blossoms = {

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Scene Setup
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// a rendering engine
	// does a fair amount of work, it starts up a threejs renderer, a display and a render loop
	renderer:0,

	// decorate the blox with a scene behavior
	scene: 0,

	// define a child blox that happens to itself contain a camera
	// the namespace holds properties (like the above) and it also holds children (like this)
	// in this case the child blox is named mycamera, which is not a reserved term, so the assumption is that it is a child blox
	// this actual blox itself contains a BehaviorCamera
	// the pose of this camera is taken over if you are running in webxr (augmented reality) mode
	mycamera:	{
		camera:{
			position:{x:0,y:2,z:10},
			lookat:{x:0,y:10,z:0},
		},
		// technically this orbit control is still running in xr mode - arguably i shouldn't bother doing that
		orbit:{
			lookat:{x:0,y:2,z:0},
		}
	},

	mylight: {
		light:{
			position:{x:-30,y:40,z:-50},
			color:0xFFFFFF,
		}
	},

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Stars, Trees, Ground and falling blossoms
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// might be nice to only run these in non webxr mode
	"myskybox":	{
		on_behavior_added: function(args) {
			// hack - hide in xr
			if(!window.webkit && args.blox.mesh) args.blox.mesh.visible = true
		},
		sky:{
			art:"./art/eso0932a.jpg",
			visible:false
		},
	},

	"myground":	{
		on_behavior_added: function(args) {
			// hack - hide in xr
			if(!window.webkit && args.blox.mesh) args.blox.mesh.visible = true
		},
		mesh:{
			art:"sphere",
			position:useful_place,
			scale:{x:300,y:0.1,z:300},
			color:0xccffee,
			//texture:"./art/carnations.jpg"
			visible:false
		},
	},

/*
	// a blox that is a cherry tree
	// note each child has to be named uniquely if they are included in this way
	tree1:{
		load:"../blox/cherry_tree.js", // test loading a package and then changing it exploiting on_reset()
		mesh:{
			provenance:"https://sketchfab.com/3d-models/cherry-tree-2dc7230267bd4de781db5f22c35d5876",
			position:{x:30,y:10,z:-15},
			scale:{x:5,y:5,z:5},
		},
	},

	// another tree - they need unique names because this is a hash, but you could use group: [] children ...
	tree2: {
		mesh:{
			art:"./art/cherry_tree",
			provenance:"https://sketchfab.com/3d-models/cherry-tree-2dc7230267bd4de781db5f22c35d5876",
			position:{x:-30,y:10,z:-15},
			scale:{x:5,y:5,z:5},
			color:0xff0000,
		},
	},
*/
	// a tree
	tree: {
		mesh:{
			art:"./art/cherry_tree",
			provenance:"https://sketchfab.com/3d-models/cherry-tree-2dc7230267bd4de781db5f22c35d5876",
			position:{x:0,y:15,z:0},
			scale:{x:5,y:5,z:5},
			color:0xffffff,
		},
	},

	mypetal: {

		// a piece of art - it also sets some globals on blox such as blox.mesh blox.position blox.quaternion
		heart: {
			art:"ignore", // TODO this is a bit inelegant
			color:0xffffff,
			position:{x:0,y:20,z:0},
			scale:{x:5,y:5,z:5},
			doublesided:1,
			transparent:1
		},

		// a behavior that does tumbling
		actionTumble: {
			// set in a tumble motion
			tumble:1,
		},

		// a behavior that does a lifespan with reset - when done it calls on_reset() on this entire blox
		actionLifespan: {
			// limit lifespan; will re-run this entire action rule once this expires
			lifespan:{min:100, max:150},

			// randomize the color
			color_gradient:{min:0x00ff0000,max:0x00ff0000,end:0x00000000}, // minimum color, maximum color, end color

			// randomize the scale
			scale_range:{min:1,max:1,end:0},
		},

		// a behavior with a variety of simple physics
		actionKinetic: {
			// sets a position - overriding what was set in the mesh above if any
			position:{x:0,y:10,z:0},

			// sets a starting velocity and direction
			velocity:{x:0,y:10,z:0},

			// global friction acting against velocity - by default it is 0.9
			// friction:0.9

			// adds a force; forces can have properties that allow them to dampen over time or be one frame events 
			force:{name:"gravity",x:0,y:-1,z:0,friction:0,impulse:false},

			// adjust the position - make it randomized over an area
			disperse:{radius:{x:20,y:0,z:20}},

			// set the velocity (would override above) - make it focused within a nozzle area and direction
			//nozzle:{axis1:-50,axis2:50,spin1:0,spin2:360},

			// this may be obsolete TODO remove
			//speed:{min:0.4,max:0.5,end:-1}, // minimum start speed, maximum start speed, ending speed if any }

		},

	},

	// an emitter that spawns some objects
	// TODO it should emit them at a time rate instead of all at once
	mypetalemitter: {
		emitter:{
			target:"mypetal",
			name:"petals",
			radius:10,
			count:15
		}
	},

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Some text
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// text floating
	mytext: {
		text:{
			color:0x00FFFF,
			scale:{x:10,y:10,z:1},
			position:{x:0,y:5,z:-20},
			say:"Critter World"
		}
	},

	// text panel
	mytext2: {
		textPanel:{
			color:0x00FFFF,
			scale:{x:10,y:10,z:10},
			position:{x:-10,y:5,z:-10},
			say:"I have eaten the plums that were in the icebox and which you were probably saving for breakfast. Forgive me they were delicious, so sweet, and so cold"
		}
	},

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// flower patch and bee
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// a child blox
	"myflower":{
		// a typical behavior for a mesh
		// randomize art - a bit nicer if this is declared before the mesh to be invoked
		on_behavior_will_add: function(args) {
			// is it a mesh being added?
			if(!args.description.art) return
			// change the art if so
			let provenance = [
				"https://sketchfab.com/3d-models/flower-3d-model-8792070e9ee942078c26ca44a670a902",
				"https://sketchfab.com/3d-models/margarita-flower-58ce34c65642408cb92eab784af2bd6c",
				"https://sketchfab.com/3d-models/lupine-plant-bf30f1110c174d4baedda0ed63778439",
				"https://sketchfab.com/3d-models/snapdragon-b4a95a86f35d48fd9a5020372d44539f",
				"https://sketchfab.com/3d-models/white-flower-9e025b18a39741a4a38b197cee3cdcac",
			]
			let random_art = [
				"./art/flowers/animium_3d_model_flower_3d_model",
				"./art/flowers/blujay_margarita_flower",
				"./art/flowers/rufusrockwell_lupine_plant",
				"./art/flowers/rufusrockwell_snap_dragon",
				"./art/flowers/tojamerlin_white_flower",
			]
			args.description.art = random_art[ Math.floor(Math.random()*random_art.length) ]
		},
		mesh:{
			art:"sphere",
			position:{x:0,y:2,z:0},
			scale:{x:1,y:1,z:1},
			color:0xff0212,
		},
		actionKinetic: {
			// adjust the position at startup - make it randomized over an area
			disperse:{radius:{x:20,y:0,z:20}},
		},
		// a collision behavior with specialized event support
		collide: {
			gaze: true,
			click: true,
			proximity: 1, // TODO this should be computed from the primitive, things should have collision hulls
			layer:1, // do not test for collisions at all unless both parties are in this layer (layer is a bitmask)
			filter:2, // do not send me any messages unless the other party is in this layer also (layer is a bitmask)
		},
		on_overlap: function(args) { // TODO could pull this out to general scope
			if(!args || !args.blox || !args.blox.mesh) return
			if(args.blox.mesh.position.y < 3) args.blox.mesh.position.y += 0.1
		},
		//on_enter: function() { console.log("enter") }, // TODO it would be nice to fire off messages as well
		//on_exit: function() { console.log("exit") },
		// animate art
		on_tick: function(args) {
			args.blox.mesh.rotateY(0.01)
		},
	},

	// a separate entity that makes many first class copies of some other entity already described earlier
	// note that the behavior packaged up here cannot easily be inside of a target entity because it would lead to a replication cascade
	"floweremitter": {
		emitter:{
			target:"myflower",
			name:"flowerpower",
			radius:10,
			count:15
		}
	},

	"bettybumblebee":{
		mesh:"./art/hornet",

		actionKinetic:{},

		action:[
			{ time:  6, actionTarget:{ target:"*",height:1} },
			{ time:  9, actionTarget:{ target:"*",height:1} },
			{ time: 12, actionTarget:{ target:"*",height:1} },
			{ time: 15, actionTarget:{ target:"tree",height:5} },
		]
	},

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// controls - vr controls to control a fox, and ar controls to place objects
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
	"foxy": {
		mesh:{
			provenance:[
				"https://sketchfab.com/3d-models/low-poly-fox-by-pixelmannen-animated-371dea88d7e04a76af5763f2a36866bc",
			],
			art:"../art/pixelmannen_low_poly_fox",
			position:{x:0,y:0,z:-7},
 			scale:{x:1,y:1,z:1},
			color:0xff0000,
		},
		actionKinetic:{},
		walk:{}, // walking behavior relies on actionKinetic
		collide: {
			gaze: true,
			click: true,
			proximity:1,
			layer:3, // do not test for collisions at all unless both parties are in this layer (layer is a bitmask)
		},
	},
*/
	someux: {
		placementUX: {
		}
	},

}
