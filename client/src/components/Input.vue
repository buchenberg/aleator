<template>
  <div class="tokens">
    <h2>Input</h2>
    <form v-on:submit="postInput">
      <label for="input">Input</label>
      <textarea v-model="inputText" class="u-full-width" id="input"></textarea>
      <input class="button-primary" type="submit" value="Submit">
    </form>
    <p>{{ response }}</p>
  </div>
</template>
<script>
  export default {
    name: 'input',
    data () {
      return {
        inputText: '',
        reponseText: ''
      }
    },
    methods: {
      postInput () {
        this.$http.post('http://localhost:8081/api/input', this.inputText).then((response) => {
          this.responseText = response.json()
        }, (response) => {
          console.log(response.json())
        })
      }
    }
  }

</script>