// Add this utility function to check if it's time to determine the winner
export function isWinnerSelectionTime(): boolean {
  const now = new Date()
  const gmtHour = now.getUTCHours()
  const gmtMinutes = now.getUTCMinutes()
  
  return gmtHour === 22 && gmtMinutes === 0
}