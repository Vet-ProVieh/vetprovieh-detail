import {
  WebComponent,
  VetproviehElement}
  from '@vetprovieh/vetprovieh-shared';

// eslint-disable-next-line new-cap
@WebComponent({
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
  tag: 'vetprovieh-notification',
})
/**
 * Notifications
 * tag: 'vetprovieh-notification'
 */
export class VetproviehNotification extends VetproviehElement {
  private _text = '';
  private _type = 'is-primary';

  /**
   * Default-Constructor
   */
  constructor() {
    super();

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
    const notificationBox: HTMLElement = this._notificationBox;
    const parent: HTMLElement = notificationBox.parentElement as HTMLElement;
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
  private get _notificationBox(): HTMLElement {
    return this.getByIdFromShadowRoot('notification') as HTMLElement;
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
    const textBox = this.getByIdFromShadowRoot('text') as HTMLElement;

    notificationBox.classList.add(this.type);
    textBox.innerHTML = this._text;
  }
}
