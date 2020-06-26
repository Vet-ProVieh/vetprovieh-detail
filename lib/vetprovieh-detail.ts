import {
  VetproviehBinding,
  VetproviehElement,
} from '@tomuench/vetprovieh-shared';
import {FormtValidation} from '@tomuench/formt-validation';
import {VetproviehNotification} from './vetprovieh-notification';
/**
 * `vetprovieh-detail`
 * Detail-Frame for Read, Create and Update Entities. Used in Vet:Provieh.
 *
 * @customElement
 */
class VetproviehDetail extends VetproviehElement {
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

    private _src: string | null = null;
    private _id: string | null = null;
    private _currentObject: any = {};
    private _detailTemplate: DocumentFragment | undefined;

    /**
     * Default-Constructor
     */
    constructor() {
      super();

      const template = this.querySelector('template');
      if (template) {
        this._detailTemplate = template.content;
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
      if (val !== this.id) {
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
      const save = this.getByIdFromShadowRoot('saveButton') as HTMLElement;
      const abort = this.getByIdFromShadowRoot('abortButton') as HTMLElement;
      save.addEventListener('click', () => this.save());
      abort.addEventListener('click', () => window.history.back());
    }

    /**
     * Show Notification
     * @param {string} text
     * @param {string} type
     */
    _showNotification(text: string, type = 'is-success') {
      const notification =
      this.getByIdFromShadowRoot('notification') as VetproviehNotification;
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
        xhr.onload = function() {
          // Process our return data
          if (xhr.status >= 200 && xhr.status < 300) {
            // What do when the request is successful
            console.log('success!', xhr);
            _this._showNotification('Daten erfolgreich gespeichert');
          } else {
            // What do when the request fails
            console.log('The request failed!');
            _this._showNotification('Daten konnten nicht gespeichert werden.',
                'is-danger');
          }
        }.bind(this as VetproviehDetail);
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
      } else {
        xhr.open('POST', this.src as string);
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
      const form = this.getByIdFromShadowRoot('form') as HTMLFormElement;
      const validator = new FormtValidation();
      return validator.validateForm(form);
    }

    /**
       * Attach Data to List
       * @param {any} data
       * @param {string} searchValue
       */
    attachData(data: any) {
      const detail = this.getByIdFromShadowRoot('detail') as HTMLElement;
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
    _bindFormElements(data: any, prefix = '') {
      if (prefix == '') {
        this._currentObject = data;
      }

      Object.keys(data).forEach((key) => {
        if (data[key] != null && typeof (data[key]) === 'object') {
          this._bindFormElements(data[key], key + '.');
        } else {
          const binding = new VetproviehBinding(data, key);
          const element = (this.shadowRoot as ShadowRoot)
              .querySelector('[property="' + prefix + key + '"]');

          if (element) {
            element.addEventListener('blur', (event) => {
              const validator = new FormtValidation();
              validator.validateElement(event.target as HTMLInputElement);
            });
            binding.addBinding(element as HTMLElement, 'value', 'change');
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
      let newNode : any = document.createElement('p');
      newNode.innerHTML= 'Not definied';
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
      if (this.id && this.src) {
        const self = this;
        let endpoint = 'new.json';
        if (this.id != 'new') endpoint = this.src + '/' + this.id;

        fetch(endpoint)
            .then((response) => response.json())
            .then((data) => self.attachData(data));
      }
    }

  // -----------------
  // CLASS METHODS
  // -----------------
}

customElements.define('vetprovieh-detail', VetproviehDetail);
