package expo.modules.zoolooprinter

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothSocket
import java.io.IOException
import java.io.OutputStream
import java.nio.charset.Charset
import java.util.UUID

class PrinterManager {
    private val bluetoothAdapter: BluetoothAdapter? = BluetoothAdapter.getDefaultAdapter()
    private var bluetoothSocket: BluetoothSocket? = null
    private var outputStream: OutputStream? = null

    // Standard SPP UUID
    private val SPP_UUID: UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")

    private val textCharset: Charset =
        try {
            Charset.forName("ISO-8859-1")
        } catch (_: Exception) {
            Charsets.UTF_8
        }

    @SuppressLint("MissingPermission")
    fun getPairedDevices(): List<Map<String, String>> {
        val pairedDevices = bluetoothAdapter?.bondedDevices
        val deviceList = mutableListOf<Map<String, String>>()
        pairedDevices?.forEach { device ->
            deviceList.add(
                mapOf(
                    "name" to (device.name ?: "Unknown"),
                    "macAddress" to device.address
                )
            )
        }
        return deviceList
    }

    fun isConnected(): Boolean {
        return bluetoothSocket?.isConnected == true && outputStream != null
    }

    @SuppressLint("MissingPermission")
    fun connect(macAddress: String): Boolean {
        // Always release previous socket before opening a new one
        disconnect()

        try {
            if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled) {
                return false
            }

            val device: BluetoothDevice = bluetoothAdapter.getRemoteDevice(macAddress)
            bluetoothSocket = device.createInsecureRfcommSocketToServiceRecord(SPP_UUID)
            bluetoothAdapter.cancelDiscovery()
            bluetoothSocket?.connect()
            outputStream = bluetoothSocket?.outputStream
            return isConnected()
        } catch (e: Exception) {
            e.printStackTrace()
            disconnect()
            return false
        }
    }

    fun disconnect(): Boolean {
        try {
            outputStream?.close()
            bluetoothSocket?.close()
            outputStream = null
            bluetoothSocket = null
            return true
        } catch (e: Exception) {
            e.printStackTrace()
            outputStream = null
            bluetoothSocket = null
            return false
        }
    }

    fun printText(text: String): Boolean {
        return try {
            if (outputStream == null) return false
            outputStream?.write(text.toByteArray(textCharset))
            outputStream?.flush()
            true
        } catch (e: IOException) {
            e.printStackTrace()
            false
        }
    }

    fun printCommand(command: ByteArray): Boolean {
        return try {
            if (outputStream == null) return false
            outputStream?.write(command)
            outputStream?.flush()
            true
        } catch (e: IOException) {
            e.printStackTrace()
            false
        }
    }

    /**
     * Imprime várias linhas em um único fluxo: ESC @ + texto + feed + cut best-effort.
     */
    fun printLines(lines: List<String>): Boolean {
        if (outputStream == null) return false
        // ESC/POS initialize
        if (!printCommand(byteArrayOf(0x1B, 0x40))) return false

        val body = lines.joinToString(separator = "\n", postfix = "\n\n\n")
        if (!printText(body)) return false

        // GS V 0 — partial cut (best-effort; many printers ignore unsupported cut)
        printCommand(byteArrayOf(0x1D, 0x56, 0x00))
        return true
    }

    /**
     * Impressora embutida CloudPOS.
     * Stub: false até integrar SDK oficial do fabricante (sem SO/classes decompilados).
     * Ver docs/superpowers/specs/2026-08-04-cloudpos-printer.md
     */
    fun isInternalPrinterAvailable(): Boolean = false

    /**
     * Impressão na embutida. Stub até SDK oficial.
     */
    fun printInternal(lines: List<String>): Boolean = false
}
