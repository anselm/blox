
export class XRSupport {

	static supportsARKit() {
		if(typeof window.webkit === 'undefined' || !navigator.xr) return false
		return true
	}

	constructor(renderXR,canvas=0,context=0) {
		this.device = 0
		this.session = 0
		this.xrCanvas = 0
		this.xrContext = 0
		this.canvas = canvas
		this.context = context
		this.renderXR = renderXR
		this.xrCanvas = document.createElement('canvas')
		this.xrContext = this.xrCanvas.getContext('xrpresent')
		// document.body.insertBefore(this.xrCanvas, document.body.firstChild) <- not needed?
		navigator.xr.requestDevice().then( this.deviceFound.bind(this) ).catch(err => {
			console.error('Error', err)
		})
	}

	deviceFound(xrDevice) {
		this.device = xrDevice
		this.device.requestSession({ outputContext: this.xrContext })
			.then(this.sessionFound.bind(this))
			.catch(err => {
				console.error('Session setup error', err)
			})
	}

	sessionFound(xrSession){
		this.session = xrSession

		// context has to be made with the device
		if(!this.canvas) this.canvas = document.createElement('canvas')
		if(!this.context) this.context = this.canvas.getContext('webgl', { compatibleXRDevice: this.device })

		// ?
		this.session.baseLayer = new XRWebGLLayer(this.session, this.context)

		// head-model is the coordinate system that tracks the position of the display
		this.session.requestFrameOfReference('head-model').then(frameOfReference =>{
			this.headFrameOfReference = frameOfReference
		}).catch(err => {
			console.error('Error finding head frame of reference', err)
		})

		// bind
		this.handleAnimationFrame = this.handleAnimationFrame.bind(this)

		// get eye level which is somehow different from head level?
		this.session.requestFrameOfReference('eye-level').then(frameOfReference => {
			this.eyeLevelFrameOfReference = frameOfReference
			this.session.requestAnimationFrame(this.handleAnimationFrame)
		}).catch(err => {
			console.error('Error finding eye frame of reference', err)
		})
	}

	handleAnimationFrame(t, frame){

		if(!this.session || this.session.ended) return

		this.session.requestAnimationFrame(this.handleAnimationFrame)

		let pose = frame.getDevicePose(this.eyeLevelFrameOfReference)
		if(!pose){
			console.log('No pose')
			return
		}

		for (let view of frame.views) {
			this.renderXR(
				this.canvas,
				this.context,
				this.session.baseLayer.getViewport(view),
				view.projectionMatrix,
				pose.getViewMatrix(view),
			)
			break
		}
	}

	getAnchor(xyz) {
		// returns a promise
		return this.session.addAnchor(xyz, this.headFrameOfReference)
	}

}

