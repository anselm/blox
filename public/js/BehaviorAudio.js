
///
/// AudioListener - add this to the camera before the rest i guess, or attach it to the scene implicitly
///

let audioListener = 0

export class BehaviorAudioListener extends THREE.AudioListener {
	constructor() {
		super()
		audioListener = this
	}
}

///
/// Add this as a child of the the mesh
///

export class BehaviorPositionalAudio extends THREE.PositionalAudio {
	constructor(args) {
		let props = args.description
		let blox = args.blox
		super(audioListener)
		if(!blox.mesh) return
		let sound = props.sound
		if(!sound)return
		blox.mesh.add(this)
		let loader = new THREE.AudioLoader()
		loader.load(filename, function( buffer ) {
			sound.setBuffer( buffer )
			sound.setRefDistance( 20 )
			sound.play()
			// is this thing an object 3d?
		}
	}
}

/*
	blox = getblox()  // find or get
	blox.behaviorAdd/Set('Sound',{'file:'mysound'}) // decorate with a sound - may replace if existing?
	blox.sound = new BehaviorSound // hacky way by hand... may not get into other collections?
	blox.sound.play(x)
	blox.sound.lifespan(x)
	blox.behaviorRemove('Sound')
	blox.behaviorReset('Sound')

*/
