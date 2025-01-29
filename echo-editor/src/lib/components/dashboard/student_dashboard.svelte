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
                        {#await loadCourses()}
                            <div class="loading-placeholder">
                                <LoadingIndicator />
                            </div>
                        {:then result}
                            {#if result.length > 0}
                                {#each result as course}
                                    <p>{course.name}</p>
                                {/each}
                            {:else}
                                <div class="courses-placeholder">
                                    <img src="/images/empty-box-icon.svg" alt="X">
                                    <p>
                                        Du hast keine Kurse. Deine Lehrperson muss dich einem Kurs
                                        hinzuzufügen.
                                    </p>
                                </div>
                            {/if}
                        {/await}
                    </div>
                </div>

                <div class="projects-wrapper">
                    <p class="block-label">
                        Projekte
                    </p>
                    <div class="projects block">
                        {#await loadProjects()}
                            <div class="loading-placeholder">
                                <LoadingIndicator />
                            </div>
                        {:then projects}
                            <ProjectDisplay projects={projects} />
                        {/await}
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

    import {goto} from '$app/navigation'
    import {PUBLIC_API_URL} from '$env/static/public'

    let { user } = $props()

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
        // TODO: implements
        return []
    }

    function createProject() {
        // TODO: implement
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

    /* COURSES */

    .courses-wrapper {
        width: 100%;
    }

    .courses-placeholder {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 32px;
        text-align: center;
    }

    .courses-placeholder > img {
        width: 50px;
        margin-bottom: 12px;
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

    /***** RESPONSIVE *****/

    @media (max-width: 900px) {

        .page-wrapper {
            flex-direction: column;
        }

        .content-right {
            width: 100%;
        }

    }

</style>
