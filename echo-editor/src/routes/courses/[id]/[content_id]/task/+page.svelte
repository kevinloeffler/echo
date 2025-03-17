
<h1>Aufgabe</h1>
<p>id: {data.id}</p>
<p>content id: {data.contentId}</p>

<button class="preview-button" onclick={() => showPreview = !showPreview}>
    {#if showPreview}
        Editor anzeigen
    {:else}
        Vorschau anzeigen
    {/if}
</button>

{#if !showPreview}
    <textarea bind:value={value} name="task" class="editor"></textarea>
{:else}
    <div class="preview" bind:this={previewElement}>
    </div>
{/if}


<script lang="ts">
    import {marked} from 'marked'

    const { data } = $props()

    let value = $state('hello world')
    let showPreview = $state(false)
    let previewElement = $state<HTMLDivElement>()

    $effect(() => {
        renderMarkdown(value)
    })

    async function renderMarkdown(text: string) {
        if (!showPreview || !previewElement) return  // avoid unnecessary renders
        previewElement.innerHTML = await marked.parse(text)
    }

</script>


<style>

    .editor {
        width: 100%;
        max-width: 100%;
        min-height: 200px;
        color: var(--text);
        background-color: var(--editor);
    }

    :global {
        .preview > h1 {
            color: red;
        }
    }

</style>
