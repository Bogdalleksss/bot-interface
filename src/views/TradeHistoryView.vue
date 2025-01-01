<template>
  <div class="page">
      <div class="title">
        <h1>История торгов</h1>
        <p>Total Profit: {{ dataTrades.profit.toFixed(2) }}$</p>
        <p>Total Spread: {{ dataTrades.avgSpread.toFixed(2) }}%</p>
        <v-btn
          variant="flat"
          color="green"
          @click="exportTable"
        >
          Экпортировать табилцу
        </v-btn>
      </div>
      <div class="filters">
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
      </div>

      <div class="list">
        <div v-if="!tradesFilters.length" class="list-notfound">
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
          <div class="list__trade" v-for="trade in tradesFilters" :key="trade._id">
            <h3>{{ trade.token }}</h3>
            <h3>{{ trade.market }}</h3>
            <h3>{{ getFormatTime(trade.timestamp) }}</h3>
            <h3>{{ trade.type === 'default' ? 'Прямой' : 'Обратный' }}</h3>
            <h3>{{ trade.size }}$</h3>
            <h3>{{ trade.profit.toFixed(2) }}$</h3>
            <h3>{{ trade.spread.toFixed(2) }}%</h3>
            <h3>{{ trade.land_time }}s</h3>
            <h3>{{ trade.order_time }}s</h3>
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
      dateFrom: null,
      dateTo: null,
      trades: []
    }
  },
  async mounted() {
    const { data } = await axios.get('http://localhost:3000/trades')
    this.trades = data;
  },
  computed: {
    isSettedFilters() {
      return this.dateFrom || this.dateTo
    },
    dataTrades() {
      const trades = [...this.tradesFilters];
      let profit = 0
      let avgSpread = 0

      if (trades.length) {
        trades.forEach(trade => {
          profit += trade.profit
          avgSpread += trade.spread
        })
      }

      return {
        profit: profit || 0,
        avgSpread: (avgSpread / trades.length) || 0
      }
    },
    avgSpread() {
      return (this.tradesFilters.reduce((acc, val) => acc += val.spread) / this.tradesFilters.length)
    },
    tradesFilters() {
      return this.trades.filter(trade => {
        const dateTo = new Date(this.dateTo).getTime()
        const dateFrom = new Date(this.dateFrom).getTime()
        const conditions = []

        if (dateTo) conditions.push(dateTo > trade.timestamp)
        if (dateFrom) conditions.push(dateFrom < trade.timestamp)

        return !conditions.length || conditions.reduce((acc, val) => acc *= val)
      })
    }
  },
  methods: {
    clearFilters() {
      this.dateFrom = null
      this.dateTo = null
    },
    getFormatTime(date) {
      return moment(date).format('MM.DD.YYYY')
    },
    exportTable() {
      const trades = [...this.tradesFilters]

      const rows = trades.map(trade => ({
        'Монета': trade.token,
        'Биржа': trade.market,
        'Дата': this.getFormatTime(trade.timestamp),
        'Тип арбитража': trade.type === 'default' ? 'Прямой' : 'Обратный',
        'Объем': trade.size + '$',
        'Профит': trade.profit.toFixed(2) + '$',
        'Спред': trade.spread.toFixed(2) + '%',
        'Время ленда': trade.land_time + 's',
        'Время ордера': trade.order_time + 's',
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

.filters {
  position: relative;
  display: flex;
  width: 100%;
  justify-content: center;
  margin-top: 16px;
  gap: 12px;
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

    &.head {
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid #000;
    }

    h3 {
      min-width: 100px;
      font-size: 14px;
      text-align: center;
    }
    h2 {
      min-width: 100px;
      font-size: 16px;
      text-align: center;
      font-weight: bold;
      line-height: 18px;
    }
  }
}
</style>
