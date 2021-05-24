<script>
    import { Router, Link, Route } from 'svelte-routing';
   
    async function getQuotes(){
        const response = await fetch('https://quote-garden.herokuapp.com/api/v2/quotes?page=1&limit=50');
        const data = await response.json();
        console.log(data.quotes);
        return data.quotes;
    }
    let quotesPromise = getQuotes();
    
</script>

<style>

ul li{
   font-weight:bold;
   list-style: none;
} 

</style>

{#await quotesPromise}
    <h1>Loading all Quote Author....</h1>
{:then quotesdata}
    <ul>
    <h1>Quotes by Author Name</h1>
    
    {#each quotesdata as quotedata}       
        <li>
            <Link to="/quotemessage/{quotedata.quoteAuthor}">{quotedata.quoteAuthor}</Link>
        </li>
    {/each}
    </ul>
{/await}
