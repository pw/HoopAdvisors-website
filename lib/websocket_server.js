import { DurableObject } from "cloudflare:workers";

export class WebsocketServer extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx = ctx;
    this.storage = ctx.storage;
    this.env = env;
    this.gamesData = new Map();
    this.ctx.blockConcurrencyWhile(async () => {
      const storedGames = await this.storage.list({ prefix: 'game:' });
      if (storedGames.size > 0) {
        this.gamesData = storedGames;
      }
    });
  }

  async webSocketMessage(webSocket, msg) {
    let data = JSON.parse(msg);
    if (data.type === 'initial') {
      if (this.gamesData.size > 0) {
        const currentGames = Array.from(this.gamesData.values());
        webSocket.send(JSON.stringify({
          type: 'initial',
          games: currentGames
        }));
      }
    }
  }

  async broadcast(message) {
    const clients = this.ctx.getWebSockets();
    const messageString = JSON.stringify(message);
    for (const client of clients) {
      client.send(messageString);
    }
  }

  async update(gameUpdate) {
    const key = `game:${gameUpdate.gameId}`;
    
    // The websocket server always just stores the last update for any game
    // so no special handling needed for 'first' type updates
    this.gamesData.set(key, gameUpdate);
    await this.storage.put(key, gameUpdate);
    
    // Broadcast the update to all connected clients
    await this.broadcast(gameUpdate);
  }

  async getHistoricalGames() {
    // Return only games that have comebacks
    return Array.from(this.gamesData.values())
      .filter(game => game.hasComeback);
  }

  async getQualifiedGames() {
    // Return only games that have triggered qualifiers
    return Array.from(this.gamesData.values())
      .filter(game => game.qualified);
  }

  /**
   * Processes odds data for a specific date by checking The Odds API
   * for historical odds that match our qualified games
   * 
   * @param {string} date - The date in YYYYMMDD format
   * @returns {Object} - Processing results summary
   */
  async processOddsData(date) {
    // 1. Get all qualified games for this date
    const qualifiedGames = await this.getQualifiedGames();
    
    if (qualifiedGames.length === 0) {
      return { processed: 0, message: "No qualified games found for this date" };
    }
    
    // 2. Process each qualified game sequentially through time
    const results = await this.processQualifiedGamesSequentially(date, qualifiedGames);
    
    // 3. Broadcast updates to connected clients
    for (const game of qualifiedGames) {
      await this.broadcast(game);
    }
    
    return results;
  }
  
  /**
   * Processes qualified games sequentially through time
   * 
   * @param {string} date - The date in YYYYMMDD format
   * @param {Array} qualifiedGames - Array of qualified games
   * @returns {Object} - Processing results
   */
  async processQualifiedGamesSequentially(date, qualifiedGames) {
    // Create tracking for unmatched games
    const unmatchedGames = new Map();
    for (const game of qualifiedGames) {
      unmatchedGames.set(`game:${game.gameId}`, {
        game,
        matched: false
      });
    }
    
    // Find earliest qualification time
    const earliestQualifierTime = this.findEarliestQualifierTime(qualifiedGames);
    if (!earliestQualifierTime) {
      return { 
        processed: 0, 
        message: "No valid qualification times found" 
      };
    }
    
    // Format date for API
    const apiDate = this.formatDateForAPI(date);
    
    // Set up timestamp for API calls
    let currentTimestamp = this.convertQualifierTimeToISO(apiDate, earliestQualifierTime);
    
    // Set up end conditions
    const MAX_SNAPSHOTS = 100; // Safety limit
    const endTime = new Date(`${apiDate}T23:59:59Z`);
    let snapshotCount = 0;
    
    // Process snapshots sequentially until all games matched or end time reached
    while (unmatchedGames.size > 0 && 
           new Date(currentTimestamp) < endTime && 
           snapshotCount < MAX_SNAPSHOTS) {
      
      try {
        // Fetch this snapshot
        const snapshot = await this.fetchOddsSnapshot(currentTimestamp);
        snapshotCount++;
        
        console.log(`Processing snapshot ${snapshotCount} at ${snapshot.timestamp}, ${unmatchedGames.size} games remaining`);
        
        // Track games to remove from unmatchedGames after processing
        const gamesToRemove = [];
        
        // Process each unmatched game against this snapshot
        for (const [gameKey, gameData] of unmatchedGames.entries()) {
          const { game } = gameData;
          
          // Skip games whose qualifier time is after this snapshot
          const qualifierTime = new Date(this.convertQualifierTimeToISO(apiDate, game.qualifiedTime));
          if (qualifierTime > new Date(snapshot.timestamp)) {
            continue;
          }
          
          // Check if this snapshot has matching odds
          const matchResult = this.checkGameAgainstSnapshot(game, snapshot);
          
          if (matchResult.result === "MATCH_FOUND") {
            // We found matching odds! Save the result
            const finalScore = this.getFinalScore(game);
            const betWon = this.wouldBetWin(
              finalScore.homeScore,
              finalScore.awayScore,
              game.qualifiedTeam,
              matchResult.spreadOffered
            );
            
            game.oddsResult = {
              result: betWon ? "WINNER" : "LOSER",
              matchDetails: {
                timestamp: matchResult.timestamp,
                bookmaker: matchResult.bookmaker,
                spreadOffered: matchResult.spreadOffered,
                recommendedSpread: matchResult.recommendedSpread,
                originalRecommendation: matchResult.originalRecommendation
              },
              displayString: `${betWon ? "WINNER" : "LOSER"} - ${matchResult.bookmaker} offered ${
                this.formatSpread(matchResult.spreadOffered)
              } at ${
                this.formatTime(matchResult.timestamp)
              } (recommended: ${
                this.formatSpread(matchResult.recommendedSpread)
              })`
            };
            
            // Update game in storage
            await this.storage.put(gameKey, game);
            this.gamesData.set(gameKey, game);
            
            // Mark for removal from tracking
            gamesToRemove.push(gameKey);
          }
        }
        
        // Remove matched games from tracking
        for (const key of gamesToRemove) {
          unmatchedGames.delete(key);
        }
        
        // If no more unmatched games, we can stop
        if (unmatchedGames.size === 0) {
          break;
        }
        
        // Move to next timestamp
        if (snapshot.next_timestamp) {
          currentTimestamp = snapshot.next_timestamp;
        } else {
          // No more snapshots available
          break;
        }
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error('Error processing odds snapshot:', error);
        // Try to continue with next snapshot even if one fails
        if (snapshot && snapshot.next_timestamp) {
          currentTimestamp = snapshot.next_timestamp;
        } else {
          break;
        }
      }
    }
    
    // Handle any games that never found a match (NO LINE result)
    for (const [gameKey, gameData] of unmatchedGames.entries()) {
      const { game } = gameData;
      
      game.oddsResult = { 
        result: "NO LINE", 
        reason: `Recommended spread ${this.formatSpread(game.qualifierLiveSpread)} never available`
      };
      
      await this.storage.put(gameKey, game);
      this.gamesData.set(gameKey, game);
    }
    
    return { 
      processed: qualifiedGames.length,
      matched: qualifiedGames.length - unmatchedGames.size,
      noLine: unmatchedGames.size,
      snapshots: snapshotCount,
      message: `Processed ${qualifiedGames.length} qualified games, ${qualifiedGames.length - unmatchedGames.size} with matches, ${unmatchedGames.size} with NO LINE`
    };
  }
  
  /**
   * Finds the earliest qualification time among qualified games
   * 
   * @param {Array} qualifiedGames - Array of qualified games
   * @returns {string} - The earliest qualification time in "11:55 PM ET" format
   */
  findEarliestQualifierTime(qualifiedGames) {
    let earliestTime = null;
    let earliestTimeString = null;
    const dateString = qualifiedGames[0].date; // All games have same date
    
    for (const game of qualifiedGames) {
      if (!game.qualifiedTime) continue;
      
      // Convert game's qualifier time to Date object for comparison
      try {
        const gameQualifierDate = new Date(this.convertQualifierTimeToISO(dateString, game.qualifiedTime));
        
        // Update earliest if this is the first or earlier than current earliest
        if (!earliestTime || gameQualifierDate < earliestTime) {
          earliestTime = gameQualifierDate;
          earliestTimeString = game.qualifiedTime;
        }
      } catch (e) {
        console.error(`Error parsing qualification time ${game.qualifiedTime}:`, e);
      }
    }
    
    return earliestTimeString;
  }
  
  /**
   * Converts qualification time (format "11:55 PM ET") to an ISO string
   * 
   * @param {string} dateString - Date in YYYY-MM-DD format
   * @param {string} timeString - Time in "11:55 PM ET" format
   * @returns {string} - ISO formatted timestamp
   */
  convertQualifierTimeToISO(dateString, timeString) {
    // Remove the " ET" suffix
    const timePart = timeString.replace(' ET', '');
    
    // Parse the 12-hour format time
    const [timePortion, ampm] = timePart.split(' ');
    let [hours, minutes] = timePortion.split(':').map(Number);
    
    // Convert to 24-hour format
    if (ampm.toLowerCase() === 'pm' && hours < 12) {
      hours += 12;
    } else if (ampm.toLowerCase() === 'am' && hours === 12) {
      hours = 0;
    }
    
    // Format hours and minutes with leading zeros
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    // Create the ISO string in Eastern Time
    // We'll use a simplified approach for timezone conversion
    // Create a date object in local time
    const dateObj = new Date(`${dateString}T${formattedHours}:${formattedMinutes}:00Z`);
    
    // Return ISO string
    return dateObj.toISOString();
  }
  
  /**
   * Formats a date string (YYYYMMDD) to YYYY-MM-DD for API use
   * 
   * @param {string} dateString - Date in YYYYMMDD format
   * @returns {string} - Date in YYYY-MM-DD format
   */
  formatDateForAPI(dateString) {
    return `${dateString.substring(0, 4)}-${dateString.substring(4, 6)}-${dateString.substring(6, 8)}`;
  }
  
  /**
   * Formats a timestamp to a user-friendly time
   * 
   * @param {string} timestamp - ISO timestamp
   * @returns {string} - Formatted time (12-hour with AM/PM)
   */
  formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/New_York'
    });
  }
  
  /**
   * Formats a spread value for display
   * 
   * @param {number|string} spread - The spread value
   * @returns {string} - Formatted spread (with + for positive values)
   */
  formatSpread(spread) {
    if (spread === 'ML' || spread === null) return 'ML';
    const numSpread = parseFloat(spread);
    return numSpread > 0 ? `+${numSpread}` : `${numSpread}`;
  }
  
  /**
   * Fetches a snapshot from The Odds API
   * 
   * @param {string} timestamp - ISO timestamp for the snapshot
   * @returns {Object} - The odds data snapshot
   */
  async fetchOddsSnapshot(timestamp) {
    const apiKey = '82b3af18efad7e9a9c0806137dc34155';
    const url = `https://api.the-odds-api.com/v4/historical/sports/basketball_ncaab/odds?apiKey=${apiKey}&regions=us&markets=spreads&dateFormat=iso&oddsFormat=american&date=${timestamp}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    return await response.json();
  }
  
  /**
   * Check if a game has matching odds in a snapshot
   * 
   * @param {Object} game - The qualified game
   * @param {Object} snapshot - The odds snapshot
   * @returns {Object} - Match result details
   */
  checkGameAgainstSnapshot(game, snapshot) {
    // Find this game in the odds data
    const oddsGame = this.findGameInOddsData(snapshot, game);
    if (!oddsGame) return { result: "NO_MATCH" };
    
    // Apply the 0.5 point flex to the recommended spread
    const flexedSpread = this.applyFlex(game.qualifierLiveSpread);
    const isHomeTeam = game.qualifiedTeam === 'home';
    
    // Check each bookmaker for a matching spread
    for (const bookmaker of oddsGame.bookmakers) {
      // Get the spread market
      const spreadMarket = bookmaker.markets.find(m => m.key === "spreads");
      if (!spreadMarket) continue;
      
      // Find the outcome for our qualified team
      const teamName = isHomeTeam ? game.homeTeamDisplayName : game.awayTeamDisplayName;
      const teamOutcome = spreadMarket.outcomes.find(o => 
        this.matchesTeam(o.name, teamName));
      
      if (!teamOutcome) continue;
      
      // Check if this spread is equal or better than our recommendation
      if (this.isBetterSpread(flexedSpread, teamOutcome.point, isHomeTeam)) {
        return {
          result: "MATCH_FOUND",
          timestamp: bookmaker.last_update,
          bookmaker: bookmaker.title,
          spreadOffered: teamOutcome.point,
          recommendedSpread: flexedSpread,
          originalRecommendation: game.qualifierLiveSpread
        };
      }
    }
    
    // No matching spread found in this snapshot
    return { result: "NO_MATCH" };
  }
  
  /**
   * Find a game in the odds data by matching team names
   * 
   * @param {Object} snapshot - The odds snapshot
   * @param {Object} game - Our game data
   * @returns {Object|null} - Matching game from odds data or null
   */
  findGameInOddsData(snapshot, game) {
    return snapshot.data.find(oddsGame => 
      (this.matchesTeam(oddsGame.home_team, game.homeTeamDisplayName) && 
       this.matchesTeam(oddsGame.away_team, game.awayTeamDisplayName)) ||
      // Also check reverse order in case API flips home/away
      (this.matchesTeam(oddsGame.home_team, game.awayTeamDisplayName) && 
       this.matchesTeam(oddsGame.away_team, game.homeTeamDisplayName))
    );
  }
  
  /**
   * Check if team names match (normalized comparison)
   * 
   * @param {string} oddsApiTeamName - Team name from Odds API
   * @param {string} gameTeamName - Team name from our data
   * @returns {boolean} - True if names match
   */
  matchesTeam(oddsApiTeamName, gameTeamName) {
    // Simple string normalization (trim whitespace, standardize case)
    return oddsApiTeamName.trim().toLowerCase() === gameTeamName.trim().toLowerCase();
  }
  
  /**
   * Apply 0.5 point flex to recommended spread
   * 
   * @param {number|string} recommendedSpread - Original spread
   * @returns {number|string} - Flexed spread
   */
  applyFlex(recommendedSpread) {
    if (recommendedSpread === 'ML' || recommendedSpread === null) return 'ML';
    
    const numSpread = parseFloat(recommendedSpread);
    // Add 0.5 in the direction that makes the spread better
    // Negative spread gets more negative, positive spread gets more positive
    return numSpread - (0.5 * Math.sign(numSpread));
  }
  
  /**
   * Check if an available spread is equal to or better than recommended
   * 
   * @param {number|string} recommendedSpread - Recommended spread (with flex)
   * @param {number} availableSpread - Available spread from bookmaker
   * @param {boolean} isHomeTeam - Whether qualified team is home
   * @returns {boolean} - True if spread is equal or better
   */
  isBetterSpread(recommendedSpread, availableSpread, isHomeTeam) {
    // Handle money line case
    if (recommendedSpread === 'ML' || recommendedSpread === null) {
      // For ML, any spread in the right direction is better
      if (isHomeTeam) {
        return availableSpread <= 0; // Home team favored (negative spread)
      } else {
        return availableSpread >= 0; // Away team favored (positive spread)
      }
    }
    
    const recSpread = parseFloat(recommendedSpread);
    const availSpread = parseFloat(availableSpread);
    
    // For negative spreads (team is favored)
    if (recSpread < 0) {
      // Better spread is MORE negative (e.g. -3.5 is better than -2.5)
      return availSpread <= recSpread;
    } 
    // For positive spreads (team is underdog)
    else if (recSpread > 0) {
      // Better spread is MORE positive (e.g. +3.5 is better than +2.5)
      return availSpread >= recSpread;
    }
    // For exactly 0 spread
    else {
      // Better depends on which team qualified
      if (isHomeTeam) {
        return availSpread <= 0; // Home team wants negative or 0
      } else {
        return availSpread >= 0; // Away team wants positive or 0
      }
    }
  }
  
  /**
   * Get final score from game data
   * 
   * @param {Object} game - Game data
   * @returns {Object} - Home and away scores
   */
  getFinalScore(game) {
    return {
      homeScore: parseInt(game.homeScore),
      awayScore: parseInt(game.awayScore)
    };
  }
  
  /**
   * Determine if a bet would have won based on final score and spread
   * 
   * @param {number} homeScore - Final home score
   * @param {number} awayScore - Final away score
   * @param {string} qualifiedTeam - Which team qualified ('home' or 'away')
   * @param {number} spreadOffered - The spread that was offered
   * @returns {boolean} - True if bet would have won
   */
  wouldBetWin(homeScore, awayScore, qualifiedTeam, spreadOffered) {
    // Calculate actual margin (positive means home won by that many)
    const actualMargin = homeScore - awayScore;
    
    if (qualifiedTeam === 'home') {
      // Home team bet with negative spread means home must win by more than spread
      if (spreadOffered < 0) {
        return actualMargin > Math.abs(spreadOffered);
      } 
      // Home team bet with positive spread means home can lose by less than spread
      else if (spreadOffered > 0) {
        return actualMargin > -spreadOffered;
      }
      // Home team at exactly 0 spread must win outright
      else {
        return actualMargin > 0;
      }
    } else { // Away team qualified
      // Away team bet with positive spread means away can lose by less than spread
      if (spreadOffered > 0) {
        return actualMargin < spreadOffered;
      }
      // Away team bet with negative spread means away must win by more than spread
      else if (spreadOffered < 0) {
        return actualMargin < spreadOffered;
      }
      // Away team at exactly 0 spread must win outright
      else {
        return actualMargin < 0;
      }
    }
  }
  
  async fetch(request) {
    const [client, server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);
    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
}
