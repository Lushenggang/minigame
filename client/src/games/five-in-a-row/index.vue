<template>
  <router-view ref="child"></router-view>
</template>

<script>
const C2S_ENTER_HALL = 1
const C2S_LEAVE_HALL = 2

const S2C_SYNC_LIST = 1
const S2C_GAME_INFO = 2

export default {
  created () {
    this.socket.addEventListener(this.socket.S2C_FIVE_IN_A_ROW, this.receiveData)
    console.log('C2S')
    this.sendData(C2S_ENTER_HALL)
  },
  beforeDestroy () {
    this.socket.removeEventListener(this.socket.S2C_FIVE_IN_A_ROW)
  },
  methods: {
    receiveData ({ protocol, data }) {
      this.$refs.child && this.$refs.child.receiveData && this.$refs.child.receiveData(protocol, data)
    },
    sendData (protocol, data) {
      this.socket.send(this.socket.C2S_FIVE_IN_A_ROW, { protocol, data })
    }
  }
}
</script>