/** @type {CanvasRenderingContext2D} */
var ctx;

window.addEventListener('load', () => {
	/** @type {HTMLCanvasElement} */
	const canvas = document.getElementById('map_canvas');;
	ctx = canvas.getContext('2d');
	canvas.addEventListener('wheel', onMouseWheel, { passive: false });
	canvas.addEventListener('mousedown', onMouseDown);
	canvas.addEventListener('mousemove', onMouseMove);
	canvas.addEventListener('mouseup', onMouseUp);
	canvas.addEventListener('mouseleave', onMouseUp);
	canvas.addEventListener('touchstart', onMouseDown, { passive: false });
	canvas.addEventListener('touchmove', onMouseMove, { passive: false });
	canvas.addEventListener('touchend', onMouseUp);
	canvas.addEventListener('touchcancel', onMouseUp);
	canvas.addEventListener('touchleave', onMouseUp);
});

function loadImages() { document.getElementById('image_input').click(); }

/**
 * @param {FileList | File[]} files
 */
async function onImagesChanged(files) {
	if (!files || files.length === 0) return;
	const fragments = await Promise.all(Array.from(files || []).map(file => MapFragment.createLoaded(file)));
	setFragments(fragments);
}

function resetPos() {
	viewWindow.resetPos();
	redrawFragmentsSoon();
}

function resetZoom() {
	viewWindow.resetZoom();
	redrawFragmentsSoon();
}

class Pos {
	/**
	 * @param {number} x
	 * @param {number} y
	 */
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}

/**
 * @param {string} name
 */
function getPosFromName(name) {
	// Get the position from the name
	let match;
	if (match = name.match(/(-?\d+)[,;| ](-?\d+)/)) {
		return new Pos(parseInt(match[1]), parseInt(match[2]));
	}
	console.error('Invalid name', name);
	return null;
}

class MapFragment {
	/** @type {HTMLImageElement} */
	image = null;

	/**
	 * @param {File} file
	 */
	constructor(file) {
		this.file = file;
		this.pos = getPosFromName(file.name);
	}

	async loadImage() {
		if (this.image) return this.image;
		// Create an image from the file
		const image = new Image();
		image.src = window.URL.createObjectURL(this.file);
		this.image = await new Promise(resolve => {
			image.onload = () => resolve(image);
		});
		return this.image;
	}

	static async createLoaded() {
		const fragment = new MapFragment(...arguments);
		await fragment.loadImage();
		return fragment;
	}
}

/**
 * @param {Pos[]} pos
 */
function getMinPos(pos) {
	return new Pos(Math.min(...pos.map(p => p.x)), Math.min(...pos.map(p => p.y)));
}

/**
 * @param {Pos[]} pos
 */
function getMaxPos(pos) {
	return new Pos(Math.max(...pos.map(p => p.x)), Math.max(...pos.map(p => p.y)));
}

class ViewWindow {
	scale = 1;
	/**
	 * @param {number} width
	 * @param {number} height
	 * @param {number} xCenter
	 * @param {number} yCenter
	 */
	constructor(width, height, xCenter, yCenter) {
		this.width = width;
		this.height = height;
		this.xCenter = xCenter;
		this.yCenter = yCenter;
	}

	calculateScale() {
		return this.scale = Math.min(this.width / (m.nbFragmentsX * m.fragmentWidth), this.height / (m.nbFragmentsY * m.fragmentHeight));
	}

	getOffsetLeft() {
		return this.xCenter * this.scale - this.width / this.scale / 2;
	}

	getOffsetTop() {
		return this.yCenter * this.scale - this.height / this.scale / 2;
	}

	zoom(scaleFactor, fixedMapPos) {
		const prevScale = this.scale;
		this.width *= scaleFactor;
		this.height *= scaleFactor
		this.calculateScale();

		// keep the pos fixedMapPos at the same place on the screen
		this.xCenter += (fixedMapPos.x - this.xCenter) * (1 - prevScale / this.scale);
		this.yCenter += (fixedMapPos.y - this.yCenter) * (1 - prevScale / this.scale);
	}

