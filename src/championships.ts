export enum Championships {
  'Summer Challange' = '1366',
  'Mixed Sundays S2' = '1435',
  '4 hours at Suzuka' = '1455',
  'Endurance S1' = '1266',
  'Midweek League S2' = '1449',
  'Welcome to America' = '1553',
}

export const championshipRoles: Record<Championships, string> = {
  [Championships['Summer Challange']]: 'Summer Challenge',
  [Championships['Mixed Sundays S2']]: 'Mixed Sundays S2',
  [Championships['Endurance S1']]: 'Endurance S1',
  [Championships['4 hours at Suzuka']]: '4 hours at Suzuka',
  [Championships['Midweek League S2']]: 'Midweek League S2',
  [Championships['Welcome to America']]: 'Welcome to America @ Glen Watkins',
};
