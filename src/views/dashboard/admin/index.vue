<template>
  <div class="dashboard-editor-container">
    <el-container>
      <el-header>
        <el-form :inline="true" v-show="!isShowUpload" :model="formInline" class="demo-form-inline">
          <el-form-item label="股票代码">
            <el-autocomplete
              v-model="formInline.stock"
              :fetch-suggestions="querySearchAsync"
              placeholder="请输入股票代码"
              @select="handleSelect"
            ></el-autocomplete>
          </el-form-item>
          <el-form-item label="日期">
            <el-date-picker
              v-model="formInline.date"
              @change="changeDate"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="选择日期">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <!-- <el-button type="primary" @click="onSubmit">查询</el-button> -->
          </el-form-item>
        </el-form>
        <!-- <el-form :inline="true" v-show="isShowUpload" :model="formPath" class="demo-form-inline">
          <el-form-item label="股票tick路径">
            <el-input placeholder="输入新的tick路径" size="medium" style="width: 400px;" v-model="formPath.name"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">提交</el-button>
          </el-form-item>
        </el-form>
        <el-switch
          v-model="isShowUpload"
          active-text="修改文件路径"
          @change="changeSearchType"
          inactive-text="按股票代码查询">
        </el-switch> -->
      </el-header>
      <el-container>
        <el-aside width="300px">
          <div class="table-container">
            <pnl-date-table :stock="stock" :date="date"></pnl-date-table>
          </div>
          <div class="table-container">
            <pnl-code-table :stock="stock" :date="date"></pnl-code-table>
          </div>
        </el-aside>
        <el-main>
          <div class="main-box" v-if="isShow">
            <line-chart :chart-data="data" />
          </div>
          <div class="main-box" v-if="!isShow">
            <el-empty :image-size="200" :description="description"></el-empty>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import LineChart from './components/LineChart'
import PnlDateTable from './components/PnlDateTable'
import PnlCodeTable from './components/PnlCodeTable'
import { getTicks, getStockList, getPath, saveNewPath} from '@/api/tick'

