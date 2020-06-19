<script>
import {
  CAMP_WHITE,
  CAMP_BLACK,
  C2S_JOIN_QUEUE,
  C2S_LEAVE_QUEUE,
  S2C_SYNC_LIST,
  S2C_MATCHED
} from './defines'

export default {
  data () {
    return {
      members: 0,
      gameList: [],
      matchTime: 0,
      timer: 0,
      CAMP_WHITE,
      CAMP_BLACK,
    }
  },
  methods: {
    receiveData (protocol, data) {
      console.log('receiveData')
      if (protocol == S2C_SYNC_LIST) {
        this.members = data.members
        this.gameList = data.list
      } else if (protocol == S2C_MATCHED) {
        this.enterGame(data)
      }
    },
    match () {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = 0
        this.matchTime = 0
        this.$parent.sendData(C2S_JOIN_QUEUE)
      } else {
        this.$parent.sendData(C2S_LEAVE_QUEUE)
        this.matchTime = 0
        this.timer = setInterval(() => {
          this.matchTime++
        }, 1000)
      }
    },
    enterGame (data) {
      console.log('匹配成功')
      this.$router.push({ name: 'FiveInARowGame', params: { id: data } })
    }
  }
}
</script>

<template>
  <div class="game-list">
    <div class="list">
      <div
        class="game"
        v-for="(game, idx) of this.gameList"
        :key="idx">
        <div class="user-avatar">
          <div class="avatar" :style="{ background: game.players[CAMP_WHITE].avatar }"></div>
          <div class="username">{{ game.players[CAMP_WHITE].username }}</div>
        </div>
        <div>VS</div>
        <div class="user-avatar">
          <div class="avatar" :style="{ background: game.players[CAMP_BLACK].avatar }"></div>
          <div class="username">{{ game.players[CAMP_WHITE].username }}</div>
        </div>
      </div>
    </div>
    <div class="btn-container">
      <div class="btn" @click.stop="match">
        {{ timer ? `正在匹配对手(${matchTime}s)` : '开始匹配' }}
      </div>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
.game-list
  height 100vh
  display flex
  flex-direction column
  .list
    flex auto
    overflow auto
    background #d7b598
    padding 20px 10px
    .game
      background #fff
      display flex
      align-items center
      justify-content space-between
      padding 10px 40px
      border-radius 8px
      margin 10px
      background #f2f2f2
      &:hover
        background #eee
  .btn-container
    flex-shrink 0
    padding 30px 25px 20px
    user-select none
    background linear-gradient(#ddd, #fff)
    .btn
      border-radius 50px
      line-height 2.5
      background linear-gradient(to right,rgba(99, 188, 255, 1), rgba(54, 125, 255, 1))
      color #fff
      font-size 18px
      transition transform .3s ease-out
      max-width 400px
      margin 0 auto
      &:active
        transform scale(.95)
</style>
