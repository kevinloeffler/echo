{#each projects as project}
    <p>{project.name}</p>
{/each}
<button onclick={() => showProjectModal = true} class="create-project-button">
    Neues Projekt erstellen
</button>
<Modal bind:showModal={showProjectModal} title="Neues Projekt erstellen">
    <div class="modal-content">
        <label>
            Projektname
            <input bind:value={projectName} type="text" autofocus />
        </label>
        <button onclick={createProject}>Kurs Erstellen</button>
    </div>
</Modal>



<script lang="ts">

    import Modal from '$lib/components/modal.svelte'

    let { projects } = $props()

    let showProjectModal = $state(false)
    let projectName = $state('')

    async function createProject() {
        // TODO: implement
    }

</script>


<style>

    .create-project-button {
        width: 100%;
        border: none;
        border-radius: 0;
        padding: 20px 0;
        font-weight: 600;
        color: var(--text);
        background-color: var(--divider);
        cursor: pointer;
        transition: color 200ms, background-color 200ms;
    }

    .create-project-button:hover {
        color: var(--accent);
        background-color: #2b2f3b;
    }

    /* Modal */

    .modal-content {
        width: 400px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        padding: 12px 16px;
    }

    .modal-content > label {
        font-size: 12px;
        font-weight: 600;
        width: 100%;
    }

    .modal-content > label > input {
        display: block;
        width: 100%;
        font-size: 14px;
        font-weight: 400;
        color: var(--text);
        background-color: var(--editor);
        padding: 12px 16px;
        margin-top: 2px;
        margin-bottom: 12px;
        border: none;
        border-radius: 8px;
    }

    .modal-content > button {
        color: var(--text);
        background-color: var(--accent);
        padding: 12px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
    }

</style>