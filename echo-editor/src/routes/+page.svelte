
{#if !user}
    <LoadingIndicator />
{:else if user.role === 'Admin'}
    <AdminDashboard user={user}/>
{:else if user.role === 'Teacher'}
    <TeacherDashboard user={user}/>
{:else}
    <StudentDashboard user={user} />
{/if}


<script lang="ts">

    import AdminDashboard from '$lib/components/dashboard/admin_dashboard.svelte';
    import TeacherDashboard from '$lib/components/dashboard/teacher_dashboard.svelte';
    import StudentDashboard from '$lib/components/dashboard/student_dashboard.svelte';
    import LoadingIndicator from '$lib/components/loading_indicator.svelte'

    import {PUBLIC_API_URL} from '$env/static/public'
    import {goto} from '$app/navigation'
    import {onMount} from 'svelte'

    let user = $state()

    onMount(loadUser)

    async function loadUser() {
        const res = await fetch(`${PUBLIC_API_URL}/profile`, {
            method: 'GET',
            credentials: 'include',
        })
        if (res.status === 401) {
            await goto('/login')
        }
        user = await res.json()
    }

</script>
