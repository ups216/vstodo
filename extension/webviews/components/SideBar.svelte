<script lang="ts">
    import { onMount } from 'svelte';
    import type { User } from '../types';
    import Todos from './Todos.svelte';

    let accessToken = '';    
    let loading = true;
    let user: User | null = null;

    onMount(async () => {

       window.addEventListener('message', async event => {
           const message = event.data;
           console.log({message});
           switch (message.type) {
                case 'token':
                    console.log(`token ${message.value}`);
                    accessToken = message.value;
                    const response = await fetch(`${apiBaseUrl}/me`, {
                            headers: {
                                'Authorization': `Bearer ${accessToken}`
                            }
                    });
                    const data = await response.json();
                    user = data.user;
                    loading = false;
                    break;
           }
       });

       tsvscode.postMessage({type: "get-token", value: undefined});
       
    });

</script>
{#if loading}
    <div>loading ...</div>
{:else if user}
    <Todos user = {user} />
    <button on:click={()=>{
        accessToken = '';
        user = null;
        tsvscode.postMessage({type: "logout", value: undefined});
    }}>logout</button>
{:else}
    <button on:click={()=>{
        tsvscode.postMessage({type: 'authenticate', value:undefined});
    }}>Login with GitHub</button>
{/if}