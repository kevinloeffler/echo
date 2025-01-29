{#each projects as project}
    <p>{project.name}</p>
{/each}
<button onclick={createProject} class="create-project-button">
    Neues Projekt erstellen
</button>



<script lang="ts">

    let { projects } = $props()


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
        transition: background-color 200ms;
    }

    .create-project-button:hover {
        background-color: #2b2f3b;
    }


</style>