# v8vision

v8vision is a telemetry profiling tool for v8.

## Installation

Install all dependencies by running `npm install`

`cd` into the server directory, and then transpile the server code:

```
npm run build
```

In a new terminal window, from the `dist` directory, run the server:

```
node server.js
```

Finally, open `index.html` from the `client` directory. For a list of queries supported, see [Queries](#Queries) below.

## Queries

The following GET queries are supported:

1. `dashboard`: Shows a dashboard of v8 performance counters, as well as v8 instance stats.

2. `plots=<instance>`: Plots the performance counters for the given instance.

3. `details=<instance>`: Shows the occurrence of different v8 events with time, with details on how and where those events occurred (function / bundle names, function type etc.)

