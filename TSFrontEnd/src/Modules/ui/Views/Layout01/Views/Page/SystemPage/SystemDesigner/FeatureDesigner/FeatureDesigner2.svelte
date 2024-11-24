<script lang="ts">
    
    import { afterUpdate, beforeUpdate, each } from "svelte/internal";
	import { GrobFeature_CalcReplacement, GrobFeature_Choice, GrobFeature_Multi, GrobFeature_StatIncrease_apply, GrobGroupDerived, GrobJDerivedNode, IFeature, IFeatureAllCombined } from "../../../../../../../../graphDesigner";
    import CustomSelect 		from "../../../../../../../Components/CustomSelect/CustomSelect.svelte";
    import { Layout01Context } 	from "../../../../../context";
    import { fly, slide } from "svelte/transition";
    import OriginRow from "../../../../OriginRow/OriginRow.svelte";
    import { GrobDerivedNode, keyManagerInstance, TTRPGSystem } from "ttrpg-system-graph";
    import { flip } from "svelte/animate";
    import OriginRowString from "../../../../OriginRow/OriginRowString.svelte";
    import OriginRowCollectionString from "../../../../OriginRow/OriginRowCollectionString.svelte";
    import DerivedItemDesigner from "../DerivedItemDesigner.svelte";
    import { UINode } from "../../../../../../../../graphDesigner/UIComposition/UINode";
    import ToogleSection from "../../../../../../../Components/toogleSection/toogleSection.svelte";
	import FeatureDesigner2 from './FeatureDesigner2.svelte'; 

	export let context	: Layout01Context; 
	$: system = context.activeFactory;
	export let feature : IFeatureAllCombined = {name :'', text : '' , type :''};
	export let level = 0;
	function fillFeatureMissingValues( feat: IFeatureAllCombined ){
		feat.key 				= feat.key ?? keyManagerInstance.getNewKey();
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
	let subFeatures: IFeatureAllCombined[] = [];
	$: isValid = _isValid(feature, subFeatures);
	let validationMessages : { type:string, msg:string}[] = []

	// validation.

	// calculation  
	let calcNode = new UINode( context.uiSystem , new GrobJDerivedNode() );

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

	// type section
	let _sectionType : string | null = feature.type;
	let _sectionTypes = level >= 2 ? 
	{
		'Text Feature'		: 'none',
		'Stat Increase'		: GrobFeature_StatIncrease_apply.getType(),
		'Node Replacement'	: GrobFeature_CalcReplacement.getType()
	}
	:
	{
		'Text Feature'		: 'none',
		'Stat Increase'		: GrobFeature_StatIncrease_apply.getType(),
		'Node Replacement'	: GrobFeature_CalcReplacement.getType(),
		'Multi Feature'		: GrobFeature_Multi.getType(),
		'Choice Feature'	: GrobFeature_Choice.getType()
	}
	if (!_sectionType){
		_sectionType = 'Text Feature';
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
		subFeatures.push( {name :'', text : '' , type :''} );
		subFeatures = subFeatures;
	}
	function _removeFeature(feat){
		subFeatures = subFeatures
		.filter( f => {
			if (f.key) { 
				return f.key != feat.key
			} 
			else 
			{ 
				return (f.name != feat.name && f.text != feat.text && f.type != feat.type) 
			}
		})
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
	function _isValid( _feature , _subFeatures ) : boolean{

		// if this is a multi type. then validate all subfeatures aswell
		if (feature.type ==  GrobFeature_Choice.getType() || feature.type == GrobFeature_Multi.getType()){

		}

		// if this is a stat increase then validate all options
		if (feature.type ==  GrobFeature_StatIncrease_apply.getType() ){

		}

		// if this is a calc. then validate the calculation
		if (feature.type == GrobFeature_CalcReplacement.getType()){

		}

		return true;
	}

</script>


<div class="FeatuerDesigner" data-level={level}>

		<!-- Validation Section -->
		<section>
			{#if isValid}
				<div>Valid</div>
			{:else}
				<div>Not Valid</div>
			{/if}
		</section>

		<!-- Editor Section -->
		<div  transition:slide|local >
		
			<section>
				<!--p>Name Of Feature</p-->
				<input 
					placeholder="Name Of Feature"
					type="text" 
					bind:value={feature.name}
				/>
			</section>
			<br>
			<section>
				<textarea  
					placeholder="Flavor text"
					bind:value={feature.text} 
					style={`grid-column:span 2;column:span 2;`}
				/>
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
			
			<!-- Choose Sub Nodes -->
			{#if feature.type && ( feature.type == GrobFeature_Choice.getType() )}
				<section class="featureContainer"  transition:slide|local>
					<div class="line" > 
						<p>Number of Choices Allowed</p>
						<input type="number" bind:value={feature.maxChoices} min="0" >
					</div>
					
				</section>
			{/if}

			{#if feature.type && (feature.type == GrobFeature_Multi.getType() || feature.type == GrobFeature_Choice.getType() )}
				<section class="featureContainer"  transition:slide|local>
					
					{#each subFeatures as feat}
						<button class="subFeatureBtn" on:click={ () => _removeFeature(feat)} >-</button>
						<FeatureDesigner2 
							feature={feat}
							level={level + 1}
							context={context}
						/>
					{/each}
					<button class="addFeatureButton" on:click={_addFeature} on:keyup >
						add new extra feature
					</button>
				</section>
			{/if}

			{#if feature.type && feature.type == GrobFeature_StatIncrease_apply.getType()}
				<section  transition:slide|local>
					<div class="line" >
						<p>Specifikly Allowed Nodes</p>
						<div>
							<button class="featureBtn" on:click={_addAllowedOrigins_specifik}> + </button>
						</div>
					</div>
					<div style="grid-column:span 2;">
						{#each allowedOrigins_specifikNodes as origin , i (origin.key) }
							<div animate:flip transition:fly|local={{x:100}} >  
									<OriginRowString
										bind:rowData 	 = { origin.value }
										system 			 = { system }
										context = {context}
										bind:target = {origin.target}
										on:onDelete 		= { () => _deleteAllowedOrigins_Specifik(i) }
										on:foundTargetNode = { _save }
									/> 
							</div>
						{/each}
					</div>

				</section>
			{/if }

			{#if feature.type && feature.type == GrobFeature_StatIncrease_apply.getType()}
				<section  transition:slide|local>
					<div class="line" >
						<p>Specifikly Allowed Collection's</p>
						<div>
							<button class="featureBtn" on:click={_addAllowedOrigins_collection}> + </button>
						</div>
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
				<section  transition:slide|local >
					<div style="grid-column:span 2;">
						<DerivedItemDesigner 
							node={calcNode}
							system={context.uiSystem}
							context={context} 
							hideSave={true}
						/>
					</div>
				</section>
			{/if }
		</div>

</div>
<style>
	.line{
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>