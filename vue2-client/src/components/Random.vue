<template>
  <div class="random">
    <section class="pagehead">
      <h2>{{ message }}</h2>
    </section>
    <!--<button v-on:click="clearRandom" class="u-pull-right">Clear</button>-->
    <!--<p>The {{ counter }} sentences below are randomishly generated.</p>-->
    <p>{{ random }}</p>
  </div>
</template>


<script>
export default {
  name: 'random',
  data () {
    return {
      message: 'Wait for it...',
      random: '',
      counter: 0
    }
  },
  mounted () {
    this.fetchRandom()
  },
  methods: {
    fetchRandom () {
      let vm = this
      setInterval(function () {
        vm.$http.get('http://localhost:8081/api/random').then((response) => {
          vm.counter++
          vm.random += response.body.content
          if (vm.counter === 1) vm.message = vm.random
          if (vm.counter > 0 && vm.counter < 45) {
            vm.random += ' '
          } else {
            vm.counter = 0
            vm.random = ''
          }
        }, (response) => {
          console.log(response.json())
        })
      }, 2000)
    },
    clearRandom () {
      let vm = this
      vm.counter = 0
      vm.random = ''
      clearInterval()
    }
  }
}
</script>
