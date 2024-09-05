<script context="module" lang="ts">
    class SpellInfoData {
        public showStat: string = "";
    }
</script>

<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { system, TNode } from "../../declaration";
    import { CNode, keyManager } from "../Structure/ComponentNode"; 

    export let sys: system;
    export let edit: boolean;
    export let data: CNode;
    const KEY = keyManager.getNewKey();

    let dataData: SpellInfoData = data.data;
	let spellBonusChoices = sys.getNodeNames('derived','Spell Bonus');

    if (JSON.stringify(dataData) === JSON.stringify({})) {
        dataData.showStat = spellBonusChoices[0];
    }

    let showStat: string = dataData.showStat;
    //@ts-ignore
    let nodeDC: TNode		= sys.getNode('derived','Spell Bonus',showStat) ;
    //@ts-ignore
    let nodeBonus: TNode	= sys.getNode('derived','Spell DC',showStat) ;

    let chosen_DC = nodeDC.getValue();
    let chosen_BONUS = nodeBonus.getValue();
    let sortSelect: HTMLSelectElement;

    function changeSort() {
        let value = sortSelect.value;
        showStat = value;
        //@ts-ignore
        nodeDC		= sys.getNode('derived','Spell Bonus',showStat);
        //@ts-ignore
        nodeBonus	= sys.getNode('derived','Spell DC',showStat);
        chosen_DC = nodeDC.getValue();
        chosen_BONUS = nodeBonus.getValue();
    }

    function update() {
        chosen_DC = nodeDC.getValue();
        chosen_BONUS = nodeBonus.getValue();
    }

    function addListeners() {
        nodeDC.addUpdateListener(name + "SpellInfoView" + KEY, () => {
            update();
        });
        nodeBonus.addUpdateListener(name + "SpellInfoView" + KEY, () => {
            update();
        });
    }
    onMount(() => {
        addListeners();
    });
    function removeListener() {
        nodeDC.removeUpdateListener(name + "SpellInfoView" + KEY);
        nodeBonus.removeUpdateListener(name + "SpellInfoView" + KEY);
    }
    onDestroy(() => {
        removeListener();
    });
</script>

<div>
    {#if edit}
        <div>
            <select bind:this={sortSelect} on:change={changeSort}>
                {#each spellBonusChoices as key}
                    <option value={key} selected={key == showStat}>
                        {key}
                    </option>
                {/each}
            </select>
        </div>
    {:else}
        <div></div>
    {/if}

    <div class="spellDCContainer">
        <div>{showStat}</div>
        <div>
            <div>Spell DC</div>
            <div>{chosen_DC}</div>
        </div>

        <div>
            <div>Spell Bonus</div>
            <div>{chosen_BONUS}</div>
        </div>
    </div>
</div>
