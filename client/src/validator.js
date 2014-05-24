/**
 * Validator inspired from https://github.com/BKcore/Shdr/blob/master/sources/shdr/Validator.js
 * MIT License - Copyright (c) 2013 Thibaut Despoulain (BKcore)
 *
 * extended for using with glsl-parser (which is in some cases more restrictive)
 */

var GlslTransition = require("glsl-transition"); // glsl-parser under the hood

function Validator (canvas) {
  this.canvas = canvas;
  if (!this.canvas) {
    this.canvas = document.createElement('canvas');
  }
  this.Transition = GlslTransition(this.canvas);
}

Validator.prototype.validate = function(source) {
  var details, error, i, lineStr, line, lines, log, message, shader, status, _i, _len;
  var context = this.Transition.getGL();
  if (!source) {
    return [true, null, null];
  }
  try {
    shader = context.createShader(context.FRAGMENT_SHADER);
    context.shaderSource(shader, source);
    context.compileShader(shader);
    status = context.getShaderParameter(shader, context.COMPILE_STATUS);
    if (!status) {
      log = context.getShaderInfoLog(shader);
    }
    context.deleteShader(shader);
  } catch (e) {
    return [false, 0, e.getMessage];
  }
  if (status === true) {
    try {
      this.Transition(source).destroy();
    }
    catch (e) {
      // Parse a glsl-parser error
      var msg = ''+(e.message || e);
      var r = msg.split(' at line ');
      if (r.length === 2) {
        var line = parseInt(r[1], 10); // FIXME the line seems to not take comment/#preprocessor into account
        return [false, line, r[0]];
      }
      else return [false, 0, msg];
    }
    return [true, null, null];
  } else {
    lines = log.split('\n');
    for (_i = 0, _len = lines.length; _i < _len; _i++) {
      i = lines[_i];
      if (i.substr(0, 5) === 'ERROR') {
        error = i;
      }
    }
    if (!error) {
      return [false, 0, 'Unable to parse error.'];
    }
    details = error.split(':');
    if (details.length < 4) {
      return [false, 0, error];
    }
    lineStr = details[2];
    line = parseInt(lineStr, 10);
    if (isNaN(line)) line = 0;
    message = details.splice(3).join(':');
    return [false, line, message];
  }
};

module.exports = Validator;
