<script>
import '../index.scss';
import Scrollbar from '../index';

export default {
    name: 'YmaScrollbar',
    componentName: 'YmaScrollbar',
    props: {
        options: {
            type: Object,
            required: false,
            default: () => {},
        },
        tag: {
            type: String,
            required: false,
            default: 'div',
        },
        watchOptionsEnabled: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    data() {
        return {
            scrollbar: null,
        };
    },
    watch: {
        watchOptionsEnabled(shouldWatch) {
            if (!shouldWatch && this.watcher) {
                this.watcher();
            } else {
                this.createWatcher();
            }
        },
    },
    mounted() {
        this.init();

        if (this.watchOptionsEnabled) {
            this.createWatcher();
        }
    },
    updated() {
        this.$nextTick(() => {
            this.update();
        });
    },
    beforeDestroy() {
        this.destroy();
    },
    methods: {
        init() {
            if (!this.scrollbar) {
                const el = this.$refs.scrollbar;
                this.scrollbar = new Scrollbar(el);
            }
        },
        createWatcher() {
            this.watcher = this.$watch(
                'options',
                () => {
                    this.destroy();
                    this.create();
                },
                {
                    deep: true,
                }
            );
        },
        scrollTop(y) {
            this.scrollbar.scrollTop(y);
        },
        scrollLeft(x) {
            this.scrollbar.scrollLeft(x);
        },
        scrollTo(x, y) {
            this.scrollbar.scrollLeft(x);
            this.scrollbar.scrollTop(y);
        },
        update() {
            if (this.scrollbar) {
                this.scrollbar.update();
            }
        },
        destroy() {
            if (this.scrollbar) {
                this.scrollbar.destroy();
                this.scrollbar = null;
            }
        },
    },
    render(h) {
        return h(
            this.tag,
            {
                ref: 'scrollbar',
                on: this.$listeners,
            },
            this.$slots.default
        );
    },
};
</script>
