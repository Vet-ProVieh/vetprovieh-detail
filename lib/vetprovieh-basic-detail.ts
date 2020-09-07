import {
  VetproviehBinding,
  VetproviehElement,
  VetproviehNavParams,
  ViewHelper,
  WebComponent,
} from '@tomuench/vetprovieh-shared/lib/index';
import { FormtValidation } from '@tomuench/formt-validation';
import { VetproviehNotification } from './vetprovieh-notification';
import { LoadedEvent } from './loaded-event';
/**
 * `vetprovieh-detail`
 * Detail-Frame for Read, Create and Update Entities. Used in Vet:Provieh.
 *
 * @customElement
 */
export class VetproviehBasicDetail extends VetproviehElement {

  /**
       * Observed attributes
       * @return {Array<string>}
       */
  static get observedAttributes() {
    return ['src', 'id'];
  }

  private _src: string | null = null;
  private _id: string | null = null;
  protected _currentObject: any = {};
  private _detailTemplate: DocumentFragment | undefined;

  private _storeElement: boolean = false;

  /**
   * Default-Constructor
   * @param {HTMLTemplateElement | undefined} pListTemplate
   */
  constructor(pListTemplate: HTMLTemplateElement | undefined = undefined) {
    super();

    const template = pListTemplate || this.querySelector('template');
    if (template) {
      this._detailTemplate = template.content;
    }
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
  get currentObject(): any {
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
    const save = this.getByIdFromShadowRoot('saveButton') as HTMLElement;
    const abort = this.getByIdFromShadowRoot('abortButton') as HTMLElement;
    save.addEventListener('click', () => this.save());
    abort.addEventListener('click', () => {

      // Destroy Cached local Data
      VetproviehNavParams.delete(window.location.href);
      window.history.back()
    });
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
      xhr.onload = function () {
        // Process our return data
        if (xhr.status >= 200 && xhr.status < 300) {
          // What do when the request is successful
          console.log('success!', xhr);
          _this._showNotification('Daten erfolgreich gespeichert');

          // Destroy Cached local Data
          VetproviehNavParams.delete(window.location.href);
        } else {
          // What do when the request fails
          console.log('The request failed!');
          _this._showNotification('Daten konnten nicht gespeichert werden.',
            'is-danger');
        }
      }.bind(this as VetproviehBasicDetail);
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
      this._emitLoaded(data);
    }
  }

  /**
   * Emitting loaded Event
   * @param {any} data 
   */
  _emitLoaded(data: any) {
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
  _bindFormElements(data: any, prefix = '') {
    if (prefix == '') {
      this._currentObject = data;
    }

    if(this.shadowRoot != null){
      VetproviehBinding.bindFormElements(this.shadowRoot,data)
    }
  }

  /**
     * Generate new Item for List which is based on the template
     * @return {HTMLDivElement}
     * @private
     */
  _generateDetail() {
    const div = document.createElement('div');
    let newNode: any = document.createElement('p');
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
  _afterFetch(data: any) {

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
  private get _storeKey(): string {
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
      } else if (this.storeElement) {
        localObject = VetproviehNavParams.get(this._storeKey);
      }

      if (localObject && Object.keys(localObject).length > 0) {
        self.attachData(localObject);
        self._afterFetch(localObject);
      } else {
        fetch(endpoint)
          .then((response) => response.json())
          .then((data) => self.attachData(data))
          .then((data) => self._afterFetch(data))
          .catch((error) => console.log(error));
      }
    }
  }

  // -----------------
  // CLASS METHODS
  // -----------------
}