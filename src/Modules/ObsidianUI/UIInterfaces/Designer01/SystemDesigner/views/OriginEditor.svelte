<script lang="ts">
    import { onMount } from "svelte";
    import { GrobDerivedNode, GrobDerivedOrigin, TTRPGSystem, type GrobNodeType} from "../../../../../../../src/Modules/Designer";
   
	import './OriginEditor.scss'
    import OriginRow from "./OriginRow.svelte";
    import { slide } from "svelte/transition";

	export let node :GrobDerivedNode;
	export let system:TTRPGSystem;

	let result 	: number | null = NaN;
	let resultSucces : boolean | number = NaN ;
	let calc 	= node.calc;

	let origins : Record<string , {obj:GrobDerivedOrigin | null, inCalc:boolean}  > = {}
	let pre_origins : string[] = []
	onMount(()=>{ 
		node.origins.forEach( origin  => {
			origins[origin.symbol] ={ obj: origin , inCalc:node.calc.contains(origin.symbol) };
		});
	})

	function testCalc ( e ){

		// test if the calculation is valid
		let calcValue = e.target.value ;
		let res = node.testCalculate( calcValue );
		result = res.value;
		resultSucces = res.success;

		
		// Get origins from the calculation
		let symbolsRes = node.parseCalculationToOrigins( calcValue )
		if (!symbolsRes)
			return;
		
		// remove from preorigins 
		let preOriginRemoves :string [] = [];
		pre_origins.forEach( o  => {
			if (!calc.contains(o))
				preOriginRemoves.push(o);
		});
		preOriginRemoves.forEach( o => {
			pre_origins.remove(o);
		})
		
		// if this cant be calculated do not continue
		if (!resultSucces){
			pre_origins = pre_origins;
			return;
		}


		// add symbols
		symbolsRes.symbolsToAdd.forEach( symbol => {
			
			// if it already exists, re-activate it
			let orig = origins[symbol];
			if (orig){
				origins[symbol].inCalc = true;
				return;
			}

			// else create a new "temp row"
			if (!pre_origins.contains(symbol))
				pre_origins.push(symbol);
		});
		
		// remove symbols
		symbolsRes.symbolsToAdd.forEach( symbol => {
			let orig = origins[symbol];
			if (orig){
				origins[symbol].inCalc = false;
			}
			 
		}); 

		

		pre_origins = pre_origins;
	}

	function fromPreOriginToOrigin( preorigin ){
		 
		if (!pre_origins.contains(preorigin))
			return;

		pre_origins.remove(preorigin);
		origins[preorigin] = {obj:null, inCalc:true};
		origins = origins;
		pre_origins=pre_origins;
	}

</script>

<div class="OriginEditor">
	<div class="derivedCalcStatementRow" data-succes={resultSucces} >
		<div>Calc</div>
		<input type="text" bind:value={calc} on:input={ (e) => testCalc(e) } placeholder="insert calcStatement here" />
		<div class="derivedCalcStatementResult" data-succes={resultSucces} >{result}</div>
	</div>
	<div class="derivedOriginRowsContainer">
		{#each Object.entries(origins) as [symbol, obj]}
			<OriginRow 
				symbol = { symbol }
				availableSymbols = { pre_origins }
				origin 	= { obj.obj }
				node 	= { node }
				system 	= { system }
				inCalc  = { calc.contains(symbol)  }
			/>
		{/each}
		{#each pre_origins as symbol}
			<div transition:slide|local class="derivedOriginRow" on:keydown={ ()=> fromPreOriginToOrigin(symbol) } on:click={ ()=> fromPreOriginToOrigin(symbol) } >
				<div> {symbol} </div>
				<div> Click To Add a Origin </div>
			</div>
		{/each}
		
	</div>
</div>