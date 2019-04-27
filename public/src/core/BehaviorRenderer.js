
import {XRSupport} from "./XRSupport.js"

export class BehaviorRenderer extends THREE.WebGLRenderer {

	constructor() {

		//const canvas = document.createElement('canvas')
		//var glContext = canvas.getContext('webgl', { compatibleXRDevice: device })

		super({antialias:true,alpha:false}) // XRSupport.supportsARKit() TODO?

		// TODO is this needed?
		this.setSize( window.innerWidth, window.innerHeight )

		this.canvas = this.domElement
		this.clock = new THREE.Clock()
		this.scene = 0
		this.camera = 0

		if(!XRSupport.supportsARKit()) {
			// desktop render loop
			document.body.appendChild( this.domElement )
			this.setAnimationLoop( this.renderDesktop.bind(this) )
			return
		} else {
			// webxr-ios render loop
			this.xr = new XRSupport({ canvas:this.domElement, renderXR:this.renderXR.bind(this) })
		}
	}

	set_scene(scene) {
		this.scene = scene
	}

	set_camera(camera) {
		this.camera = camera
	}

	renderVR() {
		// TBD
	}

	renderDesktop() {
		if(!this.scene || !this.camera) return
		this.blox.on_event({blox:this.blox,name:"on_tick",interval:this.clock.getElapsedTime()})
		this.render(this.scene,this.camera)
	}

	renderXR(viewport,viewMatrix,projectionMatrix) {

		if(!this.scene || !this.camera) return
		this.blox.on_event({blox:this.blox,name:"on_tick",interval:this.clock.getElapsedTime()})

		// TODO needed?
		this.autoClear = false

		this.camera.matrixAutoUpdate = false
		this.camera.matrix.fromArray(viewMatrix)
		this.camera.updateMatrixWorld()
		this.camera.projectionMatrix.fromArray(projectionMatrix)

		// TODO why does this get reset to 0?
		let width = this.xr.session.baseLayer.framebufferWidth
		let height = this.xr.session.baseLayer.framebufferHeight
		if(width <10 || height < 10 ) {
			width = window.innerWidth
			height = window.innerHeight
		}
		this.setSize(width,height,false)
		this.setViewport(0,0,width,height) //viewport.x, viewport.y, viewport.width, viewport.height)

		// TODO needed? this.clear()?

		this.clearDepth()

		this.render(this.scene, this.camera)
	}


}
