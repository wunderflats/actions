/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 789:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const variable = __nccwpck_require__(318)
const EnvVarError = __nccwpck_require__(703)

/**
 * Returns an "env-var" instance that reads from the given container of values.
 * By default, we export an instance that reads from process.env
 * @param  {Object} container target container to read values from
 * @param  {Object} extraAccessors additional accessors to attach to the
 * resulting object
 * @return {Object} a new module instance
 */
const from = (container, extraAccessors, logger) => {
  return {
    from: from,

    /**
     * This is the Error class used to generate exceptions. Can be used to identify
     * exceptions and handle them appropriately.
     */
    EnvVarError: __nccwpck_require__(703),

    /**
     * Returns a variable instance with helper functions, or process.env
     * @param  {String} variableName Name of the environment variable requested
     * @return {Object}
     */
    get: function (variableName) {
      if (!variableName) {
        return container
      }

      if (arguments.length > 1) {
        throw new EnvVarError('It looks like you passed more than one argument to env.get(). Since env-var@6.0.0 this is no longer supported. To set a default value use env.get(TARGET).default(DEFAULT)')
      }

      return variable(container, variableName, extraAccessors || {}, logger || function noopLogger () {})
    },

    /**
     * Provides access to the functions that env-var uses to parse
     * process.env strings into valid types requested by the API
     */
    accessors: __nccwpck_require__(526),

    /**
     * Provides a default logger that can be used to print logs.
     * This will not print logs in a production environment (checks process.env.NODE_ENV)
     */
    logger: __nccwpck_require__(954)(console.log, container.NODE_ENV)
  }
}

module.exports = from(process.env)


/***/ }),

/***/ 143:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const asString = __nccwpck_require__(961)

module.exports = function asArray (value, delimiter) {
  delimiter = delimiter || ','

  if (!value.length) {
    return []
  } else {
    return asString(value).split(delimiter).filter(Boolean)
  }
}


/***/ }),

/***/ 482:
/***/ ((module) => {

"use strict";


module.exports = function asBoolStrict (value) {
  const val = value.toLowerCase()

  if ((val !== 'false') && (val !== 'true')) {
    throw new Error('should be either "true", "false", "TRUE", or "FALSE"')
  }

  return val !== 'false'
}


/***/ }),

/***/ 372:
/***/ ((module) => {

"use strict";


module.exports = function asBool (value) {
  const val = value.toLowerCase()

  const allowedValues = [
    'false',
    '0',
    'true',
    '1'
  ]

  if (allowedValues.indexOf(val) === -1) {
    throw new Error('should be either "true", "false", "TRUE", "FALSE", 1, or 0')
  }

  return !(((val === '0') || (val === 'false')))
}


/***/ }),

/***/ 126:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const asString = __nccwpck_require__(961)

// eslint-disable-next-line no-control-regex
const EMAIL_REGEX = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\u0001-\u0008\u000b\u000c\u000e-\u001f\u0021\u0023-\u005b\u005d-\u007f]|\\[\u0001-\u0009\u000b\u000c\u000e-\u007f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\u0001-\u0008\u000b\u000c\u000e-\u001f\u0021-\u005a\u0053-\u007f]|\\[\u0001-\u0009\u000b\u000c\u000e-\u007f])+)\])$/

module.exports = function asEmailString (value) {
  const strValue = asString(value)

  if (!EMAIL_REGEX.test(strValue)) {
    throw new Error('should be a valid email address')
  }

  return strValue
}


/***/ }),

/***/ 295:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const asString = __nccwpck_require__(961)

module.exports = function asEnum (value, validValues) {
  const valueString = asString(value)

  if (validValues.indexOf(valueString) < 0) {
    throw new Error(`should be one of [${validValues.join(', ')}]`)
  }

  return valueString
}


/***/ }),

/***/ 572:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const asFloat = __nccwpck_require__(282)

module.exports = function asFloatNegative (value) {
  const ret = asFloat(value)

  if (ret > 0) {
    throw new Error('should be a negative float')
  }

  return ret
}


/***/ }),

/***/ 96:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const asFloat = __nccwpck_require__(282)

module.exports = function asFloatPositive (value) {
  const ret = asFloat(value)

  if (ret < 0) {
    throw new Error('should be a positive float')
  }

  return ret
}


/***/ }),

/***/ 282:
/***/ ((module) => {

"use strict";


module.exports = function asFloat (value) {
  const n = parseFloat(value)

  if (isNaN(n) || n.toString() !== value) {
    throw new Error('should be a valid float')
  }

  return n
}


/***/ }),

