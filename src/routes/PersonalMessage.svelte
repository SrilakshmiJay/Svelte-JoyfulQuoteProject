<script> 
import { Router, Link, Route } from 'svelte-routing';
import Modal from './Modal.svelte';
import {yourMessage} from './stores.js';
import {authorMessage} from './stores.js'; 
import {genreMessage} from './stores.js';
let showModal = false; 
let personalMessage ='';
let w;
let h;
let size = 5;

function updateMessage(){
    $authorMessage = '';
    $genreMessage = '';
    $yourMessage = '';
    yourMessage.update((currentvalue)=>currentvalue=personalMessage);
}
</script>

<style>

button{
        color:rgb(155, 52, 86);
        background-color: rgb(224, 188, 174);
}
    
input{
        width:100%;
        box-sizing:border-box;
        font-size:25px;
        margin-top:10px;
        padding:10px;
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

    <h1>Your Message will be printed on your T-Shirt</h1>


    <input bind:value={personalMessage} placeholder="Enter message">
    <input type=range bind:value={size} >

    <div bind:clientWidth={w} bind:clientHeight={h} >
        <span style="font-size: {size}px">{personalMessage}</span>
    </div>
    <br>

    <button on:click={()=>updateMessage(personalMessage)}>Select message</button> 

    <button  on:click="{() => showModal = true}">
        Next
    </button>


{#if showModal}
    <Modal on:close="{() => showModal = false}">
       <div>{personalMessage}</div>
       <br>
        <button><Link to="/order">Order</Link></button>
    </Modal>
{/if}



