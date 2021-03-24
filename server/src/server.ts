import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

const { spawn } = require('child_process');
const readline = require('readline');

const app = express();

var v8JsiTraceRegex = /^.+\[Microsoft\.V8JSIRuntime\](.+)$/

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws: WebSocket) => {

    ws.on('message', (message: string) => {
        console.log('%s', message);
    });

    const source = spawn('C:\\Program Files (x86)\\Windows Kits\\10\\bin\\10.0.19041.0\\x86\\tracefmt.exe', ['-displayonly', 'E:\\v8vision\\server\\etl\\rnw_20210318_101331.etl']); // (A)
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

    rl.on('line', (input: string) => {
        // console.log(`Received: ${input}`);

        var match = input.match(v8JsiTraceRegex);
        if (match) {
            var payload = { instId: 0, evt: "", ts: "", pid: 0, tid: 0 };
            var trace = JSON.parse(match[1]);
            payload.instId = parseInt(trace.instanceId);
            payload.evt = trace.meta.event;
            payload.ts = trace.meta.time;
            payload.pid = parseInt(trace.meta.pid);
            payload.tid = parseInt(trace.meta.tid);

            var payloadstr = JSON.stringify(payload);
            console.log(payloadstr);
            ws.send(payloadstr);
        }

    });
});

//start our server
server.listen(process.env.PORT || 8998, () => {
    // @ts-ignore
    console.log(`Server started on port ${server.address().port} :)`);
});