/***/ 526:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

module.exports = {
  asArray: __nccwpck_require__(143),

  asBoolStrict: __nccwpck_require__(482),
  asBool: __nccwpck_require__(372),

  asPortNumber: __nccwpck_require__(236),
  asEnum: __nccwpck_require__(295),

  asFloatNegative: __nccwpck_require__(572),
  asFloatPositive: __nccwpck_require__(96),
  asFloat: __nccwpck_require__(282),

  asIntNegative: __nccwpck_require__(310),
  asIntPositive: __nccwpck_require__(223),
  asInt: __nccwpck_require__(106),

  asJsonArray: __nccwpck_require__(879),
  asJsonObject: __nccwpck_require__(156),
  asJson: __nccwpck_require__(245),

  asRegExp: __nccwpck_require__(139),

  asString: __nccwpck_require__(961),

  asUrlObject: __nccwpck_require__(344),
  asUrlString: __nccwpck_require__(495),

  asEmailString: __nccwpck_require__(126)
}


/***/ }),

/***/ 310:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const asInt = __nccwpck_require__(106)

module.exports = function asIntNegative (value) {
  const ret = asInt(value)

  if (ret > 0) {
    throw new Error('should be a negative integer')
  }

  return ret
}


/***/ }),

/***/ 223:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const asInt = __nccwpck_require__(106)

module.exports = function asIntPositive (value) {
  const ret = asInt(value)

  if (ret < 0) {
    throw new Error('should be a positive integer')
  }

  return ret
}


/***/ }),

/***/ 106:
/***/ ((module) => {

"use strict";


module.exports = function asInt (value) {
  const n = parseInt(value, 10)

  if (isNaN(n) || n.toString(10) !== value) {
    throw new Error('should be a valid integer')
  }

  return n
}


/***/ }),

/***/ 879:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const asJson = __nccwpck_require__(245)

module.exports = function asJsonArray (value) {
  var ret = asJson(value)

  if (!Array.isArray(ret)) {
    throw new Error('should be a parseable JSON Array')
  }

  return ret
}


/***/ }),

/***/ 156:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const asJson = __nccwpck_require__(245)

module.exports = function asJsonObject (value) {
  var ret = asJson(value)

  if (Array.isArray(ret)) {
    throw new Error('should be a parseable JSON Object')
  }

  return ret
}


/***/ }),

/***/ 245:
/***/ ((module) => {

"use strict";


module.exports = function asJson (value) {
  try {
    return JSON.parse(value)
  } catch (e) {
    throw new Error('should be valid (parseable) JSON')
  }
}


/***/ }),

/***/ 236:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const asIntPositive = __nccwpck_require__(223)

module.exports = function asPortNumber (value) {
  var ret = asIntPositive(value)

  if (ret > 65535) {
    throw new Error('cannot assign a port number greater than 65535')
  }

  return ret
}


/***/ }),

/***/ 139:
/***/ ((module) => {

"use strict";


module.exports = function asRegExp (value, flags) {
  // We have to test the value and flags indivudally if we want to write our
  // own error messages,as there is no way to differentiate between the two
  // errors except by using string comparisons.

  // Test the flags
  try {
    RegExp(undefined, flags)
  } catch (err) {
    throw new Error('invalid regexp flags')
  }

  try {
    return new RegExp(value, flags)
  } catch (err) {
    // We know that the regexp is the issue because we tested the flags earlier
    throw new Error('should be a valid regexp')
  }
}


/***/ }),

/***/ 961:
/***/ ((module) => {

"use strict";


module.exports = function asString (value) {
  return value
}


/***/ }),

/***/ 344:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const asString = __nccwpck_require__(961)

module.exports = function asUrlObject (value) {
  const ret = asString(value)

  try {
    return new URL(ret)
  } catch (e) {
    throw new Error('should be a valid URL')
  }
}


/***/ }),

/***/ 495:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const urlObject = __nccwpck_require__(344)

module.exports = function asUrlString (value) {
  return urlObject(value).toString()
}


/***/ }),

/***/ 703:
/***/ ((module) => {

"use strict";


/**
 * Custom error class that can be used to identify errors generated
 * by the module
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error}
 */
class EnvVarError extends Error {
  constructor (message, ...params) {
    super(`env-var: ${message}`, ...params)
    /* istanbul ignore else */
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EnvVarError)
    }

    this.name = 'EnvVarError'
  }
}

module.exports = EnvVarError


/***/ }),

