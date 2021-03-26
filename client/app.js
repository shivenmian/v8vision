const urlParams = new URLSearchParams(window.location.search);

google.charts.load('current', {'packages':['table']});
// google.charts.setOnLoadCallback(drawTable);


// TODO :: Find a way to avoid keeping this global.
const data = [];
let dirty = false;

var starttime = -1;

function addData(payload) {
    payload.forEach((entry) => {
        var t = new Date(entry.ts).getTime();
        if (starttime == -1) {
            starttime = t;
        }
        t = t - starttime;

        data.push({ x: t, y: entry })
        dirty = true;
    });


}

function displayInstance(instanceHostInner, key, value) {

    let scriptsHeader = document.createElement('h3')
    scriptsHeader.appendChild(document.createTextNode("Instance Stats"))
    instanceHostInner.appendChild(scriptsHeader)
    
    let statsHost = document.createElement('div')
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Name');
    data.addColumn('string', 'Value');
 
    if (value["scripts"]) {
        data.addRows([
            ['Loaded scripts',  JSON.stringify(value["scripts"])],
          ]);
    }

    if (value["funcCalls"]) {
        data.addRows([
            ['Native to JS function calls',  value["funcCalls"].toString()],
          ]);
    }

    if (value["ctrCalls"]) {
        data.addRows([
            ['Native to JS Constructor calls',  value["ctrCalls"].toString()],
          ]);
    }

    if (value["hostFuncCalls"]) {
        data.addRows([
            ['JS to Native function calls',  value["hostFuncCalls"].toString()],
          ]);
    }

    if (value["jits"]) {
        data.addRows([
            ['Number of JIT operations',  value["jits"].toString()],
          ]);
    }

    if (value["gcs"]) {
        data.addRows([
            ['Number of garbage collections',  value["gcs"].toString()],
          ]);
    }

    var table = new google.visualization.Table(statsHost);
    table.draw(data, {showRowNumber: true, width: '100%', height: '100%'});
    instanceHostInner.appendChild(statsHost);

    if (value["counters"]) {
        let perfCountersHeader = document.createElement('h3')
        perfCountersHeader.appendChild(document.createTextNode("Performance Counters"))
        instanceHostInner.appendChild(perfCountersHeader)

        let countersHost = document.createElement('div')
        var counterData = new google.visualization.DataTable();
        counterData.addColumn('string', 'Counter Name');
        counterData.addColumn('number', 'Count');
        counterData.addColumn('number', 'Sample Total');
        counterData.addColumn('boolean', 'Is Histogram?');  

        Object.keys(value["counters"]).forEach((entry) => {
            counterData.addRows([
                [entry,  value["counters"][entry].count, value["counters"][entry].sample_total, value["counters"][entry].is_histogram]
              ]);
        });

        var counterTable = new google.visualization.Table(countersHost);
        counterTable.draw(counterData, {showRowNumber: true, width: '100%', height: '100%'});
        instanceHostInner.appendChild(countersHost);
    }
}

var cache = {}
function addInstanceCounters(payload) {
    let instanceHost = document.getElementById("instancesHost");
    // instanceHost.innerHTML = '';

    Object.keys(payload).forEach((key) => {
        if (!payload[key])
            return;

        let instanceHostInner;
        if(cache[key]) {
            instanceHostInner = cache[key];
        } else {
            let card = document.createElement('div');
            card.setAttribute("class", "card");
            
            let data_header_target = "heading" + key;
            let cardHeader = document.createElement('div');
            cardHeader.setAttribute("class", data_header_target);
            
            let cardHeaderInner = document.createElement('h2');
            cardHeaderInner.setAttribute("class", "mb-0");
            cardHeader.appendChild(cardHeaderInner);
    
            let data_target = "collapse" + key;
            let button = document.createElement('button');
            button.setAttribute("class", "btn btn-link");
            button.setAttribute("type", "button");
            button.setAttribute("data-toggle", "collapse");
            button.setAttribute("data-target", "#" + data_target);
            cardHeaderInner.appendChild(button);
    
            let headerText = document.createTextNode("Instance " + key);
            button.appendChild(headerText);
           
            card.appendChild(cardHeader);
    
            let cardBodyHostCollapsible = document.createElement('div');
            cardBodyHostCollapsible.setAttribute("id", data_target);
            cardBodyHostCollapsible.setAttribute("class", "collapse");
            cardBodyHostCollapsible.setAttribute("aria-labelledby", data_header_target);
            cardBodyHostCollapsible.setAttribute("data-parent", "#instancesHost");
    
            let cardBody = document.createElement('div');
            cardBody.setAttribute("class", "card-body");
            cardBodyHostCollapsible.appendChild(cardBody);
    
            instanceHostInner = document.createElement('div')
            cardBody.appendChild(instanceHostInner);
    
            card.appendChild(cardBodyHostCollapsible);
            instanceHost.appendChild(card);

            cache[key] = instanceHostInner;
        }
        
        instanceHostInner.innerHTML = '';
        displayInstance(instanceHostInner, key, payload[key]);
    });
}

