/**
 * Proxy functions to raise exceptions.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
function isNumber(x) {
  return typeof x == "number";
}
const NO_PARAM = "???"

function ArgumentNullException(name) {
  throw new Error("The parameter cannot be null: " + (name || NO_PARAM))
}

function ArgumentException(details) {
  throw new Error("Invalid argument: " + (details || NO_PARAM))
}

function TypeException(name, expectedType) {
  throw new Error("Expected parameter: " + (name || NO_PARAM) + " of type: " + (type || NO_PARAM))
}

function OperationException(desc) {
  throw new Error("Invalid operation: " + desc);
}

function OutOfRangeException(name, min, max) {
  var message = "Out of range. Expected parameter: " + (name || NO_PARAM)
  if (!isNumber(max) && min === 0) {
    message = " to be positive.";
  } else {
    if (isNumber(min))
      message = " >=" + min;
    if (isNumber(max))
      message = " <=" + max;
  }
  throw new Error(message)
}

export {
  ArgumentException,
  ArgumentNullException,
  TypeException,
  OutOfRangeException,
  OperationException
}
