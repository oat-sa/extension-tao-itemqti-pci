(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Mathml2latex = factory());
})(this, (function () { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var dist = {exports: {}};

	var main = {};

	var mathmlToLatex = {};

	var mathmlElementToLatexConverterAdapter = {};

	var converters = {};

	var math = {};

	var mathmlElementToLatexConverter = {};

	var hasRequiredMathmlElementToLatexConverter;

	function requireMathmlElementToLatexConverter () {
		if (hasRequiredMathmlElementToLatexConverter) return mathmlElementToLatexConverter;
		hasRequiredMathmlElementToLatexConverter = 1;
		Object.defineProperty(mathmlElementToLatexConverter, "__esModule", { value: true });
		mathmlElementToLatexConverter.mathMLElementToLaTeXConverter = void 0;
		var mathml_element_to_latex_converter_adapter_1 = requireMathmlElementToLatexConverterAdapter();
		var mathMLElementToLaTeXConverter = function (mathMLElement) {
		    return new mathml_element_to_latex_converter_adapter_1.MathMLElementToLatexConverterAdapter(mathMLElement).toLatexConverter();
		};
		mathmlElementToLatexConverter.mathMLElementToLaTeXConverter = mathMLElementToLaTeXConverter;
		return mathmlElementToLatexConverter;
	}

	var normalizeWhitespace = {};

	Object.defineProperty(normalizeWhitespace, "__esModule", { value: true });
	normalizeWhitespace.normalizeWhiteSpaces = void 0;
	var normalizeWhiteSpaces = function (str) {
	    return str.replace(/\s+/g, ' ');
	};
	normalizeWhitespace.normalizeWhiteSpaces = normalizeWhiteSpaces;

	var hasRequiredMath;

	function requireMath () {
		if (hasRequiredMath) return math;
		hasRequiredMath = 1;
		Object.defineProperty(math, "__esModule", { value: true });
		math.Math = void 0;
		var mathml_element_to_latex_converter_1 = requireMathmlElementToLatexConverter();
		var normalize_whitespace_1 = normalizeWhitespace;
		var Math = /** @class */ (function () {
		    function Math(mathElement) {
		        this._mathmlElement = mathElement;
		    }
		    Math.prototype.convert = function () {
		        var unnormalizedLatex = this._mathmlElement.children
		            .map(function (child) { return (0, mathml_element_to_latex_converter_1.mathMLElementToLaTeXConverter)(child); })
		            .map(function (converter) { return converter.convert(); })
		            .join('');
		        return (0, normalize_whitespace_1.normalizeWhiteSpaces)(unnormalizedLatex);
		    };
		    return Math;
		}());
		math.Math = Math;
		return math;
	}

	var mi = {};

	var helpers = {};

	var wrappers = {};

	var bracket = {};

	var wrapper = {};

	Object.defineProperty(wrapper, "__esModule", { value: true });
	wrapper.Wrapper = void 0;
	var Wrapper = /** @class */ (function () {
	    function Wrapper(open, close) {
	        this._open = open;
	        this._close = close;
	    }
	    Wrapper.prototype.wrap = function (str) {
	        return this._open + str + this._close;
	    };
	    return Wrapper;
	}());
	wrapper.Wrapper = Wrapper;

	Object.defineProperty(bracket, "__esModule", { value: true });
	bracket.BracketWrapper = void 0;
	var wrapper_1$2 = wrapper;
	var BracketWrapper = /** @class */ (function () {
	    function BracketWrapper() {
	        this._open = '{';
	        this._close = '}';
	    }
	    BracketWrapper.prototype.wrap = function (str) {
	        return new wrapper_1$2.Wrapper(this._open, this._close).wrap(str);
	    };
	    return BracketWrapper;
	}());
	bracket.BracketWrapper = BracketWrapper;

	var parenthesis = {};

	Object.defineProperty(parenthesis, "__esModule", { value: true });
	parenthesis.ParenthesisWrapper = void 0;
	var wrapper_1$1 = wrapper;
	var ParenthesisWrapper = /** @class */ (function () {
	    function ParenthesisWrapper() {
	        this._open = '\\left(';
	        this._close = '\\right)';
	        this._closed = /^(\\left\(\\right.).*(\\left.\\right\))$/i;
	    }
	    ParenthesisWrapper.prototype.wrap = function (str) {
	        return new wrapper_1$1.Wrapper(this._open, this._close).wrap(str);
	    };
	    ParenthesisWrapper.prototype.wrapIfMoreThanOneChar = function (str) {
	        if (str.length <= 1 || this._closed.test(str) == true)
	            return str;
	        return this.wrap(str);
	    };
	    return ParenthesisWrapper;
	}());
	parenthesis.ParenthesisWrapper = ParenthesisWrapper;

	var generic = {};

	Object.defineProperty(generic, "__esModule", { value: true });
	generic.GenericWrapper = void 0;
	var wrapper_1 = wrapper;
	var GenericWrapper = /** @class */ (function () {
	    function GenericWrapper(open, close) {
	        this._open = '\\left' + open;
	        this._close = '\\right' + close;
	    }
	    GenericWrapper.prototype.wrap = function (str) {
	        return new wrapper_1.Wrapper(this._open, this._close).wrap(str);
	    };
	    return GenericWrapper;
	}());
	generic.GenericWrapper = GenericWrapper;

	(function (exports) {
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.GenericWrapper = exports.ParenthesisWrapper = exports.BracketWrapper = void 0;
		var bracket_1 = bracket;
		Object.defineProperty(exports, "BracketWrapper", { enumerable: true, get: function () { return bracket_1.BracketWrapper; } });
		var parenthesis_1 = parenthesis;
		Object.defineProperty(exports, "ParenthesisWrapper", { enumerable: true, get: function () { return parenthesis_1.ParenthesisWrapper; } });
		var generic_1 = generic;
		Object.defineProperty(exports, "GenericWrapper", { enumerable: true, get: function () { return generic_1.GenericWrapper; } });
	} (wrappers));

	var joinWithManySeparators = {};

	Object.defineProperty(joinWithManySeparators, "__esModule", { value: true });
	joinWithManySeparators.JoinWithManySeparators = void 0;
	var JoinWithManySeparators = /** @class */ (function () {
	    function JoinWithManySeparators(separators) {
	        this._separators = separators;
	    }
	    JoinWithManySeparators.join = function (arr, separators) {
	        return new JoinWithManySeparators(separators)._join(arr);
	    };
	    JoinWithManySeparators.prototype._join = function (arr) {
	        var _this = this;
	        return arr.reduce(function (joinedStr, currentStr, currentIndex, strArr) {
	            var separator = currentIndex === strArr.length - 1 ? '' : _this._get(currentIndex);
	            return joinedStr + currentStr + separator;
	        }, '');
	    };
	    JoinWithManySeparators.prototype._get = function (index) {
	        if (this._separators[index])
	            return this._separators[index];
	        return this._separators.length > 0 ? this._separators[this._separators.length - 1] : ',';
	    };
	    return JoinWithManySeparators;
	}());
	joinWithManySeparators.JoinWithManySeparators = JoinWithManySeparators;

	var hasRequiredHelpers;

	function requireHelpers () {
		if (hasRequiredHelpers) return helpers;
		hasRequiredHelpers = 1;
		(function (exports) {
			var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
			    if (k2 === undefined) k2 = k;
			    var desc = Object.getOwnPropertyDescriptor(m, k);
			    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
			      desc = { enumerable: true, get: function() { return m[k]; } };
			    }
			    Object.defineProperty(o, k2, desc);
			}) : (function(o, m, k, k2) {
			    if (k2 === undefined) k2 = k;
			    o[k2] = m[k];
			}));
			var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
			    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
			};
			Object.defineProperty(exports, "__esModule", { value: true });
			__exportStar(wrappers, exports);
			__exportStar(joinWithManySeparators, exports);
			__exportStar(requireMathmlElementToLatexConverter(), exports);
			__exportStar(normalizeWhitespace, exports);
	} (helpers));
		return helpers;
	}

	var syntax = {};

	var allMathOperatorsByChar = {};

	Object.defineProperty(allMathOperatorsByChar, "__esModule", { value: true });
	allMathOperatorsByChar.allMathOperatorsByChar = void 0;
	allMathOperatorsByChar.allMathOperatorsByChar = {
	    _: '\\underline',
	    '&#x23E1;': '\\underbrace',
	    '&#x23E0;': '\\overbrace',
	    '&#x23DF;': '\\underbrace',
	    '&#x23DE;': '\\overbrace',
	    '&#x23DD;': '\\underbrace',
	    '&#x23DC;': '\\overbrace',
	    '&#x23B5;': '\\underbrace',
	    '&#x23B4;': '\\overbrace',
	    '&#x20DC;': '\\square',
	    '&#x20DB;': '\\square',
	    '&#x2064;': '',
	    '&#x2057;': "''''",
	    '&#x203E;': '\\bar',
	    '&#x2037;': '```',
	    '&#x2036;': '``',
	    '&#x2035;': '`',
	    '&#x2034;': "'''",
	    '&#x2033;': "''",
	    '&#x201F;': '``',
	    '&#x201E;': ',,',
	    '&#x201B;': '`',
	    '&#x201A;': ',',
	    '&#x302;': '\\hat',
	    '&#x2F7;': '\\sim',
	    '&#x2DD;': '\\sim',
	    '&#x2DC;': '\\sim',
	    '&#x2DA;': '\\circ',
	    '&#x2D9;': '\\cdot',
	    '&#x2D8;': '',
	    '&#x2CD;': '\\_',
	    '&#x2CB;': 'ˋ',
	    '&#x2CA;': 'ˊ',
	    '&#x2C9;': 'ˉ',
	    '&#x2C7;': '',
	    '&#x2C6;': '\\hat',
	    '&#xBA;': 'o',
	    '&#xB9;': '1',
	    '&#xB8;': '¸',
	    '&#xB4;': '´',
	    '&#xB3;': '3',
	    '&#xB2;': '2',
	    '&#xB0;': '\\circ',
	    '&#xAF;': '\\bar',
	    '&#xAA;': 'a',
	    '&#xA8;': '\\cdot\\cdot',
	    '~': '\\sim',
	    '`': '`',
	    '^': '\\hat',
	    '--': '--',
	    '++': '++',
	    '&amp;': '\\&',
	    '&#x2061;': '',
	    '&#x221C;': '\\sqrt[4]{}',
	    '&#x221B;': '\\sqrt[3]{}',
	    '&#x221A;': '\\sqrt{}',
	    '&#x2146;': 'd',
	    '&#x2145;': '\\mathbb{D}',
	    '?': '?',
	    '@': '@',
	    '//': '//',
	    '!!': '!!',
	    '!': '!',
	    '&#x266F;': '\\#',
	    '&#x266E;': '',
	    '&#x266D;': '',
	    '&#x2032;': "'",
	    '&lt;>': '<>',
	    '**': '\\star\\star',
	    '&#x2207;': '\\nabla',
	    '&#x2202;': '\\partial',
	    '&#x2299;': '\\bigodot',
	    '&#xAC;': '\\neg',
	    '&#x2222;': '\\measuredangle',
	    '&#x2221;': '\\measuredangle',
	    '&#x2220;': '\\angle',
	    '&#xF7;': '\\div',
	    '/': '/',
	    '&#x2216;': '\\backslash',
	    '\\': '\\backslash',
	    '%': '\\%',
	    '&#x2297;': '\\bigotimes',
	    '&#xB7;': '\\cdot',
	    '&#x2A3F;': '\\coprod',
	    '&#x2A2F;': '\\times',
	    '&#x22C5;': '\\cdot',
	    '&#x22A1;': '\\boxdot',
	    '&#x22A0;': '\\boxtimes',
	    '&#x2062;': '',
	    '&#x2043;': '-',
	    '&#x2022;': '\\cdot',
	    '&#xD7;': '\\times',
	    '.': '.',
	    '*': '\\star',
	    '&#x222A;': '\\cup',
	    '&#x2229;': '\\cap',
	    '&#x2210;': '\\coprod',
	    '&#x220F;': '\\prod',
	    '&#x2240;': '',
	    '&#x2AFF;': '',
	    '&#x2AFC;': '\\mid\\mid\\mid',
	    '&#x2A09;': '\\times',
	    '&#x2A08;': '',
	    '&#x2A07;': '',
	    '&#x2A06;': '\\sqcup',
	    '&#x2A05;': '\\sqcap',
	    '&#x2A02;': '\\otimes',
	    '&#x2A00;': '\\odot',
	    '&#x22C2;': '\\cap',
	    '&#x22C1;': '\\vee',
	    '&#x22C0;': '\\wedge',
	    '&#x2A04;': '\\uplus',
	    '&#x2A03;': '\\cup',
	    '&#x22C3;': '\\cup',
	    '&#x2A1C;': '\\underline{\\int}',
	    '&#x2A1B;': '\\overline{\\int}',
	    '&#x2A1A;': '\\int',
	    '&#x2A19;': '\\int',
	    '&#x2A18;': '\\int',
	    '&#x2A17;': '\\int',
	    '&#x2A16;': '\\oint',
	    '&#x2A15;': '\\oint',
	    '&#x2A14;': '\\int',
	    '&#x2A13;': '\\int',
	    '&#x2A12;': '\\int',
	    '&#x2A11;': '\\int',
	    '&#x2A10;': '\\int',
	    '&#x2A0F;': '\\bcancel{\\int}',
	    '&#x2A0E;': '',
	    '&#x2A0D;': '\\hcancel{\\int}',
	    '&#x2A0C;': '\\iiiint',
	    '&#x2233;': '\\oint',
	    '&#x2232;': '\\oint',
	    '&#x2231;': '\\int',
	    '&#x2230;': '\\oiint',
	    '&#x222F;': '\\oiint',
	    '&#x222E;': '\\oint',
	    '&#x222B;': '\\int',
	    '&#x2A01;': '\\oplus',
	    '&#x2298;': '\\oslash',
	    '&#x2296;': '\\ominus',
	    '&#x2295;': '\\oplus',
	    '&#x222D;': '\\iiint',
	    '&#x222C;': '\\iint',
	    '&#x2A0B;': '',
	    '&#x2A0A;': '',
	    '&#x2211;': '\\sum',
	    '&#x229F;': '\\boxminus',
	    '&#x229E;': '\\boxplus',
	    '&#x2214;': '\\dot{+}',
	    '&#x2213;': '+-',
	    '&#x2212;': '-',
	    '&#xB1;': '\\pm',
	    '-': '-',
	    '+': '+',
	    '&#x2B46;': '\\Rrightarrow',
	    '&#x2B45;': '\\Lleftarrow',
	    '&#x29F4;': ':\\rightarrow',
	    '&#x29EF;': '',
	    '&#x29DF;': '\\bullet-\\bullet',
	    '&#x299F;': '\\angle',
	    '&#x299E;': '\\measuredangle',
	    '&#x299D;': '\\measuredangle',
	    '&#x299C;': '\\perp',
	    '&#x299B;': '\\measuredangle',
	    '&#x299A;': '',
	    '&#x2999;': '\\vdots',
	    '&#x297F;': '',
	    '&#x297E;': '',
	    '&#x297D;': '\\prec',
	    '&#x297C;': '\\succ',
	    '&#x297B;': '\\underset{\\rightarrow}{\\supset}',
	    '&#x297A;': '',
	    '&#x2979;': '\\underset{\\rightarrow}{\\subset}',
	    '&#x2978;': '\\underset{\\rightarrow}{>}',
	    '&#x2977;': '',
	    '&#x2976;': '\\underset{\\leftarrow}{<}',
	    '&#x2975;': '\\underset{\\approx}{\\rightarrow}',
	    '&#x2974;': '\\underset{\\sim}{\\rightarrow}',
	    '&#x2973;': '\\underset{\\sim}{\\leftarrow}',
	    '&#x2972;': '\\overset{\\sim}{\\rightarrow}',
	    '&#x2971;': '\\overset{=}{\\rightarrow}',
	    '&#x2970;': '',
	    '&#x296F;': '',
	    '&#x296E;': '',
	    '&#x296D;': '\\overline{\\rightharpoondown}',
	    '&#x296C;': '\\underline{\\rightharpoonup}',
	    '&#x296B;': '\\overline{\\leftharpoondown}',
	    '&#x296A;': '\\underline{\\leftharpoonup}',
	    '&#x2969;': '\\rightleftharpoons',
	    '&#x2968;': '\\rightleftharpoons',
	    '&#x2967;': '\\rightleftharpoons',
	    '&#x2966;': '\\rightleftharpoons',
	    '&#x2965;': '\\Downarrow',
	    '&#x2964;': '\\Rightarrow',
	    '&#x2963;': '\\Uparrow',
	    '&#x2962;': '\\Leftarrow',
	    '&#x2961;': '\\downarrow',
	    '&#x2960;': '\\uparrow',
	    '&#x295F;': '\\rightarrow',
	    '&#x295E;': '\\leftarrow',
	    '&#x295D;': '\\downarrow',
	    '&#x295C;': '\\uparrow',
	    '&#x295B;': '\\rightarrow',
	    '&#x295A;': '\\leftarrow',
	    '&#x2959;': '\\downarrow',
	    '&#x2958;': '\\uparrow',
	    '&#x2957;': '\\rightarrow',
	    '&#x2956;': '\\leftarrow',
	    '&#x2955;': '\\downarrow',
	    '&#x2954;': '\\uparrow',
	    '&#x2953;': '\\rightarrow',
	    '&#x2952;': '\\leftarrow',
	    '&#x2951;': '\\updownarrow',
	    '&#x2950;': '\\leftrightarrow',
	    '&#x294F;': '\\updownarrow',
	    '&#x294E;': '\\leftrightarrow',
	    '&#x294D;': '\\updownarrow',
	    '&#x294C;': '\\updownarrow',
	    '&#x294B;': '\\leftrightarrow',
	    '&#x294A;': '\\leftrightarrow',
	    '&#x2949;': '',
	    '&#x2948;': '\\leftrightarrow',
	    '&#x2947;': '\\nrightarrow',
	    '&#x2946;': '',
	    '&#x2945;': '',
	    '&#x2944;': '\\rightleftarrows',
	    '&#x2943;': '\\leftrightarrows',
	    '&#x2942;': '\\rightleftarrows',
	    '&#x2941;': '\\circlearrowright',
	    '&#x2940;': '\\circlearrowleft',
	    '&#x293F;': '\\rightarrow',
	    '&#x293E;': '\\leftarrow',
	    '&#x293D;': '',
	    '&#x293C;': '',
	    '&#x293B;': '',
	    '&#x293A;': '',
	    '&#x2939;': '',
	    '&#x2938;': '',
	    '&#x2937;': '\\Rsh',
	    '&#x2936;': '\\Lsh',
	    '&#x2935;': '\\downarrow',
	    '&#x2934;': '\\uparrow',
	    '&#x2933;': '\\leadsto',
	    '&#x2932;': '',
	    '&#x2931;': '',
	    '&#x2930;': '',
	    '&#x292F;': '',
	    '&#x292E;': '',
	    '&#x292D;': '',
	    '&#x292C;': '\\times',
	    '&#x292B;': '\\times',
	    '&#x292A;': '',
	    '&#x2929;': '',
	    '&#x2928;': '',
	    '&#x2927;': '',
	    '&#x2926;': '',
	    '&#x2925;': '',
	    '&#x2924;': '',
	    '&#x2923;': '',
	    '&#x2922;': '',
	    '&#x2921;': '',
	    '&#x2920;': '\\mapsto\\cdot',
	    '&#x291F;': '\\cdot\\leftarrow',
	    '&#x291E;': '\\rightarrow\\cdot',
	    '&#x291D;': '\\leftarrow',
	    '&#x291C;': '\\rightarrow',
	    '&#x291B;': '\\leftarrow',
	    '&#x291A;': '\\rightarrow',
	    '&#x2919;': '\\leftarrow',
	    '&#x2918;': '\\rightarrow',
	    '&#x2917;': '\\rightarrow',
	    '&#x2916;': '\\rightarrow',
	    '&#x2915;': '\\rightarrow',
	    '&#x2914;': '\\rightarrow',
	    '&#x2913;': '\\downarrow',
	    '&#x2912;': '\\uparrow',
	    '&#x2911;': '\\rightarrow',
	    '&#x2910;': '\\rightarrow',
	    '&#x290F;': '\\rightarrow',
	    '&#x290E;': '\\leftarrow',
	    '&#x290D;': '\\rightarrow',
	    '&#x290C;': '\\leftarrow',
	    '&#x290B;': '\\Downarrow',
	    '&#x290A;': '\\Uparrow',
	    '&#x2909;': '\\uparrow',
	    '&#x2908;': '\\downarrow',
	    '&#x2907;': '\\Rightarrow',
	    '&#x2906;': '\\Leftarrow',
	    '&#x2905;': '\\mapsto',
	    '&#x2904;': '\\nLeftrightarrow',
	    '&#x2903;': '\\nRightarrow',
	    '&#x2902;': '\\nLeftarrow',
	    '&#x2901;': '\\rightsquigarrow',
	    '&#x2900;': '\\rightsquigarrow',
	    '&#x27FF;': '\\rightsquigarrow',
	    '&#x27FE;': '\\Rightarrow',
	    '&#x27FD;': '\\Leftarrow',
	    '&#x27FC;': '\\mapsto',
	    '&#x27FB;': '\\leftarrow',
	    '&#x27FA;': '\\Longleftrightarrow',
	    '&#x27F9;': '\\Longrightarrow',
	    '&#x27F8;': '\\Longleftarrow',
	    '&#x27F7;': '\\leftrightarrow',
	    '&#x27F6;': '\\rightarrow',
	    '&#x27F5;': '\\leftarrow',
	    '&#x27F1;': '\\Downarrow',
	    '&#x27F0;': '\\Uparrow',
	    '&#x22B8;': '\\rightarrow',
	    '&#x21FF;': '\\leftrightarrow',
	    '&#x21FE;': '\\rightarrow',
	    '&#x21FD;': '\\leftarrow',
	    '&#x21FC;': '\\nleftrightarrow',
	    '&#x21FB;': '\\nrightarrow',
	    '&#x21FA;': '\\nleftarrow',
	    '&#x21F9;': '\\nleftrightarrow',
	    '&#x21F8;': '\\nrightarrow',
	    '&#x21F7;': '\\nleftarrow',
	    '&#x21F6;': '\\Rrightarrow',
	    '&#x21F5;': '',
	    '&#x21F4;': '\\rightarrow',
	    '&#x21F3;': '\\Updownarrow',
	    '&#x21F2;': '\\searrow',
	    '&#x21F1;': '\\nwarrow',
	    '&#x21F0;': '\\Leftarrow',
	    '&#x21EF;': '\\Uparrow',
	    '&#x21EE;': '\\Uparrow',
	    '&#x21ED;': '\\Uparrow',
	    '&#x21EC;': '\\Uparrow',
	    '&#x21EB;': '\\Uparrow',
	    '&#x21EA;': '\\Uparrow',
	    '&#x21E9;': '\\Downarrow',
	    '&#x21E8;': '\\Rightarrow',
	    '&#x21E7;': '\\Uparrow',
	    '&#x21E6;': '\\Leftarrow',
	    '&#x21E5;': '\\rightarrow',
	    '&#x21E4;': '\\leftarrow',
	    '&#x21E3;': '\\downarrow',
	    '&#x21E2;': '\\rightarrow',
	    '&#x21E1;': '\\uparrow',
	    '&#x21E0;': '\\leftarrow',
	    '&#x21DF;': '\\downarrow',
	    '&#x21DE;': '\\uparrow',
	    '&#x21DD;': '\\rightsquigarrow',
	    '&#x21DC;': '\\leftarrow',
	    '&#x21DB;': '\\Rrightarrow',
	    '&#x21DA;': '\\Lleftarrow',
	    '&#x21D9;': '\\swarrow',
	    '&#x21D8;': '\\searrow',
	    '&#x21D7;': '\\nearrow',
	    '&#x21D6;': '\\nwarrow',
	    '&#x21D5;': '\\Updownarrow',
	    '&#x21D4;': '\\Leftrightarrow',
	    '&#x21D3;': '\\Downarrow',
	    '&#x21D2;': '\\Rightarrow',
	    '&#x21D1;': '\\Uparrow',
	    '&#x21D0;': '\\Leftarrow',
	    '&#x21CF;': '\\nRightarrow',
	    '&#x21CE;': '\\nLeftrightarrow',
	    '&#x21CD;': '\\nLeftarrow',
	    '&#x21CC;': '\\rightleftharpoons',
	    '&#x21CB;': '\\leftrightharpoons',
	    '&#x21CA;': '\\downdownarrows',
	    '&#x21C9;': '\\rightrightarrows',
	    '&#x21C8;': '\\upuparrows',
	    '&#x21C7;': '\\leftleftarrows',
	    '&#x21C6;': '\\leftrightarrows',
	    '&#x21C5;': '',
	    '&#x21C4;': '\\rightleftarrows',
	    '&#x21C3;': '\\downharpoonleft',
	    '&#x21C2;': '\\downharpoonright',
	    '&#x21C1;': '\\rightharpoondown',
	    '&#x21C0;': '\\rightharpoonup',
	    '&#x21BF;': '\\upharpoonleft',
	    '&#x21BE;': '\\upharpoonright',
	    '&#x21BD;': '\\leftharpoondown',
	    '&#x21BC;': '\\leftharpoonup',
	    '&#x21BB;': '\\circlearrowright',
	    '&#x21BA;': '\\circlearrowleft',
	    '&#x21B9;': '\\leftrightarrows',
	    '&#x21B8;': '\\overline{\\nwarrow}',
	    '&#x21B7;': '\\curvearrowright',
	    '&#x21B6;': '\\curvearrowleft',
	    '&#x21B5;': '\\swarrow',
	    '&#x21B4;': '\\searrow',
	    '&#x21B3;': '\\Rsh',
	    '&#x21B2;': '\\Lsh',
	    '&#x21B1;': '\\Rsh',
	    '&#x21B0;': '\\Lsh',
	    '&#x21AF;': '\\swarrow',
	    '&#x21AE;': '',
	    '&#x21AD;': '\\leftrightsquigarrow',
	    '&#x21AC;': '\\looparrowright',
	    '&#x21AB;': '\\looparrowleft',
	    '&#x21AA;': '\\hookrightarrow',
	    '&#x21A9;': '\\hookleftarrow',
	    '&#x21A8;': '\\underline{\\updownarrow}',
	    '&#x21A7;': '\\downarrow',
	    '&#x21A6;': '\\rightarrowtail',
	    '&#x21A5;': '\\uparrow',
	    '&#x21A4;': '\\leftarrowtail',
	    '&#x21A3;': '\\rightarrowtail',
	    '&#x21A2;': '\\leftarrowtail',
	    '&#x21A1;': '\\downarrow',
	    '&#x21A0;': '\\twoheadrightarrow',
	    '&#x219F;': '\\uparrow',
	    '&#x219E;': '\\twoheadleftarrow',
	    '&#x219D;': '\\nearrow',
	    '&#x219C;': '\\nwarrow',
	    '&#x219B;': '',
	    '&#x219A;': '',
	    '&#x2199;': '\\swarrow',
	    '&#x2198;': '\\searrow',
	    '&#x2197;': '\\nearrow',
	    '&#x2196;': '\\nwarrow',
	    '&#x2195;': '\\updownarrow',
	    '&#x2194;': '\\leftrightarrow',
	    '&#x2193;': '\\downarrow',
	    '&#x2192;': '\\rightarrow',
	    '&#x2191;': '\\uparrow',
	    '&#x2190;': '\\leftarrow',
	    '|||': '\\left|||\\right.',
	    '||': '\\left||\\right.',
	    '|': '\\left|\\right.',
	    '&#x2AFE;': '',
	    '&#x2AFD;': '//',
	    '&#x2AFB;': '///',
	    '&#x2AFA;': '',
	    '&#x2AF9;': '',
	    '&#x2AF8;': '',
	    '&#x2AF7;': '',
	    '&#x2AF6;': '\\vdots',
	    '&#x2AF5;': '',
	    '&#x2AF4;': '',
	    '&#x2AF3;': '',
	    '&#x2AF2;': '\\nparallel',
	    '&#x2AF1;': '',
	    '&#x2AF0;': '',
	    '&#x2AEF;': '',
	    '&#x2AEE;': '\\bcancel{\\mid}',
	    '&#x2AED;': '',
	    '&#x2AEC;': '',
	    '&#x2AEB;': '',
	    '&#x2AEA;': '',
	    '&#x2AE9;': '',
	    '&#x2AE8;': '\\underline{\\perp}',
	    '&#x2AE7;': '\\overline{\\top}',
	    '&#x2AE6;': '',
	    '&#x2AE5;': '',
	    '&#x2AE4;': '',
	    '&#x2AE3;': '',
	    '&#x2AE2;': '',
	    '&#x2AE1;': '',
	    '&#x2AE0;': '\\perp',
	    '&#x2ADF;': '\\top',
	    '&#x2ADE;': '\\dashv',
	    '&#x2ADD;&#x338;': '',
	    '&#x2ADD;': '',
	    '&#x2ADB;': '\\pitchfork',
	    '&#x2ADA;': '',
	    '&#x2AD9;': '',
	    '&#x2AD8;': '',
	    '&#x2AD7;': '',
	    '&#x2AD6;': '',
	    '&#x2AD5;': '',
	    '&#x2AD4;': '',
	    '&#x2AD3;': '',
	    '&#x2AD2;': '',
	    '&#x2AD1;': '',
	    '&#x2AD0;': '',
	    '&#x2ACF;': '',
	    '&#x2ACE;': '',
	    '&#x2ACD;': '',
	    '&#x2ACC;': '\\underset{\\neq}{\\supset}',
	    '&#x2ACB;': '\\underset{\\neq}{\\subset}',
	    '&#x2ACA;': '\\underset{\\approx}{\\supset}',
	    '&#x2AC9;': '\\underset{\\approx}{\\subset}',
	    '&#x2AC8;': '\\underset{\\sim}{\\supset}',
	    '&#x2AC7;': '\\underset{\\sim}{\\subset}',
	    '&#x2AC6;': '\\supseteqq',
	    '&#x2AC5;': '\\subseteqq',
	    '&#x2AC4;': '\\dot{\\supseteq}',
	    '&#x2AC3;': '\\dot{\\subseteq}',
	    '&#x2AC2;': '\\underset{\\times}{\\supset}',
	    '&#x2AC1;': '\\underset{\\times}{\\subset}',
	    '&#x2AC0;': '\\underset{+}{\\supset}',
	    '&#x2ABF;': '\\underset{+}{\\subset}',
	    '&#x2ABE;': '',
	    '&#x2ABD;': '',
	    '&#x2ABC;': '\\gg ',
	    '&#x2ABB;': '\\ll',
	    '&#x2ABA;': '\\underset{\\cancel{\\approx}}{\\succ}',
	    '&#x2AB9;': '\\underset{\\cancel{\\approx}}{\\prec}',
	    '&#x2AB8;': '\\underset{\\approx}{\\succ}',
	    '&#x2AB7;': '\\underset{\\approx}{\\prec}',
	    '&#x2AB6;': '\\underset{\\cancel{=}}{\\succ}',
	    '&#x2AB5;': '\\underset{\\cancel{=}}{\\prec}',
	    '&#x2AB4;': '\\underset{=}{\\succ}',
	    '&#x2AB3;': '\\underset{=}{\\prec}',
	    '&#x2AB2;': '',
	    '&#x2AB1;': '',
	    '&#x2AAE;': '',
	    '&#x2AAD;': '\\underline{\\hcancel{>}}',
	    '&#x2AAC;': '\\underline{\\hcancel{>}}',
	    '&#x2AAB;': '\\hcancel{>}',
	    '&#x2AAA;': '\\hcancel{<}',
	    '&#x2AA9;': '',
	    '&#x2AA8;': '',
	    '&#x2AA7;': '\\vartriangleright',
	    '&#x2AA6;': '\\vartriangleleft',
	    '&#x2AA5;': '><',
	    '&#x2AA4;': '><',
	    '&#x2AA3;': '\\underline{\\ll}',
	    '&#x2AA2;&#x338;': '\\cancel{\\gg}',
	    '&#x2AA2;': '\\gg',
	    '&#x2AA1;&#x338;': '\\cancel{\\ll}',
	    '&#x2AA1;': '\\ll',
	    '&#x2AA0;': '\\overset{\\sim}{\\geqq}',
	    '&#x2A9F;': '\\overset{\\sim}{\\leqq}',
	    '&#x2A9E;': '\\overset{\\sim}{>}',
	    '&#x2A9D;': '\\overset{\\sim}{<}',
	    '&#x2A9C;': '',
	    '&#x2A9B;': '',
	    '&#x2A9A;': '\\overset{=}{>}',
	    '&#x2A99;': '\\overset{=}{<}',
	    '&#x2A98;': '',
	    '&#x2A97;': '',
	    '&#x2A96;': '',
	    '&#x2A95;': '',
	    '&#x2A94;': '',
	    '&#x2A93;': '',
	    '&#x2A92;': '\\underset{=}{\\gtrless}',
	    '&#x2A91;': '\\underset{=}{\\lessgtr}',
	    '&#x2A90;': '\\underset{<}{\\gtrsim}',
	    '&#x2A8F;': '\\underset{>}{\\lesssim}',
	    '&#x2A8E;': '\\underset{\\simeq}{>}',
	    '&#x2A8D;': '\\underset{\\simeq}{<}',
	    '&#x2A8C;': '\\gtreqqless',
	    '&#x2A8B;': '\\lesseqqgtr',
	    '&#x2A8A;': '\\underset{\\cancel{\\approx}}{>}',
	    '&#x2A89;': '\\underset{\\approx}{<}',
	    '&#x2A86;': '\\underset{\\approx}{>}',
	    '&#x2A85;': '\\underset{\\approx}{<}',
	    '&#x2A84;': '',
	    '&#x2A83;': '',
	    '&#x2A82;': '',
	    '&#x2A81;': '',
	    '&#x2A80;': '',
	    '&#x2A7F;': '',
	    '&#x2A7E;&#x338;': '\\bcancel{\\geq}',
	    '&#x2A7E;': '\\geq',
	    '&#x2A7D;&#x338;': '\\bcancel{\\leq}',
	    '&#x2A7D;': '\\leq',
	    '&#x2A7C;': '',
	    '&#x2A7B;': '',
	    '&#x2A7A;': '',
	    '&#x2A79;': '',
	    '&#x2A78;': '\\overset{\\dots}{\\equiv}',
	    '&#x2A77;': '',
	    '&#x2A76;': '===',
	    '&#x2A75;': '==',
	    '&#x2A74;': '::=',
	    '&#x2A73;': '',
	    '&#x2A72;': '\\underset{=}{+}',
	    '&#x2A71;': '\\overset{=}{+}',
	    '&#x2A70;': '\\overset{\\approx}{=}',
	    '&#x2A6F;': '\\overset{\\wedge}{=}',
	    '&#x2A6E;': '\\overset{*}{=}',
	    '&#x2A6D;': '\\dot{\\approx}',
	    '&#x2A6C;': '',
	    '&#x2A6B;': '',
	    '&#x2A6A;': '\\dot{\\sim}',
	    '&#x2A69;': '',
	    '&#x2A68;': '',
	    '&#x2A67;': '\\dot{\\equiv}',
	    '&#x2A66;': '\\underset{\\cdot}{=}',
	    '&#x2A65;': '',
	    '&#x2A64;': '',
	    '&#x2A63;': '\\underset{=}{\\vee}',
	    '&#x2A62;': '\\overset{=}{\\vee}',
	    '&#x2A61;': 'ul(vv)',
	    '&#x2A60;': '\\underset{=}{\\wedge}',
	    '&#x2A5F;': '\\underline{\\wedge}',
	    '&#x2A5E;': '\\overset{=}{\\wedge}',
	    '&#x2A5D;': '\\hcancel{\\vee}',
	    '&#x2A5C;': '\\hcancel{\\wedge}',
	    '&#x2A5B;': '',
	    '&#x2A5A;': '',
	    '&#x2A59;': '',
	    '&#x2A58;': '\\vee',
	    '&#x2A57;': '\\wedge',
	    '&#x2A56;': '',
	    '&#x2A55;': '',
	    '&#x2A54;': '',
	    '&#x2A53;': '',
	    '&#x2A52;': '\\dot{\\vee}',
	    '&#x2A51;': '\\dot{\\wedge}',
	    '&#x2A50;': '',
	    '&#x2A4F;': '',
	    '&#x2A4E;': '',
	    '&#x2A4D;': '\\overline{\\cap}',
	    '&#x2A4C;': '\\overline{\\cup}',
	    '&#x2A4B;': '',
	    '&#x2A4A;': '',
	    '&#x2A49;': '',
	    '&#x2A48;': '',
	    '&#x2A47;': '',
	    '&#x2A46;': '',
	    '&#x2A45;': '',
	    '&#x2A44;': '',
	    '&#x2A43;': '\\overline{\\cap}',
	    '&#x2A42;': '\\overline{\\cup}',
	    '&#x2A41;': '',
	    '&#x2A40;': '',
	    '&#x2A3E;': '',
	    '&#x2A3D;': '\\llcorner',
	    '&#x2A3C;': '\\lrcorner',
	    '&#x2A3B;': '',
	    '&#x2A3A;': '',
	    '&#x2A39;': '',
	    '&#x2A38;': '',
	    '&#x2A37;': '',
	    '&#x2A36;': '\\hat{\\otimes}',
	    '&#x2A35;': '',
	    '&#x2A34;': '',
	    '&#x2A33;': '',
	    '&#x2A32;': '\\underline{\\times}',
	    '&#x2A31;': '\\underline{\\times}',
	    '&#x2A30;': '\\dot{\\times}',
	    '&#x2A2E;': '',
	    '&#x2A2D;': '',
	    '&#x2A2C;': '',
	    '&#x2A2B;': '',
	    '&#x2A2A;': '',
	    '&#x2A29;': '',
	    '&#x2A28;': '',
	    '&#x2A27;': '',
	    '&#x2A26;': '\\underset{\\sim}{+}',
	    '&#x2A25;': '\\underset{\\circ}{+}',
	    '&#x2A24;': '\\overset{\\sim}{+}',
	    '&#x2A23;': '\\hat{+}',
	    '&#x2A22;': '\\dot{+}',
	    '&#x2A21;': '\\upharpoonright',
	    '&#x2A20;': '>>',
	    '&#x2A1F;': '',
	    '&#x2A1E;': '\\triangleleft',
	    '&#x2A1D;': '\\bowtie',
	    '&#x29FF;': '',
	    '&#x29FE;': '+',
	    '&#x29FB;': '\\hcancel{|||}',
	    '&#x29FA;': '\\hcancel{||}',
	    '&#x29F9;': '\\backslash',
	    '&#x29F8;': '/',
	    '&#x29F7;': 'hcancel{\backslash}',
	    '&#x29F6;': '',
	    '&#x29F5;': '\\backslash',
	    '&#x29F2;': '\\Phi',
	    '&#x29F1;': '',
	    '&#x29F0;': '',
	    '&#x29EE;': '',
	    '&#x29ED;': '',
	    '&#x29EC;': '',
	    '&#x29EB;': '\\lozenge',
	    '&#x29EA;': '',
	    '&#x29E9;': '',
	    '&#x29E8;': '',
	    '&#x29E7;': '\\ddagger',
	    '&#x29E2;': '\\sqcup\\sqcup',
	    '&#x29E1;': '',
	    '&#x29E0;': '\\square',
	    '&#x29DE;': '',
	    '&#x29DD;': '',
	    '&#x29DC;': '',
	    '&#x29DB;': '\\{\\{',
	    '&#x29D9;': '\\{',
	    '&#x29D8;': '\\}',
	    '&#x29D7;': '',
	    '&#x29D6;': '',
	    '&#x29D5;': '\\bowtie',
	    '&#x29D4;': '\\bowtie',
	    '&#x29D3;': '\\bowtie',
	    '&#x29D2;': '\\bowtie',
	    '&#x29D1;': '\\bowtie',
	    '&#x29D0;&#x338;': '| \\not\\triangleright',
	    '&#x29D0;': '| \\triangleright',
	    '&#x29CF;&#x338;': '\\not\\triangleleft |',
	    '&#x29CF;': '\\triangleleft |',
	    '&#x29CE;': '',
	    '&#x29CD;': '\\triangle',
	    '&#x29CC;': '',
	    '&#x29CB;': '\\underline{\\triangle}',
	    '&#x29CA;': '\\dot{\\triangle}',
	    '&#x29C9;': '',
	    '&#x29C8;': '\\boxed{\\circ}',
	    '&#x29C7;': '\\boxed{\\circ}',
	    '&#x29C6;': '\\boxed{\\rightarrow}',
	    '&#x29C5;': '\\bcancel{\\square}',
	    '&#x29C4;': '\\cancel{\\square}',
	    '&#x29C3;': '\\odot',
	    '&#x29C2;': '\\odot',
	    '&#x29BF;': '\\odot',
	    '&#x29BE;': '\\odot',
	    '&#x29BD;': '\\varnothing',
	    '&#x29BC;': '\\oplus',
	    '&#x29BB;': '\\otimes',
	    '&#x29BA;': '',
	    '&#x29B9;': '\\varnothing',
	    '&#x29B8;': '\\varnothing',
	    '&#x29B7;': '\\ominus',
	    '&#x29B6;': '\\ominus',
	    '&#x29B5;': '\\ominus',
	    '&#x29B4;': '\\vec{\\varnothing}',
	    '&#x29B3;': '\\vec{\\varnothing}',
	    '&#x29B2;': '\\dot{\\varnothing}',
	    '&#x29B1;': '\\overline{\\varnothing}',
	    '&#x29B0;': '\\varnothing',
	    '&#x29AF;': '',
	    '&#x29AE;': '',
	    '&#x29AD;': '',
	    '&#x29AC;': '',
	    '&#x29AB;': '',
	    '&#x29AA;': '',
	    '&#x29A9;': '',
	    '&#x29A8;': '',
	    '&#x29A7;': '',
	    '&#x29A6;': '',
	    '&#x29A5;': '',
	    '&#x29A4;': '',
	    '&#x29A3;': '',
	    '&#x29A2;': '',
	    '&#x29A1;': '\\not\\lor',
	    '&#x29A0;': '\\bcancel{>}',
	    '&#x2982;': ':',
	    '&#x2981;': '\\circ',
	    '&#x2758;': '|',
	    '&#x25B2;': '\\bigtriangleup',
	    '&#x22FF;': '\\Epsilon',
	    '&#x22FE;': '\\overline{\\ni}',
	    '&#x22FD;': '\\overline{\\ni}',
	    '&#x22FC;': '\\in',
	    '&#x22FB;': '\\in',
	    '&#x22FA;': '\\in',
	    '&#x22F9;': '\\underline{\\in}',
	    '&#x22F8;': '\\underline{\\in}',
	    '&#x22F7;': '\\overline{\\in}',
	    '&#x22F6;': '\\overline{\\in}',
	    '&#x22F5;': '\\dot{\\in}',
	    '&#x22F4;': '\\in',
	    '&#x22F3;': '\\in',
	    '&#x22F2;': '\\in',
	    '&#x22F0;': '\\ddots',
	    '&#x22E9;': '\\underset{\\sim}{\\succ}',
	    '&#x22E8;': '\\underset{\\sim}{\\prec}',
	    '&#x22E7;': '\\underset{\\not\\sim}{>}',
	    '&#x22E6;': '\\underset{\\not\\sim}{<}',
	    '&#x22E5;': '\\not\\sqsupseteq',
	    '&#x22E4;': '\\not\\sqsubseteq',
	    '&#x22E3;': '\\not\\sqsupseteq',
	    '&#x22E2;': '\\not\\sqsubseteq',
	    '&#x22E1;': '\\nsucc',
	    '&#x22E0;': '\\nprec',
	    '&#x22DF;': '\\succ',
	    '&#x22DE;': '\\prec',
	    '&#x22DD;': '\\overline{>}',
	    '&#x22DC;': '\\overline{<}',
	    '&#x22DB;': '\\underset{>}{\\leq}',
	    '&#x22DA;': '\\underset{<}{\\geq}',
	    '&#x22D5;': '\\#',
	    '&#x22D3;': '\\cup',
	    '&#x22D2;': '\\cap',
	    '&#x22D1;': '\\supset',
	    '&#x22D0;': '\\subset',
	    '&#x22CF;': '\\wedge',
	    '&#x22CE;': '\\vee',
	    '&#x22CD;': '\\simeq',
	    '&#x22C8;': '\\bowtie',
	    '&#x22C7;': '\\ast',
	    '&#x22C6;': '\\star',
	    '&#x22C4;': '\\diamond',
	    '&#x22BF;': '\\triangle',
	    '&#x22BE;': '\\measuredangle',
	    '&#x22BD;': '\\overline{\\lor}',
	    '&#x22BC;': '\\overline{\\land}',
	    '&#x22BB;': '\\underline{\\lor}',
	    '&#x22BA;': '\\top',
	    '&#x22B9;': '',
	    '&#x22B7;': '\\circ\\multimap',
	    '&#x22B6;': '\\circ\\multimap',
	    '&#x22B3;': '\\triangleright',
	    '&#x22B2;': '\\triangleleft',
	    '&#x22B1;': '\\succ',
	    '&#x22B0;': '\\prec',
	    '&#x22AB;': '|\\models',
	    '&#x22AA;': '|\\models',
	    '&#x22A7;': '\\models',
	    '&#x22A6;': '\\vdash',
	    '&#x229D;': '\\ominus',
	    '&#x229C;': '\\ominus',
	    '&#x229B;': '\\odot',
	    '&#x229A;': '\\odot',
	    '&#x2294;': '\\sqcup',
	    '&#x2293;': '\\sqcap',
	    '&#x2292;': '\\sqsupseteq',
	    '&#x2291;': '\\sqsubseteq',
	    '&#x2290;&#x338;': '\\not\\sqsupset',
	    '&#x2290;': '\\sqsupset',
	    '&#x228F;&#x338;': '\\not\\sqsubset',
	    '&#x228F;': '\\sqsubset',
	    '&#x228E;': '\\cup',
	    '&#x228D;': '\\cup',
	    '&#x228C;': '\\cup',
	    '&#x227F;&#x338;': '\\not\\succsim',
	    '&#x227F;': '\\succsim',
	    '&#x227E;': '\\precsim',
	    '&#x2279;': '\\not\\overset{>}{<}',
	    '&#x2278;': '\\not\\overset{>}{<}',
	    '&#x2277;': '\\overset{>}{<}',
	    '&#x2276;': '\\overset{<}{>}',
	    '&#x2275;': '\\not\\geg',
	    '&#x2274;': '\\not\\leq',
	    '&#x2273;': '\\geg',
	    '&#x2272;': '\\leq',
	    '&#x226C;': '',
	    '&#x2267;': '\\geg',
	    '&#x2266;&#x338;': '\\not\\leq',
	    '&#x2266;': '\\leq',
	    '&#x2263;': '\\overset{=}{=} ',
	    '&#x225E;': '\\overset{m}{=} ',
	    '&#x225D;': '\\overset{def}{=}',
	    '&#x2258;': '=',
	    '&#x2256;': '=',
	    '&#x2255;': '=:',
	    '&#x2253;': '\\doteq',
	    '&#x2252;': '\\doteq',
	    '&#x2251;': '\\doteq',
	    '&#x2250;': '\\doteq',
	    '&#x224F;&#x338;': '',
	    '&#x224F;': '',
	    '&#x224E;&#x338;': '',
	    '&#x224E;': '',
	    '&#x224C;': '\\approx',
	    '&#x224B;': '\\approx',
	    '&#x224A;': '\\approx',
	    '&#x2242;&#x338;': '\\neq',
	    '&#x2242;': '=',
	    '&#x223F;': '\\sim',
	    '&#x223E;': '\\infty',
	    '&#x223D;&#x331;': '\\sim',
	    '&#x223D;': '\\sim',
	    '&#x223B;': '\\sim',
	    '&#x223A;': ':-:',
	    '&#x2239;': '-:',
	    '&#x2238;': '\\bot',
	    '&#x2237;': '::',
	    '&#x2236;': ':',
	    '&#x2223;': '|',
	    '&#x221F;': '\\llcorner',
	    '&#x2219;': '\\cdot',
	    '&#x2218;': '\\circ',
	    '&#x2217;': '*',
	    '&#x2215;': '/',
	    '&#x220E;': '\\square',
	    '&#x220D;': '\\ni',
	    '&#x220A;': '\\in',
	    '&#x2206;': '\\Delta',
	    '&#x2044;': '/',
	    '&#x2AB0;&#x338;': '\\nsucceq',
	    '&#x2AB0;': '\\succeq',
	    '&#x2AAF;&#x338;': '\\npreceq',
	    '&#x2AAF;': '\\preceq',
	    '&#x2A88;': '\\ngeqslant',
	    '&#x2A87;': '\\nleqslant',
	    '&#x29F3;': '\\Phi',
	    '&#x29E6;': '\\models',
	    '&#x29E5;': '\\not\\equiv',
	    '&#x29E4;': '\\approx\\neq',
	    '&#x29E3;': '\\neq',
	    '&#x29C1;': '\\circle',
	    '&#x29C0;': '\\circle',
	    '&#x25E6;': '\\circle',
	    '&#x25D7;': '\\circle',
	    '&#x25D6;': '\\circle',
	    '&#x25CF;': '\\circle',
	    '&#x25CE;': '\\circledcirc',
	    '&#x25CD;': '\\circledcirc',
	    '&#x25CC;': '\\circledcirc',
	    '&#x25C9;': '\\circledcirc',
	    '&#x25C8;': '\\diamond',
	    '&#x25C7;': '\\diamond',
	    '&#x25C6;': '\\diamond',
	    '&#x25C5;': '\\triangleleft',
	    '&#x25C4;': '\\triangleleft',
	    '&#x25C3;': '\\triangleleft',
	    '&#x25C2;': '\\triangleleft',
	    '&#x25C1;': '\\triangleleft',
	    '&#x25C0;': '\\triangleleft',
	    '&#x25BF;': '\\triangledown',
	    '&#x25BE;': '\\triangledown',
	    '&#x25BD;': '\\triangledown',
	    '&#x25BC;': '\\triangledown',
	    '&#x25B9;': '\\triangleright',
	    '&#x25B8;': '\\triangleright',
	    '&#x25B7;': '\\triangleright',
	    '&#x25B6;': '\\triangleright',
	    '&#x25B5;': '\\triangle',
	    '&#x25B4;': '\\triangle',
	    '&#x25B3;': '\\triangle',
	    '&#x25B1;': '\\square',
	    '&#x25B0;': '\\square',
	    '&#x25AF;': '\\square',
	    '&#x25AE;': '\\square',
	    '&#x25AD;': '\\square',
	    '&#x25AB;': '\\square',
	    '&#x25AA;': '\\square',
	    '&#x25A1;': '\\square',
	    '&#x25A0;': '\\square',
	    '&#x22ED;': '\\not\\triangleright',
	    '&#x22EC;': '\\not\\triangleleft',
	    '&#x22EB;': '\\not\\triangleright',
	    '&#x22EA;': '\\not\\triangleleft',
	    '&#x22D9;': '\\ggg',
	    '&#x22D8;': '\\lll',
	    '&#x22D7;': '*>',
	    '&#x22D6;': '<*',
	    '&#x22D4;': '\\pitchfork',
	    '&#x22CC;': '',
	    '&#x22CB;': '',
	    '&#x22CA;': '\\rtimes',
	    '&#x22C9;': '\\ltimes',
	    '&#x22B5;': '\\triangleright',
	    '&#x22B4;': '',
	    '&#x22A5;': '\\bot',
	    '&#x2281;': '\\nsucc',
	    '&#x2280;': '\\preceq',
	    '&#x227D;': '\\succeq',
	    '&#x227C;': '\\preceq',
	    '&#x227B;': '\\succ',
	    '&#x227A;': '\\prec',
	    '&#x2271;': '\\geq/',
	    '&#x2270;': '\\leq/',
	    '&#x226D;': '\\neq',
	    '&#x226B;&#x338;': '\\not\\gg',
	    '&#x226B;': '\\gg',
	    '&#x226A;&#x338;': '\\not\\ll',
	    '&#x226A;': '\\ll',
	    '&#x2269;': '\\ngeqslant',
	    '&#x2268;': '\\nleqslant',
	    '&#x2261;': '\\equiv',
	    '&#x225F;': '\\doteq',
	    '&#x225C;': '\\triangleq',
	    '&#x225B;': '\\doteq',
	    '&#x225A;': '\\triangleq',
	    '&#x2259;': '\\triangleq',
	    '&#x2257;': '\\doteq',
	    '&#x2254;': ':=',
	    '&#x224D;': '\\asymp',
	    '&#x2247;': '\\ncong',
	    '&#x2246;': '\\ncong',
	    '&#x2245;': '\\cong',
	    '&#x2244;': '\\not\\simeq',
	    '&#x2243;': '\\simeq',
	    '&#x2241;': '\\not\\sim',
	    '&#x2226;': '\\not\\parallel',
	    '&#x2225;': '\\parallel',
	    '&#x2224;': '\\not|',
	    '&#x221D;': '\\propto',
	    '==': '==',
	    '=': '=',
	    ':=': ':=',
	    '/=': '=',
	    '-=': '-=',
	    '+=': '+=',
	    '*=': '*=',
	    '!=': '!=',
	    '&#x2260;': '\\neq',
	    '&#x2262;': '\\equiv /',
	    '&#x2249;': '\\approx /',
	    '&#x223C;': 'sim',
	    '&#x2248;': '\\approx',
	    '&#x226E;': '</',
	    '&lt;': '<',
	    '&#x226F;': '>/',
	    '>=': '>=',
	    '>': '>',
	    '&#x2265;': '\\geq',
	    '&#x2264;': '\\leq',
	    '&lt;=': '<=',
	    '&#x228B;': '\\supsetneq',
	    '&#x228A;': '\\subsetneq',
	    '&#x2289;': '\\nsupseteq',
	    '&#x2288;': '\\nsubseteq',
	    '&#x2287;': '\\supseteq',
	    '&#x2286;': '\\subseteq',
	    '&#x2285;': '\\not\\supset',
	    '&#x2284;': '\\not\\subset',
	    '&#x2283;&#x20D2;': '\\supset |',
	    '&#x2283;': '\\supset',
	    '&#x2282;&#x20D2;': '\\subset |',
	    '&#x2282;': '\\subset',
	    '&#x220C;': '\\not\\in',
	    '&#x2209;': '\\notin',
	    '&#x2208;': '\\in',
	    '&#x2201;': 'C',
	    '&#x2204;': '\\nexists',
	    '&#x2203;': '\\exists',
	    '&#x2200;': '\\forall',
	    '&#x2227;': '\\land',
	    '&amp;&amp;': '\\&\\&',
	    '&#x2228;': '\\lor',
	    '&#x22AF;': '\\cancel{\\vDash}',
	    '&#x22AE;': '\\cancel{\\Vdash}',
	    '&#x22AD;': '\\nvDash',
	    '&#x22AC;': '\\nvDash',
	    '&#x22A9;': '\\Vdash',
	    '&#x22A8;': '\\vDash',
	    '&#x22A4;': '\\top',
	    '&#x22A3;': '\\dashv',
	    '&#x22A2;': '\\vdash',
	    '&#x220B;': '\\ni',
	    '&#x22F1;': '\\ddots',
	    '&#x22EF;': '\\hdots',
	    '&#x22EE;': '\\vdots',
	    '&#x2026;': '\\hdots',
	    '&#x3F6;': '\\ni',
	    ':': ':',
	    '...': '\\cdots',
	    '..': '..',
	    '->': '->',
	    '&#x2235;': '\\because',
	    '&#x2234;': '\\therefore ',
	    '&#x2063;': '',
	    ',': ',',
	    ';': ';',
	    '&#x29FD;': '\\}',
	    '&#x29FC;': '\\{',
	    '&#x2998;': '\\]',
	    '&#x2997;': '\\[',
	    '&#x2996;': '\\ll',
	    '&#x2995;': '\\gg',
	    '&#x2994;': '\\gg',
	    '&#x2993;': '\\ll',
	    '&#x2992;': '\\gg',
	    '&#x2991;': '\\ll',
	    '&#x2990;': '\\]',
	    '&#x298F;': '\\]',
	    '&#x298E;': '\\]',
	    '&#x298D;': '\\[',
	    '&#x298C;': '\\[',
	    '&#x298B;': '\\]',
	    '&#x298A;': '\\triangleright',
	    '&#x2989;': '\\triangleleft',
	    '&#x2988;': '|\\)',
	    '&#x2987;': '\\(|',
	    '&#x2986;': '|\\)',
	    '&#x2985;': '\\(\\(',
	    '&#x2984;': '|\\}',
	    '&#x2983;': '\\{|',
	    '&#x2980;': '\\||',
	    '&#x27EF;': '\\left. \\right]',
	    '&#x27EE;': '\\left[ \\right.',
	    '&#x27ED;': '\\left. \\right]]',
	    '&#x27EC;': '\\left[[ \\right.',
	    '&#x27EB;': '\\gg',
	    '&#x27EA;': '\\ll',
	    '&#x27E9;': '\\rangle',
	    '&#x27E8;': '\\langle',
	    '&#x27E7;': '\\left. \\right]]',
	    '&#x27E6;': '\\left[[ \\right.',
	    '&#x2773;': '\\left.\\right)',
	    '&#x2772;': '\\left(\\right.',
	    '&#x232A;': '\\rangle',
	    '&#x2329;': '\\langle',
	    '&#x230B;': '\\rfloor',
	    '&#x230A;': '\\lfloor',
	    '&#x2309;': '\\rceil',
	    '&#x2308;': '\\lceil',
	    '&#x2016;': '\\parallel',
	    '}': '\\right\\}',
	    '{': '\\left\\{',
	    ']': '\\left]\\right.',
	    '[': '\\left[\\right.',
	    ')': '\\left.\\right)',
	    '(': '\\left(\\right.',
	    '&#x201D;': '"',
	    '&#x201C;': '``',
	    '&#x2019;': "'",
	    '&#x2018;': '`',
	    '%CE%B1': '\\alpha',
	    '%CE%B2': '\\beta',
	    '%CE%B3': '\\gamma',
	    '%CE%93': '\\Gamma',
	    '%CE%B4': '\\delta',
	    '%CE%94': '\\Delta',
	    '%CF%B5': '\\epsilon',
	    '%CE%B6': '\\zeta',
	    '%CE%B7': '\\eta',
	    '%CE%B8': '\\theta',
	    '%CE%98': '\\Theta',
	    '%CE%B9': '\\iota',
	    '%CE%BA': '\\kappa',
	    '%CE%BB': '\\lambda',
	    '%CE%BC': '\\mu',
	    '%CE%BD': '\\nu',
	    '%CE%BF': '\\omicron',
	    '%CF%80': '\\pi',
	    '%CE%A0': '\\Pi',
	    '%CF%81': '\\pho',
	    '%CF%83': '\\sigma',
	    '%CE%A3': '\\Sigma',
	    '%CF%84': '\\tau',
	    '%CF%85': '\\upsilon',
	    '%CE%A5': '\\Upsilon',
	    '%CF%95': '\\phi',
	    '%CE%A6': '\\Phi',
	    '%CF%87': '\\chi',
	    '%CF%88': '\\psi',
	    '%CE%A8': '\\Psi',
	    '%CF%89': '\\omega',
	    '%CE%A9': '\\Omega',
	};

	var allMathOperatorsByGlyph = {};

	Object.defineProperty(allMathOperatorsByGlyph, "__esModule", { value: true });
	allMathOperatorsByGlyph.allMathOperatorsByGlyph = void 0;
	allMathOperatorsByGlyph.allMathOperatorsByGlyph = {
	    _: '\\underline',
	    '⏡': '\\underbrace',
	    '⏠': '\\overbrace',
	    '⏟': '\\underbrace',
	    '⏞': '\\overbrace',
	    '⏝': '\\underbrace',
	    '⏜': '\\overbrace',
	    '⎵': '\\underbrace',
	    '⎴': '\\overbrace',
	    '⃜': '\\square',
	    '⃛': '\\square',
	    '⁤': '',
	    '⁗': "''''",
	    '‾': '\\bar',
	    '‷': '```',
	    '‶': '``',
	    '‵': '`',
	    '‴': "'''",
	    '″': "''",
	    '‟': '``',
	    '„': ',,',
	    '‛': '`',
	    '‚': ',',
	    '^': '\\hat',
	    '˷': '\\sim',
	    '˝': '\\sim',
	    '˜': '\\sim',
	    '˚': '\\circ',
	    '˙': '\\cdot',
	    '˘': '',
	    ˍ: '\\_',
	    ˋ: 'ˋ',
	    ˊ: 'ˊ',
	    ˉ: 'ˉ',
	    ˇ: '',
	    ˆ: '\\hat',
	    º: 'o',
	    '¹': '1',
	    '¸': '¸',
	    '´': '´',
	    '³': '3',
	    '²': '2',
	    '°': '\\circ',
	    '¯': '\\bar',
	    ª: 'a',
	    '¨': '\\cdot\\cdot',
	    '~': '\\sim',
	    '`': '`',
	    '--': '--',
	    '++': '++',
	    '&': '\\&',
	    '∜': '\\sqrt[4]{}',
	    '∛': '\\sqrt[3]{}',
	    '√': '\\sqrt{}',
	    ⅆ: 'd',
	    ⅅ: '\\mathbb{D}',
	    '?': '?',
	    '@': '@',
	    '//': '//',
	    '!!': '!!',
	    '!': '!',
	    '♯': '\\#',
	    '♮': '',
	    '♭': '',
	    '′': "'",
	    '<>': '<>',
	    '**': '\\star\\star',
	    '∇': '\\nabla',
	    '∂': '\\partial',
	    '⊙': '\\bigodot',
	    '¬': '\\neg',
	    '∢': '\\measuredangle',
	    '∡': '\\measuredangle',
	    '∠': '\\angle',
	    '÷': '\\div',
	    '/': '/',
	    '∖': '\\backslash',
	    '\\': '\\backslash',
	    '%': '\\%',
	    '⊗': '\\bigotimes',
	    '·': '\\cdot',
	    '⨿': '\\coprod',
	    '⨯': '\\times',
	    '⋅': '\\cdot',
	    '⊡': '\\boxdot',
	    '⊠': '\\boxtimes',
	    '⁢': '',
	    '⁃': '-',
	    '•': '\\cdot',
	    '×': '\\times',
	    '.': '.',
	    '*': '\\star',
	    '∪': '\\cup',
	    '∩': '\\cap',
	    '∐': '\\coprod',
	    '∏': '\\prod',
	    '≀': '',
	    '⫿': '',
	    '⫼': '\\mid\\mid\\mid',
	    '⨉': '\\times',
	    '⨈': '',
	    '⨇': '',
	    '⨆': '\\sqcup',
	    '⨅': '\\sqcap',
	    '⨂': '\\otimes',
	    '⨀': '\\odot',
	    '⋂': '\\cap',
	    '⋁': '\\vee',
	    '⋀': '\\wedge',
	    '⨄': '\\uplus',
	    '⨃': '\\cup',
	    '⋃': '\\cup',
	    '⨜': '\\underline{\\int}',
	    '⨛': '\\overline{\\int}',
	    '⨚': '\\int',
	    '⨙': '\\int',
	    '⨘': '\\int',
	    '⨗': '\\int',
	    '⨖': '\\oint',
	    '⨕': '\\oint',
	    '⨔': '\\int',
	    '⨓': '\\int',
	    '⨒': '\\int',
	    '⨑': '\\int',
	    '⨐': '\\int',
	    '⨏': '\\bcancel{\\int}',
	    '⨎': '',
	    '⨍': '\\hcancel{\\int}',
	    '⨌': '\\iiiint',
	    '∳': '\\oint',
	    '∲': '\\oint',
	    '∱': '\\int',
	    '∰': '\\oiint',
	    '∯': '\\oiint',
	    '∮': '\\oint',
	    '∫': '\\int',
	    '⨁': '\\oplus',
	    '⊘': '\\oslash',
	    '⊖': '\\ominus',
	    '⊕': '\\oplus',
	    '∭': '\\iiint',
	    '∬': '\\iint',
	    '⨋': '',
	    '⨊': '',
	    '∑': '\\sum',
	    '⊟': '\\boxminus',
	    '⊞': '\\boxplus',
	    '∔': '\\dot{+}',
	    '∓': '+-',
	    '−': '-',
	    '±': '\\pm',
	    '-': '-',
	    '+': '+',
	    '⭆': '\\Rrightarrow',
	    '⭅': '\\Lleftarrow',
	    '⧴': ':\\rightarrow',
	    '⧯': '',
	    '⧟': '\\bullet-\\bullet',
	    '⦟': '\\angle',
	    '⦞': '\\measuredangle',
	    '⦝': '\\measuredangle',
	    '⦜': '\\perp',
	    '⦛': '\\measuredangle',
	    '⦚': '',
	    '⦙': '\\vdots',
	    '⥿': '',
	    '⥾': '',
	    '⥽': '\\prec',
	    '⥼': '\\succ',
	    '⥻': '\\underset{\\rightarrow}{\\supset}',
	    '⥺': '',
	    '⥹': '\\underset{\\rightarrow}{\\subset}',
	    '⥸': '\\underset{\\rightarrow}{>}',
	    '⥷': '',
	    '⥶': '\\underset{\\leftarrow}{<}',
	    '⥵': '\\underset{\\approx}{\\rightarrow}',
	    '⥴': '\\underset{\\sim}{\\rightarrow}',
	    '⥳': '\\underset{\\sim}{\\leftarrow}',
	    '⥲': '\\overset{\\sim}{\\rightarrow}',
	    '⥱': '\\overset{=}{\\rightarrow}',
	    '⥰': '',
	    '⥯': '',
	    '⥮': '',
	    '⥭': '\\overline{\\rightharpoondown}',
	    '⥬': '\\underline{\\rightharpoonup}',
	    '⥫': '\\overline{\\leftharpoondown}',
	    '⥪': '\\underline{\\leftharpoonup}',
	    '⥩': '\\rightleftharpoons',
	    '⥨': '\\rightleftharpoons',
	    '⥧': '\\rightleftharpoons',
	    '⥦': '\\rightleftharpoons',
	    '⥥': '\\Downarrow',
	    '⥤': '\\Rightarrow',
	    '⥣': '\\Uparrow',
	    '⥢': '\\Leftarrow',
	    '⥡': '\\downarrow',
	    '⥠': '\\uparrow',
	    '⥟': '\\rightarrow',
	    '⥞': '\\leftarrow',
	    '⥝': '\\downarrow',
	    '⥜': '\\uparrow',
	    '⥛': '\\rightarrow',
	    '⥚': '\\leftarrow',
	    '⥙': '\\downarrow',
	    '⥘': '\\uparrow',
	    '⥗': '\\rightarrow',
	    '⥖': '\\leftarrow',
	    '⥕': '\\downarrow',
	    '⥔': '\\uparrow',
	    '⥓': '\\rightarrow',
	    '⥒': '\\leftarrow',
	    '⥑': '\\updownarrow',
	    '⥐': '\\leftrightarrow',
	    '⥏': '\\updownarrow',
	    '⥎': '\\leftrightarrow',
	    '⥍': '\\updownarrow',
	    '⥌': '\\updownarrow',
	    '⥋': '\\leftrightarrow',
	    '⥊': '\\leftrightarrow',
	    '⥉': '',
	    '⥈': '\\leftrightarrow',
	    '⥇': '\\nrightarrow',
	    '⥆': '',
	    '⥅': '',
	    '⥄': '\\rightleftarrows',
	    '⥃': '\\leftrightarrows',
	    '⥂': '\\rightleftarrows',
	    '⥁': '\\circlearrowright',
	    '⥀': '\\circlearrowleft',
	    '⤿': '\\rightarrow',
	    '⤾': '\\leftarrow',
	    '⤽': '',
	    '⤼': '',
	    '⤻': '',
	    '⤺': '',
	    '⤹': '',
	    '⤸': '',
	    '⤷': '\\Rsh',
	    '⤶': '\\Lsh',
	    '⤵': '\\downarrow',
	    '⤴': '\\uparrow',
	    '⤳': '\\leadsto',
	    '⤲': '',
	    '⤱': '',
	    '⤰': '',
	    '⤯': '',
	    '⤮': '',
	    '⤭': '',
	    '⤬': '\\times',
	    '⤫': '\\times',
	    '⤪': '',
	    '⤩': '',
	    '⤨': '',
	    '⤧': '',
	    '⤦': '',
	    '⤥': '',
	    '⤤': '',
	    '⤣': '',
	    '⤢': '',
	    '⤡': '',
	    '⤠': '\\mapsto\\cdot',
	    '⤟': '\\cdot\\leftarrow',
	    '⤞': '\\rightarrow\\cdot',
	    '⤝': '\\leftarrow',
	    '⤜': '\\rightarrow',
	    '⤛': '\\leftarrow',
	    '⤚': '\\rightarrow',
	    '⤙': '\\leftarrow',
	    '⤘': '\\rightarrow',
	    '⤗': '\\rightarrow',
	    '⤖': '\\rightarrow',
	    '⤕': '\\rightarrow',
	    '⤔': '\\rightarrow',
	    '⤓': '\\downarrow',
	    '⤒': '\\uparrow',
	    '⤑': '\\rightarrow',
	    '⤐': '\\rightarrow',
	    '⤏': '\\rightarrow',
	    '⤎': '\\leftarrow',
	    '⤍': '\\rightarrow',
	    '⤌': '\\leftarrow',
	    '⤋': '\\Downarrow',
	    '⤊': '\\Uparrow',
	    '⤉': '\\uparrow',
	    '⤈': '\\downarrow',
	    '⤇': '\\Rightarrow',
	    '⤆': '\\Leftarrow',
	    '⤅': '\\mapsto',
	    '⤄': '\\nLeftrightarrow',
	    '⤃': '\\nRightarrow',
	    '⤂': '\\nLeftarrow',
	    '⤁': '\\rightsquigarrow',
	    '⤀': '\\rightsquigarrow',
	    '⟿': '\\rightsquigarrow',
	    '⟾': '\\Rightarrow',
	    '⟽': '\\Leftarrow',
	    '⟼': '\\mapsto',
	    '⟻': '\\leftarrow',
	    '⟺': '\\Longleftrightarrow',
	    '⟹': '\\Longrightarrow',
	    '⟸': '\\Longleftarrow',
	    '⟷': '\\leftrightarrow',
	    '⟶': '\\rightarrow',
	    '⟵': '\\leftarrow',
	    '⟱': '\\Downarrow',
	    '⟰': '\\Uparrow',
	    '⊸': '\\rightarrow',
	    '⇿': '\\leftrightarrow',
	    '⇾': '\\rightarrow',
	    '⇽': '\\leftarrow',
	    '⇼': '\\nleftrightarrow',
	    '⇻': '\\nrightarrow',
	    '⇺': '\\nleftarrow',
	    '⇹': '\\nleftrightarrow',
	    '⇸': '\\nrightarrow',
	    '⇷': '\\nleftarrow',
	    '⇶': '\\Rrightarrow',
	    '⇵': '',
	    '⇴': '\\rightarrow',
	    '⇳': '\\Updownarrow',
	    '⇲': '\\searrow',
	    '⇱': '\\nwarrow',
	    '⇰': '\\Leftarrow',
	    '⇯': '\\Uparrow',
	    '⇮': '\\Uparrow',
	    '⇭': '\\Uparrow',
	    '⇬': '\\Uparrow',
	    '⇫': '\\Uparrow',
	    '⇪': '\\Uparrow',
	    '⇩': '\\Downarrow',
	    '⇨': '\\Rightarrow',
	    '⇧': '\\Uparrow',
	    '⇦': '\\Leftarrow',
	    '⇥': '\\rightarrow',
	    '⇤': '\\leftarrow',
	    '⇣': '\\downarrow',
	    '⇢': '\\rightarrow',
	    '⇡': '\\uparrow',
	    '⇠': '\\leftarrow',
	    '⇟': '\\downarrow',
	    '⇞': '\\uparrow',
	    '⇝': '\\rightsquigarrow',
	    '⇜': '\\leftarrow',
	    '⇛': '\\Rrightarrow',
	    '⇚': '\\Lleftarrow',
	    '⇙': '\\swarrow',
	    '⇘': '\\searrow',
	    '⇗': '\\nearrow',
	    '⇖': '\\nwarrow',
	    '⇕': '\\Updownarrow',
	    '⇔': '\\Leftrightarrow',
	    '⇓': '\\Downarrow',
	    '⇒': '\\Rightarrow',
	    '⇑': '\\Uparrow',
	    '⇐': '\\Leftarrow',
	    '⇏': '\\nRightarrow',
	    '⇎': '\\nLeftrightarrow',
	    '⇍': '\\nLeftarrow',
	    '⇌': '\\rightleftharpoons',
	    '⇋': '\\leftrightharpoons',
	    '⇊': '\\downdownarrows',
	    '⇉': '\\rightrightarrows',
	    '⇈': '\\upuparrows',
	    '⇇': '\\leftleftarrows',
	    '⇆': '\\leftrightarrows',
	    '⇅': '',
	    '⇄': '\\rightleftarrows',
	    '⇃': '\\downharpoonleft',
	    '⇂': '\\downharpoonright',
	    '⇁': '\\rightharpoondown',
	    '⇀': '\\rightharpoonup',
	    '↿': '\\upharpoonleft',
	    '↾': '\\upharpoonright',
	    '↽': '\\leftharpoondown',
	    '↼': '\\leftharpoonup',
	    '↻': '\\circlearrowright',
	    '↺': '\\circlearrowleft',
	    '↹': '\\leftrightarrows',
	    '↸': '\\overline{\\nwarrow}',
	    '↷': '\\curvearrowright',
	    '↶': '\\curvearrowleft',
	    '↵': '\\swarrow',
	    '↴': '\\searrow',
	    '↳': '\\Rsh',
	    '↲': '\\Lsh',
	    '↱': '\\Rsh',
	    '↰': '\\Lsh',
	    '↯': '\\swarrow',
	    '↮': '',
	    '↭': '\\leftrightsquigarrow',
	    '↬': '\\looparrowright',
	    '↫': '\\looparrowleft',
	    '↪': '\\hookrightarrow',
	    '↩': '\\hookleftarrow',
	    '↨': '\\underline{\\updownarrow}',
	    '↧': '\\downarrow',
	    '↦': '\\rightarrowtail',
	    '↥': '\\uparrow',
	    '↤': '\\leftarrowtail',
	    '↣': '\\rightarrowtail',
	    '↢': '\\leftarrowtail',
	    '↡': '\\downarrow',
	    '↠': '\\twoheadrightarrow',
	    '↟': '\\uparrow',
	    '↞': '\\twoheadleftarrow',
	    '↝': '\\nearrow',
	    '↜': '\\nwarrow',
	    '↛': '',
	    '↚': '',
	    '↙': '\\swarrow',
	    '↘': '\\searrow',
	    '↗': '\\nearrow',
	    '↖': '\\nwarrow',
	    '↕': '\\updownarrow',
	    '↔': '\\leftrightarrow',
	    '↓': '\\downarrow',
	    '→': '\\rightarrow',
	    '↑': '\\uparrow',
	    '←': '\\leftarrow',
	    '|||': '\\left|||\\right.',
	    '||': '\\left||\\right.',
	    '|': '\\left|\\right.',
	    '⫾': '',
	    '⫽': '//',
	    '⫻': '///',
	    '⫺': '',
	    '⫹': '',
	    '⫸': '',
	    '⫷': '',
	    '⫶': '\\vdots',
	    '⫵': '',
	    '⫴': '',
	    '⫳': '',
	    '⫲': '\\nparallel',
	    '⫱': '',
	    '⫰': '',
	    '⫯': '',
	    '⫮': '\\bcancel{\\mid}',
	    '⫭': '',
	    '⫬': '',
	    '⫫': '',
	    '⫪': '',
	    '⫩': '',
	    '⫨': '\\underline{\\perp}',
	    '⫧': '\\overline{\\top}',
	    '⫦': '',
	    '⫥': '',
	    '⫤': '',
	    '⫣': '',
	    '⫢': '',
	    '⫡': '',
	    '⫠': '\\perp',
	    '⫟': '\\top',
	    '⫞': '\\dashv',
	    '⫝̸': '',
	    '⫝': '',
	    '⫛': '\\pitchfork',
	    '⫚': '',
	    '⫙': '',
	    '⫘': '',
	    '⫗': '',
	    '⫖': '',
	    '⫕': '',
	    '⫔': '',
	    '⫓': '',
	    '⫒': '',
	    '⫑': '',
	    '⫐': '',
	    '⫏': '',
	    '⫎': '',
	    '⫍': '',
	    '⫌': '\\underset{\\neq}{\\supset}',
	    '⫋': '\\underset{\\neq}{\\subset}',
	    '⫊': '\\underset{\\approx}{\\supset}',
	    '⫉': '\\underset{\\approx}{\\subset}',
	    '⫈': '\\underset{\\sim}{\\supset}',
	    '⫇': '\\underset{\\sim}{\\subset}',
	    '⫆': '\\supseteqq',
	    '⫅': '\\subseteqq',
	    '⫄': '\\dot{\\supseteq}',
	    '⫃': '\\dot{\\subseteq}',
	    '⫂': '\\underset{\\times}{\\supset}',
	    '⫁': '\\underset{\\times}{\\subset}',
	    '⫀': '\\underset{+}{\\supset}',
	    '⪿': '\\underset{+}{\\subset}',
	    '⪾': '',
	    '⪽': '',
	    '⪼': '\\gg ',
	    '⪻': '\\ll',
	    '⪺': '\\underset{\\cancel{\\approx}}{\\succ}',
	    '⪹': '\\underset{\\cancel{\\approx}}{\\prec}',
	    '⪸': '\\underset{\\approx}{\\succ}',
	    '⪷': '\\underset{\\approx}{\\prec}',
	    '⪶': '\\underset{\\cancel{=}}{\\succ}',
	    '⪵': '\\underset{\\cancel{=}}{\\prec}',
	    '⪴': '\\underset{=}{\\succ}',
	    '⪳': '\\underset{=}{\\prec}',
	    '⪲': '',
	    '⪱': '',
	    '⪮': '',
	    '⪭': '\\underline{\\hcancel{>}}',
	    '⪬': '\\underline{\\hcancel{>}}',
	    '⪫': '\\hcancel{>}',
	    '⪪': '\\hcancel{<}',
	    '⪩': '',
	    '⪨': '',
	    '⪧': '\\vartriangleright',
	    '⪦': '\\vartriangleleft',
	    '⪥': '><',
	    '⪤': '><',
	    '⪣': '\\underline{\\ll}',
	    '⪢̸': '\\cancel{\\gg}',
	    '⪢': '\\gg',
	    '⪡̸': '\\cancel{\\ll}',
	    '⪡': '\\ll',
	    '⪠': '\\overset{\\sim}{\\geqq}',
	    '⪟': '\\overset{\\sim}{\\leqq}',
	    '⪞': '\\overset{\\sim}{>}',
	    '⪝': '\\overset{\\sim}{<}',
	    '⪜': '',
	    '⪛': '',
	    '⪚': '\\overset{=}{>}',
	    '⪙': '\\overset{=}{<}',
	    '⪘': '',
	    '⪗': '',
	    '⪖': '',
	    '⪕': '',
	    '⪔': '',
	    '⪓': '',
	    '⪒': '\\underset{=}{\\gtrless}',
	    '⪑': '\\underset{=}{\\lessgtr}',
	    '⪐': '\\underset{<}{\\gtrsim}',
	    '⪏': '\\underset{>}{\\lesssim}',
	    '⪎': '\\underset{\\simeq}{>}',
	    '⪍': '\\underset{\\simeq}{<}',
	    '⪌': '\\gtreqqless',
	    '⪋': '\\lesseqqgtr',
	    '⪊': '\\underset{\\cancel{\\approx}}{>}',
	    '⪉': '\\underset{\\approx}{<}',
	    '⪆': '\\underset{\\approx}{>}',
	    '⪅': '\\underset{\\approx}{<}',
	    '⪄': '',
	    '⪃': '',
	    '⪂': '',
	    '⪁': '',
	    '⪀': '',
	    '⩿': '',
	    '⩾̸': '\\bcancel{\\geq}',
	    '⩾': '\\geq',
	    '⩽̸': '\\bcancel{\\leq}',
	    '⩽': '\\leq',
	    '⩼': '',
	    '⩻': '',
	    '⩺': '',
	    '⩹': '',
	    '⩸': '\\overset{\\dots}{\\equiv}',
	    '⩷': '',
	    '⩶': '===',
	    '⩵': '==',
	    '⩴': '::=',
	    '⩳': '',
	    '⩲': '\\underset{=}{+}',
	    '⩱': '\\overset{=}{+}',
	    '⩰': '\\overset{\\approx}{=}',
	    '⩯': '\\overset{\\wedge}{=}',
	    '⩮': '\\overset{*}{=}',
	    '⩭': '\\dot{\\approx}',
	    '⩬': '',
	    '⩫': '',
	    '⩪': '\\dot{\\sim}',
	    '⩩': '',
	    '⩨': '',
	    '⩧': '\\dot{\\equiv}',
	    '⩦': '\\underset{\\cdot}{=}',
	    '⩥': '',
	    '⩤': '',
	    '⩣': '\\underset{=}{\\vee}',
	    '⩢': '\\overset{=}{\\vee}',
	    '⩡': 'ul(vv)',
	    '⩠': '\\underset{=}{\\wedge}',
	    '⩟': '\\underline{\\wedge}',
	    '⩞': '\\overset{=}{\\wedge}',
	    '⩝': '\\hcancel{\\vee}',
	    '⩜': '\\hcancel{\\wedge}',
	    '⩛': '',
	    '⩚': '',
	    '⩙': '',
	    '⩘': '\\vee',
	    '⩗': '\\wedge',
	    '⩖': '',
	    '⩕': '',
	    '⩔': '',
	    '⩓': '',
	    '⩒': '\\dot{\\vee}',
	    '⩑': '\\dot{\\wedge}',
	    '⩐': '',
	    '⩏': '',
	    '⩎': '',
	    '⩍': '\\overline{\\cap}',
	    '⩌': '\\overline{\\cup}',
	    '⩋': '',
	    '⩊': '',
	    '⩉': '',
	    '⩈': '',
	    '⩇': '',
	    '⩆': '',
	    '⩅': '',
	    '⩄': '',
	    '⩃': '\\overline{\\cap}',
	    '⩂': '\\overline{\\cup}',
	    '⩁': '',
	    '⩀': '',
	    '⨾': '',
	    '⨽': '\\llcorner',
	    '⨼': '\\lrcorner',
	    '⨻': '',
	    '⨺': '',
	    '⨹': '',
	    '⨸': '',
	    '⨷': '',
	    '⨶': '\\hat{\\otimes}',
	    '⨵': '',
	    '⨴': '',
	    '⨳': '',
	    '⨲': '\\underline{\\times}',
	    '⨱': '\\underline{\\times}',
	    '⨰': '\\dot{\\times}',
	    '⨮': '',
	    '⨭': '',
	    '⨬': '',
	    '⨫': '',
	    '⨪': '',
	    '⨩': '',
	    '⨨': '',
	    '⨧': '',
	    '⨦': '\\underset{\\sim}{+}',
	    '⨥': '\\underset{\\circ}{+}',
	    '⨤': '\\overset{\\sim}{+}',
	    '⨣': '\\hat{+}',
	    '⨢': '\\dot{+}',
	    '⨡': '\\upharpoonright',
	    '⨠': '>>',
	    '⨟': '',
	    '⨞': '\\triangleleft',
	    '⨝': '\\bowtie',
	    '⧿': '',
	    '⧾': '+',
	    '⧻': '\\hcancel{|||}',
	    '⧺': '\\hcancel{||}',
	    '⧹': '\\backslash',
	    '⧸': '/',
	    '⧷': 'hcancel{\backslash}',
	    '⧶': '',
	    '⧵': '\\backslash',
	    '⧲': '\\Phi',
	    '⧱': '',
	    '⧰': '',
	    '⧮': '',
	    '⧭': '',
	    '⧬': '',
	    '⧫': '\\lozenge',
	    '⧪': '',
	    '⧩': '',
	    '⧨': '',
	    '⧧': '\\ddagger',
	    '⧢': '\\sqcup\\sqcup',
	    '⧡': '',
	    '⧠': '\\square',
	    '⧞': '',
	    '⧝': '',
	    '⧜': '',
	    '⧛': '\\{\\{',
	    '⧙': '\\{',
	    '⧘': '\\}',
	    '⧗': '',
	    '⧖': '',
	    '⧕': '\\bowtie',
	    '⧔': '\\bowtie',
	    '⧓': '\\bowtie',
	    '⧒': '\\bowtie',
	    '⧑': '\\bowtie',
	    '⧐̸': '| \\not\\triangleright',
	    '⧐': '| \\triangleright',
	    '⧏̸': '\\not\\triangleleft |',
	    '⧏': '\\triangleleft |',
	    '⧎': '',
	    '⧍': '\\triangle',
	    '⧌': '',
	    '⧋': '\\underline{\\triangle}',
	    '⧊': '\\dot{\\triangle}',
	    '⧉': '',
	    '⧈': '\\boxed{\\circ}',
	    '⧇': '\\boxed{\\circ}',
	    '⧆': '\\boxed{\\rightarrow}',
	    '⧅': '\\bcancel{\\square}',
	    '⧄': '\\cancel{\\square}',
	    '⧃': '\\odot',
	    '⧂': '\\odot',
	    '⦿': '\\odot',
	    '⦾': '\\odot',
	    '⦽': '\\varnothing',
	    '⦼': '\\oplus',
	    '⦻': '\\otimes',
	    '⦺': '',
	    '⦹': '\\varnothing',
	    '⦸': '\\varnothing',
	    '⦷': '\\ominus',
	    '⦶': '\\ominus',
	    '⦵': '\\ominus',
	    '⦴': '\\vec{\\varnothing}',
	    '⦳': '\\vec{\\varnothing}',
	    '⦲': '\\dot{\\varnothing}',
	    '⦱': '\\overline{\\varnothing}',
	    '⦰': '\\varnothing',
	    '⦯': '',
	    '⦮': '',
	    '⦭': '',
	    '⦬': '',
	    '⦫': '',
	    '⦪': '',
	    '⦩': '',
	    '⦨': '',
	    '⦧': '',
	    '⦦': '',
	    '⦥': '',
	    '⦤': '',
	    '⦣': '',
	    '⦢': '',
	    '⦡': '\\not\\lor',
	    '⦠': '\\bcancel{>}',
	    '⦂': ':',
	    '⦁': '\\circ',
	    '❘': '|',
	    '▲': '\\bigtriangleup',
	    '⋿': '\\Epsilon',
	    '⋾': '\\overline{\\ni}',
	    '⋽': '\\overline{\\ni}',
	    '⋼': '\\in',
	    '⋻': '\\in',
	    '⋺': '\\in',
	    '⋹': '\\underline{\\in}',
	    '⋸': '\\underline{\\in}',
	    '⋷': '\\overline{\\in}',
	    '⋶': '\\overline{\\in}',
	    '⋵': '\\dot{\\in}',
	    '⋴': '\\in',
	    '⋳': '\\in',
	    '⋲': '\\in',
	    '⋰': '\\ddots',
	    '⋩': '\\underset{\\sim}{\\succ}',
	    '⋨': '\\underset{\\sim}{\\prec}',
	    '⋧': '\\underset{\\not\\sim}{>}',
	    '⋦': '\\underset{\\not\\sim}{<}',
	    '⋥': '\\not\\sqsupseteq',
	    '⋤': '\\not\\sqsubseteq',
	    '⋣': '\\not\\sqsupseteq',
	    '⋢': '\\not\\sqsubseteq',
	    '⋡': '\\nsucc',
	    '⋠': '\\nprec',
	    '⋟': '\\succ',
	    '⋞': '\\prec',
	    '⋝': '\\overline{>}',
	    '⋜': '\\overline{<}',
	    '⋛': '\\underset{>}{\\leq}',
	    '⋚': '\\underset{<}{\\geq}',
	    '⋕': '\\#',
	    '⋓': '\\cup',
	    '⋒': '\\cap',
	    '⋑': '\\supset',
	    '⋐': '\\subset',
	    '⋏': '\\wedge',
	    '⋎': '\\vee',
	    '⋍': '\\simeq',
	    '⋈': '\\bowtie',
	    '⋇': '\\ast',
	    '⋆': '\\star',
	    '⋄': '\\diamond',
	    '⊿': '\\triangle',
	    '⊾': '\\measuredangle',
	    '⊽': '\\overline{\\lor}',
	    '⊼': '\\overline{\\land}',
	    '⊻': '\\underline{\\lor}',
	    '⊺': '\\top',
	    '⊹': '',
	    '⊷': '\\circ\\multimap',
	    '⊶': '\\circ\\multimap',
	    '⊳': '\\triangleright',
	    '⊲': '\\triangleleft',
	    '⊱': '\\succ',
	    '⊰': '\\prec',
	    '⊫': '|\\models',
	    '⊪': '|\\models',
	    '⊧': '\\models',
	    '⊦': '\\vdash',
	    '⊝': '\\ominus',
	    '⊜': '\\ominus',
	    '⊛': '\\odot',
	    '⊚': '\\odot',
	    '⊔': '\\sqcup',
	    '⊓': '\\sqcap',
	    '⊒': '\\sqsupseteq',
	    '⊑': '\\sqsubseteq',
	    '⊐̸': '\\not\\sqsupset',
	    '⊐': '\\sqsupset',
	    '⊏̸': '\\not\\sqsubset',
	    '⊏': '\\sqsubset',
	    '⊎': '\\cup',
	    '⊍': '\\cup',
	    '⊌': '\\cup',
	    '≿̸': '\\not\\succsim',
	    '≿': '\\succsim',
	    '≾': '\\precsim',
	    '≹': '\\not\\overset{>}{<}',
	    '≸': '\\not\\overset{>}{<}',
	    '≷': '\\overset{>}{<}',
	    '≶': '\\overset{<}{>}',
	    '≵': '\\not\\geg',
	    '≴': '\\not\\leq',
	    '≳': '\\geg',
	    '≲': '\\leq',
	    '≬': '',
	    '≧': '\\geg',
	    '≦̸': '\\not\\leq',
	    '≦': '\\leq',
	    '≣': '\\overset{=}{=} ',
	    '≞': '\\overset{m}{=} ',
	    '≝': '\\overset{def}{=}',
	    '≘': '=',
	    '≖': '=',
	    '≕': '=:',
	    '≓': '\\doteq',
	    '≒': '\\doteq',
	    '≑': '\\doteq',
	    '≐': '\\doteq',
	    '≏̸': '',
	    '≏': '',
	    '≎̸': '',
	    '≎': '',
	    '≌': '\\approx',
	    '≋': '\\approx',
	    '≊': '\\approx',
	    '≂̸': '\\neq',
	    '≂': '=',
	    '∿': '\\sim',
	    '∾': '\\infty',
	    '∽̱': '\\sim',
	    '∽': '\\sim',
	    '∻': '\\sim',
	    '∺': ':-:',
	    '∹': '-:',
	    '∸': '\\bot',
	    '∷': '::',
	    '∶': ':',
	    '∣': '|',
	    '∟': '\\llcorner',
	    '∙': '\\cdot',
	    '∘': '\\circ',
	    '∗': '*',
	    '∕': '/',
	    '∎': '\\square',
	    '∍': '\\ni',
	    '∊': '\\in',
	    '∆': '\\Delta',
	    '⁄': '/',
	    '⪰̸': '\\nsucceq',
	    '⪰': '\\succeq',
	    '⪯̸': '\\npreceq',
	    '⪯': '\\preceq',
	    '⪈': '\\ngeqslant',
	    '⪇': '\\nleqslant',
	    '⧳': '\\Phi',
	    '⧦': '\\models',
	    '⧥': '\\not\\equiv',
	    '⧤': '\\approx\\neq',
	    '⧣': '\\neq',
	    '⧁': '\\circle',
	    '⧀': '\\circle',
	    '◦': '\\circle',
	    '◗': '\\circle',
	    '◖': '\\circle',
	    '●': '\\circle',
	    '◎': '\\circledcirc',
	    '◍': '\\circledcirc',
	    '◌': '\\circledcirc',
	    '◉': '\\circledcirc',
	    '◈': '\\diamond',
	    '◇': '\\diamond',
	    '◆': '\\diamond',
	    '◅': '\\triangleleft',
	    '◄': '\\triangleleft',
	    '◃': '\\triangleleft',
	    '◂': '\\triangleleft',
	    '◁': '\\triangleleft',
	    '◀': '\\triangleleft',
	    '▿': '\\triangledown',
	    '▾': '\\triangledown',
	    '▽': '\\triangledown',
	    '▼': '\\triangledown',
	    '▹': '\\triangleright',
	    '▸': '\\triangleright',
	    '▷': '\\triangleright',
	    '▶': '\\triangleright',
	    '▵': '\\triangle',
	    '▴': '\\triangle',
	    '△': '\\triangle',
	    '▱': '\\square',
	    '▰': '\\square',
	    '▯': '\\square',
	    '▮': '\\square',
	    '▭': '\\square',
	    '▫': '\\square',
	    '▪': '\\square',
	    '□': '\\square',
	    '■': '\\square',
	    '⋭': '\\not\\triangleright',
	    '⋬': '\\not\\triangleleft',
	    '⋫': '\\not\\triangleright',
	    '⋪': '\\not\\triangleleft',
	    '⋙': '\\ggg',
	    '⋘': '\\lll',
	    '⋗': '*>',
	    '⋖': '<*',
	    '⋔': '\\pitchfork',
	    '⋌': '',
	    '⋋': '',
	    '⋊': '\\rtimes',
	    '⋉': '\\ltimes',
	    '⊵': '\\triangleright',
	    '\\triangleleft': '',
	    '⊥': '\\bot',
	    '⊁': '\\nsucc',
	    '⊀': '\\preceq',
	    '≽': '\\succeq',
	    '≼': '\\preceq',
	    '≻': '\\succ',
	    '≺': '\\prec',
	    '≱': '\\geq/',
	    '≰': '\\leq/',
	    '≭': '\\neq',
	    '≫̸': '\\not\\gg',
	    '≫': '\\gg',
	    '≪̸': '\\not\\ll',
	    '≪': '\\ll',
	    '≩': '\\ngeqslant',
	    '≨': '\\nleqslant',
	    '≡': '\\equiv',
	    '≟': '\\doteq',
	    '≜': '\\triangleq',
	    '≛': '\\doteq',
	    '≚': '\\triangleq',
	    '≙': '\\triangleq',
	    '≗': '\\doteq',
	    '≔': ':=',
	    '≍': '\\asymp',
	    '≇': '\\ncong',
	    '≆': '\\ncong',
	    '≅': '\\cong',
	    '≄': '\\not\\simeq',
	    '≃': '\\simeq',
	    '≁': '\\not\\sim',
	    '∦': '\\not\\parallel',
	    '∥': '\\parallel',
	    '∤': '\\not|',
	    '∝': '\\propto',
	    '==': '==',
	    '=': '=',
	    ':=': ':=',
	    '/=': '=',
	    '-=': '-=',
	    '+=': '+=',
	    '*=': '*=',
	    '!=': '!=',
	    '≠': '\\neq',
	    '≢': '\\equiv /',
	    '≉': '\\approx /',
	    '∼': 'sim',
	    '≈': '\\approx',
	    '≮': '</',
	    '<': '<',
	    '≯': '>/',
	    '>=': '>=',
	    '>': '>',
	    '≥': '\\geq',
	    '≤': '\\leq',
	    '<=': '<=',
	    '⊋': '\\supsetneq',
	    '⊊': '\\subsetneq',
	    '⊉': '\\nsupseteq',
	    '⊈': '\\nsubseteq',
	    '⊇': '\\supseteq',
	    '⊆': '\\subseteq',
	    '⊅': '\\not\\supset',
	    '⊄': '\\not\\subset',
	    '⊃⃒': '\\supset |',
	    '⊃': '\\supset',
	    '⊂⃒': '\\subset |',
	    '⊂': '\\subset',
	    '∌': '\\not\\in',
	    '∉': '\\notin',
	    '∈': '\\in',
	    '∁': 'C',
	    '∄': '\\nexists',
	    '∃': '\\exists',
	    '∀': '\\forall',
	    '∧': '\\land',
	    '&&': '\\&\\&',
	    '∨': '\\lor',
	    '⊯': '\\cancel{\\vDash}',
	    '⊮': '\\cancel{\\Vdash}',
	    '⊭': '\\nvDash',
	    '⊬': '\\nvDash',
	    '⊩': '\\Vdash',
	    '⊨': '\\vDash',
	    '⊤': '\\top',
	    '⊣': '\\dashv',
	    '⊢': '\\vdash',
	    '∋': '\\ni',
	    '⋱': '\\ddots',
	    '⋯': '\\hdots',
	    '⋮': '\\vdots',
	    '…': '\\hdots',
	    '϶': '\\ni',
	    ':': ':',
	    '...': '\\cdots',
	    '..': '..',
	    '->': '->',
	    '∵': '\\because',
	    '∴': '\\therefore ',
	    '⁣': '',
	    ',': ',',
	    ';': ';',
	    '⧽': '\\}',
	    '⧼': '\\{',
	    '⦘': '\\]',
	    '⦗': '\\[',
	    '⦖': '\\ll',
	    '⦕': '\\gg',
	    '⦔': '\\gg',
	    '⦓': '\\ll',
	    '⦒': '\\gg',
	    '⦑': '\\ll',
	    '⦐': '\\]',
	    '⦏': '\\]',
	    '⦎': '\\]',
	    '⦍': '\\[',
	    '⦌': '\\[',
	    '⦋': '\\]',
	    '⦊': '\\triangleright',
	    '⦉': '\\triangleleft',
	    '⦈': '|\\)',
	    '⦇': '\\(|',
	    '⦆': '|\\)',
	    '⦅': '\\(\\(',
	    '⦄': '|\\}',
	    '⦃': '\\{|',
	    '⦀': '\\||',
	    '⟯': '\\left. \\right]',
	    '⟮': '\\left[ \\right.',
	    '⟭': '\\left. \\right]]',
	    '⟬': '\\left[[ \\right.',
	    '⟫': '\\gg',
	    '⟪': '\\ll',
	    '⟩': '\\rangle',
	    '⟨': '\\langle',
	    '⟧': '\\left. \\right]]',
	    '⟦': '\\left[[ \\right.',
	    '❳': '\\left.\\right)',
	    '❲': '\\left(\\right.',
	    '〉': '\\rangle',
	    '〈': '\\langle',
	    '⌋': '\\rfloor',
	    '⌊': '\\lfloor',
	    '⌉': '\\rceil',
	    '⌈': '\\lceil',
	    '‖': '\\parallel',
	    '}': '\\left.\\right}',
	    '{': '\\left{\\right.',
	    ']': '\\left]\\right.',
	    '[': '\\left[\\right.',
	    ')': '\\left.\\right)',
	    '(': '\\left(\\right.',
	    '”': '"',
	    '“': '``',
	    '’': "'",
	    '‘': '`',
	    α: '\\alpha',
	    β: '\\beta',
	    γ: '\\gamma',
	    Γ: '\\Gamma',
	    δ: '\\delta',
	    Δ: '\\Delta',
	    ϵ: '\\epsilon',
	    ζ: '\\zeta',
	    η: '\\eta',
	    θ: '\\theta',
	    Θ: '\\Theta',
	    ι: '\\iota',
	    κ: '\\kappa',
	    λ: '\\lambda',
	    μ: '\\mu',
	    ν: '\\nu',
	    ο: '\\omicron',
	    π: '\\pi',
	    Π: '\\Pi',
	    ρ: '\\pho',
	    σ: '\\sigma',
	    Σ: '\\Sigma',
	    τ: '\\tau',
	    υ: '\\upsilon',
	    Υ: '\\Upsilon',
	    ϕ: '\\phi',
	    Φ: '\\Phi',
	    χ: '\\chi',
	    ψ: '\\psi',
	    Ψ: '\\Psi',
	    ω: '\\omega',
	    Ω: '\\Omega',
	};

	var allMathSymbolsByChar = {};

	Object.defineProperty(allMathSymbolsByChar, "__esModule", { value: true });
	allMathSymbolsByChar.allMathSymbolsByChar = void 0;
	allMathSymbolsByChar.allMathSymbolsByChar = {
	    '&#xA0;': '\\textrm{ }',
	    '&#x2203;': '\\exists',
	    '&#x2200;': '\\forall',
	    '&#x21D4;': '\\iff',
	    '&#x21D2;': '=>',
	    '&#xAC;': '\\neg',
	    '&#x2124;': '\\mathbb{Z}',
	    '&#x211D;': '\\mathbb{R}',
	    '&#x211A;': '\\mathbb{Q}',
	    '&#x2115;': '\\mathbb{N}',
	    '&#x2102;': 'CC',
	    '&#x25A1;': '\\square',
	    '&#x22C4;': '\\diamond',
	    '&#x25B3;': '\\triangle',
	    '&#x2322;': '\\frown',
	    '&#x2220;': '\\angle',
	    '&#x22F1;': '\\ddots',
	    '&#x22EE;': '\\vdots',
	    '&#x2235;': '\\because',
	    '&#x2234;': '\\therefore',
	    '&#x2135;': '\\aleph',
	    '&#x2205;': '\\oslash',
	    '&#xB1;': '\\pm',
	    '&#x2207;': '\\nabla',
	    '&#x2202;': '\\partial',
	    '&#x222E;': '\\oint',
	    '&#x222B;': '\\int',
	    '&#x22C3;': '\\cup',
	    '&#x222A;': '\\cup',
	    '&#x22C2;': '\\cap',
	    '&#x2229;': '\\cap',
	    '&#x22C1;': '\\vee',
	    '&#x2228;': '\\vee',
	    '&#x22C0;': '\\wedge',
	    '&#x2227;': '\\wedge',
	    '&#x220F;': '\\prod',
	    '&#x2211;': '\\sum',
	    '&#x2299;': '\\bigodot',
	    '&#x2297;': '\\bigoplus',
	    '&#x2295;': 'o+',
	    '&#x2218;': '@',
	    '&#x22C8;': '\\bowtie',
	    '&#x22CA;': '\\rtimes',
	    '&#x22C9;': '\\ltimes',
	    '&#xF7;': '\\div',
	    '&#xD7;': '\\times',
	    '\\': '\\backslash',
	    '&#x22C6;': '\\star',
	    '&#x2217;': '\\star',
	    '&#x22C5;': '\\cdot',
	    '&#x3A9;': '\\Omega',
	    '&#x3C9;': '\\omega',
	    '&#x3A8;': '\\Psi',
	    '&#x3C8;': '\\psi',
	    '&#x3C7;': '\\chi',
	    '&#x3C6;': '\\varphi',
	    '&#x3A6;': '\\Phi',
	    '&#x3D5;': '\\phi',
	    '&#x3C5;': '\\upsilon',
	    '&#x3C4;': '\\tau',
	    '&#x3A3;': '\\Sigma',
	    '&#x3C3;': '\\sigma',
	    '&#x3C1;': '\\rho',
	    '&#x3A0;': '\\Pi',
	    '&#x3C0;': '\\pi',
	    '&#x39E;': '\\Xi',
	    '&#x3BE;': '\\xi',
	    '&#x3BD;': '\\nu',
	    '&#x3BC;': '\\mu',
	    '&#x39B;': '\\Lambda',
	    '&#x3BB;': '\\lambda',
	    '&#x3BA;': '\\kappa',
	    '&#x3B9;': '\\iota',
	    '&#x3D1;': '\\vartheta',
	    '&#x398;': '\\Theta',
	    '&#x3B8;': '\\theta',
	    '&#x3B7;': '\\eta',
	    '&#x3B6;': '\\zeta',
	    '&#x25B;': '\\varepsilon',
	    '&#x3B5;': '\\epsilon',
	    '&#x394;': '\\Delta',
	    '&#x3B4;': '\\delta',
	    '&#x393;': '\\Gamma',
	    '&#x3B3;': '\\gamma',
	    '&#x3B2;': '\\beta',
	    '&#x3B1;': '\\alpha',
	    '&#x221E;': '\\infty',
	};

	var allMathSymbolsByGlyph = {};

	Object.defineProperty(allMathSymbolsByGlyph, "__esModule", { value: true });
	allMathSymbolsByGlyph.allMathSymbolsByGlyph = void 0;
	allMathSymbolsByGlyph.allMathSymbolsByGlyph = {
	    ' ': '\\textrm{ }',
	    '∃': '\\exists',
	    '∀': '\\forall',
	    '⇔': '\\iff',
	    '⇒': '=>',
	    '¬': '\\neg',
	    '□': '\\square',
	    '⋄': '\\diamond',
	    '△': '\\triangle',
	    '⌢': '\\frown',
	    '∠': '\\angle',
	    '⋱': '\\ddots',
	    '⋮': '\\vdots',
	    '∵': '\\because',
	    '∴': '\\therefore',
	    ℵ: '\\aleph',
	    '∅': '\\oslash',
	    '±': '\\pm',
	    '∇': '\\nabla',
	    '∂': '\\partial',
	    '∮': '\\oint',
	    '∫': '\\int',
	    '⋃': '\\cup',
	    '∪': '\\cup',
	    '⋂': '\\cap',
	    '∩': '\\cap',
	    '⋁': '\\vee',
	    '∨': '\\vee',
	    '⋀': '\\wedge',
	    '∧': '\\wedge',
	    '∏': '\\prod',
	    '∑': '\\sum',
	    '⊙': '\\bigodot',
	    '⊗': '\\bigoplus',
	    '⊕': 'o+',
	    '∘': '@',
	    '⋈': '\\bowtie',
	    '⋊': '\\rtimes',
	    '⋉': '\\ltimes',
	    '÷': '\\div',
	    '×': '\\times',
	    '\\': '\\backslash',
	    '⋆': '\\star',
	    '∗': '\\star',
	    '⋅': '\\cdot',
	    Ω: '\\Omega',
	    ω: '\\omega',
	    Ψ: '\\Psi',
	    ψ: '\\psi',
	    χ: '\\chi',
	    φ: '\\varphi',
	    Φ: '\\Phi',
	    ϕ: '\\phi',
	    υ: '\\upsilon',
	    τ: '\\tau',
	    Σ: '\\Sigma',
	    σ: '\\sigma',
	    ρ: '\\rho',
	    Π: '\\Pi',
	    π: '\\pi',
	    Ξ: '\\Xi',
	    ξ: '\\xi',
	    ν: '\\nu',
	    μ: '\\mu',
	    Λ: '\\Lambda',
	    λ: '\\lambda',
	    κ: '\\kappa',
	    ι: '\\iota',
	    ϑ: '\\vartheta',
	    Θ: '\\Theta',
	    θ: '\\theta',
	    η: '\\eta',
	    ζ: '\\zeta',
	    ɛ: '\\varepsilon',
	    ε: '\\epsilon',
	    Δ: '\\Delta',
	    δ: '\\delta',
	    Γ: '\\Gamma',
	    γ: '\\gamma',
	    β: '\\beta',
	    α: '\\alpha',
	    '∞': '\\infty',
	};

	var latexAccents = {};

	Object.defineProperty(latexAccents, "__esModule", { value: true });
	latexAccents.latexAccents = void 0;
	latexAccents.latexAccents = ['\\hat', '\\bar', '\\underbrace', '\\overbrace'];

	(function (exports) {
		var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    var desc = Object.getOwnPropertyDescriptor(m, k);
		    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
		      desc = { enumerable: true, get: function() { return m[k]; } };
		    }
		    Object.defineProperty(o, k2, desc);
		}) : (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    o[k2] = m[k];
		}));
		var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
		    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		__exportStar(allMathOperatorsByChar, exports);
		__exportStar(allMathOperatorsByGlyph, exports);
		__exportStar(allMathSymbolsByChar, exports);
		__exportStar(allMathSymbolsByGlyph, exports);
		__exportStar(latexAccents, exports);
	} (syntax));

	var hasRequiredMi;

	function requireMi () {
		if (hasRequiredMi) return mi;
		hasRequiredMi = 1;
		Object.defineProperty(mi, "__esModule", { value: true });
		mi.MI = void 0;
		var helpers_1 = requireHelpers();
		var syntax_1 = syntax;
		var MI = /** @class */ (function () {
		    function MI(mathElement) {
		        this._mathmlElement = mathElement;
		    }
		    MI.prototype.convert = function () {
		        var normalizedValue = (0, helpers_1.normalizeWhiteSpaces)(this._mathmlElement.value);
		        if (normalizedValue === ' ')
		            return Character.apply(normalizedValue);
		        var trimmedValue = normalizedValue.trim();
		        return Character.apply(trimmedValue);
		    };
		    return MI;
		}());
		mi.MI = MI;
		var Character = /** @class */ (function () {
		    function Character(value) {
		        this._value = value;
		    }
		    Character.apply = function (value) {
		        return new Character(value)._apply();
		    };
		    Character.prototype._apply = function () {
		        return this._findByCharacter() || this._findByGlyph() || this._value;
		    };
		    Character.prototype._findByCharacter = function () {
		        return syntax_1.allMathSymbolsByChar[this._value];
		    };
		    Character.prototype._findByGlyph = function () {
		        return syntax_1.allMathSymbolsByGlyph[this._value];
		    };
		    return Character;
		}());
		return mi;
	}

	var mo = {};

	var hasRequiredMo;

	function requireMo () {
		if (hasRequiredMo) return mo;
		hasRequiredMo = 1;
		Object.defineProperty(mo, "__esModule", { value: true });
		mo.MO = void 0;
		var helpers_1 = requireHelpers();
		var syntax_1 = syntax;
		var MO = /** @class */ (function () {
		    function MO(mathElement) {
		        this._mathmlElement = mathElement;
		    }
		    MO.prototype.convert = function () {
		        var normalizedValue = (0, helpers_1.normalizeWhiteSpaces)(this._mathmlElement.value);
		        var trimmedValue = normalizedValue.trim();
		        return Operator.operate(trimmedValue);
		    };
		    return MO;
		}());
		mo.MO = MO;
		var Operator = /** @class */ (function () {
		    function Operator(value) {
		        this._value = value;
		    }
		    Operator.operate = function (value) {
		        return new Operator(value)._operate();
		    };
		    Operator.prototype._operate = function () {
		        return this._findByCharacter() || this._findByGlyph() || this._value;
		    };
		    Operator.prototype._findByCharacter = function () {
		        return syntax_1.allMathOperatorsByChar[this._value];
		    };
		    Operator.prototype._findByGlyph = function () {
		        return syntax_1.allMathOperatorsByGlyph[this._value];
		    };
		    return Operator;
		}());
		return mo;
	}

	var mn = {};

	var hasRequiredMn;

	function requireMn () {
		if (hasRequiredMn) return mn;
		hasRequiredMn = 1;
		Object.defineProperty(mn, "__esModule", { value: true });
		mn.MN = void 0;
		var helpers_1 = requireHelpers();
		var MN = /** @class */ (function () {
		    function MN(mathElement) {
		        this._mathmlElement = mathElement;
		    }
		    MN.prototype.convert = function () {
		        var normalizedValue = (0, helpers_1.normalizeWhiteSpaces)(this._mathmlElement.value);
		        return normalizedValue.trim();
		    };
		    return MN;
		}());
		mn.MN = MN;
		return mn;
	}

	var msqrt = {};

	var hasRequiredMsqrt;

	function requireMsqrt () {
		if (hasRequiredMsqrt) return msqrt;
		hasRequiredMsqrt = 1;
		Object.defineProperty(msqrt, "__esModule", { value: true });
		msqrt.MSqrt = void 0;
		var helpers_1 = requireHelpers();
		var MSqrt = /** @class */ (function () {
		    function MSqrt(mathElement) {
		        this._mathmlElement = mathElement;
		    }
		    MSqrt.prototype.convert = function () {
		        var latexJoinedChildren = this._mathmlElement.children
		            .map(function (child) { return (0, helpers_1.mathMLElementToLaTeXConverter)(child); })
		            .map(function (converter) { return converter.convert(); })
		            .join(' ');
		        return "\\sqrt{".concat(latexJoinedChildren, "}");
		    };
		    return MSqrt;
		}());
		msqrt.MSqrt = MSqrt;
		return msqrt;
	}

	var mfenced = {};

	var hasRequiredMfenced;

	function requireMfenced () {
		if (hasRequiredMfenced) return mfenced;
		hasRequiredMfenced = 1;
		Object.defineProperty(mfenced, "__esModule", { value: true });
		mfenced.MFenced = void 0;
		var mathml_element_to_latex_converter_1 = requireMathmlElementToLatexConverter();
		var helpers_1 = requireHelpers();
		var MFenced = /** @class */ (function () {
		    function MFenced(mathmlElement) {
		        this._mathmlElement = mathmlElement;
		        this._open = this._mathmlElement.attributes.open || '';
		        this._close = this._mathmlElement.attributes.close || '';
		        this._separators = Array.from(this._mathmlElement.attributes.separators || '');
		    }
		    MFenced.prototype.convert = function () {
		        var latexChildren = this._mathmlElement.children
		            .map(function (child) { return (0, mathml_element_to_latex_converter_1.mathMLElementToLaTeXConverter)(child); })
		            .map(function (converter) { return converter.convert(); });
		        if (this._isThereRelativeOfName(this._mathmlElement.children, 'mtable'))
		            return new Matrix(this._open, this._close).apply(latexChildren);
		        return new Vector(this._open, this._close, this._separators).apply(latexChildren);
		    };
		    MFenced.prototype._isThereRelativeOfName = function (mathmlElements, elementName) {
		        var _this = this;
		        return mathmlElements.some(function (child) { return child.name === elementName || _this._isThereRelativeOfName(child.children, elementName); });
		    };
		    return MFenced;
		}());
		mfenced.MFenced = MFenced;
		var Vector = /** @class */ (function () {
		    function Vector(open, close, separators) {
		        this._open = open || '(';
		        this._close = close || ')';
		        this._separators = separators;
		    }
		    Vector.prototype.apply = function (latexContents) {
		        var contentWithoutWrapper = helpers_1.JoinWithManySeparators.join(latexContents, this._separators);
		        return new helpers_1.GenericWrapper(this._open, this._close).wrap(contentWithoutWrapper);
		    };
		    return Vector;
		}());
		var Matrix = /** @class */ (function () {
		    function Matrix(open, close) {
		        this._genericCommand = 'matrix';
		        this._separators = new Separators(open, close);
		    }
		    Matrix.prototype.apply = function (latexContents) {
		        var command = this._command;
		        var matrix = "\\begin{".concat(command, "}\n").concat(latexContents.join(''), "\n\\end{").concat(command, "}");
		        return command === this._genericCommand ? this._separators.wrap(matrix) : matrix;
		    };
		    Object.defineProperty(Matrix.prototype, "_command", {
		        get: function () {
		            if (this._separators.areParentheses())
		                return 'pmatrix';
		            if (this._separators.areSquareBrackets())
		                return 'bmatrix';
		            if (this._separators.areBrackets())
		                return 'Bmatrix';
		            if (this._separators.areDivides())
		                return 'vmatrix';
		            if (this._separators.areParallels())
		                return 'Vmatrix';
		            if (this._separators.areNotEqual())
		                return this._genericCommand;
		            return 'bmatrix';
		        },
		        enumerable: false,
		        configurable: true
		    });
		    return Matrix;
		}());
		var Separators = /** @class */ (function () {
		    function Separators(open, close) {
		        this._open = open;
		        this._close = close;
		    }
		    Separators.prototype.wrap = function (str) {
		        return new helpers_1.GenericWrapper(this._open, this._close).wrap(str);
		    };
		    Separators.prototype.areParentheses = function () {
		        return this._compare('(', ')');
		    };
		    Separators.prototype.areSquareBrackets = function () {
		        return this._compare('[', ']');
		    };
		    Separators.prototype.areBrackets = function () {
		        return this._compare('{', '}');
		    };
		    Separators.prototype.areDivides = function () {
		        return this._compare('|', '|');
		    };
		    Separators.prototype.areParallels = function () {
		        return this._compare('||', '||');
		    };
		    Separators.prototype.areNotEqual = function () {
		        return this._open !== this._close;
		    };
		    Separators.prototype._compare = function (openToCompare, closeToCompare) {
		        return this._open === openToCompare && this._close === closeToCompare;
		    };
		    return Separators;
		}());
		return mfenced;
	}

	var mfrac = {};

	var errors = {};

	var invalidNumberOfChildren = {};

	var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
	    var extendStatics = function (d, b) {
	        extendStatics = Object.setPrototypeOf ||
	            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
	        return extendStatics(d, b);
	    };
	    return function (d, b) {
	        if (typeof b !== "function" && b !== null)
	            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	})();
	Object.defineProperty(invalidNumberOfChildren, "__esModule", { value: true });
	invalidNumberOfChildren.InvalidNumberOfChildrenError = void 0;
	var InvalidNumberOfChildrenError = /** @class */ (function (_super) {
	    __extends(InvalidNumberOfChildrenError, _super);
	    function InvalidNumberOfChildrenError(tagName, expectedNumberOfChild, currentNumberOfChild, comparison) {
	        if (comparison === void 0) { comparison = 'exactly'; }
	        var _this = _super.call(this, "".concat(tagName, " tag must have ").concat(comparison, " ").concat(expectedNumberOfChild, " children. It's actually ").concat(currentNumberOfChild)) || this;
	        _this.name = 'InvalidNumberOfChildrenError';
	        return _this;
	    }
	    return InvalidNumberOfChildrenError;
	}(Error));
	invalidNumberOfChildren.InvalidNumberOfChildrenError = InvalidNumberOfChildrenError;

	(function (exports) {
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.InvalidNumberOfChildrenError = void 0;
		var invalid_number_of_children_1 = invalidNumberOfChildren;
		Object.defineProperty(exports, "InvalidNumberOfChildrenError", { enumerable: true, get: function () { return invalid_number_of_children_1.InvalidNumberOfChildrenError; } });
	} (errors));

	var hasRequiredMfrac;

	function requireMfrac () {
		if (hasRequiredMfrac) return mfrac;
		hasRequiredMfrac = 1;
		Object.defineProperty(mfrac, "__esModule", { value: true });
		mfrac.MFrac = void 0;
		var errors_1 = errors;
		var helpers_1 = requireHelpers();
		var MFrac = /** @class */ (function () {
		    function MFrac(mathElement) {
		        this._mathmlElement = mathElement;
		    }
		    MFrac.prototype.convert = function () {
		        var _a = this._mathmlElement, children = _a.children, name = _a.name;
		        var childrenLength = children.length;
		        if (childrenLength !== 2)
		            throw new errors_1.InvalidNumberOfChildrenError(name, 2, childrenLength);
		        var num = (0, helpers_1.mathMLElementToLaTeXConverter)(children[0]).convert();
		        var den = (0, helpers_1.mathMLElementToLaTeXConverter)(children[1]).convert();
		        if (this._isBevelled())
		            return "".concat(this._wrapIfMoreThanOneChar(num), "/").concat(this._wrapIfMoreThanOneChar(den));
		        return "\\frac{".concat(num, "}{").concat(den, "}");
		    };
		    MFrac.prototype._wrapIfMoreThanOneChar = function (str) {
		        return new helpers_1.ParenthesisWrapper().wrapIfMoreThanOneChar(str);
		    };
		    MFrac.prototype._isBevelled = function () {
		        return !!this._mathmlElement.attributes.bevelled;
		    };
		    return MFrac;
		}());
		mfrac.MFrac = MFrac;
		return mfrac;
	}

	var mroot = {};

	var hasRequiredMroot;

	function requireMroot () {
		if (hasRequiredMroot) return mroot;
		hasRequiredMroot = 1;
		Object.defineProperty(mroot, "__esModule", { value: true });
		mroot.MRoot = void 0;
		var helpers_1 = requireHelpers();
		var errors_1 = errors;
		var MRoot = /** @class */ (function () {
		    function MRoot(mathElement) {
		        this._mathmlElement = mathElement;
		    }
		    MRoot.prototype.convert = function () {
		        var _a = this._mathmlElement, name = _a.name, children = _a.children;
		        var childrenLength = children.length;
		        if (childrenLength !== 2)
		            throw new errors_1.InvalidNumberOfChildrenError(name, 2, childrenLength);
		        var content = (0, helpers_1.mathMLElementToLaTeXConverter)(children[0]).convert();
		        var rootIndex = (0, helpers_1.mathMLElementToLaTeXConverter)(children[1]).convert();
		        return "\\sqrt[".concat(rootIndex, "]{").concat(content, "}");
		    };
		    return MRoot;
		}());
		mroot.MRoot = MRoot;
		return mroot;
	}

	var maction = {};

	var hasRequiredMaction;

	function requireMaction () {
		if (hasRequiredMaction) return maction;
		hasRequiredMaction = 1;
		Object.defineProperty(maction, "__esModule", { value: true });
		maction.MAction = void 0;
		var mathml_element_to_latex_converter_1 = requireMathmlElementToLatexConverter();
		var MAction = /** @class */ (function () {
		    function MAction(mathElement) {
		        this._mathmlElement = mathElement;
		    }
		    MAction.prototype.convert = function () {
		        var children = this._mathmlElement.children;
		        if (this._isToggle())
		            return children
		                .map(function (child) { return (0, mathml_element_to_latex_converter_1.mathMLElementToLaTeXConverter)(child); })
		                .map(function (converter) { return converter.convert(); })
		                .join(' \\Longrightarrow ');
		        return (0, mathml_element_to_latex_converter_1.mathMLElementToLaTeXConverter)(children[0]).convert();
		    };
		    MAction.prototype._isToggle = function () {
		        var actiontype = this._mathmlElement.attributes.actiontype;
		        return actiontype === 'toggle' || !actiontype;
		    };
		    return MAction;
		}());
		maction.MAction = MAction;
		return maction;
	}

	var menclose = {};

	var hasRequiredMenclose;

	function requireMenclose () {
		if (hasRequiredMenclose) return menclose;
		hasRequiredMenclose = 1;
		Object.defineProperty(menclose, "__esModule", { value: true });
		menclose.MEnclose = void 0;
		var mathml_element_to_latex_converter_1 = requireMathmlElementToLatexConverter();
		var MEnclose = /** @class */ (function () {
		    function MEnclose(mathElement) {
		        this._mathmlElement = mathElement;
		    }
		    MEnclose.prototype.convert = function () {
		        var latexJoinedChildren = this._mathmlElement.children
		            .map(function (child) { return (0, mathml_element_to_latex_converter_1.mathMLElementToLaTeXConverter)(child); })
		            .map(function (converter) { return converter.convert(); })
		            .join(' ');
		        if (this._notation === 'actuarial')
		            return "\\overline{\\left.".concat(latexJoinedChildren, "\\right|}");
		        if (this._notation === 'radical')
		            return "\\sqrt{".concat(latexJoinedChildren, "}");
		        if (['box', 'roundedbox', 'circle'].includes(this._notation))
		            return "\\boxed{".concat(latexJoinedChildren, "}");
		        if (this._notation === 'left')
		            return "\\left|".concat(latexJoinedChildren);
		        if (this._notation === 'right')
		            return "".concat(latexJoinedChildren, "\\right|");
		        if (this._notation === 'top')
		            return "\\overline{".concat(latexJoinedChildren, "}");
		        if (this._notation === 'bottom')
		            return "\\underline{".concat(latexJoinedChildren, "}");
		        if (this._notation === 'updiagonalstrike')
		            return "\\cancel{".concat(latexJoinedChildren, "}");
		        if (this._notation === 'downdiagonalstrike')
		            return "\\bcancel{".concat(latexJoinedChildren, "}");
		        if (this._notation === 'updiagonalarrow')
		            return "\\cancelto{}{".concat(latexJoinedChildren, "}");
		        if (['verticalstrike', 'horizontalstrike'].includes(this._notation))
		            return "\\hcancel{".concat(latexJoinedChildren, "}");
		        if (this._notation === 'madruwb')
		            return "\\underline{".concat(latexJoinedChildren, "\\right|}");
		        if (this._notation === 'phasorangle')
		            return "{\\angle \\underline{".concat(latexJoinedChildren, "}}");
		        return "\\overline{\\left.\\right)".concat(latexJoinedChildren, "}");
		    };
		    Object.defineProperty(MEnclose.prototype, "_notation", {
		        get: function () {
		            return this._mathmlElement.attributes.notation || 'longdiv';
		        },
		        enumerable: false,
		        configurable: true
		    });
		    return MEnclose;
		}());
		menclose.MEnclose = MEnclose;
		return menclose;
	}

	var merror = {};

	var hasRequiredMerror;

	function requireMerror () {
		if (hasRequiredMerror) return merror;
		hasRequiredMerror = 1;
		Object.defineProperty(merror, "__esModule", { value: true });
		merror.MError = void 0;
		var mathml_element_to_latex_converter_1 = requireMathmlElementToLatexConverter();
		var MError = /** @class */ (function () {
		    function MError(mathElement) {
		        this._mathmlElement = mathElement;
		    }
		    MError.prototype.convert = function () {
		        var latexJoinedChildren = this._mathmlElement.children
		            .map(function (child) { return (0, mathml_element_to_latex_converter_1.mathMLElementToLaTeXConverter)(child); })
		            .map(function (converter) { return converter.convert(); })
		            .join(' ');
		        return "\\color{red}{".concat(latexJoinedChildren, "}");
		    };
		    return MError;
		}());
		merror.MError = MError;
		return merror;
	}

	var mphantom = {};

	Object.defineProperty(mphantom, "__esModule", { value: true });
	mphantom.MPhantom = void 0;
	var MPhantom = /** @class */ (function () {
	    function MPhantom(mathElement) {
	        this._mathmlElement = mathElement;
	    }
	    MPhantom.prototype.convert = function () {
	        return '';
	    };
	    return MPhantom;
	}());
	mphantom.MPhantom = MPhantom;

	var msup = {};

	var hasRequiredMsup;

	function requireMsup () {
		if (hasRequiredMsup) return msup;
		hasRequiredMsup = 1;
		Object.defineProperty(msup, "__esModule", { value: true });
		msup.MSup = void 0;
		var helpers_1 = requireHelpers();
		var errors_1 = errors;
		var MSup = /** @class */ (function () {
		    function MSup(mathElement) {
		        this._mathmlElement = mathElement;
		    }
		    MSup.prototype.convert = function () {
		        var _a = this._mathmlElement, name = _a.name, children = _a.children;
		        var childrenLength = children.length;
		        if (childrenLength !== 2)
		            throw new errors_1.InvalidNumberOfChildrenError(name, 2, childrenLength);
		        var base = (0, helpers_1.mathMLElementToLaTeXConverter)(children[0]).convert();
		        var exponent = (0, helpers_1.mathMLElementToLaTeXConverter)(children[1]).convert();
		        return "".concat(base, "^").concat(new helpers_1.BracketWrapper().wrap(exponent));
		    };
		    return MSup;
		}());
		msup.MSup = MSup;
		return msup;
	}

	var msub = {};

	var hasRequiredMsub;

	function requireMsub () {
		if (hasRequiredMsub) return msub;
		hasRequiredMsub = 1;
		Object.defineProperty(msub, "__esModule", { value: true });
		msub.MSub = void 0;
		var helpers_1 = requireHelpers();
		var errors_1 = errors;
		var MSub = /** @class */ (function () {
		    function MSub(mathElement) {
		        this._mathmlElement = mathElement;
		    }
		    MSub.prototype.convert = function () {
		        var _a = this._mathmlElement, name = _a.name, children = _a.children;
		        var childrenLength = children.length;
		        if (childrenLength !== 2)
		            throw new errors_1.InvalidNumberOfChildrenError(name, 2, childrenLength);
		        var base = (0, helpers_1.mathMLElementToLaTeXConverter)(children[0]).convert();
		        var subscript = (0, helpers_1.mathMLElementToLaTeXConverter)(children[1]).convert();
		        return "".concat(base, "_").concat(new helpers_1.BracketWrapper().wrap(subscript));
		    };
		    return MSub;
		}());
		msub.MSub = MSub;
		return msub;
	}

	var msubsup = {};

	var hasRequiredMsubsup;

	function requireMsubsup () {
		if (hasRequiredMsubsup) return msubsup;
		hasRequiredMsubsup = 1;
		Object.defineProperty(msubsup, "__esModule", { value: true });
		msubsup.MSubsup = void 0;
		var helpers_1 = requireHelpers();
		var errors_1 = errors;
		var MSubsup = /** @class */ (function () {
		    function MSubsup(mathElement) {
		        this._mathmlElement = mathElement;
		    }
		    MSubsup.prototype.convert = function () {
		        var _a = this._mathmlElement, name = _a.name, children = _a.children;
		        var childrenLength = children.length;
		        if (childrenLength !== 3)
		            throw new errors_1.InvalidNumberOfChildrenError(name, 3, childrenLength);
		        var base = (0, helpers_1.mathMLElementToLaTeXConverter)(children[0]).convert();
		        var sub = (0, helpers_1.mathMLElementToLaTeXConverter)(children[1]).convert();
		        var sup = (0, helpers_1.mathMLElementToLaTeXConverter)(children[2]).convert();
		        var wrappedSub = new helpers_1.BracketWrapper().wrap(sub);
		        var wrappedSup = new helpers_1.BracketWrapper().wrap(sup);
		        return "".concat(this._wrapInParenthesisIfThereIsSpace(base), "_").concat(wrappedSub, "^").concat(wrappedSup);
		    };
		    MSubsup.prototype._wrapInParenthesisIfThereIsSpace = function (str) {
		        if (!str.match(/\s+/g))
		            return str;
		        return new helpers_1.ParenthesisWrapper().wrap(str);
		    };
		    return MSubsup;
		}());
		msubsup.MSubsup = MSubsup;
		return msubsup;
	}

	var mmultiscripts = {};

	var hasRequiredMmultiscripts;

	function requireMmultiscripts () {
		if (hasRequiredMmultiscripts) return mmultiscripts;
		hasRequiredMmultiscripts = 1;
		Object.defineProperty(mmultiscripts, "__esModule", { value: true });
		mmultiscripts.MMultiscripts = void 0;
		var helpers_1 = requireHelpers();
		var errors_1 = errors;
		var MMultiscripts = /** @class */ (function () {
		    function MMultiscripts(mathElement) {
		        this._mathmlElement = mathElement;
		    }
		    MMultiscripts.prototype.convert = function () {
		        var _a = this._mathmlElement, name = _a.name, children = _a.children;
		        var childrenLength = children.length;
		        if (childrenLength < 3)
		            throw new errors_1.InvalidNumberOfChildrenError(name, 3, childrenLength, 'at least');
		        var baseContent = (0, helpers_1.mathMLElementToLaTeXConverter)(children[0]).convert();
		        return this._prescriptLatex() + this._wrapInParenthesisIfThereIsSpace(baseContent) + this._postscriptLatex();
		    };
		    MMultiscripts.prototype._prescriptLatex = function () {
		        var children = this._mathmlElement.children;
		        var sub;
		        var sup;
		        if (this._isPrescripts(children[1])) {
		            sub = children[2];
		            sup = children[3];
		        }
		        else if (this._isPrescripts(children[3])) {
		            sub = children[4];
		            sup = children[5];
		        }
		        else
		            return '';
		        var subLatex = (0, helpers_1.mathMLElementToLaTeXConverter)(sub).convert();
		        var supLatex = (0, helpers_1.mathMLElementToLaTeXConverter)(sup).convert();
		        return "\\_{".concat(subLatex, "}^{").concat(supLatex, "}");
		    };
		    MMultiscripts.prototype._postscriptLatex = function () {
		        var children = this._mathmlElement.children;
		        if (this._isPrescripts(children[1]))
		            return '';
		        var sub = children[1];
		        var sup = children[2];
		        var subLatex = (0, helpers_1.mathMLElementToLaTeXConverter)(sub).convert();
		        var supLatex = (0, helpers_1.mathMLElementToLaTeXConverter)(sup).convert();
		        return "_{".concat(subLatex, "}^{").concat(supLatex, "}");
		    };
		    MMultiscripts.prototype._wrapInParenthesisIfThereIsSpace = function (str) {
		        if (!str.match(/\s+/g))
		            return str;
		        return new helpers_1.ParenthesisWrapper().wrap(str);
		    };
		    MMultiscripts.prototype._isPrescripts = function (child) {
		        return (child === null || child === void 0 ? void 0 : child.name) === 'mprescripts';
		    };
		    return MMultiscripts;
		}());
		mmultiscripts.MMultiscripts = MMultiscripts;
		return mmultiscripts;
	}

	var mtext = {};

	var normalizeCategoryCode = {};

	(function (exports) {
		Object.defineProperty(exports, "__esModule", { value: true });
		exports.normalizeCategoryCode = exports.allCategoryCode = void 0;
		exports.allCategoryCode = {
		    '{': true,
		    '}': true,
		    '$': true,
		    '&': true,
		    '#': true,
		    '^': true,
		    '_': true,
		    '%': true, // comment
		};
		var normalizeCategoryCode = function (str) {
		    if (exports.allCategoryCode[str]) {
		        return "\\".concat(str);
		    }
		    return str;
		};
		exports.normalizeCategoryCode = normalizeCategoryCode;
	} (normalizeCategoryCode));

	Object.defineProperty(mtext, "__esModule", { value: true });
	mtext.MText = void 0;
	var normalize_category_code_1 = normalizeCategoryCode;
	var MText = /** @class */ (function () {
	    function MText(mathElement) {
	        this._mathmlElement = mathElement;
	    }
	    MText.prototype.convert = function () {
	        var _a = this._mathmlElement, attributes = _a.attributes, value = _a.value;
	        return new TextCommand(attributes.mathvariant).apply((0, normalize_category_code_1.normalizeCategoryCode)(value));
	    };
	    return MText;
	}());
	mtext.MText = MText;
	var TextCommand = /** @class */ (function () {
	    function TextCommand(mathvariant) {
	        this._mathvariant = mathvariant || 'normal';
	    }
	    TextCommand.prototype.apply = function (value) {
	        return this._commands.reduce(function (acc, command, index) {
	            if (index === 0)
	                return "".concat(command, "{").concat(value, "}");
	            return "".concat(command, "{").concat(acc, "}");
	        }, '');
	    };
	    Object.defineProperty(TextCommand.prototype, "_commands", {
	        get: function () {
	            switch (this._mathvariant) {
	                case 'bold':
	                    return ['\\textbf'];
	                case 'italic':
	                    return ['\\textit'];
	                case 'bold-italic':
	                    return ['\\textit', '\\textbf'];
	                case 'double-struck':
	                    return ['\\mathbb'];
	                case 'monospace':
	                    return ['\\mathtt'];
	                case 'bold-fraktur':
	                case 'fraktur':
	                    return ['\\mathfrak'];
	                default:
	                    return ['\\text'];
	            }
	        },
	        enumerable: false,
	        configurable: true
	    });
	    return TextCommand;
	}());

	var munderover = {};

	var hasRequiredMunderover;

	function requireMunderover () {
		if (hasRequiredMunderover) return munderover;
		hasRequiredMunderover = 1;
		Object.defineProperty(munderover, "__esModule", { value: true });
		munderover.MUnderover = void 0;
		var helpers_1 = requireHelpers();
		var errors_1 = errors;
		var MUnderover = /** @class */ (function () {
		    function MUnderover(mathElement) {
		        this._mathmlElement = mathElement;
		    }
		    MUnderover.prototype.convert = function () {
		        var _a = this._mathmlElement, name = _a.name, children = _a.children;
		        var childrenLength = children.length;
		        if (childrenLength !== 3)
		            throw new errors_1.InvalidNumberOfChildrenError(name, 3, childrenLength);
		        var base = (0, helpers_1.mathMLElementToLaTeXConverter)(children[0]).convert();
		        var underContent = (0, helpers_1.mathMLElementToLaTeXConverter)(children[1]).convert();
		        var overContent = (0, helpers_1.mathMLElementToLaTeXConverter)(children[2]).convert();
		        return "".concat(base, "_{").concat(underContent, "}^{").concat(overContent, "}");
		    };
		    return MUnderover;
		}());
		munderover.MUnderover = MUnderover;
		return munderover;
	}

	var mtable = {};

	var hasRequiredMtable;

	function requireMtable () {
		if (hasRequiredMtable) return mtable;
		hasRequiredMtable = 1;
		Object.defineProperty(mtable, "__esModule", { value: true });
		mtable.MTable = void 0;
		var helpers_1 = requireHelpers();
		var MTable = /** @class */ (function () {
		    function MTable(mathElement) {
		        this._mathmlElement = mathElement;
		        this._addFlagRecursiveIfName(this._mathmlElement.children, 'mtable', 'innerTable');
		    }
		    MTable.prototype.convert = function () {
		        var tableContent = this._mathmlElement.children
		            .map(function (child) { return (0, helpers_1.mathMLElementToLaTeXConverter)(child); })
		            .map(function (converter) { return converter.convert(); })
		            .join(' \\\\\n');
		        return this._hasFlag('innerTable') ? this._wrap(tableContent) : tableContent;
		    };
		    MTable.prototype._wrap = function (latex) {
		        return "\\begin{matrix}".concat(latex, "\\end{matrix}");
		    };
		    MTable.prototype._addFlagRecursiveIfName = function (mathmlElements, name, flag) {
		        var _this = this;
		        mathmlElements.forEach(function (mathmlElement) {
		            if (mathmlElement.name === name)
		                mathmlElement.attributes[flag] = flag;
		            _this._addFlagRecursiveIfName(mathmlElement.children, name, flag);
		        });
		    };
		    MTable.prototype._hasFlag = function (flag) {
		        return !!this._mathmlElement.attributes[flag];
		    };
		    return MTable;
		}());
		mtable.MTable = MTable;
		return mtable;
	}

	var mtr = {};

	var hasRequiredMtr;

	function requireMtr () {
		if (hasRequiredMtr) return mtr;
		hasRequiredMtr = 1;
		Object.defineProperty(mtr, "__esModule", { value: true });
		mtr.MTr = void 0;
		var helpers_1 = requireHelpers();
		var MTr = /** @class */ (function () {
		    function MTr(mathElement) {
		        this._mathmlElement = mathElement;
		    }
		    MTr.prototype.convert = function () {
		        return this._mathmlElement.children
		            .map(function (child) { return (0, helpers_1.mathMLElementToLaTeXConverter)(child); })
		            .map(function (converter) { return converter.convert(); })
		            .join(' & ');
		    };
		    return MTr;
		}());
		mtr.MTr = MTr;
		return mtr;
	}

	var mspace = {};

	var hasRequiredMspace;

	function requireMspace () {
		if (hasRequiredMspace) return mspace;
		hasRequiredMspace = 1;
		Object.defineProperty(mspace, "__esModule", { value: true });
		mspace.MSpace = void 0;
		var helpers_1 = requireHelpers();
		var MSpace = /** @class */ (function () {
		    function MSpace(mathElement) {
		        this._mathmlElement = mathElement;
		    }
		    MSpace.prototype.convert = function () {
		        var latexJoinedChildren = this._mathmlElement.children
		            .map(function (child) { return (0, helpers_1.mathMLElementToLaTeXConverter)(child); })
		            .map(function (converter) { return converter.convert(); })
		            .join(' ');
		        if (this._linebreak === 'newline')
		            return "\\\\".concat(latexJoinedChildren);
		        return latexJoinedChildren;
		    };
		    Object.defineProperty(MSpace.prototype, "_linebreak", {
		        get: function () {
		            return this._mathmlElement.attributes.linebreak || 'auto';
		        },
		        enumerable: false,
		        configurable: true
		    });
		    return MSpace;
		}());
		mspace.MSpace = MSpace;
		return mspace;
	}

	var genericSpacingWrapper = {};

	var hasRequiredGenericSpacingWrapper;

	function requireGenericSpacingWrapper () {
		if (hasRequiredGenericSpacingWrapper) return genericSpacingWrapper;
		hasRequiredGenericSpacingWrapper = 1;
		Object.defineProperty(genericSpacingWrapper, "__esModule", { value: true });
		genericSpacingWrapper.GenericSpacingWrapper = void 0;
		var helpers_1 = requireHelpers();
		var GenericSpacingWrapper = /** @class */ (function () {
		    function GenericSpacingWrapper(mathElement) {
		        this._mathmlElement = mathElement;
		    }
		    GenericSpacingWrapper.prototype.convert = function () {
		        return this._mathmlElement.children
		            .map(function (child) { return (0, helpers_1.mathMLElementToLaTeXConverter)(child); })
		            .map(function (converter) { return converter.convert(); })
		            .join(' ');
		    };
		    return GenericSpacingWrapper;
		}());
		genericSpacingWrapper.GenericSpacingWrapper = GenericSpacingWrapper;
		return genericSpacingWrapper;
	}

	var genericUnderOver = {};

	var hasRequiredGenericUnderOver;

	function requireGenericUnderOver () {
		if (hasRequiredGenericUnderOver) return genericUnderOver;
		hasRequiredGenericUnderOver = 1;
		Object.defineProperty(genericUnderOver, "__esModule", { value: true });
		genericUnderOver.GenericUnderOver = void 0;
		var mathml_element_to_latex_converter_1 = requireMathmlElementToLatexConverter();
		var errors_1 = errors;
		var latex_accents_1 = latexAccents;
		var GenericUnderOver = /** @class */ (function () {
		    function GenericUnderOver(mathElement) {
		        this._mathmlElement = mathElement;
		    }
		    GenericUnderOver.prototype.convert = function () {
		        var _a = this._mathmlElement, name = _a.name, children = _a.children;
		        var childrenLength = children.length;
		        if (childrenLength !== 2)
		            throw new errors_1.InvalidNumberOfChildrenError(name, 2, childrenLength);
		        var content = (0, mathml_element_to_latex_converter_1.mathMLElementToLaTeXConverter)(children[0]).convert();
		        var accent = (0, mathml_element_to_latex_converter_1.mathMLElementToLaTeXConverter)(children[1]).convert();
		        return this._applyCommand(content, accent);
		    };
		    GenericUnderOver.prototype._applyCommand = function (content, accent) {
		        var type = this._mathmlElement.name.match(/under/) ? TagTypes.Under : TagTypes.Over;
		        return new UnderOverSetter(type).apply(content, accent);
		    };
		    return GenericUnderOver;
		}());
		genericUnderOver.GenericUnderOver = GenericUnderOver;
		var UnderOverSetter = /** @class */ (function () {
		    function UnderOverSetter(type) {
		        this._type = type;
		    }
		    UnderOverSetter.prototype.apply = function (content, accent) {
		        return latex_accents_1.latexAccents.includes(accent) ? "".concat(accent, "{").concat(content, "}") : "".concat(this._defaultCommand, "{").concat(accent, "}{").concat(content, "}");
		    };
		    Object.defineProperty(UnderOverSetter.prototype, "_defaultCommand", {
		        get: function () {
		            if (this._type === TagTypes.Under)
		                return '\\underset';
		            return '\\overset';
		        },
		        enumerable: false,
		        configurable: true
		    });
		    return UnderOverSetter;
		}());
		var TagTypes;
		(function (TagTypes) {
		    TagTypes[TagTypes["Under"] = 0] = "Under";
		    TagTypes[TagTypes["Over"] = 1] = "Over";
		})(TagTypes || (TagTypes = {}));
		return genericUnderOver;
	}

	var hasRequiredConverters;

	function requireConverters () {
		if (hasRequiredConverters) return converters;
		hasRequiredConverters = 1;
		(function (exports) {
			Object.defineProperty(exports, "__esModule", { value: true });
			exports.GenericUnderOver = exports.GenericSpacingWrapper = exports.MSpace = exports.MTr = exports.MTable = exports.MUnderover = exports.MText = exports.MMultiscripts = exports.MSubsup = exports.MSub = exports.MSup = exports.MPhantom = exports.MError = exports.MEnclose = exports.MAction = exports.MRoot = exports.MFrac = exports.MFenced = exports.MSqrt = exports.MN = exports.MO = exports.MI = exports.Math = void 0;
			var math_1 = requireMath();
			Object.defineProperty(exports, "Math", { enumerable: true, get: function () { return math_1.Math; } });
			var mi_1 = requireMi();
			Object.defineProperty(exports, "MI", { enumerable: true, get: function () { return mi_1.MI; } });
			var mo_1 = requireMo();
			Object.defineProperty(exports, "MO", { enumerable: true, get: function () { return mo_1.MO; } });
			var mn_1 = requireMn();
			Object.defineProperty(exports, "MN", { enumerable: true, get: function () { return mn_1.MN; } });
			var msqrt_1 = requireMsqrt();
			Object.defineProperty(exports, "MSqrt", { enumerable: true, get: function () { return msqrt_1.MSqrt; } });
			var mfenced_1 = requireMfenced();
			Object.defineProperty(exports, "MFenced", { enumerable: true, get: function () { return mfenced_1.MFenced; } });
			var mfrac_1 = requireMfrac();
			Object.defineProperty(exports, "MFrac", { enumerable: true, get: function () { return mfrac_1.MFrac; } });
			var mroot_1 = requireMroot();
			Object.defineProperty(exports, "MRoot", { enumerable: true, get: function () { return mroot_1.MRoot; } });
			var maction_1 = requireMaction();
			Object.defineProperty(exports, "MAction", { enumerable: true, get: function () { return maction_1.MAction; } });
			var menclose_1 = requireMenclose();
			Object.defineProperty(exports, "MEnclose", { enumerable: true, get: function () { return menclose_1.MEnclose; } });
			var merror_1 = requireMerror();
			Object.defineProperty(exports, "MError", { enumerable: true, get: function () { return merror_1.MError; } });
			var mphantom_1 = mphantom;
			Object.defineProperty(exports, "MPhantom", { enumerable: true, get: function () { return mphantom_1.MPhantom; } });
			var msup_1 = requireMsup();
			Object.defineProperty(exports, "MSup", { enumerable: true, get: function () { return msup_1.MSup; } });
			var msub_1 = requireMsub();
			Object.defineProperty(exports, "MSub", { enumerable: true, get: function () { return msub_1.MSub; } });
			var msubsup_1 = requireMsubsup();
			Object.defineProperty(exports, "MSubsup", { enumerable: true, get: function () { return msubsup_1.MSubsup; } });
			var mmultiscripts_1 = requireMmultiscripts();
			Object.defineProperty(exports, "MMultiscripts", { enumerable: true, get: function () { return mmultiscripts_1.MMultiscripts; } });
			var mtext_1 = mtext;
			Object.defineProperty(exports, "MText", { enumerable: true, get: function () { return mtext_1.MText; } });
			var munderover_1 = requireMunderover();
			Object.defineProperty(exports, "MUnderover", { enumerable: true, get: function () { return munderover_1.MUnderover; } });
			var mtable_1 = requireMtable();
			Object.defineProperty(exports, "MTable", { enumerable: true, get: function () { return mtable_1.MTable; } });
			var mtr_1 = requireMtr();
			Object.defineProperty(exports, "MTr", { enumerable: true, get: function () { return mtr_1.MTr; } });
			var mspace_1 = requireMspace();
			Object.defineProperty(exports, "MSpace", { enumerable: true, get: function () { return mspace_1.MSpace; } });
			var generic_spacing_wrapper_1 = requireGenericSpacingWrapper();
			Object.defineProperty(exports, "GenericSpacingWrapper", { enumerable: true, get: function () { return generic_spacing_wrapper_1.GenericSpacingWrapper; } });
			var generic_under_over_1 = requireGenericUnderOver();
			Object.defineProperty(exports, "GenericUnderOver", { enumerable: true, get: function () { return generic_under_over_1.GenericUnderOver; } });
	} (converters));
		return converters;
	}

	var hasRequiredMathmlElementToLatexConverterAdapter;

	function requireMathmlElementToLatexConverterAdapter () {
		if (hasRequiredMathmlElementToLatexConverterAdapter) return mathmlElementToLatexConverterAdapter;
		hasRequiredMathmlElementToLatexConverterAdapter = 1;
		var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    var desc = Object.getOwnPropertyDescriptor(m, k);
		    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
		      desc = { enumerable: true, get: function() { return m[k]; } };
		    }
		    Object.defineProperty(o, k2, desc);
		}) : (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    o[k2] = m[k];
		}));
		var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
		    Object.defineProperty(o, "default", { enumerable: true, value: v });
		}) : function(o, v) {
		    o["default"] = v;
		});
		var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
		    if (mod && mod.__esModule) return mod;
		    var result = {};
		    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
		    __setModuleDefault(result, mod);
		    return result;
		};
		Object.defineProperty(mathmlElementToLatexConverterAdapter, "__esModule", { value: true });
		mathmlElementToLatexConverterAdapter.MathMLElementToLatexConverterAdapter = void 0;
		var ToLatexConverters = __importStar(requireConverters());
		var MathMLElementToLatexConverterAdapter = /** @class */ (function () {
		    function MathMLElementToLatexConverterAdapter(mathMLElement) {
		        this._mathMLElement = mathMLElement;
		    }
		    MathMLElementToLatexConverterAdapter.prototype.toLatexConverter = function () {
		        var name = this._mathMLElement.name;
		        var Converter = fromMathMLElementToLatexConverter[name] || ToLatexConverters.GenericSpacingWrapper;
		        return new Converter(this._mathMLElement);
		    };
		    return MathMLElementToLatexConverterAdapter;
		}());
		mathmlElementToLatexConverterAdapter.MathMLElementToLatexConverterAdapter = MathMLElementToLatexConverterAdapter;
		var fromMathMLElementToLatexConverter = {
		    math: ToLatexConverters.Math,
		    mi: ToLatexConverters.MI,
		    mo: ToLatexConverters.MO,
		    mn: ToLatexConverters.MN,
		    msqrt: ToLatexConverters.MSqrt,
		    mfenced: ToLatexConverters.MFenced,
		    mfrac: ToLatexConverters.MFrac,
		    mroot: ToLatexConverters.MRoot,
		    maction: ToLatexConverters.MAction,
		    menclose: ToLatexConverters.MEnclose,
		    merror: ToLatexConverters.MError,
		    mphantom: ToLatexConverters.MPhantom,
		    msup: ToLatexConverters.MSup,
		    msub: ToLatexConverters.MSub,
		    msubsup: ToLatexConverters.MSubsup,
		    mmultiscripts: ToLatexConverters.MMultiscripts,
		    mtext: ToLatexConverters.MText,
		    munderover: ToLatexConverters.MUnderover,
		    mtable: ToLatexConverters.MTable,
		    mtr: ToLatexConverters.MTr,
		    mover: ToLatexConverters.GenericUnderOver,
		    munder: ToLatexConverters.GenericUnderOver,
		    mrow: ToLatexConverters.GenericSpacingWrapper,
		    mpadded: ToLatexConverters.GenericSpacingWrapper,
		    mspace: ToLatexConverters.MSpace
		};
		return mathmlElementToLatexConverterAdapter;
	}

	var factories = {};

	var makeToMathElementsConverter$1 = {};

	var xmldomToMathmlElements = {};

	var xmldomToMathmlElementAdapter = {};

	var domParser = {};

	var entities = {};

	entities.entityMap = {
	       lt: '<',
	       gt: '>',
	       amp: '&',
	       quot: '"',
	       apos: "'",
	       Agrave: "À",
	       Aacute: "Á",
	       Acirc: "Â",
	       Atilde: "Ã",
	       Auml: "Ä",
	       Aring: "Å",
	       AElig: "Æ",
	       Ccedil: "Ç",
	       Egrave: "È",
	       Eacute: "É",
	       Ecirc: "Ê",
	       Euml: "Ë",
	       Igrave: "Ì",
	       Iacute: "Í",
	       Icirc: "Î",
	       Iuml: "Ï",
	       ETH: "Ð",
	       Ntilde: "Ñ",
	       Ograve: "Ò",
	       Oacute: "Ó",
	       Ocirc: "Ô",
	       Otilde: "Õ",
	       Ouml: "Ö",
	       Oslash: "Ø",
	       Ugrave: "Ù",
	       Uacute: "Ú",
	       Ucirc: "Û",
	       Uuml: "Ü",
	       Yacute: "Ý",
	       THORN: "Þ",
	       szlig: "ß",
	       agrave: "à",
	       aacute: "á",
	       acirc: "â",
	       atilde: "ã",
	       auml: "ä",
	       aring: "å",
	       aelig: "æ",
	       ccedil: "ç",
	       egrave: "è",
	       eacute: "é",
	       ecirc: "ê",
	       euml: "ë",
	       igrave: "ì",
	       iacute: "í",
	       icirc: "î",
	       iuml: "ï",
	       eth: "ð",
	       ntilde: "ñ",
	       ograve: "ò",
	       oacute: "ó",
	       ocirc: "ô",
	       otilde: "õ",
	       ouml: "ö",
	       oslash: "ø",
	       ugrave: "ù",
	       uacute: "ú",
	       ucirc: "û",
	       uuml: "ü",
	       yacute: "ý",
	       thorn: "þ",
	       yuml: "ÿ",
	       nbsp: "\u00a0",
	       iexcl: "¡",
	       cent: "¢",
	       pound: "£",
	       curren: "¤",
	       yen: "¥",
	       brvbar: "¦",
	       sect: "§",
	       uml: "¨",
	       copy: "©",
	       ordf: "ª",
	       laquo: "«",
	       not: "¬",
	       shy: "­­",
	       reg: "®",
	       macr: "¯",
	       deg: "°",
	       plusmn: "±",
	       sup2: "²",
	       sup3: "³",
	       acute: "´",
	       micro: "µ",
	       para: "¶",
	       middot: "·",
	       cedil: "¸",
	       sup1: "¹",
	       ordm: "º",
	       raquo: "»",
	       frac14: "¼",
	       frac12: "½",
	       frac34: "¾",
	       iquest: "¿",
	       times: "×",
	       divide: "÷",
	       forall: "∀",
	       part: "∂",
	       exist: "∃",
	       empty: "∅",
	       nabla: "∇",
	       isin: "∈",
	       notin: "∉",
	       ni: "∋",
	       prod: "∏",
	       sum: "∑",
	       minus: "−",
	       lowast: "∗",
	       radic: "√",
	       prop: "∝",
	       infin: "∞",
	       ang: "∠",
	       and: "∧",
	       or: "∨",
	       cap: "∩",
	       cup: "∪",
	       'int': "∫",
	       there4: "∴",
	       sim: "∼",
	       cong: "≅",
	       asymp: "≈",
	       ne: "≠",
	       equiv: "≡",
	       le: "≤",
	       ge: "≥",
	       sub: "⊂",
	       sup: "⊃",
	       nsub: "⊄",
	       sube: "⊆",
	       supe: "⊇",
	       oplus: "⊕",
	       otimes: "⊗",
	       perp: "⊥",
	       sdot: "⋅",
	       Alpha: "Α",
	       Beta: "Β",
	       Gamma: "Γ",
	       Delta: "Δ",
	       Epsilon: "Ε",
	       Zeta: "Ζ",
	       Eta: "Η",
	       Theta: "Θ",
	       Iota: "Ι",
	       Kappa: "Κ",
	       Lambda: "Λ",
	       Mu: "Μ",
	       Nu: "Ν",
	       Xi: "Ξ",
	       Omicron: "Ο",
	       Pi: "Π",
	       Rho: "Ρ",
	       Sigma: "Σ",
	       Tau: "Τ",
	       Upsilon: "Υ",
	       Phi: "Φ",
	       Chi: "Χ",
	       Psi: "Ψ",
	       Omega: "Ω",
	       alpha: "α",
	       beta: "β",
	       gamma: "γ",
	       delta: "δ",
	       epsilon: "ε",
	       zeta: "ζ",
	       eta: "η",
	       theta: "θ",
	       iota: "ι",
	       kappa: "κ",
	       lambda: "λ",
	       mu: "μ",
	       nu: "ν",
	       xi: "ξ",
	       omicron: "ο",
	       pi: "π",
	       rho: "ρ",
	       sigmaf: "ς",
	       sigma: "σ",
	       tau: "τ",
	       upsilon: "υ",
	       phi: "φ",
	       chi: "χ",
	       psi: "ψ",
	       omega: "ω",
	       thetasym: "ϑ",
	       upsih: "ϒ",
	       piv: "ϖ",
	       OElig: "Œ",
	       oelig: "œ",
	       Scaron: "Š",
	       scaron: "š",
	       Yuml: "Ÿ",
	       fnof: "ƒ",
	       circ: "ˆ",
	       tilde: "˜",
	       ensp: " ",
	       emsp: " ",
	       thinsp: " ",
	       zwnj: "‌",
	       zwj: "‍",
	       lrm: "‎",
	       rlm: "‏",
	       ndash: "–",
	       mdash: "—",
	       lsquo: "‘",
	       rsquo: "’",
	       sbquo: "‚",
	       ldquo: "“",
	       rdquo: "”",
	       bdquo: "„",
	       dagger: "†",
	       Dagger: "‡",
	       bull: "•",
	       hellip: "…",
	       permil: "‰",
	       prime: "′",
	       Prime: "″",
	       lsaquo: "‹",
	       rsaquo: "›",
	       oline: "‾",
	       euro: "€",
	       trade: "™",
	       larr: "←",
	       uarr: "↑",
	       rarr: "→",
	       darr: "↓",
	       harr: "↔",
	       crarr: "↵",
	       lceil: "⌈",
	       rceil: "⌉",
	       lfloor: "⌊",
	       rfloor: "⌋",
	       loz: "◊",
	       spades: "♠",
	       clubs: "♣",
	       hearts: "♥",
	       diams: "♦"
	};

	var sax$1 = {};

	//[4]   	NameStartChar	   ::=   	":" | [A-Z] | "_" | [a-z] | [#xC0-#xD6] | [#xD8-#xF6] | [#xF8-#x2FF] | [#x370-#x37D] | [#x37F-#x1FFF] | [#x200C-#x200D] | [#x2070-#x218F] | [#x2C00-#x2FEF] | [#x3001-#xD7FF] | [#xF900-#xFDCF] | [#xFDF0-#xFFFD] | [#x10000-#xEFFFF]
	//[4a]   	NameChar	   ::=   	NameStartChar | "-" | "." | [0-9] | #xB7 | [#x0300-#x036F] | [#x203F-#x2040]
	//[5]   	Name	   ::=   	NameStartChar (NameChar)*
	var nameStartChar = /[A-Z_a-z\xC0-\xD6\xD8-\xF6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/;//\u10000-\uEFFFF
	var nameChar = new RegExp("[\\-\\.0-9"+nameStartChar.source.slice(1,-1)+"\\u00B7\\u0300-\\u036F\\u203F-\\u2040]");
	var tagNamePattern = new RegExp('^'+nameStartChar.source+nameChar.source+'*(?:\:'+nameStartChar.source+nameChar.source+'*)?$');
	//var tagNamePattern = /^[a-zA-Z_][\w\-\.]*(?:\:[a-zA-Z_][\w\-\.]*)?$/
	//var handlers = 'resolveEntity,getExternalSubset,characters,endDocument,endElement,endPrefixMapping,ignorableWhitespace,processingInstruction,setDocumentLocator,skippedEntity,startDocument,startElement,startPrefixMapping,notationDecl,unparsedEntityDecl,error,fatalError,warning,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,comment,endCDATA,endDTD,endEntity,startCDATA,startDTD,startEntity'.split(',')

	//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
	//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
	var S_TAG = 0;//tag name offerring
	var S_ATTR = 1;//attr name offerring 
	var S_ATTR_SPACE=2;//attr name end and space offer
	var S_EQ = 3;//=space?
	var S_ATTR_NOQUOT_VALUE = 4;//attr value(no quot value only)
	var S_ATTR_END = 5;//attr value end and no space(quot end)
	var S_TAG_SPACE = 6;//(attr value end || tag end ) && (space offer)
	var S_TAG_CLOSE = 7;//closed el<el />

	/**
	 * Creates an error that will not be caught by XMLReader aka the SAX parser.
	 *
	 * @param {string} message
	 * @param {any?} locator Optional, can provide details about the location in the source
	 * @constructor
	 */
	function ParseError$1(message, locator) {
		this.message = message;
		this.locator = locator;
		if(Error.captureStackTrace) Error.captureStackTrace(this, ParseError$1);
	}
	ParseError$1.prototype = new Error();
	ParseError$1.prototype.name = ParseError$1.name;

	function XMLReader$1(){
		
	}

	XMLReader$1.prototype = {
		parse:function(source,defaultNSMap,entityMap){
			var domBuilder = this.domBuilder;
			domBuilder.startDocument();
			_copy(defaultNSMap ,defaultNSMap = {});
			parse(source,defaultNSMap,entityMap,
					domBuilder,this.errorHandler);
			domBuilder.endDocument();
		}
	};
	function parse(source,defaultNSMapCopy,entityMap,domBuilder,errorHandler){
		function fixedFromCharCode(code) {
			// String.prototype.fromCharCode does not supports
			// > 2 bytes unicode chars directly
			if (code > 0xffff) {
				code -= 0x10000;
				var surrogate1 = 0xd800 + (code >> 10)
					, surrogate2 = 0xdc00 + (code & 0x3ff);

				return String.fromCharCode(surrogate1, surrogate2);
			} else {
				return String.fromCharCode(code);
			}
		}
		function entityReplacer(a){
			var k = a.slice(1,-1);
			if(k in entityMap){
				return entityMap[k]; 
			}else if(k.charAt(0) === '#'){
				return fixedFromCharCode(parseInt(k.substr(1).replace('x','0x')))
			}else {
				errorHandler.error('entity not found:'+a);
				return a;
			}
		}
		function appendText(end){//has some bugs
			if(end>start){
				var xt = source.substring(start,end).replace(/&#?\w+;/g,entityReplacer);
				locator&&position(start);
				domBuilder.characters(xt,0,end-start);
				start = end;
			}
		}
		function position(p,m){
			while(p>=lineEnd && (m = linePattern.exec(source))){
				lineStart = m.index;
				lineEnd = lineStart + m[0].length;
				locator.lineNumber++;
				//console.log('line++:',locator,startPos,endPos)
			}
			locator.columnNumber = p-lineStart+1;
		}
		var lineStart = 0;
		var lineEnd = 0;
		var linePattern = /.*(?:\r\n?|\n)|.*$/g;
		var locator = domBuilder.locator;
		
		var parseStack = [{currentNSMap:defaultNSMapCopy}];
		var closeMap = {};
		var start = 0;
		while(true){
			try{
				var tagStart = source.indexOf('<',start);
				if(tagStart<0){
					if(!source.substr(start).match(/^\s*$/)){
						var doc = domBuilder.doc;
		    			var text = doc.createTextNode(source.substr(start));
		    			doc.appendChild(text);
		    			domBuilder.currentElement = text;
					}
					return;
				}
				if(tagStart>start){
					appendText(tagStart);
				}
				switch(source.charAt(tagStart+1)){
				case '/':
					var end = source.indexOf('>',tagStart+3);
					var tagName = source.substring(tagStart+2,end);
					var config = parseStack.pop();
					if(end<0){
						
		        		tagName = source.substring(tagStart+2).replace(/[\s<].*/,'');
		        		errorHandler.error("end tag name: "+tagName+' is not complete:'+config.tagName);
		        		end = tagStart+1+tagName.length;
		        	}else if(tagName.match(/\s</)){
		        		tagName = tagName.replace(/[\s<].*/,'');
		        		errorHandler.error("end tag name: "+tagName+' maybe not complete');
		        		end = tagStart+1+tagName.length;
					}
					var localNSMap = config.localNSMap;
					var endMatch = config.tagName == tagName;
					var endIgnoreCaseMach = endMatch || config.tagName&&config.tagName.toLowerCase() == tagName.toLowerCase();
			        if(endIgnoreCaseMach){
			        	domBuilder.endElement(config.uri,config.localName,tagName);
						if(localNSMap){
							for(var prefix in localNSMap){
								domBuilder.endPrefixMapping(prefix) ;
							}
						}
						if(!endMatch){
			            	errorHandler.fatalError("end tag name: "+tagName+' is not match the current start tagName:'+config.tagName ); // No known test case
						}
			        }else {
			        	parseStack.push(config);
			        }
					
					end++;
					break;
					// end elment
				case '?':// <?...?>
					locator&&position(tagStart);
					end = parseInstruction(source,tagStart,domBuilder);
					break;
				case '!':// <!doctype,<![CDATA,<!--
					locator&&position(tagStart);
					end = parseDCC(source,tagStart,domBuilder,errorHandler);
					break;
				default:
					locator&&position(tagStart);
					var el = new ElementAttributes();
					var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
					//elStartEnd
					var end = parseElementStartPart(source,tagStart,el,currentNSMap,entityReplacer,errorHandler);
					var len = el.length;
					
					
					if(!el.closed && fixSelfClosed(source,end,el.tagName,closeMap)){
						el.closed = true;
						if(!entityMap.nbsp){
							errorHandler.warning('unclosed xml attribute');
						}
					}
					if(locator && len){
						var locator2 = copyLocator(locator,{});
						//try{//attribute position fixed
						for(var i = 0;i<len;i++){
							var a = el[i];
							position(a.offset);
							a.locator = copyLocator(locator,{});
						}
						domBuilder.locator = locator2;
						if(appendElement$1(el,domBuilder,currentNSMap)){
							parseStack.push(el);
						}
						domBuilder.locator = locator;
					}else {
						if(appendElement$1(el,domBuilder,currentNSMap)){
							parseStack.push(el);
						}
					}
					
					
					
					if(el.uri === 'http://www.w3.org/1999/xhtml' && !el.closed){
						end = parseHtmlSpecialContent(source,end,el.tagName,entityReplacer,domBuilder);
					}else {
						end++;
					}
				}
			}catch(e){
				if (e instanceof ParseError$1) {
					throw e;
				}
				errorHandler.error('element parse error: '+e);
				end = -1;
			}
			if(end>start){
				start = end;
			}else {
				//TODO: 这里有可能sax回退，有位置错误风险
				appendText(Math.max(tagStart,start)+1);
			}
		}
	}
	function copyLocator(f,t){
		t.lineNumber = f.lineNumber;
		t.columnNumber = f.columnNumber;
		return t;
	}

	/**
	 * @see #appendElement(source,elStartEnd,el,selfClosed,entityReplacer,domBuilder,parseStack);
	 * @return end of the elementStartPart(end of elementEndPart for selfClosed el)
	 */
	function parseElementStartPart(source,start,el,currentNSMap,entityReplacer,errorHandler){

		/**
		 * @param {string} qname
		 * @param {string} value
		 * @param {number} startIndex
		 */
		function addAttribute(qname, value, startIndex) {
			if (qname in el.attributeNames) errorHandler.fatalError('Attribute ' + qname + ' redefined');
			el.addValue(qname, value, startIndex);
		}
		var attrName;
		var value;
		var p = ++start;
		var s = S_TAG;//status
		while(true){
			var c = source.charAt(p);
			switch(c){
			case '=':
				if(s === S_ATTR){//attrName
					attrName = source.slice(start,p);
					s = S_EQ;
				}else if(s === S_ATTR_SPACE){
					s = S_EQ;
				}else {
					//fatalError: equal must after attrName or space after attrName
					throw new Error('attribute equal must after attrName'); // No known test case
				}
				break;
			case '\'':
			case '"':
				if(s === S_EQ || s === S_ATTR //|| s == S_ATTR_SPACE
					){//equal
					if(s === S_ATTR){
						errorHandler.warning('attribute value must after "="');
						attrName = source.slice(start,p);
					}
					start = p+1;
					p = source.indexOf(c,start);
					if(p>0){
						value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
						addAttribute(attrName, value, start-1);
						s = S_ATTR_END;
					}else {
						//fatalError: no end quot match
						throw new Error('attribute value no end \''+c+'\' match');
					}
				}else if(s == S_ATTR_NOQUOT_VALUE){
					value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
					//console.log(attrName,value,start,p)
					addAttribute(attrName, value, start);
					//console.dir(el)
					errorHandler.warning('attribute "'+attrName+'" missed start quot('+c+')!!');
					start = p+1;
					s = S_ATTR_END;
				}else {
					//fatalError: no equal before
					throw new Error('attribute value must after "="'); // No known test case
				}
				break;
			case '/':
				switch(s){
				case S_TAG:
					el.setTagName(source.slice(start,p));
				case S_ATTR_END:
				case S_TAG_SPACE:
				case S_TAG_CLOSE:
					s =S_TAG_CLOSE;
					el.closed = true;
				case S_ATTR_NOQUOT_VALUE:
				case S_ATTR:
				case S_ATTR_SPACE:
					break;
				//case S_EQ:
				default:
					throw new Error("attribute invalid close char('/')") // No known test case
				}
				break;
			case ''://end document
				errorHandler.error('unexpected end of input');
				if(s == S_TAG){
					el.setTagName(source.slice(start,p));
				}
				return p;
			case '>':
				switch(s){
				case S_TAG:
					el.setTagName(source.slice(start,p));
				case S_ATTR_END:
				case S_TAG_SPACE:
				case S_TAG_CLOSE:
					break;//normal
				case S_ATTR_NOQUOT_VALUE://Compatible state
				case S_ATTR:
					value = source.slice(start,p);
					if(value.slice(-1) === '/'){
						el.closed  = true;
						value = value.slice(0,-1);
					}
				case S_ATTR_SPACE:
					if(s === S_ATTR_SPACE){
						value = attrName;
					}
					if(s == S_ATTR_NOQUOT_VALUE){
						errorHandler.warning('attribute "'+value+'" missed quot(")!');
						addAttribute(attrName, value.replace(/&#?\w+;/g,entityReplacer), start);
					}else {
						if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !value.match(/^(?:disabled|checked|selected)$/i)){
							errorHandler.warning('attribute "'+value+'" missed value!! "'+value+'" instead!!');
						}
						addAttribute(value, value, start);
					}
					break;
				case S_EQ:
					throw new Error('attribute value missed!!');
				}
	//			console.log(tagName,tagNamePattern,tagNamePattern.test(tagName))
				return p;
			/*xml space '\x20' | #x9 | #xD | #xA; */
			case '\u0080':
				c = ' ';
			default:
				if(c<= ' '){//space
					switch(s){
					case S_TAG:
						el.setTagName(source.slice(start,p));//tagName
						s = S_TAG_SPACE;
						break;
					case S_ATTR:
						attrName = source.slice(start,p);
						s = S_ATTR_SPACE;
						break;
					case S_ATTR_NOQUOT_VALUE:
						var value = source.slice(start,p).replace(/&#?\w+;/g,entityReplacer);
						errorHandler.warning('attribute "'+value+'" missed quot(")!!');
						addAttribute(attrName, value, start);
					case S_ATTR_END:
						s = S_TAG_SPACE;
						break;
					//case S_TAG_SPACE:
					//case S_EQ:
					//case S_ATTR_SPACE:
					//	void();break;
					//case S_TAG_CLOSE:
						//ignore warning
					}
				}else {//not space
	//S_TAG,	S_ATTR,	S_EQ,	S_ATTR_NOQUOT_VALUE
	//S_ATTR_SPACE,	S_ATTR_END,	S_TAG_SPACE, S_TAG_CLOSE
					switch(s){
					//case S_TAG:void();break;
					//case S_ATTR:void();break;
					//case S_ATTR_NOQUOT_VALUE:void();break;
					case S_ATTR_SPACE:
						el.tagName;
						if(currentNSMap[''] !== 'http://www.w3.org/1999/xhtml' || !attrName.match(/^(?:disabled|checked|selected)$/i)){
							errorHandler.warning('attribute "'+attrName+'" missed value!! "'+attrName+'" instead2!!');
						}
						addAttribute(attrName, attrName, start);
						start = p;
						s = S_ATTR;
						break;
					case S_ATTR_END:
						errorHandler.warning('attribute space is required"'+attrName+'"!!');
					case S_TAG_SPACE:
						s = S_ATTR;
						start = p;
						break;
					case S_EQ:
						s = S_ATTR_NOQUOT_VALUE;
						start = p;
						break;
					case S_TAG_CLOSE:
						throw new Error("elements closed character '/' and '>' must be connected to");
					}
				}
			}//end outer switch
			//console.log('p++',p)
			p++;
		}
	}
	/**
	 * @return true if has new namespace define
	 */
	function appendElement$1(el,domBuilder,currentNSMap){
		var tagName = el.tagName;
		var localNSMap = null;
		//var currentNSMap = parseStack[parseStack.length-1].currentNSMap;
		var i = el.length;
		while(i--){
			var a = el[i];
			var qName = a.qName;
			var value = a.value;
			var nsp = qName.indexOf(':');
			if(nsp>0){
				var prefix = a.prefix = qName.slice(0,nsp);
				var localName = qName.slice(nsp+1);
				var nsPrefix = prefix === 'xmlns' && localName;
			}else {
				localName = qName;
				prefix = null;
				nsPrefix = qName === 'xmlns' && '';
			}
			//can not set prefix,because prefix !== ''
			a.localName = localName ;
			//prefix == null for no ns prefix attribute 
			if(nsPrefix !== false){//hack!!
				if(localNSMap == null){
					localNSMap = {};
					//console.log(currentNSMap,0)
					_copy(currentNSMap,currentNSMap={});
					//console.log(currentNSMap,1)
				}
				currentNSMap[nsPrefix] = localNSMap[nsPrefix] = value;
				a.uri = 'http://www.w3.org/2000/xmlns/';
				domBuilder.startPrefixMapping(nsPrefix, value); 
			}
		}
		var i = el.length;
		while(i--){
			a = el[i];
			var prefix = a.prefix;
			if(prefix){//no prefix attribute has no namespace
				if(prefix === 'xml'){
					a.uri = 'http://www.w3.org/XML/1998/namespace';
				}if(prefix !== 'xmlns'){
					a.uri = currentNSMap[prefix || ''];
					
					//{console.log('###'+a.qName,domBuilder.locator.systemId+'',currentNSMap,a.uri)}
				}
			}
		}
		var nsp = tagName.indexOf(':');
		if(nsp>0){
			prefix = el.prefix = tagName.slice(0,nsp);
			localName = el.localName = tagName.slice(nsp+1);
		}else {
			prefix = null;//important!!
			localName = el.localName = tagName;
		}
		//no prefix element has default namespace
		var ns = el.uri = currentNSMap[prefix || ''];
		domBuilder.startElement(ns,localName,tagName,el);
		//endPrefixMapping and startPrefixMapping have not any help for dom builder
		//localNSMap = null
		if(el.closed){
			domBuilder.endElement(ns,localName,tagName);
			if(localNSMap){
				for(prefix in localNSMap){
					domBuilder.endPrefixMapping(prefix); 
				}
			}
		}else {
			el.currentNSMap = currentNSMap;
			el.localNSMap = localNSMap;
			//parseStack.push(el);
			return true;
		}
	}
	function parseHtmlSpecialContent(source,elStartEnd,tagName,entityReplacer,domBuilder){
		if(/^(?:script|textarea)$/i.test(tagName)){
			var elEndStart =  source.indexOf('</'+tagName+'>',elStartEnd);
			var text = source.substring(elStartEnd+1,elEndStart);
			if(/[&<]/.test(text)){
				if(/^script$/i.test(tagName)){
					//if(!/\]\]>/.test(text)){
						//lexHandler.startCDATA();
						domBuilder.characters(text,0,text.length);
						//lexHandler.endCDATA();
						return elEndStart;
					//}
				}//}else{//text area
					text = text.replace(/&#?\w+;/g,entityReplacer);
					domBuilder.characters(text,0,text.length);
					return elEndStart;
				//}
				
			}
		}
		return elStartEnd+1;
	}
	function fixSelfClosed(source,elStartEnd,tagName,closeMap){
		//if(tagName in closeMap){
		var pos = closeMap[tagName];
		if(pos == null){
			//console.log(tagName)
			pos =  source.lastIndexOf('</'+tagName+'>');
			if(pos<elStartEnd){//忘记闭合
				pos = source.lastIndexOf('</'+tagName);
			}
			closeMap[tagName] =pos;
		}
		return pos<elStartEnd;
		//} 
	}
	function _copy(source,target){
		for(var n in source){target[n] = source[n];}
	}
	function parseDCC(source,start,domBuilder,errorHandler){//sure start with '<!'
		var next= source.charAt(start+2);
		switch(next){
		case '-':
			if(source.charAt(start + 3) === '-'){
				var end = source.indexOf('-->',start+4);
				//append comment source.substring(4,end)//<!--
				if(end>start){
					domBuilder.comment(source,start+4,end-start-4);
					return end+3;
				}else {
					errorHandler.error("Unclosed comment");
					return -1;
				}
			}else {
				//error
				return -1;
			}
		default:
			if(source.substr(start+3,6) == 'CDATA['){
				var end = source.indexOf(']]>',start+9);
				domBuilder.startCDATA();
				domBuilder.characters(source,start+9,end-start-9);
				domBuilder.endCDATA(); 
				return end+3;
			}
			//<!DOCTYPE
			//startDTD(java.lang.String name, java.lang.String publicId, java.lang.String systemId) 
			var matchs = split(source,start);
			var len = matchs.length;
			if(len>1 && /!doctype/i.test(matchs[0][0])){
				var name = matchs[1][0];
				var pubid = false;
				var sysid = false;
				if(len>3){
					if(/^public$/i.test(matchs[2][0])){
						pubid = matchs[3][0];
						sysid = len>4 && matchs[4][0];
					}else if(/^system$/i.test(matchs[2][0])){
						sysid = matchs[3][0];
					}
				}
				var lastMatch = matchs[len-1];
				domBuilder.startDTD(name, pubid, sysid);
				domBuilder.endDTD();
				
				return lastMatch.index+lastMatch[0].length
			}
		}
		return -1;
	}



	function parseInstruction(source,start,domBuilder){
		var end = source.indexOf('?>',start);
		if(end){
			var match = source.substring(start,end).match(/^<\?(\S*)\s*([\s\S]*?)\s*$/);
			if(match){
				match[0].length;
				domBuilder.processingInstruction(match[1], match[2]) ;
				return end+2;
			}else {//error
				return -1;
			}
		}
		return -1;
	}

	function ElementAttributes(){
		this.attributeNames = {};
	}
	ElementAttributes.prototype = {
		setTagName:function(tagName){
			if(!tagNamePattern.test(tagName)){
				throw new Error('invalid tagName:'+tagName)
			}
			this.tagName = tagName;
		},
		addValue:function(qName, value, offset) {
			if(!tagNamePattern.test(qName)){
				throw new Error('invalid attribute:'+qName)
			}
			this.attributeNames[qName] = this.length;
			this[this.length++] = {qName:qName,value:value,offset:offset};
		},
		length:0,
		getLocalName:function(i){return this[i].localName},
		getLocator:function(i){return this[i].locator},
		getQName:function(i){return this[i].qName},
		getURI:function(i){return this[i].uri},
		getValue:function(i){return this[i].value}
	//	,getIndex:function(uri, localName)){
	//		if(localName){
	//			
	//		}else{
	//			var qName = uri
	//		}
	//	},
	//	getValue:function(){return this.getValue(this.getIndex.apply(this,arguments))},
	//	getType:function(uri,localName){}
	//	getType:function(i){},
	};



	function split(source,start){
		var match;
		var buf = [];
		var reg = /'[^']+'|"[^"]+"|[^\s<>\/=]+=?|(\/?\s*>|<)/g;
		reg.lastIndex = start;
		reg.exec(source);//skip <
		while(match = reg.exec(source)){
			buf.push(match);
			if(match[1])return buf;
		}
	}

	sax$1.XMLReader = XMLReader$1;
	sax$1.ParseError = ParseError$1;

	var dom = {};

	function copy(src,dest){
		for(var p in src){
			dest[p] = src[p];
		}
	}
	/**
	^\w+\.prototype\.([_\w]+)\s*=\s*((?:.*\{\s*?[\r\n][\s\S]*?^})|\S.*?(?=[;\r\n]));?
	^\w+\.prototype\.([_\w]+)\s*=\s*(\S.*?(?=[;\r\n]));?
	 */
	function _extends(Class,Super){
		var pt = Class.prototype;
		if(!(pt instanceof Super)){
			function t(){}		t.prototype = Super.prototype;
			t = new t();
			copy(pt,t);
			Class.prototype = pt = t;
		}
		if(pt.constructor != Class){
			if(typeof Class != 'function'){
				console.error("unknow Class:"+Class);
			}
			pt.constructor = Class;
		}
	}
	var htmlns = 'http://www.w3.org/1999/xhtml' ;
	// Node Types
	var NodeType = {};
	var ELEMENT_NODE                = NodeType.ELEMENT_NODE                = 1;
	var ATTRIBUTE_NODE              = NodeType.ATTRIBUTE_NODE              = 2;
	var TEXT_NODE                   = NodeType.TEXT_NODE                   = 3;
	var CDATA_SECTION_NODE          = NodeType.CDATA_SECTION_NODE          = 4;
	var ENTITY_REFERENCE_NODE       = NodeType.ENTITY_REFERENCE_NODE       = 5;
	var ENTITY_NODE                 = NodeType.ENTITY_NODE                 = 6;
	var PROCESSING_INSTRUCTION_NODE = NodeType.PROCESSING_INSTRUCTION_NODE = 7;
	var COMMENT_NODE                = NodeType.COMMENT_NODE                = 8;
	var DOCUMENT_NODE               = NodeType.DOCUMENT_NODE               = 9;
	var DOCUMENT_TYPE_NODE          = NodeType.DOCUMENT_TYPE_NODE          = 10;
	var DOCUMENT_FRAGMENT_NODE      = NodeType.DOCUMENT_FRAGMENT_NODE      = 11;
	var NOTATION_NODE               = NodeType.NOTATION_NODE               = 12;

	// ExceptionCode
	var ExceptionCode = {};
	var ExceptionMessage = {};
	ExceptionCode.INDEX_SIZE_ERR              = ((ExceptionMessage[1]="Index size error"),1);
	ExceptionCode.DOMSTRING_SIZE_ERR          = ((ExceptionMessage[2]="DOMString size error"),2);
	var HIERARCHY_REQUEST_ERR       = ExceptionCode.HIERARCHY_REQUEST_ERR       = ((ExceptionMessage[3]="Hierarchy request error"),3);
	ExceptionCode.WRONG_DOCUMENT_ERR          = ((ExceptionMessage[4]="Wrong document"),4);
	ExceptionCode.INVALID_CHARACTER_ERR       = ((ExceptionMessage[5]="Invalid character"),5);
	ExceptionCode.NO_DATA_ALLOWED_ERR         = ((ExceptionMessage[6]="No data allowed"),6);
	ExceptionCode.NO_MODIFICATION_ALLOWED_ERR = ((ExceptionMessage[7]="No modification allowed"),7);
	var NOT_FOUND_ERR               = ExceptionCode.NOT_FOUND_ERR               = ((ExceptionMessage[8]="Not found"),8);
	ExceptionCode.NOT_SUPPORTED_ERR           = ((ExceptionMessage[9]="Not supported"),9);
	var INUSE_ATTRIBUTE_ERR         = ExceptionCode.INUSE_ATTRIBUTE_ERR         = ((ExceptionMessage[10]="Attribute in use"),10);
	//level2
	ExceptionCode.INVALID_STATE_ERR        	= ((ExceptionMessage[11]="Invalid state"),11);
	ExceptionCode.SYNTAX_ERR               	= ((ExceptionMessage[12]="Syntax error"),12);
	ExceptionCode.INVALID_MODIFICATION_ERR 	= ((ExceptionMessage[13]="Invalid modification"),13);
	ExceptionCode.NAMESPACE_ERR           	= ((ExceptionMessage[14]="Invalid namespace"),14);
	ExceptionCode.INVALID_ACCESS_ERR      	= ((ExceptionMessage[15]="Invalid access"),15);

	/**
	 * DOM Level 2
	 * Object DOMException
	 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/ecma-script-binding.html
	 * @see http://www.w3.org/TR/REC-DOM-Level-1/ecma-script-language-binding.html
	 */
	function DOMException(code, message) {
		if(message instanceof Error){
			var error = message;
		}else {
			error = this;
			Error.call(this, ExceptionMessage[code]);
			this.message = ExceptionMessage[code];
			if(Error.captureStackTrace) Error.captureStackTrace(this, DOMException);
		}
		error.code = code;
		if(message) this.message = this.message + ": " + message;
		return error;
	}DOMException.prototype = Error.prototype;
	copy(ExceptionCode,DOMException);
	/**
	 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-536297177
	 * The NodeList interface provides the abstraction of an ordered collection of nodes, without defining or constraining how this collection is implemented. NodeList objects in the DOM are live.
	 * The items in the NodeList are accessible via an integral index, starting from 0.
	 */
	function NodeList() {
	}NodeList.prototype = {
		/**
		 * The number of nodes in the list. The range of valid child node indices is 0 to length-1 inclusive.
		 * @standard level1
		 */
		length:0, 
		/**
		 * Returns the indexth item in the collection. If index is greater than or equal to the number of nodes in the list, this returns null.
		 * @standard level1
		 * @param index  unsigned long 
		 *   Index into the collection.
		 * @return Node
		 * 	The node at the indexth position in the NodeList, or null if that is not a valid index. 
		 */
		item: function(index) {
			return this[index] || null;
		},
		toString:function(isHTML,nodeFilter){
			for(var buf = [], i = 0;i<this.length;i++){
				serializeToString(this[i],buf,isHTML,nodeFilter);
			}
			return buf.join('');
		}
	};
	function LiveNodeList(node,refresh){
		this._node = node;
		this._refresh = refresh;
		_updateLiveList(this);
	}
	function _updateLiveList(list){
		var inc = list._node._inc || list._node.ownerDocument._inc;
		if(list._inc != inc){
			var ls = list._refresh(list._node);
			//console.log(ls.length)
			__set__(list,'length',ls.length);
			copy(ls,list);
			list._inc = inc;
		}
	}
	LiveNodeList.prototype.item = function(i){
		_updateLiveList(this);
		return this[i];
	};

	_extends(LiveNodeList,NodeList);
	/**
	 * 
	 * Objects implementing the NamedNodeMap interface are used to represent collections of nodes that can be accessed by name. Note that NamedNodeMap does not inherit from NodeList; NamedNodeMaps are not maintained in any particular order. Objects contained in an object implementing NamedNodeMap may also be accessed by an ordinal index, but this is simply to allow convenient enumeration of the contents of a NamedNodeMap, and does not imply that the DOM specifies an order to these Nodes.
	 * NamedNodeMap objects in the DOM are live.
	 * used for attributes or DocumentType entities 
	 */
	function NamedNodeMap() {
	}
	function _findNodeIndex(list,node){
		var i = list.length;
		while(i--){
			if(list[i] === node){return i}
		}
	}

	function _addNamedNode(el,list,newAttr,oldAttr){
		if(oldAttr){
			list[_findNodeIndex(list,oldAttr)] = newAttr;
		}else {
			list[list.length++] = newAttr;
		}
		if(el){
			newAttr.ownerElement = el;
			var doc = el.ownerDocument;
			if(doc){
				oldAttr && _onRemoveAttribute(doc,el,oldAttr);
				_onAddAttribute(doc,el,newAttr);
			}
		}
	}
	function _removeNamedNode(el,list,attr){
		//console.log('remove attr:'+attr)
		var i = _findNodeIndex(list,attr);
		if(i>=0){
			var lastIndex = list.length-1;
			while(i<lastIndex){
				list[i] = list[++i];
			}
			list.length = lastIndex;
			if(el){
				var doc = el.ownerDocument;
				if(doc){
					_onRemoveAttribute(doc,el,attr);
					attr.ownerElement = null;
				}
			}
		}else {
			throw DOMException(NOT_FOUND_ERR,new Error(el.tagName+'@'+attr))
		}
	}
	NamedNodeMap.prototype = {
		length:0,
		item:NodeList.prototype.item,
		getNamedItem: function(key) {
	//		if(key.indexOf(':')>0 || key == 'xmlns'){
	//			return null;
	//		}
			//console.log()
			var i = this.length;
			while(i--){
				var attr = this[i];
				//console.log(attr.nodeName,key)
				if(attr.nodeName == key){
					return attr;
				}
			}
		},
		setNamedItem: function(attr) {
			var el = attr.ownerElement;
			if(el && el!=this._ownerElement){
				throw new DOMException(INUSE_ATTRIBUTE_ERR);
			}
			var oldAttr = this.getNamedItem(attr.nodeName);
			_addNamedNode(this._ownerElement,this,attr,oldAttr);
			return oldAttr;
		},
		/* returns Node */
		setNamedItemNS: function(attr) {// raises: WRONG_DOCUMENT_ERR,NO_MODIFICATION_ALLOWED_ERR,INUSE_ATTRIBUTE_ERR
			var el = attr.ownerElement, oldAttr;
			if(el && el!=this._ownerElement){
				throw new DOMException(INUSE_ATTRIBUTE_ERR);
			}
			oldAttr = this.getNamedItemNS(attr.namespaceURI,attr.localName);
			_addNamedNode(this._ownerElement,this,attr,oldAttr);
			return oldAttr;
		},

		/* returns Node */
		removeNamedItem: function(key) {
			var attr = this.getNamedItem(key);
			_removeNamedNode(this._ownerElement,this,attr);
			return attr;
			
			
		},// raises: NOT_FOUND_ERR,NO_MODIFICATION_ALLOWED_ERR
		
		//for level2
		removeNamedItemNS:function(namespaceURI,localName){
			var attr = this.getNamedItemNS(namespaceURI,localName);
			_removeNamedNode(this._ownerElement,this,attr);
			return attr;
		},
		getNamedItemNS: function(namespaceURI, localName) {
			var i = this.length;
			while(i--){
				var node = this[i];
				if(node.localName == localName && node.namespaceURI == namespaceURI){
					return node;
				}
			}
			return null;
		}
	};
	/**
	 * @see http://www.w3.org/TR/REC-DOM-Level-1/level-one-core.html#ID-102161490
	 */
	function DOMImplementation$1(/* Object */ features) {
		this._features = {};
		if (features) {
			for (var feature in features) {
				 this._features = features[feature];
			}
		}
	}
	DOMImplementation$1.prototype = {
		hasFeature: function(/* string */ feature, /* string */ version) {
			var versions = this._features[feature.toLowerCase()];
			if (versions && (!version || version in versions)) {
				return true;
			} else {
				return false;
			}
		},
		// Introduced in DOM Level 2:
		createDocument:function(namespaceURI,  qualifiedName, doctype){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR,WRONG_DOCUMENT_ERR
			var doc = new Document();
			doc.implementation = this;
			doc.childNodes = new NodeList();
			doc.doctype = doctype;
			if(doctype){
				doc.appendChild(doctype);
			}
			if(qualifiedName){
				var root = doc.createElementNS(namespaceURI,qualifiedName);
				doc.appendChild(root);
			}
			return doc;
		},
		// Introduced in DOM Level 2:
		createDocumentType:function(qualifiedName, publicId, systemId){// raises:INVALID_CHARACTER_ERR,NAMESPACE_ERR
			var node = new DocumentType();
			node.name = qualifiedName;
			node.nodeName = qualifiedName;
			node.publicId = publicId;
			node.systemId = systemId;
			// Introduced in DOM Level 2:
			//readonly attribute DOMString        internalSubset;
			
			//TODO:..
			//  readonly attribute NamedNodeMap     entities;
			//  readonly attribute NamedNodeMap     notations;
			return node;
		}
	};


	/**
	 * @see http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247
	 */

	function Node() {
	}
	Node.prototype = {
		firstChild : null,
		lastChild : null,
		previousSibling : null,
		nextSibling : null,
		attributes : null,
		parentNode : null,
		childNodes : null,
		ownerDocument : null,
		nodeValue : null,
		namespaceURI : null,
		prefix : null,
		localName : null,
		// Modified in DOM Level 2:
		insertBefore:function(newChild, refChild){//raises 
			return _insertBefore(this,newChild,refChild);
		},
		replaceChild:function(newChild, oldChild){//raises 
			this.insertBefore(newChild,oldChild);
			if(oldChild){
				this.removeChild(oldChild);
			}
		},
		removeChild:function(oldChild){
			return _removeChild(this,oldChild);
		},
		appendChild:function(newChild){
			return this.insertBefore(newChild,null);
		},
		hasChildNodes:function(){
			return this.firstChild != null;
		},
		cloneNode:function(deep){
			return cloneNode(this.ownerDocument||this,this,deep);
		},
		// Modified in DOM Level 2:
		normalize:function(){
			var child = this.firstChild;
			while(child){
				var next = child.nextSibling;
				if(next && next.nodeType == TEXT_NODE && child.nodeType == TEXT_NODE){
					this.removeChild(next);
					child.appendData(next.data);
				}else {
					child.normalize();
					child = next;
				}
			}
		},
	  	// Introduced in DOM Level 2:
		isSupported:function(feature, version){
			return this.ownerDocument.implementation.hasFeature(feature,version);
		},
	    // Introduced in DOM Level 2:
	    hasAttributes:function(){
	    	return this.attributes.length>0;
	    },
	    lookupPrefix:function(namespaceURI){
	    	var el = this;
	    	while(el){
	    		var map = el._nsMap;
	    		//console.dir(map)
	    		if(map){
	    			for(var n in map){
	    				if(map[n] == namespaceURI){
	    					return n;
	    				}
	    			}
	    		}
	    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
	    	}
	    	return null;
	    },
	    // Introduced in DOM Level 3:
	    lookupNamespaceURI:function(prefix){
	    	var el = this;
	    	while(el){
	    		var map = el._nsMap;
	    		//console.dir(map)
	    		if(map){
	    			if(prefix in map){
	    				return map[prefix] ;
	    			}
	    		}
	    		el = el.nodeType == ATTRIBUTE_NODE?el.ownerDocument : el.parentNode;
	    	}
	    	return null;
	    },
	    // Introduced in DOM Level 3:
	    isDefaultNamespace:function(namespaceURI){
	    	var prefix = this.lookupPrefix(namespaceURI);
	    	return prefix == null;
	    }
	};


	function _xmlEncoder(c){
		return c == '<' && '&lt;' ||
	         c == '>' && '&gt;' ||
	         c == '&' && '&amp;' ||
	         c == '"' && '&quot;' ||
	         '&#'+c.charCodeAt()+';'
	}


	copy(NodeType,Node);
	copy(NodeType,Node.prototype);

	/**
	 * @param callback return true for continue,false for break
	 * @return boolean true: break visit;
	 */
	function _visitNode(node,callback){
		if(callback(node)){
			return true;
		}
		if(node = node.firstChild){
			do{
				if(_visitNode(node,callback)){return true}
	        }while(node=node.nextSibling)
	    }
	}



	function Document(){
	}
	function _onAddAttribute(doc,el,newAttr){
		doc && doc._inc++;
		var ns = newAttr.namespaceURI ;
		if(ns == 'http://www.w3.org/2000/xmlns/'){
			//update namespace
			el._nsMap[newAttr.prefix?newAttr.localName:''] = newAttr.value;
		}
	}
	function _onRemoveAttribute(doc,el,newAttr,remove){
		doc && doc._inc++;
		var ns = newAttr.namespaceURI ;
		if(ns == 'http://www.w3.org/2000/xmlns/'){
			//update namespace
			delete el._nsMap[newAttr.prefix?newAttr.localName:''];
		}
	}
	function _onUpdateChild(doc,el,newChild){
		if(doc && doc._inc){
			doc._inc++;
			//update childNodes
			var cs = el.childNodes;
			if(newChild){
				cs[cs.length++] = newChild;
			}else {
				//console.log(1)
				var child = el.firstChild;
				var i = 0;
				while(child){
					cs[i++] = child;
					child =child.nextSibling;
				}
				cs.length = i;
			}
		}
	}

	/**
	 * attributes;
	 * children;
	 * 
	 * writeable properties:
	 * nodeValue,Attr:value,CharacterData:data
	 * prefix
	 */
	function _removeChild(parentNode,child){
		var previous = child.previousSibling;
		var next = child.nextSibling;
		if(previous){
			previous.nextSibling = next;
		}else {
			parentNode.firstChild = next;
		}
		if(next){
			next.previousSibling = previous;
		}else {
			parentNode.lastChild = previous;
		}
		_onUpdateChild(parentNode.ownerDocument,parentNode);
		return child;
	}
	/**
	 * preformance key(refChild == null)
	 */
	function _insertBefore(parentNode,newChild,nextChild){
		var cp = newChild.parentNode;
		if(cp){
			cp.removeChild(newChild);//remove and update
		}
		if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
			var newFirst = newChild.firstChild;
			if (newFirst == null) {
				return newChild;
			}
			var newLast = newChild.lastChild;
		}else {
			newFirst = newLast = newChild;
		}
		var pre = nextChild ? nextChild.previousSibling : parentNode.lastChild;

		newFirst.previousSibling = pre;
		newLast.nextSibling = nextChild;
		
		
		if(pre){
			pre.nextSibling = newFirst;
		}else {
			parentNode.firstChild = newFirst;
		}
		if(nextChild == null){
			parentNode.lastChild = newLast;
		}else {
			nextChild.previousSibling = newLast;
		}
		do{
			newFirst.parentNode = parentNode;
		}while(newFirst !== newLast && (newFirst= newFirst.nextSibling))
		_onUpdateChild(parentNode.ownerDocument||parentNode,parentNode);
		//console.log(parentNode.lastChild.nextSibling == null)
		if (newChild.nodeType == DOCUMENT_FRAGMENT_NODE) {
			newChild.firstChild = newChild.lastChild = null;
		}
		return newChild;
	}
	function _appendSingleChild(parentNode,newChild){
		var cp = newChild.parentNode;
		if(cp){
			var pre = parentNode.lastChild;
			cp.removeChild(newChild);//remove and update
			var pre = parentNode.lastChild;
		}
		var pre = parentNode.lastChild;
		newChild.parentNode = parentNode;
		newChild.previousSibling = pre;
		newChild.nextSibling = null;
		if(pre){
			pre.nextSibling = newChild;
		}else {
			parentNode.firstChild = newChild;
		}
		parentNode.lastChild = newChild;
		_onUpdateChild(parentNode.ownerDocument,parentNode,newChild);
		return newChild;
		//console.log("__aa",parentNode.lastChild.nextSibling == null)
	}
	Document.prototype = {
		//implementation : null,
		nodeName :  '#document',
		nodeType :  DOCUMENT_NODE,
		doctype :  null,
		documentElement :  null,
		_inc : 1,
		
		insertBefore :  function(newChild, refChild){//raises 
			if(newChild.nodeType == DOCUMENT_FRAGMENT_NODE){
				var child = newChild.firstChild;
				while(child){
					var next = child.nextSibling;
					this.insertBefore(child,refChild);
					child = next;
				}
				return newChild;
			}
			if(this.documentElement == null && newChild.nodeType == ELEMENT_NODE){
				this.documentElement = newChild;
			}
			
			return _insertBefore(this,newChild,refChild),(newChild.ownerDocument = this),newChild;
		},
		removeChild :  function(oldChild){
			if(this.documentElement == oldChild){
				this.documentElement = null;
			}
			return _removeChild(this,oldChild);
		},
		// Introduced in DOM Level 2:
		importNode : function(importedNode,deep){
			return importNode(this,importedNode,deep);
		},
		// Introduced in DOM Level 2:
		getElementById :	function(id){
			var rtv = null;
			_visitNode(this.documentElement,function(node){
				if(node.nodeType == ELEMENT_NODE){
					if(node.getAttribute('id') == id){
						rtv = node;
						return true;
					}
				}
			});
			return rtv;
		},
		
		getElementsByClassName: function(className) {
			var pattern = new RegExp("(^|\\s)" + className + "(\\s|$)");
			return new LiveNodeList(this, function(base) {
				var ls = [];
				_visitNode(base.documentElement, function(node) {
					if(node !== base && node.nodeType == ELEMENT_NODE) {
						if(pattern.test(node.getAttribute('class'))) {
							ls.push(node);
						}
					}
				});
				return ls;
			});
		},
		
		//document factory method:
		createElement :	function(tagName){
			var node = new Element();
			node.ownerDocument = this;
			node.nodeName = tagName;
			node.tagName = tagName;
			node.childNodes = new NodeList();
			var attrs	= node.attributes = new NamedNodeMap();
			attrs._ownerElement = node;
			return node;
		},
		createDocumentFragment :	function(){
			var node = new DocumentFragment();
			node.ownerDocument = this;
			node.childNodes = new NodeList();
			return node;
		},
		createTextNode :	function(data){
			var node = new Text();
			node.ownerDocument = this;
			node.appendData(data);
			return node;
		},
		createComment :	function(data){
			var node = new Comment();
			node.ownerDocument = this;
			node.appendData(data);
			return node;
		},
		createCDATASection :	function(data){
			var node = new CDATASection();
			node.ownerDocument = this;
			node.appendData(data);
			return node;
		},
		createProcessingInstruction :	function(target,data){
			var node = new ProcessingInstruction();
			node.ownerDocument = this;
			node.tagName = node.target = target;
			node.nodeValue= node.data = data;
			return node;
		},
		createAttribute :	function(name){
			var node = new Attr();
			node.ownerDocument	= this;
			node.name = name;
			node.nodeName	= name;
			node.localName = name;
			node.specified = true;
			return node;
		},
		createEntityReference :	function(name){
			var node = new EntityReference();
			node.ownerDocument	= this;
			node.nodeName	= name;
			return node;
		},
		// Introduced in DOM Level 2:
		createElementNS :	function(namespaceURI,qualifiedName){
			var node = new Element();
			var pl = qualifiedName.split(':');
			var attrs	= node.attributes = new NamedNodeMap();
			node.childNodes = new NodeList();
			node.ownerDocument = this;
			node.nodeName = qualifiedName;
			node.tagName = qualifiedName;
			node.namespaceURI = namespaceURI;
			if(pl.length == 2){
				node.prefix = pl[0];
				node.localName = pl[1];
			}else {
				//el.prefix = null;
				node.localName = qualifiedName;
			}
			attrs._ownerElement = node;
			return node;
		},
		// Introduced in DOM Level 2:
		createAttributeNS :	function(namespaceURI,qualifiedName){
			var node = new Attr();
			var pl = qualifiedName.split(':');
			node.ownerDocument = this;
			node.nodeName = qualifiedName;
			node.name = qualifiedName;
			node.namespaceURI = namespaceURI;
			node.specified = true;
			if(pl.length == 2){
				node.prefix = pl[0];
				node.localName = pl[1];
			}else {
				//el.prefix = null;
				node.localName = qualifiedName;
			}
			return node;
		}
	};
	_extends(Document,Node);


	function Element() {
		this._nsMap = {};
	}Element.prototype = {
		nodeType : ELEMENT_NODE,
		hasAttribute : function(name){
			return this.getAttributeNode(name)!=null;
		},
		getAttribute : function(name){
			var attr = this.getAttributeNode(name);
			return attr && attr.value || '';
		},
		getAttributeNode : function(name){
			return this.attributes.getNamedItem(name);
		},
		setAttribute : function(name, value){
			var attr = this.ownerDocument.createAttribute(name);
			attr.value = attr.nodeValue = "" + value;
			this.setAttributeNode(attr);
		},
		removeAttribute : function(name){
			var attr = this.getAttributeNode(name);
			attr && this.removeAttributeNode(attr);
		},
		
		//four real opeartion method
		appendChild:function(newChild){
			if(newChild.nodeType === DOCUMENT_FRAGMENT_NODE){
				return this.insertBefore(newChild,null);
			}else {
				return _appendSingleChild(this,newChild);
			}
		},
		setAttributeNode : function(newAttr){
			return this.attributes.setNamedItem(newAttr);
		},
		setAttributeNodeNS : function(newAttr){
			return this.attributes.setNamedItemNS(newAttr);
		},
		removeAttributeNode : function(oldAttr){
			//console.log(this == oldAttr.ownerElement)
			return this.attributes.removeNamedItem(oldAttr.nodeName);
		},
		//get real attribute name,and remove it by removeAttributeNode
		removeAttributeNS : function(namespaceURI, localName){
			var old = this.getAttributeNodeNS(namespaceURI, localName);
			old && this.removeAttributeNode(old);
		},
		
		hasAttributeNS : function(namespaceURI, localName){
			return this.getAttributeNodeNS(namespaceURI, localName)!=null;
		},
		getAttributeNS : function(namespaceURI, localName){
			var attr = this.getAttributeNodeNS(namespaceURI, localName);
			return attr && attr.value || '';
		},
		setAttributeNS : function(namespaceURI, qualifiedName, value){
			var attr = this.ownerDocument.createAttributeNS(namespaceURI, qualifiedName);
			attr.value = attr.nodeValue = "" + value;
			this.setAttributeNode(attr);
		},
		getAttributeNodeNS : function(namespaceURI, localName){
			return this.attributes.getNamedItemNS(namespaceURI, localName);
		},
		
		getElementsByTagName : function(tagName){
			return new LiveNodeList(this,function(base){
				var ls = [];
				_visitNode(base,function(node){
					if(node !== base && node.nodeType == ELEMENT_NODE && (tagName === '*' || node.tagName == tagName)){
						ls.push(node);
					}
				});
				return ls;
			});
		},
		getElementsByTagNameNS : function(namespaceURI, localName){
			return new LiveNodeList(this,function(base){
				var ls = [];
				_visitNode(base,function(node){
					if(node !== base && node.nodeType === ELEMENT_NODE && (namespaceURI === '*' || node.namespaceURI === namespaceURI) && (localName === '*' || node.localName == localName)){
						ls.push(node);
					}
				});
				return ls;
				
			});
		}
	};
	Document.prototype.getElementsByTagName = Element.prototype.getElementsByTagName;
	Document.prototype.getElementsByTagNameNS = Element.prototype.getElementsByTagNameNS;


	_extends(Element,Node);
	function Attr() {
	}Attr.prototype.nodeType = ATTRIBUTE_NODE;
	_extends(Attr,Node);


	function CharacterData() {
	}CharacterData.prototype = {
		data : '',
		substringData : function(offset, count) {
			return this.data.substring(offset, offset+count);
		},
		appendData: function(text) {
			text = this.data+text;
			this.nodeValue = this.data = text;
			this.length = text.length;
		},
		insertData: function(offset,text) {
			this.replaceData(offset,0,text);
		
		},
		appendChild:function(newChild){
			throw new Error(ExceptionMessage[HIERARCHY_REQUEST_ERR])
		},
		deleteData: function(offset, count) {
			this.replaceData(offset,count,"");
		},
		replaceData: function(offset, count, text) {
			var start = this.data.substring(0,offset);
			var end = this.data.substring(offset+count);
			text = start + text + end;
			this.nodeValue = this.data = text;
			this.length = text.length;
		}
	};
	_extends(CharacterData,Node);
	function Text() {
	}Text.prototype = {
		nodeName : "#text",
		nodeType : TEXT_NODE,
		splitText : function(offset) {
			var text = this.data;
			var newText = text.substring(offset);
			text = text.substring(0, offset);
			this.data = this.nodeValue = text;
			this.length = text.length;
			var newNode = this.ownerDocument.createTextNode(newText);
			if(this.parentNode){
				this.parentNode.insertBefore(newNode, this.nextSibling);
			}
			return newNode;
		}
	};
	_extends(Text,CharacterData);
	function Comment() {
	}Comment.prototype = {
		nodeName : "#comment",
		nodeType : COMMENT_NODE
	};
	_extends(Comment,CharacterData);

	function CDATASection() {
	}CDATASection.prototype = {
		nodeName : "#cdata-section",
		nodeType : CDATA_SECTION_NODE
	};
	_extends(CDATASection,CharacterData);


	function DocumentType() {
	}DocumentType.prototype.nodeType = DOCUMENT_TYPE_NODE;
	_extends(DocumentType,Node);

	function Notation() {
	}Notation.prototype.nodeType = NOTATION_NODE;
	_extends(Notation,Node);

	function Entity() {
	}Entity.prototype.nodeType = ENTITY_NODE;
	_extends(Entity,Node);

	function EntityReference() {
	}EntityReference.prototype.nodeType = ENTITY_REFERENCE_NODE;
	_extends(EntityReference,Node);

	function DocumentFragment() {
	}DocumentFragment.prototype.nodeName =	"#document-fragment";
	DocumentFragment.prototype.nodeType =	DOCUMENT_FRAGMENT_NODE;
	_extends(DocumentFragment,Node);


	function ProcessingInstruction() {
	}
	ProcessingInstruction.prototype.nodeType = PROCESSING_INSTRUCTION_NODE;
	_extends(ProcessingInstruction,Node);
	function XMLSerializer(){}
	XMLSerializer.prototype.serializeToString = function(node,isHtml,nodeFilter){
		return nodeSerializeToString.call(node,isHtml,nodeFilter);
	};
	Node.prototype.toString = nodeSerializeToString;
	function nodeSerializeToString(isHtml,nodeFilter){
		var buf = [];
		var refNode = this.nodeType == 9 && this.documentElement || this;
		var prefix = refNode.prefix;
		var uri = refNode.namespaceURI;
		
		if(uri && prefix == null){
			//console.log(prefix)
			var prefix = refNode.lookupPrefix(uri);
			if(prefix == null){
				//isHTML = true;
				var visibleNamespaces=[
				{namespace:uri,prefix:null}
				//{namespace:uri,prefix:''}
				];
			}
		}
		serializeToString(this,buf,isHtml,nodeFilter,visibleNamespaces);
		//console.log('###',this.nodeType,uri,prefix,buf.join(''))
		return buf.join('');
	}
	function needNamespaceDefine(node,isHTML, visibleNamespaces) {
		var prefix = node.prefix||'';
		var uri = node.namespaceURI;
		if (!prefix && !uri){
			return false;
		}
		if (prefix === "xml" && uri === "http://www.w3.org/XML/1998/namespace" 
			|| uri == 'http://www.w3.org/2000/xmlns/'){
			return false;
		}
		
		var i = visibleNamespaces.length; 
		//console.log('@@@@',node.tagName,prefix,uri,visibleNamespaces)
		while (i--) {
			var ns = visibleNamespaces[i];
			// get namespace prefix
			//console.log(node.nodeType,node.tagName,ns.prefix,prefix)
			if (ns.prefix == prefix){
				return ns.namespace != uri;
			}
		}
		//console.log(isHTML,uri,prefix=='')
		//if(isHTML && prefix ==null && uri == 'http://www.w3.org/1999/xhtml'){
		//	return false;
		//}
		//node.flag = '11111'
		//console.error(3,true,node.flag,node.prefix,node.namespaceURI)
		return true;
	}
	function serializeToString(node,buf,isHTML,nodeFilter,visibleNamespaces){
		if(nodeFilter){
			node = nodeFilter(node);
			if(node){
				if(typeof node == 'string'){
					buf.push(node);
					return;
				}
			}else {
				return;
			}
			//buf.sort.apply(attrs, attributeSorter);
		}
		switch(node.nodeType){
		case ELEMENT_NODE:
			if (!visibleNamespaces) visibleNamespaces = [];
			visibleNamespaces.length;
			var attrs = node.attributes;
			var len = attrs.length;
			var child = node.firstChild;
			var nodeName = node.tagName;
			
			isHTML =  (htmlns === node.namespaceURI) ||isHTML; 
			buf.push('<',nodeName);
			
			
			
			for(var i=0;i<len;i++){
				// add namespaces for attributes
				var attr = attrs.item(i);
				if (attr.prefix == 'xmlns') {
					visibleNamespaces.push({ prefix: attr.localName, namespace: attr.value });
				}else if(attr.nodeName == 'xmlns'){
					visibleNamespaces.push({ prefix: '', namespace: attr.value });
				}
			}
			for(var i=0;i<len;i++){
				var attr = attrs.item(i);
				if (needNamespaceDefine(attr,isHTML, visibleNamespaces)) {
					var prefix = attr.prefix||'';
					var uri = attr.namespaceURI;
					var ns = prefix ? ' xmlns:' + prefix : " xmlns";
					buf.push(ns, '="' , uri , '"');
					visibleNamespaces.push({ prefix: prefix, namespace:uri });
				}
				serializeToString(attr,buf,isHTML,nodeFilter,visibleNamespaces);
			}
			// add namespace for current node		
			if (needNamespaceDefine(node,isHTML, visibleNamespaces)) {
				var prefix = node.prefix||'';
				var uri = node.namespaceURI;
				if (uri) {
					// Avoid empty namespace value like xmlns:ds=""
					// Empty namespace URL will we produce an invalid XML document
					var ns = prefix ? ' xmlns:' + prefix : " xmlns";
					buf.push(ns, '="' , uri , '"');
					visibleNamespaces.push({ prefix: prefix, namespace:uri });
				}
			}
			
			if(child || isHTML && !/^(?:meta|link|img|br|hr|input)$/i.test(nodeName)){
				buf.push('>');
				//if is cdata child node
				if(isHTML && /^script$/i.test(nodeName)){
					while(child){
						if(child.data){
							buf.push(child.data);
						}else {
							serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
						}
						child = child.nextSibling;
					}
				}else
				{
					while(child){
						serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
						child = child.nextSibling;
					}
				}
				buf.push('</',nodeName,'>');
			}else {
				buf.push('/>');
			}
			// remove added visible namespaces
			//visibleNamespaces.length = startVisibleNamespaces;
			return;
		case DOCUMENT_NODE:
		case DOCUMENT_FRAGMENT_NODE:
			var child = node.firstChild;
			while(child){
				serializeToString(child,buf,isHTML,nodeFilter,visibleNamespaces);
				child = child.nextSibling;
			}
			return;
		case ATTRIBUTE_NODE:
			/**
			 * Well-formedness constraint: No < in Attribute Values
			 * The replacement text of any entity referred to directly or indirectly in an attribute value must not contain a <.
			 * @see https://www.w3.org/TR/xml/#CleanAttrVals
			 * @see https://www.w3.org/TR/xml/#NT-AttValue
			 */
			return buf.push(' ', node.name, '="', node.value.replace(/[<&"]/g,_xmlEncoder), '"');
		case TEXT_NODE:
			/**
			 * The ampersand character (&) and the left angle bracket (<) must not appear in their literal form,
			 * except when used as markup delimiters, or within a comment, a processing instruction, or a CDATA section.
			 * If they are needed elsewhere, they must be escaped using either numeric character references or the strings
			 * `&amp;` and `&lt;` respectively.
			 * The right angle bracket (>) may be represented using the string " &gt; ", and must, for compatibility,
			 * be escaped using either `&gt;` or a character reference when it appears in the string `]]>` in content,
			 * when that string is not marking the end of a CDATA section.
			 *
			 * In the content of elements, character data is any string of characters
			 * which does not contain the start-delimiter of any markup
			 * and does not include the CDATA-section-close delimiter, `]]>`.
			 *
			 * @see https://www.w3.org/TR/xml/#NT-CharData
			 */
			return buf.push(node.data
				.replace(/[<&]/g,_xmlEncoder)
				.replace(/]]>/g, ']]&gt;')
			);
		case CDATA_SECTION_NODE:
			return buf.push( '<![CDATA[',node.data,']]>');
		case COMMENT_NODE:
			return buf.push( "<!--",node.data,"-->");
		case DOCUMENT_TYPE_NODE:
			var pubid = node.publicId;
			var sysid = node.systemId;
			buf.push('<!DOCTYPE ',node.name);
			if(pubid){
				buf.push(' PUBLIC ', pubid);
				if (sysid && sysid!='.') {
					buf.push(' ', sysid);
				}
				buf.push('>');
			}else if(sysid && sysid!='.'){
				buf.push(' SYSTEM ', sysid, '>');
			}else {
				var sub = node.internalSubset;
				if(sub){
					buf.push(" [",sub,"]");
				}
				buf.push(">");
			}
			return;
		case PROCESSING_INSTRUCTION_NODE:
			return buf.push( "<?",node.target," ",node.data,"?>");
		case ENTITY_REFERENCE_NODE:
			return buf.push( '&',node.nodeName,';');
		//case ENTITY_NODE:
		//case NOTATION_NODE:
		default:
			buf.push('??',node.nodeName);
		}
	}
	function importNode(doc,node,deep){
		var node2;
		switch (node.nodeType) {
		case ELEMENT_NODE:
			node2 = node.cloneNode(false);
			node2.ownerDocument = doc;
			//var attrs = node2.attributes;
			//var len = attrs.length;
			//for(var i=0;i<len;i++){
				//node2.setAttributeNodeNS(importNode(doc,attrs.item(i),deep));
			//}
		case DOCUMENT_FRAGMENT_NODE:
			break;
		case ATTRIBUTE_NODE:
			deep = true;
			break;
		//case ENTITY_REFERENCE_NODE:
		//case PROCESSING_INSTRUCTION_NODE:
		////case TEXT_NODE:
		//case CDATA_SECTION_NODE:
		//case COMMENT_NODE:
		//	deep = false;
		//	break;
		//case DOCUMENT_NODE:
		//case DOCUMENT_TYPE_NODE:
		//cannot be imported.
		//case ENTITY_NODE:
		//case NOTATION_NODE：
		//can not hit in level3
		//default:throw e;
		}
		if(!node2){
			node2 = node.cloneNode(false);//false
		}
		node2.ownerDocument = doc;
		node2.parentNode = null;
		if(deep){
			var child = node.firstChild;
			while(child){
				node2.appendChild(importNode(doc,child,deep));
				child = child.nextSibling;
			}
		}
		return node2;
	}
	//
	//var _relationMap = {firstChild:1,lastChild:1,previousSibling:1,nextSibling:1,
	//					attributes:1,childNodes:1,parentNode:1,documentElement:1,doctype,};
	function cloneNode(doc,node,deep){
		var node2 = new node.constructor();
		for(var n in node){
			var v = node[n];
			if(typeof v != 'object' ){
				if(v != node2[n]){
					node2[n] = v;
				}
			}
		}
		if(node.childNodes){
			node2.childNodes = new NodeList();
		}
		node2.ownerDocument = doc;
		switch (node2.nodeType) {
		case ELEMENT_NODE:
			var attrs	= node.attributes;
			var attrs2	= node2.attributes = new NamedNodeMap();
			var len = attrs.length;
			attrs2._ownerElement = node2;
			for(var i=0;i<len;i++){
				node2.setAttributeNode(cloneNode(doc,attrs.item(i),true));
			}
			break;	case ATTRIBUTE_NODE:
			deep = true;
		}
		if(deep){
			var child = node.firstChild;
			while(child){
				node2.appendChild(cloneNode(doc,child,deep));
				child = child.nextSibling;
			}
		}
		return node2;
	}

	function __set__(object,key,value){
		object[key] = value;
	}
	//do dynamic
	try{
		if(Object.defineProperty){
			Object.defineProperty(LiveNodeList.prototype,'length',{
				get:function(){
					_updateLiveList(this);
					return this.$$length;
				}
			});
			Object.defineProperty(Node.prototype,'textContent',{
				get:function(){
					return getTextContent(this);
				},
				set:function(data){
					switch(this.nodeType){
					case ELEMENT_NODE:
					case DOCUMENT_FRAGMENT_NODE:
						while(this.firstChild){
							this.removeChild(this.firstChild);
						}
						if(data || String(data)){
							this.appendChild(this.ownerDocument.createTextNode(data));
						}
						break;
					default:
						//TODO:
						this.data = data;
						this.value = data;
						this.nodeValue = data;
					}
				}
			});
			
			function getTextContent(node){
				switch(node.nodeType){
				case ELEMENT_NODE:
				case DOCUMENT_FRAGMENT_NODE:
					var buf = [];
					node = node.firstChild;
					while(node){
						if(node.nodeType!==7 && node.nodeType !==8){
							buf.push(getTextContent(node));
						}
						node = node.nextSibling;
					}
					return buf.join('');
				default:
					return node.nodeValue;
				}
			}
			__set__ = function(object,key,value){
				//console.log(value)
				object['$$'+key] = value;
			};
		}
	}catch(e){//ie8
	}

	//if(typeof require == 'function'){
		dom.Node = Node;
		dom.DOMException = DOMException;
		dom.DOMImplementation = DOMImplementation$1;
		dom.XMLSerializer = XMLSerializer;

	function DOMParser(options){
		this.options = options ||{locator:{}};
	}

	DOMParser.prototype.parseFromString = function(source,mimeType){
		var options = this.options;
		var sax =  new XMLReader();
		var domBuilder = options.domBuilder || new DOMHandler();//contentHandler and LexicalHandler
		var errorHandler = options.errorHandler;
		var locator = options.locator;
		var defaultNSMap = options.xmlns||{};
		var isHTML = /\/x?html?$/.test(mimeType);//mimeType.toLowerCase().indexOf('html') > -1;
	  	var entityMap = isHTML?htmlEntity.entityMap:{'lt':'<','gt':'>','amp':'&','quot':'"','apos':"'"};
		if(locator){
			domBuilder.setDocumentLocator(locator);
		}

		sax.errorHandler = buildErrorHandler(errorHandler,domBuilder,locator);
		sax.domBuilder = options.domBuilder || domBuilder;
		if(isHTML){
			defaultNSMap['']= 'http://www.w3.org/1999/xhtml';
		}
		defaultNSMap.xml = defaultNSMap.xml || 'http://www.w3.org/XML/1998/namespace';
		if(source && typeof source === 'string'){
			sax.parse(source,defaultNSMap,entityMap);
		}else {
			sax.errorHandler.error("invalid doc source");
		}
		return domBuilder.doc;
	};
	function buildErrorHandler(errorImpl,domBuilder,locator){
		if(!errorImpl){
			if(domBuilder instanceof DOMHandler){
				return domBuilder;
			}
			errorImpl = domBuilder ;
		}
		var errorHandler = {};
		var isCallback = errorImpl instanceof Function;
		locator = locator||{};
		function build(key){
			var fn = errorImpl[key];
			if(!fn && isCallback){
				fn = errorImpl.length == 2?function(msg){errorImpl(key,msg);}:errorImpl;
			}
			errorHandler[key] = fn && function(msg){
				fn('[xmldom '+key+']\t'+msg+_locator(locator));
			}||function(){};
		}
		build('warning');
		build('error');
		build('fatalError');
		return errorHandler;
	}

	//console.log('#\n\n\n\n\n\n\n####')
	/**
	 * +ContentHandler+ErrorHandler
	 * +LexicalHandler+EntityResolver2
	 * -DeclHandler-DTDHandler
	 *
	 * DefaultHandler:EntityResolver, DTDHandler, ContentHandler, ErrorHandler
	 * DefaultHandler2:DefaultHandler,LexicalHandler, DeclHandler, EntityResolver2
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/helpers/DefaultHandler.html
	 */
	function DOMHandler() {
	    this.cdata = false;
	}
	function position(locator,node){
		node.lineNumber = locator.lineNumber;
		node.columnNumber = locator.columnNumber;
	}
	/**
	 * @see org.xml.sax.ContentHandler#startDocument
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ContentHandler.html
	 */
	DOMHandler.prototype = {
		startDocument : function() {
	    	this.doc = new DOMImplementation().createDocument(null, null, null);
	    	if (this.locator) {
	        	this.doc.documentURI = this.locator.systemId;
	    	}
		},
		startElement:function(namespaceURI, localName, qName, attrs) {
			var doc = this.doc;
		    var el = doc.createElementNS(namespaceURI, qName||localName);
		    var len = attrs.length;
		    appendElement(this, el);
		    this.currentElement = el;

			this.locator && position(this.locator,el);
		    for (var i = 0 ; i < len; i++) {
		        var namespaceURI = attrs.getURI(i);
		        var value = attrs.getValue(i);
		        var qName = attrs.getQName(i);
				var attr = doc.createAttributeNS(namespaceURI, qName);
				this.locator &&position(attrs.getLocator(i),attr);
				attr.value = attr.nodeValue = value;
				el.setAttributeNode(attr);
		    }
		},
		endElement:function(namespaceURI, localName, qName) {
			var current = this.currentElement;
			current.tagName;
			this.currentElement = current.parentNode;
		},
		startPrefixMapping:function(prefix, uri) {
		},
		endPrefixMapping:function(prefix) {
		},
		processingInstruction:function(target, data) {
		    var ins = this.doc.createProcessingInstruction(target, data);
		    this.locator && position(this.locator,ins);
		    appendElement(this, ins);
		},
		ignorableWhitespace:function(ch, start, length) {
		},
		characters:function(chars, start, length) {
			chars = _toString.apply(this,arguments);
			//console.log(chars)
			if(chars){
				if (this.cdata) {
					var charNode = this.doc.createCDATASection(chars);
				} else {
					var charNode = this.doc.createTextNode(chars);
				}
				if(this.currentElement){
					this.currentElement.appendChild(charNode);
				}else if(/^\s*$/.test(chars)){
					this.doc.appendChild(charNode);
					//process xml
				}
				this.locator && position(this.locator,charNode);
			}
		},
		skippedEntity:function(name) {
		},
		endDocument:function() {
			this.doc.normalize();
		},
		setDocumentLocator:function (locator) {
		    if(this.locator = locator){// && !('lineNumber' in locator)){
		    	locator.lineNumber = 0;
		    }
		},
		//LexicalHandler
		comment:function(chars, start, length) {
			chars = _toString.apply(this,arguments);
		    var comm = this.doc.createComment(chars);
		    this.locator && position(this.locator,comm);
		    appendElement(this, comm);
		},

		startCDATA:function() {
		    //used in characters() methods
		    this.cdata = true;
		},
		endCDATA:function() {
		    this.cdata = false;
		},

		startDTD:function(name, publicId, systemId) {
			var impl = this.doc.implementation;
		    if (impl && impl.createDocumentType) {
		        var dt = impl.createDocumentType(name, publicId, systemId);
		        this.locator && position(this.locator,dt);
		        appendElement(this, dt);
		    }
		},
		/**
		 * @see org.xml.sax.ErrorHandler
		 * @link http://www.saxproject.org/apidoc/org/xml/sax/ErrorHandler.html
		 */
		warning:function(error) {
			console.warn('[xmldom warning]\t'+error,_locator(this.locator));
		},
		error:function(error) {
			console.error('[xmldom error]\t'+error,_locator(this.locator));
		},
		fatalError:function(error) {
			throw new ParseError(error, this.locator);
		}
	};
	function _locator(l){
		if(l){
			return '\n@'+(l.systemId ||'')+'#[line:'+l.lineNumber+',col:'+l.columnNumber+']'
		}
	}
	function _toString(chars,start,length){
		if(typeof chars == 'string'){
			return chars.substr(start,length)
		}else {//java sax connect width xmldom on rhino(what about: "? && !(chars instanceof String)")
			if(chars.length >= start+length || start){
				return new java.lang.String(chars,start,length)+'';
			}
			return chars;
		}
	}

	/*
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/LexicalHandler.html
	 * used method of org.xml.sax.ext.LexicalHandler:
	 *  #comment(chars, start, length)
	 *  #startCDATA()
	 *  #endCDATA()
	 *  #startDTD(name, publicId, systemId)
	 *
	 *
	 * IGNORED method of org.xml.sax.ext.LexicalHandler:
	 *  #endDTD()
	 *  #startEntity(name)
	 *  #endEntity(name)
	 *
	 *
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/DeclHandler.html
	 * IGNORED method of org.xml.sax.ext.DeclHandler
	 * 	#attributeDecl(eName, aName, type, mode, value)
	 *  #elementDecl(name, model)
	 *  #externalEntityDecl(name, publicId, systemId)
	 *  #internalEntityDecl(name, value)
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/ext/EntityResolver2.html
	 * IGNORED method of org.xml.sax.EntityResolver2
	 *  #resolveEntity(String name,String publicId,String baseURI,String systemId)
	 *  #resolveEntity(publicId, systemId)
	 *  #getExternalSubset(name, baseURI)
	 * @link http://www.saxproject.org/apidoc/org/xml/sax/DTDHandler.html
	 * IGNORED method of org.xml.sax.DTDHandler
	 *  #notationDecl(name, publicId, systemId) {};
	 *  #unparsedEntityDecl(name, publicId, systemId, notationName) {};
	 */
	"endDTD,startEntity,endEntity,attributeDecl,elementDecl,externalEntityDecl,internalEntityDecl,resolveEntity,getExternalSubset,notationDecl,unparsedEntityDecl".replace(/\w+/g,function(key){
		DOMHandler.prototype[key] = function(){return null};
	});

	/* Private static helpers treated below as private instance methods, so don't need to add these to the public API; we might use a Relator to also get rid of non-standard public properties */
	function appendElement (hander,node) {
	    if (!hander.currentElement) {
	        hander.doc.appendChild(node);
	    } else {
	        hander.currentElement.appendChild(node);
	    }
	}//appendChild and setAttributeNS are preformance key

	//if(typeof require == 'function'){
	var htmlEntity = entities;
	var sax = sax$1;
	var XMLReader = sax.XMLReader;
	var ParseError = sax.ParseError;
	var DOMImplementation = domParser.DOMImplementation = dom.DOMImplementation;
	domParser.XMLSerializer = dom.XMLSerializer ;
	domParser.DOMParser = DOMParser;
	domParser.__DOMHandler = DOMHandler;

	var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(xmldomToMathmlElementAdapter, "__esModule", { value: true });
	xmldomToMathmlElementAdapter.XmlToMathMLAdapter = void 0;
	var xmldom_1 = __importDefault(domParser);
	var XmlToMathMLAdapter = /** @class */ (function () {
	    function XmlToMathMLAdapter(elementsConvertor, errorHandler) {
	        this._xml = '';
	        this._elementsConvertor = elementsConvertor;
	        this._errorHandler = errorHandler;
	        this._xmlDOM = new xmldom_1.default.DOMParser({
	            locator: this._errorHandler.errorLocator,
	            errorHandler: this._fixError.bind(this),
	        });
	    }
	    XmlToMathMLAdapter.prototype.convert = function (xml) {
	        this._xml = this._removeLineBreaks(xml);
	        return this._elementsConvertor.convert(this._mathMLElements);
	    };
	    XmlToMathMLAdapter.prototype._fixError = function (errorMessage) {
	        this._xml = this._errorHandler.fixError(this._xml, errorMessage);
	    };
	    XmlToMathMLAdapter.prototype._removeLineBreaks = function (xml) {
	        var LINE_BREAK = /\n|\r\n|\r/g;
	        return xml.replace(LINE_BREAK, '');
	    };
	    Object.defineProperty(XmlToMathMLAdapter.prototype, "_mathMLElements", {
	        get: function () {
	            var elements = this._xmlDOM.parseFromString(this._xml).getElementsByTagName('math');
	            if (this._errorHandler.isThereAnyErrors()) {
	                this._errorHandler.cleanErrors();
	                elements = this._xmlDOM.parseFromString(this._xml).getElementsByTagName('math');
	            }
	            return Array.from(elements);
	        },
	        enumerable: false,
	        configurable: true
	    });
	    return XmlToMathMLAdapter;
	}());
	xmldomToMathmlElementAdapter.XmlToMathMLAdapter = XmlToMathMLAdapter;

	var errorHandler = {};

	Object.defineProperty(errorHandler, "__esModule", { value: true });
	errorHandler.ErrorHandler = void 0;
	var ErrorHandler = /** @class */ (function () {
	    function ErrorHandler() {
	        this._errors = [];
	        this.errorLocator = {};
	    }
	    ErrorHandler.prototype.fixError = function (xml, errorMessage) {
	        if (!this._isMissingAttributeValueError(errorMessage))
	            return xml;
	        this._errors.push(errorMessage);
	        return this._fixMissingAttribute(errorMessage, xml);
	    };
	    ErrorHandler.prototype.isThereAnyErrors = function () {
	        return this._errors.length > 0;
	    };
	    ErrorHandler.prototype.cleanErrors = function () {
	        this._errors = [];
	    };
	    ErrorHandler.prototype._fixMissingAttribute = function (errorMessage, xml) {
	        var missingAttribute = errorMessage.split('"')[1];
	        if (missingAttribute)
	            return xml.replace(this._matchMissingValueForAttribute(missingAttribute), '');
	        while (this._mathGenericMissingValue().exec(xml)) {
	            xml = xml.replace(this._mathGenericMissingValue(), '$1$3');
	        }
	        return xml;
	    };
	    ErrorHandler.prototype._matchMissingValueForAttribute = function (attribute) {
	        return new RegExp("(".concat(attribute, "=(?!(\"|')))|(").concat(attribute, "(?!(\"|')))"), 'gm');
	    };
	    ErrorHandler.prototype._mathGenericMissingValue = function () {
	        return /(\<.* )(\w+=(?!\"|\'))(.*\>)/gm;
	    };
	    ErrorHandler.prototype._isMissingAttributeValueError = function (errorMessage) {
	        return ((!!errorMessage.includes('attribute') && !!errorMessage.includes('missed')) ||
	            errorMessage.includes('attribute value missed'));
	    };
	    return ErrorHandler;
	}());
	errorHandler.ErrorHandler = ErrorHandler;

	var xmldomElementsToMathmlElementsAdapter = {};

	Object.defineProperty(xmldomElementsToMathmlElementsAdapter, "__esModule", { value: true });
	xmldomElementsToMathmlElementsAdapter.ElementsToMathMLAdapter = void 0;
	var ElementsToMathMLAdapter = /** @class */ (function () {
	    function ElementsToMathMLAdapter() {
	    }
	    ElementsToMathMLAdapter.prototype.convert = function (els) {
	        var _this = this;
	        return els.filter(function (el) { return el.tagName !== undefined; }).map(function (el) { return _this._convertElement(el); });
	    };
	    ElementsToMathMLAdapter.prototype._convertElement = function (el) {
	        return {
	            name: el.tagName,
	            attributes: this._convertElementAttributes(el.attributes),
	            value: this._hasElementChild(el) ? '' : el.textContent || '',
	            children: this._hasElementChild(el)
	                ? this.convert(Array.from(el.childNodes))
	                : [],
	        };
	    };
	    ElementsToMathMLAdapter.prototype._convertElementAttributes = function (attributes) {
	        return Array.from(attributes).reduce(function (acc, attr) {
	            var _a;
	            return Object.assign((_a = {}, _a[attr.nodeName] = attr.nodeValue === attr.nodeName ? '' : attr.nodeValue, _a), acc);
	        }, {});
	    };
	    ElementsToMathMLAdapter.prototype._hasElementChild = function (el) {
	        var childNodes = el.childNodes;
	        return !!childNodes && childNodes.length !== 0 && this._isThereAnyNoTextNode(childNodes);
	    };
	    ElementsToMathMLAdapter.prototype._isThereAnyNoTextNode = function (children) {
	        return Array.from(children).some(function (child) { return child.nodeName !== '#text'; });
	    };
	    return ElementsToMathMLAdapter;
	}());
	xmldomElementsToMathmlElementsAdapter.ElementsToMathMLAdapter = ElementsToMathMLAdapter;

	(function (exports) {
		var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    var desc = Object.getOwnPropertyDescriptor(m, k);
		    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
		      desc = { enumerable: true, get: function() { return m[k]; } };
		    }
		    Object.defineProperty(o, k2, desc);
		}) : (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    o[k2] = m[k];
		}));
		var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
		    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		__exportStar(xmldomToMathmlElementAdapter, exports);
		__exportStar(errorHandler, exports);
		__exportStar(xmldomElementsToMathmlElementsAdapter, exports);
	} (xmldomToMathmlElements));

	Object.defineProperty(makeToMathElementsConverter$1, "__esModule", { value: true });
	makeToMathElementsConverter$1.makeToMathElementsConverter = void 0;
	var xmldom_to_mathml_elements_1 = xmldomToMathmlElements;
	var makeToMathElementsConverter = function () {
	    var elementsToMathMLAdapter = new xmldom_to_mathml_elements_1.ElementsToMathMLAdapter();
	    var errorHandler = new xmldom_to_mathml_elements_1.ErrorHandler();
	    return new xmldom_to_mathml_elements_1.XmlToMathMLAdapter(elementsToMathMLAdapter, errorHandler);
	};
	makeToMathElementsConverter$1.makeToMathElementsConverter = makeToMathElementsConverter;

	(function (exports) {
		var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    var desc = Object.getOwnPropertyDescriptor(m, k);
		    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
		      desc = { enumerable: true, get: function() { return m[k]; } };
		    }
		    Object.defineProperty(o, k2, desc);
		}) : (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    o[k2] = m[k];
		}));
		var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
		    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		__exportStar(makeToMathElementsConverter$1, exports);
	} (factories));

	Object.defineProperty(mathmlToLatex, "__esModule", { value: true });
	mathmlToLatex.MathMLToLaTeX = void 0;
	var mathml_element_to_latex_converter_adapter_1 = requireMathmlElementToLatexConverterAdapter();
	var factories_1 = factories;
	var MathMLToLaTeX = /** @class */ (function () {
	    function MathMLToLaTeX() {
	    }
	    MathMLToLaTeX.convert = function (mathml) {
	        var mathmlElements = (0, factories_1.makeToMathElementsConverter)().convert(mathml);
	        var mathmlElementsToLaTeXConverters = mathmlElements.map(function (mathMLElement) {
	            return new mathml_element_to_latex_converter_adapter_1.MathMLElementToLatexConverterAdapter(mathMLElement).toLatexConverter();
	        });
	        return mathmlElementsToLaTeXConverters.map(function (toLatexConverters) { return toLatexConverters.convert(); }).join('');
	    };
	    return MathMLToLaTeX;
	}());
	mathmlToLatex.MathMLToLaTeX = MathMLToLaTeX;

	(function (exports) {
		var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    var desc = Object.getOwnPropertyDescriptor(m, k);
		    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
		      desc = { enumerable: true, get: function() { return m[k]; } };
		    }
		    Object.defineProperty(o, k2, desc);
		}) : (function(o, m, k, k2) {
		    if (k2 === undefined) k2 = k;
		    o[k2] = m[k];
		}));
		var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
		    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
		};
		Object.defineProperty(exports, "__esModule", { value: true });
		__exportStar(mathmlToLatex, exports);
	} (main));

	(function (module, exports) {
		Object.defineProperty(exports, "__esModule", { value: true });
		var main_1 = main;
		exports.default = main_1.MathMLToLaTeX;
		module.exports = main_1.MathMLToLaTeX;
	} (dist, dist.exports));

	var index = /*@__PURE__*/getDefaultExportFromCjs(dist.exports);

	return index;

}));
