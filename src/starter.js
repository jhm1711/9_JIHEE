import * as d3 from "d3";
import "./viz.css";

////////////////////////////////////////////////////////////////////
////////////////////////////  Init  ///////////////////////////////
// svg

const svg = d3.select("#svg-container").append("svg").attr("id", "svg");

let width = parseInt(d3.select("#svg-container").style("width"));
let height = parseInt(d3.select("#svg-container").style("height"));

const margin = { top: 25, right: 20, bottom: 60, left: 70 };

// parsing & formatting
const formatXAxis = d3.format("~s");

// scale
const xScale = d3.scaleLog().range([margin.left, width - margin.right]);
const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);
const radiusScale = d3.scaleSqrt().range([0, 55]);
////55는 원하는 대로 바꿔도 됨
const colorScale = d3
  .scaleOrdinal()
  .range(["#ffabf3", "#c5d0ed", "#ed00ca", "#0709a6"]);

// axis
const xAxis = d3
  .axisBottom(xScale)
  .tickFormat((d) => formatXAxis(d))
  .tickValues([500, 1000, 2000, 4000, 8000, 16000, 32000, 64000]);

const yAxis = d3.axisLeft(yScale).ticks(5);

const tooltip = d3
  .select("#svg-container")
  .append("div")
  .attr("class", "tooltip");

// svg elements

////////////////////////////////////////////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////
// data
let data = [];
let region;
let circles;
let legendRects;
let legendLabels;
let xAxisText;
let yAxisText;

let europeSelected = false;
let africaSelected = false;
let usSelected = false;
let singaporeSelected = false;

