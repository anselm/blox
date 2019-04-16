

///
/// BehaviorPhysics
///
/// A physics capability - singleton
///

let physicsInstance = 0

export class BehaviorPhysics {

	/// helper to get at instance
	static getInstance() {
		if(!physicsInstance) physicsInstance = new BehaviorPhysics()
		return physicsInstance
	}

	/// singleton constructor, can be called multiple times although it is slightly wasteful (a tiny object is created and thrown away)
	constructor(props,blox) {

		// a singleton
		if(physicsInstance) {
			console.error("Warning: Multiple instances of BehaviorPhysics - use .getInstance()")
			return physicsInstance
		}
		physicsInstance = this

		Ammo()
		console.log("XXXX")

		this.collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration()
		this.dispatcher              = new Ammo.btCollisionDispatcher(this.collisionConfiguration)
		this.overlappingPairCache    = new Ammo.btDbvtBroadphase()
		this.solver                  = new Ammo.btSequentialImpulseConstraintSolver()
		this.dynamicsWorld           = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.overlappingPairCache, this.solver, this.collisionConfiguration)

		this.dynamicsWorld.setGravity(new Ammo.btVector3(0, -10, 0))

		this.bodies = []
	}

	addConstraint(constraint) {
		this.dynamicsWorld.addConstraint(constraint)
	}

	addRigidBody(body) {
		this.dynamicsWorld.addRigidBody(body)
		this.bodies.push(body)
	}

	on_tick() {
		this.dynamicsWorld.stepSimulation(1/60, 10)
	}

	destroy() {
	    Ammo.destroy(this.dynamicsWorld)
	    Ammo.destroy(this.solver)
	    Ammo.destroy(this.overlappingPairCache)
	    Ammo.destroy(this.dispatcher)
	    Ammo.destroy(this.collisionConfiguration)
	}

}

///
/// BehaviorPhysical
///
/// A physics capability for meshes
///
///

export class BehaviorPhysical {
	constructor(props,blox) {

		if(!blox.mesh) {
			/// TODO right now there is a bit of a hack where it looks for a 'mesh' property on the parent - may be better to force specify hull?
			console.error("There has to be a mesh behavior in this object already")
			return
		}

		if(blox.physical) {
			/// TODO right now there is a bit of a hack where it looks for a 'mesh' property on the parent - may be better to force specify hull?
			console.error("Object already has a physical behavior")
			return
		}

		this.props = props

		// Force properties to exist
		let scale = blox.mesh.scale
		let position = blox.mesh.position
		let size = scale.length()

		let mass = this.mass = props.mass || 0
		let transform = this.transform = 0

		let hull = "sphere"
		if(blox.mesh.geometry instanceof THREE.BoxBufferGeometry) hull = "box"
		if(blox.mesh.geometry instanceof THREE.SphereGeometry) hull = "sphere"
		let shape = 0

		switch(hull) {
			case "sphere":
				shape = this.shape = new Ammo.btSphereShape(size/2)
				transform = this.transform = new Ammo.btTransform()
				transform.setIdentity()
				transform.setOrigin(new Ammo.btVector3(position.x,position.y,position.z))
				break
			default:
				shape = this.shape = new Ammo.btBoxShape(new Ammo.btVector3(scale.x/2,scale.y/2,scale.z/2))
				transform = this.transform = new Ammo.btTransform()
				transform.setIdentity()
				transform.setOrigin(new Ammo.btVector3(position.x,position.y,position.z))
				break
		}

		let localInertia  = new Ammo.btVector3(0, 0, 0)
		if(mass) shape.calculateLocalInertia(mass, localInertia)
		let myMotionState = new Ammo.btDefaultMotionState(transform)
		let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, myMotionState, shape, localInertia)

		let body = this.body = new Ammo.btRigidBody(rbInfo)
		this.trans = new Ammo.btTransform()

