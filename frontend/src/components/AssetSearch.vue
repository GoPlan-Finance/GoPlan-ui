<template>
  <div
    class="relative"
  >
    <SearchField
      v-model="input"
      :input-class="searchFieldClass"
      :placeholder="placeholder"
      @keyup.enter="selectElement()"
    />
    <ul
      v-if="symbols.data.length && isOpen"
      class="absolute bg-white shadow-2xl rounded-lg mt-2 min-w-full overflow-hidden z-40"
    >
      <li
        v-for="symbol in symbols.data"
        :key="symbol"
      >
        <a
          class="hover:bg-gray-100 block px-4 py-2"
          href="#"
          @click.prevent="selectElement(symbol)"
        >
          <div class="w-14 min-w-min">{{ symbol.tickerName }}</div>
          <div class="text-gray-500 text-sm">{{ symbol.name }}</div>
        </a>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">

import { AssetSymbol } from '/@common/models'
import SearchField from '/@components/base/SearchField.vue'
import { computed, defineComponent, reactive, ref, watch } from 'vue'


const getSymbols = async (tickerName : string) : Promise<AssetSymbol[]> => {
  if (tickerName.length === 0) {
    return []
  }


  return Parse.Cloud.run('Assets--Search', {
    query: tickerName,
  })


}

export default defineComponent({
  components : {SearchField},
  props      : {
    placeholder: {
      type    : String,
      default : 'Search',
    },
    allowText: {
      type    : Boolean,
      default : false,
    },
    modelValue: {
      required  : false,
      validator : prop => prop instanceof AssetSymbol || typeof prop === 'string' || prop === null || prop === undefined,
    },
    searchFieldClass: {
      type    : String,
      default : '',
    },
  },
  emits: [
    'update:modelValue',
  ],
  setup (props, {emit}) {
    const isOpen                             = ref(false)
    const symbols : { data : AssetSymbol[] } = reactive({data: []})

    const tickerName = ref<string>('')

    watch(() => props.modelValue, () => {

      if (props.modelValue instanceof AssetSymbol) {
        tickerName.value = props.modelValue.tickerName
      } else if (typeof props.modelValue === 'string') {
        tickerName.value = props.modelValue
      }
    })

    const update = async () => {
      if (!tickerName.value) {
        return
      }

      if (props.modelValue && tickerName.value === props.modelValue.tickerName) {
        symbols.data = []
        return
      }

      isOpen.value = true
      symbols.data = await getSymbols(tickerName.value)
    }

    const input = computed<string>({
      get () {
        return tickerName.value
      },
      set (param : string) {
        if (tickerName.value === param) {
          return
        }

        if (param === '') {
          emit('update:modelValue', '')
          return
        }

        tickerName.value = param

        update()


        if (props.allowText) {
          emit('update:modelValue', tickerName.value)
        }
      },
    })

    function selectElement (symbol? : AssetSymbol | undefined) {
      if (!symbol && symbols.data.length) {
        symbol = symbols.data[0]
      }

      symbols.data     = []
      tickerName.value = symbol ? symbol.tickerName : ''
      isOpen.value     = false
      emit('update:modelValue', symbol)
    }

    return {
      input,
      symbols,
      tickerName,
      isOpen,
      selectElement,
    }
  },


})
</script>
