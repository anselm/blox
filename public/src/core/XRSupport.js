
export class XRSupport {

	static supportsARKit() {
		return typeof window.webkit !== 'undefined'
	}

	constructor(args) {

		// bail if unsupported
		if(!window.webkit) {
			console.error("This can only run on webxr-ios")
			return 0
		}

		// stash args
		this.canvas = args.canvas
		this.renderXR = args.renderXR

		// only load polyfill if in xr mode
		let script = document.createElement( 'script' )
		script.onload = this.handleGoButtonSetup.bind(this)
		script.src = "../lib/webxr.js"
		document.head.appendChild(script);

	}

	handleGoButtonSetup() {
		let btn = document.createElement("button")
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
		navigator.xr.requestDevice().then( this.deviceFound.bind(this)
		).catch(err => {
			console.error('Error', err)
		})
	}

	deviceFound(xrDevice) {

		this.device = xrDevice

		if(this.device === null){
			console.error('No xr device')
			return
		}

		// a canvas for the pass through camera
		this.xrCanvas = document.createElement('canvas')
		this.xrCanvas.setAttribute('class', 'xr-canvas')
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

		// webxr-ios paints the camera live display here
		// TODO needed?
		document.body.insertBefore(this.xrCanvas, document.body.firstChild)

		// the canvas you supplied in the constructor
		var glContext = this.canvas.getContext('webgl', { compatibleXRDevice: this.device })
		if(!glContext) throw new Error('Could not create a webgl context')

		// Set up the base layer
		this.session.baseLayer = new XRWebGLLayer(this.session, glContext)

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
				this.session.baseLayer.getViewport(view),
				view.projectionMatrix,
				pose.getViewMatrix(view),
			)
			break
		}
	}

}
