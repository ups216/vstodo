<script lang="ts">
    import { onMount } from 'svelte';
    import type { User } from '../types';

    export let user: User;
    export let accessToken: string;

    let todos: Array<{text: string, completed: boolean, id: number, creatorId: number}> = [];
    let text = '';

    async function addTodo(t: string){
        const response = await fetch(`${apiBaseUrl}/todo`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                text: t,
            }),
        });
        const {todo} = await response.json();
        todos = [todo, ...todos];
    }

    onMount(async () => {

        window.addEventListener('message', async event => {
            const message = event.data;
            console.log({message});
            switch (message.type) {
                case 'new-todo':
                    console.log(message.value);
                    addTodo(message.value);
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
    await addTodo(text);
    text = '';
}}>
    <input bind:value={text} />
</form>

<ul>
    {#each todos as todo (todo.id)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <li 
        class:complete={todo.completed}
        on:click={ async () => {
            todo.completed = !todo.completed;
            const response = await fetch (`${apiBaseUrl}/todo`, {
                method: "PUT",
                headers: {
                'Content-Type': 'application/json',
                authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    id: todo.id,
                    completed: todo.completed
                })
            });
            console.log (await response.json());
        }}>{todo.text}</li>
    {/each}
</ul>