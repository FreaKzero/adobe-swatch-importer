requirejs.config({
    baseUrl: './lib',
    paths: {
        jquery: 'jquery',
        SwatchImporter: 'SwatchImporter.min',
        jDataView: 'jdataview'
    }
});

require(['jquery', 'jDataView', 'SwatchImporter'], function($, jDataView, SwatchImporter) {

    $(document).on('click', '.swatch', function() {
        alert($(this).data('origin'));
    });

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
                    var info = 'C: '+palette[c].origin[0] + '\n' + 'M: '+palette[c].origin[1] + '\n' + 'Y: '+palette[c].origin[2] + '\n' + 'K: '+palette[c].origin[3];
                    str += '<div class="block"><div class="swatch" data-origin="'+info+'" style="background-color:'+ palette[c].hash +';"></div>'+ palette[c].name +'<br>'+palette[c].hash+'</div>';
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