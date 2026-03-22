# Fantasy Baseball Draft Tracker

An interactive auction draft tracker for a custom fantasy baseball points league. It scores players based on custom models for hitters and pitchers and provides a real-time tracking interface.

## Features

- **Hitter Scoring Model**: Custom composite score based on BATX projections and 2025 Statcast data.
- **Pitcher Scoring Model**: Custom composite score based on ATC projections and 2025 Stuff+/Pitching+ data.
- **Interactive UI**: Real-time tracking of auction prices, value capture, and budget.
- **Score Tooltips**: Detailed breakdown of how each player's score is calculated.

## Prerequisites

- Node.js (v20+ recommended)
- npm

## Setup

1.  Clone the repository:
    ```bash
    git clone https://github.com/willfleischer007/fantasy-baseball-draft-tracker.git
    cd fantasy-baseball-draft-tracker
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Place your FanGraphs and Baseball Savant CSV exports in `data/raw/`.
4.  Run the pre-processing script to generate the draft data:
    ```bash
    npm run preprocess
    ```
5.  Start the app:
    ```bash
    npm run dev
    ```

## Data Ingestion

The app expects the following CSV files in `data/raw/`:
1.  `batters_auction.csv` (FanGraphs Auction Calculator - Batters)
2.  `pitchers_auction.csv` (FanGraphs Auction Calculator - Pitchers)
3.  `batters_leaderboard.csv` (FanGraphs 2025 Batting Stats)
4.  `batters_savant.csv` (Baseball Savant 2025 Expected Stats - Hitters)
5.  `sprint_speed.csv` (Baseball Savant 2025 Sprint Speed)
6.  `pitchers_leaderboard.csv` (FanGraphs 2025 SP Stats)
7.  `pitchers_savant.csv` (Baseball Savant 2025 Expected Stats - Pitchers)
8.  `stuff_plus.csv` (FanGraphs Stuff+ Leaderboard)

## Scoring Model Details

Refer to the original specifications for a deep dive into the scoring logic:
- [Hitter Scoring Model](file:///home/williamfleischer7/fantasybaseballPrep/fantasy_hitter_scoring_model_v2.md)
- [Pitcher Scoring Model](file:///home/williamfleischer7/fantasybaseballPrep/fantasy_pitcher_scoring_model.md)
