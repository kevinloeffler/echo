<svelte:window use:handleShortcuts={[
    { shortcut: Shortcuts.opt_r, action: handleReloadShortcut },
]}/>


<div class="wrapper">
    <!-- TODO: Tabbar -->
    <div class="code-wrapper">
        <CodeMirror bind:value={userCode} lang={python()} theme={oneDark}
                    tabSize={2}
                    extensions={[
                    autocompletion({ override: [basicPythonCompletionSource] }),
                    nameErrorExtension,
                ]}
                    styles={{
                    "&": {
                        width: "100%",
                        height: "100%",
                        backgroundColor: "#23272F",
                    },
                }}
                    on:ready={(e) => view = e.detail}
        />
    </div>
</div>


<script lang="ts">
    import {onMount} from 'svelte'

    import CodeMirror from "svelte-codemirror-editor";
    import { python } from "@codemirror/lang-python";
    import { oneDark } from "@codemirror/theme-one-dark";
    import { autocompletion } from '@codemirror/autocomplete';
    import { basicPythonCompletionSource } from '$lib/services/automcomplete'
    import { handleShortcuts, Shortcuts } from '$lib/services/shortcuts'
    import {parseError, prettyError} from '$lib/services/python_errors'
    import type { EditorView } from '@codemirror/view'
    import {type CodeError, nameErrorExtension, setNameErrors} from '$lib/services/code_mirror_components'

    /*** Props ***/

    let {
        pythonOutput = $bindable(),
        getSelectedCode = $bindable(),
        runCode = $bindable(),
        isRunning = $bindable(),
    } = $props()

    runCode = () => run()

    /*** Editor ***/

    let view: EditorView
    let userCode = $state('')

    getSelectedCode = () => {
        const { from, to } = view.state.selection.main
        return view.state.doc.sliceString(from, to)
    }

    /*** Handle Errors ***/

    let errors = $state<CodeError[]>([])
    $effect( () => { setNameErrors(view, errors) })

    /*** Keyboard Shortcuts ***/

    function handleReloadShortcut() {
        run()
    }

    /*** Python ***/

    let worker: Optional<Worker>
    let pythonIsReady = $state(false)

    function run() {
        if (!worker || !pythonIsReady || isRunning) {
            console.error('Python Worker not ready or already running')
            return
        }
        // reset state
        pythonOutput = []
        errors = []
        isRunning = true
        // execute code
        const id = Date.now()
        worker.postMessage({ type: 'code', id, code: userCode })
    }

    const syncBuffer = new SharedArrayBuffer(4)
    const dataBuffer = new SharedArrayBuffer(2048)  // 1024 UTF-16 characters

    const syncArray = new Int32Array(syncBuffer)
    const dataArray = new Int32Array(dataBuffer)


    onMount(() => {
        worker = new Worker(new URL('$lib/workers/python_worker.ts', import.meta.url), { type: 'module' })

        worker.onmessage = (event: MessageEvent<PythonOutput>) => {
            const message = event.data as PythonOutput

            if (message.status === 'ready') {
                pythonIsReady = true
                worker!.postMessage({ type: 'sync', syncBuffer: syncBuffer})
                worker!.postMessage({ type: 'data', dataBuffer: dataBuffer})

            } else if (message.status === 'done') {
                console.log('PYTHON: execution finished')
                isRunning = false
            } else if (message.status === 'output') {

                if (message.type === 'stdout') {
                    pythonOutput.push({ message: message.data, type: 'stdout' })
                } else {
                    pythonOutput.push({ message: message.data, type: 'stderr' })
                }

            } else if (message.status === 'error') {
                const error = parseError(message.data)
                //@ts-ignore
                errors.push(error)
                pythonOutput.push({ message: prettyError(error), type: 'stderr' })
                isRunning = false
            } else if (message.status === 'get_input') {
                dataArray.fill(0)  // clear buffer

                const userInput = prompt(message.data) || ''
                const encoder = new TextEncoder()
                const encodedText = encoder.encode(userInput)
                dataArray.set(encodedText, 0)

                Atomics.store(syncArray, 0, 1)
                Atomics.notify(syncArray, 0)

                // reset the sync array
                Atomics.store(syncArray, 0, 0)
                Atomics.notify(syncArray, 0)
            }
        }

        worker.onerror = (error) => {
            console.error('Worker error:', error)
        }

        return () => {
            worker?.terminate()
        }
    })

</script>


<style>

    .wrapper {
        border-left: 1px solid var(--divider);
        border-bottom: 1px solid var(--divider);
        border-right: 1px solid var(--divider);
        width: 100%;
        height: 80vh;
        flex-grow: 1;
        overflow: auto;
    }

    .code-wrapper {
        padding-right: 20px;
        background-color: var(--editor);
    }

</style>
