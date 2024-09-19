<template>
    <div>
        <div class="wrapper">
            <scrollbar
                :options="{
                    outerYEnabled: true,
                    outerXEnabled: true,
                }"
            >
                <div style="width: 10000px;">
                    <p>
                        <span v-for="idx of 1000"> {{ idx }}</span>
                    </p>
                </div>
            </scrollbar>
        </div>

        <div @click="destoryHandler">Destory</div>
    </div>
</template>

<script>
import Scrollbar from '../../../../vue';

export default {
    components: {
        Scrollbar,
    },
    data() {
        return {
            scrollbar: null,
        };
    },
    mounted() {},
    methods: {
        destoryHandler() {},
    },
};
</script>

<style lang="scss">
.wrapper {
    width: 400px;
    height: 200px;
    border: 1px solid red;
}

.ps {
    height: 100%;
}
</style>
