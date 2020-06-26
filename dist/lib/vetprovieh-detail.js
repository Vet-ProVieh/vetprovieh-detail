"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VetproviehDetail = void 0;
const vetprovieh_shared_1 = require("@tomuench/vetprovieh-shared");
const formt_validation_1 = require("@tomuench/formt-validation");
/**
 * `vetprovieh-detail`
 * Detail-Frame for Read, Create and Update Entities. Used in Vet:Provieh.
 *
 * @customElement
 */
class VetproviehDetail extends vetprovieh_shared_1.VetproviehElement {
    /**
     * Default-Constructor
     * @param {HTMLTemplateElement | undefined} pListTemplate
     */
    constructor(pListTemplate = undefined) {
        super();
        this._src = null;
        this._id = null;
        this._currentObject = {};
        const template = pListTemplate || this.querySelector('template');
        if (template) {
            this._detailTemplate = template.content;
        }
    }
    /**
         * Getting Template
         */
    static get template() {
        return super.template + ` 
        <form id="form">
            <vetprovieh-notification id="notification">
            </vetprovieh-notification>
            <div id="detail" class="container">
            
            </div>
            <hr/>
            <div class="container">
            <div class="columns">
                <div class="column">
                    <input id="abortButton" 
                            class="button is-danger is-fullwidth" 
                            type="reset" value="Abbrechen">                   
                </div>
                <div class="column">
                    <input id="saveButton" 
                            class="button is-success is-fullwidth" 
                            type="button" value="Speichern">
                </div>
            </div>
            </div>
        </form>
        `;
    }
    /**
         * Observed attributes
         * @return {Array<string>}
         */
    static get observedAttributes() {
        return ['src', 'id'];
    }
    /**
       * @property {string|null} src
       */
    get src() {
        return this._src;
    }
    /**
     * Setting Src
     * @param {string} val
     */
    set src(val) {
        if (val !== this.src) {
            this._src = val;
            this._fetchDataFromServer();
        }
    }
    /**
     * ID of the currentObject
       * @property {string|undefined} id
       */
    get objId() {
        return this._id;
    }
    /**
     * Set Id of currentObject
     * @param {string} val
     */
    set objId(val) {
        if (val !== this.objId) {
            this._id = val;
            this._fetchDataFromServer();
        }
    }
    /**
     * Run Callback
     */
    connectedCallback() {
        // Lazy creation of shadowRoot.
        if (!this.shadowRoot) {
            this.attachShadow({
                mode: 'open',
            }).innerHTML = VetproviehDetail.template;
        }
        this._attachListenerToButtons();
        this._loadHtmlId();
    }
    /**
       * Attaching Listener to Save and Abort Button
       * @private
       */
    _attachListenerToButtons() {
        const save = this.getByIdFromShadowRoot('saveButton');
        const abort = this.getByIdFromShadowRoot('abortButton');
        save.addEventListener('click', () => this.save());
        abort.addEventListener('click', () => window.history.back());
    }
    /**
     * Show Notification
     * @param {string} text
     * @param {string} type
     */
    _showNotification(text, type = 'is-success') {
        const notification = this.getByIdFromShadowRoot('notification');
        notification.text = text;
        notification.type = type;
        notification.display();
    }
    /**
       * Save-Process
       */
    save() {
        if (this._validateForm()) {
            const xhr = this._buildSaveRequest();
            const _this = this;
            xhr.onload = function () {
                // Process our return data
                if (xhr.status >= 200 && xhr.status < 300) {
                    // What do when the request is successful
                    console.log('success!', xhr);
                    _this._showNotification('Daten erfolgreich gespeichert');
                }
                else {
                    // What do when the request fails
                    console.log('The request failed!');
                    _this._showNotification('Daten konnten nicht gespeichert werden.', 'is-danger');
                }
            }.bind(this);
            xhr.send(JSON.stringify(this._currentObject));
        }
    }
    /**
       * Build-Save Request for Backend
       * @return {XMLHttpRequest}
       * @private
       */
    _buildSaveRequest() {
        const xhr = new XMLHttpRequest();
        if (this.objId != 'new') {
            xhr.open('PUT', this.src + '/' + this.objId);
        }
        else {
            xhr.open('POST', this.src);
        }
        xhr.setRequestHeader('Content-Type', 'application/json');
        return xhr;
    }
    /**
       * Validate the Form
       * @return {boolean}
       * @private
       */
    _validateForm() {
        const form = this.getByIdFromShadowRoot('form');
        const validator = new formt_validation_1.FormtValidation();
        return validator.validateForm(form);
    }
    /**
       * Attach Data to List
       * @param {any} data
       * @param {string} searchValue
       */
    attachData(data) {
        const detail = this.getByIdFromShadowRoot('detail');
        detail.innerHTML = '';
        detail.appendChild(this._generateDetail());
        if (data) {
            this._bindFormElements(data);
        }
    }
    /**
       * Load ID from Parameters
       * @private
       */
    _loadHtmlId() {
        const urlString = window.location.href;
        const url = new URL(urlString);
        const id = url.searchParams.get('id');
        this.objId = id;
        if (!this.objId) {
            this.objId = 'new';
        }
    }
    /**
     * Binding Form Elements
     * @param {any} data
     * @param {string} prefix
     */
    _bindFormElements(data, prefix = '') {
        if (prefix == '') {
            this._currentObject = data;
        }
        Object.keys(data).forEach((key) => {
            if (data[key] != null && typeof (data[key]) === 'object') {
                this._bindFormElements(data[key], key + '.');
            }
            else {
                const binding = new vetprovieh_shared_1.VetproviehBinding(data, key);
                const element = this.shadowRoot
                    .querySelector('[property="' + prefix + key + '"]');
                if (element) {
                    element.addEventListener('blur', (event) => {
                        const validator = new formt_validation_1.FormtValidation();
                        validator.validateElement(event.target);
                    });
                    binding.addBinding(element, 'value', 'change');
                }
            }
        });
    }
    /**
       * Generate new Item for List which is based on the template
       * @return {HTMLDivElement}
       * @private
       */
    _generateDetail() {
        const div = document.createElement('div');
        let newNode = document.createElement('p');
        newNode.innerHTML = 'Not definied';
        if (this._detailTemplate) {
            newNode = document.importNode(this._detailTemplate, true);
        }
        div.appendChild(newNode);
        return div;
    }
    // -----------------
    // PRIVATE METHODS
    // -----------------
    /**
       * Loading Data from Remote-Server
       * @private
       */
    _fetchDataFromServer() {
        if (this.objId && this.src) {
            const self = this;
            let endpoint = 'new.json';
            if (this.objId != 'new')
                endpoint = this.src + '/' + this.objId;
            fetch(endpoint)
                .then((response) => response.json())
                .then((data) => self.attachData(data))
                .catch((error) => console.log(error));
        }
    }
}
exports.VetproviehDetail = VetproviehDetail;
customElements.define('vetprovieh-detail', VetproviehDetail);
