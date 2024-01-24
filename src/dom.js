import {toInt} from './util';

function hasClass(el, className) {
    if (!el || !className) {
        return false;
    }
    if (className.indexOf(' ') !== -1) {
        throw new Error('className should not contain space.');
    }
    if (el.classList) {
        return el.classList.contains(className);
    }
    return (' ' + el.className + ' ').indexOf(' ' + className + ' ') > -1;

}

function addClass(el, classNames) {
    if (!el) {
        return;
    }
    let curClass = el.className;
    let classes = (classNames || '').split(' ');

    for (let i = 0, j = classes.length; i < j; i++) {
        let className = classes[i];
        if (!className) {
            continue;
        }

        if (el.classList) {
            el.classList.add(className);
        }
        else if (!hasClass(el, className)) {
            curClass += ' ' + className;
        }
    }

    if (!el.classList) {
        el.setAttribute('class', curClass);
    }
}

function removeClass(el, classNames) {
    if (!el || !classNames) {
        return;
    }
    let classes = classNames.split(' ');
    let curClass = ' ' + el.className + ' ';

    for (let i = 0, j = classes.length; i < j; i++) {
        let className = classes[i];
        if (!className) {
            continue;
        }

        if (el.classList) {
            el.classList.remove(className);
        }
        else if (hasClass(el, className)) {
            curClass = curClass.replace(' ' + className + ' ', ' ');
        }
    }

    if (!el.classList) {
        el.setAttribute('class', trim(curClass));
    }
}

const SPECIAL_CHARS_REGEXP = /([\:\-\_]+(.))/g;
const MOZ_HACK_REGEXP = /^moz([A-Z])/;
const camelCase = function (name) {
    return name
        .replace(SPECIAL_CHARS_REGEXP, function (_, separator, letter, offset) {
            return offset ? letter.toUpperCase() : letter;
        })
        .replace(MOZ_HACK_REGEXP, 'Moz$1');
};
const getStyle = function (el, styleName) {
    if (!el) {
        return null;
    }

    if (!styleName) {
        return getComputedStyle(el);
    }

    styleName = camelCase(styleName);
    if (styleName === 'float') {
        styleName = 'cssFloat';
    }
    try {
        let computed = document.defaultView.getComputedStyle(el, '');
        return el.style[styleName] || computed ? computed[styleName] : null;
    }
    catch (e) {
        return el.style[styleName];
    }
};

function setStyle(el, styleName, value) {
    if (!el || !styleName) {
        return;
    }

    if (typeof styleName === 'object') {
        for (let prop in styleName) {
            if (styleName.hasOwnProperty(prop)) {
                setStyle(el, prop, styleName[prop]);
            }
        }
    }
    else {
        styleName = camelCase(styleName);

        if (typeof value === 'number') {
            value = `${value}px`;
        }

        el.style[styleName] = value;
    }
}

function div(className) {
    const div = document.createElement('div');
    div.className = className;
    return div;
}

let elMatches
    = typeof Element !== 'undefined'
    && (Element.prototype.matches
        || Element.prototype.webkitMatchesSelector
        || Element.prototype.mozMatchesSelector
        || Element.prototype.msMatchesSelector);

function matches(el, query) {
    if (!elMatches) {
        throw new Error('No element matching method supported');
    }

    return elMatches.call(el, query);
}

function children(el, selector) {
    return Array.prototype.filter.call(el.children, function (child) {
        return matches(child, selector);
    });
}

function remove(el) {
    if (el.remove) {
        el.remove();
    }
    else {
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    }
}

function width(el) {
    const styles = getStyle(el);

    return (
        toInt(styles.width)
        + toInt(styles.paddingLeft)
        + toInt(styles.paddingRight)
        + toInt(styles.borderLeftWidth)
        + toInt(styles.borderRightWidth)
    );
}

export default {
    hasClass,
    addClass,
    removeClass,
    getStyle,
    setStyle,
    div,
    matches,
    children,
    remove,
    width,
};
