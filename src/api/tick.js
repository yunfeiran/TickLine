import request from '@/utils/request'

export function getTicks(data) {
  return request({
    url: '/tick/stat',
    method: 'post',
    data
  })
}

export function getSignalAnaly(data) {
  return request({
    url: '/tick/signalAnaly',
    method: 'post',
    data
  })
}

export function getStockList(stockStr) {
  return request({
    url: '/stocklist',
    method: 'get',
    params: stockStr 
  })
}

export function getPath() {
  return request({
    url: '/path',
    method: 'get'
  })
}

export function saveNewPath(params) {
  return request({
    url: '/editPath',
    method: 'get',
    params
  })
}

export function getDatePnl(data) {
  return request({
    url: '/tick/datePnl',
    method: 'post',
    data
  })
}

export function getStockPnl(data) {
  return request({
    url: '/tick/stockPnl',
    method: 'post',
    data
  })
}
