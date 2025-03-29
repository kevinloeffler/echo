
<div class="page page-padded">
    <div class="page-wrapper">

        <div class="header">
            <div class="title-wrapper">
                <BackButton link="/courses/{data.id}" />
                <h1>{data.courseContent.name}</h1>
            </div>
            <div class="pane-select-wrapper">
                <button
                        onclick={() => goto(`/courses/${data.id}/${data.contentId}/task`)}
                        class="pane-select-button {(page.route.id ? page.route.id.endsWith('task') : false) ? 'active-button' : ''}">
                    Aufgabe
                </button>
                <button
                        onclick={() => goto(`/courses/${data.id}/${data.contentId}/settings`)}
                        class="pane-select-button {(page.route.id ? page.route.id.endsWith('settings') : false) ? 'active-button' : ''}">
                    Einstellungen
                </button>
                <button
                        onclick={() => goto(`/courses/${data.id}/${data.contentId}/tests`)}
                        class="pane-select-button {(page.route.id ? page.route.id.endsWith('tests') : false) ? 'active-button' : ''}">
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
    import {page} from '$app/state'

    const { data, children } = $props()

</script>


<style>

    .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        border-bottom: 2px solid var(--divider);
        margin-bottom: 12px;
        padding-bottom: 4px;
    }

    .pane-select-wrapper {
        display: flex;
        gap: 2px;
        padding-bottom: 4px;
    }

    .pane-select-wrapper > button {
        border: none;
        color: var(--text);
        background-color: var(--divider);
        padding: 6px 10px;
        cursor: pointer;
    }

    .pane-select-button:first-child {
        border-top-left-radius: 6px;
        border-bottom-left-radius: 6px;
    }

    .pane-select-button:last-child {
        border-top-right-radius: 6px;
        border-bottom-right-radius: 6px;
    }

    .pane-select-button.active-button {
        background-color: var(--accent);
    }

</style>
