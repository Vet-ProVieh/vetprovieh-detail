"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VetproviehNotification = void 0;
const vetprovieh_shared_1 = require("@tomuench/vetprovieh-shared");
/**
 * Notification
 */
class VetproviehNotification extends vetprovieh_shared_1.VetproviehElement {
    /**
     * Default-Constructor
     */
    constructor() {
        super();
        this._type = 'is-primary';
        this._text = this.innerHTML;
    }
    /**
       * Getting Template
       * @return {string}
       */
    static get template() {
        return super.template + `
              <style>
                  #notification {
                      transition: all 1s linear;
                  }
                  .hidden{
                      opacity: 0;
                  }
              </style>
              <div class="is-hidden">
                  <div id="notification" class="notification hidden">
                    <div id="text"></div>
                  </div>
              </div>
          `;
    }
    /**
       * @property {string|null} type
       */
    get type() {
        return this._type;
    }
    /**
     * Setting type
     * @param {string|null} val
     */
    set type(val) {
        if (val !== this.type) {
            this._type = val;
            this._updateRendering();
        }
    }
    /**
       * @property {string|null} text
       */
    get text() {
        return this._text;
    }
    /**
     * Setting Text
     * @param {string| null} val
     */
    set text(val) {
        if (val !== this.text) {
            this._text = val;
            this._updateRendering();
        }
    }
    /**
       * Show Notification for 3 seconds.
       */
    display() {
        const notificationBox = this._notificationBox;
        const parent = notificationBox.parentElement;
        notificationBox.classList.remove('hidden');
        setTimeout(() => {
            parent.classList.remove('is-hidden');
        }, 1000);
        setTimeout(() => {
            notificationBox.classList.add('hidden');
        }, 3000);
        setTimeout(() => {
            parent.classList.add('is-hidden');
        }, 4000);
    }
    /**
     * Load NotificationBox from Content
     * @return {HTMLElement}
     */
    get _notificationBox() {
        return this.getByIdFromShadowRoot('notification');
    }
    /**
     * UI-Callback
     */
    connectedCallback() {
        // Lazy creation of shadowRoot.
        if (!this.shadowRoot) {
            this.attachShadow({
                mode: 'open',
            }).innerHTML = VetproviehNotification.template;
        }
        this._updateRendering();
    }
    /**
     * Rendering update
     */
    _updateRendering() {
        const notificationBox = this._notificationBox;
        const textBox = this.getByIdFromShadowRoot('text');
        notificationBox.classList.add(this.type);
        textBox.innerHTML = this._text;
    }
}
exports.VetproviehNotification = VetproviehNotification;
customElements.define('vetprovieh-notification', VetproviehNotification);
