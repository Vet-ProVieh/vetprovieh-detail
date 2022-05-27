
/**
 * Connection-Helper to Restful-Webservice
 */
export class VetproviehConnection {
  private _objId: string | null = null;
  private _src: string | null = null;

  /**
   * Destroy an Element
   * @return {Promise<boolean>}
   */
  public destroy(): Promise<boolean> {
    return new Promise((resolve) => {
      const successFunction = (response: Response) => {
        resolve(response.status === 200);
      };

      const errorFunction = (error: any) => {
        console.error(error);
        resolve(false);
      };

      fetch(this.endpoint, {method: 'DELETE'})
          .then(successFunction)
          .catch(errorFunction);
    });
  }

  /**
     * Build-Save Request for Backend
     * @param {any} data
     * @return {XMLHttpRequest}
     * @private
     */
  public save(data: any): Promise<Response> {
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
     * Data Ready?
     * @return {boolean}
     */
  public get isReady() : boolean {
    return !!this.objId && !!this.src;
  }


  /**
     * Getter ObjId
     * @return {string | null}
     */
  public get objId(): string | null {
    return this._objId;
  }

  /**
     * Setter ObjId
     * @param {string} v
     */
  public set objId(v: string | null) {
    if (v !== this._objId) {
      this._objId = v;
    }
  }

  /**
     * Getter src
     * @return {string | null}
     */
  public get src(): string | null {
    return this._src;
  }

  /**
     * Setter src
     * @param {string | null} v
     */
  public set src(v: string | null) {
    if (v !== this._src) {
      this._src = v;
    }
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
}
