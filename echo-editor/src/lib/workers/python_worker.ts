// @ts-ignore
import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.mjs";

let pyodideReadyPromise = loadPyodide()
console.warn('loading python...')

pyodideReadyPromise.then(() => {
    self.postMessage({ status: 'ready', data: 'python interpreter is initialized' }) // Notify main thread when ready
})

self.onmessage = async (event) => {
    const pyodide: any = await pyodideReadyPromise
    redirectOutput(pyodide)

    const { id, code } = event.data

    try {
        const result = await pyodide.runPythonAsync(code)
        const message: PythonOutput = { status: 'done', data: result, id }
        self.postMessage(message)
    } catch (error: any) {
        const message: PythonOutput = { status: 'error', data: error.message, id }
        self.postMessage(message)
    }
}

function redirectOutput(pyodide: any) {
    const decoder = new TextDecoder('utf-8')

    pyodide.setStdout({
        write: (buffer: any) => {
            const text = decoder.decode(buffer)
            const message: PythonOutput = { status: 'output', type: 'stdout', data: text }
            self.postMessage(message)
            return buffer.length
        },
    });

    pyodide.setStderr({
        write: (buffer: any) => {
            const text = decoder.decode(buffer)
            const message: PythonOutput = { status: 'output', type: 'stderr', data: text }
            self.postMessage(message)
            return buffer.length
        },
    });
}
