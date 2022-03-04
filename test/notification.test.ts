
import {VetproviehNotification} from '../lib'

describe('constructor', function () {
    test("should init default values", () => {
        const notification = new VetproviehNotification();

        expect(notification.text).toEqual("");
        expect(notification.type).toEqual("is-primary");
    });
});

describe("text", () => {
    test("should set notification text", () => {
        const notification = new VetproviehNotification();  
        notification.connectedCallback();      
        const shadowRoot = notification.shadowRoot as ShadowRoot;
        const testMessage = "My Test-message";

        notification.text = testMessage;

        expect(notification.text).toEqual(testMessage);
        expect(shadowRoot.innerHTML).toMatch(testMessage);
    });
});

describe("type", () => {
    test("should set notification type", () => {
        const notification = new VetproviehNotification();  
        notification.connectedCallback();      
        const shadowRoot = notification.shadowRoot as ShadowRoot;
        const testMessage = "My Test-message";
        const testType = "is-link";

        notification.text = testMessage;
        notification.type = testType;

        expect(shadowRoot.innerHTML).toMatch(testType);
    });
});

describe("display", function(){
    test("should show for 4 Seconds", (done) => {
        const notification = new VetproviehNotification();
        notification.connectedCallback();
        
        const shadowRoot = notification.shadowRoot as ShadowRoot;

        expect(shadowRoot.innerHTML).toMatch("is-hidden");
 
        notification.display();
        // Timeout must be set because the element is shown with a little later
        setTimeout(() => expect(shadowRoot.innerHTML).not.toMatch("is-hidden"), 1001);

        // Should Hide itself
        setTimeout(() => {
            expect(shadowRoot.innerHTML).toMatch("is-hidden")
            done()
        }, 4001);
    })
})