import updateGeometry from '../update-geometry';

export default function (that) {
    that.event.addListener(that.thumbX, 'mousedown', e => e.stopPropagation());
    that.event.addListener(that.trackX, 'mousedown', e => {
        const positionLeft = e.pageX - window.pageXOffset - that.trackX.getBoundingClientRect().left;
        const direction = positionLeft > that.thumbXLeft ? 1 : -1;

        that.el.scrollLeft += direction * that.containerWidth;

        updateGeometry(that);

        e.stopPropagation();
    });

    that.event.addListener(that.thumbY, 'mousedown', e => e.stopPropagation());
    that.event.addListener(that.trackY, 'mousedown', e => {
        const positionTop = e.pageY - window.pageYOffset - that.trackY.getBoundingClientRect().top;
        const direction = positionTop > that.thumbYTop ? 1 : -1;

        that.el.scrollTop += direction * that.containerHeight;

        updateGeometry(that);

        e.stopPropagation();
    });
}
