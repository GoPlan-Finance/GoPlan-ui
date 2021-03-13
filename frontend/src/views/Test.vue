<template>
  <h3 class="text-gray-700 text-3xl font-medium">
    Test Page
  </h3>

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
    <div class="bg-white shadow rounded-lg overflow-hidden my-6">
      <table class="text-left w-full border-collapse">
        <thead class="border-b">
          <tr>
            <th
              class="py-3 px-5 bg-indigo-800 font-medium uppercase text-sm text-gray-100"
            >
              Date
            </th>
            <th
              class="py-3 px-5 bg-indigo-800 font-medium uppercase text-sm text-gray-100"
            >
              High
            </th>
            <th
              class="py-3 px-5 bg-indigo-800 font-medium uppercase text-sm text-gray-100"
            >
              Low
            </th>
            <th
              class="py-3 px-5 bg-indigo-800 font-medium uppercase text-sm text-gray-100"
            >
              Volume
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(price, index) in prices"
            :key="index"
            class="hover:bg-gray-200"
          >
            <td>{{ formatDate(price.date) }}</td>
            <td>{{ price.high }}</td>
            <td>{{ price.low }}</td>
            <td>{{ price.volume }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent, onMounted, reactive, toRefs} from 'vue'
import {PriceHistoryItem} from '../interfaces/ApplicationInterfaces'
import {apiLoader} from '../api/ApiLoader'

export default defineComponent({
  setup () {
    const data: {
      error: unknown|null,
      isLoading: boolean,
      prices: PriceHistoryItem[]
    } = reactive({
      error     : null,
      isLoading : false,
      prices    : []
    })

    onMounted(async () => {
      data.isLoading = true
      try {
        const apiResponse = await apiLoader.getPrices('AAPL')
        data.prices       = apiLoader.resolveApiResponse(apiResponse)
      } catch (e) {
        console.error(e)
        data.error = e
      } finally {
        data.isLoading = false
      }
    })

    function formatDate (date: string): string {
      const object = new Date(date)
      return object.toLocaleDateString()
    }

    return {
      ...toRefs(data),
      formatDate
    }
  },
})

</script>
