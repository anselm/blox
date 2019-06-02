//import * as THREE from 'three'

import * as mat4 from "../lib/gl-matrix/vec3.js"
import * as vec3 from "../lib/gl-matrix/mat4.js"


//import * as mat4 from '../lib/gl-matrix/mat4'
//import * as vec3 from '../lib/gl-atrix/gl-matrix/src/gl-matrix/vec3'

var meshMap = new Map()

const workingMatrix = mat4.create()
const workingVec3 = vec3.create()
var savedOrigin = [0,0,0]
var savedDirection = [0,0,-1]
var reticleParent = null
var reticle = null
            
var reticleTrackedColor = new THREE.Color( 0xDDFFDD );
var reticleNotTrackedColor = new THREE.Color( 0xFF6666 );
var reticleMaterial = new THREE.MeshStandardMaterial({ color: reticleTrackedColor })
var requestNextHit = true
let singleton = 0

export class BehaviorXRWorldInfo extends THREE.Group {

    constructor(session) {

        // run as a singleton
        if(singleton) {
            console.error("XRWorldInfo called more than once")
            return singleton
        }
        singleton = this

        this.session = session
        this.logger = console
        this.scene = this

        if(!this.scene) {
            logger.error("no scene")
            return
        }

        // enable extended world sensing
        let sensingState = this.session.updateWorldSensingState({
            illuminationDetectionState : {
                enabled : true
            },
            meshDetectionState : {
                enabled : true,
                normals: true
            }
        })

        // don't waste time remaking this every frame
        this._handleHitResults = this.handleHitResults.bind(this)

        // a reticule
        reticle = new THREE.Mesh( new THREE.RingGeometry(0.04, 0.05, 36, 64), reticleMaterial)
        reticle.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(THREE.Math.degToRad(-90)))
        reticleParent = new THREE.Object3D()
        reticleParent.add(reticle)
        reticleParent.matrixAutoUpdate = false
        reticleParent.visible = false
        this.scene.add(reticleParent)

    }

    refreshWorldInfo(frame) {
        let worldInfo = frame.worldInformation
        if(!worldInfo || !worldInfo.meshes) return
        if(!worldInfo.meshes.forEach) {
            this.logger.error("WHAT?")
        }

        // mark
        meshMap.forEach(object => { object.seen = false })

        // update meshes
        worldInfo.meshes.forEach(worldMesh => {
            var object = meshMap.get(worldMesh.uid);
            if (object) {
                this.handleUpdateNode(worldMesh, object)
            } else {
                this.handleNewNode(worldMesh)
            }
        })

        // sweep
        meshMap.forEach(object => { 
            if (!object.seen) {
                this.handleRemoveNode(object)
            } 
        })

        // udpate reticule
        if (requestNextHit) {
            requestNextHit = false
            this.session.requestFrameOfReference('head-model').then(headFrameOfReference => {
                this.session.requestHitTest(savedOrigin, savedDirection, headFrameOfReference)
                    .then(this._handleHitResults)
                    .catch(err => {
                        this.logger.error('Error testing hits', err)
                    })
            })
        }
    }

    // handle hit testing slightly differently than other samples, since we're doing
    // it per frame.  The "boiler plate" code below is slightly different, setting 
    // requestNextHit on tap instead of executing the hit test.  The custom XREngineHits
    // does a hit test each frame if the previous one has resolved
    handleHitResults(hits) {
        let size = 0.05;
        if (hits && hits.length > 0) {
            let hit = hits[0]
            this.session.requestFrameOfReference('head-model').then(headFrameOfReference => {
                this.session.requestFrameOfReference('eye-level').then((eyeLevelFrameOfReference)=>{
                    // convert hit matrices from head to eye level coordinate systems
                    headFrameOfReference.getTransformTo(eyeLevelFrameOfReference, workingMatrix)
                    mat4.multiply(workingMatrix, workingMatrix, hit.hitMatrix)
                    const node = reticleParent
                    node.matrix.fromArray(workingMatrix)
                    reticleParent.visible = true   // it starts invisible
                    reticle.material.color = reticleTrackedColor
                    node.updateMatrixWorld(true)
                })
            })
        } else {
            reticle.material.color = reticleNotTrackedColor
        }
        requestNextHit = true
    }

    handleUpdateNode(worldMesh, object) {
        object.seen = true
        // we don't need to do anything if the timestamp isn't updated
        if (worldMesh.timeStamp <= object.ts) {
            return;
        }
        if (worldMesh.vertexCountChanged) {
            let newMesh = this.newMeshNode(worldMesh)
            object.threeMesh.geometry.dispose()
            object.node.remove(object.threeMesh)
            object.node.add(newMesh)
            object.threeMesh = newMesh
        } else {
            if (worldMesh.vertexPositionsChanged) {
                let position = object.threeMesh.geometry.attributes.position
                if (position.array.length != worldMesh.vertexPositions.length) {
                    this.logger.error("position and vertex arrays are different sizes", position, worldMesh)
                }
                position.setArray(worldMesh.vertexPositions);
                position.needsUpdate = true;
            }
            if (worldMesh.textureCoordinatesChanged) {
                let uv = object.threeMesh.geometry.attributes.uv
                if (uv.array.length != worldMesh.textureCoordinates.length) {
                    this.logger.error("uv and vertex arrays are different sizes", uv, worldMesh)
                }
                uv.setArray(worldMesh.textureCoordinates);
                uv.needsUpdate = true;
            }
            if (worldMesh.triangleIndicesChanged) {
                let index = object.threeMesh.geometry.index
                if (index.array.length != worldMesh.triangleIndices) {
                    this.logger.error("uv and vertex arrays are different sizes", index, worldMesh)
                }
                index.setArray(worldMesh.triangleIndices);
                index.needsUpdate = true;
            }
            if (worldMesh.vertexNormalsChanged && worldMesh.vertexNormals.length > 0) {
                // normals are optional
                let normals = object.threeMesh.geometry.attributes.normals
                if (normals.array.length != worldMesh.vertexNormals) {
                    this.logger.error("uv and vertex arrays are different sizes", normals, worldMesh)
                }
                normals.setArray(worldMesh.vertexNormals);
                normals.needsUpdate = true;
            }
        }
    }

    _handleAnchorUpdate(thing) {
    	// XXX
    }

    _handleAnchorDelete(thing) {
    	// xxx
    }

    handleRemoveNode(object) {
        this.scene.remove(object.node)
        object.threeMesh.geometry.dispose()
        this.engine._removeAnchorForNode(object.node,this.logger)

        let anchor = object.worldMesh
        anchor.removeEventListener("update", anchor._handleAnchorUpdateCallback)
        anchor.removeEventListener("removed", anchor._handleAnchorDeleteCallback)
        anchor._handleAnchorUpdateCallback = null
        anchor._handleAnchorDeleteCallback = null

        meshMap.delete(object.worldMesh.uid)
    }

    handleNewNode(worldMesh) {
        let worldMeshGroup = new THREE.Group();
        var mesh = this.newMeshNode(worldMesh)
        worldMeshGroup.add(mesh)
        this.scene.add(worldMeshGroup)
        this.engine.addAnchoredNode(worldMesh, worldMeshGroup,this.logger)

        worldMesh._handleAnchorUpdateCallback = this._handleAnchorUpdate.bind(this, logger)
        worldMesh._handleAnchorDeleteCallback = this._handleAnchorDelete.bind(this, logger)

        meshMap.set(worldMesh.uid, {
            ts: worldMesh.timeStamp, 
            worldMesh: worldMesh, 
            node: worldMeshGroup, 
            seen: true, 
            threeMesh: mesh
        })
    }

    newMeshNode(worldMesh) {
        let edgeColor, polyColor
//        if (worldMesh instanceof XRFaceMesh) {
//            edgeColor = '#999999'
//           polyColor = '#999900'
//        } else
        {
            edgeColor = '#11FF11'
            polyColor = '#009900'
        }
        let mesh = new THREE.Group();
        let geometry = new THREE.BufferGeometry()
        let indices = new THREE.BufferAttribute(worldMesh.triangleIndices, 1)
        indices.dynamic = true
        geometry.setIndex(indices)

        let verticesBufferAttribute = new THREE.BufferAttribute( worldMesh.vertexPositions, 3 )
        verticesBufferAttribute.dynamic = true
        geometry.addAttribute( 'position', verticesBufferAttribute );
        let uvBufferAttribute = new THREE.BufferAttribute( worldMesh.textureCoordinates, 2 )
        uvBufferAttribute.dynamic = true
        geometry.addAttribute( 'uv', uvBufferAttribute );
        if (worldMesh.vertexNormals.length > 0) {
            let normalsBufferAttribute = new THREE.BufferAttribute( worldMesh.vertexNormals, 3 )
            normalsBufferAttribute.dynamic = true
            geometry.addAttribute( 'normal', normalsBufferAttribute );
        } else {
            geometry.computeVertexNormals()
        }
        // transparent mesh
        var wireMaterial = new THREE.MeshPhongMaterial({color: edgeColor, wireframe: true})
        var material = new THREE.MeshPhongMaterial({color: polyColor, transparent: true, opacity: 0.25})
        mesh.add(new THREE.Mesh(geometry, material))
        mesh.add(new THREE.Mesh(geometry, wireMaterial))
        mesh.geometry = geometry;  // for later use
        //worldMesh.mesh = mesh;
        return mesh
    }

    updateExtents(object) {

        let worldMesh = object.worldMesh

        // in this approach i just find an axis aligned bounding box - which is good enough and much faster for tests
        // TODO I bet this is already done at a lower level

        if(!worldMesh.vertexPositions.length) return
        let vertices = worldMesh.vertexPositions
        let i = 0
        let x = vertices[i*3+0]
        let y = vertices[i*3+1]
        let z = vertices[i*3+2]
        let min = [x,y,z]
        let max = [x,y,z]
        for(let i = 1; i < vertices.length; i+=3 ) {
            x = vertices[i*3]
            y = vertices[i*3+1]
            z = vertices[i*3+2]
            if(x < min[0]) min[0] = x
            if(y < min[1]) min[1] = y
            if(z < min[2]) min[2] = z
            if(x > max[0]) max[0] = x
            if(y > max[1]) max[1] = y
            if(z > max[2]) max[2] = z
        }
        object.min = vec3.fromValues(min[0],min[1],min[2])
        object.max = vec3.fromValues(min[0],min[1],min[2])
        object.horizontal = min[1] == max[1] ? true : false
        object.transform = mat4.create()
        object.transform.multiply(object.transform,object.transform,worldMesh.modelMatrix)
    }

    findClosestBelow(point,top=-1,bottom=-2) {

        let distance = -1
        let final_closest = 0

        meshMap.forEach(object => {

            let worldMesh = object.worldMesh

            // this can be called less often
            this.updateExtents(worldMesh)

            // skip
            if(!object.horizontal) return

            // get min max in world
            let min = vec3.fromValues(object.min[0],object.min[1],object.min[2])
            let max = vec3.fromValues(object.max[0],object.max[1],object.max[2])
            vec3.transformMat4(min,min,object.transform)
            vec3.transformMat4(max,max,object.transform)

            // distance between aabb and point?
            let dist = 0

            // take best
            if(distance == -1 || dist < distance) {
                distance = dist
                final_closest = object
            }
        })

        return final_closest
    }

