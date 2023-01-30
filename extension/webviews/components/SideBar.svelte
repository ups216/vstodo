<script lang="ts">
    import { onMount } from 'svelte';

    let todos: Array<{text: string, completed: boolean}> = [];
    let text = '';
    let loading = true;
    let user: {name:string; id: number} | null = null;

    onMount(async () => {

       window.addEventListener('message', event => {
           const message = event.data;
           console.log({message});
           switch (message.type) {
               case 'new-todo':
                   console.log(message.value);
                   todos = [
                          {
                            text: message.value,
                            completed: false
                          }, ...todos
                     ];
                   break;
           }
       });

       const response = await fetch(`${apiBaseUrl}/me`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
       });
       const data = await response.json();
       user = data.user;
       loading = false;
    });

</script>

<style>
    .complete {
        text-decoration: line-through;
    }
</style>
{#if loading}
    <div>loading...</div>
{:else if user}
    <pre>{JSON.stringify(user, null, 2)}</pre>
{:else}
    <div>no user is logged in</div>
{/if}

<form on:submit|preventDefault={() => {
    todos = [{text, completed: false},...todos];
    text = '';
}}>
    <input bind:value={text} />
</form>

<ul>
    {#each todos as todo (todo.text)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <li 
        class:complete={todo.completed}
        on:click={ () => {
            todo.completed = !todo.completed;
        }}>{todo.text}</li>
    {/each}
</ul>

<button 
    on:click={() => {
        tsvscode.postMessage({
            type: 'onInfo',
            value: 'INFO Message'
        });
    }}
>click me</button>

<button 
    on:click={() => {
        tsvscode.postMessage({
            type: 'onError',
            value: 'INFO Message'
        });
    }}
>click me for error</button>