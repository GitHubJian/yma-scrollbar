<template>
    <div>
        <div class="wrapper">
            <div id="container">
                <div :style="{height: '1000px', width: '1000px'}">
                    <p>
                        <span v-for="idx of 10000"> {{ idx }}</span>
                    </p>
                </div>
            </div>
        </div>

        <div @click="destoryHandler">Destory</div>
    </div>
</template>

<script>
import '../../../../src/index.scss';
import Scrollbar from '../../../../src';

export default {
    components: {},
    data() {
        return {
            scrollbar: null,
        };
    },
    mounted() {
        const container = document.getElementById('container');

        const scrollbar = (this.scrollbar = new Scrollbar(container));
        scrollbar.update();
    },
    methods: {
        destoryHandler() {
            this.scrollbar.destroy();
        },
    },
};
</script>

<style lang="scss">
.wrapper {
    height: 200px;
    width: 400px;
    border: 1px solid red;
}

.ps {
    height: 100%;
}
</style>
