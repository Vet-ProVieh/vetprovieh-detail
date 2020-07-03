/**
 * Helper to get and set Attributes on Objects
 */
class ObjectHelper {
    /**
       * Getting Value from JSON-Object
       * @param {Indexable} object
       * @param {string} key
       * @return {any}
       */
    static get(object, key) {
        try {
            const attributes = key.split('.');
            return this._iterateThrough(object, attributes);
        }
        catch (ex) {
            return undefined;
        }
    }
    /**
       * Iterating Through Object
       * @param {Indexable} obj
       * @param {string[]} attributes
       * @param {number} depth
       * @return {any}
       * @private
       */
    static _iterateThrough(obj, attributes, depth = 0) {
        if (depth < 0)
            return undefined;
        while (attributes.length > depth) {
            const attribute = attributes.shift();
            if (!obj)
                throw new Error('Unknown Key');
            obj = obj[attribute];
        }
        return obj;
    }
    /**
       * Setting value for Object
       * @param {Indexable} object
       * @param {string} key
       * @param {any} value
       */
    static set(object, key, value) {
        const attributes = key.split('.');
        object = this._iterateThrough(object, attributes, 1);
        const property = attributes[0];
        object[property] = value;
    }
    /**
       * Object to String
       * @param {Object} obj
       * @return {string}
       */
    static objectToStringDeep(obj) {
        if (!obj)
            return '';
        return Object.keys(obj).map((k) => {
            const value = obj[k];
            if (typeof (value) == 'object') {
                return ObjectHelper.objectToStringDeep(value);
            }
            else {
                return value;
            }
        }).toString();
    }
}

/**
 * Binding for Form Fields
 */
class VetproviehBinding {
    /**
     * Default Constructor needs object and a property to bind
     * @param {any} target
     * @param {target} property
     */
    constructor(target, property) {
        this._targetObject = target;
        this._targetProperty = property;
        this._bindings = [];
    }
    /**
     * Gets current property value
     * @return {any}
     */
    get value() {
        return ObjectHelper.get(this._targetObject, this._targetProperty);
    }
    /**
     * Sets current property value
     * @param {any} val
     */
    set value(val) {
        if (val !== this.value) {
            ObjectHelper.set(this._targetObject, this._targetProperty, val);
            this._updateBindings(val);
        }
    }
    /**
     * Add Binding to HTML-Field
     * @param {HTMLElement} element
     * @param {string} attribute
     * @param {string} event
     * @return {VetproviehBinding}
     */
    addBinding(element, attribute, event) {
        this._attachListenerToEvent(element, event, attribute);
        this._addToBindings(element, attribute);
        element[attribute] = this.value;
        return this;
    }
    /**
     * Insert into internal datastructure
     * @param {HTMLElement} element
     * @param {string} attribute
     * @private
     */
    _addToBindings(element, attribute) {
        this._bindings.push({
            element: element,
            attribute: attribute,
        });
    }
    /**
     * Attach EventListener
     * @param {HTMLElement} element
     * @param {string} event
     * @param {string} attribute
     * @private
     */
    _attachListenerToEvent(element, event, attribute) {
        element.addEventListener(event, () => {
            this.value = element[attribute];
        });
    }
    /**
     * Update all set Bindings
     * @param {any} val
     * @private
     */
    _updateBindings(val) {
        this._bindings.forEach((binding) => {
            binding.element[binding.attribute] = val;
        });
    }
}

/**
 * BaseClass for view Elements
 */
class VetproviehElement extends HTMLElement {
    /**
       * Callback Implementation
       * @param {string} name
       * @param {any} old
       * @param {any} value
       */
    attributeChangedCallback(name, old, value) {
        if (old !== value) {
            this[name] = value;
        }
    }
    /**
     * Loading HTML-Element From ShadowRoot
     * @param {string} id
     * @return {HTMLElement | undefined}
     */
    getByIdFromShadowRoot(id) {
        if (this.shadowRoot) {
            return this.shadowRoot.getElementById(id);
        }
    }
    /**
       * Hide Or Show Element
       * @param {string} id
       * @param {boolean} show
       */
    updateVisibility(id, show) {
        const search = this.getByIdFromShadowRoot(id);
        if (search) {
            if (!show) {
                search.classList.add('is-hidden');
            }
            else {
                search.classList.remove('is-hidden');
            }
        }
    }
    // -----------------
    // CLASS METHODS
    // -----------------
    /**
       * Getting Template
       * @return {string}
       */
    static get template() {
        return `<link href="../node_modules/bulma/css/bulma.min.css" 
                  rel="stylesheet" type="text/css">`;
    }
}

/**
 * Decorator for CSS-Framework bulma.io
 */
