<template>
  <div id="sudoko">
    <div class="sudoku-wrapper">
      <div class="sudoku-table">
        <div class="sudoku-row" v-for="i in 9" :key="i">
          <div class="sudoku-cell" v-for="j in 9" :key="j" @click="select(j - 1, i - 1)">
            <div class="help-grid" v-if="!cells[i - 1][j - 1] && helpers[i - 1][j - 1]">
              <div
                v-for="k in 9"
                :key="k"
                class="help-grid-cell"
                :class="{ hide: !helpers[i - 1][j - 1].includes(k) }"
              >
                <svg height="100%" width="100%" viewBox="0 0 24 24">
                  <text x="51%" y="60%" dominant-baseline="middle" text-anchor="middle">{{ k }}</text>
                </svg>
              </div>
            </div>
            <div
              class="cell-value"
              :class="[
                { fixed: isFixed(j - 1, i - 1) },
                {
                  selected: isSelected(j - 1, i - 1),
                  helper:
                    isSelected(j - 1, i - 1) &&
                    helperOn &&
                    !cells[i - 1][j - 1],
                },
                { marked: isMarked(j - 1, i - 1) },
                { highlight: isHighlighted(j - 1, i - 1) },
                { warning: isWarning(j - 1, i - 1) },
              ]"
            >
              <svg height="100%" width="100%" viewBox="0 0 24 24">
                <text
                  x="50%"
                  y="55%"
                  dominant-baseline="middle"
                  text-anchor="middle"
                >{{ cells[i - 1][j - 1] | cellValue }}</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="controls">
      <div v-for="i in controlsText.length" :key="i" @click="controlClick(i - 1)">
        <svg height="100%" width="100%" font-size="7" viewBox="0 0 24 24" :class="helperClass(i)">
          <rect v-if="i === 3" x="0" y="8" rx="2" ry="2" width="24" height="10" style="fill:#fff;" />
          <rect v-if="i === 5" x="3" y="8" rx="2" ry="2" width="18" height="10" style="fill:#fff;" />
          <text
            x="50%"
            y="55%"
            dominant-baseline="middle"
            text-anchor="middle"
          >{{ controlsText[i - 1] }}</text>
        </svg>
      </div>
    </div>
    <div class="numpad">
      <div v-for="i in 9" :key="i" @click="numpadClick(i)">
        <svg height="100%" width="100%" font-size="20" viewBox="0 0 24 24">
          <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle">{{ i }}</text>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
import sudoku from "sudoku";

