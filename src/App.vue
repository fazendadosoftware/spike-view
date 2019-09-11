<template>
  <div id="app" class="flex flex-col h-screen bg-gray-300">
    <div class="flex justify-center p-5">
      <select v-model="selectedFactSheetType" class="p-2 shadow border outline-none font-bold">
        <option v-for="factSheetType in factSheetTypes" :key="factSheetType.key" :value="factSheetType.key">
          {{factSheetType.value}}
        </option>
      </select>
    </div>
    <div class="overflow-hidden">
      <div class="flex flex-wrap justify-center overflow-auto h-full">
        <div
          v-for="factSheet in dataset"
          :key="factSheet.id"
          :style="getFactSheetStyle(factSheet.id)"
          class="bg-white ml-3 mb-3 p-2 rounded shadow">
          {{factSheet.name}}
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'app',
  data: () => ({
    dataset: [],
    legendItems: [],
    viewMapping: {},
    factSheetTypes: [],
    selectedFactSheetType: ''
  }),
  methods: {
    getFactSheetStyle (id) {
      const legendId = this.viewMapping[id]
      const legend = this.legendItems[legendId + 1] || {}
      const { bgColor, color, transparency } = legend
      return `background: ${bgColor}; color: ${color}; opacity: ${transparency}`
    },
    updateView (view) {
      const { legendItems, mapping } = view
      this.legendItems = legendItems
      this.viewMapping = mapping
        .reduce((accumulator, factSheetMapping) => {
          const { fsId, legendId } = factSheetMapping
          accumulator[fsId] = legendId
          return accumulator
        }, {})
    }
  },
  watch: {
    // generates a reportConfiguration object and updates the customReport configuration
    selectedFactSheetType (factSheetType) {
      const reportConfiguration = {
        allowEditing: false,
        allowTableView: false,
        facets: [
          {
            key: factSheetType,
            label: this.factSheetTypes.find(({ key }) => factSheetType === key).value,
            fixedFactSheetType: factSheetType,
            attributes: ['name'],
            callback: dataset => { this.dataset = dataset }
          }
        ],
        reportViewFactSheetType: factSheetType,
        reportViewCallback: view => this.updateView(view)
      }
      this.$lx.updateConfiguration(reportConfiguration)
    }
  },
  created () {
    this.$lx.init()
      .then(reportSetup => {
        const { settings } = reportSetup
        const { translations, dataModel } = settings
        const { factSheets } = dataModel
        const { factSheetTypes } = translations

        // we build a list of the available factSheetTypes in our workspace
        this.factSheetTypes = Object.keys(factSheets)
          .map(factSheetType => ({ key: factSheetType, value: factSheetTypes[factSheetType] }))
          .sort((A, B) => A.value > B.value ? 1 : A.value < B.value ? -1 : 0)

        // We set the default factSheetType as the first item of the factSheetType list
        const defaultFactSheetType = this.factSheetTypes[0]
        const { key, label } = defaultFactSheetType

        // We initialize the report configuration with the default factSheet type
        // this configuration is updated whenever the selectedFactSheetType changes
        this.$lx.ready({
          facets: [
            {
              key,
              label,
              fixedFactSheetType: key
            }
          ],
          reportViewFactSheetType: key,
          reportViewCallback: view => this.updateView(view)
        })
        this.selectedFactSheetType = defaultFactSheetType.value
      })
  }
}
</script>
<style lang="stylus">
#app
  font-family 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing antialiased
  -moz-osx-font-smoothing grayscale
  text-align center
  color #2c3e50
</style>
