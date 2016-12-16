<template>
  <div class="home">
    <h2>{{ random.content }}</h2>
  </div>
</template>

<script>
export default {
  name: 'random',
  data () {
    return {
      random: ''
    }
  },
  mounted () {
    this.fetchRandom()
  },
  methods: {
    fetchRandom () {
      this.$http.get('http://localhost:8081/api/random').then((response) => {
        this.random = response.body
      }, (response) => {
        console.log(response.json())
      })
    }
  }
}
</script>
