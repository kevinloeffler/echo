
<div class="page page-padded">
    <div class="page-wrapper">

        <div class="header">
            <BackButton />

        </div>

        {@render children()}

    </div>
</div>



<script lang="ts">
    import BackButton from '$lib/components/elements/back_button.svelte'

    const { children } = $props()

</script>
