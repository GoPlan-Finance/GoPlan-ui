<template>
  <template v-if="!loading && assetSymbol">
    <HeadlineActions>
      <template #headline>
        <div class="flex flex-col">
          <div>
            {{ assetSymbol.name }}
          </div>
          <div class="text-base text-gray-500 font-medium">
            {{ assetSymbol.tickerName }}
          </div>
        </div>
      </template>
      <template #default>
        <buy-sell-asset :asset-symbol="assetSymbol" />
        <WatchAssetModal :asset-symbol="assetSymbol" />
      </template>
    </HeadlineActions>
    <div class="grid grid-cols-1 md:grid-cols-2">
      <AssetPrice
        :symbol="assetSymbol"
        size="large"
      />
    </div>
    <div class="rounded-lg bg-white overflow-hidden p-6 mb-6">
      <CandlestickChart
        :asset-symbol="assetSymbol"
      />
    </div>

    <div class="grid grid-cols-4 gap-4">
      <div>
        <CompanyQuote
          :asset-symbol="assetSymbol"
        />
      </div>
      <div
        class="col-span-3"
      >
        <CompanyInfo
          :asset-symbol="assetSymbol"
        />
      </div>
    </div>
  </template>
</template>

<script lang="ts">
import { AssetSymbol } from '/@common/models'
import AssetPriceVue from '/@components/AssetPrice.vue'
import BuySellAsset from '/@components/BuySellAsset.vue'
import CandlestickChart from '/@components/Charts/CandlestickChart.vue'
import CompanyInfo from '/@components/CompanyInfo.vue'
import CompanyQuote from '/@components/CompanyQuote.vue'
import HeadlineActions from '/@components/HeadlineActions.vue'
import WatchAssetModal from '/@components/WatchAssetModal.vue'
import { defineComponent, onBeforeMount, onUnmounted, reactive, toRefs, watch } from 'vue'


export default defineComponent({
  components: {
    CompanyQuote,
    HeadlineActions,
    WatchAssetModal,
    CompanyInfo,
    AssetPrice: AssetPriceVue,
    CandlestickChart,
    BuySellAsset,
  },
  props: {
    ticker: {
      type     : String,
      required : true,
    },
  },
  setup (props) {

    const data : {
      liveSubscription : Parse.LiveQuerySubscription,
      loading : boolean,
      assetSymbol : AssetSymbol | null,
    } = reactive({
      loading     : false,
      assetSymbol : null,
    })

    const loadAssetSymbol = async () => {
      data.loading     = true
      data.assetSymbol = await AssetSymbol.fetchSymbolByTicker(props.ticker)
      data.loading     = false

      if (data.liveSubscription) {
        await data.liveSubscription.unsubscribe()
      }
    }

    watch(() => props.ticker, loadAssetSymbol)

    onBeforeMount(async () => {
      await loadAssetSymbol()
    })

    onUnmounted(async () => {
      if (data.liveSubscription) {
        await data.liveSubscription.unsubscribe()
      }
    })

    return {
      ...toRefs(data),
    }
  },
})


</script>
