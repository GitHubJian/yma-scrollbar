import $ from '../dom';
import CLASSNAME from '../classname';
import {addScrollingClass, removeScrollingClass} from '../process-scroll-diff';
import updateGeometry from '../update-geometry';

export default function (that) {
    bindMouseScrollHandler(that, [
        'containerWidth',
        'contentWidth',
        'pageX',
        'trackXWidth',
        'thumbX',
        'thumbXWidth',
        'scrollLeft',
        'x',
        'trackX',
    ]);

    bindMouseScrollHandler(that, [
        'containerHeight',
        'contentHeight',
        'pageY',
        'trackYHeight',
        'thumbY',
        'thumbYHeight',
        'scrollTop',
        'y',
        'trackY',
    ]);
}

function bindMouseScrollHandler(
    that,
    [containerHeight, contentHeight, pageY, trackYHeight, thumbY, thumbYHeight, scrollTop, y, trackY]
) {
    const el = that.el;

    let startingScrollTop = null;
    let startingMousePageY = null;
    let scrollBy = null;

    function mouseMoveHandler(e) {
        if (e.touches && e.touches[0]) {
            e[pageY] = e.touches[0].pageY;
        }

        el[scrollTop] = startingScrollTop + scrollBy * (e[pageY] - startingMousePageY);

        addScrollingClass(that, y);

        updateGeometry(that);

        e.stopPropagation();
        if (e.type.startsWith('touch') && e.changedTouches.length > 1) {
            e.preventDefault();
        }
    }

    function mouseUpHandler() {
        removeScrollingClass(that, y);

        $.removeClass(that[trackY], CLASSNAME.clicking);

        that.event.removeListener(that.ownerDocument, 'mousemove', mouseMoveHandler);
    }

    function bindMoves(e, touchMode) {
        startingScrollTop = el[scrollTop];
        if (touchMode && e.touches) {
            e[pageY] = e.touches[0].pageY;
        }

        startingMousePageY = e[pageY];
        scrollBy = (that[contentHeight] - that[containerHeight]) / (that[trackYHeight] - that[thumbYHeight]);

        if (!touchMode) {
            that.event.addListener(that.ownerDocument, 'mousemove', mouseMoveHandler);
            that.event.addOnceListener(that.ownerDocument, 'mouseup', mouseUpHandler);

            e.preventDefault();
        }
        else {
            that.event.addListener(that.ownerDocument, 'touchmove', mouseMoveHandler);
        }

        $.addClass(that[trackY], CLASSNAME.clicking);

        e.stopPropagation();
    }

    that.event.addListener(that[thumbY], 'mousedown', e => {
        bindMoves(e);
    });

    that.event.addListener(that[thumbY], 'touchstart', e => {
        bindMoves(e, true);
    });
}
