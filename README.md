# Pokémon Birthday Search

A software architecture project comparing two search strategies (Dynamic Search vs. Precomputed Indexing) to find Pokémon combinations matching a given birthdate.

## How It Works

- **Input:** User enters a Month and Day.
- **Rule:** The app finds pairs of Pokémon whose Pokédex numbers add up to represent the birthdate (Month × 100 + Day).
- **Comparison:** We compare computing combinations on the fly (Dynamic) against loading precomputed date matches at startup (Indexed) to evaluate speed and memory usage.

## Folder Structure

- `index.html` — The main website file containing the user interface, PokéAPI fetching, and search code.
- `README.md` — Project instructions and information.

## How to Run the App

1. Download or clone this repository to your computer.
2. Open the `pokemon-birthday-site` folder.
3. Double-click `index.html` to open it in your web browser.

## Current Project Status

- **Phase 2 Status:** Interface and full search pipeline complete.
- **Dataset:** Loads the full official dataset (Generations 1–9, up to Pokédex #1025) via PokéAPI and caches it in local storage.
- **Benchmarking:** Live response time comparisons between indexed lookups and dynamic search are active.

## Group Members

- Madelyn Moore
- Shayan Shoukat
- Conner Rhodes
