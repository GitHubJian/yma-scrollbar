export function isWebkit() {
    return typeof document !== 'undefined' && 'WebkitAppearance' in document.documentElement.style;
}

export function supportsTouch() {
    return (
        typeof window !== 'undefined'
        && ('ontouchstart' in window
            || ('maxTouchPoints' in window.navigator && window.navigator.maxTouchPoints > 0)
            || (window.DocumentTouch && document instanceof window.DocumentTouch))
    );
}

export function supportsIePointer() {
    return typeof navigator !== 'undefined' && navigator.msMaxTouchPoints;
}

export function isChrome() {
    return typeof navigator !== 'undefined' && /Chrome/i.test(navigator && navigator.userAgent);
}

export function toInt(x) {
    return parseInt(x, 10) || 0;
}
