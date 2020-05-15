import {VetproviehBinding} from '@tomuench/vetprovieh-shared';

class VetproviehNotification extends HTMLElement {

    static get template(){
        return `
            <style>
                #notification {
                    transition: all 1s linear;
                }
                .hidden{
                    opacity: 0;
                }
            </style>
            <link href="../node_modules/bulma/css/bulma.min.css" rel="stylesheet" type="text/css">
            <div class="is-hidden">
                <div id="notification" class="notification hidden">
                  <div id="text"></div>
                </div>
            </div>
        `;
    }

    constructor() {
        super();

        this._properties = {
            text: this.innerHTML,
            type: "is-primary"
        }
    }

    /**
     * @property {string|null} type
     */
    get type() {
        return this._properties.type;
    }

    set type(val) {
        if (val !== this.type) {
            this._properties.type = val;
            this._updateRendering()
        }
    }

    /**
     * @property {string|null} text
     */
    get text() {
        return this._properties.text;
    }

    set text(val) {
        if (val !== this.text) {
            this._properties.text = val;
            this._updateRendering()
        }
    }

    /**
     * Show Notification for 3 seconds.
     */
    display(){
        let notificationBox = this.shadowRoot.getElementById("notification");

        notificationBox.classList.remove("hidden");

        setTimeout((_) => {
            notificationBox.parentElement.classList.remove("is-hidden");
        }, 1000);
        setTimeout((_) => {
            notificationBox.classList.add("hidden")
        }, 3000);
        setTimeout((_) => {
            notificationBox.parentElement.classList.add("is-hidden");
        }, 4000);

    }

    connectedCallback(){
        // Lazy creation of shadowRoot.
        if (!this.shadowRoot) {
            this.attachShadow({
                mode: 'open'
            }).innerHTML = VetproviehNotification.template;

        }

        this._updateRendering();
    }

    _updateRendering() {
        let notificationBox = this.shadowRoot.getElementById("notification");
        let textBox = this.shadowRoot.getElementById("text");

        notificationBox.classList.add(this.type);
        textBox.innerHTML = this._properties.text;
    }
}

customElements.define('vetprovieh-notification', VetproviehNotification);

/**
 * `vetprovieh-detail`
 * Detail-Frame for Read, Create and Update Entities. Used in Vet:Provieh.
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class VetproviehDetail extends HTMLElement {

    static get template() {
        return ` 
            <link href="../node_modules/bulma/css/bulma.min.css" rel="stylesheet" type="text/css">
            <form id="form">
                <vetprovieh-notification id="notification">
                </vetprovieh-notification>
                <div id="detail" class="container">
                
                </div>
                <hr/>
                <div class="container">
                <div class="columns">
                    <div class="column">
                        <input id="abortButton" class="button is-danger is-fullwidth" type="reset" value="Abbrechen">                   
                    </div>
                    <div class="column">
                        <input id="saveButton" class="button is-success is-fullwidth" type="button" value="Speichern">
                    </div>
                </div>
                </div>
            </form>
        `;
    }

    static get observedAttributes() {
        return ['src', 'id'];
    }

    attributeChangedCallback(name, old, value) {
        if (old !== value) {
            this[name] = value;
        }
    }

    constructor() {
        super();

        /**
         * @type {!Object}
         * @private
         */
        this._properties = {
            src: null,
            id: null,
            currentObject: {},
            detailTemplate: "<p>No Template found. Please define one</p>"
        };

        var template = this.querySelector("template");
        if (template) {
            this._properties.detailTemplate = template.content;
        }
    }

    /**
     * @property {string|null} src
     */
    get src() {
        return this._properties.src;
    }

    set src(val) {
        if (val !== this.src) {
            this._properties.src = val;
            this._fetchDataFromServer();
        }
    }


    /**
     * @property {id|null} id
     */
    get id() {
        return this._properties.id;
    }

    set id(val) {
        if (val !== this.id) {
            this._properties.id = val;
            this._fetchDataFromServer();
        }
    }

    connectedCallback() {
        // Lazy creation of shadowRoot.
        if (!this.shadowRoot) {
            this.attachShadow({
                mode: 'open'
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
        let saveButton = this.shadowRoot.getElementById("saveButton");
        let abortButton = this.shadowRoot.getElementById("abortButton");
        let _this = this;
        saveButton.addEventListener('click', (_) => this.save(_this));
        abortButton.addEventListener('click', (_) => window.history.back());
    }

    _showNotification(text, type="is-success"){
        let notification = this.shadowRoot.getElementById("notification");
        notification.text = text;
        notification.type = type;
        notification.display();
    }

    save(_this) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            // Process our return data
            if (xhr.status >= 200 && xhr.status < 300) {
                // What do when the request is successful
                console.log('success!', xhr);
                _this._showNotification("Daten erfolgreich gespeichert");
            } else {
                // What do when the request fails
                console.log('The request failed!');
                _this._showNotification("Daten konnten nicht gespeichert werden.", "is-danger");
            }
        };

        if (_this.id != "new") {
            xhr.open("PUT", _this.src + "/" + _this.id);
        } else {
            xhr.open("POST", _this.src);
        }
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.send(JSON.stringify(_this._properties.currentObject));
    }

    /**
     * Attach Data to List
     * @param [Array] data
     * @param [string] searchValue
     */
    attachData(data) {
        var detail = this.shadowRoot.getElementById("detail");
        detail.innerHTML = "";
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
        var url_string = window.location.href
        var url = new URL(url_string);
        var id = url.searchParams.get("id");
        this.id = id;

        if(!id){
            this.id = "new";
        }
    }

    _bindFormElements(data, prefix = "") {
        if (prefix == "") {
            this._properties.currentObject = data;
        }

        Object.keys(data).forEach((key) => {
            if (data[key] != null && typeof (data[key]) === "object") {
                this._bindFormElements(data[key], key + ".");
            } else {
                var binding = new VetproviehBinding(data, key);
                let element = this.shadowRoot.querySelector('[property="' + prefix + key + '"]');

                if (element) {
                    binding.addBinding(element, "value", "change");
                }
            }
        })
    }

    /**
     * Generate new Item for List which is based on the template
     * @private
     */
    _generateDetail() {
        var newNode = document.importNode(this._properties.detailTemplate, true);
        var div = document.createElement("div");
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
        if (this.id && this.src) {
            var self = this;
            var endpoint = "new.json";
            if(this.id != "new") endpoint = this.src + "/" + this.id;

            fetch(endpoint)
                .then(response => response.json())
                .then(data => self.attachData(data, true));
        }
    }

    // -----------------
    // CLASS METHODS
    // -----------------


}

customElements.define('vetprovieh-detail', VetproviehDetail);
