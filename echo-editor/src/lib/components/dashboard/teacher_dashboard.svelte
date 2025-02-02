<div class="page">
    <div class="page-wrapper">

        <div class="content-left">
            <div class="resents-wrapper">
                <p class="block-label">Zuletzt Geöffnet</p>
                <div class="resents block">
                    <p>Todo...</p>
                    <!--TODO: load resents-->
                </div>
            </div>

            <div class="courses-and-projects-wrapper">

                <div class="courses-wrapper">
                    <p class="block-label">Kurse</p>
                    <div class="courses block">
                        {#if courses}
                            {#each courses as course}
                                <CourseDisplay course={course} />
                            {/each}
                            <button onclick={() => showCourseModal = true} class="create-course-button">
                                Neuen Kurs erstellen
                            </button>
                            <Modal bind:showModal={showCourseModal} title="Neuen Kurs erstellen">
                                <div class="modal-content">
                                    <label>
                                        Kursname
                                        <input bind:value={courseName} type="text" autofocus />
                                    </label>
                                    <button onclick={createCourse}>Kurs Erstellen</button>
                                </div>
                            </Modal>
                        {:else}
                            <div class="loading-placeholder">
                                <LoadingIndicator />
                            </div>
                        {/if}
                    </div>
                </div>

                <div class="projects-wrapper">
                    <p class="block-label">
                        Projekte
                    </p>
                    <div class="projects block">
                        {#if projects}
                            <ProjectDisplay projects={projects} />
                        {:else}
                            <div class="loading-placeholder">
                                <LoadingIndicator />
                            </div>
                        {/if}
                    </div>
                </div>

            </div>
        </div>

        <div class="content-right">
            <div class="profile-wrapper">
                <p class="block-label">Profil</p>
                <ProfileDisplay user={user} />
            </div>
        </div>

    </div>
</div>



<script lang="ts">
    import ProfileDisplay from './profile_display.svelte'
    import ProjectDisplay from './project_display.svelte'
    import LoadingIndicator from '$lib/components/loading_indicator.svelte'
    import Modal from '$lib/components/modal.svelte'
    import CourseDisplay from '$lib/components/dashboard/teacher_course_display.svelte'

    import {PUBLIC_API_URL} from '$env/static/public'
    import {goto} from '$app/navigation'
    import {onMount} from 'svelte'

    let { user } = $props()

    let courses = $state<Optional<[]>>(undefined)
    let projects = $state([])

    onMount(async () => {
        courses = await loadCourses()
        projects = await loadProjects()
    })

    /* Create Course */
    let showCourseModal = $state(false)
    let courseName = $state('')

    async function createCourse() {
        if (!showCourseModal) return  // TODO: show error message

        const res = await fetch(`${PUBLIC_API_URL}/courses`, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({ name: courseName }),
        })
        const response = await res.json()
        if (!response.status) {
            // TODO: alert user
        }
        showCourseModal = false
        courseName = ''
        courses = await loadCourses()
    }

    /* Load Data */

    async function loadCourses() {
        const res = await fetch(`${PUBLIC_API_URL}/courses`, {
            method: 'GET',
            credentials: 'include',
        })
        if (res.status === 401) {
            await goto('/login')
        }
        return res.json()
    }

    async function loadProjects() {
        // TODO: implement
        return []
    }

</script>


<style>

    .page-wrapper {
        margin-top: 5vw;
        display: flex;
        gap: 60px;
    }

    .content-left {
        flex-grow: 1;
        min-width: 300px;
    }

    .content-right {
        width: 350px;
    }

    .block {
        background-color: var(--divider);
        border-radius: 12px;
        margin-bottom: 20px;
        overflow: hidden;
    }

    .block-label {
        padding-bottom: 8px;
        font-weight: 600;
    }

    .resents-wrapper {
        width: 100%;
    }

    .resents {
        padding: 16px;
    }

    /***** Courses & Projects *****/

    .courses-and-projects-wrapper {
        display: flex;
        gap: 20px;
    }

    .modal-content {
        width: 400px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 12px 16px;
    }

    .modal-content > label {
        font-size: 12px;
        font-weight: 600;
        width: 100%;
    }

    .modal-content > label > input {
        display: block;
        width: 100%;
        font-size: 14px;
        font-weight: 400;
        color: var(--text);
        background-color: var(--editor);
        padding: 12px 16px;
        margin-top: 2px;
        margin-bottom: 12px;
        border: none;
        border-radius: 8px;
    }

    .modal-content > button {
        color: var(--text);
        background-color: var(--accent);
        padding: 12px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
    }

    /* COURSES */

    .courses-wrapper {
        width: 100%;
    }

    .create-course-button {
        width: 100%;
        border: none;
        border-radius: 0;
        padding: 20px 0;
        font-weight: 600;
        color: var(--text);
        background-color: var(--divider);
        cursor: pointer;
        transition: color 200ms, background-color 200ms;
    }

    .create-course-button:hover {
        color: var(--accent);
        background-color: #2b2f3b;
    }

    /* PROJECTS */

    .projects-wrapper {
        width: 100%;
    }

    /* OTHER */

    .loading-placeholder {
        width: 100%;
        min-width: 100px;
        height: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
    }

</style>
