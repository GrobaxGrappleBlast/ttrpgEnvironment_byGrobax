<script lang="ts">
    import { slide } from "svelte/transition";


    export let checked = false;

</script>
<div class="CheckMark" data-checked={checked} >
    {#if checked } 
        <div transition:slide class="CheckMarkSymbol"></div>
    {:else}
        <div transition:slide class="CheckMarkSymbol"></div>
    {/if}
</div>

<style lang="scss">
    @import './../../../ui/Views/Layout01/appBaseStyles.scss';
    :global {
        .CheckMark{
            background-color: $COLOR3;
            &[data-checked="true"]{
                background-color: $COLOR3;
            }
            &[data-checked="false"]{
                background-color: $COLOR1;
            }
        }
    }
</style>