import type { Player } from "./game";

// Modifier functions defined separately
export const drawTwoItemCards = (player: Player) => {
    // Add 2 random items to player's inventory
    const items = ["potion", "revive", "berry"] as const;
    for (let i = 0; i < 2; i++) {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        player.items.push(randomItem);
    }
};

export const encounterWildPokemon = (player: Player) => {
    // Simple wild pokemon encounter
    const wildPokemon = {
        name: "Wild Pokémon",
        attack: Math.floor(Math.random() * 50) + 10,
        health: Math.floor(Math.random() * 80) + 20,
    };
    player.pokemons.push(wildPokemon);
};

export const randomEvent = (player: Player) => {
    // Random event - could be good or bad
    const events = [
        () => player.items.push("potion"),
        () => {
            if (player.pokemons.length > 0) {
                player.pokemons[0].health = Math.min(
                    100,
                    player.pokemons[0].health + 20,
                );
            }
        },
    ];
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    randomEvent();
};
