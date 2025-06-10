export type Pokemon = {
    dex_number: number;
    health: number;
    shiny: boolean;
};

// Cache for Pokemon API data
const pokemonDataCache = new Map<number, any>();
const pokemonSpeciesCache = new Map<number, any>();

export async function getPokemonData(dex_number: number): Promise<any> {
    if (pokemonDataCache.has(dex_number)) {
        return pokemonDataCache.get(dex_number);
    }

    const data = await fetch(`/api/pokemon/${dex_number}`).then((response) =>
        response.json(),
    );

    pokemonDataCache.set(dex_number, data);
    return data;
}

export async function getAttackPower(pokemon: Pokemon): Promise<number> {
    // fetch from /api/pokemon/{dex_number}
    var data = await getPokemonData(pokemon.dex_number);

    // calculate atk + spatk + spd / 40
    return Math.round(
        ((parseInt(data.stats[1].base_stat) || 0) + // atk
            (parseInt(data.stats[3].base_stat) || 0)) / // spatk
            40,
    );
}

async function getMaxHealthDex(dex_number: number): Promise<number> {
    var data = await getPokemonData(dex_number);

    // calculate hp + def + spdef / 40
    return Math.round(
        Math.sqrt(
            ((parseInt(data.stats[0].base_stat) || 0) * // hp
                ((parseInt(data.stats[2].base_stat) || 0) + // def
                    (parseInt(data.stats[4].base_stat) || 0))) /
                40,
        ) / 3,
    );
}

export async function getMaxHealth(pokemon: Pokemon): Promise<number> {
    return getMaxHealthDex(pokemon.dex_number);
}

async function getPokemonSpeciesData(dex_number: number): Promise<any> {
    if (pokemonSpeciesCache.has(dex_number)) {
        return pokemonSpeciesCache.get(dex_number);
    }

    const data = await fetch(`/api/pokemon-species/${dex_number}`).then(
        (response) => response.json(),
    );

    pokemonSpeciesCache.set(dex_number, data);
    return data;
}

export async function getPokemonNameGerman(pokemon: Pokemon): Promise<string> {
    const data = await getPokemonData(pokemon.dex_number);
    const speciesData = await getPokemonSpeciesData(pokemon.dex_number);

    // Find German name in the names array
    const germanName = speciesData.names?.find(
        (name: any) => name.language.name === "de",
    );

    return germanName?.name || data.name || `Pokemon #${pokemon.dex_number}`;
}

export async function createPokemon(
    dex_number: number,
    force_shiny: boolean = false,
): Promise<Pokemon> {
    return {
        dex_number,
        health: await getMaxHealthDex(dex_number),
        shiny: force_shiny || Math.random() < 1 / 30, // 1 in 30 chance of being shiny
    };
}
