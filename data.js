// data.js - downloads the Pokémon list from PokéAPI once and keeps it in the browser's local storage.

const LIST_URL = "https://pokeapi.co/api/v2/pokemon-species?limit=2000";

function prettyName(raw) {
  return raw.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
}

// Returns { list: [{ dex, name }, ...], fromCache: true or false }
async function loadPokemon() {
  try {
    const cached = JSON.parse(localStorage.getItem("pokemonList"));
    if (cached && cached.length) return { list: cached, fromCache: true };
  } catch (e) {}

  const res = await fetch(LIST_URL);
  if (!res.ok) throw new Error("PokéAPI returned status " + res.status);
  const data = await res.json();
  const list = data.results.map(p => ({
    dex: Number(p.url.split("/").filter(Boolean).pop()),
    name: prettyName(p.name)
  }));
  try { localStorage.setItem("pokemonList", JSON.stringify(list)); } catch (e) {}
  return { list, fromCache: false };
}
