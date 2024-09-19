import $ from '../dom';
import updateGeometry from '../update-geometry';

function isEditable(el) {
    return (
        $.matches(el, 'input,[contenteditable]') ||
        $.matches(el, 'select,[contenteditable]') ||
        $.matches(el, 'textarea,[contenteditable]') ||
        $.matches(el, 'button,[contenteditable]')
    );
}

export default function (that) {
    const el = that.el;

    const elHovered = function () {
        return $.matches(el, ':hover');
    };

    const thumbFocused = function () {
        return $.matches(that.thumbX, ':focus') || $.matches(that.thumbY, ':focus');
    };

    function shouldPreventDefault(deltaX, deltaY) {
        const scrollTop = Math.floor(el.scrollTop);

        if (deltaX === 0) {
            if (!that.thumbYActive) {
                return false;
            }

            if (
                (scrollTop === 0 && deltaY > 0) ||
                (scrollTop >= that.contentHeight - that.containerHeight && deltaY < 0)
            ) {
                return !that.setting.wheelPropagation;
            }
        }

        const scrollLeft = el.scrollLeft;
        if (deltaY === 0) {
            if (!that.thumbXActive) {
                return false;
            }

            if (
                (scrollLeft === 0 && deltaX < 0) ||
                (scrollLeft >= that.contentWidth - that.containerWidth && deltaX > 0)
            ) {
                return !that.setting.wheelPropagation;
            }
        }

        return true;
    }

    that.event.addListener(that.ownerDocument, 'keydown', e => {
        if ((e.isDefaultPrevented && e.isDefaultPrevented()) || e.defaultPrevented) {
            return;
        }

        if (!elHovered() && !thumbFocused()) {
            return;
        }

        let activeElement = document.activeElement ? document.activeElement : that.ownerDocument.activeElement;
        if (activeElement) {
            if (activeElement.tagName === 'IFRAME') {
                activeElement = activeElement.contentDocument.activeElement;
            } else {
                while (activeElement.shadowRoot) {
                    activeElement = activeElement.shadowRoot.activeElement;
                }
            }

            if (isEditable(activeElement)) {
                return;
            }
        }

        let deltaX = 0;
        let deltaY = 0;

        switch (e.which) {
            case 37: // left
                if (e.metaKey) {
                    deltaX = -that.contentWidth;
                } else if (e.altKey) {
                    deltaX = -that.containerWidth;
                } else {
                    deltaX = -30;
                }
                break;
            case 38: // up
                if (e.metaKey) {
                    deltaY = that.contentHeight;
                } else if (e.altKey) {
                    deltaY = that.containerHeight;
                } else {
                    deltaY = 30;
                }
                break;
            case 39: // right
                if (e.metaKey) {
                    deltaX = that.contentWidth;
                } else if (e.altKey) {
                    deltaX = that.containerWidth;
                } else {
                    deltaX = 30;
                }
                break;
            case 40: // down
                if (e.metaKey) {
                    deltaY = -that.contentHeight;
                } else if (e.altKey) {
                    deltaY = -that.containerHeight;
                } else {
                    deltaY = -30;
                }
                break;
            case 32: // space bar
                if (e.shiftKey) {
                    deltaY = that.containerHeight;
                } else {
                    deltaY = -that.containerHeight;
                }
                break;
            case 33: // page up
                deltaY = that.containerHeight;
                break;
            case 34: // page down
                deltaY = -that.containerHeight;
                break;
            case 36: // home
                deltaY = that.contentHeight;
                break;
            case 35: // end
                deltaY = -that.contentHeight;
                break;
            default:
                return;
        }

        if (that.setting.suppressScrollX && deltaX !== 0) {
            return;
        }

        if (that.setting.suppressScrollY && deltaY !== 0) {
            return;
        }

        el.scrollTop -= deltaY;
        el.scrollLeft += deltaX;

        updateGeometry(that);

        if (shouldPreventDefault(deltaX, deltaY)) {
            e.preventDefault();
        }
    });
}