	fromTopLeftToBottomRight() {
		this.resetPos();
		this.resetZoom();
	}

	resetPos() {
		this.xCenter = (m.minPos.x + m.maxPos.x + 1) / 2 * m.fragmentWidth;
		this.yCenter = (m.minPos.y + m.maxPos.y + 1) / 2 * m.fragmentHeight;
	}

	resetZoom() {
		this.width = (m.maxPos.x - m.minPos.x + 1) * m.fragmentWidth;
		this.height = (m.maxPos.y - m.minPos.y + 1) * m.fragmentHeight;
	}
}

/** @type {MapFragment[]} */
var fragments = [];
const viewWindow = new ViewWindow(0, 0, 0, 0);
var m = {
	minPos: new Pos(0, 0),
	maxPos: new Pos(0, 0),
	fragmentWidth: 0, fragmentHeight: 0,
	nbFragmentsX: 0,
	nbFragmentsY: 0,
	canvasWidth: 0,
	canvasHeight: 0,
	imageSmoothingEnabled: false,
	showGrid: false,
};

/**
 * @param {MapFragment[]} newFragments
 */
function setFragments(newFragments) {
	fragments = newFragments;
	// Set the images
	const width = m.fragmentWidth = fragments[0]?.image.width ?? 512;
	const height = m.fragmentHeight = fragments[0]?.image.height ?? 512;
	if (fragments.some(f => f.image.width != width || f.image.height != height)) {
		console.warn('Images have different sizes', { width, height, fragments: [...fragments] });
		fragments = fragments.filter(f => f.image.width == width || f.image.height == height)
	}

	const pos = fragments.map(f => f.pos);
	m.minPos = getMinPos(pos);
	m.maxPos = getMaxPos(pos);
	m.nbFragmentsX = m.maxPos.x - m.minPos.x + 1;
	m.nbFragmentsY = m.maxPos.y - m.minPos.y + 1;
	const canvas = ctx.canvas;
	m.canvasWidth = canvas.width = width * m.nbFragmentsX;
	m.canvasHeight = canvas.height = height * m.nbFragmentsY;

	const aspectRatio = canvas.width / canvas.height;
	const clientAspectRatio = canvas.parentElement.clientWidth / canvas.parentElement.clientHeight;
	canvas.style.setProperty('--width', aspectRatio > clientAspectRatio ? 'auto' : '100%');
	canvas.style.setProperty('--height', aspectRatio > clientAspectRatio ? '100%' : 'auto');

	viewWindow.fromTopLeftToBottomRight();

	drawFragments();
}

function drawFragments() {
	ctx.save();
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.imageSmoothingEnabled = m.imageSmoothingEnabled;

	const scale = viewWindow.calculateScale();
	ctx.setTransform(scale, 0, 0, scale, -viewWindow.getOffsetLeft(), -viewWindow.getOffsetTop());

	for (const f of fragments) {
		const dx = f.pos.x * m.fragmentWidth;
		const dy = f.pos.y * m.fragmentHeight;
		ctx.drawImage(f.image, dx, dy);
	}

	if (m.showGrid) {
		ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
		ctx.lineWidth = 2;
		ctx.beginPath();
		const W = m.fragmentWidth;
		const H = m.fragmentHeight;
		const minX = m.minPos.x * W;
		const minY = m.minPos.y * H;
		const maxX = (m.maxPos.x + 1) * W;
		const maxY = (m.maxPos.y + 1) * H;
		for (let x = minX; x <= maxX; x += W) {
			ctx.moveTo(x, minY);
			ctx.lineTo(x, maxY);
		}
		for (let y = minY; y <= maxY; y += H) {
			ctx.moveTo(minX, y);
			ctx.lineTo(maxX, y);
		}
		ctx.stroke();
	}

	ctx.restore();
}