/***/ 954:
/***/ ((module) => {

"use strict";


/**
 * Default logger included with env-var.
 * Will not log anything if NODE_ENV is set to production
 */
module.exports = function genLogger (out, prodFlag) {
  return function envVarLogger (varname, str) {
    if (!prodFlag || !prodFlag.match(/prod|production/)) {
      out(`env-var (${varname}): ${str}`)
    }
  }
}


/***/ }),

/***/ 318:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


const EnvVarError = __nccwpck_require__(703)
const base64Regex = /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$/

/**
 * Returns an Object that contains functions to read and specify the format of
 * the variable you wish to have returned
 * @param  {Object} container Encapsulated container (e.g., `process.env`).
 * @param  {String} varName Name of the requested property from `container`.
 * @param  {*} defValue Default value to return if `varName` is invalid.
 * @param  {Object} extraAccessors Extra accessors to install.
 * @return {Object}
 */
module.exports = function getVariableAccessors (container, varName, extraAccessors, logger) {
  let isBase64 = false
  let isRequired = false
  let defValue
  let example

  const builtInAccessors = __nccwpck_require__(526)

  /**
   * Logs the given string using the provided logger
   * @param {String} str
   * @param {String} str
   */
  function log (str) {
    logger(varName, str)
  }

  /**
   * Throw an error with a consistent type/format.
   * @param {String} value
   */
  function raiseError (value, msg) {
    let errMsg = `"${varName}" ${msg}`

    if (value) {
      errMsg = `${errMsg}`
    }

    if (example) {
      errMsg = `${errMsg}. An example of a valid value would be: ${example}`
    }

    throw new EnvVarError(errMsg)
  }

  /**
   * Returns an accessor wrapped by error handling and args passing logic
   * @param {Function} accessor
   */
  function generateAccessor (accessor) {
    return function () {
      let value = container[varName]

      log(`will be read from the environment using "${accessor.name}" accessor`)

      if (typeof value === 'undefined') {
        if (typeof defValue === 'undefined' && isRequired) {
          log('was not found in the environment, but is required to be set')
          // Var is not set, nor is a default. Throw an error
          raiseError(undefined, 'is a required variable, but it was not set')
        } else if (typeof defValue !== 'undefined') {
          log(`was not found in the environment, parsing default value "${defValue}" instead`)
          value = defValue
        } else {
          log('was not found in the environment, but is not required. returning undefined')
          // return undefined since variable is not required and
          // there's no default value provided
          return undefined
        }
      }

      if (isRequired) {
        log('verifying variable value is not an empty string')
        // Need to verify that required variables aren't just whitespace
        if (value.trim().length === 0) {
          raiseError(undefined, 'is a required variable, but its value was empty')
        }
      }

      if (isBase64) {
        log('verifying variable is a valid base64 string')
        if (!value.match(base64Regex)) {
          raiseError(value, 'should be a valid base64 string if using convertFromBase64')
        }
        log('converting from base64 to utf8 string')
        value = Buffer.from(value, 'base64').toString()
      }

      const args = [value].concat(Array.prototype.slice.call(arguments))

      try {
        log(`passing value "${value}" to "${accessor.name}" accessor`)

        const result = accessor.apply(
          accessor,
          args
        )

        log(`parsed successfully, returning ${result}`)
        return result
      } catch (error) {
        raiseError(value, error.message)
      }
    }
  }

  const accessors = {
    /**
     * Instructs env-var to first convert the value of the variable from base64
     * when reading it using a function such as asString()
     */
    convertFromBase64: function () {
      log('marking for base64 conversion')
      isBase64 = true

      return accessors
    },

    /**
     * Set a default value for the variable
     * @param {String} value
     */
    default: function (value) {
      if (typeof value === 'number') {
        defValue = value.toString()
      } else if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        defValue = JSON.stringify(value)
      } else if (typeof value !== 'string') {
        throw new EnvVarError('values passed to default() must be of Number, String, Array, or Object type')
      } else {
        defValue = value
      }

      log(`setting default value to "${defValue}"`)

      return accessors
    },

    /**
     * Ensures a variable is set in the given environment container. Throws an
     * EnvVarError if the variable is not set or a default is not provided
     * @param {Boolean} required
     */
    required: function (required) {
      if (typeof required === 'undefined') {
        log('marked as required')
        // If no value is passed assume that developer means "true"
        // This is to retain support legacy usage (and intuitive)
        isRequired = true
      } else {
        log(`setting required flag to ${required}`)
        isRequired = required
      }

      return accessors
    },

    /**
     * Set an example value for this variable. If the variable value is not set
     * or is set to an invalid value this example will be show in error output.
     * @param {String} example
     */
    example: function (ex) {
      example = ex

      return accessors
    }
  }

  // Attach accessors, and extra accessors if provided.
  Object.entries({
    ...builtInAccessors,
    ...extraAccessors
  }).forEach(([name, accessor]) => {
    accessors[name] = generateAccessor(accessor)
  })

  return accessors
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__nccwpck_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__nccwpck_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__nccwpck_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nccwpck_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
// ESM COMPAT FLAG
__nccwpck_require__.r(__webpack_exports__);

