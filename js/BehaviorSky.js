export class BehaviorSky extends THREE.Mesh {
	constructor() {
		let sky_vertex = `
			varying vec2 vUV;
			void main() {  
			  vUV = uv;
			  vec4 pos = vec4(position, 1.0);
			  gl_Position = projectionMatrix * modelViewMatrix * pos;
			}
			`
		let sky_fragment = `
			uniform sampler2D texture;  
			varying vec2 vUV;

			void main() {  
			  vec4 sample = texture2D(texture, vUV);
			  gl_FragColor = vec4(sample.xyz, sample.w);
			}
			`
		var geometry = new THREE.SphereGeometry(-500, 60, 40);  
		var uniforms = {  
		  texture: { type: 't', value: THREE.ImageUtils.loadTexture('/art/eso0932a.jpg') }
		}
		var material = new THREE.ShaderMaterial( {  
		  uniforms:       uniforms,
		  vertexShader:   sky_vertex,
		  fragmentShader: sky_fragment,
		})
		let skyBox = super(geometry, material)
		// skyBox.scale.set(-1, 1, 1) - flipped the above sphere instead
		skyBox.renderDepth = 1000.0
	}
}
