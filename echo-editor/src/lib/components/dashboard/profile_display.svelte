
<div class="profile block">
    <p class="profile-name">{user.name}</p>
    <p class="profile-role">{mapUserRoles(user.role)}</p>

    <div class="profile-divider"></div>

    <p class="profile-label">Organisation:</p>
    <p class="profile-text">{user.organisation}</p>

    {#if user.description}
        <p class="profile-label">Beschrieb:</p>
        <p class="profile-text">{user.description}</p>
    {/if}
    <button class="profile-logout-button" onclick={logout}>
        <img src="/images/logout-icon.svg" alt="Logout">
    </button>
</div>


<script lang="ts">
    import {mapUserRoles} from '$lib/util'
    import {PUBLIC_API_URL_CLIENTSIDE} from '$env/static/public'
    import {goto} from '$app/navigation'

    let { user } = $props()

    async function logout() {
        await fetch(`${PUBLIC_API_URL_CLIENTSIDE}/logout`, {
            method: 'GET',
            credentials: 'include',
        })
        await goto('/login')
    }

</script>


<style>

    .block {
        background-color: var(--divider);
        border-radius: 12px;
        margin-bottom: 20px;
        overflow: hidden;
    }

    .profile {
        position: relative;
        padding: 32px;
    }

    .profile-name {
        font-size: 18px;
        font-weight: 600;
    }

    .profile-role {
        font-size: 11px;
    }

    .profile-divider {
        margin: 12px 0;
        border-bottom: 2px solid #6B738B;
    }

    .profile-label {
        font-size: 11px;
        color: #A9A9A9;
        margin-top: 8px;
    }

    .profile-logout-button {
        position: absolute;
        top: 32px;
        right: 32px;

        background-color: var(--button-secondary);
        cursor: pointer;
        border-radius: 4px;
        width: 36px;
        padding: 10px;
        border: none;

        transition: background-color 200ms;
    }

    .profile-logout-button:hover {
        background-color: #3e577e;
    }

</style>