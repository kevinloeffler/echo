
<div class="page page-padded">
    <div class="page-wrapper">

        <div class="header">
            <div class="title-wrapper">
                <BackButton />
                <h1>{data.course.name}</h1>
            </div>
            <div class="pane-select-wrapper">
                <button onclick={() => goto(`/courses/${data.id}/${data.contentId}/task`)} class="pane-select-button">
                    Aufgabe
                </button>
                <button onclick={() => goto(`/courses/${data.id}/${data.contentId}/settings`)} class="pane-select-button">
                    Einstellungen
                </button>
                <button onclick={() => goto(`/courses/${data.id}/${data.contentId}/tests`)} class="pane-select-button">
                    Tests
                </button>
            </div>
        </div>

        {@render children()}

    </div>
</div>


<script lang="ts">
    import BackButton from '$lib/components/elements/back_button.svelte'
    import {goto} from '$app/navigation'

    const { data, children } = $props()

</script>


<style>

    .header {
        border-bottom: 2px solid var(--divider);
        margin-bottom: 12px;
    }

</style>
