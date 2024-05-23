<script lang="ts">
    import { onMount } from "svelte";
    import { GrobDerivedNode, GrobDerivedOrigin, TTRPGSystem, type GrobNodeType} from "../../../../../Designer";
	import { flip } from "svelte/animate";
	import './OriginEditor.scss'
    import OriginRow from "./OriginRow.svelte";
    import { crossfade, fade, scale, slide } from "svelte/transition";
    import { writable, type Writable } from "svelte/store";
    import { bounceInOut, circInOut, cubicInOut, quintOut } from "svelte/easing";

	export let node :GrobDerivedNode;
	export let system:TTRPGSystem;

	let result 	: number | null = NaN;
	let resultSucces : boolean | number = NaN ;
	let calc 	= node.calc;
	let symbolsInCalc : string[] = [];

	let origins : Writable<Record<string , {obj:GrobNodeType | null, inCalc:boolean} | null   >> = writable({})
	let availableSymbols : string [] = []
	origins.subscribe( d => { 
		availableSymbols = Object.entries(d)
		.filter( p => p[1] == null )
		.map(([key, value]) => key);
	}) 
	

	onMount(()=>{ 
		origins.update( data => {
			node.origins.forEach( origin  => {
				data[origin.symbol] ={ obj: origin.origin , inCalc:node.calc.contains(origin.symbol) };
			});
			return data;
		})
	})

	function testCalc ( e ){

		// test if the calculation is valid
		let calcValue = e.target.value ;
		testCalcValue(calcValue);
	}

	function testCalcValue( calcValue : string ){
		
		origins.update( data => {
			let res = node.testCalculate( calcValue );
			result = res.value;
			resultSucces = res.success;

			// Get origins from the calculation
			let symbolsRes = node.parseCalculationToOrigins( calcValue )
			symbolsInCalc = symbolsRes?.totalSymbols ?? [];
			if (!symbolsRes)
				return data;
			
			// remove if not origin but a Null value 
			// a null Value is a "click Here to Add Row"
			for (const key in data){
				const orig = data[key];
				if (!orig && !calc.contains(key)){
					delete data[key];
				}
			}

			// add symbols
			symbolsRes.symbolsToAdd.forEach( symbol => {
				
				// if it already exists, re-activate it
				let orig = data[symbol];
				if (orig){
					orig.inCalc = true;
					return;
				}

				// else create a new "temp row"
				if ( (data[symbol] == undefined) )
					data[symbol] = null;
			});
			
			// remove symbols
			symbolsRes.symbolsToAdd.forEach( symbol => {
				let orig = data[symbol];
				if (orig){
					orig.inCalc = false;
				}
			}); 
			return data;
		})
	}

	function fromPreOriginToOrigin( symbol ){
		 
		
		if ( ($origins[symbol] === undefined) || $origins[symbol] != null ){ 
			return;
		}
		
		origins.update( data => {  
			data[symbol] = {obj:null, inCalc:true};
			return data;
		})

	}

	export function trySave(){
		
		testCalcValue(calc);
		let obj : { origins:GrobNodeType[], errorMessages:string[]  } =  { origins :[], errorMessages:[]  };
		for(let i = 0; i < symbolsInCalc.length; i++){
			const symbol = symbolsInCalc[i];
			const orig = $origins[symbol];

			if( !orig || !orig.obj  ){
				obj.errorMessages.push( symbol + " Origin was missing" )
				continue;
			}
			else if (!orig.inCalc){
				obj.errorMessages.push( symbol + " Is not in the calculation, please remove it before saving." )
				continue;
			} 
			obj.origins.push( orig.obj );
		}

		if (!resultSucces){
			obj.errorMessages.push( "Calculation is invalid, The calculation must result in a numeric value" )
		}
		return obj;
	}
 
	const [send, receive] = crossfade({
		duration: 600,
		easing: cubicInOut
	});

</script>

<div class="OriginEditor">
	<div class="derivedCalcStatementRow" data-succes={resultSucces} >
		<div>Calc</div>
		<input type="text" bind:value={calc} on:input={ (e) => testCalc(e) } placeholder="insert calcStatement here" />
		<div class="derivedCalcStatementResult" data-succes={resultSucces} >{result}</div>
	</div>
	<div class="derivedOriginRowsContainer">
		{#each Object.entries($origins) as [symbol, obj] (symbol) }
			<div animate:flip transition:slide|local class="derivedOriginRowContainer">
				{#if obj != null}
					<div
						transition:slide|local
					>
						<OriginRow 
							symbol = { symbol }
							availableSymbols = { availableSymbols }
							bind:origin 	= { obj.obj } 
							system 	= { system }
							inCalc  = { calc.contains(symbol)  }
							on:onDelete = { (e) =>{  
								const s0 = e.detail;
								origins.update(data => {
									if (calc.contains(s0)){
										data[s0] = null;
									}else{
										delete data[s0];
									}
									return data;
								})
							
							}}
							on:onSymbolSelected ={ (e) => {

								const s0 = e.detail.old;
								const s1 = e.detail.new;

								origins.update(data => {
									let d =  data[s0]
									if (calc.contains(s0)){
										data[s0] = null;
									}else{
										delete data[s0];
									}
									data[s1] = d; 
 
									return data;
								}) 
							}}
						/>
					</div>
				{:else}
					<div  
						transition:slide|local
						class="derivedOriginAddARow" 
						on:keydown={ ()=> fromPreOriginToOrigin(symbol) } 
						on:click={ ()=> fromPreOriginToOrigin(symbol) } 
					>
						<div> {symbol} </div>
						<div> Click To Add a Origin </div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>