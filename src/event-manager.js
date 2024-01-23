class EventElement {
    constructor(el) {
        this.el = el;
        this.handlers = {};
    }

    addListener(name, handler) {
        this.handlers[name] = this.handlers[name] || [];
        this.handlers[name].push(handler);
        this.el.addEventListener(name, handler, false);
    }

    removeListener(name, handler) {
        this.handlers[name] = this.handlers[name] || [];

        this.handlers[name] = this.handlers[name].filter(currentHandler => {
            if (handler && currentHandler !== handler) {
                return true;
            }

            this.el.removeEventListener(name, handler, false);
            return false;
        });
    }

    removeAllListener() {
        for (const name in this.handlers) {
            this.removeListener(name);
        }
    }

    get isEmpty() {
        return Object.keys(this.handlers).every(
            key => this.handlers[key].length === 0
        );
    }
}

class EventManager {
    constructor() {
        this.eventElements = [];
    }

    eventElement(el) {
        let ee = this.eventElements.filter(ee => ee.el === el)[0];

        if (!ee) {
            ee = new EventElement(el);
            this.eventElements.push(ee);
        }

        return ee;
    }

    addListener(el, name, handler) {
        this.eventElement(el).addListener(name, handler);
    }

    removeListener(el, name, handler) {
        const ee = this.eventElement(el);
        ee.removeListener(name, handler);

        if (ee.isEmpty) {
            this.eventElements.splice(this.eventElements.indexOf(ee), 1);
        }
    }

    removeAllListener() {
        this.eventElements.forEach(e => e.removeAllListener());
        this.eventElements = [];
    }

    addOnceListener(el, name, handler) {
        const ee = this.eventElement(el);
        const onceHandler = evt => {
            ee.removeListener(name, onceHandler);
            handler(evt);
        };

        ee.addListener(name, onceHandler);
    }
}

export default EventManager;
