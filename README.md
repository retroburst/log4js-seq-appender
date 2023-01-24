# log4js-seq-appender

A simple SEQ appender for log4js, supports Log4js version 6 and above. Please note, from version 6 all appenders need to be defined in
config and cannot be progammatically instantiated and configured.

## Install

```
npm install log4js-seq-appender
```


## Usage

#### Config
```json

"log4js" : {
    "level": "ALL",
    "appenders" : {
        "console" : { "type": "console", "timezoneOffset": 0 },
        "file" : { "type": "file", "filename": "logs/something.log", "maxLogSize": 1024000, "timezoneOffset": 0, "backups": 50 },
        "seq" : { "type": "log4js-seq-appender", "timezoneOffset": 0, "serverUrl": "SERVER_URL", "apiKey": "API_KEY", "timezoneOffset": 0, "layout": { "type": "pattern", "pattern": "%m%n" }, "enrichment": { "something" : "static" } }
    },
    "categories" :  {
        "default": { "appenders": ["console", "file", "seq"], "level": "ALL" }
    }
}
```
#### Initialisation and Usage

```js

var log4js = require('log4js');
var log4jsLogger = null;    
log4js.configure(config.log4js);
logger = log4js.getLogger("App Name");
// set the initial level, as newer versions of log4js are set to OFF by default
log4jsLogger.level = someConfig.log4js.level;
logger.trace('trace');
logger.debug('debug');
logger.info('info');
logger.warn('warn');
var error = new Error('test');
error.code = 'fatal';
logger.error(error);
logger.fatal('fatal');
logger.mark('mark');
```


#### Enrichment

To enrich data, you can provide an object with the properties you want to enrich with, or provide a function that will be called to resolve the enrichment each log event. To do this, you can provide an static in config, or an object or function in code - see below.

##### Enrich with config
```json

"log4js" : {
    "level": "ALL",
    "appenders" : {
        "seq" : { "type": "log4js-seq-appender", "timezoneOffset": 0, "serverUrl": "SERVER_URL", "apiKey": "API_KEY", "timezoneOffset": 0, "layout": { "type": "pattern", "pattern": "%m%n" }, "enrichment": { "something" : "static" } }
    },
    "categories" :  {
        "default": { "appenders": ["seq"], "level": "ALL" }
    }
}
```

##### Enrich with an object in code

```js

log4js.configure({
    "level": "ALL",
    "appenders" : {
        "console" : { "type": "console", "timezoneOffset": 0 },
        "file" : { "type": "file", "filename": "logs/something.log", "maxLogSize": 1024000, "timezoneOffset": 0, "backups": 50 },
        "seq" : { "type": "log4js-seq-appender", "timezoneOffset": 0, "serverUrl": "SERVER_URL", "apiKey": "API_KEY", "timezoneOffset": 0, "layout": { "type": "pattern", "pattern": "%m%n" }, "enrichment": someEnrichmentObject }
    },
    "categories" :  {
        "default": { "appenders": ["console", "file", "seq"], "level": "ALL" }
    }
});

```
##### Enrich with a function in code

```js
// function in code
// function recieves the logging event from log4js
const resolveEnrichment = function(loggingEvent){
    return { 
        // any enrichment properties
    };
};

...

log4js.configure({
    "level": "ALL",
    "appenders" : {
        "console" : { "type": "console", "timezoneOffset": 0 },
        "file" : { "type": "file", "filename": "logs/something.log", "maxLogSize": 1024000, "timezoneOffset": 0, "backups": 50 },
        "seq" : { "type": "log4js-seq-appender", "timezoneOffset": 0, "serverUrl": "SERVER_URL", "apiKey": "API_KEY", "timezoneOffset": 0, "layout": { "type": "pattern", "pattern": "%m%n" }, "enrichment": resolveEnrichment
        }
    },
    "categories" :  {
        "default": { "appenders": ["console", "file", "seq"], "level": "ALL" }
    }
});

```