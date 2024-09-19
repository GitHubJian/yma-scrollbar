import $ from './dom';
import CLASSNAME from './classname';
import {toInt} from './util';

export default function updateGeometry(that) {
    const el = that.el;
    const roundedScrollTop = Math.floor(el.scrollTop);
    const rect = el.getBoundingClientRect();

    that.containerWidth = Math.round(rect.width);
    that.containerHeight = Math.round(rect.height);

    that.contentWidth = el.scrollWidth;
    that.contentHeight = el.scrollHeight;

    if (!el.contains(that.trackX)) {
        // clean up and append
        $.children(el, CLASSNAME.track('x')).forEach(el => {
            $.remove(el);
        });

        el.appendChild(that.trackX);
    }

    if (!el.contains(that.trackY)) {
        // clean up and append
        $.children(el, CLASSNAME.track('y')).forEach(el => {
            $.remove(el);
        });

        el.appendChild(that.trackY);
    }

    if (!that.setting.suppressScrollX && that.containerWidth + that.setting.scrollXMarginOffset < that.contentWidth) {
        that.thumbXActive = true;
        that.trackXWidth = that.containerWidth - that.trackXMarginWidth;
        that.trackXRatio = that.containerWidth / that.trackXWidth;
        that.thumbXWidth = getThumbSize(that, toInt((that.trackXWidth * that.containerWidth) / that.contentWidth));
        that.thumbXLeft = toInt(
            ((that.negativeScrollAdjustment + el.scrollLeft) * (that.trackXWidth - that.thumbXWidth)) /
                (that.contentWidth - that.containerWidth),
        );
    } else {
        that.thumbXActive = false;
    }

    if (that.thumbXLeft >= that.trackXWidth - that.thumbXWidth) {
        that.thumbXLeft = that.trackXWidth - that.thumbXWidth;
    }

    if (!that.setting.suppressScrollY && that.containerHeight + that.setting.scrollYMarginOffset < that.contentHeight) {
        that.thumbYActive = true;
        that.trackYHeight = that.containerHeight - that.trackYMarginHeight;
        that.trackYRatio = that.containerHeight / that.trackYHeight;
        that.thumbYHeight = getThumbSize(that, toInt((that.trackYHeight * that.containerHeight) / that.contentHeight));
        that.thumbYTop = toInt(
            (roundedScrollTop * (that.trackYHeight - that.thumbYHeight)) / (that.contentHeight - that.containerHeight),
        );
    } else {
        that.thumbYActive = false;
    }

    if (that.thumbYTop >= that.trackYHeight - that.thumbYHeight) {
        that.thumbYTop = that.trackYHeight - that.thumbYHeight;
    }

    updateCSS(el, that);

    if (that.thumbXActive) {
        $.addClass(el, CLASSNAME.active('x'));
    } else {
        $.removeClass(el, CLASSNAME.active('x'));

        that.thumbXWidth = 0;
        that.thumbXLeft = 0;
        el.scrollLeft = that.isRTL === true ? that.contentWidth : 0;
    }

    if (that.thumbYActive) {
        $.addClass(el, CLASSNAME.active('y'));
    } else {
        $.removeClass(el, CLASSNAME.active('y'));

        that.thumbYHeight = 0;
        that.thumbYTop = 0;
        el.scrollTop = 0;
    }
}

function getThumbSize(that, thumbSize) {
    if (that.setting.minThumbLength) {
        thumbSize = Math.max(thumbSize, that.setting.minThumbLength);
    }

    if (that.setting.maxThumbLength) {
        thumbSize = Math.min(thumbSize, that.setting.maxThumbLength);
    }

    return thumbSize;
}

function updateCSS(el, that) {
    const trackXOffset = {width: that.trackXWidth};
    const roundedScrollTop = Math.floor(el.scrollTop);

    if (that.isRTL) {
        trackXOffset.left = that.negativeScrollAdjustment + el.scrollLeft + that.containerWidth - that.contentWidth;
    } else {
        trackXOffset.left = el.scrollLeft;
    }

    if (that.isThumbXUsingBottom) {
        trackXOffset.bottom = that.thumbXBottom - roundedScrollTop;
    } else {
        trackXOffset.top = that.thumbXTop + roundedScrollTop;
    }

    $.setStyle(that.trackX, trackXOffset);
    $.setStyle(that.thumbX, {
        left: that.thumbXLeft,
        width: that.thumbXWidth - that.trackXBorderWidth,
    });

    const trackYOffset = {top: roundedScrollTop, height: that.trackYHeight};
    if (that.isThumbYUsingRight) {
        if (that.isRTL) {
            trackYOffset.right =
                that.contentWidth -
                (that.negativeScrollAdjustment + el.scrollLeft) -
                that.thumbYRight -
                that.thumbYOuterWidth -
                9;
        } else {
            trackYOffset.right = that.thumbYRight - el.scrollLeft;
        }
    } else {
        if (that.isRTL) {
            trackYOffset.left =
                that.negativeScrollAdjustment +
                el.scrollLeft +
                that.containerWidth * 2 -
                that.contentWidth -
                that.thumbYLeft -
                that.thumbYOuterWidth;
        } else {
            trackYOffset.left = that.thumbYLeft + el.scrollLeft;
        }
    }

    $.setStyle(that.trackY, trackYOffset);
    $.setStyle(that.thumbY, {
        top: that.thumbYTop,
        height: that.thumbYHeight - that.trackYBorderWidth,
    });
}
