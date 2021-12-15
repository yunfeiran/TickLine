<template>
  <div class="dashboard-editor-container">
    <el-container>
      <el-header>
        <search-csv-head :date="date" :stock="stock" @getTickData="getData"></search-csv-head>
      </el-header>
      <el-main>
        <div class="main-box" v-if="isShow">
          <line-chart :chart-data="data" :stock="stock"/>
        </div>
        <div class="main-box" v-if="!isShow">
          <el-empty :image-size="200" :description="description"></el-empty>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import SearchCsvHead from '@/components/SearchCsvHead'
import LineChart from './components/LineChart'
import { getSignalAnaly} from '@/api/tick'
export default {
  name: 'SignalAnaly',
  components: {
    SearchCsvHead,
    LineChart
  },
  data() {
    return {
      data: {},
      isShow: false,
      description: '没有找到股票的信号对比文件',
      stock: 'SH600163 中闽能源',
      date: '',
      restaurants: [],
      state: ''
    }
  },
  methods: {
    getData(paramFromChild){
      if (paramFromChild.stock && paramFromChild.date) {
        let stock = paramFromChild.stock.split(' ')[0],
            date = paramFromChild.date;
           this.stock = stock
        //const h = this.$createElement;
        const loading = this.$loading({
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        getSignalAnaly({stock, date}).then(response => {
          this.data = this.resetData(response)
          if (response.code === 20000) {
            let notFoundPath = '';
            if (response.hasOwnProperty("tick_file_not_exist")) {
              
              notFoundPath = response.tick_path;
              // this.$message({
              //   message: h('p', null, [
              //     h('span', null, response.tick_msg),
              //     h('i', { style: 'color: teal' }, response.tick_path)
              //   ]),
              //   duration: 2000
              // });
            }else {
              this.data  = this.resetData(response);
            }
            if (this.data.times.length>0) {
              this.isShow = true;
            }else{
              this.isShow = false;
              this.description = '没有找到tick文件: '+notFoundPath;
            }
          }
          loading.close()
        })
      }
    },
    resetData(data){
      const objdata = {};
      let csvdata = data.tick_file_not_exist?[]:data.csvdata;
      let times = [],
      signals = [],
      signal_sis = [],
      mark_signal_arr = [],
      mark_signal_sim_arr = [],
      same_flags = [];
      let isFirst0 = true;
      let indexFirst0 = 0;
      for (let i = 0; i < csvdata.length; i++) {
        let currObj = csvdata[i];
        //let priceArr = [currObj.mid,currObj.bid1,currObj.ask1,'--','--'];
        let t = currObj.time.substr(0,8);
        let signal = currObj.signal;
        times.push(t);
        signals.push(signal);
        signal_sis.push(currObj.signal_sim);
        same_flags.push(currObj.SameFlag);
        // let color_green = 'rgb(0, 255, 0)',color_red = 'rgb(255, 0, 0)';
        // let color = color_red;
        if (currObj.SameFlag == 0) {
          if (isFirst0) {
            indexFirst0 = i;
            isFirst0 = false;
          }
          
          let mark_signal = {'symbol': 'circle', 'symbolSize': '5', 'xAxis': currObj.time.substr(0,8),'yAxis': currObj.signal, 'itemStyle': {color: '#ef232a'}}
           mark_signal_arr.push(mark_signal);
          let mark_signal_sim = {'circle': 'circle', 'symbolSize': '5', 'xAxis': currObj.time.substr(0,8),'yAxis': currObj.signal_sim, 'itemStyle': {color: '#5470c6'}}
           mark_signal_sim_arr.push(mark_signal_sim);
        }
      }


      console.log('DIYIGE',same_flags.indexOf('0'))
      console.log('laset',same_flags.lastIndexOf('0'))
      const firstIndex = same_flags.indexOf('0');
      const lastIndex = same_flags.lastIndexOf('0');
      objdata.signals = signals;
      objdata.signal_sis = signal_sis;
      // objdata.signals = signals.slice(firstIndex,lastIndex);
      // objdata.signal_sis = signal_sis.slice(firstIndex,lastIndex);
      objdata.times = times;
      objdata.same_flags = same_flags;
      objdata.mark_signal_arr = mark_signal_arr;
      objdata.mark_signal_sim_arr = mark_signal_sim_arr;
      return objdata;
    }
  },
  created(){
    const {stock, date} = this.$route.query
    this.date = date || this.getTodayDate
    if (stock) {
      this.stock = stock
    }
  },
  mounted(){
    this.$nextTick(() => {
      this.getData({stock: this.stock,date: this.date});
    });
  },
  computed: {
    getTodayDate: () => {
      const aDate = new Date()
      const month = aDate.getMonth() < 9 ? '0'+(aDate.getMonth()+1) : aDate.getMonth()+1
      const date = aDate.getDate() <= 9 ? '0'+aDate.getDate() : aDate.getDate()
      const fulldate = aDate.getFullYear() + '-' + month + '-' + date
      return fulldate
    }
  },
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 10px;
  background-color: rgb(240, 242, 245);
  position: relative;
  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}
.el-container{
  height:  calc(100vh - 120px);
  .main-box{
    height: 100%;
  }
}
.el-header{
  text-align: center;
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
