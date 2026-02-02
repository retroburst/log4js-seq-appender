const check = require('check-types');

/********************************************************
 * Constructs a new seq appender.
 ********************************************************/
const seqAppender = function seqAppender(layout, timezoneOffset, enrichment, config) {
    let enrichmentResult = null;
    let seqLogger = null;
    let seqLoggerPromise = null;
    
    if(check.assigned(enrichment) && check.object(enrichment)){
        enrichmentResult = enrichment;
    }
    
    // work around to import an esm module in cjs, can probably improve one require esm support is stable and available
    const initSeqLogger = async () => {
        if (seqLogger) return seqLogger;
        if (!seqLoggerPromise) {
            seqLoggerPromise = (async () => {
                const seq = await import('seq-logging');
                seqLogger = new seq.Logger({ serverUrl: config.serverUrl, apiKey: config.apiKey });
                return seqLogger;
            })();
        }
        return seqLoggerPromise;
    };
    
    let appender = function(loggingEvent) {     
        let enrichedFromFunction = false;   
        if(check.not.assigned(enrichmentResult) && check.assigned(enrichment) && check.function(enrichment)) {
            enrichedFromFunction = true;
            enrichmentResult = enrichment(loggingEvent);
        }
        
        // Emit asynchronously to handle lazy initialization
        initSeqLogger().then(logger => {
            logger.emit({
                timestamp: new Date(),
                level: loggingEvent.level.levelStr,
                messageTemplate: layout(loggingEvent, timezoneOffset),
                properties: enrichmentResult || { }
            });
        }).catch(err => {
            console.error('Error emitting to Seq:', err);
        });
        
        if(enrichedFromFunction) { enrichmentResult = null; }
    };
    appender.shutdown = async function(done){ 
        if(seqLogger) {
            await seqLogger.close(); 
        }
        return done();
    };
    return(appender);
};

/********************************************************
 * Configures and returns a new seq appender.
 ********************************************************/
const configure = function configure(config, layouts) {
    let layout = layouts.basicLayout;
    if(config.layout) {
        layout = layouts.layout(config.layout.type, config.layout);
    }
    return seqAppender(layout, config.timezoneOffset, config.enrichment, config);
};

exports.configure = configure;