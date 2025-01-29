<div class="wrapper">
    <div class="header">
        <h2>Konsole</h2>
        <img src="/images/editor/panel-bottom.svg" alt="Schliessen" class="close-icon">
    </div>
    <div class="content">
        {#each pythonOutput as output}
            <p class="console-line" class:console-error={output.type === 'stderr'}>
                <span class="delimiter">>&nbsp;</span>{output.message}
            </p>
        {/each}
    </div>

</div>



<script lang="ts">

    let { pythonOutput = $bindable() } = $props()

</script>


<style>

    .wrapper {
        background-color: var(--background);
        border-left: 1px solid var(--divider);
        border-top: 1px solid var(--divider);
        border-right: 1px solid var(--divider);
        padding: 8px;
        width: 100%;
        height: 100%;
    }

    .header {
        display: flex;
        justify-content: space-between;
    }

    h2 {
        font-size: 12px;
    }

    .close-icon {
        width: 16px;
    }

    .content {
        height: 20vh;
        border-top: 2px solid var(--divider);
        margin-top: 4px;
    }

    .console-error {
        color: #DE5667;
    }

</style>