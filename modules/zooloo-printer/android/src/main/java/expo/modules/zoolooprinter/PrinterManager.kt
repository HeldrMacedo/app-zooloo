package expo.modules.zoolooprinter

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothSocket
import java.io.IOException
import java.io.OutputStream
import java.util.UUID

class PrinterManager {
    private val bluetoothAdapter: BluetoothAdapter? = BluetoothAdapter.getDefaultAdapter()
    private var bluetoothSocket: BluetoothSocket? = null
    private var outputStream: OutputStream? = null

    // Standard SPP UUID
    private val SPP_UUID: UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB")

    @SuppressLint("MissingPermission")
    fun getPairedDevices(): List<Map<String, String>> {
        val pairedDevices = bluetoothAdapter?.bondedDevices
        val deviceList = mutableListOf<Map<String, String>>()
        pairedDevices?.forEach { device ->
            deviceList.add(mapOf(
                "name" to (device.name ?: "Unknown"),
                "macAddress" to device.address
            ))
        }
        return deviceList
    }

    @SuppressLint("MissingPermission")
    fun connect(macAddress: String): Boolean {
        try {
            if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled) {
                return false
            }

            val device: BluetoothDevice = bluetoothAdapter.getRemoteDevice(macAddress)
            bluetoothSocket = device.createInsecureRfcommSocketToServiceRecord(SPP_UUID)
            bluetoothAdapter.cancelDiscovery() // cancel discovery to speed up connection
            bluetoothSocket?.connect()
            outputStream = bluetoothSocket?.outputStream
            return true
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
            return false
        }
    }

    fun printText(text: String): Boolean {
        return try {
            if (outputStream == null) return false
            outputStream?.write(text.toByteArray(Charsets.UTF_8))
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
}
