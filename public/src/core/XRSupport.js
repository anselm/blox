
export class XRSupport {

	static supportsARKit() {
		return typeof window.webkit !== 'undefined'
	}

	constructor(canvas,context,renderXR) {
		this.canvas = canvas
		this.context = context
		this.renderXR = renderXR
		this.handleGoButtonSetup()
	}

	async handleGoButtonSetup() {
		let btn = this.btn = document.createElement("button")
		btn.setAttribute('id', 'go-button')
		btn.innerHTML = "CLICKME"
		document.body.appendChild(btn)
		btn.addEventListener('click', this.deviceSearch.bind(this), true)
		btn.addEventListener('touchstart', this.handleGoButtonTouch.bind(this), true)
	}

	handleGoButtonTouch(event) { 
		event.stopPropagation()
	}

	deviceSearch(ev) {
		document.body.removeChild(this.btn)
		this.xrCanvas = document.createElement('canvas')
		this.xrCanvas.setAttribute('class', 'xr-canvas')
		navigator.xr.requestDevice().then( this.deviceFound.bind(this) ).catch(err => {
			console.error('Error', err)
		})
	}

	deviceFound(xrDevice) {

		this.device = xrDevice

		this.xrContext = this.xrCanvas.getContext('xrpresent')
		if(!this.xrContext){
			console.error('No XR context', this.xrCanvas)
			return
		}

		this.device.requestSession({ outputContext: this.xrContext })
			.then(this.sessionFound.bind(this))
			.catch(err => {
				console.error('Session setup error', err)
			})
	}

	sessionFound(xrSession){
		this.session = xrSession

		// webxr-ios paints the camera live display here...
		// TODO why don't we need this?
		// document.body.insertBefore(this.xrCanvas, document.body.firstChild)

		// make a canvas here for painting threejs content into
		if(!this.canvas) this.canvas = document.createElement('canvas')
		if(!this.context) this.context = this.canvas.getContext('webgl', { compatibleXRDevice: this.device })

		// Set up the base layer
		this.session.baseLayer = new XRWebGLLayer(this.session, this.context)

		// head-model is the coordinate system that tracks the position of the display
		this.session.requestFrameOfReference('head-model').then(frameOfReference =>{
			this.headFrameOfReference = frameOfReference
		})
		.catch(err => {
			console.error('Error finding head frame of reference', err)
		})

		// bind
		this.handleAnimationFrame = this.handleAnimationFrame.bind(this)

		// get eye level and kickstart system
		this.session.requestFrameOfReference('eye-level').then(frameOfReference => {
			this.eyeLevelFrameOfReference = frameOfReference
			this.session.requestAnimationFrame(this.handleAnimationFrame)
		})
		.catch(err => {
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

}
