import { VetproviehBinding} from "./vetprovieh-binding";

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
            
            <form>
                <div id="detail" class="container">
                
                </div>
                <hr/>
                <div class="container">
                    <input class="button is-success" type="submit" value="Speichern">
                    <input class="button is-danger" type="reset" value="Abbrechen">
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
    }

    save() {

    }

    /**
     * Attach Data to List
     * @param [Array] data
     * @param [string] searchValue
     * @param [boolean] clear
     */
    attachData(data, clear = false) {
        var detail = this.shadowRoot.getElementById("detail");
        detail.innerHTML = "";
        detail.appendChild(this._generateDetail());
        this._bindFormElements(data);
    }

    _bindFormElements(data){
        this._properties.currentObject = data;

        Object.keys(data).forEach((key) => {
            var binding = new VetproviehBinding(data,  key);
            let element = this.shadowRoot.querySelector('[property="'+ key +'"]');;
            if(element){
                binding.addBinding(element,  "value", "change");
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

            fetch(this.src + "/" + this.id + ".json")
                .then(response => response.json())
                .then(data => self.attachData(data, true));
        }
    }

    // -----------------
    // CLASS METHODS
    // -----------------


}

customElements.define('vetprovieh-detail', VetproviehDetail);
