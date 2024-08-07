import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hideUrlSource',
  standalone: true,})
export class HideUrlSourcePipe implements PipeTransform {
  transform(value: string): string {
    let replaced = value.replace(new RegExp(`<LINKED>.*?</LINKED>`, 'g'), '');
    console.log(replaced);
    return replaced
  }
}


