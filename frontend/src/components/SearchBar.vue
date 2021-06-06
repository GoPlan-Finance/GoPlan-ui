<template>
  <asset-search v-model="assetSymbol" />
</template>

<script lang="ts">

import { AssetSymbol } from '/@common/models'
import { computed, defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import AssetSearch from './AssetSearch.vue'


export default defineComponent({
  components: {AssetSearch},
  setup () {
    const {push} = useRouter()

    const _assetSymbol : AssetSymbol = ref(null)
    const assetSymbol                = computed({
      get () {
        return _assetSymbol
      },
      set (symbol : AssetSymbol) {
        _assetSymbol.value = symbol

        push({
          name   : 'ticker_details',
          params : {
            ticker: symbol.tickerName,
          },
        })
      },

    })

    return {
      assetSymbol,
    }
  },


})
</script>
