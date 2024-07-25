
import App from './App.svelte'
import { TTRPGSystem } from './exported';

console.log('START')
export function attachSvelte( container ){
	const app = new App(
		{
			target:container
		}
	);
}
console.log('HAS STARTED')