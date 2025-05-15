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

                <div class="label">
                    Teilnehmende
                    <div class="students">
                        <p>{data.students.length} SuS</p>
                        <button class="button button-secondary" onclick={()=> showManageUsersModal = !showManageUsersModal}>
                            Verwalten
                        </button>
                        <Modal bind:showModal={showManageUsersModal} title={'Teilnehmende verwalten'}>
                            {#if showManageUsersModal}
                                <div class="manage-user-modal">
                                    {#each students as student}
                                        {@const subscribed = data.students.some(x => x.id === student.id)}
                                        <div class="manage-user-student">
                                            <p>{student.name}</p>
                                            <button onclick={() => updateStudent(student.id, subscribed)}
                                                    class={['student-checkbox', subscribed ? 'student-checkbox-active' : '']}>
                                                <img src="/images/checkbox-icon.svg" alt="Checkbox Icon">
                                            </button>
                                        </div>
                                    {/each}
                                    <button class="button button-primary add-user-button" onclick={() => showManageUsersModal = !showManageUsersModal}>
                                        Speichern
                                    </button>
                                </div>
                            {/if}
                        </Modal>
                    </div>
                </div>

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
    import {updateCourse} from './helpers'
    import {PUBLIC_API_URL_CLIENTSIDE} from '$env/static/public'
    import {onMount} from 'svelte'

    let { data }: { data: Course } = $props()
    let course = $state<Course>(data)

    let showDeleteModal = $state(false)
    let showManageUsersModal = $state(false)

    let students: User[] = $state([])

    let firstUpdateCall = true  // prevent updating on component mount
    const handleCourseChange = debounce(async (updatedCourse: Course) => {
        if (firstUpdateCall) {
            firstUpdateCall = false
            return
        }
        const response = await updateCourse(updatedCourse)  // TODO: handle error
    }, 1000)

    $effect(() => {
        const newCourse = {...course}
        // @ts-ignore
        handleCourseChange(newCourse)
    })

    function refresh() {
        console.log('refreshing')
        invalidateAll()
    }

    async function loadAllStudents(): Promise<User[]> {
        const res = await fetch(PUBLIC_API_URL_CLIENTSIDE + '/users?role=Student', {
            method: 'GET',
            credentials: 'include',
        })
        return await res.json()
    }

    async function updateStudent(studentId: string | number, subscribed: boolean) {
        console.log('running update')
        await fetch(PUBLIC_API_URL_CLIENTSIDE + `/courses/${course.id}/users`, {
            method: 'PATCH',
            credentials: 'include',
            body: JSON.stringify({
                method: subscribed ? 'remove' : 'add',
                student: studentId,
            })
        })
        console.log('running reload')
        students = await loadAllStudents()
        await invalidateAll()
    }

    onMount( async () => {
        students = await loadAllStudents()
    })

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

    .students {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    .students > p {
        font-size: 14px;
        color: var(--text);
        margin-bottom: 12px;
    }

    .students > button {
        width: 100px;
    }

    /***** DELETE MODAL *****/

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

    /***** MANAGE STUDENTS MODAL *****/

    .add-user-button {
        margin: 12px 0 0;
    }

    .manage-user-modal {
        padding: 12px 16px;
    }

    .manage-user-student {
        font-weight: 400;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .student-checkbox {
        width: 16px;
        height: 16px;
        background-color: var(--button-secondary);
        border-radius: 4px;
        cursor: pointer;
        border: none;
        padding: 0;
    }

    .student-checkbox-active {
        background-color: var(--accent);
    }

    .student-checkbox > img {
        opacity: 0;
    }

    .student-checkbox-active > img {
        opacity: 1;
    }

    .student-checkbox:hover > img {
        opacity: 0.2;
    }

</style>
