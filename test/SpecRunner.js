require.config({
    baseUrl: '../',
    urlArgs: 'cb=' + Math.random(),    
    paths: {
        bin: './test/lib/bin',
        spec: './test/tests'
    }
});

require([], function($) {
    var jasmineEnv = jasmine.getEnv(),
        htmlReporter = new jasmine.HtmlReporter(),
        specs = [];

    jasmineEnv.addReporter(htmlReporter);

    jasmineEnv.specFilter = function(spec) {
        return htmlReporter.specFilter(spec);
    };

    specs.push('test/tests/AcoTest');

    
    require(specs, function() {        
        jasmineEnv.execute();
    });
    
});