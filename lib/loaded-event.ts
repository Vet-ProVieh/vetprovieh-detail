

export class LoadedEvent extends Event {

    private _data: any;

    constructor(data: any) {
        super("loadeddata");
        this.data = data;
    }

    public get data(): any {
        return this._data;
    }
    public set data(v: any) {
        if (this._data != v) {
            this._data = v;
        }
    }
}