import { VetproviehElement } from '@tomuench/vetprovieh-shared';
/**
 * Notification
 */
export declare class VetproviehNotification extends VetproviehElement {
    /**
       * Getting Template
       * @return {string}
       */
    static get template(): string;
    private _text;
    private _type;
    /**
     * Default-Constructor
     */
    constructor();
    /**
       * @property {string|null} type
       */
    get type(): string;
    /**
     * Setting type
     * @param {string|null} val
     */
    set type(val: string);
    /**
       * @property {string|null} text
       */
    get text(): string;
    /**
     * Setting Text
     * @param {string| null} val
     */
    set text(val: string);
    /**
       * Show Notification for 3 seconds.
       */
    display(): void;
    /**
     * Load NotificationBox from Content
     * @return {HTMLElement}
     */
    private get _notificationBox();
    /**
     * UI-Callback
     */
    connectedCallback(): void;
    /**
     * Rendering update
     */
    _updateRendering(): void;
}
//# sourceMappingURL=vetprovieh-notification.d.ts.map