/**
 * Binding for Form Fields
 */
export class VetproviehBinding {
    /**
     * Default Constructor needs object and a property to bind
     * @param target
     * @param property
     */
    constructor(target, property) {
        this.targetObject = target;
        this.targetProperty = property;
        this.bindings = [];
    }

    /**
     * Gets current property value
     * @returns {*}
     */
    get value(){
        return this.targetObject[this.targetProperty];
    }

    /**
     * Sets current property value
     * @param val
     */
    set value(val){
        if(val !== this.value){
            this.targetObject[this.targetProperty] = val;
            this._updateBindings(val);
        }
    }

    /**
     * Add Binding to HTML-Field
     * @param [HTMLElement] element
     * @param [string] attribute
     * @param [string] event
     * @returns {VetproviehBinding}
     */
    addBinding(element, attribute, event) {
        this._attachListenerToEvent(element, attribute, event)
        this._addToBindings(element, attribute);

        element[attribute] = this.value

        return this;
    }

    /**
     * Insert into internal datastructure
     * @param element
     * @param attribute
     * @private
     */
    _addToBindings(element, attribute){
        this.bindings.push({
            element: element,
            attribute: attribute
        })
    }

    /**
     * Attach EventListener
     * @param element
     * @param event
     * @param attribute
     * @private
     */
    _attachListenerToEvent(element, event, attribute){
        let _this = this;
        if (event) {
            element.addEventListener(event, function (event) {
                _this.value(element[attribute]);
            })
        }
    }

    /**
     * Update all set Bindings
     * @param val
     * @private
     */
    _updateBindings(val){
        this.bindings.forEach((binding) => {
            binding.element[binding.attribute] = val
        })
    }
}