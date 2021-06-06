<template>
  <template v-if="!loading ">
    <HeadlineActions>
      <template #headline>
        <div class="flex flex-col">
          <div />
          <div class="text-base text-gray-500 font-medium" />
        </div>
      </template>
      <template #default>
        <buy-sell-asset />
      </template>
    </HeadlineActions>
    <div class="grid grid-cols-1 md:grid-cols-2" />
    <div class="rounded-lg bg-white overflow-hidden p-6 mb-6">
      <HoldingTimeSeriesChart />
    </div>

    <div class="grid grid-cols-4 gap-4">
      <div />
      <div
        class="col-span-3"
      />
    </div>
  </template>
</template>

<script lang="ts">
import BuySellAsset from '/@components/BuySellAsset.vue'
import HoldingTimeSeriesChart from '/@components/Charts/HoldingTimeSeriesChart.vue'
import HeadlineActions from '/@components/HeadlineActions.vue'
import { defineComponent } from 'vue'


export default defineComponent({
  components: {
    HoldingTimeSeriesChart,
    HeadlineActions,
    BuySellAsset,
  },
  props: {},
  setup (props) {


    // onBeforeMount(async () => {
    // })
    //
    // onUnmounted(async () => {
    //
    // })

    return {
      loading: false,
    }
  },
})


</script>
