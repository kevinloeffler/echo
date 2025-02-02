<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog
        bind:this={dialog}
        onclose={() => (showModal = false)}
        onclick={(e) => { if (e.target === dialog) dialog.close(); }}
>
    <div class="header">
        <p class="title">{title}</p>
        <button class="close-button" onclick={() => dialog?.close()}>
            <img src="/images/x-icon.svg" alt="Schliessen">
        </button>
    </div>

    {@render children()}

</dialog>


<script lang="ts">

    let { showModal = $bindable(), title, children } = $props()
    let dialog = $state<HTMLDialogElement>()

    $effect(() => {
        if (showModal) {
            dialog?.showModal()
        } else {
            dialog?.close()
        }
    })

</script>


<style>

    dialog {
        min-width: 300px;
        border: none;
        border-radius: 12px;
        color: var(--text);
        background-color: var(--divider);
        padding: 0;

        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    dialog::backdrop {
        background: rgba(0, 0, 0, 0.66);
    }

    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;

        border-bottom: 2px solid #6B738B;
    }

    .title {
        font-size: 16px;
        font-weight: 600;
    }

    .close-button {
        background-color: transparent;
        border: none;
        width: 26px;
        cursor: pointer;
    }

</style>