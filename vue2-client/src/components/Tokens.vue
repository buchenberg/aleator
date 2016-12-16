<template>
  <div class="tokens">
    <h2>Tokens</h2>
    <table class="u-full-width">
      <thead>
        <tr>
          <th>ID</th>
          <th>Word</th>
          <th>POS</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(token, key) in tokens">
          <td>{{ key }}</td>
          <td>{{ token.word }}</td>
          <td>{{ token.pos }}</td>
        </tr>
      </tbody>
    </table>
    <!--<div v-for="routeArray in value">
        <h4>Routes</h4>
          <table class="u-full-width">
            <thead>
              <tr>
                <th>ID</th>
                <th>Word</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="route in routeArray">
                <td>{{ route.method.toUpperCase() }}</td>
                <td>{{ route.path }}</td>
              </tr>
            </tbody>
          </table>
      </div>-->
  </div>
</template>
<script>
  export default {
    name: 'tokens',
    data () {
      return {
        tokens: []
      }
    },
    mounted () {
      this.fetchTokens()
    },
    methods: {
      fetchTokens () {
        this.$http.get('http://localhost:8081/api/token').then((response) => {
          this.tokens = response.body
        }, (response) => {
          console.log(response.json())
        })
      }
    }
  }

</script>
