
///
/// Note XR anchored objects should not try to also move themselves
///

export class BehaviorAnchor {
	constructor(args) {
		this.blox = args.blox
		this.mesh = args.blox.mesh
		if(args.description.anchor) {
			// decorating a blox with an already existing anchor
			document.blox_renderer.addAnchor({anchor:args.description.anchor,node:this.mesh})
		}
		else if(args.description.art) {
			// decorating a blox with an image based anchor
			document.blox_renderer.addAnchor({art:args.description.art,node:this.mesh})
		} else {
			// TODO geo anchor of a known geo location
		}
	}
}