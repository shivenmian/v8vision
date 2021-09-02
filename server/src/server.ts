import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

const PATH_TO_V8VISION = "C:\\Users\\shivenmian\\v8vision";

const { spawn } = require('child_process');
const readline = require('readline');

const app = express();

var v8JsiTraceRegex = /^.+\[Microsoft\.V8JSIRuntime\](.+)$/

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// [{"scripts": [], "counters": {}]
let instances_: any = []
let bundleLoadTimes: any = {}
let detailspayload_: any = []
let detailspayloadPending_: any = []

let perfCountersMap_: any = []

wss.on('connection', (ws: WebSocket, req) => {
    // @ts-ignore
    let query = req.url.split("/");
    query.shift(); // remove the initial empty string.
    if (!query || query.length == 0)
        query = ['dashboard'];

    let firstDetailsRequest = true;
    let closed = false;

    ws.on('message', (message: string) => {
        // console.log('%s', message);
    });

    ws.on('close', function close() {
        // console.log('disconnected');
        closed = true;
    });

    let onTick = () => {
        if (query[0] === 'dashboard') {
            // console.log(JSON.stringify(perfCounterCollections_));
            console.log(instances_);
            ws.send(JSON.stringify(instances_));
        } else if (query[0] === 'details') {
            let reqInstanceId = (query.length > 1) ? query[1] : 1;

            if (firstDetailsRequest
                && detailspayload_[reqInstanceId]
                && detailspayload_[reqInstanceId].length > 0) {
                ws.send(JSON.stringify(detailspayload_[reqInstanceId]));
            }
            firstDetailsRequest = false;

            if (detailspayloadPending_[reqInstanceId] 
                && detailspayloadPending_[reqInstanceId].length > 0) {
                ws.send(JSON.stringify(detailspayloadPending_[reqInstanceId]));

                if (!detailspayload_[reqInstanceId]) {
                    detailspayload_[reqInstanceId] = [];
                }

                detailspayload_[reqInstanceId] = detailspayload_[reqInstanceId].concat(detailspayloadPending_[reqInstanceId]);
                detailspayloadPending_[reqInstanceId] = [];
            }
        } else if (query[0] === 'plots') {
            let reqInstanceId = (query.length > 1) ? query[1] : 1;
            let counterNames = (query.length > 2) ? query[2].split(',') : ["c:V8.MemoryNewSpaceBytesCommitted"];

            let payload: any = {}
            counterNames.forEach(counterName => {
                payload[counterName] = perfCountersMap_[reqInstanceId][counterName];
            });
            
            ws.send(JSON.stringify(payload));
        }

        if (!closed) {
            setTimeout(() => {
                onTick();
            }, 1000);
        } else {
            console.log('closed');
        }
    }

    setTimeout(() => {
        onTick();
    }, 1000);
});

server.listen(process.env.PORT || 8998, () => {
    // @ts-ignore
    console.log(`Server started on port ${server.address().port} :)`);
});


// DATA FETCH
// const source = spawn('C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.19041.0\\x86\\tracefmt.exe', ['-displayonly', 'E:\\v8vision\\server\\etl\\v8jsiapp_multiple.etl']); // (A)
const source = spawn('C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.19041.0\\x86\\tracefmt.exe', ['-displayonly', PATH_TO_V8VISION + "\\server\\etl\\rnw_20210902_142709.etl"]); // (A)
// const source = spawn('powershell.exe', ['E:\\github\\v8-jsi-mgan\\scripts\\tracing\\trace.ps1']); // (A)
source.stdout.setEncoding('utf8');

