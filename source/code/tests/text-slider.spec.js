/**
 * Tests for TextSlider class.
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import _ from "../scripts/utils";
import { TextSlider } from "../scripts/literature/text-slider";

describe("TextSlider classs", () => {
  it("must allow to slide text (dots)", () => {
    var a = new TextSlider("......")
    expect(a.next()).toEqual("......");
    expect(a.next()).toEqual(" .....");
    expect(a.next()).toEqual("  ....");
    expect(a.next()).toEqual("   ...");
    expect(a.next()).toEqual("    ..");
    expect(a.next()).toEqual("     .");
    expect(a.next()).toEqual("      ");
    expect(a.next()).toEqual(".     ");
    expect(a.next()).toEqual("..    ");
    expect(a.next()).toEqual("...   ");
    expect(a.next()).toEqual("....  ");
    expect(a.next()).toEqual("..... ");
    expect(a.next()).toEqual("......");
    expect(a.next()).toEqual(" .....");
    expect(a.next()).toEqual("  ....");
    expect(a.next()).toEqual("   ...");
    expect(a.next()).toEqual("    ..");
    expect(a.next()).toEqual("     .");
    expect(a.next()).toEqual("      ");
    expect(a.next()).toEqual(".     ");
    expect(a.next()).toEqual("..    ");
    expect(a.next()).toEqual("...   ");
    expect(a.next()).toEqual("....  ");
    expect(a.next()).toEqual("..... ");
    expect(a.next()).toEqual("......");
    expect(a.next()).toEqual(" .....");
    expect(a.next()).toEqual("  ....");
    expect(a.next()).toEqual("   ...");
    expect(a.next()).toEqual("    ..");
    expect(a.next()).toEqual("     .");
    expect(a.next()).toEqual("      ");
    expect(a.next()).toEqual(".     ");
    expect(a.next()).toEqual("..    ");
    expect(a.next()).toEqual("...   ");
    expect(a.next()).toEqual("....  ");
    expect(a.next()).toEqual("..... ");
    expect(a.next()).toEqual("......");
    expect(a.next()).toEqual(" .....");
    expect(a.next()).toEqual("  ....");
    expect(a.next()).toEqual("   ...");
    expect(a.next()).toEqual("    ..");
    expect(a.next()).toEqual("     .");
    expect(a.next()).toEqual("      ");
    expect(a.next()).toEqual(".     ");
    expect(a.next()).toEqual("..    ");
    expect(a.next()).toEqual("...   ");
    expect(a.next()).toEqual("....  ");
    expect(a.next()).toEqual("..... ");
    expect(a.next()).toEqual("......");
    expect(a.next()).toEqual(" .....");
  })

  it("must allow to slide texts (words)", () => {
    var a = new TextSlider("Loading")
    expect(a.next()).toEqual("Loading");
    expect(a.next()).toEqual(" Loadin");
    expect(a.next()).toEqual("  Loadi");
    expect(a.next()).toEqual("   Load");
    expect(a.next()).toEqual("    Loa");
    expect(a.next()).toEqual("     Lo");
    expect(a.next()).toEqual("      L");
    expect(a.next()).toEqual("       ");
    expect(a.next()).toEqual("g      ");
    expect(a.next()).toEqual("ng     ");
    expect(a.next()).toEqual("ing    ");
    expect(a.next()).toEqual("ding   ");
    expect(a.next()).toEqual("ading  ");
    expect(a.next()).toEqual("oading ");
    expect(a.next()).toEqual("Loading");
    expect(a.next()).toEqual(" Loadin");
    expect(a.next()).toEqual("  Loadi");
    expect(a.next()).toEqual("   Load");
    expect(a.next()).toEqual("    Loa");
    expect(a.next()).toEqual("     Lo");
    expect(a.next()).toEqual("      L");
    expect(a.next()).toEqual("       ");
    expect(a.next()).toEqual("g      ");
    expect(a.next()).toEqual("ng     ");
    expect(a.next()).toEqual("ing    ");
    expect(a.next()).toEqual("ding   ");
    expect(a.next()).toEqual("ading  ");
    expect(a.next()).toEqual("oading ");
    expect(a.next()).toEqual("Loading");
    expect(a.next()).toEqual(" Loadin");
    expect(a.next()).toEqual("  Loadi");
    expect(a.next()).toEqual("   Load");
    expect(a.next()).toEqual("    Loa");
    expect(a.next()).toEqual("     Lo");
    expect(a.next()).toEqual("      L");
    expect(a.next()).toEqual("       ");
    expect(a.next()).toEqual("g      ");
    expect(a.next()).toEqual("ng     ");
    expect(a.next()).toEqual("ing    ");
    expect(a.next()).toEqual("ding   ");
    expect(a.next()).toEqual("ading  ");
    expect(a.next()).toEqual("oading ");
    expect(a.next()).toEqual("Loading");
    expect(a.next()).toEqual(" Loadin");
    expect(a.next()).toEqual("  Loadi");
    expect(a.next()).toEqual("   Load");
    expect(a.next()).toEqual("    Loa");
    expect(a.next()).toEqual("     Lo");
    expect(a.next()).toEqual("      L");
    expect(a.next()).toEqual("       ");
  })

  it("must allow to slide texts with spaces (words)", () => {
    var a = new TextSlider("   Loading   ")
    expect(a.next()).toEqual("   Loading   ");
    expect(a.next()).toEqual("    Loading  ");
    expect(a.next()).toEqual("     Loading ");
    expect(a.next()).toEqual("      Loading");
    expect(a.next()).toEqual("       Loadin");
    expect(a.next()).toEqual("        Loadi");
    expect(a.next()).toEqual("         Load");
    expect(a.next()).toEqual("          Loa");
    expect(a.next()).toEqual("           Lo");
    expect(a.next()).toEqual("            L");
    expect(a.next()).toEqual("             ");
    expect(a.next()).toEqual("             ");
    expect(a.next()).toEqual("             ");
    expect(a.next()).toEqual("             ");
    expect(a.next()).toEqual("             ");
    expect(a.next()).toEqual("             ");
    expect(a.next()).toEqual("             ");
    expect(a.next()).toEqual("g            ");
    expect(a.next()).toEqual("ng           ");
    expect(a.next()).toEqual("ing          ");
    expect(a.next()).toEqual("ding         ");
    expect(a.next()).toEqual("ading        ");
    expect(a.next()).toEqual("oading       ");
    expect(a.next()).toEqual("Loading      ");
    expect(a.next()).toEqual(" Loading     ");
    expect(a.next()).toEqual("  Loading    ");
    expect(a.next()).toEqual("   Loading   ");
    expect(a.next()).toEqual("    Loading  ");
    expect(a.next()).toEqual("     Loading ");
    expect(a.next()).toEqual("      Loading");
    expect(a.next()).toEqual("       Loadin");
    expect(a.next()).toEqual("        Loadi");
    expect(a.next()).toEqual("         Load");
    expect(a.next()).toEqual("          Loa");
    expect(a.next()).toEqual("           Lo");
    expect(a.next()).toEqual("            L");
    expect(a.next()).toEqual("             ");
    expect(a.next()).toEqual("             ");
    expect(a.next()).toEqual("             ");
    expect(a.next()).toEqual("             ");
    expect(a.next()).toEqual("             ");
    expect(a.next()).toEqual("             ");
    expect(a.next()).toEqual("             ");
    expect(a.next()).toEqual("g            ");
    expect(a.next()).toEqual("ng           ");
    expect(a.next()).toEqual("ing          ");
    expect(a.next()).toEqual("ding         ");
    expect(a.next()).toEqual("ading        ");
    expect(a.next()).toEqual("oading       ");
    expect(a.next()).toEqual("Loading      ");
  })

  it("must allow to slide texts with custom filler", () => {
    var a = new TextSlider("Loading", "*")
    expect(a.next()).toEqual("Loading");
    expect(a.next()).toEqual("*Loadin");
    expect(a.next()).toEqual("**Loadi");
    expect(a.next()).toEqual("***Load");
    expect(a.next()).toEqual("****Loa");
    expect(a.next()).toEqual("*****Lo");
    expect(a.next()).toEqual("******L");
    expect(a.next()).toEqual("*******");
    expect(a.next()).toEqual("g******");
    expect(a.next()).toEqual("ng*****");
    expect(a.next()).toEqual("ing****");
    expect(a.next()).toEqual("ding***");
    expect(a.next()).toEqual("ading**");
    expect(a.next()).toEqual("oading*");
    expect(a.next()).toEqual("Loading");
    expect(a.next()).toEqual("*Loadin");
    expect(a.next()).toEqual("**Loadi");
    expect(a.next()).toEqual("***Load");
    expect(a.next()).toEqual("****Loa");
    expect(a.next()).toEqual("*****Lo");
    expect(a.next()).toEqual("******L");
    expect(a.next()).toEqual("*******");
    expect(a.next()).toEqual("g******");
    expect(a.next()).toEqual("ng*****");
    expect(a.next()).toEqual("ing****");
    expect(a.next()).toEqual("ding***");
    expect(a.next()).toEqual("ading**");
    expect(a.next()).toEqual("oading*");
    expect(a.next()).toEqual("Loading");
    expect(a.next()).toEqual("*Loadin");
    expect(a.next()).toEqual("**Loadi");
    expect(a.next()).toEqual("***Load");
    expect(a.next()).toEqual("****Loa");
    expect(a.next()).toEqual("*****Lo");
    expect(a.next()).toEqual("******L");
    expect(a.next()).toEqual("*******");
    expect(a.next()).toEqual("g******");
    expect(a.next()).toEqual("ng*****");
    expect(a.next()).toEqual("ing****");
    expect(a.next()).toEqual("ding***");
    expect(a.next()).toEqual("ading**");
    expect(a.next()).toEqual("oading*");
    expect(a.next()).toEqual("Loading");
    expect(a.next()).toEqual("*Loadin");
    expect(a.next()).toEqual("**Loadi");
    expect(a.next()).toEqual("***Load");
    expect(a.next()).toEqual("****Loa");
    expect(a.next()).toEqual("*****Lo");
    expect(a.next()).toEqual("******L");
    expect(a.next()).toEqual("*******");
  })

  it("must allow to reset the slider at its initial state", () => {
    var a = new TextSlider("Loading")
    expect(a.next()).toEqual("Loading");
    expect(a.next()).toEqual(" Loadin");
    expect(a.next()).toEqual("  Loadi");

    a.reset()
    expect(a.next()).toEqual("Loading");
    expect(a.next()).toEqual(" Loadin");
    expect(a.next()).toEqual("  Loadi");
  })

  /*
  // To debug..
  _.exec(() => {
    console.log(`expect(a.next()).toEqual("${a.next()}");`);
  }, 50);
  */
})
