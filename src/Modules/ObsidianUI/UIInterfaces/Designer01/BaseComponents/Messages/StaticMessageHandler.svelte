<script context="module" lang="ts">
	export 	const MessageTypes = {
		error	:"error",
		verbose	:"verbose", 
		good	:"good"
	}
	export type MessageTypeTypes = keyof typeof MessageTypes;
</script> 
<script lang="ts">
    import { slide } from "svelte/transition";
	import './StaticMessageHandler.scss'; 
    import { ok } from "assert";
    import { slidefade } from "../../Transitions/SlideFly";
    import { writable, type Writable } from "svelte/store";
    import { flip } from "svelte/animate";

	let messages : Writable<Record<any,{msg:string, type : MessageTypeTypes}>> = writable({});
	let messagesLength =  Object.entries(messages).length;
	let entries : [any,{msg:string, type : MessageTypeTypes}] [] = [];
	export let overrideClick : (( key : any ) => any ) | null = null ;
	export let overrideClickText : string | null = null;

	messages.subscribe( p => { 
		entries =  Object.entries(p);
		messagesLength = entries.length; 
	})

	export function addMessage( key: any , msg : {msg:string, type : MessageTypeTypes } ){  
		
		if(!msg)
			return;

		if(!msg.type)
			msg.type = 'error';
		
		messages.update( r => {
			r[key] = msg 
			return r;
		})
	}
	export function addMessageManual( key: any , msg : string , type : MessageTypeTypes = 'error' ){  
		messages.update( r => {
			r[key] = {msg:msg,type:type}; 
			return r;
		})
	}
	export function removeError( key : any ){  
		messages.update( r => {
			delete r[key]; 
			return r;
		}) 
	}
	export function removeAllMessages(  ){ 
		messages.update( r => {
			return {};
		})
	}

	function onclick(key){  
		if (overrideClick){
			overrideClick( key )
		}else{
			removeError( key );
		}
	}
	
</script>

<div class="ErrorHandlerSignageContainer" >
	{#if messagesLength != 0} 
		<div class="ErrorHandlerSignage" transition:slide|local >
			{#each entries as [key, obj] (key) } 
				{@const msgTransformed = obj.msg.replace('\n','<br />')}
				<div 
				transition:slide|local
				animate:flip

				class={ 
					(obj.type == MessageTypes.error) ? "ErrorHandlerSign" : 
					(obj.type == MessageTypes.verbose) ?  "VerboseHandlerSign" : 
					(obj.type == MessageTypes.good) ?  "OKHandlerSign" : 
					''
				} 
				on:keydown={ () =>	{ onclick(key)} }
				on:click={ () =>	{ onclick(key)} }
				> 
					
					<p>{@html msgTransformed }</p>
					{#if overrideClickText }
						<i>{overrideClickText}</i>
					{/if}
				</div>
			{/each}
		</div> 
	{/if}
</div>