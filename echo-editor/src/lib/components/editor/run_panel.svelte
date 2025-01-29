<div class="wrapper">

    <h2>Code</h2>

    <button class="button button-primary" onclick={() => runCode()} disabled={isRunning}>
        {#if !isRunning}
            <img src="/images/editor/play-icon.svg" alt="Ausführen"> Code Ausführen
        {:else}
            <LoadingIndicator />
        {/if}
    </button>

    <!-- TODO: Checks -->

</div>


<script lang="ts">
    import LoadingIndicator from "$lib/components/loading_indicator.svelte";

    let {
        runCode,
        isRunning,
    } = $props()

</script>



<style>

    .wrapper {
        width: 100%;
        border-left: 1px solid var(--divider);
        border-bottom: 1px solid var(--divider);
        padding: 20px;
    }

    h2 {
        font-size: 16px;
        text-align: center;
        margin-bottom: 8px;
    }


</style>