// Received: [0]8040.5B10::03/18/2021-10:13:41.682 [Microsoft.V8JSIRuntime]{"instanceId":1,"when":"call_completed","cookie":13,"name":"V8.StopTheWorld","count":1,"sample_total":1,"is_histogram":true,"meta":{"provider":"Microsoft.V8JSIRuntime","event":"V8::PerfCounters","time":"2021-03-18T10:13:41.682","cpu":0,"pid":32832,"tid":23312,"channel":11,"level":5}}
// src/server.ts:36
// Received: [0]8040.5B10::03/18/2021-10:13:41.682 [Microsoft.V8JSIRuntime]{"instanceId":1,"when":"call_completed","cookie":13,"name":"c:V8.TotalLoadSize","count":4059203,"sample_total":0,"is_histogram":false,"meta":{"provider":"Microsoft.V8JSIRuntime","event":"V8::PerfCounters","time":"2021-03-18T10:13:41.682","cpu":0,"pid":32832,"tid":23312,"channel":11,"level":5}}
// src/server.ts:36
// Received: [0]8040.5B10::03/18/2021-10:13:41.682 [Microsoft.V8JSIRuntime]{"instanceId":1,"when":"call_completed","cookie":13,"name":"c:V8.ObjsSinceLastFull","count":37890,"sample_total":0,"is_histogram":false,"meta":{"provider":"Microsoft.V8JSIRuntime","event":"V8::PerfCounters","time":"2021-03-18T10:13:41.682","cpu":0,"pid":32832,"tid":23312,"channel":11,"level":5}}
// src/server.ts:36
// Received: [0]8040.5B10::03/18/2021-10:13:41.682 [Microsoft.V8JSIRuntime]{"instanceId":1,"when":"call_completed","cookie":13,"name":"V8.MemoryExternalFragmentationMapSpace","count":1,"sample_total":7,"is_histogram":true,"meta":{"provider":"Microsoft.V8JSIRuntime","event":"V8::PerfCounters","time":"2021-03-18T10:13:41.682","cpu":0,"pid":32832,"tid":23312,"channel":11,"level":5}}
// src/server.ts:36
// Received: [0]8040.5B10::03/18/2021-10:13:41.682 [Microsoft.V8JSIRuntime]{"instanceId":1,"when":"call_completed","cookie":13,"name":"V8.CompileScriptMicroSeconds.ConsumeCache.Failed","count":2,"sample_total":211869,"is_histogram":true,"meta":{"provider":"Microsoft.V8JSIRuntime","event":"V8::PerfCounters","time":"2021-03-18T10:13:41.682","cpu":0,"pid":32832,"tid":23312,"channel":11,"level":5}}
// src/server.ts:36
// Received: [0]8040.5B10::03/18/2021-10:13:41.682 [Microsoft.V8JSIRuntime]{"instanceId":1,"when":"call_completed","cookie":13,"name":"V8.CompileScriptMicroSeconds.NoCache.Other","count":1,"sample_total":370,"is_histogram":true,"meta":{"provider":"Microsoft.V8JSIRuntime","event":"V8::PerfCounters","time":"2021-03-18T10:13:41.682","cpu":0,"pid":32832,"tid":23312,"channel":11,"level":5}}
// src/server.ts:36
// Received: [0]8040.5B10::03/18/2021-10:13:41.682 [Microsoft.V8JSIRuntime]{"instanceId":1,"when":"call_completed","cookie":13,"name":"V8.CompileLazyMicroSeconds","count":2,"sample_total":46449,"is_histogram":true,"meta":{"provider":"Microsoft.V8JSIRuntime","event":"V8::PerfCounters","time":"2021-03-18T10:13:41.682","cpu":0,"pid":32832,"tid":23312,"channel":11,"level":5}}
// src/server.ts:36
// Received: [0]8040.5B10::03/18/2021-10:13:41.682 [Microsoft.V8JSIRuntime]{"instanceId":1,"when":"call_completed","cookie":13,"name":"V8.MemoryExternalFragmentationTotal","count":1,"sample_total":7,"is_histogram":true,"meta":{"provider":"Microsoft.V8JSIRuntime","event":"V8::PerfCounters","time":"2021-03-18T10:13:41.682","cpu":0,"pid":32832,"tid":23312,"channel":11,"level":5}}

const rl = readline.createInterface({
    output: process.stdout,
    input: source.stdout,
    console: false
});

