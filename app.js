

class DataDisplay {
  constructor() {
    this.covid_data_url = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv';
    this.desired_fips = '06001';
    this.data = [];

    const margin = {top: 10, right: 30, bottom: 30, left: 50};
    this.width = 460 - margin.left - margin.right;
    this.height = 400 - margin.top - margin.bottom;

    this.svg = d3.select("#my_dataviz")
      .append("svg")
      .attr("width", this.width + margin.left + margin.right)
      .attr("height", this.height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  }

  async load() {
    const rawdata = await fetch(this.covid_data_url).then(resp => resp.text());
    const lines = rawdata.split('\n');
    lines.shift(); // throw away header row.
    lines.forEach(line => {
      let [date, county, state, fips, cases, deaths] = line.split(',');
      if (fips == this.desired_fips) this.data.push({
        date: d3.timeParse("%Y-%m-%d")(date), cases: +cases, deaths: +deaths
      });
    });
  }



  display() {
    const xAxis = d3.scaleTime()
      .domain(d3.extent(this.data, d => d.date))
      .range([0, this.width]);

    this.svg.append("g")
      .attr("transform", `translate(0,${this.height})`)
      .call(d3.axisBottom(xAxis));

    const yAxis = d3.scaleLinear()
      .domain([0, d3.max(this.data, d => d.cases)])
      .range([this.height, 0]);

    this.svg.append("g")
      .call(d3.axisLeft(yAxis));

    var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Cases
    this.svg.append("path")
      .datum(this.data)
      .attr("fill", "#E0FFDB")
      .attr("stroke", "#4F8047")
      .attr("stroke-width", 1.5)
      .attr("d", d3.area()
        .x(d => xAxis(d.date))
        .y0(yAxis(0))
        .y1(d => yAxis(d.cases))
      )
      .on('mouseover', function (d, i) {
        d3.select(this).transition()
             .duration('50')
             .attr('opacity', '.85');
        div.transition()
             .duration(50)
             .style("opacity", 1);
        console.log(d3.event)
        div.html('thing')
             .style("left", (d3.event.pageX + 10) + "px")
             .style("top", (d3.event.pageY - 15) + "px");
   })
   .on('mouseout', function (d, i) {
        d3.select(this).transition()
             .duration('50')
             .attr('opacity', '1');
        div.transition()
             .duration('50')
             .style("opacity", 0);
   });

    // Deaths
    this.svg.append("path")
      .datum(this.data)
      .attr("fill", "#70806E")
      .attr("stroke", "#7ECC72")
      .attr("stroke-width", 1.5)
      .attr("d", d3.area()
        .x(d => xAxis(d.date))
        .y0(yAxis(0))
        .y1(d => yAxis(d.deaths))
      );
  }
}

document.addEventListener('DOMContentLoaded', async (event) => {
  const dd = new DataDisplay();
  await dd.load();
  dd.display();
});
