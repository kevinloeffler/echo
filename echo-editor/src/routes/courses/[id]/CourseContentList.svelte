{#each data as element, idx}

    <div class="margin">
        <div class="drag-target" data-parent={-1} data-index={idx}
             ondragenter={dragOver}
             ondragleave={dragLeave}
             ondragover={(e) => e.preventDefault()}
             ondrop={drop}
             role="dialog"
        >
            <div class="drag-target-indicator"></div>
        </div>

        <button onclick={() => addElement(-1, idx)} class="add-element"><p>+</p></button>
    </div>

    <CourseContentElement element={element} parent={-1} index={idx} courseId={courseId}
                          reorderHandler={reorderElement} addElementHandler={addElement}
    />

{/each}

<div class="margin">
    <div class="drag-target" data-parent={-1} data-index={data.length}
         ondragenter={dragOver}
         ondragleave={dragLeave}
         ondragover={(e) => e.preventDefault()}
         ondrop={drop}
         role="dialog"
    >
        <div class="drag-target-indicator"></div>
    </div>

    <button onclick={() => addElement(-1, data.length)} class="add-element"><p>+</p></button>
</div>

<Modal bind:showModal={showCreateCourseModal} title={'Inhalt erstellen'}>
    <div class="modal-wrapper">
        <label class="label">
            Name
            <input bind:value={modalData.name} type="text" class="text-input" />
        </label>

        <label class="label">
            Typ
            <select bind:value={modalData.type} class="select-input">
                <option value="lesson">Lektion</option>
                <option value="chapter">Kapitel</option>
            </select>
        </label>

        <div class="button-row">
            <button onclick={() => showCreateCourseModal=false} class="button button-secondary">Abbrechen</button>
            <button onclick={postNewElement} class="button button-primary">Erstellen</button>
        </div>
    </div>
</Modal>


<script lang="ts">
    import CourseContentElement from './CourseContent.svelte'
    import Modal from '$lib/components/modal.svelte'

    let { data = $bindable(), courseId, refreshData } = $props()

    // Modal
    let showCreateCourseModal = $state(false)
    let modalData = $state({
        courseId: courseId,
        parentId: undefined,
        index: undefined,
        type: undefined,
        name: '',
    })


    function reorderElement(elementId: number, elementIndex: number, newPosition: {parent: number, index: number}) {
        const newList: CourseContent[] = structuredClone($state.snapshot(data))

        const elementAndParent = findElementAndParent(elementId, newList, true)
        if (!elementAndParent) return  // handle error

        const element = elementAndParent[0]
        const parentId = elementAndParent[1]

        if (!element) return  // handle error

        // if an item is moved down in the same list we need to correct the index
        let index = newPosition.index
        if (newPosition.parent === parentId) {
            if (elementIndex < index) {
                index = Math.max(0, index - 1)
            }
        }

        if (newPosition.parent === -1) {  // special case: target is top level
            newList.splice(index, 0, element)
            data = newList
            updateCourseContent(elementId, -1, index)
            return
        }

        const result = findElementAndParent(newPosition.parent, newList)
        if (!result) return  // handle error

        const parentElement = result[0]

        if (!parentElement) return  // handle error
        parentElement.content.splice(index, 0, element)
        data = newList
        updateCourseContent(elementId, newPosition.parent, index)
    }

    function findElementAndParent(elementId: number, parent: CourseContent | CourseContent[], remove=false): Optional<[Optional<CourseContent>, number]> {
        //@ts-ignore
        const parentId = parent.id ?? -1
        //@ts-ignore
        const content = parent.content ?? parent

        if (!content.length) return undefined

        for (let i = 0; i < content.length; i++) {
            if (content[i].id === elementId) {
                if (remove) {
                    return [content.splice(i, 1)[0], parentId]
                } else {
                    return [content[i], parentId]
                }
            }
            const result = findElementAndParent(elementId, content[i], remove)
            if (result) return result
        }
    }

    async function updateCourseContent(elementId: number, newParentId: number, index: number) {
        const reply = await fetch('/api/course-content/move', {
            method: 'PATCH',
            body: JSON.stringify({contentId: elementId, newParentId, index}),
        })
        await reply.json()
    }

    /* DRAG HANDLING */

    function drop(event: any) {
        event.preventDefault()

        const payload = event.dataTransfer.getData('text/plain').split('|')
        const elementId = parseInt(payload[0])
        const elementIndex = parseInt(payload[1])

        const targetParent = parseInt(event.toElement.dataset.parent)
        const targetIndex = parseInt(event.toElement.dataset.index)

        reorderElement(elementId, elementIndex, {parent: targetParent, index: targetIndex})
        event.toElement.style.opacity = '0'
    }

    function dragOver(e) {
        e.toElement.style.opacity = '1'
    }

    function dragLeave(e) {
        e.toElement.style.opacity = '0'
    }

    /* Add element */

    function addElement(parentId: number, index: number) {
        showCreateCourseModal = true
        // @ts-ignore
        modalData.parentId = parentId
        // @ts-ignore
        modalData.index = index
    }

    async function postNewElement() {
        const res = await fetch('/api/course-content/new', {
            method: 'POST',
            body: JSON.stringify(modalData),
        })
        const response = await res.json()
        if (!response.status) {
            // todo: error handling
        }
        showCreateCourseModal = false
        refreshData()
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

    .drag-target {
        width: 100%;
        height: 100%;
        opacity: 0;
        padding: 6px 0;
        z-index: 5;
    }

    .drag-target-indicator {
        width: 100%;
        height: 4px;
        background-color: var(--accent);
        pointer-events: none;
        border-radius: 100px;
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
        transition: opacity 200ms;
    }

    .add-element > p {
        color: var(--accent);
        font-size: 20px;
        font-weight: bold;
    }

    /* New Course Modal */

    .modal-wrapper {
        padding: 4px 16px 16px;
    }

    .select-input {
        margin-top: 4px;
        padding: 6px 8px;

        color: var(--text);
        background-color: var(--editor);

        font-weight: 400;
        font-size: 14px;

        border: none;
        border-radius: 4px;
        appearance: none;
    }

    .button-row {
        display: flex;
        margin-top: 16px;
        gap: 8px;
    }

</style>
