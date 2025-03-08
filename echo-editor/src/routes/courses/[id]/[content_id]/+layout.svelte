
<div class="page page-padded">
    <div class="page-wrapper">

        <div class="header">
            <BackButton />
            <h1>{data.course.name}</h1>
        </div>

        {@render children()}

    </div>
</div>


<script lang="ts">
    import BackButton from '$lib/components/elements/back_button.svelte'

    const { data, children } = $props()
    $inspect(data)

</script>


<style>

    .header {
        border-bottom: 2px solid var(--divider);
        margin-bottom: 12px;
    }

</style>
