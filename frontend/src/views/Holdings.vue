<template>
  <HeadlineActions
    :headline="$t('holdings.headline')"
  >
    <buy-sell-asset />
  </HeadlineActions>


  <h1 class="text-gray-700 text-2xl  items-center">
    Active Positions
  </h1>

  <holdings-table
    :rows="open.rows"
    :table-layout="open.tableLayout"
  />

  <br>
  <br>

  <h1 class="text-gray-700 text-2xl  items-center">
    Previous Positions
  </h1>
  <holdings-table
    :rows="closed.rows"
    :table-layout="closed.tableLayout"
  />
</template>

<script lang="ts">

import BuySellAsset from '/@components/BuySellAsset.vue'
import HeadlineActions from '/@components/HeadlineActions.vue'
import HoldingsTable from '/@components/Holdings/HoldingsTable.vue'
import { Screens } from '/@utils/screens'
import * as dayjs from 'dayjs'
import { computed, defineComponent, onBeforeMount, reactive, toRefs } from 'vue'
import { useHoldingStore } from '../store'


export default defineComponent({
  components: {
    HoldingsTable,
    BuySellAsset,
    HeadlineActions,
  },
  setup () {
    const data = reactive({
      open: {
        rows        : [],
        tableLayout : {
          [Screens.DEFAULT]: [
            [
              'symbolName', 'openQty',
            ],
            [
              'openPL', 'openTotalPrice',
            ],
          ],
          [Screens.SM]: [
            [
              'symbolName', 'name',
            ],
            [
              'openQty', 'lastBuyAt',
            ],
            [
              'openTotalPrice', 'openAvgPrice',
            ],
            [
              'currentTotalPrice', 'currentAvgPrice',
            ],
            [
              'openPL', 'openPLPercent'
            ],
          ],
          [Screens.MD]: [
            [
              'symbolName', 'name',
            ],
            [
              'openQty', 'lastBuyAt',
            ],
            [
              'openTotalPrice', 'openAvgPrice',
            ],
            [
              'currentTotalPrice', 'currentAvgPrice',
            ],
            [
              'openPL', 'openPLPercent'
            ],
            'weight',
          ],
        },
      },
      closed: {
        rows        : [],
        tableLayout : {
          [Screens.DEFAULT]: [
            [
              'symbolName',
            ],
            [
              'closedPL',
            ],
          ],
          [Screens.SM]: [
            [
              'symbolName', 'name',
            ],
            [
              'lastSellAt',
            ],
            [
              'closedPL',
            ],
          ],
        },
      },
    })


    const holdingStore = useHoldingStore()

    onBeforeMount(async () => {
      await holdingStore.subscribe()
    })

    data.open.rows   = computed(() => {
      // console.debug('Holdings Computed(open)')
      return holdingStore.holdings.filter(row => row.openQty !== 0)
    })
    data.closed.rows = computed(() => {
      // console.debug('Holdings Computed(closed)')
      return holdingStore.holdings.filter(row => row.openQty === 0)
    })


    return {
      ...toRefs(data),
      dayjs,
    }
  },
})
</script>
