/**
 * Text slider.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../../scripts/utils"
import {
 ArgumentException,
 ArgumentNullException
} from "../../scripts/exceptions"

class TextSlider {

  constructor(text, filler) {
    if (!text) ArgumentNullException("text");
    this.length = text.length
    this.i = 0
    this.j = this.length
    this.text = text
    this.filler = filler || " "
    this.right = true
  }

  /**
   * Resets this TextSlider at its initial statte.
   */
  reset() {
    this.i = 0
    this.j = this.length
    this.right = true
  }

  next() {
   var self = this,
       s = self.text,
       filler = self.filler,
       length = self.length,
       i = self.i,
       j = self.j,
       right = self.right;
   var a = s.substr(i, j);
   var change = false;
   if (right) {
     if (j == 1) {
       j = s.length;
       i = j;
       change = true;
     } else {
       j--;
     }
   } else {
     if (i == 0) {
       j--;
       change = true;
     } else {
       i--;
     }
   }

   if (right && s.length != a.length) {
     a = new Array(s.length - a.length + 1).join(filler) + a;
   } else {
     a = a + new Array(s.length - a.length + 1).join(filler);
   }
   if (change) {
     right = !right;
     self.right = right;
   }
   self.i = i;
   self.j = j;
   return a;
  }
}

export { TextSlider }
