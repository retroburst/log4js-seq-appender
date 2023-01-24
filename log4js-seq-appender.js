var check = require("check-types");
var seq = require("seq-logging");

/********************************************************
 * Constructs a new seq appender.
 ********************************************************/
var seqAppender = function seqAppender(layout, timezoneOffset, enrichment, seqLogger) {
    var enrichmentResult = null;
    if(check.assigned(enrichment) && check.object(enrichment)){
        enrichmentResult = enrichment;
    }
    var appender = function(loggingEvent) {     
        var enrichedFromFunction = false;   
        if(check.not.assigned(enrichmentResult) && check.assigned(enrichment) && check.function(enrichment)) {
            enrichedFromFunction = true;
            enrichmentResult = enrichment(loggingEvent);
        }
        seqLogger.emit({
            timestamp: new Date(),
            level: loggingEvent.level.levelStr,
            messageTemplate: layout(loggingEvent, timezoneOffset),
            properties: enrichmentResult || { }
        });
        if(enrichedFromFunction) { enrichmentResult = null; }
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
var configure = function configure(config, layouts) {
    var layout = layouts.basicLayout;
    if(config.layout) {
        layout = layouts.layout(config.layout.type, config.layout);
    }
    var seqLogger = new seq.Logger({ serverUrl: config.serverUrl, apiKey: config.apiKey });
    return seqAppender(layout, config.timezoneOffset, config.enrichment, seqLogger);
};

exports.configure = configure;