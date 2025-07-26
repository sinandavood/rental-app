import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Complaint } from '../models/complaint.model';
import { FAQ } from '../models/faq.model';
import { environment } from '../env/environment';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-customer-support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-support.component.html',
  styleUrls: ['./customer-support.component.css']
})
export class CustomerSupportComponent implements OnInit {
  sections = ['My Account', 'Payment', 'Orders', 'Delivery', 'General'];
  selectedSection = 'My Account';

  faqs: FAQ[] = [];
  filteredFaqs: FAQ[] = [];

  complaint: Complaint = { subject: '', message: '', section: this.selectedSection };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadFaqs();
  }

  selectSection(section: string) {
    this.selectedSection = section;
    this.complaint.section = section;
    this.filterFaqs();
  }

  loadFaqs() {
    this.http.get<FAQ[]>(`${environment.apiBaseUrl}/faq`).subscribe(data => {
      this.faqs = data;
      this.filterFaqs();
    });
  }

  filterFaqs() {
    this.filteredFaqs = this.faqs.filter(faq => faq.category === this.selectedSection);
  }

  submitComplaint() {
    this.http.post(`${environment.apiBaseUrl}/complaints`, this.complaint).subscribe(() => {
      alert('Complaint submitted');
      this.complaint = { subject: '', message: '', section: this.selectedSection };
    });
  }
}
