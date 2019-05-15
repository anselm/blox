
///
/// Note XR anchored objects should not try to also move themselves
///

export class BehaviorAnchor {
	constructor(args) {
		this.blox = args.blox
		let mesh = this.mesh = args.blox.mesh
		if(args.description.anchor) {
			// decorating a blox with an already existing anchor
			document.blox_renderer.addAnchor({anchor:args.description.anchor,node:mesh})
		}
		else if(args.description.art) {
			// decorating a blox with an image based anchor
			document.blox_renderer.addAnchor({art:args.description.art,node:mesh})
		} else if(args.description.cartographic) {
			document.blox_renderer.addAnchor({
				cartographic:args.description.cartographic,
				node:mesh
			})
		}
	}
}