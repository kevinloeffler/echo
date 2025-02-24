<div class="content-wrapper" draggable="true" ondragstart={dragStart} role="dialog">
    {element.name}, {element.id}
</div>


{#if element.content.length > 0 || element.type === 'chapter'}
    <div class="child-wrapper">

        {#each element.content as content, idx}

            <div class="drag-target" data-parent={element.id} data-index={idx}
                 ondragenter={dragOver}
                 ondragleave={dragLeave}
                 ondragover={(e) => e.preventDefault()}
                 ondrop={drop}
                 role="dialog"
            >
                <div class="drag-target-indicator"></div>
            </div>

            <CourseContentElement element={content} parent={element.id} index={idx} reorderHandler={reorderHandler} />

        {/each}

        <div class="drag-target" data-parent={element.id} data-index={element.content.length}
             ondragenter={dragOver}
             ondragleave={dragLeave}
             ondragover={(e) => e.preventDefault()}
             ondrop={drop}
             role="dialog"
        >
            <div class="drag-target-indicator"></div>
        </div>

    </div>
{/if}


<script lang="ts">
    import CourseContentElement from './CourseContent.svelte'

    let { element, parent, index, reorderHandler } = $props()

    /* DRAG HANDLING */

    function dragStart(e: DragEvent) {
        e.dataTransfer.setData('text/plain', `${element.id}|${index}`)  // Store data
    }

    function dragOver(e) {
        e.toElement.style.opacity = '1'
    }

    function dragLeave(e) {
        e.toElement.style.opacity = '0'
    }

    function drop(event: any) {
        event.preventDefault()

        const payload = event.dataTransfer.getData('text/plain').split('|')
        const elementId = parseInt(payload[0])
        const elementIndex = parseInt(payload[1])
        const targetParent = parseInt(event.toElement.dataset.parent)
        const targetIndex = parseInt(event.toElement.dataset.index)

        reorderHandler(elementId, elementIndex, {parent: targetParent, index: targetIndex})
        event.toElement.style.opacity = '0'
    }

</script>


<style>

    .content-wrapper {
        padding: 8px 12px;
        background-color: var(--divider);
        border-radius: 8px;
        cursor: pointer;
        z-index: 1;
    }

    .drag-target {
        width: 100%;
        height: 20px;
        opacity: 0;
        padding: 8px 0;
        z-index: 5;
        margin: -6px 0;
    }

    .drag-target-indicator {
        width: 100%;
        height: 4px;
        background-color: var(--accent);
        pointer-events: none;
        border-radius: 100px;
    }

    .child-wrapper {
        padding-left: 20px;
    }

</style>