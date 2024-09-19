<template>
    <div
        ref="scrollbar"
        :class="{
            'yma-scrollbar': true,
            'is-empty': isEmpty,
        }"
        @click="handleClick"
    >
        <div class="yma-scrollbar__inner">
            <slot></slot>
        </div>
    </div>
</template>

<script>
import '../src/index.scss';
import Scrollbar from '../src/index';

export default {
    name: 'YmaScrollbar',
    componentName: 'YmaScrollbar',
    props: {
        isEmpty: Boolean,
        options: {},
        watchOptionsEnabled: {
            type: Boolean,
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
            }
            else {
                this.createWatcher();
            }
        },
    },
    mounted() {
        this.create();

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
        create() {
            if (!this.scrollbar) {
                const el = this.$refs.scrollbar;
                this.scrollbar = new Scrollbar(el, this.options || {});
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
        handleClick() {
            this.$emit('click');
        },
    },
};
</script>

<style lang="scss">
@import "yma-csskit/bem.scss";

@include b(scrollbar) {
    @include e(inner) {
        width: 100%;
        min-height: 100%;
    }

    @include when(empty) {
        @include e(inner) {
            height: 100%;
        }
    }
}
</style>