var timeoutRedraw = 0;
var lastRedraw = 0;
var previousDrawDuration = 0;
var minTicksBetweenRedraws = 20;
function redrawFragmentsSoon() {
	if (timeoutRedraw) return; // Already scheduled

	const now = Date.now();
	const timeSinceRedraw = now - lastRedraw;

	function redraw() {
		lastRedraw = now;
		clearTimeout(timeoutRedraw);
		timeoutRedraw = 0;
		const start = Date.now();
		drawFragments();
		const end = Date.now();

		// Reduce the number of redraws for slow devices
		previousDrawDuration = (previousDrawDuration + (end - start)) / 2; // Smooth the duration
		if (previousDrawDuration > 10) {
			minTicksBetweenRedraws = Math.max(20, Math.ceil(previousDrawDuration * 2));
		}
	}

	if (timeSinceRedraw > minTicksBetweenRedraws * 2) {
		redraw(true);
	} else {
		timeoutRedraw = setTimeout(() => redraw(), minTicksBetweenRedraws);
	}
}

function mousePositionToMapPosition(x, y, canvas) {
	const factorWidthClient = canvas.width / canvas.clientWidth;
	const factorHeightClient = canvas.height / canvas.clientHeight;

	const xOnCanvas = x * factorWidthClient / m.nbFragmentsX;
	const yOnCanvas = y * factorHeightClient / m.nbFragmentsY;


	// We want to keep the map fixed at the location of the mouse
	const xProportion = (xOnCanvas - 256) / m.fragmentWidth;
	const yProportion = (yOnCanvas - 256) / m.fragmentHeight;

	m.posOnMap = new Pos(
		xProportion * viewWindow.width / viewWindow.scale / viewWindow.scale + viewWindow.xCenter,
		yProportion * viewWindow.height / viewWindow.scale / viewWindow.scale + viewWindow.yCenter,
	);

	return m.posOnMap;
}

function onMouseWheel(event) {
	// Zoom in/out
	const scaleFactor = Math.pow(1.1, -event.deltaY * 0.01);
	const mapPos = mousePositionToMapPosition(event.offsetX, event.offsetY, event.target);
	viewWindow.zoom(scaleFactor, mapPos);

	redrawFragmentsSoon();
	event.preventDefault();
}

var isMouseDown = false;
var lastMouseX = 0;
var lastMouseY = 0;
var lastMouseTime = 0;
function onMouseDown(event) {
	isMouseDown = true;
	lastMouseX = event.clientX;
	lastMouseY = event.clientY;
	lastMouseTime = Date.now();
}

function onMouseMove(event) {
	if (!isMouseDown) {
		// Get the position of the cursor
		const mapPos = mousePositionToMapPosition(event.offsetX, event.offsetY, event.target);
		// Display it
		const span = document.getElementById('cursor_position');
		span.innerText = `${mapPos.x.toFixed(0) ?? 0}, ${mapPos.y.toFixed(0) ?? 0}`;
		return;
	}

	const now = Date.now();
	const timeSinceLastMove = now - lastMouseTime;
	if (timeSinceLastMove < 10) return;
	lastMouseTime = now;

	const dx = event.clientX - lastMouseX;
	const dy = event.clientY - lastMouseY;
	lastMouseX = event.clientX;
	lastMouseY = event.clientY;

	const factorWidthClient = event.target.width / event.target.clientWidth;
	const factorHeightClient = event.target.height / event.target.clientHeight;
	viewWindow.xCenter -= dx * factorWidthClient / viewWindow.scale;
	viewWindow.yCenter -= dy * factorHeightClient / viewWindow.scale;
	redrawFragmentsSoon();
}

function onMouseUp(event) {
	isMouseDown = false;
}

function showGrid(show) {
	m.showGrid = show;
	redrawFragmentsSoon();
}

function smoothImage(smooth) {
	m.imageSmoothingEnabled = smooth;
	redrawFragmentsSoon();
}