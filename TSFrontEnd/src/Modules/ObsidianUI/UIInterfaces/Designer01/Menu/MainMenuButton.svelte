<script lang="ts">
	import './MainMenuButton.scss'
	export let selected:boolean = false ;
	export let disabled : boolean = false;
	export let text : string = 'Select';
	export let onClick : () => any ;
</script>


<div class="MainMenuButton" >
	<div class="MainMenuButton_icon" data-selected={selected} data-disabled={disabled} on:click={ onClick } >
		{text}
	</div>
	<div class="MainMenuButton_desc">
		<p>System Selector		</p>
	</div>
</div>