define(['src/SwatchImporter','lib/jdataview.js', 'bin!data/rgbtest.aco', 'bin!data/cmyktest.aco', 'bin!data/hsvtest.aco'], 
    function(SwatchImporter, jDataView , rgbSwatches, cmykSwatches, hsvSwatches) {

    var rgbTestResult = [
        {hash: '#FF0000', name: 'redcolor'},
        {hash: '#00FF00', name: 'greencolor'},
        {hash: '#0000FF', name: 'bluecolor'},
    ];

    var cmykTestResult = [
        {hash: '#FF0000', name: 'CMYKRED'},
        {hash: '#72FC02', name: 'CMYKGREEN'},
        {hash: '#000CFF', name: 'CMYKBLUE'},
    ];

    var hsvTestResult = [
        {hash: '#FF0000', name: 'HSVRED'},
        {hash: '#00FF00', name: 'HSVGREEN'},
        {hash: '#0000FF', name: 'HSVBLUE'},
    ];

   	describe('Aco Importing', function() {

        it('Should initiate empty', function() {        	
            var importer = SwatchImporter('aco');            
            expect(importer.amount).toBe(0);
            expect(importer.colors.length).toBe(0);
            expect(importer.converted).toBe(0);
            expect(importer.error).toBe(false);
            expect(importer.skipped).toBe(0);
        });

        it('Should parse binary Swatches', function() {
            var importer = SwatchImporter('aco');
            var data =  jDataView(rgbSwatches);
            var palette = importer.getColors(data);

            expect(palette.length).toBe(3);
        });

        it('Should parse the right RGB Colors', function() {
            var importer = SwatchImporter('aco');
            var data =  jDataView(rgbSwatches);
            var palette = importer.getColors(data);

            for (var i = 0; i < 3; i++) {
                expect(palette[i].name).toBe(rgbTestResult[i].name);
                expect(palette[i].hash).toBe(rgbTestResult[i].hash);
            }            
        });

        it('Should parse and convert CMYK Colors as good as possible', function() {
            var importer = SwatchImporter('aco');
            var data =  jDataView(cmykSwatches);
            var palette = importer.getColors(data);

            for (var i = 0; i < 3; i++) {
                expect(palette[i].name).toBe(cmykTestResult[i].name);
                expect(palette[i].hash).toBe(cmykTestResult[i].hash);
            }            
        });

        it('Should parse and convert HSV Colors as good as possible', function() {
            var importer = SwatchImporter('aco');
            var data =  jDataView(hsvSwatches);
            var palette = importer.getColors(data);

            for (var i = 0; i < 3; i++) {
                expect(palette[i].name).toBe(hsvTestResult[i].name);
                expect(palette[i].hash).toBe(hsvTestResult[i].hash);
            }            
        });

    });
});