export default {
  name: 'DashboardAdmin',
  components: {
    LineChart,
    PnlDateTable,
    PnlCodeTable
  },
  data() {
    return {
      title: '',
      data: {},
      isShow: false,
      description: '没有匹配到交易数据',
      formInline: {
        stock: 'SH600163 中闽能源',
        date: ''
      },
      formPath: {
        name: '',
        trdurl: ''
      },
      restaurants: [],
      state: '',
      timeout:  null,
      isShowUpload: false,
      stock: '',
      date: ''
    }
  },
  methods: {
    async getData(){
      if (this.formInline.stock && this.formInline.date) {
        let stock = this.formInline.stock.split(' ')[0],
            date = this.formInline.date;
        //const h = this.$createElement;
        const loading = this.$loading({
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        getTicks({stock, date}).then(response => {
          console.log('get all ticks',response)
          this.data = this.resetData(response)
          if (response.code === 20000) {
            let notFoundPath = '';
            if (response.tick_file_not_exist) {
              // this.data  = this.resetData(response.data);
              notFoundPath = response.tick_path;
              // this.$message({
              //   message: h('p', null, [
              //     h('span', null, response.tick_msg),
              //     h('i', { style: 'color: teal' }, response.tick_path)
              //   ]),
              //   duration: 2000
              // });
            }
            if (this.data.datas.length>0) {
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
    async goQuerySearch() {
      let searchStock = this.formInline.stock;
      const params = {
        querystr: searchStock.replace(/\s+/g,"")
      }
      const res = await getStockList(params)
      if (res.code === 20000 && res.stocks) {
        let stocks = res.stocks;
        let assiStocks = stocks.map(item=>{
          return {
            "value": item,
            "address": item.split(' ')[1]
          }
        })
        // return assiStocks;
        this.restaurants = assiStocks;
      } else {
        // return [];
        this.restaurants = [];
      }
    },
    async querySearchAsync(queryString, cb) {
      // var restaurants = await this.goQuerySearch();
      var results = queryString ? this.restaurants.filter(this.createStateFilter(queryString)) : this.restaurants;
      cb(results);
    },
    createStateFilter(queryString) {
      return (state) => {
        return (state.value.indexOf(queryString) >= 0);
      };
    },
    handleSelect(item) {
      this.getData();
      this.stock = item.value ? item.value.split(' ')[0] : '';
    },
    changeDate(item){
      this.getData();
      this.date = item
    },
    changeSearchType(value){
      this.isShowUpload = value
    },
    resetData(data){
      const objdata = {};
      let csvdata = data.tick_file_not_exist?[]:data.csvdata;
      this.title = data.tick_file_not_exist?'':data.csvdata[0].symbol;
      let datas = [],
      times = [],
      signals = [],
      exposures = [],
      markBuy1Arr = [],
      markSale1Arr = [],
      buy1 = [],
      pnls = [],
      sale1 = [];
      for (let i = 0; i < csvdata.length; i++) {
        let currObj = csvdata[i];
        //let priceArr = [currObj.mid,currObj.bid1,currObj.ask1,'--','--'];
        let t = currObj.time.substr(0,8);
        let signal = currObj.signal;
        datas.push(currObj.mid);
        times.push(t);
        signals.push(signal);
        exposures.push(currObj.exposure);
        buy1.push(currObj.bid1);
        sale1.push(currObj.ask1);
        pnls.push(currObj.pnl);
        // let color_green = 'rgb(0, 255, 0)',color_red = 'rgb(255, 0, 0)';
        // let color = color_red;
        if (currObj.direction == 1) {
           let mark = {'name': '买入', 'value': '买', 'xAxis': currObj.time.substr(0,8),'yAxis': currObj.bid1, 'itemStyle': {color: '#ef232a'}}
           markBuy1Arr.push(mark);
        }else if(currObj.direction == 2){
         let mark = {'name': '卖出', 'value': '卖', 'xAxis': currObj.time.substr(0,8),'yAxis': currObj.ask1, 'itemStyle': {color: '#5470c6'}}
           markSale1Arr.push(mark);
        }
      }

      objdata.datas = datas;
      objdata.times = times;
      objdata.signal = signals;
      objdata.exposure = exposures;
      objdata.markBuy1 = markBuy1Arr;
      objdata.markSale1 = markSale1Arr;
      objdata.buy1 = buy1;
      objdata.sale1 = sale1;
      objdata.pnl = pnls;
      objdata.formInline = this.formInline;
      return objdata;
    },
    getTickPath(){
      getPath().then((response) => {
        if (response.code === 20000) {
          let path = response.path.split("'")[1];
          let arr = path.split(";");
          this.formPath.name = arr[0].split('=')[1];
          this.formPath.trdurl = arr[1].split('=')[1];
        }
      })
    },
    onSubmit() {
      this.sendNewPath();
    },
    sendNewPath(){
      const params = {
        tickpath: this.formPath.name,
        trdpath: this.formPath.trdurl
      }
      saveNewPath(params).then((response) => {
        if (response.code === 20000) {
          this.$message({
            message: '修改地址成功',
            type: 'success',
            duration: 1000
          });
          this.changeSearchType(false);
          let path = response.newPath.split("'")[1];
          let arr = path.split(";");
          this.formPath.name = arr[0].split('=')[1];
          this.formPath.trdurl = arr[1].split('=')[1];
          setTimeout(()=>{
            this.getData()
          },100)
          
        }
      })
    }
  },
  created(){
    this.formInline.date = this.getTodayDate
    this.stock = this.formInline.stock ? this.formInline.stock.split(' ')[0] : '';
    this.date = this.formInline.date
  },
  mounted(){
    
    // this.getData()
    this.goQuerySearch()
    this.getTickPath()
    this.$nextTick(() => {
      this.getData();
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
.el-aside {
  color: #333;
  text-align: center;
  .table-container{
    height: 50%;
    width: 100%;
  }
}
.el-main {
  background-color: #E9EEF3;
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
