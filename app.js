const axios = require('axios')
const Core = require('@alicloud/pop-core');
console.log('start print env info ====')
console.log({
  accessKeyId: process.env.ACCESS_KEY,
  accessKeySecret: process.env.SECRET_KEY,
})
console.log('=========== \n')
const client = new Core({
  accessKeyId: process.env.ACCESS_KEY,
  accessKeySecret: process.env.SECRET_KEY,
  endpoint: 'https://alidns.aliyuncs.com',
  apiVersion: '2015-01-09'
});

const requestOption = {
  method: 'POST'
};

const recordId = '20704900814693376'

const params = (value) => ({
  DomainName: process.env.DOMAIN,
  RR: '@',
  Type: 'A',
  recordId,
  value,
})


let _ip = ''
const schedule = require('node-schedule');
const action = async () => {
  try {
    const res = await axios.get('http://www.pubyun.com/dyndns/getip')
    const ip = res.data.trim()
    if (/^(\d+).(\d+).(\d+).(\d+)$/.test(ip) && _ip !== ip) {
      _ip = ip
      console.log(`update ddns with ip ${_ip}`)
      const updateRes = await client.request('UpdateDomainRecord', params(_ip), requestOption)
      console.log(JSON.stringify(updateRes))
    }
  } catch (error) {
    console.log(error)
  }
}

let j

const task = ()=>{
  action()
  // 每小时开始的时候做任务
  j = schedule.scheduleJob('0 0 * * * *', ()=>{
    action()
  }); 
}

task()

process.on('exit', () => {
  if (j) {
    j.cancel()
  }
})