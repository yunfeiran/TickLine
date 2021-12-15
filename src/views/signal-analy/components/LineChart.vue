<template>
  <div :class="className" :style="{height:height,width:width}" />
</template>

<script>
import * as echarts from 'echarts'
import resize from './mixins/resize'

export default {
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '100%'
    },
    autoResize: {
      type: Boolean,
      default: true
    },
    chartData: {
      type: Object,
      required: true
    },
    stock: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      chart: null
    }
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val)
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el)
      this.setOptions(this.chartData)
    },
    setOptions({ expectedData, actualData } = {}) {
      this.chart.setOption({
        title: {
              text: this.stock,
              left: 0
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
            ,formatter: function(params) {
                      var result = "<p style='text-align:center;'>"+params[0].name + "<p/>";
                      params.forEach(function(item) {
                          
                          if (item.seriesType === "candlestick") {
                              result += "<p><span style='display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:"+item.color+"'></span>" + item.seriesName + "</p>";
                            //  let showArrItems = ['buy1','sale1'];
                            //  let showValueArr = [item.value[1],item.value[2]];
                              for (let index = 1; index < item.dimensionNames.length; index++) {
                                const element = item.dimensionNames[index];
                                const value = item.value[index];
                                result += "<p><span style='display:inline-block;margin-right:4px;border-radius:5px;width:5px;height:5px;background-color:"+item.color+"'></span>" + element 
                              + "  "+value+" </p>";
                              }
                          }else {
                              result += "<p>"+item.marker + " " + item.seriesName + " : " + item.value.toString().substring(0, 7) + "<p/>";
                          }
                          // if(item.seriesName=="kLine") {
                          //     result += "<p>"+item.marker + " " + item.seriesName 
                          //     + "  ("+item.value.toString().split(",")[1]+"，"+
                          //     +item.value.toString().split(",")[2]  + ")<p/>";
                          // } else {
                          //     result += "<p>"+item.marker + " " + item.seriesName + " : " + item.value.toString().substring(0, 7) + "<p/>";
                          // }
  
                      });
                      return result;
                  }
        },
        legend: {
            data: ['signal', 'signal_sim'],
            left: '10%'
        },
        axisPointer: {
          link: [
            {
              xAxisIndex: 'all'
            }
          ],
          label: {
            backgroundColor: '#777'
          }
        },
        grid: [           
          {
            left: '3%',
            right: '1%',
            height: '30%'
          }],
        xAxis: [{
            type: 'category',
            data: this.chartData.times,
            scale: true,
            boundaryGap: false,
            axisLine: { onZero: false },
            splitLine: { show: false },
            splitNumber: 20,
            min: 'dataMin',
            max: 'dataMax'
        } 

        ],
        yAxis: [{
            scale: true,
            splitArea: {
              show: false
            }
            }
          ],
        dataZoom: [
          {
            type: 'inside',
            xAxisIndex: [0, 1, 2, 3],
            start: 0,
            end: 100
          },
          {
            show: true,
            type: 'slider',
            xAxisIndex: [0, 1, 2, 3],
            top: '95%',
            start: 0,
            end: 100
          }],
        series: [{
          name: 'signal',
          type: 'line',
          data: this.chartData.signals,
          itemStyle: {
              normal: {
                  color: '#ef232a',
                  color0: '#14b143',
                  borderColor: '#ef232a',
                  borderColor0: '#14b143'
              }
          }
          ,
          markPoint: {
            data: this.chartData.mark_signal_arr,
            label: {
              formatter: function (param) {
                return param.value;
              }
            }
          }
        }, 
        {
          name: 'signal_sim',
          type: 'line',
          data: this.chartData.signal_sis,
          // smooth: true,
          lineStyle: {
              normal: {
                  opacity: 0.8
              }
          }
          ,
          markPoint: {
            data: this.chartData.mark_signal_sim_arr,
            label: {
              formatter: function (param) {
                return param.value;
              }
            }
          }
        },
        
        ]
      })
    }
  }
}
</script>