function dataFetch(addFunc) {

    var noseed = true;
    if (!noseed) {
        var seed_data = [{ "instId": 1, "evt": "Initializing", "ts": "2021-03-24T13:36:12.605", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "Initializing", "ts": "2021-03-24T13:36:13.605", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "CreateNewIsolate", "ts": "2021-03-24T13:36:12.608", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "CreateNewIsolate", "ts": "2021-03-24T13:36:12.633", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.633", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.633", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "CreateContext", "ts": "2021-03-24T13:36:12.633", "pid": 34900, "tid": 14612 }, { "instId": 0, "evt": "V8::JIT", "ts": "2021-03-24T13:36:12.636", "pid": 34900, "tid": 14612 }, { "instId": 0, "evt": "V8::JIT", "ts": "2021-03-24T13:36:12.636", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "CreateContext", "ts": "2021-03-24T13:36:12.637", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.637", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.637", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.637", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.637", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.637", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.637", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.637", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.637", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.637", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.637", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.637", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.637", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.637", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.637", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.637", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "evaluateJavaScript", "ts": "2021-03-24T13:36:12.637", "pid": 34900, "tid": 14612 }, { "instId": 0, "evt": "V8::JIT", "ts": "2021-03-24T13:36:12.637", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "evaluateJavaScript", "ts": "2021-03-24T13:36:12.639", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.639", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.639", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.639", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.639", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.639", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.639", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.639", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.639", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.639", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.639", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.639", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.639", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.639", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.639", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.639", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.639", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.639", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.639", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.639", "pid": 34900, "tid": 14612 }, { "instId": 1, "evt": "V8::PerfCounters", "ts": "2021-03-24T13:36:12.639", "pid": 34900, "tid": 14612 }];
        seed_data.forEach(element => {
            addData(element);
        });
    }

    var nows = false;
    if ("WebSocket" in window && !nows) {
        var ws;
        if (urlParams.get('dashboard') != null) {
            ws = new WebSocket("ws://localhost:8998/dashboard");
        } else if (urlParams.get('details') != null) {
            let instanceId = urlParams.get('details');
            ws = new WebSocket("ws://localhost:8998/details/" + urlParams.get('details'));
        }

        ws.onopen = function () {
            // alert("ws.onopen!");
        };

        ws.onmessage = function (evt) {
            var received_msg = evt.data;
            var payload = JSON.parse(received_msg);
            // addData(payload);
            addFunc(payload);
        };

        ws.onclose = function () {
            alert("Connection is closed...");
        };
    }
}

function mouseover() {
    const barData = d3.select(this).data()[0];

    // Build tip.
    const tip = d3.select('.tooltip');

    tip
        .style('left', `${d3.event.clientX + 15}px`)
        .style('top', `${d3.event.clientY}px`)
        .transition()
        .style('opacity', 0.98);

    tip.select('h3').html(`${barData.y.evt}`);
    tip.select('h4').html(`${barData.x} - ${barData.y.ts}`);

    if (barData.y.evt === "evaluateJavaScript") {
        tip.select('.tip-body').html(`sourceURL: ${barData.y.url}`);
    } else if (barData.y.evt === "CallFunction") {
        tip.select('.tip-body').html(`Function Name: ${barData.y.funcName}`);
    } else if (barData.y.evt === "V8::JIT") {
        var desc = "";

        if (barData.y.jit_type)
            desc += `Type: ${barData.y.jit_type} </br>`;
        if (barData.y.jit_name)
            desc += `Name: ${barData.y.jit_name} </br>`;
        if (barData.y.jit_cookie)
            desc += `Cookie: ${barData.y.jit_cookie} </br>`;
        if (barData.y.jit_code_details)
            desc += `Code Details: ${barData.y.jit_code_details} </br>`;

        tip.select('.tip-body').html(desc);
    } else if (barData.y.evt === "V8::GCEpilogueCallback" || barData.y.evt === "V8::GCPrologueCallback") {
        tip.select('.tip-body').html(`Type: ${barData.y.GCType}`);
    } else {
        tip.select('.tip-body').html('');
    }
}

