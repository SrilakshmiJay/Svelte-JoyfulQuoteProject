<script>
    import { Router, Link, Route } from 'svelte-routing';
    import Modal from './Modal.svelte';
    import {genreMessage} from './stores.js';
    import {yourMessage} from './stores.js'; 
    import {authorMessage} from './stores.js'; 
    let showModal = false; 
    export let genreName;
    let currentQuote = 0;
    let printQuote ="";
    
    function updateMessage(){
        genreMessage.update((currentvalue)=>currentvalue=printQuote);
    }
 
    async function loadQuotes(){
        const response = await fetch("https://quote-garden.herokuapp.com/api/v2/genres/"+ genreName +"?");
        const data = await response.json();
        console.log(data);
        return data.quotes;
    }
    function nextQuote(quoteslength){
        if(currentQuote < (quoteslength-1)){
          currentQuote++;
        }
    }
    function previousQuote(quoteslength){
        if(currentQuote != 0){
          currentQuote--;
        }
    }
    function quoteSelected(print){
        printQuote = print; 
        $yourMessage = '';
        $authorMessage ='';
        updateMessage();
    }

</script>

<style>

p {
   font-size: 25px;
   padding-top: 20px;
   color:rgb(155, 52, 86);
}

h1{
    font-size:40px;
    color:rgb(155, 52, 86);
}

h2{
    font-size:30px;
    color:rgb(155, 52, 86);
}

button{
    color:rgb(155, 52, 86);
    background-color: rgb(224, 188, 174);
}

div{
    font-size: small;
    height: 210px;
    width: 200px;
    text-align: center center;
    margin-top: 200px;
    padding-left: 200px;
}


</style>

{#await loadQuotes()}
<h1>Joyful Quotes</h1>
{:then selectquotes} 
  
    <ul>
        <h2>Quotes by {@html genreName}</h2>
        <p>Quote {currentQuote + 1}/{selectquotes.length}</p>
      
        <h1>{@html selectquotes[currentQuote].quoteText}</h1>
      
        <button on:click={()=>previousQuote(selectquotes.length)}>Previous Quote</button>
        <button on:click={()=>nextQuote(selectquotes.length)}>Next Quote</button><br>
        
        <button on:click={()=>quoteSelected(selectquotes[currentQuote].quoteText)}>Select the quote</button> 
    </ul>

   <h2>Your Quote will be printed on your T-Shirt</h2>
   
{/await} 

   
<button  on:click="{() => showModal = true}">
    Next
</button>

{#if showModal}
    <Modal on:close="{() => showModal = false}">
        <div> {printQuote}</div>
        <button><Link to="/order">Order</Link></button>       
    </Modal>
{/if}
