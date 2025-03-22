<div class="wrapper">

    <div class="left-panel">
        <Guide text={courseContent.description} />
    </div>

    <div class="main-panel">
        <CodeInput
                bind:pythonOutput={pythonOutput}
                bind:getSelectedCode={getSelectedCode}
                bind:runCode={runCode}
                bind:isRunning={isRunning}
        />
        <div class="console-wrapper">
            <Console bind:pythonOutput={pythonOutput} />
        </div>
    </div>

    <div class="right-panel">
        <RunPanel runCode={runCode} isRunning={isRunning} />
        <Assistant getSelectedCode={getSelectedCode} getUserCode={getUserCode} />
    </div>

</div>


<script lang="ts">
    import CodeInput from '$lib/components/editor/code_input.svelte'
    import Console from '$lib/components/editor/console.svelte'
    import Assistant from '$lib/components/editor/assistant.svelte'
    import RunPanel from '$lib/components/editor/run_panel.svelte'
    import Guide from '$lib/components/editor/guide.svelte'

    let { courseContent }: { courseContent: CourseContent } = $props()

    let pythonOutput = $state<{message: string, type: 'stdout' | 'stderr'}[]>([])

    let getSelectedCode = $state<() => string>( () => '' )
    let runCode = $state<() => void>( () => {} )
    let isRunning = $state<boolean>(false)

    function getUserCode() {
        return 'not implemented...'
    }

</script>


<style>

    .wrapper {
        display: flex;
        width: 100%;
        height: 100vh;
        max-height: 100%;
    }

    .left-panel {
        width: 50%;
        max-width: 500px;
        height: 100%;
    }

    .main-panel {
        display: flex;
        flex-direction: column;
        align-items: start;

        width: 100%;
        height: 100%;
    }

    .right-panel {
        width: 40%;
        max-width: 400px;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .console-wrapper {
        width: 100%;
        height: 40%;
    }

</style>
