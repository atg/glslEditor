import Shader from './core/Shader';
import { initEditor, focusAll } from './core/Editor';

import Menu from './ui/Menu';
import Helpers from './ui/Helpers';
import ErrorsDisplay from './ui/ErrorsDisplay';
import VisualDebugger from './ui/VisualDebugger';

import FileDrop from './io/FileDrop';
import BufferManager from './io/BufferManager';
import LocalStorage from './io/LocalStorage';
const STORAGE_LAST_EDITOR_CONTENT = 'last-content';

// Import Utils
// Removed: import xhr from 'xhr';
import { subscribeMixin } from './tools/mixin';

// 3er Parties
import { saveAs } from './vendor/FileSaver.min.js';

const EMPTY_FRAG_SHADER = `// Author:
// Title:

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st.x *= u_resolution.x/u_resolution.y;

    vec3 color = vec3(0.);
    color = vec3(st.x,st.y,abs(sin(u_time)));

    gl_FragColor = vec4(color,1.0);
}`;

export default class GlslEditor {
    constructor (selector, options) {
        this.createFontLink();
        subscribeMixin(this);

        if (typeof selector === 'object' && selector.nodeType && selector.nodeType === 1) {
            this.container = selector;
        }
        else if (typeof selector === 'string') {
            this.container = document.querySelector(selector);
            if (!this.container) {
                throw new Error(`element ${selector} not present`);
            }
        }
        else {
            console.log('Error, type ' + typeof selector + ' of ' + selector + ' is unknown');
            return;
        }

        this.options = {};
        this.change = false;
        this.autoupdate = true;

        if (options) {
            this.options = options;
        }

        if (this.options.imgs === undefined) {
            this.options.imgs = [];
        }

        if (this.options.display_menu === undefined) {
            this.options.display_menu = true;
        }

        if (this.container.hasAttribute('data-textures')) {
            let imgList = this.container.getAttribute('data-textures').split(',');
            for (let i in imgList) {
                this.options.imgs.push(imgList[i]);
            }
        }

        // Default Theme
        if (!this.options.theme) {
            this.options.theme = 'default';
        }

        // Default Context
        if (!this.options.frag) {
            var innerHTML = this.container.innerHTML.replace(/&lt;br&gt;/g,'');
            innerHTML = innerHTML.replace(/<br>/g,'');
            innerHTML = innerHTML.replace(/&nbsp;/g,'');
            innerHTML = innerHTML.replace(/&lt;/g,'<');
            innerHTML = innerHTML.replace(/&gt;/g,'>');
            innerHTML = innerHTML.replace(/&amp;/g,'&');
            this.options.frag = innerHTML || EMPTY_FRAG_SHADER;

            if (innerHTML) {
                this.container.innerHTML = '';
            }
        }

        // Default invisible Fragment header
        if (!this.options.frag_header) {
            this.options.frag_header = '';
        }

        // Default invisible Fragment footer
        if (!this.options.frag_footer) {
            this.options.frag_footer = '';
        }

        // Listen to hash changes
        // removed

        // Load UI
        if (this.options.menu) {
            this.menu = new Menu(this);
        }

        // Support for multiple buffers
        if (this.options.multipleBuffers) {
            this.bufferManager = new BufferManager(this);
        }

        // Listen to file drops
        if (this.options.fileDrops) {
            new FileDrop(this);
        }

        if (this.options.indentUnit === undefined) {
            this.options.indentUnit = 4;
        }

        if (this.options.tabSize === undefined) {
            this.options.tabSize = 4;
        }

        if (this.options.indentWithTabs === undefined) {
            this.options.indentWithTabs = false;
        }

        if (this.options.lineWrapping === undefined) {
            this.options.lineWrapping = true;
        }

        if (this.options.autofocus === undefined) {
            this.options.autofocus = true;
        }

        // CORE elements
        this.shader = new Shader(this, this.options.shaderDelegate);
        this.editor = initEditor(this);

        this.helpers = new Helpers(this);
        this.errorsDisplay = new ErrorsDisplay(this);
        this.visualDebugger = new VisualDebugger(this);

        // EVENTS
        this.editor.on('change', () => {
            if (this.autoupdate) {
                this.update();
            }
        });

        if (this.options.canvas_follow) {
            // Removed
        }

        // If the user bails for whatever reason, hastily shove the contents of
        // the editor into some kind of storage. This overwrites whatever was
        // there before. Note that there is not really a way of handling unload
        // with our own UI and logic, since this allows for widespread abuse
        // of normal browser functionality.
        window.addEventListener('beforeunload', (event) => {
            if (this.options.useLocalStorage) {
                let content = {};
                if (this.bufferManager && Object.keys(this.bufferManager.buffers).length !== 0) {
                    for (var key in this.bufferManager.buffers) {
                        content[key] = this.bufferManager.buffers[key].getValue();
                    }
                }
                else {
                    content[(new Date().getTime()).toString()] = this.editor.getValue();
                }
                LocalStorage.shared.set(STORAGE_LAST_EDITOR_CONTENT, JSON.stringify(content));
            }
        });

        // Remove quasi filesystem
        // if (this.options.menu) {
        //     // If there is previus content load it.
        //     let oldContent = JSON.parse(LocalStorage.shared.get(STORAGE_LAST_EDITOR_CONTENT));
        //     if (oldContent) {
        //         for (var key in oldContent) {
        //             this.open(oldContent[key], key);
        //         }
        //     }
        //     else {
        //         this.new();
        //     }
        // }
        // else {
        //     this.new();
        // }
        this.new();

        return this;
    }

