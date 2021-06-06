<template>
  <label
    v-for="(scale) in timeScales"
    :key="scale.label"
    :class="currentScaleLabel === scale.label ? 'bg-gray-300' : ''"
    class="inline-flex items-center px-2 mr-1 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-300 select-none"
  >
    <input
      v-model="currentScaleLabel"
      :value="scale.label"
      class="hidden"
      name="radio"
      type="radio"
      @click="scaleClicked(scale.label)"
    >
    <span class="py-1 px-2 text-sm text-gray-700">{{ scale.label }}</span>
  </label>
  <div>
    <v-chart
      v-if="!loading"
      :option="option"
      class="chart"
      @datazoom="onDataZoom"
    />
  </div>
</template>

<script lang="ts">
import dayjs, { Dayjs } from 'dayjs'
import duration from 'dayjs/plugin/duration'

import {
  BarChart,
  BoxplotChart,
  CandlestickChart,
  CustomChart,
  EffectScatterChart,
  FunnelChart,
  GaugeChart,
  GraphChart,
  HeatmapChart,
  LineChart,
  LinesChart,
  MapChart,
  ParallelChart,
  PictorialBarChart,
  PieChart,
  RadarChart,
  SankeyChart,
  ScatterChart,
  SunburstChart,
  ThemeRiverChart,
  TreeChart,
  TreemapChart,
} from 'echarts/charts'
import {
  AriaComponent,
  AxisPointerComponent,
  BrushComponent,
  CalendarComponent,
  DatasetComponent,
  DataZoomComponent,
  DataZoomInsideComponent,
  DataZoomSliderComponent,
  GeoComponent,
  GraphicComponent,
  GridComponent,
  LegendComponent,
  MarkAreaComponent,
  MarkLineComponent,
  MarkPointComponent,
  ParallelComponent,
  PolarComponent,
  SingleAxisComponent,
  TimelineComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  TransformComponent,
  VisualMapComponent,
  VisualMapContinuousComponent,
  VisualMapPiecewiseComponent,
} from 'echarts/components' // -----------------
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { defineComponent, onBeforeMount, reactive, ref } from 'vue'
import VChart, { THEME_KEY } from 'vue-echarts'
import { CandleData, getScaleByLabel, getScaleForRange, makeSeries, timeScales } from './HoldingTimeSeriesChart'


dayjs.extend(duration)
use([
  LineChart, BarChart, PieChart, ScatterChart, RadarChart, MapChart, TreeChart, TreemapChart, GraphChart, GaugeChart, FunnelChart, ParallelChart, SankeyChart, BoxplotChart, CandlestickChart, EffectScatterChart, LinesChart, HeatmapChart, PictorialBarChart, ThemeRiverChart, SunburstChart, CustomChart,
  GridComponent, PolarComponent, GeoComponent, SingleAxisComponent, ParallelComponent, CalendarComponent, GraphicComponent, ToolboxComponent, TooltipComponent, AxisPointerComponent, BrushComponent, TitleComponent, TimelineComponent, MarkPointComponent, MarkLineComponent, MarkAreaComponent, LegendComponent, DataZoomComponent, DataZoomInsideComponent, DataZoomSliderComponent, VisualMapComponent, VisualMapContinuousComponent, VisualMapPiecewiseComponent, AriaComponent, DatasetComponent, TransformComponent,
  CanvasRenderer,
  PieChart,
  BarChart,
  CandlestickChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
])


export default defineComponent({
  components: {
    VChart,
  },
  provide: {
    [THEME_KEY]: 'light',
  },
  props: {},
  setup (props) {
    const loading           = ref(true)
    const theChart          = ref(null)
    const currentScaleLabel = ref('Today')
    let currentScale        = reactive(getScaleByLabel('Today'))

    const currentData : CandleData[] = []

    const option = ref({
      tooltip: {
        trigger     : 'item',
        animation   : false,
        axisPointer : {
          type: 'cross',
        },
        // appendToBody : true,
        // order: 'valueDesc',
        formatter (params) {
          // noinspection UnnecessaryLocalVariableJS
          const output = `${params.seriesName} : ${params.value.toFixed(2)} $` // @todo formatCurrency()
          // let output = '<b>' + params[0].name + '</b><br/>'
          //   for (let i = 0 ; i < params.length ; i++) {
          //     if (params[i].value !== 0) {
          //       output += `${params[i].marker} <b>${params[i].seriesName}</b> : ${params[i].value.toFixed(2)} $`
          //       if (i != params.length - 1) { // Append a <br/> tag if not last in loop
          //         output += '<br/>'
          //       }
          //     }
          //   }
          //
          return output
        },
      },
      legend: {
        data: [],
      },

      grid: {
        left         : '3%',
        right        : '4%',
        bottom       : '3%',
        containLabel : true,
      },
      xAxis: {
        type        : 'category',
        data        : [],
        // scale       : true,
        boundaryGap : false,
      },
      yAxis: {
        scale : true,
        type  : 'value',
      },
      // dataZoom : [
      //   {
      //     type  : 'inside',
      //     start : 50,
      //     end   : 100,
      //   },
      //   {
      //     show  : true,
      //     type  : 'slider',
      //     top   : '90%',
      //     start : 50,
      //     end   : 100,
      //   },
      // ],
      series: [],
    })


    const reloadData = async (
      min? : Dayjs,
      max? : Dayjs,
    ) => {

      // noinspection UnnecessaryLocalVariableJS
      const {series, dates, legend} = await makeSeries()

      option.value.xAxis.data  = dates
      option.value.legend.data = legend
      option.value.series      = series
      loading.value            = false
    }


    const scaleClicked = async (label : string) => {
      currentScale            = reactive(getScaleByLabel(label))
      currentScaleLabel.value = currentScale.label

      await reloadData()
    }

    const onDataZoom = async (event) => {
      
      /*
      /// @see https://echarts.apache.org/en/api.html#echartsInstance.dispatchAction
      const {start, end} = Array.isArray(event.batch) ? event.batch.slice(-1).pop() : event

      const between = (idx, len) => {
        return Math.max(0,
          Math.min(
            idx,
            len === 0 ? 0 : len - 1, // Do not go negative if len = 0
          ),
        )
      }

      const firstIndex = between(Math.floor(currentData.length * start / 100.0), currentData.length)
      const lastIndex  = between(Math.ceil(currentData.length * end / 100.0), currentData.length)

      const min = dayjs(currentData[firstIndex].date)
      const max = dayjs(currentData[lastIndex].date)


      const scale = getScaleForRange(min, max)
      console.log(`Range  "${min} => ${max}`)
      console.log(`Scale  "${currentScale.label} => ${scale.label}`)

      if (scale.label !== currentScale.label) {
        currentScale            = reactive(scale)
        currentScaleLabel.value = currentScale.label
        // @todo add zoom logic
        //await reloadData(min, max)
      }
*/

    }


    //watch(() => props.assetSymbol, () => reloadData())

    onBeforeMount(async () => {
      await reloadData()
    })


    return {
      theChart,
      timeScales,
      option,
      onDataZoom,
      scaleClicked,
      currentScale,
      currentScaleLabel,
      loading,
    }
  },
})

</script>
<style scoped>
.chart {
  height: 500px;
}
</style>
