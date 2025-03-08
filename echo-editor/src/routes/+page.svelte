
{#if !data.user}
    <LoadingIndicator />
{:else if data.user.role === 'Admin'}
    <AdminDashboard user={data.user} />
{:else if data.user.role === 'Teacher'}
    <TeacherDashboard user={data.user} courses={data.courses} projects={data.projects} />
{:else}
    <StudentDashboard user={data.user} />
{/if}


<script lang="ts">

    import AdminDashboard from '$lib/components/dashboard/admin_dashboard.svelte'
    import TeacherDashboard from '$lib/components/dashboard/teacher_dashboard.svelte'
    import StudentDashboard from '$lib/components/dashboard/student_dashboard.svelte'
    import LoadingIndicator from '$lib/components/loading_indicator.svelte'

    const { data } = $props()

</script>
