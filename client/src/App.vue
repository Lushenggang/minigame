<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>


<style lang="stylus">
#app
  font-family Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50

body
  margin 0

.user-avatar
  display inline-block
  text-align center
  .avatar, .username
    margin 0 auto
  .avatar
    width 45px
    height 45px
    border-radius 50%
    box-shadow 0 0 10px 0 rgba(0, 0, 0, .1)
  .username
    margin-top 5px
    font-size 14px
</style>



