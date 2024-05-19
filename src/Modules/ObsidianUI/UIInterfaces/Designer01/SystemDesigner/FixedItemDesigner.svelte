<script lang="ts">
    import { GrobFixedNode } from "../../../../../../src/Modules/Designer";
	import './ItemDesigner.scss'

	export let node : GrobFixedNode;

</script>
<div>
	<div>
		<p>
			Editing node.
			Here you can edit settings for this specific node. this edit is unique to this specific item.
		</p>
	</div>
	<div class="ItemDesigner_TwoColumnData" >
		<div>Node Name</div>
		<div>{node.name}</div>

		<div>Node Location</div>
		<div>{ (node.parent?.parent?.name ?? 'unknown collection') + '.' +(node.parent?.name ?? 'unknown collection') + '.' + node.name}</div>

		<div>Standard Value</div>
		<div>{ node.___value }</div>

	</div>
</div>