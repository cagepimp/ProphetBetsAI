// DepthChartService - Manages depth chart data and display
class DepthChartService {
  
  /**
   * Get depth chart for a specific team from rosters data
   * @param {Object} rosters - Full rosters object from backend
   * @param {string} teamName - Team name to get depth chart for
   * @returns {Object} Depth chart with starters and full depth
   */
  static getDepthChartForTeam(rosters, teamName) {
    if (!rosters || !teamName) {
      return { starters: {}, depth_chart: [], team_name: teamName };
    }

    // Find exact or partial match for team name
    const teamKey = Object.keys(rosters).find(key => 
      key.toLowerCase() === teamName.toLowerCase() ||
      key.toLowerCase().includes(teamName.toLowerCase()) ||
      teamName.toLowerCase().includes(key.toLowerCase())
    );

    if (!teamKey || !rosters[teamKey]) {
      console.log(`No depth chart found for team: ${teamName}`);
      return { starters: {}, depth_chart: [], team_name: teamName };
    }

    const teamData = rosters[teamKey];
    
    // Handle different data structures
    if (teamData.starters || teamData.depth_chart) {
      // New format with starters and depth_chart
      return {
        starters: teamData.starters || {},
        depth_chart: teamData.depth_chart || [],
        team_name: teamKey
      };
    } else {
      // Old format - just position: player mapping
      return {
        starters: teamData,
        depth_chart: this.convertToDepthChart(teamData, teamKey),
        team_name: teamKey
      };
    }
  }

  /**
   * Convert simple roster format to depth chart format
   */
  static convertToDepthChart(roster, teamName) {
    const depthChart = [];
    
    Object.entries(roster).forEach(([position, playerName]) => {
      if (playerName && playerName !== 'N/A') {
        depthChart.push({
          name: playerName,
          position: position,
          is_starter: true,
          depth_rank: 1,
          team: teamName
        });
      }
    });

    return depthChart;
  }

  /**
   * Get key starters for quick display (QB, RB, WR1, TE)
   */
  static getKeyStarters(depthChart) {
    const keyPositions = ['QB', 'RB', 'WR1', 'WR', 'TE'];
    const starters = {};

    if (depthChart.starters) {
      // Use starters object if available
      keyPositions.forEach(pos => {
        if (depthChart.starters[pos]) {
          starters[pos] = depthChart.starters[pos];
        }
      });
    } else if (depthChart.depth_chart) {
      // Extract from depth_chart array
      depthChart.depth_chart.forEach(player => {
        if (keyPositions.includes(player.position) && player.is_starter) {
          if (!starters[player.position]) {
            starters[player.position] = player.name;
          }
        }
      });
    }

    return starters;
  }

  /**
   * Format depth chart for display - grouped by position
   */
  static formatDepthChartByPosition(depthChart) {
    const byPosition = {};
    
    if (!depthChart.depth_chart || depthChart.depth_chart.length === 0) {
      return byPosition;
    }

    depthChart.depth_chart.forEach(player => {
      const pos = player.position;
      if (!byPosition[pos]) {
        byPosition[pos] = [];
      }
      byPosition[pos].push(player);
    });

    // Sort each position by depth rank
    Object.keys(byPosition).forEach(pos => {
      byPosition[pos].sort((a, b) => (a.depth_rank || 99) - (b.depth_rank || 99));
    });

    return byPosition;
  }

  /**
   * Get position groups for organized display
   */
  static getPositionGroups() {
    return {
      'Offense - Skill': ['QB', 'RB', 'FB', 'WR', 'TE'],
      'Offense - Line': ['LT', 'LG', 'C', 'RG', 'RT'],
      'Defense - Front': ['DE', 'DT', 'NT', 'EDGE'],
      'Defense - Linebackers': ['LB', 'MLB', 'OLB', 'ILB'],
      'Defense - Secondary': ['CB', 'S', 'FS', 'SS', 'NB'],
      'Special Teams': ['K', 'P', 'LS', 'KR', 'PR']
    };
  }

  /**
   * Get all players at a specific position
   */
  static getPlayersByPosition(depthChart, position) {
    if (!depthChart.depth_chart) return [];
    
    return depthChart.depth_chart
      .filter(p => p.position === position)
      .sort((a, b) => (a.depth_rank || 99) - (b.depth_rank || 99));
  }

  /**
   * Find a player by name in depth chart
   */
  static findPlayer(depthChart, playerName) {
    if (!depthChart.depth_chart || !playerName) return null;
    
    return depthChart.depth_chart.find(p => 
      p.name?.toLowerCase() === playerName.toLowerCase()
    );
  }

  /**
   * Check if player is a starter
   */
  static isStarter(depthChart, playerName) {
    const player = this.findPlayer(depthChart, playerName);
    return player?.is_starter || player?.depth_rank === 1 || false;
  }

  /**
   * Get player's depth rank
   */
  static getPlayerDepthRank(depthChart, playerName) {
    const player = this.findPlayer(depthChart, playerName);
    return player?.depth_rank || null;
  }

  /**
   * Format depth chart for compact display (first 5 key positions)
   */
  static getCompactStarters(depthChart) {
    const starters = this.getKeyStarters(depthChart);
    const positions = ['QB', 'RB', 'WR1', 'WR', 'TE'];
    
    return positions
      .filter(pos => starters[pos])
      .map(pos => ({
        position: pos,
        player: starters[pos]
      }))
      .slice(0, 5);
  }
}

export default DepthChartService;