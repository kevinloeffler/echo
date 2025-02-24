<div class="page page-padded">
    <div class="page-wrapper">

        <div class="left">
            <div>
                <BackButton link={'/'}/>
                <h1 class="title">Kurs</h1>

                <label class="label">
                    Kursname
                    <input type="text" class="text-input">
                </label>

                <label class="label">
                    Beschrieb
                    <textarea class="text-input"></textarea>
                </label>

                <Checkbox bind:state={isVisible} label={'Sichtbar'} />
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

            <CourseContentList bind:data={courseContents} />

        </div>

    </div>
</div>


<!-- TODO: Make editable -->
<!-- TODO: Create chapters and lessons -->


<script lang="ts">

    import BackButton from '$lib/components/elements/back_button.svelte'
    import Checkbox from '$lib/components/elements/checkbox.svelte'
    import Modal from '$lib/components/modal.svelte';

    import {PUBLIC_API_URL} from '$env/static/public'
    import {goto} from '$app/navigation'
    import {onMount} from 'svelte'
    import CourseContentList from './CourseContentList.svelte'

    let { data } = $props()
    let id = data.id
    let courseContents = $state([])

    let course = $state<Optional<Course>>()
    $inspect('course:', course)

    let isVisible = $state()

    let showDeleteModal = $state(false)

    onMount(async () => {
        course = await loadCourse(id)
        courseContents = [...course.content]
    })

    async function loadCourse(id: string): Promise<Course> {
        const res = await fetch(`${PUBLIC_API_URL}/courses/${id}`, {
            method: 'GET',
            credentials: 'include',
        })
        if (res.status === 401) {
            await goto('/login')
        }
        return await res.json()
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
