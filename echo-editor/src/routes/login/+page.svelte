<div class="page">
    <div class="page-wrapper">

        <div class="header">
            <h1>Echo Editor</h1>
            <h2>Interaktiv Programmieren Lernen</h2>
        </div>

        <div class="panel">
            <div class="login division">

                <h3 class="title">Login</h3>
                <div class="title-decorator"></div>

                <form onsubmit={handleSubmit}>
                    <label>
                        Email
                        <input bind:value={email} type="email" name="email" placeholder="name@email.ch" class="input" required />
                    </label>
                    <label>
                        Passwort
                        <input bind:value={password} type="password" name="password" class="input" placeholder="top-secret" required />
                    </label>
                    <button type="submit" class="button button-primary">Login</button>
                </form>

                {#if showErrorMessage}
                    <div class="error-message">
                        Ungültiges Login
                    </div>
                {/if}

            </div>

            <div class="register division">
                <button class="button button-primary">Registrieren</button>
                <button class="button button-secondary">Passwort vergessen</button>
            </div>

            <div class="login-footer division">
                <a href="https://github.com/kevinloeffler/echo" target="_blank">Source Code</a>
                <a href="/impressum">Impressum</a>
            </div>
        </div>

    </div>
</div>


<script lang="ts">
    import {PUBLIC_API_URL_CLIENTSIDE} from '$env/static/public'
    import {goto} from '$app/navigation'

    let email = $state('')
    let password = $state('')

    let showErrorMessage = $state(false)

    async function handleSubmit(event: Event) {
        event.preventDefault()
        const form: Optional<HTMLFormElement> = event.target as Optional<HTMLFormElement>
        if (form?.checkValidity()) {
            const response = await fetch(`${PUBLIC_API_URL_CLIENTSIDE}/login`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const body = await response.json()
            if (response.status === 200 && body.login) {
                await goto('/')
            } else {
                showErrorMessage = true
            }
        }
    }

</script>


<style>

    .page-wrapper {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .panel {
        min-width: 400px;
        width: 50vh;
        max-width: 600px;
        background-color: var(--divider);
        border-radius: 12px;
        box-shadow: 0 0 40px 10px #0e1317;
    }

    h1 {
        font-size: 44px;
    }

    h2 {
        font-size: 20px;
        font-weight: 400;
    }

    .login, .register {
        border-bottom: 2px solid #6B738B;
    }

    .division {
        padding: 32px 36px;
    }

    .register {
        padding-bottom: 24px;
    }

    .title {
        font-size: 24px;
    }

    .title-decorator {
        width: 28px;
        height: 3px;
        background-color: var(--accent);
        margin-bottom: 28px;
    }

    label {
        margin-bottom: 4px;
    }

    .input {
        display: block;
        padding: 8px 12px;
        color: var(--text);
        background-color: var(--editor);
        border-radius: 4px;
        border: none;
        width: 100%;
        margin-top: 4px;
        margin-bottom: 8px;
    }

    .login-footer {
        display: flex;
        justify-content: space-between;
    }

    .login-footer > a {
        font-size: 11px;
        color: var(--text);
        text-decoration: none;
    }

    .error-message {
        width: 100%;
        text-align: center;
        padding: 8px;
        border: 2px solid #ff4141;
        border-radius: 8px;
        color: #ff4141;
        background-color: rgba(255, 65, 65, 0.05);
    }

</style>
