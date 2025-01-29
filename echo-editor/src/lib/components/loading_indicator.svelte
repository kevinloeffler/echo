
<div class="wrapper" style="width: {width}">
    <div class="indicator"></div>
</div>


<script lang="ts">

    let { width = '80px' } = $props()

</script>


<style>

    .wrapper{
        width: 100%;
        height: 8px;
        overflow: hidden;
        background-color: var(--editor);
        border-radius: 10px;
        position: relative;
    }

    .indicator {
        width: 100%;
        height: 100%;
        border-radius: 10px;
        background-color: var(--accent);
        position: absolute;
        animation: slide 2s cubic-bezier(0.6, 0, 0.4, 1) infinite;
    }

    @keyframes slide {
        0% {
            left: -90%; /* Start just outside the left edge */
        }
        50% {
            left: 90%; /* Move to the right edge */
        }
        100% {
            left: -90%; /* Loop back to the starting position */
        }
    }

</style>
