<template>
  <div v-click-outside="blurDate" class="date-field">
    <v-text-field
        :label="label"
        density="compact"
        variant="outlined"
        readonly
        hide-details
        :modelValue="date"
        @focus="focusDate"
    ></v-text-field>
    <div v-if="showDate" class="date-field__date">
      <vue-timepicker
          :value="yourStringTimeValue"
          ref="time"
          class="time"
          format="HH:mm:ss"
          @change="changeTime"
      />
      <v-date-picker
          locale="ru-in"
          v-model="modelValue"
          no-title
          @input="showDate = false"
      ></v-date-picker>
    </div>
  </div>

</template>
<script>
import moment from 'moment'
// import VueTimepicker from 'vue2-timepicker/src/vue-timepicker.vue'
// import VueTimepicker from 'vue-time-picker'
import VueTimepicker from '../components/Timepicker'
// Main JS (in UMD format)
// import VueTimepicker from 'vue2-timepicker'
// CSS
// import 'vue2-timepicker/dist/VueTimepicker.css'



export default {
  name: 'DateField',
  components: { VueTimepicker },
  props: {
    label: {
      type: String,
      required: true,
    },
    value: {
      type: Date,
      default: null
    },
  },
  data() {
    return {
      dateMenu: false,
      showDate: false,
      yourStringTimeValue: '00:00:00',
    };
  },
  mounted() {
    // const buttons = document.querySelectorAll('.vue__time-picker .dropdown ul li');
    // console.log(buttons)
    // buttons.forEach(button => button.removeAttribute('disabled'))
  },
  computed: {
    date() {
      return this.value && moment(this.value).format('MM.DD.YYYYTHH:mm:ss')
    },
    modelValue: {
      get() {
        return this.value;
      },
      set(val) {
        console.log(val)
        this.$emit('change', val);
      }
    }
  },
  methods: {
    focusDate() {
      if (!this.showDate) {
        this.showDate = true
      }
    },
    blurDate() {
      setTimeout(() => {
        if (this.showDate) {
          this.showDate = false
        }
      }, 200);
    },
    changeTime(data) {
      console.log(this.value);
      if (!this.value) return
      this.yourStringTimeValue = data.displayTime;
      const newDate = new Date(this.value);
      newDate.setHours(+data.data.HH);
      newDate.setMinutes(+data.data.mm);
      newDate.setSeconds(+data.data.ss);
      newDate.setMilliseconds(0);
      this.modelValue = newDate
    },
  },
};
</script>

<style lang="scss">
.date-field {
  position: relative;
  display: flex;
  justify-content: center;
  &__date {
    top: 120%;
    position: absolute;
    border: 1px solid #939393;
    border-radius: 4px;
    z-index: 100000;
    background: white;

    .time {
      margin-top: 10px;
    }

    .vue__time-picker .dropdown ul li[disabled] {
      //opacity: 1 !important;
    }
  }
}
</style>
