const check = require("check-types");
const seq = require("seq-logging");

/********************************************************
 * Constructs a new seq appender.
 ********************************************************/
const seqAppender = function seqAppender(layout, timezoneOffset, enrichment, seqLogger) {
    let enrichmentResult = null;
    if(check.assigned(enrichment) && check.object(enrichment)){
        enrichmentResult = enrichment;
    }
    const appender = function(loggingEvent) {        
        if(check.not.assigned(enrichmentResult) && check.assigned(enrichment) && check.function(enrichment)) {
            enrichmentResult = enrichment(loggingEvent);
        }
        seqLogger.emit({
            timestamp: new Date(),
            level: loggingEvent.level.levelStr,
            messageTemplate: layout(loggingEvent, timezoneOffset),
            properties: enrichmentResult || { }
        });
        enrichmentResult = null;
    };
    appender.shutdown = async function(done){ 
        await seqLogger.close(); 
        return done();
    };
    return(appender);
};

/********************************************************
 * Configures and returns a new memory appender.
 ********************************************************/
const configure = function configure(config, layouts) {
    let layout = layouts.basicLayout;
    if(config.layout) {
        layout = layouts.layout(config.layout.type, config.layout);
    }
    let seqLogger = new seq.Logger({ serverUrl: config.serverUrl, apiKey: config.apiKey });
    return seqAppender(layout, config.timezoneOffset, config.enrichment, seqLogger);
};

exports.configure = configure;