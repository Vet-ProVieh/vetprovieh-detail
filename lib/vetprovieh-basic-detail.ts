import {
  VetproviehBinding,
  VetproviehElement,
  VetproviehNavParams,
  ViewHelper,
} from '@tomuench/vetprovieh-shared/lib/index';
import { FormtValidation } from '@tomuench/formt-validation';
import { LoadedEvent } from './loaded-event';
import * as bulmaToast from 'bulma-toast';
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
    return ['destroyable', 'src', 'objId'];
  }

  private _src: string | null = null;
  private _id: string | null = null;
  protected _currentObject: any = {};
  private _detailTemplate: DocumentFragment | undefined;

  private _storeElement: boolean = false;
  private _destroyable: boolean = false;
  private _readOnly: boolean = false;
  private _beforeSavePromises: Function[] = [];

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

  addBeforeSavePromise(promise: Function) {
    if (promise) {
      this._beforeSavePromises.push(promise);
    }
  }

  protected beforeSave(): Promise<any> {
    return Promise.all(this._beforeSavePromises.map((p) => p()));
  }



  /**
     * @property {boolean} readOnly
     */
  get readOnly() {
    return this._readOnly;
  }

  set readOnly(val: boolean) {
    if (val !== this.readOnly) {
      this._readOnly = val;
      console.log("Setting readonly");
      this.getByIdFromShadowRoot("detail")?.querySelectorAll("input, select").forEach((element) => {
        (element as any).disabled = val;
      })
      let saveButton = this.getByIdFromShadowRoot("saveButton") as HTMLButtonElement;
      if (saveButton) {
        saveButton.disabled = val;
      }
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
    * @property {boolean} src
    */
  get destroyable(): boolean {
    return this._destroyable;
  }

  /**
   * Setting Src
   * @param {boolean} val
   */
  set destroyable(val) {
    let valAsBoolean = val;
    if (valAsBoolean !== this._destroyable) {
      this._destroyable = valAsBoolean;
    }
  }

  /**
   * Get Current Object
   * @return {any}
   */
  get currentObject(): any {
    return this._currentObject;
  }


  set currentObject(val: any) {
    if (this._currentObject !== val) {
      this._currentObject = val;
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
    console.log("Vetprovieh-Basic-Detail: Listener to Button");
    const save = this.getByIdFromShadowRoot('saveButton') as HTMLElement;
    const abort = this.getByIdFromShadowRoot('abortButton') as HTMLElement;
    const destroy = this.getByIdFromShadowRoot('destroyButton') as HTMLElement;

    save.addEventListener('click', () => this.save());

    if (this.destroyable && destroy) {
      destroy.addEventListener('click', () => {
        if (confirm('Möchten Sie wirklich diesen Datensatz löschen')) {
          this.destroy();
        }
      })
    }
    abort.addEventListener('click', () => this.goBack());
  }

  private goBack() {
    VetproviehNavParams.delete(window.location.href);
    window.history.back()
  }

  /**
   * Show Notification
   * @param {string} text
   * @param {string} type
   */
  private _showNotification(text: string, type = 'is-success') {
    (bulmaToast as any).default.toast({
      message: text,
      type: type as any,
      dismissible: false,
      position: "bottom-center",
      animate: { in: 'fadeIn', out: 'fadeOut' },
    })
  }

  /**
     * Save-Process
     */
  save() : Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this._validateForm()) {
        this.saveWithoutValidate().then((x) => resolve(x));
      } else {
        resolve(false);
        this._showNotification("Bitte überprüfen Sie ihre Eingaben. Nicht alle Felder sind gefüllt", "is-warning");
      }
    })
  }

  /**
   * Save without Validate
   */
  protected saveWithoutValidate(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.beforeSave().then(() => {
        const xhr = this._buildSaveRequest();
        const _this = this;
        xhr.onload = function () {
          // Process our return data
          if (xhr.status >= 200 && xhr.status < 300) {
            // What do when the request is successful
            console.log('success!', xhr);
            _this._showNotification('Daten erfolgreich gespeichert');
            _this.tryToSetId(xhr.getResponseHeader("location"));

            // Destroy Cached local Data
            VetproviehNavParams.delete(window.location.href);
            _this.afterSave();
            resolve(true);
          } else {
            // What do when the request fails
            console.log('The request failed!');
            _this._showNotification('Daten konnten nicht gespeichert werden.',
              'is-danger');
            resolve(false);
          }
        }.bind(this as VetproviehBasicDetail);

        xhr.send(JSON.stringify(this._currentObject));

      });
    })
  }

  protected afterSave() {

  }

  /**
   * Trying to set id from locationHeader
   * @param {string| null} locationHeader 
   */
  private tryToSetId(locationHeader: string | null) {
    if (locationHeader) {
      try {
        console.log(locationHeader);
        let locationId = parseInt(locationHeader?.substr(locationHeader.lastIndexOf("/") + 1));
        this.currentObject.id = locationId;
        this._id = locationId.toString();
      } catch (ex) {
        console.error("Could not Set LocationId");
        console.error(ex);
      }
    }
  }


  /**
   * Destroy an Element
   */
  destroy() {
    const _this = this;
    if (this.destroyable) {
      fetch(this.endpoint, { method: "DELETE" }).then((response) => {
        if (response.status === 200) {
          _this._showNotification('Daten erfolgreich gelöscht');
          setTimeout(() => {
            _this.goBack();
          }, 3000);
        } else {
          _this._showNotification('Daten konnten nicht gelöscht werden.',
            'is-danger');
        }

      }).catch((error) => {
        _this._showNotification('Daten konnten nicht gelöscht werden.',
          'is-danger');
      })
    }
  }

  get destroyButton(): string {
    if (!this.destroyable) {
      return '';
    }
    return `
        <div class="column">
        <input id="destroyButton" 
                class="button is-danger is-fullwidth" 
                type="button" value="Löschen">                   
        </div>
    `;
  }

  /**
   * Current Endpoint
   * @return {string}
   */
  private get endpoint(): string {
    if (this.objId != 'new') {
      return this.src + '/' + this.objId;
    } else {
      return this.src as string;
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
      xhr.open('PUT', this.endpoint);
    } else {
      xhr.open('POST', this.endpoint);
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
      ViewHelper.replacePlaceholders(detail, data)
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
    console.debug("Vetprovieh-Detail: Binding Form-Elements");
    if (prefix == '') {
      this._currentObject = data;
    }

    if (this.shadowRoot != null) {
      VetproviehBinding.bindFormElements(this.shadowRoot, data)
    }
  }

  public rebindForm() {
    this._bindFormElements(this._currentObject);
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
  protected get _storeKey(): string {
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
          .then((data) => { self.attachData(data); return data })
          .then((data) => { console.log(data); return self._afterFetch(data) })
          .catch((error) => console.log(error));
      }
    }
  }

  // -----------------
  // CLASS METHODS
  // -----------------
}