export default {
  name: "Sudoku",

  created() {
    this.game = localStorage.getItem("game");
    this.solution = localStorage.getItem("solution");

    if (!this.game || !this.solution) {
      this.newGame();
    } else {
      this.resumeGame();
    }

    document.onkeydown = e => {
      let num = e.keyCode;
      if (num === 32) {
        this.helperOn = !this.helperOn;
      } else if (num > 36 && num < 41) {
        this.moveSelected(num);
      } else {
        num = num < 58 ? num - 48 : num - 96;
        if (num > -1 && num < 10) {
          if (this.helperOn) {
            this.submitHelper(num, this.xCoor, this.yCoor);
          } else {
            this.submitNumber(num, this.xCoor, this.yCoor);
          }
        }
      }
    };
  },
  data() {
    return {
      xCoor: -1,
      yCoor: -1,
      selected: -1,
      marked: [],
      highlighted: [],
      warnings: [],
      game: null,
      solution: null,
      cells: [],
      helpers: [],
      controlsText: ["undo", "erase", "notes", "hint", "pro", "new"],
      helperOn: false,
      proOn: false,
      history: [],
      isLocked: true
    };
  },
  filters: {
    cellValue(val) {
      return val ? (val.length === 2 ? val.slice(1) : val) : "";
    }
  },
  computed: {
    helperClass() {
      return val =>
        val === 3
          ? { controlOn: this.helperOn }
          : val === 5
          ? { controlOn: this.proOn }
          : null;
    },
    isFixed() {
      return (x, y) => this.game.charAt(x + y * 9) !== "0";
    },
    isSelected() {
      return (x, y) => {
        return this.selected === x + y * 9;
      };
    },
    isMarked() {
      return (x, y) => !this.proOn && this.marked.includes(x + y * 9);
    },
    isHighlighted() {
      return (x, y) => !this.proOn && this.highlighted.includes(x + y * 9);
    },
    isWarning() {
      return (x, y) => !this.proOn && this.warnings.includes(x + y * 9);
    }
  },
  methods: {
    newGame() {
      this.isLocked = true;

      this.generateGame().then(() => {
        this.cells = [];
        this.helpers = [];

        let str = this.game;
        while (str.length) {
          this.cells.push(
            str
              .slice(0, 9)
              .split("")
              .map(Number)
          );
          str = str.slice(9);
          this.helpers.push([0, 0, 0, 0, 0, 0, 0, 0, 0]);
        }

        this.marked = [];
        this.highlighted = [];
        this.warnings = [];
        this.history = [];

        this.xCoor = -1;
        this.yCoor = -1;
        this.selected = -1;

        localStorage.setItem("game", this.game);
        localStorage.setItem("solution", this.solution);
        localStorage.setItem("cells", JSON.stringify(this.cells));
        localStorage.setItem("helpers", JSON.stringify(this.helpers));
        localStorage.setItem("history", JSON.stringify(this.history));
        localStorage.setItem("coorXY", this.xCoor + ":" + this.xCoor);

        this.isLocked = false;
      });
    },
    generateGame() {
      return new Promise(resolve => {
        let game = sudoku.makepuzzle();
        this.solution = sudoku
          .solvepuzzle(game)
          .map(el => (el === null ? 0 : el + 1))
          .join("");
        this.game = game.map(el => (el === null ? 0 : el + 1)).join("");
        resolve();
      });
    },
    resumeGame() {
      this.marked = [];
      this.highlighted = [];
      this.warnings = [];

      this.history = JSON.parse(localStorage.getItem("history"));
      this.cells = JSON.parse(localStorage.getItem("cells"));
      this.helpers = JSON.parse(localStorage.getItem("helpers"));

      let pos = localStorage.getItem("coorXY");
      if (pos) {
        pos = pos.split(":");
        this.xCoor = +pos[0];
        this.yCoor = +pos[1];
        this.select(+pos[0], +pos[1]);
      }

      this.helperOn = JSON.parse(localStorage.getItem("helperOn"));
      this.proOn = JSON.parse(localStorage.getItem("proOn"));

      this.isLocked = false;
    },
    mark(val) {
      if (val === 0) {
        this.marked = [];
        return;
      }

      let arr = this.cells.map((el, y) =>
        el
          .map((el2, x) => (el2 === val ? x + y * 9 : null))
          .filter(el => el != null)
      );
      this.marked = [].concat(...arr);
    },
    highlight(x, y) {
      const set = new Set();
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          set.add(i + j * 3 + y * 9);
          set.add(x + (i + 3 * j) * 9);
          set.add(Math.floor(x / 3) * 3 + Math.floor(y / 3) * 27 + i + j * 9);
        }
      }
      return [...set];
    },
    select(x, y) {
      if (x < 0 || y < 0) {
        return;
      }
      this.xCoor = x;
      this.yCoor = y;
      this.selected = x + y * 9;

      this.mark(this.cells[this.yCoor][this.xCoor]);
      this.highlighted = this.highlight(this.xCoor, this.yCoor);

      localStorage.setItem("coorXY", x + ":" + y);
    },
    moveSelected(num) {
      let x = this.xCoor;
      let y = this.yCoor;

      if (num === 39) {
        x = x === 8 ? 0 : x + 1;
      } else if (num === 37) {
        x = x === 0 ? 8 : x - 1;
      } else if (num === 40) {
        y = y === 8 ? 0 : y + 1;
      } else if (num === 38) {
        y = y === 0 ? 8 : y - 1;
      }
      this.select(x, y);
    },
    submitNumber(num, x, y, history) {
      if (x < 0 || y < 0 || this.isLocked) {
        return;
      }
      if (!history) {
        this.history.push(this.cells[y][x] + "N" + x + String(y));
        localStorage.setItem("history", JSON.stringify(this.history));
      }
      if (this.game.charAt(x + y * 9) !== "0") {
        return;
      }

      const newRow = [...this.cells[y]];
      newRow[x] = num;
      this.$set(this.cells, y, newRow);
      localStorage.setItem("cells", JSON.stringify(this.cells));

      this.mark(this.cells[y][x]);
      this.checkNumPosition(x + y * 9);
      [...this.warnings].map(el => this.checkNumPosition(el));
      this.checkHelpPosition(x + y * 9);
    },
    submitHelper(num, x, y, history) {
      if (x < 0 || y < 0 || this.isLocked) {
        return;
      }
      if (history !== true) {
        this.history.push(
          num + (history === "check" ? "h" : "H") + x + String(y)
        );
        localStorage.setItem("history", JSON.stringify(this.history));
      }
      if (this.game.charAt(x + y * 9) !== "0") {
        return;
      }
      const newRow = [...this.helpers[y]];
      if (!newRow[x]) {
        newRow[x] = [];
      }
      if (newRow[x] && newRow[x].includes(num)) {
        newRow[x].splice(newRow[x].indexOf(num), 1);
      } else {
        newRow[x].push(num);
      }
      this.$set(this.helpers, y, newRow);

      localStorage.setItem("helpers", JSON.stringify(this.helpers));
    },
    // regionArr(x, y) {
    //   const arr = [];
    //   const region = Math.floor(x / 3) + 3 * Math.floor(y / 3);
    //   const first = ((region * 3) % 9) + 27 * Math.floor(region / 3);
    //   for (let i = 0; i < 3; i++) {
    //     for (let j = 0; j < 3; j++) {
    //       arr.push(first + j + i * 9);
    //     }
    //   }
    //   return arr;
    // },
    cell(num) {
      return this.cells[(num - (num % 9)) / 9][num % 9];
    },
    helper(num) {
      return this.helpers[(num - (num % 9)) / 9][num % 9];
    },
    checkNumPosition(pos) {
      const num = this.cell(pos);
      if (num === 0) {
        this.warnings.splice(this.warnings.indexOf(pos), 1);
        return;
      }
      const highlight = this.highlight(pos % 9, (pos - (pos % 9)) / 9);
      let arr = highlight.filter(el => this.cell(el) === num);
      if (arr.length > 1) {
        this.warnings = [...new Set([...this.warnings, ...arr])];
      } else if (this.warnings.includes(pos)) {
        this.warnings.splice(this.warnings.indexOf(pos), 1);
      }
    },
    checkHelpPosition(pos) {
      const num = this.cell(pos);
      this.highlighted.forEach(el => {
        if (this.helper(el) && this.helper(el).includes(num)) {
          this.submitHelper(num, el % 9, (el - (el % 9)) / 9, "check");
        }
      });
    },
    controlClick(val) {
      if (this.isLocked) {
        return;
      }
      switch (val) {
        case 0:
          // undo button
          if (this.history.length) {
            let arr, brr;
            let str = this.history.pop();
            localStorage.setItem("history", JSON.stringify(this.history));

            if (str.indexOf("N") > -1) {
              arr = str.split("N");
              brr = arr[1].split("");
              this.submitNumber(+arr[0], +brr[0], +brr[1], true);
            } else if (str.toUpperCase().indexOf("H") > -1) {
              arr = str.toUpperCase().split("H");
              brr = arr[1].split("");
              this.submitHelper(+arr[0], +brr[0], +brr[1], true);

              if (str.indexOf("h") > -1) {
                this.controlClick(0);
              }
            }
          }
          break;
        case 1:
          // erase button
          this.submitNumber(0, this.xCoor, this.yCoor);
          break;
        case 2:
          // notes button
          this.helperOn = !this.helperOn;
          localStorage.setItem("helperOn", this.helperOn);
          break;
        case 3: {
          // hint button
          let pos = this.xCoor + this.yCoor * 9;
          let num = this.solution.charAt(pos);
          this.submitNumber(+num, this.xCoor, this.yCoor);
          this.game =
            this.game.substring(0, pos) + num + this.game.substring(pos + 1);

          localStorage.setItem("game", this.game);
          break;
        }
        case 4:
          // pro button
          this.proOn = !this.proOn;
          localStorage.setItem("proOn", this.proOn);
          break;
        case 5:
          // new button
          this.newGame();
          break;
      }
    },
    numpadClick(val) {
      if (this.helperOn) {
        this.submitHelper(val, this.xCoor, this.yCoor);
      } else {
        this.submitNumber(val, this.xCoor, this.yCoor);
      }
    }
  }
};
</script>

