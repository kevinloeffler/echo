<a href="./{courseId}/2" class={['content-wrapper', element.type]} draggable="true" ondragstart={dragStart}>
    <p class="name">{element.name}</p>
    <p class="type">{(element.type === 'chapter') ? 'Kapitel' : 'Lektion'}</p>
</a>


{#if element.content.length > 0 || element.type === 'chapter'}
    <div class="child-wrapper">

        {#each element.content as content, idx}

            <div class="margin">
                <div class="drag-target" data-parent={element.id} data-index={idx}
                     ondragenter={dragOver}
                     ondragleave={dragLeave}
                     ondragover={(e) => e.preventDefault()}
                     ondrop={drop}
                     role="dialog"
                >
                    <div class="drag-target-indicator"></div>
                </div>

                <button onclick={() => addElementHandler(element.id, idx)} class="add-element"><p>+</p></button>
            </div>

            <CourseContentElement element={content} parent={element.id} index={idx} courseId={courseId}
                                  reorderHandler={reorderHandler} addElementHandler={addElementHandler}
            />

        {/each}

        <div class="margin">
            <div class="drag-target" data-parent={element.id} data-index={element.content.length}
                 ondragenter={dragOver}
                 ondragleave={dragLeave}
                 ondragover={(e) => e.preventDefault()}
                 ondrop={drop}
                 role="dialog"
            >
                <div class="drag-target-indicator"></div>
            </div>

            <button onclick={() => addElementHandler(element.id, element.content.length)} class="add-element"><p>+</p></button>
        </div>

    </div>
{/if}


<script lang="ts">
    import CourseContentElement from './CourseContent.svelte'

    let { element, parent, index, courseId, reorderHandler, addElementHandler } = $props()

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

    .margin {
        display: flex;
        justify-content: center;
        align-items: center;

        width: 100%;
        height: 16px;
    }

    .content-wrapper {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 20px;
        color: var(--text);
        background-color: var(--divider);
        border-radius: 8px;
        text-decoration: none;
        cursor: pointer;
        z-index: 1;
        transition: outline 50ms;
    }

    .content-wrapper:hover {
        outline: 2px solid var(--button-secondary);
    }

    .type {
        font-size: 10px;
        opacity: 0.75;
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

    .margin:hover > .add-element {
        opacity: 1;
    }

    .add-element {
        display: flex;
        justify-content: center;
        align-items: center;

        position: absolute;
        height: 30px;
        width: 30px;

        opacity: 0;
        border-radius: 100%;
        background-color: var(--background);
        cursor: pointer;
        z-index: 6;
        border: none;
    }

    .add-element > p {
        color: var(--accent);
        font-size: 20px;
        font-weight: bold;
    }

    .lesson {
        background-color: var(--button-secondary);
    }

    .lesson:hover {
        outline: 2px solid #7098d2;
    }

</style>