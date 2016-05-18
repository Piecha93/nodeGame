(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;
        if (!u && a)return a(o, !0);
        if (i)return i(o, !0);
        var f = new Error("Cannot find module '" + o + "'");
        throw f.code = "MODULE_NOT_FOUND", f
      }
      var l = n[o] = {exports: {}};
      t[o][0].call(l.exports, function (e) {
        var n = t[o][1][e];
        return s(n ? n : e)
      }, l, l.exports, e, t, n, r)
    }
    return n[o].exports
  }

  var i = typeof require == "function" && require;
  for (var o = 0; o < r.length; o++)s(r[o]);
  return s
})({
  1: [function (require, module, exports) {

  }, {}],
  2: [function (require, module, exports) {
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
    var util = require('util/');

    var pSlice = Array.prototype.slice;
    var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

    var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

    assert.AssertionError = function AssertionError(options) {
      this.name = 'AssertionError';
      this.actual = options.actual;
      this.expected = options.expected;
      this.operator = options.operator;
      if (options.message) {
        this.message = options.message;
        this.generatedMessage = false;
      } else {
        this.message = getMessage(this);
        this.generatedMessage = true;
      }
      var stackStartFunction = options.stackStartFunction || fail;

      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, stackStartFunction);
      }
      else {
        // non v8 browsers so we can have a stacktrace
        var err = new Error();
        if (err.stack) {
          var out = err.stack;

          // try to strip useless frames
          var fn_name = stackStartFunction.name;
          var idx = out.indexOf('\n' + fn_name);
          if (idx >= 0) {
            // once we have located the function frame
            // we need to strip out everything before it (and its line)
            var next_line = out.indexOf('\n', idx + 1);
            out = out.substring(next_line + 1);
          }

          this.stack = out;
    }
      }
    };

// assert.AssertionError instanceof Error
    util.inherits(assert.AssertionError, Error);

    function replacer(key, value) {
      if (util.isUndefined(value)) {
        return '' + value;
      }
      if (util.isNumber(value) && !isFinite(value)) {
        return value.toString();
      }
      if (util.isFunction(value) || util.isRegExp(value)) {
        return value.toString();
      }
      return value;
    }

    function truncate(s, n) {
      if (util.isString(s)) {
        return s.length < n ? s : s.slice(0, n);
      } else {
        return s;
      }
    }

    function getMessage(self) {
      return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
          self.operator + ' ' +
          truncate(JSON.stringify(self.expected, replacer), 128);
    }

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

    function fail(actual, expected, message, operator, stackStartFunction) {
      throw new assert.AssertionError({
        message: message,
        actual: actual,
        expected: expected,
        operator: operator,
        stackStartFunction: stackStartFunction
      });
    }

// EXTENSION! allows for well behaved errors defined elsewhere.
    assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

    function ok(value, message) {
      if (!value) fail(value, true, message, '==', assert.ok);
    }

    assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

    assert.equal = function equal(actual, expected, message) {
      if (actual != expected) fail(actual, expected, message, '==', assert.equal);
    };

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

    assert.notEqual = function notEqual(actual, expected, message) {
      if (actual == expected) {
        fail(actual, expected, message, '!=', assert.notEqual);
      }
    };

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

    assert.deepEqual = function deepEqual(actual, expected, message) {
      if (!_deepEqual(actual, expected)) {
        fail(actual, expected, message, 'deepEqual', assert.deepEqual);
      }
    };

    function _deepEqual(actual, expected) {
      // 7.1. All identical values are equivalent, as determined by ===.
      if (actual === expected) {
        return true;

      } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
        if (actual.length != expected.length) return false;

        for (var i = 0; i < actual.length; i++) {
          if (actual[i] !== expected[i]) return false;
        }

        return true;

        // 7.2. If the expected value is a Date object, the actual value is
        // equivalent if it is also a Date object that refers to the same time.
      } else if (util.isDate(actual) && util.isDate(expected)) {
        return actual.getTime() === expected.getTime();

        // 7.3 If the expected value is a RegExp object, the actual value is
        // equivalent if it is also a RegExp object with the same source and
        // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
      } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
        return actual.source === expected.source &&
            actual.global === expected.global &&
            actual.multiline === expected.multiline &&
            actual.lastIndex === expected.lastIndex &&
            actual.ignoreCase === expected.ignoreCase;

        // 7.4. Other pairs that do not both pass typeof value == 'object',
        // equivalence is determined by ==.
      } else if (!util.isObject(actual) && !util.isObject(expected)) {
        return actual == expected;

        // 7.5 For all other Object pairs, including Array objects, equivalence is
        // determined by having the same number of owned properties (as verified
        // with Object.prototype.hasOwnProperty.call), the same set of keys
        // (although not necessarily the same order), equivalent values for every
        // corresponding key, and an identical 'prototype' property. Note: this
        // accounts for both named and indexed properties on Arrays.
      } else {
        return objEquiv(actual, expected);
      }
    }

    function isArguments(object) {
      return Object.prototype.toString.call(object) == '[object Arguments]';
    }

    function objEquiv(a, b) {
      if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
        return false;
      // an identical 'prototype' property.
      if (a.prototype !== b.prototype) return false;
      // if one is a primitive, the other must be same
      if (util.isPrimitive(a) || util.isPrimitive(b)) {
        return a === b;
      }
      var aIsArgs = isArguments(a),
          bIsArgs = isArguments(b);
      if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
        return false;
      if (aIsArgs) {
        a = pSlice.call(a);
        b = pSlice.call(b);
        return _deepEqual(a, b);
      }
      var ka = objectKeys(a),
          kb = objectKeys(b),
          key, i;
      // having the same number of owned properties (keys incorporates
      // hasOwnProperty)
      if (ka.length != kb.length)
        return false;
      //the same set of keys (although not necessarily the same order),
      ka.sort();
      kb.sort();
      //~~~cheap key test
      for (i = ka.length - 1; i >= 0; i--) {
        if (ka[i] != kb[i])
          return false;
      }
      //equivalent values for every corresponding key, and
      //~~~possibly expensive deep test
      for (i = ka.length - 1; i >= 0; i--) {
        key = ka[i];
        if (!_deepEqual(a[key], b[key])) return false;
      }
      return true;
    }

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

    assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
      if (_deepEqual(actual, expected)) {
        fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
      }
    };

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

    assert.strictEqual = function strictEqual(actual, expected, message) {
      if (actual !== expected) {
        fail(actual, expected, message, '===', assert.strictEqual);
      }
    };

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

    assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
      if (actual === expected) {
        fail(actual, expected, message, '!==', assert.notStrictEqual);
      }
    };

    function expectedException(actual, expected) {
      if (!actual || !expected) {
        return false;
      }

      if (Object.prototype.toString.call(expected) == '[object RegExp]') {
        return expected.test(actual);
      } else if (actual instanceof expected) {
        return true;
      } else if (expected.call({}, actual) === true) {
        return true;
      }

      return false;
    }

    function _throws(shouldThrow, block, expected, message) {
      var actual;

      if (util.isString(expected)) {
        message = expected;
        expected = null;
      }

      try {
        block();
      } catch (e) {
        actual = e;
      }

      message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
          (message ? ' ' + message : '.');

      if (shouldThrow && !actual) {
        fail(actual, expected, 'Missing expected exception' + message);
      }

      if (!shouldThrow && expectedException(actual, expected)) {
        fail(actual, expected, 'Got unwanted exception' + message);
      }

      if ((shouldThrow && actual && expected && !expectedException(actual, expected)) || (!shouldThrow && actual)) {
        throw actual;
      }
    }

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

    assert.throws = function (block, /*optional*/error, /*optional*/message) {
      _throws.apply(this, [true].concat(pSlice.call(arguments)));
    };

// EXTENSION! This is annoying to write outside this module.
    assert.doesNotThrow = function (block, /*optional*/message) {
      _throws.apply(this, [false].concat(pSlice.call(arguments)));
    };

    assert.ifError = function (err) {
      if (err) {
        throw err;
      }
    };

    var objectKeys = Object.keys || function (obj) {
          var keys = [];
          for (var key in obj) {
            if (hasOwn.call(obj, key)) keys.push(key);
          }
          return keys;
        };

  }, {"util/": 43}],
  3: [function (require, module, exports) {
    arguments[4][1][0].apply(exports, arguments)
  }, {"dup": 1}],
  4: [function (require, module, exports) {
    'use strict';


    var TYPED_OK = (typeof Uint8Array !== 'undefined') &&
        (typeof Uint16Array !== 'undefined') &&
        (typeof Int32Array !== 'undefined');


    exports.assign = function (obj /*from1, from2, from3, ...*/) {
      var sources = Array.prototype.slice.call(arguments, 1);
      while (sources.length) {
        var source = sources.shift();
        if (!source) {
          continue;
        }

        if (typeof source !== 'object') {
          throw new TypeError(source + 'must be non-object');
        }

        for (var p in source) {
          if (source.hasOwnProperty(p)) {
            obj[p] = source[p];
      }
        }
      }

      return obj;
    };


// reduce buffer size, avoiding mem copy
    exports.shrinkBuf = function (buf, size) {
      if (buf.length === size) {
        return buf;
      }
      if (buf.subarray) {
        return buf.subarray(0, size);
      }
      buf.length = size;
      return buf;
    };


    var fnTyped = {
      arraySet: function (dest, src, src_offs, len, dest_offs) {
        if (src.subarray && dest.subarray) {
          dest.set(src.subarray(src_offs, src_offs + len), dest_offs);
          return;
        }
        // Fallback to ordinary array
        for (var i = 0; i < len; i++) {
          dest[dest_offs + i] = src[src_offs + i];
        }
      },
      // Join array of chunks to single array.
      flattenChunks: function (chunks) {
        var i, l, len, pos, chunk, result;

        // calculate data length
        len = 0;
        for (i = 0, l = chunks.length; i < l; i++) {
          len += chunks[i].length;
        }

        // join chunks
        result = new Uint8Array(len);
        pos = 0;
        for (i = 0, l = chunks.length; i < l; i++) {
          chunk = chunks[i];
          result.set(chunk, pos);
          pos += chunk.length;
        }

        return result;
      }
    };

    var fnUntyped = {
      arraySet: function (dest, src, src_offs, len, dest_offs) {
        for (var i = 0; i < len; i++) {
          dest[dest_offs + i] = src[src_offs + i];
        }
      },
      // Join array of chunks to single array.
      flattenChunks: function (chunks) {
        return [].concat.apply([], chunks);
      }
    };


// Enable/Disable typed arrays use, for testing
//
    exports.setTyped = function (on) {
      if (on) {
        exports.Buf8 = Uint8Array;
        exports.Buf16 = Uint16Array;
        exports.Buf32 = Int32Array;
        exports.assign(exports, fnTyped);
      } else {
        exports.Buf8 = Array;
        exports.Buf16 = Array;
        exports.Buf32 = Array;
        exports.assign(exports, fnUntyped);
      }
    };

    exports.setTyped(TYPED_OK);

  }, {}],
  5: [function (require, module, exports) {
    'use strict';

// Note: adler32 takes 12% for level 0 and 2% for level 6.
// It doesn't worth to make additional optimizationa as in original.
// Small size is preferable.

    function adler32(adler, buf, len, pos) {
      var s1 = (adler & 0xffff) | 0,
          s2 = ((adler >>> 16) & 0xffff) | 0,
          n = 0;

      while (len !== 0) {
        // Set limit ~ twice less than 5552, to keep
        // s2 in 31-bits, because we force signed ints.
        // in other case %= will fail.
        n = len > 2000 ? 2000 : len;
        len -= n;

        do {
          s1 = (s1 + buf[pos++]) | 0;
          s2 = (s2 + s1) | 0;
        } while (--n);

        s1 %= 65521;
        s2 %= 65521;
      }

      return (s1 | (s2 << 16)) | 0;
    }


    module.exports = adler32;

  }, {}],
  6: [function (require, module, exports) {
    module.exports = {

      /* Allowed flush values; see deflate() and inflate() below for details */
      Z_NO_FLUSH: 0,
      Z_PARTIAL_FLUSH: 1,
      Z_SYNC_FLUSH: 2,
      Z_FULL_FLUSH: 3,
      Z_FINISH: 4,
      Z_BLOCK: 5,
      Z_TREES: 6,

      /* Return codes for the compression/decompression functions. Negative values
       * are errors, positive values are used for special but normal events.
       */
      Z_OK: 0,
      Z_STREAM_END: 1,
      Z_NEED_DICT: 2,
      Z_ERRNO: -1,
      Z_STREAM_ERROR: -2,
      Z_DATA_ERROR: -3,
      //Z_MEM_ERROR:     -4,
      Z_BUF_ERROR: -5,
      //Z_VERSION_ERROR: -6,

      /* compression levels */
      Z_NO_COMPRESSION: 0,
      Z_BEST_SPEED: 1,
      Z_BEST_COMPRESSION: 9,
      Z_DEFAULT_COMPRESSION: -1,


      Z_FILTERED: 1,
      Z_HUFFMAN_ONLY: 2,
      Z_RLE: 3,
      Z_FIXED: 4,
      Z_DEFAULT_STRATEGY: 0,

      /* Possible values of the data_type field (though see inflate()) */
      Z_BINARY: 0,
      Z_TEXT: 1,
      //Z_ASCII:                1, // = Z_TEXT (deprecated)
      Z_UNKNOWN: 2,

      /* The deflate compression method */
      Z_DEFLATED: 8
      //Z_NULL:                 null // Use -1 or null inline, depending on var type
    };

  }, {}],
  7: [function (require, module, exports) {
    'use strict';

// Note: we can't get significant speed boost here.
// So write code to minimize size - no pregenerated tables
// and array tools dependencies.


// Use ordinary array, since untyped makes no boost here
    function makeTable() {
      var c, table = [];

      for (var n = 0; n < 256; n++) {
        c = n;
        for (var k = 0; k < 8; k++) {
          c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
        table[n] = c;
      }

      return table;
    }

// Create table on load. Just 255 signed longs. Not a problem.
    var crcTable = makeTable();


    function crc32(crc, buf, len, pos) {
      var t = crcTable,
          end = pos + len;

      crc = crc ^ (-1);

      for (var i = pos; i < end; i++) {
        crc = (crc >>> 8) ^ t[(crc ^ buf[i]) & 0xFF];
      }

      return (crc ^ (-1)); // >>> 0;
    }


    module.exports = crc32;

  }, {}],
  8: [function (require, module, exports) {
    'use strict';

    var utils = require('../utils/common');
    var trees = require('./trees');
    var adler32 = require('./adler32');
    var crc32 = require('./crc32');
    var msg = require('./messages');

    /* Public constants ==========================================================*/
    /* ===========================================================================*/


    /* Allowed flush values; see deflate() and inflate() below for details */
    var Z_NO_FLUSH = 0;
    var Z_PARTIAL_FLUSH = 1;
//var Z_SYNC_FLUSH    = 2;
    var Z_FULL_FLUSH = 3;
    var Z_FINISH = 4;
    var Z_BLOCK = 5;
//var Z_TREES         = 6;


    /* Return codes for the compression/decompression functions. Negative values
     * are errors, positive values are used for special but normal events.
     */
    var Z_OK = 0;
    var Z_STREAM_END = 1;
//var Z_NEED_DICT     = 2;
//var Z_ERRNO         = -1;
    var Z_STREAM_ERROR = -2;
    var Z_DATA_ERROR = -3;
//var Z_MEM_ERROR     = -4;
    var Z_BUF_ERROR = -5;
//var Z_VERSION_ERROR = -6;


    /* compression levels */
//var Z_NO_COMPRESSION      = 0;
//var Z_BEST_SPEED          = 1;
//var Z_BEST_COMPRESSION    = 9;
    var Z_DEFAULT_COMPRESSION = -1;


    var Z_FILTERED = 1;
    var Z_HUFFMAN_ONLY = 2;
    var Z_RLE = 3;
    var Z_FIXED = 4;
    var Z_DEFAULT_STRATEGY = 0;

    /* Possible values of the data_type field (though see inflate()) */
//var Z_BINARY              = 0;
//var Z_TEXT                = 1;
//var Z_ASCII               = 1; // = Z_TEXT
    var Z_UNKNOWN = 2;


    /* The deflate compression method */
    var Z_DEFLATED = 8;

    /*============================================================================*/


    var MAX_MEM_LEVEL = 9;
    /* Maximum value for memLevel in deflateInit2 */
    var MAX_WBITS = 15;
    /* 32K LZ77 window */
    var DEF_MEM_LEVEL = 8;


    var LENGTH_CODES = 29;
    /* number of length codes, not counting the special END_BLOCK code */
    var LITERALS = 256;
    /* number of literal bytes 0..255 */
    var L_CODES = LITERALS + 1 + LENGTH_CODES;
    /* number of Literal or Length codes, including the END_BLOCK code */
    var D_CODES = 30;
    /* number of distance codes */
    var BL_CODES = 19;
    /* number of codes used to transfer the bit lengths */
    var HEAP_SIZE = 2 * L_CODES + 1;
    /* maximum heap size */
    var MAX_BITS = 15;
    /* All codes must not exceed MAX_BITS bits */

    var MIN_MATCH = 3;
    var MAX_MATCH = 258;
    var MIN_LOOKAHEAD = (MAX_MATCH + MIN_MATCH + 1);

    var PRESET_DICT = 0x20;

    var INIT_STATE = 42;
    var EXTRA_STATE = 69;
    var NAME_STATE = 73;
    var COMMENT_STATE = 91;
    var HCRC_STATE = 103;
    var BUSY_STATE = 113;
    var FINISH_STATE = 666;

    var BS_NEED_MORE = 1;
    /* block not completed, need more input or more output */
    var BS_BLOCK_DONE = 2;
    /* block flush performed */
    var BS_FINISH_STARTED = 3;
    /* finish started, need only more output at next deflate */
    var BS_FINISH_DONE = 4;
    /* finish done, accept no more input or output */

    var OS_CODE = 0x03; // Unix :) . Don't detect, use this default.

    function err(strm, errorCode) {
      strm.msg = msg[errorCode];
      return errorCode;
    }

    function rank(f) {
      return ((f) << 1) - ((f) > 4 ? 9 : 0);
    }

    function zero(buf) {
      var len = buf.length;
      while (--len >= 0) {
        buf[len] = 0;
      }
    }


    /* =========================================================================
     * Flush as much pending output as possible. All deflate() output goes
     * through this function so some applications may wish to modify it
     * to avoid allocating a large strm->output buffer and copying into it.
     * (See also read_buf()).
     */
    function flush_pending(strm) {
      var s = strm.state;

      //_tr_flush_bits(s);
      var len = s.pending;
      if (len > strm.avail_out) {
        len = strm.avail_out;
      }
      if (len === 0) {
        return;
      }

      utils.arraySet(strm.output, s.pending_buf, s.pending_out, len, strm.next_out);
      strm.next_out += len;
      s.pending_out += len;
      strm.total_out += len;
      strm.avail_out -= len;
      s.pending -= len;
      if (s.pending === 0) {
        s.pending_out = 0;
      }
    }


    function flush_block_only(s, last) {
      trees._tr_flush_block(s, (s.block_start >= 0 ? s.block_start : -1), s.strstart - s.block_start, last);
      s.block_start = s.strstart;
      flush_pending(s.strm);
    }


    function put_byte(s, b) {
      s.pending_buf[s.pending++] = b;
    }


    /* =========================================================================
     * Put a short in the pending buffer. The 16-bit value is put in MSB order.
     * IN assertion: the stream state is correct and there is enough room in
     * pending_buf.
     */
    function putShortMSB(s, b) {
//  put_byte(s, (Byte)(b >> 8));
//  put_byte(s, (Byte)(b & 0xff));
      s.pending_buf[s.pending++] = (b >>> 8) & 0xff;
      s.pending_buf[s.pending++] = b & 0xff;
    }


    /* ===========================================================================
     * Read a new buffer from the current input stream, update the adler32
     * and total number of bytes read.  All deflate() input goes through
     * this function so some applications may wish to modify it to avoid
     * allocating a large strm->input buffer and copying from it.
     * (See also flush_pending()).
     */
    function read_buf(strm, buf, start, size) {
      var len = strm.avail_in;

      if (len > size) {
        len = size;
      }
      if (len === 0) {
        return 0;
      }

      strm.avail_in -= len;

      utils.arraySet(buf, strm.input, strm.next_in, len, start);
      if (strm.state.wrap === 1) {
        strm.adler = adler32(strm.adler, buf, len, start);
      }

      else if (strm.state.wrap === 2) {
        strm.adler = crc32(strm.adler, buf, len, start);
      }

      strm.next_in += len;
      strm.total_in += len;

      return len;
    }


    /* ===========================================================================
     * Set match_start to the longest match starting at the given string and
     * return its length. Matches shorter or equal to prev_length are discarded,
     * in which case the result is equal to prev_length and match_start is
     * garbage.
     * IN assertions: cur_match is the head of the hash chain for the current
     *   string (strstart) and its distance is <= MAX_DIST, and prev_length >= 1
     * OUT assertion: the match length is not greater than s->lookahead.
     */
    function longest_match(s, cur_match) {
      var chain_length = s.max_chain_length;
      /* max hash chain length */
      var scan = s.strstart;
      /* current string */
      var match;
      /* matched string */
      var len;
      /* length of current match */
      var best_len = s.prev_length;
      /* best match length so far */
      var nice_match = s.nice_match;
      /* stop if match long enough */
      var limit = (s.strstart > (s.w_size - MIN_LOOKAHEAD)) ?
      s.strstart - (s.w_size - MIN_LOOKAHEAD) : 0/*NIL*/;

      var _win = s.window; // shortcut

      var wmask = s.w_mask;
      var prev = s.prev;

      /* Stop when cur_match becomes <= limit. To simplify the code,
       * we prevent matches with the string of window index 0.
       */

      var strend = s.strstart + MAX_MATCH;
      var scan_end1 = _win[scan + best_len - 1];
      var scan_end = _win[scan + best_len];

      /* The code is optimized for HASH_BITS >= 8 and MAX_MATCH-2 multiple of 16.
       * It is easy to get rid of this optimization if necessary.
       */
      // Assert(s->hash_bits >= 8 && MAX_MATCH == 258, "Code too clever");

      /* Do not waste too much time if we already have a good match: */
      if (s.prev_length >= s.good_match) {
        chain_length >>= 2;
      }
      /* Do not look for matches beyond the end of the input. This is necessary
       * to make deflate deterministic.
       */
      if (nice_match > s.lookahead) {
        nice_match = s.lookahead;
      }

      // Assert((ulg)s->strstart <= s->window_size-MIN_LOOKAHEAD, "need lookahead");

      do {
        // Assert(cur_match < s->strstart, "no future");
        match = cur_match;

        /* Skip to next match if the match length cannot increase
         * or if the match length is less than 2.  Note that the checks below
         * for insufficient lookahead only occur occasionally for performance
         * reasons.  Therefore uninitialized memory will be accessed, and
         * conditional jumps will be made that depend on those values.
         * However the length of the match is limited to the lookahead, so
         * the output of deflate is not affected by the uninitialized values.
         */

        if (_win[match + best_len] !== scan_end ||
            _win[match + best_len - 1] !== scan_end1 ||
            _win[match] !== _win[scan] ||
            _win[++match] !== _win[scan + 1]) {
          continue;
        }

        /* The check at best_len-1 can be removed because it will be made
         * again later. (This heuristic is not always a win.)
         * It is not necessary to compare scan[2] and match[2] since they
         * are always equal when the other bytes match, given that
         * the hash keys are equal and that HASH_BITS >= 8.
         */
        scan += 2;
        match++;
        // Assert(*scan == *match, "match[2]?");

        /* We check for insufficient lookahead only every 8th comparison;
         * the 256th check will be made at strstart+258.
         */
        do {
          /*jshint noempty:false*/
        } while (_win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
        _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
        _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
        _win[++scan] === _win[++match] && _win[++scan] === _win[++match] &&
        scan < strend);

        // Assert(scan <= s->window+(unsigned)(s->window_size-1), "wild scan");

        len = MAX_MATCH - (strend - scan);
        scan = strend - MAX_MATCH;

        if (len > best_len) {
          s.match_start = cur_match;
          best_len = len;
          if (len >= nice_match) {
            break;
      }
          scan_end1 = _win[scan + best_len - 1];
          scan_end = _win[scan + best_len];
    }
      } while ((cur_match = prev[cur_match & wmask]) > limit && --chain_length !== 0);

      if (best_len <= s.lookahead) {
        return best_len;
      }
      return s.lookahead;
    }


    /* ===========================================================================
     * Fill the window when the lookahead becomes insufficient.
     * Updates strstart and lookahead.
     *
     * IN assertion: lookahead < MIN_LOOKAHEAD
     * OUT assertions: strstart <= window_size-MIN_LOOKAHEAD
     *    At least one byte has been read, or avail_in == 0; reads are
     *    performed for at least two bytes (required for the zip translate_eol
     *    option -- not supported here).
     */
    function fill_window(s) {
      var _w_size = s.w_size;
      var p, n, m, more, str;

      //Assert(s->lookahead < MIN_LOOKAHEAD, "already enough lookahead");

      do {
        more = s.window_size - s.lookahead - s.strstart;

        // JS ints have 32 bit, block below not needed
        /* Deal with !@#$% 64K limit: */
        //if (sizeof(int) <= 2) {
        //    if (more == 0 && s->strstart == 0 && s->lookahead == 0) {
        //        more = wsize;
        //
        //  } else if (more == (unsigned)(-1)) {
        //        /* Very unlikely, but possible on 16 bit machine if
        //         * strstart == 0 && lookahead == 1 (input done a byte at time)
        //         */
        //        more--;
        //    }
        //}


        /* If the window is almost full and there is insufficient lookahead,
         * move the upper half to the lower one to make room in the upper half.
         */
        if (s.strstart >= _w_size + (_w_size - MIN_LOOKAHEAD)) {

          utils.arraySet(s.window, s.window, _w_size, _w_size, 0);
          s.match_start -= _w_size;
          s.strstart -= _w_size;
          /* we now have strstart >= MAX_DIST */
          s.block_start -= _w_size;

          /* Slide the hash table (could be avoided with 32 bit values
           at the expense of memory usage). We slide even when level == 0
           to keep the hash table consistent if we switch back to level > 0
           later. (Using level 0 permanently is not an optimal usage of
           zlib, so we don't care about this pathological case.)
           */

          n = s.hash_size;
          p = n;
          do {
            m = s.head[--p];
            s.head[p] = (m >= _w_size ? m - _w_size : 0);
          } while (--n);

          n = _w_size;
          p = n;
          do {
            m = s.prev[--p];
            s.prev[p] = (m >= _w_size ? m - _w_size : 0);
            /* If n is not on any hash chain, prev[n] is garbage but
             * its value will never be used.
         */
          } while (--n);

          more += _w_size;
        }
        if (s.strm.avail_in === 0) {
          break;
        }

        /* If there was no sliding:
         *    strstart <= WSIZE+MAX_DIST-1 && lookahead <= MIN_LOOKAHEAD - 1 &&
         *    more == window_size - lookahead - strstart
         * => more >= window_size - (MIN_LOOKAHEAD-1 + WSIZE + MAX_DIST-1)
         * => more >= window_size - 2*WSIZE + 2
         * In the BIG_MEM or MMAP case (not yet supported),
         *   window_size == input_size + MIN_LOOKAHEAD  &&
         *   strstart + s->lookahead <= input_size => more >= MIN_LOOKAHEAD.
         * Otherwise, window_size == 2*WSIZE so more >= 2.
         * If there was sliding, more >= WSIZE. So in all cases, more >= 2.
         */
        //Assert(more >= 2, "more < 2");
        n = read_buf(s.strm, s.window, s.strstart + s.lookahead, more);
        s.lookahead += n;

        /* Initialize the hash value now that we have some input: */
        if (s.lookahead + s.insert >= MIN_MATCH) {
          str = s.strstart - s.insert;
          s.ins_h = s.window[str];

          /* UPDATE_HASH(s, s->ins_h, s->window[str + 1]); */
          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + 1]) & s.hash_mask;
//#if MIN_MATCH != 3
//        Call update_hash() MIN_MATCH-3 more times
//#endif
          while (s.insert) {
            /* UPDATE_HASH(s, s->ins_h, s->window[str + MIN_MATCH-1]); */
            s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[str + MIN_MATCH - 1]) & s.hash_mask;

            s.prev[str & s.w_mask] = s.head[s.ins_h];
            s.head[s.ins_h] = str;
            str++;
            s.insert--;
            if (s.lookahead + s.insert < MIN_MATCH) {
              break;
        }
          }
        }
        /* If the whole input has less than MIN_MATCH bytes, ins_h is garbage,
         * but this is not important since only literal bytes will be emitted.
         */

      } while (s.lookahead < MIN_LOOKAHEAD && s.strm.avail_in !== 0);

      /* If the WIN_INIT bytes after the end of the current data have never been
       * written, then zero those bytes in order to avoid memory check reports of
       * the use of uninitialized (or uninitialised as Julian writes) bytes by
       * the longest match routines.  Update the high water mark for the next
       * time through here.  WIN_INIT is set to MAX_MATCH since the longest match
       * routines allow scanning to strstart + MAX_MATCH, ignoring lookahead.
       */
//  if (s.high_water < s.window_size) {
//    var curr = s.strstart + s.lookahead;
//    var init = 0;
//
//    if (s.high_water < curr) {
//      /* Previous high water mark below current data -- zero WIN_INIT
//       * bytes or up to end of window, whichever is less.
//       */
//      init = s.window_size - curr;
//      if (init > WIN_INIT)
//        init = WIN_INIT;
//      zmemzero(s->window + curr, (unsigned)init);
//      s->high_water = curr + init;
//    }
//    else if (s->high_water < (ulg)curr + WIN_INIT) {
//      /* High water mark at or above current data, but below current data
//       * plus WIN_INIT -- zero out to current data plus WIN_INIT, or up
//       * to end of window, whichever is less.
//       */
//      init = (ulg)curr + WIN_INIT - s->high_water;
//      if (init > s->window_size - s->high_water)
//        init = s->window_size - s->high_water;
//      zmemzero(s->window + s->high_water, (unsigned)init);
//      s->high_water += init;
//    }
//  }
//
//  Assert((ulg)s->strstart <= s->window_size - MIN_LOOKAHEAD,
//    "not enough room for search");
    }

    /* ===========================================================================
     * Copy without compression as much as possible from the input stream, return
     * the current block state.
     * This function does not insert new strings in the dictionary since
     * uncompressible data is probably not useful. This function is used
     * only for the level=0 compression option.
     * NOTE: this function should be optimized to avoid extra copying from
     * window to pending_buf.
     */
    function deflate_stored(s, flush) {
      /* Stored blocks are limited to 0xffff bytes, pending_buf is limited
       * to pending_buf_size, and each stored block has a 5 byte header:
       */
      var max_block_size = 0xffff;

      if (max_block_size > s.pending_buf_size - 5) {
        max_block_size = s.pending_buf_size - 5;
      }

      /* Copy as much as possible from input to output: */
      for (; ;) {
        /* Fill the window as much as possible: */
        if (s.lookahead <= 1) {

          //Assert(s->strstart < s->w_size+MAX_DIST(s) ||
          //  s->block_start >= (long)s->w_size, "slide too late");
//      if (!(s.strstart < s.w_size + (s.w_size - MIN_LOOKAHEAD) ||
//        s.block_start >= s.w_size)) {
//        throw  new Error("slide too late");
//      }

          fill_window(s);
          if (s.lookahead === 0 && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }

          if (s.lookahead === 0) {
            break;
          }
          /* flush the current block */
        }
        //Assert(s->block_start >= 0L, "block gone");
//    if (s.block_start < 0) throw new Error("block gone");

        s.strstart += s.lookahead;
        s.lookahead = 0;

        /* Emit a stored block if pending_buf will be full: */
        var max_start = s.block_start + max_block_size;

        if (s.strstart === 0 || s.strstart >= max_start) {
          /* strstart == 0 is possible when wraparound on 16-bit machine */
          s.lookahead = s.strstart - max_start;
          s.strstart = max_start;
          /*** FLUSH_BLOCK(s, 0); ***/
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
      }
          /***/


        }
        /* Flush if we may have to slide, otherwise block_start may become
         * negative and the data will be gone:
         */
        if (s.strstart - s.block_start >= (s.w_size - MIN_LOOKAHEAD)) {
          /*** FLUSH_BLOCK(s, 0); ***/
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
      }
          /***/
        }
      }

      s.insert = 0;

      if (flush === Z_FINISH) {
        /*** FLUSH_BLOCK(s, 1); ***/
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
    }
        /***/
        return BS_FINISH_DONE;
      }

      if (s.strstart > s.block_start) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
      return BS_NEED_MORE;
    }
        /***/
      }

      return BS_NEED_MORE;
    }

    /* ===========================================================================
     * Compress as much as possible from the input stream, return the current
     * block state.
     * This function does not perform lazy evaluation of matches and inserts
     * new strings in the dictionary only for unmatched strings or for short
     * matches. It is used only for the fast compression options.
     */
    function deflate_fast(s, flush) {
      var hash_head;
      /* head of the hash chain */
      var bflush;
      /* set if current block must be flushed */

      for (; ;) {
        /* Make sure that we always have enough lookahead, except
         * at the end of the input file. We need MAX_MATCH bytes
         * for the next match, plus MIN_MATCH bytes to insert the
         * string following the next match.
         */
        if (s.lookahead < MIN_LOOKAHEAD) {
          fill_window(s);
          if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
      }
          if (s.lookahead === 0) {
            break;
            /* flush the current block */
      }
    }

        /* Insert the string window[strstart .. strstart+2] in the
         * dictionary, and set hash_head to the head of the hash chain:
     */
        hash_head = 0/*NIL*/;
        if (s.lookahead >= MIN_MATCH) {
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
        }

        /* Find the longest match, discarding those <= prev_length.
         * At this point we have always match_length < MIN_MATCH
         */
        if (hash_head !== 0/*NIL*/ && ((s.strstart - hash_head) <= (s.w_size - MIN_LOOKAHEAD))) {
          /* To simplify the code, we prevent matches with the string
           * of window index 0 (in particular we have to avoid a match
           * of the string with itself at the start of the input file).
           */
          s.match_length = longest_match(s, hash_head);
          /* longest_match() sets match_start */
        }
        if (s.match_length >= MIN_MATCH) {
          // check_match(s, s.strstart, s.match_start, s.match_length); // for debug only

          /*** _tr_tally_dist(s, s.strstart - s.match_start,
           s.match_length - MIN_MATCH, bflush); ***/
          bflush = trees._tr_tally(s, s.strstart - s.match_start, s.match_length - MIN_MATCH);

          s.lookahead -= s.match_length;

          /* Insert new strings in the hash table only if the match length
           * is not too large. This saves time but degrades compression.
           */
          if (s.match_length <= s.max_lazy_match/*max_insert_length*/ && s.lookahead >= MIN_MATCH) {
            s.match_length--;
            /* string at strstart already in table */
            do {
              s.strstart++;
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
              /* strstart never exceeds WSIZE-MAX_MATCH, so there are
               * always MIN_MATCH bytes ahead.
           */
            } while (--s.match_length !== 0);
        s.strstart++;
          } else {
            s.strstart += s.match_length;
            s.match_length = 0;
            s.ins_h = s.window[s.strstart];
            /* UPDATE_HASH(s, s.ins_h, s.window[s.strstart+1]); */
            s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + 1]) & s.hash_mask;

//#if MIN_MATCH != 3
//                Call UPDATE_HASH() MIN_MATCH-3 more times
//#endif
            /* If lookahead < MIN_MATCH, ins_h is garbage, but it does not
             * matter since it will be recomputed at next deflate call.
             */
          }
        } else {
          /* No match, output a literal byte */
          //Tracevv((stderr,"%c", s.window[s.strstart]));
          /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
          bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

          s.lookahead--;
          s.strstart++;
        }
        if (bflush) {
          /*** FLUSH_BLOCK(s, 0); ***/
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
      }
          /***/
    }
      }
      s.insert = ((s.strstart < (MIN_MATCH - 1)) ? s.strstart : MIN_MATCH - 1);
      if (flush === Z_FINISH) {
        /*** FLUSH_BLOCK(s, 1); ***/
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        /***/
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }
      return BS_BLOCK_DONE;
    }

    /* ===========================================================================
     * Same as above, but achieves better compression. We use a lazy
     * evaluation for matches: a match is finally adopted only if there is
     * no better match at the next window position.
     */
    function deflate_slow(s, flush) {
      var hash_head;
      /* head of hash chain */
      var bflush;
      /* set if current block must be flushed */

      var max_insert;

      /* Process the input block. */
      for (; ;) {
        /* Make sure that we always have enough lookahead, except
         * at the end of the input file. We need MAX_MATCH bytes
         * for the next match, plus MIN_MATCH bytes to insert the
         * string following the next match.
         */
        if (s.lookahead < MIN_LOOKAHEAD) {
          fill_window(s);
          if (s.lookahead < MIN_LOOKAHEAD && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
      }
          if (s.lookahead === 0) {
            break;
          }
          /* flush the current block */
    }

        /* Insert the string window[strstart .. strstart+2] in the
         * dictionary, and set hash_head to the head of the hash chain:
     */
        hash_head = 0/*NIL*/;
        if (s.lookahead >= MIN_MATCH) {
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
        }

        /* Find the longest match, discarding those <= prev_length.
         */
        s.prev_length = s.match_length;
        s.prev_match = s.match_start;
        s.match_length = MIN_MATCH - 1;

        if (hash_head !== 0/*NIL*/ && s.prev_length < s.max_lazy_match &&
            s.strstart - hash_head <= (s.w_size - MIN_LOOKAHEAD)/*MAX_DIST(s)*/) {
          /* To simplify the code, we prevent matches with the string
           * of window index 0 (in particular we have to avoid a match
           * of the string with itself at the start of the input file).
           */
          s.match_length = longest_match(s, hash_head);
          /* longest_match() sets match_start */

          if (s.match_length <= 5 &&
              (s.strategy === Z_FILTERED || (s.match_length === MIN_MATCH && s.strstart - s.match_start > 4096/*TOO_FAR*/))) {

            /* If prev_match is also MIN_MATCH, match_start is garbage
             * but we will ignore the current match anyway.
         */
            s.match_length = MIN_MATCH - 1;
          }
        }
        /* If there was a match at the previous step and the current
         * match is not better, output the previous match:
         */
        if (s.prev_length >= MIN_MATCH && s.match_length <= s.prev_length) {
          max_insert = s.strstart + s.lookahead - MIN_MATCH;
          /* Do not insert strings in hash table beyond this. */

          //check_match(s, s.strstart-1, s.prev_match, s.prev_length);

          /***_tr_tally_dist(s, s.strstart - 1 - s.prev_match,
           s.prev_length - MIN_MATCH, bflush);***/
          bflush = trees._tr_tally(s, s.strstart - 1 - s.prev_match, s.prev_length - MIN_MATCH);
          /* Insert in hash table all strings up to the end of the match.
           * strstart-1 and strstart are already inserted. If there is not
           * enough lookahead, the last two strings are not inserted in
           * the hash table.
           */
          s.lookahead -= s.prev_length - 1;
          s.prev_length -= 2;
          do {
            if (++s.strstart <= max_insert) {
          /*** INSERT_STRING(s, s.strstart, hash_head); ***/
          s.ins_h = ((s.ins_h << s.hash_shift) ^ s.window[s.strstart + MIN_MATCH - 1]) & s.hash_mask;
          hash_head = s.prev[s.strstart & s.w_mask] = s.head[s.ins_h];
          s.head[s.ins_h] = s.strstart;
          /***/
        }
          } while (--s.prev_length !== 0);
      s.match_available = 0;
          s.match_length = MIN_MATCH - 1;
          s.strstart++;

          if (bflush) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }

        } else if (s.match_available) {
          /* If there was no match at the previous position, output a
           * single literal. If there was a match but the current match
           * is longer, truncate the previous match to a single literal.
           */
          //Tracevv((stderr,"%c", s->window[s->strstart-1]));
          /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
          bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);

          if (bflush) {
            /*** FLUSH_BLOCK_ONLY(s, 0) ***/
        flush_block_only(s, false);
        /***/
      }
          s.strstart++;
          s.lookahead--;
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
          }
        } else {
          /* There is no previous match to compare with, wait for
           * the next step to decide.
           */
          s.match_available = 1;
          s.strstart++;
          s.lookahead--;
        }
      }
      //Assert (flush != Z_NO_FLUSH, "no flush?");
      if (s.match_available) {
        //Tracevv((stderr,"%c", s->window[s->strstart-1]));
        /*** _tr_tally_lit(s, s.window[s.strstart-1], bflush); ***/
        bflush = trees._tr_tally(s, 0, s.window[s.strstart - 1]);

        s.match_available = 0;
      }
      s.insert = s.strstart < MIN_MATCH - 1 ? s.strstart : MIN_MATCH - 1;
      if (flush === Z_FINISH) {
        /*** FLUSH_BLOCK(s, 1); ***/
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
    }
        /***/
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }

      return BS_BLOCK_DONE;
    }


    /* ===========================================================================
     * For Z_RLE, simply look for runs of bytes, generate matches only of distance
     * one.  Do not maintain a hash table.  (It will be regenerated if this run of
     * deflate switches away from Z_RLE.)
     */
    function deflate_rle(s, flush) {
      var bflush;
      /* set if current block must be flushed */
      var prev;
      /* byte at distance one to match */
      var scan, strend;
      /* scan goes up to strend for length of run */

      var _win = s.window;

      for (; ;) {
        /* Make sure that we always have enough lookahead, except
         * at the end of the input file. We need MAX_MATCH bytes
         * for the longest run, plus one for the unrolled loop.
         */
        if (s.lookahead <= MAX_MATCH) {
          fill_window(s);
          if (s.lookahead <= MAX_MATCH && flush === Z_NO_FLUSH) {
            return BS_NEED_MORE;
          }
          if (s.lookahead === 0) {
            break;
          }
          /* flush the current block */
        }

        /* See how many times the previous byte repeats */
        s.match_length = 0;
        if (s.lookahead >= MIN_MATCH && s.strstart > 0) {
          scan = s.strstart - 1;
          prev = _win[scan];
          if (prev === _win[++scan] && prev === _win[++scan] && prev === _win[++scan]) {
            strend = s.strstart + MAX_MATCH;
            do {
              /*jshint noempty:false*/
            } while (prev === _win[++scan] && prev === _win[++scan] &&
            prev === _win[++scan] && prev === _win[++scan] &&
            prev === _win[++scan] && prev === _win[++scan] &&
            prev === _win[++scan] && prev === _win[++scan] &&
            scan < strend);
            s.match_length = MAX_MATCH - (strend - scan);
            if (s.match_length > s.lookahead) {
              s.match_length = s.lookahead;
        }
      }
          //Assert(scan <= s->window+(uInt)(s->window_size-1), "wild scan");
    }

        /* Emit match if have run of MIN_MATCH or longer, else emit literal */
        if (s.match_length >= MIN_MATCH) {
          //check_match(s, s.strstart, s.strstart - 1, s.match_length);

          /*** _tr_tally_dist(s, 1, s.match_length - MIN_MATCH, bflush); ***/
          bflush = trees._tr_tally(s, 1, s.match_length - MIN_MATCH);

          s.lookahead -= s.match_length;
          s.strstart += s.match_length;
          s.match_length = 0;
        } else {
          /* No match, output a literal byte */
          //Tracevv((stderr,"%c", s->window[s->strstart]));
          /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
          bflush = trees._tr_tally(s, 0, s.window[s.strstart]);

          s.lookahead--;
          s.strstart++;
        }
        if (bflush) {
          /*** FLUSH_BLOCK(s, 0); ***/
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
      }
          /***/
    }
      }
      s.insert = 0;
      if (flush === Z_FINISH) {
        /*** FLUSH_BLOCK(s, 1); ***/
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        /***/
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }
      return BS_BLOCK_DONE;
    }

    /* ===========================================================================
     * For Z_HUFFMAN_ONLY, do not look for matches.  Do not maintain a hash table.
     * (It will be regenerated if this run of deflate switches away from Huffman.)
     */
    function deflate_huff(s, flush) {
      var bflush;
      /* set if current block must be flushed */

      for (; ;) {
        /* Make sure that we have a literal to write. */
        if (s.lookahead === 0) {
          fill_window(s);
          if (s.lookahead === 0) {
            if (flush === Z_NO_FLUSH) {
          return BS_NEED_MORE;
        }
            break;
            /* flush the current block */
      }
    }

        /* Output a literal byte */
        s.match_length = 0;
        //Tracevv((stderr,"%c", s->window[s->strstart]));
        /*** _tr_tally_lit(s, s.window[s.strstart], bflush); ***/
        bflush = trees._tr_tally(s, 0, s.window[s.strstart]);
        s.lookahead--;
        s.strstart++;
        if (bflush) {
          /*** FLUSH_BLOCK(s, 0); ***/
          flush_block_only(s, false);
          if (s.strm.avail_out === 0) {
            return BS_NEED_MORE;
      }
          /***/
    }
      }
      s.insert = 0;
      if (flush === Z_FINISH) {
        /*** FLUSH_BLOCK(s, 1); ***/
        flush_block_only(s, true);
        if (s.strm.avail_out === 0) {
          return BS_FINISH_STARTED;
        }
        /***/
        return BS_FINISH_DONE;
      }
      if (s.last_lit) {
        /*** FLUSH_BLOCK(s, 0); ***/
        flush_block_only(s, false);
        if (s.strm.avail_out === 0) {
          return BS_NEED_MORE;
        }
        /***/
      }
      return BS_BLOCK_DONE;
    }

    /* Values for max_lazy_match, good_match and max_chain_length, depending on
     * the desired pack level (0..9). The values given below have been tuned to
     * exclude worst case performance for pathological files. Better values may be
     * found for specific files.
     */
    var Config = function (good_length, max_lazy, nice_length, max_chain, func) {
      this.good_length = good_length;
      this.max_lazy = max_lazy;
      this.nice_length = nice_length;
      this.max_chain = max_chain;
      this.func = func;
    };

    var configuration_table;

    configuration_table = [
      /*      good lazy nice chain */
      new Config(0, 0, 0, 0, deflate_stored), /* 0 store only */
      new Config(4, 4, 8, 4, deflate_fast), /* 1 max speed, no lazy matches */
      new Config(4, 5, 16, 8, deflate_fast), /* 2 */
      new Config(4, 6, 32, 32, deflate_fast), /* 3 */

      new Config(4, 4, 16, 16, deflate_slow), /* 4 lazy matches */
      new Config(8, 16, 32, 32, deflate_slow), /* 5 */
      new Config(8, 16, 128, 128, deflate_slow), /* 6 */
      new Config(8, 32, 128, 256, deflate_slow), /* 7 */
      new Config(32, 128, 258, 1024, deflate_slow), /* 8 */
      new Config(32, 258, 258, 4096, deflate_slow)     /* 9 max compression */
    ];


    /* ===========================================================================
     * Initialize the "longest match" routines for a new zlib stream
     */
    function lm_init(s) {
      s.window_size = 2 * s.w_size;

      /*** CLEAR_HASH(s); ***/
      zero(s.head); // Fill with NIL (= 0);

      /* Set the default configuration parameters:
       */
      s.max_lazy_match = configuration_table[s.level].max_lazy;
      s.good_match = configuration_table[s.level].good_length;
      s.nice_match = configuration_table[s.level].nice_length;
      s.max_chain_length = configuration_table[s.level].max_chain;

      s.strstart = 0;
      s.block_start = 0;
      s.lookahead = 0;
      s.insert = 0;
      s.match_length = s.prev_length = MIN_MATCH - 1;
      s.match_available = 0;
      s.ins_h = 0;
    }


    function DeflateState() {
      this.strm = null;
      /* pointer back to this zlib stream */
      this.status = 0;
      /* as the name implies */
      this.pending_buf = null;
      /* output still pending */
      this.pending_buf_size = 0;
      /* size of pending_buf */
      this.pending_out = 0;
      /* next pending byte to output to the stream */
      this.pending = 0;
      /* nb of bytes in the pending buffer */
      this.wrap = 0;
      /* bit 0 true for zlib, bit 1 true for gzip */
      this.gzhead = null;
      /* gzip header information to write */
      this.gzindex = 0;
      /* where in extra, name, or comment */
      this.method = Z_DEFLATED;
      /* can only be DEFLATED */
      this.last_flush = -1;
      /* value of flush param for previous deflate call */

      this.w_size = 0;
      /* LZ77 window size (32K by default) */
      this.w_bits = 0;
      /* log2(w_size)  (8..16) */
      this.w_mask = 0;
      /* w_size - 1 */

      this.window = null;
      /* Sliding window. Input bytes are read into the second half of the window,
       * and move to the first half later to keep a dictionary of at least wSize
       * bytes. With this organization, matches are limited to a distance of
       * wSize-MAX_MATCH bytes, but this ensures that IO is always
       * performed with a length multiple of the block size.
       */

      this.window_size = 0;
      /* Actual size of window: 2*wSize, except when the user input buffer
       * is directly used as sliding window.
       */

      this.prev = null;
      /* Link to older string with same hash index. To limit the size of this
       * array to 64K, this link is maintained only for the last 32K strings.
       * An index in this array is thus a window index modulo 32K.
       */

      this.head = null;
      /* Heads of the hash chains or NIL. */

      this.ins_h = 0;
      /* hash index of string to be inserted */
      this.hash_size = 0;
      /* number of elements in hash table */
      this.hash_bits = 0;
      /* log2(hash_size) */
      this.hash_mask = 0;
      /* hash_size-1 */

      this.hash_shift = 0;
      /* Number of bits by which ins_h must be shifted at each input
       * step. It must be such that after MIN_MATCH steps, the oldest
       * byte no longer takes part in the hash key, that is:
       *   hash_shift * MIN_MATCH >= hash_bits
       */

      this.block_start = 0;
      /* Window position at the beginning of the current output block. Gets
       * negative when the window is moved backwards.
       */

      this.match_length = 0;
      /* length of best match */
      this.prev_match = 0;
      /* previous match */
      this.match_available = 0;
      /* set if previous match exists */
      this.strstart = 0;
      /* start of string to insert */
      this.match_start = 0;
      /* start of matching string */
      this.lookahead = 0;
      /* number of valid bytes ahead in window */

      this.prev_length = 0;
      /* Length of the best match at previous step. Matches not greater than this
       * are discarded. This is used in the lazy match evaluation.
       */

      this.max_chain_length = 0;
      /* To speed up deflation, hash chains are never searched beyond this
       * length.  A higher limit improves compression ratio but degrades the
       * speed.
       */

      this.max_lazy_match = 0;
      /* Attempt to find a better match only when the current match is strictly
       * smaller than this value. This mechanism is used only for compression
       * levels >= 4.
       */
      // That's alias to max_lazy_match, don't use directly
      //this.max_insert_length = 0;
      /* Insert new strings in the hash table only if the match length is not
       * greater than this length. This saves time but degrades compression.
       * max_insert_length is used only for compression levels <= 3.
       */

      this.level = 0;
      /* compression level (1..9) */
      this.strategy = 0;
      /* favor or force Huffman coding*/

      this.good_match = 0;
      /* Use a faster search when the previous match is longer than this */

      this.nice_match = 0;
      /* Stop searching when current match exceeds this */

      /* used by trees.c: */

      /* Didn't use ct_data typedef below to suppress compiler warning */

      // struct ct_data_s dyn_ltree[HEAP_SIZE];   /* literal and length tree */
      // struct ct_data_s dyn_dtree[2*D_CODES+1]; /* distance tree */
      // struct ct_data_s bl_tree[2*BL_CODES+1];  /* Huffman tree for bit lengths */

      // Use flat array of DOUBLE size, with interleaved fata,
      // because JS does not support effective
      this.dyn_ltree = new utils.Buf16(HEAP_SIZE * 2);
      this.dyn_dtree = new utils.Buf16((2 * D_CODES + 1) * 2);
      this.bl_tree = new utils.Buf16((2 * BL_CODES + 1) * 2);
      zero(this.dyn_ltree);
      zero(this.dyn_dtree);
      zero(this.bl_tree);

      this.l_desc = null;
      /* desc. for literal tree */
      this.d_desc = null;
      /* desc. for distance tree */
      this.bl_desc = null;
      /* desc. for bit length tree */

      //ush bl_count[MAX_BITS+1];
      this.bl_count = new utils.Buf16(MAX_BITS + 1);
      /* number of codes at each bit length for an optimal tree */

      //int heap[2*L_CODES+1];      /* heap used to build the Huffman trees */
      this.heap = new utils.Buf16(2 * L_CODES + 1);
      /* heap used to build the Huffman trees */
      zero(this.heap);

      this.heap_len = 0;
      /* number of elements in the heap */
      this.heap_max = 0;
      /* element of largest frequency */
      /* The sons of heap[n] are heap[2*n] and heap[2*n+1]. heap[0] is not used.
       * The same heap array is used to build all trees.
       */

      this.depth = new utils.Buf16(2 * L_CODES + 1); //uch depth[2*L_CODES+1];
      zero(this.depth);
      /* Depth of each subtree used as tie breaker for trees of equal frequency
       */

      this.l_buf = 0;
      /* buffer index for literals or lengths */

      this.lit_bufsize = 0;
      /* Size of match buffer for literals/lengths.  There are 4 reasons for
       * limiting lit_bufsize to 64K:
       *   - frequencies can be kept in 16 bit counters
       *   - if compression is not successful for the first block, all input
       *     data is still in the window so we can still emit a stored block even
       *     when input comes from standard input.  (This can also be done for
       *     all blocks if lit_bufsize is not greater than 32K.)
       *   - if compression is not successful for a file smaller than 64K, we can
       *     even emit a stored file instead of a stored block (saving 5 bytes).
       *     This is applicable only for zip (not gzip or zlib).
       *   - creating new Huffman trees less frequently may not provide fast
       *     adaptation to changes in the input data statistics. (Take for
       *     example a binary file with poorly compressible code followed by
       *     a highly compressible string table.) Smaller buffer sizes give
       *     fast adaptation but have of course the overhead of transmitting
       *     trees more frequently.
       *   - I can't count above 4
       */

      this.last_lit = 0;
      /* running index in l_buf */

      this.d_buf = 0;
      /* Buffer index for distances. To simplify the code, d_buf and l_buf have
       * the same number of elements. To use different lengths, an extra flag
       * array would be necessary.
       */

      this.opt_len = 0;
      /* bit length of current block with optimal trees */
      this.static_len = 0;
      /* bit length of current block with static trees */
      this.matches = 0;
      /* number of string matches in current block */
      this.insert = 0;
      /* bytes at end of window left to insert */


      this.bi_buf = 0;
      /* Output buffer. bits are inserted starting at the bottom (least
       * significant bits).
       */
      this.bi_valid = 0;
      /* Number of valid bits in bi_buf.  All bits above the last valid bit
       * are always zero.
       */

      // Used for window memory init. We safely ignore it for JS. That makes
      // sense only for pointers and memory check tools.
      //this.high_water = 0;
      /* High water mark offset in window for initialized bytes -- bytes above
       * this are set to zero in order to avoid memory check warnings when
       * longest match routines access bytes past the input.  This is then
       * updated to the new high water mark.
       */
    }


    function deflateResetKeep(strm) {
      var s;

      if (!strm || !strm.state) {
        return err(strm, Z_STREAM_ERROR);
      }

      strm.total_in = strm.total_out = 0;
      strm.data_type = Z_UNKNOWN;

      s = strm.state;
      s.pending = 0;
      s.pending_out = 0;

      if (s.wrap < 0) {
        s.wrap = -s.wrap;
        /* was made negative by deflate(..., Z_FINISH); */
      }
      s.status = (s.wrap ? INIT_STATE : BUSY_STATE);
      strm.adler = (s.wrap === 2) ?
          0  // crc32(0, Z_NULL, 0)
          :
          1; // adler32(0, Z_NULL, 0)
      s.last_flush = Z_NO_FLUSH;
      trees._tr_init(s);
      return Z_OK;
    }


    function deflateReset(strm) {
      var ret = deflateResetKeep(strm);
      if (ret === Z_OK) {
        lm_init(strm.state);
      }
      return ret;
    }


    function deflateSetHeader(strm, head) {
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      if (strm.state.wrap !== 2) {
        return Z_STREAM_ERROR;
      }
      strm.state.gzhead = head;
      return Z_OK;
    }


    function deflateInit2(strm, level, method, windowBits, memLevel, strategy) {
      if (!strm) { // === Z_NULL
        return Z_STREAM_ERROR;
      }
      var wrap = 1;

      if (level === Z_DEFAULT_COMPRESSION) {
        level = 6;
      }

      if (windowBits < 0) { /* suppress zlib wrapper */
        wrap = 0;
        windowBits = -windowBits;
      }

      else if (windowBits > 15) {
        wrap = 2;
        /* write gzip wrapper instead */
        windowBits -= 16;
      }


      if (memLevel < 1 || memLevel > MAX_MEM_LEVEL || method !== Z_DEFLATED ||
          windowBits < 8 || windowBits > 15 || level < 0 || level > 9 ||
          strategy < 0 || strategy > Z_FIXED) {
        return err(strm, Z_STREAM_ERROR);
      }


      if (windowBits === 8) {
        windowBits = 9;
      }
      /* until 256-byte window bug fixed */

      var s = new DeflateState();

      strm.state = s;
      s.strm = strm;

      s.wrap = wrap;
      s.gzhead = null;
      s.w_bits = windowBits;
      s.w_size = 1 << s.w_bits;
      s.w_mask = s.w_size - 1;

      s.hash_bits = memLevel + 7;
      s.hash_size = 1 << s.hash_bits;
      s.hash_mask = s.hash_size - 1;
      s.hash_shift = ~~((s.hash_bits + MIN_MATCH - 1) / MIN_MATCH);

      s.window = new utils.Buf8(s.w_size * 2);
      s.head = new utils.Buf16(s.hash_size);
      s.prev = new utils.Buf16(s.w_size);

      // Don't need mem init magic for JS.
      //s.high_water = 0;  /* nothing written to s->window yet */

      s.lit_bufsize = 1 << (memLevel + 6);
      /* 16K elements by default */

      s.pending_buf_size = s.lit_bufsize * 4;
      s.pending_buf = new utils.Buf8(s.pending_buf_size);

      s.d_buf = s.lit_bufsize >> 1;
      s.l_buf = (1 + 2) * s.lit_bufsize;

      s.level = level;
      s.strategy = strategy;
      s.method = method;

      return deflateReset(strm);
    }

    function deflateInit(strm, level) {
      return deflateInit2(strm, level, Z_DEFLATED, MAX_WBITS, DEF_MEM_LEVEL, Z_DEFAULT_STRATEGY);
    }


    function deflate(strm, flush) {
      var old_flush, s;
      var beg, val; // for gzip header write only

      if (!strm || !strm.state ||
          flush > Z_BLOCK || flush < 0) {
        return strm ? err(strm, Z_STREAM_ERROR) : Z_STREAM_ERROR;
      }

      s = strm.state;

      if (!strm.output ||
          (!strm.input && strm.avail_in !== 0) ||
          (s.status === FINISH_STATE && flush !== Z_FINISH)) {
        return err(strm, (strm.avail_out === 0) ? Z_BUF_ERROR : Z_STREAM_ERROR);
      }

      s.strm = strm;
      /* just in case */
      old_flush = s.last_flush;
      s.last_flush = flush;

      /* Write the header */
      if (s.status === INIT_STATE) {

        if (s.wrap === 2) { // GZIP header
          strm.adler = 0;  //crc32(0L, Z_NULL, 0);
          put_byte(s, 31);
          put_byte(s, 139);
          put_byte(s, 8);
          if (!s.gzhead) { // s->gzhead == Z_NULL
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, 0);
            put_byte(s, s.level === 9 ? 2 :
                (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                    4 : 0));
            put_byte(s, OS_CODE);
            s.status = BUSY_STATE;
      }
          else {
            put_byte(s, (s.gzhead.text ? 1 : 0) +
                (s.gzhead.hcrc ? 2 : 0) +
                (!s.gzhead.extra ? 0 : 4) +
                (!s.gzhead.name ? 0 : 8) +
                (!s.gzhead.comment ? 0 : 16)
            );
            put_byte(s, s.gzhead.time & 0xff);
            put_byte(s, (s.gzhead.time >> 8) & 0xff);
            put_byte(s, (s.gzhead.time >> 16) & 0xff);
            put_byte(s, (s.gzhead.time >> 24) & 0xff);
            put_byte(s, s.level === 9 ? 2 :
                (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2 ?
                    4 : 0));
            put_byte(s, s.gzhead.os & 0xff);
            if (s.gzhead.extra && s.gzhead.extra.length) {
              put_byte(s, s.gzhead.extra.length & 0xff);
              put_byte(s, (s.gzhead.extra.length >> 8) & 0xff);
            }
        if (s.gzhead.hcrc) {
          strm.adler = crc32(strm.adler, s.pending_buf, s.pending, 0);
        }
            s.gzindex = 0;
            s.status = EXTRA_STATE;
      }
    }
        else // DEFLATE header
        {
          var header = (Z_DEFLATED + ((s.w_bits - 8) << 4)) << 8;
          var level_flags = -1;

          if (s.strategy >= Z_HUFFMAN_ONLY || s.level < 2) {
            level_flags = 0;
          } else if (s.level < 6) {
            level_flags = 1;
          } else if (s.level === 6) {
            level_flags = 2;
          } else {
            level_flags = 3;
      }
          header |= (level_flags << 6);
          if (s.strstart !== 0) {
            header |= PRESET_DICT;
          }
          header += 31 - (header % 31);

          s.status = BUSY_STATE;
          putShortMSB(s, header);

          /* Save the adler32 of the preset dictionary: */
          if (s.strstart !== 0) {
        putShortMSB(s, strm.adler >>> 16);
        putShortMSB(s, strm.adler & 0xffff);
      }
          strm.adler = 1; // adler32(0L, Z_NULL, 0);
        }
      }

//#ifdef GZIP
      if (s.status === EXTRA_STATE) {
        if (s.gzhead.extra/* != Z_NULL*/) {
          beg = s.pending;
          /* start of bytes to update crc */

          while (s.gzindex < (s.gzhead.extra.length & 0xffff)) {
            if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
              flush_pending(strm);
              beg = s.pending;
              if (s.pending === s.pending_buf_size) {
                break;
          }
        }
            put_byte(s, s.gzhead.extra[s.gzindex] & 0xff);
            s.gzindex++;
      }
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
          if (s.gzindex === s.gzhead.extra.length) {
            s.gzindex = 0;
            s.status = NAME_STATE;
          }
        }
        else {
          s.status = NAME_STATE;
        }
      }
      if (s.status === NAME_STATE) {
        if (s.gzhead.name/* != Z_NULL*/) {
          beg = s.pending;
          /* start of bytes to update crc */
          //int val;

          do {
            if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
              flush_pending(strm);
              beg = s.pending;
              if (s.pending === s.pending_buf_size) {
                val = 1;
                break;
          }
        }
            // JS specific: little magic to add zero terminator to end of string
            if (s.gzindex < s.gzhead.name.length) {
              val = s.gzhead.name.charCodeAt(s.gzindex++) & 0xff;
            } else {
              val = 0;
        }
            put_byte(s, val);
          } while (val !== 0);

          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
          if (val === 0) {
            s.gzindex = 0;
            s.status = COMMENT_STATE;
          }
        }
        else {
          s.status = COMMENT_STATE;
        }
      }
      if (s.status === COMMENT_STATE) {
        if (s.gzhead.comment/* != Z_NULL*/) {
          beg = s.pending;
          /* start of bytes to update crc */
          //int val;

          do {
            if (s.pending === s.pending_buf_size) {
          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
          }
              flush_pending(strm);
              beg = s.pending;
              if (s.pending === s.pending_buf_size) {
                val = 1;
                break;
          }
        }
            // JS specific: little magic to add zero terminator to end of string
            if (s.gzindex < s.gzhead.comment.length) {
              val = s.gzhead.comment.charCodeAt(s.gzindex++) & 0xff;
            } else {
              val = 0;
        }
            put_byte(s, val);
          } while (val !== 0);

          if (s.gzhead.hcrc && s.pending > beg) {
            strm.adler = crc32(strm.adler, s.pending_buf, s.pending - beg, beg);
      }
          if (val === 0) {
            s.status = HCRC_STATE;
      }
        }
        else {
          s.status = HCRC_STATE;
        }
      }
      if (s.status === HCRC_STATE) {
        if (s.gzhead.hcrc) {
          if (s.pending + 2 > s.pending_buf_size) {
        flush_pending(strm);
      }
          if (s.pending + 2 <= s.pending_buf_size) {
        put_byte(s, strm.adler & 0xff);
        put_byte(s, (strm.adler >> 8) & 0xff);
            strm.adler = 0; //crc32(0L, Z_NULL, 0);
            s.status = BUSY_STATE;
      }
        }
        else {
          s.status = BUSY_STATE;
        }
      }
//#endif

      /* Flush as much pending output as possible */
      if (s.pending !== 0) {
        flush_pending(strm);
        if (strm.avail_out === 0) {
          /* Since avail_out is 0, deflate will be called again with
           * more output space, but possibly with both pending and
           * avail_in equal to zero. There won't be anything to do,
           * but this is not an error situation so make sure we
           * return OK instead of BUF_ERROR at next call of deflate:
           */
          s.last_flush = -1;
          return Z_OK;
        }

        /* Make sure there is something to do and avoid duplicate consecutive
         * flushes. For repeated and useless calls with Z_FINISH, we keep
         * returning Z_STREAM_END instead of Z_BUF_ERROR.
         */
      } else if (strm.avail_in === 0 && rank(flush) <= rank(old_flush) &&
          flush !== Z_FINISH) {
        return err(strm, Z_BUF_ERROR);
      }

      /* User must not provide more input after the first FINISH: */
      if (s.status === FINISH_STATE && strm.avail_in !== 0) {
        return err(strm, Z_BUF_ERROR);
      }

      /* Start a new block or continue the current one.
       */
      if (strm.avail_in !== 0 || s.lookahead !== 0 ||
          (flush !== Z_NO_FLUSH && s.status !== FINISH_STATE)) {
        var bstate = (s.strategy === Z_HUFFMAN_ONLY) ? deflate_huff(s, flush) :
            (s.strategy === Z_RLE ? deflate_rle(s, flush) :
                configuration_table[s.level].func(s, flush));

        if (bstate === BS_FINISH_STARTED || bstate === BS_FINISH_DONE) {
          s.status = FINISH_STATE;
        }
        if (bstate === BS_NEED_MORE || bstate === BS_FINISH_STARTED) {
          if (strm.avail_out === 0) {
            s.last_flush = -1;
            /* avoid BUF_ERROR next call, see above */
      }
          return Z_OK;
          /* If flush != Z_NO_FLUSH && avail_out == 0, the next call
           * of deflate should use the same flush parameter to make sure
           * that the flush is complete. So we don't have to output an
           * empty block here, this will be done at next call. This also
           * ensures that for a very small output buffer, we emit at most
           * one empty block.
           */
        }
        if (bstate === BS_BLOCK_DONE) {
          if (flush === Z_PARTIAL_FLUSH) {
            trees._tr_align(s);
          }
          else if (flush !== Z_BLOCK) { /* FULL_FLUSH or SYNC_FLUSH */

            trees._tr_stored_block(s, 0, 0, false);
            /* For a full flush, this empty block will be recognized
             * as a special marker by inflate_sync().
             */
            if (flush === Z_FULL_FLUSH) {
              /*** CLEAR_HASH(s); ***/
              /* forget history */
              zero(s.head); // Fill with NIL (= 0);

              if (s.lookahead === 0) {
                s.strstart = 0;
                s.block_start = 0;
                s.insert = 0;
              }
            }
          }
      flush_pending(strm);
          if (strm.avail_out === 0) {
            s.last_flush = -1;
            /* avoid BUF_ERROR at next call, see above */
            return Z_OK;
      }
    }
      }
      //Assert(strm->avail_out > 0, "bug2");
      //if (strm.avail_out <= 0) { throw new Error("bug2");}

      if (flush !== Z_FINISH) {
        return Z_OK;
      }
      if (s.wrap <= 0) {
        return Z_STREAM_END;
      }

      /* Write the trailer */
      if (s.wrap === 2) {
        put_byte(s, strm.adler & 0xff);
        put_byte(s, (strm.adler >> 8) & 0xff);
        put_byte(s, (strm.adler >> 16) & 0xff);
        put_byte(s, (strm.adler >> 24) & 0xff);
        put_byte(s, strm.total_in & 0xff);
        put_byte(s, (strm.total_in >> 8) & 0xff);
        put_byte(s, (strm.total_in >> 16) & 0xff);
        put_byte(s, (strm.total_in >> 24) & 0xff);
      }
      else {
        putShortMSB(s, strm.adler >>> 16);
        putShortMSB(s, strm.adler & 0xffff);
      }

      flush_pending(strm);
      /* If avail_out is zero, the application will call deflate again
       * to flush the rest.
       */
      if (s.wrap > 0) {
        s.wrap = -s.wrap;
      }
      /* write the trailer only once! */
      return s.pending !== 0 ? Z_OK : Z_STREAM_END;
    }

    function deflateEnd(strm) {
      var status;

      if (!strm/*== Z_NULL*/ || !strm.state/*== Z_NULL*/) {
        return Z_STREAM_ERROR;
      }

      status = strm.state.status;
      if (status !== INIT_STATE &&
          status !== EXTRA_STATE &&
          status !== NAME_STATE &&
          status !== COMMENT_STATE &&
          status !== HCRC_STATE &&
          status !== BUSY_STATE &&
          status !== FINISH_STATE
      ) {
        return err(strm, Z_STREAM_ERROR);
      }

      strm.state = null;

      return status === BUSY_STATE ? err(strm, Z_DATA_ERROR) : Z_OK;
    }

    /* =========================================================================
     * Copy the source state to the destination state
     */
//function deflateCopy(dest, source) {
//
//}

    exports.deflateInit = deflateInit;
    exports.deflateInit2 = deflateInit2;
    exports.deflateReset = deflateReset;
    exports.deflateResetKeep = deflateResetKeep;
    exports.deflateSetHeader = deflateSetHeader;
    exports.deflate = deflate;
    exports.deflateEnd = deflateEnd;
    exports.deflateInfo = 'pako deflate (from Nodeca project)';

    /* Not implemented
     exports.deflateBound = deflateBound;
     exports.deflateCopy = deflateCopy;
     exports.deflateSetDictionary = deflateSetDictionary;
     exports.deflateParams = deflateParams;
     exports.deflatePending = deflatePending;
     exports.deflatePrime = deflatePrime;
     exports.deflateTune = deflateTune;
     */

  }, {"../utils/common": 4, "./adler32": 5, "./crc32": 7, "./messages": 12, "./trees": 13}],
  9: [function (require, module, exports) {
    'use strict';

// See state defs from inflate.js
    var BAD = 30;
    /* got a data error -- remain here until reset */
    var TYPE = 12;
    /* i: waiting for type bits, including last-flag bit */

    /*
     Decode literal, length, and distance codes and write out the resulting
     literal and match bytes until either not enough input or output is
     available, an end-of-block is encountered, or a data error is encountered.
     When large enough input and output buffers are supplied to inflate(), for
     example, a 16K input buffer and a 64K output buffer, more than 95% of the
     inflate execution time is spent in this routine.

     Entry assumptions:

     state.mode === LEN
     strm.avail_in >= 6
     strm.avail_out >= 258
     start >= strm.avail_out
     state.bits < 8

     On return, state.mode is one of:

     LEN -- ran out of enough output space or enough available input
     TYPE -- reached end of block code, inflate() to interpret next block
     BAD -- error in block data

     Notes:

     - The maximum input bits used by a length/distance pair is 15 bits for the
     length code, 5 bits for the length extra, 15 bits for the distance code,
     and 13 bits for the distance extra.  This totals 48 bits, or six bytes.
     Therefore if strm.avail_in >= 6, then there is enough input to avoid
     checking for available input while decoding.

     - The maximum bytes that a single length/distance pair can output is 258
     bytes, which is the maximum length that can be coded.  inflate_fast()
     requires strm.avail_out >= 258 for each loop to avoid checking for
     output space.
     */
    module.exports = function inflate_fast(strm, start) {
      var state;
      var _in;
      /* local strm.input */
      var last;
      /* have enough input while in < last */
      var _out;
      /* local strm.output */
      var beg;
      /* inflate()'s initial strm.output */
      var end;
      /* while out < end, enough space available */
//#ifdef INFLATE_STRICT
      var dmax;
      /* maximum distance from zlib header */
//#endif
      var wsize;
      /* window size or zero if not using window */
      var whave;
      /* valid bytes in the window */
      var wnext;
      /* window write index */
      // Use `s_window` instead `window`, avoid conflict with instrumentation tools
      var s_window;
      /* allocated sliding window, if wsize != 0 */
      var hold;
      /* local strm.hold */
      var bits;
      /* local strm.bits */
      var lcode;
      /* local strm.lencode */
      var dcode;
      /* local strm.distcode */
      var lmask;
      /* mask for first level of length codes */
      var dmask;
      /* mask for first level of distance codes */
      var here;
      /* retrieved table entry */
      var op;
      /* code bits, operation, extra bits, or */
      /*  window position, window bytes to copy */
      var len;
      /* match length, unused bytes */
      var dist;
      /* match distance */
      var from;
      /* where to copy match from */
      var from_source;


      var input, output; // JS specific, because we have no pointers

      /* copy state to local variables */
      state = strm.state;
      //here = state.here;
      _in = strm.next_in;
      input = strm.input;
      last = _in + (strm.avail_in - 5);
      _out = strm.next_out;
      output = strm.output;
      beg = _out - (start - strm.avail_out);
      end = _out + (strm.avail_out - 257);
//#ifdef INFLATE_STRICT
      dmax = state.dmax;
//#endif
      wsize = state.wsize;
      whave = state.whave;
      wnext = state.wnext;
      s_window = state.window;
      hold = state.hold;
      bits = state.bits;
      lcode = state.lencode;
      dcode = state.distcode;
      lmask = (1 << state.lenbits) - 1;
      dmask = (1 << state.distbits) - 1;


      /* decode literals and length/distances until end-of-block or not enough
       input data or output space */

      top:
          do {
            if (bits < 15) {
              hold += input[_in++] << bits;
              bits += 8;
              hold += input[_in++] << bits;
              bits += 8;
            }

            here = lcode[hold & lmask];

            dolen:
                for (; ;) { // Goto emulation
                  op = here >>> 24/*here.bits*/;
                  hold >>>= op;
                  bits -= op;
                  op = (here >>> 16) & 0xff/*here.op*/;
                  if (op === 0) {                          /* literal */
                    //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
                    //        "inflate:         literal '%c'\n" :
                    //        "inflate:         literal 0x%02x\n", here.val));
                    output[_out++] = here & 0xffff/*here.val*/;
                  }
                  else if (op & 16) {                     /* length base */
                    len = here & 0xffff/*here.val*/;
                    op &= 15;
                    /* number of extra bits */
                    if (op) {
                      if (bits < op) {
                        hold += input[_in++] << bits;
                        bits += 8;
                      }
                      len += hold & ((1 << op) - 1);
                      hold >>>= op;
                      bits -= op;
                    }
                    //Tracevv((stderr, "inflate:         length %u\n", len));
                    if (bits < 15) {
                      hold += input[_in++] << bits;
                      bits += 8;
                      hold += input[_in++] << bits;
                      bits += 8;
                    }
                    here = dcode[hold & dmask];

                    dodist:
                        for (; ;) { // goto emulation
                          op = here >>> 24/*here.bits*/;
                          hold >>>= op;
                          bits -= op;
                          op = (here >>> 16) & 0xff/*here.op*/;

                          if (op & 16) {                      /* distance base */
                            dist = here & 0xffff/*here.val*/;
                            op &= 15;
                            /* number of extra bits */
                            if (bits < op) {
                              hold += input[_in++] << bits;
                              bits += 8;
                              if (bits < op) {
                                hold += input[_in++] << bits;
                                bits += 8;
                              }
                            }
                            dist += hold & ((1 << op) - 1);
//#ifdef INFLATE_STRICT
                            if (dist > dmax) {
                              strm.msg = 'invalid distance too far back';
                              state.mode = BAD;
                              break top;
                            }
//#endif
                            hold >>>= op;
                            bits -= op;
                            //Tracevv((stderr, "inflate:         distance %u\n", dist));
                            op = _out - beg;
                            /* max distance in output */
                            if (dist > op) {                /* see if copy from window */
                              op = dist - op;
                              /* distance back in window */
                              if (op > whave) {
                                if (state.sane) {
                                  strm.msg = 'invalid distance too far back';
                                  state.mode = BAD;
                                  break top;
                                }

// (!) This block is disabled in zlib defailts,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//                if (len <= op - whave) {
//                  do {
//                    output[_out++] = 0;
//                  } while (--len);
//                  continue top;
//                }
//                len -= op - whave;
//                do {
//                  output[_out++] = 0;
//                } while (--op > whave);
//                if (op === 0) {
//                  from = _out - dist;
//                  do {
//                    output[_out++] = output[from++];
//                  } while (--len);
//                  continue top;
//                }
//#endif
                              }
                              from = 0; // window index
                              from_source = s_window;
                              if (wnext === 0) {           /* very common case */
                                from += wsize - op;
                                if (op < len) {         /* some from window */
                                  len -= op;
                                  do {
                                    output[_out++] = s_window[from++];
                                  } while (--op);
                                  from = _out - dist;
                                  /* rest from output */
                                  from_source = output;
                                }
                              }
                              else if (wnext < op) {      /* wrap around window */
                                from += wsize + wnext - op;
                                op -= wnext;
                                if (op < len) {         /* some from end of window */
                                  len -= op;
                                  do {
                                    output[_out++] = s_window[from++];
                                  } while (--op);
                                  from = 0;
                                  if (wnext < len) {  /* some from start of window */
                                    op = wnext;
                                    len -= op;
                                    do {
                                      output[_out++] = s_window[from++];
                                    } while (--op);
                                    from = _out - dist;
                                    /* rest from output */
                                    from_source = output;
                                  }
                                }
                              }
                              else {                      /* contiguous in window */
                                from += wnext - op;
                                if (op < len) {         /* some from window */
                                  len -= op;
                                  do {
                                    output[_out++] = s_window[from++];
                                  } while (--op);
                                  from = _out - dist;
                                  /* rest from output */
                                  from_source = output;
                                }
                              }
                              while (len > 2) {
                                output[_out++] = from_source[from++];
                                output[_out++] = from_source[from++];
                                output[_out++] = from_source[from++];
                                len -= 3;
                              }
                              if (len) {
                                output[_out++] = from_source[from++];
                                if (len > 1) {
                                  output[_out++] = from_source[from++];
                                }
                              }
                            }
            else {
                              from = _out - dist;
                              /* copy direct from output */
                              do {                        /* minimum length is three */
                                output[_out++] = output[from++];
                                output[_out++] = output[from++];
                                output[_out++] = output[from++];
                                len -= 3;
                              } while (len > 2);
                              if (len) {
                                output[_out++] = output[from++];
                                if (len > 1) {
                                  output[_out++] = output[from++];
                }
                              }
                            }
                          }
                          else if ((op & 64) === 0) {          /* 2nd level distance code */
                            here = dcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
                            continue dodist;
                          }
                          else {
                            strm.msg = 'invalid distance code';
                            state.mode = BAD;
                            break top;
                          }

                          break; // need to emulate goto via "continue"
                        }
                  }
                  else if ((op & 64) === 0) {              /* 2nd level length code */
                    here = lcode[(here & 0xffff)/*here.val*/ + (hold & ((1 << op) - 1))];
                    continue dolen;
                  }
                  else if (op & 32) {                     /* end-of-block */
                    //Tracevv((stderr, "inflate:         end of block\n"));
                    state.mode = TYPE;
                    break top;
                  }
                  else {
                    strm.msg = 'invalid literal/length code';
                    state.mode = BAD;
                    break top;
                  }

                  break; // need to emulate goto via "continue"
                }
          } while (_in < last && _out < end);

      /* return unused bytes (on entry, bits < 8, so in won't go too far back) */
      len = bits >> 3;
      _in -= len;
      bits -= len << 3;
      hold &= (1 << bits) - 1;

      /* update state and return */
      strm.next_in = _in;
      strm.next_out = _out;
      strm.avail_in = (_in < last ? 5 + (last - _in) : 5 - (_in - last));
      strm.avail_out = (_out < end ? 257 + (end - _out) : 257 - (_out - end));
      state.hold = hold;
      state.bits = bits;
      return;
    };

  }, {}],
  10: [function (require, module, exports) {
    'use strict';


    var utils = require('../utils/common');
    var adler32 = require('./adler32');
    var crc32 = require('./crc32');
    var inflate_fast = require('./inffast');
    var inflate_table = require('./inftrees');

    var CODES = 0;
    var LENS = 1;
    var DISTS = 2;

    /* Public constants ==========================================================*/
    /* ===========================================================================*/


    /* Allowed flush values; see deflate() and inflate() below for details */
//var Z_NO_FLUSH      = 0;
//var Z_PARTIAL_FLUSH = 1;
//var Z_SYNC_FLUSH    = 2;
//var Z_FULL_FLUSH    = 3;
    var Z_FINISH = 4;
    var Z_BLOCK = 5;
    var Z_TREES = 6;


    /* Return codes for the compression/decompression functions. Negative values
     * are errors, positive values are used for special but normal events.
     */
    var Z_OK = 0;
    var Z_STREAM_END = 1;
    var Z_NEED_DICT = 2;
//var Z_ERRNO         = -1;
    var Z_STREAM_ERROR = -2;
    var Z_DATA_ERROR = -3;
    var Z_MEM_ERROR = -4;
    var Z_BUF_ERROR = -5;
//var Z_VERSION_ERROR = -6;

    /* The deflate compression method */
    var Z_DEFLATED = 8;


    /* STATES ====================================================================*/
    /* ===========================================================================*/


    var HEAD = 1;
    /* i: waiting for magic header */
    var FLAGS = 2;
    /* i: waiting for method and flags (gzip) */
    var TIME = 3;
    /* i: waiting for modification time (gzip) */
    var OS = 4;
    /* i: waiting for extra flags and operating system (gzip) */
    var EXLEN = 5;
    /* i: waiting for extra length (gzip) */
    var EXTRA = 6;
    /* i: waiting for extra bytes (gzip) */
    var NAME = 7;
    /* i: waiting for end of file name (gzip) */
    var COMMENT = 8;
    /* i: waiting for end of comment (gzip) */
    var HCRC = 9;
    /* i: waiting for header crc (gzip) */
    var DICTID = 10;
    /* i: waiting for dictionary check value */
    var DICT = 11;
    /* waiting for inflateSetDictionary() call */
    var TYPE = 12;
    /* i: waiting for type bits, including last-flag bit */
    var TYPEDO = 13;
    /* i: same, but skip check to exit inflate on new block */
    var STORED = 14;
    /* i: waiting for stored size (length and complement) */
    var COPY_ = 15;
    /* i/o: same as COPY below, but only first time in */
    var COPY = 16;
    /* i/o: waiting for input or output to copy stored block */
    var TABLE = 17;
    /* i: waiting for dynamic block table lengths */
    var LENLENS = 18;
    /* i: waiting for code length code lengths */
    var CODELENS = 19;
    /* i: waiting for length/lit and distance code lengths */
    var LEN_ = 20;
    /* i: same as LEN below, but only first time in */
    var LEN = 21;
    /* i: waiting for length/lit/eob code */
    var LENEXT = 22;
    /* i: waiting for length extra bits */
    var DIST = 23;
    /* i: waiting for distance code */
    var DISTEXT = 24;
    /* i: waiting for distance extra bits */
    var MATCH = 25;
    /* o: waiting for output space to copy string */
    var LIT = 26;
    /* o: waiting for output space to write literal */
    var CHECK = 27;
    /* i: waiting for 32-bit check value */
    var LENGTH = 28;
    /* i: waiting for 32-bit length (gzip) */
    var DONE = 29;
    /* finished check, done -- remain here until reset */
    var BAD = 30;
    /* got a data error -- remain here until reset */
    var MEM = 31;
    /* got an inflate() memory error -- remain here until reset */
    var SYNC = 32;
    /* looking for synchronization bytes to restart inflate() */

    /* ===========================================================================*/


    var ENOUGH_LENS = 852;
    var ENOUGH_DISTS = 592;
//var ENOUGH =  (ENOUGH_LENS+ENOUGH_DISTS);

    var MAX_WBITS = 15;
    /* 32K LZ77 window */
    var DEF_WBITS = MAX_WBITS;


    function ZSWAP32(q) {
      return (((q >>> 24) & 0xff) +
      ((q >>> 8) & 0xff00) +
      ((q & 0xff00) << 8) +
      ((q & 0xff) << 24));
    }


    function InflateState() {
      this.mode = 0;
      /* current inflate mode */
      this.last = false;
      /* true if processing last block */
      this.wrap = 0;
      /* bit 0 true for zlib, bit 1 true for gzip */
      this.havedict = false;
      /* true if dictionary provided */
      this.flags = 0;
      /* gzip header method and flags (0 if zlib) */
      this.dmax = 0;
      /* zlib header max distance (INFLATE_STRICT) */
      this.check = 0;
      /* protected copy of check value */
      this.total = 0;
      /* protected copy of output count */
      // TODO: may be {}
      this.head = null;
      /* where to save gzip header information */

      /* sliding window */
      this.wbits = 0;
      /* log base 2 of requested window size */
      this.wsize = 0;
      /* window size or zero if not using window */
      this.whave = 0;
      /* valid bytes in the window */
      this.wnext = 0;
      /* window write index */
      this.window = null;
      /* allocated sliding window, if needed */

      /* bit accumulator */
      this.hold = 0;
      /* input bit accumulator */
      this.bits = 0;
      /* number of bits in "in" */

      /* for string and stored block copying */
      this.length = 0;
      /* literal or length of data to copy */
      this.offset = 0;
      /* distance back to copy string from */

      /* for table and code decoding */
      this.extra = 0;
      /* extra bits needed */

      /* fixed and dynamic code tables */
      this.lencode = null;
      /* starting table for length/literal codes */
      this.distcode = null;
      /* starting table for distance codes */
      this.lenbits = 0;
      /* index bits for lencode */
      this.distbits = 0;
      /* index bits for distcode */

      /* dynamic table building */
      this.ncode = 0;
      /* number of code length code lengths */
      this.nlen = 0;
      /* number of length code lengths */
      this.ndist = 0;
      /* number of distance code lengths */
      this.have = 0;
      /* number of code lengths in lens[] */
      this.next = null;
      /* next available space in codes[] */

      this.lens = new utils.Buf16(320);
      /* temporary storage for code lengths */
      this.work = new utils.Buf16(288);
      /* work area for code table building */

      /*
       because we don't have pointers in js, we use lencode and distcode directly
       as buffers so we don't need codes
       */
      //this.codes = new utils.Buf32(ENOUGH);       /* space for code tables */
      this.lendyn = null;
      /* dynamic table for length/literal codes (JS specific) */
      this.distdyn = null;
      /* dynamic table for distance codes (JS specific) */
      this.sane = 0;
      /* if false, allow invalid distance too far */
      this.back = 0;
      /* bits back of last unprocessed length/lit */
      this.was = 0;
      /* initial length of match */
    }

    function inflateResetKeep(strm) {
      var state;

      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      strm.total_in = strm.total_out = state.total = 0;
      strm.msg = '';
      /*Z_NULL*/
      if (state.wrap) {       /* to support ill-conceived Java test suite */
        strm.adler = state.wrap & 1;
      }
      state.mode = HEAD;
      state.last = 0;
      state.havedict = 0;
      state.dmax = 32768;
      state.head = null/*Z_NULL*/;
      state.hold = 0;
      state.bits = 0;
      //state.lencode = state.distcode = state.next = state.codes;
      state.lencode = state.lendyn = new utils.Buf32(ENOUGH_LENS);
      state.distcode = state.distdyn = new utils.Buf32(ENOUGH_DISTS);

      state.sane = 1;
      state.back = -1;
      //Tracev((stderr, "inflate: reset\n"));
      return Z_OK;
    }

    function inflateReset(strm) {
      var state;

      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      state.wsize = 0;
      state.whave = 0;
      state.wnext = 0;
      return inflateResetKeep(strm);

    }

    function inflateReset2(strm, windowBits) {
      var wrap;
      var state;

      /* get the state */
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;

      /* extract wrap request from windowBits parameter */
      if (windowBits < 0) {
        wrap = 0;
        windowBits = -windowBits;
      }
      else {
        wrap = (windowBits >> 4) + 1;
        if (windowBits < 48) {
          windowBits &= 15;
    }
      }

      /* set number of window bits, free window if different */
      if (windowBits && (windowBits < 8 || windowBits > 15)) {
        return Z_STREAM_ERROR;
      }
      if (state.window !== null && state.wbits !== windowBits) {
        state.window = null;
      }

      /* update state and reset the rest of it */
      state.wrap = wrap;
      state.wbits = windowBits;
      return inflateReset(strm);
    }

    function inflateInit2(strm, windowBits) {
      var ret;
      var state;

      if (!strm) {
        return Z_STREAM_ERROR;
      }
      //strm.msg = Z_NULL;                 /* in case we return an error */

      state = new InflateState();

      //if (state === Z_NULL) return Z_MEM_ERROR;
      //Tracev((stderr, "inflate: allocated\n"));
      strm.state = state;
      state.window = null/*Z_NULL*/;
      ret = inflateReset2(strm, windowBits);
      if (ret !== Z_OK) {
        strm.state = null/*Z_NULL*/;
      }
      return ret;
    }

    function inflateInit(strm) {
      return inflateInit2(strm, DEF_WBITS);
    }


    /*
     Return state with length and distance decoding tables and index sizes set to
     fixed code decoding.  Normally this returns fixed tables from inffixed.h.
     If BUILDFIXED is defined, then instead this routine builds the tables the
     first time it's called, and returns those tables the first time and
     thereafter.  This reduces the size of the code by about 2K bytes, in
     exchange for a little execution time.  However, BUILDFIXED should not be
     used for threaded applications, since the rewriting of the tables and virgin
     may not be thread-safe.
     */
    var virgin = true;

    var lenfix, distfix; // We have no pointers in JS, so keep tables separate

    function fixedtables(state) {
      /* build fixed huffman tables if first call (may not be thread safe) */
      if (virgin) {
        var sym;

        lenfix = new utils.Buf32(512);
        distfix = new utils.Buf32(32);

        /* literal/length table */
        sym = 0;
        while (sym < 144) {
          state.lens[sym++] = 8;
        }
        while (sym < 256) {
          state.lens[sym++] = 9;
        }
        while (sym < 280) {
          state.lens[sym++] = 7;
        }
        while (sym < 288) {
          state.lens[sym++] = 8;
        }

        inflate_table(LENS, state.lens, 0, 288, lenfix, 0, state.work, {bits: 9});

        /* distance table */
        sym = 0;
        while (sym < 32) {
          state.lens[sym++] = 5;
        }

        inflate_table(DISTS, state.lens, 0, 32, distfix, 0, state.work, {bits: 5});

        /* do this just once */
        virgin = false;
      }

      state.lencode = lenfix;
      state.lenbits = 9;
      state.distcode = distfix;
      state.distbits = 5;
    }


    /*
     Update the window with the last wsize (normally 32K) bytes written before
     returning.  If window does not exist yet, create it.  This is only called
     when a window is already in use, or when output has been written during this
     inflate call, but the end of the deflate stream has not been reached yet.
     It is also called to create a window for dictionary data when a dictionary
     is loaded.

     Providing output buffers larger than 32K to inflate() should provide a speed
     advantage, since only the last 32K of output is copied to the sliding window
     upon return from inflate(), and since all distances after the first 32K of
     output will fall in the output data, making match copies simpler and faster.
     The advantage may be dependent on the size of the processor's data caches.
     */
    function updatewindow(strm, src, end, copy) {
      var dist;
      var state = strm.state;

      /* if it hasn't been done already, allocate space for the window */
      if (state.window === null) {
        state.wsize = 1 << state.wbits;
        state.wnext = 0;
        state.whave = 0;

        state.window = new utils.Buf8(state.wsize);
      }

      /* copy state->wsize or less output bytes into the circular window */
      if (copy >= state.wsize) {
        utils.arraySet(state.window, src, end - state.wsize, state.wsize, 0);
        state.wnext = 0;
        state.whave = state.wsize;
      }
      else {
        dist = state.wsize - state.wnext;
        if (dist > copy) {
          dist = copy;
    }
        //zmemcpy(state->window + state->wnext, end - copy, dist);
        utils.arraySet(state.window, src, end - copy, dist, state.wnext);
        copy -= dist;
        if (copy) {
          //zmemcpy(state->window, end - copy, copy);
          utils.arraySet(state.window, src, end - copy, copy, 0);
          state.wnext = copy;
          state.whave = state.wsize;
    }
        else {
          state.wnext += dist;
          if (state.wnext === state.wsize) {
            state.wnext = 0;
          }
          if (state.whave < state.wsize) {
            state.whave += dist;
          }
        }
      }
      return 0;
    }

    function inflate(strm, flush) {
      var state;
      var input, output;          // input/output buffers
      var next;
      /* next input INDEX */
      var put;
      /* next output INDEX */
      var have, left;
      /* available input and output */
      var hold;
      /* bit buffer */
      var bits;
      /* bits in bit buffer */
      var _in, _out;
      /* save starting available input and output */
      var copy;
      /* number of stored or match bytes to copy */
      var from;
      /* where to copy match bytes from */
      var from_source;
      var here = 0;
      /* current decoding table entry */
      var here_bits, here_op, here_val; // paked "here" denormalized (JS specific)
      //var last;                   /* parent table entry */
      var last_bits, last_op, last_val; // paked "last" denormalized (JS specific)
      var len;
      /* length to copy for repeats, bits to drop */
      var ret;
      /* return code */
      var hbuf = new utils.Buf8(4);
      /* buffer for gzip header crc calculation */
      var opts;

      var n; // temporary var for NEED_BITS

      var order = /* permutation of code lengths */
          [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];


      if (!strm || !strm.state || !strm.output ||
          (!strm.input && strm.avail_in !== 0)) {
        return Z_STREAM_ERROR;
      }

      state = strm.state;
      if (state.mode === TYPE) {
        state.mode = TYPEDO;
      }
      /* skip check */


      //--- LOAD() ---
      put = strm.next_out;
      output = strm.output;
      left = strm.avail_out;
      next = strm.next_in;
      input = strm.input;
      have = strm.avail_in;
      hold = state.hold;
      bits = state.bits;
      //---

      _in = have;
      _out = left;
      ret = Z_OK;

      inf_leave: // goto emulation
          for (; ;) {
            switch (state.mode) {
              case HEAD:
                if (state.wrap === 0) {
        state.mode = TYPEDO;
                  break;
      }
                //=== NEEDBITS(16);
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
      }
                //===//
                if ((state.wrap & 2) && hold === 0x8b1f) {  /* gzip header */
                  state.check = 0/*crc32(0L, Z_NULL, 0)*/;
                  //=== CRC2(state.check, hold);
                  hbuf[0] = hold & 0xff;
                  hbuf[1] = (hold >>> 8) & 0xff;
                  state.check = crc32(state.check, hbuf, 2, 0);
                  //===//

                  //=== INITBITS();
                  hold = 0;
                  bits = 0;
                  //===//
                  state.mode = FLAGS;
                  break;
      }
                state.flags = 0;
                /* expect zlib header */
                if (state.head) {
                  state.head.done = false;
                }
                if (!(state.wrap & 1) || /* check if zlib header allowed */
                    (((hold & 0xff)/*BITS(8)*/ << 8) + (hold >> 8)) % 31) {
                  strm.msg = 'incorrect header check';
                  state.mode = BAD;
                  break;
                }
                if ((hold & 0x0f)/*BITS(4)*/ !== Z_DEFLATED) {
                  strm.msg = 'unknown compression method';
                  state.mode = BAD;
                  break;
                }
                //--- DROPBITS(4) ---//
                hold >>>= 4;
                bits -= 4;
                //---//
                len = (hold & 0x0f)/*BITS(4)*/ + 8;
                if (state.wbits === 0) {
                  state.wbits = len;
                }
                else if (len > state.wbits) {
                  strm.msg = 'invalid window size';
                  state.mode = BAD;
                  break;
                }
                state.dmax = 1 << len;
                //Tracev((stderr, "inflate:   zlib header ok\n"));
                strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
                state.mode = hold & 0x200 ? DICTID : TYPE;
                //=== INITBITS();
                hold = 0;
                bits = 0;
                //===//
                break;
              case FLAGS:
                //=== NEEDBITS(16); */
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                //===//
                state.flags = hold;
                if ((state.flags & 0xff) !== Z_DEFLATED) {
                  strm.msg = 'unknown compression method';
                  state.mode = BAD;
                  break;
                }
                if (state.flags & 0xe000) {
                  strm.msg = 'unknown header flags set';
                  state.mode = BAD;
                  break;
                }
                if (state.head) {
                  state.head.text = ((hold >> 8) & 1);
                }
                if (state.flags & 0x0200) {
                  //=== CRC2(state.check, hold);
                  hbuf[0] = hold & 0xff;
                  hbuf[1] = (hold >>> 8) & 0xff;
                  state.check = crc32(state.check, hbuf, 2, 0);
                  //===//
                }
                //=== INITBITS();
                hold = 0;
                bits = 0;
                //===//
                state.mode = TIME;
                /* falls through */
              case TIME:
                //=== NEEDBITS(32); */
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                //===//
                if (state.head) {
                  state.head.time = hold;
                }
                if (state.flags & 0x0200) {
                  //=== CRC4(state.check, hold)
                  hbuf[0] = hold & 0xff;
                  hbuf[1] = (hold >>> 8) & 0xff;
                  hbuf[2] = (hold >>> 16) & 0xff;
                  hbuf[3] = (hold >>> 24) & 0xff;
                  state.check = crc32(state.check, hbuf, 4, 0);
                  //===
                }
                //=== INITBITS();
                hold = 0;
                bits = 0;
                //===//
                state.mode = OS;
                /* falls through */
              case OS:
                //=== NEEDBITS(16); */
                while (bits < 16) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                //===//
                if (state.head) {
                  state.head.xflags = (hold & 0xff);
                  state.head.os = (hold >> 8);
                }
                if (state.flags & 0x0200) {
                  //=== CRC2(state.check, hold);
                  hbuf[0] = hold & 0xff;
                  hbuf[1] = (hold >>> 8) & 0xff;
                  state.check = crc32(state.check, hbuf, 2, 0);
                  //===//
                }
                //=== INITBITS();
                hold = 0;
                bits = 0;
                //===//
                state.mode = EXLEN;
                /* falls through */
              case EXLEN:
                if (state.flags & 0x0400) {
                  //=== NEEDBITS(16); */
                  while (bits < 16) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  //===//
                  state.length = hold;
                  if (state.head) {
                    state.head.extra_len = hold;
                  }
                  if (state.flags & 0x0200) {
                    //=== CRC2(state.check, hold);
                    hbuf[0] = hold & 0xff;
                    hbuf[1] = (hold >>> 8) & 0xff;
                    state.check = crc32(state.check, hbuf, 2, 0);
                    //===//
                  }
                  //=== INITBITS();
                  hold = 0;
                  bits = 0;
                  //===//
                }
                else if (state.head) {
                  state.head.extra = null/*Z_NULL*/;
                }
                state.mode = EXTRA;
                /* falls through */
              case EXTRA:
                if (state.flags & 0x0400) {
                  copy = state.length;
                  if (copy > have) {
                    copy = have;
                  }
        if (copy) {
          if (state.head) {
            len = state.head.extra_len - state.length;
            if (!state.head.extra) {
              // Use untyped array for more conveniend processing later
              state.head.extra = new Array(state.head.extra_len);
            }
            utils.arraySet(
                state.head.extra,
                input,
                next,
                // extra field is limited to 65536 bytes
                // - no need for additional size check
                copy,
                /*len + copy > state.head.extra_max - len ? state.head.extra_max : copy,*/
                len
            );
            //zmemcpy(state.head.extra + len, next,
            //        len + copy > state.head.extra_max ?
            //        state.head.extra_max - len : copy);
          }
          if (state.flags & 0x0200) {
            state.check = crc32(state.check, input, copy, next);
          }
          have -= copy;
          next += copy;
          state.length -= copy;
        }
                  if (state.length) {
                    break inf_leave;
                  }
                }
                state.length = 0;
                state.mode = NAME;
                /* falls through */
              case NAME:
                if (state.flags & 0x0800) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  copy = 0;
                  do {
                    // TODO: 2 or 1 bytes?
                    len = input[next + copy++];
                    /* use constant limit because in js we should not preallocate memory */
                    if (state.head && len &&
                        (state.length < 65536 /*state.head.name_max*/)) {
                      state.head.name += String.fromCharCode(len);
                    }
                  } while (len && copy < have);

                  if (state.flags & 0x0200) {
                    state.check = crc32(state.check, input, copy, next);
                  }
                  have -= copy;
                  next += copy;
                  if (len) {
                    break inf_leave;
                  }
                }
                else if (state.head) {
                  state.head.name = null;
                }
                state.length = 0;
                state.mode = COMMENT;
                /* falls through */
              case COMMENT:
                if (state.flags & 0x1000) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  copy = 0;
                  do {
                    len = input[next + copy++];
                    /* use constant limit because in js we should not preallocate memory */
                    if (state.head && len &&
                        (state.length < 65536 /*state.head.comm_max*/)) {
                      state.head.comment += String.fromCharCode(len);
                    }
                  } while (len && copy < have);
                  if (state.flags & 0x0200) {
                    state.check = crc32(state.check, input, copy, next);
                  }
                  have -= copy;
                  next += copy;
                  if (len) {
                    break inf_leave;
                  }
                }
                else if (state.head) {
                  state.head.comment = null;
                }
                state.mode = HCRC;
                /* falls through */
              case HCRC:
                if (state.flags & 0x0200) {
                  //=== NEEDBITS(16); */
                  while (bits < 16) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  //===//
                  if (hold !== (state.check & 0xffff)) {
                    strm.msg = 'header crc mismatch';
                    state.mode = BAD;
                    break;
                  }
                  //=== INITBITS();
                  hold = 0;
                  bits = 0;
                  //===//
                }
                if (state.head) {
                  state.head.hcrc = ((state.flags >> 9) & 1);
                  state.head.done = true;
                }
                strm.adler = state.check = 0 /*crc32(0L, Z_NULL, 0)*/;
                state.mode = TYPE;
                break;
              case DICTID:
                //=== NEEDBITS(32); */
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                //===//
                strm.adler = state.check = ZSWAP32(hold);
                //=== INITBITS();
                hold = 0;
                bits = 0;
                //===//
                state.mode = DICT;
                /* falls through */
              case DICT:
                if (state.havedict === 0) {
                  //--- RESTORE() ---
                  strm.next_out = put;
                  strm.avail_out = left;
                  strm.next_in = next;
                  strm.avail_in = have;
                  state.hold = hold;
                  state.bits = bits;
                  //---
                  return Z_NEED_DICT;
                }
                strm.adler = state.check = 1/*adler32(0L, Z_NULL, 0)*/;
                state.mode = TYPE;
                /* falls through */
              case TYPE:
                if (flush === Z_BLOCK || flush === Z_TREES) {
                  break inf_leave;
                }
                /* falls through */
              case TYPEDO:
                if (state.last) {
                  //--- BYTEBITS() ---//
                  hold >>>= bits & 7;
                  bits -= bits & 7;
                  //---//
                  state.mode = CHECK;
                  break;
                }
                //=== NEEDBITS(3); */
                while (bits < 3) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                //===//
                state.last = (hold & 0x01)/*BITS(1)*/;
                //--- DROPBITS(1) ---//
                hold >>>= 1;
                bits -= 1;
                //---//

                switch ((hold & 0x03)/*BITS(2)*/) {
                  case 0:                             /* stored block */
                    //Tracev((stderr, "inflate:     stored block%s\n",
                    //        state.last ? " (last)" : ""));
                    state.mode = STORED;
                    break;
                  case 1:                             /* fixed block */
                    fixedtables(state);
                    //Tracev((stderr, "inflate:     fixed codes block%s\n",
                    //        state.last ? " (last)" : ""));
                    state.mode = LEN_;
                    /* decode codes */
                    if (flush === Z_TREES) {
                      //--- DROPBITS(2) ---//
                      hold >>>= 2;
                      bits -= 2;
                      //---//
                      break inf_leave;
                    }
                    break;
                  case 2:                             /* dynamic block */
                    //Tracev((stderr, "inflate:     dynamic codes block%s\n",
                    //        state.last ? " (last)" : ""));
                    state.mode = TABLE;
                    break;
                  case 3:
                    strm.msg = 'invalid block type';
                    state.mode = BAD;
                }
                //--- DROPBITS(2) ---//
                hold >>>= 2;
                bits -= 2;
                //---//
                break;
              case STORED:
                //--- BYTEBITS() ---// /* go to byte boundary */
                hold >>>= bits & 7;
                bits -= bits & 7;
                //---//
                //=== NEEDBITS(32); */
                while (bits < 32) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                //===//
                if ((hold & 0xffff) !== ((hold >>> 16) ^ 0xffff)) {
                  strm.msg = 'invalid stored block lengths';
                  state.mode = BAD;
                  break;
                }
                state.length = hold & 0xffff;
                //Tracev((stderr, "inflate:       stored length %u\n",
                //        state.length));
                //=== INITBITS();
                hold = 0;
                bits = 0;
                //===//
                state.mode = COPY_;
                if (flush === Z_TREES) {
                  break inf_leave;
                }
                /* falls through */
              case COPY_:
                state.mode = COPY;
                /* falls through */
              case COPY:
                copy = state.length;
                if (copy) {
                  if (copy > have) {
                    copy = have;
                  }
                  if (copy > left) {
                    copy = left;
                  }
                  if (copy === 0) {
                    break inf_leave;
                  }
                  //--- zmemcpy(put, next, copy); ---
                  utils.arraySet(output, input, next, copy, put);
                  //---//
                  have -= copy;
                  next += copy;
                  left -= copy;
                  put += copy;
                  state.length -= copy;
                  break;
                }
                //Tracev((stderr, "inflate:       stored end\n"));
                state.mode = TYPE;
                break;
              case TABLE:
                //=== NEEDBITS(14); */
                while (bits < 14) {
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                }
                //===//
                state.nlen = (hold & 0x1f)/*BITS(5)*/ + 257;
                //--- DROPBITS(5) ---//
                hold >>>= 5;
                bits -= 5;
                //---//
                state.ndist = (hold & 0x1f)/*BITS(5)*/ + 1;
                //--- DROPBITS(5) ---//
                hold >>>= 5;
                bits -= 5;
                //---//
                state.ncode = (hold & 0x0f)/*BITS(4)*/ + 4;
                //--- DROPBITS(4) ---//
                hold >>>= 4;
                bits -= 4;
                //---//
//#ifndef PKZIP_BUG_WORKAROUND
                if (state.nlen > 286 || state.ndist > 30) {
                  strm.msg = 'too many length or distance symbols';
                  state.mode = BAD;
                  break;
                }
//#endif
                //Tracev((stderr, "inflate:       table sizes ok\n"));
                state.have = 0;
                state.mode = LENLENS;
                /* falls through */
              case LENLENS:
                while (state.have < state.ncode) {
                  //=== NEEDBITS(3);
                  while (bits < 3) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  //===//
                  state.lens[order[state.have++]] = (hold & 0x07);//BITS(3);
                  //--- DROPBITS(3) ---//
                  hold >>>= 3;
                  bits -= 3;
                  //---//
                }
                while (state.have < 19) {
                  state.lens[order[state.have++]] = 0;
                }
                // We have separate tables & no pointers. 2 commented lines below not needed.
                //state.next = state.codes;
                //state.lencode = state.next;
                // Switch to use dynamic table
                state.lencode = state.lendyn;
                state.lenbits = 7;

                opts = {bits: state.lenbits};
                ret = inflate_table(CODES, state.lens, 0, 19, state.lencode, 0, state.work, opts);
                state.lenbits = opts.bits;

                if (ret) {
                  strm.msg = 'invalid code lengths set';
                  state.mode = BAD;
                  break;
                }
                //Tracev((stderr, "inflate:       code lengths ok\n"));
                state.have = 0;
                state.mode = CODELENS;
                /* falls through */
              case CODELENS:
                while (state.have < state.nlen + state.ndist) {
                  for (; ;) {
                    here = state.lencode[hold & ((1 << state.lenbits) - 1)];
                    /*BITS(state.lenbits)*/
                    here_bits = here >>> 24;
                    here_op = (here >>> 16) & 0xff;
                    here_val = here & 0xffff;

                    if ((here_bits) <= bits) {
                      break;
                    }
                    //--- PULLBYTE() ---//
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                    //---//
                  }
                  if (here_val < 16) {
                    //--- DROPBITS(here.bits) ---//
                    hold >>>= here_bits;
                    bits -= here_bits;
                    //---//
                    state.lens[state.have++] = here_val;
                  }
                  else {
                    if (here_val === 16) {
                      //=== NEEDBITS(here.bits + 2);
                      n = here_bits + 2;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
            }
                      //===//
                      //--- DROPBITS(here.bits) ---//
                      hold >>>= here_bits;
                      bits -= here_bits;
                      //---//
                      if (state.have === 0) {
                        strm.msg = 'invalid bit length repeat';
                        state.mode = BAD;
                        break;
                      }
                      len = state.lens[state.have - 1];
                      copy = 3 + (hold & 0x03);//BITS(2);
                      //--- DROPBITS(2) ---//
                      hold >>>= 2;
                      bits -= 2;
                      //---//
                    }
                    else if (here_val === 17) {
                      //=== NEEDBITS(here.bits + 3);
                      n = here_bits + 3;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      //===//
                      //--- DROPBITS(here.bits) ---//
                      hold >>>= here_bits;
                      bits -= here_bits;
                      //---//
                      len = 0;
                      copy = 3 + (hold & 0x07);//BITS(3);
                      //--- DROPBITS(3) ---//
                      hold >>>= 3;
                      bits -= 3;
                      //---//
                    }
                    else {
                      //=== NEEDBITS(here.bits + 7);
                      n = here_bits + 7;
                      while (bits < n) {
                        if (have === 0) {
                          break inf_leave;
                        }
                        have--;
                        hold += input[next++] << bits;
                        bits += 8;
                      }
                      //===//
                      //--- DROPBITS(here.bits) ---//
                      hold >>>= here_bits;
                      bits -= here_bits;
                      //---//
                      len = 0;
                      copy = 11 + (hold & 0x7f);//BITS(7);
                      //--- DROPBITS(7) ---//
                      hold >>>= 7;
                      bits -= 7;
                      //---//
                    }
                    if (state.have + copy > state.nlen + state.ndist) {
                      strm.msg = 'invalid bit length repeat';
                      state.mode = BAD;
                      break;
                    }
                    while (copy--) {
                      state.lens[state.have++] = len;
                    }
                  }
                }

                /* handle error breaks in while */
                if (state.mode === BAD) {
                  break;
                }

                /* check for end-of-block code (better have one) */
                if (state.lens[256] === 0) {
                  strm.msg = 'invalid code -- missing end-of-block';
                  state.mode = BAD;
                  break;
                }

                /* build code tables -- note: do not change the lenbits or distbits
                 values here (9 and 6) without reading the comments in inftrees.h
                 concerning the ENOUGH constants, which depend on those values */
                state.lenbits = 9;

                opts = {bits: state.lenbits};
                ret = inflate_table(LENS, state.lens, 0, state.nlen, state.lencode, 0, state.work, opts);
                // We have separate tables & no pointers. 2 commented lines below not needed.
                // state.next_index = opts.table_index;
                state.lenbits = opts.bits;
                // state.lencode = state.next;

                if (ret) {
                  strm.msg = 'invalid literal/lengths set';
                  state.mode = BAD;
                  break;
                }

                state.distbits = 6;
                //state.distcode.copy(state.codes);
                // Switch to use dynamic table
                state.distcode = state.distdyn;
                opts = {bits: state.distbits};
                ret = inflate_table(DISTS, state.lens, state.nlen, state.ndist, state.distcode, 0, state.work, opts);
                // We have separate tables & no pointers. 2 commented lines below not needed.
                // state.next_index = opts.table_index;
                state.distbits = opts.bits;
                // state.distcode = state.next;

                if (ret) {
                  strm.msg = 'invalid distances set';
                  state.mode = BAD;
                  break;
                }
                //Tracev((stderr, 'inflate:       codes ok\n'));
                state.mode = LEN_;
                if (flush === Z_TREES) {
                  break inf_leave;
                }
                /* falls through */
              case LEN_:
                state.mode = LEN;
                /* falls through */
              case LEN:
                if (have >= 6 && left >= 258) {
                  //--- RESTORE() ---
                  strm.next_out = put;
                  strm.avail_out = left;
                  strm.next_in = next;
                  strm.avail_in = have;
                  state.hold = hold;
                  state.bits = bits;
                  //---
                  inflate_fast(strm, _out);
                  //--- LOAD() ---
                  put = strm.next_out;
                  output = strm.output;
                  left = strm.avail_out;
                  next = strm.next_in;
                  input = strm.input;
                  have = strm.avail_in;
                  hold = state.hold;
                  bits = state.bits;
                  //---

                  if (state.mode === TYPE) {
                    state.back = -1;
                  }
                  break;
                }
                state.back = 0;
                for (; ;) {
                  here = state.lencode[hold & ((1 << state.lenbits) - 1)];
                  /*BITS(state.lenbits)*/
                  here_bits = here >>> 24;
                  here_op = (here >>> 16) & 0xff;
                  here_val = here & 0xffff;

                  if (here_bits <= bits) {
                    break;
                  }
                  //--- PULLBYTE() ---//
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                  //---//
                }
                if (here_op && (here_op & 0xf0) === 0) {
                  last_bits = here_bits;
                  last_op = here_op;
                  last_val = here_val;
                  for (; ;) {
                    here = state.lencode[last_val +
                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
                    here_bits = here >>> 24;
                    here_op = (here >>> 16) & 0xff;
                    here_val = here & 0xffff;

                    if ((last_bits + here_bits) <= bits) {
                      break;
                    }
                    //--- PULLBYTE() ---//
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                    //---//
                  }
                  //--- DROPBITS(last.bits) ---//
                  hold >>>= last_bits;
                  bits -= last_bits;
                  //---//
                  state.back += last_bits;
                }
                //--- DROPBITS(here.bits) ---//
                hold >>>= here_bits;
                bits -= here_bits;
                //---//
                state.back += here_bits;
                state.length = here_val;
                if (here_op === 0) {
                  //Tracevv((stderr, here.val >= 0x20 && here.val < 0x7f ?
                  //        "inflate:         literal '%c'\n" :
                  //        "inflate:         literal 0x%02x\n", here.val));
                  state.mode = LIT;
                  break;
                }
                if (here_op & 32) {
                  //Tracevv((stderr, "inflate:         end of block\n"));
                  state.back = -1;
                  state.mode = TYPE;
                  break;
                }
                if (here_op & 64) {
                  strm.msg = 'invalid literal/length code';
                  state.mode = BAD;
                  break;
                }
                state.extra = here_op & 15;
                state.mode = LENEXT;
                /* falls through */
              case LENEXT:
                if (state.extra) {
                  //=== NEEDBITS(state.extra);
                  n = state.extra;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  //===//
                  state.length += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
                  //--- DROPBITS(state.extra) ---//
                  hold >>>= state.extra;
                  bits -= state.extra;
                  //---//
                  state.back += state.extra;
                }
                //Tracevv((stderr, "inflate:         length %u\n", state.length));
                state.was = state.length;
                state.mode = DIST;
                /* falls through */
              case DIST:
                for (; ;) {
                  here = state.distcode[hold & ((1 << state.distbits) - 1)];
                  /*BITS(state.distbits)*/
                  here_bits = here >>> 24;
                  here_op = (here >>> 16) & 0xff;
                  here_val = here & 0xffff;

                  if ((here_bits) <= bits) {
                    break;
                  }
                  //--- PULLBYTE() ---//
                  if (have === 0) {
                    break inf_leave;
                  }
                  have--;
                  hold += input[next++] << bits;
                  bits += 8;
                  //---//
                }
                if ((here_op & 0xf0) === 0) {
                  last_bits = here_bits;
                  last_op = here_op;
                  last_val = here_val;
                  for (; ;) {
                    here = state.distcode[last_val +
                    ((hold & ((1 << (last_bits + last_op)) - 1))/*BITS(last.bits + last.op)*/ >> last_bits)];
                    here_bits = here >>> 24;
                    here_op = (here >>> 16) & 0xff;
                    here_val = here & 0xffff;

                    if ((last_bits + here_bits) <= bits) {
                      break;
                    }
                    //--- PULLBYTE() ---//
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                    //---//
                  }
                  //--- DROPBITS(last.bits) ---//
                  hold >>>= last_bits;
                  bits -= last_bits;
                  //---//
                  state.back += last_bits;
                }
                //--- DROPBITS(here.bits) ---//
                hold >>>= here_bits;
                bits -= here_bits;
                //---//
                state.back += here_bits;
                if (here_op & 64) {
                  strm.msg = 'invalid distance code';
                  state.mode = BAD;
                  break;
                }
                state.offset = here_val;
                state.extra = (here_op) & 15;
                state.mode = DISTEXT;
                /* falls through */
              case DISTEXT:
                if (state.extra) {
                  //=== NEEDBITS(state.extra);
                  n = state.extra;
                  while (bits < n) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  //===//
                  state.offset += hold & ((1 << state.extra) - 1)/*BITS(state.extra)*/;
                  //--- DROPBITS(state.extra) ---//
                  hold >>>= state.extra;
                  bits -= state.extra;
                  //---//
                  state.back += state.extra;
                }
//#ifdef INFLATE_STRICT
                if (state.offset > state.dmax) {
                  strm.msg = 'invalid distance too far back';
                  state.mode = BAD;
                  break;
                }
//#endif
                //Tracevv((stderr, "inflate:         distance %u\n", state.offset));
                state.mode = MATCH;
                /* falls through */
              case MATCH:
                if (left === 0) {
                  break inf_leave;
                }
                copy = _out - left;
                if (state.offset > copy) {         /* copy from window */
                  copy = state.offset - copy;
                  if (copy > state.whave) {
                    if (state.sane) {
                      strm.msg = 'invalid distance too far back';
                      state.mode = BAD;
                      break;
                    }
// (!) This block is disabled in zlib defailts,
// don't enable it for binary compatibility
//#ifdef INFLATE_ALLOW_INVALID_DISTANCE_TOOFAR_ARRR
//          Trace((stderr, "inflate.c too far\n"));
//          copy -= state.whave;
//          if (copy > state.length) { copy = state.length; }
//          if (copy > left) { copy = left; }
//          left -= copy;
//          state.length -= copy;
//          do {
//            output[put++] = 0;
//          } while (--copy);
//          if (state.length === 0) { state.mode = LEN; }
//          break;
//#endif
        }
                  if (copy > state.wnext) {
                    copy -= state.wnext;
                    from = state.wsize - copy;
                  }
                  else {
                    from = state.wnext - copy;
                  }
                  if (copy > state.length) {
                    copy = state.length;
                  }
                  from_source = state.window;
      }
                else {                              /* copy from output */
                  from_source = output;
                  from = put - state.offset;
                  copy = state.length;
      }
                if (copy > left) {
                  copy = left;
                }
                left -= copy;
                state.length -= copy;
                do {
                  output[put++] = from_source[from++];
                } while (--copy);
                if (state.length === 0) {
                  state.mode = LEN;
                }
                break;
              case LIT:
                if (left === 0) {
                  break inf_leave;
                }
                output[put++] = state.length;
                left--;
                state.mode = LEN;
                break;
              case CHECK:
                if (state.wrap) {
                  //=== NEEDBITS(32);
                  while (bits < 32) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    // Use '|' insdead of '+' to make sure that result is signed
                    hold |= input[next++] << bits;
                    bits += 8;
                  }
                  //===//
                  _out -= left;
                  strm.total_out += _out;
                  state.total += _out;
                  if (_out) {
                    strm.adler = state.check =
                        /*UPDATE(state.check, put - _out, _out);*/
                        (state.flags ? crc32(state.check, output, _out, put - _out) : adler32(state.check, output, _out, put - _out));

                  }
                  _out = left;
                  // NB: crc32 stored as signed 32-bit int, ZSWAP32 returns signed too
                  if ((state.flags ? hold : ZSWAP32(hold)) !== state.check) {
                    strm.msg = 'incorrect data check';
                    state.mode = BAD;
                    break;
                  }
                  //=== INITBITS();
                  hold = 0;
                  bits = 0;
                  //===//
                  //Tracev((stderr, "inflate:   check matches trailer\n"));
      }
                state.mode = LENGTH;
                /* falls through */
              case LENGTH:
                if (state.wrap && state.flags) {
                  //=== NEEDBITS(32);
                  while (bits < 32) {
                    if (have === 0) {
                      break inf_leave;
                    }
                    have--;
                    hold += input[next++] << bits;
                    bits += 8;
                  }
                  //===//
                  if (hold !== (state.total & 0xffffffff)) {
                    strm.msg = 'incorrect length check';
                    state.mode = BAD;
                    break;
                  }
                  //=== INITBITS();
                  hold = 0;
                  bits = 0;
                  //===//
                  //Tracev((stderr, "inflate:   length matches trailer\n"));
                }
                state.mode = DONE;
                /* falls through */
              case DONE:
                ret = Z_STREAM_END;
                break inf_leave;
              case BAD:
                ret = Z_DATA_ERROR;
                break inf_leave;
              case MEM:
                return Z_MEM_ERROR;
              case SYNC:
                /* falls through */
              default:
                return Z_STREAM_ERROR;
    }
          }

      // inf_leave <- here is real place for "goto inf_leave", emulated via "break inf_leave"

      /*
       Return from inflate(), updating the total counts and the check value.
       If there was no progress during the inflate() call, return a buffer
       error.  Call updatewindow() to create and/or update the window state.
       Note: a memory error from inflate() is non-recoverable.
       */

      //--- RESTORE() ---
      strm.next_out = put;
      strm.avail_out = left;
      strm.next_in = next;
      strm.avail_in = have;
      state.hold = hold;
      state.bits = bits;
      //---

      if (state.wsize || (_out !== strm.avail_out && state.mode < BAD &&
          (state.mode < CHECK || flush !== Z_FINISH))) {
        if (updatewindow(strm, strm.output, strm.next_out, _out - strm.avail_out)) {
          state.mode = MEM;
          return Z_MEM_ERROR;
    }
      }
      _in -= strm.avail_in;
      _out -= strm.avail_out;
      strm.total_in += _in;
      strm.total_out += _out;
      state.total += _out;
      if (state.wrap && _out) {
        strm.adler = state.check = /*UPDATE(state.check, strm.next_out - _out, _out);*/
            (state.flags ? crc32(state.check, output, _out, strm.next_out - _out) : adler32(state.check, output, _out, strm.next_out - _out));
      }
      strm.data_type = state.bits + (state.last ? 64 : 0) +
          (state.mode === TYPE ? 128 : 0) +
          (state.mode === LEN_ || state.mode === COPY_ ? 256 : 0);
      if (((_in === 0 && _out === 0) || flush === Z_FINISH) && ret === Z_OK) {
        ret = Z_BUF_ERROR;
      }
      return ret;
    }

    function inflateEnd(strm) {

      if (!strm || !strm.state /*|| strm->zfree == (free_func)0*/) {
        return Z_STREAM_ERROR;
      }

      var state = strm.state;
      if (state.window) {
        state.window = null;
      }
      strm.state = null;
      return Z_OK;
    }

    function inflateGetHeader(strm, head) {
      var state;

      /* check state */
      if (!strm || !strm.state) {
        return Z_STREAM_ERROR;
      }
      state = strm.state;
      if ((state.wrap & 2) === 0) {
        return Z_STREAM_ERROR;
      }

      /* save header structure */
      state.head = head;
      head.done = false;
      return Z_OK;
    }


    exports.inflateReset = inflateReset;
    exports.inflateReset2 = inflateReset2;
    exports.inflateResetKeep = inflateResetKeep;
    exports.inflateInit = inflateInit;
    exports.inflateInit2 = inflateInit2;
    exports.inflate = inflate;
    exports.inflateEnd = inflateEnd;
    exports.inflateGetHeader = inflateGetHeader;
    exports.inflateInfo = 'pako inflate (from Nodeca project)';

    /* Not implemented
     exports.inflateCopy = inflateCopy;
     exports.inflateGetDictionary = inflateGetDictionary;
     exports.inflateMark = inflateMark;
     exports.inflatePrime = inflatePrime;
     exports.inflateSetDictionary = inflateSetDictionary;
     exports.inflateSync = inflateSync;
     exports.inflateSyncPoint = inflateSyncPoint;
     exports.inflateUndermine = inflateUndermine;
     */

  }, {"../utils/common": 4, "./adler32": 5, "./crc32": 7, "./inffast": 9, "./inftrees": 11}],
  11: [function (require, module, exports) {
    'use strict';


    var utils = require('../utils/common');

    var MAXBITS = 15;
    var ENOUGH_LENS = 852;
    var ENOUGH_DISTS = 592;
//var ENOUGH = (ENOUGH_LENS+ENOUGH_DISTS);

    var CODES = 0;
    var LENS = 1;
    var DISTS = 2;

    var lbase = [/* Length codes 257..285 base */
      3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31,
      35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 0, 0
    ];

    var lext = [/* Length codes 257..285 extra */
      16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 18, 18, 18, 18,
      19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21, 21, 16, 72, 78
    ];

    var dbase = [/* Distance codes 0..29 base */
      1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
      257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145,
      8193, 12289, 16385, 24577, 0, 0
    ];

    var dext = [/* Distance codes 0..29 extra */
      16, 16, 16, 16, 17, 17, 18, 18, 19, 19, 20, 20, 21, 21, 22, 22,
      23, 23, 24, 24, 25, 25, 26, 26, 27, 27,
      28, 28, 29, 29, 64, 64
    ];

    module.exports = function inflate_table(type, lens, lens_index, codes, table, table_index, work, opts) {
      var bits = opts.bits;
      //here = opts.here; /* table entry for duplication */

      var len = 0;
      /* a code's length in bits */
      var sym = 0;
      /* index of code symbols */
      var min = 0, max = 0;
      /* minimum and maximum code lengths */
      var root = 0;
      /* number of index bits for root table */
      var curr = 0;
      /* number of index bits for current table */
      var drop = 0;
      /* code bits to drop for sub-table */
      var left = 0;
      /* number of prefix codes available */
      var used = 0;
      /* code entries in table used */
      var huff = 0;
      /* Huffman code */
      var incr;
      /* for incrementing code, index */
      var fill;
      /* index for replicating entries */
      var low;
      /* low bits for current root entry */
      var mask;
      /* mask for low root bits */
      var next;
      /* next available space in table */
      var base = null;
      /* base value table to use */
      var base_index = 0;
//  var shoextra;    /* extra bits table to use */
      var end;
      /* use base and extra for symbol > end */
      var count = new utils.Buf16(MAXBITS + 1); //[MAXBITS+1];    /* number of codes of each length */
      var offs = new utils.Buf16(MAXBITS + 1); //[MAXBITS+1];     /* offsets in table for each length */
      var extra = null;
      var extra_index = 0;

      var here_bits, here_op, here_val;

      /*
       Process a set of code lengths to create a canonical Huffman code.  The
       code lengths are lens[0..codes-1].  Each length corresponds to the
       symbols 0..codes-1.  The Huffman code is generated by first sorting the
       symbols by length from short to long, and retaining the symbol order
       for codes with equal lengths.  Then the code starts with all zero bits
       for the first code of the shortest length, and the codes are integer
       increments for the same length, and zeros are appended as the length
       increases.  For the deflate format, these bits are stored backwards
       from their more natural integer increment ordering, and so when the
       decoding tables are built in the large loop below, the integer codes
       are incremented backwards.

       This routine assumes, but does not check, that all of the entries in
       lens[] are in the range 0..MAXBITS.  The caller must assure this.
       1..MAXBITS is interpreted as that code length.  zero means that that
       symbol does not occur in this code.

       The codes are sorted by computing a count of codes for each length,
       creating from that a table of starting indices for each length in the
       sorted table, and then entering the symbols in order in the sorted
       table.  The sorted table is work[], with that space being provided by
       the caller.

       The length counts are used for other purposes as well, i.e. finding
       the minimum and maximum length codes, determining if there are any
       codes at all, checking for a valid set of lengths, and looking ahead
       at length counts to determine sub-table sizes when building the
       decoding tables.
       */

      /* accumulate lengths for codes (assumes lens[] all in 0..MAXBITS) */
      for (len = 0; len <= MAXBITS; len++) {
        count[len] = 0;
      }
      for (sym = 0; sym < codes; sym++) {
        count[lens[lens_index + sym]]++;
      }

      /* bound code lengths, force root to be within code lengths */
      root = bits;
      for (max = MAXBITS; max >= 1; max--) {
        if (count[max] !== 0) {
          break;
        }
      }
      if (root > max) {
        root = max;
      }
      if (max === 0) {                     /* no symbols to code at all */
        //table.op[opts.table_index] = 64;  //here.op = (var char)64;    /* invalid code marker */
        //table.bits[opts.table_index] = 1;   //here.bits = (var char)1;
        //table.val[opts.table_index++] = 0;   //here.val = (var short)0;
        table[table_index++] = (1 << 24) | (64 << 16) | 0;


        //table.op[opts.table_index] = 64;
        //table.bits[opts.table_index] = 1;
        //table.val[opts.table_index++] = 0;
        table[table_index++] = (1 << 24) | (64 << 16) | 0;

        opts.bits = 1;
        return 0;
        /* no symbols, but wait for decoding to report error */
      }
      for (min = 1; min < max; min++) {
        if (count[min] !== 0) {
          break;
        }
      }
      if (root < min) {
        root = min;
      }

      /* check for an over-subscribed or incomplete set of lengths */
      left = 1;
      for (len = 1; len <= MAXBITS; len++) {
        left <<= 1;
        left -= count[len];
        if (left < 0) {
          return -1;
        }
        /* over-subscribed */
      }
      if (left > 0 && (type === CODES || max !== 1)) {
        return -1;
        /* incomplete set */
      }

      /* generate offsets into symbol table for each length for sorting */
      offs[1] = 0;
      for (len = 1; len < MAXBITS; len++) {
        offs[len + 1] = offs[len] + count[len];
      }

      /* sort symbols by length, by symbol order within each length */
      for (sym = 0; sym < codes; sym++) {
        if (lens[lens_index + sym] !== 0) {
          work[offs[lens[lens_index + sym]]++] = sym;
        }
      }

      /*
       Create and fill in decoding tables.  In this loop, the table being
       filled is at next and has curr index bits.  The code being used is huff
       with length len.  That code is converted to an index by dropping drop
       bits off of the bottom.  For codes where len is less than drop + curr,
       those top drop + curr - len bits are incremented through all values to
       fill the table with replicated entries.

       root is the number of index bits for the root table.  When len exceeds
       root, sub-tables are created pointed to by the root entry with an index
       of the low root bits of huff.  This is saved in low to check for when a
       new sub-table should be started.  drop is zero when the root table is
       being filled, and drop is root when sub-tables are being filled.

       When a new sub-table is needed, it is necessary to look ahead in the
       code lengths to determine what size sub-table is needed.  The length
       counts are used for this, and so count[] is decremented as codes are
       entered in the tables.

       used keeps track of how many table entries have been allocated from the
       provided *table space.  It is checked for LENS and DIST tables against
       the constants ENOUGH_LENS and ENOUGH_DISTS to guard against changes in
       the initial root table size constants.  See the comments in inftrees.h
       for more information.

       sym increments through all symbols, and the loop terminates when
       all codes of length max, i.e. all codes, have been processed.  This
       routine permits incomplete codes, so another loop after this one fills
       in the rest of the decoding tables with invalid code markers.
       */

      /* set up for code type */
      // poor man optimization - use if-else instead of switch,
      // to avoid deopts in old v8
      if (type === CODES) {
        base = extra = work;
        /* dummy value--not used */
        end = 19;

      } else if (type === LENS) {
        base = lbase;
        base_index -= 257;
        extra = lext;
        extra_index -= 257;
        end = 256;

      } else {                    /* DISTS */
        base = dbase;
        extra = dext;
        end = -1;
      }

      /* initialize opts for loop */
      huff = 0;
      /* starting code */
      sym = 0;
      /* starting code symbol */
      len = min;
      /* starting code length */
      next = table_index;
      /* current table to fill in */
      curr = root;
      /* current table index bits */
      drop = 0;
      /* current bits to drop from code for index */
      low = -1;
      /* trigger new sub-table when len > root */
      used = 1 << root;
      /* use root table entries */
      mask = used - 1;
      /* mask for comparing low */

      /* check available table space */
      if ((type === LENS && used > ENOUGH_LENS) ||
          (type === DISTS && used > ENOUGH_DISTS)) {
        return 1;
      }

      var i = 0;
      /* process all codes and make table entries */
      for (; ;) {
        i++;
        /* create table entry */
        here_bits = len - drop;
        if (work[sym] < end) {
          here_op = 0;
          here_val = work[sym];
        }
        else if (work[sym] > end) {
          here_op = extra[extra_index + work[sym]];
          here_val = base[base_index + work[sym]];
        }
        else {
          here_op = 32 + 64;
          /* end of block */
          here_val = 0;
        }

        /* replicate for those indices with low len bits equal to huff */
        incr = 1 << (len - drop);
        fill = 1 << curr;
        min = fill;
        /* save offset to next table */
        do {
          fill -= incr;
          table[next + (huff >> drop) + fill] = (here_bits << 24) | (here_op << 16) | here_val | 0;
        } while (fill !== 0);

        /* backwards increment the len-bit code huff */
        incr = 1 << (len - 1);
        while (huff & incr) {
          incr >>= 1;
        }
        if (incr !== 0) {
          huff &= incr - 1;
          huff += incr;
        } else {
      huff = 0;
        }

        /* go to next symbol, update count, len */
        sym++;
        if (--count[len] === 0) {
          if (len === max) {
            break;
          }
          len = lens[lens_index + work[sym]];
        }

        /* create new sub-table if needed */
        if (len > root && (huff & mask) !== low) {
          /* if first time, transition to sub-tables */
          if (drop === 0) {
            drop = root;
      }

          /* increment past last table */
          next += min;
          /* here min is 1 << curr */

          /* determine length of next table */
          curr = len - drop;
          left = 1 << curr;
          while (curr + drop < max) {
            left -= count[curr + drop];
            if (left <= 0) {
              break;
            }
            curr++;
        left <<= 1;
      }

          /* check for enough space */
          used += 1 << curr;
      if ((type === LENS && used > ENOUGH_LENS) ||
          (type === DISTS && used > ENOUGH_DISTS)) {
        return 1;
      }

          /* point entry in root table to sub-table */
          low = huff & mask;
          /*table.op[low] = curr;
           table.bits[low] = root;
           table.val[low] = next - opts.table_index;*/
          table[low] = (root << 24) | (curr << 16) | (next - table_index) | 0;
        }
      }

      /* fill in remaining table entry if code is incomplete (guaranteed to have
       at most one remaining entry, since if the code is incomplete, the
       maximum code length that was allowed to get this far is one bit) */
      if (huff !== 0) {
        //table.op[next + huff] = 64;            /* invalid code marker */
        //table.bits[next + huff] = len - drop;
        //table.val[next + huff] = 0;
        table[next + huff] = ((len - drop) << 24) | (64 << 16) | 0;
      }

      /* set return parameters */
      //opts.table_index += used;
      opts.bits = root;
      return 0;
    };

  }, {"../utils/common": 4}],
  12: [function (require, module, exports) {
    'use strict';

    module.exports = {
      '2': 'need dictionary', /* Z_NEED_DICT       2  */
      '1': 'stream end', /* Z_STREAM_END      1  */
      '0': '', /* Z_OK              0  */
      '-1': 'file error', /* Z_ERRNO         (-1) */
      '-2': 'stream error', /* Z_STREAM_ERROR  (-2) */
      '-3': 'data error', /* Z_DATA_ERROR    (-3) */
      '-4': 'insufficient memory', /* Z_MEM_ERROR     (-4) */
      '-5': 'buffer error', /* Z_BUF_ERROR     (-5) */
      '-6': 'incompatible version' /* Z_VERSION_ERROR (-6) */
    };

  }, {}],
  13: [function (require, module, exports) {
    'use strict';


    var utils = require('../utils/common');

    /* Public constants ==========================================================*/
    /* ===========================================================================*/


//var Z_FILTERED          = 1;
//var Z_HUFFMAN_ONLY      = 2;
//var Z_RLE               = 3;
    var Z_FIXED = 4;
//var Z_DEFAULT_STRATEGY  = 0;

    /* Possible values of the data_type field (though see inflate()) */
    var Z_BINARY = 0;
    var Z_TEXT = 1;
//var Z_ASCII             = 1; // = Z_TEXT
    var Z_UNKNOWN = 2;

    /*============================================================================*/


    function zero(buf) {
      var len = buf.length;
      while (--len >= 0) {
        buf[len] = 0;
      }
    }

// From zutil.h

    var STORED_BLOCK = 0;
    var STATIC_TREES = 1;
    var DYN_TREES = 2;
    /* The three kinds of block type */

    var MIN_MATCH = 3;
    var MAX_MATCH = 258;
    /* The minimum and maximum match lengths */

// From deflate.h
    /* ===========================================================================
     * Internal compression state.
     */

    var LENGTH_CODES = 29;
    /* number of length codes, not counting the special END_BLOCK code */

    var LITERALS = 256;
    /* number of literal bytes 0..255 */

    var L_CODES = LITERALS + 1 + LENGTH_CODES;
    /* number of Literal or Length codes, including the END_BLOCK code */

    var D_CODES = 30;
    /* number of distance codes */

    var BL_CODES = 19;
    /* number of codes used to transfer the bit lengths */

    var HEAP_SIZE = 2 * L_CODES + 1;
    /* maximum heap size */

    var MAX_BITS = 15;
    /* All codes must not exceed MAX_BITS bits */

    var Buf_size = 16;
    /* size of bit buffer in bi_buf */


    /* ===========================================================================
     * Constants
     */

    var MAX_BL_BITS = 7;
    /* Bit length codes must not exceed MAX_BL_BITS bits */

    var END_BLOCK = 256;
    /* end of block literal code */

    var REP_3_6 = 16;
    /* repeat previous bit length 3-6 times (2 bits of repeat count) */

    var REPZ_3_10 = 17;
    /* repeat a zero length 3-10 times  (3 bits of repeat count) */

    var REPZ_11_138 = 18;
    /* repeat a zero length 11-138 times  (7 bits of repeat count) */

    var extra_lbits = /* extra bits for each length code */
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0];

    var extra_dbits = /* extra bits for each distance code */
        [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13];

    var extra_blbits = /* extra bits for each bit length code */
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 7];

    var bl_order =
        [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
    /* The lengths of the bit length codes are sent in order of decreasing
     * probability, to avoid transmitting the lengths for unused bit length codes.
     */

    /* ===========================================================================
     * Local data. These are initialized only once.
     */

// We pre-fill arrays with 0 to avoid uninitialized gaps

    var DIST_CODE_LEN = 512;
    /* see definition of array dist_code below */

// !!!! Use flat array insdead of structure, Freq = i*2, Len = i*2+1
    var static_ltree = new Array((L_CODES + 2) * 2);
    zero(static_ltree);
    /* The static literal tree. Since the bit lengths are imposed, there is no
     * need for the L_CODES extra codes used during heap construction. However
     * The codes 286 and 287 are needed to build a canonical tree (see _tr_init
     * below).
     */

    var static_dtree = new Array(D_CODES * 2);
    zero(static_dtree);
    /* The static distance tree. (Actually a trivial tree since all codes use
     * 5 bits.)
     */

    var _dist_code = new Array(DIST_CODE_LEN);
    zero(_dist_code);
    /* Distance codes. The first 256 values correspond to the distances
     * 3 .. 258, the last 256 values correspond to the top 8 bits of
     * the 15 bit distances.
     */

    var _length_code = new Array(MAX_MATCH - MIN_MATCH + 1);
    zero(_length_code);
    /* length code for each normalized match length (0 == MIN_MATCH) */

    var base_length = new Array(LENGTH_CODES);
    zero(base_length);
    /* First normalized length for each code (0 = MIN_MATCH) */

    var base_dist = new Array(D_CODES);
    zero(base_dist);
    /* First normalized distance for each code (0 = distance of 1) */


    var StaticTreeDesc = function (static_tree, extra_bits, extra_base, elems, max_length) {

      this.static_tree = static_tree;
      /* static tree or NULL */
      this.extra_bits = extra_bits;
      /* extra bits for each code or NULL */
      this.extra_base = extra_base;
      /* base index for extra_bits */
      this.elems = elems;
      /* max number of elements in the tree */
      this.max_length = max_length;
      /* max bit length for the codes */

      // show if `static_tree` has data or dummy - needed for monomorphic objects
      this.has_stree = static_tree && static_tree.length;
    };


    var static_l_desc;
    var static_d_desc;
    var static_bl_desc;


    var TreeDesc = function (dyn_tree, stat_desc) {
      this.dyn_tree = dyn_tree;
      /* the dynamic tree */
      this.max_code = 0;
      /* largest code with non zero frequency */
      this.stat_desc = stat_desc;
      /* the corresponding static tree */
    };


    function d_code(dist) {
      return dist < 256 ? _dist_code[dist] : _dist_code[256 + (dist >>> 7)];
    }


    /* ===========================================================================
     * Output a short LSB first on the stream.
     * IN assertion: there is enough room in pendingBuf.
     */
    function put_short(s, w) {
//    put_byte(s, (uch)((w) & 0xff));
//    put_byte(s, (uch)((ush)(w) >> 8));
      s.pending_buf[s.pending++] = (w) & 0xff;
      s.pending_buf[s.pending++] = (w >>> 8) & 0xff;
    }


    /* ===========================================================================
     * Send a value on a given number of bits.
     * IN assertion: length <= 16 and value fits in length bits.
     */
    function send_bits(s, value, length) {
      if (s.bi_valid > (Buf_size - length)) {
        s.bi_buf |= (value << s.bi_valid) & 0xffff;
        put_short(s, s.bi_buf);
        s.bi_buf = value >> (Buf_size - s.bi_valid);
        s.bi_valid += length - Buf_size;
      } else {
        s.bi_buf |= (value << s.bi_valid) & 0xffff;
        s.bi_valid += length;
      }
    }


    function send_code(s, c, tree) {
      send_bits(s, tree[c * 2]/*.Code*/, tree[c * 2 + 1]/*.Len*/);
    }


    /* ===========================================================================
     * Reverse the first len bits of a code, using straightforward code (a faster
     * method would use a table)
     * IN assertion: 1 <= len <= 15
     */
    function bi_reverse(code, len) {
      var res = 0;
      do {
        res |= code & 1;
        code >>>= 1;
        res <<= 1;
      } while (--len > 0);
      return res >>> 1;
    }


    /* ===========================================================================
     * Flush the bit buffer, keeping at most 7 bits in it.
     */
    function bi_flush(s) {
      if (s.bi_valid === 16) {
        put_short(s, s.bi_buf);
        s.bi_buf = 0;
        s.bi_valid = 0;

      } else if (s.bi_valid >= 8) {
        s.pending_buf[s.pending++] = s.bi_buf & 0xff;
        s.bi_buf >>= 8;
        s.bi_valid -= 8;
      }
    }


    /* ===========================================================================
     * Compute the optimal bit lengths for a tree and update the total bit length
     * for the current block.
     * IN assertion: the fields freq and dad are set, heap[heap_max] and
     *    above are the tree nodes sorted by increasing frequency.
     * OUT assertions: the field len is set to the optimal bit length, the
     *     array bl_count contains the frequencies for each bit length.
     *     The length opt_len is updated; static_len is also updated if stree is
     *     not null.
     */
    function gen_bitlen(s, desc)
//    deflate_state *s;
//    tree_desc *desc;    /* the tree descriptor */
    {
      var tree = desc.dyn_tree;
      var max_code = desc.max_code;
      var stree = desc.stat_desc.static_tree;
      var has_stree = desc.stat_desc.has_stree;
      var extra = desc.stat_desc.extra_bits;
      var base = desc.stat_desc.extra_base;
      var max_length = desc.stat_desc.max_length;
      var h;
      /* heap index */
      var n, m;
      /* iterate over the tree elements */
      var bits;
      /* bit length */
      var xbits;
      /* extra bits */
      var f;
      /* frequency */
      var overflow = 0;
      /* number of elements with bit length too large */

      for (bits = 0; bits <= MAX_BITS; bits++) {
        s.bl_count[bits] = 0;
      }

      /* In a first pass, compute the optimal bit lengths (which may
       * overflow in the case of the bit length tree).
       */
      tree[s.heap[s.heap_max] * 2 + 1]/*.Len*/ = 0;
      /* root of the heap */

      for (h = s.heap_max + 1; h < HEAP_SIZE; h++) {
        n = s.heap[h];
        bits = tree[tree[n * 2 + 1]/*.Dad*/ * 2 + 1]/*.Len*/ + 1;
        if (bits > max_length) {
          bits = max_length;
          overflow++;
        }
        tree[n * 2 + 1]/*.Len*/ = bits;
        /* We overwrite tree[n].Dad which is no longer needed */

        if (n > max_code) {
          continue;
        }
        /* not a leaf node */

        s.bl_count[bits]++;
        xbits = 0;
        if (n >= base) {
          xbits = extra[n - base];
    }
        f = tree[n * 2]/*.Freq*/;
        s.opt_len += f * (bits + xbits);
        if (has_stree) {
          s.static_len += f * (stree[n * 2 + 1]/*.Len*/ + xbits);
        }
      }
      if (overflow === 0) {
        return;
      }

      // Trace((stderr,"\nbit length overflow\n"));
      /* This happens for example on obj2 and pic of the Calgary corpus */

      /* Find the first bit length which could increase: */
      do {
        bits = max_length - 1;
        while (s.bl_count[bits] === 0) {
          bits--;
        }
        s.bl_count[bits]--;
        /* move one leaf down the tree */
        s.bl_count[bits + 1] += 2;
        /* move one overflow item as its brother */
        s.bl_count[max_length]--;
        /* The brother of the overflow item also moves one step up,
         * but this does not affect bl_count[max_length]
     */
        overflow -= 2;
      } while (overflow > 0);

      /* Now recompute all bit lengths, scanning in increasing frequency.
       * h is still equal to HEAP_SIZE. (It is simpler to reconstruct all
       * lengths instead of fixing only the wrong ones. This idea is taken
       * from 'ar' written by Haruhiko Okumura.)
       */
      for (bits = max_length; bits !== 0; bits--) {
        n = s.bl_count[bits];
        while (n !== 0) {
          m = s.heap[--h];
          if (m > max_code) {
            continue;
          }
          if (tree[m * 2 + 1]/*.Len*/ !== bits) {
            // Trace((stderr,"code %d bits %d->%d\n", m, tree[m].Len, bits));
            s.opt_len += (bits - tree[m * 2 + 1]/*.Len*/) * tree[m * 2]/*.Freq*/;
            tree[m * 2 + 1]/*.Len*/ = bits;
      }
          n--;
    }
      }
    }


    /* ===========================================================================
     * Generate the codes for a given tree and bit counts (which need not be
     * optimal).
     * IN assertion: the array bl_count contains the bit length statistics for
     * the given tree and the field len is set for all tree elements.
     * OUT assertion: the field code is set for all tree elements of non
     *     zero code length.
     */
    function gen_codes(tree, max_code, bl_count)
//    ct_data *tree;             /* the tree to decorate */
//    int max_code;              /* largest code with non zero frequency */
//    ushf *bl_count;            /* number of codes at each bit length */
    {
      var next_code = new Array(MAX_BITS + 1);
      /* next code value for each bit length */
      var code = 0;
      /* running code value */
      var bits;
      /* bit index */
      var n;
      /* code index */

      /* The distribution counts are first used to generate the code values
       * without bit reversal.
       */
      for (bits = 1; bits <= MAX_BITS; bits++) {
        next_code[bits] = code = (code + bl_count[bits - 1]) << 1;
      }
      /* Check that the bit counts in bl_count are consistent. The last code
       * must be all ones.
       */
      //Assert (code + bl_count[MAX_BITS]-1 == (1<<MAX_BITS)-1,
      //        "inconsistent bit counts");
      //Tracev((stderr,"\ngen_codes: max_code %d ", max_code));

      for (n = 0; n <= max_code; n++) {
        var len = tree[n * 2 + 1]/*.Len*/;
        if (len === 0) {
          continue;
        }
        /* Now reverse the bits */
        tree[n * 2]/*.Code*/ = bi_reverse(next_code[len]++, len);

        //Tracecv(tree != static_ltree, (stderr,"\nn %3d %c l %2d c %4x (%x) ",
        //     n, (isgraph(n) ? n : ' '), len, tree[n].Code, next_code[len]-1));
      }
    }


    /* ===========================================================================
     * Initialize the various 'constant' tables.
     */
    function tr_static_init() {
      var n;
      /* iterates over tree elements */
      var bits;
      /* bit counter */
      var length;
      /* length value */
      var code;
      /* code value */
      var dist;
      /* distance index */
      var bl_count = new Array(MAX_BITS + 1);
      /* number of codes at each bit length for an optimal tree */

      // do check in _tr_init()
      //if (static_init_done) return;

      /* For some embedded targets, global variables are not initialized: */
      /*#ifdef NO_INIT_GLOBAL_POINTERS
       static_l_desc.static_tree = static_ltree;
       static_l_desc.extra_bits = extra_lbits;
       static_d_desc.static_tree = static_dtree;
       static_d_desc.extra_bits = extra_dbits;
       static_bl_desc.extra_bits = extra_blbits;
       #endif*/

      /* Initialize the mapping length (0..255) -> length code (0..28) */
      length = 0;
      for (code = 0; code < LENGTH_CODES - 1; code++) {
        base_length[code] = length;
        for (n = 0; n < (1 << extra_lbits[code]); n++) {
          _length_code[length++] = code;
        }
      }
      //Assert (length == 256, "tr_static_init: length != 256");
      /* Note that the length 255 (match length 258) can be represented
       * in two different ways: code 284 + 5 bits or code 285, so we
       * overwrite length_code[255] to use the best encoding:
       */
      _length_code[length - 1] = code;

      /* Initialize the mapping dist (0..32K) -> dist code (0..29) */
      dist = 0;
      for (code = 0; code < 16; code++) {
        base_dist[code] = dist;
        for (n = 0; n < (1 << extra_dbits[code]); n++) {
          _dist_code[dist++] = code;
        }
      }
      //Assert (dist == 256, "tr_static_init: dist != 256");
      dist >>= 7;
      /* from now on, all distances are divided by 128 */
      for (; code < D_CODES; code++) {
        base_dist[code] = dist << 7;
        for (n = 0; n < (1 << (extra_dbits[code] - 7)); n++) {
          _dist_code[256 + dist++] = code;
        }
      }
      //Assert (dist == 256, "tr_static_init: 256+dist != 512");

      /* Construct the codes of the static literal tree */
      for (bits = 0; bits <= MAX_BITS; bits++) {
        bl_count[bits] = 0;
      }

      n = 0;
      while (n <= 143) {
        static_ltree[n * 2 + 1]/*.Len*/ = 8;
        n++;
        bl_count[8]++;
      }
      while (n <= 255) {
        static_ltree[n * 2 + 1]/*.Len*/ = 9;
        n++;
        bl_count[9]++;
      }
      while (n <= 279) {
        static_ltree[n * 2 + 1]/*.Len*/ = 7;
        n++;
        bl_count[7]++;
      }
      while (n <= 287) {
        static_ltree[n * 2 + 1]/*.Len*/ = 8;
        n++;
        bl_count[8]++;
      }
      /* Codes 286 and 287 do not exist, but we must include them in the
       * tree construction to get a canonical Huffman tree (longest code
       * all ones)
       */
      gen_codes(static_ltree, L_CODES + 1, bl_count);

      /* The static distance tree is trivial: */
      for (n = 0; n < D_CODES; n++) {
        static_dtree[n * 2 + 1]/*.Len*/ = 5;
        static_dtree[n * 2]/*.Code*/ = bi_reverse(n, 5);
      }

      // Now data ready and we can init static trees
      static_l_desc = new StaticTreeDesc(static_ltree, extra_lbits, LITERALS + 1, L_CODES, MAX_BITS);
      static_d_desc = new StaticTreeDesc(static_dtree, extra_dbits, 0, D_CODES, MAX_BITS);
      static_bl_desc = new StaticTreeDesc(new Array(0), extra_blbits, 0, BL_CODES, MAX_BL_BITS);

      //static_init_done = true;
    }


    /* ===========================================================================
     * Initialize a new block.
     */
    function init_block(s) {
      var n;
      /* iterates over tree elements */

      /* Initialize the trees. */
      for (n = 0; n < L_CODES; n++) {
        s.dyn_ltree[n * 2]/*.Freq*/ = 0;
      }
      for (n = 0; n < D_CODES; n++) {
        s.dyn_dtree[n * 2]/*.Freq*/ = 0;
      }
      for (n = 0; n < BL_CODES; n++) {
        s.bl_tree[n * 2]/*.Freq*/ = 0;
      }

      s.dyn_ltree[END_BLOCK * 2]/*.Freq*/ = 1;
      s.opt_len = s.static_len = 0;
      s.last_lit = s.matches = 0;
    }


    /* ===========================================================================
     * Flush the bit buffer and align the output on a byte boundary
     */
    function bi_windup(s) {
      if (s.bi_valid > 8) {
        put_short(s, s.bi_buf);
      } else if (s.bi_valid > 0) {
        //put_byte(s, (Byte)s->bi_buf);
        s.pending_buf[s.pending++] = s.bi_buf;
      }
      s.bi_buf = 0;
      s.bi_valid = 0;
    }

    /* ===========================================================================
     * Copy a stored block, storing first the length and its
     * one's complement if requested.
     */
    function copy_block(s, buf, len, header)
//DeflateState *s;
//charf    *buf;    /* the input data */
//unsigned len;     /* its length */
//int      header;  /* true if block header must be written */
    {
      bi_windup(s);
      /* align on byte boundary */

      if (header) {
        put_short(s, len);
        put_short(s, ~len);
      }
//  while (len--) {
//    put_byte(s, *buf++);
//  }
      utils.arraySet(s.pending_buf, s.window, buf, len, s.pending);
      s.pending += len;
    }

    /* ===========================================================================
     * Compares to subtrees, using the tree depth as tie breaker when
     * the subtrees have equal frequency. This minimizes the worst case length.
     */
    function smaller(tree, n, m, depth) {
      var _n2 = n * 2;
      var _m2 = m * 2;
      return (tree[_n2]/*.Freq*/ < tree[_m2]/*.Freq*/ ||
      (tree[_n2]/*.Freq*/ === tree[_m2]/*.Freq*/ && depth[n] <= depth[m]));
    }

    /* ===========================================================================
     * Restore the heap property by moving down the tree starting at node k,
     * exchanging a node with the smallest of its two sons if necessary, stopping
     * when the heap property is re-established (each father smaller than its
     * two sons).
     */
    function pqdownheap(s, tree, k)
//    deflate_state *s;
//    ct_data *tree;  /* the tree to restore */
//    int k;               /* node to move down */
    {
      var v = s.heap[k];
      var j = k << 1;
      /* left son of k */
      while (j <= s.heap_len) {
        /* Set j to the smallest of the two sons: */
        if (j < s.heap_len &&
            smaller(tree, s.heap[j + 1], s.heap[j], s.depth)) {
          j++;
    }
        /* Exit if v is smaller than both sons */
        if (smaller(tree, v, s.heap[j], s.depth)) {
          break;
        }

        /* Exchange v with the smallest son */
        s.heap[k] = s.heap[j];
        k = j;

        /* And continue down the tree, setting j to the left son of k */
        j <<= 1;
      }
      s.heap[k] = v;
    }


// inlined manually
// var SMALLEST = 1;

    /* ===========================================================================
     * Send the block data compressed using the given Huffman trees
     */
    function compress_block(s, ltree, dtree)
//    deflate_state *s;
//    const ct_data *ltree; /* literal tree */
//    const ct_data *dtree; /* distance tree */
    {
      var dist;
      /* distance of matched string */
      var lc;
      /* match length or unmatched char (if dist == 0) */
      var lx = 0;
      /* running index in l_buf */
      var code;
      /* the code to send */
      var extra;
      /* number of extra bits to send */

      if (s.last_lit !== 0) {
        do {
          dist = (s.pending_buf[s.d_buf + lx * 2] << 8) | (s.pending_buf[s.d_buf + lx * 2 + 1]);
          lc = s.pending_buf[s.l_buf + lx];
          lx++;

          if (dist === 0) {
            send_code(s, lc, ltree);
            /* send a literal byte */
            //Tracecv(isgraph(lc), (stderr," '%c' ", lc));
          } else {
            /* Here, lc is the match length - MIN_MATCH */
            code = _length_code[lc];
            send_code(s, code + LITERALS + 1, ltree);
            /* send the length code */
            extra = extra_lbits[code];
            if (extra !== 0) {
              lc -= base_length[code];
              send_bits(s, lc, extra);
              /* send the extra length bits */
            }
            dist--;
            /* dist is now the match distance - 1 */
            code = d_code(dist);
            //Assert (code < D_CODES, "bad d_code");

            send_code(s, code, dtree);
            /* send the distance code */
            extra = extra_dbits[code];
            if (extra !== 0) {
              dist -= base_dist[code];
              send_bits(s, dist, extra);
              /* send the extra distance bits */
            }
          }
          /* literal or match pair ? */

          /* Check that the overlay between pending_buf and d_buf+l_buf is ok: */
          //Assert((uInt)(s->pending) < s->lit_bufsize + 2*lx,
          //       "pendingBuf overflow");

        } while (lx < s.last_lit);
      }

      send_code(s, END_BLOCK, ltree);
    }


    /* ===========================================================================
     * Construct one Huffman tree and assigns the code bit strings and lengths.
     * Update the total bit length for the current block.
     * IN assertion: the field freq is set for all tree elements.
     * OUT assertions: the fields len and code are set to the optimal bit length
     *     and corresponding code. The length opt_len is updated; static_len is
     *     also updated if stree is not null. The field max_code is set.
     */
    function build_tree(s, desc)
//    deflate_state *s;
//    tree_desc *desc; /* the tree descriptor */
    {
      var tree = desc.dyn_tree;
      var stree = desc.stat_desc.static_tree;
      var has_stree = desc.stat_desc.has_stree;
      var elems = desc.stat_desc.elems;
      var n, m;
      /* iterate over heap elements */
      var max_code = -1;
      /* largest code with non zero frequency */
      var node;
      /* new node being created */

      /* Construct the initial heap, with least frequent element in
       * heap[SMALLEST]. The sons of heap[n] are heap[2*n] and heap[2*n+1].
       * heap[0] is not used.
       */
      s.heap_len = 0;
      s.heap_max = HEAP_SIZE;

      for (n = 0; n < elems; n++) {
        if (tree[n * 2]/*.Freq*/ !== 0) {
          s.heap[++s.heap_len] = max_code = n;
          s.depth[n] = 0;

        } else {
          tree[n * 2 + 1]/*.Len*/ = 0;
        }
      }

      /* The pkzip format requires that at least one distance code exists,
       * and that at least one bit should be sent even if there is only one
       * possible code. So to avoid special checks later on we force at least
       * two codes of non zero frequency.
       */
      while (s.heap_len < 2) {
        node = s.heap[++s.heap_len] = (max_code < 2 ? ++max_code : 0);
        tree[node * 2]/*.Freq*/ = 1;
        s.depth[node] = 0;
        s.opt_len--;

        if (has_stree) {
          s.static_len -= stree[node * 2 + 1]/*.Len*/;
        }
        /* node is 0 or 1 so it does not have extra bits */
      }
      desc.max_code = max_code;

      /* The elements heap[heap_len/2+1 .. heap_len] are leaves of the tree,
       * establish sub-heaps of increasing lengths:
       */
      for (n = (s.heap_len >> 1/*int /2*/); n >= 1; n--) {
        pqdownheap(s, tree, n);
      }

      /* Construct the Huffman tree by repeatedly combining the least two
       * frequent nodes.
       */
      node = elems;
      /* next internal node of the tree */
      do {
        //pqremove(s, tree, n);  /* n = node of least frequency */
        /*** pqremove ***/
        n = s.heap[1/*SMALLEST*/];
        s.heap[1/*SMALLEST*/] = s.heap[s.heap_len--];
        pqdownheap(s, tree, 1/*SMALLEST*/);
        /***/

        m = s.heap[1/*SMALLEST*/];
        /* m = node of next least frequency */

        s.heap[--s.heap_max] = n;
        /* keep the nodes sorted by frequency */
        s.heap[--s.heap_max] = m;

        /* Create a new node father of n and m */
        tree[node * 2]/*.Freq*/ = tree[n * 2]/*.Freq*/ + tree[m * 2]/*.Freq*/;
        s.depth[node] = (s.depth[n] >= s.depth[m] ? s.depth[n] : s.depth[m]) + 1;
        tree[n * 2 + 1]/*.Dad*/ = tree[m * 2 + 1]/*.Dad*/ = node;

        /* and insert the new node in the heap */
        s.heap[1/*SMALLEST*/] = node++;
        pqdownheap(s, tree, 1/*SMALLEST*/);

      } while (s.heap_len >= 2);

      s.heap[--s.heap_max] = s.heap[1/*SMALLEST*/];

      /* At this point, the fields freq and dad are set. We can now
       * generate the bit lengths.
       */
      gen_bitlen(s, desc);

      /* The field len is now set, we can generate the bit codes */
      gen_codes(tree, max_code, s.bl_count);
    }


    /* ===========================================================================
     * Scan a literal or distance tree to determine the frequencies of the codes
     * in the bit length tree.
     */
    function scan_tree(s, tree, max_code)
//    deflate_state *s;
//    ct_data *tree;   /* the tree to be scanned */
//    int max_code;    /* and its largest code of non zero frequency */
    {
      var n;
      /* iterates over all tree elements */
      var prevlen = -1;
      /* last emitted length */
      var curlen;
      /* length of current code */

      var nextlen = tree[0 * 2 + 1]/*.Len*/;
      /* length of next code */

      var count = 0;
      /* repeat count of the current code */
      var max_count = 7;
      /* max repeat count */
      var min_count = 4;
      /* min repeat count */

      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      }
      tree[(max_code + 1) * 2 + 1]/*.Len*/ = 0xffff;
      /* guard */

      for (n = 0; n <= max_code; n++) {
        curlen = nextlen;
        nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

        if (++count < max_count && curlen === nextlen) {
          continue;

        } else if (count < min_count) {
          s.bl_tree[curlen * 2]/*.Freq*/ += count;

        } else if (curlen !== 0) {

          if (curlen !== prevlen) {
            s.bl_tree[curlen * 2]/*.Freq*/++;
          }
          s.bl_tree[REP_3_6 * 2]/*.Freq*/++;

        } else if (count <= 10) {
          s.bl_tree[REPZ_3_10 * 2]/*.Freq*/++;

        } else {
          s.bl_tree[REPZ_11_138 * 2]/*.Freq*/++;
        }

        count = 0;
        prevlen = curlen;

        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;

        } else if (curlen === nextlen) {
          max_count = 6;
          min_count = 3;

        } else {
          max_count = 7;
          min_count = 4;
    }
      }
    }


    /* ===========================================================================
     * Send a literal or distance tree in compressed form, using the codes in
     * bl_tree.
     */
    function send_tree(s, tree, max_code)
//    deflate_state *s;
//    ct_data *tree; /* the tree to be scanned */
//    int max_code;       /* and its largest code of non zero frequency */
    {
      var n;
      /* iterates over all tree elements */
      var prevlen = -1;
      /* last emitted length */
      var curlen;
      /* length of current code */

      var nextlen = tree[0 * 2 + 1]/*.Len*/;
      /* length of next code */

      var count = 0;
      /* repeat count of the current code */
      var max_count = 7;
      /* max repeat count */
      var min_count = 4;
      /* min repeat count */

      /* tree[max_code+1].Len = -1; */
      /* guard already set */
      if (nextlen === 0) {
        max_count = 138;
        min_count = 3;
      }

      for (n = 0; n <= max_code; n++) {
        curlen = nextlen;
        nextlen = tree[(n + 1) * 2 + 1]/*.Len*/;

        if (++count < max_count && curlen === nextlen) {
          continue;

        } else if (count < min_count) {
          do {
            send_code(s, curlen, s.bl_tree);
          } while (--count !== 0);

        } else if (curlen !== 0) {
          if (curlen !== prevlen) {
            send_code(s, curlen, s.bl_tree);
            count--;
          }
          //Assert(count >= 3 && count <= 6, " 3_6?");
          send_code(s, REP_3_6, s.bl_tree);
          send_bits(s, count - 3, 2);

        } else if (count <= 10) {
          send_code(s, REPZ_3_10, s.bl_tree);
          send_bits(s, count - 3, 3);

        } else {
          send_code(s, REPZ_11_138, s.bl_tree);
          send_bits(s, count - 11, 7);
        }

        count = 0;
        prevlen = curlen;
        if (nextlen === 0) {
          max_count = 138;
          min_count = 3;

        } else if (curlen === nextlen) {
          max_count = 6;
          min_count = 3;

        } else {
          max_count = 7;
          min_count = 4;
    }
      }
    }


    /* ===========================================================================
     * Construct the Huffman tree for the bit lengths and return the index in
     * bl_order of the last bit length code to send.
     */
    function build_bl_tree(s) {
      var max_blindex;
      /* index of last bit length code of non zero freq */

      /* Determine the bit length frequencies for literal and distance trees */
      scan_tree(s, s.dyn_ltree, s.l_desc.max_code);
      scan_tree(s, s.dyn_dtree, s.d_desc.max_code);

      /* Build the bit length tree: */
      build_tree(s, s.bl_desc);
      /* opt_len now includes the length of the tree representations, except
       * the lengths of the bit lengths codes and the 5+5+4 bits for the counts.
       */

      /* Determine the number of bit length codes to send. The pkzip format
       * requires that at least 4 bit length codes be sent. (appnote.txt says
       * 3 but the actual value used is 4.)
       */
      for (max_blindex = BL_CODES - 1; max_blindex >= 3; max_blindex--) {
        if (s.bl_tree[bl_order[max_blindex] * 2 + 1]/*.Len*/ !== 0) {
          break;
    }
      }
      /* Update opt_len to include the bit length tree and counts */
      s.opt_len += 3 * (max_blindex + 1) + 5 + 5 + 4;
      //Tracev((stderr, "\ndyn trees: dyn %ld, stat %ld",
      //        s->opt_len, s->static_len));

      return max_blindex;
    }


    /* ===========================================================================
     * Send the header for a block using dynamic Huffman trees: the counts, the
     * lengths of the bit length codes, the literal tree and the distance tree.
     * IN assertion: lcodes >= 257, dcodes >= 1, blcodes >= 4.
     */
    function send_all_trees(s, lcodes, dcodes, blcodes)
//    deflate_state *s;
//    int lcodes, dcodes, blcodes; /* number of codes for each tree */
    {
      var rank;
      /* index in bl_order */

      //Assert (lcodes >= 257 && dcodes >= 1 && blcodes >= 4, "not enough codes");
      //Assert (lcodes <= L_CODES && dcodes <= D_CODES && blcodes <= BL_CODES,
      //        "too many codes");
      //Tracev((stderr, "\nbl counts: "));
      send_bits(s, lcodes - 257, 5);
      /* not +255 as stated in appnote.txt */
      send_bits(s, dcodes - 1, 5);
      send_bits(s, blcodes - 4, 4);
      /* not -3 as stated in appnote.txt */
      for (rank = 0; rank < blcodes; rank++) {
        //Tracev((stderr, "\nbl code %2d ", bl_order[rank]));
        send_bits(s, s.bl_tree[bl_order[rank] * 2 + 1]/*.Len*/, 3);
      }
      //Tracev((stderr, "\nbl tree: sent %ld", s->bits_sent));

      send_tree(s, s.dyn_ltree, lcodes - 1);
      /* literal tree */
      //Tracev((stderr, "\nlit tree: sent %ld", s->bits_sent));

      send_tree(s, s.dyn_dtree, dcodes - 1);
      /* distance tree */
      //Tracev((stderr, "\ndist tree: sent %ld", s->bits_sent));
    }


    /* ===========================================================================
     * Check if the data type is TEXT or BINARY, using the following algorithm:
     * - TEXT if the two conditions below are satisfied:
     *    a) There are no non-portable control characters belonging to the
     *       "black list" (0..6, 14..25, 28..31).
     *    b) There is at least one printable character belonging to the
     *       "white list" (9 {TAB}, 10 {LF}, 13 {CR}, 32..255).
     * - BINARY otherwise.
     * - The following partially-portable control characters form a
     *   "gray list" that is ignored in this detection algorithm:
     *   (7 {BEL}, 8 {BS}, 11 {VT}, 12 {FF}, 26 {SUB}, 27 {ESC}).
     * IN assertion: the fields Freq of dyn_ltree are set.
     */
    function detect_data_type(s) {
      /* black_mask is the bit mask of black-listed bytes
       * set bits 0..6, 14..25, and 28..31
       * 0xf3ffc07f = binary 11110011111111111100000001111111
       */
      var black_mask = 0xf3ffc07f;
      var n;

      /* Check for non-textual ("black-listed") bytes. */
      for (n = 0; n <= 31; n++, black_mask >>>= 1) {
        if ((black_mask & 1) && (s.dyn_ltree[n * 2]/*.Freq*/ !== 0)) {
      return Z_BINARY;
    }
      }

      /* Check for textual ("white-listed") bytes. */
      if (s.dyn_ltree[9 * 2]/*.Freq*/ !== 0 || s.dyn_ltree[10 * 2]/*.Freq*/ !== 0 ||
          s.dyn_ltree[13 * 2]/*.Freq*/ !== 0) {
        return Z_TEXT;
      }
      for (n = 32; n < LITERALS; n++) {
        if (s.dyn_ltree[n * 2]/*.Freq*/ !== 0) {
          return Z_TEXT;
    }
      }

      /* There are no "black-listed" or "white-listed" bytes:
       * this stream either is empty or has tolerated ("gray-listed") bytes only.
       */
      return Z_BINARY;
    }


    var static_init_done = false;

    /* ===========================================================================
     * Initialize the tree data structures for a new zlib stream.
     */
    function _tr_init(s) {

      if (!static_init_done) {
        tr_static_init();
        static_init_done = true;
      }

      s.l_desc = new TreeDesc(s.dyn_ltree, static_l_desc);
      s.d_desc = new TreeDesc(s.dyn_dtree, static_d_desc);
      s.bl_desc = new TreeDesc(s.bl_tree, static_bl_desc);

      s.bi_buf = 0;
      s.bi_valid = 0;

      /* Initialize the first block of the first file: */
      init_block(s);
    }


    /* ===========================================================================
     * Send a stored block
     */
    function _tr_stored_block(s, buf, stored_len, last)
//DeflateState *s;
//charf *buf;       /* input block */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
    {
      send_bits(s, (STORED_BLOCK << 1) + (last ? 1 : 0), 3);
      /* send block type */
      copy_block(s, buf, stored_len, true);
      /* with header */
    }


    /* ===========================================================================
     * Send one empty static block to give enough lookahead for inflate.
     * This takes 10 bits, of which 7 may remain in the bit buffer.
     */
    function _tr_align(s) {
      send_bits(s, STATIC_TREES << 1, 3);
      send_code(s, END_BLOCK, static_ltree);
      bi_flush(s);
    }


    /* ===========================================================================
     * Determine the best encoding for the current block: dynamic trees, static
     * trees or store, and output the encoded block to the zip file.
     */
    function _tr_flush_block(s, buf, stored_len, last)
//DeflateState *s;
//charf *buf;       /* input block, or NULL if too old */
//ulg stored_len;   /* length of input block */
//int last;         /* one if this is the last block for a file */
    {
      var opt_lenb, static_lenb;
      /* opt_len and static_len in bytes */
      var max_blindex = 0;
      /* index of last bit length code of non zero freq */

      /* Build the Huffman trees unless a stored block is forced */
      if (s.level > 0) {

        /* Check if the file is binary or text */
        if (s.strm.data_type === Z_UNKNOWN) {
          s.strm.data_type = detect_data_type(s);
    }

        /* Construct the literal and distance trees */
        build_tree(s, s.l_desc);
        // Tracev((stderr, "\nlit data: dyn %ld, stat %ld", s->opt_len,
        //        s->static_len));

        build_tree(s, s.d_desc);
        // Tracev((stderr, "\ndist data: dyn %ld, stat %ld", s->opt_len,
        //        s->static_len));
        /* At this point, opt_len and static_len are the total bit lengths of
         * the compressed block data, excluding the tree representations.
     */

        /* Build the bit length tree for the above two trees, and get the index
         * in bl_order of the last bit length code to send.
         */
        max_blindex = build_bl_tree(s);

        /* Determine the best encoding. Compute the block lengths in bytes. */
        opt_lenb = (s.opt_len + 3 + 7) >>> 3;
        static_lenb = (s.static_len + 3 + 7) >>> 3;

        // Tracev((stderr, "\nopt %lu(%lu) stat %lu(%lu) stored %lu lit %u ",
        //        opt_lenb, s->opt_len, static_lenb, s->static_len, stored_len,
        //        s->last_lit));

        if (static_lenb <= opt_lenb) {
          opt_lenb = static_lenb;
        }

      } else {
        // Assert(buf != (char*)0, "lost buf");
        opt_lenb = static_lenb = stored_len + 5;
        /* force a stored block */
      }

      if ((stored_len + 4 <= opt_lenb) && (buf !== -1)) {
        /* 4: two words for the lengths */

        /* The test buf != NULL is only necessary if LIT_BUFSIZE > WSIZE.
         * Otherwise we can't have processed more than WSIZE input bytes since
         * the last block flush, because compression would have been
         * successful. If LIT_BUFSIZE <= WSIZE, it is never too late to
         * transform a block into a stored block.
         */
        _tr_stored_block(s, buf, stored_len, last);

      } else if (s.strategy === Z_FIXED || static_lenb === opt_lenb) {

        send_bits(s, (STATIC_TREES << 1) + (last ? 1 : 0), 3);
        compress_block(s, static_ltree, static_dtree);

      } else {
        send_bits(s, (DYN_TREES << 1) + (last ? 1 : 0), 3);
        send_all_trees(s, s.l_desc.max_code + 1, s.d_desc.max_code + 1, max_blindex + 1);
        compress_block(s, s.dyn_ltree, s.dyn_dtree);
      }
      // Assert (s->compressed_len == s->bits_sent, "bad compressed size");
      /* The above check is made mod 2^32, for files larger than 512 MB
       * and uLong implemented on 32 bits.
       */
      init_block(s);

      if (last) {
        bi_windup(s);
      }
      // Tracev((stderr,"\ncomprlen %lu(%lu) ", s->compressed_len>>3,
      //       s->compressed_len-7*last));
    }

    /* ===========================================================================
     * Save the match info and tally the frequency counts. Return true if
     * the current block must be flushed.
     */
    function _tr_tally(s, dist, lc)
//    deflate_state *s;
//    unsigned dist;  /* distance of matched string */
//    unsigned lc;    /* match length-MIN_MATCH or unmatched char (if dist==0) */
    {
      //var out_length, in_length, dcode;

      s.pending_buf[s.d_buf + s.last_lit * 2] = (dist >>> 8) & 0xff;
      s.pending_buf[s.d_buf + s.last_lit * 2 + 1] = dist & 0xff;

      s.pending_buf[s.l_buf + s.last_lit] = lc & 0xff;
      s.last_lit++;

      if (dist === 0) {
        /* lc is the unmatched char */
        s.dyn_ltree[lc * 2]/*.Freq*/++;
      } else {
        s.matches++;
        /* Here, lc is the match length - MIN_MATCH */
        dist--;
        /* dist = match distance - 1 */
        //Assert((ush)dist < (ush)MAX_DIST(s) &&
        //       (ush)lc <= (ush)(MAX_MATCH-MIN_MATCH) &&
        //       (ush)d_code(dist) < (ush)D_CODES,  "_tr_tally: bad match");

        s.dyn_ltree[(_length_code[lc] + LITERALS + 1) * 2]/*.Freq*/++;
        s.dyn_dtree[d_code(dist) * 2]/*.Freq*/++;
      }

// (!) This block is disabled in zlib defailts,
// don't enable it for binary compatibility

//#ifdef TRUNCATE_BLOCK
//  /* Try to guess if it is profitable to stop the current block here */
//  if ((s.last_lit & 0x1fff) === 0 && s.level > 2) {
//    /* Compute an upper bound for the compressed length */
//    out_length = s.last_lit*8;
//    in_length = s.strstart - s.block_start;
//
//    for (dcode = 0; dcode < D_CODES; dcode++) {
//      out_length += s.dyn_dtree[dcode*2]/*.Freq*/ * (5 + extra_dbits[dcode]);
//    }
//    out_length >>>= 3;
//    //Tracev((stderr,"\nlast_lit %u, in %ld, out ~%ld(%ld%%) ",
//    //       s->last_lit, in_length, out_length,
//    //       100L - out_length*100L/in_length));
//    if (s.matches < (s.last_lit>>1)/*int /2*/ && out_length < (in_length>>1)/*int /2*/) {
//      return true;
//    }
//  }
//#endif

      return (s.last_lit === s.lit_bufsize - 1);
      /* We avoid equality with lit_bufsize because of wraparound at 64K
       * on 16 bit machines and because stored blocks are restricted to
       * 64K-1 bytes.
       */
    }

    exports._tr_init = _tr_init;
    exports._tr_stored_block = _tr_stored_block;
    exports._tr_flush_block = _tr_flush_block;
    exports._tr_tally = _tr_tally;
    exports._tr_align = _tr_align;

  }, {"../utils/common": 4}],
  14: [function (require, module, exports) {
    'use strict';


    function ZStream() {
      /* next input byte */
      this.input = null; // JS specific, because we have no pointers
      this.next_in = 0;
      /* number of bytes available at input */
      this.avail_in = 0;
      /* total number of input bytes read so far */
      this.total_in = 0;
      /* next output byte should be put there */
      this.output = null; // JS specific, because we have no pointers
      this.next_out = 0;
      /* remaining free space at output */
      this.avail_out = 0;
      /* total number of bytes output so far */
      this.total_out = 0;
      /* last error message, NULL if no error */
      this.msg = ''/*Z_NULL*/;
      /* not visible by applications */
      this.state = null;
      /* best guess about the data type: binary or text */
      this.data_type = 2/*Z_UNKNOWN*/;
      /* adler32 value of the uncompressed data */
      this.adler = 0;
    }

    module.exports = ZStream;

  }, {}],
  15: [function (require, module, exports) {
    (function (process, Buffer) {
      var msg = require('pako/lib/zlib/messages');
      var zstream = require('pako/lib/zlib/zstream');
      var zlib_deflate = require('pako/lib/zlib/deflate.js');
      var zlib_inflate = require('pako/lib/zlib/inflate.js');
      var constants = require('pako/lib/zlib/constants');

      for (var key in constants) {
        exports[key] = constants[key];
      }

// zlib modes
      exports.NONE = 0;
      exports.DEFLATE = 1;
      exports.INFLATE = 2;
      exports.GZIP = 3;
      exports.GUNZIP = 4;
      exports.DEFLATERAW = 5;
      exports.INFLATERAW = 6;
      exports.UNZIP = 7;

      /**
       * Emulate Node's zlib C++ layer for use by the JS layer in index.js
       */
      function Zlib(mode) {
        if (mode < exports.DEFLATE || mode > exports.UNZIP)
          throw new TypeError("Bad argument");

        this.mode = mode;
        this.init_done = false;
        this.write_in_progress = false;
        this.pending_close = false;
        this.windowBits = 0;
        this.level = 0;
        this.memLevel = 0;
        this.strategy = 0;
        this.dictionary = null;
      }

      Zlib.prototype.init = function (windowBits, level, memLevel, strategy, dictionary) {
        this.windowBits = windowBits;
        this.level = level;
        this.memLevel = memLevel;
        this.strategy = strategy;
        // dictionary not supported.

        if (this.mode === exports.GZIP || this.mode === exports.GUNZIP)
          this.windowBits += 16;

        if (this.mode === exports.UNZIP)
          this.windowBits += 32;

        if (this.mode === exports.DEFLATERAW || this.mode === exports.INFLATERAW)
          this.windowBits = -this.windowBits;

        this.strm = new zstream();

        switch (this.mode) {
          case exports.DEFLATE:
          case exports.GZIP:
          case exports.DEFLATERAW:
            var status = zlib_deflate.deflateInit2(
                this.strm,
                this.level,
                exports.Z_DEFLATED,
                this.windowBits,
                this.memLevel,
                this.strategy
            );
            break;
          case exports.INFLATE:
          case exports.GUNZIP:
          case exports.INFLATERAW:
          case exports.UNZIP:
            var status = zlib_inflate.inflateInit2(
                this.strm,
                this.windowBits
            );
            break;
          default:
            throw new Error("Unknown mode " + this.mode);
        }

        if (status !== exports.Z_OK) {
          this._error(status);
          return;
        }

        this.write_in_progress = false;
        this.init_done = true;
      };

      Zlib.prototype.params = function () {
        throw new Error("deflateParams Not supported");
      };

      Zlib.prototype._writeCheck = function () {
        if (!this.init_done)
          throw new Error("write before init");

        if (this.mode === exports.NONE)
          throw new Error("already finalized");

        if (this.write_in_progress)
          throw new Error("write already in progress");

        if (this.pending_close)
          throw new Error("close is pending");
      };

      Zlib.prototype.write = function (flush, input, in_off, in_len, out, out_off, out_len) {
        this._writeCheck();
        this.write_in_progress = true;

        var self = this;
        process.nextTick(function () {
          self.write_in_progress = false;
          var res = self._write(flush, input, in_off, in_len, out, out_off, out_len);
          self.callback(res[0], res[1]);

          if (self.pending_close)
            self.close();
        });

        return this;
      };

// set method for Node buffers, used by pako
      function bufferSet(data, offset) {
        for (var i = 0; i < data.length; i++) {
          this[offset + i] = data[i];
        }
      }

      Zlib.prototype.writeSync = function (flush, input, in_off, in_len, out, out_off, out_len) {
        this._writeCheck();
        return this._write(flush, input, in_off, in_len, out, out_off, out_len);
      };

      Zlib.prototype._write = function (flush, input, in_off, in_len, out, out_off, out_len) {
        this.write_in_progress = true;

        if (flush !== exports.Z_NO_FLUSH &&
            flush !== exports.Z_PARTIAL_FLUSH &&
            flush !== exports.Z_SYNC_FLUSH &&
            flush !== exports.Z_FULL_FLUSH &&
            flush !== exports.Z_FINISH &&
            flush !== exports.Z_BLOCK) {
          throw new Error("Invalid flush value");
        }

        if (input == null) {
          input = new Buffer(0);
          in_len = 0;
          in_off = 0;
        }

        if (out._set)
          out.set = out._set;
        else
          out.set = bufferSet;

        var strm = this.strm;
        strm.avail_in = in_len;
        strm.input = input;
        strm.next_in = in_off;
        strm.avail_out = out_len;
        strm.output = out;
        strm.next_out = out_off;

        switch (this.mode) {
          case exports.DEFLATE:
          case exports.GZIP:
          case exports.DEFLATERAW:
            var status = zlib_deflate.deflate(strm, flush);
            break;
          case exports.UNZIP:
          case exports.INFLATE:
          case exports.GUNZIP:
          case exports.INFLATERAW:
            var status = zlib_inflate.inflate(strm, flush);
            break;
          default:
            throw new Error("Unknown mode " + this.mode);
        }

        if (status !== exports.Z_STREAM_END && status !== exports.Z_OK) {
          this._error(status);
        }

        this.write_in_progress = false;
        return [strm.avail_in, strm.avail_out];
      };

      Zlib.prototype.close = function () {
        if (this.write_in_progress) {
          this.pending_close = true;
          return;
        }

        this.pending_close = false;

        if (this.mode === exports.DEFLATE || this.mode === exports.GZIP || this.mode === exports.DEFLATERAW) {
          zlib_deflate.deflateEnd(this.strm);
        } else {
          zlib_inflate.inflateEnd(this.strm);
        }

        this.mode = exports.NONE;
      };

      Zlib.prototype.reset = function () {
        switch (this.mode) {
          case exports.DEFLATE:
          case exports.DEFLATERAW:
            var status = zlib_deflate.deflateReset(this.strm);
            break;
          case exports.INFLATE:
          case exports.INFLATERAW:
            var status = zlib_inflate.inflateReset(this.strm);
            break;
        }

        if (status !== exports.Z_OK) {
          this._error(status);
        }
      };

      Zlib.prototype._error = function (status) {
        this.onerror(msg[status] + ': ' + this.strm.msg, status);

        this.write_in_progress = false;
        if (this.pending_close)
          this.close();
      };

      exports.Zlib = Zlib;

    }).call(this, require('_process'), require("buffer").Buffer)
  }, {
    "_process": 25,
    "buffer": 17,
    "pako/lib/zlib/constants": 6,
    "pako/lib/zlib/deflate.js": 8,
    "pako/lib/zlib/inflate.js": 10,
    "pako/lib/zlib/messages": 12,
    "pako/lib/zlib/zstream": 14
  }],
  16: [function (require, module, exports) {
    (function (process, Buffer) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

      var Transform = require('_stream_transform');

      var binding = require('./binding');
      var util = require('util');
      var assert = require('assert').ok;

// zlib doesn't provide these, so kludge them in following the same
// const naming scheme zlib uses.
      binding.Z_MIN_WINDOWBITS = 8;
      binding.Z_MAX_WINDOWBITS = 15;
      binding.Z_DEFAULT_WINDOWBITS = 15;

// fewer than 64 bytes per chunk is stupid.
// technically it could work with as few as 8, but even 64 bytes
// is absurdly low.  Usually a MB or more is best.
      binding.Z_MIN_CHUNK = 64;
      binding.Z_MAX_CHUNK = Infinity;
      binding.Z_DEFAULT_CHUNK = (16 * 1024);

      binding.Z_MIN_MEMLEVEL = 1;
      binding.Z_MAX_MEMLEVEL = 9;
      binding.Z_DEFAULT_MEMLEVEL = 8;

      binding.Z_MIN_LEVEL = -1;
      binding.Z_MAX_LEVEL = 9;
      binding.Z_DEFAULT_LEVEL = binding.Z_DEFAULT_COMPRESSION;

// expose all the zlib constants
      Object.keys(binding).forEach(function (k) {
        if (k.match(/^Z/)) exports[k] = binding[k];
      });

// translation table for return codes.
      exports.codes = {
        Z_OK: binding.Z_OK,
        Z_STREAM_END: binding.Z_STREAM_END,
        Z_NEED_DICT: binding.Z_NEED_DICT,
        Z_ERRNO: binding.Z_ERRNO,
        Z_STREAM_ERROR: binding.Z_STREAM_ERROR,
        Z_DATA_ERROR: binding.Z_DATA_ERROR,
        Z_MEM_ERROR: binding.Z_MEM_ERROR,
        Z_BUF_ERROR: binding.Z_BUF_ERROR,
        Z_VERSION_ERROR: binding.Z_VERSION_ERROR
      };

      Object.keys(exports.codes).forEach(function (k) {
        exports.codes[exports.codes[k]] = k;
      });

      exports.Deflate = Deflate;
      exports.Inflate = Inflate;
      exports.Gzip = Gzip;
      exports.Gunzip = Gunzip;
      exports.DeflateRaw = DeflateRaw;
      exports.InflateRaw = InflateRaw;
      exports.Unzip = Unzip;

      exports.createDeflate = function (o) {
        return new Deflate(o);
      };

      exports.createInflate = function (o) {
        return new Inflate(o);
      };

      exports.createDeflateRaw = function (o) {
        return new DeflateRaw(o);
      };

      exports.createInflateRaw = function (o) {
        return new InflateRaw(o);
      };

      exports.createGzip = function (o) {
        return new Gzip(o);
      };

      exports.createGunzip = function (o) {
        return new Gunzip(o);
      };

      exports.createUnzip = function (o) {
        return new Unzip(o);
      };


// Convenience methods.
// compress/decompress a string or buffer in one step.
      exports.deflate = function (buffer, opts, callback) {
        if (typeof opts === 'function') {
          callback = opts;
          opts = {};
        }
        return zlibBuffer(new Deflate(opts), buffer, callback);
      };

      exports.deflateSync = function (buffer, opts) {
        return zlibBufferSync(new Deflate(opts), buffer);
      };

      exports.gzip = function (buffer, opts, callback) {
        if (typeof opts === 'function') {
          callback = opts;
          opts = {};
        }
        return zlibBuffer(new Gzip(opts), buffer, callback);
      };

      exports.gzipSync = function (buffer, opts) {
        return zlibBufferSync(new Gzip(opts), buffer);
      };

      exports.deflateRaw = function (buffer, opts, callback) {
        if (typeof opts === 'function') {
          callback = opts;
          opts = {};
        }
        return zlibBuffer(new DeflateRaw(opts), buffer, callback);
      };

      exports.deflateRawSync = function (buffer, opts) {
        return zlibBufferSync(new DeflateRaw(opts), buffer);
      };

      exports.unzip = function (buffer, opts, callback) {
        if (typeof opts === 'function') {
          callback = opts;
          opts = {};
        }
        return zlibBuffer(new Unzip(opts), buffer, callback);
      };

      exports.unzipSync = function (buffer, opts) {
        return zlibBufferSync(new Unzip(opts), buffer);
      };

      exports.inflate = function (buffer, opts, callback) {
        if (typeof opts === 'function') {
          callback = opts;
          opts = {};
        }
        return zlibBuffer(new Inflate(opts), buffer, callback);
      };

      exports.inflateSync = function (buffer, opts) {
        return zlibBufferSync(new Inflate(opts), buffer);
      };

      exports.gunzip = function (buffer, opts, callback) {
        if (typeof opts === 'function') {
          callback = opts;
          opts = {};
        }
        return zlibBuffer(new Gunzip(opts), buffer, callback);
      };

      exports.gunzipSync = function (buffer, opts) {
        return zlibBufferSync(new Gunzip(opts), buffer);
      };

      exports.inflateRaw = function (buffer, opts, callback) {
        if (typeof opts === 'function') {
          callback = opts;
          opts = {};
        }
        return zlibBuffer(new InflateRaw(opts), buffer, callback);
      };

      exports.inflateRawSync = function (buffer, opts) {
        return zlibBufferSync(new InflateRaw(opts), buffer);
      };

      function zlibBuffer(engine, buffer, callback) {
        var buffers = [];
        var nread = 0;

        engine.on('error', onError);
        engine.on('end', onEnd);

        engine.end(buffer);
        flow();

        function flow() {
          var chunk;
          while (null !== (chunk = engine.read())) {
            buffers.push(chunk);
            nread += chunk.length;
          }
          engine.once('readable', flow);
        }

        function onError(err) {
          engine.removeListener('end', onEnd);
          engine.removeListener('readable', flow);
          callback(err);
        }

        function onEnd() {
          var buf = Buffer.concat(buffers, nread);
          buffers = [];
          callback(null, buf);
          engine.close();
        }
      }

      function zlibBufferSync(engine, buffer) {
        if (typeof buffer === 'string')
          buffer = new Buffer(buffer);
        if (!Buffer.isBuffer(buffer))
          throw new TypeError('Not a string or buffer');

        var flushFlag = binding.Z_FINISH;

        return engine._processChunk(buffer, flushFlag);
      }

// generic zlib
// minimal 2-byte header
      function Deflate(opts) {
        if (!(this instanceof Deflate)) return new Deflate(opts);
        Zlib.call(this, opts, binding.DEFLATE);
      }

      function Inflate(opts) {
        if (!(this instanceof Inflate)) return new Inflate(opts);
        Zlib.call(this, opts, binding.INFLATE);
      }



// gzip - bigger header, same deflate compression
      function Gzip(opts) {
        if (!(this instanceof Gzip)) return new Gzip(opts);
        Zlib.call(this, opts, binding.GZIP);
      }

      function Gunzip(opts) {
        if (!(this instanceof Gunzip)) return new Gunzip(opts);
        Zlib.call(this, opts, binding.GUNZIP);
      }



// raw - no header
      function DeflateRaw(opts) {
        if (!(this instanceof DeflateRaw)) return new DeflateRaw(opts);
        Zlib.call(this, opts, binding.DEFLATERAW);
      }

      function InflateRaw(opts) {
        if (!(this instanceof InflateRaw)) return new InflateRaw(opts);
        Zlib.call(this, opts, binding.INFLATERAW);
      }


// auto-detect header.
      function Unzip(opts) {
        if (!(this instanceof Unzip)) return new Unzip(opts);
        Zlib.call(this, opts, binding.UNZIP);
      }


// the Zlib class they all inherit from
// This thing manages the queue of requests, and returns
// true or false if there is anything in the queue when
// you call the .write() method.

      function Zlib(opts, mode) {
        this._opts = opts = opts || {};
        this._chunkSize = opts.chunkSize || exports.Z_DEFAULT_CHUNK;

        Transform.call(this, opts);

        if (opts.flush) {
          if (opts.flush !== binding.Z_NO_FLUSH &&
              opts.flush !== binding.Z_PARTIAL_FLUSH &&
              opts.flush !== binding.Z_SYNC_FLUSH &&
              opts.flush !== binding.Z_FULL_FLUSH &&
              opts.flush !== binding.Z_FINISH &&
              opts.flush !== binding.Z_BLOCK) {
            throw new Error('Invalid flush flag: ' + opts.flush);
          }
        }
        this._flushFlag = opts.flush || binding.Z_NO_FLUSH;

        if (opts.chunkSize) {
          if (opts.chunkSize < exports.Z_MIN_CHUNK ||
              opts.chunkSize > exports.Z_MAX_CHUNK) {
            throw new Error('Invalid chunk size: ' + opts.chunkSize);
          }
        }

        if (opts.windowBits) {
          if (opts.windowBits < exports.Z_MIN_WINDOWBITS ||
              opts.windowBits > exports.Z_MAX_WINDOWBITS) {
            throw new Error('Invalid windowBits: ' + opts.windowBits);
          }
        }

        if (opts.level) {
          if (opts.level < exports.Z_MIN_LEVEL ||
              opts.level > exports.Z_MAX_LEVEL) {
            throw new Error('Invalid compression level: ' + opts.level);
          }
        }

        if (opts.memLevel) {
          if (opts.memLevel < exports.Z_MIN_MEMLEVEL ||
              opts.memLevel > exports.Z_MAX_MEMLEVEL) {
            throw new Error('Invalid memLevel: ' + opts.memLevel);
          }
        }

        if (opts.strategy) {
          if (opts.strategy != exports.Z_FILTERED &&
              opts.strategy != exports.Z_HUFFMAN_ONLY &&
              opts.strategy != exports.Z_RLE &&
              opts.strategy != exports.Z_FIXED &&
              opts.strategy != exports.Z_DEFAULT_STRATEGY) {
            throw new Error('Invalid strategy: ' + opts.strategy);
          }
        }

        if (opts.dictionary) {
          if (!Buffer.isBuffer(opts.dictionary)) {
            throw new Error('Invalid dictionary: it should be a Buffer instance');
          }
        }

        this._binding = new binding.Zlib(mode);

        var self = this;
        this._hadError = false;
        this._binding.onerror = function (message, errno) {
          // there is no way to cleanly recover.
          // continuing only obscures problems.
          self._binding = null;
          self._hadError = true;

          var error = new Error(message);
          error.errno = errno;
          error.code = exports.codes[errno];
          self.emit('error', error);
        };

        var level = exports.Z_DEFAULT_COMPRESSION;
        if (typeof opts.level === 'number') level = opts.level;

        var strategy = exports.Z_DEFAULT_STRATEGY;
        if (typeof opts.strategy === 'number') strategy = opts.strategy;

        this._binding.init(opts.windowBits || exports.Z_DEFAULT_WINDOWBITS,
            level,
            opts.memLevel || exports.Z_DEFAULT_MEMLEVEL,
            strategy,
            opts.dictionary);

        this._buffer = new Buffer(this._chunkSize);
        this._offset = 0;
        this._closed = false;
        this._level = level;
        this._strategy = strategy;

        this.once('end', this.close);
      }

      util.inherits(Zlib, Transform);

      Zlib.prototype.params = function (level, strategy, callback) {
        if (level < exports.Z_MIN_LEVEL ||
            level > exports.Z_MAX_LEVEL) {
          throw new RangeError('Invalid compression level: ' + level);
        }
        if (strategy != exports.Z_FILTERED &&
            strategy != exports.Z_HUFFMAN_ONLY &&
            strategy != exports.Z_RLE &&
            strategy != exports.Z_FIXED &&
            strategy != exports.Z_DEFAULT_STRATEGY) {
          throw new TypeError('Invalid strategy: ' + strategy);
        }

        if (this._level !== level || this._strategy !== strategy) {
          var self = this;
          this.flush(binding.Z_SYNC_FLUSH, function () {
            self._binding.params(level, strategy);
            if (!self._hadError) {
              self._level = level;
              self._strategy = strategy;
              if (callback) callback();
      }
          });
        } else {
          process.nextTick(callback);
        }
      };

      Zlib.prototype.reset = function () {
        return this._binding.reset();
      };

// This is the _flush function called by the transform class,
// internally, when the last chunk has been written.
      Zlib.prototype._flush = function (callback) {
        this._transform(new Buffer(0), '', callback);
      };

      Zlib.prototype.flush = function (kind, callback) {
        var ws = this._writableState;

        if (typeof kind === 'function' || (kind === void 0 && !callback)) {
          callback = kind;
          kind = binding.Z_FULL_FLUSH;
        }

        if (ws.ended) {
          if (callback)
            process.nextTick(callback);
        } else if (ws.ending) {
          if (callback)
            this.once('end', callback);
        } else if (ws.needDrain) {
          var self = this;
          this.once('drain', function () {
            self.flush(callback);
          });
        } else {
          this._flushFlag = kind;
          this.write(new Buffer(0), '', callback);
        }
      };

      Zlib.prototype.close = function (callback) {
        if (callback)
          process.nextTick(callback);

        if (this._closed)
          return;

        this._closed = true;

        this._binding.close();

        var self = this;
        process.nextTick(function () {
          self.emit('close');
        });
      };

      Zlib.prototype._transform = function (chunk, encoding, cb) {
        var flushFlag;
        var ws = this._writableState;
        var ending = ws.ending || ws.ended;
        var last = ending && (!chunk || ws.length === chunk.length);

        if (!chunk === null && !Buffer.isBuffer(chunk))
          return cb(new Error('invalid input'));

        // If it's the last chunk, or a final flush, we use the Z_FINISH flush flag.
        // If it's explicitly flushing at some other time, then we use
        // Z_FULL_FLUSH. Otherwise, use Z_NO_FLUSH for maximum compression
        // goodness.
        if (last)
          flushFlag = binding.Z_FINISH;
        else {
          flushFlag = this._flushFlag;
          // once we've flushed the last of the queue, stop flushing and
          // go back to the normal behavior.
          if (chunk.length >= ws.length) {
            this._flushFlag = this._opts.flush || binding.Z_NO_FLUSH;
          }
        }

        var self = this;
        this._processChunk(chunk, flushFlag, cb);
      };

      Zlib.prototype._processChunk = function (chunk, flushFlag, cb) {
        var availInBefore = chunk && chunk.length;
        var availOutBefore = this._chunkSize - this._offset;
        var inOff = 0;

        var self = this;

        var async = typeof cb === 'function';

        if (!async) {
          var buffers = [];
          var nread = 0;

          var error;
          this.on('error', function (er) {
            error = er;
          });

          do {
            var res = this._binding.writeSync(flushFlag,
                chunk, // in
                inOff, // in_off
                availInBefore, // in_len
                this._buffer, // out
                this._offset, //out_off
                availOutBefore); // out_len
          } while (!this._hadError && callback(res[0], res[1]));

          if (this._hadError) {
            throw error;
          }

          var buf = Buffer.concat(buffers, nread);
          this.close();

          return buf;
        }

        var req = this._binding.write(flushFlag,
            chunk, // in
            inOff, // in_off
            availInBefore, // in_len
            this._buffer, // out
            this._offset, //out_off
            availOutBefore); // out_len

        req.buffer = chunk;
        req.callback = callback;

        function callback(availInAfter, availOutAfter) {
          if (self._hadError)
            return;

          var have = availOutBefore - availOutAfter;
          assert(have >= 0, 'have should not go down');

          if (have > 0) {
            var out = self._buffer.slice(self._offset, self._offset + have);
            self._offset += have;
            // serve some output to the consumer.
            if (async) {
              self.push(out);
            } else {
              buffers.push(out);
              nread += out.length;
            }
          }

          // exhausted the output buffer, or used all the input create a new one.
          if (availOutAfter === 0 || self._offset >= self._chunkSize) {
            availOutBefore = self._chunkSize;
            self._offset = 0;
            self._buffer = new Buffer(self._chunkSize);
          }

          if (availOutAfter === 0) {
            // Not actually done.  Need to reprocess.
            // Also, update the availInBefore to the availInAfter value,
            // so that if we have to hit it a third (fourth, etc.) time,
            // it'll have the correct byte counts.
            inOff += (availInBefore - availInAfter);
            availInBefore = availInAfter;

            if (!async)
              return true;

            var newReq = self._binding.write(flushFlag,
                chunk,
                inOff,
                availInBefore,
                self._buffer,
                self._offset,
                self._chunkSize);
            newReq.callback = callback; // this same function
            newReq.buffer = chunk;
            return;
          }

          if (!async)
            return false;

          // finished with the chunk.
          cb();
        }
      };

      util.inherits(Deflate, Zlib);
      util.inherits(Inflate, Zlib);
      util.inherits(Gzip, Zlib);
      util.inherits(Gunzip, Zlib);
      util.inherits(DeflateRaw, Zlib);
      util.inherits(InflateRaw, Zlib);
      util.inherits(Unzip, Zlib);

    }).call(this, require('_process'), require("buffer").Buffer)
  }, {"./binding": 15, "_process": 25, "_stream_transform": 38, "assert": 2, "buffer": 17, "util": 43}],
  17: [function (require, module, exports) {
    (function (global) {
      /*!
       * The buffer module from node.js, for the browser.
       *
       * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
       * @license  MIT
       */
      /* eslint-disable no-proto */

      'use strict'

      var base64 = require('base64-js')
      var ieee754 = require('ieee754')
      var isArray = require('isarray')

      exports.Buffer = Buffer
      exports.SlowBuffer = SlowBuffer
      exports.INSPECT_MAX_BYTES = 50
      Buffer.poolSize = 8192 // not used by this implementation

      var rootParent = {}

      /**
       * If `Buffer.TYPED_ARRAY_SUPPORT`:
       *   === true    Use Uint8Array implementation (fastest)
       *   === false   Use Object implementation (most compatible, even IE6)
       *
       * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
       * Opera 11.6+, iOS 4.2+.
       *
       * Due to various browser bugs, sometimes the Object implementation will be used even
       * when the browser supports typed arrays.
       *
       * Note:
       *
       *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
       *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
       *
       *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
       *
       *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
       *     incorrect length in some situations.

       * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
       * get the Object implementation, which is slower but behaves correctly.
       */
      Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
          ? global.TYPED_ARRAY_SUPPORT
          : typedArraySupport()

      function typedArraySupport() {
        try {
          var arr = new Uint8Array(1)
          arr.foo = function () {
            return 42
          }
          return arr.foo() === 42 && // typed array instances can be augmented
              typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
              arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
        } catch (e) {
          return false
        }
      }

      function kMaxLength() {
        return Buffer.TYPED_ARRAY_SUPPORT
            ? 0x7fffffff
            : 0x3fffffff
      }

      /**
       * The Buffer constructor returns instances of `Uint8Array` that have their
       * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
       * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
       * and the `Uint8Array` methods. Square bracket notation works as expected -- it
       * returns a single octet.
       *
       * The `Uint8Array` prototype remains unmodified.
       */
      function Buffer(arg) {
        if (!(this instanceof Buffer)) {
          // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
          if (arguments.length > 1) return new Buffer(arg, arguments[1])
          return new Buffer(arg)
        }

        if (!Buffer.TYPED_ARRAY_SUPPORT) {
          this.length = 0
          this.parent = undefined
        }

        // Common case.
        if (typeof arg === 'number') {
          return fromNumber(this, arg)
        }

        // Slightly less common case.
        if (typeof arg === 'string') {
          return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
        }

        // Unusual.
        return fromObject(this, arg)
      }

// TODO: Legacy, not needed anymore. Remove in next major version.
      Buffer._augment = function (arr) {
        arr.__proto__ = Buffer.prototype
        return arr
      }

      function fromNumber(that, length) {
        that = allocate(that, length < 0 ? 0 : checked(length) | 0)
        if (!Buffer.TYPED_ARRAY_SUPPORT) {
          for (var i = 0; i < length; i++) {
            that[i] = 0
          }
        }
        return that
      }

      function fromString(that, string, encoding) {
        if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

        // Assumption: byteLength() return value is always < kMaxLength.
        var length = byteLength(string, encoding) | 0
        that = allocate(that, length)

        that.write(string, encoding)
        return that
      }

      function fromObject(that, object) {
        if (Buffer.isBuffer(object)) return fromBuffer(that, object)

        if (isArray(object)) return fromArray(that, object)

        if (object == null) {
          throw new TypeError('must start with number, buffer, array or string')
        }

        if (typeof ArrayBuffer !== 'undefined') {
          if (object.buffer instanceof ArrayBuffer) {
            return fromTypedArray(that, object)
          }
          if (object instanceof ArrayBuffer) {
            return fromArrayBuffer(that, object)
          }
        }

        if (object.length) return fromArrayLike(that, object)

        return fromJsonObject(that, object)
      }

      function fromBuffer(that, buffer) {
        var length = checked(buffer.length) | 0
        that = allocate(that, length)
        buffer.copy(that, 0, 0, length)
        return that
      }

      function fromArray(that, array) {
        var length = checked(array.length) | 0
        that = allocate(that, length)
        for (var i = 0; i < length; i += 1) {
          that[i] = array[i] & 255
        }
        return that
      }

// Duplicate of fromArray() to keep fromArray() monomorphic.
      function fromTypedArray(that, array) {
        var length = checked(array.length) | 0
        that = allocate(that, length)
        // Truncating the elements is probably not what people expect from typed
        // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
        // of the old Buffer constructor.
        for (var i = 0; i < length; i += 1) {
          that[i] = array[i] & 255
        }
        return that
      }

      function fromArrayBuffer(that, array) {
        array.byteLength // this throws if `array` is not a valid ArrayBuffer

        if (Buffer.TYPED_ARRAY_SUPPORT) {
          // Return an augmented `Uint8Array` instance, for best performance
          that = new Uint8Array(array)
          that.__proto__ = Buffer.prototype
        } else {
          // Fallback: Return an object instance of the Buffer class
          that = fromTypedArray(that, new Uint8Array(array))
        }
        return that
      }

      function fromArrayLike(that, array) {
        var length = checked(array.length) | 0
        that = allocate(that, length)
        for (var i = 0; i < length; i += 1) {
          that[i] = array[i] & 255
        }
        return that
      }

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
      function fromJsonObject(that, object) {
        var array
        var length = 0

        if (object.type === 'Buffer' && isArray(object.data)) {
          array = object.data
          length = checked(array.length) | 0
        }
        that = allocate(that, length)

        for (var i = 0; i < length; i += 1) {
          that[i] = array[i] & 255
        }
        return that
      }

      if (Buffer.TYPED_ARRAY_SUPPORT) {
        Buffer.prototype.__proto__ = Uint8Array.prototype
        Buffer.__proto__ = Uint8Array
        if (typeof Symbol !== 'undefined' && Symbol.species &&
            Buffer[Symbol.species] === Buffer) {
          // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
          Object.defineProperty(Buffer, Symbol.species, {
            value: null,
            configurable: true
          })
        }
      } else {
        // pre-set for values that may exist in the future
        Buffer.prototype.length = undefined
        Buffer.prototype.parent = undefined
      }

      function allocate(that, length) {
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          // Return an augmented `Uint8Array` instance, for best performance
          that = new Uint8Array(length)
          that.__proto__ = Buffer.prototype
        } else {
          // Fallback: Return an object instance of the Buffer class
          that.length = length
        }

        var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
        if (fromPool) that.parent = rootParent

        return that
      }

      function checked(length) {
        // Note: cannot use `length < kMaxLength` here because that fails when
        // length is NaN (which is otherwise coerced to zero.)
        if (length >= kMaxLength()) {
          throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
              'size: 0x' + kMaxLength().toString(16) + ' bytes')
        }
        return length | 0
      }

      function SlowBuffer(subject, encoding) {
        if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

        var buf = new Buffer(subject, encoding)
        delete buf.parent
        return buf
      }

      Buffer.isBuffer = function isBuffer(b) {
        return !!(b != null && b._isBuffer)
      }

      Buffer.compare = function compare(a, b) {
        if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
          throw new TypeError('Arguments must be Buffers')
        }

        if (a === b) return 0

        var x = a.length
        var y = b.length

        for (var i = 0, len = Math.min(x, y); i < len; ++i) {
          if (a[i] !== b[i]) {
            x = a[i]
            y = b[i]
            break
          }
        }

        if (x < y) return -1
        if (y < x) return 1
        return 0
      }

      Buffer.isEncoding = function isEncoding(encoding) {
        switch (String(encoding).toLowerCase()) {
          case 'hex':
          case 'utf8':
          case 'utf-8':
          case 'ascii':
          case 'binary':
          case 'base64':
          case 'raw':
          case 'ucs2':
          case 'ucs-2':
          case 'utf16le':
          case 'utf-16le':
            return true
          default:
            return false
        }
      }

      Buffer.concat = function concat(list, length) {
        if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

        if (list.length === 0) {
          return new Buffer(0)
        }

        var i
        if (length === undefined) {
          length = 0
          for (i = 0; i < list.length; i++) {
            length += list[i].length
          }
        }

        var buf = new Buffer(length)
        var pos = 0
        for (i = 0; i < list.length; i++) {
          var item = list[i]
          item.copy(buf, pos)
          pos += item.length
        }
        return buf
      }

      function byteLength(string, encoding) {
        if (typeof string !== 'string') string = '' + string

        var len = string.length
        if (len === 0) return 0

        // Use a for loop to avoid recursion
        var loweredCase = false
        for (; ;) {
          switch (encoding) {
            case 'ascii':
            case 'binary':
              // Deprecated
            case 'raw':
            case 'raws':
              return len
            case 'utf8':
            case 'utf-8':
              return utf8ToBytes(string).length
            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return len * 2
            case 'hex':
              return len >>> 1
            case 'base64':
              return base64ToBytes(string).length
            default:
              if (loweredCase) return utf8ToBytes(string).length // assume utf8
              encoding = ('' + encoding).toLowerCase()
              loweredCase = true
          }
        }
      }

      Buffer.byteLength = byteLength

      function slowToString(encoding, start, end) {
        var loweredCase = false

        start = start | 0
        end = end === undefined || end === Infinity ? this.length : end | 0

        if (!encoding) encoding = 'utf8'
        if (start < 0) start = 0
        if (end > this.length) end = this.length
        if (end <= start) return ''

        while (true) {
          switch (encoding) {
            case 'hex':
              return hexSlice(this, start, end)

            case 'utf8':
            case 'utf-8':
              return utf8Slice(this, start, end)

            case 'ascii':
              return asciiSlice(this, start, end)

            case 'binary':
              return binarySlice(this, start, end)

            case 'base64':
              return base64Slice(this, start, end)

            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return utf16leSlice(this, start, end)

            default:
              if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
              encoding = (encoding + '').toLowerCase()
              loweredCase = true
          }
        }
      }

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
      Buffer.prototype._isBuffer = true

      Buffer.prototype.toString = function toString() {
        var length = this.length | 0
        if (length === 0) return ''
        if (arguments.length === 0) return utf8Slice(this, 0, length)
        return slowToString.apply(this, arguments)
      }

      Buffer.prototype.equals = function equals(b) {
        if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
        if (this === b) return true
        return Buffer.compare(this, b) === 0
      }

      Buffer.prototype.inspect = function inspect() {
        var str = ''
        var max = exports.INSPECT_MAX_BYTES
        if (this.length > 0) {
          str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
          if (this.length > max) str += ' ... '
        }
        return '<Buffer ' + str + '>'
      }

      Buffer.prototype.compare = function compare(b) {
        if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
        return Buffer.compare(this, b)
      }

      Buffer.prototype.indexOf = function indexOf(val, byteOffset) {
        if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
        else if (byteOffset < -0x80000000) byteOffset = -0x80000000
        byteOffset >>= 0

        if (this.length === 0) return -1
        if (byteOffset >= this.length) return -1

        // Negative offsets start from the end of the buffer
        if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

        if (typeof val === 'string') {
          if (val.length === 0) return -1 // special case: looking for empty string always fails
          return String.prototype.indexOf.call(this, val, byteOffset)
        }
        if (Buffer.isBuffer(val)) {
          return arrayIndexOf(this, val, byteOffset)
        }
        if (typeof val === 'number') {
          if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
            return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
          }
          return arrayIndexOf(this, [val], byteOffset)
        }

        function arrayIndexOf(arr, val, byteOffset) {
          var foundIndex = -1
          for (var i = 0; byteOffset + i < arr.length; i++) {
            if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
              if (foundIndex === -1) foundIndex = i
              if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
            } else {
              foundIndex = -1
      }
          }
          return -1
        }

        throw new TypeError('val must be string, number or Buffer')
      }

      function hexWrite(buf, string, offset, length) {
        offset = Number(offset) || 0
        var remaining = buf.length - offset
        if (!length) {
          length = remaining
        } else {
          length = Number(length)
          if (length > remaining) {
            length = remaining
          }
        }

        // must be an even number of digits
        var strLen = string.length
        if (strLen % 2 !== 0) throw new Error('Invalid hex string')

        if (length > strLen / 2) {
          length = strLen / 2
        }
        for (var i = 0; i < length; i++) {
          var parsed = parseInt(string.substr(i * 2, 2), 16)
          if (isNaN(parsed)) throw new Error('Invalid hex string')
          buf[offset + i] = parsed
        }
        return i
      }

      function utf8Write(buf, string, offset, length) {
        return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
      }

      function asciiWrite(buf, string, offset, length) {
        return blitBuffer(asciiToBytes(string), buf, offset, length)
      }

      function binaryWrite(buf, string, offset, length) {
        return asciiWrite(buf, string, offset, length)
      }

      function base64Write(buf, string, offset, length) {
        return blitBuffer(base64ToBytes(string), buf, offset, length)
      }

      function ucs2Write(buf, string, offset, length) {
        return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
      }

      Buffer.prototype.write = function write(string, offset, length, encoding) {
        // Buffer#write(string)
        if (offset === undefined) {
          encoding = 'utf8'
          length = this.length
          offset = 0
          // Buffer#write(string, encoding)
        } else if (length === undefined && typeof offset === 'string') {
          encoding = offset
          length = this.length
          offset = 0
          // Buffer#write(string, offset[, length][, encoding])
        } else if (isFinite(offset)) {
          offset = offset | 0
          if (isFinite(length)) {
            length = length | 0
            if (encoding === undefined) encoding = 'utf8'
          } else {
            encoding = length
            length = undefined
          }
          // legacy write(string, encoding, offset, length) - remove in v0.13
        } else {
          var swap = encoding
          encoding = offset
          offset = length | 0
          length = swap
        }

        var remaining = this.length - offset
        if (length === undefined || length > remaining) length = remaining

        if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
          throw new RangeError('attempt to write outside buffer bounds')
        }

        if (!encoding) encoding = 'utf8'

        var loweredCase = false
        for (; ;) {
          switch (encoding) {
            case 'hex':
              return hexWrite(this, string, offset, length)

            case 'utf8':
            case 'utf-8':
              return utf8Write(this, string, offset, length)

            case 'ascii':
              return asciiWrite(this, string, offset, length)

            case 'binary':
              return binaryWrite(this, string, offset, length)

            case 'base64':
              // Warning: maxLength not taken into account in base64Write
              return base64Write(this, string, offset, length)

            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return ucs2Write(this, string, offset, length)

            default:
              if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
              encoding = ('' + encoding).toLowerCase()
              loweredCase = true
          }
        }
      }

      Buffer.prototype.toJSON = function toJSON() {
        return {
          type: 'Buffer',
          data: Array.prototype.slice.call(this._arr || this, 0)
        }
      }

      function base64Slice(buf, start, end) {
        if (start === 0 && end === buf.length) {
          return base64.fromByteArray(buf)
        } else {
          return base64.fromByteArray(buf.slice(start, end))
        }
      }

      function utf8Slice(buf, start, end) {
        end = Math.min(buf.length, end)
        var res = []

        var i = start
        while (i < end) {
          var firstByte = buf[i]
          var codePoint = null
          var bytesPerSequence = (firstByte > 0xEF) ? 4
              : (firstByte > 0xDF) ? 3
              : (firstByte > 0xBF) ? 2
              : 1

          if (i + bytesPerSequence <= end) {
            var secondByte, thirdByte, fourthByte, tempCodePoint

            switch (bytesPerSequence) {
              case 1:
                if (firstByte < 0x80) {
                  codePoint = firstByte
                }
                break
              case 2:
                secondByte = buf[i + 1]
                if ((secondByte & 0xC0) === 0x80) {
                  tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
                  if (tempCodePoint > 0x7F) {
                    codePoint = tempCodePoint
            }
          }
                break
              case 3:
                secondByte = buf[i + 1]
                thirdByte = buf[i + 2]
                if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
                  tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
                  if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                    codePoint = tempCodePoint
            }
          }
                break
              case 4:
                secondByte = buf[i + 1]
                thirdByte = buf[i + 2]
                fourthByte = buf[i + 3]
                if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
                  tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
                  if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                    codePoint = tempCodePoint
            }
          }
            }
          }

          if (codePoint === null) {
            // we did not generate a valid codePoint so insert a
            // replacement char (U+FFFD) and advance only 1 byte
            codePoint = 0xFFFD
            bytesPerSequence = 1
          } else if (codePoint > 0xFFFF) {
            // encode to utf16 (surrogate pair dance)
            codePoint -= 0x10000
            res.push(codePoint >>> 10 & 0x3FF | 0xD800)
            codePoint = 0xDC00 | codePoint & 0x3FF
          }

          res.push(codePoint)
          i += bytesPerSequence
        }

        return decodeCodePointsArray(res)
      }

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
      var MAX_ARGUMENTS_LENGTH = 0x1000

      function decodeCodePointsArray(codePoints) {
        var len = codePoints.length
        if (len <= MAX_ARGUMENTS_LENGTH) {
          return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
        }

        // Decode in chunks to avoid "call stack size exceeded".
        var res = ''
        var i = 0
        while (i < len) {
          res += String.fromCharCode.apply(
              String,
              codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
          )
        }
        return res
      }

      function asciiSlice(buf, start, end) {
        var ret = ''
        end = Math.min(buf.length, end)

        for (var i = start; i < end; i++) {
          ret += String.fromCharCode(buf[i] & 0x7F)
        }
        return ret
      }

      function binarySlice(buf, start, end) {
        var ret = ''
        end = Math.min(buf.length, end)

        for (var i = start; i < end; i++) {
          ret += String.fromCharCode(buf[i])
        }
        return ret
      }

      function hexSlice(buf, start, end) {
        var len = buf.length

        if (!start || start < 0) start = 0
        if (!end || end < 0 || end > len) end = len

        var out = ''
        for (var i = start; i < end; i++) {
          out += toHex(buf[i])
        }
        return out
      }

      function utf16leSlice(buf, start, end) {
        var bytes = buf.slice(start, end)
        var res = ''
        for (var i = 0; i < bytes.length; i += 2) {
          res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
        }
        return res
      }

      Buffer.prototype.slice = function slice(start, end) {
        var len = this.length
        start = ~~start
        end = end === undefined ? len : ~~end

        if (start < 0) {
          start += len
          if (start < 0) start = 0
        } else if (start > len) {
          start = len
        }

        if (end < 0) {
          end += len
          if (end < 0) end = 0
        } else if (end > len) {
          end = len
        }

        if (end < start) end = start

        var newBuf
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          newBuf = this.subarray(start, end)
          newBuf.__proto__ = Buffer.prototype
        } else {
          var sliceLen = end - start
          newBuf = new Buffer(sliceLen, undefined)
          for (var i = 0; i < sliceLen; i++) {
            newBuf[i] = this[i + start]
          }
        }

        if (newBuf.length) newBuf.parent = this.parent || this

        return newBuf
      }

      /*
       * Need to make sure that buffer isn't trying to write out of bounds.
       */
      function checkOffset(offset, ext, length) {
        if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
        if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
      }

      Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
        offset = offset | 0
        byteLength = byteLength | 0
        if (!noAssert) checkOffset(offset, byteLength, this.length)

        var val = this[offset]
        var mul = 1
        var i = 0
        while (++i < byteLength && (mul *= 0x100)) {
          val += this[offset + i] * mul
        }

        return val
      }

      Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
        offset = offset | 0
        byteLength = byteLength | 0
        if (!noAssert) {
          checkOffset(offset, byteLength, this.length)
        }

        var val = this[offset + --byteLength]
        var mul = 1
        while (byteLength > 0 && (mul *= 0x100)) {
          val += this[offset + --byteLength] * mul
        }

        return val
      }

      Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 1, this.length)
        return this[offset]
      }

      Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 2, this.length)
        return this[offset] | (this[offset + 1] << 8)
      }

      Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 2, this.length)
        return (this[offset] << 8) | this[offset + 1]
      }

      Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length)

        return ((this[offset]) |
            (this[offset + 1] << 8) |
            (this[offset + 2] << 16)) +
            (this[offset + 3] * 0x1000000)
      }

      Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length)

        return (this[offset] * 0x1000000) +
            ((this[offset + 1] << 16) |
            (this[offset + 2] << 8) |
            this[offset + 3])
      }

      Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
        offset = offset | 0
        byteLength = byteLength | 0
        if (!noAssert) checkOffset(offset, byteLength, this.length)

        var val = this[offset]
        var mul = 1
        var i = 0
        while (++i < byteLength && (mul *= 0x100)) {
          val += this[offset + i] * mul
        }
        mul *= 0x80

        if (val >= mul) val -= Math.pow(2, 8 * byteLength)

        return val
      }

      Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
        offset = offset | 0
        byteLength = byteLength | 0
        if (!noAssert) checkOffset(offset, byteLength, this.length)

        var i = byteLength
        var mul = 1
        var val = this[offset + --i]
        while (i > 0 && (mul *= 0x100)) {
          val += this[offset + --i] * mul
        }
        mul *= 0x80

        if (val >= mul) val -= Math.pow(2, 8 * byteLength)

        return val
      }

      Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 1, this.length)
        if (!(this[offset] & 0x80)) return (this[offset])
        return ((0xff - this[offset] + 1) * -1)
      }

      Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 2, this.length)
        var val = this[offset] | (this[offset + 1] << 8)
        return (val & 0x8000) ? val | 0xFFFF0000 : val
      }

      Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 2, this.length)
        var val = this[offset + 1] | (this[offset] << 8)
        return (val & 0x8000) ? val | 0xFFFF0000 : val
      }

      Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length)

        return (this[offset]) |
            (this[offset + 1] << 8) |
            (this[offset + 2] << 16) |
            (this[offset + 3] << 24)
      }

      Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length)

        return (this[offset] << 24) |
            (this[offset + 1] << 16) |
            (this[offset + 2] << 8) |
            (this[offset + 3])
      }

      Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length)
        return ieee754.read(this, offset, true, 23, 4)
      }

      Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 4, this.length)
        return ieee754.read(this, offset, false, 23, 4)
      }

      Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 8, this.length)
        return ieee754.read(this, offset, true, 52, 8)
      }

      Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
        if (!noAssert) checkOffset(offset, 8, this.length)
        return ieee754.read(this, offset, false, 52, 8)
      }

      function checkInt(buf, value, offset, ext, max, min) {
        if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
        if (value > max || value < min) throw new RangeError('value is out of bounds')
        if (offset + ext > buf.length) throw new RangeError('index out of range')
      }

      Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
        value = +value
        offset = offset | 0
        byteLength = byteLength | 0
        if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

        var mul = 1
        var i = 0
        this[offset] = value & 0xFF
        while (++i < byteLength && (mul *= 0x100)) {
          this[offset + i] = (value / mul) & 0xFF
        }

        return offset + byteLength
      }

      Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
        value = +value
        offset = offset | 0
        byteLength = byteLength | 0
        if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

        var i = byteLength - 1
        var mul = 1
        this[offset + i] = value & 0xFF
        while (--i >= 0 && (mul *= 0x100)) {
          this[offset + i] = (value / mul) & 0xFF
        }

        return offset + byteLength
      }

      Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
        value = +value
        offset = offset | 0
        if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
        if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
        this[offset] = (value & 0xff)
        return offset + 1
      }

      function objectWriteUInt16(buf, value, offset, littleEndian) {
        if (value < 0) value = 0xffff + value + 1
        for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
          buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
              (littleEndian ? i : 1 - i) * 8
        }
      }

      Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
        value = +value
        offset = offset | 0
        if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = (value & 0xff)
          this[offset + 1] = (value >>> 8)
        } else {
          objectWriteUInt16(this, value, offset, true)
        }
        return offset + 2
      }

      Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
        value = +value
        offset = offset | 0
        if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = (value >>> 8)
          this[offset + 1] = (value & 0xff)
        } else {
          objectWriteUInt16(this, value, offset, false)
        }
        return offset + 2
      }

      function objectWriteUInt32(buf, value, offset, littleEndian) {
        if (value < 0) value = 0xffffffff + value + 1
        for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
          buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
        }
      }

      Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
        value = +value
        offset = offset | 0
        if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset + 3] = (value >>> 24)
          this[offset + 2] = (value >>> 16)
          this[offset + 1] = (value >>> 8)
          this[offset] = (value & 0xff)
        } else {
          objectWriteUInt32(this, value, offset, true)
        }
        return offset + 4
      }

      Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
        value = +value
        offset = offset | 0
        if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = (value >>> 24)
          this[offset + 1] = (value >>> 16)
          this[offset + 2] = (value >>> 8)
          this[offset + 3] = (value & 0xff)
        } else {
          objectWriteUInt32(this, value, offset, false)
        }
        return offset + 4
      }

      Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
        value = +value
        offset = offset | 0
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength - 1)

          checkInt(this, value, offset, byteLength, limit - 1, -limit)
        }

        var i = 0
        var mul = 1
        var sub = value < 0 ? 1 : 0
        this[offset] = value & 0xFF
        while (++i < byteLength && (mul *= 0x100)) {
          this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
        }

        return offset + byteLength
      }

      Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
        value = +value
        offset = offset | 0
        if (!noAssert) {
          var limit = Math.pow(2, 8 * byteLength - 1)

          checkInt(this, value, offset, byteLength, limit - 1, -limit)
        }

        var i = byteLength - 1
        var mul = 1
        var sub = value < 0 ? 1 : 0
        this[offset + i] = value & 0xFF
        while (--i >= 0 && (mul *= 0x100)) {
          this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
        }

        return offset + byteLength
      }

      Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
        value = +value
        offset = offset | 0
        if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
        if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
        if (value < 0) value = 0xff + value + 1
        this[offset] = (value & 0xff)
        return offset + 1
      }

      Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
        value = +value
        offset = offset | 0
        if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = (value & 0xff)
          this[offset + 1] = (value >>> 8)
        } else {
          objectWriteUInt16(this, value, offset, true)
        }
        return offset + 2
      }

      Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
        value = +value
        offset = offset | 0
        if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = (value >>> 8)
          this[offset + 1] = (value & 0xff)
        } else {
          objectWriteUInt16(this, value, offset, false)
        }
        return offset + 2
      }

      Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
        value = +value
        offset = offset | 0
        if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = (value & 0xff)
          this[offset + 1] = (value >>> 8)
          this[offset + 2] = (value >>> 16)
          this[offset + 3] = (value >>> 24)
        } else {
          objectWriteUInt32(this, value, offset, true)
        }
        return offset + 4
      }

      Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
        value = +value
        offset = offset | 0
        if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
        if (value < 0) value = 0xffffffff + value + 1
        if (Buffer.TYPED_ARRAY_SUPPORT) {
          this[offset] = (value >>> 24)
          this[offset + 1] = (value >>> 16)
          this[offset + 2] = (value >>> 8)
          this[offset + 3] = (value & 0xff)
        } else {
          objectWriteUInt32(this, value, offset, false)
        }
        return offset + 4
      }

      function checkIEEE754(buf, value, offset, ext, max, min) {
        if (offset + ext > buf.length) throw new RangeError('index out of range')
        if (offset < 0) throw new RangeError('index out of range')
      }

      function writeFloat(buf, value, offset, littleEndian, noAssert) {
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
        }
        ieee754.write(buf, value, offset, littleEndian, 23, 4)
        return offset + 4
      }

      Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
        return writeFloat(this, value, offset, true, noAssert)
      }

      Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
        return writeFloat(this, value, offset, false, noAssert)
      }

      function writeDouble(buf, value, offset, littleEndian, noAssert) {
        if (!noAssert) {
          checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
        }
        ieee754.write(buf, value, offset, littleEndian, 52, 8)
        return offset + 8
      }

      Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
        return writeDouble(this, value, offset, true, noAssert)
      }

      Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
        return writeDouble(this, value, offset, false, noAssert)
      }

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
      Buffer.prototype.copy = function copy(target, targetStart, start, end) {
        if (!start) start = 0
        if (!end && end !== 0) end = this.length
        if (targetStart >= target.length) targetStart = target.length
        if (!targetStart) targetStart = 0
        if (end > 0 && end < start) end = start

        // Copy 0 bytes; we're done
        if (end === start) return 0
        if (target.length === 0 || this.length === 0) return 0

        // Fatal error conditions
        if (targetStart < 0) {
          throw new RangeError('targetStart out of bounds')
        }
        if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
        if (end < 0) throw new RangeError('sourceEnd out of bounds')

        // Are we oob?
        if (end > this.length) end = this.length
        if (target.length - targetStart < end - start) {
          end = target.length - targetStart + start
        }

        var len = end - start
        var i

        if (this === target && start < targetStart && targetStart < end) {
          // descending copy from end
          for (i = len - 1; i >= 0; i--) {
            target[i + targetStart] = this[i + start]
          }
        } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
          // ascending copy from start
          for (i = 0; i < len; i++) {
            target[i + targetStart] = this[i + start]
          }
        } else {
          Uint8Array.prototype.set.call(
              target,
              this.subarray(start, start + len),
              targetStart
          )
        }

        return len
      }

// fill(value, start=0, end=buffer.length)
      Buffer.prototype.fill = function fill(value, start, end) {
        if (!value) value = 0
        if (!start) start = 0
        if (!end) end = this.length

        if (end < start) throw new RangeError('end < start')

        // Fill 0 bytes; we're done
        if (end === start) return
        if (this.length === 0) return

        if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
        if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

        var i
        if (typeof value === 'number') {
          for (i = start; i < end; i++) {
            this[i] = value
          }
        } else {
          var bytes = utf8ToBytes(value.toString())
          var len = bytes.length
          for (i = start; i < end; i++) {
            this[i] = bytes[i % len]
          }
        }

        return this
      }

// HELPER FUNCTIONS
// ================

      var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

      function base64clean(str) {
        // Node strips out invalid characters like \n and \t from the string, base64-js does not
        str = stringtrim(str).replace(INVALID_BASE64_RE, '')
        // Node converts strings with length < 2 to ''
        if (str.length < 2) return ''
        // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
        while (str.length % 4 !== 0) {
          str = str + '='
        }
        return str
      }

      function stringtrim(str) {
        if (str.trim) return str.trim()
        return str.replace(/^\s+|\s+$/g, '')
      }

      function toHex(n) {
        if (n < 16) return '0' + n.toString(16)
        return n.toString(16)
      }

      function utf8ToBytes(string, units) {
        units = units || Infinity
        var codePoint
        var length = string.length
        var leadSurrogate = null
        var bytes = []

        for (var i = 0; i < length; i++) {
          codePoint = string.charCodeAt(i)

          // is surrogate component
          if (codePoint > 0xD7FF && codePoint < 0xE000) {
            // last char was a lead
            if (!leadSurrogate) {
              // no lead yet
              if (codePoint > 0xDBFF) {
                // unexpected trail
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
                continue
              } else if (i + 1 === length) {
                // unpaired lead
                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
                continue
              }

              // valid lead
              leadSurrogate = codePoint

              continue
            }

            // 2 leads in a row
            if (codePoint < 0xDC00) {
              if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
              leadSurrogate = codePoint
              continue
            }

            // valid surrogate pair
            codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
          } else if (leadSurrogate) {
            // valid bmp char, but last char was a lead
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          }

          leadSurrogate = null

          // encode utf8
          if (codePoint < 0x80) {
            if ((units -= 1) < 0) break
            bytes.push(codePoint)
          } else if (codePoint < 0x800) {
            if ((units -= 2) < 0) break
            bytes.push(
                codePoint >> 0x6 | 0xC0,
                codePoint & 0x3F | 0x80
            )
          } else if (codePoint < 0x10000) {
            if ((units -= 3) < 0) break
            bytes.push(
                codePoint >> 0xC | 0xE0,
                codePoint >> 0x6 & 0x3F | 0x80,
                codePoint & 0x3F | 0x80
            )
          } else if (codePoint < 0x110000) {
            if ((units -= 4) < 0) break
            bytes.push(
                codePoint >> 0x12 | 0xF0,
                codePoint >> 0xC & 0x3F | 0x80,
                codePoint >> 0x6 & 0x3F | 0x80,
                codePoint & 0x3F | 0x80
            )
          } else {
            throw new Error('Invalid code point')
          }
        }

        return bytes
      }

      function asciiToBytes(str) {
        var byteArray = []
        for (var i = 0; i < str.length; i++) {
          // Node's code seems to be doing this and not & 0x7F..
          byteArray.push(str.charCodeAt(i) & 0xFF)
        }
        return byteArray
      }

      function utf16leToBytes(str, units) {
        var c, hi, lo
        var byteArray = []
        for (var i = 0; i < str.length; i++) {
          if ((units -= 2) < 0) break

          c = str.charCodeAt(i)
          hi = c >> 8
          lo = c % 256
          byteArray.push(lo)
          byteArray.push(hi)
        }

        return byteArray
      }

      function base64ToBytes(str) {
        return base64.toByteArray(base64clean(str))
      }

      function blitBuffer(src, dst, offset, length) {
        for (var i = 0; i < length; i++) {
          if ((i + offset >= dst.length) || (i >= src.length)) break
          dst[i + offset] = src[i]
        }
        return i
      }

    }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
  }, {"base64-js": 18, "ieee754": 19, "isarray": 20}],
  18: [function (require, module, exports) {
    'use strict'

    exports.toByteArray = toByteArray
    exports.fromByteArray = fromByteArray

    var lookup = []
    var revLookup = []
    var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

    function init() {
      var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
      for (var i = 0, len = code.length; i < len; ++i) {
        lookup[i] = code[i]
        revLookup[code.charCodeAt(i)] = i
      }

      revLookup['-'.charCodeAt(0)] = 62
      revLookup['_'.charCodeAt(0)] = 63
    }

    init()

    function toByteArray(b64) {
      var i, j, l, tmp, placeHolders, arr
      var len = b64.length

      if (len % 4 > 0) {
        throw new Error('Invalid string. Length must be a multiple of 4')
      }

      // the number of equal signs (place holders)
      // if there are two placeholders, than the two characters before it
      // represent one byte
      // if there is only one, then the three characters before it represent 2 bytes
      // this is just a cheap hack to not do indexOf twice
      placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0

      // base64 is 4/3 + up to two characters of the original data
      arr = new Arr(len * 3 / 4 - placeHolders)

      // if there are placeholders, only get up to the last complete 4 chars
      l = placeHolders > 0 ? len - 4 : len

      var L = 0

      for (i = 0, j = 0; i < l; i += 4, j += 3) {
        tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
        arr[L++] = (tmp >> 16) & 0xFF
        arr[L++] = (tmp >> 8) & 0xFF
        arr[L++] = tmp & 0xFF
      }

      if (placeHolders === 2) {
        tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
        arr[L++] = tmp & 0xFF
      } else if (placeHolders === 1) {
        tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
        arr[L++] = (tmp >> 8) & 0xFF
        arr[L++] = tmp & 0xFF
      }

      return arr
    }

    function tripletToBase64(num) {
      return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
    }

    function encodeChunk(uint8, start, end) {
      var tmp
      var output = []
      for (var i = start; i < end; i += 3) {
        tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
        output.push(tripletToBase64(tmp))
      }
      return output.join('')
    }

    function fromByteArray(uint8) {
      var tmp
      var len = uint8.length
      var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
      var output = ''
      var parts = []
      var maxChunkLength = 16383 // must be multiple of 3

      // go through the array every three bytes, we'll deal with trailing stuff later
      for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
        parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
      }

      // pad the end with zeros, but make sure to not forget the extra bytes
      if (extraBytes === 1) {
        tmp = uint8[len - 1]
        output += lookup[tmp >> 2]
        output += lookup[(tmp << 4) & 0x3F]
        output += '=='
      } else if (extraBytes === 2) {
        tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
        output += lookup[tmp >> 10]
        output += lookup[(tmp >> 4) & 0x3F]
        output += lookup[(tmp << 2) & 0x3F]
        output += '='
      }

      parts.push(output)

      return parts.join('')
    }

  }, {}],
  19: [function (require, module, exports) {
    exports.read = function (buffer, offset, isLE, mLen, nBytes) {
      var e, m
      var eLen = nBytes * 8 - mLen - 1
      var eMax = (1 << eLen) - 1
      var eBias = eMax >> 1
      var nBits = -7
      var i = isLE ? (nBytes - 1) : 0
      var d = isLE ? -1 : 1
      var s = buffer[offset + i]

      i += d

      e = s & ((1 << (-nBits)) - 1)
      s >>= (-nBits)
      nBits += eLen
      for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {
      }

      m = e & ((1 << (-nBits)) - 1)
      e >>= (-nBits)
      nBits += mLen
      for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {
      }

      if (e === 0) {
        e = 1 - eBias
      } else if (e === eMax) {
        return m ? NaN : ((s ? -1 : 1) * Infinity)
      } else {
        m = m + Math.pow(2, mLen)
        e = e - eBias
      }
      return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
    }

    exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
      var e, m, c
      var eLen = nBytes * 8 - mLen - 1
      var eMax = (1 << eLen) - 1
      var eBias = eMax >> 1
      var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
      var i = isLE ? 0 : (nBytes - 1)
      var d = isLE ? 1 : -1
      var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

      value = Math.abs(value)

      if (isNaN(value) || value === Infinity) {
        m = isNaN(value) ? 1 : 0
        e = eMax
      } else {
        e = Math.floor(Math.log(value) / Math.LN2)
        if (value * (c = Math.pow(2, -e)) < 1) {
          e--
          c *= 2
        }
        if (e + eBias >= 1) {
          value += rt / c
        } else {
          value += rt * Math.pow(2, 1 - eBias)
        }
        if (value * c >= 2) {
          e++
          c /= 2
        }

        if (e + eBias >= eMax) {
          m = 0
          e = eMax
        } else if (e + eBias >= 1) {
          m = (value * c - 1) * Math.pow(2, mLen)
          e = e + eBias
        } else {
          m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
          e = 0
        }
      }

      for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {
      }

      e = (e << mLen) | m
      eLen += mLen
      for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {
      }

      buffer[offset + i - d] |= s * 128
    }

  }, {}],
  20: [function (require, module, exports) {
    var toString = {}.toString;

    module.exports = Array.isArray || function (arr) {
          return toString.call(arr) == '[object Array]';
        };

  }, {}],
  21: [function (require, module, exports) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

    function EventEmitter() {
      this._events = this._events || {};
      this._maxListeners = this._maxListeners || undefined;
    }

    module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
    EventEmitter.EventEmitter = EventEmitter;

    EventEmitter.prototype._events = undefined;
    EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
    EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
    EventEmitter.prototype.setMaxListeners = function (n) {
      if (!isNumber(n) || n < 0 || isNaN(n))
        throw TypeError('n must be a positive number');
      this._maxListeners = n;
      return this;
    };

    EventEmitter.prototype.emit = function (type) {
      var er, handler, len, args, i, listeners;

      if (!this._events)
        this._events = {};

      // If there is no 'error' event listener then throw.
      if (type === 'error') {
        if (!this._events.error ||
            (isObject(this._events.error) && !this._events.error.length)) {
          er = arguments[1];
          if (er instanceof Error) {
            throw er; // Unhandled 'error' event
      }
          throw TypeError('Uncaught, unspecified "error" event.');
        }
      }

      handler = this._events[type];

      if (isUndefined(handler))
        return false;

      if (isFunction(handler)) {
        switch (arguments.length) {
            // fast cases
          case 1:
            handler.call(this);
            break;
          case 2:
            handler.call(this, arguments[1]);
            break;
          case 3:
            handler.call(this, arguments[1], arguments[2]);
            break;
            // slower
          default:
        args = Array.prototype.slice.call(arguments, 1);
            handler.apply(this, args);
        }
      } else if (isObject(handler)) {
        args = Array.prototype.slice.call(arguments, 1);
        listeners = handler.slice();
        len = listeners.length;
        for (i = 0; i < len; i++)
          listeners[i].apply(this, args);
      }

      return true;
    };

    EventEmitter.prototype.addListener = function (type, listener) {
      var m;

      if (!isFunction(listener))
        throw TypeError('listener must be a function');

      if (!this._events)
        this._events = {};

      // To avoid recursion in the case that type === "newListener"! Before
      // adding it to the listeners, first emit "newListener".
      if (this._events.newListener)
        this.emit('newListener', type,
            isFunction(listener.listener) ?
                listener.listener : listener);

      if (!this._events[type])
      // Optimize the case of one listener. Don't need the extra array object.
        this._events[type] = listener;
      else if (isObject(this._events[type]))
      // If we've already got an array, just append.
        this._events[type].push(listener);
      else
      // Adding the second element, need to change to array.
        this._events[type] = [this._events[type], listener];

      // Check for listener leak
      if (isObject(this._events[type]) && !this._events[type].warned) {
        if (!isUndefined(this._maxListeners)) {
          m = this._maxListeners;
        } else {
          m = EventEmitter.defaultMaxListeners;
        }

        if (m && m > 0 && this._events[type].length > m) {
          this._events[type].warned = true;
          console.error('(node) warning: possible EventEmitter memory ' +
              'leak detected. %d listeners added. ' +
              'Use emitter.setMaxListeners() to increase limit.',
              this._events[type].length);
          if (typeof console.trace === 'function') {
            // not supported in IE 10
            console.trace();
      }
        }
      }

      return this;
    };

    EventEmitter.prototype.on = EventEmitter.prototype.addListener;

    EventEmitter.prototype.once = function (type, listener) {
      if (!isFunction(listener))
        throw TypeError('listener must be a function');

      var fired = false;

      function g() {
        this.removeListener(type, g);

        if (!fired) {
          fired = true;
          listener.apply(this, arguments);
        }
      }

      g.listener = listener;
      this.on(type, g);

      return this;
    };

// emits a 'removeListener' event iff the listener was removed
    EventEmitter.prototype.removeListener = function (type, listener) {
      var list, position, length, i;

      if (!isFunction(listener))
        throw TypeError('listener must be a function');

      if (!this._events || !this._events[type])
        return this;

      list = this._events[type];
      length = list.length;
      position = -1;

      if (list === listener ||
          (isFunction(list.listener) && list.listener === listener)) {
        delete this._events[type];
        if (this._events.removeListener)
          this.emit('removeListener', type, listener);

      } else if (isObject(list)) {
        for (i = length; i-- > 0;) {
          if (list[i] === listener ||
              (list[i].listener && list[i].listener === listener)) {
            position = i;
            break;
      }
        }

        if (position < 0)
      return this;

        if (list.length === 1) {
          list.length = 0;
      delete this._events[type];
    } else {
          list.splice(position, 1);
        }

        if (this._events.removeListener)
          this.emit('removeListener', type, listener);
      }

      return this;
    };

    EventEmitter.prototype.removeAllListeners = function (type) {
      var key, listeners;

      if (!this._events)
        return this;

      // not listening for removeListener, no need to emit
      if (!this._events.removeListener) {
        if (arguments.length === 0)
          this._events = {};
        else if (this._events[type])
          delete this._events[type];
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        for (key in this._events) {
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = {};
        return this;
      }

      listeners = this._events[type];

      if (isFunction(listeners)) {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        while (listeners.length)
          this.removeListener(type, listeners[listeners.length - 1]);
      }
      delete this._events[type];

      return this;
    };

    EventEmitter.prototype.listeners = function (type) {
      var ret;
      if (!this._events || !this._events[type])
        ret = [];
      else if (isFunction(this._events[type]))
        ret = [this._events[type]];
      else
        ret = this._events[type].slice();
      return ret;
    };

    EventEmitter.prototype.listenerCount = function (type) {
      if (this._events) {
        var evlistener = this._events[type];

        if (isFunction(evlistener))
          return 1;
        else if (evlistener)
          return evlistener.length;
      }
      return 0;
    };

    EventEmitter.listenerCount = function (emitter, type) {
      return emitter.listenerCount(type);
    };

    function isFunction(arg) {
      return typeof arg === 'function';
    }

    function isNumber(arg) {
      return typeof arg === 'number';
    }

    function isObject(arg) {
      return typeof arg === 'object' && arg !== null;
    }

    function isUndefined(arg) {
      return arg === void 0;
    }

  }, {}],
  22: [function (require, module, exports) {
    if (typeof Object.create === 'function') {
      // implementation from standard node.js 'util' module
      module.exports = function inherits(ctor, superCtor) {
        ctor.super_ = superCtor
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
      }
        });
      };
    } else {
      // old school shim for old browsers
      module.exports = function inherits(ctor, superCtor) {
        ctor.super_ = superCtor
        var TempCtor = function () {
        }
        TempCtor.prototype = superCtor.prototype
        ctor.prototype = new TempCtor()
        ctor.prototype.constructor = ctor
      }
    }

  }, {}],
  23: [function (require, module, exports) {
    /**
     * Determine if an object is Buffer
     *
     * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
     * License:  MIT
     *
     * `npm install is-buffer`
     */

    module.exports = function (obj) {
      return !!(obj != null &&
      (obj._isBuffer || // For Safari 5-7 (missing Object.prototype.constructor)
          (obj.constructor &&
          typeof obj.constructor.isBuffer === 'function' &&
          obj.constructor.isBuffer(obj))
      ))
    }

  }, {}],
  24: [function (require, module, exports) {
    (function (process) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
      function normalizeArray(parts, allowAboveRoot) {
        // if the path tries to go above the root, `up` ends up > 0
        var up = 0;
        for (var i = parts.length - 1; i >= 0; i--) {
          var last = parts[i];
          if (last === '.') {
            parts.splice(i, 1);
          } else if (last === '..') {
            parts.splice(i, 1);
            up++;
          } else if (up) {
            parts.splice(i, 1);
            up--;
          }
        }

        // if the path is allowed to go above the root, restore leading ..s
        if (allowAboveRoot) {
          for (; up--; up) {
            parts.unshift('..');
          }
        }

        return parts;
      }

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
      var splitPathRe =
          /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
      var splitPath = function (filename) {
        return splitPathRe.exec(filename).slice(1);
      };

// path.resolve([from ...], to)
// posix version
      exports.resolve = function () {
        var resolvedPath = '',
            resolvedAbsolute = false;

        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
          var path = (i >= 0) ? arguments[i] : process.cwd();

          // Skip empty and invalid entries
          if (typeof path !== 'string') {
            throw new TypeError('Arguments to path.resolve must be strings');
          } else if (!path) {
            continue;
          }

          resolvedPath = path + '/' + resolvedPath;
          resolvedAbsolute = path.charAt(0) === '/';
        }

        // At this point the path should be resolved to a full absolute path, but
        // handle relative paths to be safe (might happen when process.cwd() fails)

        // Normalize the path
        resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function (p) {
          return !!p;
        }), !resolvedAbsolute).join('/');

        return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
      };

// path.normalize(path)
// posix version
      exports.normalize = function (path) {
        var isAbsolute = exports.isAbsolute(path),
            trailingSlash = substr(path, -1) === '/';

        // Normalize the path
        path = normalizeArray(filter(path.split('/'), function (p) {
          return !!p;
        }), !isAbsolute).join('/');

        if (!path && !isAbsolute) {
          path = '.';
        }
        if (path && trailingSlash) {
          path += '/';
        }

        return (isAbsolute ? '/' : '') + path;
      };

// posix version
      exports.isAbsolute = function (path) {
        return path.charAt(0) === '/';
      };

// posix version
      exports.join = function () {
        var paths = Array.prototype.slice.call(arguments, 0);
        return exports.normalize(filter(paths, function (p, index) {
          if (typeof p !== 'string') {
            throw new TypeError('Arguments to path.join must be strings');
          }
          return p;
        }).join('/'));
      };


// path.relative(from, to)
// posix version
      exports.relative = function (from, to) {
        from = exports.resolve(from).substr(1);
        to = exports.resolve(to).substr(1);

        function trim(arr) {
          var start = 0;
          for (; start < arr.length; start++) {
            if (arr[start] !== '') break;
          }

          var end = arr.length - 1;
          for (; end >= 0; end--) {
            if (arr[end] !== '') break;
          }

          if (start > end) return [];
          return arr.slice(start, end - start + 1);
        }

        var fromParts = trim(from.split('/'));
        var toParts = trim(to.split('/'));

        var length = Math.min(fromParts.length, toParts.length);
        var samePartsLength = length;
        for (var i = 0; i < length; i++) {
          if (fromParts[i] !== toParts[i]) {
            samePartsLength = i;
            break;
          }
        }

        var outputParts = [];
        for (var i = samePartsLength; i < fromParts.length; i++) {
          outputParts.push('..');
        }

        outputParts = outputParts.concat(toParts.slice(samePartsLength));

        return outputParts.join('/');
      };

      exports.sep = '/';
      exports.delimiter = ':';

      exports.dirname = function (path) {
        var result = splitPath(path),
            root = result[0],
            dir = result[1];

        if (!root && !dir) {
          // No dirname whatsoever
          return '.';
        }

        if (dir) {
          // It has a dirname, strip trailing slash
          dir = dir.substr(0, dir.length - 1);
        }

        return root + dir;
      };


      exports.basename = function (path, ext) {
        var f = splitPath(path)[2];
        // TODO: make this comparison case-insensitive on windows?
        if (ext && f.substr(-1 * ext.length) === ext) {
          f = f.substr(0, f.length - ext.length);
        }
        return f;
      };


      exports.extname = function (path) {
        return splitPath(path)[3];
      };

      function filter(xs, f) {
        if (xs.filter) return xs.filter(f);
        var res = [];
        for (var i = 0; i < xs.length; i++) {
          if (f(xs[i], i, xs)) res.push(xs[i]);
        }
        return res;
      }

// String.prototype.substr - negative index don't work in IE8
      var substr = 'ab'.substr(-1) === 'b'
              ? function (str, start, len) {
            return str.substr(start, len)
          }
              : function (str, start, len) {
            if (start < 0) start = str.length + start;
            return str.substr(start, len);
          }
          ;

    }).call(this, require('_process'))
  }, {"_process": 25}],
  25: [function (require, module, exports) {
// shim for using process in browser

    var process = module.exports = {};
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;

    function cleanUpNextTick() {
      draining = false;
      if (currentQueue.length) {
        queue = currentQueue.concat(queue);
      } else {
        queueIndex = -1;
      }
      if (queue.length) {
        drainQueue();
    }
    }

    function drainQueue() {
      if (draining) {
        return;
      }
      var timeout = setTimeout(cleanUpNextTick);
      draining = true;

      var len = queue.length;
      while (len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
          if (currentQueue) {
            currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
      currentQueue = null;
      draining = false;
      clearTimeout(timeout);
    }

    process.nextTick = function (fun) {
      var args = new Array(arguments.length - 1);
      if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
          args[i - 1] = arguments[i];
        }
      }
      queue.push(new Item(fun, args));
      if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
      }
    };

// v8 likes predictible objects
    function Item(fun, array) {
      this.fun = fun;
      this.array = array;
    }

    Item.prototype.run = function () {
      this.fun.apply(null, this.array);
    };
    process.title = 'browser';
    process.browser = true;
    process.env = {};
    process.argv = [];
    process.version = ''; // empty string to avoid regexp issues
    process.versions = {};

    function noop() {
    }

    process.on = noop;
    process.addListener = noop;
    process.once = noop;
    process.off = noop;
    process.removeListener = noop;
    process.removeAllListeners = noop;
    process.emit = noop;

    process.binding = function (name) {
      throw new Error('process.binding is not supported');
    };

    process.cwd = function () {
      return '/'
    };
    process.chdir = function (dir) {
      throw new Error('process.chdir is not supported');
    };
    process.umask = function () {
      return 0;
    };

  }, {}],
  26: [function (require, module, exports) {
    module.exports = require("./lib/_stream_duplex.js")

  }, {"./lib/_stream_duplex.js": 27}],
  27: [function (require, module, exports) {
// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

    'use strict';

    /*<replacement>*/

    var objectKeys = Object.keys || function (obj) {
          var keys = [];
          for (var key in obj) {
            keys.push(key);
          }
          return keys;
        };
    /*</replacement>*/

    module.exports = Duplex;

    /*<replacement>*/
    var processNextTick = require('process-nextick-args');
    /*</replacement>*/

    /*<replacement>*/
    var util = require('core-util-is');
    util.inherits = require('inherits');
    /*</replacement>*/

    var Readable = require('./_stream_readable');
    var Writable = require('./_stream_writable');

    util.inherits(Duplex, Readable);

    var keys = objectKeys(Writable.prototype);
    for (var v = 0; v < keys.length; v++) {
      var method = keys[v];
      if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
    }

    function Duplex(options) {
      if (!(this instanceof Duplex)) return new Duplex(options);

      Readable.call(this, options);
      Writable.call(this, options);

      if (options && options.readable === false) this.readable = false;

      if (options && options.writable === false) this.writable = false;

      this.allowHalfOpen = true;
      if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

      this.once('end', onend);
    }

// the no-half-open enforcer
    function onend() {
      // if we allow half-open state, or if the writable side ended,
      // then we're ok.
      if (this.allowHalfOpen || this._writableState.ended) return;

      // no more data can be written.
      // But allow more writes to happen in this tick.
      processNextTick(onEndNT, this);
    }

    function onEndNT(self) {
      self.end();
    }

    function forEach(xs, f) {
      for (var i = 0, l = xs.length; i < l; i++) {
        f(xs[i], i);
      }
    }
  }, {
    "./_stream_readable": 29,
    "./_stream_writable": 31,
    "core-util-is": 32,
    "inherits": 22,
    "process-nextick-args": 34
  }],
  28: [function (require, module, exports) {
// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

    'use strict';

    module.exports = PassThrough;

    var Transform = require('./_stream_transform');

    /*<replacement>*/
    var util = require('core-util-is');
    util.inherits = require('inherits');
    /*</replacement>*/

    util.inherits(PassThrough, Transform);

    function PassThrough(options) {
      if (!(this instanceof PassThrough)) return new PassThrough(options);

      Transform.call(this, options);
    }

    PassThrough.prototype._transform = function (chunk, encoding, cb) {
      cb(null, chunk);
    };
  }, {"./_stream_transform": 30, "core-util-is": 32, "inherits": 22}],
  29: [function (require, module, exports) {
    (function (process) {
      'use strict';

      module.exports = Readable;

      /*<replacement>*/
      var processNextTick = require('process-nextick-args');
      /*</replacement>*/

      /*<replacement>*/
      var isArray = require('isarray');
      /*</replacement>*/

      /*<replacement>*/
      var Buffer = require('buffer').Buffer;
      /*</replacement>*/

      Readable.ReadableState = ReadableState;

      var EE = require('events');

      /*<replacement>*/
      var EElistenerCount = function (emitter, type) {
        return emitter.listeners(type).length;
      };
      /*</replacement>*/

      /*<replacement>*/
      var Stream;
      (function () {
        try {
          Stream = require('st' + 'ream');
        } catch (_) {
        } finally {
          if (!Stream) Stream = require('events').EventEmitter;
        }
      })();
      /*</replacement>*/

      var Buffer = require('buffer').Buffer;

      /*<replacement>*/
      var util = require('core-util-is');
      util.inherits = require('inherits');
      /*</replacement>*/

      /*<replacement>*/
      var debugUtil = require('util');
      var debug = undefined;
      if (debugUtil && debugUtil.debuglog) {
        debug = debugUtil.debuglog('stream');
      } else {
        debug = function () {
        };
      }
      /*</replacement>*/

      var StringDecoder;

      util.inherits(Readable, Stream);

      var Duplex;

      function ReadableState(options, stream) {
        Duplex = Duplex || require('./_stream_duplex');

        options = options || {};

        // object stream flag. Used to make read(n) ignore n and to
        // make all the buffer merging and length checks go away
        this.objectMode = !!options.objectMode;

        if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

        // the point at which it stops calling _read() to fill the buffer
        // Note: 0 is a valid value, means "don't call _read preemptively ever"
        var hwm = options.highWaterMark;
        var defaultHwm = this.objectMode ? 16 : 16 * 1024;
        this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

        // cast to ints.
        this.highWaterMark = ~~this.highWaterMark;

        this.buffer = [];
        this.length = 0;
        this.pipes = null;
        this.pipesCount = 0;
        this.flowing = null;
        this.ended = false;
        this.endEmitted = false;
        this.reading = false;

        // a flag to be able to tell if the onwrite cb is called immediately,
        // or on a later tick.  We set this to true at first, because any
        // actions that shouldn't happen until "later" should generally also
        // not happen before the first write call.
        this.sync = true;

        // whenever we return null, then we set a flag to say
        // that we're awaiting a 'readable' event emission.
        this.needReadable = false;
        this.emittedReadable = false;
        this.readableListening = false;
        this.resumeScheduled = false;

        // Crypto is kind of old and crusty.  Historically, its default string
        // encoding is 'binary' so we have to make this configurable.
        // Everything else in the universe uses 'utf8', though.
        this.defaultEncoding = options.defaultEncoding || 'utf8';

        // when piping, we only care about 'readable' events that happen
        // after read()ing all the bytes and not getting any pushback.
        this.ranOut = false;

        // the number of writers that are awaiting a drain event in .pipe()s
        this.awaitDrain = 0;

        // if true, a maybeReadMore has been scheduled
        this.readingMore = false;

        this.decoder = null;
        this.encoding = null;
        if (options.encoding) {
          if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
          this.decoder = new StringDecoder(options.encoding);
          this.encoding = options.encoding;
        }
      }

      var Duplex;

      function Readable(options) {
        Duplex = Duplex || require('./_stream_duplex');

        if (!(this instanceof Readable)) return new Readable(options);

        this._readableState = new ReadableState(options, this);

        // legacy
        this.readable = true;

        if (options && typeof options.read === 'function') this._read = options.read;

        Stream.call(this);
      }

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
      Readable.prototype.push = function (chunk, encoding) {
        var state = this._readableState;

        if (!state.objectMode && typeof chunk === 'string') {
          encoding = encoding || state.defaultEncoding;
          if (encoding !== state.encoding) {
            chunk = new Buffer(chunk, encoding);
            encoding = '';
          }
        }

        return readableAddChunk(this, state, chunk, encoding, false);
      };

// Unshift should *always* be something directly out of read()
      Readable.prototype.unshift = function (chunk) {
        var state = this._readableState;
        return readableAddChunk(this, state, chunk, '', true);
      };

      Readable.prototype.isPaused = function () {
        return this._readableState.flowing === false;
      };

      function readableAddChunk(stream, state, chunk, encoding, addToFront) {
        var er = chunkInvalid(state, chunk);
        if (er) {
          stream.emit('error', er);
        } else if (chunk === null) {
          state.reading = false;
          onEofChunk(stream, state);
        } else if (state.objectMode || chunk && chunk.length > 0) {
          if (state.ended && !addToFront) {
            var e = new Error('stream.push() after EOF');
            stream.emit('error', e);
          } else if (state.endEmitted && addToFront) {
            var e = new Error('stream.unshift() after end event');
            stream.emit('error', e);
          } else {
            var skipAdd;
            if (state.decoder && !addToFront && !encoding) {
              chunk = state.decoder.write(chunk);
              skipAdd = !state.objectMode && chunk.length === 0;
            }

            if (!addToFront) state.reading = false;

            // Don't add to the buffer if we've decoded to an empty string chunk and
            // we're not in object mode
            if (!skipAdd) {
              // if we want the data now, just emit it.
              if (state.flowing && state.length === 0 && !state.sync) {
                stream.emit('data', chunk);
                stream.read(0);
              } else {
                // update the buffer info.
                state.length += state.objectMode ? 1 : chunk.length;
                if (addToFront) state.buffer.unshift(chunk); else state.buffer.push(chunk);

                if (state.needReadable) emitReadable(stream);
        }
      }

            maybeReadMore(stream, state);
          }
        } else if (!addToFront) {
          state.reading = false;
        }

        return needMoreData(state);
      }

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
      function needMoreData(state) {
        return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
      }

// backwards compatibility.
      Readable.prototype.setEncoding = function (enc) {
        if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
        this._readableState.decoder = new StringDecoder(enc);
        this._readableState.encoding = enc;
        return this;
      };

// Don't raise the hwm > 8MB
      var MAX_HWM = 0x800000;

      function computeNewHighWaterMark(n) {
        if (n >= MAX_HWM) {
          n = MAX_HWM;
        } else {
          // Get the next highest power of 2
          n--;
          n |= n >>> 1;
          n |= n >>> 2;
          n |= n >>> 4;
          n |= n >>> 8;
          n |= n >>> 16;
          n++;
        }
        return n;
      }

      function howMuchToRead(n, state) {
        if (state.length === 0 && state.ended) return 0;

        if (state.objectMode) return n === 0 ? 0 : 1;

        if (n === null || isNaN(n)) {
          // only flow one buffer at a time
          if (state.flowing && state.buffer.length) return state.buffer[0].length; else return state.length;
        }

        if (n <= 0) return 0;

        // If we're asking for more than the target buffer level,
        // then raise the water mark.  Bump up to the next highest
        // power of 2, to prevent increasing it excessively in tiny
        // amounts.
        if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);

        // don't have that much.  return null, unless we've ended.
        if (n > state.length) {
          if (!state.ended) {
            state.needReadable = true;
            return 0;
          } else {
            return state.length;
          }
        }

        return n;
      }

// you can override either this method, or the async _read(n) below.
      Readable.prototype.read = function (n) {
        debug('read', n);
        var state = this._readableState;
        var nOrig = n;

        if (typeof n !== 'number' || n > 0) state.emittedReadable = false;

        // if we're doing read(0) to trigger a readable event, but we
        // already have a bunch of data in the buffer, then just trigger
        // the 'readable' event and move on.
        if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
          debug('read: emitReadable', state.length, state.ended);
          if (state.length === 0 && state.ended) endReadable(this); else emitReadable(this);
          return null;
        }

        n = howMuchToRead(n, state);

        // if we've ended, and we're now clear, then finish it up.
        if (n === 0 && state.ended) {
          if (state.length === 0) endReadable(this);
          return null;
        }

        // All the actual chunk generation logic needs to be
        // *below* the call to _read.  The reason is that in certain
        // synthetic stream cases, such as passthrough streams, _read
        // may be a completely synchronous operation which may change
        // the state of the read buffer, providing enough data when
        // before there was *not* enough.
        //
        // So, the steps are:
        // 1. Figure out what the state of things will be after we do
        // a read from the buffer.
        //
        // 2. If that resulting state will trigger a _read, then call _read.
        // Note that this may be asynchronous, or synchronous.  Yes, it is
        // deeply ugly to write APIs this way, but that still doesn't mean
        // that the Readable class should behave improperly, as streams are
        // designed to be sync/async agnostic.
        // Take note if the _read call is sync or async (ie, if the read call
        // has returned yet), so that we know whether or not it's safe to emit
        // 'readable' etc.
        //
        // 3. Actually pull the requested chunks out of the buffer and return.

        // if we need a readable event, then we need to do some reading.
        var doRead = state.needReadable;
        debug('need readable', doRead);

        // if we currently have less than the highWaterMark, then also read some
        if (state.length === 0 || state.length - n < state.highWaterMark) {
          doRead = true;
          debug('length less than watermark', doRead);
        }

        // however, if we've ended, then there's no point, and if we're already
        // reading, then it's unnecessary.
        if (state.ended || state.reading) {
          doRead = false;
          debug('reading or ended', doRead);
        }

        if (doRead) {
          debug('do read');
          state.reading = true;
          state.sync = true;
          // if the length is currently zero, then we *need* a readable event.
          if (state.length === 0) state.needReadable = true;
          // call internal read method
          this._read(state.highWaterMark);
          state.sync = false;
        }

        // If _read pushed data synchronously, then `reading` will be false,
        // and we need to re-evaluate how much data we can return to the user.
        if (doRead && !state.reading) n = howMuchToRead(nOrig, state);

        var ret;
        if (n > 0) ret = fromList(n, state); else ret = null;

        if (ret === null) {
          state.needReadable = true;
          n = 0;
        }

        state.length -= n;

        // If we have nothing in the buffer, then we want to know
        // as soon as we *do* get something into the buffer.
        if (state.length === 0 && !state.ended) state.needReadable = true;

        // If we tried to read() past the EOF, then emit end on the next tick.
        if (nOrig !== n && state.ended && state.length === 0) endReadable(this);

        if (ret !== null) this.emit('data', ret);

        return ret;
      };

      function chunkInvalid(state, chunk) {
        var er = null;
        if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
          er = new TypeError('Invalid non-string/buffer chunk');
        }
        return er;
      }

      function onEofChunk(stream, state) {
        if (state.ended) return;
        if (state.decoder) {
          var chunk = state.decoder.end();
          if (chunk && chunk.length) {
            state.buffer.push(chunk);
            state.length += state.objectMode ? 1 : chunk.length;
          }
        }
        state.ended = true;

        // emit 'readable' now to make sure it gets picked up.
        emitReadable(stream);
      }

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
      function emitReadable(stream) {
        var state = stream._readableState;
        state.needReadable = false;
        if (!state.emittedReadable) {
          debug('emitReadable', state.flowing);
          state.emittedReadable = true;
          if (state.sync) processNextTick(emitReadable_, stream); else emitReadable_(stream);
        }
      }

      function emitReadable_(stream) {
        debug('emit readable');
        stream.emit('readable');
        flow(stream);
      }

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
      function maybeReadMore(stream, state) {
        if (!state.readingMore) {
          state.readingMore = true;
          processNextTick(maybeReadMore_, stream, state);
        }
      }

      function maybeReadMore_(stream, state) {
        var len = state.length;
        while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
          debug('maybeReadMore read 0');
          stream.read(0);
          if (len === state.length)
          // didn't get any data, stop spinning.
            break; else len = state.length;
        }
        state.readingMore = false;
      }

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
      Readable.prototype._read = function (n) {
        this.emit('error', new Error('not implemented'));
      };

      Readable.prototype.pipe = function (dest, pipeOpts) {
        var src = this;
        var state = this._readableState;

        switch (state.pipesCount) {
          case 0:
            state.pipes = dest;
            break;
          case 1:
            state.pipes = [state.pipes, dest];
            break;
          default:
            state.pipes.push(dest);
            break;
        }
        state.pipesCount += 1;
        debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

        var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

        var endFn = doEnd ? onend : cleanup;
        if (state.endEmitted) processNextTick(endFn); else src.once('end', endFn);

        dest.on('unpipe', onunpipe);
        function onunpipe(readable) {
          debug('onunpipe');
          if (readable === src) {
            cleanup();
          }
        }

        function onend() {
          debug('onend');
          dest.end();
        }

        // when the dest drains, it reduces the awaitDrain counter
        // on the source.  This would be more elegant with a .once()
        // handler in flow(), but adding and removing repeatedly is
        // too slow.
        var ondrain = pipeOnDrain(src);
        dest.on('drain', ondrain);

        var cleanedUp = false;

        function cleanup() {
          debug('cleanup');
          // cleanup event handlers once the pipe is broken
          dest.removeListener('close', onclose);
          dest.removeListener('finish', onfinish);
          dest.removeListener('drain', ondrain);
          dest.removeListener('error', onerror);
          dest.removeListener('unpipe', onunpipe);
          src.removeListener('end', onend);
          src.removeListener('end', cleanup);
          src.removeListener('data', ondata);

          cleanedUp = true;

          // if the reader is waiting for a drain event from this
          // specific writer, then it would cause it to never start
          // flowing again.
          // So, if this is awaiting a drain, then we just call it now.
          // If we don't know, then assume that we are waiting for one.
          if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
        }

        src.on('data', ondata);
        function ondata(chunk) {
          debug('ondata');
          var ret = dest.write(chunk);
          if (false === ret) {
            // If the user unpiped during `dest.write()`, it is possible
            // to get stuck in a permanently paused state if that write
            // also returned false.
            if (state.pipesCount === 1 && state.pipes[0] === dest && src.listenerCount('data') === 1 && !cleanedUp) {
              debug('false write response, pause', src._readableState.awaitDrain);
              src._readableState.awaitDrain++;
      }
            src.pause();
          }
        }

        // if the dest has an error, then stop piping into it.
        // however, don't suppress the throwing behavior for this.
        function onerror(er) {
          debug('onerror', er);
          unpipe();
          dest.removeListener('error', onerror);
          if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
        }

        // This is a brutally ugly hack to make sure that our error handler
        // is attached before any userland ones.  NEVER DO THIS.
        if (!dest._events || !dest._events.error) dest.on('error', onerror); else if (isArray(dest._events.error)) dest._events.error.unshift(onerror); else dest._events.error = [onerror, dest._events.error];

        // Both close and finish should trigger unpipe, but only once.
        function onclose() {
          dest.removeListener('finish', onfinish);
          unpipe();
        }

        dest.once('close', onclose);
        function onfinish() {
          debug('onfinish');
          dest.removeListener('close', onclose);
          unpipe();
        }

        dest.once('finish', onfinish);

        function unpipe() {
          debug('unpipe');
          src.unpipe(dest);
        }

        // tell the dest that it's being piped to
        dest.emit('pipe', src);

        // start the flow if it hasn't been started already.
        if (!state.flowing) {
          debug('pipe resume');
          src.resume();
        }

        return dest;
      };

      function pipeOnDrain(src) {
        return function () {
          var state = src._readableState;
          debug('pipeOnDrain', state.awaitDrain);
          if (state.awaitDrain) state.awaitDrain--;
          if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
            state.flowing = true;
            flow(src);
          }
        };
      }

      Readable.prototype.unpipe = function (dest) {
        var state = this._readableState;

        // if we're not piping anywhere, then do nothing.
        if (state.pipesCount === 0) return this;

        // just one destination.  most common case.
        if (state.pipesCount === 1) {
          // passed in one, but it's not the right one.
          if (dest && dest !== state.pipes) return this;

          if (!dest) dest = state.pipes;

          // got a match.
          state.pipes = null;
          state.pipesCount = 0;
          state.flowing = false;
          if (dest) dest.emit('unpipe', this);
          return this;
        }

        // slow case. multiple pipe destinations.

        if (!dest) {
          // remove all.
          var dests = state.pipes;
          var len = state.pipesCount;
          state.pipes = null;
          state.pipesCount = 0;
          state.flowing = false;

          for (var _i = 0; _i < len; _i++) {
            dests[_i].emit('unpipe', this);
          }
          return this;
        }

        // try to find the right one.
        var i = indexOf(state.pipes, dest);
        if (i === -1) return this;

        state.pipes.splice(i, 1);
        state.pipesCount -= 1;
        if (state.pipesCount === 1) state.pipes = state.pipes[0];

        dest.emit('unpipe', this);

        return this;
      };

// set up data events if they are asked for
// Ensure readable listeners eventually get something
      Readable.prototype.on = function (ev, fn) {
        var res = Stream.prototype.on.call(this, ev, fn);

        // If listening to data, and it has not explicitly been paused,
        // then call resume to start the flow of data on the next tick.
        if (ev === 'data' && false !== this._readableState.flowing) {
          this.resume();
        }

        if (ev === 'readable' && !this._readableState.endEmitted) {
          var state = this._readableState;
          if (!state.readableListening) {
            state.readableListening = true;
            state.emittedReadable = false;
            state.needReadable = true;
            if (!state.reading) {
              processNextTick(nReadingNextTick, this);
            } else if (state.length) {
              emitReadable(this, state);
      }
          }
        }

        return res;
      };
      Readable.prototype.addListener = Readable.prototype.on;

      function nReadingNextTick(self) {
        debug('readable nexttick read 0');
        self.read(0);
      }

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
      Readable.prototype.resume = function () {
        var state = this._readableState;
        if (!state.flowing) {
          debug('resume');
          state.flowing = true;
          resume(this, state);
        }
        return this;
      };

      function resume(stream, state) {
        if (!state.resumeScheduled) {
          state.resumeScheduled = true;
          processNextTick(resume_, stream, state);
        }
      }

      function resume_(stream, state) {
        if (!state.reading) {
          debug('resume read 0');
          stream.read(0);
        }

        state.resumeScheduled = false;
        stream.emit('resume');
        flow(stream);
        if (state.flowing && !state.reading) stream.read(0);
      }

      Readable.prototype.pause = function () {
        debug('call pause flowing=%j', this._readableState.flowing);
        if (false !== this._readableState.flowing) {
          debug('pause');
          this._readableState.flowing = false;
          this.emit('pause');
        }
        return this;
      };

      function flow(stream) {
        var state = stream._readableState;
        debug('flow', state.flowing);
        if (state.flowing) {
          do {
            var chunk = stream.read();
          } while (null !== chunk && state.flowing);
        }
      }

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
      Readable.prototype.wrap = function (stream) {
        var state = this._readableState;
        var paused = false;

        var self = this;
        stream.on('end', function () {
          debug('wrapped end');
          if (state.decoder && !state.ended) {
            var chunk = state.decoder.end();
            if (chunk && chunk.length) self.push(chunk);
          }

          self.push(null);
        });

        stream.on('data', function (chunk) {
          debug('wrapped data');
          if (state.decoder) chunk = state.decoder.write(chunk);

          // don't skip over falsy values in objectMode
          if (state.objectMode && (chunk === null || chunk === undefined)) return; else if (!state.objectMode && (!chunk || !chunk.length)) return;

          var ret = self.push(chunk);
          if (!ret) {
            paused = true;
            stream.pause();
          }
        });

        // proxy all the other methods.
        // important when wrapping filters and duplexes.
        for (var i in stream) {
          if (this[i] === undefined && typeof stream[i] === 'function') {
            this[i] = function (method) {
              return function () {
                return stream[method].apply(stream, arguments);
        };
            }(i);
          }
        }

        // proxy certain important events.
        var events = ['error', 'close', 'destroy', 'pause', 'resume'];
        forEach(events, function (ev) {
          stream.on(ev, self.emit.bind(self, ev));
        });

        // when we try to consume some more bytes, simply unpause the
        // underlying stream.
        self._read = function (n) {
          debug('wrapped _read', n);
          if (paused) {
            paused = false;
            stream.resume();
          }
        };

        return self;
      };

// exposed for testing purposes only.
      Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
      function fromList(n, state) {
        var list = state.buffer;
        var length = state.length;
        var stringMode = !!state.decoder;
        var objectMode = !!state.objectMode;
        var ret;

        // nothing in the list, definitely empty.
        if (list.length === 0) return null;

        if (length === 0) ret = null; else if (objectMode) ret = list.shift(); else if (!n || n >= length) {
          // read it all, truncate the array.
          if (stringMode) ret = list.join(''); else if (list.length === 1) ret = list[0]; else ret = Buffer.concat(list, length);
          list.length = 0;
        } else {
          // read just some of it.
          if (n < list[0].length) {
            // just take a part of the first list item.
            // slice is the same for buffers and strings.
            var buf = list[0];
            ret = buf.slice(0, n);
            list[0] = buf.slice(n);
          } else if (n === list[0].length) {
            // first list is a perfect match
            ret = list.shift();
          } else {
            // complex case.
            // we have enough to cover it, but it spans past the first buffer.
            if (stringMode) ret = ''; else ret = new Buffer(n);

            var c = 0;
            for (var i = 0, l = list.length; i < l && c < n; i++) {
              var buf = list[0];
              var cpy = Math.min(n - c, buf.length);

              if (stringMode) ret += buf.slice(0, cpy); else buf.copy(ret, c, 0, cpy);

              if (cpy < buf.length) list[0] = buf.slice(cpy); else list.shift();

              c += cpy;
      }
          }
        }

        return ret;
      }

      function endReadable(stream) {
        var state = stream._readableState;

        // If we get here before consuming all the bytes, then that is a
        // bug in node.  Should never happen.
        if (state.length > 0) throw new Error('endReadable called on non-empty stream');

        if (!state.endEmitted) {
          state.ended = true;
          processNextTick(endReadableNT, state, stream);
        }
      }

      function endReadableNT(state, stream) {
        // Check that we didn't get one last unshift.
        if (!state.endEmitted && state.length === 0) {
          state.endEmitted = true;
          stream.readable = false;
          stream.emit('end');
        }
      }

      function forEach(xs, f) {
        for (var i = 0, l = xs.length; i < l; i++) {
          f(xs[i], i);
        }
      }

      function indexOf(xs, x) {
        for (var i = 0, l = xs.length; i < l; i++) {
          if (xs[i] === x) return i;
        }
        return -1;
      }
    }).call(this, require('_process'))
  }, {
    "./_stream_duplex": 27,
    "_process": 25,
    "buffer": 17,
    "core-util-is": 32,
    "events": 21,
    "inherits": 22,
    "isarray": 33,
    "process-nextick-args": 34,
    "string_decoder/": 41,
    "util": 3
  }],
  30: [function (require, module, exports) {
// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

    'use strict';

    module.exports = Transform;

    var Duplex = require('./_stream_duplex');

    /*<replacement>*/
    var util = require('core-util-is');
    util.inherits = require('inherits');
    /*</replacement>*/

    util.inherits(Transform, Duplex);

    function TransformState(stream) {
      this.afterTransform = function (er, data) {
        return afterTransform(stream, er, data);
      };

      this.needTransform = false;
      this.transforming = false;
      this.writecb = null;
      this.writechunk = null;
      this.writeencoding = null;
    }

    function afterTransform(stream, er, data) {
      var ts = stream._transformState;
      ts.transforming = false;

      var cb = ts.writecb;

      if (!cb) return stream.emit('error', new Error('no writecb in Transform class'));

      ts.writechunk = null;
      ts.writecb = null;

      if (data !== null && data !== undefined) stream.push(data);

      cb(er);

      var rs = stream._readableState;
      rs.reading = false;
      if (rs.needReadable || rs.length < rs.highWaterMark) {
        stream._read(rs.highWaterMark);
      }
    }

    function Transform(options) {
      if (!(this instanceof Transform)) return new Transform(options);

      Duplex.call(this, options);

      this._transformState = new TransformState(this);

      // when the writable side finishes, then flush out anything remaining.
      var stream = this;

      // start out asking for a readable event once data is transformed.
      this._readableState.needReadable = true;

      // we have implemented the _read method, and done the other things
      // that Readable wants before the first _read call, so unset the
      // sync guard flag.
      this._readableState.sync = false;

      if (options) {
        if (typeof options.transform === 'function') this._transform = options.transform;

        if (typeof options.flush === 'function') this._flush = options.flush;
      }

      this.once('prefinish', function () {
        if (typeof this._flush === 'function') this._flush(function (er) {
          done(stream, er);
        }); else done(stream);
      });
    }

    Transform.prototype.push = function (chunk, encoding) {
      this._transformState.needTransform = false;
      return Duplex.prototype.push.call(this, chunk, encoding);
    };

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
    Transform.prototype._transform = function (chunk, encoding, cb) {
      throw new Error('not implemented');
    };

    Transform.prototype._write = function (chunk, encoding, cb) {
      var ts = this._transformState;
      ts.writecb = cb;
      ts.writechunk = chunk;
      ts.writeencoding = encoding;
      if (!ts.transforming) {
        var rs = this._readableState;
        if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
      }
    };

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
    Transform.prototype._read = function (n) {
      var ts = this._transformState;

      if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
        ts.transforming = true;
        this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
      } else {
        // mark that we need a transform, so that any data that comes in
        // will get processed, now that we've asked for it.
        ts.needTransform = true;
      }
    };

    function done(stream, er) {
      if (er) return stream.emit('error', er);

      // if there's nothing in the write buffer, then that means
      // that nothing more will ever be provided
      var ws = stream._writableState;
      var ts = stream._transformState;

      if (ws.length) throw new Error('calling transform done when ws.length != 0');

      if (ts.transforming) throw new Error('calling transform done when still transforming');

      return stream.push(null);
    }
  }, {"./_stream_duplex": 27, "core-util-is": 32, "inherits": 22}],
  31: [function (require, module, exports) {
    (function (process) {
// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

      'use strict';

      module.exports = Writable;

      /*<replacement>*/
      var processNextTick = require('process-nextick-args');
      /*</replacement>*/

      /*<replacement>*/
      var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : processNextTick;
      /*</replacement>*/

      /*<replacement>*/
      var Buffer = require('buffer').Buffer;
      /*</replacement>*/

      Writable.WritableState = WritableState;

      /*<replacement>*/
      var util = require('core-util-is');
      util.inherits = require('inherits');
      /*</replacement>*/

      /*<replacement>*/
      var internalUtil = {
        deprecate: require('util-deprecate')
      };
      /*</replacement>*/

      /*<replacement>*/
      var Stream;
      (function () {
        try {
          Stream = require('st' + 'ream');
        } catch (_) {
        } finally {
          if (!Stream) Stream = require('events').EventEmitter;
        }
      })();
      /*</replacement>*/

      var Buffer = require('buffer').Buffer;

      util.inherits(Writable, Stream);

      function nop() {
      }

      function WriteReq(chunk, encoding, cb) {
        this.chunk = chunk;
        this.encoding = encoding;
        this.callback = cb;
        this.next = null;
      }

      var Duplex;

      function WritableState(options, stream) {
        Duplex = Duplex || require('./_stream_duplex');

        options = options || {};

        // object stream flag to indicate whether or not this stream
        // contains buffers or objects.
        this.objectMode = !!options.objectMode;

        if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

        // the point at which write() starts returning false
        // Note: 0 is a valid value, means that we always return false if
        // the entire buffer is not flushed immediately on write()
        var hwm = options.highWaterMark;
        var defaultHwm = this.objectMode ? 16 : 16 * 1024;
        this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

        // cast to ints.
        this.highWaterMark = ~~this.highWaterMark;

        this.needDrain = false;
        // at the start of calling end()
        this.ending = false;
        // when end() has been called, and returned
        this.ended = false;
        // when 'finish' is emitted
        this.finished = false;

        // should we decode strings into buffers before passing to _write?
        // this is here so that some node-core streams can optimize string
        // handling at a lower level.
        var noDecode = options.decodeStrings === false;
        this.decodeStrings = !noDecode;

        // Crypto is kind of old and crusty.  Historically, its default string
        // encoding is 'binary' so we have to make this configurable.
        // Everything else in the universe uses 'utf8', though.
        this.defaultEncoding = options.defaultEncoding || 'utf8';

        // not an actual buffer we keep track of, but a measurement
        // of how much we're waiting to get pushed to some underlying
        // socket or file.
        this.length = 0;

        // a flag to see when we're in the middle of a write.
        this.writing = false;

        // when true all writes will be buffered until .uncork() call
        this.corked = 0;

        // a flag to be able to tell if the onwrite cb is called immediately,
        // or on a later tick.  We set this to true at first, because any
        // actions that shouldn't happen until "later" should generally also
        // not happen before the first write call.
        this.sync = true;

        // a flag to know if we're processing previously buffered items, which
        // may call the _write() callback in the same tick, so that we don't
        // end up in an overlapped onwrite situation.
        this.bufferProcessing = false;

        // the callback that's passed to _write(chunk,cb)
        this.onwrite = function (er) {
          onwrite(stream, er);
        };

        // the callback that the user supplies to write(chunk,encoding,cb)
        this.writecb = null;

        // the amount that is being written when _write is called.
        this.writelen = 0;

        this.bufferedRequest = null;
        this.lastBufferedRequest = null;

        // number of pending user-supplied write callbacks
        // this must be 0 before 'finish' can be emitted
        this.pendingcb = 0;

        // emit prefinish if the only thing we're waiting for is _write cbs
        // This is relevant for synchronous Transform streams
        this.prefinished = false;

        // True if the error was already emitted and should not be thrown again
        this.errorEmitted = false;

        // count buffered requests
        this.bufferedRequestCount = 0;

        // create the two objects needed to store the corked requests
        // they are not a linked list, as no new elements are inserted in there
        this.corkedRequestsFree = new CorkedRequest(this);
        this.corkedRequestsFree.next = new CorkedRequest(this);
      }

      WritableState.prototype.getBuffer = function writableStateGetBuffer() {
        var current = this.bufferedRequest;
        var out = [];
        while (current) {
          out.push(current);
          current = current.next;
        }
        return out;
      };

      (function () {
        try {
          Object.defineProperty(WritableState.prototype, 'buffer', {
            get: internalUtil.deprecate(function () {
              return this.getBuffer();
            }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.')
          });
        } catch (_) {
        }
      })();

      var Duplex;

      function Writable(options) {
        Duplex = Duplex || require('./_stream_duplex');

        // Writable ctor is applied to Duplexes, though they're not
        // instanceof Writable, they're instanceof Readable.
        if (!(this instanceof Writable) && !(this instanceof Duplex)) return new Writable(options);

        this._writableState = new WritableState(options, this);

        // legacy.
        this.writable = true;

        if (options) {
          if (typeof options.write === 'function') this._write = options.write;

          if (typeof options.writev === 'function') this._writev = options.writev;
        }

        Stream.call(this);
      }

// Otherwise people can pipe Writable streams, which is just wrong.
      Writable.prototype.pipe = function () {
        this.emit('error', new Error('Cannot pipe. Not readable.'));
      };

      function writeAfterEnd(stream, cb) {
        var er = new Error('write after end');
        // TODO: defer error events consistently everywhere, not just the cb
        stream.emit('error', er);
        processNextTick(cb, er);
      }

// If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.
      function validChunk(stream, state, chunk, cb) {
        var valid = true;

        if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
          var er = new TypeError('Invalid non-string/buffer chunk');
          stream.emit('error', er);
          processNextTick(cb, er);
          valid = false;
        }
        return valid;
      }

      Writable.prototype.write = function (chunk, encoding, cb) {
        var state = this._writableState;
        var ret = false;

        if (typeof encoding === 'function') {
          cb = encoding;
          encoding = null;
        }

        if (Buffer.isBuffer(chunk)) encoding = 'buffer'; else if (!encoding) encoding = state.defaultEncoding;

        if (typeof cb !== 'function') cb = nop;

        if (state.ended) writeAfterEnd(this, cb); else if (validChunk(this, state, chunk, cb)) {
          state.pendingcb++;
          ret = writeOrBuffer(this, state, chunk, encoding, cb);
        }

        return ret;
      };

      Writable.prototype.cork = function () {
        var state = this._writableState;

        state.corked++;
      };

      Writable.prototype.uncork = function () {
        var state = this._writableState;

        if (state.corked) {
          state.corked--;

          if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
        }
      };

      Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
        // node::ParseEncoding() requires lower case.
        if (typeof encoding === 'string') encoding = encoding.toLowerCase();
        if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
        this._writableState.defaultEncoding = encoding;
      };

      function decodeChunk(state, chunk, encoding) {
        if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
          chunk = new Buffer(chunk, encoding);
        }
        return chunk;
      }

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
      function writeOrBuffer(stream, state, chunk, encoding, cb) {
        chunk = decodeChunk(state, chunk, encoding);

        if (Buffer.isBuffer(chunk)) encoding = 'buffer';
        var len = state.objectMode ? 1 : chunk.length;

        state.length += len;

        var ret = state.length < state.highWaterMark;
        // we must ensure that previous needDrain will not be reset to false.
        if (!ret) state.needDrain = true;

        if (state.writing || state.corked) {
          var last = state.lastBufferedRequest;
          state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
          if (last) {
            last.next = state.lastBufferedRequest;
          } else {
            state.bufferedRequest = state.lastBufferedRequest;
          }
          state.bufferedRequestCount += 1;
        } else {
          doWrite(stream, state, false, len, chunk, encoding, cb);
        }

        return ret;
      }

      function doWrite(stream, state, writev, len, chunk, encoding, cb) {
        state.writelen = len;
        state.writecb = cb;
        state.writing = true;
        state.sync = true;
        if (writev) stream._writev(chunk, state.onwrite); else stream._write(chunk, encoding, state.onwrite);
        state.sync = false;
      }

      function onwriteError(stream, state, sync, er, cb) {
        --state.pendingcb;
        if (sync) processNextTick(cb, er); else cb(er);

        stream._writableState.errorEmitted = true;
        stream.emit('error', er);
      }

      function onwriteStateUpdate(state) {
        state.writing = false;
        state.writecb = null;
        state.length -= state.writelen;
        state.writelen = 0;
      }

      function onwrite(stream, er) {
        var state = stream._writableState;
        var sync = state.sync;
        var cb = state.writecb;

        onwriteStateUpdate(state);

        if (er) onwriteError(stream, state, sync, er, cb); else {
          // Check if we're actually ready to finish, but don't emit yet
          var finished = needFinish(state);

          if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
            clearBuffer(stream, state);
          }

          if (sync) {
            /*<replacement>*/
            asyncWrite(afterWrite, stream, state, finished, cb);
            /*</replacement>*/
          } else {
            afterWrite(stream, state, finished, cb);
      }
        }
      }

      function afterWrite(stream, state, finished, cb) {
        if (!finished) onwriteDrain(stream, state);
        state.pendingcb--;
        cb();
        finishMaybe(stream, state);
      }

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
      function onwriteDrain(stream, state) {
        if (state.length === 0 && state.needDrain) {
          state.needDrain = false;
          stream.emit('drain');
        }
      }

// if there's something in the buffer waiting, then process it
      function clearBuffer(stream, state) {
        state.bufferProcessing = true;
        var entry = state.bufferedRequest;

        if (stream._writev && entry && entry.next) {
          // Fast case, write everything using _writev()
          var l = state.bufferedRequestCount;
          var buffer = new Array(l);
          var holder = state.corkedRequestsFree;
          holder.entry = entry;

          var count = 0;
          while (entry) {
            buffer[count] = entry;
            entry = entry.next;
            count += 1;
          }

          doWrite(stream, state, true, state.length, buffer, '', holder.finish);

          // doWrite is always async, defer these to save a bit of time
          // as the hot path ends with doWrite
          state.pendingcb++;
          state.lastBufferedRequest = null;
          state.corkedRequestsFree = holder.next;
          holder.next = null;
        } else {
          // Slow case, write chunks one-by-one
          while (entry) {
            var chunk = entry.chunk;
            var encoding = entry.encoding;
            var cb = entry.callback;
            var len = state.objectMode ? 1 : chunk.length;

            doWrite(stream, state, false, len, chunk, encoding, cb);
            entry = entry.next;
            // if we didn't call the onwrite immediately, then
            // it means that we need to wait until it does.
            // also, that means that the chunk and cb are currently
            // being processed, so move the buffer counter past them.
            if (state.writing) {
              break;
            }
          }

          if (entry === null) state.lastBufferedRequest = null;
        }

        state.bufferedRequestCount = 0;
        state.bufferedRequest = entry;
        state.bufferProcessing = false;
      }

      Writable.prototype._write = function (chunk, encoding, cb) {
        cb(new Error('not implemented'));
      };

      Writable.prototype._writev = null;

      Writable.prototype.end = function (chunk, encoding, cb) {
        var state = this._writableState;

        if (typeof chunk === 'function') {
          cb = chunk;
          chunk = null;
          encoding = null;
        } else if (typeof encoding === 'function') {
          cb = encoding;
          encoding = null;
        }

        if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

        // .end() fully uncorks
        if (state.corked) {
          state.corked = 1;
          this.uncork();
        }

        // ignore unnecessary end() calls.
        if (!state.ending && !state.finished) endWritable(this, state, cb);
      };

      function needFinish(state) {
        return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
      }

      function prefinish(stream, state) {
        if (!state.prefinished) {
          state.prefinished = true;
          stream.emit('prefinish');
        }
      }

      function finishMaybe(stream, state) {
        var need = needFinish(state);
        if (need) {
          if (state.pendingcb === 0) {
            prefinish(stream, state);
            state.finished = true;
            stream.emit('finish');
          } else {
            prefinish(stream, state);
          }
        }
        return need;
      }

      function endWritable(stream, state, cb) {
        state.ending = true;
        finishMaybe(stream, state);
        if (cb) {
          if (state.finished) processNextTick(cb); else stream.once('finish', cb);
        }
        state.ended = true;
        stream.writable = false;
      }

// It seems a linked list but it is not
// there will be only 2 of these for each stream
      function CorkedRequest(state) {
        var _this = this;

        this.next = null;
        this.entry = null;

        this.finish = function (err) {
          var entry = _this.entry;
          _this.entry = null;
          while (entry) {
            var cb = entry.callback;
            state.pendingcb--;
            cb(err);
            entry = entry.next;
          }
          if (state.corkedRequestsFree) {
            state.corkedRequestsFree.next = _this;
          } else {
            state.corkedRequestsFree = _this;
          }
        };
      }
    }).call(this, require('_process'))
  }, {
    "./_stream_duplex": 27,
    "_process": 25,
    "buffer": 17,
    "core-util-is": 32,
    "events": 21,
    "inherits": 22,
    "process-nextick-args": 34,
    "util-deprecate": 35
  }],
  32: [function (require, module, exports) {
    (function (Buffer) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

      function isArray(arg) {
        if (Array.isArray) {
          return Array.isArray(arg);
        }
        return objectToString(arg) === '[object Array]';
      }

      exports.isArray = isArray;

      function isBoolean(arg) {
        return typeof arg === 'boolean';
      }

      exports.isBoolean = isBoolean;

      function isNull(arg) {
        return arg === null;
      }

      exports.isNull = isNull;

      function isNullOrUndefined(arg) {
        return arg == null;
      }

      exports.isNullOrUndefined = isNullOrUndefined;

      function isNumber(arg) {
        return typeof arg === 'number';
      }

      exports.isNumber = isNumber;

      function isString(arg) {
        return typeof arg === 'string';
      }

      exports.isString = isString;

      function isSymbol(arg) {
        return typeof arg === 'symbol';
      }

      exports.isSymbol = isSymbol;

      function isUndefined(arg) {
        return arg === void 0;
      }

      exports.isUndefined = isUndefined;

      function isRegExp(re) {
        return objectToString(re) === '[object RegExp]';
      }

      exports.isRegExp = isRegExp;

      function isObject(arg) {
        return typeof arg === 'object' && arg !== null;
      }

      exports.isObject = isObject;

      function isDate(d) {
        return objectToString(d) === '[object Date]';
      }

      exports.isDate = isDate;

      function isError(e) {
        return (objectToString(e) === '[object Error]' || e instanceof Error);
      }

      exports.isError = isError;

      function isFunction(arg) {
        return typeof arg === 'function';
      }

      exports.isFunction = isFunction;

      function isPrimitive(arg) {
        return arg === null ||
            typeof arg === 'boolean' ||
            typeof arg === 'number' ||
            typeof arg === 'string' ||
            typeof arg === 'symbol' ||  // ES6 symbol
            typeof arg === 'undefined';
      }

      exports.isPrimitive = isPrimitive;

      exports.isBuffer = Buffer.isBuffer;

      function objectToString(o) {
        return Object.prototype.toString.call(o);
      }

    }).call(this, {"isBuffer": require("../../../../insert-module-globals/node_modules/is-buffer/index.js")})
  }, {"../../../../insert-module-globals/node_modules/is-buffer/index.js": 23}],
  33: [function (require, module, exports) {
    arguments[4][20][0].apply(exports, arguments)
  }, {"dup": 20}],
  34: [function (require, module, exports) {
    (function (process) {
      'use strict';

      if (!process.version ||
          process.version.indexOf('v0.') === 0 ||
          process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
        module.exports = nextTick;
      } else {
        module.exports = process.nextTick;
      }

      function nextTick(fn) {
        var args = new Array(arguments.length - 1);
        var i = 0;
        while (i < args.length) {
          args[i++] = arguments[i];
        }
        process.nextTick(function afterTick() {
          fn.apply(null, args);
        });
      }

    }).call(this, require('_process'))
  }, {"_process": 25}],
  35: [function (require, module, exports) {
    (function (global) {

      /**
       * Module exports.
       */

      module.exports = deprecate;

      /**
       * Mark that a method should not be used.
       * Returns a modified function which warns once by default.
       *
       * If `localStorage.noDeprecation = true` is set, then it is a no-op.
       *
       * If `localStorage.throwDeprecation = true` is set, then deprecated functions
       * will throw an Error when invoked.
       *
       * If `localStorage.traceDeprecation = true` is set, then deprecated functions
       * will invoke `console.trace()` instead of `console.error()`.
       *
       * @param {Function} fn - the function to deprecate
       * @param {String} msg - the string to print to the console when `fn` is invoked
       * @returns {Function} a new "deprecated" version of `fn`
       * @api public
       */

      function deprecate(fn, msg) {
        if (config('noDeprecation')) {
          return fn;
        }

        var warned = false;

        function deprecated() {
          if (!warned) {
            if (config('throwDeprecation')) {
              throw new Error(msg);
            } else if (config('traceDeprecation')) {
              console.trace(msg);
      } else {
              console.warn(msg);
      }
            warned = true;
          }
          return fn.apply(this, arguments);
        }

        return deprecated;
      }

      /**
       * Checks `localStorage` for boolean values for the given `name`.
       *
       * @param {String} name
       * @returns {Boolean}
       * @api private
       */

      function config(name) {
        // accessing global.localStorage can trigger a DOMException in sandboxed iframes
        try {
          if (!global.localStorage) return false;
        } catch (_) {
          return false;
        }
        var val = global.localStorage[name];
        if (null == val) return false;
        return String(val).toLowerCase() === 'true';
      }

    }).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
  }, {}],
  36: [function (require, module, exports) {
    module.exports = require("./lib/_stream_passthrough.js")

  }, {"./lib/_stream_passthrough.js": 28}],
  37: [function (require, module, exports) {
    var Stream = (function () {
      try {
        return require('st' + 'ream'); // hack to fix a circular dependency issue when used with browserify
      } catch (_) {
      }
    }());
    exports = module.exports = require('./lib/_stream_readable.js');
    exports.Stream = Stream || exports;
    exports.Readable = exports;
    exports.Writable = require('./lib/_stream_writable.js');
    exports.Duplex = require('./lib/_stream_duplex.js');
    exports.Transform = require('./lib/_stream_transform.js');
    exports.PassThrough = require('./lib/_stream_passthrough.js');

  }, {
    "./lib/_stream_duplex.js": 27,
    "./lib/_stream_passthrough.js": 28,
    "./lib/_stream_readable.js": 29,
    "./lib/_stream_transform.js": 30,
    "./lib/_stream_writable.js": 31
  }],
  38: [function (require, module, exports) {
    module.exports = require("./lib/_stream_transform.js")

  }, {"./lib/_stream_transform.js": 30}],
  39: [function (require, module, exports) {
    module.exports = require("./lib/_stream_writable.js")

  }, {"./lib/_stream_writable.js": 31}],
  40: [function (require, module, exports) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

    module.exports = Stream;

    var EE = require('events').EventEmitter;
    var inherits = require('inherits');

    inherits(Stream, EE);
    Stream.Readable = require('readable-stream/readable.js');
    Stream.Writable = require('readable-stream/writable.js');
    Stream.Duplex = require('readable-stream/duplex.js');
    Stream.Transform = require('readable-stream/transform.js');
    Stream.PassThrough = require('readable-stream/passthrough.js');

// Backwards-compat with node 0.4.x
    Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

    function Stream() {
      EE.call(this);
    }

    Stream.prototype.pipe = function (dest, options) {
      var source = this;

      function ondata(chunk) {
        if (dest.writable) {
          if (false === dest.write(chunk) && source.pause) {
            source.pause();
      }
        }
      }

      source.on('data', ondata);

      function ondrain() {
        if (source.readable && source.resume) {
          source.resume();
        }
      }

      dest.on('drain', ondrain);

      // If the 'end' option is not supplied, dest.end() will be called when
      // source gets the 'end' or 'close' events.  Only dest.end() once.
      if (!dest._isStdio && (!options || options.end !== false)) {
        source.on('end', onend);
        source.on('close', onclose);
      }

      var didOnEnd = false;

      function onend() {
        if (didOnEnd) return;
        didOnEnd = true;

        dest.end();
      }


      function onclose() {
        if (didOnEnd) return;
        didOnEnd = true;

        if (typeof dest.destroy === 'function') dest.destroy();
      }

      // don't leave dangling pipes when there are errors.
      function onerror(er) {
        cleanup();
        if (EE.listenerCount(this, 'error') === 0) {
          throw er; // Unhandled stream error in pipe.
        }
      }

      source.on('error', onerror);
      dest.on('error', onerror);

      // remove all the event listeners that were added.
      function cleanup() {
        source.removeListener('data', ondata);
        dest.removeListener('drain', ondrain);

        source.removeListener('end', onend);
        source.removeListener('close', onclose);

        source.removeListener('error', onerror);
        dest.removeListener('error', onerror);

        source.removeListener('end', cleanup);
        source.removeListener('close', cleanup);

        dest.removeListener('close', cleanup);
      }

      source.on('end', cleanup);
      source.on('close', cleanup);

      dest.on('close', cleanup);

      dest.emit('pipe', source);

      // Allow for unix-like usage: A.pipe(B).pipe(C)
      return dest;
    };

  }, {
    "events": 21,
    "inherits": 22,
    "readable-stream/duplex.js": 26,
    "readable-stream/passthrough.js": 36,
    "readable-stream/readable.js": 37,
    "readable-stream/transform.js": 38,
    "readable-stream/writable.js": 39
  }],
  41: [function (require, module, exports) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

    var Buffer = require('buffer').Buffer;

    var isBufferEncoding = Buffer.isEncoding
        || function (encoding) {
          switch (encoding && encoding.toLowerCase()) {
            case 'hex':
            case 'utf8':
            case 'utf-8':
            case 'ascii':
            case 'binary':
            case 'base64':
            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
            case 'raw':
              return true;
            default:
              return false;
          }
        }


    function assertEncoding(encoding) {
      if (encoding && !isBufferEncoding(encoding)) {
        throw new Error('Unknown encoding: ' + encoding);
      }
    }

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters. CESU-8 is handled as part of the UTF-8 encoding.
//
// @TODO Handling all encodings inside a single object makes it very difficult
// to reason about this code, so it should be split up in the future.
// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
// points as used by CESU-8.
    var StringDecoder = exports.StringDecoder = function (encoding) {
      this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
      assertEncoding(encoding);
      switch (this.encoding) {
        case 'utf8':
          // CESU-8 represents each of Surrogate Pair by 3-bytes
          this.surrogateSize = 3;
          break;
        case 'ucs2':
        case 'utf16le':
          // UTF-16 represents each of Surrogate Pair by 2-bytes
          this.surrogateSize = 2;
          this.detectIncompleteChar = utf16DetectIncompleteChar;
          break;
        case 'base64':
          // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
          this.surrogateSize = 3;
          this.detectIncompleteChar = base64DetectIncompleteChar;
          break;
        default:
          this.write = passThroughWrite;
          return;
      }

      // Enough space to store all bytes of a single character. UTF-8 needs 4
      // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
      this.charBuffer = new Buffer(6);
      // Number of bytes received for the current incomplete multi-byte character.
      this.charReceived = 0;
      // Number of bytes expected for the current incomplete multi-byte character.
      this.charLength = 0;
    };


// write decodes the given buffer and returns it as JS string that is
// guaranteed to not contain any partial multi-byte characters. Any partial
// character found at the end of the buffer is buffered up, and will be
// returned when calling write again with the remaining bytes.
//
// Note: Converting a Buffer containing an orphan surrogate to a String
// currently works, but converting a String to a Buffer (via `new Buffer`, or
// Buffer#write) will replace incomplete surrogates with the unicode
// replacement character. See https://codereview.chromium.org/121173009/ .
    StringDecoder.prototype.write = function (buffer) {
      var charStr = '';
      // if our last write ended with an incomplete multibyte character
      while (this.charLength) {
        // determine how many remaining bytes this buffer has to offer for this char
        var available = (buffer.length >= this.charLength - this.charReceived) ?
        this.charLength - this.charReceived :
            buffer.length;

        // add the new bytes to the char buffer
        buffer.copy(this.charBuffer, this.charReceived, 0, available);
        this.charReceived += available;

        if (this.charReceived < this.charLength) {
          // still not enough chars in this buffer? wait for more ...
          return '';
        }

        // remove bytes belonging to the current character from the buffer
        buffer = buffer.slice(available, buffer.length);

        // get the character that was split
        charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

        // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
        var charCode = charStr.charCodeAt(charStr.length - 1);
        if (charCode >= 0xD800 && charCode <= 0xDBFF) {
          this.charLength += this.surrogateSize;
          charStr = '';
          continue;
        }
        this.charReceived = this.charLength = 0;

        // if there are no more bytes in this buffer, just emit our char
        if (buffer.length === 0) {
      return charStr;
        }
        break;
      }

      // determine and set charLength / charReceived
      this.detectIncompleteChar(buffer);

      var end = buffer.length;
      if (this.charLength) {
        // buffer the incomplete character bytes we got
        buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
        end -= this.charReceived;
      }

      charStr += buffer.toString(this.encoding, 0, end);

      var end = charStr.length - 1;
      var charCode = charStr.charCodeAt(end);
      // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
      if (charCode >= 0xD800 && charCode <= 0xDBFF) {
        var size = this.surrogateSize;
        this.charLength += size;
        this.charReceived += size;
        this.charBuffer.copy(this.charBuffer, size, 0, size);
        buffer.copy(this.charBuffer, 0, 0, size);
        return charStr.substring(0, end);
      }

      // or just emit the charStr
      return charStr;
    };

// detectIncompleteChar determines if there is an incomplete UTF-8 character at
// the end of the given buffer. If so, it sets this.charLength to the byte
// length that character, and sets this.charReceived to the number of bytes
// that are available for this character.
    StringDecoder.prototype.detectIncompleteChar = function (buffer) {
      // determine how many bytes we have to check at the end of this buffer
      var i = (buffer.length >= 3) ? 3 : buffer.length;

      // Figure out if one of the last i bytes of our buffer announces an
      // incomplete char.
      for (; i > 0; i--) {
        var c = buffer[buffer.length - i];

        // See http://en.wikipedia.org/wiki/UTF-8#Description

        // 110XXXXX
        if (i == 1 && c >> 5 == 0x06) {
          this.charLength = 2;
          break;
        }

        // 1110XXXX
        if (i <= 2 && c >> 4 == 0x0E) {
          this.charLength = 3;
          break;
        }

        // 11110XXX
        if (i <= 3 && c >> 3 == 0x1E) {
          this.charLength = 4;
          break;
        }
      }
      this.charReceived = i;
    };

    StringDecoder.prototype.end = function (buffer) {
      var res = '';
      if (buffer && buffer.length)
        res = this.write(buffer);

      if (this.charReceived) {
        var cr = this.charReceived;
        var buf = this.charBuffer;
        var enc = this.encoding;
        res += buf.slice(0, cr).toString(enc);
      }

      return res;
    };

    function passThroughWrite(buffer) {
      return buffer.toString(this.encoding);
    }

    function utf16DetectIncompleteChar(buffer) {
      this.charReceived = buffer.length % 2;
      this.charLength = this.charReceived ? 2 : 0;
    }

    function base64DetectIncompleteChar(buffer) {
      this.charReceived = buffer.length % 3;
      this.charLength = this.charReceived ? 3 : 0;
    }

  }, {"buffer": 17}],
  42: [function (require, module, exports) {
    module.exports = function isBuffer(arg) {
      return arg && typeof arg === 'object'
          && typeof arg.copy === 'function'
          && typeof arg.fill === 'function'
          && typeof arg.readUInt8 === 'function';
    }
  }, {}],
  43: [function (require, module, exports) {
    (function (process, global) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

      var formatRegExp = /%[sdj%]/g;
      exports.format = function (f) {
        if (!isString(f)) {
          var objects = [];
          for (var i = 0; i < arguments.length; i++) {
            objects.push(inspect(arguments[i]));
          }
          return objects.join(' ');
        }

        var i = 1;
        var args = arguments;
        var len = args.length;
        var str = String(f).replace(formatRegExp, function (x) {
          if (x === '%%') return '%';
          if (i >= len) return x;
          switch (x) {
            case '%s':
              return String(args[i++]);
            case '%d':
              return Number(args[i++]);
            case '%j':
              try {
                return JSON.stringify(args[i++]);
              } catch (_) {
                return '[Circular]';
        }
            default:
              return x;
          }
        });
        for (var x = args[i]; i < len; x = args[++i]) {
          if (isNull(x) || !isObject(x)) {
            str += ' ' + x;
          } else {
            str += ' ' + inspect(x);
          }
        }
        return str;
      };


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
      exports.deprecate = function (fn, msg) {
        // Allow for deprecating things in the process of starting up.
        if (isUndefined(global.process)) {
          return function () {
            return exports.deprecate(fn, msg).apply(this, arguments);
          };
        }

        if (process.noDeprecation === true) {
          return fn;
        }

        var warned = false;

        function deprecated() {
          if (!warned) {
            if (process.throwDeprecation) {
              throw new Error(msg);
            } else if (process.traceDeprecation) {
              console.trace(msg);
            } else {
              console.error(msg);
      }
            warned = true;
          }
          return fn.apply(this, arguments);
        }

        return deprecated;
      };


      var debugs = {};
      var debugEnviron;
      exports.debuglog = function (set) {
        if (isUndefined(debugEnviron))
          debugEnviron = process.env.NODE_DEBUG || '';
        set = set.toUpperCase();
        if (!debugs[set]) {
          if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
            var pid = process.pid;
            debugs[set] = function () {
              var msg = exports.format.apply(exports, arguments);
              console.error('%s %d: %s', set, pid, msg);
      };
          } else {
            debugs[set] = function () {
            };
          }
        }
        return debugs[set];
      };


      /**
       * Echos the value of a value. Trys to print the value out
       * in the best way possible given the different types.
       *
       * @param {Object} obj The object to print out.
       * @param {Object} opts Optional options object that alters the output.
       */
      /* legacy: obj, showHidden, depth, colors*/
      function inspect(obj, opts) {
        // default options
        var ctx = {
          seen: [],
          stylize: stylizeNoColor
        };
        // legacy...
        if (arguments.length >= 3) ctx.depth = arguments[2];
        if (arguments.length >= 4) ctx.colors = arguments[3];
        if (isBoolean(opts)) {
          // legacy...
          ctx.showHidden = opts;
        } else if (opts) {
          // got an "options" object
          exports._extend(ctx, opts);
        }
        // set default options
        if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
        if (isUndefined(ctx.depth)) ctx.depth = 2;
        if (isUndefined(ctx.colors)) ctx.colors = false;
        if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
        if (ctx.colors) ctx.stylize = stylizeWithColor;
        return formatValue(ctx, obj, ctx.depth);
      }

      exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
      inspect.colors = {
        'bold': [1, 22],
        'italic': [3, 23],
        'underline': [4, 24],
        'inverse': [7, 27],
        'white': [37, 39],
        'grey': [90, 39],
        'black': [30, 39],
        'blue': [34, 39],
        'cyan': [36, 39],
        'green': [32, 39],
        'magenta': [35, 39],
        'red': [31, 39],
        'yellow': [33, 39]
      };

// Don't use 'blue' not visible on cmd.exe
      inspect.styles = {
        'special': 'cyan',
        'number': 'yellow',
        'boolean': 'yellow',
        'undefined': 'grey',
        'null': 'bold',
        'string': 'green',
        'date': 'magenta',
        // "name": intentionally not styling
        'regexp': 'red'
      };


      function stylizeWithColor(str, styleType) {
        var style = inspect.styles[styleType];

        if (style) {
          return '\u001b[' + inspect.colors[style][0] + 'm' + str +
              '\u001b[' + inspect.colors[style][1] + 'm';
        } else {
          return str;
        }
      }


      function stylizeNoColor(str, styleType) {
        return str;
      }


      function arrayToHash(array) {
        var hash = {};

        array.forEach(function (val, idx) {
          hash[val] = true;
        });

        return hash;
      }


      function formatValue(ctx, value, recurseTimes) {
        // Provide a hook for user-specified inspect functions.
        // Check that value is an object with an inspect function on it
        if (ctx.customInspect &&
            value &&
            isFunction(value.inspect) &&
            // Filter out the util module, it's inspect function is special
            value.inspect !== exports.inspect &&
            // Also filter out any prototype objects using the circular check.
            !(value.constructor && value.constructor.prototype === value)) {
          var ret = value.inspect(recurseTimes, ctx);
          if (!isString(ret)) {
            ret = formatValue(ctx, ret, recurseTimes);
          }
          return ret;
        }

        // Primitive types cannot have properties
        var primitive = formatPrimitive(ctx, value);
        if (primitive) {
          return primitive;
        }

        // Look up the keys of the object.
        var keys = Object.keys(value);
        var visibleKeys = arrayToHash(keys);

        if (ctx.showHidden) {
          keys = Object.getOwnPropertyNames(value);
        }

        // IE doesn't make error fields non-enumerable
        // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
        if (isError(value)
            && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
          return formatError(value);
        }

        // Some type of object without properties can be shortcutted.
        if (keys.length === 0) {
          if (isFunction(value)) {
            var name = value.name ? ': ' + value.name : '';
            return ctx.stylize('[Function' + name + ']', 'special');
          }
          if (isRegExp(value)) {
            return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
          }
          if (isDate(value)) {
            return ctx.stylize(Date.prototype.toString.call(value), 'date');
          }
          if (isError(value)) {
            return formatError(value);
          }
        }

        var base = '', array = false, braces = ['{', '}'];

        // Make Array say that they are Array
        if (isArray(value)) {
          array = true;
          braces = ['[', ']'];
        }

        // Make functions say that they are functions
        if (isFunction(value)) {
          var n = value.name ? ': ' + value.name : '';
          base = ' [Function' + n + ']';
        }

        // Make RegExps say that they are RegExps
        if (isRegExp(value)) {
          base = ' ' + RegExp.prototype.toString.call(value);
        }

        // Make dates with properties first say the date
        if (isDate(value)) {
          base = ' ' + Date.prototype.toUTCString.call(value);
        }

        // Make error with message first say the error
        if (isError(value)) {
          base = ' ' + formatError(value);
        }

        if (keys.length === 0 && (!array || value.length == 0)) {
          return braces[0] + base + braces[1];
        }

        if (recurseTimes < 0) {
          if (isRegExp(value)) {
            return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
          } else {
            return ctx.stylize('[Object]', 'special');
          }
        }

        ctx.seen.push(value);

        var output;
        if (array) {
          output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
        } else {
          output = keys.map(function (key) {
            return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
          });
        }

        ctx.seen.pop();

        return reduceToSingleString(output, base, braces);
      }


      function formatPrimitive(ctx, value) {
        if (isUndefined(value))
          return ctx.stylize('undefined', 'undefined');
        if (isString(value)) {
          var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                  .replace(/'/g, "\\'")
                  .replace(/\\"/g, '"') + '\'';
          return ctx.stylize(simple, 'string');
        }
        if (isNumber(value))
          return ctx.stylize('' + value, 'number');
        if (isBoolean(value))
          return ctx.stylize('' + value, 'boolean');
        // For some reason typeof null is "object", so special case here.
        if (isNull(value))
          return ctx.stylize('null', 'null');
      }


      function formatError(value) {
        return '[' + Error.prototype.toString.call(value) + ']';
      }


      function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
        var output = [];
        for (var i = 0, l = value.length; i < l; ++i) {
          if (hasOwnProperty(value, String(i))) {
            output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
                String(i), true));
          } else {
            output.push('');
          }
        }
        keys.forEach(function (key) {
          if (!key.match(/^\d+$/)) {
            output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
                key, true));
          }
        });
        return output;
      }


      function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
        var name, str, desc;
        desc = Object.getOwnPropertyDescriptor(value, key) || {value: value[key]};
        if (desc.get) {
          if (desc.set) {
            str = ctx.stylize('[Getter/Setter]', 'special');
          } else {
            str = ctx.stylize('[Getter]', 'special');
          }
        } else {
          if (desc.set) {
            str = ctx.stylize('[Setter]', 'special');
          }
        }
        if (!hasOwnProperty(visibleKeys, key)) {
          name = '[' + key + ']';
        }
        if (!str) {
          if (ctx.seen.indexOf(desc.value) < 0) {
            if (isNull(recurseTimes)) {
              str = formatValue(ctx, desc.value, null);
            } else {
              str = formatValue(ctx, desc.value, recurseTimes - 1);
            }
            if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function (line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function (line) {
                return '   ' + line;
              }).join('\n');
        }
      }
          } else {
            str = ctx.stylize('[Circular]', 'special');
          }
        }
        if (isUndefined(name)) {
          if (array && key.match(/^\d+$/)) {
            return str;
          }
          name = JSON.stringify('' + key);
          if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
            name = name.substr(1, name.length - 2);
            name = ctx.stylize(name, 'name');
          } else {
            name = name.replace(/'/g, "\\'")
                .replace(/\\"/g, '"')
                .replace(/(^"|"$)/g, "'");
            name = ctx.stylize(name, 'string');
          }
        }

        return name + ': ' + str;
      }


      function reduceToSingleString(output, base, braces) {
        var numLinesEst = 0;
        var length = output.reduce(function (prev, cur) {
          numLinesEst++;
          if (cur.indexOf('\n') >= 0) numLinesEst++;
          return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
        }, 0);

        if (length > 60) {
          return braces[0] +
              (base === '' ? '' : base + '\n ') +
              ' ' +
              output.join(',\n  ') +
              ' ' +
              braces[1];
        }

        return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
      }


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
      function isArray(ar) {
        return Array.isArray(ar);
      }

      exports.isArray = isArray;

      function isBoolean(arg) {
        return typeof arg === 'boolean';
      }

      exports.isBoolean = isBoolean;

      function isNull(arg) {
        return arg === null;
      }

      exports.isNull = isNull;

      function isNullOrUndefined(arg) {
        return arg == null;
      }

      exports.isNullOrUndefined = isNullOrUndefined;

      function isNumber(arg) {
        return typeof arg === 'number';
      }

      exports.isNumber = isNumber;

      function isString(arg) {
        return typeof arg === 'string';
      }

      exports.isString = isString;

      function isSymbol(arg) {
        return typeof arg === 'symbol';
      }

      exports.isSymbol = isSymbol;

      function isUndefined(arg) {
        return arg === void 0;
      }

      exports.isUndefined = isUndefined;

      function isRegExp(re) {
        return isObject(re) && objectToString(re) === '[object RegExp]';
      }

      exports.isRegExp = isRegExp;

      function isObject(arg) {
        return typeof arg === 'object' && arg !== null;
      }

      exports.isObject = isObject;

      function isDate(d) {
        return isObject(d) && objectToString(d) === '[object Date]';
      }

      exports.isDate = isDate;

      function isError(e) {
        return isObject(e) &&
            (objectToString(e) === '[object Error]' || e instanceof Error);
      }

      exports.isError = isError;

      function isFunction(arg) {
        return typeof arg === 'function';
      }

      exports.isFunction = isFunction;

      function isPrimitive(arg) {
        return arg === null ||
            typeof arg === 'boolean' ||
            typeof arg === 'number' ||
            typeof arg === 'string' ||
            typeof arg === 'symbol' ||  // ES6 symbol
            typeof arg === 'undefined';
      }

      exports.isPrimitive = isPrimitive;

      exports.isBuffer = require('./support/isBuffer');

      function objectToString(o) {
        return Object.prototype.toString.call(o);
      }


      function pad(n) {
        return n < 10 ? '0' + n.toString(10) : n.toString(10);
      }


      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
        'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
      function timestamp() {
        var d = new Date();
        var time = [pad(d.getHours()),
          pad(d.getMinutes()),
          pad(d.getSeconds())].join(':');
        return [d.getDate(), months[d.getMonth()], time].join(' ');
      }


// log is just a thin wrapper to console.log that prepends a timestamp
      exports.log = function () {
        console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
      };


      /**
       * Inherit the prototype methods from one constructor into another.
       *
       * The Function.prototype.inherits from lang.js rewritten as a standalone
       * function (not on Function.prototype). NOTE: If this file is to be loaded
       * during bootstrapping this function needs to be rewritten using some native
       * functions as prototype setup using normal JavaScript does not work as
       * expected during bootstrapping (see mirror.js in r114903).
       *
       * @param {function} ctor Constructor function which needs to inherit the
       *     prototype.
       * @param {function} superCtor Constructor function to inherit prototype from.
       */
      exports.inherits = require('inherits');

      exports._extend = function (origin, add) {
        // Don't do anything if add isn't an object
        if (!add || !isObject(add)) return origin;

        var keys = Object.keys(add);
        var i = keys.length;
        while (i--) {
          origin[keys[i]] = add[keys[i]];
        }
        return origin;
      };

      function hasOwnProperty(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
      }

    }).call(this, require('_process'), typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
  }, {"./support/isBuffer": 42, "_process": 25, "inherits": 22}],
  44: [function (require, module, exports) {
    var Scalar = require('./Scalar');

    module.exports = Line;

    /**
     * Container for line-related functions
     * @class Line
     */
    function Line() {
    };

    /**
     * Compute the intersection between two lines.
     * @static
     * @method lineInt
     * @param  {Array}  l1          Line vector 1
     * @param  {Array}  l2          Line vector 2
     * @param  {Number} precision   Precision to use when checking if the lines are parallel
     * @return {Array}              The intersection point.
     */
    Line.lineInt = function (l1, l2, precision) {
      precision = precision || 0;
      var i = [0, 0]; // point
      var a1, b1, c1, a2, b2, c2, det; // scalars
      a1 = l1[1][1] - l1[0][1];
      b1 = l1[0][0] - l1[1][0];
      c1 = a1 * l1[0][0] + b1 * l1[0][1];
      a2 = l2[1][1] - l2[0][1];
      b2 = l2[0][0] - l2[1][0];
      c2 = a2 * l2[0][0] + b2 * l2[0][1];
      det = a1 * b2 - a2 * b1;
      if (!Scalar.eq(det, 0, precision)) { // lines are not parallel
        i[0] = (b2 * c1 - b1 * c2) / det;
        i[1] = (a1 * c2 - a2 * c1) / det;
      }
      return i;
    };

    /**
     * Checks if two line segments intersects.
     * @method segmentsIntersect
     * @param {Array} p1 The start vertex of the first line segment.
     * @param {Array} p2 The end vertex of the first line segment.
     * @param {Array} q1 The start vertex of the second line segment.
     * @param {Array} q2 The end vertex of the second line segment.
     * @return {Boolean} True if the two line segments intersect
     */
    Line.segmentsIntersect = function (p1, p2, q1, q2) {
      var dx = p2[0] - p1[0];
      var dy = p2[1] - p1[1];
      var da = q2[0] - q1[0];
      var db = q2[1] - q1[1];

      // segments are parallel
      if (da * dy - db * dx == 0)
        return false;

      var s = (dx * (q1[1] - p1[1]) + dy * (p1[0] - q1[0])) / (da * dy - db * dx)
      var t = (da * (p1[1] - q1[1]) + db * (q1[0] - p1[0])) / (db * dx - da * dy)

      return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
    };


  }, {"./Scalar": 47}],
  45: [function (require, module, exports) {
    module.exports = Point;

    /**
     * Point related functions
     * @class Point
     */
    function Point() {
    };

    /**
     * Get the area of a triangle spanned by the three given points. Note that the area will be negative if the points are not given in counter-clockwise order.
     * @static
     * @method area
     * @param  {Array} a
     * @param  {Array} b
     * @param  {Array} c
     * @return {Number}
     */
    Point.area = function (a, b, c) {
      return (((b[0] - a[0]) * (c[1] - a[1])) - ((c[0] - a[0]) * (b[1] - a[1])));
    };

    Point.left = function (a, b, c) {
      return Point.area(a, b, c) > 0;
    };

    Point.leftOn = function (a, b, c) {
      return Point.area(a, b, c) >= 0;
    };

    Point.right = function (a, b, c) {
      return Point.area(a, b, c) < 0;
    };

    Point.rightOn = function (a, b, c) {
      return Point.area(a, b, c) <= 0;
    };

    var tmpPoint1 = [],
        tmpPoint2 = [];

    /**
     * Check if three points are collinear
     * @method collinear
     * @param  {Array} a
     * @param  {Array} b
     * @param  {Array} c
     * @param  {Number} [thresholdAngle=0] Threshold angle to use when comparing the vectors. The function will return true if the angle between the resulting vectors is less than this value. Use zero for max precision.
     * @return {Boolean}
     */
    Point.collinear = function (a, b, c, thresholdAngle) {
      if (!thresholdAngle)
        return Point.area(a, b, c) == 0;
      else {
        var ab = tmpPoint1,
            bc = tmpPoint2;

        ab[0] = b[0] - a[0];
        ab[1] = b[1] - a[1];
        bc[0] = c[0] - b[0];
        bc[1] = c[1] - b[1];

        var dot = ab[0] * bc[0] + ab[1] * bc[1],
            magA = Math.sqrt(ab[0] * ab[0] + ab[1] * ab[1]),
            magB = Math.sqrt(bc[0] * bc[0] + bc[1] * bc[1]),
            angle = Math.acos(dot / (magA * magB));
        return angle < thresholdAngle;
    }
    };

    Point.sqdist = function (a, b) {
      var dx = b[0] - a[0];
      var dy = b[1] - a[1];
      return dx * dx + dy * dy;
    };

  }, {}],
  46: [function (require, module, exports) {
    var Line = require("./Line")
        , Point = require("./Point")
        , Scalar = require("./Scalar")

    module.exports = Polygon;

    /**
     * Polygon class.
     * @class Polygon
     * @constructor
     */
    function Polygon() {

    /**
     * Vertices that this polygon consists of. An array of array of numbers, example: [[0,0],[1,0],..]
     * @property vertices
     * @type {Array}
     */
    this.vertices = [];
    }

    /**
     * Get a vertex at position i. It does not matter if i is out of bounds, this function will just cycle.
     * @method at
     * @param  {Number} i
     * @return {Array}
     */
    Polygon.prototype.at = function (i) {
      var v = this.vertices,
          s = v.length;
      return v[i < 0 ? i % s + s : i % s];
    };

    /**
     * Get first vertex
     * @method first
     * @return {Array}
     */
    Polygon.prototype.first = function () {
      return this.vertices[0];
    };

    /**
     * Get last vertex
     * @method last
     * @return {Array}
     */
    Polygon.prototype.last = function () {
      return this.vertices[this.vertices.length - 1];
    };

    /**
     * Clear the polygon data
     * @method clear
     * @return {Array}
     */
    Polygon.prototype.clear = function () {
      this.vertices.length = 0;
    };

    /**
     * Append points "from" to "to"-1 from an other polygon "poly" onto this one.
     * @method append
     * @param {Polygon} poly The polygon to get points from.
     * @param {Number}  from The vertex index in "poly".
     * @param {Number}  to The end vertex index in "poly". Note that this vertex is NOT included when appending.
     * @return {Array}
     */
    Polygon.prototype.append = function (poly, from, to) {
      if (typeof(from) == "undefined") throw new Error("From is not given!");
      if (typeof(to) == "undefined")   throw new Error("To is not given!");

      if (to - 1 < from)                 throw new Error("lol1");
      if (to > poly.vertices.length)   throw new Error("lol2");
      if (from < 0)                    throw new Error("lol3");

      for (var i = from; i < to; i++) {
        this.vertices.push(poly.vertices[i]);
      }
    };

    /**
     * Make sure that the polygon vertices are ordered counter-clockwise.
     * @method makeCCW
     */
    Polygon.prototype.makeCCW = function () {
      var br = 0,
          v = this.vertices;

      // find bottom right point
      for (var i = 1; i < this.vertices.length; ++i) {
        if (v[i][1] < v[br][1] || (v[i][1] == v[br][1] && v[i][0] > v[br][0])) {
          br = i;
        }
      }

      // reverse poly if clockwise
      if (!Point.left(this.at(br - 1), this.at(br), this.at(br + 1))) {
        this.reverse();
      }
    };

    /**
     * Reverse the vertices in the polygon
     * @method reverse
     */
    Polygon.prototype.reverse = function () {
      var tmp = [];
      for (var i = 0, N = this.vertices.length; i !== N; i++) {
        tmp.push(this.vertices.pop());
      }
      this.vertices = tmp;
    };

    /**
     * Check if a point in the polygon is a reflex point
     * @method isReflex
     * @param  {Number}  i
     * @return {Boolean}
     */
    Polygon.prototype.isReflex = function (i) {
      return Point.right(this.at(i - 1), this.at(i), this.at(i + 1));
    };

    var tmpLine1 = [],
        tmpLine2 = [];

    /**
     * Check if two vertices in the polygon can see each other
     * @method canSee
     * @param  {Number} a Vertex index 1
     * @param  {Number} b Vertex index 2
     * @return {Boolean}
     */
    Polygon.prototype.canSee = function (a, b) {
      var p, dist, l1 = tmpLine1, l2 = tmpLine2;

      if (Point.leftOn(this.at(a + 1), this.at(a), this.at(b)) && Point.rightOn(this.at(a - 1), this.at(a), this.at(b))) {
        return false;
      }
      dist = Point.sqdist(this.at(a), this.at(b));
      for (var i = 0; i !== this.vertices.length; ++i) { // for each edge
        if ((i + 1) % this.vertices.length === a || i === a) // ignore incident edges
          continue;
        if (Point.leftOn(this.at(a), this.at(b), this.at(i + 1)) && Point.rightOn(this.at(a), this.at(b), this.at(i))) { // if diag intersects an edge
          l1[0] = this.at(a);
          l1[1] = this.at(b);
          l2[0] = this.at(i);
          l2[1] = this.at(i + 1);
          p = Line.lineInt(l1, l2);
          if (Point.sqdist(this.at(a), p) < dist) { // if edge is blocking visibility to b
                return false;
            }
        }
    }

      return true;
    };

    /**
     * Copy the polygon from vertex i to vertex j.
     * @method copy
     * @param  {Number} i
     * @param  {Number} j
     * @param  {Polygon} [targetPoly]   Optional target polygon to save in.
     * @return {Polygon}                The resulting copy.
     */
    Polygon.prototype.copy = function (i, j, targetPoly) {
      var p = targetPoly || new Polygon();
      p.clear();
      if (i < j) {
        // Insert all vertices from i to j
        for (var k = i; k <= j; k++)
          p.vertices.push(this.vertices[k]);

      } else {

        // Insert vertices 0 to j
        for (var k = 0; k <= j; k++)
          p.vertices.push(this.vertices[k]);

        // Insert vertices i to end
        for (var k = i; k < this.vertices.length; k++)
          p.vertices.push(this.vertices[k]);
      }

      return p;
    };

    /**
     * Decomposes the polygon into convex pieces. Returns a list of edges [[p1,p2],[p2,p3],...] that cuts the polygon.
     * Note that this algorithm has complexity O(N^4) and will be very slow for polygons with many vertices.
     * @method getCutEdges
     * @return {Array}
     */
    Polygon.prototype.getCutEdges = function () {
      var min = [], tmp1 = [], tmp2 = [], tmpPoly = new Polygon();
      var nDiags = Number.MAX_VALUE;

      for (var i = 0; i < this.vertices.length; ++i) {
        if (this.isReflex(i)) {
          for (var j = 0; j < this.vertices.length; ++j) {
            if (this.canSee(i, j)) {
              tmp1 = this.copy(i, j, tmpPoly).getCutEdges();
              tmp2 = this.copy(j, i, tmpPoly).getCutEdges();

              for (var k = 0; k < tmp2.length; k++)
                tmp1.push(tmp2[k]);

              if (tmp1.length < nDiags) {
                min = tmp1;
                nDiags = tmp1.length;
                min.push([this.at(i), this.at(j)]);
                    }
            }
            }
        }
      }

      return min;
    };

    /**
     * Decomposes the polygon into one or more convex sub-Polygons.
     * @method decomp
     * @return {Array} An array or Polygon objects.
     */
    Polygon.prototype.decomp = function () {
      var edges = this.getCutEdges();
      if (edges.length > 0)
        return this.slice(edges);
      else
        return [this];
    };

    /**
     * Slices the polygon given one or more cut edges. If given one, this function will return two polygons (false on failure). If many, an array of polygons.
     * @method slice
     * @param {Array} cutEdges A list of edges, as returned by .getCutEdges()
     * @return {Array}
     */
    Polygon.prototype.slice = function (cutEdges) {
      if (cutEdges.length == 0) return [this];
      if (cutEdges instanceof Array && cutEdges.length && cutEdges[0] instanceof Array && cutEdges[0].length == 2 && cutEdges[0][0] instanceof Array) {

        var polys = [this];

        for (var i = 0; i < cutEdges.length; i++) {
          var cutEdge = cutEdges[i];
          // Cut all polys
          for (var j = 0; j < polys.length; j++) {
            var poly = polys[j];
            var result = poly.slice(cutEdge);
            if (result) {
              // Found poly! Cut and quit
              polys.splice(j, 1);
              polys.push(result[0], result[1]);
              break;
                }
            }
        }

        return polys;
      } else {

        // Was given one edge
        var cutEdge = cutEdges;
        var i = this.vertices.indexOf(cutEdge[0]);
        var j = this.vertices.indexOf(cutEdge[1]);

        if (i != -1 && j != -1) {
          return [this.copy(i, j),
            this.copy(j, i)];
        } else {
          return false;
        }
      }
    };

    /**
     * Checks that the line segments of this polygon do not intersect each other.
     * @method isSimple
     * @param  {Array} path An array of vertices e.g. [[0,0],[0,1],...]
     * @return {Boolean}
     * @todo Should it check all segments with all others?
     */
    Polygon.prototype.isSimple = function () {
      var path = this.vertices;
      // Check
      for (var i = 0; i < path.length - 1; i++) {
        for (var j = 0; j < i - 1; j++) {
          if (Line.segmentsIntersect(path[i], path[i + 1], path[j], path[j + 1])) {
            return false;
          }
        }
      }

      // Check the segment between the last and the first point to all others
      for (var i = 1; i < path.length - 2; i++) {
        if (Line.segmentsIntersect(path[0], path[path.length - 1], path[i], path[i + 1])) {
          return false;
        }
      }

      return true;
    };

    function getIntersectionPoint(p1, p2, q1, q2, delta) {
      delta = delta || 0;
      var a1 = p2[1] - p1[1];
      var b1 = p1[0] - p2[0];
      var c1 = (a1 * p1[0]) + (b1 * p1[1]);
      var a2 = q2[1] - q1[1];
      var b2 = q1[0] - q2[0];
      var c2 = (a2 * q1[0]) + (b2 * q1[1]);
      var det = (a1 * b2) - (a2 * b1);

      if (!Scalar.eq(det, 0, delta))
        return [((b2 * c1) - (b1 * c2)) / det, ((a1 * c2) - (a2 * c1)) / det]
      else
        return [0, 0]
    }

    /**
     * Quickly decompose the Polygon into convex sub-polygons.
     * @method quickDecomp
     * @param  {Array} result
     * @param  {Array} [reflexVertices]
     * @param  {Array} [steinerPoints]
     * @param  {Number} [delta]
     * @param  {Number} [maxlevel]
     * @param  {Number} [level]
     * @return {Array}
     */
    Polygon.prototype.quickDecomp = function (result, reflexVertices, steinerPoints, delta, maxlevel, level) {
      maxlevel = maxlevel || 100;
      level = level || 0;
      delta = delta || 25;
      result = typeof(result) != "undefined" ? result : [];
      reflexVertices = reflexVertices || [];
      steinerPoints = steinerPoints || [];

      var upperInt = [0, 0], lowerInt = [0, 0], p = [0, 0]; // Points
      var upperDist = 0, lowerDist = 0, d = 0, closestDist = 0; // scalars
      var upperIndex = 0, lowerIndex = 0, closestIndex = 0; // Integers
      var lowerPoly = new Polygon(), upperPoly = new Polygon(); // polygons
      var poly = this,
          v = this.vertices;

      if (v.length < 3) return result;

      level++;
      if (level > maxlevel) {
        console.warn("quickDecomp: max level (" + maxlevel + ") reached.");
        return result;
      }

      for (var i = 0; i < this.vertices.length; ++i) {
        if (poly.isReflex(i)) {
          reflexVertices.push(poly.vertices[i]);
          upperDist = lowerDist = Number.MAX_VALUE;


          for (var j = 0; j < this.vertices.length; ++j) {
            if (Point.left(poly.at(i - 1), poly.at(i), poly.at(j))
                && Point.rightOn(poly.at(i - 1), poly.at(i), poly.at(j - 1))) { // if line intersects with an edge
              p = getIntersectionPoint(poly.at(i - 1), poly.at(i), poly.at(j), poly.at(j - 1)); // find the point of intersection
              if (Point.right(poly.at(i + 1), poly.at(i), p)) { // make sure it's inside the poly
                d = Point.sqdist(poly.vertices[i], p);
                if (d < lowerDist) { // keep only the closest intersection
                  lowerDist = d;
                  lowerInt = p;
                  lowerIndex = j;
                }
              }
                }
            if (Point.left(poly.at(i + 1), poly.at(i), poly.at(j + 1))
                && Point.rightOn(poly.at(i + 1), poly.at(i), poly.at(j))) {
              p = getIntersectionPoint(poly.at(i + 1), poly.at(i), poly.at(j), poly.at(j + 1));
              if (Point.left(poly.at(i - 1), poly.at(i), p)) {
                d = Point.sqdist(poly.vertices[i], p);
                if (d < upperDist) {
                  upperDist = d;
                  upperInt = p;
                  upperIndex = j;
                }
                    }
                }
          }

          // if there are no vertices to connect to, choose a point in the middle
          if (lowerIndex == (upperIndex + 1) % this.vertices.length) {
            //console.log("Case 1: Vertex("+i+"), lowerIndex("+lowerIndex+"), upperIndex("+upperIndex+"), poly.size("+this.vertices.length+")");
            p[0] = (lowerInt[0] + upperInt[0]) / 2;
            p[1] = (lowerInt[1] + upperInt[1]) / 2;
            steinerPoints.push(p);

            if (i < upperIndex) {
              //lowerPoly.insert(lowerPoly.end(), poly.begin() + i, poly.begin() + upperIndex + 1);
              lowerPoly.append(poly, i, upperIndex + 1);
              lowerPoly.vertices.push(p);
              upperPoly.vertices.push(p);
              if (lowerIndex != 0) {
                //upperPoly.insert(upperPoly.end(), poly.begin() + lowerIndex, poly.end());
                upperPoly.append(poly, lowerIndex, poly.vertices.length);
              }
              //upperPoly.insert(upperPoly.end(), poly.begin(), poly.begin() + i + 1);
              upperPoly.append(poly, 0, i + 1);
                } else {
              if (i != 0) {
                //lowerPoly.insert(lowerPoly.end(), poly.begin() + i, poly.end());
                lowerPoly.append(poly, i, poly.vertices.length);
              }
              //lowerPoly.insert(lowerPoly.end(), poly.begin(), poly.begin() + upperIndex + 1);
              lowerPoly.append(poly, 0, upperIndex + 1);
              lowerPoly.vertices.push(p);
              upperPoly.vertices.push(p);
              //upperPoly.insert(upperPoly.end(), poly.begin() + lowerIndex, poly.begin() + i + 1);
              upperPoly.append(poly, lowerIndex, i + 1);
            }
          } else {
            // connect to the closest point within the triangle
            //console.log("Case 2: Vertex("+i+"), closestIndex("+closestIndex+"), poly.size("+this.vertices.length+")\n");

            if (lowerIndex > upperIndex) {
              upperIndex += this.vertices.length;
                }
            closestDist = Number.MAX_VALUE;

            if (upperIndex < lowerIndex) {
              return result;
            }

            for (var j = lowerIndex; j <= upperIndex; ++j) {
              if (Point.leftOn(poly.at(i - 1), poly.at(i), poly.at(j))
                            && Point.rightOn(poly.at(i + 1), poly.at(i), poly.at(j))) {
                d = Point.sqdist(poly.at(i), poly.at(j));
                if (d < closestDist) {
                  closestDist = d;
                  closestIndex = j % this.vertices.length;
                        }
                    }
            }

            if (i < closestIndex) {
              lowerPoly.append(poly, i, closestIndex + 1);
              if (closestIndex != 0) {
                upperPoly.append(poly, closestIndex, v.length);
                    }
              upperPoly.append(poly, 0, i + 1);
            } else {
              if (i != 0) {
                lowerPoly.append(poly, i, v.length);
                    }
              lowerPoly.append(poly, 0, closestIndex + 1);
              upperPoly.append(poly, closestIndex, i + 1);
                }
            }

          // solve smallest poly first
          if (lowerPoly.vertices.length < upperPoly.vertices.length) {
            lowerPoly.quickDecomp(result, reflexVertices, steinerPoints, delta, maxlevel, level);
            upperPoly.quickDecomp(result, reflexVertices, steinerPoints, delta, maxlevel, level);
            } else {
            upperPoly.quickDecomp(result, reflexVertices, steinerPoints, delta, maxlevel, level);
            lowerPoly.quickDecomp(result, reflexVertices, steinerPoints, delta, maxlevel, level);
            }

          return result;
        }
      }
      result.push(this);

      return result;
    };

    /**
     * Remove collinear points in the polygon.
     * @method removeCollinearPoints
     * @param  {Number} [precision] The threshold angle to use when determining whether two edges are collinear. Use zero for finest precision.
     * @return {Number}           The number of points removed
     */
    Polygon.prototype.removeCollinearPoints = function (precision) {
      var num = 0;
      for (var i = this.vertices.length - 1; this.vertices.length > 3 && i >= 0; --i) {
        if (Point.collinear(this.at(i - 1), this.at(i), this.at(i + 1), precision)) {
          // Remove the middle point
          this.vertices.splice(i % this.vertices.length, 1);
          i--; // Jump one point forward. Otherwise we may get a chain removal
          num++;
        }
      }
      return num;
    };

  }, {"./Line": 44, "./Point": 45, "./Scalar": 47}],
  47: [function (require, module, exports) {
    module.exports = Scalar;

    /**
     * Scalar functions
     * @class Scalar
     */
    function Scalar() {
    }

    /**
     * Check if two scalars are equal
     * @static
     * @method eq
     * @param  {Number} a
     * @param  {Number} b
     * @param  {Number} [precision]
     * @return {Boolean}
     */
    Scalar.eq = function (a, b, precision) {
      precision = precision || 0;
      return Math.abs(a - b) < precision;
    };

  }, {}],
  48: [function (require, module, exports) {
    module.exports = {
      Polygon: require("./Polygon"),
      Point: require("./Point"),
    };

  }, {"./Point": 45, "./Polygon": 46}],
  49: [function (require, module, exports) {
    module.exports = {
      "name": "p2",
      "version": "0.7.1",
      "description": "A JavaScript 2D physics engine.",
      "author": {
        "name": "Stefan Hedman",
        "email": "schteppe@gmail.com",
        "url": "http://steffe.se"
      },
      "keywords": [
        "p2.js",
        "p2",
        "physics",
        "engine",
        "2d"
      ],
      "main": "./src/p2.js",
      "engines": {
        "node": "*"
      },
      "repository": {
        "type": "git",
        "url": "git+https://github.com/schteppe/p2.js.git"
      },
      "bugs": {
        "url": "https://github.com/schteppe/p2.js/issues"
      },
      "licenses": [
        {
          "type": "MIT"
    }
      ],
      "devDependencies": {
        "grunt": "^0.4.5",
        "grunt-contrib-jshint": "^0.11.2",
        "grunt-contrib-nodeunit": "^0.4.1",
        "grunt-contrib-uglify": "~0.4.0",
        "grunt-contrib-watch": "~0.5.0",
        "grunt-browserify": "~2.0.1",
        "grunt-contrib-concat": "^0.4.0"
      },
      "dependencies": {
        "poly-decomp": "0.1.1"
      },
      "gitHead": "d83c483f912362fd6e57c74b0634ea3f1f3e0c82",
      "homepage": "https://github.com/schteppe/p2.js#readme",
      "_id": "p2@0.7.1",
      "scripts": {},
      "_shasum": "25f2474d9bc3a6d3140a1da26a67c9e118ac9543",
      "_from": "p2@latest",
      "_npmVersion": "2.14.7",
      "_nodeVersion": "4.2.2",
      "_npmUser": {
        "name": "schteppe",
        "email": "schteppe@gmail.com"
      },
      "maintainers": [
        {
          "name": "schteppe",
          "email": "schteppe@gmail.com"
    }
      ],
      "dist": {
        "shasum": "25f2474d9bc3a6d3140a1da26a67c9e118ac9543",
        "tarball": "https://registry.npmjs.org/p2/-/p2-0.7.1.tgz"
      },
      "directories": {},
      "_resolved": "https://registry.npmjs.org/p2/-/p2-0.7.1.tgz",
      "readme": "ERROR: No README data found!"
    }

  }, {}],
  50: [function (require, module, exports) {
    var vec2 = require('../math/vec2')
        , Utils = require('../utils/Utils');

    module.exports = AABB;

    /**
     * Axis aligned bounding box class.
     * @class AABB
     * @constructor
     * @param {Object}  [options]
     * @param {Array}   [options.upperBound]
     * @param {Array}   [options.lowerBound]
     */
    function AABB(options) {

    /**
     * The lower bound of the bounding box.
     * @property lowerBound
     * @type {Array}
     */
    this.lowerBound = vec2.create();
      if (options && options.lowerBound) {
        vec2.copy(this.lowerBound, options.lowerBound);
      }

      /**
       * The upper bound of the bounding box.
       * @property upperBound
       * @type {Array}
       */
      this.upperBound = vec2.create();
      if (options && options.upperBound) {
        vec2.copy(this.upperBound, options.upperBound);
    }
    }

    var tmp = vec2.create();

    /**
     * Set the AABB bounds from a set of points, transformed by the given position and angle.
     * @method setFromPoints
     * @param {Array} points An array of vec2's.
     * @param {Array} position
     * @param {number} angle
     * @param {number} skinSize Some margin to be added to the AABB.
     */
    AABB.prototype.setFromPoints = function (points, position, angle, skinSize) {
      var l = this.lowerBound,
          u = this.upperBound;

      if (typeof(angle) !== "number") {
        angle = 0;
      }

      // Set to the first point
      if (angle !== 0) {
        vec2.rotate(l, points[0], angle);
      } else {
        vec2.copy(l, points[0]);
      }
      vec2.copy(u, l);

      // Compute cosines and sines just once
      var cosAngle = Math.cos(angle),
          sinAngle = Math.sin(angle);
      for (var i = 1; i < points.length; i++) {
        var p = points[i];

        if (angle !== 0) {
          var x = p[0],
              y = p[1];
          tmp[0] = cosAngle * x - sinAngle * y;
          tmp[1] = sinAngle * x + cosAngle * y;
          p = tmp;
        }

        for (var j = 0; j < 2; j++) {
          if (p[j] > u[j]) {
            u[j] = p[j];
            }
          if (p[j] < l[j]) {
            l[j] = p[j];
          }
        }
      }

      // Add offset
      if (position) {
        vec2.add(this.lowerBound, this.lowerBound, position);
        vec2.add(this.upperBound, this.upperBound, position);
      }

      if (skinSize) {
        this.lowerBound[0] -= skinSize;
        this.lowerBound[1] -= skinSize;
        this.upperBound[0] += skinSize;
        this.upperBound[1] += skinSize;
      }
    };

    /**
     * Copy bounds from an AABB to this AABB
     * @method copy
     * @param  {AABB} aabb
     */
    AABB.prototype.copy = function (aabb) {
      vec2.copy(this.lowerBound, aabb.lowerBound);
      vec2.copy(this.upperBound, aabb.upperBound);
    };

    /**
     * Extend this AABB so that it covers the given AABB too.
     * @method extend
     * @param  {AABB} aabb
     */
    AABB.prototype.extend = function (aabb) {
      // Loop over x and y
      var i = 2;
      while (i--) {
        // Extend lower bound
        var l = aabb.lowerBound[i];
        if (this.lowerBound[i] > l) {
          this.lowerBound[i] = l;
        }

        // Upper
        var u = aabb.upperBound[i];
        if (this.upperBound[i] < u) {
          this.upperBound[i] = u;
        }
      }
    };

    /**
     * Returns true if the given AABB overlaps this AABB.
     * @method overlaps
     * @param  {AABB} aabb
     * @return {Boolean}
     */
    AABB.prototype.overlaps = function (aabb) {
      var l1 = this.lowerBound,
          u1 = this.upperBound,
          l2 = aabb.lowerBound,
          u2 = aabb.upperBound;

      //      l2        u2
      //      |---------|
      // |--------|
      // l1       u1

      return ((l2[0] <= u1[0] && u1[0] <= u2[0]) || (l1[0] <= u2[0] && u2[0] <= u1[0])) &&
          ((l2[1] <= u1[1] && u1[1] <= u2[1]) || (l1[1] <= u2[1] && u2[1] <= u1[1]));
    };

    /**
     * @method containsPoint
     * @param  {Array} point
     * @return {boolean}
     */
    AABB.prototype.containsPoint = function (point) {
      var l = this.lowerBound,
          u = this.upperBound;
      return l[0] <= point[0] && point[0] <= u[0] && l[1] <= point[1] && point[1] <= u[1];
    };

    /**
     * Check if the AABB is hit by a ray.
     * @method overlapsRay
     * @param  {Ray} ray
     * @return {number} -1 if no hit, a number between 0 and 1 if hit.
     */
    AABB.prototype.overlapsRay = function (ray) {
      var t = 0;

      // ray.direction is unit direction vector of ray
      var dirFracX = 1 / ray.direction[0];
      var dirFracY = 1 / ray.direction[1];

      // this.lowerBound is the corner of AABB with minimal coordinates - left bottom, rt is maximal corner
      var t1 = (this.lowerBound[0] - ray.from[0]) * dirFracX;
      var t2 = (this.upperBound[0] - ray.from[0]) * dirFracX;
      var t3 = (this.lowerBound[1] - ray.from[1]) * dirFracY;
      var t4 = (this.upperBound[1] - ray.from[1]) * dirFracY;

      var tmin = Math.max(Math.max(Math.min(t1, t2), Math.min(t3, t4)));
      var tmax = Math.min(Math.min(Math.max(t1, t2), Math.max(t3, t4)));

      // if tmax < 0, ray (line) is intersecting AABB, but whole AABB is behing us
      if (tmax < 0) {
        //t = tmax;
        return -1;
      }

      // if tmin > tmax, ray doesn't intersect AABB
      if (tmin > tmax) {
        //t = tmax;
        return -1;
      }

      return tmin;
    };
  }, {"../math/vec2": 73, "../utils/Utils": 100}],
  51: [function (require, module, exports) {
    var vec2 = require('../math/vec2');
    var Body = require('../objects/Body');

    module.exports = Broadphase;

    /**
     * Base class for broadphase implementations.
     * @class Broadphase
     * @constructor
     */
    function Broadphase(type) {

      this.type = type;

    /**
     * The resulting overlapping pairs. Will be filled with results during .getCollisionPairs().
     * @property result
     * @type {Array}
     */
    this.result = [];

    /**
     * The world to search for collision pairs in. To change it, use .setWorld()
     * @property world
     * @type {World}
     * @readOnly
     */
    this.world = null;

    /**
     * The bounding volume type to use in the broadphase algorithms. Should be set to Broadphase.AABB or Broadphase.BOUNDING_CIRCLE.
     * @property {Number} boundingVolumeType
     */
    this.boundingVolumeType = Broadphase.AABB;
    }

    /**
     * Axis aligned bounding box type.
     * @static
     * @property {Number} AABB
     */
    Broadphase.AABB = 1;

    /**
     * Bounding circle type.
     * @static
     * @property {Number} BOUNDING_CIRCLE
     */
    Broadphase.BOUNDING_CIRCLE = 2;

    /**
     * Set the world that we are searching for collision pairs in.
     * @method setWorld
     * @param  {World} world
     */
    Broadphase.prototype.setWorld = function (world) {
      this.world = world;
    };

    /**
     * Get all potential intersecting body pairs.
     * @method getCollisionPairs
     * @param  {World} world The world to search in.
     * @return {Array} An array of the bodies, ordered in pairs. Example: A result of [a,b,c,d] means that the potential pairs are: (a,b), (c,d).
     */
    Broadphase.prototype.getCollisionPairs = function (world) {
    };

    var dist = vec2.create();

    /**
     * Check whether the bounding radius of two bodies overlap.
     * @method  boundingRadiusCheck
     * @param  {Body} bodyA
     * @param  {Body} bodyB
     * @return {Boolean}
     */
    Broadphase.boundingRadiusCheck = function (bodyA, bodyB) {
      vec2.sub(dist, bodyA.position, bodyB.position);
      var d2 = vec2.squaredLength(dist),
          r = bodyA.boundingRadius + bodyB.boundingRadius;
      return d2 <= r * r;
    };

    /**
     * Check whether the bounding radius of two bodies overlap.
     * @method  boundingRadiusCheck
     * @param  {Body} bodyA
     * @param  {Body} bodyB
     * @return {Boolean}
     */
    Broadphase.aabbCheck = function (bodyA, bodyB) {
      return bodyA.getAABB().overlaps(bodyB.getAABB());
    };

    /**
     * Check whether the bounding radius of two bodies overlap.
     * @method  boundingRadiusCheck
     * @param  {Body} bodyA
     * @param  {Body} bodyB
     * @return {Boolean}
     */
    Broadphase.prototype.boundingVolumeCheck = function (bodyA, bodyB) {
      var result;

      switch (this.boundingVolumeType) {
        case Broadphase.BOUNDING_CIRCLE:
          result = Broadphase.boundingRadiusCheck(bodyA, bodyB);
          break;
        case Broadphase.AABB:
          result = Broadphase.aabbCheck(bodyA, bodyB);
          break;
        default:
          throw new Error('Bounding volume type not recognized: ' + this.boundingVolumeType);
      }
      return result;
    };

    /**
     * Check whether two bodies are allowed to collide at all.
     * @method  canCollide
     * @param  {Body} bodyA
     * @param  {Body} bodyB
     * @return {Boolean}
     */
    Broadphase.canCollide = function (bodyA, bodyB) {
      var KINEMATIC = Body.KINEMATIC;
      var STATIC = Body.STATIC;

      // Cannot collide static bodies
      if (bodyA.type === STATIC && bodyB.type === STATIC) {
        return false;
      }

      // Cannot collide static vs kinematic bodies
      if ((bodyA.type === KINEMATIC && bodyB.type === STATIC) ||
          (bodyA.type === STATIC && bodyB.type === KINEMATIC)) {
        return false;
      }

      // Cannot collide kinematic vs kinematic
      if (bodyA.type === KINEMATIC && bodyB.type === KINEMATIC) {
        return false;
      }

      // Cannot collide both sleeping bodies
      if (bodyA.sleepState === Body.SLEEPING && bodyB.sleepState === Body.SLEEPING) {
        return false;
      }

      // Cannot collide if one is static and the other is sleeping
      if ((bodyA.sleepState === Body.SLEEPING && bodyB.type === STATIC) ||
          (bodyB.sleepState === Body.SLEEPING && bodyA.type === STATIC)) {
        return false;
      }

      return true;
    };

    Broadphase.NAIVE = 1;
    Broadphase.SAP = 2;

  }, {"../math/vec2": 73, "../objects/Body": 74}],
  52: [function (require, module, exports) {
    var Circle = require('../shapes/Circle'),
        Plane = require('../shapes/Plane'),
        Shape = require('../shapes/Shape'),
        Particle = require('../shapes/Particle'),
        Broadphase = require('../collision/Broadphase'),
        vec2 = require('../math/vec2');

    module.exports = NaiveBroadphase;

    /**
     * Naive broadphase implementation. Does N^2 tests.
     *
     * @class NaiveBroadphase
     * @constructor
     * @extends Broadphase
     */
    function NaiveBroadphase() {
      Broadphase.call(this, Broadphase.NAIVE);
    }

    NaiveBroadphase.prototype = new Broadphase();
    NaiveBroadphase.prototype.constructor = NaiveBroadphase;

    /**
     * Get the colliding pairs
     * @method getCollisionPairs
     * @param  {World} world
     * @return {Array}
     */
    NaiveBroadphase.prototype.getCollisionPairs = function (world) {
      var bodies = world.bodies,
          result = this.result;

      result.length = 0;

      for (var i = 0, Ncolliding = bodies.length; i !== Ncolliding; i++) {
        var bi = bodies[i];

        for (var j = 0; j < i; j++) {
          var bj = bodies[j];

          if (Broadphase.canCollide(bi, bj) && this.boundingVolumeCheck(bi, bj)) {
            result.push(bi, bj);
            }
        }
      }

      return result;
    };

    /**
     * Returns all the bodies within an AABB.
     * @method aabbQuery
     * @param  {World} world
     * @param  {AABB} aabb
     * @param {array} result An array to store resulting bodies in.
     * @return {array}
     */
    NaiveBroadphase.prototype.aabbQuery = function (world, aabb, result) {
      result = result || [];

      var bodies = world.bodies;
      for (var i = 0; i < bodies.length; i++) {
        var b = bodies[i];

        if (b.aabbNeedsUpdate) {
          b.updateAABB();
        }

        if (b.aabb.overlaps(aabb)) {
          result.push(b);
        }
      }

      return result;
    };
  }, {
    "../collision/Broadphase": 51,
    "../math/vec2": 73,
    "../shapes/Circle": 82,
    "../shapes/Particle": 86,
    "../shapes/Plane": 87,
    "../shapes/Shape": 88
  }],
  53: [function (require, module, exports) {
    var vec2 = require('../math/vec2')
        , sub = vec2.sub
        , add = vec2.add
        , dot = vec2.dot
        , Utils = require('../utils/Utils')
        , ContactEquationPool = require('../utils/ContactEquationPool')
        , FrictionEquationPool = require('../utils/FrictionEquationPool')
        , TupleDictionary = require('../utils/TupleDictionary')
        , Equation = require('../equations/Equation')
        , ContactEquation = require('../equations/ContactEquation')
        , FrictionEquation = require('../equations/FrictionEquation')
        , Circle = require('../shapes/Circle')
        , Convex = require('../shapes/Convex')
        , Shape = require('../shapes/Shape')
        , Body = require('../objects/Body')
        , Box = require('../shapes/Box');

    module.exports = Narrowphase;

// Temp things
    var yAxis = vec2.fromValues(0, 1);

    var tmp1 = vec2.fromValues(0, 0)
        , tmp2 = vec2.fromValues(0, 0)
        , tmp3 = vec2.fromValues(0, 0)
        , tmp4 = vec2.fromValues(0, 0)
        , tmp5 = vec2.fromValues(0, 0)
        , tmp6 = vec2.fromValues(0, 0)
        , tmp7 = vec2.fromValues(0, 0)
        , tmp8 = vec2.fromValues(0, 0)
        , tmp9 = vec2.fromValues(0, 0)
        , tmp10 = vec2.fromValues(0, 0)
        , tmp11 = vec2.fromValues(0, 0)
        , tmp12 = vec2.fromValues(0, 0)
        , tmp13 = vec2.fromValues(0, 0)
        , tmp14 = vec2.fromValues(0, 0)
        , tmp15 = vec2.fromValues(0, 0)
        , tmp16 = vec2.fromValues(0, 0)
        , tmp17 = vec2.fromValues(0, 0)
        , tmp18 = vec2.fromValues(0, 0)
        , tmpArray = [];

    /**
     * Narrowphase. Creates contacts and friction given shapes and transforms.
     * @class Narrowphase
     * @constructor
     */
    function Narrowphase() {

    /**
     * @property contactEquations
     * @type {Array}
     */
    this.contactEquations = [];

      /**
       * @property frictionEquations
       * @type {Array}
       */
      this.frictionEquations = [];

      /**
       * Whether to make friction equations in the upcoming contacts.
       * @property enableFriction
       * @type {Boolean}
       */
      this.enableFriction = true;

      /**
       * Whether to make equations enabled in upcoming contacts.
       * @property enabledEquations
       * @type {Boolean}
       */
      this.enabledEquations = true;

      /**
       * The friction slip force to use when creating friction equations.
       * @property slipForce
       * @type {Number}
       */
      this.slipForce = 10.0;

      /**
       * The friction value to use in the upcoming friction equations.
       * @property frictionCoefficient
       * @type {Number}
       */
      this.frictionCoefficient = 0.3;

      /**
       * Will be the .relativeVelocity in each produced FrictionEquation.
       * @property {Number} surfaceVelocity
       */
      this.surfaceVelocity = 0;

      /**
       * Keeps track of the allocated ContactEquations.
       * @property {ContactEquationPool} contactEquationPool
       *
       * @example
       *
       *     // Allocate a few equations before starting the simulation.
       *     // This way, no contact objects need to be created on the fly in the game loop.
       *     world.narrowphase.contactEquationPool.resize(1024);
       *     world.narrowphase.frictionEquationPool.resize(1024);
       */
      this.contactEquationPool = new ContactEquationPool({size: 32});

      /**
       * Keeps track of the allocated ContactEquations.
       * @property {FrictionEquationPool} frictionEquationPool
       */
      this.frictionEquationPool = new FrictionEquationPool({size: 64});

      /**
       * The restitution value to use in the next contact equations.
       * @property restitution
       * @type {Number}
       */
      this.restitution = 0;

      /**
       * The stiffness value to use in the next contact equations.
       * @property {Number} stiffness
       */
      this.stiffness = Equation.DEFAULT_STIFFNESS;

      /**
       * The stiffness value to use in the next contact equations.
       * @property {Number} stiffness
       */
      this.relaxation = Equation.DEFAULT_RELAXATION;

      /**
       * The stiffness value to use in the next friction equations.
       * @property frictionStiffness
       * @type {Number}
       */
      this.frictionStiffness = Equation.DEFAULT_STIFFNESS;

      /**
       * The relaxation value to use in the next friction equations.
       * @property frictionRelaxation
       * @type {Number}
       */
      this.frictionRelaxation = Equation.DEFAULT_RELAXATION;

      /**
       * Enable reduction of friction equations. If disabled, a box on a plane will generate 2 contact equations and 2 friction equations. If enabled, there will be only one friction equation. Same kind of simplifications are made  for all collision types.
       * @property enableFrictionReduction
       * @type {Boolean}
       * @deprecated This flag will be removed when the feature is stable enough.
       * @default true
       */
      this.enableFrictionReduction = true;

      /**
       * Keeps track of the colliding bodies last step.
       * @private
       * @property collidingBodiesLastStep
       * @type {TupleDictionary}
       */
      this.collidingBodiesLastStep = new TupleDictionary();

    /**
     * Contact skin size value to use in the next contact equations.
     * @property {Number} contactSkinSize
     * @default 0.01
     */
    this.contactSkinSize = 0.01;
    }

    var bodiesOverlap_shapePositionA = vec2.create();
    var bodiesOverlap_shapePositionB = vec2.create();

    /**
     * @method bodiesOverlap
     * @param  {Body} bodyA
     * @param  {Body} bodyB
     * @return {Boolean}
     * @todo shape world transforms are wrong
     */
    Narrowphase.prototype.bodiesOverlap = function (bodyA, bodyB) {
      var shapePositionA = bodiesOverlap_shapePositionA;
      var shapePositionB = bodiesOverlap_shapePositionB;

      // Loop over all shapes of bodyA
      for (var k = 0, Nshapesi = bodyA.shapes.length; k !== Nshapesi; k++) {
        var shapeA = bodyA.shapes[k];

        bodyA.toWorldFrame(shapePositionA, shapeA.position);

        // All shapes of body j
        for (var l = 0, Nshapesj = bodyB.shapes.length; l !== Nshapesj; l++) {
          var shapeB = bodyB.shapes[l];

          bodyB.toWorldFrame(shapePositionB, shapeB.position);

          if (this[shapeA.type | shapeB.type](
                  bodyA,
                  shapeA,
                  shapePositionA,
                  shapeA.angle + bodyA.angle,
                  bodyB,
                  shapeB,
                  shapePositionB,
                  shapeB.angle + bodyB.angle,
                  true
              )) {
            return true;
            }
        }
      }

      return false;
    };

    /**
     * Check if the bodies were in contact since the last reset().
     * @method collidedLastStep
     * @param  {Body} bodyA
     * @param  {Body} bodyB
     * @return {Boolean}
     */
    Narrowphase.prototype.collidedLastStep = function (bodyA, bodyB) {
      var id1 = bodyA.id | 0,
          id2 = bodyB.id | 0;
      return !!this.collidingBodiesLastStep.get(id1, id2);
    };

    /**
     * Throws away the old equations and gets ready to create new
     * @method reset
     */
    Narrowphase.prototype.reset = function () {
      this.collidingBodiesLastStep.reset();

      var eqs = this.contactEquations;
      var l = eqs.length;
      while (l--) {
        var eq = eqs[l],
            id1 = eq.bodyA.id,
            id2 = eq.bodyB.id;
        this.collidingBodiesLastStep.set(id1, id2, true);
      }

      var ce = this.contactEquations,
          fe = this.frictionEquations;
      for (var i = 0; i < ce.length; i++) {
        this.contactEquationPool.release(ce[i]);
      }
      for (var i = 0; i < fe.length; i++) {
        this.frictionEquationPool.release(fe[i]);
      }

      // Reset
      this.contactEquations.length = this.frictionEquations.length = 0;
    };

    /**
     * Creates a ContactEquation, either by reusing an existing object or creating a new one.
     * @method createContactEquation
     * @param  {Body} bodyA
     * @param  {Body} bodyB
     * @return {ContactEquation}
     */
    Narrowphase.prototype.createContactEquation = function (bodyA, bodyB, shapeA, shapeB) {
      var c = this.contactEquationPool.get();
      c.bodyA = bodyA;
      c.bodyB = bodyB;
      c.shapeA = shapeA;
      c.shapeB = shapeB;
      c.restitution = this.restitution;
      c.firstImpact = !this.collidedLastStep(bodyA, bodyB);
      c.stiffness = this.stiffness;
      c.relaxation = this.relaxation;
      c.needsUpdate = true;
      c.enabled = this.enabledEquations;
      c.offset = this.contactSkinSize;

      return c;
    };

    /**
     * Creates a FrictionEquation, either by reusing an existing object or creating a new one.
     * @method createFrictionEquation
     * @param  {Body} bodyA
     * @param  {Body} bodyB
     * @return {FrictionEquation}
     */
    Narrowphase.prototype.createFrictionEquation = function (bodyA, bodyB, shapeA, shapeB) {
      var c = this.frictionEquationPool.get();
      c.bodyA = bodyA;
      c.bodyB = bodyB;
      c.shapeA = shapeA;
      c.shapeB = shapeB;
      c.setSlipForce(this.slipForce);
      c.frictionCoefficient = this.frictionCoefficient;
      c.relativeVelocity = this.surfaceVelocity;
      c.enabled = this.enabledEquations;
      c.needsUpdate = true;
      c.stiffness = this.frictionStiffness;
      c.relaxation = this.frictionRelaxation;
      c.contactEquations.length = 0;
      return c;
    };

    /**
     * Creates a FrictionEquation given the data in the ContactEquation. Uses same offset vectors ri and rj, but the tangent vector will be constructed from the collision normal.
     * @method createFrictionFromContact
     * @param  {ContactEquation} contactEquation
     * @return {FrictionEquation}
     */
    Narrowphase.prototype.createFrictionFromContact = function (c) {
      var eq = this.createFrictionEquation(c.bodyA, c.bodyB, c.shapeA, c.shapeB);
      vec2.copy(eq.contactPointA, c.contactPointA);
      vec2.copy(eq.contactPointB, c.contactPointB);
      vec2.rotate90cw(eq.t, c.normalA);
      eq.contactEquations.push(c);
      return eq;
    };

// Take the average N latest contact point on the plane.
    Narrowphase.prototype.createFrictionFromAverage = function (numContacts) {
      var c = this.contactEquations[this.contactEquations.length - 1];
      var eq = this.createFrictionEquation(c.bodyA, c.bodyB, c.shapeA, c.shapeB);
      var bodyA = c.bodyA;
      var bodyB = c.bodyB;
      vec2.set(eq.contactPointA, 0, 0);
      vec2.set(eq.contactPointB, 0, 0);
      vec2.set(eq.t, 0, 0);
      for (var i = 0; i !== numContacts; i++) {
        c = this.contactEquations[this.contactEquations.length - 1 - i];
        if (c.bodyA === bodyA) {
          vec2.add(eq.t, eq.t, c.normalA);
          vec2.add(eq.contactPointA, eq.contactPointA, c.contactPointA);
          vec2.add(eq.contactPointB, eq.contactPointB, c.contactPointB);
        } else {
          vec2.sub(eq.t, eq.t, c.normalA);
          vec2.add(eq.contactPointA, eq.contactPointA, c.contactPointB);
          vec2.add(eq.contactPointB, eq.contactPointB, c.contactPointA);
        }
        eq.contactEquations.push(c);
      }

      var invNumContacts = 1 / numContacts;
      vec2.scale(eq.contactPointA, eq.contactPointA, invNumContacts);
      vec2.scale(eq.contactPointB, eq.contactPointB, invNumContacts);
      vec2.normalize(eq.t, eq.t);
      vec2.rotate90cw(eq.t, eq.t);
      return eq;
    };

    /**
     * Convex/line narrowphase
     * @method convexLine
     * @param  {Body}       convexBody
     * @param  {Convex}     convexShape
     * @param  {Array}      convexOffset
     * @param  {Number}     convexAngle
     * @param  {Body}       lineBody
     * @param  {Line}       lineShape
     * @param  {Array}      lineOffset
     * @param  {Number}     lineAngle
     * @param {boolean}     justTest
     * @todo Implement me!
     */
    Narrowphase.prototype[Shape.LINE | Shape.CONVEX] =
        Narrowphase.prototype.convexLine = function (convexBody,
                                                     convexShape,
                                                     convexOffset,
                                                     convexAngle,
                                                     lineBody,
                                                     lineShape,
                                                     lineOffset,
                                                     lineAngle,
                                                     justTest) {
          // TODO
          if (justTest) {
            return false;
          } else {
            return 0;
    }
        };

    /**
     * Line/box narrowphase
     * @method lineBox
     * @param  {Body}       lineBody
     * @param  {Line}       lineShape
     * @param  {Array}      lineOffset
     * @param  {Number}     lineAngle
     * @param  {Body}       boxBody
     * @param  {Box}  boxShape
     * @param  {Array}      boxOffset
     * @param  {Number}     boxAngle
     * @param  {Boolean}    justTest
     * @todo Implement me!
     */
    Narrowphase.prototype[Shape.LINE | Shape.BOX] =
        Narrowphase.prototype.lineBox = function (lineBody,
                                                  lineShape,
                                                  lineOffset,
                                                  lineAngle,
                                                  boxBody,
                                                  boxShape,
                                                  boxOffset,
                                                  boxAngle,
                                                  justTest) {
          // TODO
          if (justTest) {
            return false;
          } else {
            return 0;
    }
        };

    function setConvexToCapsuleShapeMiddle(convexShape, capsuleShape) {
      vec2.set(convexShape.vertices[0], -capsuleShape.length * 0.5, -capsuleShape.radius);
      vec2.set(convexShape.vertices[1], capsuleShape.length * 0.5, -capsuleShape.radius);
      vec2.set(convexShape.vertices[2], capsuleShape.length * 0.5, capsuleShape.radius);
      vec2.set(convexShape.vertices[3], -capsuleShape.length * 0.5, capsuleShape.radius);
    }

    var convexCapsule_tempRect = new Box({width: 1, height: 1}),
        convexCapsule_tempVec = vec2.create();

    /**
     * Convex/capsule narrowphase
     * @method convexCapsule
     * @param  {Body}       convexBody
     * @param  {Convex}     convexShape
     * @param  {Array}      convexPosition
     * @param  {Number}     convexAngle
     * @param  {Body}       capsuleBody
     * @param  {Capsule}    capsuleShape
     * @param  {Array}      capsulePosition
     * @param  {Number}     capsuleAngle
     */
    Narrowphase.prototype[Shape.CAPSULE | Shape.CONVEX] =
        Narrowphase.prototype[Shape.CAPSULE | Shape.BOX] =
            Narrowphase.prototype.convexCapsule = function (convexBody,
                                                            convexShape,
                                                            convexPosition,
                                                            convexAngle,
                                                            capsuleBody,
                                                            capsuleShape,
                                                            capsulePosition,
                                                            capsuleAngle,
                                                            justTest) {

              // Check the circles
              // Add offsets!
              var circlePos = convexCapsule_tempVec;
              vec2.set(circlePos, capsuleShape.length / 2, 0);
              vec2.rotate(circlePos, circlePos, capsuleAngle);
              vec2.add(circlePos, circlePos, capsulePosition);
              var result1 = this.circleConvex(capsuleBody, capsuleShape, circlePos, capsuleAngle, convexBody, convexShape, convexPosition, convexAngle, justTest, capsuleShape.radius);

              vec2.set(circlePos, -capsuleShape.length / 2, 0);
              vec2.rotate(circlePos, circlePos, capsuleAngle);
              vec2.add(circlePos, circlePos, capsulePosition);
              var result2 = this.circleConvex(capsuleBody, capsuleShape, circlePos, capsuleAngle, convexBody, convexShape, convexPosition, convexAngle, justTest, capsuleShape.radius);

              if (justTest && (result1 || result2)) {
                return true;
              }

              // Check center rect
              var r = convexCapsule_tempRect;
              setConvexToCapsuleShapeMiddle(r, capsuleShape);
              var result = this.convexConvex(convexBody, convexShape, convexPosition, convexAngle, capsuleBody, r, capsulePosition, capsuleAngle, justTest);

              return result + result1 + result2;
            };

    /**
     * Capsule/line narrowphase
     * @method lineCapsule
     * @param  {Body}       lineBody
     * @param  {Line}       lineShape
     * @param  {Array}      linePosition
     * @param  {Number}     lineAngle
     * @param  {Body}       capsuleBody
     * @param  {Capsule}    capsuleShape
     * @param  {Array}      capsulePosition
     * @param  {Number}     capsuleAngle
     * @todo Implement me!
     */
    Narrowphase.prototype[Shape.CAPSULE | Shape.LINE] =
        Narrowphase.prototype.lineCapsule = function (lineBody,
                                                      lineShape,
                                                      linePosition,
                                                      lineAngle,
                                                      capsuleBody,
                                                      capsuleShape,
                                                      capsulePosition,
                                                      capsuleAngle,
                                                      justTest) {
          // TODO
          if (justTest) {
            return false;
          } else {
            return 0;
          }
        };

    var capsuleCapsule_tempVec1 = vec2.create();
    var capsuleCapsule_tempVec2 = vec2.create();
    var capsuleCapsule_tempRect1 = new Box({width: 1, height: 1});

    /**
     * Capsule/capsule narrowphase
     * @method capsuleCapsule
     * @param  {Body}       bi
     * @param  {Capsule}    si
     * @param  {Array}      xi
     * @param  {Number}     ai
     * @param  {Body}       bj
     * @param  {Capsule}    sj
     * @param  {Array}      xj
     * @param  {Number}     aj
     */
    Narrowphase.prototype[Shape.CAPSULE | Shape.CAPSULE] =
        Narrowphase.prototype.capsuleCapsule = function (bi, si, xi, ai, bj, sj, xj, aj, justTest) {

          var enableFrictionBefore;

          // Check the circles
          // Add offsets!
          var circlePosi = capsuleCapsule_tempVec1,
              circlePosj = capsuleCapsule_tempVec2;

          var numContacts = 0;


          // Need 4 circle checks, between all
          for (var i = 0; i < 2; i++) {

            vec2.set(circlePosi, (i === 0 ? -1 : 1) * si.length / 2, 0);
            vec2.rotate(circlePosi, circlePosi, ai);
            vec2.add(circlePosi, circlePosi, xi);

            for (var j = 0; j < 2; j++) {

              vec2.set(circlePosj, (j === 0 ? -1 : 1) * sj.length / 2, 0);
              vec2.rotate(circlePosj, circlePosj, aj);
              vec2.add(circlePosj, circlePosj, xj);

              // Temporarily turn off friction
              if (this.enableFrictionReduction) {
                enableFrictionBefore = this.enableFriction;
                this.enableFriction = false;
              }

              var result = this.circleCircle(bi, si, circlePosi, ai, bj, sj, circlePosj, aj, justTest, si.radius, sj.radius);

              if (this.enableFrictionReduction) {
                this.enableFriction = enableFrictionBefore;
              }

              if (justTest && result) {
                return true;
              }

              numContacts += result;
        }
          }

          if (this.enableFrictionReduction) {
            // Temporarily turn off friction
            enableFrictionBefore = this.enableFriction;
            this.enableFriction = false;
          }

          // Check circles against the center boxs
          var rect = capsuleCapsule_tempRect1;
          setConvexToCapsuleShapeMiddle(rect, si);
          var result1 = this.convexCapsule(bi, rect, xi, ai, bj, sj, xj, aj, justTest);

          if (this.enableFrictionReduction) {
            this.enableFriction = enableFrictionBefore;
          }

          if (justTest && result1) {
            return true;
          }
          numContacts += result1;

          if (this.enableFrictionReduction) {
            // Temporarily turn off friction
            var enableFrictionBefore = this.enableFriction;
            this.enableFriction = false;
          }

          setConvexToCapsuleShapeMiddle(rect, sj);
          var result2 = this.convexCapsule(bj, rect, xj, aj, bi, si, xi, ai, justTest);

          if (this.enableFrictionReduction) {
            this.enableFriction = enableFrictionBefore;
          }

          if (justTest && result2) {
            return true;
          }
          numContacts += result2;

          if (this.enableFrictionReduction) {
            if (numContacts && this.enableFriction) {
              this.frictionEquations.push(this.createFrictionFromAverage(numContacts));
        }
          }

          return numContacts;
        };

    /**
     * Line/line narrowphase
     * @method lineLine
     * @param  {Body}       bodyA
     * @param  {Line}       shapeA
     * @param  {Array}      positionA
     * @param  {Number}     angleA
     * @param  {Body}       bodyB
     * @param  {Line}       shapeB
     * @param  {Array}      positionB
     * @param  {Number}     angleB
     * @todo Implement me!
     */
    Narrowphase.prototype[Shape.LINE | Shape.LINE] =
        Narrowphase.prototype.lineLine = function (bodyA,
                                                   shapeA,
                                                   positionA,
                                                   angleA,
                                                   bodyB,
                                                   shapeB,
                                                   positionB,
                                                   angleB,
                                                   justTest) {
          // TODO
          if (justTest) {
            return false;
          } else {
            return 0;
          }
        };

    /**
     * Plane/line Narrowphase
     * @method planeLine
     * @param  {Body}   planeBody
     * @param  {Plane}  planeShape
     * @param  {Array}  planeOffset
     * @param  {Number} planeAngle
     * @param  {Body}   lineBody
     * @param  {Line}   lineShape
     * @param  {Array}  lineOffset
     * @param  {Number} lineAngle
     */
    Narrowphase.prototype[Shape.PLANE | Shape.LINE] =
        Narrowphase.prototype.planeLine = function (planeBody, planeShape, planeOffset, planeAngle,
                                                    lineBody, lineShape, lineOffset, lineAngle, justTest) {
          var worldVertex0 = tmp1,
              worldVertex1 = tmp2,
              worldVertex01 = tmp3,
              worldVertex11 = tmp4,
              worldEdge = tmp5,
              worldEdgeUnit = tmp6,
              dist = tmp7,
              worldNormal = tmp8,
              worldTangent = tmp9,
              verts = tmpArray,
              numContacts = 0;

          // Get start and end points
          vec2.set(worldVertex0, -lineShape.length / 2, 0);
          vec2.set(worldVertex1, lineShape.length / 2, 0);

          // Not sure why we have to use worldVertex*1 here, but it won't work otherwise. Tired.
          vec2.rotate(worldVertex01, worldVertex0, lineAngle);
          vec2.rotate(worldVertex11, worldVertex1, lineAngle);

          add(worldVertex01, worldVertex01, lineOffset);
          add(worldVertex11, worldVertex11, lineOffset);

          vec2.copy(worldVertex0, worldVertex01);
          vec2.copy(worldVertex1, worldVertex11);

          // Get vector along the line
          sub(worldEdge, worldVertex1, worldVertex0);
          vec2.normalize(worldEdgeUnit, worldEdge);

          // Get tangent to the edge.
          vec2.rotate90cw(worldTangent, worldEdgeUnit);

          vec2.rotate(worldNormal, yAxis, planeAngle);

          // Check line ends
          verts[0] = worldVertex0;
          verts[1] = worldVertex1;
          for (var i = 0; i < verts.length; i++) {
            var v = verts[i];

            sub(dist, v, planeOffset);

            var d = dot(dist, worldNormal);

            if (d < 0) {

              if (justTest) {
                return true;
            }

              var c = this.createContactEquation(planeBody, lineBody, planeShape, lineShape);
              numContacts++;

              vec2.copy(c.normalA, worldNormal);
              vec2.normalize(c.normalA, c.normalA);

              // distance vector along plane normal
              vec2.scale(dist, worldNormal, d);

              // Vector from plane center to contact
              sub(c.contactPointA, v, dist);
              sub(c.contactPointA, c.contactPointA, planeBody.position);

              // From line center to contact
              sub(c.contactPointB, v, lineOffset);
              add(c.contactPointB, c.contactPointB, lineOffset);
              sub(c.contactPointB, c.contactPointB, lineBody.position);

              this.contactEquations.push(c);

              if (!this.enableFrictionReduction) {
                if (this.enableFriction) {
                  this.frictionEquations.push(this.createFrictionFromContact(c));
                }
            }
            }
          }

          if (justTest) {
            return false;
          }

          if (!this.enableFrictionReduction) {
            if (numContacts && this.enableFriction) {
              this.frictionEquations.push(this.createFrictionFromAverage(numContacts));
        }
          }

          return numContacts;
        };

    Narrowphase.prototype[Shape.PARTICLE | Shape.CAPSULE] =
        Narrowphase.prototype.particleCapsule = function (particleBody,
                                                          particleShape,
                                                          particlePosition,
                                                          particleAngle,
                                                          capsuleBody,
                                                          capsuleShape,
                                                          capsulePosition,
                                                          capsuleAngle,
                                                          justTest) {
          return this.circleLine(particleBody, particleShape, particlePosition, particleAngle, capsuleBody, capsuleShape, capsulePosition, capsuleAngle, justTest, capsuleShape.radius, 0);
        };

    /**
     * Circle/line Narrowphase
     * @method circleLine
     * @param  {Body} circleBody
     * @param  {Circle} circleShape
     * @param  {Array} circleOffset
     * @param  {Number} circleAngle
     * @param  {Body} lineBody
     * @param  {Line} lineShape
     * @param  {Array} lineOffset
     * @param  {Number} lineAngle
     * @param {Boolean} justTest If set to true, this function will return the result (intersection or not) without adding equations.
     * @param {Number} lineRadius Radius to add to the line. Can be used to test Capsules.
     * @param {Number} circleRadius If set, this value overrides the circle shape radius.
     */
    Narrowphase.prototype[Shape.CIRCLE | Shape.LINE] =
        Narrowphase.prototype.circleLine = function (circleBody,
                                                     circleShape,
                                                     circleOffset,
                                                     circleAngle,
                                                     lineBody,
                                                     lineShape,
                                                     lineOffset,
                                                     lineAngle,
                                                     justTest,
                                                     lineRadius,
                                                     circleRadius) {
          var lineRadius = lineRadius || 0,
              circleRadius = typeof(circleRadius) !== "undefined" ? circleRadius : circleShape.radius,

              orthoDist = tmp1,
              lineToCircleOrthoUnit = tmp2,
              projectedPoint = tmp3,
              centerDist = tmp4,
              worldTangent = tmp5,
              worldEdge = tmp6,
              worldEdgeUnit = tmp7,
              worldVertex0 = tmp8,
              worldVertex1 = tmp9,
              worldVertex01 = tmp10,
              worldVertex11 = tmp11,
              dist = tmp12,
              lineToCircle = tmp13,
              lineEndToLineRadius = tmp14,

              verts = tmpArray;

          // Get start and end points
          vec2.set(worldVertex0, -lineShape.length / 2, 0);
          vec2.set(worldVertex1, lineShape.length / 2, 0);

          // Not sure why we have to use worldVertex*1 here, but it won't work otherwise. Tired.
          vec2.rotate(worldVertex01, worldVertex0, lineAngle);
          vec2.rotate(worldVertex11, worldVertex1, lineAngle);

          add(worldVertex01, worldVertex01, lineOffset);
          add(worldVertex11, worldVertex11, lineOffset);

          vec2.copy(worldVertex0, worldVertex01);
          vec2.copy(worldVertex1, worldVertex11);

          // Get vector along the line
          sub(worldEdge, worldVertex1, worldVertex0);
          vec2.normalize(worldEdgeUnit, worldEdge);

          // Get tangent to the edge.
          vec2.rotate90cw(worldTangent, worldEdgeUnit);

          // Check distance from the plane spanned by the edge vs the circle
          sub(dist, circleOffset, worldVertex0);
          var d = dot(dist, worldTangent); // Distance from center of line to circle center
          sub(centerDist, worldVertex0, lineOffset);

          sub(lineToCircle, circleOffset, lineOffset);

          var radiusSum = circleRadius + lineRadius;

          if (Math.abs(d) < radiusSum) {

            // Now project the circle onto the edge
            vec2.scale(orthoDist, worldTangent, d);
            sub(projectedPoint, circleOffset, orthoDist);

            // Add the missing line radius
            vec2.scale(lineToCircleOrthoUnit, worldTangent, dot(worldTangent, lineToCircle));
            vec2.normalize(lineToCircleOrthoUnit, lineToCircleOrthoUnit);
            vec2.scale(lineToCircleOrthoUnit, lineToCircleOrthoUnit, lineRadius);
            add(projectedPoint, projectedPoint, lineToCircleOrthoUnit);

            // Check if the point is within the edge span
            var pos = dot(worldEdgeUnit, projectedPoint);
            var pos0 = dot(worldEdgeUnit, worldVertex0);
            var pos1 = dot(worldEdgeUnit, worldVertex1);

            if (pos > pos0 && pos < pos1) {
              // We got contact!

              if (justTest) {
                return true;
            }

              var c = this.createContactEquation(circleBody, lineBody, circleShape, lineShape);

              vec2.scale(c.normalA, orthoDist, -1);
              vec2.normalize(c.normalA, c.normalA);

              vec2.scale(c.contactPointA, c.normalA, circleRadius);
              add(c.contactPointA, c.contactPointA, circleOffset);
              sub(c.contactPointA, c.contactPointA, circleBody.position);

              sub(c.contactPointB, projectedPoint, lineOffset);
              add(c.contactPointB, c.contactPointB, lineOffset);
              sub(c.contactPointB, c.contactPointB, lineBody.position);

              this.contactEquations.push(c);

              if (this.enableFriction) {
                this.frictionEquations.push(this.createFrictionFromContact(c));
              }

              return 1;
        }
          }

          // Add corner
          verts[0] = worldVertex0;
          verts[1] = worldVertex1;

          for (var i = 0; i < verts.length; i++) {
            var v = verts[i];

            sub(dist, v, circleOffset);

            if (vec2.squaredLength(dist) < Math.pow(radiusSum, 2)) {

              if (justTest) {
                return true;
              }

              var c = this.createContactEquation(circleBody, lineBody, circleShape, lineShape);

              vec2.copy(c.normalA, dist);
              vec2.normalize(c.normalA, c.normalA);

              // Vector from circle to contact point is the normal times the circle radius
              vec2.scale(c.contactPointA, c.normalA, circleRadius);
              add(c.contactPointA, c.contactPointA, circleOffset);
              sub(c.contactPointA, c.contactPointA, circleBody.position);

              sub(c.contactPointB, v, lineOffset);
              vec2.scale(lineEndToLineRadius, c.normalA, -lineRadius);
              add(c.contactPointB, c.contactPointB, lineEndToLineRadius);
              add(c.contactPointB, c.contactPointB, lineOffset);
              sub(c.contactPointB, c.contactPointB, lineBody.position);

              this.contactEquations.push(c);

              if (this.enableFriction) {
                this.frictionEquations.push(this.createFrictionFromContact(c));
            }

              return 1;
        }
          }

          return 0;
        };

    /**
     * Circle/capsule Narrowphase
     * @method circleCapsule
     * @param  {Body}   bi
     * @param  {Circle} si
     * @param  {Array}  xi
     * @param  {Number} ai
     * @param  {Body}   bj
     * @param  {Line}   sj
     * @param  {Array}  xj
     * @param  {Number} aj
     */
    Narrowphase.prototype[Shape.CIRCLE | Shape.CAPSULE] =
        Narrowphase.prototype.circleCapsule = function (bi, si, xi, ai, bj, sj, xj, aj, justTest) {
          return this.circleLine(bi, si, xi, ai, bj, sj, xj, aj, justTest, sj.radius);
        };

    /**
     * Circle/convex Narrowphase.
     * @method circleConvex
     * @param  {Body} circleBody
     * @param  {Circle} circleShape
     * @param  {Array} circleOffset
     * @param  {Number} circleAngle
     * @param  {Body} convexBody
     * @param  {Convex} convexShape
     * @param  {Array} convexOffset
     * @param  {Number} convexAngle
     * @param  {Boolean} justTest
     * @param  {Number} circleRadius
     */
    Narrowphase.prototype[Shape.CIRCLE | Shape.CONVEX] =
        Narrowphase.prototype[Shape.CIRCLE | Shape.BOX] =
            Narrowphase.prototype.circleConvex = function (circleBody,
                                                           circleShape,
                                                           circleOffset,
                                                           circleAngle,
                                                           convexBody,
                                                           convexShape,
                                                           convexOffset,
                                                           convexAngle,
                                                           justTest,
                                                           circleRadius) {
              var circleRadius = typeof(circleRadius) === "number" ? circleRadius : circleShape.radius;

              var worldVertex0 = tmp1,
                  worldVertex1 = tmp2,
                  worldEdge = tmp3,
                  worldEdgeUnit = tmp4,
                  worldNormal = tmp5,
                  centerDist = tmp6,
                  convexToCircle = tmp7,
                  orthoDist = tmp8,
                  projectedPoint = tmp9,
                  dist = tmp10,
                  worldVertex = tmp11,

                  closestEdge = -1,
                  closestEdgeDistance = null,
                  closestEdgeOrthoDist = tmp12,
                  closestEdgeProjectedPoint = tmp13,
                  candidate = tmp14,
                  candidateDist = tmp15,
                  minCandidate = tmp16,

                  found = false,
                  minCandidateDistance = Number.MAX_VALUE;

              var numReported = 0;

              // New algorithm:
              // 1. Check so center of circle is not inside the polygon. If it is, this wont work...
              // 2. For each edge
              // 2. 1. Get point on circle that is closest to the edge (scale normal with -radius)
              // 2. 2. Check if point is inside.

              var verts = convexShape.vertices;

              // Check all edges first
              for (var i = 0; i !== verts.length + 1; i++) {
                var v0 = verts[i % verts.length],
                    v1 = verts[(i + 1) % verts.length];

                vec2.rotate(worldVertex0, v0, convexAngle);
                vec2.rotate(worldVertex1, v1, convexAngle);
                add(worldVertex0, worldVertex0, convexOffset);
                add(worldVertex1, worldVertex1, convexOffset);
                sub(worldEdge, worldVertex1, worldVertex0);

                vec2.normalize(worldEdgeUnit, worldEdge);

                // Get tangent to the edge. Points out of the Convex
                vec2.rotate90cw(worldNormal, worldEdgeUnit);

                // Get point on circle, closest to the polygon
                vec2.scale(candidate, worldNormal, -circleShape.radius);
                add(candidate, candidate, circleOffset);

                if (pointInConvex(candidate, convexShape, convexOffset, convexAngle)) {

                  vec2.sub(candidateDist, worldVertex0, candidate);
                  var candidateDistance = Math.abs(vec2.dot(candidateDist, worldNormal));

                  if (candidateDistance < minCandidateDistance) {
                    vec2.copy(minCandidate, candidate);
                    minCandidateDistance = candidateDistance;
                    vec2.scale(closestEdgeProjectedPoint, worldNormal, candidateDistance);
                    vec2.add(closestEdgeProjectedPoint, closestEdgeProjectedPoint, candidate);
                    found = true;
            }
        }
              }

              if (found) {

                if (justTest) {
            return true;
        }

                var c = this.createContactEquation(circleBody, convexBody, circleShape, convexShape);
                vec2.sub(c.normalA, minCandidate, circleOffset);
                vec2.normalize(c.normalA, c.normalA);

                vec2.scale(c.contactPointA, c.normalA, circleRadius);
                add(c.contactPointA, c.contactPointA, circleOffset);
                sub(c.contactPointA, c.contactPointA, circleBody.position);

                sub(c.contactPointB, closestEdgeProjectedPoint, convexOffset);
                add(c.contactPointB, c.contactPointB, convexOffset);
                sub(c.contactPointB, c.contactPointB, convexBody.position);

                this.contactEquations.push(c);

                if (this.enableFriction) {
                  this.frictionEquations.push(this.createFrictionFromContact(c));
        }

                return 1;
              }

              // Check all vertices
              if (circleRadius > 0) {
                for (var i = 0; i < verts.length; i++) {
                  var localVertex = verts[i];
                  vec2.rotate(worldVertex, localVertex, convexAngle);
                  add(worldVertex, worldVertex, convexOffset);

                  sub(dist, worldVertex, circleOffset);
                  if (vec2.squaredLength(dist) < Math.pow(circleRadius, 2)) {

                    if (justTest) {
                    return true;
                }

                    var c = this.createContactEquation(circleBody, convexBody, circleShape, convexShape);

                vec2.copy(c.normalA, dist);
                    vec2.normalize(c.normalA, c.normalA);

                // Vector from circle to contact point is the normal times the circle radius
                    vec2.scale(c.contactPointA, c.normalA, circleRadius);
                add(c.contactPointA, c.contactPointA, circleOffset);
                sub(c.contactPointA, c.contactPointA, circleBody.position);

                    sub(c.contactPointB, worldVertex, convexOffset);
                    add(c.contactPointB, c.contactPointB, convexOffset);
                    sub(c.contactPointB, c.contactPointB, convexBody.position);

                this.contactEquations.push(c);

                    if (this.enableFriction) {
                    this.frictionEquations.push(this.createFrictionFromContact(c));
                }

                return 1;
                  }
                }
              }

              return 0;
            };

    var pic_worldVertex0 = vec2.create(),
        pic_worldVertex1 = vec2.create(),
        pic_r0 = vec2.create(),
        pic_r1 = vec2.create();

    /*
     * Check if a point is in a polygon
     */
    function pointInConvex(worldPoint, convexShape, convexOffset, convexAngle) {
      var worldVertex0 = pic_worldVertex0,
          worldVertex1 = pic_worldVertex1,
          r0 = pic_r0,
          r1 = pic_r1,
          point = worldPoint,
          verts = convexShape.vertices,
          lastCross = null;
      for (var i = 0; i !== verts.length + 1; i++) {
        var v0 = verts[i % verts.length],
            v1 = verts[(i + 1) % verts.length];

        // Transform vertices to world
        // @todo The point should be transformed to local coordinates in the convex, no need to transform each vertex
        vec2.rotate(worldVertex0, v0, convexAngle);
        vec2.rotate(worldVertex1, v1, convexAngle);
        add(worldVertex0, worldVertex0, convexOffset);
        add(worldVertex1, worldVertex1, convexOffset);

        sub(r0, worldVertex0, point);
        sub(r1, worldVertex1, point);
        var cross = vec2.crossLength(r0, r1);

        if (lastCross === null) {
          lastCross = cross;
        }

        // If we got a different sign of the distance vector, the point is out of the polygon
        if (cross * lastCross <= 0) {
          return false;
        }
        lastCross = cross;
    }
      return true;
    }

    /**
     * Particle/convex Narrowphase
     * @method particleConvex
     * @param  {Body} particleBody
     * @param  {Particle} particleShape
     * @param  {Array} particleOffset
     * @param  {Number} particleAngle
     * @param  {Body} convexBody
     * @param  {Convex} convexShape
     * @param  {Array} convexOffset
     * @param  {Number} convexAngle
     * @param {Boolean} justTest
     * @todo use pointInConvex and code more similar to circleConvex
     * @todo don't transform each vertex, but transform the particle position to convex-local instead
     */
    Narrowphase.prototype[Shape.PARTICLE | Shape.CONVEX] =
        Narrowphase.prototype[Shape.PARTICLE | Shape.BOX] =
            Narrowphase.prototype.particleConvex = function (particleBody,
                                                             particleShape,
                                                             particleOffset,
                                                             particleAngle,
                                                             convexBody,
                                                             convexShape,
                                                             convexOffset,
                                                             convexAngle,
                                                             justTest) {
              var worldVertex0 = tmp1,
                  worldVertex1 = tmp2,
                  worldEdge = tmp3,
                  worldEdgeUnit = tmp4,
                  worldTangent = tmp5,
                  centerDist = tmp6,
                  convexToparticle = tmp7,
                  orthoDist = tmp8,
                  projectedPoint = tmp9,
                  dist = tmp10,
                  worldVertex = tmp11,
                  closestEdge = -1,
                  closestEdgeDistance = null,
                  closestEdgeOrthoDist = tmp12,
                  closestEdgeProjectedPoint = tmp13,
                  r0 = tmp14, // vector from particle to vertex0
                  r1 = tmp15,
                  localPoint = tmp16,
                  candidateDist = tmp17,
                  minEdgeNormal = tmp18,
                  minCandidateDistance = Number.MAX_VALUE;

              var numReported = 0,
                  found = false,
                  verts = convexShape.vertices;

              // Check if the particle is in the polygon at all
              if (!pointInConvex(particleOffset, convexShape, convexOffset, convexAngle)) {
                return 0;
              }

              if (justTest) {
                return true;
              }

              // Check edges first
              var lastCross = null;
              for (var i = 0; i !== verts.length + 1; i++) {
                var v0 = verts[i % verts.length],
                    v1 = verts[(i + 1) % verts.length];

                // Transform vertices to world
                vec2.rotate(worldVertex0, v0, convexAngle);
                vec2.rotate(worldVertex1, v1, convexAngle);
                add(worldVertex0, worldVertex0, convexOffset);
                add(worldVertex1, worldVertex1, convexOffset);

                // Get world edge
                sub(worldEdge, worldVertex1, worldVertex0);
                vec2.normalize(worldEdgeUnit, worldEdge);

                // Get tangent to the edge. Points out of the Convex
                vec2.rotate90cw(worldTangent, worldEdgeUnit);

                // Check distance from the infinite line (spanned by the edge) to the particle
                sub(dist, particleOffset, worldVertex0);
                var d = dot(dist, worldTangent);
                sub(centerDist, worldVertex0, convexOffset);

                sub(convexToparticle, particleOffset, convexOffset);

                vec2.sub(candidateDist, worldVertex0, particleOffset);
                var candidateDistance = Math.abs(vec2.dot(candidateDist, worldTangent));

                if (candidateDistance < minCandidateDistance) {
                  minCandidateDistance = candidateDistance;
                  vec2.scale(closestEdgeProjectedPoint, worldTangent, candidateDistance);
                  vec2.add(closestEdgeProjectedPoint, closestEdgeProjectedPoint, particleOffset);
                  vec2.copy(minEdgeNormal, worldTangent);
                  found = true;
                }
              }

              if (found) {
                var c = this.createContactEquation(particleBody, convexBody, particleShape, convexShape);

                vec2.scale(c.normalA, minEdgeNormal, -1);
                vec2.normalize(c.normalA, c.normalA);

                // Particle has no extent to the contact point
                vec2.set(c.contactPointA, 0, 0);
                add(c.contactPointA, c.contactPointA, particleOffset);
                sub(c.contactPointA, c.contactPointA, particleBody.position);

                // From convex center to point
                sub(c.contactPointB, closestEdgeProjectedPoint, convexOffset);
                add(c.contactPointB, c.contactPointB, convexOffset);
                sub(c.contactPointB, c.contactPointB, convexBody.position);

                this.contactEquations.push(c);

                if (this.enableFriction) {
                  this.frictionEquations.push(this.createFrictionFromContact(c));
                }

                return 1;
              }


              return 0;
            };

    /**
     * Circle/circle Narrowphase
     * @method circleCircle
     * @param  {Body} bodyA
     * @param  {Circle} shapeA
     * @param  {Array} offsetA
     * @param  {Number} angleA
     * @param  {Body} bodyB
     * @param  {Circle} shapeB
     * @param  {Array} offsetB
     * @param  {Number} angleB
     * @param {Boolean} justTest
     * @param {Number} [radiusA] Optional radius to use for shapeA
     * @param {Number} [radiusB] Optional radius to use for shapeB
     */
    Narrowphase.prototype[Shape.CIRCLE] =
        Narrowphase.prototype.circleCircle = function (bodyA,
                                                       shapeA,
                                                       offsetA,
                                                       angleA,
                                                       bodyB,
                                                       shapeB,
                                                       offsetB,
                                                       angleB,
                                                       justTest,
                                                       radiusA,
                                                       radiusB) {

          var dist = tmp1,
              radiusA = radiusA || shapeA.radius,
              radiusB = radiusB || shapeB.radius;

          sub(dist, offsetA, offsetB);
          var r = radiusA + radiusB;
          if (vec2.squaredLength(dist) > Math.pow(r, 2)) {
            return 0;
          }

          if (justTest) {
            return true;
          }

          var c = this.createContactEquation(bodyA, bodyB, shapeA, shapeB);
          sub(c.normalA, offsetB, offsetA);
          vec2.normalize(c.normalA, c.normalA);

          vec2.scale(c.contactPointA, c.normalA, radiusA);
          vec2.scale(c.contactPointB, c.normalA, -radiusB);

          add(c.contactPointA, c.contactPointA, offsetA);
          sub(c.contactPointA, c.contactPointA, bodyA.position);

          add(c.contactPointB, c.contactPointB, offsetB);
          sub(c.contactPointB, c.contactPointB, bodyB.position);

          this.contactEquations.push(c);

          if (this.enableFriction) {
            this.frictionEquations.push(this.createFrictionFromContact(c));
          }
          return 1;
        };

    /**
     * Plane/Convex Narrowphase
     * @method planeConvex
     * @param  {Body} planeBody
     * @param  {Plane} planeShape
     * @param  {Array} planeOffset
     * @param  {Number} planeAngle
     * @param  {Body} convexBody
     * @param  {Convex} convexShape
     * @param  {Array} convexOffset
     * @param  {Number} convexAngle
     * @param {Boolean} justTest
     */
    Narrowphase.prototype[Shape.PLANE | Shape.CONVEX] =
        Narrowphase.prototype[Shape.PLANE | Shape.BOX] =
            Narrowphase.prototype.planeConvex = function (planeBody,
                                                          planeShape,
                                                          planeOffset,
                                                          planeAngle,
                                                          convexBody,
                                                          convexShape,
                                                          convexOffset,
                                                          convexAngle,
                                                          justTest) {
              var worldVertex = tmp1,
                  worldNormal = tmp2,
                  dist = tmp3;

              var numReported = 0;
              vec2.rotate(worldNormal, yAxis, planeAngle);

              for (var i = 0; i !== convexShape.vertices.length; i++) {
                var v = convexShape.vertices[i];
                vec2.rotate(worldVertex, v, convexAngle);
                add(worldVertex, worldVertex, convexOffset);

                sub(dist, worldVertex, planeOffset);

                if (dot(dist, worldNormal) <= 0) {

                  if (justTest) {
                return true;
                  }

                  // Found vertex
                  numReported++;

                  var c = this.createContactEquation(planeBody, convexBody, planeShape, convexShape);

                  sub(dist, worldVertex, planeOffset);

                  vec2.copy(c.normalA, worldNormal);

                  var d = dot(dist, c.normalA);
                  vec2.scale(dist, c.normalA, d);

                  // rj is from convex center to contact
                  sub(c.contactPointB, worldVertex, convexBody.position);


                  // ri is from plane center to contact
                  sub(c.contactPointA, worldVertex, dist);
                  sub(c.contactPointA, c.contactPointA, planeBody.position);

                  this.contactEquations.push(c);

                  if (!this.enableFrictionReduction) {
                    if (this.enableFriction) {
                      this.frictionEquations.push(this.createFrictionFromContact(c));
                }
            }
                }
              }

              if (this.enableFrictionReduction) {
                if (this.enableFriction && numReported) {
                  this.frictionEquations.push(this.createFrictionFromAverage(numReported));
                }
              }

              return numReported;
            };

    /**
     * Narrowphase for particle vs plane
     * @method particlePlane
     * @param  {Body}       particleBody
     * @param  {Particle}   particleShape
     * @param  {Array}      particleOffset
     * @param  {Number}     particleAngle
     * @param  {Body}       planeBody
     * @param  {Plane}      planeShape
     * @param  {Array}      planeOffset
     * @param  {Number}     planeAngle
     * @param {Boolean}     justTest
     */
    Narrowphase.prototype[Shape.PARTICLE | Shape.PLANE] =
        Narrowphase.prototype.particlePlane = function (particleBody,
                                                        particleShape,
                                                        particleOffset,
                                                        particleAngle,
                                                        planeBody,
                                                        planeShape,
                                                        planeOffset,
                                                        planeAngle,
                                                        justTest) {
          var dist = tmp1,
              worldNormal = tmp2;

          planeAngle = planeAngle || 0;

          sub(dist, particleOffset, planeOffset);
          vec2.rotate(worldNormal, yAxis, planeAngle);

          var d = dot(dist, worldNormal);

          if (d > 0) {
            return 0;
          }
          if (justTest) {
            return true;
          }

          var c = this.createContactEquation(planeBody, particleBody, planeShape, particleShape);

          vec2.copy(c.normalA, worldNormal);
          vec2.scale(dist, c.normalA, d);
          // dist is now the distance vector in the normal direction

          // ri is the particle position projected down onto the plane, from the plane center
          sub(c.contactPointA, particleOffset, dist);
          sub(c.contactPointA, c.contactPointA, planeBody.position);

          // rj is from the body center to the particle center
          sub(c.contactPointB, particleOffset, particleBody.position);

          this.contactEquations.push(c);

          if (this.enableFriction) {
            this.frictionEquations.push(this.createFrictionFromContact(c));
          }
          return 1;
        };

    /**
     * Circle/Particle Narrowphase
     * @method circleParticle
     * @param  {Body} circleBody
     * @param  {Circle} circleShape
     * @param  {Array} circleOffset
     * @param  {Number} circleAngle
     * @param  {Body} particleBody
     * @param  {Particle} particleShape
     * @param  {Array} particleOffset
     * @param  {Number} particleAngle
     * @param  {Boolean} justTest
     */
    Narrowphase.prototype[Shape.CIRCLE | Shape.PARTICLE] =
        Narrowphase.prototype.circleParticle = function (circleBody,
                                                         circleShape,
                                                         circleOffset,
                                                         circleAngle,
                                                         particleBody,
                                                         particleShape,
                                                         particleOffset,
                                                         particleAngle,
                                                         justTest) {
          var dist = tmp1;

          sub(dist, particleOffset, circleOffset);
          if (vec2.squaredLength(dist) > Math.pow(circleShape.radius, 2)) {
            return 0;
          }
          if (justTest) {
            return true;
          }

          var c = this.createContactEquation(circleBody, particleBody, circleShape, particleShape);
          vec2.copy(c.normalA, dist);
          vec2.normalize(c.normalA, c.normalA);

          // Vector from circle to contact point is the normal times the circle radius
          vec2.scale(c.contactPointA, c.normalA, circleShape.radius);
          add(c.contactPointA, c.contactPointA, circleOffset);
          sub(c.contactPointA, c.contactPointA, circleBody.position);

          // Vector from particle center to contact point is zero
          sub(c.contactPointB, particleOffset, particleBody.position);

          this.contactEquations.push(c);

          if (this.enableFriction) {
            this.frictionEquations.push(this.createFrictionFromContact(c));
          }

          return 1;
        };

    var planeCapsule_tmpCircle = new Circle({radius: 1}),
        planeCapsule_tmp1 = vec2.create(),
        planeCapsule_tmp2 = vec2.create(),
        planeCapsule_tmp3 = vec2.create();

    /**
     * @method planeCapsule
     * @param  {Body} planeBody
     * @param  {Circle} planeShape
     * @param  {Array} planeOffset
     * @param  {Number} planeAngle
     * @param  {Body} capsuleBody
     * @param  {Particle} capsuleShape
     * @param  {Array} capsuleOffset
     * @param  {Number} capsuleAngle
     * @param {Boolean} justTest
     */
    Narrowphase.prototype[Shape.PLANE | Shape.CAPSULE] =
        Narrowphase.prototype.planeCapsule = function (planeBody,
                                                       planeShape,
                                                       planeOffset,
                                                       planeAngle,
                                                       capsuleBody,
                                                       capsuleShape,
                                                       capsuleOffset,
                                                       capsuleAngle,
                                                       justTest) {
          var end1 = planeCapsule_tmp1,
              end2 = planeCapsule_tmp2,
              circle = planeCapsule_tmpCircle,
              dst = planeCapsule_tmp3;

          // Compute world end positions
          vec2.set(end1, -capsuleShape.length / 2, 0);
          vec2.rotate(end1, end1, capsuleAngle);
          add(end1, end1, capsuleOffset);

          vec2.set(end2, capsuleShape.length / 2, 0);
          vec2.rotate(end2, end2, capsuleAngle);
          add(end2, end2, capsuleOffset);

          circle.radius = capsuleShape.radius;

          var enableFrictionBefore;

          // Temporarily turn off friction
          if (this.enableFrictionReduction) {
            enableFrictionBefore = this.enableFriction;
            this.enableFriction = false;
          }

          // Do Narrowphase as two circles
          var numContacts1 = this.circlePlane(capsuleBody, circle, end1, 0, planeBody, planeShape, planeOffset, planeAngle, justTest),
              numContacts2 = this.circlePlane(capsuleBody, circle, end2, 0, planeBody, planeShape, planeOffset, planeAngle, justTest);

          // Restore friction
          if (this.enableFrictionReduction) {
            this.enableFriction = enableFrictionBefore;
          }

          if (justTest) {
            return numContacts1 || numContacts2;
          } else {
            var numTotal = numContacts1 + numContacts2;
            if (this.enableFrictionReduction) {
              if (numTotal) {
                this.frictionEquations.push(this.createFrictionFromAverage(numTotal));
            }
            }
            return numTotal;
          }
        };

    /**
     * Creates ContactEquations and FrictionEquations for a collision.
     * @method circlePlane
     * @param  {Body}    bi     The first body that should be connected to the equations.
     * @param  {Circle}  si     The circle shape participating in the collision.
     * @param  {Array}   xi     Extra offset to take into account for the Shape, in addition to the one in circleBody.position. Will *not* be rotated by circleBody.angle (maybe it should, for sake of homogenity?). Set to null if none.
     * @param  {Body}    bj     The second body that should be connected to the equations.
     * @param  {Plane}   sj     The Plane shape that is participating
     * @param  {Array}   xj     Extra offset for the plane shape.
     * @param  {Number}  aj     Extra angle to apply to the plane
     */
    Narrowphase.prototype[Shape.CIRCLE | Shape.PLANE] =
        Narrowphase.prototype.circlePlane = function (bi, si, xi, ai, bj, sj, xj, aj, justTest) {
          var circleBody = bi,
              circleShape = si,
              circleOffset = xi, // Offset from body center, rotated!
              planeBody = bj,
              shapeB = sj,
              planeOffset = xj,
              planeAngle = aj;

          planeAngle = planeAngle || 0;

          // Vector from plane to circle
          var planeToCircle = tmp1,
              worldNormal = tmp2,
              temp = tmp3;

          sub(planeToCircle, circleOffset, planeOffset);

          // World plane normal
          vec2.rotate(worldNormal, yAxis, planeAngle);

          // Normal direction distance
          var d = dot(worldNormal, planeToCircle);

          if (d > circleShape.radius) {
            return 0; // No overlap. Abort.
          }

          if (justTest) {
            return true;
          }

          // Create contact
          var contact = this.createContactEquation(planeBody, circleBody, sj, si);

          // ni is the plane world normal
          vec2.copy(contact.normalA, worldNormal);

          // rj is the vector from circle center to the contact point
          vec2.scale(contact.contactPointB, contact.normalA, -circleShape.radius);
          add(contact.contactPointB, contact.contactPointB, circleOffset);
          sub(contact.contactPointB, contact.contactPointB, circleBody.position);

          // ri is the distance from plane center to contact.
          vec2.scale(temp, contact.normalA, d);
          sub(contact.contactPointA, planeToCircle, temp); // Subtract normal distance vector from the distance vector
          add(contact.contactPointA, contact.contactPointA, planeOffset);
          sub(contact.contactPointA, contact.contactPointA, planeBody.position);

          this.contactEquations.push(contact);

          if (this.enableFriction) {
            this.frictionEquations.push(this.createFrictionFromContact(contact));
          }

          return 1;
        };

    /**
     * Convex/convex Narrowphase.See <a href="http://www.altdevblogaday.com/2011/05/13/contact-generation-between-3d-convex-meshes/">this article</a> for more info.
     * @method convexConvex
     * @param  {Body} bi
     * @param  {Convex} si
     * @param  {Array} xi
     * @param  {Number} ai
     * @param  {Body} bj
     * @param  {Convex} sj
     * @param  {Array} xj
     * @param  {Number} aj
     */
    Narrowphase.prototype[Shape.CONVEX] =
        Narrowphase.prototype[Shape.CONVEX | Shape.BOX] =
            Narrowphase.prototype[Shape.BOX] =
                Narrowphase.prototype.convexConvex = function (bi, si, xi, ai, bj, sj, xj, aj, justTest, precision) {
                  var sepAxis = tmp1,
                      worldPoint = tmp2,
                      worldPoint0 = tmp3,
                      worldPoint1 = tmp4,
                      worldEdge = tmp5,
                      projected = tmp6,
                      penetrationVec = tmp7,
                      dist = tmp8,
                      worldNormal = tmp9,
                      numContacts = 0,
                      precision = typeof(precision) === 'number' ? precision : 0;

                  var found = Narrowphase.findSeparatingAxis(si, xi, ai, sj, xj, aj, sepAxis);
                  if (!found) {
                    return 0;
                  }

                  // Make sure the separating axis is directed from shape i to shape j
                  sub(dist, xj, xi);
                  if (dot(sepAxis, dist) > 0) {
                    vec2.scale(sepAxis, sepAxis, -1);
                  }

                  // Find edges with normals closest to the separating axis
                  var closestEdge1 = Narrowphase.getClosestEdge(si, ai, sepAxis, true), // Flipped axis
                      closestEdge2 = Narrowphase.getClosestEdge(sj, aj, sepAxis);

                  if (closestEdge1 === -1 || closestEdge2 === -1) {
                    return 0;
                  }

                  // Loop over the shapes
                  for (var k = 0; k < 2; k++) {

                    var closestEdgeA = closestEdge1,
                        closestEdgeB = closestEdge2,
                        shapeA = si, shapeB = sj,
                        offsetA = xi, offsetB = xj,
                        angleA = ai, angleB = aj,
                        bodyA = bi, bodyB = bj;

                    if (k === 0) {
                      // Swap!
                      var tmp;
                      tmp = closestEdgeA;
                      closestEdgeA = closestEdgeB;
                      closestEdgeB = tmp;

                      tmp = shapeA;
                      shapeA = shapeB;
                      shapeB = tmp;

                      tmp = offsetA;
                      offsetA = offsetB;
                      offsetB = tmp;

                      tmp = angleA;
                      angleA = angleB;
                      angleB = tmp;

                      tmp = bodyA;
                      bodyA = bodyB;
                      bodyB = tmp;
                    }

                    // Loop over 2 points in convex B
                    for (var j = closestEdgeB; j < closestEdgeB + 2; j++) {

                      // Get world point
                      var v = shapeB.vertices[(j + shapeB.vertices.length) % shapeB.vertices.length];
                      vec2.rotate(worldPoint, v, angleB);
                      add(worldPoint, worldPoint, offsetB);

                      var insideNumEdges = 0;

                      // Loop over the 3 closest edges in convex A
                      for (var i = closestEdgeA - 1; i < closestEdgeA + 2; i++) {

                        var v0 = shapeA.vertices[(i + shapeA.vertices.length) % shapeA.vertices.length],
                            v1 = shapeA.vertices[(i + 1 + shapeA.vertices.length) % shapeA.vertices.length];

                        // Construct the edge
                        vec2.rotate(worldPoint0, v0, angleA);
                        vec2.rotate(worldPoint1, v1, angleA);
                        add(worldPoint0, worldPoint0, offsetA);
                        add(worldPoint1, worldPoint1, offsetA);

                        sub(worldEdge, worldPoint1, worldPoint0);

                        vec2.rotate90cw(worldNormal, worldEdge); // Normal points out of convex 1
                        vec2.normalize(worldNormal, worldNormal);

                        sub(dist, worldPoint, worldPoint0);

                        var d = dot(worldNormal, dist);

                        if ((i === closestEdgeA && d <= precision) || (i !== closestEdgeA && d <= 0)) {
                          insideNumEdges++;
                }
                      }

                      if (insideNumEdges >= 3) {

                        if (justTest) {
                    return true;
                }

                        // worldPoint was on the "inside" side of each of the 3 checked edges.
                        // Project it to the center edge and use the projection direction as normal

                // Create contact
                        var c = this.createContactEquation(bodyA, bodyB, shapeA, shapeB);
                        numContacts++;

                        // Get center edge from body A
                        var v0 = shapeA.vertices[(closestEdgeA) % shapeA.vertices.length],
                            v1 = shapeA.vertices[(closestEdgeA + 1) % shapeA.vertices.length];

                        // Construct the edge
                        vec2.rotate(worldPoint0, v0, angleA);
                        vec2.rotate(worldPoint1, v1, angleA);
                        add(worldPoint0, worldPoint0, offsetA);
                        add(worldPoint1, worldPoint1, offsetA);

                        sub(worldEdge, worldPoint1, worldPoint0);

                        vec2.rotate90cw(c.normalA, worldEdge); // Normal points out of convex A
                        vec2.normalize(c.normalA, c.normalA);

                        sub(dist, worldPoint, worldPoint0); // From edge point to the penetrating point
                        var d = dot(c.normalA, dist);             // Penetration
                        vec2.scale(penetrationVec, c.normalA, d);     // Vector penetration

                        sub(c.contactPointA, worldPoint, offsetA);
                        sub(c.contactPointA, c.contactPointA, penetrationVec);
                        add(c.contactPointA, c.contactPointA, offsetA);
                        sub(c.contactPointA, c.contactPointA, bodyA.position);

                        sub(c.contactPointB, worldPoint, offsetB);
                        add(c.contactPointB, c.contactPointB, offsetB);
                        sub(c.contactPointB, c.contactPointB, bodyB.position);

                        this.contactEquations.push(c);

                        // Todo reduce to 1 friction equation if we have 2 contact points
                        if (!this.enableFrictionReduction) {
                          if (this.enableFriction) {
                            this.frictionEquations.push(this.createFrictionFromContact(c));
                          }
                }
            }
                    }
                  }

                  if (this.enableFrictionReduction) {
                    if (this.enableFriction && numContacts) {
                      this.frictionEquations.push(this.createFrictionFromAverage(numContacts));
                    }
                  }

                  return numContacts;
                };

// .projectConvex is called by other functions, need local tmp vectors
    var pcoa_tmp1 = vec2.fromValues(0, 0);

    /**
     * Project a Convex onto a world-oriented axis
     * @method projectConvexOntoAxis
     * @static
     * @param  {Convex} convexShape
     * @param  {Array} convexOffset
     * @param  {Number} convexAngle
     * @param  {Array} worldAxis
     * @param  {Array} result
     */
    Narrowphase.projectConvexOntoAxis = function (convexShape, convexOffset, convexAngle, worldAxis, result) {
      var max = null,
          min = null,
          v,
          value,
          localAxis = pcoa_tmp1;

      // Convert the axis to local coords of the body
      vec2.rotate(localAxis, worldAxis, -convexAngle);

      // Get projected position of all vertices
      for (var i = 0; i < convexShape.vertices.length; i++) {
        v = convexShape.vertices[i];
        value = dot(v, localAxis);
        if (max === null || value > max) {
          max = value;
        }
        if (min === null || value < min) {
          min = value;
        }
      }

      if (min > max) {
        var t = min;
        min = max;
        max = t;
      }

      // Project the position of the body onto the axis - need to add this to the result
      var offset = dot(convexOffset, worldAxis);

      vec2.set(result, min + offset, max + offset);
    };

// .findSeparatingAxis is called by other functions, need local tmp vectors
    var fsa_tmp1 = vec2.fromValues(0, 0)
        , fsa_tmp2 = vec2.fromValues(0, 0)
        , fsa_tmp3 = vec2.fromValues(0, 0)
        , fsa_tmp4 = vec2.fromValues(0, 0)
        , fsa_tmp5 = vec2.fromValues(0, 0)
        , fsa_tmp6 = vec2.fromValues(0, 0);

    /**
     * Find a separating axis between the shapes, that maximizes the separating distance between them.
     * @method findSeparatingAxis
     * @static
     * @param  {Convex}     c1
     * @param  {Array}      offset1
     * @param  {Number}     angle1
     * @param  {Convex}     c2
     * @param  {Array}      offset2
     * @param  {Number}     angle2
     * @param  {Array}      sepAxis     The resulting axis
     * @return {Boolean}                Whether the axis could be found.
     */
    Narrowphase.findSeparatingAxis = function (c1, offset1, angle1, c2, offset2, angle2, sepAxis) {
      var maxDist = null,
          overlap = false,
          found = false,
          edge = fsa_tmp1,
          worldPoint0 = fsa_tmp2,
          worldPoint1 = fsa_tmp3,
          normal = fsa_tmp4,
          span1 = fsa_tmp5,
          span2 = fsa_tmp6;

      if (c1 instanceof Box && c2 instanceof Box) {

        for (var j = 0; j !== 2; j++) {
          var c = c1,
              angle = angle1;
          if (j === 1) {
            c = c2;
            angle = angle2;
            }

          for (var i = 0; i !== 2; i++) {

            // Get the world edge
            if (i === 0) {
              vec2.set(normal, 0, 1);
            } else if (i === 1) {
              vec2.set(normal, 1, 0);
                }
            if (angle !== 0) {
              vec2.rotate(normal, normal, angle);
                }

            // Project hulls onto that normal
            Narrowphase.projectConvexOntoAxis(c1, offset1, angle1, normal, span1);
            Narrowphase.projectConvexOntoAxis(c2, offset2, angle2, normal, span2);

            // Order by span position
            var a = span1,
                b = span2,
                swapped = false;
            if (span1[0] > span2[0]) {
              b = span1;
              a = span2;
              swapped = true;
                }

            // Get separating distance
            var dist = b[0] - a[1];
            overlap = (dist <= 0);

            if (maxDist === null || dist > maxDist) {
              vec2.copy(sepAxis, normal);
              maxDist = dist;
              found = overlap;
            }
            }
        }

      } else {

        for (var j = 0; j !== 2; j++) {
          var c = c1,
              angle = angle1;
          if (j === 1) {
            c = c2;
            angle = angle2;
            }

          for (var i = 0; i !== c.vertices.length; i++) {
            // Get the world edge
            vec2.rotate(worldPoint0, c.vertices[i], angle);
            vec2.rotate(worldPoint1, c.vertices[(i + 1) % c.vertices.length], angle);

            sub(edge, worldPoint1, worldPoint0);

                // Get normal - just rotate 90 degrees since vertices are given in CCW
                vec2.rotate90cw(normal, edge);
            vec2.normalize(normal, normal);

            // Project hulls onto that normal
            Narrowphase.projectConvexOntoAxis(c1, offset1, angle1, normal, span1);
            Narrowphase.projectConvexOntoAxis(c2, offset2, angle2, normal, span2);

            // Order by span position
            var a = span1,
                b = span2,
                swapped = false;
            if (span1[0] > span2[0]) {
              b = span1;
              a = span2;
              swapped = true;
            }

            // Get separating distance
            var dist = b[0] - a[1];
            overlap = (dist <= 0);

            if (maxDist === null || dist > maxDist) {
              vec2.copy(sepAxis, normal);
              maxDist = dist;
              found = overlap;
            }
          }
        }
      }


      /*
       // Needs to be tested some more
       for(var j=0; j!==2; j++){
       var c = c1,
       angle = angle1;
       if(j===1){
       c = c2;
       angle = angle2;
       }

       for(var i=0; i!==c.axes.length; i++){

       var normal = c.axes[i];

       // Project hulls onto that normal
            Narrowphase.projectConvexOntoAxis(c1, offset1, angle1, normal, span1);
            Narrowphase.projectConvexOntoAxis(c2, offset2, angle2, normal, span2);

            // Order by span position
       var a=span1,
       b=span2,
                swapped = false;
       if(span1[0] > span2[0]){
       b=span1;
       a=span2;
       swapped = true;
            }

            // Get separating distance
            var dist = b[0] - a[1];
       overlap = (dist <= Narrowphase.convexPrecision);

       if(maxDist===null || dist > maxDist){
       vec2.copy(sepAxis, normal);
       maxDist = dist;
       found = overlap;
            }
        }
       }
       */

      return found;
    };

// .getClosestEdge is called by other functions, need local tmp vectors
    var gce_tmp1 = vec2.fromValues(0, 0)
        , gce_tmp2 = vec2.fromValues(0, 0)
        , gce_tmp3 = vec2.fromValues(0, 0);

    /**
     * Get the edge that has a normal closest to an axis.
     * @method getClosestEdge
     * @static
     * @param  {Convex}     c
     * @param  {Number}     angle
     * @param  {Array}      axis
     * @param  {Boolean}    flip
     * @return {Number}             Index of the edge that is closest. This index and the next spans the resulting edge. Returns -1 if failed.
     */
    Narrowphase.getClosestEdge = function (c, angle, axis, flip) {
      var localAxis = gce_tmp1,
          edge = gce_tmp2,
          normal = gce_tmp3;

      // Convert the axis to local coords of the body
      vec2.rotate(localAxis, axis, -angle);
      if (flip) {
        vec2.scale(localAxis, localAxis, -1);
      }

      var closestEdge = -1,
          N = c.vertices.length,
          maxDot = -1;
      for (var i = 0; i !== N; i++) {
        // Get the edge
        sub(edge, c.vertices[(i + 1) % N], c.vertices[i % N]);

        // Get normal - just rotate 90 degrees since vertices are given in CCW
        vec2.rotate90cw(normal, edge);
        vec2.normalize(normal, normal);

        var d = dot(normal, localAxis);
        if (closestEdge === -1 || d > maxDot) {
          closestEdge = i % N;
          maxDot = d;
        }
      }

      return closestEdge;
    };

    var circleHeightfield_candidate = vec2.create(),
        circleHeightfield_dist = vec2.create(),
        circleHeightfield_v0 = vec2.create(),
        circleHeightfield_v1 = vec2.create(),
        circleHeightfield_minCandidate = vec2.create(),
        circleHeightfield_worldNormal = vec2.create(),
        circleHeightfield_minCandidateNormal = vec2.create();

    /**
     * @method circleHeightfield
     * @param  {Body}           bi
     * @param  {Circle}         si
     * @param  {Array}          xi
     * @param  {Body}           bj
     * @param  {Heightfield}    sj
     * @param  {Array}          xj
     * @param  {Number}         aj
     */
    Narrowphase.prototype[Shape.CIRCLE | Shape.HEIGHTFIELD] =
        Narrowphase.prototype.circleHeightfield = function (circleBody, circleShape, circlePos, circleAngle,
                                                            hfBody, hfShape, hfPos, hfAngle, justTest, radius) {
          var data = hfShape.heights,
              radius = radius || circleShape.radius,
              w = hfShape.elementWidth,
              dist = circleHeightfield_dist,
              candidate = circleHeightfield_candidate,
              minCandidate = circleHeightfield_minCandidate,
              minCandidateNormal = circleHeightfield_minCandidateNormal,
              worldNormal = circleHeightfield_worldNormal,
              v0 = circleHeightfield_v0,
              v1 = circleHeightfield_v1;

          // Get the index of the points to test against
          var idxA = Math.floor((circlePos[0] - radius - hfPos[0]) / w),
              idxB = Math.ceil((circlePos[0] + radius - hfPos[0]) / w);

          /*if(idxB < 0 || idxA >= data.length)
           return justTest ? false : 0;*/

          if (idxA < 0) {
            idxA = 0;
          }
          if (idxB >= data.length) {
            idxB = data.length - 1;
          }

          // Get max and min
          var max = data[idxA],
              min = data[idxB];
          for (var i = idxA; i < idxB; i++) {
            if (data[i] < min) {
              min = data[i];
            }
            if (data[i] > max) {
              max = data[i];
            }
          }

          if (circlePos[1] - radius > max) {
            return justTest ? false : 0;
          }

          /*
           if(circlePos[1]+radius < min){
           // Below the minimum point... We can just guess.
           // TODO
           }
           */

          // 1. Check so center of circle is not inside the field. If it is, this wont work...
          // 2. For each edge
          // 2. 1. Get point on circle that is closest to the edge (scale normal with -radius)
          // 2. 2. Check if point is inside.

          var found = false;

          // Check all edges first
          for (var i = idxA; i < idxB; i++) {

            // Get points
            vec2.set(v0, i * w, data[i]);
            vec2.set(v1, (i + 1) * w, data[i + 1]);
            vec2.add(v0, v0, hfPos);
            vec2.add(v1, v1, hfPos);

            // Get normal
            vec2.sub(worldNormal, v1, v0);
            vec2.rotate(worldNormal, worldNormal, Math.PI / 2);
            vec2.normalize(worldNormal, worldNormal);

            // Get point on circle, closest to the edge
            vec2.scale(candidate, worldNormal, -radius);
            vec2.add(candidate, candidate, circlePos);

            // Distance from v0 to the candidate point
            vec2.sub(dist, candidate, v0);

            // Check if it is in the element "stick"
            var d = vec2.dot(dist, worldNormal);
            if (candidate[0] >= v0[0] && candidate[0] < v1[0] && d <= 0) {

              if (justTest) {
                return true;
            }

              found = true;

              // Store the candidate point, projected to the edge
              vec2.scale(dist, worldNormal, -d);
              vec2.add(minCandidate, candidate, dist);
              vec2.copy(minCandidateNormal, worldNormal);

              var c = this.createContactEquation(hfBody, circleBody, hfShape, circleShape);

              // Normal is out of the heightfield
              vec2.copy(c.normalA, minCandidateNormal);

              // Vector from circle to heightfield
              vec2.scale(c.contactPointB, c.normalA, -radius);
              add(c.contactPointB, c.contactPointB, circlePos);
              sub(c.contactPointB, c.contactPointB, circleBody.position);

              vec2.copy(c.contactPointA, minCandidate);
              vec2.sub(c.contactPointA, c.contactPointA, hfBody.position);

              this.contactEquations.push(c);

              if (this.enableFriction) {
                this.frictionEquations.push(this.createFrictionFromContact(c));
            }
            }
          }

          // Check all vertices
          found = false;
          if (radius > 0) {
            for (var i = idxA; i <= idxB; i++) {

              // Get point
              vec2.set(v0, i * w, data[i]);
              vec2.add(v0, v0, hfPos);

              vec2.sub(dist, circlePos, v0);

              if (vec2.squaredLength(dist) < Math.pow(radius, 2)) {

                if (justTest) {
                  return true;
                }

                found = true;

                var c = this.createContactEquation(hfBody, circleBody, hfShape, circleShape);

                // Construct normal - out of heightfield
                vec2.copy(c.normalA, dist);
                vec2.normalize(c.normalA, c.normalA);

                vec2.scale(c.contactPointB, c.normalA, -radius);
                add(c.contactPointB, c.contactPointB, circlePos);
                sub(c.contactPointB, c.contactPointB, circleBody.position);

                sub(c.contactPointA, v0, hfPos);
                add(c.contactPointA, c.contactPointA, hfPos);
                sub(c.contactPointA, c.contactPointA, hfBody.position);

                this.contactEquations.push(c);

                if (this.enableFriction) {
                  this.frictionEquations.push(this.createFrictionFromContact(c));
                }
            }
            }
          }

          if (found) {
            return 1;
          }

          return 0;

        };

    var convexHeightfield_v0 = vec2.create(),
        convexHeightfield_v1 = vec2.create(),
        convexHeightfield_tilePos = vec2.create(),
        convexHeightfield_tempConvexShape = new Convex({vertices: [vec2.create(), vec2.create(), vec2.create(), vec2.create()]});
    /**
     * @method circleHeightfield
     * @param  {Body}           bi
     * @param  {Circle}         si
     * @param  {Array}          xi
     * @param  {Body}           bj
     * @param  {Heightfield}    sj
     * @param  {Array}          xj
     * @param  {Number}         aj
     */
    Narrowphase.prototype[Shape.BOX | Shape.HEIGHTFIELD] =
        Narrowphase.prototype[Shape.CONVEX | Shape.HEIGHTFIELD] =
            Narrowphase.prototype.convexHeightfield = function (convexBody, convexShape, convexPos, convexAngle,
                                                                hfBody, hfShape, hfPos, hfAngle, justTest) {
              var data = hfShape.heights,
                  w = hfShape.elementWidth,
                  v0 = convexHeightfield_v0,
                  v1 = convexHeightfield_v1,
                  tilePos = convexHeightfield_tilePos,
                  tileConvex = convexHeightfield_tempConvexShape;

              // Get the index of the points to test against
              var idxA = Math.floor((convexBody.aabb.lowerBound[0] - hfPos[0]) / w),
                  idxB = Math.ceil((convexBody.aabb.upperBound[0] - hfPos[0]) / w);

              if (idxA < 0) {
                idxA = 0;
              }
              if (idxB >= data.length) {
                idxB = data.length - 1;
              }

              // Get max and min
              var max = data[idxA],
                  min = data[idxB];
              for (var i = idxA; i < idxB; i++) {
                if (data[i] < min) {
                  min = data[i];
                }
                if (data[i] > max) {
                  max = data[i];
                }
              }

              if (convexBody.aabb.lowerBound[1] > max) {
                return justTest ? false : 0;
              }

              var found = false;
              var numContacts = 0;

              // Loop over all edges
              // TODO: If possible, construct a convex from several data points (need o check if the points make a convex shape)
              for (var i = idxA; i < idxB; i++) {

                // Get points
                vec2.set(v0, i * w, data[i]);
                vec2.set(v1, (i + 1) * w, data[i + 1]);
                vec2.add(v0, v0, hfPos);
                vec2.add(v1, v1, hfPos);

                // Construct a convex
                var tileHeight = 100; // todo
                vec2.set(tilePos, (v1[0] + v0[0]) * 0.5, (v1[1] + v0[1] - tileHeight) * 0.5);

                vec2.sub(tileConvex.vertices[0], v1, tilePos);
                vec2.sub(tileConvex.vertices[1], v0, tilePos);
                vec2.copy(tileConvex.vertices[2], tileConvex.vertices[1]);
                vec2.copy(tileConvex.vertices[3], tileConvex.vertices[0]);
                tileConvex.vertices[2][1] -= tileHeight;
                tileConvex.vertices[3][1] -= tileHeight;

                // Do convex collision
                numContacts += this.convexConvex(convexBody, convexShape, convexPos, convexAngle,
                    hfBody, tileConvex, tilePos, 0, justTest);
              }

              return numContacts;
            };
  }, {
    "../equations/ContactEquation": 64,
    "../equations/Equation": 65,
    "../equations/FrictionEquation": 66,
    "../math/vec2": 73,
    "../objects/Body": 74,
    "../shapes/Box": 80,
    "../shapes/Circle": 82,
    "../shapes/Convex": 83,
    "../shapes/Shape": 88,
    "../utils/ContactEquationPool": 91,
    "../utils/FrictionEquationPool": 92,
    "../utils/TupleDictionary": 99,
    "../utils/Utils": 100
  }],
  54: [function (require, module, exports) {
    module.exports = Ray;

    var vec2 = require('../math/vec2');
    var RaycastResult = require('../collision/RaycastResult');
    var Shape = require('../shapes/Shape');
    var AABB = require('../collision/AABB');

    /**
     * A line with a start and end point that is used to intersect shapes. For an example, see {{#crossLink "World/raycast:method"}}World.raycast{{/crossLink}}
     * @class Ray
     * @constructor
     * @param {object} [options]
     * @param {array} [options.from]
     * @param {array} [options.to]
     * @param {boolean} [options.checkCollisionResponse=true]
     * @param {boolean} [options.skipBackfaces=false]
     * @param {number} [options.collisionMask=-1]
     * @param {number} [options.collisionGroup=-1]
     * @param {number} [options.mode=Ray.ANY]
     * @param {number} [options.callback]
     */
    function Ray(options) {
      options = options || {};

    /**
     * Ray start point.
     * @property {array} from
     */
    this.from = options.from ? vec2.fromValues(options.from[0], options.from[1]) : vec2.create();

      /**
       * Ray end point
       * @property {array} to
       */
      this.to = options.to ? vec2.fromValues(options.to[0], options.to[1]) : vec2.create();

      /**
       * Set to true if you want the Ray to take .collisionResponse flags into account on bodies and shapes.
       * @property {Boolean} checkCollisionResponse
       */
      this.checkCollisionResponse = options.checkCollisionResponse !== undefined ? options.checkCollisionResponse : true;

      /**
       * If set to true, the ray skips any hits with normal.dot(rayDirection) < 0.
       * @property {Boolean} skipBackfaces
       */
      this.skipBackfaces = !!options.skipBackfaces;

      /**
       * @property {number} collisionMask
       * @default -1
       */
      this.collisionMask = options.collisionMask !== undefined ? options.collisionMask : -1;

      /**
       * @property {number} collisionGroup
       * @default -1
       */
      this.collisionGroup = options.collisionGroup !== undefined ? options.collisionGroup : -1;

    /**
     * The intersection mode. Should be {{#crossLink "Ray/ANY:property"}}Ray.ANY{{/crossLink}}, {{#crossLink "Ray/ALL:property"}}Ray.ALL{{/crossLink}} or {{#crossLink "Ray/CLOSEST:property"}}Ray.CLOSEST{{/crossLink}}.
     * @property {number} mode
     */
    this.mode = options.mode !== undefined ? options.mode : Ray.ANY;

    /**
     * Current, user-provided result callback. Will be used if mode is Ray.ALL.
     * @property {Function} callback
     */
    this.callback = options.callback || function (result) {
        };

    /**
     * @readOnly
     * @property {array} direction
     */
    this.direction = vec2.create();

    /**
     * Length of the ray
     * @readOnly
     * @property {number} length
     */
    this.length = 1;

      this.update();
    }

    Ray.prototype.constructor = Ray;

    /**
     * This raycasting mode will make the Ray traverse through all intersection points and only return the closest one.
     * @static
     * @property {Number} CLOSEST
     */
    Ray.CLOSEST = 1;

    /**
     * This raycasting mode will make the Ray stop when it finds the first intersection point.
     * @static
     * @property {Number} ANY
     */
    Ray.ANY = 2;

    /**
     * This raycasting mode will traverse all intersection points and executes a callback for each one.
     * @static
     * @property {Number} ALL
     */
    Ray.ALL = 4;

    /**
     * Should be called if you change the from or to point.
     * @method update
     */
    Ray.prototype.update = function () {

      // Update .direction and .length
      var d = this.direction;
      vec2.sub(d, this.to, this.from);
      this.length = vec2.length(d);
      vec2.normalize(d, d);

    };

    /**
     * @method intersectBodies
     * @param {Array} bodies An array of Body objects.
     */
    Ray.prototype.intersectBodies = function (result, bodies) {
      for (var i = 0, l = bodies.length; !result.shouldStop(this) && i < l; i++) {
        var body = bodies[i];
        var aabb = body.getAABB();
        if (aabb.overlapsRay(this) >= 0 || aabb.containsPoint(this.from)) {
          this.intersectBody(result, body);
        }
      }
    };

    var intersectBody_worldPosition = vec2.create();

    /**
     * Shoot a ray at a body, get back information about the hit.
     * @method intersectBody
     * @private
     * @param {Body} body
     */
    Ray.prototype.intersectBody = function (result, body) {
      var checkCollisionResponse = this.checkCollisionResponse;

      if (checkCollisionResponse && !body.collisionResponse) {
        return;
      }

      var worldPosition = intersectBody_worldPosition;

      for (var i = 0, N = body.shapes.length; i < N; i++) {
        var shape = body.shapes[i];

        if (checkCollisionResponse && !shape.collisionResponse) {
          continue; // Skip
        }

        if ((this.collisionGroup & shape.collisionMask) === 0 || (shape.collisionGroup & this.collisionMask) === 0) {
          continue;
        }

        // Get world angle and position of the shape
        vec2.rotate(worldPosition, shape.position, body.angle);
        vec2.add(worldPosition, worldPosition, body.position);
        var worldAngle = shape.angle + body.angle;

        this.intersectShape(
            result,
            shape,
            worldAngle,
            worldPosition,
            body
        );

        if (result.shouldStop(this)) {
          break;
        }
      }
    };

    /**
     * @method intersectShape
     * @private
     * @param {Shape} shape
     * @param {number} angle
     * @param {array} position
     * @param {Body} body
     */
    Ray.prototype.intersectShape = function (result, shape, angle, position, body) {
      var from = this.from;

      // Checking radius
      var distance = distanceFromIntersectionSquared(from, this.direction, position);
      if (distance > shape.boundingRadius * shape.boundingRadius) {
        return;
      }

      this._currentBody = body;
      this._currentShape = shape;

      shape.raycast(result, this, position, angle);

      this._currentBody = this._currentShape = null;
    };

    /**
     * Get the AABB of the ray.
     * @method getAABB
     * @param  {AABB} aabb
     */
    Ray.prototype.getAABB = function (result) {
      var to = this.to;
      var from = this.from;
      vec2.set(
          result.lowerBound,
          Math.min(to[0], from[0]),
          Math.min(to[1], from[1])
      );
      vec2.set(
          result.upperBound,
          Math.max(to[0], from[0]),
          Math.max(to[1], from[1])
      );
    };

    var hitPointWorld = vec2.create();

    /**
     * @method reportIntersection
     * @private
     * @param  {number} fraction
     * @param  {array} normal
     * @param  {number} [faceIndex=-1]
     * @return {boolean} True if the intersections should continue
     */
    Ray.prototype.reportIntersection = function (result, fraction, normal, faceIndex) {
      var from = this.from;
      var to = this.to;
      var shape = this._currentShape;
      var body = this._currentBody;

      // Skip back faces?
      if (this.skipBackfaces && vec2.dot(normal, this.direction) > 0) {
        return;
      }

      switch (this.mode) {

        case Ray.ALL:
          result.set(
              normal,
              shape,
              body,
              fraction,
              faceIndex
          );
          this.callback(result);
          break;

        case Ray.CLOSEST:

          // Store if closer than current closest
          if (fraction < result.fraction || !result.hasHit()) {
            result.set(
                normal,
                shape,
                body,
                fraction,
                faceIndex
            );
        }
          break;

        case Ray.ANY:

          // Report and stop.
          result.set(
              normal,
              shape,
              body,
              fraction,
              faceIndex
          );
          break;
      }
    };

    var v0 = vec2.create(),
        intersect = vec2.create();

    function distanceFromIntersectionSquared(from, direction, position) {

      // v0 is vector from from to position
      vec2.sub(v0, position, from);
      var dot = vec2.dot(v0, direction);

      // intersect = direction * dot + from
      vec2.scale(intersect, direction, dot);
      vec2.add(intersect, intersect, from);

      return vec2.squaredDistance(position, intersect);
    }


  }, {"../collision/AABB": 50, "../collision/RaycastResult": 55, "../math/vec2": 73, "../shapes/Shape": 88}],
  55: [function (require, module, exports) {
    var vec2 = require('../math/vec2');
    var Ray = require('../collision/Ray');

    module.exports = RaycastResult;

    /**
     * Storage for Ray casting hit data.
     * @class RaycastResult
     * @constructor
     */
    function RaycastResult() {

      /**
       * The normal of the hit, oriented in world space.
       * @property {array} normal
       */
      this.normal = vec2.create();

      /**
       * The hit shape, or null.
       * @property {Shape} shape
       */
      this.shape = null;

      /**
       * The hit body, or null.
       * @property {Body} body
       */
      this.body = null;

      /**
       * The index of the hit triangle, if the hit shape was indexable.
       * @property {number} faceIndex
       * @default -1
       */
      this.faceIndex = -1;

      /**
       * Distance to the hit, as a fraction. 0 is at the "from" point, 1 is at the "to" point. Will be set to -1 if there was no hit yet.
       * @property {number} fraction
       * @default -1
       */
      this.fraction = -1;

      /**
       * If the ray should stop traversing.
       * @readonly
       * @property {Boolean} isStopped
       */
      this.isStopped = false;
    }

    /**
     * Reset all result data. Must be done before re-using the result object.
     * @method reset
     */
    RaycastResult.prototype.reset = function () {
      vec2.set(this.normal, 0, 0);
      this.shape = null;
      this.body = null;
      this.faceIndex = -1;
      this.fraction = -1;
      this.isStopped = false;
    };

    /**
     * Get the distance to the hit point.
     * @method getHitDistance
     * @param {Ray} ray
     */
    RaycastResult.prototype.getHitDistance = function (ray) {
      return vec2.distance(ray.from, ray.to) * this.fraction;
    };

    /**
     * Returns true if the ray hit something since the last reset().
     * @method hasHit
     */
    RaycastResult.prototype.hasHit = function () {
      return this.fraction !== -1;
    };

    /**
     * Get world hit point.
     * @method getHitPoint
     * @param {array} out
     * @param {Ray} ray
     */
    RaycastResult.prototype.getHitPoint = function (out, ray) {
      vec2.lerp(out, ray.from, ray.to, this.fraction);
    };

    /**
     * Can be called while iterating over hits to stop searching for hit points.
     * @method stop
     */
    RaycastResult.prototype.stop = function () {
      this.isStopped = true;
    };

    /**
     * @method shouldStop
     * @private
     * @param {Ray} ray
     * @return {boolean}
     */
    RaycastResult.prototype.shouldStop = function (ray) {
      return this.isStopped || (this.fraction !== -1 && ray.mode === Ray.ANY);
    };

    /**
     * @method set
     * @private
     * @param {array} normal
     * @param {Shape} shape
     * @param {Body} body
     * @param {number} fraction
     */
    RaycastResult.prototype.set = function (normal,
                                            shape,
                                            body,
                                            fraction,
                                            faceIndex) {
      vec2.copy(this.normal, normal);
      this.shape = shape;
      this.body = body;
      this.fraction = fraction;
      this.faceIndex = faceIndex;
    };
  }, {"../collision/Ray": 54, "../math/vec2": 73}],
  56: [function (require, module, exports) {
    var Utils = require('../utils/Utils')
        , Broadphase = require('../collision/Broadphase');

    module.exports = SAPBroadphase;

    /**
     * Sweep and prune broadphase along one axis.
     *
     * @class SAPBroadphase
     * @constructor
     * @extends Broadphase
     */
    function SAPBroadphase() {
      Broadphase.call(this, Broadphase.SAP);

    /**
     * List of bodies currently in the broadphase.
     * @property axisList
     * @type {Array}
     */
    this.axisList = [];

      /**
       * The axis to sort along. 0 means x-axis and 1 y-axis. If your bodies are more spread out over the X axis, set axisIndex to 0, and you will gain some performance.
       * @property axisIndex
       * @type {Number}
       */
      this.axisIndex = 0;

      var that = this;
      this._addBodyHandler = function (e) {
        that.axisList.push(e.body);
      };

      this._removeBodyHandler = function (e) {
        // Remove from list
        var idx = that.axisList.indexOf(e.body);
        if (idx !== -1) {
          that.axisList.splice(idx, 1);
        }
    };
    }

    SAPBroadphase.prototype = new Broadphase();
    SAPBroadphase.prototype.constructor = SAPBroadphase;

    /**
     * Change the world
     * @method setWorld
     * @param {World} world
     */
    SAPBroadphase.prototype.setWorld = function (world) {
      // Clear the old axis array
      this.axisList.length = 0;

      // Add all bodies from the new world
      Utils.appendArray(this.axisList, world.bodies);

      // Remove old handlers, if any
      world
          .off("addBody", this._addBodyHandler)
          .off("removeBody", this._removeBodyHandler);

      // Add handlers to update the list of bodies.
      world.on("addBody", this._addBodyHandler).on("removeBody", this._removeBodyHandler);

      this.world = world;
    };

    /**
     * Sorts bodies along an axis.
     * @method sortAxisList
     * @param {Array} a
     * @param {number} axisIndex
     * @return {Array}
     */
    SAPBroadphase.sortAxisList = function (a, axisIndex) {
      axisIndex = axisIndex | 0;
      for (var i = 1, l = a.length; i < l; i++) {
        var v = a[i];
        for (var j = i - 1; j >= 0; j--) {
          if (a[j].aabb.lowerBound[axisIndex] <= v.aabb.lowerBound[axisIndex]) {
            break;
            }
          a[j + 1] = a[j];
        }
        a[j + 1] = v;
      }
      return a;
    };

    SAPBroadphase.prototype.sortList = function () {
      var bodies = this.axisList,
          axisIndex = this.axisIndex;

      // Sort the lists
      SAPBroadphase.sortAxisList(bodies, axisIndex);
    };

    /**
     * Get the colliding pairs
     * @method getCollisionPairs
     * @param  {World} world
     * @return {Array}
     */
    SAPBroadphase.prototype.getCollisionPairs = function (world) {
      var bodies = this.axisList,
          result = this.result,
          axisIndex = this.axisIndex;

      result.length = 0;

      // Update all AABBs if needed
      var l = bodies.length;
      while (l--) {
        var b = bodies[l];
        if (b.aabbNeedsUpdate) {
          b.updateAABB();
        }
      }

      // Sort the lists
      this.sortList();

      // Look through the X list
      for (var i = 0, N = bodies.length | 0; i !== N; i++) {
        var bi = bodies[i];

        for (var j = i + 1; j < N; j++) {
          var bj = bodies[j];

          // Bounds overlap?
          var overlaps = (bj.aabb.lowerBound[axisIndex] <= bi.aabb.upperBound[axisIndex]);
          if (!overlaps) {
            break;
            }

          if (Broadphase.canCollide(bi, bj) && this.boundingVolumeCheck(bi, bj)) {
            result.push(bi, bj);
            }
        }
      }

      return result;
    };

    /**
     * Returns all the bodies within an AABB.
     * @method aabbQuery
     * @param  {World} world
     * @param  {AABB} aabb
     * @param {array} result An array to store resulting bodies in.
     * @return {array}
     */
    SAPBroadphase.prototype.aabbQuery = function (world, aabb, result) {
      result = result || [];

      this.sortList();

      var axisIndex = this.axisIndex;
      var axis = 'x';
      if (axisIndex === 1) {
        axis = 'y';
      }
      if (axisIndex === 2) {
        axis = 'z';
      }

      var axisList = this.axisList;
      var lower = aabb.lowerBound[axis];
      var upper = aabb.upperBound[axis];
      for (var i = 0; i < axisList.length; i++) {
        var b = axisList[i];

        if (b.aabbNeedsUpdate) {
          b.updateAABB();
        }

        if (b.aabb.overlaps(aabb)) {
          result.push(b);
        }
      }

      return result;
    };
  }, {"../collision/Broadphase": 51, "../utils/Utils": 100}],
  57: [function (require, module, exports) {
    module.exports = Constraint;

    var Utils = require('../utils/Utils');

    /**
     * Base constraint class.
     *
     * @class Constraint
     * @constructor
     * @author schteppe
     * @param {Body} bodyA
     * @param {Body} bodyB
     * @param {Number} type
     * @param {Object} [options]
     * @param {Object} [options.collideConnected=true]
     */
    function Constraint(bodyA, bodyB, type, options) {

    /**
     * The type of constraint. May be one of Constraint.DISTANCE, Constraint.GEAR, Constraint.LOCK, Constraint.PRISMATIC or Constraint.REVOLUTE.
     * @property {number} type
     */
    this.type = type;

      options = Utils.defaults(options, {
        collideConnected: true,
        wakeUpBodies: true,
      });

    /**
     * Equations to be solved in this constraint
     *
     * @property equations
     * @type {Array}
     */
    this.equations = [];

      /**
       * First body participating in the constraint.
       * @property bodyA
       * @type {Body}
       */
      this.bodyA = bodyA;

      /**
       * Second body participating in the constraint.
       * @property bodyB
       * @type {Body}
       */
      this.bodyB = bodyB;

      /**
       * Set to true if you want the connected bodies to collide.
       * @property collideConnected
       * @type {Boolean}
       * @default true
       */
      this.collideConnected = options.collideConnected;

      // Wake up bodies when connected
      if (options.wakeUpBodies) {
        if (bodyA) {
          bodyA.wakeUp();
        }
        if (bodyB) {
          bodyB.wakeUp();
        }
    }
    }

    /**
     * Updates the internal constraint parameters before solve.
     * @method update
     */
    Constraint.prototype.update = function () {
      throw new Error("method update() not implmemented in this Constraint subclass!");
    };

    /**
     * @static
     * @property {number} DISTANCE
     */
    Constraint.DISTANCE = 1;

    /**
     * @static
     * @property {number} GEAR
     */
    Constraint.GEAR = 2;

    /**
     * @static
     * @property {number} LOCK
     */
    Constraint.LOCK = 3;

    /**
     * @static
     * @property {number} PRISMATIC
     */
    Constraint.PRISMATIC = 4;

    /**
     * @static
     * @property {number} REVOLUTE
     */
    Constraint.REVOLUTE = 5;

    /**
     * Set stiffness for this constraint.
     * @method setStiffness
     * @param {Number} stiffness
     */
    Constraint.prototype.setStiffness = function (stiffness) {
      var eqs = this.equations;
      for (var i = 0; i !== eqs.length; i++) {
        var eq = eqs[i];
        eq.stiffness = stiffness;
        eq.needsUpdate = true;
      }
    };

    /**
     * Set relaxation for this constraint.
     * @method setRelaxation
     * @param {Number} relaxation
     */
    Constraint.prototype.setRelaxation = function (relaxation) {
      var eqs = this.equations;
      for (var i = 0; i !== eqs.length; i++) {
        var eq = eqs[i];
        eq.relaxation = relaxation;
        eq.needsUpdate = true;
      }
    };

  }, {"../utils/Utils": 100}],
  58: [function (require, module, exports) {
    var Constraint = require('./Constraint')
        , Equation = require('../equations/Equation')
        , vec2 = require('../math/vec2')
        , Utils = require('../utils/Utils');

    module.exports = DistanceConstraint;

    /**
     * Constraint that tries to keep the distance between two bodies constant.
     *
     * @class DistanceConstraint
     * @constructor
     * @author schteppe
     * @param {Body} bodyA
     * @param {Body} bodyB
     * @param {object} [options]
     * @param {number} [options.distance] The distance to keep between the anchor points. Defaults to the current distance between the bodies.
     * @param {Array} [options.localAnchorA] The anchor point for bodyA, defined locally in bodyA frame. Defaults to [0,0].
     * @param {Array} [options.localAnchorB] The anchor point for bodyB, defined locally in bodyB frame. Defaults to [0,0].
     * @param {object} [options.maxForce=Number.MAX_VALUE] Maximum force to apply.
     * @extends Constraint
     *
     * @example
     *     // If distance is not given as an option, then the current distance between the bodies is used.
     *     // In this example, the bodies will be constrained to have a distance of 2 between their centers.
     *     var bodyA = new Body({ mass: 1, position: [-1, 0] });
     *     var bodyB = new Body({ mass: 1, position: [1, 0] });
     *     var constraint = new DistanceConstraint(bodyA, bodyB);
     *     world.addConstraint(constraint);
     *
     * @example
     *     // Manually set the distance and anchors
     *     var constraint = new DistanceConstraint(bodyA, bodyB, {
 *         distance: 1,          // Distance to keep between the points
 *         localAnchorA: [1, 0], // Point on bodyA
 *         localAnchorB: [-1, 0] // Point on bodyB
 *     });
     *     world.addConstraint(constraint);
     */
    function DistanceConstraint(bodyA, bodyB, options) {
      options = Utils.defaults(options, {
        localAnchorA: [0, 0],
        localAnchorB: [0, 0]
      });

      Constraint.call(this, bodyA, bodyB, Constraint.DISTANCE, options);

      /**
       * Local anchor in body A.
       * @property localAnchorA
       * @type {Array}
       */
      this.localAnchorA = vec2.fromValues(options.localAnchorA[0], options.localAnchorA[1]);

      /**
       * Local anchor in body B.
       * @property localAnchorB
       * @type {Array}
       */
      this.localAnchorB = vec2.fromValues(options.localAnchorB[0], options.localAnchorB[1]);

      var localAnchorA = this.localAnchorA;
      var localAnchorB = this.localAnchorB;

      /**
       * The distance to keep.
       * @property distance
       * @type {Number}
       */
      this.distance = 0;

      if (typeof(options.distance) === 'number') {
        this.distance = options.distance;
      } else {
        // Use the current world distance between the world anchor points.
        var worldAnchorA = vec2.create(),
            worldAnchorB = vec2.create(),
            r = vec2.create();

        // Transform local anchors to world
        vec2.rotate(worldAnchorA, localAnchorA, bodyA.angle);
        vec2.rotate(worldAnchorB, localAnchorB, bodyB.angle);

        vec2.add(r, bodyB.position, worldAnchorB);
        vec2.sub(r, r, worldAnchorA);
        vec2.sub(r, r, bodyA.position);

        this.distance = vec2.length(r);
      }

      var maxForce;
      if (typeof(options.maxForce) === "undefined") {
        maxForce = Number.MAX_VALUE;
      } else {
        maxForce = options.maxForce;
      }

      var normal = new Equation(bodyA, bodyB, -maxForce, maxForce); // Just in the normal direction
      this.equations = [normal];

      /**
       * Max force to apply.
       * @property {number} maxForce
       */
      this.maxForce = maxForce;

      // g = (xi - xj).dot(n)
      // dg/dt = (vi - vj).dot(n) = G*W = [n 0 -n 0] * [vi wi vj wj]'

      // ...and if we were to include offset points:
      // g =
      //      (xj + rj - xi - ri).dot(n) - distance
      //
      // dg/dt =
      //      (vj + wj x rj - vi - wi x ri).dot(n) =
      //      { term 2 is near zero } =
      //      [-n   -ri x n   n   rj x n] * [vi wi vj wj]' =
      //      G * W
      //
      // => G = [-n -rixn n rjxn]

      var r = vec2.create();
      var ri = vec2.create(); // worldAnchorA
      var rj = vec2.create(); // worldAnchorB
      var that = this;
      normal.computeGq = function () {
        var bodyA = this.bodyA,
            bodyB = this.bodyB,
            xi = bodyA.position,
            xj = bodyB.position;

        // Transform local anchors to world
        vec2.rotate(ri, localAnchorA, bodyA.angle);
        vec2.rotate(rj, localAnchorB, bodyB.angle);

        vec2.add(r, xj, rj);
        vec2.sub(r, r, ri);
        vec2.sub(r, r, xi);

        //vec2.sub(r, bodyB.position, bodyA.position);
        return vec2.length(r) - that.distance;
      };

      // Make the contact constraint bilateral
      this.setMaxForce(maxForce);

      /**
       * If the upper limit is enabled or not.
       * @property {Boolean} upperLimitEnabled
       */
      this.upperLimitEnabled = false;

      /**
       * The upper constraint limit.
       * @property {number} upperLimit
       */
      this.upperLimit = 1;

      /**
       * If the lower limit is enabled or not.
       * @property {Boolean} lowerLimitEnabled
       */
      this.lowerLimitEnabled = false;

      /**
       * The lower constraint limit.
       * @property {number} lowerLimit
       */
      this.lowerLimit = 0;

    /**
     * Current constraint position. This is equal to the current distance between the world anchor points.
     * @property {number} position
     */
    this.position = 0;
    }

    DistanceConstraint.prototype = new Constraint();
    DistanceConstraint.prototype.constructor = DistanceConstraint;

    /**
     * Update the constraint equations. Should be done if any of the bodies changed position, before solving.
     * @method update
     */
    var n = vec2.create();
    var ri = vec2.create(); // worldAnchorA
    var rj = vec2.create(); // worldAnchorB
    DistanceConstraint.prototype.update = function () {
      var normal = this.equations[0],
          bodyA = this.bodyA,
          bodyB = this.bodyB,
          distance = this.distance,
          xi = bodyA.position,
          xj = bodyB.position,
          normalEquation = this.equations[0],
          G = normal.G;

      // Transform local anchors to world
      vec2.rotate(ri, this.localAnchorA, bodyA.angle);
      vec2.rotate(rj, this.localAnchorB, bodyB.angle);

      // Get world anchor points and normal
      vec2.add(n, xj, rj);
      vec2.sub(n, n, ri);
      vec2.sub(n, n, xi);
      this.position = vec2.length(n);

      var violating = false;
      if (this.upperLimitEnabled) {
        if (this.position > this.upperLimit) {
          normalEquation.maxForce = 0;
          normalEquation.minForce = -this.maxForce;
          this.distance = this.upperLimit;
          violating = true;
        }
      }

      if (this.lowerLimitEnabled) {
        if (this.position < this.lowerLimit) {
          normalEquation.maxForce = this.maxForce;
          normalEquation.minForce = 0;
          this.distance = this.lowerLimit;
          violating = true;
        }
      }

      if ((this.lowerLimitEnabled || this.upperLimitEnabled) && !violating) {
        // No constraint needed.
        normalEquation.enabled = false;
        return;
      }

      normalEquation.enabled = true;

      vec2.normalize(n, n);

      // Caluclate cross products
      var rixn = vec2.crossLength(ri, n),
          rjxn = vec2.crossLength(rj, n);

      // G = [-n -rixn n rjxn]
      G[0] = -n[0];
      G[1] = -n[1];
      G[2] = -rixn;
      G[3] = n[0];
      G[4] = n[1];
      G[5] = rjxn;
    };

    /**
     * Set the max force to be used
     * @method setMaxForce
     * @param {Number} maxForce
     */
    DistanceConstraint.prototype.setMaxForce = function (maxForce) {
      var normal = this.equations[0];
      normal.minForce = -maxForce;
      normal.maxForce = maxForce;
    };

    /**
     * Get the max force
     * @method getMaxForce
     * @return {Number}
     */
    DistanceConstraint.prototype.getMaxForce = function () {
      var normal = this.equations[0];
      return normal.maxForce;
    };

  }, {"../equations/Equation": 65, "../math/vec2": 73, "../utils/Utils": 100, "./Constraint": 57}],
  59: [function (require, module, exports) {
    var Constraint = require('./Constraint')
        , Equation = require('../equations/Equation')
        , AngleLockEquation = require('../equations/AngleLockEquation')
        , vec2 = require('../math/vec2');

    module.exports = GearConstraint;

    /**
     * Constrains the angle of two bodies to each other to be equal. If a gear ratio is not one, the angle of bodyA must be a multiple of the angle of bodyB.
     * @class GearConstraint
     * @constructor
     * @author schteppe
     * @param {Body}            bodyA
     * @param {Body}            bodyB
     * @param {Object}          [options]
     * @param {Number}          [options.angle=0] Relative angle between the bodies. Will be set to the current angle between the bodies (the gear ratio is accounted for).
     * @param {Number}          [options.ratio=1] Gear ratio.
     * @param {Number}          [options.maxTorque] Maximum torque to apply.
     * @extends Constraint
     *
     * @example
     *     var constraint = new GearConstraint(bodyA, bodyB);
     *     world.addConstraint(constraint);
     *
     * @example
     *     var constraint = new GearConstraint(bodyA, bodyB, {
 *         ratio: 2,
 *         maxTorque: 1000
 *     });
     *     world.addConstraint(constraint);
     */
    function GearConstraint(bodyA, bodyB, options) {
      options = options || {};

      Constraint.call(this, bodyA, bodyB, Constraint.GEAR, options);

      /**
       * The gear ratio.
       * @property ratio
       * @type {Number}
       */
      this.ratio = options.ratio !== undefined ? options.ratio : 1;

      /**
       * The relative angle
       * @property angle
       * @type {Number}
       */
      this.angle = options.angle !== undefined ? options.angle : bodyB.angle - this.ratio * bodyA.angle;

      // Send same parameters to the equation
      options.angle = this.angle;
      options.ratio = this.ratio;

      this.equations = [
        new AngleLockEquation(bodyA, bodyB, options),
      ];

      // Set max torque
      if (options.maxTorque !== undefined) {
        this.setMaxTorque(options.maxTorque);
    }
    }

    GearConstraint.prototype = new Constraint();
    GearConstraint.prototype.constructor = GearConstraint;

    GearConstraint.prototype.update = function () {
      var eq = this.equations[0];
      if (eq.ratio !== this.ratio) {
        eq.setRatio(this.ratio);
      }
      eq.angle = this.angle;
    };

    /**
     * Set the max torque for the constraint.
     * @method setMaxTorque
     * @param {Number} torque
     */
    GearConstraint.prototype.setMaxTorque = function (torque) {
      this.equations[0].setMaxTorque(torque);
    };

    /**
     * Get the max torque for the constraint.
     * @method getMaxTorque
     * @return {Number}
     */
    GearConstraint.prototype.getMaxTorque = function (torque) {
      return this.equations[0].maxForce;
    };
  }, {"../equations/AngleLockEquation": 63, "../equations/Equation": 65, "../math/vec2": 73, "./Constraint": 57}],
  60: [function (require, module, exports) {
    var Constraint = require('./Constraint')
        , vec2 = require('../math/vec2')
        , Equation = require('../equations/Equation');

    module.exports = LockConstraint;

    /**
     * Locks the relative position and rotation between two bodies.
     *
     * @class LockConstraint
     * @constructor
     * @author schteppe
     * @param {Body} bodyA
     * @param {Body} bodyB
     * @param {Object} [options]
     * @param {Array}  [options.localOffsetB] The offset of bodyB in bodyA's frame. If not given the offset is computed from current positions.
     * @param {number} [options.localAngleB] The angle of bodyB in bodyA's frame. If not given, the angle is computed from current angles.
     * @param {number} [options.maxForce]
     * @extends Constraint
     *
     * @example
     *     // Locks the relative position and rotation between bodyA and bodyB
     *     var constraint = new LockConstraint(bodyA, bodyB);
     *     world.addConstraint(constraint);
     */
    function LockConstraint(bodyA, bodyB, options) {
      options = options || {};

      Constraint.call(this, bodyA, bodyB, Constraint.LOCK, options);

      var maxForce = ( typeof(options.maxForce) === "undefined" ? Number.MAX_VALUE : options.maxForce );

      var localAngleB = options.localAngleB || 0;

      // Use 3 equations:
      // gx =   (xj - xi - l) * xhat = 0
      // gy =   (xj - xi - l) * yhat = 0
      // gr =   (xi - xj + r) * that = 0
      //
      // ...where:
      //   l is the localOffsetB vector rotated to world in bodyA frame
      //   r is the same vector but reversed and rotated from bodyB frame
      //   xhat, yhat are world axis vectors
      //   that is the tangent of r
      //
      // For the first two constraints, we get
      // G*W = (vj - vi - ldot  ) * xhat
      //     = (vj - vi - wi x l) * xhat
      //
      // Since (wi x l) * xhat = (l x xhat) * wi, we get
      // G*W = [ -1   0   (-l x xhat)  1   0   0] * [vi wi vj wj]
      //
      // The last constraint gives
      // GW = (vi - vj + wj x r) * that
      //    = [  that   0  -that  (r x t) ]

      var x = new Equation(bodyA, bodyB, -maxForce, maxForce),
          y = new Equation(bodyA, bodyB, -maxForce, maxForce),
          rot = new Equation(bodyA, bodyB, -maxForce, maxForce);

      var l = vec2.create(),
          g = vec2.create(),
          that = this;
      x.computeGq = function () {
        vec2.rotate(l, that.localOffsetB, bodyA.angle);
        vec2.sub(g, bodyB.position, bodyA.position);
        vec2.sub(g, g, l);
        return g[0];
      };
      y.computeGq = function () {
        vec2.rotate(l, that.localOffsetB, bodyA.angle);
        vec2.sub(g, bodyB.position, bodyA.position);
        vec2.sub(g, g, l);
        return g[1];
      };
      var r = vec2.create(),
          t = vec2.create();
      rot.computeGq = function () {
        vec2.rotate(r, that.localOffsetB, bodyB.angle - that.localAngleB);
        vec2.scale(r, r, -1);
        vec2.sub(g, bodyA.position, bodyB.position);
        vec2.add(g, g, r);
        vec2.rotate(t, r, -Math.PI / 2);
        vec2.normalize(t, t);
        return vec2.dot(g, t);
      };

      /**
       * The offset of bodyB in bodyA's frame.
       * @property {Array} localOffsetB
       */
      this.localOffsetB = vec2.create();
      if (options.localOffsetB) {
        vec2.copy(this.localOffsetB, options.localOffsetB);
      } else {
        // Construct from current positions
        vec2.sub(this.localOffsetB, bodyB.position, bodyA.position);
        vec2.rotate(this.localOffsetB, this.localOffsetB, -bodyA.angle);
      }

      /**
       * The offset angle of bodyB in bodyA's frame.
       * @property {Number} localAngleB
       */
      this.localAngleB = 0;
      if (typeof(options.localAngleB) === 'number') {
        this.localAngleB = options.localAngleB;
      } else {
        // Construct
        this.localAngleB = bodyB.angle - bodyA.angle;
    }

      this.equations.push(x, y, rot);
      this.setMaxForce(maxForce);
    }

    LockConstraint.prototype = new Constraint();
    LockConstraint.prototype.constructor = LockConstraint;

    /**
     * Set the maximum force to be applied.
     * @method setMaxForce
     * @param {Number} force
     */
    LockConstraint.prototype.setMaxForce = function (force) {
      var eqs = this.equations;
      for (var i = 0; i < this.equations.length; i++) {
        eqs[i].maxForce = force;
        eqs[i].minForce = -force;
      }
    };

    /**
     * Get the max force.
     * @method getMaxForce
     * @return {Number}
     */
    LockConstraint.prototype.getMaxForce = function () {
      return this.equations[0].maxForce;
    };

    var l = vec2.create();
    var r = vec2.create();
    var t = vec2.create();
    var xAxis = vec2.fromValues(1, 0);
    var yAxis = vec2.fromValues(0, 1);
    LockConstraint.prototype.update = function () {
      var x = this.equations[0],
          y = this.equations[1],
          rot = this.equations[2],
          bodyA = this.bodyA,
          bodyB = this.bodyB;

      vec2.rotate(l, this.localOffsetB, bodyA.angle);
      vec2.rotate(r, this.localOffsetB, bodyB.angle - this.localAngleB);
      vec2.scale(r, r, -1);

      vec2.rotate(t, r, Math.PI / 2);
      vec2.normalize(t, t);

      x.G[0] = -1;
      x.G[1] = 0;
      x.G[2] = -vec2.crossLength(l, xAxis);
      x.G[3] = 1;

      y.G[0] = 0;
      y.G[1] = -1;
      y.G[2] = -vec2.crossLength(l, yAxis);
      y.G[4] = 1;

      rot.G[0] = -t[0];
      rot.G[1] = -t[1];
      rot.G[3] = t[0];
      rot.G[4] = t[1];
      rot.G[5] = vec2.crossLength(r, t);
    };

  }, {"../equations/Equation": 65, "../math/vec2": 73, "./Constraint": 57}],
  61: [function (require, module, exports) {
    var Constraint = require('./Constraint')
        , ContactEquation = require('../equations/ContactEquation')
        , Equation = require('../equations/Equation')
        , vec2 = require('../math/vec2')
        , RotationalLockEquation = require('../equations/RotationalLockEquation');

    module.exports = PrismaticConstraint;

    /**
     * Constraint that only allows bodies to move along a line, relative to each other. See <a href="http://www.iforce2d.net/b2dtut/joints-prismatic">this tutorial</a>. Also called "slider constraint".
     *
     * @class PrismaticConstraint
     * @constructor
     * @extends Constraint
     * @author schteppe
     * @param {Body}    bodyA
     * @param {Body}    bodyB
     * @param {Object}  [options]
     * @param {Number}  [options.maxForce]                Max force to be applied by the constraint
     * @param {Array}   [options.localAnchorA]            Body A's anchor point, defined in its own local frame.
     * @param {Array}   [options.localAnchorB]            Body B's anchor point, defined in its own local frame.
     * @param {Array}   [options.localAxisA]              An axis, defined in body A frame, that body B's anchor point may slide along.
     * @param {Boolean} [options.disableRotationalLock]   If set to true, bodyB will be free to rotate around its anchor point.
     * @param {Number}  [options.upperLimit]
     * @param {Number}  [options.lowerLimit]
     * @todo Ability to create using only a point and a worldAxis
     */
    function PrismaticConstraint(bodyA, bodyB, options) {
      options = options || {};
      Constraint.call(this, bodyA, bodyB, Constraint.PRISMATIC, options);

      // Get anchors
      var localAnchorA = vec2.fromValues(0, 0),
          localAxisA = vec2.fromValues(1, 0),
          localAnchorB = vec2.fromValues(0, 0);
      if (options.localAnchorA) {
        vec2.copy(localAnchorA, options.localAnchorA);
      }
      if (options.localAxisA) {
        vec2.copy(localAxisA, options.localAxisA);
      }
      if (options.localAnchorB) {
        vec2.copy(localAnchorB, options.localAnchorB);
      }

    /**
     * @property localAnchorA
     * @type {Array}
     */
    this.localAnchorA = localAnchorA;

      /**
       * @property localAnchorB
       * @type {Array}
       */
      this.localAnchorB = localAnchorB;

      /**
       * @property localAxisA
       * @type {Array}
       */
      this.localAxisA = localAxisA;

      /*

       The constraint violation for the common axis point is

       g = ( xj + rj - xi - ri ) * t   :=  gg*t

       where r are body-local anchor points, and t is a tangent to the constraint axis defined in body i frame.

       gdot =  ( vj + wj x rj - vi - wi x ri ) * t + ( xj + rj - xi - ri ) * ( wi x t )

       Note the use of the chain rule. Now we identify the jacobian

       G*W = [ -t      -ri x t + t x gg     t    rj x t ] * [vi wi vj wj]

       The rotational part is just a rotation lock.

       */

      var maxForce = this.maxForce = typeof(options.maxForce) !== "undefined" ? options.maxForce : Number.MAX_VALUE;

      // Translational part
      var trans = new Equation(bodyA, bodyB, -maxForce, maxForce);
      var ri = new vec2.create(),
          rj = new vec2.create(),
          gg = new vec2.create(),
          t = new vec2.create();
      trans.computeGq = function () {
        // g = ( xj + rj - xi - ri ) * t
        return vec2.dot(gg, t);
      };
      trans.updateJacobian = function () {
        var G = this.G,
            xi = bodyA.position,
            xj = bodyB.position;
        vec2.rotate(ri, localAnchorA, bodyA.angle);
        vec2.rotate(rj, localAnchorB, bodyB.angle);
        vec2.add(gg, xj, rj);
        vec2.sub(gg, gg, xi);
        vec2.sub(gg, gg, ri);
        vec2.rotate(t, localAxisA, bodyA.angle + Math.PI / 2);

        G[0] = -t[0];
        G[1] = -t[1];
        G[2] = -vec2.crossLength(ri, t) + vec2.crossLength(t, gg);
        G[3] = t[0];
        G[4] = t[1];
        G[5] = vec2.crossLength(rj, t);
      };
      this.equations.push(trans);

      // Rotational part
      if (!options.disableRotationalLock) {
        var rot = new RotationalLockEquation(bodyA, bodyB, -maxForce, maxForce);
        this.equations.push(rot);
      }

      /**
       * The position of anchor A relative to anchor B, along the constraint axis.
       * @property position
       * @type {Number}
       */
      this.position = 0;

      // Is this one used at all?
      this.velocity = 0;

      /**
       * Set to true to enable lower limit.
       * @property lowerLimitEnabled
       * @type {Boolean}
       */
      this.lowerLimitEnabled = typeof(options.lowerLimit) !== "undefined" ? true : false;

      /**
       * Set to true to enable upper limit.
       * @property upperLimitEnabled
       * @type {Boolean}
       */
      this.upperLimitEnabled = typeof(options.upperLimit) !== "undefined" ? true : false;

      /**
       * Lower constraint limit. The constraint position is forced to be larger than this value.
       * @property lowerLimit
       * @type {Number}
       */
      this.lowerLimit = typeof(options.lowerLimit) !== "undefined" ? options.lowerLimit : 0;

      /**
       * Upper constraint limit. The constraint position is forced to be smaller than this value.
       * @property upperLimit
       * @type {Number}
       */
      this.upperLimit = typeof(options.upperLimit) !== "undefined" ? options.upperLimit : 1;

      // Equations used for limits
      this.upperLimitEquation = new ContactEquation(bodyA, bodyB);
      this.lowerLimitEquation = new ContactEquation(bodyA, bodyB);

      // Set max/min forces
      this.upperLimitEquation.minForce = this.lowerLimitEquation.minForce = 0;
      this.upperLimitEquation.maxForce = this.lowerLimitEquation.maxForce = maxForce;

      /**
       * Equation used for the motor.
       * @property motorEquation
       * @type {Equation}
       */
      this.motorEquation = new Equation(bodyA, bodyB);

      /**
       * The current motor state. Enable or disable the motor using .enableMotor
       * @property motorEnabled
       * @type {Boolean}
       */
      this.motorEnabled = false;

      /**
       * Set the target speed for the motor.
       * @property motorSpeed
       * @type {Number}
       */
      this.motorSpeed = 0;

      var that = this;
      var motorEquation = this.motorEquation;
      var old = motorEquation.computeGW;
      motorEquation.computeGq = function () {
        return 0;
      };
      motorEquation.computeGW = function () {
        var G = this.G,
            bi = this.bodyA,
            bj = this.bodyB,
            vi = bi.velocity,
            vj = bj.velocity,
            wi = bi.angularVelocity,
            wj = bj.angularVelocity;
        return this.gmult(G, vi, wi, vj, wj) + that.motorSpeed;
      };
    }

    PrismaticConstraint.prototype = new Constraint();
    PrismaticConstraint.prototype.constructor = PrismaticConstraint;

    var worldAxisA = vec2.create(),
        worldAnchorA = vec2.create(),
        worldAnchorB = vec2.create(),
        orientedAnchorA = vec2.create(),
        orientedAnchorB = vec2.create(),
        tmp = vec2.create();

    /**
     * Update the constraint equations. Should be done if any of the bodies changed position, before solving.
     * @method update
     */
    PrismaticConstraint.prototype.update = function () {
      var eqs = this.equations,
          trans = eqs[0],
          upperLimit = this.upperLimit,
          lowerLimit = this.lowerLimit,
          upperLimitEquation = this.upperLimitEquation,
          lowerLimitEquation = this.lowerLimitEquation,
          bodyA = this.bodyA,
          bodyB = this.bodyB,
          localAxisA = this.localAxisA,
          localAnchorA = this.localAnchorA,
          localAnchorB = this.localAnchorB;

      trans.updateJacobian();

      // Transform local things to world
      vec2.rotate(worldAxisA, localAxisA, bodyA.angle);
      vec2.rotate(orientedAnchorA, localAnchorA, bodyA.angle);
      vec2.add(worldAnchorA, orientedAnchorA, bodyA.position);
      vec2.rotate(orientedAnchorB, localAnchorB, bodyB.angle);
      vec2.add(worldAnchorB, orientedAnchorB, bodyB.position);

      var relPosition = this.position = vec2.dot(worldAnchorB, worldAxisA) - vec2.dot(worldAnchorA, worldAxisA);

      // Motor
      if (this.motorEnabled) {
        // G = [ a     a x ri   -a   -a x rj ]
        var G = this.motorEquation.G;
        G[0] = worldAxisA[0];
        G[1] = worldAxisA[1];
        G[2] = vec2.crossLength(worldAxisA, orientedAnchorB);
        G[3] = -worldAxisA[0];
        G[4] = -worldAxisA[1];
        G[5] = -vec2.crossLength(worldAxisA, orientedAnchorA);
      }

      /*
       Limits strategy:
       Add contact equation, with normal along the constraint axis.
       min/maxForce is set so the constraint is repulsive in the correct direction.
       Some offset is added to either equation.contactPointA or .contactPointB to get the correct upper/lower limit.

       ^
       |
       upperLimit x
       |    ------
       anchorB x<---|  B |
       |    |    |
       ------   |    ------
       |    |   |
       |  A |-->x anchorA
       ------   |
       x lowerLimit
       |
       axis
       */


      if (this.upperLimitEnabled && relPosition > upperLimit) {
        // Update contact constraint normal, etc
        vec2.scale(upperLimitEquation.normalA, worldAxisA, -1);
        vec2.sub(upperLimitEquation.contactPointA, worldAnchorA, bodyA.position);
        vec2.sub(upperLimitEquation.contactPointB, worldAnchorB, bodyB.position);
        vec2.scale(tmp, worldAxisA, upperLimit);
        vec2.add(upperLimitEquation.contactPointA, upperLimitEquation.contactPointA, tmp);
        if (eqs.indexOf(upperLimitEquation) === -1) {
          eqs.push(upperLimitEquation);
        }
      } else {
        var idx = eqs.indexOf(upperLimitEquation);
        if (idx !== -1) {
          eqs.splice(idx, 1);
        }
      }

      if (this.lowerLimitEnabled && relPosition < lowerLimit) {
        // Update contact constraint normal, etc
        vec2.scale(lowerLimitEquation.normalA, worldAxisA, 1);
        vec2.sub(lowerLimitEquation.contactPointA, worldAnchorA, bodyA.position);
        vec2.sub(lowerLimitEquation.contactPointB, worldAnchorB, bodyB.position);
        vec2.scale(tmp, worldAxisA, lowerLimit);
        vec2.sub(lowerLimitEquation.contactPointB, lowerLimitEquation.contactPointB, tmp);
        if (eqs.indexOf(lowerLimitEquation) === -1) {
          eqs.push(lowerLimitEquation);
        }
      } else {
        var idx = eqs.indexOf(lowerLimitEquation);
        if (idx !== -1) {
          eqs.splice(idx, 1);
        }
      }
    };

    /**
     * Enable the motor
     * @method enableMotor
     */
    PrismaticConstraint.prototype.enableMotor = function () {
      if (this.motorEnabled) {
        return;
      }
      this.equations.push(this.motorEquation);
      this.motorEnabled = true;
    };

    /**
     * Disable the rotational motor
     * @method disableMotor
     */
    PrismaticConstraint.prototype.disableMotor = function () {
      if (!this.motorEnabled) {
        return;
      }
      var i = this.equations.indexOf(this.motorEquation);
      this.equations.splice(i, 1);
      this.motorEnabled = false;
    };

    /**
     * Set the constraint limits.
     * @method setLimits
     * @param {number} lower Lower limit.
     * @param {number} upper Upper limit.
     */
    PrismaticConstraint.prototype.setLimits = function (lower, upper) {
      if (typeof(lower) === 'number') {
        this.lowerLimit = lower;
        this.lowerLimitEnabled = true;
      } else {
        this.lowerLimit = lower;
        this.lowerLimitEnabled = false;
      }

      if (typeof(upper) === 'number') {
        this.upperLimit = upper;
        this.upperLimitEnabled = true;
      } else {
        this.upperLimit = upper;
        this.upperLimitEnabled = false;
      }
    };


  }, {
    "../equations/ContactEquation": 64,
    "../equations/Equation": 65,
    "../equations/RotationalLockEquation": 67,
    "../math/vec2": 73,
    "./Constraint": 57
  }],
  62: [function (require, module, exports) {
    var Constraint = require('./Constraint')
        , Equation = require('../equations/Equation')
        , RotationalVelocityEquation = require('../equations/RotationalVelocityEquation')
        , RotationalLockEquation = require('../equations/RotationalLockEquation')
        , vec2 = require('../math/vec2');

    module.exports = RevoluteConstraint;

    var worldPivotA = vec2.create(),
        worldPivotB = vec2.create(),
        xAxis = vec2.fromValues(1, 0),
        yAxis = vec2.fromValues(0, 1),
        g = vec2.create();

    /**
     * Connects two bodies at given offset points, letting them rotate relative to each other around this point.
     * @class RevoluteConstraint
     * @constructor
     * @author schteppe
     * @param {Body}    bodyA
     * @param {Body}    bodyB
     * @param {Object}  [options]
     * @param {Array}   [options.worldPivot] A pivot point given in world coordinates. If specified, localPivotA and localPivotB are automatically computed from this value.
     * @param {Array}   [options.localPivotA] The point relative to the center of mass of bodyA which bodyA is constrained to.
     * @param {Array}   [options.localPivotB] See localPivotA.
     * @param {Number}  [options.maxForce] The maximum force that should be applied to constrain the bodies.
     * @extends Constraint
     *
     * @example
     *     // This will create a revolute constraint between two bodies with pivot point in between them.
     *     var bodyA = new Body({ mass: 1, position: [-1, 0] });
     *     var bodyB = new Body({ mass: 1, position: [1, 0] });
     *     var constraint = new RevoluteConstraint(bodyA, bodyB, {
 *         worldPivot: [0, 0]
 *     });
     *     world.addConstraint(constraint);
     *
     *     // Using body-local pivot points, the constraint could have been constructed like this:
     *     var constraint = new RevoluteConstraint(bodyA, bodyB, {
 *         localPivotA: [1, 0],
 *         localPivotB: [-1, 0]
 *     });
     */
    function RevoluteConstraint(bodyA, bodyB, options) {
      options = options || {};
      Constraint.call(this, bodyA, bodyB, Constraint.REVOLUTE, options);

      var maxForce = this.maxForce = typeof(options.maxForce) !== "undefined" ? options.maxForce : Number.MAX_VALUE;

      /**
       * @property {Array} pivotA
       */
      this.pivotA = vec2.create();

      /**
       * @property {Array} pivotB
       */
      this.pivotB = vec2.create();

      if (options.worldPivot) {
        // Compute pivotA and pivotB
        vec2.sub(this.pivotA, options.worldPivot, bodyA.position);
        vec2.sub(this.pivotB, options.worldPivot, bodyB.position);
        // Rotate to local coordinate system
        vec2.rotate(this.pivotA, this.pivotA, -bodyA.angle);
        vec2.rotate(this.pivotB, this.pivotB, -bodyB.angle);
      } else {
        // Get pivotA and pivotB
        vec2.copy(this.pivotA, options.localPivotA);
        vec2.copy(this.pivotB, options.localPivotB);
    }

      // Equations to be fed to the solver
      var eqs = this.equations = [
        new Equation(bodyA, bodyB, -maxForce, maxForce),
        new Equation(bodyA, bodyB, -maxForce, maxForce),
      ];

      var x = eqs[0];
      var y = eqs[1];
      var that = this;

      x.computeGq = function () {
        vec2.rotate(worldPivotA, that.pivotA, bodyA.angle);
        vec2.rotate(worldPivotB, that.pivotB, bodyB.angle);
        vec2.add(g, bodyB.position, worldPivotB);
        vec2.sub(g, g, bodyA.position);
        vec2.sub(g, g, worldPivotA);
        return vec2.dot(g, xAxis);
      };

      y.computeGq = function () {
        vec2.rotate(worldPivotA, that.pivotA, bodyA.angle);
        vec2.rotate(worldPivotB, that.pivotB, bodyB.angle);
        vec2.add(g, bodyB.position, worldPivotB);
        vec2.sub(g, g, bodyA.position);
        vec2.sub(g, g, worldPivotA);
        return vec2.dot(g, yAxis);
      };

      y.minForce = x.minForce = -maxForce;
      y.maxForce = x.maxForce = maxForce;

      this.motorEquation = new RotationalVelocityEquation(bodyA, bodyB);

    /**
     * Indicates whether the motor is enabled. Use .enableMotor() to enable the constraint motor.
     * @property {Boolean} motorEnabled
     * @readOnly
     */
    this.motorEnabled = false;

      /**
       * The constraint position.
       * @property angle
       * @type {Number}
       * @readOnly
       */
      this.angle = 0;

      /**
       * Set to true to enable lower limit
       * @property lowerLimitEnabled
       * @type {Boolean}
       */
      this.lowerLimitEnabled = false;

      /**
       * Set to true to enable upper limit
       * @property upperLimitEnabled
       * @type {Boolean}
       */
      this.upperLimitEnabled = false;

      /**
       * The lower limit on the constraint angle.
       * @property lowerLimit
       * @type {Boolean}
       */
      this.lowerLimit = 0;

    /**
     * The upper limit on the constraint angle.
     * @property upperLimit
     * @type {Boolean}
     */
    this.upperLimit = 0;

      this.upperLimitEquation = new RotationalLockEquation(bodyA, bodyB);
      this.lowerLimitEquation = new RotationalLockEquation(bodyA, bodyB);
      this.upperLimitEquation.minForce = 0;
      this.lowerLimitEquation.maxForce = 0;
    }

    RevoluteConstraint.prototype = new Constraint();
    RevoluteConstraint.prototype.constructor = RevoluteConstraint;

    /**
     * Set the constraint angle limits.
     * @method setLimits
     * @param {number} lower Lower angle limit.
     * @param {number} upper Upper angle limit.
     */
    RevoluteConstraint.prototype.setLimits = function (lower, upper) {
      if (typeof(lower) === 'number') {
        this.lowerLimit = lower;
        this.lowerLimitEnabled = true;
      } else {
        this.lowerLimit = lower;
        this.lowerLimitEnabled = false;
      }

      if (typeof(upper) === 'number') {
        this.upperLimit = upper;
        this.upperLimitEnabled = true;
      } else {
        this.upperLimit = upper;
        this.upperLimitEnabled = false;
      }
    };

    RevoluteConstraint.prototype.update = function () {
      var bodyA = this.bodyA,
          bodyB = this.bodyB,
          pivotA = this.pivotA,
          pivotB = this.pivotB,
          eqs = this.equations,
          normal = eqs[0],
          tangent = eqs[1],
          x = eqs[0],
          y = eqs[1],
          upperLimit = this.upperLimit,
          lowerLimit = this.lowerLimit,
          upperLimitEquation = this.upperLimitEquation,
          lowerLimitEquation = this.lowerLimitEquation;

      var relAngle = this.angle = bodyB.angle - bodyA.angle;

      if (this.upperLimitEnabled && relAngle > upperLimit) {
        upperLimitEquation.angle = upperLimit;
        if (eqs.indexOf(upperLimitEquation) === -1) {
          eqs.push(upperLimitEquation);
        }
      } else {
        var idx = eqs.indexOf(upperLimitEquation);
        if (idx !== -1) {
          eqs.splice(idx, 1);
        }
      }

      if (this.lowerLimitEnabled && relAngle < lowerLimit) {
        lowerLimitEquation.angle = lowerLimit;
        if (eqs.indexOf(lowerLimitEquation) === -1) {
          eqs.push(lowerLimitEquation);
        }
      } else {
        var idx = eqs.indexOf(lowerLimitEquation);
        if (idx !== -1) {
          eqs.splice(idx, 1);
        }
      }

      /*

       The constraint violation is

       g = xj + rj - xi - ri

       ...where xi and xj are the body positions and ri and rj world-oriented offset vectors. Differentiate:

       gdot = vj + wj x rj - vi - wi x ri

       We split this into x and y directions. (let x and y be unit vectors along the respective axes)

       gdot * x = ( vj + wj x rj - vi - wi x ri ) * x
       = ( vj*x + (wj x rj)*x -vi*x -(wi x ri)*x
       = ( vj*x + (rj x x)*wj -vi*x -(ri x x)*wi
       = [ -x   -(ri x x)   x   (rj x x)] * [vi wi vj wj]
       = G*W

       ...and similar for y. We have then identified the jacobian entries for x and y directions:

       Gx = [ x   (rj x x)   -x   -(ri x x)]
       Gy = [ y   (rj x y)   -y   -(ri x y)]

       */

      vec2.rotate(worldPivotA, pivotA, bodyA.angle);
      vec2.rotate(worldPivotB, pivotB, bodyB.angle);

      // todo: these are a bit sparse. We could save some computations on making custom eq.computeGW functions, etc

      x.G[0] = -1;
      x.G[1] = 0;
      x.G[2] = -vec2.crossLength(worldPivotA, xAxis);
      x.G[3] = 1;
      x.G[4] = 0;
      x.G[5] = vec2.crossLength(worldPivotB, xAxis);

      y.G[0] = 0;
      y.G[1] = -1;
      y.G[2] = -vec2.crossLength(worldPivotA, yAxis);
      y.G[3] = 0;
      y.G[4] = 1;
      y.G[5] = vec2.crossLength(worldPivotB, yAxis);
    };

    /**
     * Enable the rotational motor
     * @method enableMotor
     */
    RevoluteConstraint.prototype.enableMotor = function () {
      if (this.motorEnabled) {
        return;
      }
      this.equations.push(this.motorEquation);
      this.motorEnabled = true;
    };

    /**
     * Disable the rotational motor
     * @method disableMotor
     */
    RevoluteConstraint.prototype.disableMotor = function () {
      if (!this.motorEnabled) {
        return;
      }
      var i = this.equations.indexOf(this.motorEquation);
      this.equations.splice(i, 1);
      this.motorEnabled = false;
    };

    /**
     * Check if the motor is enabled.
     * @method motorIsEnabled
     * @deprecated use property motorEnabled instead.
     * @return {Boolean}
     */
    RevoluteConstraint.prototype.motorIsEnabled = function () {
      return !!this.motorEnabled;
    };

    /**
     * Set the speed of the rotational constraint motor
     * @method setMotorSpeed
     * @param  {Number} speed
     */
    RevoluteConstraint.prototype.setMotorSpeed = function (speed) {
      if (!this.motorEnabled) {
        return;
      }
      var i = this.equations.indexOf(this.motorEquation);
      this.equations[i].relativeVelocity = speed;
    };

    /**
     * Get the speed of the rotational constraint motor
     * @method getMotorSpeed
     * @return {Number} The current speed, or false if the motor is not enabled.
     */
    RevoluteConstraint.prototype.getMotorSpeed = function () {
      if (!this.motorEnabled) {
        return false;
      }
      return this.motorEquation.relativeVelocity;
    };

  }, {
    "../equations/Equation": 65,
    "../equations/RotationalLockEquation": 67,
    "../equations/RotationalVelocityEquation": 68,
    "../math/vec2": 73,
    "./Constraint": 57
  }],
  63: [function (require, module, exports) {
    var Equation = require("./Equation"),
        vec2 = require('../math/vec2');

    module.exports = AngleLockEquation;

    /**
     * Locks the relative angle between two bodies. The constraint tries to keep the dot product between two vectors, local in each body, to zero. The local angle in body i is a parameter.
     *
     * @class AngleLockEquation
     * @constructor
     * @extends Equation
     * @param {Body} bodyA
     * @param {Body} bodyB
     * @param {Object} [options]
     * @param {Number} [options.angle] Angle to add to the local vector in body A.
     * @param {Number} [options.ratio] Gear ratio
     */
    function AngleLockEquation(bodyA, bodyB, options) {
      options = options || {};
      Equation.call(this, bodyA, bodyB, -Number.MAX_VALUE, Number.MAX_VALUE);
      this.angle = options.angle || 0;

    /**
     * The gear ratio.
     * @property {Number} ratio
     * @private
     * @see setRatio
     */
    this.ratio = typeof(options.ratio) === "number" ? options.ratio : 1;

      this.setRatio(this.ratio);
    }

    AngleLockEquation.prototype = new Equation();
    AngleLockEquation.prototype.constructor = AngleLockEquation;

    AngleLockEquation.prototype.computeGq = function () {
      return this.ratio * this.bodyA.angle - this.bodyB.angle + this.angle;
    };

    /**
     * Set the gear ratio for this equation
     * @method setRatio
     * @param {Number} ratio
     */
    AngleLockEquation.prototype.setRatio = function (ratio) {
      var G = this.G;
      G[2] = ratio;
      G[5] = -1;
      this.ratio = ratio;
    };

    /**
     * Set the max force for the equation.
     * @method setMaxTorque
     * @param {Number} torque
     */
    AngleLockEquation.prototype.setMaxTorque = function (torque) {
      this.maxForce = torque;
      this.minForce = -torque;
    };

  }, {"../math/vec2": 73, "./Equation": 65}],
  64: [function (require, module, exports) {
    var Equation = require("./Equation"),
        vec2 = require('../math/vec2');

    module.exports = ContactEquation;

    /**
     * Non-penetration constraint equation. Tries to make the contactPointA and contactPointB vectors coincide, while keeping the applied force repulsive.
     *
     * @class ContactEquation
     * @constructor
     * @extends Equation
     * @param {Body} bodyA
     * @param {Body} bodyB
     */
    function ContactEquation(bodyA, bodyB) {
      Equation.call(this, bodyA, bodyB, 0, Number.MAX_VALUE);

    /**
     * Vector from body i center of mass to the contact point.
     * @property contactPointA
     * @type {Array}
     */
    this.contactPointA = vec2.create();
      this.penetrationVec = vec2.create();

    /**
     * World-oriented vector from body A center of mass to the contact point.
     * @property contactPointB
     * @type {Array}
     */
    this.contactPointB = vec2.create();

      /**
       * The normal vector, pointing out of body i
       * @property normalA
       * @type {Array}
       */
      this.normalA = vec2.create();

      /**
       * The restitution to use (0=no bounciness, 1=max bounciness).
       * @property restitution
       * @type {Number}
       */
      this.restitution = 0;

    /**
     * This property is set to true if this is the first impact between the bodies (not persistant contact).
     * @property firstImpact
     * @type {Boolean}
     * @readOnly
     */
    this.firstImpact = false;

      /**
       * The shape in body i that triggered this contact.
       * @property shapeA
       * @type {Shape}
       */
      this.shapeA = null;

      /**
       * The shape in body j that triggered this contact.
       * @property shapeB
       * @type {Shape}
       */
      this.shapeB = null;
    }

    ContactEquation.prototype = new Equation();
    ContactEquation.prototype.constructor = ContactEquation;
    ContactEquation.prototype.computeB = function (a, b, h) {
      var bi = this.bodyA,
          bj = this.bodyB,
          ri = this.contactPointA,
          rj = this.contactPointB,
          xi = bi.position,
          xj = bj.position;

      var penetrationVec = this.penetrationVec,
          n = this.normalA,
          G = this.G;

      // Caluclate cross products
      var rixn = vec2.crossLength(ri, n),
          rjxn = vec2.crossLength(rj, n);

      // G = [-n -rixn n rjxn]
      G[0] = -n[0];
      G[1] = -n[1];
      G[2] = -rixn;
      G[3] = n[0];
      G[4] = n[1];
      G[5] = rjxn;

      // Calculate q = xj+rj -(xi+ri) i.e. the penetration vector
      vec2.add(penetrationVec, xj, rj);
      vec2.sub(penetrationVec, penetrationVec, xi);
      vec2.sub(penetrationVec, penetrationVec, ri);

      // Compute iteration
      var GW, Gq;
      if (this.firstImpact && this.restitution !== 0) {
        Gq = 0;
        GW = (1 / b) * (1 + this.restitution) * this.computeGW();
      } else {
        Gq = vec2.dot(n, penetrationVec) + this.offset;
        GW = this.computeGW();
      }

      var GiMf = this.computeGiMf();
      var B = -Gq * a - GW * b - h * GiMf;

      return B;
    };

    var vi = vec2.create();
    var vj = vec2.create();
    var relVel = vec2.create();

    /**
     * Get the relative velocity along the normal vector.
     * @return {number}
     */
    ContactEquation.prototype.getVelocityAlongNormal = function () {

      this.bodyA.getVelocityAtPoint(vi, this.contactPointA);
      this.bodyB.getVelocityAtPoint(vj, this.contactPointB);

      vec2.subtract(relVel, vi, vj);

      return vec2.dot(this.normalA, relVel);
    };
  }, {"../math/vec2": 73, "./Equation": 65}],
  65: [function (require, module, exports) {
    module.exports = Equation;

    var vec2 = require('../math/vec2'),
        Utils = require('../utils/Utils'),
        Body = require('../objects/Body');

    /**
     * Base class for constraint equations.
     * @class Equation
     * @constructor
     * @param {Body} bodyA First body participating in the equation
     * @param {Body} bodyB Second body participating in the equation
     * @param {number} minForce Minimum force to apply. Default: -Number.MAX_VALUE
     * @param {number} maxForce Maximum force to apply. Default: Number.MAX_VALUE
     */
    function Equation(bodyA, bodyB, minForce, maxForce) {

    /**
     * Minimum force to apply when solving.
     * @property minForce
     * @type {Number}
     */
    this.minForce = typeof(minForce) === "undefined" ? -Number.MAX_VALUE : minForce;

    /**
     * Max force to apply when solving.
     * @property maxForce
     * @type {Number}
     */
    this.maxForce = typeof(maxForce) === "undefined" ? Number.MAX_VALUE : maxForce;

    /**
     * First body participating in the constraint
     * @property bodyA
     * @type {Body}
     */
    this.bodyA = bodyA;

    /**
     * Second body participating in the constraint
     * @property bodyB
     * @type {Body}
     */
    this.bodyB = bodyB;

    /**
     * The stiffness of this equation. Typically chosen to a large number (~1e7), but can be chosen somewhat freely to get a stable simulation.
     * @property stiffness
     * @type {Number}
     */
    this.stiffness = Equation.DEFAULT_STIFFNESS;

    /**
     * The number of time steps needed to stabilize the constraint equation. Typically between 3 and 5 time steps.
     * @property relaxation
     * @type {Number}
     */
    this.relaxation = Equation.DEFAULT_RELAXATION;

    /**
     * The Jacobian entry of this equation. 6 numbers, 3 per body (x,y,angle).
     * @property G
     * @type {Array}
     */
    this.G = new Utils.ARRAY_TYPE(6);
      for (var i = 0; i < 6; i++) {
        this.G[i] = 0;
      }

      this.offset = 0;

      this.a = 0;
      this.b = 0;
      this.epsilon = 0;
      this.timeStep = 1 / 60;

    /**
     * Indicates if stiffness or relaxation was changed.
     * @property {Boolean} needsUpdate
     */
    this.needsUpdate = true;

    /**
     * The resulting constraint multiplier from the last solve. This is mostly equivalent to the force produced by the constraint.
     * @property multiplier
     * @type {Number}
     */
    this.multiplier = 0;

    /**
     * Relative velocity.
     * @property {Number} relativeVelocity
     */
    this.relativeVelocity = 0;

    /**
     * Whether this equation is enabled or not. If true, it will be added to the solver.
     * @property {Boolean} enabled
     */
    this.enabled = true;
    }

    Equation.prototype.constructor = Equation;

    /**
     * The default stiffness when creating a new Equation.
     * @static
     * @property {Number} DEFAULT_STIFFNESS
     * @default 1e6
     */
    Equation.DEFAULT_STIFFNESS = 1e6;

    /**
     * The default relaxation when creating a new Equation.
     * @static
     * @property {Number} DEFAULT_RELAXATION
     * @default 4
     */
    Equation.DEFAULT_RELAXATION = 4;

    /**
     * Compute SPOOK parameters .a, .b and .epsilon according to the current parameters. See equations 9, 10 and 11 in the <a href="http://www8.cs.umu.se/kurser/5DV058/VT09/lectures/spooknotes.pdf">SPOOK notes</a>.
     * @method update
     */
    Equation.prototype.update = function () {
      var k = this.stiffness,
          d = this.relaxation,
          h = this.timeStep;

      this.a = 4.0 / (h * (1 + 4 * d));
      this.b = (4.0 * d) / (1 + 4 * d);
      this.epsilon = 4.0 / (h * h * k * (1 + 4 * d));

      this.needsUpdate = false;
    };

    /**
     * Multiply a jacobian entry with corresponding positions or velocities
     * @method gmult
     * @return {Number}
     */
    Equation.prototype.gmult = function (G, vi, wi, vj, wj) {
      return G[0] * vi[0] +
          G[1] * vi[1] +
          G[2] * wi +
          G[3] * vj[0] +
          G[4] * vj[1] +
          G[5] * wj;
    };

    /**
     * Computes the RHS of the SPOOK equation
     * @method computeB
     * @return {Number}
     */
    Equation.prototype.computeB = function (a, b, h) {
      var GW = this.computeGW();
      var Gq = this.computeGq();
      var GiMf = this.computeGiMf();
      return -Gq * a - GW * b - GiMf * h;
    };

    /**
     * Computes G\*q, where q are the generalized body coordinates
     * @method computeGq
     * @return {Number}
     */
    var qi = vec2.create(),
        qj = vec2.create();
    Equation.prototype.computeGq = function () {
      var G = this.G,
          bi = this.bodyA,
          bj = this.bodyB,
          xi = bi.position,
          xj = bj.position,
          ai = bi.angle,
          aj = bj.angle;

      return this.gmult(G, qi, ai, qj, aj) + this.offset;
    };

    /**
     * Computes G\*W, where W are the body velocities
     * @method computeGW
     * @return {Number}
     */
    Equation.prototype.computeGW = function () {
      var G = this.G,
          bi = this.bodyA,
          bj = this.bodyB,
          vi = bi.velocity,
          vj = bj.velocity,
          wi = bi.angularVelocity,
          wj = bj.angularVelocity;
      return this.gmult(G, vi, wi, vj, wj) + this.relativeVelocity;
    };

    /**
     * Computes G\*Wlambda, where W are the body velocities
     * @method computeGWlambda
     * @return {Number}
     */
    Equation.prototype.computeGWlambda = function () {
      var G = this.G,
          bi = this.bodyA,
          bj = this.bodyB,
          vi = bi.vlambda,
          vj = bj.vlambda,
          wi = bi.wlambda,
          wj = bj.wlambda;
      return this.gmult(G, vi, wi, vj, wj);
    };

    /**
     * Computes G\*inv(M)\*f, where M is the mass matrix with diagonal blocks for each body, and f are the forces on the bodies.
     * @method computeGiMf
     * @return {Number}
     */
    var iMfi = vec2.create(),
        iMfj = vec2.create();
    Equation.prototype.computeGiMf = function () {
      var bi = this.bodyA,
          bj = this.bodyB,
          fi = bi.force,
          ti = bi.angularForce,
          fj = bj.force,
          tj = bj.angularForce,
          invMassi = bi.invMassSolve,
          invMassj = bj.invMassSolve,
          invIi = bi.invInertiaSolve,
          invIj = bj.invInertiaSolve,
          G = this.G;

      vec2.scale(iMfi, fi, invMassi);
      vec2.multiply(iMfi, bi.massMultiplier, iMfi);
      vec2.scale(iMfj, fj, invMassj);
      vec2.multiply(iMfj, bj.massMultiplier, iMfj);

      return this.gmult(G, iMfi, ti * invIi, iMfj, tj * invIj);
    };

    /**
     * Computes G\*inv(M)\*G'
     * @method computeGiMGt
     * @return {Number}
     */
    Equation.prototype.computeGiMGt = function () {
      var bi = this.bodyA,
          bj = this.bodyB,
          invMassi = bi.invMassSolve,
          invMassj = bj.invMassSolve,
          invIi = bi.invInertiaSolve,
          invIj = bj.invInertiaSolve,
          G = this.G;

      return G[0] * G[0] * invMassi * bi.massMultiplier[0] +
          G[1] * G[1] * invMassi * bi.massMultiplier[1] +
          G[2] * G[2] * invIi +
          G[3] * G[3] * invMassj * bj.massMultiplier[0] +
          G[4] * G[4] * invMassj * bj.massMultiplier[1] +
          G[5] * G[5] * invIj;
    };

    var addToWlambda_temp = vec2.create(),
        addToWlambda_Gi = vec2.create(),
        addToWlambda_Gj = vec2.create(),
        addToWlambda_ri = vec2.create(),
        addToWlambda_rj = vec2.create(),
        addToWlambda_Mdiag = vec2.create();

    /**
     * Add constraint velocity to the bodies.
     * @method addToWlambda
     * @param {Number} deltalambda
     */
    Equation.prototype.addToWlambda = function (deltalambda) {
      var bi = this.bodyA,
          bj = this.bodyB,
          temp = addToWlambda_temp,
          Gi = addToWlambda_Gi,
          Gj = addToWlambda_Gj,
          ri = addToWlambda_ri,
          rj = addToWlambda_rj,
          invMassi = bi.invMassSolve,
          invMassj = bj.invMassSolve,
          invIi = bi.invInertiaSolve,
          invIj = bj.invInertiaSolve,
          Mdiag = addToWlambda_Mdiag,
          G = this.G;

      Gi[0] = G[0];
      Gi[1] = G[1];
      Gj[0] = G[3];
      Gj[1] = G[4];

      // Add to linear velocity
      // v_lambda += inv(M) * delta_lamba * G
      vec2.scale(temp, Gi, invMassi * deltalambda);
      vec2.multiply(temp, temp, bi.massMultiplier);
      vec2.add(bi.vlambda, bi.vlambda, temp);
      // This impulse is in the offset frame
      // Also add contribution to angular
      //bi.wlambda -= vec2.crossLength(temp,ri);
      bi.wlambda += invIi * G[2] * deltalambda;


      vec2.scale(temp, Gj, invMassj * deltalambda);
      vec2.multiply(temp, temp, bj.massMultiplier);
      vec2.add(bj.vlambda, bj.vlambda, temp);
      //bj.wlambda -= vec2.crossLength(temp,rj);
      bj.wlambda += invIj * G[5] * deltalambda;
    };

    /**
     * Compute the denominator part of the SPOOK equation: C = G\*inv(M)\*G' + eps
     * @method computeInvC
     * @param  {Number} eps
     * @return {Number}
     */
    Equation.prototype.computeInvC = function (eps) {
      return 1.0 / (this.computeGiMGt() + eps);
    };

  }, {"../math/vec2": 73, "../objects/Body": 74, "../utils/Utils": 100}],
  66: [function (require, module, exports) {
    var vec2 = require('../math/vec2')
        , Equation = require('./Equation')
        , Utils = require('../utils/Utils');

    module.exports = FrictionEquation;

    /**
     * Constrains the slipping in a contact along a tangent
     *
     * @class FrictionEquation
     * @constructor
     * @param {Body} bodyA
     * @param {Body} bodyB
     * @param {Number} slipForce
     * @extends Equation
     */
    function FrictionEquation(bodyA, bodyB, slipForce) {
      Equation.call(this, bodyA, bodyB, -slipForce, slipForce);

    /**
     * Relative vector from center of body A to the contact point, world oriented.
     * @property contactPointA
     * @type {Array}
     */
    this.contactPointA = vec2.create();

    /**
     * Relative vector from center of body B to the contact point, world oriented.
     * @property contactPointB
     * @type {Array}
     */
    this.contactPointB = vec2.create();

      /**
       * Tangent vector that the friction force will act along. World oriented.
       * @property t
       * @type {Array}
       */
      this.t = vec2.create();

      /**
       * ContactEquations connected to this friction equation. The contact equations can be used to rescale the max force for the friction. If more than one contact equation is given, then the max force can be set to the average.
       * @property contactEquations
       * @type {ContactEquation}
       */
      this.contactEquations = [];

      /**
       * The shape in body i that triggered this friction.
       * @property shapeA
       * @type {Shape}
       * @todo Needed? The shape can be looked up via contactEquation.shapeA...
       */
      this.shapeA = null;

    /**
     * The shape in body j that triggered this friction.
     * @property shapeB
     * @type {Shape}
     * @todo Needed? The shape can be looked up via contactEquation.shapeB...
     */
    this.shapeB = null;

    /**
     * The friction coefficient to use.
     * @property frictionCoefficient
     * @type {Number}
     */
    this.frictionCoefficient = 0.3;
    }

    FrictionEquation.prototype = new Equation();
    FrictionEquation.prototype.constructor = FrictionEquation;

    /**
     * Set the slipping condition for the constraint. The friction force cannot be
     * larger than this value.
     * @method setSlipForce
     * @param  {Number} slipForce
     */
    FrictionEquation.prototype.setSlipForce = function (slipForce) {
      this.maxForce = slipForce;
      this.minForce = -slipForce;
    };

    /**
     * Get the max force for the constraint.
     * @method getSlipForce
     * @return {Number}
     */
    FrictionEquation.prototype.getSlipForce = function () {
      return this.maxForce;
    };

    FrictionEquation.prototype.computeB = function (a, b, h) {
      var bi = this.bodyA,
          bj = this.bodyB,
          ri = this.contactPointA,
          rj = this.contactPointB,
          t = this.t,
          G = this.G;

      // G = [-t -rixt t rjxt]
      // And remember, this is a pure velocity constraint, g is always zero!
      G[0] = -t[0];
      G[1] = -t[1];
      G[2] = -vec2.crossLength(ri, t);
      G[3] = t[0];
      G[4] = t[1];
      G[5] = vec2.crossLength(rj, t);

      var GW = this.computeGW(),
          GiMf = this.computeGiMf();

      var B = /* - g * a  */ -GW * b - h * GiMf;

      return B;
    };

  }, {"../math/vec2": 73, "../utils/Utils": 100, "./Equation": 65}],
  67: [function (require, module, exports) {
    var Equation = require("./Equation"),
        vec2 = require('../math/vec2');

    module.exports = RotationalLockEquation;

    /**
     * Locks the relative angle between two bodies. The constraint tries to keep the dot product between two vectors, local in each body, to zero. The local angle in body i is a parameter.
     *
     * @class RotationalLockEquation
     * @constructor
     * @extends Equation
     * @param {Body} bodyA
     * @param {Body} bodyB
     * @param {Object} [options]
     * @param {Number} [options.angle] Angle to add to the local vector in bodyA.
     */
    function RotationalLockEquation(bodyA, bodyB, options) {
      options = options || {};
      Equation.call(this, bodyA, bodyB, -Number.MAX_VALUE, Number.MAX_VALUE);

    /**
     * @property {number} angle
     */
    this.angle = options.angle || 0;

      var G = this.G;
      G[2] = 1;
      G[5] = -1;
    }

    RotationalLockEquation.prototype = new Equation();
    RotationalLockEquation.prototype.constructor = RotationalLockEquation;

    var worldVectorA = vec2.create(),
        worldVectorB = vec2.create(),
        xAxis = vec2.fromValues(1, 0),
        yAxis = vec2.fromValues(0, 1);
    RotationalLockEquation.prototype.computeGq = function () {
      vec2.rotate(worldVectorA, xAxis, this.bodyA.angle + this.angle);
      vec2.rotate(worldVectorB, yAxis, this.bodyB.angle);
      return vec2.dot(worldVectorA, worldVectorB);
    };

  }, {"../math/vec2": 73, "./Equation": 65}],
  68: [function (require, module, exports) {
    var Equation = require("./Equation"),
        vec2 = require('../math/vec2');

    module.exports = RotationalVelocityEquation;

    /**
     * Syncs rotational velocity of two bodies, or sets a relative velocity (motor).
     *
     * @class RotationalVelocityEquation
     * @constructor
     * @extends Equation
     * @param {Body} bodyA
     * @param {Body} bodyB
     */
    function RotationalVelocityEquation(bodyA, bodyB) {
      Equation.call(this, bodyA, bodyB, -Number.MAX_VALUE, Number.MAX_VALUE);
      this.relativeVelocity = 1;
      this.ratio = 1;
    }

    RotationalVelocityEquation.prototype = new Equation();
    RotationalVelocityEquation.prototype.constructor = RotationalVelocityEquation;
    RotationalVelocityEquation.prototype.computeB = function (a, b, h) {
      var G = this.G;
      G[2] = -1;
      G[5] = this.ratio;

      var GiMf = this.computeGiMf();
      var GW = this.computeGW();
      var B = -GW * b - h * GiMf;

      return B;
    };

  }, {"../math/vec2": 73, "./Equation": 65}],
  69: [function (require, module, exports) {
    /**
     * Base class for objects that dispatches events.
     * @class EventEmitter
     * @constructor
     */
    var EventEmitter = function () {
    };

    module.exports = EventEmitter;

    EventEmitter.prototype = {
      constructor: EventEmitter,

    /**
     * Add an event listener
     * @method on
     * @param  {String} type
     * @param  {Function} listener
     * @return {EventEmitter} The self object, for chainability.
     */
    on: function (type, listener, context) {
        listener.context = context || this;
      if (this._listeners === undefined) {
        this._listeners = {};
        }
        var listeners = this._listeners;
      if (listeners[type] === undefined) {
        listeners[type] = [];
        }
      if (listeners[type].indexOf(listener) === -1) {
        listeners[type].push(listener);
        }
        return this;
    },

      /**
       * Check if an event listener is added
       * @method has
       * @param  {String} type
       * @param  {Function} listener
       * @return {Boolean}
       */
      has: function (type, listener) {
        if (this._listeners === undefined) {
          return false;
        }
        var listeners = this._listeners;
        if (listener) {
          if (listeners[type] !== undefined && listeners[type].indexOf(listener) !== -1) {
            return true;
            }
        } else {
          if (listeners[type] !== undefined) {
            return true;
          }
        }

        return false;
      },

      /**
       * Remove an event listener
       * @method off
       * @param  {String} type
       * @param  {Function} listener
       * @return {EventEmitter} The self object, for chainability.
       */
      off: function (type, listener) {
        if (this._listeners === undefined) {
          return this;
        }
        var listeners = this._listeners;
        var index = listeners[type].indexOf(listener);
        if (index !== -1) {
          listeners[type].splice(index, 1);
        }
        return this;
      },

      /**
       * Emit an event.
       * @method emit
       * @param  {Object} event
       * @param  {String} event.type
       * @return {EventEmitter} The self object, for chainability.
       */
      emit: function (event) {
        if (this._listeners === undefined) {
          return this;
        }
        var listeners = this._listeners;
        var listenerArray = listeners[event.type];
        if (listenerArray !== undefined) {
          event.target = this;
          for (var i = 0, l = listenerArray.length; i < l; i++) {
            var listener = listenerArray[i];
            listener.call(listener.context, event);
            }
        }
        return this;
      }
    };

  }, {}],
  70: [function (require, module, exports) {
    var Material = require('./Material');
    var Equation = require('../equations/Equation');

    module.exports = ContactMaterial;

    /**
     * Defines what happens when two materials meet, such as what friction coefficient to use. You can also set other things such as restitution, surface velocity and constraint parameters.
     * @class ContactMaterial
     * @constructor
     * @param {Material} materialA
     * @param {Material} materialB
     * @param {Object}   [options]
     * @param {Number}   [options.friction=0.3]       Friction coefficient.
     * @param {Number}   [options.restitution=0]      Restitution coefficient aka "bounciness".
     * @param {Number}   [options.stiffness]          ContactEquation stiffness.
     * @param {Number}   [options.relaxation]         ContactEquation relaxation.
     * @param {Number}   [options.frictionStiffness]  FrictionEquation stiffness.
     * @param {Number}   [options.frictionRelaxation] FrictionEquation relaxation.
     * @param {Number}   [options.surfaceVelocity=0]  Surface velocity.
     * @author schteppe
     */
    function ContactMaterial(materialA, materialB, options) {
      options = options || {};

      if (!(materialA instanceof Material) || !(materialB instanceof Material)) {
        throw new Error("First two arguments must be Material instances.");
    }

      /**
       * The contact material identifier
       * @property id
       * @type {Number}
       */
      this.id = ContactMaterial.idCounter++;

      /**
       * First material participating in the contact material
       * @property materialA
       * @type {Material}
       */
      this.materialA = materialA;

    /**
     * Second material participating in the contact material
     * @property materialB
     * @type {Material}
     */
    this.materialB = materialB;

      /**
       * Friction coefficient to use in the contact of these two materials. Friction = 0 will make the involved objects super slippery, and friction = 1 will make it much less slippery. A friction coefficient larger than 1 will allow for very large friction forces, which can be convenient for preventing car tires not slip on the ground.
       * @property friction
       * @type {Number}
       * @default 0.3
       */
      this.friction = typeof(options.friction) !== "undefined" ? Number(options.friction) : 0.3;

      /**
       * Restitution, or "bounciness" to use in the contact of these two materials. A restitution of 0 will make no bounce, while restitution=1 will approximately bounce back with the same velocity the object came with.
       * @property restitution
       * @type {Number}
       * @default 0
       */
      this.restitution = typeof(options.restitution) !== "undefined" ? Number(options.restitution) : 0;

      /**
       * Hardness of the contact. Less stiffness will make the objects penetrate more, and will make the contact act more like a spring than a contact force. Default value is {{#crossLink "Equation/DEFAULT_STIFFNESS:property"}}Equation.DEFAULT_STIFFNESS{{/crossLink}}.
       * @property stiffness
       * @type {Number}
       */
      this.stiffness = typeof(options.stiffness) !== "undefined" ? Number(options.stiffness) : Equation.DEFAULT_STIFFNESS;

      /**
       * Relaxation of the resulting ContactEquation that this ContactMaterial generate. Default value is {{#crossLink "Equation/DEFAULT_RELAXATION:property"}}Equation.DEFAULT_RELAXATION{{/crossLink}}.
       * @property relaxation
       * @type {Number}
       */
      this.relaxation = typeof(options.relaxation) !== "undefined" ? Number(options.relaxation) : Equation.DEFAULT_RELAXATION;

      /**
       * Stiffness of the resulting friction force. For most cases, the value of this property should be a large number. I cannot think of any case where you would want less frictionStiffness. Default value is {{#crossLink "Equation/DEFAULT_STIFFNESS:property"}}Equation.DEFAULT_STIFFNESS{{/crossLink}}.
       * @property frictionStiffness
       * @type {Number}
       */
      this.frictionStiffness = typeof(options.frictionStiffness) !== "undefined" ? Number(options.frictionStiffness) : Equation.DEFAULT_STIFFNESS;

      /**
       * Relaxation of the resulting friction force. The default value should be good for most simulations. Default value is {{#crossLink "Equation/DEFAULT_RELAXATION:property"}}Equation.DEFAULT_RELAXATION{{/crossLink}}.
       * @property frictionRelaxation
       * @type {Number}
       */
      this.frictionRelaxation = typeof(options.frictionRelaxation) !== "undefined" ? Number(options.frictionRelaxation) : Equation.DEFAULT_RELAXATION;

      /**
       * Will add surface velocity to this material. If bodyA rests on top if bodyB, and the surface velocity is positive, bodyA will slide to the right.
       * @property {Number} surfaceVelocity
       * @default 0
       */
      this.surfaceVelocity = typeof(options.surfaceVelocity) !== "undefined" ? Number(options.surfaceVelocity) : 0;

      /**
       * Offset to be set on ContactEquations. A positive value will make the bodies penetrate more into each other. Can be useful in scenes where contacts need to be more persistent, for example when stacking. Aka "cure for nervous contacts".
       * @property contactSkinSize
       * @type {Number}
       */
      this.contactSkinSize = 0.005;
    }

    ContactMaterial.idCounter = 0;

  }, {"../equations/Equation": 65, "./Material": 71}],
  71: [function (require, module, exports) {
    module.exports = Material;

    /**
     * Defines a physics material.
     * @class Material
     * @constructor
     * @param {number} id Material identifier
     * @author schteppe
     */
    function Material(id) {
    /**
     * The material identifier
     * @property id
     * @type {Number}
     */
    this.id = id || Material.idCounter++;
    }

    Material.idCounter = 0;

  }, {}],
  72: [function (require, module, exports) {

    /*
     PolyK library
     url: http://polyk.ivank.net
     Released under MIT licence.

     Copyright (c) 2012 Ivan Kuckir

     Permission is hereby granted, free of charge, to any person
     obtaining a copy of this software and associated documentation
     files (the "Software"), to deal in the Software without
     restriction, including without limitation the rights to use,
     copy, modify, merge, publish, distribute, sublicense, and/or sell
     copies of the Software, and to permit persons to whom the
     Software is furnished to do so, subject to the following
     conditions:

     The above copyright notice and this permission notice shall be
     included in all copies or substantial portions of the Software.

     THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
     EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
     OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
     NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
     HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
     WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
     FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
     OTHER DEALINGS IN THE SOFTWARE.
     */

    var PolyK = {};

    /*
     Is Polygon self-intersecting?

     O(n^2)
     */
    /*
     PolyK.IsSimple = function(p)
     {
     var n = p.length>>1;
     if(n<4) return true;
     var a1 = new PolyK._P(), a2 = new PolyK._P();
     var b1 = new PolyK._P(), b2 = new PolyK._P();
     var c = new PolyK._P();

     for(var i=0; i<n; i++)
     {
     a1.x = p[2*i  ];
     a1.y = p[2*i+1];
     if(i==n-1)  { a2.x = p[0    ];  a2.y = p[1    ]; }
     else        { a2.x = p[2*i+2];  a2.y = p[2*i+3]; }

     for(var j=0; j<n; j++)
     {
     if(Math.abs(i-j) < 2) continue;
     if(j==n-1 && i==0) continue;
     if(i==n-1 && j==0) continue;

     b1.x = p[2*j  ];
     b1.y = p[2*j+1];
     if(j==n-1)  { b2.x = p[0    ];  b2.y = p[1    ]; }
     else        { b2.x = p[2*j+2];  b2.y = p[2*j+3]; }

     if(PolyK._GetLineIntersection(a1,a2,b1,b2,c) != null) return false;
            }
     }
     return true;
     }

     PolyK.IsConvex = function(p)
     {
     if(p.length<6) return true;
     var l = p.length - 4;
     for(var i=0; i<l; i+=2)
     if(!PolyK._convex(p[i], p[i+1], p[i+2], p[i+3], p[i+4], p[i+5])) return false;
     if(!PolyK._convex(p[l  ], p[l+1], p[l+2], p[l+3], p[0], p[1])) return false;
     if(!PolyK._convex(p[l+2], p[l+3], p[0  ], p[1  ], p[2], p[3])) return false;
     return true;
    }
     */
    PolyK.GetArea = function (p) {
      if (p.length < 6) return 0;
      var l = p.length - 2;
      var sum = 0;
      for (var i = 0; i < l; i += 2)
        sum += (p[i + 2] - p[i]) * (p[i + 1] + p[i + 3]);
      sum += (p[0] - p[l]) * (p[l + 1] + p[1]);
      return -sum * 0.5;
    }
    /*
     PolyK.GetAABB = function(p)
     {
     var minx = Infinity;
     var miny = Infinity;
     var maxx = -minx;
     var maxy = -miny;
     for(var i=0; i<p.length; i+=2)
     {
     minx = Math.min(minx, p[i  ]);
     maxx = Math.max(maxx, p[i  ]);
     miny = Math.min(miny, p[i+1]);
     maxy = Math.max(maxy, p[i+1]);
        }
     return {x:minx, y:miny, width:maxx-minx, height:maxy-miny};
     }
     */

    PolyK.Triangulate = function (p) {
      var n = p.length >> 1;
      if (n < 3) return [];
      var tgs = [];
      var avl = [];
      for (var i = 0; i < n; i++) avl.push(i);

      var i = 0;
      var al = n;
      while (al > 3) {
        var i0 = avl[(i + 0) % al];
        var i1 = avl[(i + 1) % al];
        var i2 = avl[(i + 2) % al];

        var ax = p[2 * i0], ay = p[2 * i0 + 1];
        var bx = p[2 * i1], by = p[2 * i1 + 1];
        var cx = p[2 * i2], cy = p[2 * i2 + 1];

        var earFound = false;
        if (PolyK._convex(ax, ay, bx, by, cx, cy)) {
          earFound = true;
          for (var j = 0; j < al; j++) {
            var vi = avl[j];
            if (vi == i0 || vi == i1 || vi == i2) continue;
            if (PolyK._PointInTriangle(p[2 * vi], p[2 * vi + 1], ax, ay, bx, by, cx, cy)) {
              earFound = false;
              break;
            }
                }
            }
        if (earFound) {
          tgs.push(i0, i1, i2);
          avl.splice((i + 1) % al, 1);
          al--;
          i = 0;
        }
        else if (i++ > 3 * al) break;      // no convex angles :(
        }
      tgs.push(avl[0], avl[1], avl[2]);
      return tgs;
    }
    /*
     PolyK.ContainsPoint = function(p, px, py)
     {
     var n = p.length>>1;
     var ax, ay, bx = p[2*n-2]-px, by = p[2*n-1]-py;
     var depth = 0;
     for(var i=0; i<n; i++)
     {
     ax = bx;  ay = by;
     bx = p[2*i  ] - px;
     by = p[2*i+1] - py;
     if(ay< 0 && by< 0) continue;    // both "up" or both "donw"
     if(ay>=0 && by>=0) continue;    // both "up" or both "donw"
     if(ax< 0 && bx< 0) continue;

     var lx = ax + (bx-ax)*(-ay)/(by-ay);
     if(lx>0) depth++;
        }
     return (depth & 1) == 1;
     }

     PolyK.Slice = function(p, ax, ay, bx, by)
     {
     if(PolyK.ContainsPoint(p, ax, ay) || PolyK.ContainsPoint(p, bx, by)) return [p.slice(0)];

     var a = new PolyK._P(ax, ay);
     var b = new PolyK._P(bx, by);
     var iscs = [];  // intersections
     var ps = [];    // points
     for(var i=0; i<p.length; i+=2) ps.push(new PolyK._P(p[i], p[i+1]));

     for(var i=0; i<ps.length; i++)
     {
     var isc = new PolyK._P(0,0);
     isc = PolyK._GetLineIntersection(a, b, ps[i], ps[(i+1)%ps.length], isc);

     if(isc)
     {
     isc.flag = true;
     iscs.push(isc);
     ps.splice(i+1,0,isc);
     i++;
     }
     }
     if(iscs.length == 0) return [p.slice(0)];
     var comp = function(u,v) {return PolyK._P.dist(a,u) - PolyK._P.dist(a,v); }
     iscs.sort(comp);

     var pgs = [];
     var dir = 0;
     while(iscs.length > 0)
     {
     var n = ps.length;
     var i0 = iscs[0];
     var i1 = iscs[1];
     var ind0 = ps.indexOf(i0);
     var ind1 = ps.indexOf(i1);
     var solved = false;

     if(PolyK._firstWithFlag(ps, ind0) == ind1) solved = true;
     else
     {
     i0 = iscs[1];
     i1 = iscs[0];
     ind0 = ps.indexOf(i0);
     ind1 = ps.indexOf(i1);
     if(PolyK._firstWithFlag(ps, ind0) == ind1) solved = true;
     }
     if(solved)
     {
     dir--;
     var pgn = PolyK._getPoints(ps, ind0, ind1);
     pgs.push(pgn);
     ps = PolyK._getPoints(ps, ind1, ind0);
     i0.flag = i1.flag = false;
     iscs.splice(0,2);
     if(iscs.length == 0) pgs.push(ps);
     }
     else { dir++; iscs.reverse(); }
     if(dir>1) break;
     }
     var result = [];
     for(var i=0; i<pgs.length; i++)
     {
     var pg = pgs[i];
     var npg = [];
     for(var j=0; j<pg.length; j++) npg.push(pg[j].x, pg[j].y);
     result.push(npg);
     }
     return result;
     }

     PolyK.Raycast = function(p, x, y, dx, dy, isc)
     {
     var l = p.length - 2;
     var tp = PolyK._tp;
     var a1 = tp[0], a2 = tp[1],
     b1 = tp[2], b2 = tp[3], c = tp[4];
     a1.x = x; a1.y = y;
     a2.x = x+dx; a2.y = y+dy;

     if(isc==null) isc = {dist:0, edge:0, norm:{x:0, y:0}, refl:{x:0, y:0}};
     isc.dist = Infinity;

     for(var i=0; i<l; i+=2)
     {
     b1.x = p[i  ];  b1.y = p[i+1];
     b2.x = p[i+2];  b2.y = p[i+3];
     var nisc = PolyK._RayLineIntersection(a1, a2, b1, b2, c);
     if(nisc) PolyK._updateISC(dx, dy, a1, b1, b2, c, i/2, isc);
     }
     b1.x = b2.x;  b1.y = b2.y;
     b2.x = p[0];  b2.y = p[1];
     var nisc = PolyK._RayLineIntersection(a1, a2, b1, b2, c);
     if(nisc) PolyK._updateISC(dx, dy, a1, b1, b2, c, p.length/2, isc);

     return (isc.dist != Infinity) ? isc : null;
     }

     PolyK.ClosestEdge = function(p, x, y, isc)
     {
     var l = p.length - 2;
     var tp = PolyK._tp;
     var a1 = tp[0],
     b1 = tp[2], b2 = tp[3], c = tp[4];
     a1.x = x; a1.y = y;

     if(isc==null) isc = {dist:0, edge:0, point:{x:0, y:0}, norm:{x:0, y:0}};
     isc.dist = Infinity;

     for(var i=0; i<l; i+=2)
     {
     b1.x = p[i  ];  b1.y = p[i+1];
     b2.x = p[i+2];  b2.y = p[i+3];
     PolyK._pointLineDist(a1, b1, b2, i>>1, isc);
     }
     b1.x = b2.x;  b1.y = b2.y;
     b2.x = p[0];  b2.y = p[1];
     PolyK._pointLineDist(a1, b1, b2, l>>1, isc);

     var idst = 1/isc.dist;
     isc.norm.x = (x-isc.point.x)*idst;
     isc.norm.y = (y-isc.point.y)*idst;
     return isc;
     }

     PolyK._pointLineDist = function(p, a, b, edge, isc)
     {
     var x = p.x, y = p.y, x1 = a.x, y1 = a.y, x2 = b.x, y2 = b.y;

     var A = x - x1;
     var B = y - y1;
     var C = x2 - x1;
     var D = y2 - y1;

     var dot = A * C + B * D;
     var len_sq = C * C + D * D;
     var param = dot / len_sq;

     var xx, yy;

     if (param < 0 || (x1 == x2 && y1 == y2)) {
     xx = x1;
     yy = y1;
     }
     else if (param > 1) {
     xx = x2;
     yy = y2;
     }
     else {
     xx = x1 + param * C;
     yy = y1 + param * D;
     }

     var dx = x - xx;
     var dy = y - yy;
     var dst = Math.sqrt(dx * dx + dy * dy);
     if(dst<isc.dist)
     {
     isc.dist = dst;
     isc.edge = edge;
     isc.point.x = xx;
     isc.point.y = yy;
     }
     }

     PolyK._updateISC = function(dx, dy, a1, b1, b2, c, edge, isc)
     {
     var nrl = PolyK._P.dist(a1, c);
     if(nrl<isc.dist)
     {
     var ibl = 1/PolyK._P.dist(b1, b2);
     var nx = -(b2.y-b1.y)*ibl;
     var ny =  (b2.x-b1.x)*ibl;
     var ddot = 2*(dx*nx+dy*ny);
     isc.dist = nrl;
     isc.norm.x = nx;
     isc.norm.y = ny;
     isc.refl.x = -ddot*nx+dx;
     isc.refl.y = -ddot*ny+dy;
     isc.edge = edge;
     }
     }

     PolyK._getPoints = function(ps, ind0, ind1)
     {
     var n = ps.length;
     var nps = [];
     if(ind1<ind0) ind1 += n;
     for(var i=ind0; i<= ind1; i++) nps.push(ps[i%n]);
     return nps;
     }

     PolyK._firstWithFlag = function(ps, ind)
     {
     var n = ps.length;
     while(true)
     {
     ind = (ind+1)%n;
     if(ps[ind].flag) return ind;
     }
     }
     */
    PolyK._PointInTriangle = function (px, py, ax, ay, bx, by, cx, cy) {
      var v0x = cx - ax;
      var v0y = cy - ay;
      var v1x = bx - ax;
      var v1y = by - ay;
      var v2x = px - ax;
      var v2y = py - ay;

      var dot00 = v0x * v0x + v0y * v0y;
      var dot01 = v0x * v1x + v0y * v1y;
      var dot02 = v0x * v2x + v0y * v2y;
      var dot11 = v1x * v1x + v1y * v1y;
      var dot12 = v1x * v2x + v1y * v2y;

      var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
      var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
      var v = (dot00 * dot12 - dot01 * dot02) * invDenom;

      // Check if point is in triangle
      return (u >= 0) && (v >= 0) && (u + v < 1);
    }
    /*
     PolyK._RayLineIntersection = function(a1, a2, b1, b2, c)
     {
     var dax = (a1.x-a2.x), dbx = (b1.x-b2.x);
     var day = (a1.y-a2.y), dby = (b1.y-b2.y);

     var Den = dax*dby - day*dbx;
     if (Den == 0) return null;  // parallel

     var A = (a1.x * a2.y - a1.y * a2.x);
     var B = (b1.x * b2.y - b1.y * b2.x);

     var I = c;
     var iDen = 1/Den;
     I.x = ( A*dbx - dax*B ) * iDen;
     I.y = ( A*dby - day*B ) * iDen;

     if(!PolyK._InRect(I, b1, b2)) return null;
     if((day>0 && I.y>a1.y) || (day<0 && I.y<a1.y)) return null;
     if((dax>0 && I.x>a1.x) || (dax<0 && I.x<a1.x)) return null;
     return I;
     }

     PolyK._GetLineIntersection = function(a1, a2, b1, b2, c)
     {
     var dax = (a1.x-a2.x), dbx = (b1.x-b2.x);
     var day = (a1.y-a2.y), dby = (b1.y-b2.y);

     var Den = dax*dby - day*dbx;
     if (Den == 0) return null;  // parallel

     var A = (a1.x * a2.y - a1.y * a2.x);
     var B = (b1.x * b2.y - b1.y * b2.x);

     var I = c;
     I.x = ( A*dbx - dax*B ) / Den;
     I.y = ( A*dby - day*B ) / Den;

     if(PolyK._InRect(I, a1, a2) && PolyK._InRect(I, b1, b2)) return I;
     return null;
     }

     PolyK._InRect = function(a, b, c)
     {
     if  (b.x == c.x) return (a.y>=Math.min(b.y, c.y) && a.y<=Math.max(b.y, c.y));
     if  (b.y == c.y) return (a.x>=Math.min(b.x, c.x) && a.x<=Math.max(b.x, c.x));

     if(a.x >= Math.min(b.x, c.x) && a.x <= Math.max(b.x, c.x)
     && a.y >= Math.min(b.y, c.y) && a.y <= Math.max(b.y, c.y))
     return true;
     return false;
    }
     */
    PolyK._convex = function (ax, ay, bx, by, cx, cy) {
      return (ay - by) * (cx - bx) + (bx - ax) * (cy - by) >= 0;
    }
    /*
     PolyK._P = function(x,y)
     {
     this.x = x;
     this.y = y;
     this.flag = false;
     }
     PolyK._P.prototype.toString = function()
     {
     return "Point ["+this.x+", "+this.y+"]";
     }
     PolyK._P.dist = function(a,b)
     {
     var dx = b.x-a.x;
     var dy = b.y-a.y;
     return Math.sqrt(dx*dx + dy*dy);
     }

     PolyK._tp = [];
     for(var i=0; i<10; i++) PolyK._tp.push(new PolyK._P(0,0));
     */

    module.exports = PolyK;

  }, {}],
  73: [function (require, module, exports) {
    /* Copyright (c) 2013, Brandon Jones, Colin MacKenzie IV. All rights reserved.

     Redistribution and use in source and binary forms, with or without modification,
     are permitted provided that the following conditions are met:

     * Redistributions of source code must retain the above copyright notice, this
     list of conditions and the following disclaimer.
     * Redistributions in binary form must reproduce the above copyright notice,
     this list of conditions and the following disclaimer in the documentation
     and/or other materials provided with the distribution.

     THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
     ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
     WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
     DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
     ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
     (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
     LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
     ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
     (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
     SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. */

    /**
     * The vec2 object from glMatrix, with some extensions and some removed methods. See http://glmatrix.net.
     * @class vec2
     */

    var vec2 = module.exports = {};

    var Utils = require('../utils/Utils');

    /**
     * Make a cross product and only return the z component
     * @method crossLength
     * @static
     * @param  {Array} a
     * @param  {Array} b
     * @return {Number}
     */
    vec2.crossLength = function (a, b) {
      return a[0] * b[1] - a[1] * b[0];
    };

    /**
     * Cross product between a vector and the Z component of a vector
     * @method crossVZ
     * @static
     * @param  {Array} out
     * @param  {Array} vec
     * @param  {Number} zcomp
     * @return {Number}
     */
    vec2.crossVZ = function (out, vec, zcomp) {
      vec2.rotate(out, vec, -Math.PI / 2);// Rotate according to the right hand rule
      vec2.scale(out, out, zcomp);      // Scale with z
      return out;
    };

    /**
     * Cross product between a vector and the Z component of a vector
     * @method crossZV
     * @static
     * @param  {Array} out
     * @param  {Number} zcomp
     * @param  {Array} vec
     * @return {Number}
     */
    vec2.crossZV = function (out, zcomp, vec) {
      vec2.rotate(out, vec, Math.PI / 2); // Rotate according to the right hand rule
      vec2.scale(out, out, zcomp);      // Scale with z
      return out;
    };

    /**
     * Rotate a vector by an angle
     * @method rotate
     * @static
     * @param  {Array} out
     * @param  {Array} a
     * @param  {Number} angle
     */
    vec2.rotate = function (out, a, angle) {
      if (angle !== 0) {
        var c = Math.cos(angle),
            s = Math.sin(angle),
            x = a[0],
            y = a[1];
        out[0] = c * x - s * y;
        out[1] = s * x + c * y;
      } else {
        out[0] = a[0];
        out[1] = a[1];
      }
    };

    /**
     * Rotate a vector 90 degrees clockwise
     * @method rotate90cw
     * @static
     * @param  {Array} out
     * @param  {Array} a
     * @param  {Number} angle
     */
    vec2.rotate90cw = function (out, a) {
      var x = a[0];
      var y = a[1];
      out[0] = y;
      out[1] = -x;
    };

    /**
     * Transform a point position to local frame.
     * @method toLocalFrame
     * @param  {Array} out
     * @param  {Array} worldPoint
     * @param  {Array} framePosition
     * @param  {Number} frameAngle
     */
    vec2.toLocalFrame = function (out, worldPoint, framePosition, frameAngle) {
      vec2.copy(out, worldPoint);
      vec2.sub(out, out, framePosition);
      vec2.rotate(out, out, -frameAngle);
    };

    /**
     * Transform a point position to global frame.
     * @method toGlobalFrame
     * @param  {Array} out
     * @param  {Array} localPoint
     * @param  {Array} framePosition
     * @param  {Number} frameAngle
     */
    vec2.toGlobalFrame = function (out, localPoint, framePosition, frameAngle) {
      vec2.copy(out, localPoint);
      vec2.rotate(out, out, frameAngle);
      vec2.add(out, out, framePosition);
    };

    /**
     * Transform a vector to local frame.
     * @method vectorToLocalFrame
     * @param  {Array} out
     * @param  {Array} worldVector
     * @param  {Number} frameAngle
     */
    vec2.vectorToLocalFrame = function (out, worldVector, frameAngle) {
      vec2.rotate(out, worldVector, -frameAngle);
    };

    /**
     * Transform a point position to global frame.
     * @method toGlobalFrame
     * @param  {Array} out
     * @param  {Array} localVector
     * @param  {Number} frameAngle
     */
    vec2.vectorToGlobalFrame = function (out, localVector, frameAngle) {
      vec2.rotate(out, localVector, frameAngle);
    };

    /**
     * Compute centroid of a triangle spanned by vectors a,b,c. See http://easycalculation.com/analytical/learn-centroid.php
     * @method centroid
     * @static
     * @param  {Array} out
     * @param  {Array} a
     * @param  {Array} b
     * @param  {Array} c
     * @return  {Array} The out object
     */
    vec2.centroid = function (out, a, b, c) {
      vec2.add(out, a, b);
      vec2.add(out, out, c);
      vec2.scale(out, out, 1 / 3);
      return out;
    };

    /**
     * Creates a new, empty vec2
     * @static
     * @method create
     * @return {Array} a new 2D vector
     */
    vec2.create = function () {
      var out = new Utils.ARRAY_TYPE(2);
      out[0] = 0;
      out[1] = 0;
      return out;
    };

    /**
     * Creates a new vec2 initialized with values from an existing vector
     * @static
     * @method clone
     * @param {Array} a vector to clone
     * @return {Array} a new 2D vector
     */
    vec2.clone = function (a) {
      var out = new Utils.ARRAY_TYPE(2);
      out[0] = a[0];
      out[1] = a[1];
      return out;
    };

    /**
     * Creates a new vec2 initialized with the given values
     * @static
     * @method fromValues
     * @param {Number} x X component
     * @param {Number} y Y component
     * @return {Array} a new 2D vector
     */
    vec2.fromValues = function (x, y) {
      var out = new Utils.ARRAY_TYPE(2);
      out[0] = x;
      out[1] = y;
      return out;
    };

    /**
     * Copy the values from one vec2 to another
     * @static
     * @method copy
     * @param {Array} out the receiving vector
     * @param {Array} a the source vector
     * @return {Array} out
     */
    vec2.copy = function (out, a) {
      out[0] = a[0];
      out[1] = a[1];
      return out;
    };

    /**
     * Set the components of a vec2 to the given values
     * @static
     * @method set
     * @param {Array} out the receiving vector
     * @param {Number} x X component
     * @param {Number} y Y component
     * @return {Array} out
     */
    vec2.set = function (out, x, y) {
      out[0] = x;
      out[1] = y;
      return out;
    };

    /**
     * Adds two vec2's
     * @static
     * @method add
     * @param {Array} out the receiving vector
     * @param {Array} a the first operand
     * @param {Array} b the second operand
     * @return {Array} out
     */
    vec2.add = function (out, a, b) {
      out[0] = a[0] + b[0];
      out[1] = a[1] + b[1];
      return out;
    };

    /**
     * Subtracts two vec2's
     * @static
     * @method subtract
     * @param {Array} out the receiving vector
     * @param {Array} a the first operand
     * @param {Array} b the second operand
     * @return {Array} out
     */
    vec2.subtract = function (out, a, b) {
      out[0] = a[0] - b[0];
      out[1] = a[1] - b[1];
      return out;
    };

    /**
     * Alias for vec2.subtract
     * @static
     * @method sub
     */
    vec2.sub = vec2.subtract;

    /**
     * Multiplies two vec2's
     * @static
     * @method multiply
     * @param {Array} out the receiving vector
     * @param {Array} a the first operand
     * @param {Array} b the second operand
     * @return {Array} out
     */
    vec2.multiply = function (out, a, b) {
      out[0] = a[0] * b[0];
      out[1] = a[1] * b[1];
      return out;
    };

    /**
     * Alias for vec2.multiply
     * @static
     * @method mul
     */
    vec2.mul = vec2.multiply;

    /**
     * Divides two vec2's
     * @static
     * @method divide
     * @param {Array} out the receiving vector
     * @param {Array} a the first operand
     * @param {Array} b the second operand
     * @return {Array} out
     */
    vec2.divide = function (out, a, b) {
      out[0] = a[0] / b[0];
      out[1] = a[1] / b[1];
      return out;
    };

    /**
     * Alias for vec2.divide
     * @static
     * @method div
     */
    vec2.div = vec2.divide;

    /**
     * Scales a vec2 by a scalar number
     * @static
     * @method scale
     * @param {Array} out the receiving vector
     * @param {Array} a the vector to scale
     * @param {Number} b amount to scale the vector by
     * @return {Array} out
     */
    vec2.scale = function (out, a, b) {
      out[0] = a[0] * b;
      out[1] = a[1] * b;
      return out;
    };

    /**
     * Calculates the euclidian distance between two vec2's
     * @static
     * @method distance
     * @param {Array} a the first operand
     * @param {Array} b the second operand
     * @return {Number} distance between a and b
     */
    vec2.distance = function (a, b) {
      var x = b[0] - a[0],
          y = b[1] - a[1];
      return Math.sqrt(x * x + y * y);
    };

    /**
     * Alias for vec2.distance
     * @static
     * @method dist
     */
    vec2.dist = vec2.distance;

    /**
     * Calculates the squared euclidian distance between two vec2's
     * @static
     * @method squaredDistance
     * @param {Array} a the first operand
     * @param {Array} b the second operand
     * @return {Number} squared distance between a and b
     */
    vec2.squaredDistance = function (a, b) {
      var x = b[0] - a[0],
          y = b[1] - a[1];
      return x * x + y * y;
    };

    /**
     * Alias for vec2.squaredDistance
     * @static
     * @method sqrDist
     */
    vec2.sqrDist = vec2.squaredDistance;

    /**
     * Calculates the length of a vec2
     * @static
     * @method length
     * @param {Array} a vector to calculate length of
     * @return {Number} length of a
     */
    vec2.length = function (a) {
      var x = a[0],
          y = a[1];
      return Math.sqrt(x * x + y * y);
    };

    /**
     * Alias for vec2.length
     * @method len
     * @static
     */
    vec2.len = vec2.length;

    /**
     * Calculates the squared length of a vec2
     * @static
     * @method squaredLength
     * @param {Array} a vector to calculate squared length of
     * @return {Number} squared length of a
     */
    vec2.squaredLength = function (a) {
      var x = a[0],
          y = a[1];
      return x * x + y * y;
    };

    /**
     * Alias for vec2.squaredLength
     * @static
     * @method sqrLen
     */
    vec2.sqrLen = vec2.squaredLength;

    /**
     * Negates the components of a vec2
     * @static
     * @method negate
     * @param {Array} out the receiving vector
     * @param {Array} a vector to negate
     * @return {Array} out
     */
    vec2.negate = function (out, a) {
      out[0] = -a[0];
      out[1] = -a[1];
      return out;
    };

    /**
     * Normalize a vec2
     * @static
     * @method normalize
     * @param {Array} out the receiving vector
     * @param {Array} a vector to normalize
     * @return {Array} out
     */
    vec2.normalize = function (out, a) {
      var x = a[0],
          y = a[1];
      var len = x * x + y * y;
      if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
      }
      return out;
    };

    /**
     * Calculates the dot product of two vec2's
     * @static
     * @method dot
     * @param {Array} a the first operand
     * @param {Array} b the second operand
     * @return {Number} dot product of a and b
     */
    vec2.dot = function (a, b) {
      return a[0] * b[0] + a[1] * b[1];
    };

    /**
     * Returns a string representation of a vector
     * @static
     * @method str
     * @param {Array} vec vector to represent as a string
     * @return {String} string representation of the vector
     */
    vec2.str = function (a) {
      return 'vec2(' + a[0] + ', ' + a[1] + ')';
    };

    /**
     * Linearly interpolate/mix two vectors.
     * @static
     * @method lerp
     * @param {Array} out
     * @param {Array} a First vector
     * @param {Array} b Second vector
     * @param {number} t Lerp factor
     */
    vec2.lerp = function (out, a, b, t) {
      var ax = a[0],
          ay = a[1];
      out[0] = ax + t * (b[0] - ax);
      out[1] = ay + t * (b[1] - ay);
      return out;
    };

    /**
     * Reflect a vector along a normal.
     * @static
     * @method reflect
     * @param {Array} out
     * @param {Array} vector
     * @param {Array} normal
     */
    vec2.reflect = function (out, vector, normal) {
      var dot = vector[0] * normal[0] + vector[1] * normal[1];
      out[0] = vector[0] - 2 * normal[0] * dot;
      out[1] = vector[1] - 2 * normal[1] * dot;
    };

    /**
     * Get the intersection point between two line segments.
     * @static
     * @method getLineSegmentsIntersection
     * @param  {Array} out
     * @param  {Array} p0
     * @param  {Array} p1
     * @param  {Array} p2
     * @param  {Array} p3
     * @return {boolean} True if there was an intersection, otherwise false.
     */
    vec2.getLineSegmentsIntersection = function (out, p0, p1, p2, p3) {
      var t = vec2.getLineSegmentsIntersectionFraction(p0, p1, p2, p3);
      if (t < 0) {
        return false;
      } else {
        out[0] = p0[0] + (t * (p1[0] - p0[0]));
        out[1] = p0[1] + (t * (p1[1] - p0[1]));
        return true;
      }
    };

    /**
     * Get the intersection fraction between two line segments. If successful, the intersection is at p0 + t * (p1 - p0)
     * @static
     * @method getLineSegmentsIntersectionFraction
     * @param  {Array} p0
     * @param  {Array} p1
     * @param  {Array} p2
     * @param  {Array} p3
     * @return {number} A number between 0 and 1 if there was an intersection, otherwise -1.
     */
    vec2.getLineSegmentsIntersectionFraction = function (p0, p1, p2, p3) {
      var s1_x = p1[0] - p0[0];
      var s1_y = p1[1] - p0[1];
      var s2_x = p3[0] - p2[0];
      var s2_y = p3[1] - p2[1];

      var s, t;
      s = (-s1_y * (p0[0] - p2[0]) + s1_x * (p0[1] - p2[1])) / (-s2_x * s1_y + s1_x * s2_y);
      t = ( s2_x * (p0[1] - p2[1]) - s2_y * (p0[0] - p2[0])) / (-s2_x * s1_y + s1_x * s2_y);
      if (s >= 0 && s <= 1 && t >= 0 && t <= 1) { // Collision detected
        return t;
      }
      return -1; // No collision
    };

  }, {"../utils/Utils": 100}],
  74: [function (require, module, exports) {
    var vec2 = require('../math/vec2')
        , decomp = require('poly-decomp')
        , Convex = require('../shapes/Convex')
        , RaycastResult = require('../collision/RaycastResult')
        , Ray = require('../collision/Ray')
        , AABB = require('../collision/AABB')
        , EventEmitter = require('../events/EventEmitter');

    module.exports = Body;

    /**
     * A rigid body. Has got a center of mass, position, velocity and a number of
     * shapes that are used for collisions.
     *
     * @class Body
     * @constructor
     * @extends EventEmitter
     * @param {Object} [options]
     * @param {Array} [options.force]
     * @param {Array} [options.position]
     * @param {Array} [options.velocity]
     * @param {Boolean} [options.allowSleep]
     * @param {Boolean} [options.collisionResponse]
     * @param {Number} [options.angle=0]
     * @param {Number} [options.angularForce=0]
     * @param {Number} [options.angularVelocity=0]
     * @param {Number} [options.ccdIterations=10]
     * @param {Number} [options.ccdSpeedThreshold=-1]
     * @param {Number} [options.fixedRotation=false]
     * @param {Number} [options.gravityScale]
     * @param {Number} [options.id]
     * @param {Number} [options.mass=0] A number >= 0. If zero, the .type will be set to Body.STATIC.
     * @param {Number} [options.sleepSpeedLimit]
     * @param {Number} [options.sleepTimeLimit]
     *
     * @example
     *
     *     // Create a typical dynamic body
     *     var body = new Body({
 *         mass: 1,
 *         position: [0, 0],
 *         angle: 0,
 *         velocity: [0, 0],
 *         angularVelocity: 0
 *     });
     *
     *     // Add a circular shape to the body
     *     body.addShape(new Circle({ radius: 1 }));
     *
     *     // Add the body to the world
     *     world.addBody(body);
     */
    function Body(options) {
      options = options || {};

      EventEmitter.call(this);

      /**
       * The body identifyer
       * @property id
       * @type {Number}
       */
      this.id = options.id || ++Body._idCounter;

      /**
       * The world that this body is added to. This property is set to NULL if the body is not added to any world.
       * @property world
       * @type {World}
       */
      this.world = null;

      /**
       * The shapes of the body.
       *
       * @property shapes
       * @type {Array}
       */
      this.shapes = [];

      /**
       * The mass of the body.
       * @property mass
       * @type {number}
       */
      this.mass = options.mass || 0;

      /**
       * The inverse mass of the body.
       * @property invMass
       * @type {number}
       */
      this.invMass = 0;

      /**
       * The inertia of the body around the Z axis.
       * @property inertia
       * @type {number}
       */
      this.inertia = 0;

      /**
       * The inverse inertia of the body.
       * @property invInertia
       * @type {number}
       */
      this.invInertia = 0;

      this.invMassSolve = 0;
      this.invInertiaSolve = 0;

      /**
       * Set to true if you want to fix the rotation of the body.
       * @property fixedRotation
       * @type {Boolean}
       */
      this.fixedRotation = !!options.fixedRotation;

      /**
       * Set to true if you want to fix the body movement along the X axis. The body will still be able to move along Y.
       * @property {Boolean} fixedX
       */
      this.fixedX = !!options.fixedX;

      /**
       * Set to true if you want to fix the body movement along the Y axis. The body will still be able to move along X.
       * @property {Boolean} fixedY
       */
      this.fixedY = !!options.fixedY;

      /**
       * @private
       * @property {array} massMultiplier
       */
      this.massMultiplier = vec2.create();

      /**
       * The position of the body
       * @property position
       * @type {Array}
       */
      this.position = vec2.fromValues(0, 0);
      if (options.position) {
        vec2.copy(this.position, options.position);
      }

      /**
       * The interpolated position of the body. Use this for rendering.
       * @property interpolatedPosition
       * @type {Array}
       */
      this.interpolatedPosition = vec2.fromValues(0, 0);

      /**
       * The interpolated angle of the body. Use this for rendering.
       * @property interpolatedAngle
       * @type {Number}
       */
      this.interpolatedAngle = 0;

      /**
       * The previous position of the body.
       * @property previousPosition
       * @type {Array}
       */
      this.previousPosition = vec2.fromValues(0, 0);

      /**
       * The previous angle of the body.
       * @property previousAngle
       * @type {Number}
       */
      this.previousAngle = 0;

      /**
       * The current velocity of the body.
       * @property velocity
       * @type {Array}
       */
      this.velocity = vec2.fromValues(0, 0);
      if (options.velocity) {
        vec2.copy(this.velocity, options.velocity);
      }

      /**
       * Constraint velocity that was added to the body during the last step.
       * @property vlambda
       * @type {Array}
       */
      this.vlambda = vec2.fromValues(0, 0);

      /**
       * Angular constraint velocity that was added to the body during last step.
       * @property wlambda
       * @type {Array}
       */
      this.wlambda = 0;

      /**
       * The angle of the body, in radians.
       * @property angle
       * @type {number}
       * @example
       *     // The angle property is not normalized to the interval 0 to 2*pi, it can be any value.
       *     // If you need a value between 0 and 2*pi, use the following function to normalize it.
       *     function normalizeAngle(angle){
     *         angle = angle % (2*Math.PI);
     *         if(angle < 0){
     *             angle += (2*Math.PI);
     *         }
     *         return angle;
     *     }
       */
      this.angle = options.angle || 0;

      /**
       * The angular velocity of the body, in radians per second.
       * @property angularVelocity
       * @type {number}
       */
      this.angularVelocity = options.angularVelocity || 0;

      /**
       * The force acting on the body. Since the body force (and {{#crossLink "Body/angularForce:property"}}{{/crossLink}}) will be zeroed after each step, so you need to set the force before each step.
       * @property force
       * @type {Array}
       *
       * @example
       *     // This produces a forcefield of 1 Newton in the positive x direction.
       *     for(var i=0; i<numSteps; i++){
     *         body.force[0] = 1;
     *         world.step(1/60);
     *     }
       *
       * @example
       *     // This will apply a rotational force on the body
       *     for(var i=0; i<numSteps; i++){
     *         body.angularForce = -3;
     *         world.step(1/60);
     *     }
       */
      this.force = vec2.create();
      if (options.force) {
        vec2.copy(this.force, options.force);
      }

      /**
       * The angular force acting on the body. See {{#crossLink "Body/force:property"}}{{/crossLink}}.
       * @property angularForce
       * @type {number}
       */
      this.angularForce = options.angularForce || 0;

      /**
       * The linear damping acting on the body in the velocity direction. Should be a value between 0 and 1.
       * @property damping
       * @type {Number}
       * @default 0.1
       */
      this.damping = typeof(options.damping) === "number" ? options.damping : 0.1;

      /**
       * The angular force acting on the body. Should be a value between 0 and 1.
       * @property angularDamping
       * @type {Number}
       * @default 0.1
       */
      this.angularDamping = typeof(options.angularDamping) === "number" ? options.angularDamping : 0.1;

      /**
       * The type of motion this body has. Should be one of: {{#crossLink "Body/STATIC:property"}}Body.STATIC{{/crossLink}}, {{#crossLink "Body/DYNAMIC:property"}}Body.DYNAMIC{{/crossLink}} and {{#crossLink "Body/KINEMATIC:property"}}Body.KINEMATIC{{/crossLink}}.
       *
       * * Static bodies do not move, and they do not respond to forces or collision.
       * * Dynamic bodies body can move and respond to collisions and forces.
       * * Kinematic bodies only moves according to its .velocity, and does not respond to collisions or force.
       *
       * @property type
       * @type {number}
       *
       * @example
       *     // Bodies are static by default. Static bodies will never move.
       *     var body = new Body();
       *     console.log(body.type == Body.STATIC); // true
       *
       * @example
       *     // By setting the mass of a body to a nonzero number, the body
       *     // will become dynamic and will move and interact with other bodies.
       *     var dynamicBody = new Body({
     *         mass : 1
     *     });
       *     console.log(dynamicBody.type == Body.DYNAMIC); // true
       *
       * @example
       *     // Kinematic bodies will only move if you change their velocity.
       *     var kinematicBody = new Body({
     *         type: Body.KINEMATIC // Type can be set via the options object.
     *     });
       */
      this.type = Body.STATIC;

      if (typeof(options.type) !== 'undefined') {
        this.type = options.type;
      } else if (!options.mass) {
        this.type = Body.STATIC;
      } else {
        this.type = Body.DYNAMIC;
    }

      /**
       * Bounding circle radius.
       * @property boundingRadius
       * @type {Number}
       */
      this.boundingRadius = 0;

      /**
       * Bounding box of this body.
       * @property aabb
       * @type {AABB}
       */
      this.aabb = new AABB();

      /**
       * Indicates if the AABB needs update. Update it with {{#crossLink "Body/updateAABB:method"}}.updateAABB(){{/crossLink}}.
       * @property aabbNeedsUpdate
       * @type {Boolean}
       * @see updateAABB
       *
       * @example
       *     // Force update the AABB
       *     body.aabbNeedsUpdate = true;
       *     body.updateAABB();
       *     console.log(body.aabbNeedsUpdate); // false
       */
      this.aabbNeedsUpdate = true;

      /**
       * If true, the body will automatically fall to sleep. Note that you need to enable sleeping in the {{#crossLink "World"}}{{/crossLink}} before anything will happen.
       * @property allowSleep
       * @type {Boolean}
       * @default true
       */
      this.allowSleep = options.allowSleep !== undefined ? options.allowSleep : true;

      this.wantsToSleep = false;

      /**
       * One of {{#crossLink "Body/AWAKE:property"}}Body.AWAKE{{/crossLink}}, {{#crossLink "Body/SLEEPY:property"}}Body.SLEEPY{{/crossLink}} and {{#crossLink "Body/SLEEPING:property"}}Body.SLEEPING{{/crossLink}}.
       *
       * The body is initially Body.AWAKE. If its velocity norm is below .sleepSpeedLimit, the sleepState will become Body.SLEEPY. If the body continues to be Body.SLEEPY for .sleepTimeLimit seconds, it will fall asleep (Body.SLEEPY).
       *
       * @property sleepState
       * @type {Number}
       * @default Body.AWAKE
       */
      this.sleepState = Body.AWAKE;

      /**
       * If the speed (the norm of the velocity) is smaller than this value, the body is considered sleepy.
       * @property sleepSpeedLimit
       * @type {Number}
       * @default 0.2
       */
      this.sleepSpeedLimit = options.sleepSpeedLimit !== undefined ? options.sleepSpeedLimit : 0.2;

      /**
       * If the body has been sleepy for this sleepTimeLimit seconds, it is considered sleeping.
       * @property sleepTimeLimit
       * @type {Number}
       * @default 1
       */
      this.sleepTimeLimit = options.sleepTimeLimit !== undefined ? options.sleepTimeLimit : 1;

      /**
       * Gravity scaling factor. If you want the body to ignore gravity, set this to zero. If you want to reverse gravity, set it to -1.
       * @property {Number} gravityScale
       * @default 1
       */
      this.gravityScale = options.gravityScale !== undefined ? options.gravityScale : 1;

      /**
       * Whether to produce contact forces when in contact with other bodies. Note that contacts will be generated, but they will be disabled. That means that this body will move through other bodies, but it will still trigger contact events, etc.
       * @property {Boolean} collisionResponse
       */
      this.collisionResponse = options.collisionResponse !== undefined ? options.collisionResponse : true;

      /**
       * How long the body has been sleeping.
       * @property {Number} idleTime
       */
      this.idleTime = 0;

    /**
     * The last time when the body went to SLEEPY state.
     * @property {Number} timeLastSleepy
     * @private
     */
    this.timeLastSleepy = 0;

      /**
       * If the body speed exceeds this threshold, CCD (continuous collision detection) will be enabled. Set it to a negative number to disable CCD completely for this body.
       * @property {number} ccdSpeedThreshold
       * @default -1
       */
      this.ccdSpeedThreshold = options.ccdSpeedThreshold !== undefined ? options.ccdSpeedThreshold : -1;

      /**
       * The number of iterations that should be used when searching for the time of impact during CCD. A larger number will assure that there's a small penetration on CCD collision, but a small number will give more performance.
       * @property {number} ccdIterations
       * @default 10
       */
      this.ccdIterations = options.ccdIterations !== undefined ? options.ccdIterations : 10;

      this.concavePath = null;

      this._wakeUpAfterNarrowphase = false;

      this.updateMassProperties();
    }

    Body.prototype = new EventEmitter();
    Body.prototype.constructor = Body;

    Body._idCounter = 0;

    /**
     * @private
     * @method updateSolveMassProperties
     */
    Body.prototype.updateSolveMassProperties = function () {
      if (this.sleepState === Body.SLEEPING || this.type === Body.KINEMATIC) {
        this.invMassSolve = 0;
        this.invInertiaSolve = 0;
      } else {
        this.invMassSolve = this.invMass;
        this.invInertiaSolve = this.invInertia;
      }
    };

    /**
     * Set the total density of the body
     * @method setDensity
     * @param {number} density
     */
    Body.prototype.setDensity = function (density) {
      var totalArea = this.getArea();
      this.mass = totalArea * density;
      this.updateMassProperties();
    };

    /**
     * Get the total area of all shapes in the body
     * @method getArea
     * @return {Number}
     */
    Body.prototype.getArea = function () {
      var totalArea = 0;
      for (var i = 0; i < this.shapes.length; i++) {
        totalArea += this.shapes[i].area;
      }
      return totalArea;
    };

    /**
     * Get the AABB from the body. The AABB is updated if necessary.
     * @method getAABB
     * @return {AABB} The AABB instance (this.aabb)
     */
    Body.prototype.getAABB = function () {
      if (this.aabbNeedsUpdate) {
        this.updateAABB();
      }
      return this.aabb;
    };

    var shapeAABB = new AABB(),
        tmp = vec2.create();

    /**
     * Updates the AABB of the Body, and set .aabbNeedsUpdate = false.
     * @method updateAABB
     */
    Body.prototype.updateAABB = function () {
      var shapes = this.shapes,
          N = shapes.length,
          offset = tmp,
          bodyAngle = this.angle;

      for (var i = 0; i !== N; i++) {
        var shape = shapes[i],
            angle = shape.angle + bodyAngle;

        // Get shape world offset
        vec2.rotate(offset, shape.position, bodyAngle);
        vec2.add(offset, offset, this.position);

        // Get shape AABB
        shape.computeAABB(shapeAABB, offset, angle);

        if (i === 0) {
          this.aabb.copy(shapeAABB);
        } else {
          this.aabb.extend(shapeAABB);
        }
      }

      this.aabbNeedsUpdate = false;
    };

    /**
     * Update the bounding radius of the body (this.boundingRadius). Should be done if any of the shape dimensions or positions are changed.
     * @method updateBoundingRadius
     */
    Body.prototype.updateBoundingRadius = function () {
      var shapes = this.shapes,
          N = shapes.length,
          radius = 0;

      for (var i = 0; i !== N; i++) {
        var shape = shapes[i],
            offset = vec2.length(shape.position),
            r = shape.boundingRadius;
        if (offset + r > radius) {
          radius = offset + r;
        }
      }

      this.boundingRadius = radius;
    };

    /**
     * Add a shape to the body. You can pass a local transform when adding a shape,
     * so that the shape gets an offset and angle relative to the body center of mass.
     * Will automatically update the mass properties and bounding radius.
     *
     * @method addShape
     * @param  {Shape}              shape
     * @param  {Array} [offset] Local body offset of the shape.
     * @param  {Number}             [angle]  Local body angle.
     *
     * @example
     *     var body = new Body(),
     *         shape = new Circle({ radius: 1 });
     *
     *     // Add the shape to the body, positioned in the center
     *     body.addShape(shape);
     *
     *     // Add another shape to the body, positioned 1 unit length from the body center of mass along the local x-axis.
     *     body.addShape(shape,[1,0]);
     *
     *     // Add another shape to the body, positioned 1 unit length from the body center of mass along the local y-axis, and rotated 90 degrees CCW.
     *     body.addShape(shape,[0,1],Math.PI/2);
     */
    Body.prototype.addShape = function (shape, offset, angle) {
      if (shape.body) {
        throw new Error('A shape can only be added to one body.');
      }
      shape.body = this;

      // Copy the offset vector
      if (offset) {
        vec2.copy(shape.position, offset);
      } else {
        vec2.set(shape.position, 0, 0);
      }

      shape.angle = angle || 0;

      this.shapes.push(shape);
      this.updateMassProperties();
      this.updateBoundingRadius();

      this.aabbNeedsUpdate = true;
    };

    /**
     * Remove a shape
     * @method removeShape
     * @param  {Shape} shape
     * @return {Boolean} True if the shape was found and removed, else false.
     */
    Body.prototype.removeShape = function (shape) {
      var idx = this.shapes.indexOf(shape);

      if (idx !== -1) {
        this.shapes.splice(idx, 1);
        this.aabbNeedsUpdate = true;
        shape.body = null;
        return true;
      } else {
        return false;
      }
    };

    /**
     * Updates .inertia, .invMass, .invInertia for this Body. Should be called when
     * changing the structure or mass of the Body.
     *
     * @method updateMassProperties
     *
     * @example
     *     body.mass += 1;
     *     body.updateMassProperties();
     */
    Body.prototype.updateMassProperties = function () {
      if (this.type === Body.STATIC || this.type === Body.KINEMATIC) {

        this.mass = Number.MAX_VALUE;
        this.invMass = 0;
        this.inertia = Number.MAX_VALUE;
        this.invInertia = 0;

      } else {

        var shapes = this.shapes,
            N = shapes.length,
            m = this.mass / N,
            I = 0;

        if (!this.fixedRotation) {
          for (var i = 0; i < N; i++) {
            var shape = shapes[i],
                r2 = vec2.squaredLength(shape.position),
                Icm = shape.computeMomentOfInertia(m);
            I += Icm + m * r2;
            }
          this.inertia = I;
          this.invInertia = I > 0 ? 1 / I : 0;

        } else {
          this.inertia = Number.MAX_VALUE;
          this.invInertia = 0;
        }

        // Inverse mass properties are easy
        this.invMass = 1 / this.mass;

        vec2.set(
            this.massMultiplier,
            this.fixedX ? 0 : 1,
            this.fixedY ? 0 : 1
        );
      }
    };

    var Body_applyForce_r = vec2.create();

    /**
     * Apply force to a point relative to the center of mass of the body. This could for example be a point on the RigidBody surface. Applying force this way will add to Body.force and Body.angularForce. If relativePoint is zero, the force will be applied directly on the center of mass, and the torque produced will be zero.
     * @method applyForce
     * @param {Array} force The force to add.
     * @param {Array} [relativePoint] A world point to apply the force on.
     */
    Body.prototype.applyForce = function (force, relativePoint) {

      // Add linear force
      vec2.add(this.force, this.force, force);

      if (relativePoint) {

        // Compute produced rotational force
        var rotForce = vec2.crossLength(relativePoint, force);

        // Add rotational force
        this.angularForce += rotForce;
      }
    };

    /**
     * Apply force to a body-local point.
     * @method applyForceLocal
     * @param  {Array} localForce The force vector to add, oriented in local body space.
     * @param  {Array} [localPoint] A point relative to the body in world space. If not given, it is set to zero and all of the impulse will be excerted on the center of mass.
     */
    var Body_applyForce_forceWorld = vec2.create();
    var Body_applyForce_pointWorld = vec2.create();
    var Body_applyForce_pointLocal = vec2.create();
    Body.prototype.applyForceLocal = function (localForce, localPoint) {
      localPoint = localPoint || Body_applyForce_pointLocal;
      var worldForce = Body_applyForce_forceWorld;
      var worldPoint = Body_applyForce_pointWorld;
      this.vectorToWorldFrame(worldForce, localForce);
      this.vectorToWorldFrame(worldPoint, localPoint);
      this.applyForce(worldForce, worldPoint);
    };

    /**
     * Apply impulse to a point relative to the body. This could for example be a point on the Body surface. An impulse is a force added to a body during a short period of time (impulse = force * time). Impulses will be added to Body.velocity and Body.angularVelocity.
     * @method applyImpulse
     * @param  {Array} impulse The impulse vector to add, oriented in world space.
     * @param  {Array} [relativePoint] A point relative to the body in world space. If not given, it is set to zero and all of the impulse will be excerted on the center of mass.
     */
    var Body_applyImpulse_velo = vec2.create();
    Body.prototype.applyImpulse = function (impulseVector, relativePoint) {
      if (this.type !== Body.DYNAMIC) {
        return;
      }

      // Compute produced central impulse velocity
      var velo = Body_applyImpulse_velo;
      vec2.scale(velo, impulseVector, this.invMass);
      vec2.multiply(velo, this.massMultiplier, velo);

      // Add linear impulse
      vec2.add(this.velocity, velo, this.velocity);

      if (relativePoint) {
        // Compute produced rotational impulse velocity
        var rotVelo = vec2.crossLength(relativePoint, impulseVector);
        rotVelo *= this.invInertia;

        // Add rotational Impulse
        this.angularVelocity += rotVelo;
      }
    };

    /**
     * Apply impulse to a point relative to the body. This could for example be a point on the Body surface. An impulse is a force added to a body during a short period of time (impulse = force * time). Impulses will be added to Body.velocity and Body.angularVelocity.
     * @method applyImpulseLocal
     * @param  {Array} impulse The impulse vector to add, oriented in world space.
     * @param  {Array} [relativePoint] A point relative to the body in world space. If not given, it is set to zero and all of the impulse will be excerted on the center of mass.
     */
    var Body_applyImpulse_impulseWorld = vec2.create();
    var Body_applyImpulse_pointWorld = vec2.create();
    var Body_applyImpulse_pointLocal = vec2.create();
    Body.prototype.applyImpulseLocal = function (localImpulse, localPoint) {
      localPoint = localPoint || Body_applyImpulse_pointLocal;
      var worldImpulse = Body_applyImpulse_impulseWorld;
      var worldPoint = Body_applyImpulse_pointWorld;
      this.vectorToWorldFrame(worldImpulse, localImpulse);
      this.vectorToWorldFrame(worldPoint, localPoint);
      this.applyImpulse(worldImpulse, worldPoint);
    };

    /**
     * Transform a world point to local body frame.
     * @method toLocalFrame
     * @param  {Array} out          The vector to store the result in
     * @param  {Array} worldPoint   The input world point
     */
    Body.prototype.toLocalFrame = function (out, worldPoint) {
      vec2.toLocalFrame(out, worldPoint, this.position, this.angle);
    };

    /**
     * Transform a local point to world frame.
     * @method toWorldFrame
     * @param  {Array} out          The vector to store the result in
     * @param  {Array} localPoint   The input local point
     */
    Body.prototype.toWorldFrame = function (out, localPoint) {
      vec2.toGlobalFrame(out, localPoint, this.position, this.angle);
    };

    /**
     * Transform a world point to local body frame.
     * @method vectorToLocalFrame
     * @param  {Array} out          The vector to store the result in
     * @param  {Array} worldVector  The input world vector
     */
    Body.prototype.vectorToLocalFrame = function (out, worldVector) {
      vec2.vectorToLocalFrame(out, worldVector, this.angle);
    };

    /**
     * Transform a local point to world frame.
     * @method vectorToWorldFrame
     * @param  {Array} out          The vector to store the result in
     * @param  {Array} localVector  The input local vector
     */
    Body.prototype.vectorToWorldFrame = function (out, localVector) {
      vec2.vectorToGlobalFrame(out, localVector, this.angle);
    };

    /**
     * Reads a polygon shape path, and assembles convex shapes from that and puts them at proper offset points.
     * @method fromPolygon
     * @param {Array} path An array of 2d vectors, e.g. [[0,0],[0,1],...] that resembles a concave or convex polygon. The shape must be simple and without holes.
     * @param {Object} [options]
     * @param {Boolean} [options.optimalDecomp=false]   Set to true if you need optimal decomposition. Warning: very slow for polygons with more than 10 vertices.
     * @param {Boolean} [options.skipSimpleCheck=false] Set to true if you already know that the path is not intersecting itself.
     * @param {Boolean|Number} [options.removeCollinearPoints=false] Set to a number (angle threshold value) to remove collinear points, or false to keep all points.
     * @return {Boolean} True on success, else false.
     */
    Body.prototype.fromPolygon = function (path, options) {
      options = options || {};

      // Remove all shapes
      for (var i = this.shapes.length; i >= 0; --i) {
        this.removeShape(this.shapes[i]);
      }

      var p = new decomp.Polygon();
      p.vertices = path;

      // Make it counter-clockwise
      p.makeCCW();

      if (typeof(options.removeCollinearPoints) === "number") {
        p.removeCollinearPoints(options.removeCollinearPoints);
      }

      // Check if any line segment intersects the path itself
      if (typeof(options.skipSimpleCheck) === "undefined") {
        if (!p.isSimple()) {
          return false;
        }
      }

      // Save this path for later
      this.concavePath = p.vertices.slice(0);
      for (var i = 0; i < this.concavePath.length; i++) {
        var v = [0, 0];
        vec2.copy(v, this.concavePath[i]);
        this.concavePath[i] = v;
      }

      // Slow or fast decomp?
      var convexes;
      if (options.optimalDecomp) {
        convexes = p.decomp();
      } else {
        convexes = p.quickDecomp();
      }

      var cm = vec2.create();

      // Add convexes
      for (var i = 0; i !== convexes.length; i++) {
        // Create convex
        var c = new Convex({vertices: convexes[i].vertices});

        // Move all vertices so its center of mass is in the local center of the convex
        for (var j = 0; j !== c.vertices.length; j++) {
          var v = c.vertices[j];
          vec2.sub(v, v, c.centerOfMass);
        }

        vec2.scale(cm, c.centerOfMass, 1);
        c.updateTriangles();
        c.updateCenterOfMass();
        c.updateBoundingRadius();

        // Add the shape
        this.addShape(c, cm);
      }

      this.adjustCenterOfMass();

      this.aabbNeedsUpdate = true;

      return true;
    };

    var adjustCenterOfMass_tmp1 = vec2.fromValues(0, 0),
        adjustCenterOfMass_tmp2 = vec2.fromValues(0, 0),
        adjustCenterOfMass_tmp3 = vec2.fromValues(0, 0),
        adjustCenterOfMass_tmp4 = vec2.fromValues(0, 0);

    /**
     * Moves the shape offsets so their center of mass becomes the body center of mass.
     * @method adjustCenterOfMass
     */
    Body.prototype.adjustCenterOfMass = function () {
      var offset_times_area = adjustCenterOfMass_tmp2,
          sum = adjustCenterOfMass_tmp3,
          cm = adjustCenterOfMass_tmp4,
          totalArea = 0;
      vec2.set(sum, 0, 0);

      for (var i = 0; i !== this.shapes.length; i++) {
        var s = this.shapes[i];
        vec2.scale(offset_times_area, s.position, s.area);
        vec2.add(sum, sum, offset_times_area);
        totalArea += s.area;
      }

      vec2.scale(cm, sum, 1 / totalArea);

      // Now move all shapes
      for (var i = 0; i !== this.shapes.length; i++) {
        var s = this.shapes[i];
        vec2.sub(s.position, s.position, cm);
      }

      // Move the body position too
      vec2.add(this.position, this.position, cm);

      // And concave path
      for (var i = 0; this.concavePath && i < this.concavePath.length; i++) {
        vec2.sub(this.concavePath[i], this.concavePath[i], cm);
      }

      this.updateMassProperties();
      this.updateBoundingRadius();
    };

    /**
     * Sets the force on the body to zero.
     * @method setZeroForce
     */
    Body.prototype.setZeroForce = function () {
      vec2.set(this.force, 0.0, 0.0);
      this.angularForce = 0.0;
    };

    Body.prototype.resetConstraintVelocity = function () {
      var b = this,
          vlambda = b.vlambda;
      vec2.set(vlambda, 0, 0);
      b.wlambda = 0;
    };

    Body.prototype.addConstraintVelocity = function () {
      var b = this,
          v = b.velocity;
      vec2.add(v, v, b.vlambda);
      b.angularVelocity += b.wlambda;
    };

    /**
     * Apply damping, see <a href="http://code.google.com/p/bullet/issues/detail?id=74">this</a> for details.
     * @method applyDamping
     * @param  {number} dt Current time step
     */
    Body.prototype.applyDamping = function (dt) {
      if (this.type === Body.DYNAMIC) { // Only for dynamic bodies
        var v = this.velocity;
        vec2.scale(v, v, Math.pow(1.0 - this.damping, dt));
        this.angularVelocity *= Math.pow(1.0 - this.angularDamping, dt);
      }
    };

    /**
     * Wake the body up. Normally you should not need this, as the body is automatically awoken at events such as collisions.
     * Sets the sleepState to {{#crossLink "Body/AWAKE:property"}}Body.AWAKE{{/crossLink}} and emits the wakeUp event if the body wasn't awake before.
     * @method wakeUp
     */
    Body.prototype.wakeUp = function () {
      var s = this.sleepState;
      this.sleepState = Body.AWAKE;
      this.idleTime = 0;
      if (s !== Body.AWAKE) {
        this.emit(Body.wakeUpEvent);
      }
    };

    /**
     * Force body sleep
     * @method sleep
     */
    Body.prototype.sleep = function () {
      this.sleepState = Body.SLEEPING;
      this.angularVelocity = 0;
      this.angularForce = 0;
      vec2.set(this.velocity, 0, 0);
      vec2.set(this.force, 0, 0);
      this.emit(Body.sleepEvent);
    };

    /**
     * Called every timestep to update internal sleep timer and change sleep state if needed.
     * @method sleepTick
     * @param {number} time The world time in seconds
     * @param {boolean} dontSleep
     * @param {number} dt
     */
    Body.prototype.sleepTick = function (time, dontSleep, dt) {
      if (!this.allowSleep || this.type === Body.SLEEPING) {
        return;
      }

      this.wantsToSleep = false;

      var sleepState = this.sleepState,
          speedSquared = vec2.squaredLength(this.velocity) + Math.pow(this.angularVelocity, 2),
          speedLimitSquared = Math.pow(this.sleepSpeedLimit, 2);

      // Add to idle time
      if (speedSquared >= speedLimitSquared) {
        this.idleTime = 0;
        this.sleepState = Body.AWAKE;
      } else {
        this.idleTime += dt;
        this.sleepState = Body.SLEEPY;
      }
      if (this.idleTime > this.sleepTimeLimit) {
        if (!dontSleep) {
          this.sleep();
        } else {
          this.wantsToSleep = true;
        }
      }
    };

    /**
     * Check if the body is overlapping another body. Note that this method only works if the body was added to a World and if at least one step was taken.
     * @method overlaps
     * @param  {Body} body
     * @return {boolean}
     */
    Body.prototype.overlaps = function (body) {
      return this.world.overlapKeeper.bodiesAreOverlapping(this, body);
    };

    var integrate_fhMinv = vec2.create();
    var integrate_velodt = vec2.create();

    /**
     * Move the body forward in time given its current velocity.
     * @method integrate
     * @param  {Number} dt
     */
    Body.prototype.integrate = function (dt) {
      var minv = this.invMass,
          f = this.force,
          pos = this.position,
          velo = this.velocity;

      // Save old position
      vec2.copy(this.previousPosition, this.position);
      this.previousAngle = this.angle;

      // Velocity update
      if (!this.fixedRotation) {
        this.angularVelocity += this.angularForce * this.invInertia * dt;
      }
      vec2.scale(integrate_fhMinv, f, dt * minv);
      vec2.multiply(integrate_fhMinv, this.massMultiplier, integrate_fhMinv);
      vec2.add(velo, integrate_fhMinv, velo);

      // CCD
      if (!this.integrateToTimeOfImpact(dt)) {

        // Regular position update
        vec2.scale(integrate_velodt, velo, dt);
        vec2.add(pos, pos, integrate_velodt);
        if (!this.fixedRotation) {
          this.angle += this.angularVelocity * dt;
        }
      }

      this.aabbNeedsUpdate = true;
    };

    var result = new RaycastResult();
    var ray = new Ray({
      mode: Ray.ALL
    });
    var direction = vec2.create();
    var end = vec2.create();
    var startToEnd = vec2.create();
    var rememberPosition = vec2.create();
    Body.prototype.integrateToTimeOfImpact = function (dt) {

      if (this.ccdSpeedThreshold < 0 || vec2.squaredLength(this.velocity) < Math.pow(this.ccdSpeedThreshold, 2)) {
        return false;
      }

      vec2.normalize(direction, this.velocity);

      vec2.scale(end, this.velocity, dt);
      vec2.add(end, end, this.position);

      vec2.sub(startToEnd, end, this.position);
      var startToEndAngle = this.angularVelocity * dt;
      var len = vec2.length(startToEnd);

      var timeOfImpact = 1;

      var hit;
      var that = this;
      result.reset();
      ray.callback = function (result) {
        if (result.body === that) {
          return;
        }
        hit = result.body;
        result.getHitPoint(end, ray);
        vec2.sub(startToEnd, end, that.position);
        timeOfImpact = vec2.length(startToEnd) / len;
        result.stop();
      };
      vec2.copy(ray.from, this.position);
      vec2.copy(ray.to, end);
      ray.update();
      this.world.raycast(result, ray);

      if (!hit) {
        return false;
      }

      var rememberAngle = this.angle;
      vec2.copy(rememberPosition, this.position);

      // Got a start and end point. Approximate time of impact using binary search
      var iter = 0;
      var tmin = 0;
      var tmid = 0;
      var tmax = timeOfImpact;
      while (tmax >= tmin && iter < this.ccdIterations) {
        iter++;

        // calculate the midpoint
        tmid = (tmax - tmin) / 2;

        // Move the body to that point
        vec2.scale(integrate_velodt, startToEnd, timeOfImpact);
        vec2.add(this.position, rememberPosition, integrate_velodt);
        this.angle = rememberAngle + startToEndAngle * timeOfImpact;
        this.updateAABB();

        // check overlap
        var overlaps = this.aabb.overlaps(hit.aabb) && this.world.narrowphase.bodiesOverlap(this, hit);

        if (overlaps) {
          // change min to search upper interval
          tmin = tmid;
        } else {
          // change max to search lower interval
          tmax = tmid;
        }
      }

      timeOfImpact = tmid;

      vec2.copy(this.position, rememberPosition);
      this.angle = rememberAngle;

      // move to TOI
      vec2.scale(integrate_velodt, startToEnd, timeOfImpact);
      vec2.add(this.position, this.position, integrate_velodt);
      if (!this.fixedRotation) {
        this.angle += startToEndAngle * timeOfImpact;
      }

      return true;
    };

    /**
     * Get velocity of a point in the body.
     * @method getVelocityAtPoint
     * @param  {Array} result A vector to store the result in
     * @param  {Array} relativePoint A world oriented vector, indicating the position of the point to get the velocity from
     * @return {Array} The result vector
     */
    Body.prototype.getVelocityAtPoint = function (result, relativePoint) {
      vec2.crossVZ(result, relativePoint, this.angularVelocity);
      vec2.subtract(result, this.velocity, result);
      return result;
    };

    /**
     * @event sleepy
     */
    Body.sleepyEvent = {
      type: "sleepy"
    };

    /**
     * @event sleep
     */
    Body.sleepEvent = {
      type: "sleep"
    };

    /**
     * @event wakeup
     */
    Body.wakeUpEvent = {
      type: "wakeup"
    };

    /**
     * Dynamic body.
     * @property DYNAMIC
     * @type {Number}
     * @static
     */
    Body.DYNAMIC = 1;

    /**
     * Static body.
     * @property STATIC
     * @type {Number}
     * @static
     */
    Body.STATIC = 2;

    /**
     * Kinematic body.
     * @property KINEMATIC
     * @type {Number}
     * @static
     */
    Body.KINEMATIC = 4;

    /**
     * @property AWAKE
     * @type {Number}
     * @static
     */
    Body.AWAKE = 0;

    /**
     * @property SLEEPY
     * @type {Number}
     * @static
     */
    Body.SLEEPY = 1;

    /**
     * @property SLEEPING
     * @type {Number}
     * @static
     */
    Body.SLEEPING = 2;


  }, {
    "../collision/AABB": 50,
    "../collision/Ray": 54,
    "../collision/RaycastResult": 55,
    "../events/EventEmitter": 69,
    "../math/vec2": 73,
    "../shapes/Convex": 83,
    "poly-decomp": 48
  }],
  75: [function (require, module, exports) {
    var vec2 = require('../math/vec2');
    var Spring = require('./Spring');
    var Utils = require('../utils/Utils');

    module.exports = LinearSpring;

    /**
     * A spring, connecting two bodies.
     *
     * The Spring explicitly adds force and angularForce to the bodies.
     *
     * @class LinearSpring
     * @extends Spring
     * @constructor
     * @param {Body} bodyA
     * @param {Body} bodyB
     * @param {Object} [options]
     * @param {number} [options.restLength]   A number > 0. Default is the current distance between the world anchor points.
     * @param {number} [options.stiffness=100]  Spring constant (see Hookes Law). A number >= 0.
     * @param {number} [options.damping=1]      A number >= 0. Default: 1
     * @param {Array}  [options.worldAnchorA]   Where to hook the spring to body A, in world coordinates. Overrides the option "localAnchorA" if given.
     * @param {Array}  [options.worldAnchorB]
     * @param {Array}  [options.localAnchorA]   Where to hook the spring to body A, in local body coordinates. Defaults to the body center.
     * @param {Array}  [options.localAnchorB]
     */
    function LinearSpring(bodyA, bodyB, options) {
      options = options || {};

      Spring.call(this, bodyA, bodyB, options);

    /**
     * Anchor for bodyA in local bodyA coordinates.
     * @property localAnchorA
     * @type {Array}
     */
    this.localAnchorA = vec2.fromValues(0, 0);

    /**
     * Anchor for bodyB in local bodyB coordinates.
     * @property localAnchorB
     * @type {Array}
     */
    this.localAnchorB = vec2.fromValues(0, 0);

      if (options.localAnchorA) {
        vec2.copy(this.localAnchorA, options.localAnchorA);
      }
      if (options.localAnchorB) {
        vec2.copy(this.localAnchorB, options.localAnchorB);
      }
      if (options.worldAnchorA) {
        this.setWorldAnchorA(options.worldAnchorA);
      }
      if (options.worldAnchorB) {
        this.setWorldAnchorB(options.worldAnchorB);
      }

      var worldAnchorA = vec2.create();
      var worldAnchorB = vec2.create();
      this.getWorldAnchorA(worldAnchorA);
      this.getWorldAnchorB(worldAnchorB);
      var worldDistance = vec2.distance(worldAnchorA, worldAnchorB);

    /**
     * Rest length of the spring.
     * @property restLength
     * @type {number}
     */
    this.restLength = typeof(options.restLength) === "number" ? options.restLength : worldDistance;
    }

    LinearSpring.prototype = new Spring();
    LinearSpring.prototype.constructor = LinearSpring;

    /**
     * Set the anchor point on body A, using world coordinates.
     * @method setWorldAnchorA
     * @param {Array} worldAnchorA
     */
    LinearSpring.prototype.setWorldAnchorA = function (worldAnchorA) {
      this.bodyA.toLocalFrame(this.localAnchorA, worldAnchorA);
    };

    /**
     * Set the anchor point on body B, using world coordinates.
     * @method setWorldAnchorB
     * @param {Array} worldAnchorB
     */
    LinearSpring.prototype.setWorldAnchorB = function (worldAnchorB) {
      this.bodyB.toLocalFrame(this.localAnchorB, worldAnchorB);
    };

    /**
     * Get the anchor point on body A, in world coordinates.
     * @method getWorldAnchorA
     * @param {Array} result The vector to store the result in.
     */
    LinearSpring.prototype.getWorldAnchorA = function (result) {
      this.bodyA.toWorldFrame(result, this.localAnchorA);
    };

    /**
     * Get the anchor point on body B, in world coordinates.
     * @method getWorldAnchorB
     * @param {Array} result The vector to store the result in.
     */
    LinearSpring.prototype.getWorldAnchorB = function (result) {
      this.bodyB.toWorldFrame(result, this.localAnchorB);
    };

    var applyForce_r = vec2.create(),
        applyForce_r_unit = vec2.create(),
        applyForce_u = vec2.create(),
        applyForce_f = vec2.create(),
        applyForce_worldAnchorA = vec2.create(),
        applyForce_worldAnchorB = vec2.create(),
        applyForce_ri = vec2.create(),
        applyForce_rj = vec2.create(),
        applyForce_tmp = vec2.create();

    /**
     * Apply the spring force to the connected bodies.
     * @method applyForce
     */
    LinearSpring.prototype.applyForce = function () {
      var k = this.stiffness,
          d = this.damping,
          l = this.restLength,
          bodyA = this.bodyA,
          bodyB = this.bodyB,
          r = applyForce_r,
          r_unit = applyForce_r_unit,
          u = applyForce_u,
          f = applyForce_f,
          tmp = applyForce_tmp;

      var worldAnchorA = applyForce_worldAnchorA,
          worldAnchorB = applyForce_worldAnchorB,
          ri = applyForce_ri,
          rj = applyForce_rj;

      // Get world anchors
      this.getWorldAnchorA(worldAnchorA);
      this.getWorldAnchorB(worldAnchorB);

      // Get offset points
      vec2.sub(ri, worldAnchorA, bodyA.position);
      vec2.sub(rj, worldAnchorB, bodyB.position);

      // Compute distance vector between world anchor points
      vec2.sub(r, worldAnchorB, worldAnchorA);
      var rlen = vec2.len(r);
      vec2.normalize(r_unit, r);

      //console.log(rlen)
      //console.log("A",vec2.str(worldAnchorA),"B",vec2.str(worldAnchorB))

      // Compute relative velocity of the anchor points, u
      vec2.sub(u, bodyB.velocity, bodyA.velocity);
      vec2.crossZV(tmp, bodyB.angularVelocity, rj);
      vec2.add(u, u, tmp);
      vec2.crossZV(tmp, bodyA.angularVelocity, ri);
      vec2.sub(u, u, tmp);

      // F = - k * ( x - L ) - D * ( u )
      vec2.scale(f, r_unit, -k * (rlen - l) - d * vec2.dot(u, r_unit));

      // Add forces to bodies
      vec2.sub(bodyA.force, bodyA.force, f);
      vec2.add(bodyB.force, bodyB.force, f);

      // Angular force
      var ri_x_f = vec2.crossLength(ri, f);
      var rj_x_f = vec2.crossLength(rj, f);
      bodyA.angularForce -= ri_x_f;
      bodyB.angularForce += rj_x_f;
    };

  }, {"../math/vec2": 73, "../utils/Utils": 100, "./Spring": 77}],
  76: [function (require, module, exports) {
    var vec2 = require('../math/vec2');
    var Spring = require('./Spring');

    module.exports = RotationalSpring;

    /**
     * A rotational spring, connecting two bodies rotation. This spring explicitly adds angularForce (torque) to the bodies.
     *
     * The spring can be combined with a {{#crossLink "RevoluteConstraint"}}{{/crossLink}} to make, for example, a mouse trap.
     *
     * @class RotationalSpring
     * @extends Spring
     * @constructor
     * @param {Body} bodyA
     * @param {Body} bodyB
     * @param {Object} [options]
     * @param {number} [options.restAngle] The relative angle of bodies at which the spring is at rest. If not given, it's set to the current relative angle between the bodies.
     * @param {number} [options.stiffness=100] Spring constant (see Hookes Law). A number >= 0.
     * @param {number} [options.damping=1] A number >= 0.
     */
    function RotationalSpring(bodyA, bodyB, options) {
      options = options || {};

      Spring.call(this, bodyA, bodyB, options);

    /**
     * Rest angle of the spring.
     * @property restAngle
     * @type {number}
     */
    this.restAngle = typeof(options.restAngle) === "number" ? options.restAngle : bodyB.angle - bodyA.angle;
    }

    RotationalSpring.prototype = new Spring();
    RotationalSpring.prototype.constructor = RotationalSpring;

    /**
     * Apply the spring force to the connected bodies.
     * @method applyForce
     */
    RotationalSpring.prototype.applyForce = function () {
      var k = this.stiffness,
          d = this.damping,
          l = this.restAngle,
          bodyA = this.bodyA,
          bodyB = this.bodyB,
          x = bodyB.angle - bodyA.angle,
          u = bodyB.angularVelocity - bodyA.angularVelocity;

      var torque = -k * (x - l) - d * u * 0;

      bodyA.angularForce -= torque;
      bodyB.angularForce += torque;
    };

  }, {"../math/vec2": 73, "./Spring": 77}],
  77: [function (require, module, exports) {
    var vec2 = require('../math/vec2');
    var Utils = require('../utils/Utils');

    module.exports = Spring;

    /**
     * A spring, connecting two bodies. The Spring explicitly adds force and angularForce to the bodies and does therefore not put load on the constraint solver.
     *
     * @class Spring
     * @constructor
     * @param {Body} bodyA
     * @param {Body} bodyB
     * @param {Object} [options]
     * @param {number} [options.stiffness=100]  Spring constant (see Hookes Law). A number >= 0.
     * @param {number} [options.damping=1]      A number >= 0. Default: 1
     * @param {Array}  [options.localAnchorA]   Where to hook the spring to body A, in local body coordinates. Defaults to the body center.
     * @param {Array}  [options.localAnchorB]
     * @param {Array}  [options.worldAnchorA]   Where to hook the spring to body A, in world coordinates. Overrides the option "localAnchorA" if given.
     * @param {Array}  [options.worldAnchorB]
     */
    function Spring(bodyA, bodyB, options) {
      options = Utils.defaults(options, {
        stiffness: 100,
        damping: 1,
      });

      /**
       * Stiffness of the spring.
       * @property stiffness
       * @type {number}
       */
      this.stiffness = options.stiffness;

      /**
       * Damping of the spring.
       * @property damping
       * @type {number}
       */
      this.damping = options.damping;

      /**
       * First connected body.
       * @property bodyA
       * @type {Body}
       */
      this.bodyA = bodyA;

    /**
     * Second connected body.
     * @property bodyB
     * @type {Body}
     */
    this.bodyB = bodyB;
    }

    /**
     * Apply the spring force to the connected bodies.
     * @method applyForce
     */
    Spring.prototype.applyForce = function () {
      // To be implemented by subclasses
    };

  }, {"../math/vec2": 73, "../utils/Utils": 100}],
  78: [function (require, module, exports) {
    var vec2 = require('../math/vec2');
    var Utils = require('../utils/Utils');
    var Constraint = require('../constraints/Constraint');
    var FrictionEquation = require('../equations/FrictionEquation');
    var Body = require('../objects/Body');

    module.exports = TopDownVehicle;

    /**
     * @class TopDownVehicle
     * @constructor
     * @param {Body} chassisBody A dynamic body, already added to the world.
     * @param {Object} [options]
     *
     * @example
     *
     *     // Create a dynamic body for the chassis
     *     var chassisBody = new Body({
 *         mass: 1
 *     });
     *     var boxShape = new Box({ width: 0.5, height: 1 });
     *     chassisBody.addShape(boxShape);
     *     world.addBody(chassisBody);
     *
     *     // Create the vehicle
     *     var vehicle = new TopDownVehicle(chassisBody);
     *
     *     // Add one front wheel and one back wheel - we don't actually need four :)
     *     var frontWheel = vehicle.addWheel({
 *         localPosition: [0, 0.5] // front
 *     });
     *     frontWheel.setSideFriction(4);
     *
     *     // Back wheel
     *     var backWheel = vehicle.addWheel({
 *         localPosition: [0, -0.5] // back
 *     });
     *     backWheel.setSideFriction(3); // Less side friction on back wheel makes it easier to drift
     *     vehicle.addToWorld(world);
     *
     *     // Steer value zero means straight forward. Positive is left and negative right.
     *     frontWheel.steerValue = Math.PI / 16;
     *
     *     // Engine force forward
     *     backWheel.engineForce = 10;
     *     backWheel.setBrakeForce(0);
     */
    function TopDownVehicle(chassisBody, options) {
      options = options || {};

      /**
       * @property {Body} chassisBody
     */
      this.chassisBody = chassisBody;

      /**
       * @property {Array} wheels
     */
      this.wheels = [];

      // A dummy body to constrain the chassis to
      this.groundBody = new Body({mass: 0});

      this.world = null;

      var that = this;
      this.preStepCallback = function () {
        that.update();
      };
    }

    /**
     * @method addToWorld
     * @param {World} world
     */
    TopDownVehicle.prototype.addToWorld = function (world) {
      this.world = world;
      world.addBody(this.groundBody);
      world.on('preStep', this.preStepCallback);
      for (var i = 0; i < this.wheels.length; i++) {
        var wheel = this.wheels[i];
        world.addConstraint(wheel);
      }
    };

    /**
     * @method removeFromWorld
     * @param {World} world
     */
    TopDownVehicle.prototype.removeFromWorld = function () {
      var world = this.world;
      world.removeBody(this.groundBody);
      world.off('preStep', this.preStepCallback);
      for (var i = 0; i < this.wheels.length; i++) {
        var wheel = this.wheels[i];
        world.removeConstraint(wheel);
      }
      this.world = null;
    };

    /**
     * @method addWheel
     * @param {object} [wheelOptions]
     * @return {WheelConstraint}
     */
    TopDownVehicle.prototype.addWheel = function (wheelOptions) {
      var wheel = new WheelConstraint(this, wheelOptions);
      this.wheels.push(wheel);
      return wheel;
    };

    /**
     * @method update
     */
    TopDownVehicle.prototype.update = function () {
      for (var i = 0; i < this.wheels.length; i++) {
        this.wheels[i].update();
      }
    };

    /**
     * @class WheelConstraint
     * @constructor
     * @extends {Constraint}
     * @param {Vehicle} vehicle
     * @param {object} [options]
     * @param {Array} [options.localForwardVector]The local wheel forward vector in local body space. Default is zero.
     * @param {Array} [options.localPosition] The local position of the wheen in the chassis body. Default is zero - the center of the body.
     * @param {Array} [options.sideFriction=5] The max friction force in the sideways direction.
     */
    function WheelConstraint(vehicle, options) {
      options = options || {};

      this.vehicle = vehicle;

      this.forwardEquation = new FrictionEquation(vehicle.chassisBody, vehicle.groundBody);

      this.sideEquation = new FrictionEquation(vehicle.chassisBody, vehicle.groundBody);

      /**
       * @property {number} steerValue
       */
      this.steerValue = 0;

      /**
       * @property {number} engineForce
       */
      this.engineForce = 0;

      this.setSideFriction(options.sideFriction !== undefined ? options.sideFriction : 5);

      /**
       * @property {Array} localForwardVector
       */
      this.localForwardVector = vec2.fromValues(0, 1);
      if (options.localForwardVector) {
        vec2.copy(this.localForwardVector, options.localForwardVector);
      }

      /**
       * @property {Array} localPosition
       */
      this.localPosition = vec2.fromValues(0, 0);
      if (options.localPosition) {
        vec2.copy(this.localPosition, options.localPosition);
    }

      Constraint.apply(this, vehicle.chassisBody, vehicle.groundBody);

      this.equations.push(
          this.forwardEquation,
          this.sideEquation
      );

      this.setBrakeForce(0);
    }

    WheelConstraint.prototype = new Constraint();

    /**
     * @method setForwardFriction
     */
    WheelConstraint.prototype.setBrakeForce = function (force) {
      this.forwardEquation.setSlipForce(force);
    };

    /**
     * @method setSideFriction
     */
    WheelConstraint.prototype.setSideFriction = function (force) {
      this.sideEquation.setSlipForce(force);
    };

    var worldVelocity = vec2.create();
    var relativePoint = vec2.create();

    /**
     * @method getSpeed
     */
    WheelConstraint.prototype.getSpeed = function () {
      this.vehicle.chassisBody.vectorToWorldFrame(relativePoint, this.localForwardVector);
      this.vehicle.chassisBody.getVelocityAtPoint(worldVelocity, relativePoint);
      return vec2.dot(worldVelocity, relativePoint);
    };

    var tmpVec = vec2.create();

    /**
     * @method update
     */
    WheelConstraint.prototype.update = function () {

      // Directional
      this.vehicle.chassisBody.vectorToWorldFrame(this.forwardEquation.t, this.localForwardVector);
      vec2.rotate(this.sideEquation.t, this.localForwardVector, Math.PI / 2);
      this.vehicle.chassisBody.vectorToWorldFrame(this.sideEquation.t, this.sideEquation.t);

      vec2.rotate(this.forwardEquation.t, this.forwardEquation.t, this.steerValue);
      vec2.rotate(this.sideEquation.t, this.sideEquation.t, this.steerValue);

      // Attachment point
      this.vehicle.chassisBody.toWorldFrame(this.forwardEquation.contactPointB, this.localPosition);
      vec2.copy(this.sideEquation.contactPointB, this.forwardEquation.contactPointB);

      this.vehicle.chassisBody.vectorToWorldFrame(this.forwardEquation.contactPointA, this.localPosition);
      vec2.copy(this.sideEquation.contactPointA, this.forwardEquation.contactPointA);

      // Add engine force
      vec2.normalize(tmpVec, this.forwardEquation.t);
      vec2.scale(tmpVec, tmpVec, this.engineForce);

      this.vehicle.chassisBody.applyForce(tmpVec, this.forwardEquation.contactPointA);
    };
  }, {
    "../constraints/Constraint": 57,
    "../equations/FrictionEquation": 66,
    "../math/vec2": 73,
    "../objects/Body": 74,
    "../utils/Utils": 100
  }],
  79: [function (require, module, exports) {
// Export p2 classes
    var p2 = module.exports = {
      AABB: require('./collision/AABB'),
      AngleLockEquation: require('./equations/AngleLockEquation'),
      Body: require('./objects/Body'),
      Broadphase: require('./collision/Broadphase'),
      Capsule: require('./shapes/Capsule'),
      Circle: require('./shapes/Circle'),
      Constraint: require('./constraints/Constraint'),
      ContactEquation: require('./equations/ContactEquation'),
      ContactEquationPool: require('./utils/ContactEquationPool'),
      ContactMaterial: require('./material/ContactMaterial'),
      Convex: require('./shapes/Convex'),
      DistanceConstraint: require('./constraints/DistanceConstraint'),
      Equation: require('./equations/Equation'),
      EventEmitter: require('./events/EventEmitter'),
      FrictionEquation: require('./equations/FrictionEquation'),
      FrictionEquationPool: require('./utils/FrictionEquationPool'),
      GearConstraint: require('./constraints/GearConstraint'),
      GSSolver: require('./solver/GSSolver'),
      Heightfield: require('./shapes/Heightfield'),
      Line: require('./shapes/Line'),
      LockConstraint: require('./constraints/LockConstraint'),
      Material: require('./material/Material'),
      Narrowphase: require('./collision/Narrowphase'),
      NaiveBroadphase: require('./collision/NaiveBroadphase'),
      Particle: require('./shapes/Particle'),
      Plane: require('./shapes/Plane'),
      Pool: require('./utils/Pool'),
      RevoluteConstraint: require('./constraints/RevoluteConstraint'),
      PrismaticConstraint: require('./constraints/PrismaticConstraint'),
      Ray: require('./collision/Ray'),
      RaycastResult: require('./collision/RaycastResult'),
      Box: require('./shapes/Box'),
      RotationalVelocityEquation: require('./equations/RotationalVelocityEquation'),
      SAPBroadphase: require('./collision/SAPBroadphase'),
      Shape: require('./shapes/Shape'),
      Solver: require('./solver/Solver'),
      Spring: require('./objects/Spring'),
      TopDownVehicle: require('./objects/TopDownVehicle'),
      LinearSpring: require('./objects/LinearSpring'),
      RotationalSpring: require('./objects/RotationalSpring'),
      Utils: require('./utils/Utils'),
      World: require('./world/World'),
      vec2: require('./math/vec2'),
      version: require('../package.json').version,
    };

    Object.defineProperty(p2, 'Rectangle', {
      get: function () {
        console.warn('The Rectangle class has been renamed to Box.');
        return this.Box;
      }
    });
  }, {
    "../package.json": 49,
    "./collision/AABB": 50,
    "./collision/Broadphase": 51,
    "./collision/NaiveBroadphase": 52,
    "./collision/Narrowphase": 53,
    "./collision/Ray": 54,
    "./collision/RaycastResult": 55,
    "./collision/SAPBroadphase": 56,
    "./constraints/Constraint": 57,
    "./constraints/DistanceConstraint": 58,
    "./constraints/GearConstraint": 59,
    "./constraints/LockConstraint": 60,
    "./constraints/PrismaticConstraint": 61,
    "./constraints/RevoluteConstraint": 62,
    "./equations/AngleLockEquation": 63,
    "./equations/ContactEquation": 64,
    "./equations/Equation": 65,
    "./equations/FrictionEquation": 66,
    "./equations/RotationalVelocityEquation": 68,
    "./events/EventEmitter": 69,
    "./material/ContactMaterial": 70,
    "./material/Material": 71,
    "./math/vec2": 73,
    "./objects/Body": 74,
    "./objects/LinearSpring": 75,
    "./objects/RotationalSpring": 76,
    "./objects/Spring": 77,
    "./objects/TopDownVehicle": 78,
    "./shapes/Box": 80,
    "./shapes/Capsule": 81,
    "./shapes/Circle": 82,
    "./shapes/Convex": 83,
    "./shapes/Heightfield": 84,
    "./shapes/Line": 85,
    "./shapes/Particle": 86,
    "./shapes/Plane": 87,
    "./shapes/Shape": 88,
    "./solver/GSSolver": 89,
    "./solver/Solver": 90,
    "./utils/ContactEquationPool": 91,
    "./utils/FrictionEquationPool": 92,
    "./utils/Pool": 98,
    "./utils/Utils": 100,
    "./world/World": 104
  }],
  80: [function (require, module, exports) {
    var vec2 = require('../math/vec2')
        , Shape = require('./Shape')
        , Convex = require('./Convex');

    module.exports = Box;

    /**
     * Box shape class.
     * @class Box
     * @constructor
     * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
     * @param {Number} [options.width=1] Total width of the box
     * @param {Number} [options.height=1] Total height of the box
     * @extends Convex
     */
    function Box(options) {
      if (typeof(arguments[0]) === 'number' && typeof(arguments[1]) === 'number') {
        options = {
          width: arguments[0],
          height: arguments[1]
        };
        console.warn('The Rectangle has been renamed to Box and its constructor signature has changed. Please use the following format: new Box({ width: 1, height: 1, ... })');
      }
      options = options || {};

      /**
       * Total width of the box
       * @property width
       * @type {Number}
       */
      var width = this.width = options.width || 1;

      /**
       * Total height of the box
       * @property height
       * @type {Number}
       */
      var height = this.height = options.height || 1;

      var verts = [
        vec2.fromValues(-width / 2, -height / 2),
        vec2.fromValues(width / 2, -height / 2),
        vec2.fromValues(width / 2, height / 2),
        vec2.fromValues(-width / 2, height / 2)
      ];
      var axes = [
        vec2.fromValues(1, 0),
        vec2.fromValues(0, 1)
      ];

      options.vertices = verts;
      options.axes = axes;
      options.type = Shape.BOX;
      Convex.call(this, options);
    }

    Box.prototype = new Convex();
    Box.prototype.constructor = Box;

    /**
     * Compute moment of inertia
     * @method computeMomentOfInertia
     * @param  {Number} mass
     * @return {Number}
     */
    Box.prototype.computeMomentOfInertia = function (mass) {
      var w = this.width,
          h = this.height;
      return mass * (h * h + w * w) / 12;
    };

    /**
     * Update the bounding radius
     * @method updateBoundingRadius
     */
    Box.prototype.updateBoundingRadius = function () {
      var w = this.width,
          h = this.height;
      this.boundingRadius = Math.sqrt(w * w + h * h) / 2;
    };

    var corner1 = vec2.create(),
        corner2 = vec2.create(),
        corner3 = vec2.create(),
        corner4 = vec2.create();

    /**
     * @method computeAABB
     * @param  {AABB}   out      The resulting AABB.
     * @param  {Array}  position
     * @param  {Number} angle
     */
    Box.prototype.computeAABB = function (out, position, angle) {
      out.setFromPoints(this.vertices, position, angle, 0);
    };

    Box.prototype.updateArea = function () {
      this.area = this.width * this.height;
    };


  }, {"../math/vec2": 73, "./Convex": 83, "./Shape": 88}],
  81: [function (require, module, exports) {
    var Shape = require('./Shape')
        , vec2 = require('../math/vec2');

    module.exports = Capsule;

    /**
     * Capsule shape class.
     * @class Capsule
     * @constructor
     * @extends Shape
     * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
     * @param {Number} [options.length=1] The distance between the end points
     * @param {Number} [options.radius=1] Radius of the capsule
     * @example
     *     var capsuleShape = new Capsule({
 *         length: 1,
 *         radius: 2
 *     });
     *     body.addShape(capsuleShape);
     */
    function Capsule(options) {
      if (typeof(arguments[0]) === 'number' && typeof(arguments[1]) === 'number') {
        options = {
          length: arguments[0],
          radius: arguments[1]
        };
        console.warn('The Capsule constructor signature has changed. Please use the following format: new Capsule({ radius: 1, length: 1 })');
    }
      options = options || {};

    /**
     * The distance between the end points.
     * @property {Number} length
     */
    this.length = options.length || 1;

    /**
     * The radius of the capsule.
     * @property {Number} radius
     */
    this.radius = options.radius || 1;

      options.type = Shape.CAPSULE;
      Shape.call(this, options);
    }

    Capsule.prototype = new Shape();
    Capsule.prototype.constructor = Capsule;

    /**
     * Compute the mass moment of inertia of the Capsule.
     * @method conputeMomentOfInertia
     * @param  {Number} mass
     * @return {Number}
     * @todo
     */
    Capsule.prototype.computeMomentOfInertia = function (mass) {
      // Approximate with rectangle
      var r = this.radius,
          w = this.length + r, // 2*r is too much, 0 is too little
          h = r * 2;
      return mass * (h * h + w * w) / 12;
    };

    /**
     * @method updateBoundingRadius
     */
    Capsule.prototype.updateBoundingRadius = function () {
      this.boundingRadius = this.radius + this.length / 2;
    };

    /**
     * @method updateArea
     */
    Capsule.prototype.updateArea = function () {
      this.area = Math.PI * this.radius * this.radius + this.radius * 2 * this.length;
    };

    var r = vec2.create();

    /**
     * @method computeAABB
     * @param  {AABB}   out      The resulting AABB.
     * @param  {Array}  position
     * @param  {Number} angle
     */
    Capsule.prototype.computeAABB = function (out, position, angle) {
      var radius = this.radius;

      // Compute center position of one of the the circles, world oriented, but with local offset
      vec2.set(r, this.length / 2, 0);
      if (angle !== 0) {
        vec2.rotate(r, r, angle);
    }

      // Get bounds
      vec2.set(out.upperBound, Math.max(r[0] + radius, -r[0] + radius),
          Math.max(r[1] + radius, -r[1] + radius));
      vec2.set(out.lowerBound, Math.min(r[0] - radius, -r[0] - radius),
          Math.min(r[1] - radius, -r[1] - radius));

      // Add offset
      vec2.add(out.lowerBound, out.lowerBound, position);
      vec2.add(out.upperBound, out.upperBound, position);
    };

    var intersectCapsule_hitPointWorld = vec2.create();
    var intersectCapsule_normal = vec2.create();
    var intersectCapsule_l0 = vec2.create();
    var intersectCapsule_l1 = vec2.create();
    var intersectCapsule_unit_y = vec2.fromValues(0, 1);

    /**
     * @method raycast
     * @param  {RaycastResult} result
     * @param  {Ray} ray
     * @param  {array} position
     * @param  {number} angle
     */
    Capsule.prototype.raycast = function (result, ray, position, angle) {
      var from = ray.from;
      var to = ray.to;
      var direction = ray.direction;

      var hitPointWorld = intersectCapsule_hitPointWorld;
      var normal = intersectCapsule_normal;
      var l0 = intersectCapsule_l0;
      var l1 = intersectCapsule_l1;

      // The sides
      var halfLen = this.length / 2;
      for (var i = 0; i < 2; i++) {

        // get start and end of the line
        var y = this.radius * (i * 2 - 1);
        vec2.set(l0, -halfLen, y);
        vec2.set(l1, halfLen, y);
        vec2.toGlobalFrame(l0, l0, position, angle);
        vec2.toGlobalFrame(l1, l1, position, angle);

        var delta = vec2.getLineSegmentsIntersectionFraction(from, to, l0, l1);
        if (delta >= 0) {
          vec2.rotate(normal, intersectCapsule_unit_y, angle);
          vec2.scale(normal, normal, (i * 2 - 1));
          ray.reportIntersection(result, delta, normal, -1);
          if (result.shouldStop(ray)) {
                return;
          }
        }
      }

      // Circles
      var diagonalLengthSquared = Math.pow(this.radius, 2) + Math.pow(halfLen, 2);
      for (var i = 0; i < 2; i++) {
        vec2.set(l0, halfLen * (i * 2 - 1), 0);
        vec2.toGlobalFrame(l0, l0, position, angle);

        var a = Math.pow(to[0] - from[0], 2) + Math.pow(to[1] - from[1], 2);
        var b = 2 * ((to[0] - from[0]) * (from[0] - l0[0]) + (to[1] - from[1]) * (from[1] - l0[1]));
        var c = Math.pow(from[0] - l0[0], 2) + Math.pow(from[1] - l0[1], 2) - Math.pow(this.radius, 2);
        var delta = Math.pow(b, 2) - 4 * a * c;

        if (delta < 0) {
          // No intersection
          continue;

        } else if (delta === 0) {
          // single intersection point
          vec2.lerp(hitPointWorld, from, to, delta);

          if (vec2.squaredDistance(hitPointWorld, position) > diagonalLengthSquared) {
            vec2.sub(normal, hitPointWorld, l0);
            vec2.normalize(normal, normal);
                ray.reportIntersection(result, delta, normal, -1);
            if (result.shouldStop(ray)) {
              return;
            }
            }

        } else {
          var sqrtDelta = Math.sqrt(delta);
          var inv2a = 1 / (2 * a);
          var d1 = (-b - sqrtDelta) * inv2a;
          var d2 = (-b + sqrtDelta) * inv2a;

          if (d1 >= 0 && d1 <= 1) {
            vec2.lerp(hitPointWorld, from, to, d1);
            if (vec2.squaredDistance(hitPointWorld, position) > diagonalLengthSquared) {
              vec2.sub(normal, hitPointWorld, l0);
              vec2.normalize(normal, normal);
                    ray.reportIntersection(result, d1, normal, -1);
              if (result.shouldStop(ray)) {
                        return;
                    }
                }
          }

          if (d2 >= 0 && d2 <= 1) {
            vec2.lerp(hitPointWorld, from, to, d2);
            if (vec2.squaredDistance(hitPointWorld, position) > diagonalLengthSquared) {
              vec2.sub(normal, hitPointWorld, l0);
              vec2.normalize(normal, normal);
                    ray.reportIntersection(result, d2, normal, -1);
              if (result.shouldStop(ray)) {
                return;
              }
                }
            }
        }
      }
    };
  }, {"../math/vec2": 73, "./Shape": 88}],
  82: [function (require, module, exports) {
    var Shape = require('./Shape')
        , vec2 = require('../math/vec2');

    module.exports = Circle;

    /**
     * Circle shape class.
     * @class Circle
     * @extends Shape
     * @constructor
     * @param {options} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
     * @param {number} [options.radius=1] The radius of this circle
     *
     * @example
     *     var circleShape = new Circle({ radius: 1 });
     *     body.addShape(circleShape);
     */
    function Circle(options) {
      if (typeof(arguments[0]) === 'number') {
        options = {
          radius: arguments[0]
        };
        console.warn('The Circle constructor signature has changed. Please use the following format: new Circle({ radius: 1 })');
    }
      options = options || {};

    /**
     * The radius of the circle.
     * @property radius
     * @type {number}
     */
    this.radius = options.radius || 1;

      options.type = Shape.CIRCLE;
      Shape.call(this, options);
    }

    Circle.prototype = new Shape();
    Circle.prototype.constructor = Circle;

    /**
     * @method computeMomentOfInertia
     * @param  {Number} mass
     * @return {Number}
     */
    Circle.prototype.computeMomentOfInertia = function (mass) {
      var r = this.radius;
      return mass * r * r / 2;
    };

    /**
     * @method updateBoundingRadius
     * @return {Number}
     */
    Circle.prototype.updateBoundingRadius = function () {
      this.boundingRadius = this.radius;
    };

    /**
     * @method updateArea
     * @return {Number}
     */
    Circle.prototype.updateArea = function () {
      this.area = Math.PI * this.radius * this.radius;
    };

    /**
     * @method computeAABB
     * @param  {AABB}   out      The resulting AABB.
     * @param  {Array}  position
     * @param  {Number} angle
     */
    Circle.prototype.computeAABB = function (out, position, angle) {
      var r = this.radius;
      vec2.set(out.upperBound, r, r);
      vec2.set(out.lowerBound, -r, -r);
      if (position) {
        vec2.add(out.lowerBound, out.lowerBound, position);
        vec2.add(out.upperBound, out.upperBound, position);
      }
    };

    var Ray_intersectSphere_intersectionPoint = vec2.create();
    var Ray_intersectSphere_normal = vec2.create();

    /**
     * @method raycast
     * @param  {RaycastResult} result
     * @param  {Ray} ray
     * @param  {array} position
     * @param  {number} angle
     */
    Circle.prototype.raycast = function (result, ray, position, angle) {
      var from = ray.from,
          to = ray.to,
          r = this.radius;

      var a = Math.pow(to[0] - from[0], 2) + Math.pow(to[1] - from[1], 2);
      var b = 2 * ((to[0] - from[0]) * (from[0] - position[0]) + (to[1] - from[1]) * (from[1] - position[1]));
      var c = Math.pow(from[0] - position[0], 2) + Math.pow(from[1] - position[1], 2) - Math.pow(r, 2);
      var delta = Math.pow(b, 2) - 4 * a * c;

      var intersectionPoint = Ray_intersectSphere_intersectionPoint;
      var normal = Ray_intersectSphere_normal;

      if (delta < 0) {
        // No intersection
        return;

      } else if (delta === 0) {
        // single intersection point
        vec2.lerp(intersectionPoint, from, to, delta);

        vec2.sub(normal, intersectionPoint, position);
        vec2.normalize(normal, normal);

        ray.reportIntersection(result, delta, normal, -1);

      } else {
        var sqrtDelta = Math.sqrt(delta);
        var inv2a = 1 / (2 * a);
        var d1 = (-b - sqrtDelta) * inv2a;
        var d2 = (-b + sqrtDelta) * inv2a;

        if (d1 >= 0 && d1 <= 1) {
          vec2.lerp(intersectionPoint, from, to, d1);

          vec2.sub(normal, intersectionPoint, position);
          vec2.normalize(normal, normal);

          ray.reportIntersection(result, d1, normal, -1);

          if (result.shouldStop(ray)) {
            return;
            }
        }

        if (d2 >= 0 && d2 <= 1) {
          vec2.lerp(intersectionPoint, from, to, d2);

          vec2.sub(normal, intersectionPoint, position);
          vec2.normalize(normal, normal);

          ray.reportIntersection(result, d2, normal, -1);
        }
      }
    };
  }, {"../math/vec2": 73, "./Shape": 88}],
  83: [function (require, module, exports) {
    var Shape = require('./Shape')
        , vec2 = require('../math/vec2')
        , polyk = require('../math/polyk')
        , decomp = require('poly-decomp');

    module.exports = Convex;

    /**
     * Convex shape class.
     * @class Convex
     * @constructor
     * @extends Shape
     * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
     * @param {Array} [options.vertices] An array of vertices that span this shape. Vertices are given in counter-clockwise (CCW) direction.
     * @param {Array} [options.axes] An array of unit length vectors, representing the symmetry axes in the convex.
     * @example
     *     // Create a box
     *     var vertices = [[-1,-1], [1,-1], [1,1], [-1,1]];
     *     var convexShape = new Convex({ vertices: vertices });
     *     body.addShape(convexShape);
     */
    function Convex(options) {
      if (Array.isArray(arguments[0])) {
        options = {
          vertices: arguments[0],
          axes: arguments[1]
        };
        console.warn('The Convex constructor signature has changed. Please use the following format: new Convex({ vertices: [...], ... })');
      }
      options = options || {};

      /**
       * Vertices defined in the local frame.
       * @property vertices
       * @type {Array}
       */
      this.vertices = [];

      // Copy the verts
      var vertices = options.vertices !== undefined ? options.vertices : [];
      for (var i = 0; i < vertices.length; i++) {
        var v = vec2.create();
        vec2.copy(v, vertices[i]);
        this.vertices.push(v);
      }

      /**
       * Axes defined in the local frame.
       * @property axes
       * @type {Array}
       */
      this.axes = [];

      if (options.axes) {

        // Copy the axes
        for (var i = 0; i < options.axes.length; i++) {
          var axis = vec2.create();
          vec2.copy(axis, options.axes[i]);
          this.axes.push(axis);
        }

      } else {

        // Construct axes from the vertex data
        for (var i = 0; i < this.vertices.length; i++) {
          // Get the world edge
          var worldPoint0 = this.vertices[i];
          var worldPoint1 = this.vertices[(i + 1) % this.vertices.length];

          var normal = vec2.create();
          vec2.sub(normal, worldPoint1, worldPoint0);

          // Get normal - just rotate 90 degrees since vertices are given in CCW
          vec2.rotate90cw(normal, normal);
          vec2.normalize(normal, normal);

          this.axes.push(normal);
        }

      }

      /**
       * The center of mass of the Convex
       * @property centerOfMass
       * @type {Array}
       */
      this.centerOfMass = vec2.fromValues(0, 0);

      /**
       * Triangulated version of this convex. The structure is Array of 3-Arrays, and each subarray contains 3 integers, referencing the vertices.
       * @property triangles
       * @type {Array}
       */
      this.triangles = [];

      if (this.vertices.length) {
        this.updateTriangles();
        this.updateCenterOfMass();
      }

      /**
       * The bounding radius of the convex
       * @property boundingRadius
       * @type {Number}
       */
      this.boundingRadius = 0;

      options.type = Shape.CONVEX;
      Shape.call(this, options);

      this.updateBoundingRadius();
      this.updateArea();
      if (this.area < 0) {
        throw new Error("Convex vertices must be given in conter-clockwise winding.");
    }
    }

    Convex.prototype = new Shape();
    Convex.prototype.constructor = Convex;

    var tmpVec1 = vec2.create();
    var tmpVec2 = vec2.create();

    /**
     * Project a Convex onto a world-oriented axis
     * @method projectOntoAxis
     * @static
     * @param  {Array} offset
     * @param  {Array} localAxis
     * @param  {Array} result
     */
    Convex.prototype.projectOntoLocalAxis = function (localAxis, result) {
      var max = null,
          min = null,
          v,
          value,
          localAxis = tmpVec1;

      // Get projected position of all vertices
      for (var i = 0; i < this.vertices.length; i++) {
        v = this.vertices[i];
        value = vec2.dot(v, localAxis);
        if (max === null || value > max) {
          max = value;
        }
        if (min === null || value < min) {
          min = value;
        }
      }

      if (min > max) {
        var t = min;
        min = max;
        max = t;
      }

      vec2.set(result, min, max);
    };

    Convex.prototype.projectOntoWorldAxis = function (localAxis, shapeOffset, shapeAngle, result) {
      var worldAxis = tmpVec2;

      this.projectOntoLocalAxis(localAxis, result);

      // Project the position of the body onto the axis - need to add this to the result
      if (shapeAngle !== 0) {
        vec2.rotate(worldAxis, localAxis, shapeAngle);
      } else {
        worldAxis = localAxis;
      }
      var offset = vec2.dot(shapeOffset, worldAxis);

      vec2.set(result, result[0] + offset, result[1] + offset);
    };


    /**
     * Update the .triangles property
     * @method updateTriangles
     */
    Convex.prototype.updateTriangles = function () {

      this.triangles.length = 0;

      // Rewrite on polyk notation, array of numbers
      var polykVerts = [];
      for (var i = 0; i < this.vertices.length; i++) {
        var v = this.vertices[i];
        polykVerts.push(v[0], v[1]);
      }

      // Triangulate
      var triangles = polyk.Triangulate(polykVerts);

      // Loop over all triangles, add their inertia contributions to I
      for (var i = 0; i < triangles.length; i += 3) {
        var id1 = triangles[i],
            id2 = triangles[i + 1],
            id3 = triangles[i + 2];

        // Add to triangles
        this.triangles.push([id1, id2, id3]);
      }
    };

    var updateCenterOfMass_centroid = vec2.create(),
        updateCenterOfMass_centroid_times_mass = vec2.create(),
        updateCenterOfMass_a = vec2.create(),
        updateCenterOfMass_b = vec2.create(),
        updateCenterOfMass_c = vec2.create(),
        updateCenterOfMass_ac = vec2.create(),
        updateCenterOfMass_ca = vec2.create(),
        updateCenterOfMass_cb = vec2.create(),
        updateCenterOfMass_n = vec2.create();

    /**
     * Update the .centerOfMass property.
     * @method updateCenterOfMass
     */
    Convex.prototype.updateCenterOfMass = function () {
      var triangles = this.triangles,
          verts = this.vertices,
          cm = this.centerOfMass,
          centroid = updateCenterOfMass_centroid,
          n = updateCenterOfMass_n,
          a = updateCenterOfMass_a,
          b = updateCenterOfMass_b,
          c = updateCenterOfMass_c,
          ac = updateCenterOfMass_ac,
          ca = updateCenterOfMass_ca,
          cb = updateCenterOfMass_cb,
          centroid_times_mass = updateCenterOfMass_centroid_times_mass;

      vec2.set(cm, 0, 0);
      var totalArea = 0;

      for (var i = 0; i !== triangles.length; i++) {
        var t = triangles[i],
            a = verts[t[0]],
            b = verts[t[1]],
            c = verts[t[2]];

        vec2.centroid(centroid, a, b, c);

        // Get mass for the triangle (density=1 in this case)
        // http://math.stackexchange.com/questions/80198/area-of-triangle-via-vectors
        var m = Convex.triangleArea(a, b, c);
        totalArea += m;

        // Add to center of mass
        vec2.scale(centroid_times_mass, centroid, m);
        vec2.add(cm, cm, centroid_times_mass);
      }

      vec2.scale(cm, cm, 1 / totalArea);
    };

    /**
     * Compute the mass moment of inertia of the Convex.
     * @method computeMomentOfInertia
     * @param  {Number} mass
     * @return {Number}
     * @see http://www.gamedev.net/topic/342822-moment-of-inertia-of-a-polygon-2d/
     */
    Convex.prototype.computeMomentOfInertia = function (mass) {
      var denom = 0.0,
          numer = 0.0,
          N = this.vertices.length;
      for (var j = N - 1, i = 0; i < N; j = i, i++) {
        var p0 = this.vertices[j];
        var p1 = this.vertices[i];
        var a = Math.abs(vec2.crossLength(p0, p1));
        var b = vec2.dot(p1, p1) + vec2.dot(p1, p0) + vec2.dot(p0, p0);
        denom += a * b;
        numer += a;
      }
      return (mass / 6.0) * (denom / numer);
    };

    /**
     * Updates the .boundingRadius property
     * @method updateBoundingRadius
     */
    Convex.prototype.updateBoundingRadius = function () {
      var verts = this.vertices,
          r2 = 0;

      for (var i = 0; i !== verts.length; i++) {
        var l2 = vec2.squaredLength(verts[i]);
        if (l2 > r2) {
          r2 = l2;
        }
      }

      this.boundingRadius = Math.sqrt(r2);
    };

    /**
     * Get the area of the triangle spanned by the three points a, b, c. The area is positive if the points are given in counter-clockwise order, otherwise negative.
     * @static
     * @method triangleArea
     * @param {Array} a
     * @param {Array} b
     * @param {Array} c
     * @return {Number}
     */
    Convex.triangleArea = function (a, b, c) {
      return (((b[0] - a[0]) * (c[1] - a[1])) - ((c[0] - a[0]) * (b[1] - a[1]))) * 0.5;
    };

    /**
     * Update the .area
     * @method updateArea
     */
    Convex.prototype.updateArea = function () {
      this.updateTriangles();
      this.area = 0;

      var triangles = this.triangles,
          verts = this.vertices;
      for (var i = 0; i !== triangles.length; i++) {
        var t = triangles[i],
            a = verts[t[0]],
            b = verts[t[1]],
            c = verts[t[2]];

        // Get mass for the triangle (density=1 in this case)
        var m = Convex.triangleArea(a, b, c);
        this.area += m;
      }
    };

    /**
     * @method computeAABB
     * @param  {AABB}   out
     * @param  {Array}  position
     * @param  {Number} angle
     */
    Convex.prototype.computeAABB = function (out, position, angle) {
      out.setFromPoints(this.vertices, position, angle, 0);
    };

    var intersectConvex_rayStart = vec2.create();
    var intersectConvex_rayEnd = vec2.create();
    var intersectConvex_normal = vec2.create();

    /**
     * @method raycast
     * @param  {RaycastResult} result
     * @param  {Ray} ray
     * @param  {array} position
     * @param  {number} angle
     */
    Convex.prototype.raycast = function (result, ray, position, angle) {
      var rayStart = intersectConvex_rayStart;
      var rayEnd = intersectConvex_rayEnd;
      var normal = intersectConvex_normal;
      var vertices = this.vertices;

      // Transform to local shape space
      vec2.toLocalFrame(rayStart, ray.from, position, angle);
      vec2.toLocalFrame(rayEnd, ray.to, position, angle);

      var n = vertices.length;

      for (var i = 0; i < n && !result.shouldStop(ray); i++) {
        var q1 = vertices[i];
        var q2 = vertices[(i + 1) % n];
        var delta = vec2.getLineSegmentsIntersectionFraction(rayStart, rayEnd, q1, q2);

        if (delta >= 0) {
          vec2.sub(normal, q2, q1);
          vec2.rotate(normal, normal, -Math.PI / 2 + angle);
          vec2.normalize(normal, normal);
          ray.reportIntersection(result, delta, normal, i);
        }
      }
    };

  }, {"../math/polyk": 72, "../math/vec2": 73, "./Shape": 88, "poly-decomp": 48}],
  84: [function (require, module, exports) {
    var Shape = require('./Shape')
        , vec2 = require('../math/vec2')
        , Utils = require('../utils/Utils');

    module.exports = Heightfield;

    /**
     * Heightfield shape class. Height data is given as an array. These data points are spread out evenly with a distance "elementWidth".
     * @class Heightfield
     * @extends Shape
     * @constructor
     * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
     * @param {array} [options.heights] An array of Y values that will be used to construct the terrain.
     * @param {Number} [options.minValue] Minimum value of the data points in the data array. Will be computed automatically if not given.
     * @param {Number} [options.maxValue] Maximum value.
     * @param {Number} [options.elementWidth=0.1] World spacing between the data points in X direction.
     *
     * @example
     *     // Generate some height data (y-values).
     *     var heights = [];
     *     for(var i = 0; i < 1000; i++){
 *         var y = 0.5 * Math.cos(0.2 * i);
 *         heights.push(y);
 *     }
     *
     *     // Create the heightfield shape
     *     var heightfieldShape = new Heightfield({
 *         heights: heights,
 *         elementWidth: 1 // Distance between the data points in X direction
 *     });
     *     var heightfieldBody = new Body();
     *     heightfieldBody.addShape(heightfieldShape);
     *     world.addBody(heightfieldBody);
     *
     * @todo Should use a scale property with X and Y direction instead of just elementWidth
     */
    function Heightfield(options) {
      if (Array.isArray(arguments[0])) {
        options = {
          heights: arguments[0]
        };

        if (typeof(arguments[1]) === 'object') {
          for (var key in arguments[1]) {
            options[key] = arguments[1][key];
            }
        }

        console.warn('The Heightfield constructor signature has changed. Please use the following format: new Heightfield({ heights: [...], ... })');
      }
      options = options || {};

      /**
       * An array of numbers, or height values, that are spread out along the x axis.
       * @property {array} heights
       */
      this.heights = options.heights ? options.heights.slice(0) : [];

      /**
       * Max value of the heights
       * @property {number} maxValue
       */
      this.maxValue = options.maxValue || null;

      /**
       * Max value of the heights
       * @property {number} minValue
       */
      this.minValue = options.minValue || null;

      /**
       * The width of each element
       * @property {number} elementWidth
       */
      this.elementWidth = options.elementWidth || 0.1;

      if (options.maxValue === undefined || options.minValue === undefined) {
        this.updateMaxMinValues();
    }

      options.type = Shape.HEIGHTFIELD;
      Shape.call(this, options);
    }

    Heightfield.prototype = new Shape();
    Heightfield.prototype.constructor = Heightfield;

    /**
     * Update the .minValue and the .maxValue
     * @method updateMaxMinValues
     */
    Heightfield.prototype.updateMaxMinValues = function () {
      var data = this.heights;
      var maxValue = data[0];
      var minValue = data[0];
      for (var i = 0; i !== data.length; i++) {
        var v = data[i];
        if (v > maxValue) {
          maxValue = v;
        }
        if (v < minValue) {
          minValue = v;
        }
      }
      this.maxValue = maxValue;
      this.minValue = minValue;
    };

    /**
     * @method computeMomentOfInertia
     * @param  {Number} mass
     * @return {Number}
     */
    Heightfield.prototype.computeMomentOfInertia = function (mass) {
      return Number.MAX_VALUE;
    };

    Heightfield.prototype.updateBoundingRadius = function () {
      this.boundingRadius = Number.MAX_VALUE;
    };

    Heightfield.prototype.updateArea = function () {
      var data = this.heights,
          area = 0;
      for (var i = 0; i < data.length - 1; i++) {
        area += (data[i] + data[i + 1]) / 2 * this.elementWidth;
      }
      this.area = area;
    };

    var points = [
      vec2.create(),
      vec2.create(),
      vec2.create(),
      vec2.create()
    ];

    /**
     * @method computeAABB
     * @param  {AABB}   out      The resulting AABB.
     * @param  {Array}  position
     * @param  {Number} angle
     */
    Heightfield.prototype.computeAABB = function (out, position, angle) {
      vec2.set(points[0], 0, this.maxValue);
      vec2.set(points[1], this.elementWidth * this.heights.length, this.maxValue);
      vec2.set(points[2], this.elementWidth * this.heights.length, this.minValue);
      vec2.set(points[3], 0, this.minValue);
      out.setFromPoints(points, position, angle);
    };

    /**
     * Get a line segment in the heightfield
     * @method getLineSegment
     * @param  {array} start Where to store the resulting start point
     * @param  {array} end Where to store the resulting end point
     * @param  {number} i
     */
    Heightfield.prototype.getLineSegment = function (start, end, i) {
      var data = this.heights;
      var width = this.elementWidth;
      vec2.set(start, i * width, data[i]);
      vec2.set(end, (i + 1) * width, data[i + 1]);
    };

    Heightfield.prototype.getSegmentIndex = function (position) {
      return Math.floor(position[0] / this.elementWidth);
    };

    Heightfield.prototype.getClampedSegmentIndex = function (position) {
      var i = this.getSegmentIndex(position);
      i = Math.min(this.heights.length, Math.max(i, 0)); // clamp
      return i;
    };

    var intersectHeightfield_hitPointWorld = vec2.create();
    var intersectHeightfield_worldNormal = vec2.create();
    var intersectHeightfield_l0 = vec2.create();
    var intersectHeightfield_l1 = vec2.create();
    var intersectHeightfield_localFrom = vec2.create();
    var intersectHeightfield_localTo = vec2.create();
    var intersectHeightfield_unit_y = vec2.fromValues(0, 1);

// Returns 1 if the lines intersect, otherwise 0.
    function getLineSegmentsIntersection(out, p0, p1, p2, p3) {

      var s1_x, s1_y, s2_x, s2_y;
      s1_x = p1[0] - p0[0];
      s1_y = p1[1] - p0[1];
      s2_x = p3[0] - p2[0];
      s2_y = p3[1] - p2[1];

      var s, t;
      s = (-s1_y * (p0[0] - p2[0]) + s1_x * (p0[1] - p2[1])) / (-s2_x * s1_y + s1_x * s2_y);
      t = ( s2_x * (p0[1] - p2[1]) - s2_y * (p0[0] - p2[0])) / (-s2_x * s1_y + s1_x * s2_y);
      if (s >= 0 && s <= 1 && t >= 0 && t <= 1) { // Collision detected
        var intX = p0[0] + (t * s1_x);
        var intY = p0[1] + (t * s1_y);
        out[0] = intX;
        out[1] = intY;
        return t;
    }
      return -1; // No collision
    }

    /**
     * @method raycast
     * @param  {RayResult} result
     * @param  {Ray} ray
     * @param  {array} position
     * @param  {number} angle
     */
    Heightfield.prototype.raycast = function (result, ray, position, angle) {
      var from = ray.from;
      var to = ray.to;
      var direction = ray.direction;

      var hitPointWorld = intersectHeightfield_hitPointWorld;
      var worldNormal = intersectHeightfield_worldNormal;
      var l0 = intersectHeightfield_l0;
      var l1 = intersectHeightfield_l1;
      var localFrom = intersectHeightfield_localFrom;
      var localTo = intersectHeightfield_localTo;

      // get local ray start and end
      vec2.toLocalFrame(localFrom, from, position, angle);
      vec2.toLocalFrame(localTo, to, position, angle);

      // Get the segment range
      var i0 = this.getClampedSegmentIndex(localFrom);
      var i1 = this.getClampedSegmentIndex(localTo);
      if (i0 > i1) {
        var tmp = i0;
        i0 = i1;
        i1 = tmp;
      }

      // The segments
      for (var i = 0; i < this.heights.length - 1; i++) {
        this.getLineSegment(l0, l1, i);
        var t = vec2.getLineSegmentsIntersectionFraction(localFrom, localTo, l0, l1);
        if (t >= 0) {
          vec2.sub(worldNormal, l1, l0);
          vec2.rotate(worldNormal, worldNormal, angle + Math.PI / 2);
          vec2.normalize(worldNormal, worldNormal);
          ray.reportIntersection(result, t, worldNormal, -1);
          if (result.shouldStop(ray)) {
            return;
            }
        }
      }
    };
  }, {"../math/vec2": 73, "../utils/Utils": 100, "./Shape": 88}],
  85: [function (require, module, exports) {
    var Shape = require('./Shape')
        , vec2 = require('../math/vec2');

    module.exports = Line;

    /**
     * Line shape class. The line shape is along the x direction, and stretches from [-length/2, 0] to [length/2,0].
     * @class Line
     * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
     * @param {Number} [options.length=1] The total length of the line
     * @extends Shape
     * @constructor
     */
    function Line(options) {
      if (typeof(arguments[0]) === 'number') {
        options = {
          length: arguments[0]
        };
        console.warn('The Line constructor signature has changed. Please use the following format: new Line({ length: 1, ... })');
    }
      options = options || {};

      /**
       * Length of this line
       * @property {Number} length
       * @default 1
       */
      this.length = options.length || 1;

      options.type = Shape.LINE;
      Shape.call(this, options);
    }

    Line.prototype = new Shape();
    Line.prototype.constructor = Line;

    Line.prototype.computeMomentOfInertia = function (mass) {
      return mass * Math.pow(this.length, 2) / 12;
    };

    Line.prototype.updateBoundingRadius = function () {
      this.boundingRadius = this.length / 2;
    };

    var points = [vec2.create(), vec2.create()];

    /**
     * @method computeAABB
     * @param  {AABB}   out      The resulting AABB.
     * @param  {Array}  position
     * @param  {Number} angle
     */
    Line.prototype.computeAABB = function (out, position, angle) {
      var l2 = this.length / 2;
      vec2.set(points[0], -l2, 0);
      vec2.set(points[1], l2, 0);
      out.setFromPoints(points, position, angle, 0);
    };

    var raycast_hitPoint = vec2.create();
    var raycast_normal = vec2.create();
    var raycast_l0 = vec2.create();
    var raycast_l1 = vec2.create();
    var raycast_unit_y = vec2.fromValues(0, 1);

    /**
     * @method raycast
     * @param  {RaycastResult} result
     * @param  {Ray} ray
     * @param  {number} angle
     * @param  {array} position
     */
    Line.prototype.raycast = function (result, ray, position, angle) {
      var from = ray.from;
      var to = ray.to;

      var l0 = raycast_l0;
      var l1 = raycast_l1;

      // get start and end of the line
      var halfLen = this.length / 2;
      vec2.set(l0, -halfLen, 0);
      vec2.set(l1, halfLen, 0);
      vec2.toGlobalFrame(l0, l0, position, angle);
      vec2.toGlobalFrame(l1, l1, position, angle);

      var fraction = vec2.getLineSegmentsIntersectionFraction(l0, l1, from, to);
      if (fraction >= 0) {
        var normal = raycast_normal;
        vec2.rotate(normal, raycast_unit_y, angle); // todo: this should depend on which side the ray comes from
        ray.reportIntersection(result, fraction, normal, -1);
    }
    };
  }, {"../math/vec2": 73, "./Shape": 88}],
  86: [function (require, module, exports) {
    var Shape = require('./Shape')
        , vec2 = require('../math/vec2');

    module.exports = Particle;

    /**
     * Particle shape class.
     * @class Particle
     * @constructor
     * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
     * @extends Shape
     */
    function Particle(options) {
      options = options || {};
      options.type = Shape.PARTICLE;
      Shape.call(this, options);
    }

    Particle.prototype = new Shape();
    Particle.prototype.constructor = Particle;

    Particle.prototype.computeMomentOfInertia = function (mass) {
      return 0; // Can't rotate a particle
    };

    Particle.prototype.updateBoundingRadius = function () {
      this.boundingRadius = 0;
    };

    /**
     * @method computeAABB
     * @param  {AABB}   out
     * @param  {Array}  position
     * @param  {Number} angle
     */
    Particle.prototype.computeAABB = function (out, position, angle) {
      vec2.copy(out.lowerBound, position);
      vec2.copy(out.upperBound, position);
    };

  }, {"../math/vec2": 73, "./Shape": 88}],
  87: [function (require, module, exports) {
    var Shape = require('./Shape')
        , vec2 = require('../math/vec2')
        , Utils = require('../utils/Utils');

    module.exports = Plane;

    /**
     * Plane shape class. The plane is facing in the Y direction.
     * @class Plane
     * @extends Shape
     * @constructor
     * @param {object} [options] (Note that this options object will be passed on to the {{#crossLink "Shape"}}{{/crossLink}} constructor.)
     */
    function Plane(options) {
      options = options || {};
      options.type = Shape.PLANE;
      Shape.call(this, options);
    }

    Plane.prototype = new Shape();
    Plane.prototype.constructor = Plane;

    /**
     * Compute moment of inertia
     * @method computeMomentOfInertia
     */
    Plane.prototype.computeMomentOfInertia = function (mass) {
      return 0; // Plane is infinite. The inertia should therefore be infinty but by convention we set 0 here
    };

    /**
     * Update the bounding radius
     * @method updateBoundingRadius
     */
    Plane.prototype.updateBoundingRadius = function () {
      this.boundingRadius = Number.MAX_VALUE;
    };

    /**
     * @method computeAABB
     * @param  {AABB}   out
     * @param  {Array}  position
     * @param  {Number} angle
     */
    Plane.prototype.computeAABB = function (out, position, angle) {
      var a = angle % (2 * Math.PI);
      var set = vec2.set;
      var max = 1e7;
      var lowerBound = out.lowerBound;
      var upperBound = out.upperBound;

      // Set max bounds
      set(lowerBound, -max, -max);
      set(upperBound, max, max);

      if (a === 0) {
        // y goes from -inf to 0
        upperBound[1] = 0;
        // set(lowerBound, -max, -max);
        // set(upperBound,  max,  0);

      } else if (a === Math.PI / 2) {

        // x goes from 0 to inf
        lowerBound[0] = 0;
        // set(lowerBound, 0, -max);
        // set(upperBound,      max,  max);

      } else if (a === Math.PI) {

        // y goes from 0 to inf
        lowerBound[1] = 0;
        // set(lowerBound, -max, 0);
        // set(upperBound,  max, max);

      } else if (a === 3 * Math.PI / 2) {

        // x goes from -inf to 0
        upperBound[0] = 0;
        // set(lowerBound, -max,     -max);
        // set(upperBound,  0,  max);

      }
    };

    Plane.prototype.updateArea = function () {
      this.area = Number.MAX_VALUE;
    };

    var intersectPlane_planePointToFrom = vec2.create();
    var intersectPlane_dir_scaled_with_t = vec2.create();
    var intersectPlane_hitPoint = vec2.create();
    var intersectPlane_normal = vec2.create();
    var intersectPlane_len = vec2.create();

    /**
     * @method raycast
     * @param  {RayResult} result
     * @param  {Ray} ray
     * @param  {array} position
     * @param  {number} angle
     */
    Plane.prototype.raycast = function (result, ray, position, angle) {
      var from = ray.from;
      var to = ray.to;
      var direction = ray.direction;
      var planePointToFrom = intersectPlane_planePointToFrom;
      var dir_scaled_with_t = intersectPlane_dir_scaled_with_t;
      var hitPoint = intersectPlane_hitPoint;
      var normal = intersectPlane_normal;
      var len = intersectPlane_len;

      // Get plane normal
      vec2.set(normal, 0, 1);
      vec2.rotate(normal, normal, angle);

      vec2.sub(len, from, position);
      var planeToFrom = vec2.dot(len, normal);
      vec2.sub(len, to, position);
      var planeToTo = vec2.dot(len, normal);

      if (planeToFrom * planeToTo > 0) {
        // "from" and "to" are on the same side of the plane... bail out
        return;
      }

      if (vec2.squaredDistance(from, to) < planeToFrom * planeToFrom) {
        return;
      }

      var n_dot_dir = vec2.dot(normal, direction);

      vec2.sub(planePointToFrom, from, position);
      var t = -vec2.dot(normal, planePointToFrom) / n_dot_dir / ray.length;

      ray.reportIntersection(result, t, normal, -1);
    };
  }, {"../math/vec2": 73, "../utils/Utils": 100, "./Shape": 88}],
  88: [function (require, module, exports) {
    module.exports = Shape;

    var vec2 = require('../math/vec2');

    /**
     * Base class for shapes.
     * @class Shape
     * @constructor
     * @param {object} [options]
     * @param {array} [options.position]
     * @param {number} [options.angle=0]
     * @param {number} [options.collisionGroup=1]
     * @param {number} [options.collisionMask=1]
     * @param {boolean} [options.sensor=false]
     * @param {boolean} [options.collisionResponse=true]
     * @param {object} [options.type=0]
     */
    function Shape(options) {
      options = options || {};

    /**
     * The body this shape is attached to. A shape can only be attached to a single body.
     * @property {Body} body
     */
    this.body = null;

      /**
       * Body-local position of the shape.
       * @property {Array} position
       */
      this.position = vec2.fromValues(0, 0);
      if (options.position) {
        vec2.copy(this.position, options.position);
      }

      /**
       * Body-local angle of the shape.
       * @property {number} angle
       */
      this.angle = options.angle || 0;

      /**
       * The type of the shape. One of:
       *
       * * {{#crossLink "Shape/CIRCLE:property"}}Shape.CIRCLE{{/crossLink}}
       * * {{#crossLink "Shape/PARTICLE:property"}}Shape.PARTICLE{{/crossLink}}
       * * {{#crossLink "Shape/PLANE:property"}}Shape.PLANE{{/crossLink}}
       * * {{#crossLink "Shape/CONVEX:property"}}Shape.CONVEX{{/crossLink}}
       * * {{#crossLink "Shape/LINE:property"}}Shape.LINE{{/crossLink}}
       * * {{#crossLink "Shape/BOX:property"}}Shape.BOX{{/crossLink}}
       * * {{#crossLink "Shape/CAPSULE:property"}}Shape.CAPSULE{{/crossLink}}
       * * {{#crossLink "Shape/HEIGHTFIELD:property"}}Shape.HEIGHTFIELD{{/crossLink}}
       *
       * @property {number} type
       */
      this.type = options.type || 0;

      /**
       * Shape object identifier.
       * @type {Number}
       * @property id
       */
      this.id = Shape.idCounter++;

      /**
       * Bounding circle radius of this shape
       * @property boundingRadius
       * @type {Number}
       */
      this.boundingRadius = 0;

      /**
       * Collision group that this shape belongs to (bit mask). See <a href="http://www.aurelienribon.com/blog/2011/07/box2d-tutorial-collision-filtering/">this tutorial</a>.
       * @property collisionGroup
       * @type {Number}
       * @example
       *     // Setup bits for each available group
       *     var PLAYER = Math.pow(2,0),
       *         ENEMY =  Math.pow(2,1),
       *         GROUND = Math.pow(2,2)
       *
       *     // Put shapes into their groups
       *     player1Shape.collisionGroup = PLAYER;
       *     player2Shape.collisionGroup = PLAYER;
       *     enemyShape  .collisionGroup = ENEMY;
       *     groundShape .collisionGroup = GROUND;
       *
       *     // Assign groups that each shape collide with.
       *     // Note that the players can collide with ground and enemies, but not with other players.
       *     player1Shape.collisionMask = ENEMY | GROUND;
       *     player2Shape.collisionMask = ENEMY | GROUND;
       *     enemyShape  .collisionMask = PLAYER | GROUND;
       *     groundShape .collisionMask = PLAYER | ENEMY;
       *
       * @example
       *     // How collision check is done
       *     if(shapeA.collisionGroup & shapeB.collisionMask)!=0 && (shapeB.collisionGroup & shapeA.collisionMask)!=0){
     *         // The shapes will collide
     *     }
       */
      this.collisionGroup = options.collisionGroup !== undefined ? options.collisionGroup : 1;

      /**
       * Whether to produce contact forces when in contact with other bodies. Note that contacts will be generated, but they will be disabled. That means that this shape will move through other body shapes, but it will still trigger contact events, etc.
       * @property {Boolean} collisionResponse
       */
      this.collisionResponse = options.collisionResponse !== undefined ? options.collisionResponse : true;

      /**
       * Collision mask of this shape. See .collisionGroup.
       * @property collisionMask
       * @type {Number}
       */
      this.collisionMask = options.collisionMask !== undefined ? options.collisionMask : 1;

      /**
       * Material to use in collisions for this Shape. If this is set to null, the world will use default material properties instead.
       * @property material
       * @type {Material}
       */
      this.material = options.material || null;

      /**
       * Area of this shape.
       * @property area
       * @type {Number}
       */
      this.area = 0;

      /**
       * Set to true if you want this shape to be a sensor. A sensor does not generate contacts, but it still reports contact events. This is good if you want to know if a shape is overlapping another shape, without them generating contacts.
       * @property {Boolean} sensor
       */
      this.sensor = options.sensor !== undefined ? options.sensor : false;

      if (this.type) {
        this.updateBoundingRadius();
    }

      this.updateArea();
    }

    Shape.idCounter = 0;

    /**
     * @static
     * @property {Number} CIRCLE
     */
    Shape.CIRCLE = 1;

    /**
     * @static
     * @property {Number} PARTICLE
     */
    Shape.PARTICLE = 2;

    /**
     * @static
     * @property {Number} PLANE
     */
    Shape.PLANE = 4;

    /**
     * @static
     * @property {Number} CONVEX
     */
    Shape.CONVEX = 8;

    /**
     * @static
     * @property {Number} LINE
     */
    Shape.LINE = 16;

    /**
     * @static
     * @property {Number} BOX
     */
    Shape.BOX = 32;

    Object.defineProperty(Shape, 'RECTANGLE', {
      get: function () {
        console.warn('Shape.RECTANGLE is deprecated, use Shape.BOX instead.');
        return Shape.BOX;
    }
    });

    /**
     * @static
     * @property {Number} CAPSULE
     */
    Shape.CAPSULE = 64;

    /**
     * @static
     * @property {Number} HEIGHTFIELD
     */
    Shape.HEIGHTFIELD = 128;

    /**
     * Should return the moment of inertia around the Z axis of the body given the total mass. See <a href="http://en.wikipedia.org/wiki/List_of_moments_of_inertia">Wikipedia's list of moments of inertia</a>.
     * @method computeMomentOfInertia
     * @param  {Number} mass
     * @return {Number} If the inertia is infinity or if the object simply isn't possible to rotate, return 0.
     */
    Shape.prototype.computeMomentOfInertia = function (mass) {
    };

    /**
     * Returns the bounding circle radius of this shape.
     * @method updateBoundingRadius
     * @return {Number}
     */
    Shape.prototype.updateBoundingRadius = function () {
    };

    /**
     * Update the .area property of the shape.
     * @method updateArea
     */
    Shape.prototype.updateArea = function () {
      // To be implemented in all subclasses
    };

    /**
     * Compute the world axis-aligned bounding box (AABB) of this shape.
     * @method computeAABB
     * @param  {AABB} out The resulting AABB.
     * @param  {Array} position World position of the shape.
     * @param  {Number} angle World angle of the shape.
     */
    Shape.prototype.computeAABB = function (out, position, angle) {
      // To be implemented in each subclass
    };

    /**
     * Perform raycasting on this shape.
     * @method raycast
     * @param  {RayResult} result Where to store the resulting data.
     * @param  {Ray} ray The Ray that you want to use for raycasting.
     * @param  {array} position World position of the shape (the .position property will be ignored).
     * @param  {number} angle World angle of the shape (the .angle property will be ignored).
     */
    Shape.prototype.raycast = function (result, ray, position, angle) {
      // To be implemented in each subclass
    };
  }, {"../math/vec2": 73}],
  89: [function (require, module, exports) {
    var vec2 = require('../math/vec2')
        , Solver = require('./Solver')
        , Utils = require('../utils/Utils')
        , FrictionEquation = require('../equations/FrictionEquation');

    module.exports = GSSolver;

    /**
     * Iterative Gauss-Seidel constraint equation solver.
     *
     * @class GSSolver
     * @constructor
     * @extends Solver
     * @param {Object} [options]
     * @param {Number} [options.iterations=10]
     * @param {Number} [options.tolerance=0]
     */
    function GSSolver(options) {
      Solver.call(this, options, Solver.GS);
      options = options || {};

    /**
     * The max number of iterations to do when solving. More gives better results, but is more expensive.
     * @property iterations
     * @type {Number}
     */
    this.iterations = options.iterations || 10;

    /**
     * The error tolerance, per constraint. If the total error is below this limit, the solver will stop iterating. Set to zero for as good solution as possible, but to something larger than zero to make computations faster.
     * @property tolerance
     * @type {Number}
     * @default 1e-7
     */
    this.tolerance = options.tolerance || 1e-7;

      this.arrayStep = 30;
      this.lambda = new Utils.ARRAY_TYPE(this.arrayStep);
      this.Bs = new Utils.ARRAY_TYPE(this.arrayStep);
      this.invCs = new Utils.ARRAY_TYPE(this.arrayStep);

    /**
     * Set to true to set all right hand side terms to zero when solving. Can be handy for a few applications.
     * @property useZeroRHS
     * @type {Boolean}
     * @todo Remove, not used
     */
    this.useZeroRHS = false;

    /**
     * Number of solver iterations that are used to approximate normal forces used for friction (F_friction = mu * F_normal). These friction forces will override any other friction forces that are set. If you set frictionIterations = 0, then this feature will be disabled.
     *
     * Use only frictionIterations > 0 if the approximated normal force (F_normal = mass * gravity) is not good enough. Examples of where it can happen is in space games where gravity is zero, or in tall stacks where the normal force is large at bottom but small at top.
     *
     * @property frictionIterations
     * @type {Number}
     * @default 0
     */
    this.frictionIterations = options.frictionIterations !== undefined ? 0 : options.frictionIterations;

      /**
       * The number of iterations that were made during the last solve. If .tolerance is zero, this value will always be equal to .iterations, but if .tolerance is larger than zero, and the solver can quit early, then this number will be somewhere between 1 and .iterations.
       * @property {Number} usedIterations
       */
      this.usedIterations = 0;
    }

    GSSolver.prototype = new Solver();
    GSSolver.prototype.constructor = GSSolver;

    function setArrayZero(array) {
      var l = array.length;
      while (l--) {
        array[l] = +0.0;
    }
    }

    /**
     * Solve the system of equations
     * @method solve
     * @param  {Number}  h       Time step
     * @param  {World}   world    World to solve
     */
    GSSolver.prototype.solve = function (h, world) {

      this.sortEquations();

      var iter = 0,
          maxIter = this.iterations,
          maxFrictionIter = this.frictionIterations,
          equations = this.equations,
          Neq = equations.length,
          tolSquared = Math.pow(this.tolerance * Neq, 2),
          bodies = world.bodies,
          Nbodies = world.bodies.length,
          add = vec2.add,
          set = vec2.set,
          useZeroRHS = this.useZeroRHS,
          lambda = this.lambda;

      this.usedIterations = 0;

      if (Neq) {
        for (var i = 0; i !== Nbodies; i++) {
          var b = bodies[i];

          // Update solve mass
          b.updateSolveMassProperties();
        }
      }

      // Things that does not change during iteration can be computed once
      if (lambda.length < Neq) {
        lambda = this.lambda = new Utils.ARRAY_TYPE(Neq + this.arrayStep);
        this.Bs = new Utils.ARRAY_TYPE(Neq + this.arrayStep);
        this.invCs = new Utils.ARRAY_TYPE(Neq + this.arrayStep);
      }
      setArrayZero(lambda);
      var invCs = this.invCs,
          Bs = this.Bs,
          lambda = this.lambda;

      for (var i = 0; i !== equations.length; i++) {
        var c = equations[i];
        if (c.timeStep !== h || c.needsUpdate) {
          c.timeStep = h;
          c.update();
        }
        Bs[i] = c.computeB(c.a, c.b, h);
        invCs[i] = c.computeInvC(c.epsilon);
      }

      var q, B, c, deltalambdaTot, i, j;

      if (Neq !== 0) {

        for (i = 0; i !== Nbodies; i++) {
          var b = bodies[i];

          // Reset vlambda
          b.resetConstraintVelocity();
        }

        if (maxFrictionIter) {
          // Iterate over contact equations to get normal forces
          for (iter = 0; iter !== maxFrictionIter; iter++) {

            // Accumulate the total error for each iteration.
            deltalambdaTot = 0.0;

            for (j = 0; j !== Neq; j++) {
              c = equations[j];

              var deltalambda = GSSolver.iterateEquation(j, c, c.epsilon, Bs, invCs, lambda, useZeroRHS, h, iter);
              deltalambdaTot += Math.abs(deltalambda);
            }

            this.usedIterations++;

            // If the total error is small enough - stop iterate
            if (deltalambdaTot * deltalambdaTot <= tolSquared) {
              break;
            }
            }

          GSSolver.updateMultipliers(equations, lambda, 1 / h);

          // Set computed friction force
          for (j = 0; j !== Neq; j++) {
            var eq = equations[j];
            if (eq instanceof FrictionEquation) {
              var f = 0.0;
              for (var k = 0; k !== eq.contactEquations.length; k++) {
                f += eq.contactEquations[k].multiplier;
              }
              f *= eq.frictionCoefficient / eq.contactEquations.length;
              eq.maxForce = f;
              eq.minForce = -f;
            }
            }
        }

        // Iterate over all equations
        for (iter = 0; iter !== maxIter; iter++) {

            // Accumulate the total error for each iteration.
            deltalambdaTot = 0.0;

          for (j = 0; j !== Neq; j++) {
            c = equations[j];

            var deltalambda = GSSolver.iterateEquation(j, c, c.epsilon, Bs, invCs, lambda, useZeroRHS, h, iter);
            deltalambdaTot += Math.abs(deltalambda);
            }

            this.usedIterations++;

            // If the total error is small enough - stop iterate
          if (deltalambdaTot * deltalambdaTot <= tolSquared) {
            break;
            }
        }

        // Add result to velocity
        for (i = 0; i !== Nbodies; i++) {
          bodies[i].addConstraintVelocity();
        }

        GSSolver.updateMultipliers(equations, lambda, 1 / h);
      }
    };

// Sets the .multiplier property of each equation
    GSSolver.updateMultipliers = function (equations, lambda, invDt) {
      // Set the .multiplier property of each equation
      var l = equations.length;
      while (l--) {
        equations[l].multiplier = lambda[l] * invDt;
      }
    };

    GSSolver.iterateEquation = function (j, eq, eps, Bs, invCs, lambda, useZeroRHS, dt, iter) {
      // Compute iteration
      var B = Bs[j],
          invC = invCs[j],
          lambdaj = lambda[j],
          GWlambda = eq.computeGWlambda();

      var maxForce = eq.maxForce,
          minForce = eq.minForce;

      if (useZeroRHS) {
        B = 0;
      }

      var deltalambda = invC * ( B - GWlambda - eps * lambdaj );

      // Clamp if we are not within the min/max interval
      var lambdaj_plus_deltalambda = lambdaj + deltalambda;
      if (lambdaj_plus_deltalambda < minForce * dt) {
        deltalambda = minForce * dt - lambdaj;
      } else if (lambdaj_plus_deltalambda > maxForce * dt) {
        deltalambda = maxForce * dt - lambdaj;
      }
      lambda[j] += deltalambda;
      eq.addToWlambda(deltalambda);

      return deltalambda;
    };

  }, {"../equations/FrictionEquation": 66, "../math/vec2": 73, "../utils/Utils": 100, "./Solver": 90}],
  90: [function (require, module, exports) {
    var Utils = require('../utils/Utils')
        , EventEmitter = require('../events/EventEmitter');

    module.exports = Solver;

    /**
     * Base class for constraint solvers.
     * @class Solver
     * @constructor
     * @extends EventEmitter
     */
    function Solver(options, type) {
      options = options || {};

      EventEmitter.call(this);

      this.type = type;

    /**
     * Current equations in the solver.
     *
     * @property equations
     * @type {Array}
     */
    this.equations = [];

    /**
     * Function that is used to sort all equations before each solve.
     * @property equationSortFunction
     * @type {function|boolean}
     */
    this.equationSortFunction = options.equationSortFunction || false;
    }

    Solver.prototype = new EventEmitter();
    Solver.prototype.constructor = Solver;

    /**
     * Method to be implemented in each subclass
     * @method solve
     * @param  {Number} dt
     * @param  {World} world
     */
    Solver.prototype.solve = function (dt, world) {
      throw new Error("Solver.solve should be implemented by subclasses!");
    };

    var mockWorld = {bodies: []};

    /**
     * Solves all constraints in an island.
     * @method solveIsland
     * @param  {Number} dt
     * @param  {Island} island
     */
    Solver.prototype.solveIsland = function (dt, island) {

      this.removeAllEquations();

      if (island.equations.length) {
        // Add equations to solver
        this.addEquations(island.equations);
        mockWorld.bodies.length = 0;
        island.getBodies(mockWorld.bodies);

        // Solve
        if (mockWorld.bodies.length) {
          this.solve(dt, mockWorld);
        }
      }
    };

    /**
     * Sort all equations using the .equationSortFunction. Should be called by subclasses before solving.
     * @method sortEquations
     */
    Solver.prototype.sortEquations = function () {
      if (this.equationSortFunction) {
        this.equations.sort(this.equationSortFunction);
      }
    };

    /**
     * Add an equation to be solved.
     *
     * @method addEquation
     * @param {Equation} eq
     */
    Solver.prototype.addEquation = function (eq) {
      if (eq.enabled) {
        this.equations.push(eq);
      }
    };

    /**
     * Add equations. Same as .addEquation, but this time the argument is an array of Equations
     *
     * @method addEquations
     * @param {Array} eqs
     */
    Solver.prototype.addEquations = function (eqs) {
      //Utils.appendArray(this.equations,eqs);
      for (var i = 0, N = eqs.length; i !== N; i++) {
        var eq = eqs[i];
        if (eq.enabled) {
          this.equations.push(eq);
        }
    }
    };

    /**
     * Remove an equation.
     *
     * @method removeEquation
     * @param {Equation} eq
     */
    Solver.prototype.removeEquation = function (eq) {
      var i = this.equations.indexOf(eq);
      if (i !== -1) {
        this.equations.splice(i, 1);
    }
    };

    /**
     * Remove all currently added equations.
     *
     * @method removeAllEquations
     */
    Solver.prototype.removeAllEquations = function () {
      this.equations.length = 0;
    };

    Solver.GS = 1;
    Solver.ISLAND = 2;

  }, {"../events/EventEmitter": 69, "../utils/Utils": 100}],
  91: [function (require, module, exports) {
    var ContactEquation = require('../equations/ContactEquation');
    var Pool = require('./Pool');

    module.exports = ContactEquationPool;

    /**
     * @class
     */
    function ContactEquationPool() {
      Pool.apply(this, arguments);
    }

    ContactEquationPool.prototype = new Pool();
    ContactEquationPool.prototype.constructor = ContactEquationPool;

    /**
     * @method create
     * @return {ContactEquation}
     */
    ContactEquationPool.prototype.create = function () {
      return new ContactEquation();
    };

    /**
     * @method destroy
     * @param {ContactEquation} equation
     * @return {ContactEquationPool}
     */
    ContactEquationPool.prototype.destroy = function (equation) {
      equation.bodyA = equation.bodyB = null;
      return this;
    };

  }, {"../equations/ContactEquation": 64, "./Pool": 98}],
  92: [function (require, module, exports) {
    var FrictionEquation = require('../equations/FrictionEquation');
    var Pool = require('./Pool');

    module.exports = FrictionEquationPool;

    /**
     * @class
     */
    function FrictionEquationPool() {
      Pool.apply(this, arguments);
    }

    FrictionEquationPool.prototype = new Pool();
    FrictionEquationPool.prototype.constructor = FrictionEquationPool;

    /**
     * @method create
     * @return {FrictionEquation}
     */
    FrictionEquationPool.prototype.create = function () {
      return new FrictionEquation();
    };

    /**
     * @method destroy
     * @param {FrictionEquation} equation
     * @return {FrictionEquationPool}
     */
    FrictionEquationPool.prototype.destroy = function (equation) {
      equation.bodyA = equation.bodyB = null;
      return this;
    };

  }, {"../equations/FrictionEquation": 66, "./Pool": 98}],
  93: [function (require, module, exports) {
    var IslandNode = require('../world/IslandNode');
    var Pool = require('./Pool');

    module.exports = IslandNodePool;

    /**
     * @class
     */
    function IslandNodePool() {
      Pool.apply(this, arguments);
    }

    IslandNodePool.prototype = new Pool();
    IslandNodePool.prototype.constructor = IslandNodePool;

    /**
     * @method create
     * @return {IslandNode}
     */
    IslandNodePool.prototype.create = function () {
      return new IslandNode();
    };

    /**
     * @method destroy
     * @param {IslandNode} node
     * @return {IslandNodePool}
     */
    IslandNodePool.prototype.destroy = function (node) {
      node.reset();
      return this;
    };

  }, {"../world/IslandNode": 103, "./Pool": 98}],
  94: [function (require, module, exports) {
    var Island = require('../world/Island');
    var Pool = require('./Pool');

    module.exports = IslandPool;

    /**
     * @class
     */
    function IslandPool() {
      Pool.apply(this, arguments);
    }

    IslandPool.prototype = new Pool();
    IslandPool.prototype.constructor = IslandPool;

    /**
     * @method create
     * @return {Island}
     */
    IslandPool.prototype.create = function () {
      return new Island();
    };

    /**
     * @method destroy
     * @param {Island} island
     * @return {IslandPool}
     */
    IslandPool.prototype.destroy = function (island) {
      island.reset();
      return this;
    };

  }, {"../world/Island": 101, "./Pool": 98}],
  95: [function (require, module, exports) {
    var TupleDictionary = require('./TupleDictionary');
    var OverlapKeeperRecord = require('./OverlapKeeperRecord');
    var OverlapKeeperRecordPool = require('./OverlapKeeperRecordPool');
    var Utils = require('./Utils');

    module.exports = OverlapKeeper;

    /**
     * Keeps track of overlaps in the current state and the last step state.
     * @class OverlapKeeper
     * @constructor
     */
    function OverlapKeeper() {
      this.overlappingShapesLastState = new TupleDictionary();
      this.overlappingShapesCurrentState = new TupleDictionary();
      this.recordPool = new OverlapKeeperRecordPool({size: 16});
      this.tmpDict = new TupleDictionary();
      this.tmpArray1 = [];
    }

    /**
     * Ticks one step forward in time. This will move the current overlap state to the "old" overlap state, and create a new one as current.
     * @method tick
     */
    OverlapKeeper.prototype.tick = function () {
      var last = this.overlappingShapesLastState;
      var current = this.overlappingShapesCurrentState;

      // Save old objects into pool
      var l = last.keys.length;
      while (l--) {
        var key = last.keys[l];
        var lastObject = last.getByKey(key);
        var currentObject = current.getByKey(key);
        if (lastObject) {
          // The record is only used in the "last" dict, and will be removed. We might as well pool it.
          this.recordPool.release(lastObject);
        }
      }

      // Clear last object
      last.reset();

      // Transfer from new object to old
      last.copy(current);

      // Clear current object
      current.reset();
    };

    /**
     * @method setOverlapping
     * @param {Body} bodyA
     * @param {Body} shapeA
     * @param {Body} bodyB
     * @param {Body} shapeB
     */
    OverlapKeeper.prototype.setOverlapping = function (bodyA, shapeA, bodyB, shapeB) {
      var last = this.overlappingShapesLastState;
      var current = this.overlappingShapesCurrentState;

      // Store current contact state
      if (!current.get(shapeA.id, shapeB.id)) {
        var data = this.recordPool.get();
        data.set(bodyA, shapeA, bodyB, shapeB);
        current.set(shapeA.id, shapeB.id, data);
      }
    };

    OverlapKeeper.prototype.getNewOverlaps = function (result) {
      return this.getDiff(this.overlappingShapesLastState, this.overlappingShapesCurrentState, result);
    };

    OverlapKeeper.prototype.getEndOverlaps = function (result) {
      return this.getDiff(this.overlappingShapesCurrentState, this.overlappingShapesLastState, result);
    };

    /**
     * Checks if two bodies are currently overlapping.
     * @method bodiesAreOverlapping
     * @param  {Body} bodyA
     * @param  {Body} bodyB
     * @return {boolean}
     */
    OverlapKeeper.prototype.bodiesAreOverlapping = function (bodyA, bodyB) {
      var current = this.overlappingShapesCurrentState;
      var l = current.keys.length;
      while (l--) {
        var key = current.keys[l];
        var data = current.data[key];
        if ((data.bodyA === bodyA && data.bodyB === bodyB) || data.bodyA === bodyB && data.bodyB === bodyA) {
          return true;
        }
      }
      return false;
    };

    OverlapKeeper.prototype.getDiff = function (dictA, dictB, result) {
      var result = result || [];
      var last = dictA;
      var current = dictB;

      result.length = 0;

      var l = current.keys.length;
      while (l--) {
        var key = current.keys[l];
        var data = current.data[key];

        if (!data) {
          throw new Error('Key ' + key + ' had no data!');
        }

        var lastData = last.data[key];
        if (!lastData) {
          // Not overlapping in last state, but in current.
          result.push(data);
        }
      }

      return result;
    };

    OverlapKeeper.prototype.isNewOverlap = function (shapeA, shapeB) {
      var idA = shapeA.id | 0,
          idB = shapeB.id | 0;
      var last = this.overlappingShapesLastState;
      var current = this.overlappingShapesCurrentState;
      // Not in last but in new
      return !!!last.get(idA, idB) && !!current.get(idA, idB);
    };

    OverlapKeeper.prototype.getNewBodyOverlaps = function (result) {
      this.tmpArray1.length = 0;
      var overlaps = this.getNewOverlaps(this.tmpArray1);
      return this.getBodyDiff(overlaps, result);
    };

    OverlapKeeper.prototype.getEndBodyOverlaps = function (result) {
      this.tmpArray1.length = 0;
      var overlaps = this.getEndOverlaps(this.tmpArray1);
      return this.getBodyDiff(overlaps, result);
    };

    OverlapKeeper.prototype.getBodyDiff = function (overlaps, result) {
      result = result || [];
      var accumulator = this.tmpDict;

      var l = overlaps.length;

      while (l--) {
        var data = overlaps[l];

        // Since we use body id's for the accumulator, these will be a subset of the original one
        accumulator.set(data.bodyA.id | 0, data.bodyB.id | 0, data);
      }

      l = accumulator.keys.length;
      while (l--) {
        var data = accumulator.getByKey(accumulator.keys[l]);
        if (data) {
          result.push(data.bodyA, data.bodyB);
        }
      }

      accumulator.reset();

      return result;
    };

  }, {"./OverlapKeeperRecord": 96, "./OverlapKeeperRecordPool": 97, "./TupleDictionary": 99, "./Utils": 100}],
  96: [function (require, module, exports) {
    module.exports = OverlapKeeperRecord;

    /**
     * Overlap data container for the OverlapKeeper
     * @class OverlapKeeperRecord
     * @constructor
     * @param {Body} bodyA
     * @param {Shape} shapeA
     * @param {Body} bodyB
     * @param {Shape} shapeB
     */
    function OverlapKeeperRecord(bodyA, shapeA, bodyB, shapeB) {
    /**
     * @property {Shape} shapeA
     */
    this.shapeA = shapeA;
    /**
     * @property {Shape} shapeB
     */
    this.shapeB = shapeB;
    /**
     * @property {Body} bodyA
     */
    this.bodyA = bodyA;
    /**
     * @property {Body} bodyB
     */
    this.bodyB = bodyB;
    }

    /**
     * Set the data for the record
     * @method set
     * @param {Body} bodyA
     * @param {Shape} shapeA
     * @param {Body} bodyB
     * @param {Shape} shapeB
     */
    OverlapKeeperRecord.prototype.set = function (bodyA, shapeA, bodyB, shapeB) {
      OverlapKeeperRecord.call(this, bodyA, shapeA, bodyB, shapeB);
    };

  }, {}],
  97: [function (require, module, exports) {
    var OverlapKeeperRecord = require('./OverlapKeeperRecord');
    var Pool = require('./Pool');

    module.exports = OverlapKeeperRecordPool;

    /**
     * @class
     */
    function OverlapKeeperRecordPool() {
      Pool.apply(this, arguments);
    }

    OverlapKeeperRecordPool.prototype = new Pool();
    OverlapKeeperRecordPool.prototype.constructor = OverlapKeeperRecordPool;

    /**
     * @method create
     * @return {OverlapKeeperRecord}
     */
    OverlapKeeperRecordPool.prototype.create = function () {
      return new OverlapKeeperRecord();
    };

    /**
     * @method destroy
     * @param {OverlapKeeperRecord} record
     * @return {OverlapKeeperRecordPool}
     */
    OverlapKeeperRecordPool.prototype.destroy = function (record) {
      record.bodyA = record.bodyB = record.shapeA = record.shapeB = null;
      return this;
    };

  }, {"./OverlapKeeperRecord": 96, "./Pool": 98}],
  98: [function (require, module, exports) {
    module.exports = Pool;

    /**
     * @class Object pooling utility.
     */
    function Pool(options) {
      options = options || {};

      /**
       * @property {Array} objects
       * @type {Array}
       */
      this.objects = [];

      if (options.size !== undefined) {
        this.resize(options.size);
      }
    }

    /**
     * @method resize
     * @param {number} size
     * @return {Pool} Self, for chaining
     */
    Pool.prototype.resize = function (size) {
      var objects = this.objects;

      while (objects.length > size) {
        objects.pop();
      }

      while (objects.length < size) {
        objects.push(this.create());
      }

      return this;
    };

    /**
     * Get an object from the pool or create a new instance.
     * @method get
     * @return {Object}
     */
    Pool.prototype.get = function () {
      var objects = this.objects;
      return objects.length ? objects.pop() : this.create();
    };

    /**
     * Clean up and put the object back into the pool for later use.
     * @method release
     * @param {Object} object
     * @return {Pool} Self for chaining
     */
    Pool.prototype.release = function (object) {
      this.destroy(object);
      this.objects.push(object);
      return this;
    };

  }, {}],
  99: [function (require, module, exports) {
    var Utils = require('./Utils');

    module.exports = TupleDictionary;

    /**
     * @class TupleDictionary
     * @constructor
     */
    function TupleDictionary() {

    /**
     * The data storage
     * @property data
     * @type {Object}
     */
    this.data = {};

    /**
     * Keys that are currently used.
     * @property {Array} keys
     */
    this.keys = [];
    }

    /**
     * Generate a key given two integers
     * @method getKey
     * @param  {number} i
     * @param  {number} j
     * @return {string}
     */
    TupleDictionary.prototype.getKey = function (id1, id2) {
      id1 = id1 | 0;
      id2 = id2 | 0;

      if ((id1 | 0) === (id2 | 0)) {
        return -1;
      }

      // valid for values < 2^16
      return ((id1 | 0) > (id2 | 0) ?
          (id1 << 16) | (id2 & 0xFFFF) :
          (id2 << 16) | (id1 & 0xFFFF)) | 0
          ;
    };

    /**
     * @method getByKey
     * @param  {Number} key
     * @return {Object}
     */
    TupleDictionary.prototype.getByKey = function (key) {
      key = key | 0;
      return this.data[key];
    };

    /**
     * @method get
     * @param  {Number} i
     * @param  {Number} j
     * @return {Number}
     */
    TupleDictionary.prototype.get = function (i, j) {
      return this.data[this.getKey(i, j)];
    };

    /**
     * Set a value.
     * @method set
     * @param  {Number} i
     * @param  {Number} j
     * @param {Number} value
     */
    TupleDictionary.prototype.set = function (i, j, value) {
      if (!value) {
        throw new Error("No data!");
      }

      var key = this.getKey(i, j);

      // Check if key already exists
      if (!this.data[key]) {
        this.keys.push(key);
      }

      this.data[key] = value;

      return key;
    };

    /**
     * Remove all data.
     * @method reset
     */
    TupleDictionary.prototype.reset = function () {
      var data = this.data,
          keys = this.keys;

      var l = keys.length;
      while (l--) {
        delete data[keys[l]];
      }

      keys.length = 0;
    };

    /**
     * Copy another TupleDictionary. Note that all data in this dictionary will be removed.
     * @method copy
     * @param {TupleDictionary} dict The TupleDictionary to copy into this one.
     */
    TupleDictionary.prototype.copy = function (dict) {
      this.reset();
      Utils.appendArray(this.keys, dict.keys);
      var l = dict.keys.length;
      while (l--) {
        var key = dict.keys[l];
        this.data[key] = dict.data[key];
    }
    };

  }, {"./Utils": 100}],
  100: [function (require, module, exports) {
    /* global P2_ARRAY_TYPE */

    module.exports = Utils;

    /**
     * Misc utility functions
     * @class Utils
     * @constructor
     */
    function Utils() {
    }

    /**
     * Append the values in array b to the array a. See <a href="http://stackoverflow.com/questions/1374126/how-to-append-an-array-to-an-existing-javascript-array/1374131#1374131">this</a> for an explanation.
     * @method appendArray
     * @static
     * @param  {Array} a
     * @param  {Array} b
     */
    Utils.appendArray = function (a, b) {
      if (b.length < 150000) {
        a.push.apply(a, b);
      } else {
        for (var i = 0, len = b.length; i !== len; ++i) {
          a.push(b[i]);
        }
      }
    };

    /**
     * Garbage free Array.splice(). Does not allocate a new array.
     * @method splice
     * @static
     * @param  {Array} array
     * @param  {Number} index
     * @param  {Number} howmany
     */
    Utils.splice = function (array, index, howmany) {
      howmany = howmany || 1;
      for (var i = index, len = array.length - howmany; i < len; i++) {
        array[i] = array[i + howmany];
    }
      array.length = len;
    };

    /**
     * The array type to use for internal numeric computations throughout the library. Float32Array is used if it is available, but falls back on Array. If you want to set array type manually, inject it via the global variable P2_ARRAY_TYPE. See example below.
     * @static
     * @property {function} ARRAY_TYPE
     * @example
     *     <script>
     *         <!-- Inject your preferred array type before loading p2.js -->
     *         P2_ARRAY_TYPE = Array;
     *     </script>
     *     <script src="p2.js"></script>
     */
    if (typeof P2_ARRAY_TYPE !== 'undefined') {
      Utils.ARRAY_TYPE = P2_ARRAY_TYPE;
    } else if (typeof Float32Array !== 'undefined') {
      Utils.ARRAY_TYPE = Float32Array;
    } else {
      Utils.ARRAY_TYPE = Array;
    }

    /**
     * Extend an object with the properties of another
     * @static
     * @method extend
     * @param  {object} a
     * @param  {object} b
     */
    Utils.extend = function (a, b) {
      for (var key in b) {
        a[key] = b[key];
      }
    };

    /**
     * Extend an options object with default values.
     * @static
     * @method defaults
     * @param  {object} options The options object. May be falsy: in this case, a new object is created and returned.
     * @param  {object} defaults An object containing default values.
     * @return {object} The modified options object.
     */
    Utils.defaults = function (options, defaults) {
      options = options || {};
      for (var key in defaults) {
        if (!(key in options)) {
          options[key] = defaults[key];
        }
    }
      return options;
    };

  }, {}],
  101: [function (require, module, exports) {
    var Body = require('../objects/Body');

    module.exports = Island;

    /**
     * An island of bodies connected with equations.
     * @class Island
     * @constructor
     */
    function Island() {

    /**
     * Current equations in this island.
     * @property equations
     * @type {Array}
     */
    this.equations = [];

    /**
     * Current bodies in this island.
     * @property bodies
     * @type {Array}
     */
    this.bodies = [];
    }

    /**
     * Clean this island from bodies and equations.
     * @method reset
     */
    Island.prototype.reset = function () {
      this.equations.length = this.bodies.length = 0;
    };

    var bodyIds = [];

    /**
     * Get all unique bodies in this island.
     * @method getBodies
     * @return {Array} An array of Body
     */
    Island.prototype.getBodies = function (result) {
      var bodies = result || [],
          eqs = this.equations;
      bodyIds.length = 0;
      for (var i = 0; i !== eqs.length; i++) {
        var eq = eqs[i];
        if (bodyIds.indexOf(eq.bodyA.id) === -1) {
          bodies.push(eq.bodyA);
          bodyIds.push(eq.bodyA.id);
        }
        if (bodyIds.indexOf(eq.bodyB.id) === -1) {
          bodies.push(eq.bodyB);
          bodyIds.push(eq.bodyB.id);
        }
      }
      return bodies;
    };

    /**
     * Check if the entire island wants to sleep.
     * @method wantsToSleep
     * @return {Boolean}
     */
    Island.prototype.wantsToSleep = function () {
      for (var i = 0; i < this.bodies.length; i++) {
        var b = this.bodies[i];
        if (b.type === Body.DYNAMIC && !b.wantsToSleep) {
          return false;
        }
      }
      return true;
    };

    /**
     * Make all bodies in the island sleep.
     * @method sleep
     */
    Island.prototype.sleep = function () {
      for (var i = 0; i < this.bodies.length; i++) {
        var b = this.bodies[i];
        b.sleep();
    }
      return true;
    };

  }, {"../objects/Body": 74}],
  102: [function (require, module, exports) {
    var vec2 = require('../math/vec2')
        , Island = require('./Island')
        , IslandNode = require('./IslandNode')
        , IslandNodePool = require('./../utils/IslandNodePool')
        , IslandPool = require('./../utils/IslandPool')
        , Body = require('../objects/Body');

    module.exports = IslandManager;

    /**
     * Splits the system of bodies and equations into independent islands
     *
     * @class IslandManager
     * @constructor
     * @param {Object} [options]
     * @extends Solver
     */
    function IslandManager(options) {

    /**
     * @property nodePool
     * @type {IslandNodePool}
     */
    this.nodePool = new IslandNodePool({size: 16});

      /**
       * @property islandPool
       * @type {IslandPool}
       */
      this.islandPool = new IslandPool({size: 8});

      /**
       * The equations to split. Manually fill this array before running .split().
       * @property {Array} equations
       */
      this.equations = [];

      /**
       * The resulting {{#crossLink "Island"}}{{/crossLink}}s.
       * @property {Array} islands
       */
      this.islands = [];

      /**
       * The resulting graph nodes.
       * @property {Array} nodes
       */
      this.nodes = [];

    /**
     * The node queue, used when traversing the graph of nodes.
     * @private
     * @property {Array} queue
     */
    this.queue = [];
    }

    /**
     * Get an unvisited node from a list of nodes.
     * @static
     * @method getUnvisitedNode
     * @param  {Array} nodes
     * @return {IslandNode|boolean} The node if found, else false.
     */
    IslandManager.getUnvisitedNode = function (nodes) {
      var Nnodes = nodes.length;
      for (var i = 0; i !== Nnodes; i++) {
        var node = nodes[i];
        if (!node.visited && node.body.type === Body.DYNAMIC) {
          return node;
        }
      }
      return false;
    };

    /**
     * Visit a node.
     * @method visit
     * @param  {IslandNode} node
     * @param  {Array} bds
     * @param  {Array} eqs
     */
    IslandManager.prototype.visit = function (node, bds, eqs) {
      bds.push(node.body);
      var Neqs = node.equations.length;
      for (var i = 0; i !== Neqs; i++) {
        var eq = node.equations[i];
        if (eqs.indexOf(eq) === -1) { // Already added?
          eqs.push(eq);
        }
      }
    };

    /**
     * Runs the search algorithm, starting at a root node. The resulting bodies and equations will be stored in the provided arrays.
     * @method bfs
     * @param  {IslandNode} root The node to start from
     * @param  {Array} bds  An array to append resulting Bodies to.
     * @param  {Array} eqs  An array to append resulting Equations to.
     */
    IslandManager.prototype.bfs = function (root, bds, eqs) {

      // Reset the visit queue
      var queue = this.queue;
      queue.length = 0;

      // Add root node to queue
      queue.push(root);
      root.visited = true;
      this.visit(root, bds, eqs);

      // Process all queued nodes
      while (queue.length) {

        // Get next node in the queue
        var node = queue.pop();

        // Visit unvisited neighboring nodes
        var child;
        while ((child = IslandManager.getUnvisitedNode(node.neighbors))) {
          child.visited = true;
          this.visit(child, bds, eqs);

          // Only visit the children of this node if it's dynamic
          if (child.body.type === Body.DYNAMIC) {
            queue.push(child);
            }
        }
      }
    };

    /**
     * Split the world into independent islands. The result is stored in .islands.
     * @method split
     * @param  {World} world
     * @return {Array} The generated islands
     */
    IslandManager.prototype.split = function (world) {
      var bodies = world.bodies,
          nodes = this.nodes,
          equations = this.equations;

      // Move old nodes to the node pool
      while (nodes.length) {
        this.nodePool.release(nodes.pop());
      }

      // Create needed nodes, reuse if possible
      for (var i = 0; i !== bodies.length; i++) {
        var node = this.nodePool.get();
        node.body = bodies[i];
        nodes.push(node);
        // if(this.nodePool.length){
        //     var node = this.nodePool.pop();
        //     node.reset();
        //     node.body = bodies[i];
        //     nodes.push(node);
        // } else {
        //     nodes.push(new IslandNode(bodies[i]));
        // }
      }

      // Add connectivity data. Each equation connects 2 bodies.
      for (var k = 0; k !== equations.length; k++) {
        var eq = equations[k],
            i = bodies.indexOf(eq.bodyA),
            j = bodies.indexOf(eq.bodyB),
            ni = nodes[i],
            nj = nodes[j];
        ni.neighbors.push(nj);
        nj.neighbors.push(ni);
        ni.equations.push(eq);
        nj.equations.push(eq);
      }

      // Move old islands to the island pool
      var islands = this.islands;
      for (var i = 0; i < islands.length; i++) {
        this.islandPool.release(islands[i]);
      }
      islands.length = 0;

      // Get islands
      var child;
      while ((child = IslandManager.getUnvisitedNode(nodes))) {

        // Create new island
        var island = this.islandPool.get();

        // Get all equations and bodies in this island
        this.bfs(child, island.bodies, island.equations);

        islands.push(island);
    }

      return islands;
    };

  }, {
    "../math/vec2": 73,
    "../objects/Body": 74,
    "./../utils/IslandNodePool": 93,
    "./../utils/IslandPool": 94,
    "./Island": 101,
    "./IslandNode": 103
  }],
  103: [function (require, module, exports) {
    module.exports = IslandNode;

    /**
     * Holds a body and keeps track of some additional properties needed for graph traversal.
     * @class IslandNode
     * @constructor
     * @param {Body} body
     */
    function IslandNode(body) {

      /**
       * The body that is contained in this node.
       * @property {Body} body
       */
      this.body = body;

    /**
     * Neighboring IslandNodes
     * @property {Array} neighbors
     */
    this.neighbors = [];

      /**
       * Equations connected to this node.
       * @property {Array} equations
       */
      this.equations = [];

    /**
     * If this node was visiting during the graph traversal.
     * @property visited
     * @type {Boolean}
     */
    this.visited = false;
    }

    /**
     * Clean this node from bodies and equations.
     * @method reset
     */
    IslandNode.prototype.reset = function () {
      this.equations.length = 0;
      this.neighbors.length = 0;
      this.visited = false;
      this.body = null;
    };

  }, {}],
  104: [function (require, module, exports) {
    var GSSolver = require('../solver/GSSolver')
        , Solver = require('../solver/Solver')
        , Ray = require('../collision/Ray')
        , vec2 = require('../math/vec2')
        , Circle = require('../shapes/Circle')
        , Convex = require('../shapes/Convex')
        , Line = require('../shapes/Line')
        , Plane = require('../shapes/Plane')
        , Capsule = require('../shapes/Capsule')
        , Particle = require('../shapes/Particle')
        , EventEmitter = require('../events/EventEmitter')
        , Body = require('../objects/Body')
        , Shape = require('../shapes/Shape')
        , LinearSpring = require('../objects/LinearSpring')
        , Material = require('../material/Material')
        , ContactMaterial = require('../material/ContactMaterial')
        , DistanceConstraint = require('../constraints/DistanceConstraint')
        , Constraint = require('../constraints/Constraint')
        , LockConstraint = require('../constraints/LockConstraint')
        , RevoluteConstraint = require('../constraints/RevoluteConstraint')
        , PrismaticConstraint = require('../constraints/PrismaticConstraint')
        , GearConstraint = require('../constraints/GearConstraint')
        , pkg = require('../../package.json')
        , Broadphase = require('../collision/Broadphase')
        , AABB = require('../collision/AABB')
        , SAPBroadphase = require('../collision/SAPBroadphase')
        , Narrowphase = require('../collision/Narrowphase')
        , Utils = require('../utils/Utils')
        , OverlapKeeper = require('../utils/OverlapKeeper')
        , IslandManager = require('./IslandManager')
        , RotationalSpring = require('../objects/RotationalSpring');

    module.exports = World;

    /**
     * The dynamics world, where all bodies and constraints live.
     *
     * @class World
     * @constructor
     * @param {Object} [options]
     * @param {Solver} [options.solver] Defaults to GSSolver.
     * @param {Array} [options.gravity] Defaults to y=-9.78.
     * @param {Broadphase} [options.broadphase] Defaults to SAPBroadphase
     * @param {Boolean} [options.islandSplit=true]
     * @extends EventEmitter
     *
     * @example
     *     var world = new World({
 *         gravity: [0, -10],
 *         broadphase: new SAPBroadphase()
 *     });
     *     world.addBody(new Body());
     */
    function World(options) {
      EventEmitter.apply(this);

      options = options || {};

      /**
       * All springs in the world. To add a spring to the world, use {{#crossLink "World/addSpring:method"}}{{/crossLink}}.
       *
       * @property springs
       * @type {Array}
       */
      this.springs = [];

      /**
       * All bodies in the world. To add a body to the world, use {{#crossLink "World/addBody:method"}}{{/crossLink}}.
       * @property {Array} bodies
       */
      this.bodies = [];

      /**
       * Disabled body collision pairs. See {{#crossLink "World/disableBodyCollision:method"}}.
       * @private
       * @property {Array} disabledBodyCollisionPairs
       */
      this.disabledBodyCollisionPairs = [];

      /**
       * The solver used to satisfy constraints and contacts. Default is {{#crossLink "GSSolver"}}{{/crossLink}}.
       * @property {Solver} solver
       */
      this.solver = options.solver || new GSSolver();

      /**
       * The narrowphase to use to generate contacts.
       *
       * @property narrowphase
       * @type {Narrowphase}
       */
      this.narrowphase = new Narrowphase(this);

      /**
       * The island manager of this world.
       * @property {IslandManager} islandManager
       */
      this.islandManager = new IslandManager();

      /**
       * Gravity in the world. This is applied on all bodies in the beginning of each step().
       *
       * @property gravity
       * @type {Array}
       */
      this.gravity = vec2.fromValues(0, -9.78);
      if (options.gravity) {
        vec2.copy(this.gravity, options.gravity);
      }

      /**
       * Gravity to use when approximating the friction max force (mu*mass*gravity).
       * @property {Number} frictionGravity
       */
      this.frictionGravity = vec2.length(this.gravity) || 10;

      /**
       * Set to true if you want .frictionGravity to be automatically set to the length of .gravity.
       * @property {Boolean} useWorldGravityAsFrictionGravity
       * @default true
       */
      this.useWorldGravityAsFrictionGravity = true;

      /**
       * If the length of .gravity is zero, and .useWorldGravityAsFrictionGravity=true, then switch to using .frictionGravity for friction instead. This fallback is useful for gravityless games.
       * @property {Boolean} useFrictionGravityOnZeroGravity
       * @default true
       */
      this.useFrictionGravityOnZeroGravity = true;

      /**
       * The broadphase algorithm to use.
       *
       * @property broadphase
       * @type {Broadphase}
       */
      this.broadphase = options.broadphase || new SAPBroadphase();
      this.broadphase.setWorld(this);

      /**
       * User-added constraints.
       *
       * @property constraints
       * @type {Array}
       */
      this.constraints = [];

      /**
       * Dummy default material in the world, used in .defaultContactMaterial
       * @property {Material} defaultMaterial
       */
      this.defaultMaterial = new Material();

      /**
       * The default contact material to use, if no contact material was set for the colliding materials.
       * @property {ContactMaterial} defaultContactMaterial
       */
      this.defaultContactMaterial = new ContactMaterial(this.defaultMaterial, this.defaultMaterial);

      /**
       * For keeping track of what time step size we used last step
       * @property lastTimeStep
       * @type {Number}
       */
      this.lastTimeStep = 1 / 60;

      /**
       * Enable to automatically apply spring forces each step.
       * @property applySpringForces
       * @type {Boolean}
       * @default true
       */
      this.applySpringForces = true;

      /**
       * Enable to automatically apply body damping each step.
       * @property applyDamping
       * @type {Boolean}
       * @default true
       */
      this.applyDamping = true;

      /**
       * Enable to automatically apply gravity each step.
       * @property applyGravity
       * @type {Boolean}
       * @default true
       */
      this.applyGravity = true;

      /**
       * Enable/disable constraint solving in each step.
       * @property solveConstraints
       * @type {Boolean}
       * @default true
       */
      this.solveConstraints = true;

      /**
       * The ContactMaterials added to the World.
       * @property contactMaterials
       * @type {Array}
       */
      this.contactMaterials = [];

      /**
       * World time.
       * @property time
       * @type {Number}
       */
      this.time = 0.0;
      this.accumulator = 0;

      /**
       * Is true during step().
       * @property {Boolean} stepping
       */
      this.stepping = false;

      /**
       * Bodies that are scheduled to be removed at the end of the step.
       * @property {Array} bodiesToBeRemoved
       * @private
       */
      this.bodiesToBeRemoved = [];

      /**
       * Whether to enable island splitting. Island splitting can be an advantage for both precision and performance. See {{#crossLink "IslandManager"}}{{/crossLink}}.
       * @property {Boolean} islandSplit
       * @default true
       */
      this.islandSplit = typeof(options.islandSplit) !== "undefined" ? !!options.islandSplit : true;

      /**
       * Set to true if you want to the world to emit the "impact" event. Turning this off could improve performance.
       * @property emitImpactEvent
       * @type {Boolean}
       * @default true
       */
      this.emitImpactEvent = true;

      // Id counters
      this._constraintIdCounter = 0;
      this._bodyIdCounter = 0;

      /**
       * Fired after the step().
       * @event postStep
       */
      this.postStepEvent = {
        type: "postStep"
      };

      /**
       * Fired when a body is added to the world.
       * @event addBody
       * @param {Body} body
       */
      this.addBodyEvent = {
        type: "addBody",
        body: null
      };

      /**
       * Fired when a body is removed from the world.
       * @event removeBody
       * @param {Body} body
       */
      this.removeBodyEvent = {
        type: "removeBody",
        body: null
      };

      /**
       * Fired when a spring is added to the world.
       * @event addSpring
       * @param {Spring} spring
       */
      this.addSpringEvent = {
        type: "addSpring",
        spring: null
      };

      /**
       * Fired when a first contact is created between two bodies. This event is fired after the step has been done.
       * @event impact
       * @param {Body} bodyA
       * @param {Body} bodyB
       */
      this.impactEvent = {
        type: "impact",
        bodyA: null,
        bodyB: null,
        shapeA: null,
        shapeB: null,
        contactEquation: null
      };

      /**
       * Fired after the Broadphase has collected collision pairs in the world.
       * Inside the event handler, you can modify the pairs array as you like, to
       * prevent collisions between objects that you don't want.
       * @event postBroadphase
       * @param {Array} pairs An array of collision pairs. If this array is [body1,body2,body3,body4], then the body pairs 1,2 and 3,4 would advance to narrowphase.
       */
      this.postBroadphaseEvent = {
        type: "postBroadphase",
        pairs: null
      };

      /**
       * How to deactivate bodies during simulation. Possible modes are: {{#crossLink "World/NO_SLEEPING:property"}}World.NO_SLEEPING{{/crossLink}}, {{#crossLink "World/BODY_SLEEPING:property"}}World.BODY_SLEEPING{{/crossLink}} and {{#crossLink "World/ISLAND_SLEEPING:property"}}World.ISLAND_SLEEPING{{/crossLink}}.
       * If sleeping is enabled, you might need to {{#crossLink "Body/wakeUp:method"}}wake up{{/crossLink}} the bodies if they fall asleep when they shouldn't. If you want to enable sleeping in the world, but want to disable it for a particular body, see {{#crossLink "Body/allowSleep:property"}}Body.allowSleep{{/crossLink}}.
       * @property sleepMode
       * @type {number}
       * @default World.NO_SLEEPING
       */
      this.sleepMode = World.NO_SLEEPING;

      /**
       * Fired when two shapes starts start to overlap. Fired in the narrowphase, during step.
       * @event beginContact
       * @param {Shape} shapeA
       * @param {Shape} shapeB
       * @param {Body}  bodyA
       * @param {Body}  bodyB
       * @param {Array} contactEquations
       */
      this.beginContactEvent = {
        type: "beginContact",
        shapeA: null,
        shapeB: null,
        bodyA: null,
        bodyB: null,
        contactEquations: []
      };

      /**
       * Fired when two shapes stop overlapping, after the narrowphase (during step).
       * @event endContact
       * @param {Shape} shapeA
       * @param {Shape} shapeB
       * @param {Body}  bodyA
       * @param {Body}  bodyB
       */
      this.endContactEvent = {
        type: "endContact",
        shapeA: null,
        shapeB: null,
        bodyA: null,
        bodyB: null
      };

      /**
       * Fired just before equations are added to the solver to be solved. Can be used to control what equations goes into the solver.
       * @event preSolve
       * @param {Array} contactEquations  An array of contacts to be solved.
       * @param {Array} frictionEquations An array of friction equations to be solved.
       */
      this.preSolveEvent = {
        type: "preSolve",
        contactEquations: null,
        frictionEquations: null
      };

      // For keeping track of overlapping shapes
      this.overlappingShapesLastState = {keys: []};
      this.overlappingShapesCurrentState = {keys: []};

    /**
     * @property {OverlapKeeper} overlapKeeper
     */
    this.overlapKeeper = new OverlapKeeper();
    }

    World.prototype = new Object(EventEmitter.prototype);
    World.prototype.constructor = World;

    /**
     * Never deactivate bodies.
     * @static
     * @property {number} NO_SLEEPING
     */
    World.NO_SLEEPING = 1;

    /**
     * Deactivate individual bodies if they are sleepy.
     * @static
     * @property {number} BODY_SLEEPING
     */
    World.BODY_SLEEPING = 2;

    /**
     * Deactivates bodies that are in contact, if all of them are sleepy. Note that you must enable {{#crossLink "World/islandSplit:property"}}.islandSplit{{/crossLink}} for this to work.
     * @static
     * @property {number} ISLAND_SLEEPING
     */
    World.ISLAND_SLEEPING = 4;

    /**
     * Add a constraint to the simulation.
     *
     * @method addConstraint
     * @param {Constraint} constraint
     * @example
     *     var constraint = new LockConstraint(bodyA, bodyB);
     *     world.addConstraint(constraint);
     */
    World.prototype.addConstraint = function (constraint) {
      this.constraints.push(constraint);
    };

    /**
     * Add a ContactMaterial to the simulation.
     * @method addContactMaterial
     * @param {ContactMaterial} contactMaterial
     */
    World.prototype.addContactMaterial = function (contactMaterial) {
      this.contactMaterials.push(contactMaterial);
    };

    /**
     * Removes a contact material
     *
     * @method removeContactMaterial
     * @param {ContactMaterial} cm
     */
    World.prototype.removeContactMaterial = function (cm) {
      var idx = this.contactMaterials.indexOf(cm);
      if (idx !== -1) {
        Utils.splice(this.contactMaterials, idx, 1);
    }
    };

    /**
     * Get a contact material given two materials
     * @method getContactMaterial
     * @param {Material} materialA
     * @param {Material} materialB
     * @return {ContactMaterial} The matching ContactMaterial, or false on fail.
     * @todo Use faster hash map to lookup from material id's
     */
    World.prototype.getContactMaterial = function (materialA, materialB) {
      var cmats = this.contactMaterials;
      for (var i = 0, N = cmats.length; i !== N; i++) {
        var cm = cmats[i];
        if ((cm.materialA.id === materialA.id) && (cm.materialB.id === materialB.id) ||
            (cm.materialA.id === materialB.id) && (cm.materialB.id === materialA.id)) {
          return cm;
        }
      }
      return false;
    };

    /**
     * Removes a constraint
     *
     * @method removeConstraint
     * @param {Constraint} constraint
     */
    World.prototype.removeConstraint = function (constraint) {
      var idx = this.constraints.indexOf(constraint);
      if (idx !== -1) {
        Utils.splice(this.constraints, idx, 1);
      }
    };

    var step_r = vec2.create(),
        step_runit = vec2.create(),
        step_u = vec2.create(),
        step_f = vec2.create(),
        step_fhMinv = vec2.create(),
        step_velodt = vec2.create(),
        step_mg = vec2.create(),
        xiw = vec2.fromValues(0, 0),
        xjw = vec2.fromValues(0, 0),
        zero = vec2.fromValues(0, 0),
        interpvelo = vec2.fromValues(0, 0);

    /**
     * Step the physics world forward in time.
     *
     * There are two modes. The simple mode is fixed timestepping without interpolation. In this case you only use the first argument. The second case uses interpolation. In that you also provide the time since the function was last used, as well as the maximum fixed timesteps to take.
     *
     * @method step
     * @param {Number} dt                       The fixed time step size to use.
     * @param {Number} [timeSinceLastCalled=0]  The time elapsed since the function was last called.
     * @param {Number} [maxSubSteps=10]         Maximum number of fixed steps to take per function call.
     *
     * @example
     *     // Simple fixed timestepping without interpolation
     *     var fixedTimeStep = 1 / 60;
     *     var world = new World();
     *     var body = new Body({ mass: 1 });
     *     world.addBody(body);
     *
     *     function animate(){
 *         requestAnimationFrame(animate);
 *         world.step(fixedTimeStep);
 *         renderBody(body.position, body.angle);
 *     }
     *
     *     // Start animation loop
     *     requestAnimationFrame(animate);
     *
     * @example
     *     // Fixed timestepping with interpolation
     *     var maxSubSteps = 10;
     *     var lastTimeSeconds;
     *
     *     function animate(t){
 *         requestAnimationFrame(animate);
 *         timeSeconds = t / 1000;
 *         lastTimeSeconds = lastTimeSeconds || timeSeconds;
 *
 *         deltaTime = timeSeconds - lastTimeSeconds;
 *         world.step(fixedTimeStep, deltaTime, maxSubSteps);
 *
 *         renderBody(body.interpolatedPosition, body.interpolatedAngle);
 *     }
     *
     *     // Start animation loop
     *     requestAnimationFrame(animate);
     *
     * @see http://bulletphysics.org/mediawiki-1.5.8/index.php/Stepping_The_World
     */
    World.prototype.step = function (dt, timeSinceLastCalled, maxSubSteps) {
      maxSubSteps = maxSubSteps || 10;
      timeSinceLastCalled = timeSinceLastCalled || 0;

      if (timeSinceLastCalled === 0) { // Fixed, simple stepping

        this.internalStep(dt);

        // Increment time
        this.time += dt;

      } else {

        this.accumulator += timeSinceLastCalled;
        var substeps = 0;
        while (this.accumulator >= dt && substeps < maxSubSteps) {
          // Do fixed steps to catch up
          this.internalStep(dt);
          this.time += dt;
          this.accumulator -= dt;
          substeps++;
        }

        var t = (this.accumulator % dt) / dt;
        for (var j = 0; j !== this.bodies.length; j++) {
          var b = this.bodies[j];
          vec2.lerp(b.interpolatedPosition, b.previousPosition, b.position, t);
          b.interpolatedAngle = b.previousAngle + t * (b.angle - b.previousAngle);
        }
      }
    };

    var endOverlaps = [];

    /**
     * Make a fixed step.
     * @method internalStep
     * @param  {number} dt
     * @private
     */
    World.prototype.internalStep = function (dt) {
      this.stepping = true;

      var that = this,
          Nsprings = this.springs.length,
          springs = this.springs,
          bodies = this.bodies,
          g = this.gravity,
          solver = this.solver,
          Nbodies = this.bodies.length,
          broadphase = this.broadphase,
          np = this.narrowphase,
          constraints = this.constraints,
          t0, t1,
          fhMinv = step_fhMinv,
          velodt = step_velodt,
          mg = step_mg,
          scale = vec2.scale,
          add = vec2.add,
          rotate = vec2.rotate,
          islandManager = this.islandManager;

      this.overlapKeeper.tick();

      this.lastTimeStep = dt;

      // Update approximate friction gravity.
      if (this.useWorldGravityAsFrictionGravity) {
        var gravityLen = vec2.length(this.gravity);
        if (!(gravityLen === 0 && this.useFrictionGravityOnZeroGravity)) {
          // Nonzero gravity. Use it.
          this.frictionGravity = gravityLen;
        }
      }

      // Add gravity to bodies
      if (this.applyGravity) {
        for (var i = 0; i !== Nbodies; i++) {
          var b = bodies[i],
              fi = b.force;
          if (b.type !== Body.DYNAMIC || b.sleepState === Body.SLEEPING) {
            continue;
            }
          vec2.scale(mg, g, b.mass * b.gravityScale); // F=m*g
          add(fi, fi, mg);
        }
      }

      // Add spring forces
      if (this.applySpringForces) {
        for (var i = 0; i !== Nsprings; i++) {
          var s = springs[i];
          s.applyForce();
        }
      }

      if (this.applyDamping) {
        for (var i = 0; i !== Nbodies; i++) {
          var b = bodies[i];
          if (b.type === Body.DYNAMIC) {
            b.applyDamping(dt);
            }
        }
      }

      // Broadphase
      var result = broadphase.getCollisionPairs(this);

      // Remove ignored collision pairs
      var ignoredPairs = this.disabledBodyCollisionPairs;
      for (var i = ignoredPairs.length - 2; i >= 0; i -= 2) {
        for (var j = result.length - 2; j >= 0; j -= 2) {
          if ((ignoredPairs[i] === result[j] && ignoredPairs[i + 1] === result[j + 1]) ||
              (ignoredPairs[i + 1] === result[j] && ignoredPairs[i] === result[j + 1])) {
            result.splice(j, 2);
            }
        }
      }

      // Remove constrained pairs with collideConnected == false
      var Nconstraints = constraints.length;
      for (i = 0; i !== Nconstraints; i++) {
        var c = constraints[i];
        if (!c.collideConnected) {
          for (var j = result.length - 2; j >= 0; j -= 2) {
            if ((c.bodyA === result[j] && c.bodyB === result[j + 1]) ||
                (c.bodyB === result[j] && c.bodyA === result[j + 1])) {
              result.splice(j, 2);
                }
            }
        }
      }

      // postBroadphase event
      this.postBroadphaseEvent.pairs = result;
      this.emit(this.postBroadphaseEvent);
      this.postBroadphaseEvent.pairs = null;

      // Narrowphase
      np.reset(this);
      for (var i = 0, Nresults = result.length; i !== Nresults; i += 2) {
        var bi = result[i],
            bj = result[i + 1];

        // Loop over all shapes of body i
        for (var k = 0, Nshapesi = bi.shapes.length; k !== Nshapesi; k++) {
          var si = bi.shapes[k],
              xi = si.position,
              ai = si.angle;

          // All shapes of body j
          for (var l = 0, Nshapesj = bj.shapes.length; l !== Nshapesj; l++) {
            var sj = bj.shapes[l],
                xj = sj.position,
                aj = sj.angle;

            var cm = this.defaultContactMaterial;
            if (si.material && sj.material) {
              var tmp = this.getContactMaterial(si.material, sj.material);
              if (tmp) {
                cm = tmp;
                    }
                }

            this.runNarrowphase(np, bi, si, xi, ai, bj, sj, xj, aj, cm, this.frictionGravity);
            }
        }
      }

      // Wake up bodies
      for (var i = 0; i !== Nbodies; i++) {
        var body = bodies[i];
        if (body._wakeUpAfterNarrowphase) {
          body.wakeUp();
          body._wakeUpAfterNarrowphase = false;
        }
      }

      // Emit end overlap events
      if (this.has('endContact')) {
        this.overlapKeeper.getEndOverlaps(endOverlaps);
        var e = this.endContactEvent;
        var l = endOverlaps.length;
        while (l--) {
          var data = endOverlaps[l];
          e.shapeA = data.shapeA;
          e.shapeB = data.shapeB;
          e.bodyA = data.bodyA;
          e.bodyB = data.bodyB;
          this.emit(e);
        }
        endOverlaps.length = 0;
      }

      var preSolveEvent = this.preSolveEvent;
      preSolveEvent.contactEquations = np.contactEquations;
      preSolveEvent.frictionEquations = np.frictionEquations;
      this.emit(preSolveEvent);
      preSolveEvent.contactEquations = preSolveEvent.frictionEquations = null;

      // update constraint equations
      var Nconstraints = constraints.length;
      for (i = 0; i !== Nconstraints; i++) {
        constraints[i].update();
      }

      if (np.contactEquations.length || np.frictionEquations.length || Nconstraints) {
        if (this.islandSplit) {
          // Split into islands
          islandManager.equations.length = 0;
          Utils.appendArray(islandManager.equations, np.contactEquations);
          Utils.appendArray(islandManager.equations, np.frictionEquations);
          for (i = 0; i !== Nconstraints; i++) {
            Utils.appendArray(islandManager.equations, constraints[i].equations);
            }
          islandManager.split(this);

          for (var i = 0; i !== islandManager.islands.length; i++) {
            var island = islandManager.islands[i];
            if (island.equations.length) {
              solver.solveIsland(dt, island);
                }
            }

        } else {

          // Add contact equations to solver
          solver.addEquations(np.contactEquations);
          solver.addEquations(np.frictionEquations);

          // Add user-defined constraint equations
          for (i = 0; i !== Nconstraints; i++) {
            solver.addEquations(constraints[i].equations);
            }

          if (this.solveConstraints) {
            solver.solve(dt, this);
            }

          solver.removeAllEquations();
        }
      }

      // Step forward
      for (var i = 0; i !== Nbodies; i++) {
        var body = bodies[i];

        // if(body.sleepState !== Body.SLEEPING && body.type !== Body.STATIC){
        body.integrate(dt);
        // }
      }

      // Reset force
      for (var i = 0; i !== Nbodies; i++) {
        bodies[i].setZeroForce();
      }

      // Emit impact event
      if (this.emitImpactEvent && this.has('impact')) {
        var ev = this.impactEvent;
        for (var i = 0; i !== np.contactEquations.length; i++) {
          var eq = np.contactEquations[i];
          if (eq.firstImpact) {
            ev.bodyA = eq.bodyA;
            ev.bodyB = eq.bodyB;
            ev.shapeA = eq.shapeA;
            ev.shapeB = eq.shapeB;
            ev.contactEquation = eq;
            this.emit(ev);
            }
        }
      }

      // Sleeping update
      if (this.sleepMode === World.BODY_SLEEPING) {
        for (i = 0; i !== Nbodies; i++) {
          bodies[i].sleepTick(this.time, false, dt);
        }
      } else if (this.sleepMode === World.ISLAND_SLEEPING && this.islandSplit) {

        // Tell all bodies to sleep tick but dont sleep yet
        for (i = 0; i !== Nbodies; i++) {
          bodies[i].sleepTick(this.time, true, dt);
        }

        // Sleep islands
        for (var i = 0; i < this.islandManager.islands.length; i++) {
          var island = this.islandManager.islands[i];
          if (island.wantsToSleep()) {
            island.sleep();
            }
        }
      }

      this.stepping = false;

      // Remove bodies that are scheduled for removal
      var bodiesToBeRemoved = this.bodiesToBeRemoved;
      for (var i = 0; i !== bodiesToBeRemoved.length; i++) {
        this.removeBody(bodiesToBeRemoved[i]);
      }
      bodiesToBeRemoved.length = 0;

      this.emit(this.postStepEvent);
    };

    /**
     * Runs narrowphase for the shape pair i and j.
     * @method runNarrowphase
     * @param  {Narrowphase} np
     * @param  {Body} bi
     * @param  {Shape} si
     * @param  {Array} xi
     * @param  {Number} ai
     * @param  {Body} bj
     * @param  {Shape} sj
     * @param  {Array} xj
     * @param  {Number} aj
     * @param  {Number} mu
     */
    World.prototype.runNarrowphase = function (np, bi, si, xi, ai, bj, sj, xj, aj, cm, glen) {

      // Check collision groups and masks
      if (!((si.collisionGroup & sj.collisionMask) !== 0 && (sj.collisionGroup & si.collisionMask) !== 0)) {
        return;
      }

      // Get world position and angle of each shape
      vec2.rotate(xiw, xi, bi.angle);
      vec2.rotate(xjw, xj, bj.angle);
      vec2.add(xiw, xiw, bi.position);
      vec2.add(xjw, xjw, bj.position);
      var aiw = ai + bi.angle;
      var ajw = aj + bj.angle;

      np.enableFriction = cm.friction > 0;
      np.frictionCoefficient = cm.friction;
      var reducedMass;
      if (bi.type === Body.STATIC || bi.type === Body.KINEMATIC) {
        reducedMass = bj.mass;
      } else if (bj.type === Body.STATIC || bj.type === Body.KINEMATIC) {
        reducedMass = bi.mass;
      } else {
        reducedMass = (bi.mass * bj.mass) / (bi.mass + bj.mass);
      }
      np.slipForce = cm.friction * glen * reducedMass;
      np.restitution = cm.restitution;
      np.surfaceVelocity = cm.surfaceVelocity;
      np.frictionStiffness = cm.frictionStiffness;
      np.frictionRelaxation = cm.frictionRelaxation;
      np.stiffness = cm.stiffness;
      np.relaxation = cm.relaxation;
      np.contactSkinSize = cm.contactSkinSize;
      np.enabledEquations = bi.collisionResponse && bj.collisionResponse && si.collisionResponse && sj.collisionResponse;

      var resolver = np[si.type | sj.type],
          numContacts = 0;
      if (resolver) {
        var sensor = si.sensor || sj.sensor;
        var numFrictionBefore = np.frictionEquations.length;
        if (si.type < sj.type) {
          numContacts = resolver.call(np, bi, si, xiw, aiw, bj, sj, xjw, ajw, sensor);
        } else {
          numContacts = resolver.call(np, bj, sj, xjw, ajw, bi, si, xiw, aiw, sensor);
        }
        var numFrictionEquations = np.frictionEquations.length - numFrictionBefore;

        if (numContacts) {

          if (bi.allowSleep &&
              bi.type === Body.DYNAMIC &&
              bi.sleepState === Body.SLEEPING &&
              bj.sleepState === Body.AWAKE &&
              bj.type !== Body.STATIC
          ) {
            var speedSquaredB = vec2.squaredLength(bj.velocity) + Math.pow(bj.angularVelocity, 2);
            var speedLimitSquaredB = Math.pow(bj.sleepSpeedLimit, 2);
            if (speedSquaredB >= speedLimitSquaredB * 2) {
              bi._wakeUpAfterNarrowphase = true;
            }
            }

          if (bj.allowSleep &&
              bj.type === Body.DYNAMIC &&
              bj.sleepState === Body.SLEEPING &&
              bi.sleepState === Body.AWAKE &&
              bi.type !== Body.STATIC
          ) {
            var speedSquaredA = vec2.squaredLength(bi.velocity) + Math.pow(bi.angularVelocity, 2);
            var speedLimitSquaredA = Math.pow(bi.sleepSpeedLimit, 2);
            if (speedSquaredA >= speedLimitSquaredA * 2) {
              bj._wakeUpAfterNarrowphase = true;
                }
            }

          this.overlapKeeper.setOverlapping(bi, si, bj, sj);
          if (this.has('beginContact') && this.overlapKeeper.isNewOverlap(si, sj)) {

            // Report new shape overlap
            var e = this.beginContactEvent;
            e.shapeA = si;
            e.shapeB = sj;
            e.bodyA = bi;
            e.bodyB = bj;

            // Reset contact equations
            e.contactEquations.length = 0;

            if (typeof(numContacts) === "number") {
              for (var i = np.contactEquations.length - numContacts; i < np.contactEquations.length; i++) {
                e.contactEquations.push(np.contactEquations[i]);
              }
                }

            this.emit(e);
            }

          // divide the max friction force by the number of contacts
          if (typeof(numContacts) === "number" && numFrictionEquations > 1) { // Why divide by 1?
            for (var i = np.frictionEquations.length - numFrictionEquations; i < np.frictionEquations.length; i++) {
              var f = np.frictionEquations[i];
              f.setSlipForce(f.getSlipForce() / numFrictionEquations);
                }
            }
        }
      }

    };

    /**
     * Add a spring to the simulation
     *
     * @method addSpring
     * @param {Spring} spring
     */
    World.prototype.addSpring = function (spring) {
      this.springs.push(spring);
      var evt = this.addSpringEvent;
      evt.spring = spring;
      this.emit(evt);
      evt.spring = null;
    };

    /**
     * Remove a spring
     *
     * @method removeSpring
     * @param {Spring} spring
     */
    World.prototype.removeSpring = function (spring) {
      var idx = this.springs.indexOf(spring);
      if (idx !== -1) {
        Utils.splice(this.springs, idx, 1);
      }
    };

    /**
     * Add a body to the simulation
     *
     * @method addBody
     * @param {Body} body
     *
     * @example
     *     var world = new World(),
     *         body = new Body();
     *     world.addBody(body);
     * @todo What if this is done during step?
     */
    World.prototype.addBody = function (body) {
      if (this.bodies.indexOf(body) === -1) {
        this.bodies.push(body);
        body.world = this;
        var evt = this.addBodyEvent;
        evt.body = body;
        this.emit(evt);
        evt.body = null;
      }
    };

    /**
     * Remove a body from the simulation. If this method is called during step(), the body removal is scheduled to after the step.
     *
     * @method removeBody
     * @param {Body} body
     */
    World.prototype.removeBody = function (body) {
      if (this.stepping) {
        this.bodiesToBeRemoved.push(body);
      } else {
        body.world = null;
        var idx = this.bodies.indexOf(body);
        if (idx !== -1) {
          Utils.splice(this.bodies, idx, 1);
          this.removeBodyEvent.body = body;
          body.resetConstraintVelocity();
          this.emit(this.removeBodyEvent);
          this.removeBodyEvent.body = null;
        }
      }
    };

    /**
     * Get a body by its id.
     * @method getBodyById
     * @param {number} id
     * @return {Body} The body, or false if it was not found.
     */
    World.prototype.getBodyById = function (id) {
      var bodies = this.bodies;
      for (var i = 0; i < bodies.length; i++) {
        var b = bodies[i];
        if (b.id === id) {
          return b;
        }
      }
      return false;
    };

    /**
     * Disable collision between two bodies
     * @method disableBodyCollision
     * @param {Body} bodyA
     * @param {Body} bodyB
     */
    World.prototype.disableBodyCollision = function (bodyA, bodyB) {
      this.disabledBodyCollisionPairs.push(bodyA, bodyB);
    };

    /**
     * Enable collisions between the given two bodies
     * @method enableBodyCollision
     * @param {Body} bodyA
     * @param {Body} bodyB
     */
    World.prototype.enableBodyCollision = function (bodyA, bodyB) {
      var pairs = this.disabledBodyCollisionPairs;
      for (var i = 0; i < pairs.length; i += 2) {
        if ((pairs[i] === bodyA && pairs[i + 1] === bodyB) || (pairs[i + 1] === bodyA && pairs[i] === bodyB)) {
          pairs.splice(i, 2);
          return;
        }
      }
    };

    /**
     * Resets the World, removes all bodies, constraints and springs.
     *
     * @method clear
     */
    World.prototype.clear = function () {

      this.time = 0;

      // Remove all solver equations
      if (this.solver && this.solver.equations.length) {
        this.solver.removeAllEquations();
      }

      // Remove all constraints
      var cs = this.constraints;
      for (var i = cs.length - 1; i >= 0; i--) {
        this.removeConstraint(cs[i]);
      }

      // Remove all bodies
      var bodies = this.bodies;
      for (var i = bodies.length - 1; i >= 0; i--) {
        this.removeBody(bodies[i]);
      }

      // Remove all springs
      var springs = this.springs;
      for (var i = springs.length - 1; i >= 0; i--) {
        this.removeSpring(springs[i]);
      }

      // Remove all contact materials
      var cms = this.contactMaterials;
      for (var i = cms.length - 1; i >= 0; i--) {
        this.removeContactMaterial(cms[i]);
      }

      World.apply(this);
    };

    var hitTest_tmp1 = vec2.create(),
        hitTest_zero = vec2.fromValues(0, 0),
        hitTest_tmp2 = vec2.fromValues(0, 0);

    /**
     * Test if a world point overlaps bodies
     * @method hitTest
     * @param  {Array}  worldPoint  Point to use for intersection tests
     * @param  {Array}  bodies      A list of objects to check for intersection
     * @param  {Number} precision   Used for matching against particles and lines. Adds some margin to these infinitesimal objects.
     * @return {Array}              Array of bodies that overlap the point
     * @todo Should use an api similar to the raycast function
     * @todo Should probably implement a .containsPoint method for all shapes. Would be more efficient
     * @todo Should use the broadphase
     */
    World.prototype.hitTest = function (worldPoint, bodies, precision) {
      precision = precision || 0;

      // Create a dummy particle body with a particle shape to test against the bodies
      var pb = new Body({position: worldPoint}),
          ps = new Particle(),
          px = worldPoint,
          pa = 0,
          x = hitTest_tmp1,
          zero = hitTest_zero,
          tmp = hitTest_tmp2;
      pb.addShape(ps);

      var n = this.narrowphase,
          result = [];

      // Check bodies
      for (var i = 0, N = bodies.length; i !== N; i++) {
        var b = bodies[i];

        for (var j = 0, NS = b.shapes.length; j !== NS; j++) {
          var s = b.shapes[j];

          // Get shape world position + angle
          vec2.rotate(x, s.position, b.angle);
          vec2.add(x, x, b.position);
          var a = s.angle + b.angle;

          if ((s instanceof Circle && n.circleParticle(b, s, x, a, pb, ps, px, pa, true)) ||
              (s instanceof Convex && n.particleConvex(pb, ps, px, pa, b, s, x, a, true)) ||
              (s instanceof Plane && n.particlePlane(pb, ps, px, pa, b, s, x, a, true)) ||
              (s instanceof Capsule && n.particleCapsule(pb, ps, px, pa, b, s, x, a, true)) ||
              (s instanceof Particle && vec2.squaredLength(vec2.sub(tmp, x, worldPoint)) < precision * precision)
          ) {
            result.push(b);
            }
        }
      }

      return result;
    };

    /**
     * Set the stiffness for all equations and contact materials.
     * @method setGlobalStiffness
     * @param {Number} stiffness
     */
    World.prototype.setGlobalStiffness = function (stiffness) {

      // Set for all constraints
      var constraints = this.constraints;
      for (var i = 0; i !== constraints.length; i++) {
        var c = constraints[i];
        for (var j = 0; j !== c.equations.length; j++) {
          var eq = c.equations[j];
          eq.stiffness = stiffness;
          eq.needsUpdate = true;
        }
      }

      // Set for all contact materials
      var contactMaterials = this.contactMaterials;
      for (var i = 0; i !== contactMaterials.length; i++) {
        var c = contactMaterials[i];
        c.stiffness = c.frictionStiffness = stiffness;
      }

      // Set for default contact material
      var c = this.defaultContactMaterial;
      c.stiffness = c.frictionStiffness = stiffness;
    };

    /**
     * Set the relaxation for all equations and contact materials.
     * @method setGlobalRelaxation
     * @param {Number} relaxation
     */
    World.prototype.setGlobalRelaxation = function (relaxation) {

      // Set for all constraints
      for (var i = 0; i !== this.constraints.length; i++) {
        var c = this.constraints[i];
        for (var j = 0; j !== c.equations.length; j++) {
          var eq = c.equations[j];
          eq.relaxation = relaxation;
          eq.needsUpdate = true;
        }
      }

      // Set for all contact materials
      for (var i = 0; i !== this.contactMaterials.length; i++) {
        var c = this.contactMaterials[i];
        c.relaxation = c.frictionRelaxation = relaxation;
      }

      // Set for default contact material
      var c = this.defaultContactMaterial;
      c.relaxation = c.frictionRelaxation = relaxation;
    };

    var tmpAABB = new AABB();
    var tmpArray = [];

    /**
     * Ray cast against all bodies in the world.
     * @method raycast
     * @param  {RaycastResult} result
     * @param  {Ray} ray
     * @return {boolean} True if any body was hit.
     *
     * @example
     *     var ray = new Ray({
 *         mode: Ray.CLOSEST, // or ANY
 *         from: [0, 0],
 *         to: [10, 0],
 *     });
     *     var result = new RaycastResult();
     *     world.raycast(result, ray);
     *
     *     // Get the hit point
     *     var hitPoint = vec2.create();
     *     result.getHitPoint(hitPoint, ray);
     *     console.log('Hit point: ', hitPoint[0], hitPoint[1], ' at distance ' + result.getHitDistance(ray));
     *
     * @example
     *     var ray = new Ray({
 *         mode: Ray.ALL,
 *         from: [0, 0],
 *         to: [10, 0],
 *         callback: function(result){
 *
 *             // Print some info about the hit
 *             console.log('Hit body and shape: ', result.body, result.shape);
 *
 *             // Get the hit point
 *             var hitPoint = vec2.create();
 *             result.getHitPoint(hitPoint, ray);
 *             console.log('Hit point: ', hitPoint[0], hitPoint[1], ' at distance ' + result.getHitDistance(ray));
 *
 *             // If you are happy with the hits you got this far, you can stop the traversal here:
 *             result.stop();
 *         }
 *     });
     *     var result = new RaycastResult();
     *     world.raycast(result, ray);
     */
    World.prototype.raycast = function (result, ray) {

      // Get all bodies within the ray AABB
      ray.getAABB(tmpAABB);
      this.broadphase.aabbQuery(this, tmpAABB, tmpArray);
      ray.intersectBodies(result, tmpArray);
      tmpArray.length = 0;

      return result.hasHit();
    };

  }, {
    "../../package.json": 49,
    "../collision/AABB": 50,
    "../collision/Broadphase": 51,
    "../collision/Narrowphase": 53,
    "../collision/Ray": 54,
    "../collision/SAPBroadphase": 56,
    "../constraints/Constraint": 57,
    "../constraints/DistanceConstraint": 58,
    "../constraints/GearConstraint": 59,
    "../constraints/LockConstraint": 60,
    "../constraints/PrismaticConstraint": 61,
    "../constraints/RevoluteConstraint": 62,
    "../events/EventEmitter": 69,
    "../material/ContactMaterial": 70,
    "../material/Material": 71,
    "../math/vec2": 73,
    "../objects/Body": 74,
    "../objects/LinearSpring": 75,
    "../objects/RotationalSpring": 76,
    "../shapes/Capsule": 81,
    "../shapes/Circle": 82,
    "../shapes/Convex": 83,
    "../shapes/Line": 85,
    "../shapes/Particle": 86,
    "../shapes/Plane": 87,
    "../shapes/Shape": 88,
    "../solver/GSSolver": 89,
    "../solver/Solver": 90,
    "../utils/OverlapKeeper": 95,
    "../utils/Utils": 100,
    "./IslandManager": 102
  }],
  105: [function (require, module, exports) {
    (function (Buffer) {
      var sax = require('sax');
      var fs = require('fs');
      var path = require('path');
      var zlib = require('zlib');
      var Pend = require('pend');

      exports.readFile = defaultReadFile;
      exports.parseFile = parseFile;
      exports.parse = parse;
      exports.Map = Map;
      exports.TileSet = TileSet;
      exports.Image = Image;
      exports.Tile = Tile;
      exports.TileLayer = TileLayer;
      exports.ObjectLayer = ObjectLayer;
      exports.ImageLayer = ImageLayer;
      exports.TmxObject = TmxObject;
      exports.Terrain = Terrain;

      var FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
      var FLIPPED_VERTICALLY_FLAG = 0x40000000;
      var FLIPPED_DIAGONALLY_FLAG = 0x20000000;

      var STATE_COUNT = 0;
      var STATE_START = STATE_COUNT++;
      var STATE_MAP = STATE_COUNT++;
      var STATE_COLLECT_PROPS = STATE_COUNT++;
      var STATE_COLLECT_ANIMATIONS = STATE_COUNT++;
      var STATE_COLLECT_OBJECT_GROUPS = STATE_COUNT++;
      var STATE_WAIT_FOR_CLOSE = STATE_COUNT++;
      var STATE_TILESET = STATE_COUNT++;
      var STATE_TILE = STATE_COUNT++;
      var STATE_TILE_LAYER = STATE_COUNT++;
      var STATE_OBJECT_LAYER = STATE_COUNT++;
      var STATE_OBJECT = STATE_COUNT++;
      var STATE_TILE_OBJECT = STATE_COUNT++;
      var STATE_IMAGE_LAYER = STATE_COUNT++;
      var STATE_TILE_DATA_XML = STATE_COUNT++;
      var STATE_TILE_DATA_CSV = STATE_COUNT++;
      var STATE_TILE_DATA_B64_RAW = STATE_COUNT++;
      var STATE_TILE_DATA_B64_GZIP = STATE_COUNT++;
      var STATE_TILE_DATA_B64_ZLIB = STATE_COUNT++;
      var STATE_TERRAIN_TYPES = STATE_COUNT++;
      var STATE_TERRAIN = STATE_COUNT++;

      function parse(content, pathToFile, cb) {
        var pathToDir = path.dirname(pathToFile);
        var parser = sax.parser();
        var map;
        var topLevelObject = null;
        var state = STATE_START;
        var states = new Array(STATE_COUNT);
        var waitForCloseNextState = 0;
        var waitForCloseOpenCount = 0;
        var propertiesObject = null;
        var propertiesNextState = 0;
        var animationsObject = null;
        var animationsNextState = 0;
        var objectGroupsObject = null;
        var objectGroupsNextState = 0;
        var tileIndex = 0;
        var tileSet = null;
        var tileSetNextState = 0;
        var tile;
        var layer;
        var object;
        var terrain;
        var pend = new Pend();
        // this holds the numerical tile ids
        // later we use it to resolve the real tiles
        var unresolvedLayers = [];
        var unresolvedLayer;
        states[STATE_START] = {
          opentag: function (tag) {
            if (tag.name === 'MAP') {
              map = new Map();
              topLevelObject = map;
              map.version = tag.attributes.VERSION;
              map.orientation = tag.attributes.ORIENTATION;
              map.width = int(tag.attributes.WIDTH);
              map.height = int(tag.attributes.HEIGHT);
              map.tileWidth = int(tag.attributes.TILEWIDTH);
              map.tileHeight = int(tag.attributes.TILEHEIGHT);
              map.backgroundColor = tag.attributes.BACKGROUNDCOLOR;

              state = STATE_MAP;
            } else if (tag.name === 'TILESET') {
              collectTileSet(tag, STATE_START);
              topLevelObject = tileSet;
            } else {
              waitForClose();
            }
          },
          closetag: noop,
          text: noop,
        };
        states[STATE_MAP] = {
          opentag: function (tag) {
            switch (tag.name) {
              case 'PROPERTIES':
                collectProperties(map.properties);
                break;
              case 'TILESET':
                collectTileSet(tag, STATE_MAP);
                map.tileSets.push(tileSet);
                break;
              case 'LAYER':
                layer = new TileLayer(map);
          tileIndex = 0;
                layer.name = tag.attributes.NAME;
                layer.opacity = float(tag.attributes.OPACITY, 1);
                layer.visible = bool(tag.attributes.VISIBLE, true);
                map.layers.push(layer);
                unresolvedLayer = {
                  layer: layer,
                  tiles: new Array(map.width * map.height),
          };
                unresolvedLayers.push(unresolvedLayer);
                state = STATE_TILE_LAYER;
                break;
              case 'OBJECTGROUP':
                layer = new ObjectLayer();
                layer.name = tag.attributes.NAME;
                layer.color = tag.attributes.COLOR;
                layer.opacity = float(tag.attributes.OPACITY, 1);
                layer.visible = bool(tag.attributes.VISIBLE, true);
                map.layers.push(layer);
                state = STATE_OBJECT_LAYER;
                break;
              case 'IMAGELAYER':
                layer = new ImageLayer();
                layer.name = tag.attributes.NAME;
                layer.x = int(tag.attributes.X);
                layer.y = int(tag.attributes.Y);
                layer.opacity = float(tag.attributes.OPACITY, 1);
                layer.visible = bool(tag.attributes.VISIBLE, true);
                map.layers.push(layer);
                state = STATE_IMAGE_LAYER;
                break;
              default:
                waitForClose();
            }
          },
          closetag: noop,
          text: noop,
        };
        states[STATE_TILESET] = {
          opentag: function (tag) {
            switch (tag.name) {
              case 'TILEOFFSET':
                tileSet.tileOffset.x = int(tag.attributes.X);
                tileSet.tileOffset.y = int(tag.attributes.Y);
                waitForClose();
                break;
              case 'PROPERTIES':
                collectProperties(tileSet.properties);
                break;
              case 'IMAGE':
                tileSet.image = collectImage(tag);
                break;
              case 'TERRAINTYPES':
                state = STATE_TERRAIN_TYPES;
                break;
              case 'TILE':
                tile = new Tile();
                tile.id = int(tag.attributes.ID);
                if (tag.attributes.TERRAIN) {
                  var indexes = tag.attributes.TERRAIN.split(",");
                  tile.terrain = indexes.map(resolveTerrain);
                }
                tile.probability = float(tag.attributes.PROBABILITY);
                tileSet.tiles[tile.id] = tile;
                state = STATE_TILE;
                break;
              default:
                waitForClose();
            }
          },
          closetag: function (name) {
            state = tileSetNextState;
          },
          text: noop,
        };
        states[STATE_COLLECT_PROPS] = {
          opentag: function (tag) {
            if (tag.name === 'PROPERTY') {
              propertiesObject[tag.attributes.NAME] = tag.attributes.VALUE;
            }
            waitForClose();
          },
          closetag: function (name) {
            state = propertiesNextState;
          },
          text: noop,
        };
        states[STATE_COLLECT_ANIMATIONS] = {
          opentag: function (tag) {
            if (tag.name === 'FRAME') {
              animationsObject.push({
                'tileId': tag.attributes.TILEID,
                'duration': tag.attributes.DURATION
              });
            }
            waitForClose();
          },
          closetag: function (name) {
            state = animationsNextState;
          },
          text: noop,
        };
        states[STATE_COLLECT_OBJECT_GROUPS] = {
          opentag: function (tag) {
            if (tag.name === 'OBJECT') {
              object = new TmxObject();
              object.name = tag.attributes.NAME;
              object.type = tag.attributes.TYPE;
              object.x = int(tag.attributes.X);
              object.y = int(tag.attributes.Y);
              object.width = int(tag.attributes.WIDTH, 0);
              object.height = int(tag.attributes.HEIGHT, 0);
              object.rotation = float(tag.attributes.ROTATION, 0);
              object.gid = int(tag.attributes.GID);
              object.visible = bool(tag.attributes.VISIBLE, true);
              objectGroupsObject.push(object);
              state = STATE_TILE_OBJECT;
            } else {
              waitForClose();
            }
          },
          closetag: function (name) {
            state = objectGroupsNextState;
          },
          text: noop
        };
        states[STATE_WAIT_FOR_CLOSE] = {
          opentag: function (tag) {
            waitForCloseOpenCount += 1;
          },
          closetag: function (name) {
            waitForCloseOpenCount -= 1;
            if (waitForCloseOpenCount === 0) state = waitForCloseNextState;
          },
          text: noop,
        };
        states[STATE_TILE] = {
          opentag: function (tag) {
            if (tag.name === 'PROPERTIES') {
              collectProperties(tile.properties);
            } else if (tag.name === 'IMAGE') {
              tile.image = collectImage(tag);
            } else if (tag.name === 'ANIMATION') {
              tile.animation = collectAnimations(tile.animations);
            } else if (tag.name === 'OBJECTGROUP') {
              tile.objectGroup = collectObjectGroups(tile.objectGroups);
            } else {
              waitForClose();
            }
          },
          closetag: function (name) {
            state = STATE_TILESET
          },
          text: noop,
        };
        states[STATE_TILE_LAYER] = {
          opentag: function (tag) {
            if (tag.name === 'PROPERTIES') {
              collectProperties(layer.properties);
            } else if (tag.name === 'DATA') {
              var dataEncoding = tag.attributes.ENCODING;
              var dataCompression = tag.attributes.COMPRESSION;
              switch (dataEncoding) {
                case undefined:
                case null:
                  state = STATE_TILE_DATA_XML;
                  break;
                case 'csv':
                  state = STATE_TILE_DATA_CSV;
                  break;
                case 'base64':
                  switch (dataCompression) {
                    case undefined:
                    case null:
                      state = STATE_TILE_DATA_B64_RAW;
                break;
                    case 'gzip':
                      state = STATE_TILE_DATA_B64_GZIP;
                break;
                    case 'zlib':
                      state = STATE_TILE_DATA_B64_ZLIB;
                break;
              default:
                error(new Error("unsupported data compression: " + dataCompression));
                return;
            }
                  break;
                default:
                  error(new Error("unsupported data encoding: " + dataEncoding));
                  return;
              }
            } else {
              waitForClose();
            }
          },
          closetag: function (name) {
            state = STATE_MAP;
          },
          text: noop,
        };
        states[STATE_OBJECT_LAYER] = {
          opentag: function (tag) {
            if (tag.name === 'PROPERTIES') {
              collectProperties(layer.properties);
            } else if (tag.name === 'OBJECT') {
              object = new TmxObject();
              object.name = tag.attributes.NAME;
              object.type = tag.attributes.TYPE;
              object.x = int(tag.attributes.X);
              object.y = int(tag.attributes.Y);
              object.width = int(tag.attributes.WIDTH, 0);
              object.height = int(tag.attributes.HEIGHT, 0);
              object.rotation = float(tag.attributes.ROTATION, 0);
              object.gid = int(tag.attributes.GID);
              object.visible = bool(tag.attributes.VISIBLE, true);
              layer.objects.push(object);
              state = STATE_OBJECT;
            } else {
              waitForClose();
            }
          },
          closetag: function (name) {
            state = STATE_MAP;
          },
          text: noop,
        };
        states[STATE_IMAGE_LAYER] = {
          opentag: function (tag) {
            if (tag.name === 'PROPERTIES') {
              collectProperties(layer.properties);
            } else if (tag.name === 'IMAGE') {
              layer.image = collectImage(tag);
            } else {
              waitForClose();
            }
          },
          closetag: function (name) {
            state = STATE_MAP;
          },
          text: noop,
        };
        states[STATE_OBJECT] = {
          opentag: function (tag) {
            switch (tag.name) {
              case 'PROPERTIES':
                collectProperties(object.properties);
                break;
              case 'ELLIPSE':
                object.ellipse = true;
                waitForClose();
                break;
              case 'POLYGON':
                object.polygon = parsePoints(tag.attributes.POINTS);
                waitForClose();
                break;
              case 'POLYLINE':
                object.polyline = parsePoints(tag.attributes.POINTS);
                waitForClose();
                break;
              case 'IMAGE':
                object.image = collectImage(tag);
                break;
              default:
                waitForClose();
            }
          },
          closetag: function (name) {
            state = STATE_OBJECT_LAYER;
          },
          text: noop,
        };
        states[STATE_TILE_OBJECT] = {
          opentag: function (tag) {
            switch (tag.name) {
              case 'PROPERTIES':
                collectProperties(object.properties);
                break;
              case 'ELLIPSE':
                object.ellipse = true;
                waitForClose();
                break;
              case 'POLYGON':
                object.polygon = parsePoints(tag.attributes.POINTS);
                waitForClose();
                break;
              case 'POLYLINE':
                object.polyline = parsePoints(tag.attributes.POINTS);
                waitForClose();
                break;
              case 'IMAGE':
                object.image = collectImage(tag);
                break;
              default:
                waitForClose();
            }
          },
          closetag: function (name) {
            state = STATE_COLLECT_OBJECT_GROUPS;
          },
          text: noop
        };
        states[STATE_TILE_DATA_XML] = {
          opentag: function (tag) {
            if (tag.name === 'TILE') {
              saveTile(int(tag.attributes.GID, 0));
            }
            waitForClose();
          },
          closetag: function (name) {
            state = STATE_TILE_LAYER;
          },
          text: noop,
        };
        states[STATE_TILE_DATA_CSV] = {
          opentag: function (tag) {
            waitForClose();
          },
          closetag: function (name) {
            state = STATE_TILE_LAYER;
          },
          text: function (text) {
            text.split(",").forEach(function (c) {
              saveTile(parseInt(c, 10));
            });
          },
        };
        states[STATE_TILE_DATA_B64_RAW] = {
          opentag: function (tag) {
            waitForClose();
          },
          closetag: function (name) {
            state = STATE_TILE_LAYER;
          },
          text: function (text) {
            unpackTileBytes(new Buffer(text.trim(), 'base64'));
          },
        };
        states[STATE_TILE_DATA_B64_GZIP] = {
          opentag: function (tag) {
            waitForClose();
          },
          closetag: function (name) {
            state = STATE_TILE_LAYER;
          },
          text: function (text) {
            var zipped = new Buffer(text.trim(), 'base64');
            var oldUnresolvedLayer = unresolvedLayer;
            var oldLayer = layer;
            pend.go(function (cb) {
              zlib.gunzip(zipped, function (err, buf) {
                if (err) {
                  cb(err);
                  return;
                }
                unresolvedLayer = oldUnresolvedLayer;
                layer = oldLayer;
                unpackTileBytes(buf);
                cb();
        });
            });
          },
        };
        states[STATE_TILE_DATA_B64_ZLIB] = {
          opentag: function (tag) {
            waitForClose();
          },
          closetag: function (name) {
            state = STATE_TILE_LAYER;
          },
          text: function (text) {
            var zipped = new Buffer(text.trim(), 'base64');
            var oldUnresolvedLayer = unresolvedLayer;
            var oldLayer = layer;
            pend.go(function (cb) {
              zlib.inflate(zipped, function (err, buf) {
                if (err) {
                  cb(err);
                  return;
                }
                layer = oldLayer;
                unresolvedLayer = oldUnresolvedLayer;
                unpackTileBytes(buf);
                cb();
              });
            });
          },
        };
        states[STATE_TERRAIN_TYPES] = {
          opentag: function (tag) {
            if (tag.name === 'TERRAIN') {
              terrain = new Terrain();
              terrain.name = tag.attributes.NAME;
              terrain.tile = int(tag.attributes.TILE);
              tileSet.terrainTypes.push(terrain);
              state = STATE_TERRAIN;
            } else {
              waitForClose();
      }
          },
          closetag: function (name) {
            state = STATE_TILESET;
          },
          text: noop,
        };
        states[STATE_TERRAIN] = {
          opentag: function (tag) {
            if (tag.name === 'PROPERTIES') {
              collectProperties(terrain.properties);
            } else {
              waitForClose();
      }
          },
          closetag: function (name) {
            state = STATE_TERRAIN_TYPES;
          },
          text: noop,
        };

        parser.onerror = cb;
        parser.onopentag = function (tag) {
          states[state].opentag(tag);
        };
        parser.onclosetag = function (name) {
          states[state].closetag(name);
        };
        parser.ontext = function (text) {
          states[state].text(text);
        };
        parser.onend = function () {
          // wait until async stuff has finished
          pend.wait(function (err) {
            if (err) {
              cb(err);
              return;
      }
            // now all tilesets are resolved and all data is decoded
            unresolvedLayers.forEach(resolveLayer);
            cb(null, topLevelObject);
          });
        };
        parser.write(content).close();

        function resolveTerrain(terrainIndexStr) {
          return tileSet.terrainTypes[parseInt(terrainIndexStr, 10)];
        }

        function saveTile(gid) {
          layer.horizontalFlips[tileIndex] = !!(gid & FLIPPED_HORIZONTALLY_FLAG);
          layer.verticalFlips[tileIndex] = !!(gid & FLIPPED_VERTICALLY_FLAG);
          layer.diagonalFlips[tileIndex] = !!(gid & FLIPPED_DIAGONALLY_FLAG);

          gid &= ~(FLIPPED_HORIZONTALLY_FLAG |
          FLIPPED_VERTICALLY_FLAG |
          FLIPPED_DIAGONALLY_FLAG);

          unresolvedLayer.tiles[tileIndex] = gid;

          tileIndex += 1;
        }

        function collectImage(tag) {
          var img = new Image();
          img.format = tag.attributes.FORMAT;
          img.source = tag.attributes.SOURCE;
          img.trans = tag.attributes.TRANS;
          img.width = int(tag.attributes.WIDTH);
          img.height = int(tag.attributes.HEIGHT);

          // TODO: read possible <data>
          waitForClose();
          return img;
        }

        function collectTileSet(tag, nextState) {
          tileSet = new TileSet();
          tileSet.firstGid = int(tag.attributes.FIRSTGID);
          tileSet.source = tag.attributes.SOURCE;
          tileSet.name = tag.attributes.NAME;
          tileSet.tileWidth = int(tag.attributes.TILEWIDTH);
          tileSet.tileHeight = int(tag.attributes.TILEHEIGHT);
          tileSet.spacing = int(tag.attributes.SPACING);
          tileSet.margin = int(tag.attributes.MARGIN);

          if (tileSet.source) {
            pend.go(function (cb) {
              resolveTileSet(tileSet, cb);
            });
          }

          state = STATE_TILESET;
          tileSetNextState = nextState;
        }

        function collectProperties(obj) {
          propertiesObject = obj;
          propertiesNextState = state;
          state = STATE_COLLECT_PROPS;
        }

        function collectAnimations(obj) {
          animationsObject = obj;
          animationsNextState = state;
          state = STATE_COLLECT_ANIMATIONS;
        }

        function collectObjectGroups(obj) {
          objectGroupsObject = obj;
          objectGroupsNextState = state;
          state = STATE_COLLECT_OBJECT_GROUPS;
        }

        function waitForClose() {
          waitForCloseNextState = state;
          state = STATE_WAIT_FOR_CLOSE;
          waitForCloseOpenCount = 1;
        }

        function error(err) {
          parser.onerror = null;
          parser.onopentag = null;
          parser.onclosetag = null;
          parser.ontext = null;
          parser.onend = null;
          cb(err);
        }

        function resolveTileSet(unresolvedTileSet, cb) {
          var target = path.join(pathToDir, unresolvedTileSet.source);
          parseFile(target, function (err, resolvedTileSet) {
            if (err) {
              cb(err);
              return;
      }
            resolvedTileSet.mergeTo(unresolvedTileSet);
            cb();
          });
        }

        function resolveLayer(unresolvedLayer) {
          for (var i = 0; i < unresolvedLayer.tiles.length; i += 1) {
            var globalTileId = unresolvedLayer.tiles[i];
            for (var tileSetIndex = map.tileSets.length - 1;
                 tileSetIndex >= 0; tileSetIndex -= 1) {
              var tileSet = map.tileSets[tileSetIndex];
              if (tileSet.firstGid <= globalTileId) {
                var tileId = globalTileId - tileSet.firstGid;
                var tile = tileSet.tiles[tileId];
                if (!tile) {
                  // implicit tile
                  tile = new Tile();
                  tile.id = tileId;
                  tileSet.tiles[tileId] = tile;
          }
                tile.gid = globalTileId;
                unresolvedLayer.layer.tiles[i] = tile;
                break;
        }
      }
          }
        }

        function unpackTileBytes(buf) {
          var expectedCount = map.width * map.height * 4;
          if (buf.length !== expectedCount) {
            error(new Error("Expected " + expectedCount +
                " bytes of tile data; received " + buf.length));
            return;
          }
          tileIndex = 0;
          for (var i = 0; i < expectedCount; i += 4) {
            saveTile(buf.readUInt32LE(i));
          }
        }
      }

      function defaultReadFile(name, cb) {
        fs.readFile(name, {encoding: 'utf8'}, cb);
      }

      function parseFile(name, cb) {
        exports.readFile(name, function (err, content) {
          if (err) {
            cb(err);
          } else {
            parse(content, name, cb);
    }
        });
      }

      function parsePoints(str) {
        var points = str.split(" ");
        return points.map(function (pt) {
          var xy = pt.split(",");
          return {
            x: xy[0],
            y: xy[1],
    };
        });
      }

      function noop() {
      }

      function int(value, defaultValue) {
        defaultValue = defaultValue == null ? null : defaultValue;
        return value == null ? defaultValue : parseInt(value, 10);
      }

      function bool(value, defaultValue) {
        defaultValue = defaultValue == null ? null : defaultValue;
        return value == null ? defaultValue : !!parseInt(value, 10);
      }

      function float(value, defaultValue) {
        defaultValue = defaultValue == null ? null : defaultValue;
        return value == null ? defaultValue : parseFloat(value, 10);
      }

      function Map() {
        this.version = null;
        this.orientation = "orthogonal";
        this.width = 0;
        this.height = 0;
        this.tileWidth = 0;
        this.tileHeight = 0;
        this.backgroundColor = null;

        this.layers = [];
        this.properties = {};
        this.tileSets = [];
      }

      function TileSet() {
        this.firstGid = 0;
        this.source = "";
        this.name = "";
        this.tileWidth = 0;
        this.tileHeight = 0;
        this.spacing = 0;
        this.margin = 0;
        this.tileOffset = {x: 0, y: 0};
        this.properties = {};
        this.image = null;
        this.tiles = [];
        this.terrainTypes = [];
      }

      TileSet.prototype.mergeTo = function (other) {
        other.firstGid = this.firstGid == null ? other.firstGid : this.firstGid;
        other.source = this.source == null ? other.source : this.source;
        other.name = this.name == null ? other.name : this.name;
        other.tileWidth = this.tileWidth == null ? other.tileWidth : this.tileWidth;
        other.tileHeight = this.tileHeight == null ? other.tileHeight : this.tileHeight;
        other.spacing = this.spacing == null ? other.spacing : this.spacing;
        other.margin = this.margin == null ? other.margin : this.margin;
        other.tileOffset = this.tileOffset == null ? other.tileOffset : this.tileOffset;
        other.properties = this.properties == null ? other.properties : this.properties;
        other.image = this.image == null ? other.image : this.image;
        other.tiles = this.tiles == null ? other.tiles : this.tiles;
        other.terrainTypes = this.terrainTypes == null ? other.terrainTypes : this.terrainTypes;
      };

      function Image() {
        this.format = null;
        this.source = "";
        this.trans = null;
        this.width = 0;
        this.height = 0;
      }

      function Tile() {
        this.id = 0;
        this.terrain = [];
        this.probability = null;
        this.properties = {};
        this.animations = [];
        this.objectGroups = [];
        this.image = null;
      }

      function TileLayer(map) {
        var tileCount = map.width * map.height;
        this.map = map;
        this.type = "tile";
        this.name = null;
        this.opacity = 1;
        this.visible = true;
        this.properties = {};
        this.tiles = new Array(tileCount);
        this.horizontalFlips = new Array(tileCount);
        this.verticalFlips = new Array(tileCount);
        this.diagonalFlips = new Array(tileCount);
      }

      TileLayer.prototype.tileAt = function (x, y) {
        return this.tiles[y * this.map.width + x];
      };

      TileLayer.prototype.setTileAt = function (x, y, tile) {
        this.tiles[y * this.map.width + x] = tile;
      };

      function ObjectLayer() {
        this.type = "object";
        this.name = null;
        this.color = null;
        this.opacity = 1;
        this.visible = true;
        this.properties = {};
        this.objects = [];
      }

      function ImageLayer() {
        this.type = "image";
        this.name = null;
        this.x = 0;
        this.y = 0;
        this.opacity = 1;
        this.visible = true;
        this.properties = {};
        this.image = null;
      }

      function TmxObject() {
        this.name = null;
        this.type = null;
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.rotation = 0;
        this.properties = {};
        this.gid = null;
        this.visible = true;
        this.ellipse = false;
        this.polygon = null;
        this.polyline = null;
      }

      function Terrain() {
        this.name = "";
        this.tile = 0;
        this.properties = {};
      }

    }).call(this, require("buffer").Buffer)
  }, {"buffer": 17, "fs": 1, "path": 24, "pend": 106, "sax": 107, "zlib": 16}],
  106: [function (require, module, exports) {
    module.exports = Pend;

    function Pend() {
      this.pending = 0;
      this.max = Infinity;
      this.listeners = [];
      this.waiting = [];
      this.error = null;
    }

    Pend.prototype.go = function (fn) {
      if (this.pending < this.max) {
        pendGo(this, fn);
      } else {
        this.waiting.push(fn);
      }
    };

    Pend.prototype.wait = function (cb) {
      if (this.pending === 0) {
        cb(this.error);
      } else {
        this.listeners.push(cb);
      }
    };

    Pend.prototype.hold = function () {
      return pendHold(this);
    };

    function pendHold(self) {
      self.pending += 1;
      var called = false;
      return onCb;
      function onCb(err) {
        if (called) throw new Error("callback called twice");
        called = true;
        self.error = self.error || err;
        self.pending -= 1;
        if (self.waiting.length > 0 && self.pending < self.max) {
          pendGo(self, self.waiting.shift());
        } else if (self.pending === 0) {
          var listeners = self.listeners;
          self.listeners = [];
          listeners.forEach(cbListener);
    }
      }

      function cbListener(listener) {
        listener(self.error);
      }
    }

    function pendGo(self, fn) {
      fn(pendHold(self));
    }

  }, {}],
  107: [function (require, module, exports) {
    (function (Buffer) {
      ;
      (function (sax) { // wrapper for non-node envs
        sax.parser = function (strict, opt) {
          return new SAXParser(strict, opt)
        }
        sax.SAXParser = SAXParser
        sax.SAXStream = SAXStream
        sax.createStream = createStream

        // When we pass the MAX_BUFFER_LENGTH position, start checking for buffer overruns.
        // When we check, schedule the next check for MAX_BUFFER_LENGTH - (max(buffer lengths)),
        // since that's the earliest that a buffer overrun could occur.  This way, checks are
        // as rare as required, but as often as necessary to ensure never crossing this bound.
        // Furthermore, buffers are only tested at most once per write(), so passing a very
        // large string into write() might have undesirable effects, but this is manageable by
        // the caller, so it is assumed to be safe.  Thus, a call to write() may, in the extreme
        // edge case, result in creating at most one complete copy of the string passed in.
        // Set to Infinity to have unlimited buffers.
        sax.MAX_BUFFER_LENGTH = 64 * 1024

        var buffers = [
          'comment', 'sgmlDecl', 'textNode', 'tagName', 'doctype',
          'procInstName', 'procInstBody', 'entity', 'attribName',
          'attribValue', 'cdata', 'script'
        ]

        sax.EVENTS = [
          'text',
          'processinginstruction',
          'sgmldeclaration',
          'doctype',
          'comment',
          'attribute',
          'opentag',
          'closetag',
          'opencdata',
          'cdata',
          'closecdata',
          'error',
          'end',
          'ready',
          'script',
          'opennamespace',
          'closenamespace'
        ]

        function SAXParser(strict, opt) {
          if (!(this instanceof SAXParser)) {
            return new SAXParser(strict, opt)
          }

          var parser = this
          clearBuffers(parser)
          parser.q = parser.c = ''
          parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH
          parser.opt = opt || {}
          parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags
          parser.looseCase = parser.opt.lowercase ? 'toLowerCase' : 'toUpperCase'
          parser.tags = []
          parser.closed = parser.closedRoot = parser.sawRoot = false
          parser.tag = parser.error = null
          parser.strict = !!strict
          parser.noscript = !!(strict || parser.opt.noscript)
          parser.state = S.BEGIN
          parser.strictEntities = parser.opt.strictEntities
          parser.ENTITIES = parser.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES)
          parser.attribList = []

          // namespaces form a prototype chain.
          // it always points at the current tag,
          // which protos to its parent tag.
          if (parser.opt.xmlns) {
            parser.ns = Object.create(rootNS)
          }

          // mostly just for error reporting
          parser.trackPosition = parser.opt.position !== false
          if (parser.trackPosition) {
            parser.position = parser.line = parser.column = 0
          }
          emit(parser, 'onready')
        }

        if (!Object.create) {
          Object.create = function (o) {
            function F() {
            }

            F.prototype = o
            var newf = new F()
            return newf
          }
        }

        if (!Object.keys) {
          Object.keys = function (o) {
            var a = []
            for (var i in o) if (o.hasOwnProperty(i)) a.push(i)
            return a
    }
        }

        function checkBufferLength(parser) {
          var maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10)
          var maxActual = 0
          for (var i = 0, l = buffers.length; i < l; i++) {
            var len = parser[buffers[i]].length
            if (len > maxAllowed) {
              // Text/cdata nodes can get big, and since they're buffered,
              // we can get here under normal conditions.
              // Avoid issues by emitting the text node now,
              // so at least it won't get any bigger.
              switch (buffers[i]) {
                case 'textNode':
                  closeText(parser)
                  break

                case 'cdata':
            emitNode(parser, 'oncdata', parser.cdata)
            parser.cdata = ''
                  break

                case 'script':
            emitNode(parser, 'onscript', parser.script)
            parser.script = ''
                  break

                default:
                  error(parser, 'Max buffer length exceeded: ' + buffers[i])
        }
            }
            maxActual = Math.max(maxActual, len)
          }
          // schedule the next check for the earliest possible buffer overrun.
          var m = sax.MAX_BUFFER_LENGTH - maxActual
          parser.bufferCheckPosition = m + parser.position
        }

        function clearBuffers(parser) {
          for (var i = 0, l = buffers.length; i < l; i++) {
            parser[buffers[i]] = ''
          }
        }

        function flushBuffers(parser) {
          closeText(parser)
          if (parser.cdata !== '') {
            emitNode(parser, 'oncdata', parser.cdata)
            parser.cdata = ''
          }
          if (parser.script !== '') {
            emitNode(parser, 'onscript', parser.script)
            parser.script = ''
          }
        }

        SAXParser.prototype = {
          end: function () {
            end(this)
          },
          write: write,
          resume: function () {
            this.error = null;
            return this
          },
          close: function () {
            return this.write(null)
          },
          flush: function () {
            flushBuffers(this)
          }
        }

        var Stream
        try {
          Stream = require('stream').Stream
        } catch (ex) {
          Stream = function () {
          }
        }

        var streamWraps = sax.EVENTS.filter(function (ev) {
          return ev !== 'error' && ev !== 'end'
        })

        function createStream(strict, opt) {
          return new SAXStream(strict, opt)
        }

        function SAXStream(strict, opt) {
          if (!(this instanceof SAXStream)) {
            return new SAXStream(strict, opt)
          }

          Stream.apply(this)

          this._parser = new SAXParser(strict, opt)
          this.writable = true
          this.readable = true

          var me = this

          this._parser.onend = function () {
            me.emit('end')
          }

          this._parser.onerror = function (er) {
            me.emit('error', er)

            // if didn't throw, then means error was handled.
            // go ahead and clear error, so we can write again.
            me._parser.error = null
          }

          this._decoder = null

          streamWraps.forEach(function (ev) {
            Object.defineProperty(me, 'on' + ev, {
              get: function () {
                return me._parser['on' + ev]
              },
              set: function (h) {
                if (!h) {
                  me.removeAllListeners(ev)
                  me._parser['on' + ev] = h
                  return h
          }
                me.on(ev, h)
              },
              enumerable: true,
              configurable: false
            })
          })
        }

        SAXStream.prototype = Object.create(Stream.prototype, {
          constructor: {
            value: SAXStream
          }
        })

        SAXStream.prototype.write = function (data) {
          if (typeof Buffer === 'function' &&
              typeof Buffer.isBuffer === 'function' &&
              Buffer.isBuffer(data)) {
            if (!this._decoder) {
              var SD = require('string_decoder').StringDecoder
              this._decoder = new SD('utf8')
            }
            data = this._decoder.write(data)
          }

          this._parser.write(data.toString())
          this.emit('data', data)
          return true
        }

        SAXStream.prototype.end = function (chunk) {
          if (chunk && chunk.length) {
            this.write(chunk)
          }
          this._parser.end()
          return true
        }

        SAXStream.prototype.on = function (ev, handler) {
          var me = this
          if (!me._parser['on' + ev] && streamWraps.indexOf(ev) !== -1) {
            me._parser['on' + ev] = function () {
              var args = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments)
              args.splice(0, 0, ev)
              me.emit.apply(me, args)
            }
          }

          return Stream.prototype.on.call(me, ev, handler)
        }

        // character classes and tokens
        var whitespace = '\r\n\t '

        // this really needs to be replaced with character classes.
        // XML allows all manner of ridiculous numbers and digits.
        var number = '0124356789'
        var letter = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

        // (Letter | "_" | ":")
        var quote = '\'"'
        var attribEnd = whitespace + '>'
        var CDATA = '[CDATA['
        var DOCTYPE = 'DOCTYPE'
        var XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace'
        var XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/'
        var rootNS = {xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE}

        // turn all the string character sets into character class objects.
        whitespace = charClass(whitespace)
        number = charClass(number)
        letter = charClass(letter)

        // http://www.w3.org/TR/REC-xml/#NT-NameStartChar
        // This implementation works on strings, a single character at a time
        // as such, it cannot ever support astral-plane characters (10000-EFFFF)
        // without a significant breaking change to either this  parser, or the
        // JavaScript language.  Implementation of an emoji-capable xml parser
        // is left as an exercise for the reader.
        var nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/

        var nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040\.\d-]/

        var entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/
        var entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040\.\d-]/

        quote = charClass(quote)
        attribEnd = charClass(attribEnd)

        function charClass(str) {
          return str.split('').reduce(function (s, c) {
            s[c] = true
            return s
          }, {})
        }

        function isRegExp(c) {
          return Object.prototype.toString.call(c) === '[object RegExp]'
        }

        function is(charclass, c) {
          return isRegExp(charclass) ? !!c.match(charclass) : charclass[c]
        }

        function not(charclass, c) {
          return !is(charclass, c)
        }

        var S = 0
        sax.STATE = {
          BEGIN: S++, // leading byte order mark or whitespace
          BEGIN_WHITESPACE: S++, // leading whitespace
          TEXT: S++, // general stuff
          TEXT_ENTITY: S++, // &amp and such.
          OPEN_WAKA: S++, // <
          SGML_DECL: S++, // <!BLARG
          SGML_DECL_QUOTED: S++, // <!BLARG foo "bar
          DOCTYPE: S++, // <!DOCTYPE
          DOCTYPE_QUOTED: S++, // <!DOCTYPE "//blah
          DOCTYPE_DTD: S++, // <!DOCTYPE "//blah" [ ...
          DOCTYPE_DTD_QUOTED: S++, // <!DOCTYPE "//blah" [ "foo
          COMMENT_STARTING: S++, // <!-
          COMMENT: S++, // <!--
          COMMENT_ENDING: S++, // <!-- blah -
          COMMENT_ENDED: S++, // <!-- blah --
          CDATA: S++, // <![CDATA[ something
          CDATA_ENDING: S++, // ]
          CDATA_ENDING_2: S++, // ]]
          PROC_INST: S++, // <?hi
          PROC_INST_BODY: S++, // <?hi there
          PROC_INST_ENDING: S++, // <?hi "there" ?
          OPEN_TAG: S++, // <strong
          OPEN_TAG_SLASH: S++, // <strong /
          ATTRIB: S++, // <a
          ATTRIB_NAME: S++, // <a foo
          ATTRIB_NAME_SAW_WHITE: S++, // <a foo _
          ATTRIB_VALUE: S++, // <a foo=
          ATTRIB_VALUE_QUOTED: S++, // <a foo="bar
          ATTRIB_VALUE_CLOSED: S++, // <a foo="bar"
          ATTRIB_VALUE_UNQUOTED: S++, // <a foo=bar
          ATTRIB_VALUE_ENTITY_Q: S++, // <foo bar="&quot;"
          ATTRIB_VALUE_ENTITY_U: S++, // <foo bar=&quot
          CLOSE_TAG: S++, // </a
          CLOSE_TAG_SAW_WHITE: S++, // </a   >
          SCRIPT: S++, // <script> ...
          SCRIPT_ENDING: S++ // <script> ... <
        }

        sax.XML_ENTITIES = {
          'amp': '&',
          'gt': '>',
          'lt': '<',
          'quot': '"',
          'apos': "'"
        }

        sax.ENTITIES = {
          'amp': '&',
          'gt': '>',
          'lt': '<',
          'quot': '"',
          'apos': "'",
          'AElig': 198,
          'Aacute': 193,
          'Acirc': 194,
          'Agrave': 192,
          'Aring': 197,
          'Atilde': 195,
          'Auml': 196,
          'Ccedil': 199,
          'ETH': 208,
          'Eacute': 201,
          'Ecirc': 202,
          'Egrave': 200,
          'Euml': 203,
          'Iacute': 205,
          'Icirc': 206,
          'Igrave': 204,
          'Iuml': 207,
          'Ntilde': 209,
          'Oacute': 211,
          'Ocirc': 212,
          'Ograve': 210,
          'Oslash': 216,
          'Otilde': 213,
          'Ouml': 214,
          'THORN': 222,
          'Uacute': 218,
          'Ucirc': 219,
          'Ugrave': 217,
          'Uuml': 220,
          'Yacute': 221,
          'aacute': 225,
          'acirc': 226,
          'aelig': 230,
          'agrave': 224,
          'aring': 229,
          'atilde': 227,
          'auml': 228,
          'ccedil': 231,
          'eacute': 233,
          'ecirc': 234,
          'egrave': 232,
          'eth': 240,
          'euml': 235,
          'iacute': 237,
          'icirc': 238,
          'igrave': 236,
          'iuml': 239,
          'ntilde': 241,
          'oacute': 243,
          'ocirc': 244,
          'ograve': 242,
          'oslash': 248,
          'otilde': 245,
          'ouml': 246,
          'szlig': 223,
          'thorn': 254,
          'uacute': 250,
          'ucirc': 251,
          'ugrave': 249,
          'uuml': 252,
          'yacute': 253,
          'yuml': 255,
          'copy': 169,
          'reg': 174,
          'nbsp': 160,
          'iexcl': 161,
          'cent': 162,
          'pound': 163,
          'curren': 164,
          'yen': 165,
          'brvbar': 166,
          'sect': 167,
          'uml': 168,
          'ordf': 170,
          'laquo': 171,
          'not': 172,
          'shy': 173,
          'macr': 175,
          'deg': 176,
          'plusmn': 177,
          'sup1': 185,
          'sup2': 178,
          'sup3': 179,
          'acute': 180,
          'micro': 181,
          'para': 182,
          'middot': 183,
          'cedil': 184,
          'ordm': 186,
          'raquo': 187,
          'frac14': 188,
          'frac12': 189,
          'frac34': 190,
          'iquest': 191,
          'times': 215,
          'divide': 247,
          'OElig': 338,
          'oelig': 339,
          'Scaron': 352,
          'scaron': 353,
          'Yuml': 376,
          'fnof': 402,
          'circ': 710,
          'tilde': 732,
          'Alpha': 913,
          'Beta': 914,
          'Gamma': 915,
          'Delta': 916,
          'Epsilon': 917,
          'Zeta': 918,
          'Eta': 919,
          'Theta': 920,
          'Iota': 921,
          'Kappa': 922,
          'Lambda': 923,
          'Mu': 924,
          'Nu': 925,
          'Xi': 926,
          'Omicron': 927,
          'Pi': 928,
          'Rho': 929,
          'Sigma': 931,
          'Tau': 932,
          'Upsilon': 933,
          'Phi': 934,
          'Chi': 935,
          'Psi': 936,
          'Omega': 937,
          'alpha': 945,
          'beta': 946,
          'gamma': 947,
          'delta': 948,
          'epsilon': 949,
          'zeta': 950,
          'eta': 951,
          'theta': 952,
          'iota': 953,
          'kappa': 954,
          'lambda': 955,
          'mu': 956,
          'nu': 957,
          'xi': 958,
          'omicron': 959,
          'pi': 960,
          'rho': 961,
          'sigmaf': 962,
          'sigma': 963,
          'tau': 964,
          'upsilon': 965,
          'phi': 966,
          'chi': 967,
          'psi': 968,
          'omega': 969,
          'thetasym': 977,
          'upsih': 978,
          'piv': 982,
          'ensp': 8194,
          'emsp': 8195,
          'thinsp': 8201,
          'zwnj': 8204,
          'zwj': 8205,
          'lrm': 8206,
          'rlm': 8207,
          'ndash': 8211,
          'mdash': 8212,
          'lsquo': 8216,
          'rsquo': 8217,
          'sbquo': 8218,
          'ldquo': 8220,
          'rdquo': 8221,
          'bdquo': 8222,
          'dagger': 8224,
          'Dagger': 8225,
          'bull': 8226,
          'hellip': 8230,
          'permil': 8240,
          'prime': 8242,
          'Prime': 8243,
          'lsaquo': 8249,
          'rsaquo': 8250,
          'oline': 8254,
          'frasl': 8260,
          'euro': 8364,
          'image': 8465,
          'weierp': 8472,
          'real': 8476,
          'trade': 8482,
          'alefsym': 8501,
          'larr': 8592,
          'uarr': 8593,
          'rarr': 8594,
          'darr': 8595,
          'harr': 8596,
          'crarr': 8629,
          'lArr': 8656,
          'uArr': 8657,
          'rArr': 8658,
          'dArr': 8659,
          'hArr': 8660,
          'forall': 8704,
          'part': 8706,
          'exist': 8707,
          'empty': 8709,
          'nabla': 8711,
          'isin': 8712,
          'notin': 8713,
          'ni': 8715,
          'prod': 8719,
          'sum': 8721,
          'minus': 8722,
          'lowast': 8727,
          'radic': 8730,
          'prop': 8733,
          'infin': 8734,
          'ang': 8736,
          'and': 8743,
          'or': 8744,
          'cap': 8745,
          'cup': 8746,
          'int': 8747,
          'there4': 8756,
          'sim': 8764,
          'cong': 8773,
          'asymp': 8776,
          'ne': 8800,
          'equiv': 8801,
          'le': 8804,
          'ge': 8805,
          'sub': 8834,
          'sup': 8835,
          'nsub': 8836,
          'sube': 8838,
          'supe': 8839,
          'oplus': 8853,
          'otimes': 8855,
          'perp': 8869,
          'sdot': 8901,
          'lceil': 8968,
          'rceil': 8969,
          'lfloor': 8970,
          'rfloor': 8971,
          'lang': 9001,
          'rang': 9002,
          'loz': 9674,
          'spades': 9824,
          'clubs': 9827,
          'hearts': 9829,
          'diams': 9830
        }

        Object.keys(sax.ENTITIES).forEach(function (key) {
          var e = sax.ENTITIES[key]
          var s = typeof e === 'number' ? String.fromCharCode(e) : e
          sax.ENTITIES[key] = s
        })

        for (var s in sax.STATE) {
          sax.STATE[sax.STATE[s]] = s
        }

        // shorthand
        S = sax.STATE

        function emit(parser, event, data) {
          parser[event] && parser[event](data)
        }

        function emitNode(parser, nodeType, data) {
          if (parser.textNode) closeText(parser)
          emit(parser, nodeType, data)
        }

        function closeText(parser) {
          parser.textNode = textopts(parser.opt, parser.textNode)
          if (parser.textNode) emit(parser, 'ontext', parser.textNode)
          parser.textNode = ''
        }

        function textopts(opt, text) {
          if (opt.trim) text = text.trim()
          if (opt.normalize) text = text.replace(/\s+/g, ' ')
          return text
        }

        function error(parser, er) {
          closeText(parser)
          if (parser.trackPosition) {
            er += '\nLine: ' + parser.line +
                '\nColumn: ' + parser.column +
                '\nChar: ' + parser.c
          }
          er = new Error(er)
          parser.error = er
          emit(parser, 'onerror', er)
          return parser
        }

        function end(parser) {
          if (parser.sawRoot && !parser.closedRoot) strictFail(parser, 'Unclosed root tag')
          if ((parser.state !== S.BEGIN) &&
              (parser.state !== S.BEGIN_WHITESPACE) &&
              (parser.state !== S.TEXT)) {
            error(parser, 'Unexpected end')
          }
          closeText(parser)
          parser.c = ''
          parser.closed = true
          emit(parser, 'onend')
          SAXParser.call(parser, parser.strict, parser.opt)
          return parser
        }

        function strictFail(parser, message) {
          if (typeof parser !== 'object' || !(parser instanceof SAXParser)) {
            throw new Error('bad call to strictFail')
          }
          if (parser.strict) {
            error(parser, message)
          }
        }

        function newTag(parser) {
          if (!parser.strict) parser.tagName = parser.tagName[parser.looseCase]()
          var parent = parser.tags[parser.tags.length - 1] || parser
          var tag = parser.tag = {name: parser.tagName, attributes: {}}

          // will be overridden if tag contails an xmlns="foo" or xmlns:foo="bar"
          if (parser.opt.xmlns) {
            tag.ns = parent.ns
          }
          parser.attribList.length = 0
        }

        function qname(name, attribute) {
          var i = name.indexOf(':')
          var qualName = i < 0 ? ['', name] : name.split(':')
          var prefix = qualName[0]
          var local = qualName[1]

          // <x "xmlns"="http://foo">
          if (attribute && name === 'xmlns') {
            prefix = 'xmlns'
            local = ''
          }

          return {prefix: prefix, local: local}
        }

        function attrib(parser) {
          if (!parser.strict) {
            parser.attribName = parser.attribName[parser.looseCase]()
          }

          if (parser.attribList.indexOf(parser.attribName) !== -1 ||
              parser.tag.attributes.hasOwnProperty(parser.attribName)) {
            parser.attribName = parser.attribValue = ''
            return
          }

          if (parser.opt.xmlns) {
            var qn = qname(parser.attribName, true)
            var prefix = qn.prefix
            var local = qn.local

            if (prefix === 'xmlns') {
              // namespace binding attribute. push the binding into scope
              if (local === 'xml' && parser.attribValue !== XML_NAMESPACE) {
                strictFail(parser,
                    'xml: prefix must be bound to ' + XML_NAMESPACE + '\n' +
                    'Actual: ' + parser.attribValue)
              } else if (local === 'xmlns' && parser.attribValue !== XMLNS_NAMESPACE) {
                strictFail(parser,
                    'xmlns: prefix must be bound to ' + XMLNS_NAMESPACE + '\n' +
                    'Actual: ' + parser.attribValue)
              } else {
                var tag = parser.tag
          var parent = parser.tags[parser.tags.length - 1] || parser
                if (tag.ns === parent.ns) {
                  tag.ns = Object.create(parent.ns)
          }
                tag.ns[local] = parser.attribValue
        }
            }

            // defer onattribute events until all attributes have been seen
            // so any new bindings can take effect. preserve attribute order
            // so deferred events can be emitted in document order
            parser.attribList.push([parser.attribName, parser.attribValue])
          } else {
            // in non-xmlns mode, we can emit the event right away
            parser.tag.attributes[parser.attribName] = parser.attribValue
            emitNode(parser, 'onattribute', {
              name: parser.attribName,
              value: parser.attribValue
            })
          }

          parser.attribName = parser.attribValue = ''
        }

        function openTag(parser, selfClosing) {
          if (parser.opt.xmlns) {
            // emit namespace binding events
            var tag = parser.tag

            // add namespace info to tag
            var qn = qname(parser.tagName)
            tag.prefix = qn.prefix
            tag.local = qn.local
            tag.uri = tag.ns[qn.prefix] || ''

            if (tag.prefix && !tag.uri) {
              strictFail(parser, 'Unbound namespace prefix: ' +
                  JSON.stringify(parser.tagName))
              tag.uri = qn.prefix
            }

            var parent = parser.tags[parser.tags.length - 1] || parser
            if (tag.ns && parent.ns !== tag.ns) {
              Object.keys(tag.ns).forEach(function (p) {
                emitNode(parser, 'onopennamespace', {
                  prefix: p,
                  uri: tag.ns[p]
                })
              })
            }

            // handle deferred onattribute events
            // Note: do not apply default ns to attributes:
            //   http://www.w3.org/TR/REC-xml-names/#defaulting
            for (var i = 0, l = parser.attribList.length; i < l; i++) {
              var nv = parser.attribList[i]
              var name = nv[0]
              var value = nv[1]
              var qualName = qname(name, true)
              var prefix = qualName.prefix
              var local = qualName.local
              var uri = prefix === '' ? '' : (tag.ns[prefix] || '')
              var a = {
                name: name,
                value: value,
                prefix: prefix,
                local: local,
                uri: uri
        }

              // if there's any attributes with an undefined namespace,
              // then fail on them now.
              if (prefix && prefix !== 'xmlns' && !uri) {
                strictFail(parser, 'Unbound namespace prefix: ' +
                    JSON.stringify(prefix))
                a.uri = prefix
              }
              parser.tag.attributes[name] = a
              emitNode(parser, 'onattribute', a)
            }
            parser.attribList.length = 0
          }

          parser.tag.isSelfClosing = !!selfClosing

          // process the tag
          parser.sawRoot = true
          parser.tags.push(parser.tag)
          emitNode(parser, 'onopentag', parser.tag)
          if (!selfClosing) {
            // special case for <script> in non-strict mode.
            if (!parser.noscript && parser.tagName.toLowerCase() === 'script') {
              parser.state = S.SCRIPT
            } else {
              parser.state = S.TEXT
            }
            parser.tag = null
            parser.tagName = ''
          }
          parser.attribName = parser.attribValue = ''
          parser.attribList.length = 0
        }

        function closeTag(parser) {
          if (!parser.tagName) {
            strictFail(parser, 'Weird empty close tag.')
            parser.textNode += '</>'
            parser.state = S.TEXT
            return
          }

          if (parser.script) {
            if (parser.tagName !== 'script') {
              parser.script += '</' + parser.tagName + '>'
              parser.tagName = ''
              parser.state = S.SCRIPT
              return
            }
            emitNode(parser, 'onscript', parser.script)
            parser.script = ''
          }

          // first make sure that the closing tag actually exists.
          // <a><b></c></b></a> will close everything, otherwise.
          var t = parser.tags.length
          var tagName = parser.tagName
          if (!parser.strict) {
            tagName = tagName[parser.looseCase]()
          }
          var closeTo = tagName
          while (t--) {
            var close = parser.tags[t]
            if (close.name !== closeTo) {
              // fail the first time in strict mode
              strictFail(parser, 'Unexpected close tag')
            } else {
              break
            }
          }

          // didn't find it.  we already failed for strict, so just abort.
          if (t < 0) {
            strictFail(parser, 'Unmatched closing tag: ' + parser.tagName)
            parser.textNode += '</' + parser.tagName + '>'
            parser.state = S.TEXT
            return
          }
          parser.tagName = tagName
          var s = parser.tags.length
          while (s-- > t) {
            var tag = parser.tag = parser.tags.pop()
            parser.tagName = parser.tag.name
            emitNode(parser, 'onclosetag', parser.tagName)

            var x = {}
            for (var i in tag.ns) {
              x[i] = tag.ns[i]
            }

            var parent = parser.tags[parser.tags.length - 1] || parser
            if (parser.opt.xmlns && tag.ns !== parent.ns) {
              // remove namespace bindings introduced by tag
              Object.keys(tag.ns).forEach(function (p) {
                var n = tag.ns[p]
                emitNode(parser, 'onclosenamespace', {prefix: p, uri: n})
              })
            }
          }
          if (t === 0) parser.closedRoot = true
          parser.tagName = parser.attribValue = parser.attribName = ''
          parser.attribList.length = 0
          parser.state = S.TEXT
        }

        function parseEntity(parser) {
          var entity = parser.entity
          var entityLC = entity.toLowerCase()
          var num
          var numStr = ''

          if (parser.ENTITIES[entity]) {
            return parser.ENTITIES[entity]
          }
          if (parser.ENTITIES[entityLC]) {
            return parser.ENTITIES[entityLC]
          }
          entity = entityLC
          if (entity.charAt(0) === '#') {
            if (entity.charAt(1) === 'x') {
              entity = entity.slice(2)
              num = parseInt(entity, 16)
              numStr = num.toString(16)
            } else {
              entity = entity.slice(1)
              num = parseInt(entity, 10)
              numStr = num.toString(10)
            }
          }
          entity = entity.replace(/^0+/, '')
          if (numStr.toLowerCase() !== entity) {
            strictFail(parser, 'Invalid character entity')
            return '&' + parser.entity + ';'
          }

          return String.fromCodePoint(num)
        }

        function beginWhiteSpace(parser, c) {
          if (c === '<') {
            parser.state = S.OPEN_WAKA
            parser.startTagPosition = parser.position
          } else if (not(whitespace, c)) {
            // have to process this as a text node.
            // weird, but happens.
            strictFail(parser, 'Non-whitespace before first tag.')
            parser.textNode = c
            parser.state = S.TEXT
          }
        }

        function charAt(chunk, i) {
          var result = ''
          if (i < chunk.length) {
            result = chunk.charAt(i)
          }
          return result
        }

        function write(chunk) {
          var parser = this
          if (this.error) {
            throw this.error
          }
          if (parser.closed) {
            return error(parser,
                'Cannot write after close. Assign an onready handler.')
          }
          if (chunk === null) {
            return end(parser)
          }
          if (typeof chunk === 'object') {
            chunk = chunk.toString()
          }
          var i = 0
          var c = ''
          while (true) {
            c = charAt(chunk, i++)
            parser.c = c
            if (!c) {
              break
            }
            if (parser.trackPosition) {
              parser.position++
              if (c === '\n') {
                parser.line++
                parser.column = 0
              } else {
                parser.column++
              }
            }
            switch (parser.state) {
              case S.BEGIN:
                parser.state = S.BEGIN_WHITESPACE
                if (c === '\uFEFF') {
                  continue
          }
                beginWhiteSpace(parser, c)
                continue

              case S.BEGIN_WHITESPACE:
                beginWhiteSpace(parser, c)
                continue

              case S.TEXT:
                if (parser.sawRoot && !parser.closedRoot) {
                  var starti = i - 1
                  while (c && c !== '<' && c !== '&') {
                    c = charAt(chunk, i++)
                    if (c && parser.trackPosition) {
                      parser.position++
                      if (c === '\n') {
                        parser.line++
                        parser.column = 0
                      } else {
                        parser.column++
                      }
              }
            }
                  parser.textNode += chunk.substring(starti, i - 1)
                }
                if (c === '<' && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
                  parser.state = S.OPEN_WAKA
                  parser.startTagPosition = parser.position
          } else {
                  if (not(whitespace, c) && (!parser.sawRoot || parser.closedRoot)) {
                    strictFail(parser, 'Text data outside of root node.')
            }
                  if (c === '&') {
                    parser.state = S.TEXT_ENTITY
            } else {
                    parser.textNode += c
            }
          }
                continue

              case S.SCRIPT:
                // only non-strict
          if (c === '<') {
            parser.state = S.SCRIPT_ENDING
          } else {
            parser.script += c
          }
                continue

              case S.SCRIPT_ENDING:
                if (c === '/') {
                  parser.state = S.CLOSE_TAG
                } else {
                  parser.script += '<' + c
                  parser.state = S.SCRIPT
                }
                continue

              case S.OPEN_WAKA:
                // either a /, ?, !, or text is coming next.
                if (c === '!') {
                  parser.state = S.SGML_DECL
                  parser.sgmlDecl = ''
                } else if (is(whitespace, c)) {
                  // wait for it...
                } else if (is(nameStart, c)) {
                  parser.state = S.OPEN_TAG
                  parser.tagName = c
                } else if (c === '/') {
                  parser.state = S.CLOSE_TAG
                  parser.tagName = ''
                } else if (c === '?') {
                  parser.state = S.PROC_INST
                  parser.procInstName = parser.procInstBody = ''
                } else {
                  strictFail(parser, 'Unencoded <')
                  // if there was some whitespace, then add that in.
                  if (parser.startTagPosition + 1 < parser.position) {
                    var pad = parser.position - parser.startTagPosition
                    c = new Array(pad).join(' ') + c
                  }
                  parser.textNode += '<' + c
            parser.state = S.TEXT
          }
                continue

              case S.SGML_DECL:
                if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
                  emitNode(parser, 'onopencdata')
                  parser.state = S.CDATA
                  parser.sgmlDecl = ''
                  parser.cdata = ''
                } else if (parser.sgmlDecl + c === '--') {
                  parser.state = S.COMMENT
                  parser.comment = ''
                  parser.sgmlDecl = ''
                } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
                  parser.state = S.DOCTYPE
                  if (parser.doctype || parser.sawRoot) {
                    strictFail(parser,
                        'Inappropriately located doctype declaration')
                  }
                  parser.doctype = ''
                  parser.sgmlDecl = ''
                } else if (c === '>') {
                  emitNode(parser, 'onsgmldeclaration', parser.sgmlDecl)
                  parser.sgmlDecl = ''
                  parser.state = S.TEXT
                } else if (is(quote, c)) {
                  parser.state = S.SGML_DECL_QUOTED
                  parser.sgmlDecl += c
                } else {
                  parser.sgmlDecl += c
          }
                continue

              case S.SGML_DECL_QUOTED:
                if (c === parser.q) {
                  parser.state = S.SGML_DECL
                  parser.q = ''
          }
                parser.sgmlDecl += c
                continue

              case S.DOCTYPE:
                if (c === '>') {
                  parser.state = S.TEXT
                  emitNode(parser, 'ondoctype', parser.doctype)
                  parser.doctype = true // just remember that we saw it.
                } else {
                  parser.doctype += c
                  if (c === '[') {
                    parser.state = S.DOCTYPE_DTD
                  } else if (is(quote, c)) {
                    parser.state = S.DOCTYPE_QUOTED
                    parser.q = c
                  }
          }
                continue

              case S.DOCTYPE_QUOTED:
                parser.doctype += c
                if (c === parser.q) {
                  parser.q = ''
                  parser.state = S.DOCTYPE
          }
                continue

              case S.DOCTYPE_DTD:
                parser.doctype += c
                if (c === ']') {
                  parser.state = S.DOCTYPE
                } else if (is(quote, c)) {
                  parser.state = S.DOCTYPE_DTD_QUOTED
                  parser.q = c
          }
                continue

              case S.DOCTYPE_DTD_QUOTED:
                parser.doctype += c
                if (c === parser.q) {
                  parser.state = S.DOCTYPE_DTD
                  parser.q = ''
                }
                continue

              case S.COMMENT:
                if (c === '-') {
                  parser.state = S.COMMENT_ENDING
                } else {
                  parser.comment += c
                }
                continue

              case S.COMMENT_ENDING:
                if (c === '-') {
                  parser.state = S.COMMENT_ENDED
                  parser.comment = textopts(parser.opt, parser.comment)
                  if (parser.comment) {
                    emitNode(parser, 'oncomment', parser.comment)
            }
                  parser.comment = ''
                } else {
                  parser.comment += '-' + c
                  parser.state = S.COMMENT
                }
                continue

              case S.COMMENT_ENDED:
                if (c !== '>') {
                  strictFail(parser, 'Malformed comment')
                  // allow <!-- blah -- bloo --> in non-strict mode,
                  // which is a comment of " blah -- bloo "
                  parser.comment += '--' + c
                  parser.state = S.COMMENT
                } else {
                  parser.state = S.TEXT
                }
                continue

              case S.CDATA:
                if (c === ']') {
                  parser.state = S.CDATA_ENDING
                } else {
                  parser.cdata += c
                }
                continue

              case S.CDATA_ENDING:
                if (c === ']') {
                  parser.state = S.CDATA_ENDING_2
                } else {
                  parser.cdata += ']' + c
                  parser.state = S.CDATA
                }
                continue

              case S.CDATA_ENDING_2:
                if (c === '>') {
                  if (parser.cdata) {
                    emitNode(parser, 'oncdata', parser.cdata)
            }
                  emitNode(parser, 'onclosecdata')
                  parser.cdata = ''
                  parser.state = S.TEXT
                } else if (c === ']') {
                  parser.cdata += ']'
                } else {
                  parser.cdata += ']]' + c
                  parser.state = S.CDATA
          }
                continue

              case S.PROC_INST:
                if (c === '?') {
                  parser.state = S.PROC_INST_ENDING
                } else if (is(whitespace, c)) {
                  parser.state = S.PROC_INST_BODY
                } else {
                  parser.procInstName += c
                }
                continue

              case S.PROC_INST_BODY:
                if (!parser.procInstBody && is(whitespace, c)) {
                  continue
                } else if (c === '?') {
                  parser.state = S.PROC_INST_ENDING
                } else {
                  parser.procInstBody += c
                }
                continue

              case S.PROC_INST_ENDING:
                if (c === '>') {
                  emitNode(parser, 'onprocessinginstruction', {
                    name: parser.procInstName,
                    body: parser.procInstBody
                  })
                  parser.procInstName = parser.procInstBody = ''
                  parser.state = S.TEXT
                } else {
                  parser.procInstBody += '?' + c
                  parser.state = S.PROC_INST_BODY
                }
                continue

              case S.OPEN_TAG:
                if (is(nameBody, c)) {
                  parser.tagName += c
                } else {
                  newTag(parser)
                  if (c === '>') {
                    openTag(parser)
                  } else if (c === '/') {
                    parser.state = S.OPEN_TAG_SLASH
                  } else {
                    if (not(whitespace, c)) {
                      strictFail(parser, 'Invalid character in tag name')
              }
                    parser.state = S.ATTRIB
            }
          }
                continue

              case S.OPEN_TAG_SLASH:
                if (c === '>') {
                  openTag(parser, true)
                  closeTag(parser)
                } else {
                  strictFail(parser, 'Forward-slash in opening tag not followed by >')
                  parser.state = S.ATTRIB
          }
                continue

              case S.ATTRIB:
                // haven't read the attribute name yet.
                if (is(whitespace, c)) {
                  continue
                } else if (c === '>') {
                  openTag(parser)
                } else if (c === '/') {
                  parser.state = S.OPEN_TAG_SLASH
                } else if (is(nameStart, c)) {
                  parser.attribName = c
                  parser.attribValue = ''
                  parser.state = S.ATTRIB_NAME
                } else {
                  strictFail(parser, 'Invalid attribute name')
          }
                continue

              case S.ATTRIB_NAME:
                if (c === '=') {
                  parser.state = S.ATTRIB_VALUE
                } else if (c === '>') {
                  strictFail(parser, 'Attribute without value')
                  parser.attribValue = parser.attribName
                  attrib(parser)
                  openTag(parser)
                } else if (is(whitespace, c)) {
                  parser.state = S.ATTRIB_NAME_SAW_WHITE
                } else if (is(nameBody, c)) {
                  parser.attribName += c
                } else {
                  strictFail(parser, 'Invalid attribute name')
          }
                continue

              case S.ATTRIB_NAME_SAW_WHITE:
                if (c === '=') {
                  parser.state = S.ATTRIB_VALUE
                } else if (is(whitespace, c)) {
                  continue
          } else {
                  strictFail(parser, 'Attribute without value')
                  parser.tag.attributes[parser.attribName] = ''
                  parser.attribValue = ''
            emitNode(parser, 'onattribute', {
              name: parser.attribName,
              value: ''
            })
                  parser.attribName = ''
                  if (c === '>') {
                    openTag(parser)
                  } else if (is(nameStart, c)) {
                    parser.attribName = c
                    parser.state = S.ATTRIB_NAME
                  } else {
                    strictFail(parser, 'Invalid attribute name')
                    parser.state = S.ATTRIB
                  }
          }
                continue

              case S.ATTRIB_VALUE:
                if (is(whitespace, c)) {
                  continue
                } else if (is(quote, c)) {
                  parser.q = c
                  parser.state = S.ATTRIB_VALUE_QUOTED
                } else {
                  strictFail(parser, 'Unquoted attribute value')
                  parser.state = S.ATTRIB_VALUE_UNQUOTED
                  parser.attribValue = c
                }
                continue

              case S.ATTRIB_VALUE_QUOTED:
                if (c !== parser.q) {
                  if (c === '&') {
                    parser.state = S.ATTRIB_VALUE_ENTITY_Q
                  } else {
                    parser.attribValue += c
            }
                  continue
                }
                attrib(parser)
                parser.q = ''
                parser.state = S.ATTRIB_VALUE_CLOSED
                continue

              case S.ATTRIB_VALUE_CLOSED:
                if (is(whitespace, c)) {
                  parser.state = S.ATTRIB
                } else if (c === '>') {
                  openTag(parser)
                } else if (c === '/') {
                  parser.state = S.OPEN_TAG_SLASH
                } else if (is(nameStart, c)) {
                  strictFail(parser, 'No whitespace between attributes')
                  parser.attribName = c
                  parser.attribValue = ''
                  parser.state = S.ATTRIB_NAME
                } else {
                  strictFail(parser, 'Invalid attribute name')
          }
                continue

              case S.ATTRIB_VALUE_UNQUOTED:
                if (not(attribEnd, c)) {
                  if (c === '&') {
                    parser.state = S.ATTRIB_VALUE_ENTITY_U
            } else {
                    parser.attribValue += c
            }
                  continue
          }
                attrib(parser)
                if (c === '>') {
                  openTag(parser)
                } else {
                  parser.state = S.ATTRIB
                }
                continue

              case S.CLOSE_TAG:
          if (!parser.tagName) {
            if (is(whitespace, c)) {
              continue
            } else if (not(nameStart, c)) {
              if (parser.script) {
                parser.script += '</' + c
                parser.state = S.SCRIPT
              } else {
                strictFail(parser, 'Invalid tagname in closing tag.')
              }
            } else {
              parser.tagName = c
            }
          } else if (c === '>') {
            closeTag(parser)
          } else if (is(nameBody, c)) {
            parser.tagName += c
          } else if (parser.script) {
            parser.script += '</' + parser.tagName
            parser.tagName = ''
            parser.state = S.SCRIPT
          } else {
            if (not(whitespace, c)) {
              strictFail(parser, 'Invalid tagname in closing tag')
            }
            parser.state = S.CLOSE_TAG_SAW_WHITE
          }
                continue

              case S.CLOSE_TAG_SAW_WHITE:
                if (is(whitespace, c)) {
                  continue
                }
                if (c === '>') {
                  closeTag(parser)
                } else {
                  strictFail(parser, 'Invalid characters in closing tag')
                }
                continue

              case S.TEXT_ENTITY:
              case S.ATTRIB_VALUE_ENTITY_Q:
              case S.ATTRIB_VALUE_ENTITY_U:
                var returnState
                var buffer
                switch (parser.state) {
                  case S.TEXT_ENTITY:
                    returnState = S.TEXT
                    buffer = 'textNode'
                    break

                  case S.ATTRIB_VALUE_ENTITY_Q:
                    returnState = S.ATTRIB_VALUE_QUOTED
                    buffer = 'attribValue'
                    break

                  case S.ATTRIB_VALUE_ENTITY_U:
                    returnState = S.ATTRIB_VALUE_UNQUOTED
                    buffer = 'attribValue'
                    break
                }

                if (c === ';') {
                  parser[buffer] += parseEntity(parser)
                  parser.entity = ''
                  parser.state = returnState
                } else if (is(parser.entity.length ? entityBody : entityStart, c)) {
                  parser.entity += c
                } else {
                  strictFail(parser, 'Invalid character in entity name')
                  parser[buffer] += '&' + parser.entity + c
                  parser.entity = ''
                  parser.state = returnState
                }

                continue

              default:
                throw new Error(parser, 'Unknown state: ' + parser.state)
            }
          } // while

          if (parser.position >= parser.bufferCheckPosition) {
            checkBufferLength(parser)
          }
          return parser
        }

        /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
        if (!String.fromCodePoint) {
          (function () {
            var stringFromCharCode = String.fromCharCode
            var floor = Math.floor
            var fromCodePoint = function () {
              var MAX_SIZE = 0x4000
              var codeUnits = []
              var highSurrogate
              var lowSurrogate
              var index = -1
              var length = arguments.length
              if (!length) {
                return ''
        }
              var result = ''
              while (++index < length) {
                var codePoint = Number(arguments[index])
                if (
                    !isFinite(codePoint) || // `NaN`, `+Infinity`, or `-Infinity`
                    codePoint < 0 || // not a valid Unicode code point
                    codePoint > 0x10FFFF || // not a valid Unicode code point
                    floor(codePoint) !== codePoint // not an integer
                ) {
                  throw RangeError('Invalid code point: ' + codePoint)
                }
                if (codePoint <= 0xFFFF) { // BMP code point
                  codeUnits.push(codePoint)
                } else { // Astral code point; split in surrogate halves
                  // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
                  codePoint -= 0x10000
                  highSurrogate = (codePoint >> 10) + 0xD800
                  lowSurrogate = (codePoint % 0x400) + 0xDC00
                  codeUnits.push(highSurrogate, lowSurrogate)
                }
                if (index + 1 === length || codeUnits.length > MAX_SIZE) {
                  result += stringFromCharCode.apply(null, codeUnits)
                  codeUnits.length = 0
                }
        }
              return result
            }
            if (Object.defineProperty) {
              Object.defineProperty(String, 'fromCodePoint', {
                value: fromCodePoint,
                configurable: true,
                writable: true
              })
            } else {
              String.fromCodePoint = fromCodePoint
            }
          }())
        }
      })(typeof exports === 'undefined' ? this.sax = {} : exports)

    }).call(this, require("buffer").Buffer)
  }, {"buffer": 17, "stream": 40, "string_decoder": 41}],
  108: [function (require, module, exports) {
    var Game = require('./logic/game/gamelogic');
    var Render = require('./graphics/render');
    var InputHandler = require('./logic/inputhandler');
    var MessageBox = require('./logic/chat/messagebox');

//number of times per secound sending packets to server
    var updateTickRate = 20;
    var update;
    resetUpdate();

//variables to check server response time (ping)
    var heartBeatsRate = 1;
    var heartBeatsTimer = 0;
    var heartBeat = {
      id: 1,
      time: 0
    };

    var ping = {
      value: 0
    };

    var render = new Render(assetsLoadedCallback, mouseMoveCallback);
    var gameLogic = new Game();
    var inputHandler = new InputHandler();
    var messageBox = new MessageBox();

    var localPlayer = null;
    var socket = io.connect();

    function assetsLoadedCallback() {
      socket.emit('connected');
    }

    socket.on('startgame', function (gameData) {
      //start game loop when connected to server
      gameLogic.startGameLoop();
      //create map
      gameLogic.createMap(gameData.mapName);
      //set render to game logic update
      gameLogic.setRender(render);
      //create local player with id from server
      localPlayer = gameLogic.newPlayer(gameData.id);
      localPlayer.id = gameData.id;
      localPlayer.name = gameData.name;
      localPlayer.isMainPlayer = true;

      startServerUpdateLoop();
      startServerHeartbeatUpdateLoop();
      //create map
      render.createMap('testmap');
      //add player to render
      render.newPlayer(localPlayer);
      //add messageBox to render
      render.createMessageBox(messageBox);
      //add stats (ping) to render. Ping is send by reference and has property "value" which contains ping value, so render always know if value changed
      render.createStatsRender(ping);

      //set inputHandler callback
      inputHandler.setCallback(inputHandlerCallback);

      console.log('Connection to server succesfull. Your id is: ' + gameData.id);
    });

    /*
     HANDLE SERVER MESSAGES
     */

//get gamelogic update from server
    socket.on('serverupdate', function (data) {
      if (data.players !== undefined)
        updatePlayers(data.players);
      if (data.disconnectedClients.length > 0)
        deletePlayers(data.disconnectedClients);
    });

//get message from server
    socket.on('servermessage', function (message) {
      updateMessageBox(message);
    });

//get back heartbeat from server and calculate ping
    socket.on('heartbeatsresponse', function (data) {
      ping.value = new Date().getTime() - heartBeat.time;
      //console.log('Packet ' + data.id + ' reciver after ' + ping.value + ' (ms)');
    });

//updates local player depends on server data
    function updatePlayers(serverPlayers) {
      for (var key in serverPlayers) {
        var localPlayer = gameLogic.players[key];
        //create new player if don't exist locally
        if (typeof localPlayer == "undefined") {
          localPlayer = gameLogic.newPlayer(key);
          render.newPlayer(localPlayer);
        }
        localPlayer.serverUpdate(serverPlayers[key]);
    }
    }

//delete disconnected players
    function deletePlayers(disconnected) {
      disconnected.forEach(function (id) {
        render.removePlayer(id);
        gameLogic.removePlayer(id);
      });
    }

//push new message to messageBox
    function updateMessageBox(message) {
      messageBox.addMessage(message.content, message.authorName, message.addressee);
    }

    /*
     HANDLE SENDING MESSAGES TO SERVER
     */

//send update to server
    function serverUpdateLoop() {
      if (!update.isEmpty) {
        socket.emit('clientupdate', update);
        resetUpdate();
    }
      //console.log('updating clients' + new Date().getTime());
    }

//send heartbeats to keep connection alive
    function serverHeartbeatsLoop() {
      if (heartBeatsTimer >= 1 / heartBeatsRate * 1000) {
        heartBeatsTimer = 0;
        heartBeat.time = new Date().getTime();
        socket.emit('heartbeat', {id: heartBeat.id});
        heartBeat.id++;
      } else {
        heartBeatsTimer += 1 / heartBeatsRate * 1000
    }
    }

    function startServerUpdateLoop() {
      serverUpdateLoop();
      setTimeout(startServerUpdateLoop, 1 / updateTickRate * 1000);
    }

    function startServerHeartbeatUpdateLoop() {
      serverHeartbeatsLoop();
      setTimeout(startServerHeartbeatUpdateLoop, 1 / heartBeatsRate * 1000);
    }

    function resetUpdate() {
      update = {
        input: null,
        angle: null,
        isEmpty: true
      };
    }

    var chatMode = false;

//this function is called when input handler got something
//input is copy od inputhandler inputArray
//TODO refactor this ...
    function inputHandlerCallback(input) {
      //if enter pressed
      if (input[input.length - 1] == 13) {
        //if chat mode if true we need to get message from canvas and send it to server
        if (chatMode == false) {
          render.enterChat();
          chatMode = true;
          //if chat mode is false we entering chat mode
        } else {
          var message = render.endChat();
          if (message != "") {
            var m = messageBox.createMessage(message, localPlayer.name);
            m.parseAddressee();
            socket.emit('clientmessage', m);
            }
          chatMode = false;
          inputHandler.clearInput();
        }
      } else if (chatMode == false) {
        if (localPlayer != null) {
          localPlayer.input = input;
          update.input = input;
            update.isEmpty = false;
        }
    }
    }

    function mouseMoveCallback(degree) {
      localPlayer.body.angle = degree;
      localPlayer.isChanged = true;
      update.angle = degree;
      update.isEmpty = false;
    }

//clear input and send update when tab inactive
// TODO it stoped working and don't know why
    $(window).onblur = function () {
      inputHandler.clearInput();
      //we must call update because when tab is inactive all setTimeout functions under 1000ms is frozen
      serverUpdateLoop();
    };

  }, {
    "./graphics/render": 113,
    "./logic/chat/messagebox": 116,
    "./logic/game/gamelogic": 118,
    "./logic/inputhandler": 121
  }],
  109: [function (require, module, exports) {
    /*
     render text area for chat input
     using CanvasInput library
     */
    function MessageInputRender(game, name) {
      this.game = game;
      this.map = null;
      this.name = name;
    }

    MessageInputRender.prototype.init = function () {
      this.map = this.game.add.tilemap(this.name);
      this.map.addTilesetImage('terrain', 'tiles');

      var layer1 = this.map.createLayer('layer1');
      var layer2 = this.map.createLayer('layer2');
      var layer3 = this.map.createLayer('layer3');
      var layer4 = this.map.createLayer('layer4');

      layer1.resizeWorld();
    };

    MessageInputRender.prototype.update = function () {

    };

    MessageInputRender.prototype.destroy = function () {

    };

    module.exports = MessageInputRender;
  }, {}],
  110: [function (require, module, exports) {
    /*
     Rendering messages
     TODO scrollbar, resize, hide, drag able
     */

    function MessageBoxRender(game, messageBox) {
      this.game = game;
      this.messageBox = messageBox;
      this.textHolder = null;


      //size of message box
      this.heigth = 400;
      this.width = 300;


      this.colors = {
        all: 0xffffff,
        shout: 0xC65B08,
        whisper: 0x7A378B,
        system: 0xFF0000
    }
    }

    MessageBoxRender.prototype.init = function () {
      this.textHolder = this.game.add.text(0, 0, "", {
        font: "13px Courier",
        wordWrap: true,
        wordWrapWidth: this.width
      });

      this.textHolder.fixedToCamera = true;
    };

    MessageBoxRender.prototype.update = function () {
      var messages = this.messageBox.getLast(10);

      this.textHolder.text = "";
      this.textHolder.clearColors();
      for (var i = 0; i < messages.length; i++) {
        var startColorIndex = this.textHolder.text.length;
        //TODO wrap to long single words
        this.textHolder.text += "\n" + messages[i].authorName + ': ' + messages[i].content;
        switch (messages[i].addressee) {
          case 'all':
            this.textHolder.addColor(hexToString(this.colors.all), startColorIndex);
            break;
          case 'system':
            this.textHolder.addColor(hexToString(this.colors.system), startColorIndex);
            break;
          default:
            //for whisper
            this.textHolder.addColor(hexToString(this.colors.whisper), startColorIndex);
            break;
        }
        if (this.textHolder.height > this.heigth)
          return;
      }

      this.textHolder.cameraOffset.y = this.game.height - this.textHolder.height - 50;
    };

    MessageBoxRender.prototype.destroy = function () {
      this.textHolder.destroy(true, false);
    };

    function hexToString(hex) {
      return '#' + hex.toString(16);
    }

    module.exports = MessageBoxRender;
  }, {}],
  111: [function (require, module, exports) {
    /*
     render text area for chat input
     using CanvasInput library
     */
    function MessageInputRender(game) {
      this.game = game;
    }

    MessageInputRender.prototype.init = function () {
      var bitmap = this.game.add.bitmapData(250, 40);
      this.inputSprite = this.game.add.sprite(0, this.game.height - 35, bitmap);
      this.inputSprite.fixedToCamera = true;

      this.inputSprite.canvasInput = new CanvasInput({
        canvas: bitmap.canvas,
        fontSize: 14,
        fontFamily: 'Arial',
        fontColor: '#212121',
        fontWeight: 'bold',
        width: 200,
        padding: 8,
        borderWidth: 1,
        borderColor: '#000',
        borderRadius: 3,
        boxShadow: '1px 1px 0px #fff',
        innerShadow: '0px 0px 5px rgba(0, 0, 0, 0.5)',
        placeHolder: 'Press enter to write...'
      });
    };

    MessageInputRender.prototype.update = function () {

    };

    MessageInputRender.prototype.startTyping = function () {
      this.inputSprite.canvasInput.focus();
    };

    MessageInputRender.prototype.getTextAndReset = function () {
      var text = this.inputSprite.canvasInput.value();

      this.inputSprite.canvasInput.blur();
      this.inputSprite.canvasInput.value("");

      return text;
    };

    MessageInputRender.prototype.destroy = function () {
      this.inputSprite.canvasInput.destroy();
      this.inputSprite.destroy();
    };

    module.exports = MessageInputRender;
  }, {}],
  112: [function (require, module, exports) {
    /*
     player render
     */

    function PlayerRender(game, player) {
      this.game = game;
      this.player = player;
      this.sprite = null;
      this.nameText = null;
      //1 - no lerp, >1 - lerp, do not set this to <1
      this.lerpRate = 10;

    }

    PlayerRender.prototype.init = function () {
      this.sprite = this.game.add.sprite(0, 0, 'player');
      this.sprite.width /= 2;
      this.sprite.height /= 2;

      this.sprite.anchor.set(0.5);

      this.nameText = this.game.add.text(this.player.x, this.player.y, this.player.name, {
        font: "bold 11px Arial",
        fill: "#ffffff"
      });

      this.nameText.text = this.player.name;
      this.nameText.anchor.set(0.5);

      if (this.player.isMainPlayer) {
        this.game.camera.follow(this.sprite);
    }
    };

    PlayerRender.prototype.update = function () {

      //sprite position update
      this.sprite.x += (this.player.body.position[0] - this.sprite.x) / this.lerpRate;
      this.sprite.y += (this.player.body.position[1] - this.sprite.y) / this.lerpRate;
      this.sprite.angle = this.player.body.angle;

      //name position update
      this.nameText.text = this.player.name;
      this.nameText.x = this.sprite.x;
      this.nameText.y = this.sprite.y - 20;
    };

    PlayerRender.prototype.destroy = function () {
      this.sprite.destroy();
      this.nameText.destroy();
    };

    module.exports = PlayerRender;
  }, {}],
  113: [function (require, module, exports) {
    var PlayerRender = require("./playerrender");
    var MessageInputRender = require("./messageinputrender");
    var MessageBoxRender = require("./messageboxrender");
    var StatsRender = require("./statsrender");
    var MapRender = require("./maprender");

    function Render(onLoadCallback, mouseMoveCallback) {
      this.onLoadCallback = onLoadCallback;
      this.mouseMoveCallback = mouseMoveCallback;
      this.game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example',
          {preload: this.preload.bind(this), create: this.create.bind(this)});

      this.objects = {};
      this.localPlayerRender = null;
      this.messageBoxRender = null;
      this.messageInputRender = null;
      this.statsRender = null;
      this.mapRender = null;
    }

//load images
    Render.prototype.preload = function () {
      //load assets
      this.game.load.atlasJSONHash('panda', 'resources/images/panda.png', 'resources/images/panda.json');
      this.game.load.bitmapFont('gem', 'resources/fonts/gem.png', 'resources/fonts/gem.xml');
      this.game.load.image('player', 'resources/images/player.png');
      this.game.load.image('tiles', 'resources/images/terrain.png');
      this.game.load.tilemap('testmap', 'resources/maps/mapatest.json', null, Phaser.Tilemap.TILED_JSON);
      //set callback (client connect to server when all assets are loaded)
      this.game.load.onLoadComplete.add(this.onLoadCallback);
    };

    Render.prototype.create = function () {
      this.game.stage.backgroundColor = "#4488AA";

      this.game.input.addMoveCallback(mouseMoveCallback, this);
      this.game.renderer.renderSession.roundPixels = true;
    };

    Render.prototype.createMap = function (name) {
      this.mapRender = new MapRender(this.game, name);
      this.mapRender.init();
    };

    Render.prototype.createMessageBox = function (messageBox) {
      //create MessengerBox
      this.messageBoxRender = new MessageBoxRender(this.game, messageBox);

      this.messageBoxRender.init();

      //create messageInputRender
      this.messageInputRender = new MessageInputRender(this.game);
      this.messageInputRender.init();
    };

    Render.prototype.destroyMessageBox = function () {
      this.messageBoxRender.destroy();
      this.messageInputRender.destroy();

      this.messageInputRender = null;
      this.messageBoxRender = null;
    };

    Render.prototype.enterChat = function () {
      if (this.messageInputRender != null) {
        this.messageInputRender.startTyping();
      }
    };

    Render.prototype.endChat = function () {
      if (this.messageInputRender != null) {
        return this.messageInputRender.getTextAndReset();
      }
    };

    Render.prototype.createStatsRender = function (ping) {
      this.statsRender = new StatsRender(this.game, ping);
      this.statsRender.init();
    };

    Render.prototype.destroyStatsRender = function () {
      this.statsRender.destroy();
      this.statsRender = null;
    };

    Render.prototype.newPlayer = function (player) {
      //create new player render
      var playerRender = new PlayerRender(this.game, player);

      if (player.isMainPlayer) {
        this.localPlayerRender = playerRender;
      }

      playerRender.init();
      //add playerrender to objects array
      this.objects[player.id] = playerRender;
    };

    Render.prototype.removePlayer = function (id) {
      if (id in this.objects) {
        //remove form game
        this.objects[id].destroy();
        //remove from objects array
        delete this.objects[id];

        console.log('player removed from render');
      }
    };

    Render.prototype.update = function (delta) {
      for (var key in this.objects) {
        this.objects[key].update();
      }
      if (this.messageBoxRender != null) {
        this.messageBoxRender.update();
      }
      if (this.statsRender != null) {
        this.statsRender.update();
    }
    };

    function mouseMoveCallback(mousePointer) {
      var radians = Math.atan2(mousePointer.x - this.localPlayerRender.sprite.x + this.game.camera.x
          , mousePointer.y - this.localPlayerRender.sprite.y + this.game.camera.y);
      var degree = (radians * (180 / Math.PI) * -1) + 90;
      this.mouseMoveCallback(degree);
    }

    module.exports = Render;
  }, {
    "./maprender": 109,
    "./messageboxrender": 110,
    "./messageinputrender": 111,
    "./playerrender": 112,
    "./statsrender": 114
  }],
  114: [function (require, module, exports) {
    /*
     render textarea for chat
     using CanvasInput library
     */
    function StarsRender(game, ping) {
      this.game = game;
      this.pingText = null;
      this.ping = ping;
      this.oldPingValue = -1;
    }

    StarsRender.prototype.init = function () {
      this.pingText = this.game.add.text(this.game.width - 100, 0, "", {
        font: "bold 16px Arial",
        fill: "#ffffff"
      });

      this.pingText.fixedToCamera = true;
    };

    StarsRender.prototype.update = function () {
      //if value of ping reference has changed we need to update text
      if (this.oldPingValue != this.ping.value) {
        this.oldPingValue = this.ping.value;
        this.pingText.text = "Ping: " + this.ping.value.toString(10) + "ms";
      }
    };

    StarsRender.prototype.destroy = function () {
      this.pingText.destroy();
    };

    module.exports = StarsRender;
  }, {}],
  115: [function (require, module, exports) {
    /*
     message class
     */
    function Message(content, authorName, addressee) {
      this.content = content;
      this.authorName = authorName;
      this.sendTime = -1;
      if (addressee != undefined) {
        this.addressee = addressee;
      } else {
        this.addressee = "";
    }
    }

    Message.prototype.append = function (content) {
      this.content = this.content + content;
    };

    Message.prototype.setContent = function (content) {
      this.content = content;
    };

//select proper addressee
    Message.prototype.parseAddressee = function () {
      var firstChar = this.content.charAt(0);
      if (firstChar == '!') {
        this.addressee = "shout";
      } else if (firstChar == '$') {
        this.addressee = "trade";
      } else if (firstChar == '#') {
        this.addressee = "party";
      } else if (firstChar == '"') {
        this.addressee = this.content.substr(1, this.content.indexOf(" ") - 1);
        this.content = this.content.substr(this.content.indexOf(" "), this.content.length);
      } else if (firstChar == '/') {
        this.addressee = "command";
      } else {
        this.addressee = "all";
      }

      if (this.addressee != "all") {
        this.content = this.content.substr(1, this.content.length);
    }
      return this.addressee;
    };

    module.exports = Message;


  }, {}],
  116: [function (require, module, exports) {
    /*
     Class to keep all messages
     */

    var Message = require("./message");

    function MessageBox() {
      this.messageArray = [];
    }

//create and return message
    MessageBox.prototype.createMessage = function (content, authorName, addressee) {
      content = content.trim();
      return new Message(content, authorName, addressee);
    };

//create, return and add message to list
    MessageBox.prototype.addMessage = function (content, authorName, addressee) {
      var message = this.createMessage(content, authorName, addressee);
      this.messageArray.push(message);

      return message;
    };

    MessageBox.prototype.pushMessages = function (messages) {
      this.messageArray.concat(messages);
      console.log('concat  ');
      console.log(this.messageArray);
    };

//return x last messages
    MessageBox.prototype.getLast = function (count) {
      var arrayLength = this.messageArray.length;
      if (count > arrayLength) {
        count = arrayLength;
    }
      return this.messageArray.slice(arrayLength - count, arrayLength);
    };

    module.exports = MessageBox;
  }, {"./message": 115}],
  117: [function (require, module, exports) {
    /*
     class for counting delta
     */

    function DeltaTimer() {
      this.currentTime;
      this.delta;
      this.lastUpdate = new Date().getTime();
    }

    DeltaTimer.prototype.getDelta = function () {
      this.currentTime = new Date().getTime();
      this.delta = this.currentTime - this.lastUpdate;
      this.lastUpdate = this.currentTime;

      return this.delta;
    };

    module.exports = DeltaTimer;
  }, {}],
  118: [function (require, module, exports) {
    var p2 = require('p2');
    var Player = require('./player');
    var DeltaTimer = require('./detlatimer');
    var Map = require('./map');

    function Game() {
      this.tickRate = 64;

      this.players = {};
      this.renderHandler = null;
      this.timer = new DeltaTimer();
      this.physicsWorld = new p2.World({
        gravity: [0, 0]
      });

      this.map = null;
    }

    Game.prototype.startGameLoop = function () {
      this.gameLoop();
    };

    Game.prototype.gameLoop = function () {
      var delta = this.timer.getDelta();
      delta = (delta < 40) ? delta : 40;

      this.handleInput();
      this.update(delta);
      this.render(delta);

      var self = this;
      setTimeout(function () {
        self.gameLoop();
      }, 1 / this.tickRate * 1000);
    };

    Game.prototype.handleInput = function () {
      for (var key in this.players) {
        this.players[key].handleInput();
      }
    };

    Game.prototype.update = function (delta) {
      //update players
      for (var key in this.players) {
        this.players[key].update(delta);
      }

      this.physicsWorld.step(1 / 60, delta / 1000, 20);
    };

    Game.prototype.render = function (delta) {
      if (this.renderHandler != null) {
        this.renderHandler.update(delta);
      }
    };

    Game.prototype.setRender = function (render) {
      this.renderHandler = render;
    };

    Game.prototype.createMap = function (mapName) {
      this.map = new Map(mapName, this.physicsWorld);
    };

//creates new player
    Game.prototype.newPlayer = function (id) {
      var player = new Player();
      player.id = id;

      //create physics elements
      var body = new p2.Body({
        position: [400, 300],
        mass: 1,
        damping: 1,
        angularDamping: 1
      });

      var shape = new p2.Circle({
        radius: 16
      });

      body.addShape(shape);
      player.body = body;

      this.physicsWorld.addBody(body);
      this.players[player.id] = player;
      return player;
    };

    Game.prototype.removePlayer = function (id) {
      delete this.players[id];
    };

    Game.prototype.getPlayer = function (id) {
      if (this.players[id] != undefined) {
        return this.players[id];
      }
      return null;
    };

    module.exports = Game;

  }, {"./detlatimer": 117, "./map": 119, "./player": 120, "p2": 79}],
  119: [function (require, module, exports) {
    var tmx = require('tmx-parser');
    var p2 = require('p2');

    function Map(name, physicsWorld) {
      this.mapData = null;
      this.collisionLayer = null;
      this.name = name;
      this.physicsWorld = physicsWorld;

      var self = this;
      tmx.parseFile(mapsPath + '/' + name + '.tmx', function (err, map) {
        if (err) throw err;
        self.mapData = map;
        self.setCollisionBlocks();
      });
    }

    /*
     function breate physics body on blocks from 2 and 3 layer of the map
     */
    Map.prototype.setCollisionBlocks = function () {
      for (var i = 0; i < this.mapData.width; i++) {
        for (var j = 0; j < this.mapData.height; j++) {
          if (this.mapData.layers[1].tileAt(i, j) !== undefined
              || this.mapData.layers[2].tileAt(i, j) !== undefined) {
            var shape = new p2.Box({
              width: 32,
              height: 32
            });

            var body = new p2.Body({
              //position of block (+16 because it is center of block)
              position: [i * 32 + 16, j * 32 + 16],
              mass: 0
            });

            body.addShape(shape);
            this.physicsWorld.addBody(body);
          }
        }
      }
    };

    var mapsPath;
    if (typeof window === 'undefined') {
      mapsPath = './public/resources/maps';
    } else {
      //if we are in browser we need to overload readFile function
      mapsPath = './resources/maps';
      tmx.readFile = function (path, callback) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = onReadyStateChange;
        request.open("GET", path, true);
        try {
          request.send();
        } catch (err) {
          callback(err);
        }
        function onReadyStateChange() {
          if (request.readyState !== 4) return;
          if (Math.floor(request.status / 100) === 2) {
            callback(null, request.responseText);
            return;
            }
          callback(new Error(request.status + ": " + request.statusText));
        }
      };
    }


    module.exports = Map;
  }, {"p2": 79, "tmx-parser": 105}],
  120: [function (require, module, exports) {
    /*
     player class
     */

    var HorizontalDir = {none: 0, left: -1, right: 1};
    var VerticalDir = {none: 0, up: -1, down: 1};

    function Player() {
      this.body = null;
      this.input = [];
      this.horizontalDir = HorizontalDir.none;
      this.verticalDir = VerticalDir.none;
      this.speed = 0.2;
      this.isChanged = true;
      this.name = "";

      this.isMainPlayer = false;

      this.horizontalMove = HorizontalDir.none;
      this.verticalMove = VerticalDir.none;

      this.lastUpdateInfo = {
        position: [0, 0],
        horizontalMove: 2,
        verticalMove: 2,
        name: "",
        angle: 999
      };

      /*  this.hdir = HorizontalDir.left;
       console.log('start hdir: ' + this.hdir);
       this.hdircpy = this.hdir;
       this.hdircpy = HorizontalDir.right;
       console.log('cpy: ' + this.hdircpy);
       console.log('org: ' + this.hdir);*/

    }

    Player.prototype.handleInput = function () {
      if (this.horizontalDir != 0 || this.verticalDir != 0) {
        this.horizontalDir = HorizontalDir.none;
        this.verticalDir = VerticalDir.none;
      }

      var self = this;
      this.input.forEach(function (i) {
        switch (i) {
          case 37:
          case 65:
            self.horizontalDir = HorizontalDir.left;
            break;
          case 39:
          case 68:
            self.horizontalDir = HorizontalDir.right;
            break;
          case 38:
          case 87:
            self.verticalDir = VerticalDir.up;
            break;
          case 40:
          case 83:
            self.verticalDir = VerticalDir.down;
            break;
        }
      });
    };

//update player position depends on delta and move direction
    Player.prototype.update = function (delta) {
      if (this.body != null) {
        var offset = this.speed * delta;
        if (this.verticalDir != 0 && this.horizontalDir != 0)
          offset = offset * Math.sin(45 * (180 / Math.PI));

        this.body.position[0] += this.horizontalDir * offset;
        this.body.position[1] += this.verticalDir * offset;

        // if (this.verticalDir != 0 || this.horizontalDir != 0
        //     || this.body.velocity[0] != 0 || this.body.velocity[1] != 0) {
        //      this.isChanged = true;
        // }
      }
    };

//set player position to x, y
    Player.prototype.setPosition = function (x, y) {
      if (this.body != null) {
        this.body.position[0] = x;
        this.body.position[1] = y;
      }
    };

    Player.prototype.serverUpdate = function (playerUpdateInfo) {
      if (playerUpdateInfo.hasOwnProperty('position')) {
        this.setPosition(playerUpdateInfo.position[0], playerUpdateInfo.position[1]);
      }
      if (playerUpdateInfo.hasOwnProperty('horizontalMove')) {
        this.horizontalMove = playerUpdateInfo.horizontalMove;
      }
      if (playerUpdateInfo.hasOwnProperty('verticalMove')) {
        this.verticalMove = playerUpdateInfo.verticalMove;
      }
      if (playerUpdateInfo.hasOwnProperty('name')) {
        this.name = playerUpdateInfo.name;
      }
      if (playerUpdateInfo.hasOwnProperty('angle')) {
        this.body.angle = playerUpdateInfo.angle;
      }
    };

//get all update info
    Player.prototype.getAllUpdateInfo = function () {
      var playerUpdateInfo = {};
      playerUpdateInfo.position = this.body.position;
      playerUpdateInfo.horizontalMove = this.horizontalDir;
      playerUpdateInfo.verticalMove = this.verticalDir;
      playerUpdateInfo.name = this.name;
      playerUpdateInfo.angle = this.body.angle;

      return playerUpdateInfo;
    };

//get only update info from things which has changed
    Player.prototype.getUpdateInfo = function () {
      var playerUpdateInfo = {};
      if (this.lastUpdateInfo.position[0] != this.body.position[0] || this.lastUpdateInfo.position[1] != this.body.position[1]) {
        playerUpdateInfo.position = this.body.position;
        this.lastUpdateInfo.position = [this.body.position[0], this.body.position[1]];
      }
      if (this.lastUpdateInfo.horizontalMove != this.horizontalDir) {
        playerUpdateInfo.horizontalMove = this.horizontalDir;
        this.lastUpdateInfo.horizontalMove = this.horizontalDir;
      }
      if (this.lastUpdateInfo.verticalMove != this.verticalDir) {
        playerUpdateInfo.verticalMove = this.verticalDir;
        this.lastUpdateInfo.verticalMove = this.verticalDir;
      }
      if (this.lastUpdateInfo.angle != this.body.angle) {
        playerUpdateInfo.angle = this.body.angle;
        this.lastUpdateInfo.angle = this.body.angle;
      }
      if (this.lastUpdateInfo.name != this.name) {
        playerUpdateInfo.name = this.name;
        this.lastUpdateInfo.name = this.name;
      }

      return playerUpdateInfo;
    };


    module.exports = Player;
  }, {}],
  121: [function (require, module, exports) {
    /*var validInputs = [
     39, 68, //right
     37, 65, //left
     38, 83, //up
     40, 87  //down
     ];

     function isInputValid(inputCode) {
     if (validInputs.indexOf(inputCode) != -1) {
     return true;
     }
     return false;
     }*/

    function InputHandler() {
      this.inputArray = [];
      var self = this;

      document.onkeydown = function (event) {
        self.keyPressed(event);
      };
      document.onkeyup = function (event) {
        self.keyReleased(event);
      };

      //set callback to empty function
      this.deleteCallback();
    }

    InputHandler.prototype.setCallback = function (callback) {
      this.callback = callback;
    };

    InputHandler.prototype.deleteCallback = function () {
      this.callback = function () {

    }
    };

//event listener for press key
//add keycode to input array
    InputHandler.prototype.keyPressed = function (event) {
      //accepy only input code that is not in array already
      if (this.inputArray.indexOf(event.keyCode) == -1) {// && isInputValid(event.keyCode)) {
        this.inputArray.push(event.keyCode);
        this.callback(this.inputArray.slice());
      }
      // console.log('input: ' + event.keyCode);
    };

    InputHandler.prototype.keyReleased = function (event) {
      var index = this.inputArray.indexOf(event.keyCode);
      if (index > -1) {
        this.inputArray.splice(index, 1);
        this.callback(this.inputArray.slice());
      }
      //console.log('input: ' + this.inputArray);
    };

    InputHandler.prototype.clearInput = function () {
      this.inputArray.splice(0, this.inputArray.length);
      this.callback([]);
    };

    module.exports = InputHandler;
  }, {}]
}, {}, [108]);