class BulmaDecorator {
    /**
       * CSS-ErrorClass
       * @return {string}
       * @constructor
       */
    static get ErrorClass() {
        return 'is-danger';
    }
    /**
       * CSS-SuccessClass
       * @return {string}
       * @constructor
       */
    static get SuccessClass() {
        return 'is-success';
    }
    /**
       * Formatting Success Element
       * @param {HTMLInputElement} element
       */
    success(element) {
        this._removeErrorIfNecessary(element);
        if (!element.classList.contains(BulmaDecorator.SuccessClass)) {
            element.classList.add(BulmaDecorator.SuccessClass);
        }
    }
    /**
       * Formatting Error Element
       * @param {HTMLInputElement} element
       */
    error(element) {
        this._removeSuccessIfNecessary(element);
        if (!element.classList.contains(BulmaDecorator.ErrorClass)) {
            element.classList.add(BulmaDecorator.ErrorClass);
            this._attachIcon(element);
        }
        this._removeHelpText(element);
        this._attachErrorMessage(element);
    }
    /**
       *
       * @param {HTMLInputElement} element
       */
    _attachErrorMessage(element) {
        const paragraph = element.ownerDocument.createElement('p');
        paragraph.classList.add('help', BulmaDecorator.ErrorClass);
        paragraph.innerHTML = element.validationMessage;
        if (element.parentElement) {
            if (element.parentElement.parentElement) {
                element.parentElement.parentElement.appendChild(paragraph);
            }
        }
    }
    /**
       *
       * @param {HTMLInputElement} element
       */
    _attachIcon(element) {
        const document = element.ownerDocument;
        const span = document.createElement('span');
        span.classList.add('icon', 'is-small', 'is-right');
        const i = document.createElement('i');
        i.classList.add('fas', 'fa-exclamation-triangle');
        span.appendChild(i);
        if (element.parentElement) {
            element.parentElement.classList.add('has-icons-right');
            element.parentElement.appendChild(span);
        }
    }
    /**
       * Removing Error
       * @param {HTMLInputElement} element
       */
    _removeErrorIfNecessary(element) {
        if (element.classList.contains(BulmaDecorator.ErrorClass)) {
            element.classList.remove(BulmaDecorator.ErrorClass);
            this._removeErrorIcon(element);
            this._removeHelpText(element);
        }
    }
    /**
     * Removing Success Class
     * @param {HTMLInputElement} element
     */
    _removeSuccessIfNecessary(element) {
        if (element.classList.contains(BulmaDecorator.SuccessClass)) {
            element.classList.remove(BulmaDecorator.SuccessClass);
        }
    }
    /**
       * Removing Icon
       * @param {HTMLInputElement} element
       */
    _removeErrorIcon(element) {
        const parent = element.parentElement;
        parent.classList.remove('has-icons-right');
        const span = parent.lastChild;
        if (span.tagName == 'SPAN') {
            parent.removeChild(span);
        }
    }
    /**
       * Removing Helptext
       * @param {HTMLInputElement} element
       */
    _removeHelpText(element) {
        if (element.parentElement && element.parentElement.parentElement) {
            const parentParent = element.parentElement.parentElement;
            const paragraph = parentParent.lastChild;
            if (paragraph.tagName == 'P') {
                parentParent.removeChild(paragraph);
            }
        }
    }
}

const notAcceptedInputTypes = ['reset', 'button', 'submit'];
/**
 * Facade for Form-Validation.
 */
class FormtValidation {
    /**
       * Is a Input Element accepted?
       * @param {HTMLInputElement} element
       * @return {boolean}
       */
    static isAcceptedInputType(element) {
        return element.tagName == 'INPUT' &&
            notAcceptedInputTypes.findIndex((t) => t === element.type) == -1;
    }
    /**
       * Validation of Form
       * @param {HTMLFormElement} form
       * @return {boolean}
       */
    validateForm(form) {
        const formValid = form.checkValidity();
        if (!formValid) {
            for (const element of form.elements) {
                this.validateElement(element);
            }
        }
        return formValid;
    }
    /**
       * Validation of an InputElement
       * @param {HTMLInputElement} element
       * @return {boolean}
       */
    validateElement(element) {
        if (FormtValidation.isAcceptedInputType(element)) {
            this._styleElement(element);
            return element.reportValidity();
        }
        else {
            return false;
        }
    }
    /**
       * Style a InputElement
       * @param {HTMLInputElement} element
       * @private
       */
    _styleElement(element) {
        const decorator = new BulmaDecorator();
        if (element.reportValidity()) {
            decorator.success(element);
        }
        else {
            decorator.error(element);
        }
    }
}

/**
 * `vetprovieh-detail`
 * Detail-Frame for Read, Create and Update Entities. Used in Vet:Provieh.
 *
 * @customElement
 */
class VetproviehDetail extends VetproviehElement {
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
        const validator = new FormtValidation();
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
                const binding = new VetproviehBinding(data, key);
                const element = this.shadowRoot
                    .querySelector('[property="' + prefix + key + '"]');
                if (element) {
                    element.addEventListener('blur', (event) => {
                        const validator = new FormtValidation();
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
customElements.define('vetprovieh-detail', VetproviehDetail);

/**
 * Notification
 */
class VetproviehNotification extends VetproviehElement {
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
customElements.define('vetprovieh-notification', VetproviehNotification);

export { VetproviehDetail, VetproviehNotification };
//# sourceMappingURL=vetprovieh-detail.js.map
