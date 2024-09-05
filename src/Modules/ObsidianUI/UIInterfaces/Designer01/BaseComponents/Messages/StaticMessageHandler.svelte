<script context="module" lang="ts">
	export 	const MessageTypes = {
		error	:"error",
		verbose	:"verbose", 
		good	:"good"
	}
	export type MessageTypeTypes = keyof typeof MessageTypes;
</script> 
<script lang="ts">
 
	import './StaticMessageHandler.scss';  
	import { slide } from "svelte/transition"; 
    import { writable , type  Writable } from 'svelte/store';
    import { flip } from 'svelte/animate';

	let messages : Writable<Record<any,{msg:string, type : MessageTypeTypes}>> = writable({});
	let messagesLength =  Object.entries(messages).length;
	let entries : [any,{msg:string, type : MessageTypeTypes}] [] = [];
	export let overrideClick : (( type:string ,key : any ) => any ) | null = null ;
	export let overrideClickTextError : string | null = null;
	

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

			if(!r[key])
				return r;

			delete r[key]; 
			return r;
		}) 
	}
	export function removeAllMessages(  ){ 
		messages.update( () => {
			return {};
		})
	}

	function onclick(type:any,key:any){ 
		
		let a = true;
		if (overrideClick)
			a = overrideClick(type, key )
		
		if (a){
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
				role="none"
				class={ 
					(obj.type == MessageTypes.error) ? "ErrorHandlerSign" : 
					(obj.type == MessageTypes.verbose) ?  "VerboseHandlerSign" : 
					(obj.type == MessageTypes.good) ?  "OKHandlerSign" : 
					''
				} 
				on:keydown={ () =>	{ onclick(obj.type,key)} }
				on:click={ () =>	{ onclick(obj.type,key)} }
				> 
					
					<p>{@html msgTransformed }</p>
					{#if overrideClickTextError && obj.type == MessageTypes.error }
						<i>{overrideClickTextError}</i>
					{/if}
				</div>
			{/each}
		</div> 
	{/if}
</div>