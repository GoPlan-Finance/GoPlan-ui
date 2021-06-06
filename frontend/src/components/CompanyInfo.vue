<template>
  <div class="flex flex-wrap overflow-hidden p-6 mb-6 bg-white rounded-lg">
    <div class="min-w-full sm:grid sm:grid-cols-6 sm:gap-4 mb-2">
      <dt class="text-sm font-medium text-gray-500">
        <img
          v-if="data.info.image"
          :src="data.info.image"
        >
      </dt>
      <dd
        class="mt-1 text-sm text-gray-900 sm:mt-0"
      >
        <h2 class="text-xl font-semibold text-gray-700 leading-tight">
          {{ data.info.companyName }}
        </h2>
      </dd>
    </div>

    <h3 class="mb-4 font-bold">
      {{ $t('details.company_information') }}
    </h3>

    <DataField
      v-for="(detail, index) in data.details"
      :key="index"
      :data="detail.data"
      :label="$t('details.' + detail.label)"
      :type="detail.type"
      class="mb-2"
    />

    <h3 class="mt-4 mb-2 font-bold">
      {{ $t('details.description') }}
    </h3>
    <p class="text-sm text-gray-500">
      {{ data.info.description }}
    </p>
  </div>
</template>

<script lang="ts">
import { AssetProfile, AssetSymbol } from '/@common/models'
import { defineComponent, onBeforeMount, reactive } from 'vue'
import DataField from './base/DataField.vue'


export default defineComponent({
  components : {DataField},
  props      : {
    assetSymbol: {
      type     : AssetSymbol,
      required : true,
    },
  },
  setup (props) {

    const data = reactive({
      info    : {},
      details : [],
    })

    onBeforeMount(async () => {

      const info : AssetProfile = await AssetProfile.fetchProfile(props.assetSymbol)

      data.info = info

      data.details = [
        {
          label : 'company_name',
          data  : info.name,
        },
        {
          label : 'symbol',
          data  : info.symbol.tickerName,
        },
        // {
        //   label : 'isin',
        //   data  : info.isin
        // },
        {
          label : 'exchange',
          data  : info.exchange.name,
        },
        {
          label : 'sector',
          data  : info.sector.name,
        },
        {
          label : 'industry',
          data  : info.industry.name,
        },
        {
          label : 'country',
          data  : info.country,
        },
        {
          label : 'address',
          data  : `${info.address}, ${info.zip} ${info.city}`,
        },
        {
          type  : 'number',
          label : 'full_time_employees',
          data  : info.fullTimeEmployees,
        },
        // {
        //   label : 'ceo',
        //   data  : info.ceo,
        // },
        {
          type  : 'url',
          label : 'website',
          data  : info.website,
        },
        {
          type  : 'date',
          label : 'ipo_date',
          data  : info.ipoDate,
        },
      ]
    })

    return {
      data,
    }
  },
})
</script>
