import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function upsertToSupabase(table, data) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(data)
    });
    return res.ok;
  } catch (err) {
    console.error(`Error upserting to ${table}:`, err.message);
    return false;
  }
}

async function importUFCFighter(fighter, fighterId) {
  const fighterData = {
    fighter_id: fighterId,
    name: fighter.athlete?.displayName || fighter.displayName || 'Unknown',
    nickname: fighter.athlete?.nickname || '',
    weight_class: fighter.athlete?.flag?.alt || '',
    country: fighter.athlete?.flag?.alt || ''
  };

  await upsertToSupabase('ufc_fighters', fighterData);
}

async function importUFCEventDetails(eventId) {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/mma/ufc/summary?event=${eventId}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.competitions || !data.competitions[0]) {
      return;
    }

    const competition = data.competitions[0];
    const competitors = competition.competitors;

    if (!competitors || competitors.length < 2) {
      return;
    }

    const fighter1 = competitors[0];
    const fighter2 = competitors[1];
    const fighter1Id = fighter1.athlete?.id || fighter1.id;
    const fighter2Id = fighter2.athlete?.id || fighter2.id;

    // Import both fighters
    await importUFCFighter(fighter1, fighter1Id);
    await importUFCFighter(fighter2, fighter2Id);

    // Determine winner
    let winnerId = null;
    if (fighter1.winner) {
      winnerId = fighter1Id;
    } else if (fighter2.winner) {
      winnerId = fighter2Id;
    }

    // Get fight details
    const notes = data.notes || [];
    let method = 'Decision';
    let roundFinished = 3;
    let timeFinished = '5:00';

    for (const note of notes) {
      const text = note.headline || '';
      if (text.includes('KO') || text.includes('Knockout')) method = 'KO';
      else if (text.includes('TKO')) method = 'TKO';
      else if (text.includes('Submission')) method = 'Submission';
      else if (text.includes('Decision')) method = 'Decision';

      // Try to extract round
      const roundMatch = text.match(/R(\d+)/i);
      if (roundMatch) roundFinished = parseInt(roundMatch[1]);

      // Try to extract time
      const timeMatch = text.match(/(\d+):(\d+)/);
      if (timeMatch) timeFinished = `${timeMatch[1]}:${timeMatch[2]}`;
    }

    const fightData = {
      fight_id: eventId,
      event_id: eventId,
      fighter1_id: fighter1Id,
      fighter2_id: fighter2Id,
      winner_id: winnerId,
      weight_class: competition.notes?.[0]?.headline || '',
      method: method,
      round_finished: roundFinished,
      time_finished: timeFinished,
      is_title_fight: data.name?.toLowerCase().includes('title') || false,
      fight_order: 1
    };

    await upsertToSupabase('ufc_fights', fightData);

    // Import fight stats if available
    if (data.boxscore && data.boxscore.competitors) {
      for (const competitor of data.boxscore.competitors) {
        const fighterId = competitor.athlete?.id || competitor.id;
        const stats = competitor.statistics || [];

        const statsData = {
          fight_id: eventId,
          fighter_id: fighterId,
          significant_strikes_landed: 0,
          significant_strikes_attempted: 0,
          total_strikes_landed: 0,
          total_strikes_attempted: 0,
          takedowns_landed: 0,
          takedowns_attempted: 0,
          submission_attempts: 0,
          knockdowns: 0,
          control_time_seconds: 0
        };

        for (const stat of stats) {
          const name = stat.name?.toLowerCase() || '';
          const value = stat.displayValue || '0';

          if (name.includes('significant strikes')) {
            const parts = value.split(' of ');
            statsData.significant_strikes_landed = parseInt(parts[0]) || 0;
            statsData.significant_strikes_attempted = parseInt(parts[1]) || 0;
          } else if (name.includes('total strikes')) {
            const parts = value.split(' of ');
            statsData.total_strikes_landed = parseInt(parts[0]) || 0;
            statsData.total_strikes_attempted = parseInt(parts[1]) || 0;
          } else if (name.includes('takedowns')) {
            const parts = value.split(' of ');
            statsData.takedowns_landed = parseInt(parts[0]) || 0;
            statsData.takedowns_attempted = parseInt(parts[1]) || 0;
          } else if (name.includes('submission')) {
            statsData.submission_attempts = parseInt(value) || 0;
          } else if (name.includes('knockdown')) {
            statsData.knockdowns = parseInt(value) || 0;
          }
        }

        await upsertToSupabase('ufc_fight_stats', statsData);
      }
    }

    await delay(200);
  } catch (err) {
    console.error(`Error importing event details for ${eventId}:`, err.message);
  }
}

async function importUFCEventsForDate(date) {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/mma/ufc/scoreboard?dates=${date}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.events || data.events.length === 0) {
      return 0;
    }

    let count = 0;

    for (const event of data.events) {
      const eventData = {
        event_id: event.id,
        event_name: event.name,
        event_date: event.date,
        venue: event.competitions?.[0]?.venue?.fullName || '',
        city: event.competitions?.[0]?.venue?.address?.city || '',
        country: event.competitions?.[0]?.venue?.address?.country || ''
      };

      if (await upsertToSupabase('ufc_events', eventData)) {
        console.log(`✅ ${date}: ${event.name}`);
        count++;

        // Import fight details if event is completed
        if (event.status?.type?.completed) {
          await importUFCEventDetails(event.id);
        }
      }

      await delay(300);
    }

    return count;
  } catch (err) {
    console.error(`Error importing events for ${date}:`, err.message);
    return 0;
  }
}

async function importUFCYear(year) {
  console.log(`\n🥊 Importing UFC ${year}...`);
  let totalEvents = 0;

  // UFC events happen throughout the year
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 7)) {
    // Check weekly instead of daily since UFC doesn't have events every day
    const dateStr = d.toISOString().split('T')[0].replace(/-/g, '');
    const count = await importUFCEventsForDate(dateStr);
    totalEvents += count;
    await delay(200);
  }

  console.log(`\n✅ ${year} Complete: ${totalEvents} events imported`);
  return totalEvents;
}

async function main() {
  console.log('🥊 UFC DATA IMPORT SCRIPT\n');
  console.log('========================================\n');

  // Import years from 2020 to 2024
  let grandTotal = 0;
  for (let year = 2020; year <= 2024; year++) {
    const total = await importUFCYear(year);
    grandTotal += total;
    await delay(1000);
  }

  console.log('\n========================================');
  console.log(`🎉 COMPLETE! Total events imported: ${grandTotal}`);
  console.log('========================================\n');
}

main().catch(console.error);
