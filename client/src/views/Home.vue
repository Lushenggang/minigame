<template>
  <div class="page-home">
    <div class="project-title">Node.js(express) + Vue.js全栈练手项目展示</div>
    <div class="account">
      <div class="notify">系统随机生成了帐号：</div>
      <user></user>
    </div>
    <div class="project-list">
      <div
        class="project"
        v-for="(project, idx) of projectList"
        @click.stop="clickProject(project.route)"
        :key="idx">
        {{ project.title }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      projectList: [
        {
          title: '五子棋',
          route: 'FiveInARow'
        }
      ]
    }
  },
  methods: {
    clickProject (name) {
      this.$router.push({ name })
    }
  }
}
</script>

<style lang="stylus" scoped>
.page-home
  .account
    margin 20px 0 40px
    .notify
      margin-bottom 10px
  .project-list
    display flex
    justify-content center
    .project
      width 95vw
      max-width 25rem
      height 4rem
      border-radius 8px
      line-height 4rem
      border 1px solid #eee
      cursor pointer
      user-select none
      &:hover
        background #f2f2f2
</style>