import $ from './dom';
import EventManager from './event-manager';
import clickTrack from './handler/click-track';
import dragThumb from './handler/drag-thumb';
import keyboard from './handler/keyboard';
import wheel from './handler/wheel';
import CLASSNAME from './classname';
import {toInt} from './util';
import updateGeometry from './update-geometry';
import processScrollDiff from './process-scroll-diff';

function defaults() {
    return {
        handlers: [
            'click-track',
            'drag-thumb',
            'keyboard',
            'wheel',
            // 'touch'
        ],
        maxThumbLength: null, // 设置滚动条的最大长度，可以用来限制滚动条的最大长度
        minThumbLength: null, // 设置滚动条的最小长度，当内容区域可以完全显示时，滚动条会自动隐藏，所以这个参数可以用来设置滚动条的最小可见长度
        scrollingThreshold: 1000, // 设置滚动速度的阈值，当鼠标滚轮或触摸滑动速度超过该阈值时，滚动速度会加快
        scrollXMarginOffset: 0, // 控制横向滚动条的左右边距
        scrollYMarginOffset: 0, // 控制纵向滚动条的上下边距
        suppressScrollX: false, // 是否禁用横向滚动条
        suppressScrollY: false, // 是否禁用纵向滚动条
        swipeEasing: true, // 控制使用触摸滑动时的缓动效果
        useBothWheelAxes: false, // 是否同时使用横向和纵向滚动条
        wheelPropagation: true, // 控制鼠标滚轮事件的传播方式，决定滚轮事件是否传递给父元素
        wheelSpeed: 1, // 控制使用鼠标滚轮时的滚动速度
    };
}

const HANDLERS = {
    'click-track': clickTrack,
    'drag-thumb': dragThumb,
    keyboard,
    wheel,
    // touch,
};

class Scrollbar {
    constructor(el, setting = {}) {
        if (typeof el === 'string') {
            el = document.querySelector(el);
        }

        if (!el || !el.nodeName) {
            throw new Error('Scrollbar 需要传入一个已存在的 HTMLElement');
        }

        this.el = el;

        $.addClass(el, CLASSNAME.main);

        this.setting = Object.assign({}, defaults(), setting);

        this.containerWidth = null;
        this.containerHeight = null;
        this.contentWidth = null;
        this.contentHeight = null;

        this.isRTL = $.getStyle(el, 'direction') === 'rtl';
        if (this.isRTL) {
            $.addClass(el, CLASSNAME.rtl);
        }

        this.isNegativeScroll = (() => {
            const oriScrollLeft = el.scrollLeft;
            let result = null;
            el.scrollLeft = -1;
            result = el.scrollLeft < 0;
            el.scrollLeft = oriScrollLeft;

            return result;
        })();

        this.negativeScrollAdjustment = this.isNegativeScroll
            ? el.scrollWidth - el.clientWidth
            : 0;

        this.event = new EventManager();
        this.ownerDocument = el.ownerDocument || document;

        this._createTrackX();
        this._createTrackY();

        this.reach = {
            x:
                el.scrollLeft <= 0
                    ? 'start'
                    : el.scrollLeft >= this.contentWidth - this.containerWidth
                    ? 'end'
                    : null,
            y:
                el.scrollTop <= 0
                    ? 'start'
                    : el.scrollTop >= this.contentHeight - this.containerHeight
                    ? 'end'
                    : null,
        };

        this.isAlive = true;

        this.setting.handlers.forEach(handlerName => {
            HANDLERS[handlerName](this);
        });

        this.lastScrollTop = Math.floor(el.scrollTop);
        this.lastScrollLeft = el.scrollLeft;
        this.event.addListener(this.el, 'scroll', e => this._onScroll(e));

        updateGeometry(this);
    }

    // 创建 X 滚动条
    _createTrackX() {
        this.trackX = $.div(CLASSNAME.track('x'));
        this.el.appendChild(this.trackX);

        this.thumbX = $.div(CLASSNAME.thumb('x'));
        this.trackX.appendChild(this.thumbX);
        this.thumbX.setAttribute('tabindex', 0);
        this.event.addListener(this.thumbX, 'focus', this._focus);
        this.event.addListener(this.thumbX, 'blur', this._blur);

        this.thumbXActive = null;
        this.thumbXWidth = null;
        this.thumbXLeft = null;
        const trackXStyle = $.getStyle(this.trackX);
        this.thumbXBottom = toInt(trackXStyle.bottom);

        if (isNaN(this.thumbXBottom)) {
            this.isThumbXUsingBottom = false;
            this.thumbXTop = toInt(trackXStyle.top);
        } else {
            this.isThumbXUsingBottom = true;
        }

        this.trackXBorderWidth =
            toInt(trackXStyle.borderLeftWidth) +
            toInt(trackXStyle.borderRightWidth);
        $.setStyle(this.trackX, {display: 'block'});
        this.trackXMarginWidth =
            toInt(trackXStyle.marginLeft) + toInt(trackXStyle.marginRight);
        $.setStyle(this.trackX, {display: ''});
        this.trackXWidth = null;
        this.trackXRatio = null;
    }

