requirejs.config({
    baseUrl: './lib',
    paths: {
        jquery: 'jquery',
        SwatchImporter: 'SwatchImporter.min',
        jDataView: 'jdataview'
    }
});

require(['jquery', 'jDataView', 'SwatchImporter'], function($, jDataView, SwatchImporter) {

    $('#inputfile').on('change', function() {
        var fr = new FileReader();
        var mode = $('#type > option:selected').text();

        fr.onloadend = function() {            
            var palette = null;
            
            try {
                var importer = SwatchImporter(mode);
                var data = new jDataView(this.result);
                 palette= importer.getColors(data);
                 
            } catch(e) {
                $('#error').text(e.message).fadeIn('slow');
                $('#colors').empty().hide();
                $('#result').text(' ').hide();
            }

            if (palette) {

                $('#error').hide();
                var str = '';
                
                for (var c in palette) {
                    str += '<div class="block"><div class="swatch" style="background-color:'+ palette[c].hash +';"></div>'+ palette[c].name +'</div>';
                }

                $('#colors').fadeOut('fast', function() {
                    $(this).html(str).fadeIn('slow');
                });

                $('#result').text(JSON.stringify(importer, null, 2)).fadeIn('slow');
            }
        };

        fr.readAsArrayBuffer(this.files[0]);
    });

});