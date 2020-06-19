function formatTime (timestamp, format = 'yyyy-MM-dd HH:mm') {
  const formatNum = num => {
    return String(num).padStart(2, '0')
  }
  let now = new Date()
  timestamp = timestamp - now.getTimezoneOffset() * 60
  const date = new Date(timestamp)
  return format.replace(/yyyy/g, date.getFullYear())
    .replace(/MM/g, formatNum(date.getMonth() + 1))
    .replace(/dd/g, formatNum(date.getDate()))
    .replace(/HH/g, formatNum(date.getHours()))
    .replace(/mm/g, formatNum(date.getMinutes()))
    .replace(/ss/g, formatNum(date.getSeconds()))
    .replace(/SSS/g, formatNum(date.getMilliseconds()))
}

global.log = (...args) => {
  let list = args.map(data => {
    let logText = typeof data == 'string' ? data
    : JSON.stringify(data, null, 2)
    return logText
  })
  console.log(formatTime(+new Date(), '[yyyy-MM-dd HH:mm]'), ...list)
}