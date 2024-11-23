<script lang="ts">
    
    import { afterUpdate, beforeUpdate, each } from "svelte/internal";
import { GrobFeature_CalcReplacement, GrobFeature_Choice, GrobFeature_Multi, GrobFeature_StatIncrease_apply, IFeature, IFeatureAllCombined } from "../../../../../../../../../../src/Modules/graphDesigner";
    import CustomSelect 		from "../../../../../../../../../../src/Modules/ui/Components/CustomSelect/CustomSelect.svelte";
    import { Layout01Context } 	from "../../../../../../../../../../src/Modules/ui/Views/Layout01/context";
    import { fly, slide } from "svelte/transition";
    import OriginRow from "../../../../OriginRow/OriginRow.svelte";
    import { keyManagerInstance, TTRPGSystem } from "ttrpg-system-graph";
    import { flip } from "svelte/animate";
    import OriginRowString from "../../../../OriginRow/OriginRowString.svelte";
    import OriginRowCollectionString from "../../../../OriginRow/OriginRowCollectionString.svelte";

	export let context	: Layout01Context; 
	$: system = context.activeFactory;
	let feature : IFeatureAllCombined = {name :'unknown', text : 'unknown' , type :'unknown'};
	function fillFeatureMissingValues( feat: IFeatureAllCombined ){
		feat.features			= feat.features				?? [];  //?: IFeatureAllCombined[],
		feat.sources			= feat.sources				?? [];  //?: Feature_Origin_Node[],
		feat.sourceItems		= feat.sourceItems			?? [];  //?: string[],
		feat.sourceCollections	= feat.sourceCollections	?? []; 	 //?: string[],
		feat.calc				= feat.calc					?? '0';  //?: string,
		feat.maxChoices			= feat.maxChoices			?? 0; 	 //?: number,
		feat.increaseSize		= feat.increaseSize			?? 0;  //?: number,
		feat.increaseNumTargets	= feat.increaseNumTargets	?? 0; //?: number
	}
	fillFeatureMissingValues(feature);
	// feature.sourceItems = [
	// 	'fixed.stats.charisma',
	// 	'fixed.stats.intelligence',
	// 	'fixed.stats.dexterity',
	// 	'fixed.stats.constitution',
	// 	'fixed.stats.wisdom',
	// 	'fixed.stats.intelliganso',
	// ];
	feature.sourceCollections = [
		'fixed.stats',
		'fixed.modifiers'
	];

	let subFeatures: IFeature[] = [];

	// if Statincrease. 
	type stringDataPair = { key : any , value: any , target? : any };
	let allowedOrigins_specifikNodes 	: stringDataPair[] = []
	let allowedOriring_collections 		: stringDataPair[] = [];
	(feature.sourceItems ?? []).forEach( v => {
		allowedOrigins_specifikNodes.push({ key : keyManagerInstance.getNewKey(), value:v });
	});
	(feature.sourceCollections ?? []).forEach( v => {
		allowedOriring_collections.push({ key : keyManagerInstance.getNewKey(), value:v });
	});

	$: isValid = [allowedOriring_collections, allowedOrigins_specifikNodes].reduce((acc, array) => {
		return acc && array.every(item => item.target ? true : false );
	}, true);

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
		var row = 'unknown.unknown.unknown';
		allowedOrigins_specifikNodes.push({key:keyManagerInstance.getNewKey() , value:row });
		allowedOrigins_specifikNodes	= allowedOrigins_specifikNodes;
		_save()
	}
	function _addAllowedOrigins_collection(){
		var row = 'unknown.unknown';
		allowedOriring_collections.push({key:keyManagerInstance.getNewKey() , value:row });
		allowedOriring_collections	= allowedOriring_collections;
		_save()
	}
	function _deleteAllowedOrigins_Specifik( index ){
		allowedOrigins_specifikNodes.splice(index, 1);
		allowedOrigins_specifikNodes = allowedOrigins_specifikNodes;
		_save()
	}
	function _deleteAllowedOrigins_collection( index ){
		allowedOriring_collections.splice(index, 1);
		allowedOriring_collections = allowedOriring_collections;
		_save()
	}
	function _save(){
		feature.sourceItems = allowedOrigins_specifikNodes.map( p => p.value )
		feature.sourceCollections	= allowedOriring_collections.map( p => p.value )
	}

</script>


<div class="FeatuerDesigner" >

	<section>
		{#if isValid}
			<p>Feature is Valid<span>&#10003;</span></p>
		{:else}
			<p>Feature is Valid <span>&#10540;</span></p>
		{/if}
	</section>

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
				{#each allowedOrigins_specifikNodes as origin , i (origin.key) }
					<div animate:flip transition:fly|local={{x:100}} > 
						<!--{#key origin}-->
							<OriginRowString
								bind:rowData 	 = { origin.value }
								system 			 = { system }
								context = {context}
								bind:target = {origin.target}
								on:onDelete 		= { () => _deleteAllowedOrigins_Specifik(i) }
								on:foundTargetNode = { _save }
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
				{#each allowedOriring_collections as origin,i (origin.key) }
					<div animate:flip transition:fly|local={{x:100}}> 
						<OriginRowCollectionString
							bind:rowData 	 = { origin.value }
							system 			 = { system }
							context = {context}
							bind:target = {origin.target}
							on:foundTargetNode = { _save }
							on:onDelete 		= { () => _deleteAllowedOrigins_collection(i) }
						/>
					</div>
				{/each}
			</div>

		</section>
	{/if }

	{#if feature.type && feature.type == GrobFeature_CalcReplacement.getType()}
		<section  transition:slide|local>
 
		</section>
	{/if }


	
</div>