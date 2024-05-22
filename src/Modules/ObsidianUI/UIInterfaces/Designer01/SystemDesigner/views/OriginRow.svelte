<script lang="ts">
	import CustomSelect from "../../BaseComponents/CustomSelect/CustomSelect.svelte";
	import './OriginEditor.scss';
</script>
<div class="derivedOriginRow" >
	<input type="text" maxlength=2 placeholder="@x" />
	<CustomSelect options={['fixed','derived']}  />
	<CustomSelect options={[]} />
	<CustomSelect options={[]}/>
</div>