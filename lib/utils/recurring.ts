export function calculateNextRun(frequency: string, fromDate: Date = new Date()): Date {
  const nextDate = new Date(fromDate);
  
  switch (frequency) {
    case 'Per Day':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'Per Week':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'Per Month':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    default:
      // Default to 1 day if not specified
      nextDate.setDate(nextDate.getDate() + 1);
      break;
  }
  
  return nextDate;
}
