
<div class="checkbox-wrapper">
    <input class="inp-cbx" id="checkbox-input" type="checkbox" bind:checked={_state} aria-checked={_state} />

    <label class="cbx" for="checkbox-input">
        <span class="label label-checkbox">{label}</span>

        <span class="checkbox-icon">
          <svg width="12px" height="10px" viewBox="0 0 12 10">
            <polyline points="1.5 6 4.5 9 10.5 1" fill="transparent"></polyline>
          </svg>
        </span>
    </label>
</div>



<script lang="ts">

    let { checked = $bindable(), label, inverse = false } = $props()

    let _state = $state(inverse ? !checked : checked)
    $inspect('_state:', _state)

    $effect(() => {
        if (inverse) {
            checked = !_state
        } else {
            checked = _state
        }
    })

</script>


<style>

    .checkbox-wrapper {
        margin-top: 12px;
    }

    .label-checkbox {
        margin-top: 0;
    }

    .cbx {
        display: flex;
        align-items: center;
        justify-content: space-between;

        cursor: pointer;
        user-select: none;
        transition: all 0.2s ease;
        border-radius: 6px;
    }

    .inp-cbx {
        position: absolute;
        visibility: hidden;
    }

    .checkbox-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border-radius: 4px;
        background-color: var(--editor);
        transition: all 0.2s ease;
    }

    .checkbox-icon svg {
        width: 12px;
        height: 10px;
        stroke: #fff;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-dasharray: 16px;
        stroke-dashoffset: 16px;
        transition: stroke-dashoffset 0.3s ease 0.1s;
    }

    .inp-cbx:checked + .cbx .checkbox-icon svg {
        stroke-dashoffset: 0;
    }

    @keyframes wave {
        50% {
            transform: scale(0.9);
        }
    }

</style>