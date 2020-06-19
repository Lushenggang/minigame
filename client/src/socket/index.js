
import protocols from './defines'
import { WS_URL } from '@/config'
import * as tool from '@/tool'
import store from '@/store'

class CWebsocket {
  constructor () {
    this.socket = null
    this.socketPromise = null
    this.resolve = null
    this.listenerList = {}
    this.initProtocol()
    this.initEvent()
    this.initSocket()
  }

  initSocket (time = 0) {
    if (this.socket) {
      this.socket.onopen = null
      this.socket.onmessage = null
      this.socket.onerror = null
      this.socket.close()
      this.socket = null
      this.resolve = null
    }
    this.socketPromise = new Promise((resolve, reject) => {
      this.resolve = resolve
      setTimeout(() => {
        this.socket = new WebSocket(WS_URL)
        this.socket.onopen = () => {
          this.login()
        }
        this.socket.onerror = error => {
          console.log(error)
          if (error.target != this.socket) return
          console.log('error', error, new Date())
          this.initSocket(5)
        }
        this.socket.onmessage = msg => {
          this.receiveMessage(msg)
        }
        // this.socket.onclose = () => {
        //   console.log('close')
        //   this.initSocket(5)
        // }
      }, time * 1000)
    })
  }

  initProtocol () {
    for (let protocol in protocols) this[protocol] = protocols[protocol]
  }

  initEvent () {
    this.addEventListener(this.S2C_LOGIN, this.loginSuccess.bind(this))
  }

  login () {
    let userId = tool.getToken()
    this.send(this.C2S_LOGIN, userId, true)
  }

  loginSuccess ({ token, info }) {
    if (this.resolve) {
      console.log('resolved')
      this.resolve()
      this.resolve = null
    }
    console.log('loginSuccess')
    tool.setToken(token)
    store.commit('user/setInfo', info)
  }

  receiveMessage (msg) {
    let params = JSON.parse(msg.data)
    console.log('-----------收到消息-------------')
    console.log(JSON.stringify(params, undefined, 2))
    console.log('-----------消息结束-------------')
    let { protocol, data } = params
    let funcList = this.listenerList[protocol]
    funcList && funcList.forEach(func => func(data))
  }

  send (protocol, data, isLogin = false) {
    let params = JSON.stringify({ protocol, data })
    if (this.socket) {
      let { readyState, CLOSED, CLOSING } = this.socket
      if (readyState == CLOSED || readyState == CLOSING) this.initSocket(0)
    }
    isLogin ? this.socket.send(params) : this.socketPromise.then(() => {
      this.socket.send(params)
    })
  }

  addEventListener (protocol, func) {
    if (!this.listenerList[protocol]) {
      this.listenerList[protocol] = []
    }
    this.listenerList[protocol].push(func)
  }
  removeEventListener (protocol, func) {
    if (!func) {
      this.listenerList[protocol] = undefined
      return
    }
    if (!this.listenerList[protocol]) return
    const index = this.listenerList.findIndex(func)
    index !== -1 && this.listenerList[protocol].splice(index, 1)
  }
}

export default new CWebsocket()
