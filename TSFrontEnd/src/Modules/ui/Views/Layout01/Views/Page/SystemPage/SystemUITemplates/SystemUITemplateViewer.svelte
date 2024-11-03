<script lang="ts">
    import { onMount } from "svelte";
    import { Layout01Context } from "../../../../context";
    import { SystemExporterMethods } from "./SystemExporterMethods";
    import { UITemplate } from "../../../../../../../../../src/Modules/core/model/UITemplate";
   
    export let context :Layout01Context;
    export let uitemplate : UITemplate;
    let container: HTMLDivElement;

    onMount(()=>{
        SystemExporterMethods.getAndCreateUITemplateComponent(
            context,
            context.activeSystem,
            uitemplate.name,
            container,
            ( e,a ) => {}
        )
    }) 
</script>

<div>
    <div bind:this={container} ></div>
</div>