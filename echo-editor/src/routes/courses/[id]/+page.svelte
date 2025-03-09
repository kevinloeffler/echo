<div class="page page-padded">
    <div class="page-wrapper">

        <div class="left">
            <div>
                <BackButton link={'/'}/>
                <h1 class="title">Kurs</h1>

                <label class="label">
                    Kursname
                    <input bind:value={course.name} type="text" class="text-input">
                </label>

                <label class="label">
                    Beschrieb
                    <textarea bind:value={course.description} class="text-input"></textarea>
                </label>

                <Checkbox bind:checked={course.hidden} inverse={true} label={'Sichtbar'} />
            </div>

            <button onclick={() => showDeleteModal = true} class="button button-secondary">Kurs Löschen</button>
            <Modal bind:showModal={showDeleteModal} title={'Kurs wirklich Löschen?'}>
                <div class="modal-wrapper">
                    <p class="modal-text">
                        Folgendes wird gelöscht:
                    </p>
                    <ul>
                        <li>Kapitel</li>
                        <li>Lektionen</li>
                        <li>Schüler:innen Code</li>
                    </ul>
                    <p class="modal-text-secondary">
                        Falls der Kurs für Schülerinnen und Schüler nicht mehr aufrufbar sein soll muss er nicht
                        gelöscht werden sondern kann auf "nicht sichtbar" geschaltet werden.
                    </p>
                    <div class="modal-button-row">
                        <button onclick={() => showDeleteModal = false} class="button button-secondary">Abbrechen</button>
                        <button class="button button-primary">Kurs Löschen</button>
                    </div>
                </div>
            </Modal>

        </div>

        <div class="right">

            <h1>Inhalt</h1>

            {#if course}
                <CourseContentList bind:data={course.content} courseId={course.id} refreshData={refresh} />
            {/if}
        </div>

    </div>
</div>


<script lang="ts">

    import BackButton from '$lib/components/elements/back_button.svelte'
    import Checkbox from '$lib/components/elements/checkbox.svelte'
    import Modal from '$lib/components/modal.svelte'

    import {invalidateAll} from '$app/navigation'
    import CourseContentList from './CourseContentList.svelte'
    import {debounce} from '$lib/util'
    import {PUBLIC_API_URL_CLIENTSIDE} from '$env/static/public'

    let { data }: { data: Course } = $props()
    let course = $state<Course>(data)

    let showDeleteModal = $state(false)

    let firstUpdateCall = true  // prevent updating on component mount
    const updateCourse = debounce(async (updatedCourse: Course) => {
        if (firstUpdateCall) {
            firstUpdateCall = false
            return
        }

        const response = await fetch(`${PUBLIC_API_URL_CLIENTSIDE}/courses/${course.id}`, {
            method: 'PATCH',
            body: JSON.stringify(updatedCourse),
            credentials: 'include'
        })
        const reply = await response.json()
        if (!response.ok || !reply.status) {}  // todo: handle error
    }, 1000)

    $effect(() => {
        const newCourse = {...course}
        // @ts-ignore
        updateCourse(newCourse)
    })

    function refresh() {
        console.log('refreshing')
        invalidateAll()
    }

</script>


<style>

    .title {
        margin-top: -12px;
    }

    .page {
        min-height: calc(100vh - 80px);
        margin-bottom: 40px;
    }

    .page-wrapper {
        min-height: 100%;
        max-height: 100%;
        display: flex;
    }

    .left {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: 40%;
        height: 100%;
        border-right: 2px solid var(--divider);
        padding-right: 40px;
        margin-right: 40px;
    }

    .right {
        width: 60%;
    }

    textarea {
        min-height: 80px;
        max-height: 50vh;
        resize: vertical;
    }

    /***** MODAL *****/

    .modal-wrapper {
        max-width: 400px;
        padding: 12px;
    }

    .modal-text-secondary {
        font-size: 12px;
        color: var(--text-secondary);
        margin-top: 8px;
    }

    .modal-button-row {
        display: flex;
        gap: 8px;
        margin-top: 12px;
    }

    .modal-button-row > button {
        margin-bottom: 0;
    }

    ul {
        padding-left: 20px;
    }

    .classHovered {
        background-color: lightblue;
        color: white;
    }

</style>
