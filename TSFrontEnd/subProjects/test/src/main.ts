
import { mount } from 'svelte'
import './app.css' 
import App from './App.svelte';

class AppWrapper {

	private instance: App;
  
	constructor(target: HTMLElement, props?: { name?: string }) {
	  this.instance = new App({
		target,
		props: {
		  
		},
	  });
	}
   
}
 
const app = mount(App, {
  target: document.getElementById('app')!,
})
 
export default app