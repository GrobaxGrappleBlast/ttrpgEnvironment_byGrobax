<script lang="ts">
    import { onMount } from "svelte";
    import { GrobDerivedNode, GrobDerivedOrigin, TTRPGSystem, type GrobNodeType} from "../../../../../Designer";
	import { flip } from "svelte/animate";
	import './OriginEditor.scss'
    import OriginRow from "./OriginRowSimple.svelte";
    	import { crossfade, fade, scale, slide } from "svelte/transition";
    import { writable, type Writable } from "svelte/store";
    import { bounceInOut, circInOut, cubicInOut, quintOut } from "svelte/easing";

	export let node :GrobDerivedNode;
	export let system:TTRPGSystem;

	export	let errors : { key :string , msg:string , type:'error'|'verboose'|'good' }[] = [];
	export	let mappedOrigins: GrobDerivedOrigin[] = [];
			type originRowData = {key: string, segments:string[]|null , testValue :number, inCalc:boolean, target: GrobNodeType | null };
			let _mappedOrigins:originRowData[] = []	
	export	let calc: string ;  

	let symbolsInCalc : string[] = [];
	$: availableSymbols = _mappedOrigins.filter(p => p.segments === null ).map( p => p.key );
	let resultValue : any;
	let resultSuccess:boolean;
	
	onMount(()=>{ 
		mappedOrigins.forEach( ( p ) => {
			let segs = p.originKey?.split('.') ?? null;
			_mappedOrigins.push( {key:p.symbol , segments:segs , testValue: 1, inCalc:true, target: p.origin })
		}) 
	})

	function testCalcValue( calcValue : string ){
		
		// first test the calculation.
		let o = {};
		let mappedKeys : string[] = [];
		_mappedOrigins.forEach( p => { o[p.key]= p.testValue ; mappedKeys.push(p.key) } );
		let calcres = GrobDerivedNode.testCalculate( calcValue , o );
	
		// 	second calculate the symbols
		let symbData = GrobDerivedNode.staticParseCalculationToOrigins( calc );

		// save and proccess values 
		resultValue		= calcres.value;
		resultSuccess	= calcres.success;
		
		//Mapp items no longer in the calc for delete ready. And if they arent initialized, just delete them
		_mappedOrigins.forEach( d => {
			
			// set standard value to be overwritten if false
			d.inCalc=true;

			if (!symbData.contains(d.key) ){

				// set incalc // this updates ui with colors and such
				d.inCalc = false;
				
				// if its deleteable delete it. 
				if ( d.segments === null){
					_mappedOrigins.remove(d);
				}
			}
		})
		// For items not in the list, add them 
		symbData.forEach( s => {
			if ( !mappedKeys.contains(s) ){
				_mappedOrigins.push({key:s , segments:null , testValue: 1, inCalc:true, target : null })
			}
		})
		_mappedOrigins = _mappedOrigins;
	}	

	function fromPreOriginToOrigin( symbol ){
		 
		let orig = _mappedOrigins.find( p => p.key == symbol);
		if (!orig)
			return;
		
		if ( (orig.segments === null) ){
			orig.segments = new Array(3);
			_mappedOrigins=_mappedOrigins;
		}
		  


	 }

	export function trySave(){ 
		// ensure all is good BEFORE saving.
		testCalcValue(calc);
		if (!resultSuccess)
			return;

		// get a failsafe version of the data BEFORE SAVING
		//let before_Dependencies = node.getDependencies();
		//let before_calc			= node.getDependencies();
		//let before_depMap		= Object.entries(node.dependencies)
		//.reduce( (obj,[k,v]) => {
		//	obj[k] = v;
		//	return obj
		//} , {} )

		// validate that all inCalc are finished
		_mappedOrigins.forEach( o => {
			if (o.inCalc && !(o.target)){
				throw new Error(`Cannot save until all dependencies used in the calc is defined`);
			}
		})
		 
		//let test = node.parseCalculationToOrigins( calc );
		let deps = node.getDependencies();
		deps.forEach(d => {
			node.removeDependency(d);
		});

		// Set Calc and dependencies 
		node.setCalc(calc);
		_mappedOrigins.filter( p => p.inCalc );
		_mappedOrigins.forEach( o => {	
			if (!o.segments){
				throw new Error(`Contents of ${o.key}'s segments was Null!'`);
			}
			debugger;
			let dep = system.getNode(o.segments[0] as any,o.segments[1] as any ,o.segments[2] as any) ;
			if (!dep ){
				throw new Error(`Target of ${o.key} location ${o.segments[0] +'.'+ o.segments[1] +'.'+ o.segments[2] } was invalid!'`);
			}

			node.setOrigin( o.key , dep , o.testValue ?? 0 );
		});
		
	}

	export function getOriginsInCalc(){
		
	
	}

	const [send, receive] = crossfade({
		duration: 600,
		easing: cubicInOut
	});

	function onDelete( e ){
		const s0 = e.detail;
		let old : originRowData | undefined = _mappedOrigins.find( p => p.key == s0 );
		
		if (!old)
			return;

		if (old.segments === null){
			_mappedOrigins.remove(old);
		} else {
			if ( old.inCalc ){
				old.segments = null;
			}else {
				_mappedOrigins.remove(old);
			}
		}
		_mappedOrigins = _mappedOrigins;
	}

	function onSymbolSelected ( e ) {
		const s0 = e.detail.old;
		const s1 = e.detail.new; 
		let t0 : originRowData | undefined = _mappedOrigins.find( p => p.key == s0 );
		if (!t0)
			return;

		let t1 : originRowData | undefined = _mappedOrigins.find( p => p.key == s1 );
		if (!t1)
			return;

		// we eval if s0 is in the calc. then we need to exchange then delete. 
		t0.key = s1;
		t0.inCalc = calc.contains(s1);
		t1.key = s0;
		t1.inCalc = calc.contains(s0);
		_mappedOrigins = _mappedOrigins;
		return 
	}

</script>

<div class="OriginEditor">
	<div class="derivedCalcStatementRow" data-succes={resultSuccess} >
		<div>Calc</div>
		<input type="text" bind:value={calc} 
			on:input={ (e ) => { 
				//@ts-ignore
				const value= e.target?.value ;
				if(value)
					testCalcValue(value)
			}}
			placeholder="insert calcStatement here"
		/>
		<div class="derivedCalcStatementResult" data-succes={resultSuccess} >{resultValue}</div>
	</div>
	<div class="derivedOriginRowsContainer">
		{#each _mappedOrigins as origin (origin.key) }
			<div animate:flip transition:slide|local class="derivedOriginRowContainer">
				{#if origin.segments !== null}
					<div>
						<OriginRow 
							bind:rowData 		 = { origin }
							availableSymbols = { availableSymbols }
							system 			 = { system }
							on:onDelete = {  onDelete }
							on:onSymbolSelected ={ onSymbolSelected }
						/> 
					</div>
				{:else}
				<div  
					transition:slide|local
					class="derivedOriginAddARow" 
					on:keydown={ ()=> fromPreOriginToOrigin(origin.key) } 
					on:click={ ()=> fromPreOriginToOrigin  (origin.key) } 
				>
					<div> {origin.key} </div>
					<div> Click To Add a Origin </div>
				</div>
				{/if}
			</div>
		{/each}
	</div>
	<button on:click={trySave} >TRY SAVE</button>
</div>