

/**
 * Loaded-Event
 * Get's fired if data is ready
 */
export class LoadedEvent extends Event {
  private _data: any;

  /**
     * DefaultConstructor
     * @param {any} data
     */
  constructor(data: any) {
    super('loadeddata');
    this.data = data;
  }

  /**
     * Getter data
     * @return {any}
     */
  public get data(): any {
    return this._data;
  }

  /**
     * Setter data
     * @param {any} v
     */
  public set data(v: any) {
    if (this._data != v) {
      this._data = v;
    }
  }
}
