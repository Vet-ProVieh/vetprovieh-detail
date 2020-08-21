/**
 * `vetprovieh-detail`
 * Detail-Frame for Read, Create and Update Entities. Used in Vet:Provieh.
 *
 * @customElement
 */
export class VetproviehDetail extends VetproviehElement {
    /**
         * Observed attributes
         * @return {Array<string>}
         */
    static get observedAttributes(): string[];
    /**
     * Default-Constructor
     * @param {HTMLTemplateElement | undefined} pListTemplate
     */
    constructor(pListTemplate?: HTMLTemplateElement | undefined);
    _src: string;
    _id: string;
    _currentObject: {};
    _storeElement: boolean;
    _detailTemplate: DocumentFragment;
    /**
     * Setting Src
     * @param {boolean} val
     */
    set storeElement(arg: boolean);
    /**
       * @property {boolean} storeElement
       */
    get storeElement(): boolean;
    /**
     * Setting Src
     * @param {string} val
     */
    set src(arg: string);
    /**
       * @property {string|null} src
       */
    get src(): string;
    /**
     * Get Current Object
     * @return {any}
     */
    get currentObject(): any;
    /**
     * Set Id of currentObject
     * @param {string} val
     */
    set objId(arg: string);
    /**
     * ID of the currentObject
       * @property {string|undefined} id
       */
    get objId(): string;
    /**
     * Run Callback
     */
    connectedCallback(): void;
    /**
       * Attaching Listener to Save and Abort Button
       * @private
       */
    private _attachListenerToButtons;
    /**
     * Show Notification
     * @param {string} text
     * @param {string} type
     */
    _showNotification(text: string, type?: string): void;
    /**
       * Save-Process
       */
    save(): void;
    /**
       * Build-Save Request for Backend
       * @return {XMLHttpRequest}
       * @private
       */
    private _buildSaveRequest;
    /**
       * Validate the Form
       * @return {boolean}
       * @private
       */
    private _validateForm;
    /**
       * Attach Data to List
       * @param {any} data
       * @param {string} searchValue
       */
    attachData(data: any): void;
    /**
     * Emitting loaded Event
     * @param {any} data
     */
    _emitLoaded(data: any): void;
    /**
       * Load ID from Parameters
       * @private
       */
    private _loadHtmlId;
    /**
     * Binding Form Elements
     * @param {any} data
     * @param {string} prefix
     */
    _bindFormElements(data: any, prefix?: string): void;
    /**
       * Generate new Item for List which is based on the template
       * @return {HTMLDivElement}
       * @private
       */
    private _generateDetail;
    /**
     * Overwriteable Callback
     * @param {any} data
     * @protected
     */
    protected _afterFetch(data: any): void;
    /**
     * Storing current Object into LocalStorage
     */
    _storeCurrentObject(): void;
    /**
     * Getting StoreKey
     * @return {string}
     */
    get _storeKey(): string;
    /**
     * Loading Data from Remote-Server
     * @private
     */
    private _fetchDataFromServer;
}
/**
 * Notification
 */
export class VetproviehNotification extends VetproviehElement {
    _type: string;
    _text: string;
    /**
     * Setting type
     * @param {string|null} val
     */
    set type(arg: string);
    /**
       * @property {string|null} type
       */
    get type(): string;
    /**
     * Setting Text
     * @param {string| null} val
     */
    set text(arg: string);
    /**
       * @property {string|null} text
       */
    get text(): string;
    /**
       * Show Notification for 3 seconds.
       */
    display(): void;
    /**
     * Load NotificationBox from Content
     * @return {HTMLElement}
     */
    get _notificationBox(): HTMLElement;
    /**
     * UI-Callback
     */
    connectedCallback(): void;
    /**
     * Rendering update
     */
    _updateRendering(): void;
}
/**
 * BaseClass for view Elements
 */
declare class VetproviehElement extends HTMLElement {
    /**
       * Getting Template
       * @return {string}
       */
    static get template(): string;
    /**
       * Callback Implementation
       * @param {string} name
       * @param {any} old
       * @param {any} value
       */
    attributeChangedCallback(name: string, old: any, value: any): void;
    /**
     * Loading HTML-Element From ShadowRoot
     * @param {string} id
     * @return {HTMLElement | undefined}
     */
    getByIdFromShadowRoot(id: string): HTMLElement | undefined;
    /**
       * Hide Or Show Element
       * @param {string} id
       * @param {boolean} show
       */
    updateVisibility(id: string, show: boolean): void;
}
export {};
