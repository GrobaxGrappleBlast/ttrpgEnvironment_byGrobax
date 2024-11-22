<script lang="ts">
    
    import { afterUpdate, beforeUpdate, each } from "svelte/internal";
import { GrobFeature_CalcReplacement, GrobFeature_Choice, GrobFeature_Multi, GrobFeature_StatIncrease_apply, IFeature } from "../../../../../../../../../../src/Modules/graphDesigner";
    import CustomSelect 		from "../../../../../../../../../../src/Modules/ui/Components/CustomSelect/CustomSelect.svelte";
    import { Layout01Context } 	from "../../../../../../../../../../src/Modules/ui/Views/Layout01/context";
    import { fly, slide } from "svelte/transition";
    import OriginRow from "../../../../OriginRow/OriginRow.svelte";
    import { TTRPGSystem } from "ttrpg-system-graph";
    import { flip } from "svelte/animate";
    import OriginRowString from "../../../../OriginRow/OriginRowString.svelte";

	export let context	: Layout01Context; 
	$: system = context.activeFactory;
	let feature : IFeature = {name :'unknown', text : 'unknown' , type :'unknown'};
	let subFeatures: IFeature[] = [];

	// if Statincrease. 
	let allowedOrigins_specifikNodes 	: string[] = [
		'fixed.stats.charisma',
		'fixed.stats.intelligense',
		'fixed.stats.dexterity',
		'fixed.stats.constitution',
		'fixed.stats.wisdom',
		'fixed.stats.intelligense',
		'fixed.stats.charisma',
		'fixed.stats.intelliganso',
		'fixed.stats.dexterity',
		'fixed.stats.constitution',
		'fixed.stats.wisdom',
		'fixed.stats.intelligense',
		'fixed.stats.charisma',
		'fixed.stats.intelligense',
		'fixed.stats.dexterity',
		'fixed.stats.constitution',
		'fixed.stats.wisdom',
		'fixed.stats.intelligense',
	];
	let allowedOriring_collections 		: string[] = [];

	// type section
	let _sectionType : string | null = feature.type;
	let _sectionTypes = {
		'Text Feature'		: 'none',
		'Stat Increase'		: GrobFeature_StatIncrease_apply.getType(),
		'Node Replacement'	: GrobFeature_CalcReplacement.getType(),
		'Multi Feature'		: GrobFeature_Multi.getType(),
		'Choice Feature'	: GrobFeature_Choice.getType()
	}
	
	// boolean section
	let _sectionFlavorText_Minimized = false;

	function _sectionFlavorText_onToogle () {
		_sectionFlavorText_Minimized = !_sectionFlavorText_Minimized
	}
	function _selectType (sel){

		const type = _sectionTypes[sel.detail];
		if(!type){
			console.error('Did not recognise selection')
			return;
		} 
		
		//_sectionType = type;
		feature.type = type;
		feature = feature;
	}
	function _addFeature(){
		subFeatures.push( {name :'unknown', text : 'unknown' , type :'unknown'} );
		subFeatures = subFeatures;
	}
	function _addAllowedOrigins_specifik(){

		allowedOrigins_specifikNodes.push('unknown.unknown.unknown');
		allowedOrigins_specifikNodes = allowedOrigins_specifikNodes;
	}
	function _addAllowedOrigins_collection(){
		allowedOriring_collections.push('unknown.unknown');
		allowedOriring_collections = allowedOriring_collections;
	}
	function _deleteAllowedOrigins_Specifik( index ){
		allowedOrigins_specifikNodes.splice(index, 1);
		allowedOrigins_specifikNodes = allowedOrigins_specifikNodes;
	}
	function _deleteAllowedOrigins_collection( index ){
		allowedOriring_collections.splice(index, 1);
		allowedOriring_collections = allowedOriring_collections;
	}

</script>


<div class="FeatuerDesigner" >

	<section>
		<p>feature type</p>
		<div class="interactive" >
			<CustomSelect 
				context={context}
				options={Object.keys(_sectionTypes)}
				selected={_sectionType };
				on:onSelect={ _selectType }
			/>
		</div>
	</section>

	<section>
		<p>Name Of Feature</p>
		<input type="text" />
	</section>

	<section>
		<p>Flaver Text</p>
		{#if _sectionFlavorText_Minimized }
		<div>
			<button class="featureBtn" on:click={ _sectionFlavorText_onToogle }>+</button>
		</div>
		<input 
			type="text" 
			bind:value={feature.text} 
			style="grid-column:span 2;"
			/>
		{:else}
			<div>
				<button class="featureBtn" on:click={ _sectionFlavorText_onToogle }>-</button>
			</div>
			<textarea  
				bind:value={feature.text} 
				style={`grid-column:span 2;column:span 2;`}
			/>
		{/if}
	</section>

	<!-- Choose Sub Nodes -->
	{#if feature.type && (feature.type == GrobFeature_Multi.getType() || feature.type == GrobFeature_Choice.getType() )}
		<section class="featureContainer"  transition:slide|local>
			{#each subFeatures as feat}
				<div class="SubFeatureBtn" data-filled='true' >
					
				</div>
			{/each}
			<div class="SubFeatureBtn" data-filled='false' on:click={_addFeature} on:keyup ></div>
		</section>
	{/if}

	{#if feature.type && feature.type == GrobFeature_StatIncrease_apply.getType()}
		<section  transition:slide|local>

			<p>Specifikly Allowed Nodes</p>
			<div>
				<button class="featureBtn" on:click={_addAllowedOrigins_specifik}> + </button>
			</div>
			<div style="grid-column:span 2;">
				{#each allowedOrigins_specifikNodes as origin , i (i) }
					<div animate:flip  > 
						<!--{#key origin}-->
							<OriginRowString
								bind:rowData 	 = { origin }
								system 			 = { system }
								context = {context}
								on:onDelete 		= { () => _deleteAllowedOrigins_Specifik(i) }
							/>
						<!--{/key}-->
					</div>
				{/each}
			</div>

		</section>
	{/if }

	{#if feature.type && feature.type == GrobFeature_StatIncrease_apply.getType()}
		<section  transition:slide|local>

			<p>Specifikly Allowed Collection's</p>
			<div>
				<button class="featureBtn" on:click={_addAllowedOrigins_collection}> + </button>
			</div>
			<div style="grid-column:span 2;">
				{#each allowedOriring_collections as origin,i (i) }
					<div animate:flip transition:slide|local > 
						<OriginRowString
							bind:rowData 	 = { origin }
							system 			 = { system }
							context = {context}
							on:onDelete 		= { () => _deleteAllowedOrigins_collection(i) }
						/>
					</div>
				{/each}
			</div>

		</section>
	{/if }


	
</div>