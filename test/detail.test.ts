import { enableFetchMocks } from 'jest-fetch-mock'
import fetch from 'jest-fetch-mock';
enableFetchMocks();

import { VetproviehDetail } from '../lib/vetprovieh-detail';
import { VetproviehNavParams } from '@vetprovieh/vetprovieh-shared/lib';


const template = document.createElement("template");
template.innerHTML = `<div class="field">
                        <label class="label">Firstname</label>
                        <div class="control">
                            <input id="test" property="firstname" class="input" type="text" placeholder="Text input" required/>
                        </div>
                     </div>`;


// Testdata
const data = {
    "firstname": "John",
    "lastname": "Wick",
    "street": "Horseshoe Road",
    "city": "New York",
    "contact": {
        "phone": 1234
    }
};


// Mock Responses
fetch.mockResponse(JSON.stringify(data));


describe('constructor', function () {
    test("should init with default values", () => {
        const detail = new VetproviehDetail(template);

        expect(detail.objId).toEqual(null);
        expect(detail.src).toEqual(null);
    })
});

describe('goBack', () => {
    const detail = new VetproviehDetail(template);

    beforeEach(function () {
        detail.connectedCallback();
        detail.objId = "1";
        detail.src = "test"
    });


    test('should go Back on abortButton click', () => {
        const abort = (detail as any).abortButton as HTMLButtonElement;

        abort.dispatchEvent(new Event("click"));
    })
});

describe('storeCurrentObject', () => {
    const detail = new VetproviehDetail(template);

    beforeEach(function () {
        detail.connectedCallback();
        detail.objId = "1";
        detail.src = "test"
    });

    test('should store object in NavParams', () => {
        let storeKey = (detail as any)._storeKey;
        detail.storeElement = true;
        (detail as any)._storeCurrentObject();

        let storedValue = VetproviehNavParams.get(storeKey);
        expect(storedValue).toEqual(detail.currentObject);
    });
});

describe('connectedCallback', () => {

    let detail = new VetproviehDetail(template);
    const shadowRoot = detail.shadowRoot as ShadowRoot;

    beforeEach(function () {
        detail.connectedCallback();
        detail.objId = "1";
        detail.src = "test"
    });


    test('should emit loaded Event', (done) => {
        detail.addEventListener("loadeddata", (loadedEvent: any) => {
            expect(loadedEvent.data).toEqual(data);
            done();
        });

        detail.src = "test2";
    });

    test('should attach template', () => {
        setTimeout(() => {
            expect(shadowRoot.innerHTML).toMatch("firstname");
        }, 100);
    });

    test('should load Data', () => {
        let input = detail.getByIdFromShadowRoot("test") as HTMLInputElement;
        setTimeout(() => {
            expect(input.value).toMatch(data.firstname);
        }, 100);

    })
});

describe('validateForm', () => {
    let detail = new VetproviehDetail(template);
    const shadowRoot = detail.shadowRoot as ShadowRoot;

    beforeEach(function () {
        detail.connectedCallback();
        detail.objId = "1";
        detail.src = "test"
    });


    test('should be a valid form', () => {
        const valid = detail.validateForm();
        expect(valid).toBeTruthy();
    });

    test('should be a invalid form', () => {
        const input = detail?.shadowRoot?.getElementById("test") as HTMLInputElement
        input.value = "";
        input.dispatchEvent(new Event("change"));

        const valid = detail.validateForm();
        expect(valid).toBeFalsy();
    });
});


describe('readOnly', () => {
    let detail: VetproviehDetail;

    beforeEach(function () {
        detail = new VetproviehDetail(template);
        detail.connectedCallback();
        detail.objId = "1";
        detail.src = "test"

    });

    test('should be false by default', () => {
        expect(detail.readOnly).toBeFalsy();

        expect((detail as any).saveButton.disabled).toBeFalsy();

        (detail as any).allInputs.forEach((element: HTMLInputElement) => {
            expect(element.disabled).toBeFalsy();
        });
    });
    test('should set readOnly', () => {
        detail.readOnly = true;
        expect(detail.readOnly).toBeTruthy();
    });

    test('should disable all fields', () => {

        detail.readOnly = true;

        (detail as any).allInputs.forEach((element: HTMLInputElement) => {
            expect(element.disabled).toBeTruthy();
        });

        expect((detail as any).saveButton.disabled).toBeTruthy();
    });
});

describe('destroy', () => {

    let detail = new VetproviehDetail(template);
    let newData: any = {};

    beforeEach(function () {
        detail.destroyable = true;
        detail.connectedCallback();
        detail.objId = "1";
        detail.src = "test"
    });

    test('should destroy object', (done) => {
        fetch.mockResponseOnce("",
            {
                status: 200
            }
        );

        detail.destroy().then((result) => {
            expect(result).toBeTruthy();
            if (result) {
                done();
            } else {
                done(false);
            }
        }).catch((error) => done(error));
    });


    test('should destroy object', (done) => {
        fetch.mockResponseOnce("",
            {
                status: 404
            }
        );

        detail.destroy().then((result) => {
            expect(result).toBeFalsy();
            if (result) {
                done();
            } else {
                done(false);
            }
        }).catch((error) => done(error));
    });
});

describe('save', () => {
    let detail = new VetproviehDetail(template);
    let newData: any = {};

    beforeEach(function () {
        detail.connectedCallback();
        detail.objId = "1";
        detail.src = "test"

        newData = Object.assign({}, data);
        newData.firstname = "Peter Mayer";
    });


    test('should save data and set location_id', (done) => {
        fetch.mockResponseOnce(JSON.stringify(newData), {
            headers: {
                location: "blabla/2"
            }
        });

        detail.save()
            .then((result) => {
                expect(result).toEqual(true);
                expect(detail.currentObject.id).toEqual(2);
                done();
            }).catch((error) => {
                done(error);
            });
    });

    test('should validate data', () => {

    });

    test('should show invalide signs', () => {

    })
})