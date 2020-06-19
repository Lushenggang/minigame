<template>
  <div v-if="user" class="user-avatar">
    <slot :detail="user">
      <div class="avatar" :style="{
        background: user.avatar
      }">
      </div>
      <div class="username">{{ user.username }}</div>
    </slot>
  </div>
</template>

<script>
export default {
  props: ['id'],
  computed: {
    user () {
      let { getters } = this.$store
      return this.id ? null : getters['user/info']
    }
  }
}
</script>
