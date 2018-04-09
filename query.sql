SELECT
matches.match_id ,
avg(duration) avg,
count(distinct matches.match_id) count,
sum(case when (player_matches.player_slot < 128) = radiant_win then 1 else 0 end)::float/count(1) winrate,
((sum(case when (player_matches.player_slot < 128) = radiant_win then 1 else 0 end)::float/count(1)) 
  + 1.96 * 1.96 / (2 * count(1)) 
  - 1.96 * sqrt((((sum(case when (player_matches.player_slot < 128) = radiant_win then 1 else 0 end)::float/count(1)) * (1 - (sum(case when (player_matches.player_slot < 128) = radiant_win then 1 else 0 end)::float/count(1))) + 1.96 * 1.96 / (4 * count(1))) / count(1))))
  / (1 + 1.96 * 1.96 / count(1)) winrate_wilson,
sum(duration) sum,
min(duration) min,
max(duration) max,
match_patch,
radiant_team_id,
dire_team_id,
radiant_win,
radiant_score,
dire_score,
leagues.name as "League"
FROM matches
JOIN match_patch using(match_id)
JOIN leagues using(leagueid)
JOIN player_matches using(match_id)
JOIN heroes on heroes.id = player_matches.hero_id
LEFT JOIN notable_players ON notable_players.account_id = player_matches.account_id AND notable_players.locked_until = (SELECT MAX(locked_until) FROM notable_players)
LEFT JOIN teams using(team_id)
WHERE TRUE
AND duration IS NOT NULL
AND matches.start_time >= extract(epoch from timestamp '__BOTTOM_DATE__')
AND matches.start_time <= extract(epoch from timestamp '__TOP_DATE__')
AND leagues.tier = 'professional'

GROUP BY matches.match_id, leagues.name,  match_patch
HAVING count(distinct matches.match_id) >= 1
ORDER BY avg DESC,count DESC NULLS LAST
LIMIT 200