<style scoped>
.numpad,
.controls {
  display: flex;
  flex-direction: row;
  width: 100%;
  max-width: 500px;
  cursor: pointer;
  background-color: #fff;
}

.numpad div {
  width: 11.11%;
  height: 70px;
  line-height: 0;
  /* border: 1px solid #bec6d4; */
  border-right: none;
}

/* .numpad div:nth-child(9) {
  border: 1px solid #bec6d4;
} */

.controls div {
  width: 25%;
  height: 70px;
  line-height: 0;
  border-right: none;
}

@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap");

#sudoko {
  display: inline-block;
  font-family: "Inter", sans-serif;
  font-weight: 300;
  fill: #344861;
  padding: 10px 10px;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  user-select: none;
}

.sudoku-wrapper {
  position: relative;
  display: flex;

  width: 100%;
  max-width: 500px;
  padding: 10px 0;
}

.sudoku-wrapper:after {
  content: "";
  display: block;
  padding-bottom: 100%;
}

.sudoku-table {
  flex-grow: 1;
  background-color: #fff;
  border: 2px solid black;
  cursor: pointer;
}

.sudoku-row {
  display: flex;
  width: 100%;
  height: 11.11%;
}

.sudoku-cell {
  position: relative;
  width: 11.11%;
  border-right: 1px solid rgb(52, 72, 97, 0.7) /*#bec6d4*/;
  border-bottom: 1px solid rgb(52, 72, 97, 0.7) /*#bec6d4*/;
  box-sizing: border-box;
}

