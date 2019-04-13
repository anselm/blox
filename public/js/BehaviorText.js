
import {BehaviorMesh} from './BehaviorMesh.js'

///
/// Text
/// - could center TODO
/// - could offer word wrap TODO
/// - could combine 2d composited text layouts with this

export class BehaviorText extends BehaviorMesh {
	constructor(props,blox) {
		props.art = "sphere" // temporary
		super(props,blox)
		this.props = props
		var loader = new THREE.FontLoader();
		loader.load( 'fonts/helvetiker_bold.typeface.json', this.attachText.bind(this) )
	}

	attachText(font) {
		let props = this.props
		let text = props && props.say ? props.say : "nothing"
		let size = props && props.size ? props.size : 1
		let height = props && props.height ? props.height : 1
		let color = props && props.color ? props.color : 0xFF00FF
		var geometry = new THREE.TextGeometry(text, {
			font: font,
			size: size,
			height: height
		} )
		if(this.geometry) this.geometry.dispose()
		this.geometry = geometry
	}

}