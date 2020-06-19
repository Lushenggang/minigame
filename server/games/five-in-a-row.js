const { playerManager } = require('../player')
const socketManager = require('../socket').socketManager

const ROWS = 15
const COLS = 15
const CAMP_WHITE = 1
const CAMP_BLACK = 2

const C2S_ENTER_HALL = 1
const C2S_LEAVE_HALL = 2
const C2S_GAME_ACTION = 3
const C2S_WATCH_GAME = 4
const C2S_JOIN_QUEUE = 5
const C2S_LEAVE_QUEUE = 6
const C2S_ENTER_GAME = 7
const C2S_LEAVE_GAME = 8

const S2C_SYNC_LIST = 1
const S2C_MATCHED = 2
const S2C_GAME_INFO = 3

const STATE_NONE = 0
const STATE_WAITING = 1
const STATE_PLAYING = 2
const STATE_WATCHING = 3
const STEP_TIME = 60


class CGameManager {

  constructor () {
    this.gameList = new Map()
    this.playerList = new Map()
    this.gameId = 0
  }

  // 同步到前端的信息

  enterHall (pid) {
    let player = playerManager.getPlayer(pid)
    if (!player) return
    this.playerList.set(pid, STATE_NONE)
    player.enterGame(this)
    this.syncList()
  }

  leaveHall (pid) {
    this.playerList.delete(pid)
  }

  enterQueue (pid) {
    this.playerList.set(pid, STATE_WAITING)
    this.checkMatch()
  }

  leaveQueue (pid) {
    this.playerList.set(pid, STATE_NONE)
  }

  enterGame (pid, game) {
    this.playerList.set(pid, STATE_PLAYING)
    this.sendData(pid, S2C_MATCHED, game.id)
  }

  leaveGame (pid) {
    this.playerList.set(pid, STATE_NONE)
  }

  watchGame (pid, gameId) {
    const game = this.gameList.get(gameId)
    if (!game) return
    game.watch(pid)
    this.playerList.set(pid, STATE_WATCHING)
  }

  createGame (pid1, pid2) {
    const game = new CGame(pid1, pid2, ++this.gameId)
    this.gameList.set(this.gameId, game)
    this.enterGame(pid1, game)
    this.enterGame(pid2, game)
    game.syncGame()
    this.syncList()
  }

  checkMatch () {
    console.log('check-match')
    const list = this.getPlayerList(STATE_WAITING)
    while (list.length >= 2) {
      this.createGame(list.shift(), list.shift())
    }
  }

  getPlayerList (...stateList) {
    const list = []
    for (let [pid, state] of this.playerList) {
      stateList.includes(state) && list.push(pid)
    }
    return list
  }

  syncList () {
    console.log(this.playerList.keys())
    const data = this.info()
    const list = this.getPlayerList(STATE_NONE, STATE_WAITING)
    list.forEach(pid => this.sendData(pid, S2C_SYNC_LIST, data))
    
  }

  info () {
    const list = []
    for (let [ gameId, game ] of this.gameList) list.push(game.info())
    return {
      list,
      members: this.playerList.size
    }
  }

  sendData (pid, protocol, data) {
    socketManager.send(pid, socketManager.S2C_FIVE_IN_A_ROW, {
      protocol,
      data
    })
  }

  receiveData (pid, { protocol, data }) {
    console.log(protocol, pid, '~~~~')
    const map = {
      [C2S_ENTER_HALL]: this.enterHall,
      [C2S_LEAVE_HALL]: this.leaveHall,
      [C2S_JOIN_QUEUE]: this.enterQueue,
      [C2S_LEAVE_QUEUE]: this.leaveQueue,
      [C2S_WATCH_GAME]: this.watchGame,
    }
    if (map[protocol]) {
      map[protocol].call(this, pid, data)
    } else if (data) {
      let gameId = data.gameId
      let game = this.gameList.get(gameId)
      console.log(this.gameList, gameId, game)
      game && game.receiveData.call(game, protocol, pid, data)
    }
  }

}

const manager = new CGameManager()