		// super bouncy for now
		this.body.setRestitution(0.9)

		// disable deactivation for now
		this.body.setActivationState(4)
		this.body.activate()

		if(this.props.launch) {
			this.body.applyCentralForce(new Ammo.btVector3(this.props.launch.x,this.props.launch.y,this.props.launch.z))
			this.body.applyCentralImpulse(new Ammo.btVector3(this.props.launch.x,this.props.launch.y,this.props.launch.z))
		}

		BehaviorPhysics.getInstance().addRigidBody(this.body)

		if(props.joint) this.testJoint(props)
	}

	///
	/// hack test code
	///

	testJoint(props) {

		let bodies = BehaviorPhysics.getInstance().bodies

		let test1 = bodies[bodies.length-2]
		let test2 = bodies[bodies.length-1]

		let transforma = new Ammo.btTransform()
		transforma.setIdentity()
		//transforma.setOrigin(new Ammo.btVector3(0, 10, 0))

		let transformb = new Ammo.btTransform()
		transformb.setIdentity()
		//transformb.setOrigin(new Ammo.btVector3(0, 0, 0))

		let constraint = new Ammo.btSliderConstraint(
			test1,
			test2,
			transforma,
			transformb,
			true
		)

		constraint.setLowerLinLimit(0)
		constraint.setUpperLinLimit(2)

		// don't need to do this
		//	constraint.setLowerAngLimit(-1)
		//	constraint.setUpperAngLimit(-1)

		// motors are not supported
		//	constraint.setLinMotorVelocity( 1 )
		//	constraint.setMaxLinMotorForce( 0.0001 );
		//	constraint.setPoweredLinMotor( true );

		// try see if a persistent force will make it stay at limit
		//	constraint.setSoftnessLimLin( params.linear || 0 )
		//	constraint.setSoftnessLimAng( params.angular || 0 )

		BehaviorPhysics.getInstance().addConstraint(constraint)

	}

	on_tick(args) {
		let blox = args.blox

		if(!blox.mesh) return

		if(this.props.force) {
			// test code remove - idea is to push the button back out constantly - TODO
			//this.body.applyCentralForce(new Ammo.btVector3(this.props.force.x,this.props.force.y,this.props.force.z))
			this.body.applyCentralImpulse(new Ammo.btVector3(this.props.force.x,this.props.force.y,this.props.force.z))
		}

		let ms = this.body.getMotionState()
		if (ms) {
			ms.getWorldTransform(this.trans)
			var p = this.trans.getOrigin()
			var q = this.trans.getRotation()
			blox.mesh.position.set( p.x(), p.y(), p.z() )
			blox.mesh.quaternion.set( q.x(), q.y(), q.z(), q.w() )
		}
	}
}

