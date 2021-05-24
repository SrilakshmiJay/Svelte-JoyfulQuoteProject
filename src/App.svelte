<script>
	import { Router, Link, Route } from 'svelte-routing';
	import Home from './routes/Home.svelte';
	import QuoteAuthor from './routes/QuoteAuthor.svelte';
	import QuoteMessage from './routes/QuoteMessage.svelte';
	import QuoteGenre from './routes/QuoteGenre.svelte';
	import QuoteGenreMessage from './routes/QuoteGenreMessage.svelte';
	import PersonalMessage from './routes/PersonalMessage.svelte';
	import Order from './routes/Order.svelte';

	
	export let url = "";
</script>
<style>
	@import url('https://fonts.googleapis.com/css2?family=Kurale&family=Redressed&display=swap');
	@import url('https://fonts.googleapis.com/css2?family=Redressed&display=swap');
    @import url('https://fonts.googleapis.com/css?family=Sofia&display=swap');

div{
    padding:0;
    margin:0;
    font-family:Kurale;
    background-color:rgb(240, 232, 227);
    color:rgb(155, 52, 86);
	text-align:center;
	font-size: 25px;
}
nav{
	background-color:#e4d8d6;
	background-color:#411616;
    color:rgb(155, 52, 86);
	height: 40px;
    width:100%;
    padding-bottom: 120px;
	text-shadow: 2px 2px 5px rgb(110, 34, 59);
	font-size: 40px;
	text-align:center;
    align-items: center;
	justify-content:space-around;
	list-style: none;
	display: block;
  

   
} 
ul li{
   background-color: rgb(240, 232, 227);
   padding: 60px 60px;
   font-weight:bold;
   color:rgb(155, 52, 86);
   /* align-items: center; */
   text-align: center;
   /* text-decoration: none; */
   display: inline-block;
  

}

li:active{
    background:rgb(198, 206, 209);
}
h1{
	font-size: 40px;
	background-color:rgb(209, 155, 155);
	color:rgb(155, 52, 86);
    width:100%;	
	text-shadow: 2px 2px 5px rgb(110, 34, 59);
	

}

</style>

<div>
<Router url="{url}">
	<h1>Joyful Quotes</h1>
	<nav>
		<ul>
		<li><Link to="/">Home</Link></li>
		<li><Link to="/quoteauthor">Quotes by Author</Link></li>
		<li><Link to="/quotegenre">Quotes by Genre</Link></li>
		<li><Link to="/personalmessage">Quotes by You</Link></li>
		<!-- <li><Link to="/order"></Link></li> -->
		</ul>
	</nav>
	<Route path="order/">
		<Order />
	</Route>
	
	<Route path="personalmessage/">
		<PersonalMessage />
	</Route>
	
	<Route path="quotegenremessage/:id" let:params>
		<QuoteGenreMessage genreName={params.id}></QuoteGenreMessage>	
	</Route>

	<Route path="quotegenremessage/">
		<QuoteGenreMessage />
	</Route>

    <Route path="quotegenre/">
		<QuoteGenre />
	</Route>

    <Route path="quotemessage/:id" let:params>
		<QuoteMessage authorName={params.id}></QuoteMessage>	
	</Route>

	<Route path="quotemessage/">
		<QuoteMessage />
	</Route>

    <Route path="quoteauthor/">
		<QuoteAuthor />
	</Route>

	<Route path="/">
		<Home />
	</Route>

</Router>
</div>