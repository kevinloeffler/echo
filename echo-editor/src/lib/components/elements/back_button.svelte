<a href={link}>
    <img src="/images/arrow-back.svg" alt="Pfeil Zurück">
    {text}
</a>


<script lang="ts">

    let { link, text = 'Zurück' } = $props()

</script>


<style>

    a {
        color: var(--accent);
        display: inline-flex;
        font-size: 11px;
        text-decoration: none;
        padding: 4px 6px;
        margin-left: -4px;
        border-radius: 6px;
    }

    a:hover {
        background-color: var(--editor);
    }

    img {
        width: 6px;
        margin-right: 4px;
    }

</style>
