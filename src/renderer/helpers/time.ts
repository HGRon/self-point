export class Time {

  public hourToMilliseconds(now: Date): number {
    const hours = now.getHours();
    const minutes = now.getMinutes();

    const millisecondsPerHour = 60 * 60 * 1000;
    const millisecondsPerMinute = 60 * 1000;

    const hoursInMilliseconds = hours * millisecondsPerHour;
    const minutesInMilliseconds = minutes * millisecondsPerMinute;

    return hoursInMilliseconds + minutesInMilliseconds;
  }

  public isHourStringPassed(time: string): boolean {
    const [hour, minute] = time.split(':').map(Number);
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const targetTime = hour * 60 + minute;
    return currentTime >= targetTime;
  }

  public hourStringToMilliseconds(hour: string): number {
    const times = hour.split(':');

    const hours = +times[0];
    const minutes = +times[1];

    const millisecondsPerHour = 60 * 60 * 1000;
    const millisecondsPerMinute = 60 * 1000;

    const hoursInMilliseconds = hours * millisecondsPerHour;
    const minutesInMilliseconds = minutes * millisecondsPerMinute;

    return hoursInMilliseconds + minutesInMilliseconds;
  }

  public randomMilliseconds(minutes?: number): number {
    const random = Math.floor(Math.random() * ((minutes * 2) + 1))
    return (minutes - random) * 60 * 1000;
  }

  public millisecondsToHour(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (60 * 60 * 1000));
    const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));

    return `${ hours >= 10 ? hours : '0' + hours }:${ minutes >= 10 ? minutes : '0' + minutes }`;
  }

  public checkIfIsSameDay(date: Date, anotherDate: Date): boolean {
    return date.getDate() === anotherDate.getDate() &&
      date.getMonth() === anotherDate.getMonth() &&
      date.getFullYear() === anotherDate.getFullYear();
  }

  public hasHourPassed(hour: string) {
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    }

    const currentTime = new Date().toLocaleTimeString('pt-BR', { hour12: false });

    const desiredTimeMinutes = timeToMinutes(hour);
    const currentTimeMinutes = timeToMinutes(currentTime);

    return currentTimeMinutes > desiredTimeMinutes;
  }

  public formatToString(now: Date): string {
    return now.toISOString().split('T')[0] + 'T00:00:00.000Z'
  }

  public formatToBRformat(now: Date): string {
    return now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

}