;// CONCATENATED MODULE: external "node:child_process"
const external_node_child_process_namespaceObject = require("node:child_process");
;// CONCATENATED MODULE: external "node:fs"
const external_node_fs_namespaceObject = require("node:fs");
var external_node_fs_default = /*#__PURE__*/__nccwpck_require__.n(external_node_fs_namespaceObject);
;// CONCATENATED MODULE: ../node_modules/chalk/source/vendor/ansi-styles/index.js
const ANSI_BACKGROUND_OFFSET = 10;

const wrapAnsi16 = (offset = 0) => code => `\u001B[${code + offset}m`;

const wrapAnsi256 = (offset = 0) => code => `\u001B[${38 + offset};5;${code}m`;

const wrapAnsi16m = (offset = 0) => (red, green, blue) => `\u001B[${38 + offset};2;${red};${green};${blue}m`;

const styles = {
	modifier: {
		reset: [0, 0],
		// 21 isn't widely supported and 22 does the same thing
		bold: [1, 22],
		dim: [2, 22],
		italic: [3, 23],
		underline: [4, 24],
		overline: [53, 55],
		inverse: [7, 27],
		hidden: [8, 28],
		strikethrough: [9, 29],
	},
	color: {
		black: [30, 39],
		red: [31, 39],
		green: [32, 39],
		yellow: [33, 39],
		blue: [34, 39],
		magenta: [35, 39],
		cyan: [36, 39],
		white: [37, 39],

		// Bright color
		blackBright: [90, 39],
		gray: [90, 39], // Alias of `blackBright`
		grey: [90, 39], // Alias of `blackBright`
		redBright: [91, 39],
		greenBright: [92, 39],
		yellowBright: [93, 39],
		blueBright: [94, 39],
		magentaBright: [95, 39],
		cyanBright: [96, 39],
		whiteBright: [97, 39],
	},
	bgColor: {
		bgBlack: [40, 49],
		bgRed: [41, 49],
		bgGreen: [42, 49],
		bgYellow: [43, 49],
		bgBlue: [44, 49],
		bgMagenta: [45, 49],
		bgCyan: [46, 49],
		bgWhite: [47, 49],

		// Bright color
		bgBlackBright: [100, 49],
		bgGray: [100, 49], // Alias of `bgBlackBright`
		bgGrey: [100, 49], // Alias of `bgBlackBright`
		bgRedBright: [101, 49],
		bgGreenBright: [102, 49],
		bgYellowBright: [103, 49],
		bgBlueBright: [104, 49],
		bgMagentaBright: [105, 49],
		bgCyanBright: [106, 49],
		bgWhiteBright: [107, 49],
	},
};

const modifierNames = Object.keys(styles.modifier);
const foregroundColorNames = Object.keys(styles.color);
const backgroundColorNames = Object.keys(styles.bgColor);
const colorNames = [...foregroundColorNames, ...backgroundColorNames];

