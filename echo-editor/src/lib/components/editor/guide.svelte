<svelte:window use:handleShortcuts={[
    { shortcut: Shortcuts.esc, action: closeOverlay },
]}/>

<div class="wrapper">

    <div class="navigation">
        <div class="menu-wrapper">
            <button class="menu" onclick={() => showMenuOverlay = !showMenuOverlay}>
                <img src="/images/editor/menu-icon.svg" alt="Menu">
            </button>
            <div class="menu-overlay" class:menu-overlay-hidden={!showMenuOverlay}>
                <div class="menu-overlay-header">
                    <button class="menu-overlay-close-button" onclick={() => showMenuOverlay = !showMenuOverlay}>
                        <img src="/images/editor/close-icon.svg" alt="X">
                    </button>
                    <a href="/" class="menu-overlay-home">
                        <img src="/images/editor/home-icon.svg" alt="Startseite">
                        <p class="menu-overlay-header-text">Startseite</p>
                    </a>
                </div>
                <div class="menu-contents">
                    <!-- TODO: load from server -->
                    <p>Woche 1</p>
                    <p>- Variablen</p>
                    <p>- Conditionals</p>
                    <p>- Hausaufgaben</p>
                </div>
            </div>
        </div>


        <div class="navigation-path">
            Woche 1 / Intro / Conditionals  <!-- TODO: load from server -->
        </div>
    </div>

    <div class="content markdown" bind:this={previewElement} >
        <h2>Anleitung</h2>
        Lorem Ipsum is simply dummy text...
    </div>

</div>


<script lang="ts">

    import { handleShortcuts, Shortcuts } from '$lib/services/shortcuts'
    import {marked} from 'marked'

    let { text }: { text: string } = $props()

    let showMenuOverlay = $state(false)
    function closeOverlay() {
        showMenuOverlay = false
    }

    $effect(() => {
        renderMarkdown(text)
    })

    let previewElement: HTMLDivElement
    async function renderMarkdown(text: string) {
        previewElement.innerHTML = await marked.parse(text)
    }

</script>


<style>

    .wrapper {
        width: 100%;
        height: 100%;
        border-right: 1px solid var(--divider);
    }

    /* Navigation */

    .navigation {
        display: flex;
        align-items: center;
        background: var(--divider);
        width: 100%;
        padding: 12px 20px;
    }

    .menu-wrapper {
        position: relative;
    }

    .menu {
        padding: 8px;
        background-color: transparent;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    .menu:hover {
        background-color: #4d556c;
    }

    .menu > img {
        height: 1em;
    }

    .menu-overlay-hidden {
        width: 0;
        height: 0;
    }

    .menu-overlay {
        position: absolute;
        top: -4px;
        left: -4px;
        z-index: 99;
        min-width: 250px;
        background-color: var(--divider);
        border-radius: 8px;
        box-shadow: 0 4px 40px 4px rgba(0, 8, 17, 0.75);
        overflow: hidden;
    }

    .menu-overlay-header {
        display: flex;
        align-items: center;
        border-bottom: 2px solid #6B738B;
        text-decoration: none;
        height: 44px;
    }

    .menu-overlay-close-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 100%;
        background-color: transparent;
        border: none;
        border-right: 2px solid #6B738B;
        cursor: pointer;
    }

    .menu-overlay-close-button:hover {
        background-color: #4d556c;
    }

    .menu-overlay-close-button > img {
        height: 1em;
    }

    .menu-overlay-home {
        display: flex;
        align-items: center;
        height: 100%;
        width: 100%;
        padding-left: 12px;
    }

    .menu-overlay-home:hover {
        background-color: #4d556c;
    }

    .menu-overlay-home > img {
        height: 1em;
    }

    .menu-overlay-header-text {
        margin-left: 8px;
        color: var(--text);
    }

    .menu-contents {
        padding: 12px;
    }

    /* Content */

    .content {
        padding: 20px;
    }

</style>
