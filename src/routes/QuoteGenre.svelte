<script>
    import { Router, Link, Route } from 'svelte-routing';
  
    async function getQuotes(){
        const response = await fetch('https://quote-garden.herokuapp.com/api/v2/genres/');
        const data = await response.json();
        console.log(data.quotes);
        return data.genres;
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
    <h1>Loading all Genres....</h1>
{:then quotesdata}
<ul>  
    <h1>Quotes by Genre </h1>

{#each quotesdata as genre}  
        <li>
             <Link to="/quotegenremessage/{genre}">{genre}</Link>
        </li>
{/each}   
   
</ul>
{/await}