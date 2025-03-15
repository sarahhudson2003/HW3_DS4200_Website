// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    let width = 600, height = 400;
    
    let margin = {
        top: 50,
        bottom: 50,
        left: 60,
        right: 30
    };

    // Create the SVG container
    let svg = d3.select("#boxplot")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background", "white");

    // Set up scales for x and y axes
    let yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.Likes)])  // Dynamic y-scale based on max Likes
        .range([height - margin.bottom, margin.top]);

    let xScale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.Platform))]) // Unique platforms
        .range([margin.left, width - margin.right])
        .padding(0.4); // Spacing between boxes

    // Add scales     
    let xAxis = svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale));

    let yAxis = svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Platform");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Number of Likes");

    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values);
        const max = d3.max(values);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        return { min, q1, median, q3, max };
    };

    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.Platform);

    quantilesByGroups.forEach((quantiles, Platform) => {
        const x = xScale(Platform);
        const boxWidth = xScale.bandwidth();

        // Draw vertical lines (whiskers) from min to max
        svg.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScale(quantiles.min))
            .attr("y2", yScale(quantiles.max))
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        // Draw box from q1 to q3
        svg.append("rect")
            .attr("x", x)
            .attr("y", yScale(quantiles.q3))
            .attr("width", boxWidth)
            .attr("height", yScale(quantiles.q1) - yScale(quantiles.q3))
            .attr("stroke", "black")
            .attr("fill", "white");

        // Draw median line inside the box
        svg.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScale(quantiles.median))
            .attr("y2", yScale(quantiles.median))
            .attr("stroke", "black")
            .attr("stroke-width", 2);
    });
});

// Prepare you data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
      d.AvgLikes = +d.AvgLikes;
    });

    // Define the dimensions and margins for the SVG
    let width = 600, height = 400;

    let margin = {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50
      }

    // Create the SVG container
    let svg = d3.select('#barplot')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', 'white')
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Define four scales
    // Scale x0 is for the platform, which divide the whole scale into 4 parts
    // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
    // Recommend to add more spaces for the y scale for the legend
    // Also need a color scale for the post type
    // define unique vals for platforms and posttypes
    const platforms = [...new Set(data.map(d => d.Platform))];
    const postTypes = [...new Set(data.map(d => d.PostType))];

    // Get scale for platforms
    const x0 = d3.scaleBand()
        .domain(platforms)
        .range([0, width - margin.left - margin.right])
        .padding(0.2);
    // Get scale for post types
    const x1 = d3.scaleBand()
        .domain(postTypes)
        .range([0, x0.bandwidth()])
        .padding(0.1);
    // Get y scale
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.AvgLikes)])
        .nice()
        .range([height - margin.top - margin.bottom, 0]);
    // Color scale for post type
    const color = d3.scaleOrdinal()
        .domain(postTypes)
        .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);  
         
    // Add scales x0 and y 
    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x0));

    svg.append("g")
        .call(d3.axisLeft(y));
    

    // Add x-axis label
    svg.append("text")
        .attr("x", (width - margin.left - margin.right) / 2)
        .attr("y", height - margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("Platform");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -(height - margin.top - margin.bottom) / 2)
        .style("text-anchor", "middle")
        .text("Average Number of Likes");

    // Group container for bars
    const barGroups = svg.selectAll(".barGroup")
        .data(platforms)
        .enter()
        .append("g")
        .attr("class", "barGroup")
        .attr("transform", d => `translate(${x0(d)}, 0)`);

    // Draw bars
    barGroups.selectAll("rect")
        .data(d => data.filter(item => item.Platform === d))  // Corrected: Properly filter data per platform
        .enter()
        .append("rect")
        .attr("x", d => x1(d.PostType))  // Position within the platform band
        .attr("y", d => y(d.AvgLikes))  // Corrected: Invert SVG coordinate system
        .attr("width", x1.bandwidth())
        .attr("height", d => height - margin.top - margin.bottom - y(d.AvgLikes))  // Height = bottom - y(d.AvgLikes)
        .attr("fill", d => color(d.PostType));
          

    // Add the legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 115}, ${margin.top - 30})`);

    const types = [...new Set(data.map(d => d.PostType))];
 
    types.forEach((type, i) => {

    // Alread have the text information for the legend. 
    // Now add a small square/rect bar next to the text with different color.
    legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(type));

    legend.append("text")
          .attr("x", 20)
          .attr("y", i * 20 + 12)
          .text(type)
          .attr("alignment-baseline", "middle");
  });

});

// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 

const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert Likes to numbers
    data.forEach(function(d) {
      d.AvgLikes = +d.AvgLikes;
    });


    // Define the dimensions and margins for the SVG
    let width = 600, height = 400

    let margin = {
      top: 50,
      bottom: 70,
      left: 50,
      right: 50
    }
    

    // Create the SVG container
    let svg = d3.select('#lineplot')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', 'white')

    // Set up scales for x and y axes  
    let yscale = d3.scaleLinear()
              .domain([0, 1000])
              .range([height - margin.bottom, margin.top])

    let xscale = d3.scalePoint()
                .domain(data.map(d=>d.Date))
                .range([margin.left, width - margin.right])    
                .padding(0.5)


    // Draw the axis, you can rotate the text in the x-axis here
    // Draw the x-axis
    let xaxis = svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xscale));

    // Rotate x-axis labels
    xaxis.selectAll("text")
        .attr("transform", "rotate(-25)")
        .style("text-anchor", "end");

    let yaxis = svg.append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft(yscale));

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Date");
    

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Average Likes");

    // Draw the line and path. Remember to use curveNatural. 
    let line = d3.line()
        .x(d=>xscale(d.Date))
        .y(d=>yscale(d.AvgLikes))
        .curve(d3.curveNatural);

    svg.append('path')
            .datum(data)
            .attr('stroke', 'black')
            .attr('stroke-width', 2)
            .attr('d', line)
            .attr('fill', 'none')
});