function mousemove() {
    d3.select('.tooltip')
        .style('left', `${d3.event.clientX + 15}px`)
        .style('top', `${d3.event.clientY}px`);
}

function mouseout() {
    d3.select('.tooltip')
        .transition()
        .style('opacity', 0);
}

function run() {
    // Margin convention.
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const width = 1600 - margin.right - margin.left;
    const height = 800 - margin.top - margin.bottom;

    // Scales.
    const xScale = d3.scaleLinear().range([0, width]);
    const yScale = d3.scaleLinear().range([0, height]);

    // Show 15 seconds in one viewport.
    xScale.domain([0, 15 * 1000]);
    yScale.domain([0, 50]);

    // Create SVG
    const svg = d3
        .select("body")
        .append("div")
        .style("border", "solid 1px red")
        .append("svg");

    // Configure initial canvas
    // 1. set viewport
    // 2. border/padding
    svg.attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .style("border", "solid 1px blue")

    // Setup data group.
    var g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Pan/Zoom
    svg.call(d3
        .zoom()
        .scaleExtent([-1e100, 1e100])
        .translateExtent([
            [0, 0],
            [1e100, 1e100]
        ])
        .on("zoom", zoomed));

    // Draw x axis.
    const xAxis = d3
        .axisBottom(xScale)
        .tickSize(-height)
        .ticks((width + 2) / (height + 2) * 10)
    // .scale(xScale);

    // Draw y axis
    const yAxis = d3
        .axisRight(yScale)
        .tickSize(width)
        .ticks(10)
    // .scale(xScale);

    const gX = svg.append("g")
        .attr("transform", "translate(0, " + height + ")")
        .attr("class", "axis axis--x")
        .call(xAxis);

    const gY = svg.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);

    function zoomed() {
        gX.call(xAxis.scale(d3.event.transform.rescaleX(xScale)));
        gY.call(yAxis.scale(d3.event.transform.rescaleY(yScale)));

        d3
            .selectAll('.bar')
            .attr("transform", d3.event.transform);
    }

    function update() {
        if (!dirty)
            return;
        dirty = false;

        svg
            .selectAll('.bar')
            .data(data)
            .join(
                enter => {
                    enter
                        .append("circle")
                        .attr("class", "bar")
                        .attr("cx", function (d) {
                            return xScale(d.x);
                        })
                        .attr("cy", function (d) {
                            if (d.y.evt === "V8::JIT")
                                return yScale(5)
                            if (d.y.evt === "V8::GCPrologueCallback" || d.y.evt === "V8::GCEpilogueCallback")
                                return yScale(10)
                            if (d.y.evt === "CallFunction")
                                return yScale(15)
                            if (d.y.evt === "HostFunctionCallback")
                                return yScale(20)
                            if (d.y.evt === "V8::PerfCounters")
                                return yScale(25)
                            if (d.y.evt === "evaluateJavaScript")
                                return yScale(30)
                            if (d.y.evt === "Initializing")
                                return yScale(35)
                        })
                        .attr("r", 10)
                        .style('fill', 'black')
                        .on('mouseover', mouseover)
                        .on('mousemove', mousemove)
                        .on('mouseout', mouseout);
                },

                update => {

                },

                exit => {

                }
            );
    }

    window.setInterval(function () {
        update();
    });
}

if (urlParams.get('dashboard') != null) {
    dataFetch(addInstanceCounters);
} else if (urlParams.get('details') != null) {
    run();
    dataFetch(addData);
}