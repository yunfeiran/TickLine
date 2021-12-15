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
      this.chart.on('dblclick',param => {
        if (param.seriesName === "signal") {
          this.$router.push({ path: '/SignalAnaly/index', query: this.chartData.formInline })
        }
      })
    },
    setOptions({ expectedData, actualData } = {}) {
      const title = this.chartData.formInline.stock ? this.chartData.formInline.stock.split(' ')[0] : ''
      this.chart.setOption({
        title: {
              text: title,
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
            data: ['sale1', 'buy1', 'mid','pnl','exposure','signal'],
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
        grid: [           {
              left: '3%',
              right: '1%',
              height: '30%'
          },{
              left: '3%',
              right: '1%',
              top: '45%',
              height: '15%'
          }
          ,{
              left: '3%',
              right: '1%',
              top: '65%',
              height: '15%'
          }
          ,{
              left: '3%',
              right: '1%',
              top: '80%',
              height: '15%'
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
        } ,{
            type: 'category',
            gridIndex: 1,
            data: this.chartData.times,
            axisLabel: {show: false},
            axisTick: {show: false}
        }, {
          type: 'category',
          gridIndex: 2,
          data: this.chartData.times,
          axisLabel: {
            show: false
          },
          axisTick: {show: false}
        },
        {
            type: 'category',
            gridIndex: 3,
            data: this.chartData.times,
            axisLabel: {
              show: false
            },
             axisTick: {show: false}
          }

        ],
        yAxis: [{
            scale: true,
            splitArea: {
                show: false
            }
        },{
          scale: true,
          gridIndex: 1,
          splitNumber: 3,
          axisLine: {onZero: false},
          axisTick: {show: false},
          splitLine: {show: false},
          axisLabel: {show: true}
        }
        ,{
          scale: true,
          gridIndex: 2,
          splitNumber: 3,
          axisLine: {onZero: false},
          axisTick: {show: false},
          splitLine: {show: false},
          axisLabel: {show: true}
        }
         ,{
            scale: true,
            gridIndex: 3,
            splitNumber: 3,
            axisLine: {onZero: false},
            axisTick: {show: false},
            splitLine: {show: false},
            axisLabel: {show: true}
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
          name: 'sale1',
          type: 'line',
          data: this.chartData.sale1,
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
            data: this.chartData.markSale1,
            label: {
              formatter: function (param) {
                return param.value;
              }
            }
          }
        }, 
        {
          name: 'buy1',
          type: 'line',
          data: this.chartData.buy1,
          smooth: true,
          lineStyle: {
              normal: {
                  opacity: 0.8
              }
          }
          ,
          markPoint: {
            data: this.chartData.markBuy1,
            label: {
              formatter: function (param) {
                return param.value;
              }
            }
          }
        },
        {
          name: 'mid',
          type: 'line',
          data: this.chartData.datas,
          smooth: true,
          lineStyle: {
              normal: {
                  opacity: 0.8
              }
          }
        },  
        {
          name: 'pnl',
          type: 'line',
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: this.chartData.pnl,
          itemStyle: {
               normal: {
                  color: '#9a60b4',
                  color0: '#14b143',
                  borderColor: '#9a60b4',
                  borderColor0: '#14b143'
                }
            }
        }
        ,  
        {
          name: 'exposure',
          type: 'line',
          xAxisIndex: 2,
          yAxisIndex: 2,
          data: this.chartData.exposure
        },

        {
            name: 'signal',
            type: 'line',
            xAxisIndex: 3,
            yAxisIndex: 3,
            data: this.chartData.signal
          }
        ]
      })
    }
  }
}
</script>
