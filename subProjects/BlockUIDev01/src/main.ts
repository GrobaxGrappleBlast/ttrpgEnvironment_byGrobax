
import App from './App.svelte'
import { TTRPGSystem } from './exported';

export function attachSvelte( container ){
	const app = new App(
		{
			target:container,
			system: new TTRPGSystem(),
		}
	);
}