d3.csv("data/gapminder_combined.csv").then((raw_data) => {
  data = raw_data.map((d) => {
    d.population = parseInt(d.population);
    d.income = parseInt(d.income);
    d.year = parseInt(d.year);
    d.life_expectancy = parseInt(d.life_expectancy);
    return d;
  });

  region = [...new Set(data.map((d) => d.region))];

  //   xScale.domain(d3.extent(data, (d) => d.income));
  xScale.domain([500, d3.max(data, (d) => d.income)]);
  yScale.domain(d3.extent(data, (d) => d.life_expectancy));
  radiusScale.domain([0, d3.max(data, (d) => d.population)]);
  colorScale.domain(region);

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(xAxis);

  svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(yAxis);

  circles = svg
    .selectAll("circles")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d.income))
    .attr("cy", (d) => yScale(d.life_expectancy))
    .attr("r", (d) => radiusScale(d.population))
    .attr("fill", (d) => colorScale(d.region))
    .attr("stroke", "#fff")
    .style("stroke-width", 0.7);
  // .on("mousemove", function (event, d, index) {
  //   tooltip
  //     .style("left", event.pageX + "px")
  //     .style("top", event.pageY - 50 + "px")
  //     .style("display", "block")
  //     .html(`<div class="bubble">${d.country}, ${d.life_expectancy}</div>`);
  //   //// html이기 때문에 스타일링을 css에서 하고 class로 정의해서 가져오면 자유롭게 스타일링을 할 수 있음

  //   d3.select(this).style("stroke-width", 2).attr("stroke", "#111");
  // })
  // .on("mouseout", function () {
  //   tooltip.style("display", "none");
  //   d3.select(this).style("stroke-width", 0.7).attr("stroke", "#fff");
  // });

  xAxisText = svg
    .append("text")
    .attr(
      "transform",
      `translate(${width / 2}, ${height - margin.bottom + 50})`
    )
    .text("GDP per capita")
    .attr("class", "axisText");

  yAxisText = svg
    .append("text")
    .attr(
      "transform",
      `rotate(-90) translate(${-height / 2}, ${margin.left - 50})`
    )
    .text("Life Expectancy")
    .attr("class", "axisText");

  legendRects = svg
    .selectAll("legend-rects")
    .data(region)
    .enter()
    .append("rect")
    .attr("x", (d, i) => width - margin.right - 65)
    .attr("y", (d, i) => height - margin.bottom - 50 - 25 * i)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", (d) => colorScale(d));

  legendLabels = svg
    .selectAll("legend-labels")
    .data(region)
    .enter()
    .append("text")
    .attr("x", (d, i) => width - margin.right - 65 + 20)
    .attr("y", (d, i) => height - margin.bottom - 53 - 25 * i + 15)
    .text((d) => d)
    .attr("class", "legend-texts");

  // Button Europe
  d3.select("#button-europe").on("click", () => {
    europeSelected = !europeSelected;
    africaSelected = false;
    usSelected = false;
    singaporeSelected = false;

    if (europeSelected) {
      d3.select("#text-desc").text(
        "Life expectancy_ highest: Iceland, lowest: Azerbaijan / GDP per capita_highest: Luxembourg, lowest: Ukraine"
      );
    } else {
      d3.select("#text-desc").text("");
    }

    d3.select("button-europe").classed("button-clicked", europeSelected);
    d3.select("button-africa").classed("button-clicked", false);
    d3.select("button-us").classed("button-clicked", false);
    d3.select("button-singapore").classed("button-clicked", false);

    circles.attr("fill", (d) => {
      if (europeSelected) {
        return d.region == "europe" ? colorScale(d.region) : "rgba(0,0,0,0.1)";
      } else {
        return colorScale(d.region);
      }
    });
  });

  // Button Africa
  d3.select("#button-africa").on("click", () => {
    africaSelected = !africaSelected;
    europeSelected = false;
    usSelected = false;
    singaporeSelected = false;

    if (africaSelected) {
      d3.select("#text-desc").text(
        "Life expectancy_highest: Algeria lowest: Lesotho / GDP per capita_highest: Mauritius, lowest: Burundi"
      );
    } else {
      d3.select("#text-desc").text("");
    }

    d3.select("button-africa").classed("button-clicked", africaSelected);
    d3.select("button-europe").classed("button-clicked", false);
    d3.select("button-us").classed("button-clicked", false);
    d3.select("button-singapore").classed("button-clicked", false);

    circles.attr("fill", (d) => {
      if (africaSelected) {
        return d.region == "africa" ? colorScale(d.region) : "rgba(0,0,0,0.1)";
      } else {
        return colorScale(d.region);
      }
    });
  });

  // Button US
  d3.select("#button-us").on("click", () => {
    usSelected = !usSelected;
    europeSelected = false;
    africaSelected = false;
    singaporeSelected = false;

    if (usSelected) {
      d3.select("#text-desc").text(
        "Life expectancy: 79.12 / Income: 65340 / Population: 338289857"
      );
    } else {
      d3.select("#text-desc").text("");
    }

    d3.select("button-us").classed("button-clicked", usSelected);
    d3.select("button-europe").classed("button-clicked", false);
    d3.select("button-africa").classed("button-clicked", false);
    d3.select("button-singapore").classed("button-clicked", false);

    circles.attr("fill", (d) => {
      if (usSelected) {
        return d.country == "United States"
          ? colorScale(d.region)
          : "rgba(0,0,0,0.1)";
      } else {
        return colorScale(d.region);
      }
    });
  });

  // Button Singapore
  d3.select("#button-singapore").on("click", () => {
    singaporeSelected = !singaporeSelected;
    europeSelected = false;
    africaSelected = false;
    usSelected = false;

    if (singaporeSelected) {
      d3.select("#text-desc").text(
        "Life expectancy: 85.26 / Income: 112846 / Population: 5975689"
      );
    } else {
      d3.select("#text-desc").text("");
    }

    d3.select("button-singapore").classed("button-clicked", singaporeSelected);
    d3.select("button-europe").classed("button-clicked", false);
    d3.select("button-africa").classed("button-clicked", false);
    d3.select("button-us").classed("button-clicked", false);

    circles.attr("fill", (d) => {
      if (singaporeSelected) {
        return d.country == "Singapore"
          ? colorScale(d.region)
          : "rgba(0,0,0,0.1)";
      } else {
        return colorScale(d.region);
      }
    });
  });
});

// resize
window.addEventListener("resize", () => {
  width = parseInt(d3.select("#svg-container").style("width"));
  height = parseInt(d3.select("#svg-container").style("height"));

  xScale.range([margin.left, width - margin.right]);
  yScale.range([height - margin.bottom, margin.top]);

  d3.select(".x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

  d3.select(".y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(yAxis);

  circles
    .attr("cx", (d) => xScale(d.income))
    .attr("cy", (d) => yScale(d.life_expectancy))
    .attr("r", (d) => radiusScale(d.population));

  xAxisText.attr(
    "transform",
    `translate(${width / 2}, ${height - margin.bottom + 50})`
  );
  yAxisText.attr(
    "transform",
    `rotate(-90) translate(${-height / 2}, ${margin.left - 50})`
  );

  legendRects
    .attr("x", (d, i) => width - margin.right - 65)
    .attr("y", (d, i) => height - margin.bottom - 50 - 25 * i);

  legendLabels
    .attr("x", (d, i) => width - margin.right - 65 + 20)
    .attr("y", (d, i) => height - margin.bottom - 53 - 25 * i + 15);
});
