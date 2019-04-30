
import {BehaviorMesh} from './BehaviorMesh.js'

export class BehaviorTextPanel extends BehaviorMesh {
	constructor(args) {
		let props = args.description
		let blox = args.blox
		props.art = "sphere" // temporary
		super(args)
		this.props = props

		let material = this.makeMaterial(props.say || "hello")
		let geometry = this.makeGeometry(1,1)

		if(this.material) this.material.dispose()
		this.material = material

		if(this.geometry) this.geometry.dispose()
		this.geometry = geometry

	}

	makeGeometry(w,h) {
		return new THREE.PlaneGeometry(w,h,10,10)
	}

	makeMaterial(prettywords) {

		// Add a nice round rectangle feature

		CanvasRenderingContext2D.prototype.roundRect = function(sx,sy,ex,ey,r) {
		    var r2d = Math.PI/180;
		    if( ( ex - sx ) - ( 2 * r ) < 0 ) { r = ( ( ex - sx ) / 2 ); } //ensure that the radius isn't too large for x
		    if( ( ey - sy ) - ( 2 * r ) < 0 ) { r = ( ( ey - sy ) / 2 ); } //ensure that the radius isn't too large for y
		    this.beginPath();
		    this.moveTo(sx+r,sy);
		    this.lineTo(ex-r,sy);
		    this.arc(ex-r,sy+r,r,r2d*270,r2d*360,false);
		    this.lineTo(ex,ey-r);
		    this.arc(ex-r,ey-r,r,r2d*0,r2d*90,false);
		    this.lineTo(sx+r,ey);
		    this.arc(sx+r,ey-r,r,r2d*90,r2d*180,false);
		    this.lineTo(sx,sy+r);
		    this.arc(sx+r,sy+r,r,r2d*180,r2d*270,false);
		    this.closePath();
		}

		// a convenient bubble drawer

		function drawBubble(ctx, x, y, w, h, radius) {
			var r = x + w;
			var b = y + h;
			ctx.beginPath();
			ctx.strokeStyle="#30A030";
			ctx.lineWidth="6";
			ctx.moveTo(x+radius, y);
			//ctx.lineTo(x+radius/2, y-10);
			//ctx.lineTo(x+radius * 2, y);
			ctx.lineTo(r-radius, y);
			ctx.quadraticCurveTo(r, y, r, y+radius);
			ctx.lineTo(r, y+h-radius);
			ctx.quadraticCurveTo(r, b, r-radius, b);
			ctx.lineTo(x+radius, b);
			ctx.quadraticCurveTo(x, b, x, b-radius);
			ctx.lineTo(x, y+radius);
			ctx.quadraticCurveTo(x, y, x+radius, y);
			ctx.stroke();
		}

		// a handy dandy text wrapper
		// TODO support line breaks

		function wrapText(context, text, x, y, maxWidth, lineHeight) {
			var words = text.split(' ');
			var line = '';
			for(var n = 0; n < words.length; n++) {
				var testLine = line + words[n] + ' '
				var metrics = context.measureText(testLine);
				var testWidth = metrics.width
				if (testWidth > maxWidth && n > 0) {
					context.fillText(line, x, y)
					line = words[n] + ' '
					y += lineHeight
				}
				else {
					line = testLine
				}
			}
			context.fillText(line, x, y)
		}

		// hack -TODO caller should be able to set these
		let fsize = 60
		let w = 1024
		let h = 1024

		// a scratch canvas
		// TODO caller needs to be able to set various params here

		let scratch = document.createElement("canvas")
		scratch.width = w
		scratch.height = h
		let context = scratch.getContext("2d")
		//context.clearRect(0,0,w,h);
		context.font = fsize + "pt Arial"
		//context.textAlign = "center"
		//context.fillStyle = "#000000"
		//context.fillRect(0, 0, w, h)
		context.fillStyle = "#cc00cc"
		context.strokeStyle = "#cc00cc";
		//context.fillText(args, scratch.width / 2, scratch.height / 2)

		//	context.roundRect(0,0,600,600,10).stroke(); //or .fill() for a filled rect
		//_cxt.roundRect(35,10,260,120,20);
		//_cxt.strokeStyle = "#000";
		//_cxt.stroke();

		drawBubble(context,10,10,w-20,h-20,5)

		wrapText(context,prettywords,fsize,fsize*1.5+2,w-fsize*2,fsize+2)

		let texture = new THREE.Texture(scratch)
		texture.needsUpdate = true
		let material = new THREE.MeshBasicMaterial({map : texture})

		return material
	}
}