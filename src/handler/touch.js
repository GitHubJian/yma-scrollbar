import updateGeometry from '../update-geometry';
import {supportsTouch, supportsIePointer, isChrome, isIPad} from '../util';
import CLASSNAME from '../classname';
import $ from '../dom';

export default function (that) {
    if (!supportsTouch && !supportsIePointer) {
        return;
    }

    const el = that.el;
    const ownerDocument = that.ownerDocument;

    function shouldPrevent(deltaX, deltaY) {
        const scrollTop = Math.floor(el.scrollTop);
        const scrollLeft = el.scrollLeft;
        const magnitudeX = Math.abs(deltaX);
        const magnitudeY = Math.abs(deltaY);

        if (magnitudeY > magnitudeX) {
            if (
                (deltaY < 0 && scrollTop === that.contentHeight - that.containerHeight) ||
                (deltaY > 0 && scrollTop === 0)
            ) {
                return window.scrollY === 0 && deltaY > 0 && isChrome();
            }
        } else if (magnitudeX > magnitudeY) {
            if (
                (deltaX < 0 && scrollLeft === that.contentWidth - that.containerWidth) ||
                (deltaX > 0 && scrollLeft === 0)
            ) {
                return true;
            }
        }

        return true;
    }

    function applyTouchMove(diffX, diffY) {
        el.scrollTop -= diffY;
        el.scrollLeft -= diffX;

        updateGeometry(that);
    }

    let startOffset = {};
    let startTime = 0;
    let speed = {};
    let easingLoop = null;

    function getTouch(e) {
        if (e.targetTouches) {
            return e.targetTouches[0];
        }
        // IE pointer
        return e;
    }

    function shouldHandle(e) {
        if (e.pointerType && e.pointerType === 'pen' && e.buttons === 0) {
            return false;
        }

        if (e.targetTouches && e.targetTouches.length === 1) {
            return true;
        }

        if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== e.MSPOINTER_TYPE_MOUSE) {
            return true;
        }

        return false;
    }

    function touchStart(e) {
        if (!shouldHandle(e)) {
            return;
        }

        const touch = getTouch(e);

        startOffset.pageX = touch.pageX;
        startOffset.pageY = touch.pageY;

        startTime = new Date().getTime();

        if (easingLoop !== null) {
            clearInterval(easingLoop);
        }
    }

    function shouldBeConsumedByChild(target, deltaX, deltaY) {
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

    function touchMove(e) {
        if (shouldHandle(e)) {
            const touch = getTouch(e);

            const currentOffset = {
                pageX: touch.pageX,
                pageY: touch.pageY,
            };

            const diffX = currentOffset.pageX - startOffset.pageX;
            const diffY = currentOffset.pageY - startOffset.pageY;

            if (shouldBeConsumedByChild(e.target, diffX, diffY)) {
                return;
            }

            applyTouchMove(diffX, diffY);
            startOffset = currentOffset;

            const currentTime = new Date().getTime();

            const timeGap = currentTime - startTime;
            if (timeGap > 0) {
                speed.x = diffX / timeGap;
                speed.y = diffY / timeGap;
                startTime = currentTime;
            }

            if (shouldPrevent(diffX, diffY)) {
                e.preventDefault();
            }
        }
    }

    function touchEnd() {
        if (that.setting.swipeEasing) {
            clearInterval(easingLoop);

            easingLoop = setInterval(function () {
                if (that.isInitialized) {
                    clearInterval(easingLoop);
                    return;
                }

                if (!speed.x && !speed.y) {
                    clearInterval(easingLoop);
                    return;
                }

                if (Math.abs(speed.x) < 0.01 && Math.abs(speed.y) < 0.01) {
                    clearInterval(easingLoop);
                    return;
                }

                if (!that.el) {
                    clearInterval(easingLoop);
                    return;
                }

                applyTouchMove(speed.x * 30, speed.y * 30);

                speed.x *= 0.8;
                speed.y *= 0.8;
            }, 10);
        }
    }

    if (supportsTouch) {
        that.event.addListener(el, 'touchstart', touchStart);
        that.event.addListener(el, 'touchmove', touchMove);
        that.event.addListener(el, 'touchend', touchEnd);
    } else if (supportsIePointer) {
        if (window.PointerEvent) {
            that.event.addListener(el, 'pointerdown', touchStart);
            that.event.addListener(el, 'pointermove', touchMove);
            that.event.addListener(el, 'pointerup', touchEnd);
        } else if (window.MSPointerEvent) {
            that.event.addListener(el, 'MSPointerDown', touchStart);
            that.event.addListener(el, 'MSPointerMove', touchMove);
            that.event.addListener(el, 'MSPointerUp', touchEnd);
        }
    }
}
