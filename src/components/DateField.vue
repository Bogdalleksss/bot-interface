<template>
  <div v-click-outside="blurDate" class="date-field">
    <v-text-field
        max-width="210px"
        :label="label"
        variant="outlined"
        readonly
        hide-details
        :modelValue="date"
        @focus="focusDate"
    ></v-text-field>
    <div v-if="showDate" class="date-field__date">
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

export default {
  name: 'DateField',
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
    };
  },
  computed: {
    date() {
      return this.value && moment(this.value).format('MM.DD.YYYY')
    },
    modelValue: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('change', val);
      }
    }
  },
  methods: {
    focusDate() {
      // setTimeout(() => {
        if (!this.showDate) {
          this.showDate = true
        }
      // }, 200);
    },
    blurDate() {
      setTimeout(() => {
        if (this.showDate) {
          this.showDate = false
        }
      }, 200);
    },
  },
};
</script>

<style lang="scss">
.date-field {
  position: relative;
  display: flex;
  justify-content: center;
  width: 210px;
  &__date {
    top: 120%;
    position: absolute;
    border: 1px solid #939393;
    border-radius: 4px;
    z-index: 100000;
  }
}
</style>
