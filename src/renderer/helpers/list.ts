export class List {

  public completeArray(array: string[]): string[] {
    const fullSize = 4 - array.length;

    for (let i = 0; i < fullSize; i++)
      array.push('-');

    return array;
  }

}
