import $ from './dom';

export function isEditable(el) {
    return (
        $.matches(el, 'input,[contenteditable]') ||
        $.matches(el, 'select,[contenteditable]') ||
        $.matches(el, 'textarea,[contenteditable]') ||
        $.matches(el, 'button,[contenteditable]')
    );
}

export function outerWidth(element) {
    const styles = $.getStyle(element);
    return (
        toInt(styles.width) +
        toInt(styles.paddingLeft) +
        toInt(styles.paddingRight) +
        toInt(styles.borderLeftWidth) +
        toInt(styles.borderRightWidth)
    );
}

export function isWebkit() {
    return typeof document !== 'undefined' && 'WebkitAppearance' in document.documentElement.style;
}

export function supportsTouch() {
    return (
        typeof window !== 'undefined' &&
        ('ontouchstart' in window ||
            ('maxTouchPoints' in window.navigator && window.navigator.maxTouchPoints > 0) ||
            (window.DocumentTouch && document instanceof window.DocumentTouch))
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

const ua = window.navigator.userAgent.toLowerCase();
export function isIPad() {
    return /iPad/i.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
}
