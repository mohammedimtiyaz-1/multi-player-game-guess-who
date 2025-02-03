# Guess Who? - Multiplayer Card Game

A real-time multiplayer card game built with TailwindCSS, and Supabase.

## Features

- Create and join game sessions with unique URLs
- Real-time game state updates
- Beautiful UI with smooth animations
- WhatsApp sharing integration
- Scoreboard and player tracking
- Responsive design

## Setup

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a Supabase project at https://supabase.com

4. Create a new table in Supabase:

   ```sql
   create table games (
     id text primary key,
     status text,
     players jsonb,
     current_round integer,
     total_rounds integer,
     revealed_card integer,
     organizer text,
     winner text,
     created_at timestamp with time zone default timezone('utc'::text, now())
   );
   ```

5. Copy your Supabase URL and anon key from the project settings

6. Create a `.env` file in the project root and add your Supabase credentials:

   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

7. Start the development server:
   ```bash
   npm run dev
   ```

## How to Play

1. **Create a Game**

   - Click "Create Game"
   - Enter your name
   - Share the generated game URL with friends

2. **Join a Game**

   - Use the shared URL or
   - Click "Join Game" and enter the game ID
   - Enter your name

3. **Gameplay**
   - Each player gets a secret number
   - The player with number 1 starts
   - Try to guess the next consecutive number
   - Correct guesses earn points
   - Wrong guesses result in card swaps
   - Game continues until all cards are revealed

## Technologies Used

- React + Vite
- TypeScript
- TailwindCSS
- Framer Motion
- Zustand
- Supabase

## Contributing

Feel free to submit issues and pull requests.

## License

MIT
