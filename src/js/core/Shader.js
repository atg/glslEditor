// import GlslCanvas from 'glslCanvas';
import { subscribeInteractiveDom } from '../tools/interactiveDom';
import MediaCapture from '../tools/mediaCapture';
import MenuItem from '../ui/MenuItem';
// 3er Parties
import { saveAs } from '../vendor/FileSaver.min.js';

var CONTROLS_CLASSNAME = 'ge_control';
var CONTROLS_PANEL_CLASSNAME = 'ge_control_panel';

export class GlslCanvas {
    constructor(shaderDelegate, options) {
        this.shaderDelegate = shaderDelegate;
        this.options = options;
    }
    setUniform(key, value) {
        const sd = this.shaderDelegate;
        sd && sd.setUniform(key, value);
    }
    render(force) {
        const sd = this.shaderDelegate;
        sd && sd.render(force);
    }
    resize() {
        const sd = this.shaderDelegate;
        sd && sd.resize();
    }
    load(program) {
        const sd = this.shaderDelegate;
        sd && sd.load(program);
    }
    on(event, callback) {
        if (event === 'error') {
            const sd = this.shaderDelegate;
            sd && sd.onError(callback);
        }
    }
    test(onTest, testingFrag) {
        const sd = this.shaderDelegate;
        sd && sd.test(onTest, testingFrag);
    }
}

export default class Shader {
    constructor (main, shaderDelegate) {
        this.main = main;
        this.options = main.options;
        this.frag = '';

        // DOM CONTAINER
        // this.el = document.createElement('div');
        // this.el.setAttribute('class', 'ge_canvas_container');
        // CREATE AND START GLSLCANVAS
        // this.elCanvas = document.createElement('canvas');
        // this.elCanvas.setAttribute('class', 'ge_canvas');
        // this.elCanvas.setAttribute('data-fragment', this.options.frag_header + this.options.frag + this.options.frag_footer);
        // this.el.appendChild(this.elCanvas);
        let glslcanvas = new GlslCanvas(shaderDelegate, { premultipliedAlpha: false, preserveDrawingBuffer: true, backgroundColor: 'rgba(1,1,1,1)' });

        let width = (this.options.canvas_width || this.options.canvas_size || '250');
        let height =  (this.options.canvas_height || this.options.canvas_size || '250');
        glslcanvas.resize();

        this.canvas = glslcanvas;

        if (this.options.imgs && this.options.imgs.length > 0) {
            for (let i in this.options.imgs) {
                this.canvas.setUniform('u_tex' + i, this.options.imgs[i]);
            }
        }

        // Media Capture
        //   Removed

        // Controls
        // Removed

        // ========== EVENTS
        // Draggable/resizable/snappable
        // removed

        // If there is a menu offset the editor to come after it
        // if (main.menu) {
        //     this.el.style.top = (main.menu.el.clientHeight || main.menu.el.offsetHeight || main.menu.el.scrollHeight) + 'px';
        // }

        // Add all this to the main container
        // main.container.appendChild(this.el);
        glslcanvas.resize();
    }

    hideControls () {
        // if (this.elControl && this.elControl.className === CONTROLS_CLASSNAME) {
        //     this.elControl.className = CONTROLS_CLASSNAME + ' ' + CONTROLS_CLASSNAME + '_hidden';
        // }
    }

    showControls () {
        // if (this.elControl && this.elControl.className === CONTROLS_CLASSNAME + ' ' + CONTROLS_CLASSNAME + '_hidden') {
        //     this.elControl.className = CONTROLS_CLASSNAME;
        // }
    }

    requestRedraw() {
        this.canvas.render(true);
    }

    screenshot () {
        // Removed
    }

    startVideoCapture () {
        // Removed
    }

    stopVideoCapture () {
        // Removed
    }

    openWindow() {
        // Removed
    }

    closeWindow() {
        // Removed
    }

    setCanvasSize(w, h) {
        // Removed
    }

    setUpPresentationWindow() {
        // Removed
    }

    onPresentationWindowClose() {
        // Removed
    }

    onPresentationWindowResize() {
        // Removed
    }
}