    new () {
        this.setContent(this.options.frag || EMPTY_FRAG_SHADER, (new Date().getTime()).toString());
        this.trigger('new_content', {});
        this.options.frag = null;
    }

    setContent(shader, tabName) {
        // If the string is CODE
        if (this.shader && this.shader.canvas) {
            if (this.debugging) {
                this.debugging = false;
                focusAll(this.editor);
            }
            this.shader.canvas.load(this.options.frag_header + shader + this.options.frag_footer);
        }

        if (this.editor) {
            if (tabName !== undefined && this.bufferManager !== undefined) {
                this.bufferManager.open(tabName, shader);
                this.bufferManager.select(tabName);
            }
            else {
                this.editor.setValue(shader);
                this.editor.setSize(null, this.editor.getDoc().height + 'px');
                this.editor.setSize(null, 'auto');
                this.filename = tabName;
            }
        }
        this.change = true;
    }

    open (shader, tabName) {
        // Removed
        /*
        if (typeof shader === 'object') {
            const reader = new FileReader();
            let ge = this;
            reader.onload = (e) => {
                ge.setContent(e.target.result, shader.name);
            };
            reader.readAsText(shader);
        }
        else if (typeof shader === 'string') {
            if (/\.frag$/.test(shader) || /\.fs$/.test(shader)) {
                // If the string is an URL
                xhr.get(shader, (error, response, body) => {
                    if (error) {
                        console.log('Error downloading ', shader, error);
                        return;
                    }
                    this.setContent(body, tabName);
                });
            }
            else {
                this.setContent(shader, tabName);
            }
        }
        */
    }

    getContent() {
        return this.editor.getValue();
    }

    getAuthor() {
        let content = this.getContent();
        let result = content.match(/\/\/\s*[A|a]uthor\s*[\:]?\s*([\w|\s|\@|\(|\)|\-|\_]*)/i);
        if (result && !(result[1] === ' ' || result[1] === '')) {
            let author = result[1].replace(/(\r\n|\n|\r)/gm, '');
            return author;
        }
        else {
            return 'unknown';
        }
    }

    getTitle() {
        let content = this.getContent();
        let result = content.match(/\/\/\s*[T|t]itle\s*:\s*([\w|\s|\@|\(|\)|\-|\_]*)/i);
        if (result && !(result[1] === ' ' || result[1] === '')) {
            let title = result[1].replace(/(\r\n|\n|\r)/gm, '');
            return title;
        }
        else if (this.bufferManager !== undefined) {
            return this.bufferManager.current;
        }
        else {
            return 'unknown';
        }
    }

    download () {
        let content = this.getContent();
        let name = this.getTitle();
        if (name !== '') {
            name += '-';
        }
        name += new Date().getTime();

        // Download code
        const blob = new Blob([content], { type: 'text/plain' });
        saveAs(blob, name + '.fx');
        this.editor.doc.markClean();
        this.change = false;
    }

    update () {
        if (this.debugging) {
            this.debugging = false;
            focusAll(this.editor);
        }

        if (this.visualDebugger.testingResults.length) {
            this.visualDebugger.clean();
        }
        this.shader.canvas.load(this.options.frag_header + this.editor.getValue() + this.options.frag_footer);
    }

    createFontLink() {
        /*
        var head = document.getElementsByTagName('head')[0];
        var link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.media = 'screen,print';
        head.appendChild(link);
        document.getElementsByTagName('head')[0].appendChild(link);
        */
    }

    togglePresentationWindow(flag) {
        // Removed
    }

    onClosePresentationWindow() {
        // Removed
    }
}

window.GlslEditor = GlslEditor;

var GlslWebComponent = function() {};
GlslWebComponent.prototype = Object.create(HTMLElement.prototype);
GlslWebComponent.prototype.createdCallback = function createdCallback() {
    var options = {
        canvas_size: 150,
        canvas_follow: true,
        tooltips: true
    };

    for (var i = 0; i < this.attributes.length; i++) {
        var attribute = this.attributes[i];
        if (attribute.specified) {
            var value = attribute.value;

            if (value === 'true') {
                value = true;
            }
            else if (value === 'false') {
                value = false;
            }
            else if (parseInt(value)) {
                value = parseInt(value);
            }

            options[attribute.name] = value;
        }
    }

    this.glslEditor = new GlslEditor(this, options);
};
