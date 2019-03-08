import { getDateHistogram, getFormatTypes, getValueFunction, processData, tabifyResponseHandler, showGraph, showTable } from './utils';

export const CohortVisualizationProvider = () => {
  return class CohortVisualization {
    containerClassName = 'cohort-container';
    margin = { top: 20, right: 20, bottom: 40, left: 50 };

    constructor(el, vis) {
      this.vis = vis;
      this.el = el;

      this.container = document.createElement('div');
      this.container.className = this.containerClassName;
      this.el.appendChild(this.container);
    }

    async render(esResponse) {
      if (!this.container) return;
      this.container.innerHTML = '';

      const visData = tabifyResponseHandler(esResponse);

      if (!(Array.isArray(visData.tables) && visData.tables.length) || this.el.clientWidth === 0 || this.el.clientHeight === 0) {
        return;
      }

      const dateHistogram = getDateHistogram(this.vis);
      const formatTimeFn = getFormatTypes(dateHistogram);
      const data = processData(visData, dateHistogram);

      if (!data.length) return;

      const valueFn = getValueFunction(this.vis.params);

      const width = this.el.offsetWidth - this.margin.left - this.margin.right;
      const height = this.el.offsetHeight - this.margin.top - this.margin.bottom;
      const allWidth = this.el.offsetWidth;
      const allHeight = this.el.offsetHeight;
      const measures = { width, height, margin: this.margin, allWidth, allHeight };

      if (this.vis.params.table) {
        showTable(this.vis.params.mapColors, dateHistogram, this.container, data, valueFn, formatTimeFn);
      } else {
        showGraph(this.vis.params.percentual, this.container, measures, data, valueFn, formatTimeFn);
      }
    }

    destroy() {
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }
  };
};