/*
    getClosestVertex(point,worldMesh) {

        // in this approach i find the absolute closest vertex

        let mat = mat4.create()
        let vec = vec3.create()

        // ideally i would invert the point into worldmesh coords
        // mat4.invert(workingMatrix,worldMesh.modelMatrix)
        // vec3.transformMat4(vec,vec,workingMatrix)

        // for now invert every point - get the transform somehow
        //mat = worldMesh.modelMatrix
        mat4.multiply(mat,mat,worldMesh.modelMatrix)

        // must be closer than this
        let distance = -1
        let closest = 0

        // no data?
        if(!worldMesh.vertexPositions.length) return

        // visit every vertex
        let vertices = worldMesh.vertexPositions

        for(let 0 = 1; i < vertices.length; i+=3 ) {
            vec[0] = vertices[i*3]
            vec[1] = vertices[i*3+1]
            vec[2] = vertices[i*3+2]

            // transform to world - todo this is a huge waste of cpu
            vec3.transformMat4(vec,vec,mat)

            let dist = (vec[0]-point.x)*(vec[0]-point.x)+(vec[1]-point.y)*(vec[1]-point.y)+(vec[2]-point.z)*(vec[2]-point.z)
            if(distance < 0 || dist < distance ) {
                distance = dist
                closest = { x:vec3[0], y:vec3[1], z:vec3[2], distance:dist }
            }
        }

        return closest
    }

    findClosestBelowOld(point,top=-1,bottom=-2) {

        // returns a point in x,y,z that is the ground or fails

        let distance = -1
        let final_closest = 0

        meshMap.forEach(object => {
            // horribly inefficient code
            let closest = this.getClosestVertex(point, object.worldMesh)
            if(!closest) return
            // horribly inefficient to test this here
            if(closest.y > point.y + top) return // if closest point on plane is too close to point then ignore
            if(closest.y < point.y + bottom ) return // if closest point on plane is too far from point then ignore
            if(distance != -1 && closest.distance > distance ) return // take closest only
            distance = closest.distance
            final_closest = closest 
        })

        return final_closest

    }
*/

}

