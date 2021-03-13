<template>
  <div v-if="isLoading">
    still loading...
  </div>
  <div v-if="error">
    {{ error }}
  </div>
  <div
    v-if="!isLoading && !error"
    class="mt-6"
  >
    <h3 class="text-gray-700 text-3xl font-medium">
      {{ assetDetails.name }}
    </h3>

    <div
      v-for="detail in assetDetails"
      :key="detail"
    >
      {{ detail }}
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, reactive, toRefs} from 'vue'
import {AlphaVantageApiAdapter} from '../api/adapters/alphaVantage/alphaVantageApi'
import {useRoute} from 'vue-router'
import {CompanyDetails} from '../interfaces/ApplicationInterfaces'

export default defineComponent({
  setup () {
    const route = useRoute()
    const data: {
      error: unknown|null,
      isLoading: boolean,
      assetDetails: CompanyDetails|null
    }           = reactive({
      error        : null,
      isLoading    : false,
      assetDetails : null
    })

    onMounted(async () => {
      data.isLoading = true
      try {
        const adapter     = new AlphaVantageApiAdapter()
        const apiResponse = await adapter.loadCompanyInformationFromApi(route.params.ticker as string)
        data.assetDetails = adapter.resolveCompanyDetailsApiResponse(apiResponse)
      } catch (e) {
        console.error(e)
        data.error = e
      } finally {
        data.isLoading = false
      }
    })

    return {
      ...toRefs(data)
    }
  },
})

</script>
