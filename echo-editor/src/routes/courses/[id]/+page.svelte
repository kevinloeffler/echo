<h1>{course?.name}</h1>
<!-- TODO: Make editable -->
<!-- TODO: Create chapters and lessons -->


<script lang="ts">

    import {PUBLIC_API_URL} from '$env/static/public'
    import {goto} from '$app/navigation'
    import {onMount} from 'svelte'

    let { data } = $props()
    let id = data.id

    let course = $state<Optional<Course>>()

    onMount(async () => {
        course = await loadCourse(id)
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
