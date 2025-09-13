import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent {
  faqs = [
    {
      question: 'How does renting an item work?',
      answer: 'You can browse items, select the one you want, and complete the rental agreement online. The owner will confirm the rental.'
    },
    {
      question: 'Do I need to pay a security deposit?',
      answer: 'Yes, for most items a refundable security deposit is required. The amount depends on the product and owner.'
    },
    {
      question: 'What happens if the item is damaged?',
      answer: 'The deposit will be adjusted accordingly. If damages exceed the deposit, additional charges may apply.'
    },
    {
      question: 'Can I list my own items for rent?',
      answer: 'Yes! After logging in, you can go to "Rent Your Item" and upload details about your item.'
    }
  ];

  activeIndex: number | null = null;

  toggleFaq(index: number) {
    this.activeIndex = this.activeIndex === index ? null : index;
  }
}
