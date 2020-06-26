import { VetproviehElement } from '@tomuench/vetprovieh-shared';
/**
 * `vetprovieh-detail`
 * Detail-Frame for Read, Create and Update Entities. Used in Vet:Provieh.
 *
 * @customElement
 */
export declare class VetproviehDetail extends VetproviehElement {
    /**
         * Getting Template
         */
    static get template(): string;
    /**
         * Observed attributes
         * @return {Array<string>}
         */
    static get observedAttributes(): string[];
    private _src;
    private _id;
    private _currentObject;
    private _detailTemplate;
    /**
     * Default-Constructor
     * @param {HTMLTemplateElement | undefined} pListTemplate
     */
    constructor(pListTemplate?: HTMLTemplateElement | undefined);
    /**
       * @property {string|null} src
       */
    get src(): string | null;
    /**
     * Setting Src
     * @param {string} val
     */
    set src(val: string | null);
    /**
     * ID of the currentObject
       * @property {string|undefined} id
       */
    get objId(): string | null;
    /**
     * Set Id of currentObject
     * @param {string} val
     */
    set objId(val: string | null);
    /**
     * Run Callback
     */
    connectedCallback(): void;
    /**
       * Attaching Listener to Save and Abort Button
       * @private
       */
    _attachListenerToButtons(): void;
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
    _buildSaveRequest(): XMLHttpRequest;
    /**
       * Validate the Form
       * @return {boolean}
       * @private
       */
    _validateForm(): boolean;
    /**
       * Attach Data to List
       * @param {any} data
       * @param {string} searchValue
       */
    attachData(data: any): void;
    /**
       * Load ID from Parameters
       * @private
       */
    _loadHtmlId(): void;
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
    _generateDetail(): HTMLDivElement;
    /**
       * Loading Data from Remote-Server
       * @private
       */
    _fetchDataFromServer(): void;
}
//# sourceMappingURL=vetprovieh-detail.d.ts.map