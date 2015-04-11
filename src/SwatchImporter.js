/* jslint -W030, unused: false */
/*
The MIT License (MIT)

Copyright (c) 2015 Thomas Petrovic <pete@freakzero.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/**
 * SwatchImporter Module
 * @module SwatchImporter
 *
 */
define(function(require, exports, module) {

    /**
     * Exception - Will be used in _readHead when parsed Versionnumbers are wrong
     * @param {String} message ErrorMessage
     * @method wrongFormatException
     * @module  SwatchImporter
     *
     */
    function wrongFormatException(message) {
        this.name = 'wrongFormatError';
        this.message = (message || '');
        this.consoleoutput = '[' + this.name + '] ' + this.message;
    }

    wrongFormatException.prototype = Error.prototype;

    /**
     * Decodes the Strange (malformed ?) UTF8 String
     *
     * @param  {String} string String from jDataView
     * @return {String} decoded String
     */
    function decodeUtfString(string) {
        // I have really no fucking idea what this String should be, just doing the obvious here

        // 1. Replace Strange \u0000CHAR to CHAR (äöüß is functioning so i hope other foreign chars will also function)
        // 2. Change last \u0000 to a Space
        // 3. Trim the String on both Sides (zero-zero terminating, as written in Adobe Spec)
        return decodeURIComponent(
            string.replace(/\u0000([^\\]{0,1})/ig, '$1')
            .replace(/\u0000/ig, '')
            .replace(/^\s+|\s+$/g, '')
            
        );
    }

    /**
     * rgb2Hash Helper
     *
     * @method  rgb2Hash
     * @param  {Array} array array with rgb values [r,g,b]
     * @return {String} Hex Hash
     * @module  SwatchImporter
     * @private
     */
    function rgb2Hash(array) {
        function digitToHex(N) {
            if (N === null) {
                return '00';
            }
            N = parseInt(N);
            if (N === 0 || isNaN(N)) {
                return '00';
            }
            N = Math.max(0, N);
            N = Math.min(N, 255);
            N = Math.round(N);
            return '0123456789ABCDEF'.charAt((N - N % 16) / 16) + '0123456789ABCDEF'.charAt(N % 16);
        }

        return '#' + digitToHex(array[0]) + digitToHex(array[1]) + digitToHex(array[2]);
    }

    /**
     * Color Class
     *
     * @class Color
     * @constructor
     * @param {String} type Swatchtype (aco or ase)
     * @private
     *
     */
    var Color = function(type) {
        /**
         * @property swatchType
         * @type {String}
         */
        this.swatchType = type;

        /**
         * @property name
         * @type {String} name of Color
         */
        this.name;
        /**
         * Origin Values from Swatchformat
         * @property origin
         * @type {Array}
         */
        this.origin;

        /**
         * Colorspace String (ex.: RGB)
         * @property originFormat
         * @type {String}
         */
        this.originFormat;

        /**
         * Array with rgb Values
         * @property rgb
         * @type {Array}
         */
        this.rgb;

        /**
         * Colorhash (ex.: #FF0000)
         * @property hash
         * @type {String}
         */
        this.hash;
    };

    /**
     * Add RGB Color
     *
     * @method rgb
     * @param  {String} name Name of Color
     * @param  {Number} r Red - Number based on Swatchtype (base 65536 when aco, base 0.1 - 1.0 decimal when ASE)
     * @param  {Number} g Green - Number based on Swatchtype (base 65536 when aco, base 0.1 - 1.0 decimal when ASE)
     * @param  {Number} b Blue - Number based on Swatchtype (base 65536 when aco, base 0.1 - 1.0 decimal when ASE)
     */
    Color.prototype.rgb = function(name, r, g, b) {
        this.name = name;
        this.originFormat = 'RGB';
        this.origin = [r, g, b, 0];

        if (this.swatchType === 'aco') {
            // base 65535 Integer
            this.rgb = [Math.floor((r / 257)), Math.floor((g / 257)), Math.floor((b / 257))];

        } else if (this.swatchType === 'ase') {
            // base 0.1 - 1.0 Float
            this.rgb = [(256 * r), (256 * g), (256 * b)];
        }

        this.hash = rgb2Hash(this.rgb);
    };

    /**
     * Add CMYK Color
     *
     * @method cmyk
     * @param  {String} name Name of Color
     * @param  {Number} c Cyan - Number based on Swatchtype (base 65536 when aco, base 0.1 - 1.0 decimal when ASE)
     * @param  {Number} m Magenta - Number based on Swatchtype (base 65536 when aco, base 0.1 - 1.0 decimal when ASE)
     * @param  {Number} y Yellow - Number based on Swatchtype (base 65536 when aco, base 0.1 - 1.0 decimal when ASE)
     * @param  {Number} k Black - Number based on Swatchtype (base 65536 when aco, base 0.1 - 1.0 decimal when ASE)
     */
    Color.prototype.cmyk = function(name, c, m, y, k) {
        var b;
        this.name = name;
        this.originFormat = 'CMYK';
        this.origin = [c, m, y, k];
        if (this.swatchType === 'aco') {
            // base 65535 Integer
            b = 1 - (k / 65535);

            this.rgb = [
                255 * (1 - (1 - (c / 65535))) * (1 - b),
                255 * (1 - (1 - (m / 65535))) * (1 - b),
                255 * (1 - (1 - (y / 65535))) * (1 - b)
            ];

        } else if (this.swatchType === 'ase') {
            // base 0.1 - 1.0 Float
            this.rgb = [
                255 * (1 - c) * (1 - k),
                255 * (1 - m) * (1 - k),
                255 * (1 - y) * (1 - k),
            ];
        }

        this.hash = rgb2Hash(this.rgb);
    };

    /**
 * Add HSV Color
 * Only needed for ACO Swatches since Adobe Products saves RGB Type when using ASE Swatches
 *
 * @method hsb
 * @param  {String} name Name of Color
 * @param  {Number} h Hue - 65536 based Number, converted to 0.1 - 1 value where 1 is 360°
 * @param  {Number} s Saturation - 65536 based Number, converted to 0.1 - 1 where 1 is 100%
   @param  [Number} v Value/Brightness - 65536 based Number, converted to 0.1 - 1 where 1 is 100%
 */
    Color.prototype.hsb = function(name, h, s, b) {
        function HSVtoRGB(h, s, v) {
            h = Math.floor((h / 65535) * 360) / 360;
            s = Math.floor((s / 65535) * 100) / 100;
            v = Math.floor((v / 65535) * 100) / 100;

            var r, g, b, i, f, p, q, t;
            if (h && s === undefined && v === undefined) {
                s = h.s, v = h.v, h = h.h;
            }
            i = Math.floor(h * 6);
            f = h * 6 - i;
            p = v * (1 - s);
            q = v * (1 - f * s);
            t = v * (1 - (1 - f) * s);

            switch (i % 6) {
                case 0:
                    r = v, g = t, b = p;
                    break;
                case 1:
                    r = q, g = v, b = p;
                    break;
                case 2:
                    r = p, g = v, b = t;
                    break;
                case 3:
                    r = p, g = q, b = v;
                    break;
                case 4:
                    r = t, g = p, b = v;
                    break;
                case 5:
                    r = v, g = p, b = q;
                    break;
            }

            return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
        }

        this.name = name;
        this.originFormat = 'HSB';
        this.origin = [h, s, b];
        this.rgb = HSVtoRGB(h, s, b);
        this.hash = rgb2Hash(this.rgb);

    };

    /**
     * AcoImport Class
     *
     * @class AcoImport
     * @private
     * @constructor
     */
    var AcoImport = function() {
        /**
         * Swatchfile Versionnumber
         * @property version
         * @type {Number}
         */
        this.version;

        /**
         * Amount of Colors
         * @property amount
         * @type {Number}
         * @default 0
         */
        this.amount = 0;

        /**
         * Array for Colorobjects
         * @property colors
         * @type {Array}
         * @default []
         */
        this.colors = [];

        /**
         * How many Colors were converted from CMYK to RGB ?
         *
         * @property converted
         * @type {Number}
         * @default 0
         */
        this.converted = 0;

        /**
         * Skipped Colors, no Converter found
         *
         * @property skipped
         * @type {Number}
         * @default 0
         */
        this.skipped = 0;

        /**
         * ByteIndex
         * @property byteIndex
         * @type {Number}
         * @default 0
         */
        this.byteIndex = 0;

        /**
         * Error indicator
         * @type {Boolean}
         * @property {Bool} error
         * @default false
         */
        this.error = false;
    };

    /**
     * Read the Head of the Binary File
     *
     * @method _readHead
     * @param  {jDataView Object} a Data Container
     * @return {Bool} True when Version fits (2), false when not
     * @private
     * @throws {wrongformatException} if Versionnumer is not 2
     */
    AcoImport.prototype._readHead = function(a) {
        try {
            var count = a.getInt16(2);
            var versionIndex = (count * 10) + 5;

            if (a.getInt8(versionIndex) !== 2) {
                this.error = true;
                throw new wrongFormatException('Given binary data is not in an valid ACO Format');
            }

            this.amount = count;
            this.byteIndex = (count * 10) + 9;

        } catch (e) {
            this.error = true;
            throw new wrongFormatException('Given binary data is not in an valid ACO Format');
        }

        return true;
    };

    /**
     * Get the String of the Current Colorspace
     *
     * @method getColorSpace
     * @param  {Number} value 0 - 10
     * @return {String} Name of Colorspace
     */
    AcoImport.prototype.getColorSpace = function(value) {

        var cs = {
            0: 'RGB',
            1: 'HSB',
            2: 'CMYK',
            3: 'PANTONE',
            4: 'FOCOLTONE',
            5: 'TRUMATCH',
            6: 'TOYO88',
            7: 'LAB',
            8: 'GREYSCALE',
            10: 'HKS'
        };

        if (typeof cs[value] !== 'undefined') {
            return cs[value];
        }

        return 'INVALID COLORSPACE BYTE [' + value + ']';
    };

    /**
     * Reading the Colorchunks of Binary File and save them as individual Color Objects
     *
     * @method getColors
     * @param  {jDataView Object} Data Container
     * @return {Array} Array with Color Objects inside
     */
    AcoImport.prototype.getColors = function(data) {
        var step;

        try {
            this._readHead(data);

            for (var i = 0; i < this.amount; i++) {
                step = this.byteIndex;

                var color = null,

                    //#TODO: investigate - really Int8 ?
                    colorspace = this.getColorSpace(data.getInt8(step)),
                    fnlen = data.getInt32(step + 9) * 2,
                    fieldname = decodeUtfString(data.getString(fnlen, step + 13));

                switch (colorspace) {
                    case 'RGB':
                        color = new Color('aco');
                        color.rgb(
                            fieldname,
                            data.getUint16(step + 1),
                            data.getUint16(step + 3),
                            data.getUint16(step + 5)
                        );
                        break;

                    case 'CMYK':
                        this.converted++;

                        color = new Color('aco');
                        color.cmyk(
                            fieldname,
                            data.getUint16(step + 1),
                            data.getUint16(step + 3),
                            data.getUint16(step + 5),
                            data.getUint16(step + 7)
                        );
                        break;

                    case 'HSB':
                        color = new Color('aco');
                        color.hsb(
                            fieldname,
                            data.getUint16(step + 1),
                            data.getUint16(step + 3),
                            data.getUint16(step + 5)
                        );
                        break;

                    default:
                        this.skipped++,
                        console.log('Colorspace ' + colorspace + ' not supported - skipping Color');
                        break;
                }

                if (color !== null) {
                    this.colors.push(color);
                }
                // Skipping dynamic Text bytes and additional 14 for the things we already processed
                this.byteIndex = this.byteIndex + fnlen + 14;
            }

            return this.colors;

        } catch (e) {
            console.error(e.consoleoutput);
            throw e;
        }
    };

    /**
     * AseImport Class
     *
     * @class  AseImport
     * @constructor
     * @private
     */
    function AseImport() {
        /**
         * Swatchfile Versionnumber
         * @property version
         * @type {Number}
         */
        this.version;

        /**
         * Amount of Colors
         * @property amount
         * @type {Number}
         */
        this.amount = 0;

        /**
         * Array for Colorobjects
         * @property colors
         * @type {Array}
         */
        this.colors = [];

        /**
         * Was there an CMYK Conversion during the extract
         * @property converted
         * @type {Boolean}
         */
        this.converted = false;

        /**
         * ByteIndex
         * @property byteIndex
         * @type {Number}
         */
        this.byteIndex = 0;

        /**
         * Error indicator
         * @type {Boolean}
         * @property {Bool} error
         * @default false
         */
        this.error = false;
    }

    /**
     * Read the Head of the Binary File
     *
     * @method _readHead
     * @param  {jDataView Object} a Data Container
     * @return {Bool} True when Format fits (first 4 Byte ASEF) False when not
     * @private
     * @throws {wrongFormatException} If first 4 Bytes are not the ASEF String
     */
    AseImport.prototype._readHead = function(data) {
        try {
            var format = data.getString(4, 0);
            this.version = data.getUint16(4) + data.getUint16(6);
            this.amount = data.getUint32(8);
            this.byteIndex = 16;
            if (format !== 'ASEF') {
                this.error = true;
                throw new wrongFormatException('Given binary data is not in an valid ASE Format');
            }
        } catch (e) {
            this.error = true;
            throw new wrongFormatException('Given binary data is not in an valid ASE Format');
        }
    };

    /**
     * Reading the Colorchunks of Binary File and save them as individual Color Objects
     *
     * @method getColors
     * @param  {jDataView Object} Data Container
     * @return {Array} Array with Color Objects inside
     */
    AseImport.prototype.getColors = function(data) {
        var step;

        try {

            this._readHead(data);

            for (var i = 0; i < this.amount; i++) {

                var color = null;
                step = this.byteIndex;
                var chunkLen = data.getUint16(step);
                var fnlen = data.getUint16(step + 2) * 2;

                // Skip processed bytes for lengths
                step = step + 4;

                var fieldname = decodeUtfString(data.getString(fnlen, step));
                var colorspace = data.getString(4, step + fnlen).trim();

                // Skip processed Fieldname bytes
                step = step + fnlen + 4;

                switch (colorspace) {
                    // No need for hsv - simply because there is no hsv format for ASE
                    case 'RGB':
                        color = new Color('ase');
                        color.rgb(
                            fieldname,
                            data.getFloat32(step),
                            data.getFloat32(step + 4),
                            data.getFloat32(step + 8)
                        );
                        break;

                    case 'CMYK':
                        this.converted++;
                        color = new Color('ase');
                        color.cmyk(
                            fieldname,
                            data.getFloat32(step),
                            data.getFloat32(step + 4),
                            data.getFloat32(step + 8),
                            data.getFloat32(step + 12)
                        );

                        break;

                    default:
                        this.skipped++,
                        console.log('Colorspace ' + colorspace + ' not supported - skipping Color');
                        break;

                }

                if (color !== null) {
                    this.colors.push(color);
                }

                // 2 = skip String Terminating
                this.byteIndex = this.byteIndex + chunkLen + 6;
            }

            return this.colors;
        } catch (e) {
            console.error(e.consoleoutput);
            throw e;
        }
    };

    /**
     * SwatchImporter Function, Exposes API
     *
     * @param {String} type ACO or ASE
     * @return {Class Instance} Class Instance of aco or ase
     */
    function SwatchImporter(type) {
        switch (type) {
            case 'aco':
                return new AcoImport();

            case 'ase':
                return new AseImport();
        }
    }

    return SwatchImporter;


});