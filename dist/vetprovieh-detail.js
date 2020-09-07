/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

/**
 * Helper to get and set Attributes on Objects
 */
class ObjectHelper {
    /**
     * Checking if the Element is an Object
     * @param obj
     */
    static isObject(obj) {
        return obj != null && typeof (obj) === 'object';
    }
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
 * Helpers for View
 */
class ViewHelper {
    /**
       * Mark text yellow inside an element.
       * @param {Node} element
       * @param {string} input
       */
    static markElement(element, input) {
        if (input != '') {
            element.childNodes.forEach((n) => {
                const value = n.nodeValue || '';
                if (n.nodeName === '#text' && value.indexOf(input) >= 0) {
                    element.innerHTML = n['data']
                        .split(input)
                        .join('<mark>' + input + '</mark>');
                }
                else {
                    ViewHelper.markElement(n, input);
                }
            });
        }
    }
    /**
     * Getting URL-Parameter from address
     * @param {string} key
     * @return {string}
     */
    static getParameter(key) {
        const urlString = window.location.href;
        const url = new URL(urlString);
        const value = url.searchParams.get(key);
        return value;
    }
    /**
       * Regex to fill keys in template
       * @return {RegExp}
       */
    static get regexTemplate() {
        return /{{([a-zA-Z0-9\.]+)}}/;
    }
    /**
       * Replacing Placeholders in template from the loaded element
       * @param {HTMLElement} template
       * @param {Indexable} e
       */
    static replacePlaceholders(template, e) {
        let match = null;
        while (match = template.innerHTML.match(ViewHelper.regexTemplate)) {
            let value = ObjectHelper.get(e, match[1]);
            value = value || '';
            template.innerHTML = template.innerHTML.replace(match[0], value);
        }
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
    /**
   * Binding Form Elements
   * @param {HTMLElement} target (Target - HTMLElement)
   * @param {any} data (DataObject)
   * @param {string} prefix
   */
    static bindFormElements(target, data, prefix = '') {
        Object.keys(data).forEach((key) => {
            if (ObjectHelper.isObject(data[key])) {
                this.bindFormElements(target, data[key], key + '.');
            }
            else {
                const binding = new VetproviehBinding(data, key);
                const element = target
                    .querySelector('[property="' + prefix + key + '"]');
                if (element) {
                    let input = element;
                    this._attachEventListener(input);
                    if (input.type == "checkbox") {
                        console.log("checked binding");
                        binding.addBinding(input, 'checked', 'change');
                    }
                    else {
                        console.log("checked binding normal");
                        binding.addBinding(input, 'value', 'change');
                    }
                }
            }
        });
    }
    /**
     * Attaching EventListener
     * @param {HTMLElement | null} element
     * @param {VetproviehBinding} binding
     */
    static _attachEventListener(element) {
        element.addEventListener('blur', (event) => {
            // const validator = new FormtValidation();
            // validator.validateElement(event.target as HTMLInputElement);
        });
    }
}

/**
 * BaseClass for view Elements
 */
class VetproviehElement extends HTMLElement {
    get template() {
        return '';
    }
    constructor(shadowed = true, render = true) {
        super();
        if (shadowed) {
            this.attachShadow({
                mode: 'open',
            });
        }
        if (render)
            this.render();
    }
    /**
       * Callback Implementation
       * @param {string} name
       * @param {any} old
       * @param {any} value
       */
    attributeChangedCallback(name, old, value) {
        if (old !== value) {
            this.sendCallback(`_${name}_beforeSet`, value);
            this[name] = value;
            this.sendCallback(`_${name}_afterSet`, value);
            this.render();
        }
    }
    /**
     * Connected Callback
     */
    connectedCallback() {
    }
    sendCallback(name, value) {
        const method = this[name];
        if (method && typeof (method) === 'function') {
            this[name](value);
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
    render() {
        const renderedTemplate = eval('`' + this.template + '`');
        if (this.shadowRoot) {
            this.shadowRoot.innerHTML = renderedTemplate;
        }
        else {
            this.innerHTML = renderedTemplate;
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
    get innerHTML() {
        return super.innerHTML;
    }
    set innerHTML(input) {
        if (this.shadowRoot != null) {
            this.shadowRoot.innerHTML = input;
        }
        else {
            super.innerHTML = input;
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
        return `<link href="/node_modules/bulma/css/bulma.min.css" 
                  rel="stylesheet" type="text/css">`;
    }
}

/**
 * NavParams for a MPA-Application
 */
class VetproviehNavParams {
    /**
       * Returning Something out of the Storage
       * @param {string} key
       * @return {any}
       */
    static get(key) {
        const loadedObject = localStorage.getItem(key);
        if (loadedObject) {
            return JSON.parse(loadedObject);
        }
        return {};
    }
    /**
       * Delete a local Storage Item
       * @param {string} key
       */
    static delete(key) {
        localStorage.removeItem(key);
    }
    /**
       * Setting Storage
       * @param {string} key
       * @param {any} value
       */
    static set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
}

/**
 * Repeats Template Element. Amount is set by the amount of objects
 * inside
 */
class VetproviehBasicRepeat extends VetproviehElement {
    /**
     * Default-Contructor
     * @param {HTMLTemplateElement} pListTemplate
     */
    constructor(pListTemplate = undefined, shadowed = true) {
        super(shadowed);
        this._objects = [];
        this._orderBy = '+position';
        const listTemplate = pListTemplate || this.querySelector('template');
        if (listTemplate) {
            this._listTemplate = listTemplate.content;
        }
        else {
            this._listTemplate = new DocumentFragment();
        }
    }
    /**
         * Getting observed Attributes
         * @return {string[]}
         */
    static get observedAttributes() {
        return ['objects', 'orderBy'];
    }
    /**
     * Get objects
     * @return {Array<any>}
     */
    get objects() {
        return this._objects;
    }
    /**
     * Set objects
     * @param {Array<any>} v
     */
    set objects(v) {
        if (this._objects != v) {
            this._objects = v;
            this.clearAndRender();
        }
    }
    /**
    * Get OrderBy
    * Expect "+position" for asceding positon
    * Expect "-position" for descending position
    * @return {string}
    */
    get orderBy() {
        return this._orderBy;
    }
    /**
     * Set OrderBy
     * @param {string} v
     */
    set orderBy(v) {
        if (this._orderBy != v) {
            this._orderBy = v;
            this.clearAndRender();
        }
    }
    /**
    * Connected Callback
    */
    connectedCallback() {
        this._initalizeShadowRoot(VetproviehBasicRepeat.template);
        this.renderList();
    }
    /**
     * Clear and Render
     */
    clearAndRender() {
        this.clear();
        this._sortObjects();
        this.renderList();
    }
    /**
     * Sorting Objects
     */
    _sortObjects() {
        try {
            const asc = this.orderBy.substring(0, 1) == '+' ? 1 : -1;
            const argument = this.orderBy.substring(1);
            this.objects = this.objects
                .sort((a, b) => {
                const aValue = a[argument];
                const bValue = b[argument];
                return (aValue - bValue) * asc;
            });
        }
        catch (e) {
        }
    }
    /**
     * List will be cleared
     */
    clear() {
        const list = this.list;
        if (list)
            list.innerHTML = '';
    }
    /**
     * Rendering List-Content
     */
    renderList() {
        this.objects
            .forEach((obj, index) => {
            this._attachToList(obj, index);
        });
    }
    /**
     * Inserts Element to List
     * @param {any} dataItem
     * @param {index} number
     * @private
     */
    _attachToList(dataItem, index = 0) {
        if (this.shadowRoot) {
            const newListItem = this._generateListItem(dataItem);
            dataItem['index'] = index;
            ViewHelper.replacePlaceholders(newListItem, dataItem);
            const list = this.list;
            if (list) {
                list.appendChild(newListItem.children[0]);
            }
        }
    }
    /**
     * Getting List Element
     * @return {HTMLElement | undefined}
     */
    get list() {
        if (this.shadowRoot) {
            return this.shadowRoot.getElementById('listElements');
        }
        else {
            return undefined;
        }
    }
    /**
    * Generate new Item for List which is based on the template
    * @param {any} dataItem
    * @param {boolean} activatedEventListener
    * @return {HTMLDivElement}
    * @private
    */
    _generateListItem(dataItem, activatedEventListener = false) {
        const newNode = document.importNode(this._listTemplate, true);
        const div = document.createElement('div');
        if (activatedEventListener) {
            div.addEventListener('click', () => {
                const selectedEvent = new Event('selected');
                selectedEvent['data'] = dataItem;
                this.dispatchEvent(selectedEvent);
            });
        }
        div.appendChild(newNode);
        return div;
    }
    /**
     * Intializing Shadow-Root
     * @param {string} template
     * @protected
     */
    _initalizeShadowRoot(template) {
        // Lazy creation of shadowRoot.
        if (!this.shadowRoot) {
            super.attachShadow({
                mode: 'open',
            }).innerHTML = template;
        }
    }
}

function WebComponent(webComponentArgs) {
    /**
       * Defining Tag for HTML-Component
       * @param {any} constructor
       * @param {string} tagName
       */
    const defineTag = (constructor, tagName, extendElement) => {
        if (!customElements.get(tagName)) {
            if (extendElement) {
                customElements.define(tagName, constructor, { extends: extendElement });
            }
            else {
                customElements.define(tagName, constructor);
            }
        }
    };
    return function (constructorFunction) {
        /**
             * Building Wrapper Function for new Constructor
             * @param args
             */
        const newConstructorFunction = function (...args) {
            const func = function () {
                return new constructorFunction(...args);
            };
            func.prototype = constructorFunction.prototype;
            const result = new func();
            return result;
        };
        newConstructorFunction.prototype = constructorFunction.prototype;
        if (webComponentArgs.template) {
            Object.defineProperty(newConstructorFunction.prototype, 'template', {
                get: () => webComponentArgs.template || "",
            });
        }
        defineTag(constructorFunction, webComponentArgs.tag, webComponentArgs.extends);
        return newConstructorFunction;
    };
}

/**
 * Repeats Template Element. Amount is set by the amount of objects
 * inside
 */
let VetproviehRepeat = class VetproviehRepeat extends VetproviehBasicRepeat {
};
VetproviehRepeat = __decorate([
    WebComponent({
        template: VetproviehElement.template + `<div id="listElements"></div>`,
        tag: "vp-repeat"
    })
], VetproviehRepeat);

let VetproviehTable = class VetproviehTable extends VetproviehBasicRepeat {
    /**
     * Inserts Element to List
     * @param {any} dataItem
     * @param {index} number
     * @private
     */
    _attachToList(dataItem, index = 0) {
        if (this.shadowRoot) {
            const newListItem = this._generateListItem(dataItem);
            dataItem['index'] = index;
            ViewHelper.replacePlaceholders(newListItem, dataItem);
            this._attachParamsToLink(newListItem, dataItem);
            const list = this.list;
            if (list) {
                list.appendChild(newListItem.children[0]);
            }
        }
    }
    _attachParamsToLink(newListItem, dataItem) {
        let a = newListItem.getElementsByTagName("a")[0];
        if (a) {
            a.params = dataItem;
        }
    }
    /**
   * Generate new Item for List which is based on the template
   * @param {any} dataItem
   * @param {boolean} activatedEventListener
   * @return {HTMLDivElement}
   * @private
   */
    _generateListItem(dataItem, activatedEventListener = false) {
        const newNode = document.importNode(this._listTemplate, true);
        const div = document.createElement('tbody');
        div.appendChild(newNode);
        return div;
    }
};
VetproviehTable = __decorate([
    WebComponent({
        template: VetproviehElement.template + `
        <table class="table">
          <thead>
          </thead>
          <tbody id="listElements">
          </tbody>
        </table>
    `,
        tag: "vp-table"
    })
], VetproviehTable);

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
        return element.tagName == 'TEXTAREA' || element.tagName == 'INPUT' &&
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

class LoadedEvent extends Event {
    constructor(data) {
        super("loadeddata");
        this.data = data;
    }
    get data() {
        return this._data;
    }
    set data(v) {
        if (this._data != v) {
            this._data = v;
        }
    }
}

/**
 * `vetprovieh-detail`
 * Detail-Frame for Read, Create and Update Entities. Used in Vet:Provieh.
 *
 * @customElement
 */
class VetproviehBasicDetail extends VetproviehElement {
    /**
     * Default-Constructor
     * @param {HTMLTemplateElement | undefined} pListTemplate
     */
    constructor(pListTemplate = undefined) {
        super();
        this._src = null;
        this._id = null;
        this._currentObject = {};
        this._storeElement = false;
        const template = pListTemplate || this.querySelector('template');
        if (template) {
            this._detailTemplate = template.content;
        }
    }
    /**
         * Observed attributes
         * @return {Array<string>}
         */
    static get observedAttributes() {
        return ['src', 'id'];
    }
    /**
       * @property {boolean} storeElement
       */
    get storeElement() {
        return this._storeElement;
    }
    /**
     * Setting Src
     * @param {boolean} val
     */
    set storeElement(val) {
        if (val !== this.storeElement) {
            this._storeElement = val;
        }
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
     * Get Current Object
     * @return {any}
     */
    get currentObject() {
        return this._currentObject;
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
            }).innerHTML = this.template;
        }
        this._attachListenerToButtons();
        this._loadHtmlId();
        window.onunload = () => this._storeCurrentObject();
    }
    /**
       * Attaching Listener to Save and Abort Button
       * @private
       */
    _attachListenerToButtons() {
        const save = this.getByIdFromShadowRoot('saveButton');
        const abort = this.getByIdFromShadowRoot('abortButton');
        save.addEventListener('click', () => this.save());
        abort.addEventListener('click', () => {
            // Destroy Cached local Data
            VetproviehNavParams.delete(window.location.href);
            window.history.back();
        });
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
                    // Destroy Cached local Data
                    VetproviehNavParams.delete(window.location.href);
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
            this._emitLoaded(data);
        }
    }
    /**
     * Emitting loaded Event
     * @param {any} data
     */
    _emitLoaded(data) {
        var event = new LoadedEvent(data);
        this.dispatchEvent(event);
    }
    /**
       * Load ID from Parameters
       * @private
       */
    _loadHtmlId() {
        this.objId = ViewHelper.getParameter("id");
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
        if (this.shadowRoot != null) {
            VetproviehBinding.bindFormElements(this.shadowRoot, data);
        }
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
     * Overwriteable Callback
     * @param {any} data
     * @protected
     */
    _afterFetch(data) {
    }
    /**
     * Storing current Object into LocalStorage
     */
    _storeCurrentObject() {
        if (this.storeElement) {
            VetproviehNavParams.set(this._storeKey, this.currentObject);
        }
    }
    /**
     * Getting StoreKey
     * @return {string}
     */
    get _storeKey() {
        let url = window.location.origin + window.location.pathname;
        if (this.objId != 'new') {
            url += "?id=" + this.objId;
        }
        return url;
    }
    /**
     * Loading Data from Remote-Server
     * @private
     */
    _fetchDataFromServer() {
        if (this.objId && this.src) {
            const self = this;
            let endpoint = 'new.json';
            let localObject = null;
            if (this.objId != 'new') {
                endpoint = this.src + '/' + this.objId;
                localObject = VetproviehNavParams.get(this._storeKey);
            }
            else if (this.storeElement) {
                localObject = VetproviehNavParams.get(this._storeKey);
            }
            if (localObject && Object.keys(localObject).length > 0) {
                self.attachData(localObject);
                self._afterFetch(localObject);
            }
            else {
                fetch(endpoint)
                    .then((response) => response.json())
                    .then((data) => self.attachData(data))
                    .then((data) => self._afterFetch(data))
                    .catch((error) => console.log(error));
            }
        }
    }
}

/**
 * `vetprovieh-detail`
 * Detail-Frame for Read, Create and Update Entities. Used in Vet:Provieh.
 *
 * @customElement
 */
let VetproviehDetail = class VetproviehDetail extends VetproviehBasicDetail {
};
VetproviehDetail = __decorate([
    WebComponent({
        template: VetproviehElement.template + ` 
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
  `,
        tag: 'vetprovieh-detail'
    })
], VetproviehDetail);

/**
 * Notification
 */
let VetproviehNotification = class VetproviehNotification extends VetproviehElement {
    /**
     * Default-Constructor
     */
    constructor() {
        super();
        this._text = "";
        this._type = 'is-primary';
        if (this.innerHTML) {
            this._text = this.innerHTML;
        }
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
            }).innerHTML = this.template;
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
};
VetproviehNotification = __decorate([
    WebComponent({
        template: VetproviehElement.template + `
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
`,
        tag: 'vetprovieh-notification'
    }),
    __metadata("design:paramtypes", [])
], VetproviehNotification);

export { VetproviehBasicDetail, VetproviehDetail, VetproviehNotification };
//# sourceMappingURL=vetprovieh-detail.js.map