function assembleStyles() {
	const codes = new Map();

	for (const [groupName, group] of Object.entries(styles)) {
		for (const [styleName, style] of Object.entries(group)) {
			styles[styleName] = {
				open: `\u001B[${style[0]}m`,
				close: `\u001B[${style[1]}m`,
			};

			group[styleName] = styles[styleName];

			codes.set(style[0], style[1]);
		}

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false,
		});
	}

	Object.defineProperty(styles, 'codes', {
		value: codes,
		enumerable: false,
	});

	styles.color.close = '\u001B[39m';
	styles.bgColor.close = '\u001B[49m';

	styles.color.ansi = wrapAnsi16();
	styles.color.ansi256 = wrapAnsi256();
	styles.color.ansi16m = wrapAnsi16m();
	styles.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
	styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
	styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);

	// From https://github.com/Qix-/color-convert/blob/3f0e0d4e92e235796ccb17f6e85c72094a651f49/conversions.js
	Object.defineProperties(styles, {
		rgbToAnsi256: {
			value(red, green, blue) {
				// We use the extended greyscale palette here, with the exception of
				// black and white. normal palette only has 4 greyscale shades.
				if (red === green && green === blue) {
					if (red < 8) {
						return 16;
					}

					if (red > 248) {
						return 231;
					}

					return Math.round(((red - 8) / 247) * 24) + 232;
				}

				return 16
					+ (36 * Math.round(red / 255 * 5))
					+ (6 * Math.round(green / 255 * 5))
					+ Math.round(blue / 255 * 5);
			},
			enumerable: false,
		},
		hexToRgb: {
			value(hex) {
				const matches = /[a-f\d]{6}|[a-f\d]{3}/i.exec(hex.toString(16));
				if (!matches) {
					return [0, 0, 0];
				}

				let [colorString] = matches;

				if (colorString.length === 3) {
					colorString = [...colorString].map(character => character + character).join('');
				}

				const integer = Number.parseInt(colorString, 16);

				return [
					/* eslint-disable no-bitwise */
					(integer >> 16) & 0xFF,
					(integer >> 8) & 0xFF,
					integer & 0xFF,
					/* eslint-enable no-bitwise */
				];
			},
			enumerable: false,
		},
		hexToAnsi256: {
			value: hex => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
			enumerable: false,
		},
		ansi256ToAnsi: {
			value(code) {
				if (code < 8) {
					return 30 + code;
				}

				if (code < 16) {
					return 90 + (code - 8);
				}

				let red;
				let green;
				let blue;

				if (code >= 232) {
					red = (((code - 232) * 10) + 8) / 255;
					green = red;
					blue = red;
				} else {
					code -= 16;

					const remainder = code % 36;

					red = Math.floor(code / 36) / 5;
					green = Math.floor(remainder / 6) / 5;
					blue = (remainder % 6) / 5;
				}

				const value = Math.max(red, green, blue) * 2;

				if (value === 0) {
					return 30;
				}

				// eslint-disable-next-line no-bitwise
				let result = 30 + ((Math.round(blue) << 2) | (Math.round(green) << 1) | Math.round(red));

				if (value === 2) {
					result += 60;
				}

				return result;
			},
			enumerable: false,
		},
		rgbToAnsi: {
			value: (red, green, blue) => styles.ansi256ToAnsi(styles.rgbToAnsi256(red, green, blue)),
			enumerable: false,
		},
		hexToAnsi: {
			value: hex => styles.ansi256ToAnsi(styles.hexToAnsi256(hex)),
			enumerable: false,
		},
	});

	return styles;
}

const ansiStyles = assembleStyles();

/* harmony default export */ const ansi_styles = (ansiStyles);

;// CONCATENATED MODULE: external "node:process"
const external_node_process_namespaceObject = require("node:process");
;// CONCATENATED MODULE: external "node:os"
const external_node_os_namespaceObject = require("node:os");
;// CONCATENATED MODULE: external "node:tty"
const external_node_tty_namespaceObject = require("node:tty");
;// CONCATENATED MODULE: ../node_modules/chalk/source/vendor/supports-color/index.js




// From: https://github.com/sindresorhus/has-flag/blob/main/index.js
function hasFlag(flag, argv = globalThis.Deno ? globalThis.Deno.args : external_node_process_namespaceObject.argv) {
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const position = argv.indexOf(prefix + flag);
	const terminatorPosition = argv.indexOf('--');
	return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
}

const {env} = external_node_process_namespaceObject;

let flagForceColor;
if (
	hasFlag('no-color')
	|| hasFlag('no-colors')
	|| hasFlag('color=false')
	|| hasFlag('color=never')
) {
	flagForceColor = 0;
} else if (
	hasFlag('color')
	|| hasFlag('colors')
	|| hasFlag('color=true')
	|| hasFlag('color=always')
) {
	flagForceColor = 1;
}

function envForceColor() {
	if ('FORCE_COLOR' in env) {
		if (env.FORCE_COLOR === 'true') {
			return 1;
		}

		if (env.FORCE_COLOR === 'false') {
			return 0;
		}

		return env.FORCE_COLOR.length === 0 ? 1 : Math.min(Number.parseInt(env.FORCE_COLOR, 10), 3);
	}
}

function translateLevel(level) {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3,
	};
}