class CGame {
  constructor (pid1, pid2, id) {
    this.id = id
    this.players = {
      [CAMP_BLACK]: pid1,
      [CAMP_WHITE]: pid2
    }
    this.points = []
    this.lastStep = []
    this.camp = CAMP_BLACK
    this.win = 0
    this.watcherList = []
    this.initPoints()
    this.stepTime = +new Date()
    this.timer = 0
    this.winText = ''
  }

  initPoints () {
    for (let i = 0; i < ROWS; i++) {
      this.points[i] = []
      for (let j = 0; j < COLS; j++) {
        this.points[i][j] = 0
      }
    }
  }
  
  action (x, y) {
    if (this.points[x][y]) return
    if (this.win) return
    this.points[x][y] = this.camp
    this.judge(x, y, this.camp)
    this.timer && clearTimeout(this.timer)
    let currentCamp = this.camp
    this.timer = setTimeout(() => {
      this.win = currentCamp
      this.syncGame()
    }, STEP_TIME * 1000)
    this.camp = this.camp == CAMP_WHITE ? CAMP_BLACK : CAMP_WHITE
    this.lastStep = [x, y]
    this.stepTime = +new Date()
    this.syncGame()
  }
  
  syncGame () {
    const data = this.info()
    const list = this.playersInGame()
    list.forEach(pid => {
      manager.sendData(pid, S2C_GAME_INFO, data)
    })
  }

  info () {
    const { points, win, camp, players, lastStep } = this
    const playerInfo = {}
    for (let key in players) {
      playerInfo[key] = playerManager.getPlayer(players[key]).info()
    }
    let stepTime = STEP_TIME * 1000 - (new Date() - this.stepTime)
    return {
      points,
      win,
      camp,
      players: playerInfo,
      lastStep,
      stepTime
    }
  }

  judge (x, y, camp) {
    if (this.win) return
    let lines = this.getPointLines(x, y)
    for (let line of lines) {
      let count = 0
      for (let p of line) {
        if (p != camp) {
          count = 0
          continue
        }
        if (++count >= 5) {
          this.win = camp
          return
        }
      }
    }
  }

  getPointLines (x, y) {
    let row = [], col = [], left = [], right = []
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        if (x - i === y - j) {
          right.push(this.points[i][j])
        }
        if (x - i === j - y) {
          left.push(this.points[i][j])
        }
        if (x == i) {
          col.push(this.points[i][j])
        }
        if (y == j) {
          row.push(this.points[i][j])
        }
      }
    }
    return [row, col, left, right]
  }

  enterGame (pid) {
    console.log(this.players, '~~~~~~~~~~')
    let pList = Object.values(this.players)
    if (!pList.includes(pid)) {
      manager.watchGame(pid, this.id)
      !this.watcherList.includes(pid) && this.watcherList.push(pid)
    }
    console.log('enterGame', pid)
    this.syncGame()
  }

  leaveGame (pid) {
    let pList = Object.values(this.players)
    if (pList.includes(pid)) {
      this.playerLeave(pid)
    } else {
      let idx = this.watcherList.indexOf(pid)
      idx >= 0 && this.watcherList.splice(idx, 1)
      manager.enterHall(pid)
    }
    this.syncGame()
  }

  playersInGame () {
    return [...Object.values(this.players), ...this.watcherList]
  }

  playerLeave (pid) {
    for (let key in this.players) {
      if (this.players[key] == pid) {
        delete this.players[key]
        break
      }
    }
    if (!Object.keys(this.players).length) {
      manager.removeGame(this)
    }
  }
  watch (pid) {
    if (this.watcherList.includes(pid)) break
    this.watcherList.push(pid)
  }

  recieveAction (pid, { x, y }) {
    if (this.players[this.camp] != pid) return
    this.action(x, y)
  }
  
  receiveData (protocol, pid, data) {
    const map = {
      [C2S_WATCH_GAME]: this.watch,
      [C2S_GAME_ACTION]: this.recieveAction,
      [C2S_ENTER_GAME]: this.enterGame,
      [C2S_LEAVE_GAME]: this.leaveGame
    }
    map[protocol] && map[protocol].call(this, pid, data)
  }
}

module.exports = manager
