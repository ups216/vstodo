<script lang="ts">
    import { onMount } from 'svelte';

    let userAccessToken = '';

    let todos: Array<{text: string, completed: boolean}> = [];
    let text = '';
    let loading = true;
    let user: {name:string; id: number} | null = null;

    onMount(async () => {

       window.addEventListener('message', async event => {
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
                case 'user-authenticated':
                    console.log(`token ${message.value}`);
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
       
    });

</script>

<style>
    .complete {
        text-decoration: line-through;
    }
</style>
{#if loading}
    <button 
        on:click={() => {
            tsvscode.postMessage({
                type: 'doGitHubLogin',
                value: 'doGitHubLogin'
            });
        }}
    >GitHub Login</button>
{:else if user}
    <div>User: [{user.name}]</div>
    <button
        on:click={() => {
            tsvscode.postMessage({
                type: 'doLogout',
                value: 'doLogout'
            });
        }}
    >Logoff</button>
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