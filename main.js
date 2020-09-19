const renderBarGraph = function(svgWidth, svgHeight, svgElem, dataset) {


    const svgMargin = {top: 10, right: 50, bottom: 130, left: 100};
    const innerWidth = svgWidth - svgMargin.left - svgMargin.right; 
    const innerHeight = svgHeight -svgMargin.top - svgMargin.bottom;

    const getYearQuarterString = function(year, gdp) {
        let quarter = '';
        let yearQuarterString = '';
        let yearArray = year.split('-');

        if (yearArray[1] === '01') {
            quarter = 'Q1';
        }
        else if (yearArray[1] === '04') {
            quarter = 'Q2';
        }
        else if (yearArray[1] === '07') {
            quarter = 'Q3';
        }
        else if (yearArray[1] === '10') {
            quarter = 'Q4';
        }

        yearQuarterString = `${yearArray[0]}: ${quarter} <br/> <br/>  $${gdp} Billion`;

        return yearQuarterString;
    }

    const xValue = function(d) {
        const year = new Date(d.year);
        return year;
    }

    const yValue = function(d) {
        return d.gdp;
    }

    const xScale = d3.scaleTime()
                     .domain([
                         d3.min(dataset, xValue),
                         d3.max(dataset, function(d) {
                             let xMax = xValue(d);
                             xMax.setMonth(xMax.getMonth() + 3);
                             return xMax;
                         })
                     ])
                     .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
                     .domain(d3.extent(dataset, yValue))
                     .range([innerHeight, 0]);

    
    const gdpScale = d3.scaleLinear()
                       .domain(([0, d3.max(dataset, function(d) {
                           return d.gdp;
                       })]))
                       .range([0, innerHeight]);


    const svgG = svgElem.append("g")
                     .attr("transform", `translate(${svgMargin.left}, ${svgMargin.top})`);

    
    const xAxis = d3.axisBottom(xScale).tickPadding(10);

    const yAxis = d3.axisLeft(yScale).tickPadding(10);


    const xAxisGroup = svgG.append('g')
                            .attr("id", "x-axis")
                            .attr('transform', `translate(0, ${innerHeight})`)
                            .call(xAxis);

    const yAxisGroup = svgG.append('g').call(yAxis).attr("id", "y-axis");


    yAxisGroup.append('text')
                .attr('class', 'axis-label')
                .attr('x', -innerHeight / 2)
                .attr('y', 20)
                .attr('fill', 'black')
                .attr('transform', 'rotate(-90)')
                .attr('font-weight', 'bold')
                .attr('text-anchor', 'middle')
                .text("Gross Domestic Product");


    svgG.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("fill", "steelblue")
        .attr("x", function(d, i) {
            return xScale(xValue(d));
        })
        .attr("y", function(d) {
            return innerHeight - gdpScale(d.gdp);
        })
        .attr("width", function(d) {
            return innerWidth / dataset.length;
        })
        .attr("height", function(d) {
            return gdpScale(d.gdp);
        })
        .on("mouseover", function(d) {
            d3.select(this)
              .transition('hoverbars')
              .duration(200)
              .attr("fill", "white");

            const xPosition = parseFloat(d3.select(this).attr("x"));
            const yPosition = parseFloat(d3.select(this).attr("y"));
            const boundedSVG = document.querySelector('svg');
            const svgBound = boundedSVG.getBoundingClientRect();

            tooltipX = svgBound.left + xPosition;
            tooltipY = svgBound.top + yPosition;

            // d3.select("#div-tooltip")
            //   .transition("tooltip")
            //   .duration(200)
            //   .style("left", tooltipX + "px")
            //   .style("top", tooltipY + "px")
            //   .select("#tooltip-text")
            //   .text( function(dataset) {
            //       return getYearQuarterString(d.year, d.gdp);
            //   });

            d3.select("#div-tooltip")
              .html( function(dataset) {
                return getYearQuarterString(d.year, d.gdp);
              })
              .transition("tootltip")
              .duration(200)
              .attr('text-anchor', 'middle')
              .style("left", tooltipX + "px")
              .style("top", function(d) {
                  return innerHeight + "px";
              });

            d3.select("#div-tooltip").classed("hidden", false);

        })
        .on("mouseout", function(d) {
            d3.select(this)
              .transition('hoverbars')
              .duration(200)
              .attr("fill", "steelblue");

            d3.select("#div-tooltip").classed("hidden", true);
        });
    
};


const setSvg = function() {

    let svgVars = [];

    const containerElement = document.getElementById('bar-chart');
    const svgWidth = containerElement.clientWidth;
    const svgHeight = containerElement.clientHeight;

    const svg = d3.select(containerElement)
                    .append("svg")
                    .attr("width", svgWidth)
                    .attr("height", svgHeight);
    
    svgVars.push(svgWidth);
    svgVars.push(svgHeight);
    svgVars.push(svg);

    return svgVars;
};


const barChartInit = function() {

    if (svgElement === null) {
        svgElement = setSvg();
    }
    else {
        d3.select('svg').remove();
        svgElement = setSvg();
    }

    svgWidth = svgElement[0];
    svgHeight = svgElement[1];
    theSvg = svgElement[2];

    renderBarGraph(svgWidth, svgHeight, theSvg, usGdpData);
}


let svgElement = null;
let usGdpData = [];

d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json")
    .then( function(data) {
        let tempGdpData = {};

        d3.keys( data.data.forEach( function(key) {
            tempGdpData = {year: key[0], gdp: key[1]};
            usGdpData.push(tempGdpData);
        }));
        barChartInit();
    });



window.addEventListener('resize', barChartInit );