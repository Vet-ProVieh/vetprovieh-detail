import {
  VetproviehBinding,
  VetproviehElement,
  VetproviehNavParams,
  ViewHelper,
} from '@vetprovieh/vetprovieh-shared/lib/index';
import {FormtValidation} from '@vetprovieh/formt-validation';
import {LoadedEvent} from './loaded-event';
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

  private _storeElement = false;
  private _destroyable = false;
  private _readOnly = false;
  private _beforeSavePromises: { (): Promise<any> }[] = [];

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
   * Adding a beforeSave Promise which get be evaluated before save
   * @param {function():Promise<any>} promise
   */
  addBeforeSavePromise(promise: { (): Promise<any> }) {
    if (promise) {
      this._beforeSavePromises.push(promise);
    }
  }

  /**
   * Execute all before Save Promises
   * @return {Promise<any>}
   */
  protected beforeSave(): Promise<any> {
    return Promise.all(this._beforeSavePromises.map((p) => p()));
  }


  /**
   * Getter ReadOnly
   * @return {boolean}
   */
  get readOnly(): boolean {
    return this._readOnly;
  }

  /**
   * Setter Readonly
   * @param {boolean} val
   */
  set readOnly(val: boolean) {
    if (val !== this.readOnly) {
      this._readOnly = val;
      console.log('Setting readonly');
      this.allInputs.forEach((element) => {
        (element as any).disabled = val;
      });
      const saveButton = this.saveButton;
      if (saveButton) {
        saveButton.disabled = val;
      }
    }
  }

  /**
   * Getter StoreElement
   * @return {boolean}
   */
  get storeElement(): boolean {
    return this._storeElement;
  }

  /**
   * Setter StoreElement
   * @param {boolean} val
   */
  set storeElement(val: boolean) {
    if (val !== this.storeElement) {
      this._storeElement = val;
    }
  }

  /**
   * Getter src
   * @return {string|null}
   */
  get src(): string | null {
    return this._src;
  }

  /**
   * Setter Src
   * @param {string|null} val
   */
  set src(val: string | null) {
    if (val !== this.src) {
      this._src = val;
      this._fetchDataFromServer();
    }
  }

  /**
    * Getter destroyable
    * @return {boolean}
    */
  get destroyable(): boolean {
    return this._destroyable;
  }

  /**
   * Setter destroyable
   * @param {boolean} val
   */
  set destroyable(val: boolean) {
    const valAsBoolean = val;
    if (valAsBoolean !== this._destroyable) {
      this._destroyable = valAsBoolean;
    }
  }

  /**
   * Getter Current Object
   * @return {any}
   */
  get currentObject(): any {
    return this._currentObject;
  }


  /**
   * Setter Current-Object
   * @param {any} val
   */
  set currentObject(val: any) {
    if (this._currentObject !== val) {
      this._currentObject = val;
    }
  }

  /**
   * Getter ID of the currentObject
   * @property {string|null} id
   */
  get objId(): string | null {
    return this._id;
  }

  /**
   * Setter Id of currentObject
   * @param {string|null} val
   */
  set objId(val: string | null) {
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
    console.log('Vetprovieh-Basic-Detail: Listener to Button');
    const destroy = this.getByIdFromShadowRoot('destroyButton') as HTMLElement;

    this.saveButton.addEventListener('click', () => this.save());

    if (this.destroyable && destroy) {
      destroy.addEventListener('click', () => {
        if (confirm('Möchten Sie wirklich diesen Datensatz löschen')) {
          this.destroy().then((result) => result);
        }
      });
    }
    this.abortButton.addEventListener('click', () => this.goBack());
  }

  /**
   * Go a Page Back
   */
  private goBack() {
    VetproviehNavParams.delete(window.location.href);
    window.history.back();
  }

  /**
   * Getting Abort-Button
   * @return {HTMLButtonElement}
   */
  private get abortButton(): HTMLButtonElement {
    return this.getByIdFromShadowRoot('abortButton') as HTMLButtonElement;
  }

  /**
   * Show Notification
   * @param {string} text
   * @param {string} type
   */
  private _showNotification(text: string, type = 'is-success') {
    try {
      (bulmaToast as any).default.toast({
        message: text,
        type: type as any,
        dismissible: false,
        position: 'bottom-center',
        animate: {in: 'fadeIn', out: 'fadeOut'},
      });
    } catch (ex) {
      console.error(ex);
    }
  }

  /**
   * Save-Process
   * @return {Promise<boolean>}
   */
  save(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.validateForm()) {
        this.saveWithoutValidate().then((x) => resolve(x));
      } else {
        resolve(false);
        this._showNotification(
            'Bitte überprüfen Sie ihre Eingaben. ' +
          'Nicht alle Felder sind gefüllt',
            'is-warning');
      }
    });
  }

  /**
   * Save without Validate
   * @return {Promise<boolean>}
   */
  protected saveWithoutValidate(): Promise<boolean> {
    return new Promise((resolve) => {
      this.beforeSave().then(() => {
        this.saveRequest(this._currentObject)
            .then((result) => {
            // Process our return data
              this._showNotification('Daten erfolgreich gespeichert');
              this.tryToSetId(result.headers.get('location'));

              // Destroy Cached local Data
              VetproviehNavParams.delete(window.location.href);
              this.afterSave();
              resolve(true);
            })
            .catch(() => {
              this._showNotification(
                  'Daten konnten nicht gespeichert werden.',
                  'is-danger');
              resolve(false);
            });
      });
    });
  }

  /**
   * AfterSave Method
   * Could be Overwritten in Subclasses
   */
  protected afterSave() {
    console.debug('Detail - AfterSave called');
  }

  /**
   * Trying to set id from locationHeader
   * @param {string| null} locationHeader
   */
  private tryToSetId(locationHeader: string | null) {
    if (locationHeader) {
      try {
        const locationId = parseInt(
          locationHeader?.substr(locationHeader.lastIndexOf('/') + 1));
        this.currentObject.id = locationId;
        this._id = locationId.toString();
      } catch (ex) { }
    }
  }


  /**
   * Destroy an Element
   * @return {Promise<boolean>}
   */
  destroy() : Promise<boolean> {
    return new Promise((resolve) => {
      if (this.destroyable) {
        const successFunction = (response: Response) => {
          if (response.status === 200) {
            this._showNotification('Daten erfolgreich gelöscht');
            setTimeout(() => {
              this.goBack();
            }, 3000);
            resolve(true);
          } else {
            this._showNotification(
                'Daten konnten nicht gelöscht werden.',
                'is-danger');
            resolve(false);
          }
        };

        const errorFunction = (error: any) => {
          this._showNotification(
              'Daten konnten nicht gelöscht werden.',
              'is-danger');
          console.error(error);
          resolve(false);
        };

        fetch(this.endpoint, {method: 'DELETE'})
            .then(successFunction)
            .catch(errorFunction);
      } else {
        resolve(false);
      }
    });
  }

  /**
   * Render DestroyButton
   * @return {string}
   */
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
     * @param {any} data
     * @return {XMLHttpRequest}
     * @private
     */
  private saveRequest(data: any): Promise<Response> {
    let url: string = this.endpoint;
    let method = 'POST';

    if (this.objId != 'new') {
      url += `/${this.objId}`;
      method = 'PUT';
    }
    return fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  }

  /**
     * Validate the Form
     * @return {boolean}
     */
  validateForm() {
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
    const detail = this.detailDiv;
    detail.innerHTML = '';
    detail.appendChild(this._generateDetail());
    if (data) {
      ViewHelper.replacePlaceholders(detail, data);
      this._bindFormElements(data);
      this._emitLoaded(data);
    }
  }

  /**
   * Emitting loaded Event
   * @param {any} data
   */
  _emitLoaded(data: any) {
    const event = new LoadedEvent(data);
    this.dispatchEvent(event);
  }

  /**
     * Load ID from Parameters
     * @private
     */
  _loadHtmlId() {
    this.objId = ViewHelper.getParameter('id');

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
    console.debug('Vetprovieh-Detail: Binding Form-Elements');
    if (prefix == '') {
      this._currentObject = data;
    }

    if (this.shadowRoot != null) {
      VetproviehBinding.bindFormElements(this.shadowRoot, data);
    }
  }

  /**
   * Rebinding Form if something changed inside
   */
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
  // PRIVATE / PROTECTED METHODS
  // -----------------

  /**
   * Getting all Form Inputs from Detail
   * @return {NodeListOf<Element>}
   */
  private get allInputs(): NodeListOf<Element> {
    return this.detailDiv.querySelectorAll('input, select');
  }

  /**
   * DetailDiv
   * @return {HTMLDivElement}
   */
  private get detailDiv(): HTMLDivElement {
    return this.getByIdFromShadowRoot('detail') as HTMLDivElement;
  }

  /**
   * Getting the saveButton
   * @return {HTMLButtonElement}
   */
  private get saveButton(): HTMLButtonElement {
    return this.getByIdFromShadowRoot('saveButton') as HTMLButtonElement;
  }

  /**
   * Overwriteable Callback
   * @param {any} data
   * @protected
   */
  private _afterFetch(data: any) {
    console.debug(`Detail - afterfetch not overridden - ${data}`);
  }

  /**
   * Storing current Object into LocalStorage
   */
  private _storeCurrentObject() {
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
      url += '?id=' + this.objId;
    }
    return url;
  }

  /**
   * Loading Data from Remote-Server
   * @private
   */
  private _fetchDataFromServer() {
    if (this.objId && this.src) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
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
            .then((data) => {
              self.attachData(data); return data;
            })
            .then((data) => {
              console.log(data); return self._afterFetch(data);
            })
            .catch((error) => console.log(error));
      }
    }
  }

  // -----------------
  // CLASS METHODS
  // -----------------
}
