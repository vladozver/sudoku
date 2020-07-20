<template>
  <div id="app">
    <!-- <Rainbow /> -->
    <Header />
    <Sudoku />
  </div>
</template>

<script>
import Header from "./components/header";
import Sudoku from "./components/sudoku";

export default {
  name: "App",
  components: { Header, Sudoku /*, Rainbow*/ },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap");

body {
  margin: 0;
}

#app {
  font-family: "Inter", sans-serif;
  color: #333;
  text-align: center;
}

#sudoku {
  padding-top: 20px !important;
}
</style>
<template>
  <div id="app">
    <!-- <Rainbow /> -->
    <Header />
    <Sudoku />
  </div>
</template>

<script>
import Header from "./components/header";
import Sudoku from "./components/sudoku";
// import Rainbow from "./components/rainbow";

export default {
  name: "App",
  components: { Header, Sudoku /*, Rainbow*/ },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap");

body {
  margin: 0;
}

#app {
  font-family: "Inter", sans-serif;
  color: #333;
  text-align: center;
}

#sudoku {
  padding-top: 20px !important;
}
</style>
