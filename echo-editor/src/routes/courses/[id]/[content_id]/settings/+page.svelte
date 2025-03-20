
<div class="wrapper">
    <p>NOT IMPLEMENTED - DOES NOT WORK</p>

    <Checkbox bind:checked={testMode} inverse={false} label={'Prüfungsmodus'} />
    <Checkbox bind:checked={course.hidden} inverse={true} label={'Sichtbar'} />

</div>


<script lang="ts">

    import Checkbox from '$lib/components/elements/checkbox.svelte'

    const { data } = $props()
    let course = $state(data.course)

    let testMode = $state(false)  // TODO: replace with course.testMode

</script>


<style>

    .wrapper {
        max-width: 300px;
    }

</style>
