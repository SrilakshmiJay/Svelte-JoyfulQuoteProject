<script>
    import Modal from './Modal.svelte';
    import {yourMessage} from './stores.js'; 
    import {authorMessage} from './stores.js'; 
    import {genreMessage} from './stores.js';

  /*   yourMessage.subscribe((value)=>{yMessage = value;}); 
    authorMessage.subscribe((value)=>{afinalMessage = value;});
    genreMessage.subscribe((value)=>{gfinalMessage = value;});  */
   
    let showModal = false;
	let count = 0;
    let total = 0;
    let yes = false;
    let size = 'small';
	let colors = ['Black'];
   
	let menu = [
		'Black',
		'White',
		'Pink'
	];

	function join(colors) {
		if (colors.length === 1) return colors[0];
		return `${colors.slice(0, -1).join(', ')} and ${colors[colors.length - 1]}`;
	}

    $: total = colors.length * 14.99;
 


    
</script>

<style>

h2{
    font-size:30px;
    color:rgb(155, 52, 86);
}

button{
  margin-top: 20px;
  color:rgb(155, 52, 86);
  font-family: 'Solway','Source Serif Pro', serif;;
  background-color: rgb(224, 188, 174);
}

input{
    box-sizing:border-box;
    font-size:25px;
    margin-top:10px;
    padding:20px;
    
}
div{
    position: fixed;
    font-size: small;
    height: 210px;
    width: 200px;
    text-align: center center;
    margin-top: 202px;
    padding-left: 200px;
}
</style>

<h2>Size</h2>

<label>
	<input type=radio bind:group={size} value=small>
	Small
</label>

<label>
	<input type=radio bind:group={size} value=Medium>
	Medium
</label>

<label>
	<input type=radio bind:group={size} value=large>
	Large
</label>

<h2>Color</h2>

{#each menu as color}
	<label>
		<input type=checkbox bind:group={colors} value={color}>
		{color}
	</label>
{/each}

{#if colors.length === 0}
	<p>Please select at least one color</p>

{:else}
	<h2>
		You ordered size {size} {colors.length === 1 ? 'T-shirt' : 'T-Shirts'}
		in {join(colors)}
    </h2>
   <h2>Total Price = 14.99 * {colors.length} = {total}</h2>
{/if}

<label>
	<input type=checkbox bind:checked={yes}>
	Check when ready to place order
</label>


{#if yes}
<button disabled={!yes} on:click="{() => showModal = true}">
    Place Order
</button>
{/if}

{#if showModal}
	<Modal on:close="{() => showModal = false}">
   
	

<div>{$yourMessage}{$authorMessage}{$genreMessage}</div> 


	
    <p> Order placed!  Total Price: {total}</p>
	       
       

	</Modal>
{/if}




