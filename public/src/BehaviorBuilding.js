
///
/// Dynamic building
///

function uvmap(geometry) {

	geometry.computeBoundingBox();

	var max = geometry.boundingBox.max,
	    min = geometry.boundingBox.min;
	var offset = new THREE.Vector2(0 - min.x, 0 - min.y);
	var range = new THREE.Vector2(max.x - min.x, max.y - min.y);
	var faces = geometry.faces;

	geometry.faceVertexUvs[0] = [];

	for (var i = 0; i < faces.length ; i++) {

	    var v1 = geometry.vertices[faces[i].a], 
	        v2 = geometry.vertices[faces[i].b], 
	        v3 = geometry.vertices[faces[i].c];

	    geometry.faceVertexUvs[0].push([
	        new THREE.Vector2((v1.x + offset.x)/range.x ,(v1.y + offset.y)/range.y),
	        new THREE.Vector2((v2.x + offset.x)/range.x ,(v2.y + offset.y)/range.y),
	        new THREE.Vector2((v3.x + offset.x)/range.x ,(v3.y + offset.y)/range.y)
	    ]);
	}
	geometry.uvsNeedUpdate = true;

}

function assignUVs(geometry) {

    geometry.faceVertexUvs[0] = [];

    geometry.faces.forEach(function(face) {

        var uvs = [];
        var ids = [ 'a', 'b', 'c'];
        for( var i = 0; i < ids.length; i++ ) {
            var vertex = geometry.vertices[ face[ ids[ i ] ] ].clone();

            var n = vertex.normalize();
            var yaw = .5 - Math.atan( n.z, - n.x ) / ( 2.0 * Math.PI );
            var pitch = .5 - Math.asin( n.y ) / Math.PI;

            var u = yaw,
                v = pitch;
            uvs.push( new THREE.Vector2( u, v ) );
        }
        geometry.faceVertexUvs[ 0 ].push( uvs );
    });

    geometry.uvsNeedUpdate = true;
}

function concrete() {
	const textureLoader = new THREE.TextureLoader()
	const texture = textureLoader.load( '/art/concrete.png' )
	texture.encoding = THREE.sRGBEncoding
	texture.anisotropy = 16
	const material = new THREE.MeshStandardMaterial( { map: texture })
	return material

}

function roof(width=20,depth=20) {

	var shape = new THREE.Shape()

	let outer = width/2+0.5
	let inner = width/2-0.5
	let angle = 0
	let segments = 20

	shape.moveTo(inner,0)

	// outer
	for( ; angle < Math.PI ; angle += Math.PI/segments ) {
		let x = Math.cos(angle) * outer // if angle is zero then x is one, if angle is 3.14 then x = -1
		let y = Math.sin(angle) * outer
		shape.lineTo(x,y)
	}

shape.lineTo(-outer,0)

	// inner
	for( ; angle >= 0; angle -= Math.PI/segments ) {
		let x = Math.cos(angle) * inner // if angle is zero then x is one, if angle is 3.14 then x = -1
		let y = Math.sin(angle) * inner
		shape.lineTo(x,y)
	}

	var extrudeSettings = {
		steps: 2,
		depth: depth,
		bevelEnabled: false,
		bevelThickness: 1,
		bevelSize: 1,
		bevelOffset: 0,
		bevelSegments: 1
	};

	var geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );

assignUVs(geometry)

//	var material = new THREE.MeshPhongMaterial( { color: 0x00ff00 } );

var material = concrete()

	var mesh = new THREE.Mesh( geometry, material ) ;

	return mesh
}

// 3x3x3+r 
// 3x3x3
// 

// width x depth x height x segments + r
//

function make_entire_building(xx=0,yy=0,zz=0,hasroof=false,width=20,depth=20,height=10,floors=1,segments=1) {

	let body = new THREE.Object3D()

	for(let f=0;f<floors;f++) {

		// a floor
		let ishole = (f==floors-1) && hasroof

		if(!ishole)
		{
			let m1 = new THREE.Mesh()
			m1.geometry = new THREE.BoxBufferGeometry(width+1,1,depth+1,16,16,16)
			m1.material = concrete() ; // new THREE.MeshPhongMaterial( {color: 0xff00ff } )
			m1.position.set(0,f*height,0)
			body.add(m1)
		} else

		// a hole
		{
			{
				let m1 = new THREE.Mesh()
				m1.geometry = new THREE.BoxBufferGeometry(width,1,1,16,16,16)
				m1.material = concrete() ; // new THREE.MeshPhongMaterial( {color: 0xff00ff } )
				m1.position.set(0,f*height,depth/2)
				body.add(m1)
			}

			{
				let m1 = new THREE.Mesh()
				m1.geometry = new THREE.BoxBufferGeometry(width,1,1,16,16,16)
				m1.material = concrete() ; // new THREE.MeshPhongMaterial( {color: 0xff00ff } )
				m1.position.set(0,f*height,-depth/2)
				body.add(m1)
			}

			{
				let m1 = new THREE.Mesh()
				m1.geometry = new THREE.BoxBufferGeometry(1,1,depth,16,16,16)
				m1.material = concrete() ; // new THREE.MeshPhongMaterial( {color: 0xff00ff } )
				m1.position.set(width/2,f*height,0)
				body.add(m1)
			}

			{
				let m1 = new THREE.Mesh()
				m1.geometry = new THREE.BoxBufferGeometry(1,1,depth,16,16,16)
				m1.material = concrete() ; // new THREE.MeshPhongMaterial( {color: 0xff00ff } )
				m1.position.set(-width/2,f*height,0)
				body.add(m1)
			}
		}

		// pillars

		if(segments)
		for(let x = 0; x < width+1; x+=width/segments) {
			for(let z = 0; z < depth+1; z+=depth/segments ) {
				for(let k = 0; k < segments; k++) {
					let m2 = new THREE.Mesh()
					m2.geometry = new THREE.BoxBufferGeometry(1,height,1,16,16,16)
					m2.material = concrete(); // new THREE.MeshPhongMaterial( {color: 0xffff00 } )
					m2.position.set(x-width/2,0+f*height-height/2,z-depth/2)
					body.add(m2)
				}
			}
		}

	}

if(hasroof) {
	let r = roof(width,depth)
	r.position.set(0,floors*height-height,-depth/2)
	r.scale.set(1,0.7,1)
	body.add(r)
}

	body.position.set(xx*width,yy*height,zz*depth)

	return body
}


