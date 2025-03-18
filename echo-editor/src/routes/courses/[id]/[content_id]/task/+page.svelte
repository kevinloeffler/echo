<div class="wrapper">

    <button class="preview-button" onclick={() => showPreview = !showPreview}>
        {#if showPreview}
            <img src="/images/eye-crossed-icon.svg" alt="Geschlossenes Auge">
        {:else}
            <img src="/images/eye-icon.svg" alt="Geöffnetes Auge">
        {/if}
    </button>

    {#if !showPreview}
        <textarea bind:value={value} name="task" class="editor"></textarea>
    {:else}
        <div class="preview" bind:this={previewElement}>
        </div>
    {/if}

</div>

<!-- TODO: add markdown explanation -->


<script lang="ts">
    import {marked} from 'marked'

    const { data } = $props()

    let value = $state(data.course.description)
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

    .wrapper {
        position: relative;
    }

    .editor {
        width: 100%;
        max-width: 100%;
        min-height: 200px;
        color: var(--text);
        background-color: var(--editor);
        border: none;
        border-radius: 8px;
        padding: 20px 24px;
    }

    .preview-button {
        position: absolute;
        top: 8px;
        right: 8px;

        display: flex;
        justify-content: center;
        align-items: center;

        width: 46px;
        height: 30px;

        border: none;
        border-radius: 4px;
        background-color: transparent;

        cursor: pointer;
        transition: opacity 0.3s;
    }

    .preview-button:hover {
        opacity: 0.8;
    }

    .preview-button > img {
        width: 25px;
    }

    .preview {
        min-height: 200px;
        padding: 20px 24px;
        border: 2px solid var(--divider);
        border-radius: 8px;
    }

    /* Markdown styles */

    :global {
        .preview > h1 {
            color: red;
        }
    }

</style>
