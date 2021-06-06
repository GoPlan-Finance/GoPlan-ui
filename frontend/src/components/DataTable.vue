<template>
  <div class="grid grid-cols-2 gap-2">
    <div
      v-for="alignment in ['left', 'right']"
      :key="alignment"
      :class="alignment === 'left' ? 'justify-start' : 'justify-end'"
      class="flex gap-2 mb-2"
    >
      <slot
        v-if="alignment ==='right'"
        :name="`beforeFilters(${alignment})`"
      />

      <label
        v-for="[ key, filter ] in Object.entries(filters).filter(([key , filter]) => ((alignment ==='right' && !filter.align) || filter.align === alignment))"
        :key="key"
      >
        <slot
          :key="key"
          :filter="filter"
          :name="`filters(${key})`"
          :rows="rowsInternal"
        >
          <!--  @todo Move to sub-component-->
          <select
            v-model="filter.value"
            class="rounded-lg border-0"
            name="type"
          >
            <option
              v-for="option in filter.options"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </slot>
      </label>

      <SearchField
        v-if="config.search && (alignment === 'right')"
        v-model="search"
      />

      <slot
        v-if="alignment ==='right'"
        :name="`afterFilters(${alignment})`"
      />
    </div>
  </div>
  <div
    class="grid gap-2 px-4 py-2 text-gray-400 text-sm"
    :style="tableTemplate"
  >
    <div
      v-for="(row, rowIndex) in tableLayout"
      :key="rowIndex"
      class="grid items-center"
    >
      <div
        v-for="(subRow, subRowIndex) in row"
        :key="subRowIndex"
        :class="{
          'flex-row-reverse': fields[subRow].justify === 'right',
          'text-center justify-center': fields[subRow].justify === 'center'
        }"
        class="flex cursor-pointer hover:text-gray-600 select-none whitespace-nowrap overflow-hidden overflow-ellipsis"
        @click="setSort(subRow)"
      >
        {{ $t(settings.translationPrefix + '.' + subRow) }}
        <GoIcons
          v-if="fields[subRow] === sort.header"
          :class="sort.order === 'asc' ? '' : 'transform rotate-180'"
          class="w-5 h-5"
          name="ChevronDown"
        />
      </div>
    </div>
    <div v-if="settings?.actions" />
  </div>
  <div
    v-for="(row, rowIndex) in rowsInternal"
    :key="rowIndex"
    :style="tableTemplate"
    class="mb-2 grid gap-2 bg-white rounded-lg px-4 py-3"
  >
    <div
      v-for="(cell, cellIndex) in tableLayout"
      :key="cellIndex"
      class="grid grid-cols-none gap-1 items-center"
    >
      <div
        v-for="(header, headerIndex) in cell"
        :key="headerIndex"
        :class="[
          fields[header].classes,
          {
            'text-right justify-end': fields[header].justify === 'right',
            'text-center justify-center': fields[header].justify === 'center'
          }
        ]"
        class="whitespace-nowrap overflow-hidden overflow-ellipsis flex"
      >
        <Private :hide="fields[header].private === true">
          <slot
            :name="`field(${header})`"
            :row="row"
            :value=" fieldFormatValue(fields[header], row) "
          >
            {{ fieldFormatValue(fields[header], row) }}
          </slot>
        </Private>
      </div>
    </div>
    <div
      v-if="settings?.actions"
      class="flex justify-end gap-2 items-center"
    >
      <slot
        :row="row"
        name="actions"
      />
    </div>
  </div>
</template>

<script lang="ts">
import SearchField from '/@components/base/SearchField.vue'
import {
  CompareFn,
  findTableLayout,
  FormatFn,
  getHandler,
  SortSettings,
  TableConfig,
  TableHeader,
  TableLayout,
  TableRow,
  ValueFn,
} from '/@components/DataTable'
import GoIcons from '/@components/Icons/GoIcons.vue'
import { getCurrentBreakpoint } from '/@utils/screens'
import { computed, defineComponent, onBeforeMount, onBeforeUnmount, PropType, reactive, ref, toRefs } from 'vue'


