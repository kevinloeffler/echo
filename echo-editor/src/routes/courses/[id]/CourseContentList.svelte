{#each data as element, idx}

    <div class="drag-target" data-parent={-1} data-index={idx}
         ondragenter={dragOver}
         ondragleave={dragLeave}
         ondragover={(e) => e.preventDefault()}
         ondrop={drop}
         role="dialog"
    >
        <div class="drag-target-indicator"></div>
    </div>

    <CourseContentElement element={element} parent={-1} index={idx} reorderHandler={reorderElement} />

{/each}

<div class="drag-target" data-parent={-1} data-index={data.length}
     ondragenter={dragOver}
     ondragleave={dragLeave}
     ondrop={drop}
     ondragover={(e) => e.preventDefault()}
     role="dialog"
>
    <div class="drag-target-indicator"></div>
</div>


<script lang="ts">
    import CourseContentElement from './CourseContent.svelte'

    let { data = $bindable() } = $props()

    $inspect('data:', data)

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
            return
        }

        const result = findElementAndParent(newPosition.parent, newList)
        if (!result) return  // handle error

        const parentElement = result[0]

        if (!parentElement) return  // handle error
        parentElement.content.splice(index, 0, element)
        data = newList
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

</script>


<style>

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

</style>
