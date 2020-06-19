// websocket连接管理

const express = require('express')
const websocket = require('express-ws')
const protocols = require('./defines')
const { playerManager } = require('../player.js')


const router = express.Router()
websocket(router)

// id: websocet

class SocketManager {
  constructor () {
    this.playerMap = new Map()
    this.wsMap = new Map()
    this.id = Math.random()
    this.initProtocol()
  }

  initProtocol () {
    for (let protocol in protocols) this[protocol] = protocols[protocol]
  }

  removePlayer (ws) {
    const pid = this.wsMap.get(ws)
    this.wsMap.delete(ws)
    this.playerMap.delete(pid)
  }

  login (ws, token) {
    playerManager.loadPlayerByToken(token).then(data => {
      let pid = data.info.id
      if (this.playerMap.has(pid)) {
        let oldWs = this.playerMap.get(pid)
        // 踢下线
        this.send(pid, this.S2C_LOG_OUT)
        this.removePlayer(oldWs)
      }
      this.playerMap.set(pid, ws)
      this.wsMap.set(ws, pid)
      log('login~~~~~~~~~')
      this.send(pid, this.S2C_LOGIN, data)
    })
  }

  logout (ws) {
    this.removePlayer(ws)
  }

  syncGameState () {
    log('syncGameState')
  }

  send (pid, protocol, data) {
    const ws = this.playerMap.get(pid)
    if (!ws) return
    const params = { protocol, data }
    ws.send(JSON.stringify(params))
  }

  callbackList () {
    return {
      [this.C2S_LOGIN]: this.login,
      [this.C2S_LOGOUT]: this.logout,
      [this.C2S_FIVE_IN_A_ROW]: this.fiveInARow
    }
  }

  fiveInARow (ws, data) {
    let pid = this.wsMap.get(ws)
    require('../games/five-in-a-row').receiveData(pid, data)
  }
}

const socketManager = new SocketManager()
const callbackList = socketManager.callbackList()

router.ws('/', function (ws) {
  ws.on('message', function (msg) {
    log(socketManager.playerMap.size, socketManager.wsMap.size, msg, socketManager.id)
    for (let [pid, m] of socketManager.playerMap) {
      log(pid, m == ws, 1)
    }
    for (let [m, pid] of socketManager.wsMap) {
      log(pid, m == ws, 2)
    }
    const params = JSON.parse(msg)
    log('----------收到消息----------')
    log(params)
    log('----------消息结束----------')
    const { protocol, data } = params
    callbackList[protocol] && callbackList[protocol].call(socketManager, ws, data)
  })

  ws.on('error', function () {
    log('error')
    socketManager.logout()
    ws.close()
  })

  ws.on('close', function () {
    log('close')
    socketManager.logout(ws)
  })
})
module.exports = {
  router,
  socketManager
}
