<script lang="ts">
    import EditAbleList from "../../../../../../../../../src/Modules/ui/Components/editAbleList/EditAbleList.svelte";


</script>
<div>
    <section>
        <br>
        <div>
            <b>UI-theme's</b>
            <div>
                <p> author : </p>
                <p> version : </p>
            </div>
        </div>
        <div>
            <EditAbleList
                isEditableContainer={false}
                collection= { ['theme - A','theme - B','theme - C'] }
                onSelect={ (e) => { return true; } } 
                on:onDeSelect={ ()=>{} }
            /> 
        </div>
    </section>  
    <br>
    <section>
        <div>
            <div> 
                Export New UI Project
            </div>
            <div>
                use this as a base for a ui theme that can be used for character sheets. 
            </div>
        </div>
        <div>
            <div> 
               Import a UI project
            </div>
            <div>
                click her, to Open Importer. 
            </div>
        </div>
    </section>  
</div>