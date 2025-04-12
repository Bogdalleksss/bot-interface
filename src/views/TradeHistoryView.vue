<template>
  <div class="page">
      <div class="title">
        <h1>История торгов</h1>
        <p>Total Profit: {{ dataTrades.profit.toFixed(2) }}$</p>
        <p>Win Rate: {{ dataTrades.winRate.toFixed(2) }}%</p>
        <p>Avg Spread: {{ dataTrades.avgSpread.toFixed(2) }}%</p>
        <p>Avg Land Time: {{ dataTrades.avgLandTime.toFixed(2) }}s</p>
        <v-btn
          variant="flat"
          color="green"
          @click="exportTable"
        >
          Экпортировать табилцу
        </v-btn>
      </div>
      <div class="filters">
        <v-select
            v-model="arbType"
            label="Тип арбитража"
            :items="['Все', 'Прямой', 'Обратный']"
            variant="outlined"
        ></v-select>
        <v-select
            v-model="selectedCoinsFilter"
            label="Монеты"
            :items="coinsSelectList"
            multiple
            variant="outlined"
        >
          <template v-slot:selection="{ item, index }">
            <v-chip v-if="index < 1">
              <span>{{ item.title }}</span>
            </v-chip>
            <span
                v-if="index === 1"
                class="text-grey text-caption align-self-center"
            >
              (+{{ selectedCoinsFilter.length - 1 }} others)
            </span>
          </template>
        </v-select>
        <v-select
            v-model="selectedMarketsFilter"
            label="Биржа"
            :items="marketsSelectList"
            multiple
            variant="outlined"
        >
          <template v-slot:selection="{ item, index }">
            <v-chip v-if="index < 1">
              <span>{{ item.title }}</span>
            </v-chip>
            <span
                v-if="index === 1"
                class="text-grey text-caption align-self-center"
            >
              (+{{ selectedMarketsFilter.length - 1 }} others)
            </span>
          </template>
        </v-select>
        <DateField
            :value="dateFrom"
            @change="(val) => dateFrom = val"
            label="Дата от"
        />
        <DateField
            :value="dateTo"
            @change="(val) => dateTo = val"
            label="Дата до"
        />
        <v-menu :close-on-content-click="false">
          <template v-slot:activator="{ props }">
            <v-btn
                icon="mdi-sort-reverse-variant"
                variant="outlined"
                rounded="xs"
                width="56px"
                height="56px"
                v-bind="props"
            />
          </template>

          <v-list>
            <v-btn-toggle class="filters-group" v-model="filter">
              <v-btn>По увеличению даты</v-btn>
              <v-btn>По уменьшению даты</v-btn>
              <v-divider></v-divider>
              <v-btn>По увеличению объема</v-btn>
              <v-btn>По уменьшению объема</v-btn>
              <v-divider></v-divider>
              <v-btn>По увеличению профита</v-btn>
              <v-btn>По уменьшению профита</v-btn>
              <v-divider></v-divider>
              <v-btn>По увеличению спреда</v-btn>
              <v-btn>По уменьшению спреда</v-btn>
              <v-divider></v-divider>
              <v-btn>По увеличению времени ленда</v-btn>
              <v-btn>По уменьшению времени ленда</v-btn>
              <v-divider></v-divider>
              <v-btn>По увеличению времени ордера</v-btn>
              <v-btn>По уменьшению времени ореда</v-btn>
            </v-btn-toggle>
          </v-list>
        </v-menu>
      </div>

      <div class="list">
        <div v-if="!tradesSorted.length" class="list-notfound">
          <p v-if="isSettedFilters">Нет по заданным параметрам ордеров</p>
          <p v-else>Ордеров нет</p>
          <v-btn
            v-if="isSettedFilters"
            rounded="lg"
            variant="outlined"
            color="blue"
            @click="clearFilters"
          >
            Очистить фильтры
          </v-btn>
        </div>
        <div v-else>
          <div class="list__trade head">
            <h2>Монета</h2>
            <h2>Биржа</h2>
            <h2>Дата</h2>
            <h2>Тип арбитража</h2>
            <h2>Объем</h2>
            <h2>Профит</h2>
            <h2>Спред</h2>
            <h2>Время ленда</h2>
            <h2>Время ордера</h2>
          </div>
          <div class="list__trade" v-for="trade in tradesSorted" :key="trade._id">
            <h3>{{ trade.token }}</h3>
            <h3>{{ trade.market }}</h3>
            <h3 class="date">{{ getFormatTime(trade.timestamp) }}</h3>
            <h3>
              <a target="_blank" :href="`https://solscan.io/tx/${trade.txid}`">
                {{ trade.type === 'default' ? 'Прямой' : 'Обратный' }}
              </a>
            </h3>
            <h3>{{ trade.size.toFixed(2) }}</h3>
            <h3>{{ trade.profit.toFixed(2) }}</h3>
            <h3>{{ trade.spread.toFixed(2) }}</h3>
            <h3>{{ trade.land_time }}</h3>
            <h3>{{ trade.order_time }}</h3>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import DateField from "@/components/DateField";