function _supportsColor(haveStream, {streamIsTTY, sniffFlags = true} = {}) {
	const noFlagForceColor = envForceColor();
	if (noFlagForceColor !== undefined) {
		flagForceColor = noFlagForceColor;
	}

	const forceColor = sniffFlags ? flagForceColor : noFlagForceColor;

	if (forceColor === 0) {
		return 0;
	}

	if (sniffFlags) {
		if (hasFlag('color=16m')
			|| hasFlag('color=full')
			|| hasFlag('color=truecolor')) {
			return 3;
		}

		if (hasFlag('color=256')) {
			return 2;
		}
	}

	// Check for Azure DevOps pipelines.
	// Has to be above the `!streamIsTTY` check.
	if ('TF_BUILD' in env && 'AGENT_NAME' in env) {
		return 1;
	}

	if (haveStream && !streamIsTTY && forceColor === undefined) {
		return 0;
	}

	const min = forceColor || 0;

	if (env.TERM === 'dumb') {
		return min;
	}

	if (external_node_process_namespaceObject.platform === 'win32') {
		// Windows 10 build 10586 is the first Windows release that supports 256 colors.
		// Windows 10 build 14931 is the first release that supports 16m/TrueColor.
		const osRelease = external_node_os_namespaceObject.release().split('.');
		if (
			Number(osRelease[0]) >= 10
			&& Number(osRelease[2]) >= 10_586
		) {
			return Number(osRelease[2]) >= 14_931 ? 3 : 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if ('GITHUB_ACTIONS' in env) {
			return 3;
		}

		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI', 'BUILDKITE', 'DRONE'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return min;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}

	if (env.COLORTERM === 'truecolor') {
		return 3;
	}

	if (env.TERM === 'xterm-kitty') {
		return 3;
	}

	if ('TERM_PROGRAM' in env) {
		const version = Number.parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app': {
				return version >= 3 ? 3 : 2;
			}

			case 'Apple_Terminal': {
				return 2;
			}
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	return min;
}

function createSupportsColor(stream, options = {}) {
	const level = _supportsColor(stream, {
		streamIsTTY: stream && stream.isTTY,
		...options,
	});

	return translateLevel(level);
}

const supportsColor = {
	stdout: createSupportsColor({isTTY: external_node_tty_namespaceObject.isatty(1)}),
	stderr: createSupportsColor({isTTY: external_node_tty_namespaceObject.isatty(2)}),
};

/* harmony default export */ const supports_color = (supportsColor);

;// CONCATENATED MODULE: ../node_modules/chalk/source/utilities.js
// TODO: When targeting Node.js 16, use `String.prototype.replaceAll`.
function stringReplaceAll(string, substring, replacer) {
	let index = string.indexOf(substring);
	if (index === -1) {
		return string;
	}

	const substringLength = substring.length;
	let endIndex = 0;
	let returnValue = '';
	do {
		returnValue += string.slice(endIndex, index) + substring + replacer;
		endIndex = index + substringLength;
		index = string.indexOf(substring, endIndex);
	} while (index !== -1);

	returnValue += string.slice(endIndex);
	return returnValue;
}

function stringEncaseCRLFWithFirstIndex(string, prefix, postfix, index) {
	let endIndex = 0;
	let returnValue = '';
	do {
		const gotCR = string[index - 1] === '\r';
		returnValue += string.slice(endIndex, (gotCR ? index - 1 : index)) + prefix + (gotCR ? '\r\n' : '\n') + postfix;
		endIndex = index + 1;
		index = string.indexOf('\n', endIndex);
	} while (index !== -1);

	returnValue += string.slice(endIndex);
	return returnValue;
}

;// CONCATENATED MODULE: ../node_modules/chalk/source/index.js




const {stdout: stdoutColor, stderr: stderrColor} = supports_color;

const GENERATOR = Symbol('GENERATOR');
const STYLER = Symbol('STYLER');
const IS_EMPTY = Symbol('IS_EMPTY');

// `supportsColor.level` → `ansiStyles.color[name]` mapping
const levelMapping = [
	'ansi',
	'ansi',
	'ansi256',
	'ansi16m',
];

const source_styles = Object.create(null);

const applyOptions = (object, options = {}) => {
	if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
		throw new Error('The `level` option should be an integer from 0 to 3');
	}

	// Detect level if not set manually
	const colorLevel = stdoutColor ? stdoutColor.level : 0;
	object.level = options.level === undefined ? colorLevel : options.level;
};

class Chalk {
	constructor(options) {
		// eslint-disable-next-line no-constructor-return
		return chalkFactory(options);
	}
}

const chalkFactory = options => {
	const chalk = (...strings) => strings.join(' ');
	applyOptions(chalk, options);

	Object.setPrototypeOf(chalk, createChalk.prototype);

	return chalk;
};

function createChalk(options) {
	return chalkFactory(options);
}

Object.setPrototypeOf(createChalk.prototype, Function.prototype);

for (const [styleName, style] of Object.entries(ansi_styles)) {
	source_styles[styleName] = {
		get() {
			const builder = createBuilder(this, createStyler(style.open, style.close, this[STYLER]), this[IS_EMPTY]);
			Object.defineProperty(this, styleName, {value: builder});
			return builder;
		},
	};
}

source_styles.visible = {
	get() {
		const builder = createBuilder(this, this[STYLER], true);
		Object.defineProperty(this, 'visible', {value: builder});
		return builder;
	},
};

const getModelAnsi = (model, level, type, ...arguments_) => {
	if (model === 'rgb') {
		if (level === 'ansi16m') {
			return ansi_styles[type].ansi16m(...arguments_);
		}

		if (level === 'ansi256') {
			return ansi_styles[type].ansi256(ansi_styles.rgbToAnsi256(...arguments_));
		}

		return ansi_styles[type].ansi(ansi_styles.rgbToAnsi(...arguments_));
	}

	if (model === 'hex') {
		return getModelAnsi('rgb', level, type, ...ansi_styles.hexToRgb(...arguments_));
	}

	return ansi_styles[type][model](...arguments_);
};

const usedModels = ['rgb', 'hex', 'ansi256'];

for (const model of usedModels) {
	source_styles[model] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(getModelAnsi(model, levelMapping[level], 'color', ...arguments_), ansi_styles.color.close, this[STYLER]);
				return createBuilder(this, styler, this[IS_EMPTY]);
			};
		},
	};

	const bgModel = 'bg' + model[0].toUpperCase() + model.slice(1);
	source_styles[bgModel] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(getModelAnsi(model, levelMapping[level], 'bgColor', ...arguments_), ansi_styles.bgColor.close, this[STYLER]);
				return createBuilder(this, styler, this[IS_EMPTY]);
			};
		},
	};
}

