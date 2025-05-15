
<Editor course={course} courseContent={courseContent} />

<script lang="ts">

    import Editor from '$lib/components/editor/editor.svelte'

    let { data } = $props()
    let course = $state(data.course)
    let courseContent = $state(data.courseContent)

    $inspect('course:', course)
    $inspect('cc:', courseContent)

</script>
