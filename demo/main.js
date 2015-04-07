requirejs.config({
    baseUrl: './lib',
    paths: {
        jquery: 'jquery',
        SwatchImporter: 'SwatchImporter.min',
        jDataView: 'jdataview'
    }
});

require(['jquery', 'jDataView', 'SwatchImporter'], function($, jDataView, SwatchImporter) {

    $('#inputfile').on('change', function(changeEvent) {
        var fr = new FileReader();

        fr.onloadend = function() {
            // Set Palette globally
            var aco = SwatchImporter('aco');
            var data = new jDataView(this.result);
            var palette = aco.getColors(data);
            var str = "";
            
            for (var c in palette) {
                str +='<div style=" float:left; margin-right: 15px; height: 100px; width: 100px; background: ' + palette[c].hash + '">' + palette[c].name + '</div>'
            }

            $('#colors').hide().html(str).fadeIn('slow');
        };

        fr.readAsArrayBuffer(this.files[0]);
    })

});