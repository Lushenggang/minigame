<template>
  <div class="game-page">
    <div
      v-for="(info, camp) in model.players"
      :class="`player-info ${avatarPos[camp]}`"
      :key="camp">
      <div class="user-avatar">
        <div
          :style="{ background: info.avatar }"
          class="avatar">
        </div>
        <div class="right">
          <div class="username">
            {{ info.username }}
            [{{ camp == CAMP_WHITE ? '白棋' : '黑棋' }}]
          </div>
          <div class="state">
            步时：{{ camp == model.camp ? `${restTime}` : `${STEP_TIME}` }}
          </div>
        </div>
      </div>
      <div class="camp-info">
      </div>
    </div>
    <div class="board-container">
      <div class="board-inner">
        <div>
          <div
            class="row"
            v-for="row of ROWS"
            :style="{
              top: `calc(100% / ${ROWS - 1} * ${row - 1})`
            }"
            :key="row">
          </div>
        </div>
        <div>
          <div
            class="col"
            v-for="col of COLS"
            :style="{
              left: `calc(100% / ${COLS - 1} * ${col - 1})`
            }"
            :key="col">
          </div>
        </div>
        <div>
          <template v-for="(points, row) of model.points">
            <div
              @click.stop="clickPoint(row, col)"
              v-for="(point, col) of points"
              :key="`${row}-${col}`"
              :style="{
                top: `calc(100% / ${ROWS - 1} * ${row})`,
                left: `calc(100% / ${COLS - 1} * ${col})`,
                width: `calc(100% / ${COLS - 1} * .7)`,
                height: `calc(100% / ${COLS - 1} * .7)`
              }"
              :class="{
                point: true,
                white: model.points[row][col] == CAMP_WHITE,
                black: model.points[row][col] == CAMP_BLACK,
                none: !model.points[row][col],
                'last-step': model.lastStep[0] == row && model.lastStep[1] == col
              }">
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  ROWS,
  COLS,
  CAMP_WHITE,
  CAMP_BLACK,
  C2S_ENTER_GAME,
  C2S_LEAVE_GAME,
  C2S_GAME_ACTION,
  S2C_GAME_INFO,
} from './defines'

const STEP_TIME = 30

export default {
  data () {
    return {
      ROWS,
      COLS,
      CAMP_WHITE,
      CAMP_BLACK,
      STEP_TIME,
      timer: 0,
      restTime: 30,
      model: {
        points: [],
        win: 0,
        camp: CAMP_BLACK,
        players: {},
        lastStep: [],
        stepTime: 0
      }
    }
  },
  computed: {
    white () {
      const { players } = this.model
      if (!players[CAMP_WHITE]) return null
      return players[CAMP_WHITE]
    },
    black () {
      const { players } = this.model
      if (!players[CAMP_BLACK]) return null
      return players[CAMP_BLACK]
    },
    id () {
      return this.$route.params.id
    },
    user () {
      return this.$store.getters['user/info']
    },
    avatarPos () {
      let data = {
        [CAMP_BLACK]: 'top',
        [CAMP_WHITE]: 'bottom',
      }
      if (this.user && this.user.id == this.model.players[CAMP_BLACK].id) {
        data = {
          [CAMP_WHITE]: 'top',
          [CAMP_BLACK]: 'bottom',
        }
      }
      return data
    },
    // 是玩家
    inGame () {
      if (!this.user) return false
      return Object.values(this.model.players).includes(this.user.id)
    },
  },
  watch: {
    'model.camp': {
      immediate: true,
      handler () {
        console.log('hello', this.model.win)
        this.timer && clearInterval(this.timer)
        if (this.model.win) return
        this.restTime = 30
        this.timer = setInterval(() => {
          console.log('timer')
          this.restTime = this.restTime - 1
          if (this.restTime <= 0) {
            clearInterval(this.timer)
            this.timer = 0
            // 超时
          }
        }, 1000)

      }
    }
  },
  created () {
    this.enterGame()
  },
  methods: {
    enterGame () {
      this.$parent.sendData(C2S_ENTER_GAME, { gameId: this.id })
    },

    getGameInfo (data) {
      for (let key in this.model) {
        this.model[key] = data[key]
      }
    },

    receiveData (protocol, data) {
      console.log('get', protocol, data)
      let map = {
        [S2C_GAME_INFO]: this.getGameInfo
      }
      map[protocol] && map[protocol](data)
    },
    clickPoint (x, y) {
      this.$parent.sendData(C2S_GAME_ACTION, { gameId: this.id, x, y })
    }
  }
}
</script>

<style lang="stylus" scoped>
.game-page
  display flex
  flex-direction column
  justify-content center
  height 100vh
  background #a77558
  .player-info
    flex auto
    display flex
    align-items center
    color #fff
    padding 0 40px
    .user-avatar
      display flex
      align-items center
      .username
        margin 0 5px
    &.top
      order 1
    &.bottom
      justify-content flex-end
      order 3
      .user-avatar
        .avatar
          order 1

  .board-container
    align-self center
    height 90vmin
    background #d7b598
    width 90vmin
    max-width 400px
    max-height 400px
    position relative
    order 2
    .board-inner
      position absolute
      left 24px
      right 24px
      top 24px
      bottom 24px
      counter-reset row, col
      .row, .col, .point
        position absolute
      .row
        left 0
        right 0
        // border-bottom 1px solid black
        box-shadow 0 0 0 .5px black
        counter-increment row
        &::before
          content counter(row)
          position absolute
          font-size 12px
          left -1.8em
          top -.4em
          width 1em
          text-align right
      .col
        top 0
        bottom 0
        // border-left 1px solid black
        box-shadow 0 0 0 .5px black
        counter-increment col
        &::before
          content counter(col, upper-latin)
          position absolute
          font-size 12px
          top -1.6em
          left -.4em
          line-height 1
      .point
        border-radius 50%
        transform translate(-50%, -50%)
        cursor pointer
        &.white
          background #fff
        &.black
          background #000
        &.none
          // border 1px solid red
        &.last-step
          box-shadow 0 0 0 2px #FFA710

</style>