function fancynumber(val=0,min=0,max=10) {
	if(typeof val === "string")	val = eval(val)
	if(val<min) val = min
	if(val>max) val = max
	return val
}



export class BehaviorBuilding extends THREE.Mesh {

	constructor(args) {

		// TODO I would prefer to instance and set properties in one step rather than deleting and resetting properties
		super()

		// set or reset various properties from params
		this.on_reset(args)

		// force set these properties on the blox; by convention these become reserved for this role
		let blox = args.blox
		if(blox.mesh) console.error("Warning: mesh already assigned")
		blox.mesh = this
		blox.position = this.position
		blox.quaternion = this.quaternion

		// special feature - do not show if xr mode
		if(args.description.hasOwnProperty("xr") && !args.description.xr) {
			this.visible = false
		}

	}

	/// set or reset qualities of this mesh
	on_reset(args) {

		let props = args.description || this.description
		if(!props) {
			console.error("need to pass some args to reset a mesh")
			return true // allow event to be passed onwards
		}

		// support a single parameter - to the art
		if(typeof props === "string") props = { art:props }

		// set or reset material from params if changed
		// - do this before the geom in case I later want to try scavenge material into gltf
		if(!this.description || props.color != this.description.color || !this.material) {
			let c = props.color || 0xff00ff
			let s = props.doublesided ? THREE.DoubleSide : 0
			let a = props.alpha ? 0 : 0
			let t = props.texture ? THREE.ImageUtils.loadTexture(props.texture) : 0
			let mat = new THREE.MeshPhongMaterial( {color: c, transparent: a, side: s, map: t } )
			if(this.material) this.material.dispose()
			this.material = mat
		}

		// set or reset geometry if changed
		if(!this.madeGeometry) {
			this.madeGeometry = 1
			this.makeBuildings(props)
		}

		let mesh = this

		if(props.scale) {
			mesh.scale.set(props.scale.x,props.scale.y,props.scale.z)
		}

		if(props.position) {
			mesh.position.set(props.position.x,props.position.y,props.position.z)
		}

		if(props.orientation) {
			mesh.rotation.set(props.orientation.x * Math.PI/180.0, props.orientation.y * Math.PI/180.0, props.orientation.z * Math.PI/180.0 )
		}

		if(typeof props.visible !== 'undefined') {
			this.material.visible = props.visible ? true : false
		}

	}

	/// set or reset geometry from a string description with special rules
	makeBuildings(props) {

		let quantity = fancynumber(props.quantity,1,10)
		for(let q=0;q<quantity;q++) {
			let xoffset = fancynumber(props.xoffset,-100,100)
			let yoffset = fancynumber(props.yoffset,-100,100)
			let zoffset = fancynumber(props.zoffset,-100,100)
			let hasroof = fancynumber(props.hasroof) ? true : false
			let width = fancynumber(props.width,5,100)
			let depth = fancynumber(props.depth,5,100)
			let height = fancynumber(props.height,5,100)
			let floors = fancynumber(props.floors,1,10)
			let segments = fancynumber(props.segments,1,10)
			let p = make_entire_building(xoffset,yoffset,zoffset,hasroof,width,depth,height,floors,segments)
			this.add(p)
		}

		// add a piece of art to the center
		let geometry = new THREE.BoxBufferGeometry(1,1,1,16,16,16)
		if(this.geometry) this.geometry.dispose()
		this.geometry = geometry
		return this.geometry
	}

	///
	/// may be subclassed
	///
	setCustomGeometry() {
		console.error(this)
		throw new Error('You have to implement the method setCustomGeometry!')
	}

	///
	/// notice when any children blox show up and add to 3js
	///

	on_blox_added(args) {
		let blox = args.blox
		let child = args.child
		let mesh = this
		let children = child.query({instance:THREE.Object3D,all:true})
		children.forEach((value)=>{
			console.log("*******  mesh named " + args.blox.name + " adding child named " + args.child.name)
			mesh.add(value)
		})
		return false // don't continue to pass this fact on
	}

}


