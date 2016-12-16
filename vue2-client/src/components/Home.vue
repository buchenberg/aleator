<template>
  <div class="home">
    <h2>Welcome</h2>
  </div>
</template>



<!--<script>
export default {
  name: 'home',
  data () {
    return {
      msg: 'Welcome',
      check: ''
    }
  },
  mounted () {
    this.fetchRoutes()
  },
  methods: {
    fetchRoutes () {
      this.$http.get('/proxy-healthcheck').then((response) => {
        this.check = response.body
      }, (response) => {
        console.log(response.json())
      })
    }
  }
}
</script>-->

