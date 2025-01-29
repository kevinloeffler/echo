
<div class="wrapper">

    <h2>Assistent</h2>

    <button class="button button-primary">
        <img src="/images/editor/question-icon.svg" alt="Chat"> Ich komme nicht weiter
    </button>
    <button class="button button-primary" onclick={explainCode}>
        <img src="/images/editor/text-selection-icon.svg" alt="Text Selektion"> Ausgewählten Code erklären
    </button>

    <div class="chat-window">
        <p>some text...</p>
    </div>

    <div class="chat-input-wrapper">
        <input type="text" class="chat-input" placeholder="Assistent Fragen..." />
        <button class="button button-primary">
            <img src="/images/editor/chat-icon.svg" alt="Chat">
        </button>
    </div>

</div>


<script lang="ts">

    import {AssistantService} from '$lib/services/assistant_service.svelte'

    const assistant = new AssistantService()
    let userInput: string = $state('')
    let buttonIsDisabled = $derived(userInput.length < 5)

    let { getSelectedCode, getUserCode } = $props()

    function askAssistant() {

    }

    function askForHelp() {

    }

    function explainCode() {
        const selectedCode = getSelectedCode()
        console.log('selectedCode', selectedCode)
    }

</script>


<style>

    .wrapper {
        display: flex;
        flex-direction: column;
        border-top: 1px solid var(--divider);
        border-left: 1px solid var(--divider);
        width: 100%;
        height: 100%;
        padding: 20px;
    }

    h2 {
        font-size: 16px;
        text-align: center;
        margin-bottom: 8px;
    }

    /* Chat Window */

    .chat-window {
        flex-grow: 1;
        margin: 8px 0;
        border-top: 2px solid var(--divider);
        border-bottom: 2px solid var(--divider);
        overflow: hidden;
    }

    .chat-input-wrapper {
        display: flex;
    }

    .chat-input {
        flex-grow: 1;
        background-color: var(--disabled);
        border-radius: 4px;
        border: none;
        padding: 12px 8px;
        height: 37px;
        margin-right: 4px;
        color: var(--text);
    }

    .chat-input:focus {
        box-shadow: 0 0 25px rgba(162, 58, 33, 0.4);
        outline: none;
        /*outline: 1px solid #a23a21;*/
    }

    .chat-input-wrapper > button {
        width: 50px;
        height: 37px;
    }

</style>
