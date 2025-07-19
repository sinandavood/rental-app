import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../env/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-subcategory',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './subcategory.component.html',
  styleUrls: ['./subcategory.component.css']
})
export class SubcategoryComponent implements OnInit {
  categoryId!: number;
  subcategories: any[] = [];

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.categoryId = +params.get('id')!;
      this.loadSubcategories();
    });
  }

  loadSubcategories() {
    this.http.get<any[]>(`${environment.apiBaseUrl}/subcategory/by-category/${this.categoryId}`)
      .subscribe(data => {
        this.subcategories = data;
      });
  }

  onSubcategoryClick(sub: any) {
  // Navigate to products filtered by subcategory
  this.router.navigate(['/products'], {
    queryParams: {
      subcategoryId: sub.id
    }
  });
}

}
