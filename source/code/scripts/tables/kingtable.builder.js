/**
 * KingTable base builder class.
 * Base class for all builders.
 *
 * https://github.com/RobertoPrevato/KingTable
 *
 * Copyright 2017, Roberto Prevato
 * https://robertoprevato.github.io
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
import EventsEmitter from "../../scripts/components/events"
import KingTable from "../../scripts/tables/kingtable"

export default class KingTableBuilder extends EventsEmitter {

  constructor(table) {
    super()
    this.table = table;
  }

  /**
   * Returns the translations for the current language configuration.
   */
  getReg() {
    var table = this.table;
    return table ? table.getReg() : KingTable.regional.en;
  }
}
