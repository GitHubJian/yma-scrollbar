import * as util from '../util';
import $ from '../dom';
import CLASSNAME from '../classname';
import updateGeometry from '../update-geometry';

export default function (that) {
    const el = that.el;

    function shouldPreventDefault(deltaX, deltaY) {
        const roundedScrollTop = Math.floor(el.scrollTop);
        const isTop = el.scrollTop === 0;
        const isBottom = roundedScrollTop + el.offsetHeight === el.scrollHeight;
        const isLeft = el.scrollLeft === 0;
        const isRight = el.scrollLeft + el.offsetWidth === el.scrollWidth;

        let hitsBound;

        if (Math.abs(deltaY) > Math.abs(deltaX)) {
            hitsBound = isTop || isBottom;
        }
        else {
            hitsBound = isLeft || isRight;
        }

        return hitsBound ? !that.setting.wheelPropagation : true;
    }

    function getDeltaFromEvent(e) {
        let deltaX = e.deltaX;
        let deltaY = -1 * e.deltaY;

        if (typeof deltaX === 'undefined' || typeof deltaY === 'undefined') {
            // OS X Safari
            deltaX = (-1 * e.wheelDeltaX) / 6;
            deltaY = e.wheelDeltaY / 6;
        }

        if (e.deltaMode && e.deltaMode === 1) {
            // Firefox in deltaMode 1: Line scrolling
            deltaX *= 10;
            deltaY *= 10;
        }

        if (deltaX !== deltaX && deltaY !== deltaY /* NaN checks */) {
            // IE in some mouse drivers
            deltaX = 0;
            deltaY = e.wheelDelta;
        }

        if (e.shiftKey) {
            // reverse axis with shift key
            return [-deltaY, -deltaX];
        }

        return [deltaX, deltaY];
    }

    function shouldBeConsumedByChild(target, deltaX, deltaY) {
        if (!util.isWebkit() && el.querySelector('select:focus')) {
            return true;
        }

        if (!el.contains(target)) {
            return false;
        }

        let cursor = target;

        while (cursor && cursor !== el) {
            if ($.hasClass(cursor, CLASSNAME.consume)) {
                return true;
            }

            const style = $.getStyle(cursor);
            if (deltaY && style.overflowY.match(/(scroll|auto)/)) {
                const maxScrollTop = cursor.scrollHeight - cursor.clientHeight;
                if (maxScrollTop > 0) {
                    if ((cursor.scrollTop > 0 && deltaY < 0) || (cursor.scrollTop < maxScrollTop && deltaY > 0)) {
                        return true;
                    }
                }
            }

            if (deltaX && style.overflowX.match(/(scroll|auto)/)) {
                const maxScrollLeft = cursor.scrollWidth - cursor.clientWidth;
                if (maxScrollLeft > 0) {
                    if ((cursor.scrollLeft > 0 && deltaX < 0) || (cursor.scrollLeft < maxScrollLeft && deltaX > 0)) {
                        return true;
                    }
                }
            }

            cursor = cursor.parentNode;
        }

        return false;
    }

    function mousewheelHandler(e) {
        const [deltaX, deltaY] = getDeltaFromEvent(e);

        if (shouldBeConsumedByChild(e.target, deltaX, deltaY)) {
            return;
        }

        let shouldPrevent = false;
        if (!that.setting.useBothWheelAxes) {
            el.scrollTop -= deltaY * that.setting.wheelSpeed;
            el.scrollLeft += deltaX * that.setting.wheelSpeed;
        }
        else if (that.scrollbarYActive && !that.scrollbarXActive) {
            if (deltaY) {
                el.scrollTop -= deltaY * that.setting.wheelSpeed;
            }
            else {
                el.scrollTop += deltaX * that.setting.wheelSpeed;
            }

            shouldPrevent = true;
        }
        else if (that.scrollbarXActive && !that.scrollbarYActive) {
            if (deltaX) {
                el.scrollLeft += deltaX * that.setting.wheelSpeed;
            }
            else {
                el.scrollLeft -= deltaY * that.setting.wheelSpeed;
            }

            shouldPrevent = true;
        }

        updateGeometry(that);

        shouldPrevent = shouldPrevent || shouldPreventDefault(deltaX, deltaY);
        if (shouldPrevent && !e.ctrlKey) {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    if (typeof window.onwheel !== 'undefined') {
        that.event.addListener(el, 'wheel', mousewheelHandler);
    }
    else if (typeof window.onmousewheel !== 'undefined') {
        that.event.addListener(el, 'mousewheel', mousewheelHandler);
    }
}