/*
function shootSphere () {
    First, we need a ray from the camera.
    Because we need a shooting position, and a shooting direction.
  var vp = mat4.multiply([], projectionMatrix, viewMatrix)
  var invVp = mat4.invert([], vp)

  // get a single point on the camera ray.
  var rayPoint = vec3.transformMat4([], [2.0 * mp[0] / canvas.width - 1.0, -2.0 * mp[1] / canvas.height + 1.0, 0.0], invVp)

  // get the position of the camera.
  var rayOrigin = vec3.transformMat4([], [0, 0, 0], mat4.invert([], viewMatrix))

  var rayDir = vec3.normalize([], vec3.subtract([], rayPoint, rayOrigin))

  // we release the ball a bit in front of the camera.
  vec3.scaleAndAdd(rayOrigin, rayOrigin, rayDir, 4.4)

    Next, create the sphere mesh
  var mesh = primitiveSphere(1.0, {
    segments: 16
  })
  var sphereMesh = new Mesh(mesh.cells, mesh.positions, mesh.normals)

    Then, create the rigid body.
  var mass = 1.0
  var shape = new BtSphereShape(1)
  shape.setMargin(0.05)
  var motionState = new BtDefaultMotionState(new BtTransform(new BtQuaternion(0, 0, 0, 1), new BtVector3(rayOrigin[0], rayOrigin[1], rayOrigin[2])))

  var localInertia = new BtVector3(0, 0, 0)
  shape.calculateLocalInertia(mass, localInertia)

  var ci = new BtRigidBodyConstructionInfo(mass, motionState, shape, localInertia)
  var rigidBody = new BtRigidBody(ci)
  physicsWorld.addRigidBody(rigidBody)

    Now send the rigid body flying!
  var POWER = 80.0
  rigidBody.applyImpulse(new BtVector3(POWER * rayDir[0], POWER * rayDir[1], POWER * rayDir[2]), new BtVector3(rayOrigin[0], rayOrigin[1], rayOrigin[2]))

  return {rigidBody: rigidBody, drawCall: sphereMesh, color: [1.0, 1.0, 1.0]}
}

var transformTemp = new BtTransform()
// extracts the model matrix from a rigid body.
function getModelMatrix (rb) {
  var ms = rb.getMotionState()

  if (ms) {
    ms.getWorldTransform(transformTemp)
    var p = transformTemp.getOrigin()
    var q = transformTemp.getRotation()

    return mat4.fromRotationTranslation(
      [], [q.x(), q.y(), q.z(), q.w()], [p.x(), p.y(), p.z()])
  }
}
*/


/*

various kinds of primitives

https://github.com/kripken/ammo.js/blox/master/examples/webgl_demo_terrain/index.html


				switch ( objectType ) {
					case 1:
						// Sphere
						var radius = 1 + Math.random() * objectSize;
						threeObject = new THREE.Mesh( new THREE.SphereGeometry( radius, 20, 20 ), createObjectMaterial() );
						shape = new Ammo.btSphereShape( radius );
						shape.setMargin( margin );
						break;
					case 2:
						// Box
						var sx = 1 + Math.random() * objectSize;
						var sy = 1 + Math.random() * objectSize;
						var sz = 1 + Math.random() * objectSize;
						threeObject = new THREE.Mesh( new THREE.BoxGeometry( sx, sy, sz, 1, 1, 1 ), createObjectMaterial() );
						shape = new Ammo.btBoxShape( new Ammo.btVector3( sx * 0.5, sy * 0.5, sz * 0.5 ) );
						shape.setMargin( margin );
						break;
					case 3:
						// Cylinder
						var radius = 1 + Math.random() * objectSize;
						var height = 1 + Math.random() * objectSize;
						threeObject = new THREE.Mesh( new THREE.CylinderGeometry( radius, radius, height, 20, 1 ), createObjectMaterial() );
						shape = new Ammo.btCylinderShape( new Ammo.btVector3( radius, height * 0.5, radius ) );
						shape.setMargin( margin );
						break;
					default:
						// Cone
						var radius = 1 + Math.random() * objectSize;
						var height = 2 + Math.random() * objectSize;
						threeObject = new THREE.Mesh( new THREE.CylinderGeometry( 0, radius, height, 20, 2 ), createObjectMaterial() );
						shape = new Ammo.btConeShape( radius, height );
						break;
				}

*/

/*

cannon

this.world = new CANNON.World();
this.world.defaultContactMaterial.contactEquationStiffness = 1e6;
this.world.defaultContactMaterial.contactEquationRegularizationTime = 3;
this.world.solver.iterations = 20;
this.world.gravity.set(this.gravity.x, this.gravity.y, this.gravity.z);
this.world.allowSleep = true;
this.world.broadphase = new CANNON.SAPBroadphase(this.world);


On bodies, I set:
body.allowSleep = true;
body.sleepSpeedLimit = 0.01;
body.sleepTimeLimit = 1.0;

On the material:
mass: 100 (or about the mass of the object in kilograms)
friction: 0.1
restitution: 0.3 

*/

