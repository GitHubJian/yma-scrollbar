export default {
    main: 'yma-scrollbar',
    focus: 'yma-scrollbar--focus',
    clicking: 'yma-scrollbar--clicking',
    hover: 'yma-scrollbar--hover',
    active: axis => `yma-scrollbar--active-${axis}`,
    scrolling: axis => `yma-scrollbar--scrolling-${axis}`,
    rtl: 'yma-scrollbar--rtl',

    track: axis => `yma-scrollbar__track-${axis}`,
    thumb: axis => `yma-scrollbar__thumb-${axis}`,

    consume: 'yma-scrollbar__consume',
};
