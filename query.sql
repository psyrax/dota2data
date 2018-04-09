SELECT
date_trunc('day', to_timestamp(start_time)) AS "date",
matches.match_id,
matches.duration AS "duration (seconds)",
match_patch,
r.name AS "Radiant Team",
radiant_score,
d.name AS "Dire Team",
dire_score,
CASE WHEN radiant_win THEN 'Radiant' ELSE 'Dire' end AS "Winner"
FROM matches
LEFT JOIN match_patch ON match_patch.match_id = matches.match_id
LEFT JOIN leagues ON leagues.leagueid = matches.leagueid
LEFT JOIN teams r ON r.team_id = matches.radiant_team_id 
LEFT JOIN teams d ON d.team_id = matches.dire_team_id 
WHERE duration IS NOT NULL
AND tier = 'professional'
AND matches.start_time >= extract(epoch from timestamp '__BOTTOM_DATE__')
AND matches.start_time <= extract(epoch from timestamp '__TOP_DATE__')
ORDER BY date_trunc('day', to_timestamp(start_time)) 
LIMIT 200;