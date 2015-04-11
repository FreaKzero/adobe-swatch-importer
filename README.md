##adobe-swatch-importer##
*WORK IN PROGRESS*  
requireJS Module for parsing and converting ACO/ASE Swatch Palettes in RGB Hashes (Supported: RGB, CMYK, HSV)

The module awaits jDataView (https://github.com/jDataView/jDataView) Objects due to BigEndian support for binary Files.

![Demo Gif Animation](demo.gif)

Get Instance of Importer Class:  
<code>var instance = Swatchimporter(*Swatchfile format*)</code>

Get back all parseable Colors as Objects:  
<code>instance.getColors(*jDataView Object*)</code>

SwatchImporter Function returns an Instance with following Attributes:
```
[{  
    version: 2                // Swatchformat Version  
    amount: 1                 // Amount of Colors  
    colors: [Array]           // All Colorobjects  
    converted: 0              // Indicator for CMYK converted Colors  
    skipped: 0                // Indicator for skipped Colors (No Converters, wrong Colorspace)  
    byteIndex: 0              // byteIndex dont change (TODO: make private)  
    error: false              // Parseerror Indicator  
}]  
```

getColors() returns an Array of Color() Objects (Example: 1 Color in Swatchfile pure red):  
```
[{  
	swatchType: "ACO",        // From which type converted  
	name: "Swatch 1",         // Name of Swatch
	origin: [65535,0,0],      // Colorvalues from Swatchfile  
	originFormat: "RGB",      // Convertinfo  
	rgb: [255,0,0],           // converted values from Swatchfile Colorvalues to rgb  
	hash: "#FF0000"           // converted hash  
}]  
```
	
Example:
```
try {
  var data = jDataView(rawData);
  var importer = SwatchImporter('aco');
  var palette = importer.getColors(data);
  console.log(palette);
} catch(e) {
  console.error(e.message);
}
```

##Todo##
- LAB Converters/Support for LAB Colorspace
- ASE Colorgrouping (Kuler)  

##Changelog##
- **11 April 2015**  
-- Fixed ASE CMYK Conversion  
-- String Encoding  
-- Properties for converted and skipped Colors  
-- Changed originFormat representation  

- **8 April 2015**  
-- First Version  
-- Support for RGB, CMYK and HSV  

Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license  
Adobe is a registered trademark of Adobe Systems Incorporated.