const proto = Object.defineProperties(() => {}, {
	...source_styles,
	level: {
		enumerable: true,
		get() {
			return this[GENERATOR].level;
		},
		set(level) {
			this[GENERATOR].level = level;
		},
	},
});

const createStyler = (open, close, parent) => {
	let openAll;
	let closeAll;
	if (parent === undefined) {
		openAll = open;
		closeAll = close;
	} else {
		openAll = parent.openAll + open;
		closeAll = close + parent.closeAll;
	}

	return {
		open,
		close,
		openAll,
		closeAll,
		parent,
	};
};

const createBuilder = (self, _styler, _isEmpty) => {
	// Single argument is hot path, implicit coercion is faster than anything
	// eslint-disable-next-line no-implicit-coercion
	const builder = (...arguments_) => applyStyle(builder, (arguments_.length === 1) ? ('' + arguments_[0]) : arguments_.join(' '));

	// We alter the prototype because we must return a function, but there is
	// no way to create a function with a different prototype
	Object.setPrototypeOf(builder, proto);

	builder[GENERATOR] = self;
	builder[STYLER] = _styler;
	builder[IS_EMPTY] = _isEmpty;

	return builder;
};

const applyStyle = (self, string) => {
	if (self.level <= 0 || !string) {
		return self[IS_EMPTY] ? '' : string;
	}

	let styler = self[STYLER];

	if (styler === undefined) {
		return string;
	}

	const {openAll, closeAll} = styler;
	if (string.includes('\u001B')) {
		while (styler !== undefined) {
			// Replace any instances already present with a re-opening code
			// otherwise only the part of the string until said closing code
			// will be colored, and the rest will simply be 'plain'.
			string = stringReplaceAll(string, styler.close, styler.open);

			styler = styler.parent;
		}
	}

	// We can move both next actions out of loop, because remaining actions in loop won't have
	// any/visible effect on parts we add here. Close the styling before a linebreak and reopen
	// after next line to fix a bleed issue on macOS: https://github.com/chalk/chalk/pull/92
	const lfIndex = string.indexOf('\n');
	if (lfIndex !== -1) {
		string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
	}

	return openAll + string + closeAll;
};

Object.defineProperties(createChalk.prototype, source_styles);

const chalk = createChalk();
const chalkStderr = createChalk({level: stderrColor ? stderrColor.level : 0});





/* harmony default export */ const source = (chalk);

