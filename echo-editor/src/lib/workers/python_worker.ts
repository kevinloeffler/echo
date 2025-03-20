import {PUBLIC_API_URL_CLIENTSIDE} from '$env/static/public'

const pyodidePath = `${PUBLIC_API_URL_CLIENTSIDE}/static/pyodide/pyodide.mjs`
const pyodideModule = await import(`${pyodidePath}` /* @vite-ignore */)
let pyodideReadyPromise = pyodideModule.loadPyodide()

pyodideReadyPromise.then(() => {
    self.postMessage({ status: 'ready', data: 'python interpreter is initialized' }) // Notify main thread when ready
    console.log('Python ready')
})

/////////////////////////

let syncArray: Int32Array
let dataArray: Int32Array

self.onmessage = (event) => {
    console.log('event:', event)
}

self.onmessage = async (event) => {
    const pyodide: any = await pyodideReadyPromise

    redirectInput(pyodide)
    redirectOutput(pyodide)

    if (event.data.type === 'sync') {
        syncArray = new Int32Array(event.data.syncBuffer)

    } else if (event.data.type === 'data') {
        dataArray = new Int32Array(event.data.dataBuffer)

    } else if (event.data.type === 'code') {

        const { id, code } = event.data

        try {
            // await pyodide.loadPackagesFromImports(code) DOES NOT WORK BECAUSE IT IS NOT DOWNLOADED ON THE SERVERS PUBLIC DIRECTORY
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
