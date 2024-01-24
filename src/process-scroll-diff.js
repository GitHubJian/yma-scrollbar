import $ from './dom';
import CLASSNAME from './classname';

const scrollingClassTimer = {x: null, y: null};
export function addScrollingClass(that, axis) {
    const el = that.el;
    const className = CLASSNAME.scrolling(axis);

    if ($.hasClass(el, className)) {
        clearTimeout(scrollingClassTimer[axis]);
    }
    else {
        $.addClass(el, className);
    }
}

export function removeScrollingClass(that, axis) {
    scrollingClassTimer[axis] = setTimeout(function () {
        if (that.isAlive) {
            $.removeClass(that.el, CLASSNAME.scrolling(axis));
        }
    }, that.setting.scrollingThreshold);
}

export function setScrollingClassInstantly(that, axis) {
    addScrollingClass(that, axis);
    removeScrollingClass(that, axis);
}

function createEvent(name) {
    if (typeof window.CustomEvent === 'function') {
        return new CustomEvent(name);
    }
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(name, false, false, undefined);
    return evt;

}

export default function (that, axis, diff, useScrollingClass = true, forceFireReachEvent = false) {
    let fields;
    if (axis === 'top') {
        fields = ['contentHeight', 'containerHeight', 'scrollTop', 'y', 'up', 'down'];
    }
    else if (axis === 'left') {
        fields = ['contentWidth', 'containerWidth', 'scrollLeft', 'x', 'left', 'right'];
    }
    else {
        throw new Error('A proper axis should be provided');
    }

    processScrollDiff(that, diff, fields, useScrollingClass, forceFireReachEvent);
}

function processScrollDiff(
    that,
    diff,
    [contentHeight, containerHeight, scrollTop, y, up, down],
    useScrollingClass = true,
    forceFireReachEvent = false
) {
    const el = that.el;

    that.reach[y] = null;

    if (el[scrollTop] < 1) {
        that.reach[y] = 'start';
    }

    if (el[scrollTop] > that[contentHeight] - that[containerHeight] - 1) {
        that.reach[y] = 'end';
    }

    if (diff) {
        el.dispatchEvent(createEvent(`yma-scroll-${y}`));

        if (diff < 0) {
            el.dispatchEvent(createEvent(`yma-scroll-${up}`));
        }
        else if (diff > 0) {
            el.dispatchEvent(createEvent(`yma-scroll-${down}`));
        }

        if (useScrollingClass) {
            setScrollingClassInstantly(that, y);
        }
    }

    if (that.reach[y] && (diff || forceFireReachEvent)) {
        el.dispatchEvent(createEvent(`yma-${y}-reach-${that.reach[y]}`));
    }
}
