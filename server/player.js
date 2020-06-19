const { v4: uuid } = require('uuid')
const db = require('./db/models/index')
const { encrypt, decrypt } = require('./crypto.js')

class CPlayerManager {
  constructor () {
    this.playerList = {}
  }

  getToken (pid) {
    return encrypt(`${pid}`)
  }

  getPid (token) {
    let pid
    try {
      pid = +decrypt(token)
    } catch (error) {
      console.log('decrypt', error)
    }
    return pid
  }

  loadPlayerByToken (token) {
    let pid = this.getPid(token)
    return this.loadPlayer(pid)
  }

  loadPlayer (pid) {
    let player = pid && this.playerList[pid]
    return player ? Promise.resolve(player.loginData()) : db.sequelize.transaction(() => {
      let promise = pid ? db.user.findByPk(pid).then(u => u || this.createPlayer()) : this.createPlayer()
      return promise.then(data => {
        let player = new CPlayer(data)
        this.playerList[data.id] = player
        return {
          token: this.getToken(player.id),
          info: player.info()
        }
      })
    })
  }

  createPlayer () {
    let red = Math.floor(Math.random() * 255)
    let green = Math.floor(Math.random() * 255)
    let blue = Math.floor(Math.random() * 255)
    console.log('hello')
    return db.user.create({
      username: `游客${uuid().slice(0, 6)}`,
      avatar: `rgb(${red}, ${green}, ${blue})`
    })
  }

  getPlayer (pid) {
    return pid && this.playerList[pid]
  }
}

const manager = new CPlayerManager()

class CPlayer {
  constructor (data) {
    this.id = data.id
    this.playerInfo = data
    this.watched = new Map()
    this.gameList = new Map()
  }
  info () {
    const { username, avatar, id } = this.playerInfo
    return { username, avatar, id }
  }
  loginData () {
    return {
      token: manager.getToken(this.id),
      info: this.info()
    }
  }
  enterGame (game) {
    this.gameList.set(game)
  }
  leaveGame (game) {
    game.playerLeave && game.playerLeave(pid)
    this.gameList.delete(game)
  }
}

module.exports = {
  playerManager: manager
}