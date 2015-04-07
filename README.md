##adobe-swatch-importer ##
*WORK IN PROGRESS*  
requireJS Module for parsing and converting ACO/ASE Swatch Palettes in RGB Hashes (Supported: RGB, CMYK, HSV)

The module awaits jDataView (https://github.com/jDataView/jDataView) Objects due to BigEndian support for binary Files.

Get Instance of Importer Class:  
<code>Swatchimporter(*Swatchfile format*)</code>

Get back all parseable Colors as Objects:  
<code>instance.getColors(*jDataView Object*)</code>

getColors() returns an Array of Color() Objects (Example: 1 Color in Swatchfile pure red):  
```
[{  
	swatchType: "ACO",        // From which type converted  
	name: "Swatch 1",         // Name of Swatch  
	origin: [65535,0,0],      // Colorvalues from Swatchfile  
	originformat: "ACO RGB",  // Convertinfo  
	rgb: [255,0,0],           // converted values from Swatchfile Colorvalues to rgb  
	hash: "#FF0000"           // converted hash  
}]  
```
	
Example:
```
var data = jDataView(rawData);
var importer = SwatchImporter('aco');
var palette = importer.getColors(data);
```

Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license