.sudoku-cell:hover {
  background-color: #ddeeff;
}

.sudoku-cell:nth-child(3n) {
  border-right: 2px solid #344861;
}

.sudoku-cell:nth-child(9) {
  border-right: none;
}

.sudoku-row:nth-child(3n + 3) .sudoku-cell {
  border-bottom: 2px solid #344861;
}

.sudoku-row:nth-child(9) .sudoku-cell {
  border-bottom: none;
}

.cell-value {
  height: 100%;
  font-size: 18px;
  line-height: 0;
  fill: #4a90e2;
}

.help-grid {
  position: absolute;
  display: flex;
  flex-wrap: wrap;
  top: 0;
  width: 100%;
  height: 100%;
}

.help-grid-cell {
  width: 33%;
  height: 33%;
  line-height: 0;
  font-size: 18px;
  fill: #768595;
}

.controlOn rect {
  fill: #4a90e2 !important;
}

.controlOn text {
  font-weight: 500;
  fill: #fff;
}

.hide {
  opacity: 0;
}

.highlight {
  background-color: #e2e7ed;
}

.selected {
  background-color: #bbdefb !important;
}

.helper {
  margin: 1px;
  height: calc(100% - 2px);
  border: 1px solid #4a90e2;
  box-sizing: border-box;
}

.fixed {
  border: none;
  fill: #344861 !important;
}

.marked {
  background-color: #cbdbed;
}

.warning {
  fill: #fb3d3f;
  background-color: #f7cfd6;
}
</style>