import axios from 'axios'
import moment from "moment";
import XLSX from "xlsx";

export default {
  components: { DateField },
  data() {
    return {
      dateFrom: new Date(),
      dateTo: null,
      filter: null,
      arbType: null,
      trades: [],
      selectedCoinsFilter: [],
      selectedMarketsFilter: [],
    }
  },
  async mounted() {
    await this.fetchTrades()
    await this.watchTrades()

    const now = new Date();
    this.dateFrom = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0, 0, 0
    );
  },
  computed: {
    isSettedFilters() {
      return this.dateFrom || this.dateTo
    },
    dataTrades() {
      const trades = [...this.tradesFilters];
      let profit = 0
      let avgSpread = 0
      let avgLandTime = 0

      let profitCount = 0
      let lossCount = 0

      if (trades.length) {
        trades.forEach(trade => {
          profit += trade.profit
          avgSpread += trade.spread
          if (trade.land_time !== '-') avgLandTime += trade.land_time

          if (trade.profit > 0) profitCount += 1
          else if (trade.profit <= 0) lossCount += 1
        })
      }

      const totalCount = profitCount + lossCount;
      const winRate = (profitCount / totalCount) * 100;

      return {
        profit: profit || 0,
        avgSpread: (avgSpread / trades.length) || 0,
        avgLandTime: (avgLandTime / trades.length) || 0,
        winRate: winRate || 0
      }
    },
    avgSpread() {
      return (this.tradesFilters.reduce((acc, val) => acc += val.spread) / this.tradesFilters.length)
    },
    coinsSelectList() {
      const coins = this.trades.map(i => i.token)
      return [...new Set(coins)];
    },
    marketsSelectList() {
      const markets = this.trades.map(i => i.market)
      return [...new Set(markets)];
    },
    tradesFilters() {
      return this.trades.filter(trade => {
        const dateTo = new Date(this.dateTo).getTime()
        const dateFrom = new Date(this.dateFrom).getTime()
        const conditions = []
        const typeArb = {
          'Прямой': 'default',
          'Обратный': 'reverse',
        }

        if (dateTo) conditions.push(dateTo > trade.timestamp)
        if (dateFrom) conditions.push(dateFrom < trade.timestamp)
        if (this.selectedCoinsFilter.length) conditions.push(this.selectedCoinsFilter.includes(trade.token))
        if (this.selectedMarketsFilter.length) conditions.push(this.selectedMarketsFilter.includes(trade.market))
        if (this.arbType && this.arbType.toLowerCase() !== 'все') {
          conditions.push(typeArb[this.arbType] === trade.type)
        }

        return !conditions.length || conditions.reduce((acc, val) => acc *= val)
      }).sort((a, b) => b.timestamp - a.timestamp)
    },
    tradesSorted() {
      switch (this.filter) {
        case 0: // Увелечение даты
          return [...this.tradesFilters].sort((a, b) => a.timestamp - b.timestamp)
        case 1: // уменьшение даты
          return [...this.tradesFilters].sort((a, b) => b.timestamp - a.timestamp)
        case 2: // увел объема
          return [...this.tradesFilters].sort((a, b) => a.size - b.size)
        case 3: // умен объема
          return [...this.tradesFilters].sort((a, b) => b.size - a.size)
        case 4: // увел профита
          return [...this.tradesFilters].sort((a, b) => a.profit - b.profit)
        case 5: // умен профита
          return [...this.tradesFilters].sort((a, b) => b.profit - a.profit)
        case 6: // увел спреда
          return [...this.tradesFilters].sort((a, b) => a.spread - b.spread)
        case 7: // умен спреда
          return [...this.tradesFilters].sort((a, b) => b.spread - a.spread)
        case 8: // увел врем ленда
          return [...this.tradesFilters].sort((a, b) => a.land_time - b.land_time)
        case 9: // умен врем ленда
          return [...this.tradesFilters].sort((a, b) => b.land_time - a.land_time)
        case 10: // увел врем ордера
          return [...this.tradesFilters].sort((a, b) => a.order_time - b.order_time)
        case 11: // умен врем ордера
          return [...this.tradesFilters].sort((a, b) => b.order_time - a.order_time)
        default:
          return this.tradesFilters
      }
    }
  },
  methods: {
    async fetchTrades() {
      try {
        const { data } = await axios.get('http://185.233.187.84:3000/trades')
        this.trades = data;
      } catch (e) {
        console.error('Error fetchTrades:', e);
      }
    },
    watchTrades() {
      setInterval(async () => {
        await this.fetchTrades()
      }, 10000)
    },
    clearFilters() {
      this.dateFrom = null
      this.dateTo = null
    },
    getFormatTime(date) {
      return moment(date).format('DD.MM.YYYY HH:mm:ss.SSS')
    },
    exportTable() {
      const trades = [...this.tradesFilters]

      const rows = trades.map(trade => ({
        'Монета': trade.token,
        'Биржа': trade.market,
        'Дата': this.getFormatTime(trade.timestamp),
        'Тип арбитража': trade.type === 'default' ? 'Прямой' : 'Обратный',
        'Объем': trade.size,
        'Профит': trade.profit.toFixed(2),
        'Спред': trade.spread.toFixed(2),
        'Время ленда': trade.land_time,
        'Время ордера': trade.order_time,
      }))

      console.log(rows);

      const worksheet = XLSX.utils.json_to_sheet(rows);

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Dates");

      XLSX.writeFile(workbook, "trades.xlsx", { compression: true });
    }
  }
}
</script>