let startTime = -1;
rl.on('line', (input: string) => {
    // console.log(`Received: ${input}`);

    var match = input.match(v8JsiTraceRegex);
    if (match) {
        // Interesting events.
        // CreateContext
        // evaluateJavaScript
        // CallFunction
        // CallConstructor
        // V8::PerfCounters
        // V8::GCPrologueCallback
        // V8::GCEpilogueCallback
        // V8::JIT

        let trace = JSON.parse(match[1]);
        let instId = parseInt(trace.instanceId);
        let event = trace.meta.event;

        let eventTime = trace.meta.time;
        
        if (startTime == -1) {
            startTime = new Date(eventTime).getTime();
        }

        let eventTimeOffset = new Date(eventTime).getTime() - startTime;

        // DASHBOARD SCRIPTS
        if (event === "evaluateJavaScript") {
            if (!instances_[instId]) {
                instances_[instId] = {}
            }

            if (!instances_[instId]["scripts"]) {
                instances_[instId]["scripts"] = {};
            }

            if (!bundleLoadTimes[instId]){
                bundleLoadTimes[instId] = {}
            }

            if (!bundleLoadTimes[instId][trace.sourceURL]) {
                bundleLoadTimes[instId][trace.sourceURL] = new Date(trace.meta.time).getTime();
            } else {
                bundleLoadTimes[instId][trace.sourceURL] = new Date(trace.meta.time).getTime() - bundleLoadTimes[instId][trace.sourceURL];
                instances_[instId]["scripts"][trace.sourceURL] = bundleLoadTimes[instId][trace.sourceURL];
            }

        } else if (event === "CallFunction" && trace.op === "start") {
            if (!instances_[instId]) {
                instances_[instId] = {}
            }

            if (!instances_[instId]["funcCalls"]) {
                instances_[instId]["funcCalls"] = 0;
            }

            instances_[instId]["funcCalls"]++;

            if (!instances_[instId]["funcCallsCounts"]) {
                instances_[instId]["funcCallsCounts"] = {};
            }

            if (!instances_[instId]["funcCallsCounts"][trace.name]){
                instances_[instId]["funcCallsCounts"][trace.name] = 0;
            }

            instances_[instId]["funcCallsCounts"][trace.name]++;
            
        } else if (event === "CallConstructor" && trace.op === "start") {
            if (!instances_[instId]) {
                instances_[instId] = {}
            }

            if (!instances_[instId]["ctrCalls"]) {
                instances_[instId]["ctrCalls"] = 0;
            }

            instances_[instId]["ctrCalls"]++;
        } else if (event === "HostFunctionCallback" && trace.op === "start") {
            if (!instances_[instId]) {
                instances_[instId] = {}
            }

            if (!instances_[instId]["hostFuncCalls"]) {
                instances_[instId]["hostFuncCalls"] = 0;
            }

            instances_[instId]["hostFuncCalls"]++;
        } else if (event === "V8::JIT") {
            if (!instances_[instId]) {
                instances_[instId] = {}
            }

            if (!instances_[instId]["jits"]) {
                instances_[instId]["jits"] = 0;
            }

            instances_[instId]["jits"]++;
        } else if (event === "V8::GCEpilogueCallback") {
            if (!instances_[instId]) {
                instances_[instId] = {}
            }

            if (!instances_[instId]["gcs"]) {
                instances_[instId]["gcs"] = 0;
            }

            instances_[instId]["gcs"]++;
        }

        // DASHBOARD PERF

        // Latest counter snapshot
        if (event === "V8::PerfCounters") {

            if (!instances_[instId]) {
                instances_[instId] = {}
            }

            if (!instances_[instId]["counters"]) {
                instances_[instId]["counters"] = {};
            }

            let perfCounterCollection = instances_[instId]["counters"];
            let counterName = trace.name;

            if (!perfCounterCollection[counterName]) {
                perfCounterCollection[counterName] = {}
            }

            let perfCounterEntry = perfCounterCollection[counterName]
            perfCounterEntry['count'] = trace.count;
            perfCounterEntry['sample_total'] = trace.sample_total;
            perfCounterEntry['is_histogram'] = trace.is_histogram;

            // Create maps for plots
            if(!perfCountersMap_[instId]) {
                perfCountersMap_[instId] = {}
            }

            let perfCountersMapInst = perfCountersMap_[instId]
            if(!perfCountersMapInst[counterName]) {
                perfCountersMapInst[counterName] = []
            }

            let perfCountersMapInst2 = perfCountersMapInst[counterName];
            if(trace.is_histogram) {
                perfCountersMapInst2.push([eventTimeOffset, trace.sample_total]);
            } else {
                perfCountersMapInst2.push([eventTimeOffset, trace.count]);
            }
        }

        // FOR DETAILS

        if (event === "CreateContext"
            || event === "CreateNewIsolate"
            || event === "evaluateJavaScript"
            || event === "evaluateJavaScript"
            || event === "CallFunction"
            || event === "CallConstructor"
            || event === "HostFunctionCallback"
            || event === "V8::MessageFrom"
            || event === "V8::NearHeapLimitCallback"
            || event === "V8::GCPrologueCallback"
            || event === "V8::GCEpilogueCallback"
            || event === "V8::JIT") {

            var payload: any = {};

            payload.instId = parseInt(trace.instanceId);
            payload.evt = trace.meta.event;
            payload.ts = trace.meta.time;
            payload.pid = parseInt(trace.meta.pid);
            payload.tid = parseInt(trace.meta.tid);

            if (payload.evt === "evaluateJavaScript") {
                payload.url = trace.sourceURL;
            } else if (payload.evt === "CallFunction") {
                payload.funcName = trace.name;
            } else if (payload.evt === "V8::JIT") {
                payload.jit_type = trace.type;
                payload.jit_name = trace.name;
                payload.jit_cookie = trace.cookie;
                payload.jit_code_details = trace.code_details;
            } else if (payload.evt === "V8::GCEpilogueCallback"
                || payload.evt === "V8::GCPrologueCallback") {
                payload.GCType = trace.GCType;
            }

            if (!detailspayloadPending_[payload.instId]) {
                detailspayloadPending_[payload.instId] = [];
            }

            detailspayloadPending_[payload.instId].push(payload);
        }

    }
});