export default defineComponent({
  components : {GoIcons, SearchField},
  props      : {
    config: {
      type      : Object as PropType<TableConfig>,
      required  : true,
      validator : (config: TableConfig) => {
        if (config.search
            && config.search.handler
            && typeof config.search.handler !== 'function') {
          return false
        }

        return true
      },
    },
    rows: {
      type     : Object as PropType<TableRow[]>,
      required : true,
    },
  },
  setup (props) {
    const sort : SortSettings = reactive({
      header : null,
      order  : 'desc',
    })

    const breakpoint = ref(null)

    const config : TableConfig = reactive({
      fields      : props.config.fields,
      settings    : props.config.settings || {},
      filters     : props.config.filters || {},
      search      : props.config.search || {},
      tableLayout : props.config.tableLayout
    })

    const search = ref('')


    function fieldFormatValue (header : TableHeader, row) : string {
      const value = header.value(row, header)
      return header.format(value, row)
    }

    function setSort (key : string, direction : 'asc' | 'desc' = null) {
      const header = config.fields[key]

      if (sort.header !== null && sort.header.key === header.key) {
        sort.order = sort.order === 'asc' ? 'desc' : 'asc' // reverse
      } else {
        sort.header = header

        if (!direction) {
          direction = header.sort === 'asc' ? 'asc' : 'desc'
        }

        sort.order = direction
      }
    }

    function objectToNestedArrays (object : Record<any, any>) {
      return object.map(key => {
        if (!Array.isArray(key)) {
          return [
            key,
          ]
        }
        return key
      })
    }

    const tableLayout = computed<TableLayout>(() => {
      const tableLayouts = config.tableLayout
      const tableLayout  = findTableLayout(tableLayouts, breakpoint.value)

      const arr = objectToNestedArrays(tableLayout)

      arr.forEach(layout => layout.map(fieldName => {
        if (!config.fields[fieldName] || typeof config.fields[fieldName] !== 'object') {
          throw `The field "${fieldName}" is present in "headerLayout", but missing in "  fields"`
        }
      }))

      return arr
    })


    const resizeHandler = (event) => {
      breakpoint.value = getCurrentBreakpoint(event.target.innerWidth)
    }

    onBeforeMount(async () => {
      breakpoint.value = getCurrentBreakpoint(window.innerWidth)
      window.addEventListener('resize', resizeHandler, {passive: true})
    })

    onBeforeUnmount(async () => {
      window.removeEventListener('resize', resizeHandler)
    })

    for (const [
      key, field
    ] of Object.entries(config.fields)) {
      if (!field.key) {
        field.key = key
      }

      field.value   = getHandler<ValueFn>(field, 'value')
      field.compare = getHandler<CompareFn>(field, 'compare')
      //field.search = getHandler<CompareFn>(field, 'search')

      field.format  = getHandler<FormatFn>(field, 'format')
    }

    if (config.settings.sort) {

      if (!Object.values(config.fields).find(field => field.key === config.settings.sort.field)) {
        throw `Sort field ${config.settings.sort.field} doesnt exists in "fields"`
      }

      setSort(config.settings.sort.field, config.settings.sort.direction)
    }


    const tableTemplate = computed(() => {
      let template = ''
      let width    = ''
      for (const column of tableLayout.value) {
        for (const field of column) {
          width = config.fields[field]?.width
        }
        template += width ?? '1fr'
        template += ' '
        width    = ''
      }
      if (config.settings.actions) {
        template += '56px' // This is enough space for 2 actions, eventually we will have to come up with a better way to display this
      }
      return `grid-template-columns: ${template};`
    })


    const rowsInternal = computed(() => {
      let rows : TableRow[] = props.rows

      rows = rows.filter(row => {
        if (search.value !== '') {
          const result = config.search.handler(search.value, row)

          if (!result) {
            return false
          }
        }

        for (const [
          key, filter
        ] of Object.entries(config.filters)) {
          if (filter.value /* !== ''*/) {
            if (typeof filter.handler === 'function') {
              if (filter.handler(filter.value, row) === false) {
                return false
              }
            } else if (row[key] !== filter.value) {
              return false
            }
          }
        }
        return true
      })

      const sortHeader = sort.header as TableHeader
      if (sortHeader) {
        console.time(`${config.settings.translationPrefix} SORT`)
        rows.sort((a : TableRow, b : TableRow) => {
          const valueA = sortHeader.value(a, sortHeader)
          const valueB = sortHeader.value(b, sortHeader)

          const order = sort.order === 'asc' ? -1 : 1

          return order * sortHeader.compare(valueA, valueB)
        })
        console.timeEnd(`${config.settings.translationPrefix} SORT`)
      }

      return rows
    })


    return {
      ...toRefs(config),
      fieldFormatValue,
      rowsInternal,
      setSort,
      sort,
      search,
      tableLayout,
      tableTemplate,
    }
  },
})
</script>