<style lang="scss">
.title {
  button {
    margin-top: 8px;
    margin-bottom: 12px;
  }
}

.filters-group {
  flex-direction: column;
  height: auto !important;
  //
  button {
    height: 28px !important;
    margin-top: 2px;
    margin-bottom: 2px;
    margin-left: 2px;
    margin-right: 2px;
    text-transform: none;
    letter-spacing: normal;
    font-size: 12px;
  }
}

.filters {
  position: relative;
  display: grid;
  width: 70%;
  justify-content: center;
  margin: 16px auto 0;
  gap: 12px;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 56px;

  .v-input__control {
    height: 61px;
    overflow: hidden;
    padding-top: 5px;
  }

  .v-field__append-inner {
    height: 56px;
  }

  .v-btn--icon {
    border-radius: 8px;
    margin-top: 5px;
    opacity: 46%;
  }
}

.list {
  width: 70%;
  margin: 32px auto 0;

  &-notfound {
    margin-top: 64px;

    p {
      opacity: 60%;
      margin-bottom: 18px;
    }
  }

  &__trade {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    gap: 12px;
    margin-bottom: 10px;

    &.head {
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid #000;
    }

    h3 {
      min-width: 100px;
      font-size: 14px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;

      &.date {
        line-height: 16px;
      }
    }

    a {
      text-decoration: none;
    }

    h2 {
      min-width: 100px;
      font-size: 16px;
      text-align: center;
      font-weight: bold;
      line-height: 18px;
      display: flex;
      align-items: center;
    }
  }
}
</style>
