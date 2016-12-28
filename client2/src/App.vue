<template>
  <div id="app" class="container">
    <div class="row">
      <div class="heading twelve columns">
        <h1>Aleator</h1>
        <div class="line-separator"></div>
      </div>
    </div>
    <div class="row">
        <nav class="two columns">
          <ul class="main-navigation" role="navigation">
            <li>
              <router-link to="home">Home</router-link>
            </li>
            <li>
              <router-link to="/random">Random</router-link>
            </li>
            <li>
              <router-link to="/tokens">Tokens</router-link>
            </li>
          </ul>
        </nav>
        <section class="ten columns">
        <router-view></router-view>
        </section>
    </div>
  </div>
</template>

<style src="./assets/css/normalize.css"></style>
<style src="./assets/css/skeleton.css"></style>
<style src="./assets/css/style.css"></style>
