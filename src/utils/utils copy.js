/* eslint-disable no-irregular-whitespace */
var utils = ({
  each: function (obj, iterator, context) {
    if (obj == null) return;
    if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === false) return false;
      }
    } else {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (iterator.call(context, obj[key], key, obj) === false)
            return false;
        }
      }
    }
  },
  bind: function (fn, context) {
    return function () {
      return fn.apply(context, arguments);
    };
  },
  indexOf: function (array, item, start) {
    var index = -1;
    start = this.isNumber(start) ? start : 0;
    this.each(array, function (v, i) {
      if (i >= start && v === item) {
        index = i;
        return false;
      }
    });
    return index;
  },
  trim: function (str) {
    return str.replace(/(^[ \t\n\r]+)|([ \t\n\r]+$)/g, "");
  },
  listToMap: function (list) {
    if (!list) return {};
    list = utils.isArray(list) ? list : list.split(",");
    for (var i = 0, ci, obj = {}; (ci = list[i++]);) {
      obj[ci.toUpperCase()] = obj[ci] = 1;
    }
    return obj;
  },
  cssStyleToDomStyle: (function () {
    var test = document.createElement("div").style,
      cache = {
        float: test.cssFloat != undefined
          ? "cssFloat"
          : test.styleFloat != undefined ? "styleFloat" : "float"
      };

    return function (cssName) {
      return (
        cache[cssName] ||
        (cache[cssName] = cssName.toLowerCase().replace(/-./g, function (match) {
          return match.charAt(1).toUpperCase();
        }))
      );
    };
  })(),

  /**
     * ærgbæ ¼å¼çé¢è²å¼è½¬æ¢æ16è¿å¶æ ¼å¼
     * @method fixColor
     * @param { String } rgbæ ¼å¼çé¢è²å¼
     * @param { String }
     * @example
     * rgb(255,255,255)  => "#ffffff"
     */
  fixColor: function (name, value) {
    if (/color/i.test(name) && /rgba?/.test(value)) {
      var array = value.split(",");
      if (array.length > 3) return "";
      value = "#";
      for (var i = 0, color; (color = array[i++]);) {
        color = parseInt(color.replace(/[^\d]/gi, ""), 10).toString(16);
        value += color.length == 1 ? "0" + color : color;
      }
      value = value.toUpperCase();
    }
    return value;
  },
  transUnitToPx: function (val) {
    if (!/(pt|cm)/.test(val)) {
      return val;
    }
    var unit;
    val.replace(/([\d.]+)(\w+)/, function (str, v, u) {
      val = v;
      unit = u;
    });
    switch (unit) {
      case "cm":
        val = parseFloat(val) * 25;
        break;
      case "pt":
        val = Math.round(parseFloat(val) * 96 / 72);
    }
    return val + (val ? "px" : "");
  },
});


utils.each(
  ["String", "Function", "Array", "Number", "RegExp", "Object", "Date"],
  function (v) {
    utils["is" + v] = function (obj) {
      return Object.prototype.toString.apply(obj) == "[object " + v + "]";
    };
  }
);

export default utils;
