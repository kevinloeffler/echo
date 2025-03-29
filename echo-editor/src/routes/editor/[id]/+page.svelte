
<Editor courseContent={course} />

<script lang="ts">

    import Editor from '$lib/components/editor/editor.svelte'

    let { data } = $props()
    let course = $state(data)

    $inspect(course)

</script>
