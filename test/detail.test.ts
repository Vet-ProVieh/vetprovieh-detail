import { enableFetchMocks } from 'jest-fetch-mock'
import fetch from 'jest-fetch-mock';
enableFetchMocks();

import { VetproviehDetail } from '../lib/vetprovieh-detail';


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

describe('connectedCallback', () => {

    let detail = new VetproviehDetail(template);
    const shadowRoot = detail.shadowRoot as ShadowRoot;

    beforeEach(function () {
        detail.connectedCallback();
        detail.objId = "1";
        detail.src = "test"
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


describe('save', () => {
    let detail = new VetproviehDetail(template);

    beforeEach(function () {
        detail.connectedCallback();
        detail.objId = "1";
        detail.src = "test"
    });

    test('should save data', () => {
        let newData = Object.assign({}, data);
        newData.firstname = "Peter Mayer";
        fetch.mockResponseOnce(JSON.stringify(newData));

        let input = detail.getByIdFromShadowRoot("test") as HTMLInputElement;
        input.value = "Peter Mayer";


        console.log("starting save");
        detail.save();

        // Hier müssen  noch expectations rein
    });


    test('should validate data', () => {

    });

    test('should show invalide signs', () => {

    })
})