<script lang="ts">
    import { onMount } from 'svelte';
    import type { User } from '../types';

    export let user: User;
    export let accessToken: string;

    let todos: Array<{text: string, completed: boolean}> = [];
    let text = '';

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
            }
        });

        const response = await fetch(`${apiBaseUrl}/todo`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${accessToken}`
            }
        });
        const payload = await response.json();
        todos = payload.todos;

});
</script>
<style>
    .complete {
        text-decoration: line-through;
    }
</style>

<div>Hello: {user.name}</div>

<form on:submit|preventDefault={ async () => {

    const response = await fetch(`${apiBaseUrl}/todo`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            text: text
        })
    });

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