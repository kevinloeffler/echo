// @ts-ignore
import {loadPyodide} from 'https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.mjs'

let pyodideReadyPromise = loadPyodide()

pyodideReadyPromise.then(() => {
    self.postMessage({ status: 'ready', data: 'python interpreter is initialized' }) // Notify main thread when ready
})

/////////////////////////

let syncArray: Int32Array
let dataArray: Int32Array

self.onmessage = async (event) => {
    const pyodide: any = await pyodideReadyPromise

    redirectInput(pyodide)
    redirectOutput(pyodide)

    if (event.data.type === 'sync') {
        syncArray = new Int32Array(event.data.syncBuffer)
        console.log('loaded sync buffer', syncArray)

    } else if (event.data.type === 'data') {
        dataArray = new Int32Array(event.data.dataBuffer)
        console.log('loaded data buffer', dataArray)

    } else if (event.data.type === 'code') {

        const { id, code } = event.data

        try {
            const result = await pyodide.runPythonAsync(code)
            self.postMessage({ status: 'done', data: result, id })
        } catch (error: any) {
            self.postMessage({ status: 'error', data: error.message, id })
        }

    }
}

function redirectOutput(pyodide: any) {
    const decoder = new TextDecoder('utf-8')

    pyodide.setStdout({
        write: (buffer: any) => {
            const text = decoder.decode(buffer)
            self.postMessage({ status: 'output', type: 'stdout', data: text })
            return buffer.length
        },
    })

    pyodide.setStderr({
        write: (buffer: any) => {
            const text = decoder.decode(buffer)
            self.postMessage({ status: 'output', type: 'stderr', data: text })
            return buffer.length
        },
    })
}


function getUserInput() {
    self.postMessage({ status: 'get_input', message: 'input:' })
    // wait
    Atomics.wait(syncArray, 0, 0)
    const decoder = new TextDecoder()
    return decoder.decode(dataArray)
}


function redirectInput(pyodide: any) {
    pyodide.setStdin({
        stdin: () => {
            return getUserInput()
        }
    })
}