// EXTERNAL MODULE: ../node_modules/env-var/env-var.js
var env_var = __nccwpck_require__(789);
var env_var_default = /*#__PURE__*/__nccwpck_require__.n(env_var);
;// CONCATENATED MODULE: ./src/config.js


/* harmony default export */ const config = ({
  apiUrl: env_var_default().get("INPUT_API_URL").required().asString(),
  repository: env_var_default().get("INPUT_REPOSITORY").required().asString(),
  branch: env_var_default().get("INPUT_BRANCH").required().asString(),
  testSuite: env_var_default().get("INPUT_TEST_SUITE").required().asString(),
  testFileType: env_var_default().get("INPUT_TEST_FILE_TYPE").required().asString(),
  commitHash: env_var_default().get("INPUT_COMMIT_HASH").required().asString(),
  jobId: env_var_default().get("INPUT_JOB_ID").required().asString(),
  files: env_var_default().get("INPUT_FILES").required().asString(),
  runAttempt: env_var_default().get("GITHUB_RUN_ATTEMPT").asString(),
  pushToken: env_var_default().get("INPUT_DASHBOARD_PUSH_TOKEN").required().asString(),
});

;// CONCATENATED MODULE: ./src/index.js





const print = (message = "") => process.stdout.write(message);

const println = (message = "") => print(message + "\n");

function getUploadUrl() {
  const params = new URLSearchParams({
    testSuite: config.testSuite,
    testFileType: config.testFileType,
    commitHash: config.commitHash,
    jobId: config.jobId,
    token: config.pushToken,
    runAttempt: config.runAttempt,
  });

  const { apiUrl, repository, branch } = config;

  return `${apiUrl}/${repository}/${branch}?${params.toString()}`;
}

function uploadFile(url, file) {
  const stdout = (0,external_node_child_process_namespaceObject.execSync)(
    `curl -X POST --retry 3 --retry-delay 5 -F "testFile=@${file}" "${url}"`,
    { encoding: "utf8" },
  );

  let response;
  try {
    response = JSON.parse(stdout);
  } catch (error) {
    throw new Error(
      `API response does not seem to be a valid JSON: ${error.message}`,
    );
  }

  if (response.success === false) {
    throw new Error(`API response reason: ${response.reason}`);
  }
}

function run() {
  const uploadUrl = getUploadUrl();

  const files = external_node_fs_default().globSync(config.files);

  if (files.length === 0) {
    throw new Error(`No files found to upload matching ${config.files}`);
  }

  let uploaded = 0,
    failed = 0;

  println(source.bgGreen(`Files to upload: ${files.length}\n`));

  files.forEach((file) => {
    print(`Uploading file ${file}... `);

    try {
      uploadFile(uploadUrl, file);
      println(source.green("[OK]"));
      uploaded++;
    } catch (error) {
      println(`${source.red("[FAILED]")} ${source.dim(error.message)}`);
      failed++;
    } finally {
      (0,external_node_child_process_namespaceObject.execSync)("sleep 2");
    }
  });

  return {
    uploaded,
    failed,
  };
}

function getConfig() {
  return [
    source.bgGreen("Run configuration:"),
    `  API URL: ${source.dim(config.apiUrl)}`,
    `  Repository: ${source.dim(config.repository)}`,
    `  Branch: ${source.dim(config.branch)}`,
    `  Test suite: ${source.dim(config.testSuite)}`,
    `  Test file type: ${source.dim(config.testFileType)}`,
    `  Commit hash: ${source.dim(config.commitHash)}`,
    `  Job ID: ${source.dim(config.jobId)}`,
    `  Files: ${source.dim(config.files)}`,
    `  Run Attempt: ${source.dim(config.runAttempt)}`,
  ];
}

function getSummary(uploaded, failed) {
  if (uploaded === 0) {
    return [source.red(`All ${failed} file(s) failed to upload`)];
  }

  if (failed === 0) {
    return [source.green("All done, full success!")];
  }

  return [
    source.green(`Uploaded files: ${uploaded}`),
    source.red(`NOT uploaded files: ${failed}`),
  ];
}

try {
  getConfig().forEach((line) => println(line));
  println();

  const { uploaded, failed } = run();

  println();
  getSummary(uploaded, failed).forEach((line) => println(line));

  process.exit(0);
} catch (error) {
  println(source.bgRed("Script failed!"));
  println(source.dim(error.message));
  process.exit(1);
}

})();

module.exports = __webpack_exports__;
/******/ })()
;