    // 创建 Y 滚动条
    _createTrackY() {
        this.trackY = $.div(CLASSNAME.track('y'));
        this.el.appendChild(this.trackY);

        this.thumbY = $.div(CLASSNAME.thumb('y'));
        this.trackY.appendChild(this.thumbY);
        this.thumbY.setAttribute('tabindex', 0);
        this.event.addListener(this.thumbY, 'focus', this._focus);
        this.event.addListener(this.thumbY, 'blur', this._blur);

        this.thumbYActive = null;
        this.thumbYHeight = null;
        this.thumbYTop = null;
        const trackYStyle = $.getStyle(this.trackY);
        this.thumbYRight = toInt(trackYStyle.right);

        if (isNaN(this.thumbYRight)) {
            this.isThumbYUsingRight = false;
            this.thumbYLeft = toInt(trackYStyle.left);
        } else {
            this.isThumbYUsingRight = true;
        }

        this.thumbYOuterWidth = this.isRTL ? $.width(this.thumbY) : null;
        this.trackYBorderWidth =
            toInt(trackYStyle.borderTopWidth) +
            toInt(trackYStyle.borderBottomWidth);
        $.setStyle(this.trackY, {display: 'block'});
        this.trackYMarginHeight =
            toInt(trackYStyle.marginTop) + toInt(trackYStyle.marginBottom);
        $.setStyle(this.trackY, {display: ''});
        this.trackYHeight = null;
        this.trackYRatio = null;
    }

    _focus() {
        $.addClass(this.el, CLASSNAME.hover);
    }

    _blur() {
        $.removeClass(this.el, CLASSNAME.hover);
    }

    _onScroll() {
        if (!this.isAlive) {
            return;
        }

        updateGeometry(this);
        processScrollDiff(this, 'top', this.el.scrollTop - this.lastScrollTop);
        processScrollDiff(
            this,
            'left',
            this.el.scrollLeft - this.lastScrollLeft
        );

        this.lastScrollTop = Math.floor(this.el.scrollTop);
        this.lastScrollLeft = this.el.scrollLeft;
    }

    scrollTop(y) {
        this.el.scrollTop = y;
    }

    scrollLeft(x) {
        this.el.scrollLeft = x;
    }

    scrollTo(x, y) {
        this.el.scrollLeft = x;
        this.el.scrollTop = y;
    }

    update() {
        if (!this.isAlive) {
            return;
        }

        this.negativeScrollAdjustment = this.isNegativeScroll
            ? this.el.scrollWidth - this.el.clientWidth
            : 0;

        $.setStyle(this.trackX, {display: 'block'});
        $.setStyle(this.trackY, {display: 'block'});

        this.trackXMarginWidth =
            toInt($.getStyle(this.trackX, 'margin-left')) +
            toInt($.getStyle(this.trackX, 'margin-right'));
        this.trackYMarginHeight =
            toInt($.getStyle(this.trackY, 'margin-top')) +
            toInt($.getStyle(this.trackY, 'margin-bottom'));

        $.setStyle(this.trackX, {display: 'none'});
        $.setStyle(this.trackY, {display: 'none'});

        updateGeometry(this);

        processScrollDiff(this, 'top', 0, false, true);
        processScrollDiff(this, 'left', 0, false, true);

        $.setStyle(this.trackX, {display: ''});
        $.setStyle(this.trackY, {display: ''});
    }

    destroy() {
        if (!this.isAlive) {
            return;
        }

        this.event.removeAllListener();
        $.remove(this.trackX);
        $.remove(this.thumbX);

        $.remove(this.trackY);
        $.remove(this.thumbY);

        this.element = null;
        this.scrollbarX = null;
        this.scrollbarY = null;
        this.scrollbarXRail = null;
        this.scrollbarYRail = null;

        this._removeMainClass();

        this.isAlive = false;
    }

    _removeMainClass() {
        this.el.className = this.el.className
            .split(' ')
            .filter(name => !name.match(/^yma([-_].+|)$/))
            .join(' ');
    }
}

export default Scrollbar;
