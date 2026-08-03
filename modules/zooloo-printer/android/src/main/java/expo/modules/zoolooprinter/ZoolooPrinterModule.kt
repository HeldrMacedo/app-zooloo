package expo.modules.zoolooprinter

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ZoolooPrinterModule : Module() {
  private val printerManager = PrinterManager()

  override fun definition() = ModuleDefinition {
    Name("ZoolooPrinter")

    AsyncFunction("getPairedDevices") { ->
      printerManager.getPairedDevices()
    }

    AsyncFunction("connect") { macAddress: String ->
      printerManager.connect(macAddress)
    }

    AsyncFunction("disconnect") { ->
      printerManager.disconnect()
    }

    AsyncFunction("printText") { text: String ->
      printerManager.printText(text)
    }
    
    // Commands in ESC/POS can be passed as an array of numbers
    AsyncFunction("printCommand") { command: List<Int> ->
      val bytes = command.map { it.toByte() }.toByteArray()
      printerManager.printCommand(bytes)
    }
  }
}
